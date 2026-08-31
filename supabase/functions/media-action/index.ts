import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") || "";
    const caller = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false, autoRefreshToken: false } });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: userData, error: userError } = await caller.auth.getUser();
    const user = userData.user;
    if (userError || !user) return json({ error: "Sign in required" }, 401);
    const body = await req.json().catch(() => ({}));
    const mediaId = String(body?.mediaId || "");
    const action = String(body?.action || "");
    if (!mediaId) return json({ error: "Media id required" }, 400);
    const { data: media, error: mediaError } = await admin.from("media").select("id,trip_id,album,storage_path,thumbnail_path,visibility_state").eq("id", mediaId).maybeSingle();
    if (mediaError) throw mediaError;
    if (!media) return json({ error: "Media not found" }, 404);
    const [{ data: member }, { data: trip }] = await Promise.all([
      admin.from("trip_members").select("id").eq("trip_id", media.trip_id).eq("user_id", user.id).maybeSingle(),
      admin.from("trips").select("owner_id").eq("id", media.trip_id).maybeSingle(),
    ]);
    if (!member) return json({ error: "Trip membership required" }, 403);

    if (action === "hide") {
      if (media.album === "vault") return json({ ok: true, media });
      const { data: ent } = await admin.from("trip_entitlements").select("entitlement,active").eq("trip_id", media.trip_id).eq("active", true);
      const vaultAllowed = (ent || []).some((e: any) => ["full_trip", "evidence", "vault"].includes(String(e.entitlement)));
      if (!vaultAllowed) return json({ error: "Hidden Gallery access required" }, 403);
      const moved: string[] = [];
      const moveOne = async (path: string | null) => {
        if (!path) return;
        const { error } = await admin.storage.from("btg-evidence").move(path, path, { destinationBucket: "btg-vault" });
        if (error) throw error;
        moved.push(path);
      };
      try {
        await moveOne(media.storage_path);
        await moveOne(media.thumbnail_path);
        const { data: updated, error } = await admin.from("media").update({ album: "vault", hidden_by: user.id, hidden_at: new Date().toISOString(), visibility_state: "visible", removed_by: null, removed_at: null }).eq("id", media.id).select().single();
        if (error) throw error;
        return json({ ok: true, media: updated });
      } catch (error) {
        for (const path of moved.reverse()) await admin.storage.from("btg-vault").move(path, path, { destinationBucket: "btg-evidence" }).catch(() => null);
        throw error;
      }
    }

    if (action === "permanent-delete") {
      if (!trip || trip.owner_id !== user.id) return json({ error: "Album owner required" }, 403);
      if (!["removed_pending_owner", "deleting"].includes(String(media.visibility_state))) {
        return json({ error: "Remove the media from the group before permanently deleting it" }, 409);
      }

      // Two-phase, retry-safe deletion. Mark the row first so a storage success followed
      // by a database failure cannot leave a normal visible record pointing at missing files.
      let markedThisAttempt = false;
      if (media.visibility_state !== "deleting") {
        const { data: marked, error: markError } = await admin.from("media")
          .update({ visibility_state: "deleting" })
          .eq("id", media.id)
          .eq("visibility_state", "removed_pending_owner")
          .select("id")
          .maybeSingle();
        if (markError) throw markError;
        if (!marked) return json({ error: "Media deletion state changed. Please retry." }, 409);
        markedThisAttempt = true;
      }

      const bucket = media.album === "vault" ? "btg-vault" : "btg-evidence";
      const paths = [media.storage_path, media.thumbnail_path].filter(Boolean) as string[];
      if (paths.length) {
        const { error: storageError } = await admin.storage.from(bucket).remove(paths);
        if (storageError) {
          if (markedThisAttempt) {
            await admin.from("media").update({ visibility_state: "removed_pending_owner" }).eq("id", media.id).eq("visibility_state", "deleting");
          }
          throw storageError;
        }
      }

      // If this final delete fails, leave visibility_state='deleting'. A repeat call is
      // explicitly accepted above and can safely finish the database deletion.
      const { error: deleteError } = await admin.from("media").delete().eq("id", media.id).eq("visibility_state", "deleting");
      if (deleteError) throw deleteError;
      return json({ ok: true, deleted: media.id });
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (error) {
    console.error("media-action failed", error);
    return json({ error: error instanceof Error ? error.message : "Media action failed" }, 500);
  }
});
