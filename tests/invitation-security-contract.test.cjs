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
const strict=read('supabase/migrations/20260910090000_invitation_state_self_contained_handoff.sql');

assert.match(accept,/const product='girls'/);
assert.match(accept,/trip\.product_key!==product/,'acceptance must reject non-Girls trips');
assert.match(accept,/redirect_to/,'generated action link return must be inspected');
assert.match(accept,/validateActionLink\(actionLink,supabaseUrl,callback\)/);
assert.match(accept,/extractTokenHash\(linkData,actionLink\)/,'one-time Supabase token hash must be extracted server-side');
assert.match(accept,/new URL\(actionLink\)\.searchParams\.get\('token'\)/,'validated action link token must be authoritative when present');
assert.match(accept,/validAuthToken/,'Supabase auth token must be bounded and validated as opaque data');
assert.doesNotMatch(accept,/TOKEN_HASH=\/\^\[0-9a-f\]\{64\}/,'Supabase token format must not be assumed to be 64 hex chars');
assert.match(accept,/handoff\.hash=new URLSearchParams\(\{state,token_hash:authTokenHash\}\)/,'state and auth token must travel together');
assert.doesNotMatch(accept,/magic:actionLink/,'browser must not be sent the Supabase action link');
assert.match(accept,/create_invitation_auth_state/);
assert.doesNotMatch(accept,/from\('trip_members'\)\.update/,'acceptance must not confirm or mutate membership');
assert.doesNotMatch(accept,/confirmed_at/,'acceptance must not set confirmation timestamps');
assert.match(accept,/return redirect\(new URL\('\/create-trip\?invite=server',site\)\.toString\(\)\)/,'server errors must return to the product origin');

