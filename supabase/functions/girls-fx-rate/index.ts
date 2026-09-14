import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });

async function frankfurter(from: string) {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=GBP`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  const data = await res.json();
  const rate = Number(data?.rates?.GBP);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid Frankfurter rate");
  return { rate, date: String(data?.date || new Date().toISOString().slice(0, 10)), source: "Frankfurter / ECB" };
}

async function exchangeRateApi(from: string) {
  const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`ExchangeRate-API ${res.status}`);
  const data = await res.json();
  const rate = Number(data?.rates?.GBP);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid exchange rate");
  const date = data?.time_last_update_utc ? new Date(data.time_last_update_utc).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  return { rate, date, source: "ExchangeRate-API" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const from = String(body?.from_currency || "").trim().toUpperCase();
    const amount = Number(body?.amount || 0);
    if (!/^[A-Z]{3}$/.test(from)) return json({ error: "Invalid currency" }, 400);
    if (!Number.isFinite(amount) || amount <= 0) return json({ error: "Invalid amount" }, 400);

    if (from === "GBP") {
      return json({ from_currency: "GBP", to_currency: "GBP", rate: 1, amount, gbp_amount: Math.round(amount * 100) / 100, rate_date: new Date().toISOString().slice(0, 10), source: "GBP" });
    }

    let fx;
    try { fx = await frankfurter(from); }
    catch { fx = await exchangeRateApi(from); }

    return json({
      from_currency: from,
      to_currency: "GBP",
      rate: fx.rate,
      amount,
      gbp_amount: Math.round(amount * fx.rate * 100) / 100,
      rate_date: fx.date,
      source: fx.source,
    });
  } catch (error) {
    console.error("girls-fx-rate", error);
    return json({ error: "Exchange rate unavailable. Try again shortly." }, 502);
  }
});
