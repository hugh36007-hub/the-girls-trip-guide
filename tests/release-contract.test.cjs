'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const app = read('girls-app.js');
const worker = read('supabase/functions/girls-process-communications/index.ts');
const checkout = read('supabase/functions/girls-stripe-checkout/index.ts');
const hardening = read('supabase/migrations/20260828143000_girls_release_isolation_hardening.sql');

assert.match(app, /\.eq\('product_key','girls'\)/, 'Girls trip queries must be product scoped.');
assert.doesNotMatch(app, /S\.trip\?\.plan\s*===\s*['"]full['"]/, 'Legacy plan flags must not unlock paid access.');
assert.match(app, /\.rpc\('save_booking'/, 'Booking writes must use the atomic RPC.');
assert.match(app, /\.rpc\('save_expense'/, 'Expense writes must use the atomic RPC.');
assert.match(app, /IntersectionObserver/, 'Evidence must progressively load beyond the first 18 items.');
assert.match(app, /functions\/v1\/girls-auth-otp/, 'Sign-in must use the isolated Girls OTP function.');
assert.doesNotMatch(app, /\.auth\.signInWithOtp/, 'The frontend must not bypass Girls OTP throttling.');

assert.match(worker, /product_key[^\n]+girls/, 'Girls communications worker must verify product ownership.');
assert.match(worker, /girls_ready/, 'Girls worker must use its own queue states.');
assert.match(worker, /girls_scheduled/, 'Girls worker must use its own scheduled state.');
assert.doesNotMatch(worker, /\.in\(['"]status['"],\s*\[['"]ready['"]/, 'Girls worker must not consume the Boys queue.');

assert.match(checkout, /metadata\[product_key\][^\n]+girls/, 'Girls checkout metadata must carry its product key.');
assert.match(checkout, /metadata\?\.product_key\s*===\s*['"]girls['"]/, 'Girls checkout verification must reject other products.');
assert.match(hardening, /jobname\s*=\s*'gtg-process-communications'/, 'Release migration must target only the Girls cron.');
assert.match(hardening, /active\s*:=\s*false/, 'Girls email processing must remain paused until its domain is verified.');

for (const name of [
  'girls-auth-otp',
  'girls-accept-invite',
  'girls-process-communications',
  'girls-stripe-checkout',
  'girls-trip-email',
]) {
  assert.ok(
    fs.existsSync(path.join(root, 'supabase/functions', name, 'index.ts')),
    `Missing source-controlled Edge Function: ${name}`,
  );
}

console.log('Girls release contract: PASS');
