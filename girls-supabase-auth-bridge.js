/* Preserve the Girls isolated OTP route while allowing Supabase itself to load with defer. */
(()=>{
'use strict';
if(window.__GTG_SUPABASE_AUTH_BRIDGE__)return;window.__GTG_SUPABASE_AUTH_BRIDGE__=true;

const INVITE_KEY='gtg-invite-target-trip';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const url=new URL(location.href);
const queryTrip=url.searchParams.get('trip_id')||'';
if(UUID.test(queryTrip)&&url.searchParams.get('invite')==='accepted'){
  sessionStorage.setItem(INVITE_KEY,queryTrip);
  sessionStorage.setItem(`${INVITE_KEY}:started`,String(Date.now()));
}
const storedTrip=sessionStorage.getItem(INVITE_KEY)||'';
const started=Number(sessionStorage.getItem(`${INVITE_KEY}:started`)||0);
const freshStored=UUID.test(storedTrip)&&(!started||Date.now()-started<5*60*1000);
if(!freshStored&&storedTrip){sessionStorage.removeItem(INVITE_KEY);sessionStorage.removeItem(`${INVITE_KEY}:started`);}
if(freshStored){
  let changed=false;
  if(!UUID.test(url.searchParams.get('trip_id')||'')){
    url.searchParams.set('trip_id',storedTrip);
    url.searchParams.set('action','plan');
    url.searchParams.set('invite','accepted');
    changed=true;
  }
  if(url.searchParams.get('join')==='1'){
    url.searchParams.delete('join');
    changed=true;
  }
  if(changed)history.replaceState({},'',url);

  /* A secure invitation already identifies the person and exact trip. Do not
     send that user into the manual name + invite-code flow after OTP. */
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(!(form instanceof HTMLFormElement)||form.id!=='otpForm')return;
    const intent=form.querySelector('[name="intent"]');
    if(intent)intent.value='signin';
  },true);
}

if(!window.supabase?.createClient)return;
const originalCreateClient=window.supabase.createClient.bind(window.supabase);
const clients=new Map();
window.supabase.createClient=(...args)=>{
  const cacheKey=`${String(args[0]||'')}|${String(args[1]||'')}`;
  if(clients.has(cacheKey))return clients.get(cacheKey);
  const client=originalCreateClient(...args);
  client.auth.signInWithOtp=async({email})=>{
    try{
      const res=await fetch('https://vtcmvwixfqyxqghibsla.supabase.co/functions/v1/girls-auth-otp',{method:'POST',body:JSON.stringify({email})});
      const out=await res.json().catch(()=>({}));
      if(!res.ok)return {data:{user:null,session:null},error:{message:out.error||'Could not send sign-in code.'}};
      return {data:{user:null,session:null},error:null};
    }catch(error){return {data:{user:null,session:null},error:{message:error?.message||'Could not send sign-in code.'}};}
  };
  clients.set(cacheKey,client);
  return client;
};
})();
