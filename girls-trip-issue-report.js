(()=>{
'use strict';
if(window.__GTG_TRIP_ISSUE_REPORT__)return;window.__GTG_TRIP_ISSUE_REPORT__=true;
const URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client;
const db=()=>client||(client=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}));
const modal=()=>document.getElementById('modalRoot');
const drawer=()=>document.getElementById('drawerRoot');
const toast=()=>document.getElementById('toast');
function say(message){const t=toast();if(!t)return;t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3600)}
function tripId(){return String(new URL(location.href).searchParams.get('trip_id')||'').trim()}
function injectMenu(){
  const list=drawer()?.querySelector('.drawer-list');if(!list||list.querySelector('[data-a="reportIssue"]'))return;
  const safety=list.querySelector('[data-a="safety"]'),button=document.createElement('button');button.type='button';button.dataset.a='reportIssue';button.innerHTML='<b>Report an issue</b><small>Tell us what went wrong and attach a screenshot</small>';
  list.insertBefore(button,safety||list.querySelector('[data-a="logout"]')||null);
}
function openReport(){
  const root=modal();if(!root)return;drawer()?.classList.remove('open');
  root.innerHTML=`<div class="modal"><h2>Report an issue</h2><p>Tell us what happened. Your report will be attached to this trip so we can investigate it properly.</p><form id="gtgIssueReportForm" class="form"><div class="field"><label>What went wrong?</label><textarea name="message" required minlength="3" maxlength="4000" rows="6" placeholder="Tell us what you were trying to do and what happened."></textarea></div><div class="field"><label>Screenshot (optional)</label><input name="screenshot" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"><small>JPG, PNG, WEBP or iPhone HEIC · max 5 MB.</small></div><div class="modal-actions"><button type="button" class="btn" data-issue-close>Cancel</button><button class="btn primary" type="submit">Send report</button></div></form></div>`;root.classList.add('open');
}
function close(){const root=modal();root?.classList.remove('open');if(root)root.innerHTML=''}
async function submit(form){
  const button=form.querySelector('button[type="submit"]'),old=button?.textContent||'Send report';if(button){button.disabled=true;button.textContent='Sending…'}
  try{
    const tid=tripId();if(!tid)throw new Error('Trip context is missing. Reopen the trip and try again.');
    const supa=db();if(!supa)throw new Error('Secure services are still loading. Please try again.');
    const {data}=await supa.auth.getSession(),token=data?.session?.access_token;if(!token)throw new Error('Please sign in again before reporting an issue.');
    const source=new FormData(form),payload=new FormData();payload.set('tripId',tid);payload.set('productKey','girls');payload.set('message',String(source.get('message')||''));payload.set('pageContext',JSON.stringify({path:location.pathname,action:new URL(location.href).searchParams.get('action')||'overview',href:location.href.slice(0,500)}));
    const shot=source.get('screenshot');if(shot instanceof File&&shot.size)payload.set('screenshot',shot,shot.name||'screenshot');
    const response=await fetch(`${URL}/functions/v1/report-trip-issue`,{method:'POST',headers:{Authorization:`Bearer ${token}`,apikey:KEY},body:payload}),out=await response.json().catch(()=>({}));if(!response.ok||!out?.ok)throw new Error(out?.error||'Issue report could not be sent.');
    close();say('Issue reported. Thank you — we’ll investigate it.');
  }catch(error){console.error('girls-trip-issue-report',error);say(error?.message||'Issue report could not be sent.');if(button){button.disabled=false;button.textContent=old}}
}
document.addEventListener('click',event=>{
  const target=event.target.closest?.('[data-a="reportIssue"],[data-issue-close],[data-a="drawer"]');if(!target)return;
  if(target.dataset.a==='drawer')requestAnimationFrame(injectMenu);
  if(target.dataset.a==='reportIssue'){event.preventDefault();event.stopImmediatePropagation();openReport();}
  if(target.hasAttribute('data-issue-close')){event.preventDefault();event.stopImmediatePropagation();close();}
},true);
document.addEventListener('submit',event=>{const form=event.target.closest?.('#gtgIssueReportForm');if(!form)return;event.preventDefault();event.stopImmediatePropagation();void submit(form)},true);
})();
