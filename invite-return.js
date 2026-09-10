(()=>{
'use strict';
const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const PUBLISHABLE='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const PRODUCT='girls';
const FINALIZER=`${SUPABASE_URL}/functions/v1/girls-finalize-invite`;
const STATE=/^[A-Za-z0-9_-]{43}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const status=document.getElementById('status');
function validAuthToken(token){return typeof token==='string'&&token.length>=16&&token.length<=2048&&!/[\u0000-\u001f\u007f\s]/.test(token);}
function fail(message){if(status){status.textContent=message;status.className='error';}}
function invitationCredentials(){
  const hash=new URLSearchParams(location.hash.replace(/^#/,''));
  const state=hash.get('state')||'';
  const tokenHash=hash.get('token_hash')||'';
  const type=hash.get('type')||'email';
  if(!STATE.test(state))throw new Error('This secure invitation state is missing or invalid. Ask the organiser for a fresh invitation.');
  if(!validAuthToken(tokenHash)||type!=='email')throw new Error('This secure invitation authentication token is missing or invalid. Ask the organiser for a fresh invitation.');
  history.replaceState({},'',location.pathname);
  return {state,tokenHash};
}
async function run(){
  try{
    const {state,tokenHash}=invitationCredentials();
    if(!window.supabase?.createClient)throw new Error('Secure sign-in could not start. Please reopen the invitation.');
    const client=window.supabase.createClient(SUPABASE_URL,PUBLISHABLE,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    if(status)status.textContent='Verifying your secure invitation…';
    const {data:verified,error:verifyError}=await client.auth.verifyOtp({token_hash:tokenHash,type:'email'});
    if(verifyError||!verified?.session?.access_token)throw new Error('Secure sign-in did not complete. Reopen the invitation and try again.');
    const response=await fetch(FINALIZER,{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLISHABLE,'Authorization':`Bearer ${verified.session.access_token}`},body:JSON.stringify({state})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result?.ok!==true)throw new Error(result?.error||'This invitation could not be verified.');
    if(result.productKey!==PRODUCT||!UUID.test(String(result.tripId||'')))throw new Error('The invitation returned an invalid trip.');
    if(window.GTG_NATIVE&&window.Capacitor?.Plugins?.Browser?.close){try{await window.Capacitor.Plugins.Browser.close()}catch{}}
    const target=new URL('/create-trip',location.origin);
    target.searchParams.set('trip_id',String(result.tripId));
    target.searchParams.set('action','plan');
    target.searchParams.set('invite','accepted');
    location.replace(target.toString());
  }catch(error){console.error('[GTG invite return]',error);fail(error?.message||'This invitation could not be completed. Ask the organiser for a fresh link.');}
}
void run();
})();
