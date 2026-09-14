/* Resend invitation repair: exact-member resend, resilient on slower mobile loads. */
(()=>{
'use strict';
if(window.__GTG_RESEND_INVITE_FIX__)return;window.__GTG_RESEND_INVITE_FIX__=true;
const URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const ENDPOINT=`${URL}/functions/v1/girls-trip-email`;
let client=null,pendingMemberId='';
const db=()=>client||(client=window.supabase?.createClient?.(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
function toast(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(el.__resendTimer);el.__resendTimer=setTimeout(()=>el.classList.remove('show'),3500)}
function closeModal(){const root=document.getElementById('modalRoot');if(!root)return;root.classList.remove('open');root.innerHTML=''}
function resendModalOpen(){return /resend invitation/i.test(document.querySelector('#modalRoot .modal h2')?.textContent||'')}
async function resolveMemberId(form){
 let memberId=String(form.dataset.gtgResendMember||pendingMemberId||'');
 if(memberId)return memberId;
 if(!resendModalOpen())return'';
 const q=db();if(!q)throw Error('Secure services did not load.');
 const tripId=new URL(location.href).searchParams.get('trip_id')||'';
 const email=String(new FormData(form).get('email')||'').trim().toLowerCase();
 if(!tripId||!email)return'';
 const {data,error}=await q.from('trip_members').select('id').eq('trip_id',tripId).ilike('email',email).maybeSingle();
 if(error)throw error;
 memberId=String(data?.id||'');
 if(memberId){pendingMemberId=memberId;form.dataset.gtgResendMember=memberId}
 return memberId;
}

document.addEventListener('click',event=>{
 const resend=event.target.closest?.('[data-a="resendInvite"]');
 if(resend){
  pendingMemberId=String(resend.dataset.id||'');
  setTimeout(()=>{const form=document.querySelector('#inviteForm');if(form&&pendingMemberId)form.dataset.gtgResendMember=pendingMemberId},0);
  return;
 }
 const a=event.target.closest?.('[data-a]')?.dataset.a||'';
 if(a==='invite'||a==='close')pendingMemberId='';
},true);

document.addEventListener('submit',async event=>{
 const form=event.target;
 if(!(form instanceof HTMLFormElement)||form.id!=='inviteForm')return;
 if(!form.dataset.gtgResendMember&&!pendingMemberId&&!resendModalOpen())return;
 event.preventDefault();event.stopImmediatePropagation();
 const submit=form.querySelector('button[type="submit"],button.primary');
 if(submit){submit.disabled=true;submit.textContent='Sending…'}
 try{
  const q=db();if(!q)throw Error('Secure services did not load.');
  const memberId=await resolveMemberId(form);if(!memberId)throw Error('That trip member could not be found.');
  const {data}=await q.auth.getSession();const token=data?.session?.access_token;if(!token)throw Error('Please sign in again.');
  const d=new FormData(form),tripId=new URL(location.href).searchParams.get('trip_id')||'';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  let res;
  try{
   res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({tripId,memberId,name:String(d.get('name')||'').trim(),email:String(d.get('email')||'').trim().toLowerCase(),resend:true}),signal:controller.signal});
  }finally{clearTimeout(timer)}
  const out=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(out.error||'Invite could not be resent.');
  pendingMemberId='';
  closeModal();
  toast('Invitation resend queued.');
 }catch(err){
  console.error('Girls resend invitation failed',err);
  if(submit){submit.disabled=false;submit.textContent='Send invite'}
  toast(err?.name==='AbortError'?'Invite service timed out. Please try again.':err?.message||'Invite could not be resent.');
 }
},true);
})();
