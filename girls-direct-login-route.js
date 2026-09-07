/* After a normal website OTP sign-in, skip the trip picker when there is only one Girls trip. */
(()=>{
'use strict';
if(window.__GTG_DIRECT_LOGIN_ROUTE__)return;window.__GTG_DIRECT_LOGIN_ROUTE__=true;
const KEY='gtg-direct-after-otp';
const DRAFT_KEY='gtg-b1-draft';
const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const SUPABASE_KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const app=document.getElementById('app');if(!app)return;
let b1Client=null,b1Busy=false;
function arm(){sessionStorage.setItem(KEY,String(Date.now()))}
function clear(){sessionStorage.removeItem(KEY)}
function armed(){const started=Number(sessionStorage.getItem(KEY)||0);if(!started)return false;if(Date.now()-started>45000){clear();return false}return true}
function routeIfReady(){if(!armed())return false;const picker=app.querySelector('.trip-list');if(!picker)return false;const trips=[...picker.querySelectorAll('[data-trip]')];if(trips.length===1){clear();trips[0].click();return true}clear();return false}
function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000)}
function b1db(){if(!b1Client){if(!window.supabase?.createClient)throw Error('Secure services did not load. Refresh and try again.');b1Client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}return b1Client}
function draft(){try{return JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null')}catch{return null}}
function openRequestedSignIn(){
  if(new URL(location.href).searchParams.get('signin')!=='1')return;
  const card=app.querySelector('.auth-card');if(!card||card.dataset.b1SigninOpened)return;
  const button=card.querySelector('[data-a="signin"]');if(!button)return;
  card.dataset.b1='signin';card.dataset.b1SigninOpened='1';button.click();
}
function cleanEvidenceDuplicate(){if(!document.querySelector('.b1upgrade'))return;document.querySelectorAll('[data-panel="evidence"] .gtg-free-evidence').forEach(x=>x.remove())}

document.addEventListener('submit',event=>{
  const form=event.target;if(!(form instanceof HTMLFormElement))return;
  if(form.id==='otpForm'){
    const intent=form.querySelector('[name="intent"]')?.value||'signin';
    if(intent==='signin')arm();else clear();
    return;
  }
  if(form.id!=='b1otp')return;
  event.preventDefault();event.stopImmediatePropagation();
  if(b1Busy)return;
  const details=draft();
  const code=String(new FormData(form).get('code')||'').replace(/\D/g,'');
  if(!details?.email||!details?.name||!details?.destination||!details?.start||!details?.end||!details?.owner){toast('Trip details expired. Go back and enter them again.');return}
  if(code.length!==8){toast('Enter the 8-digit secure code.');return}
  const submit=form.querySelector('button[type="submit"],button.primary');const oldText=submit?.textContent||'Continue →';
  if(submit){submit.disabled=true;submit.textContent='Creating trip…'}
  b1Busy=true;
  (async()=>{
    try{
      const client=b1db();
      const verified=await client.auth.verifyOtp({email:String(details.email).toLowerCase(),token:code,type:'email'});
      if(verified.error)throw verified.error;
      const user=verified.data?.user;if(!user)throw Error('Secure sign-in failed. Request a new code and try again.');

      const profileResult=await client.from('profiles').upsert({id:user.id,display_name:String(details.owner).trim()},{onConflict:'id'});
      if(profileResult.error)console.warn('Owner display name could not be updated before trip creation.',profileResult.error);

      const created=await client.rpc('create_girls_trip_for_current_user',{
        p_name:String(details.name).trim(),
        p_destination:String(details.destination).trim(),
        p_start:String(details.start),
        p_end:String(details.end),
        p_timezone:'Europe/London',
        p_creation_token:crypto.randomUUID()
      });
      if(created.error)throw created.error;
      const tripId=typeof created.data==='string'?created.data:created.data?.id||created.data;
      if(!tripId)throw Error('The trip was created but could not be opened.');

      const memberResult=await client.from('trip_members').update({name:String(details.owner).trim()}).eq('trip_id',tripId).eq('user_id',user.id);
      if(memberResult.error)console.warn('Organiser name could not be synchronised.',memberResult.error);

      sessionStorage.removeItem(DRAFT_KEY);
      location.href=`/create-trip?trip_id=${encodeURIComponent(tripId)}`;
    }catch(error){
      console.error('Batch 1 trip creation failed.',error);
      toast(error?.message||'The trip could not be created.');
      if(submit){submit.disabled=false;submit.textContent=oldText}
    }finally{b1Busy=false}
  })();
},true);

document.addEventListener('click',event=>{
  const button=event.target.closest('[data-b1-signin]');if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();location.href='/create-trip?signin=1';
},true);

const observer=new MutationObserver(()=>{routeIfReady();openRequestedSignIn();cleanEvidenceDuplicate()});
observer.observe(app,{childList:true,subtree:true});routeIfReady();openRequestedSignIn();window.addEventListener('pagehide',clear,{once:true});
})();
(()=>{if(document.querySelector('script[data-gtg-batch1]'))return;const s=document.createElement('script');s.src='/girls-batch1-parity.js?v=20260907-1';s.async=false;s.dataset.gtgBatch1='1';document.head.appendChild(s)})();
