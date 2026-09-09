(()=>{
'use strict';
const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const PUBLISHABLE='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const STORAGE='gtg-invite-auth-state-v2';
const PRODUCT='girls';
const FINALIZER=`${SUPABASE_URL}/functions/v1/girls-finalize-invite`;
const STATE=/^[A-Za-z0-9_-]{43}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const status=document.getElementById('status');
function fail(message){if(status){status.textContent=message;status.className='error';}}
function storedState(){
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(!parsed||!STATE.test(String(parsed.state||'')))return null;
    const age=Date.now()-Number(parsed.createdAt||0);
    if(!Number.isFinite(age)||age<0||age>15*60*1000)return null;
    return String(parsed.state);
  }catch{return null;}
}
async function sessionFor(client){
  const code=new URL(location.href).searchParams.get('code');
  if(code){
    const current=await client.auth.getSession();
    if(!current.data?.session){
      const exchanged=await client.auth.exchangeCodeForSession(code);
      if(exchanged.error)throw exchanged.error;
    }
  }
  let current=await client.auth.getSession();
  if(current.data?.session)return current.data.session;
  return await new Promise((resolve)=>{
    let settled=false;
    const finish=(value)=>{if(settled)return;settled=true;subscription?.unsubscribe?.();clearTimeout(timer);resolve(value)};
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{if(session)finish(session)});
    const timer=setTimeout(()=>finish(null),6000);
  });
}
async function run(){
  try{
    const state=storedState();
    if(!state)throw new Error('This secure invitation state is missing or expired. Ask the organiser for a fresh invitation.');
    if(!window.supabase?.createClient)throw new Error('Secure sign-in could not start. Please reopen the invitation.');
    const client=window.supabase.createClient(SUPABASE_URL,PUBLISHABLE,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const session=await sessionFor(client);
    if(!session?.access_token)throw new Error('Secure sign-in did not complete. Ask the organiser for a fresh invitation.');
    const response=await fetch(FINALIZER,{method:'POST',headers:{'Content-Type':'application/json','apikey':PUBLISHABLE,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({state})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result?.ok!==true)throw new Error(result?.error||'This invitation could not be verified.');
    if(result.productKey!==PRODUCT||!UUID.test(String(result.tripId||'')))throw new Error('The invitation returned an invalid trip.');
    localStorage.removeItem(STORAGE);
    history.replaceState({},'',location.pathname);
    if(window.GTG_NATIVE&&window.Capacitor?.Plugins?.Browser?.close){try{await window.Capacitor.Plugins.Browser.close()}catch{}}
    const target=new URL('/create-trip',location.origin);
    target.searchParams.set('trip_id',String(result.tripId));
    target.searchParams.set('action','plan');
    target.searchParams.set('invite','accepted');
    location.replace(target.toString());
  }catch(error){
    console.error('[GTG invite return]',error);
    fail(error?.message||'This invitation could not be completed. Ask the organiser for a fresh link.');
  }
}
void run();
})();
