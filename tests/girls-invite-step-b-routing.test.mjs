import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';

// Runs the real girls-accept-invite handler with a stubbed Supabase client and checks which route each
// invitation takes: the one-click flow (a session credential is minted) or the sign-in route
// (nothing is minted; the visitor must sign in normally before the trip is attached).
const source=stripTypeScriptTypes(fs.readFileSync(new URL('../supabase/functions/girls-accept-invite/index.ts',import.meta.url),'utf8')).replace(/^import [^\n]+\n/gm,'');
assert.doesNotMatch(source,/^import /m,'test harness must replace every import');
const SITE='https://thegirlstripguide.com';
const memberId='22222222-2222-4222-8222-222222222222',tripId='33333333-3333-4333-8333-333333333333',userId='44444444-4444-4444-8444-444444444444';
const TOKEN='invite-token-for-tests',EMAIL='invited.person@example.test';
const sha=value=>createHash('sha256').update(value).digest('hex');

function fixture({accountState='none',accountError=null,member={},archived=false,token=TOKEN}={}){
  let handler;const calls=[];
  const row={id:memberId,trip_id:tripId,name:'Invited Person',email:EMAIL,user_id:null,status:'invited',invite_token_hash:sha(TOKEN),invite_token_expires_at:new Date(Date.now()+864e5).toISOString(),...member};
  const single=data=>({select(){return this},eq(){return this},maybeSingle:async()=>({data,error:null})});
  const db={
    from:table=>{calls.push(`from:${table}`);return single(table==='trip_members'?row:{id:tripId,product_key:'girls',invite_code:'ABCD1234'})},
    rpc:async(name,args)=>{
      calls.push(`rpc:${name}`);
      if(name==='invitation_account_state'){assert.deepEqual(Object.keys(args),['p_email']);assert.equal(args.p_email,row.email);return accountError?{data:null,error:accountError}:{data:accountState,error:null}}
      if(name==='create_invitation_auth_state')return {data:null,error:null};
      throw new Error(`Unexpected rpc ${name}`);
    },
    auth:{admin:{generateLink:async()=>{calls.push('generateLink');return {data:{user:{id:userId},properties:{action_link:`https://mock.supabase.co/auth/v1/verify?token=one-time-token-hash-value&type=magiclink&redirect_to=${encodeURIComponent(`${SITE}/invite-return.html`)}`,hashed_token:'one-time-token-hash-value'}},error:null}}}}
  };
  vm.runInNewContext(source,{
    Deno:{env:{get:name=>name==='SUPABASE_URL'?'https://mock.supabase.co':'service-key'},serve:fn=>handler=fn},
    createClient:()=>db,assertTripActive:async()=>{calls.push('assertTripActive');if(archived)throw new Error('This trip has been archived.')},
    crypto:globalThis.crypto,btoa,TextEncoder,Uint8Array,URL,URLSearchParams,Date,Response,console:{error(){}}
  });
  const click=async()=>{const r=await handler(new Request(`https://mock.supabase.co/functions/v1/girls-accept-invite?confirm=1&member=${memberId}&token=${token}`));return {status:r.status,location:r.headers.get('location')||'',headers:r.headers}};
  return {click,calls};
}
const minted=calls=>calls.includes('generateLink')||calls.includes('rpc:create_invitation_auth_state');

// Brand-new invitee: the one-click flow is unchanged.
for(const accountState of ['none','unverified'])for(const status of ['invited','opened']){
  const f=fixture({accountState,member:{status}}),r=await f.click(),target=new URL(r.location);
  assert.equal(r.status,303);assert.equal(target.origin+target.pathname,`${SITE}/invite-auth.html`,`${accountState}/${status} keeps the one-click handoff`);
  const fragment=new URLSearchParams(target.hash.slice(1));assert.ok(fragment.get('state'));assert.equal(fragment.get('token_hash'),'one-time-token-hash-value');
  assert.ok(f.calls.indexOf('rpc:invitation_account_state')<f.calls.indexOf('generateLink'),'the account check must run before any credential is generated');
  assert.ok(f.calls.indexOf('assertTripActive')<f.calls.indexOf('rpc:invitation_account_state'),'the account check runs only after the token, product and archive checks');
}

// Everyone else is sent to sign in, and no credential or state is ever created.
const signInCases=[
  ['an established account',{accountState:'established'}],
  ['a confirmed member holding a live token',{accountState:'established',member:{status:'confirmed',user_id:userId}}],
  ['a confirmed member even if the account check says none',{accountState:'none',member:{status:'confirmed',user_id:userId}}],
  ['a pending member already linked to an account',{accountState:'unverified',member:{user_id:userId}}],
  ['an unexpected account state',{accountState:'something-else'}],
  ['a null account state',{accountState:null}],
  ['an account state with different capitalisation',{accountState:'None'}]
];
for(const [label,options] of signInCases){
  const f=fixture(options),r=await f.click(),target=new URL(r.location);
  assert.equal(r.status,303,label);assert.equal(target.origin+target.pathname,`${SITE}/create-trip`,`${label} must go to the join screen`);
  assert.deepEqual([...target.searchParams.keys()].sort(),['code','invite','join','person'],`${label}: the redirect carries only the join context`);
  assert.equal(target.searchParams.get('join'),'1');assert.equal(target.searchParams.get('invite'),'signin');assert.equal(target.searchParams.get('code'),'ABCD1234');assert.equal(target.searchParams.get('person'),'Invited Person');
  assert.equal(target.hash,'',`${label}: no fragment`);assert.doesNotMatch(r.location,/state|token|@|%40/i,`${label}: no state, token or email address in the redirect`);
  assert.equal(minted(f.calls),false,`${label}: no sign-in link and no invitation state may be created`);
  assert.match(r.headers.get('cache-control')||'',/no-store/);assert.equal(r.headers.get('referrer-policy'),'no-referrer');
}

// If the account check cannot run, fail closed.
{
  const f=fixture({accountError:{message:'function unavailable'}}),r=await f.click();
  assert.equal(r.location,`${SITE}/create-trip?invite=server`);assert.equal(minted(f.calls),false,'an account check failure must not fall through to the one-click flow');
}
// A member in any other status has no usable invitation.
for(const status of ['declined','removed','',null]){
  const f=fixture({member:{status}}),r=await f.click();
  assert.equal(r.location,`${SITE}/create-trip?invite=invalid`,`status ${status} is not invitable`);assert.equal(f.calls.includes('rpc:invitation_account_state'),false);assert.equal(minted(f.calls),false);
}
// Without a valid token nothing about the invited address is looked up, whatever the account is.
for(const options of [{token:'wrong-token'},{token:'wrong-token',accountState:'established'},{member:{invite_token_hash:null}},{member:{invite_token_expires_at:new Date(Date.now()-1000).toISOString()}},{archived:true}]){
  const f=fixture(options),r=await f.click();
  assert.match(r.location,/\/create-trip\?invite=(invalid|expired|server)$/);assert.equal(f.calls.includes('rpc:invitation_account_state'),false,'the account check must not run before the invitation is proven valid');assert.equal(minted(f.calls),false);
}
{
  const a=await fixture({token:'wrong-token'}).click(),b=await fixture({token:'wrong-token',accountState:'established'}).click();
  assert.equal(a.location,b.location);assert.deepEqual([...a.headers].sort(),[...b.headers].sort(),'a wrong token gets the same response whether or not the address has an account');
}

console.log('Girls Invite Step B routing: PASS');
