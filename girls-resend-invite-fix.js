/* Resend invitation repair: exact-member resend, immediate close on success. */
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
 const memberId=form.dataset.gtgResendMember||pendingMemberId;
 if(!memberId)return;
 event.preventDefault();event.stopImmediatePropagation();
 const submit=form.querySelector('button[type="submit"],button.primary');
 if(submit){submit.disabled=true;submit.textContent='Sending…'}
 try{
  const q=db();if(!q)throw Error('Secure services did not load.');
  const {data}=await q.auth.getSession();const token=data?.session?.access_token;if(!token)throw Error('Please sign in again.');
  const d=new FormData(form),tripId=new URL(location.href).searchParams.get('trip_id')||'';
  const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({tripId,memberId,name:String(d.get('name')||'').trim(),email:String(d.get('email')||'').trim().toLowerCase(),resend:true})});
  const out=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(out.error||'Invite could not be resent.');
  pendingMemberId='';
  closeModal();
  toast(out.sent?'Invitation sent.':'Invitation queued.');
 }catch(err){
  console.error('Girls resend invitation failed',err);
  if(submit){submit.disabled=false;submit.textContent='Send invite'}
  toast(err?.message||'Invite could not be resent.');
 }
},true);
})();
