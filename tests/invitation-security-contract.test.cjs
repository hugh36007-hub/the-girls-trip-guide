const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=(p)=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

const accept=read('supabase/functions/girls-accept-invite/index.ts');
const finalizer=read('supabase/functions/girls-finalize-invite/index.ts');
const auth=read('invite-auth.js');
const ret=read('invite-return.js');
const sw=read('sw.js');
const migration=read('supabase/migrations/20260909211000_invitation_confirmed_access_compatibility.sql');

assert.match(accept,/const product='girls'/);
assert.match(accept,/trip\.product_key!==product/,'acceptance must reject non-Girls trips');
assert.match(accept,/redirect_to/,'generated action link return must be inspected');
assert.match(accept,/validateActionLink\(actionLink,supabaseUrl,callback\)/);
assert.match(accept,/create_invitation_auth_state/);
assert.doesNotMatch(accept,/from\('trip_members'\)\.update/,'acceptance must not confirm or mutate membership');
assert.doesNotMatch(accept,/confirmed_at/,'acceptance must not set confirmation timestamps');

assert.match(finalizer,/auth\.getUser\(\)/,'finalizer must verify bearer identity');
assert.match(finalizer,/p_expected_product:PRODUCT/);
assert.match(finalizer,/finalize_trip_invitation/);
assert.match(finalizer,/result\.product_key!==PRODUCT/);

assert.match(auth,/STORAGE='gtg-invite-auth-state-v2'/);
assert.match(auth,/redirect_to/);
assert.doesNotMatch(auth,/trip_id/,'handoff must not carry client-authoritative trip state');
assert.match(ret,/FINALIZER=`\$\{SUPABASE_URL\}\/functions\/v1\/girls-finalize-invite`/);
assert.match(ret,/result\.productKey!==PRODUCT/);
assert.match(ret,/target\.searchParams\.set\('trip_id',String\(result\.tripId\)\)/,'only server-returned trip id may be opened');
assert.doesNotMatch(ret,/sessionStorage/,'old client trip authority must be removed');

assert.match(migration,/purpose in \('invite','access'\)/);
assert.match(migration,/v_member\.status in \('invited','opened'\)/);
assert.match(migration,/v_member\.status='confirmed' and v_member\.user_id=p_intended_user_id/);
assert.match(migration,/v_state\.consumed_at is not null/,'replay must fail');
assert.match(migration,/v_state\.expires_at <= v_now/,'expired state must fail');
assert.match(migration,/v_member\.invite_token_hash is distinct from v_state\.invite_token_hash/,'changed token must fail');
assert.match(migration,/grant execute on function public\.finalize_trip_invitation[^;]+ to service_role/);
assert.doesNotMatch(migration,/grant execute on function public\.finalize_trip_invitation[^;]+ to authenticated/);

for(const required of ['/invite-auth.html','/invite-return.html','/invite-auth.js?v=2','/invite-return.js?v=2'])assert.ok(sw.includes(required),`PWA shell missing ${required}`);
console.log('Girls invitation security contract passed');
