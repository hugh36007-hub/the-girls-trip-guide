-- Hidden Gallery contribution is intentionally write-only until the viewer unlocks it.
-- Paid confirmed trip members may upload into the vault without knowing the PIN.
-- SELECT and DELETE remain protected by the active vault-session policies.

drop policy if exists "vault_upload_active_session" on storage.objects;
drop policy if exists "vault_upload_paid_members" on storage.objects;
create policy "vault_upload_paid_members"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'btg-vault'
  and trip_has_vault_access(((storage.foldername(name))[1])::uuid)
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

drop policy if exists "media_insert_paid_member" on public.media;
create policy "media_insert_paid_member"
on public.media
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and trip_has_evidence_access(trip_id)
  and (
    album = 'evidence'
    or (album = 'vault' and trip_has_vault_access(trip_id))
  )
);
