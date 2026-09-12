import fs from 'node:fs';
import assert from 'node:assert/strict';

const checkout=fs.readFileSync('supabase/functions/girls-stripe-checkout/index.ts','utf8');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const parity=fs.readFileSync('girls-parity-refresh-20260904.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20260912162244_single_pending_stripe_checkout.sql','utf8');

assert.match(migration,/unique index if not exists purchases_one_pending_stripe_checkout|unique index if not exists purchases_one_pending_stripe_per_trip_idx/i,'pending checkout uniqueness must be source-controlled');
assert.match(migration,/on public\.purchases \(trip_id\)/);
assert.match(migration,/where provider = 'stripe' and status = 'pending'/);
assert.match(checkout,/reservePending\(tripId:string,userId:string\)/,'checkout must reserve before Stripe');
assert.match(checkout,/full-trip-\$\{reservation\.id\}/,'Stripe create must use reservation-scoped idempotency');
assert.match(checkout,/Idempotency-Key/,'Stripe idempotency header must be sent');
assert.match(checkout,/existing\?\.status==='refunded'/,'refunded purchase must be terminal before activation');
assert.match(checkout,/if\(result\.refunded\)return json\(\{ok:false,paid:false,refunded:true/,'verify must reject refunded checkout replay');
assert.match(checkout,/attachPendingSession\(reservation,session,user\.id\)/,'Stripe session must attach to reserved purchase');
assert.match(app,/const LEGAL_VERSION='2026-09-04-2'/,'core runtime must own current legal version');
assert.match(app,/legalVersion:LEGAL_VERSION,refundPolicyVersion:LEGAL_VERSION/,'all core checkout routes must send current legal version');
assert.doesNotMatch(parity,/__GTG_LEGAL_FETCH_PATCH__|girls-stripe-checkout[^\n]*JSON\.parse\(init\.body\)/,'Home-only checkout monkeypatch must be retired');
console.log('PASS Girls payment lifecycle: one pending checkout, idempotent Stripe create, refunded replay terminal, core legal version authoritative');
