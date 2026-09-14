const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('create-trip.html','utf8');
const otp=fs.readFileSync('supabase/functions/girls-auth-otp/index.ts','utf8');
const invite=fs.readFileSync('supabase/functions/girls-trip-email/index.ts','utf8');
const migration=fs.readFileSync('supabase/migrations/20260829070000_fix_girls_trip_rpc_wrapper_permissions.sql','utf8');

assert(!html.includes('/girls-action-feedback'),'supplementary feedback must not intercept core form submissions');

assert(migration.includes('alter function public.create_girls_trip_for_current_user(text,text,date,date,text,uuid)\n  security definer'),'create wrapper must be SECURITY DEFINER');
assert(migration.includes('revoke execute on function private.create_girls_trip_for_current_user'),'private create helper must remain inaccessible to clients');
assert(migration.includes('grant execute on function public.create_girls_trip_for_current_user'),'authenticated clients must retain the public create RPC');

assert(otp.includes("let cachedResendKey=''"),'OTP function should cache the Resend key per warm isolate');
assert(otp.includes('const keyPromise=resendKey(db)'),'OTP key lookup should overlap the rate-limit request');

assert(invite.includes('EdgeRuntime.waitUntil(delivery)'),'invitation email delivery must continue as a background task');
assert(invite.includes("status:'held'"),'invitation row must be held while direct background delivery is in flight');
assert(invite.includes("status:'girls_ready'"),'failed background delivery must return to the Girls worker queue');

console.log('Girls action latency regression: PASS');