// Step B: an invitation link must never sign anyone in to an account that already exists.
const accountCheck=accept.indexOf("db.rpc('invitation_account_state'"),signInReturn=accept.indexOf('return redirect(signIn.toString())'),linkGeneration=accept.indexOf('db.auth.admin.generateLink('),stateCreation=accept.indexOf("db.rpc('create_invitation_auth_state'");
assert.ok(accountCheck>0&&signInReturn>accountCheck,'existing accounts must be routed by the account check');
assert.ok(signInReturn<linkGeneration&&signInReturn<stateCreation,'the sign-in route must return before any sign-in link or invitation state is created');
assert.ok(accept.indexOf('supplied!==member.invite_token_hash')<accountCheck&&accept.indexOf('assertTripActive(db')<accountCheck,'the account check must run only after the token and archive checks');
assert.match(accept,/if\(accountError\)throw accountError/,'an account check failure must fail closed');
assert.match(accept,/const oneClick=\(accountState==='none'\|\|accountState==='unverified'\)&&\(member\.status==='invited'\|\|member\.status==='opened'\)&&!member\.user_id/,'only a brand-new, pending, unlinked invitee keeps the one-click flow');
const signInBlock=accept.slice(accept.indexOf('if(!oneClick){'),signInReturn);
assert.doesNotMatch(signInBlock,/email|state|token/i,'the sign-in redirect must not carry the invited email, a state or a token');
assert.match(signInBlock,/new URL\('\/create-trip',site\)/,'the sign-in route must stay on the Girls app');
assert.match(signInBlock,/searchParams\.set\('join','1'\)/);assert.match(signInBlock,/searchParams\.set\('code',String\(trip\.invite_code\|\|''\)\)/);
// The Girls app must use the code the sign-in route carries; it is not shown anywhere else.
const app=read('girls-app-v2.js');
assert.match(app,/field\('Invite code','code','text',invite\.code,/,'the join form must be filled from the sign-in route');
assert.match(app,/You already have an account\./,'an existing account must be told to sign in');
assert.match(app,/for\(const key of \['join','code','person','invite'\]\)u\.searchParams\.delete\(key\)/,'a completed join must clear the invitation route from the address bar');

assert.match(finalizer,/auth\.getUser\(\)/,'finalizer must verify bearer identity');
assert.match(finalizer,/if\(!STATE\.test\(state\)\)/,'missing or modified state must be rejected');
assert.match(finalizer,/p_state_hash:await sha256\(state\)/,'exact supplied state must be finalised');
assert.doesNotMatch(finalizer,/state\?await sha256\(state\):null/,'server state guessing must not return');
assert.match(finalizer,/p_expected_product:PRODUCT/);
assert.match(finalizer,/finalize_trip_invitation/);
assert.match(finalizer,/result\.product_key!==PRODUCT/);

assert.match(auth,/token_hash/,'handoff must carry the one-time auth token hash');
assert.match(auth,/validAuthToken/,'handoff must accept bounded opaque Supabase token hashes');
assert.doesNotMatch(auth,/\^\[0-9a-f\]\{64\}\$/,'handoff must not assume a 64-hex Supabase token');
assert.match(auth,/new URL\('\/invite-return\.html',location\.origin\)/,'handoff must stay on the current product origin');
assert.doesNotMatch(auth,/localStorage|sessionStorage/,'browser storage must not carry invitation authority');
assert.doesNotMatch(auth,/SUPABASE_ORIGIN|auth\/v1\/verify/,'browser must not navigate the generated Supabase action link');
assert.doesNotMatch(auth,/trip_id/,'handoff must not carry client-authoritative trip state');

assert.match(ret,/FINALIZER=`\$\{SUPABASE_URL\}\/functions\/v1\/girls-finalize-invite`/);
assert.match(ret,/location\.hash/,'return page must receive state and auth token directly');
assert.match(ret,/validAuthToken/,'return page must accept bounded opaque Supabase token hashes');
assert.doesNotMatch(ret,/\^\[0-9a-f\]\{64\}\$/,'return page must not assume a 64-hex Supabase token');
assert.match(ret,/verifyOtp\(\{token_hash:tokenHash,type:'email'\}\)/,'callback must verify the one-time Supabase token hash');
assert.match(ret,/detectSessionInUrl:false/,'callback must not depend on Supabase redirect fragments');
assert.match(ret,/JSON\.stringify\(\{state\}\)/,'exact state must be submitted to the finalizer');
assert.match(ret,/result\.productKey!==PRODUCT/);
assert.match(ret,/target\.searchParams\.set\('trip_id',String\(result\.tripId\)\)/,'only server-returned trip id may be opened');
assert.doesNotMatch(ret,/localStorage|sessionStorage/,'return flow must not depend on browser storage');

assert.match(migration,/purpose in \('invite','access'\)/);
assert.match(migration,/v_member\.status in \('invited','opened'\)/);
assert.match(migration,/v_member\.status='confirmed' and v_member\.user_id=p_intended_user_id/);
assert.match(migration,/v_state\.consumed_at is not null/,'replay must fail');
assert.match(migration,/v_state\.expires_at <= v_now/,'expired state must fail');
assert.match(migration,/v_member\.invite_token_hash is distinct from v_state\.invite_token_hash/,'changed token must fail');
assert.match(migration,/grant execute on function public\.finalize_trip_invitation[^;]+ to service_role/);
assert.doesNotMatch(migration,/grant execute on function public\.finalize_trip_invitation[^;]+ to authenticated/);

assert.match(strict,/p_state_hash is null or p_state_hash !~ '\^\[0-9a-f\]\{64\}\$'/,'missing state must fail closed');
assert.match(strict,/where state_hash=p_state_hash/,'finalization must select only the supplied state');
assert.doesNotMatch(strict,/v_candidate_count|state recovery unavailable/,'server must not guess a missing state');
assert.match(strict,/intended_user_id is distinct from p_user_id/,'state must remain bound to authenticated user');
assert.match(strict,/product_key is distinct from p_expected_product/,'state must remain bound to product');
assert.match(strict,/callback_url is distinct from p_callback_url/,'state must remain bound to callback');

for(const required of ['/invite-auth.html','/invite-return.html','/invite-auth.js?v=4','/invite-return.js?v=5'])assert.ok(sw.includes(required),`PWA shell missing ${required}`);
console.log('Girls invitation security contract passed');
