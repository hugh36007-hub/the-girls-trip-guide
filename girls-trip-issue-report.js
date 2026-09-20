(()=>{
'use strict';
if(window.__GTG_TRIP_ISSUE_REPORT__)return;window.__GTG_TRIP_ISSUE_REPORT__=true;

const URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client,timer;
const db=()=>client||(client=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}));
const modal=()=>document.getElementById('modalRoot');
const drawer=()=>document.getElementById('drawerRoot');
const toast=()=>document.getElementById('toast');
const tripId=()=>String(new URL(location.href).searchParams.get('trip_id')||'').trim();

function say(message){
 const t=toast();if(!t)return;t.textContent=message;t.classList.add('show');
 clearTimeout(timer);timer=setTimeout(()=>t.classList.remove('show'),4200);
}

function style(){
 if(document.getElementById('gtg-issue-report-style'))return;
 const s=document.createElement('style');s.id='gtg-issue-report-style';
 s.textContent=`
 [data-a="reportIssue"].gtg-issue-report-entry{border-color:rgba(184,54,92,.28)!important;background:rgba(255,79,163,.025)!important}
 [data-a="reportIssue"].gtg-issue-report-entry b{color:#8b1e4c}
 [data-a="reportIssue"].gtg-issue-report-entry:hover,[data-a="reportIssue"].gtg-issue-report-entry:focus-visible{border-color:rgba(184,54,92,.48)!important;background:rgba(255,79,163,.06)!important}
 `;document.head.appendChild(s);
}

function injectMenu(){
 const root=drawer(),list=root?.querySelector('.drawer-list');if(!root?.classList.contains('open')||!list)return;
 if(list.querySelector('[data-a="reportIssue"]'))return;
 style();
 const safety=list.querySelector('[data-a="safety"]'),signout=list.querySelector('[data-a="logout"]'),button=document.createElement('button');
 button.type='button';button.dataset.a='reportIssue';button.className='gtg-issue-report-entry';
 button.innerHTML='<b>Report an issue</b><small>Tell us what went wrong and attach a screenshot</small>';
 list.insertBefore(button,safety||signout||null);
}

function openReport(){
 const root=modal();if(!root)return;drawer()?.classList.remove('open');
 root.innerHTML=`<div class="modal"><div class="eyebrow">Help us fix it</div><h2>Report an issue</h2><p>Tell us what happened. Your report will be attached to this Girls trip so we can investigate it properly.</p><form id="gtgIssueReportForm" class="form"><div class="field"><label>What went wrong?</label><textarea name="message" required minlength="3" maxlength="4000" rows="6" placeholder="Tell us what you were trying to do and what happened."></textarea></div><div class="field"><label>Screenshot <span style="text-transform:none;letter-spacing:0;font-weight:500">(optional)</span></label><input name="screenshot" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"><small>JPG, PNG, WEBP or iPhone HEIC · max 5 MB.</small></div><div class="modal-actions"><button type="button" class="btn" data-issue-close>Cancel</button><button class="btn primary" type="submit">Send report →</button></div></form></div>`;
 root.classList.add('open');
}

function close(){
 const root=modal();root?.classList.remove('open');if(root)root.innerHTML='';
}

async function submit(form){
 const button=form.querySelector('button[type="submit"]'),old=button?.textContent||'Send report →';
 if(button){button.disabled=true;button.textContent='Sending…'}
 try{
   const tid=tripId();if(!tid)throw Error('Trip context is missing. Reopen the trip and try again.');
   const supa=db();if(!supa)throw Error('Secure services are still loading. Please try again.');
   const {data}=await supa.auth.getSession(),token=data?.session?.access_token;if(!token)throw Error('Please sign in again before reporting an issue.');
   const source=new FormData(form),payload=new FormData();
   payload.set('tripId',tid);payload.set('productKey','girls');payload.set('message',String(source.get('message')||''));
   payload.set('pageContext',JSON.stringify({
     action:new URL(location.href).searchParams.get('action')||'overview',
     tier:document.querySelector('.dashboard')?.dataset.homeComposition||'',
     role:document.querySelector('.dashboard')?.dataset.tripRole||'',
     path:location.pathname,
     href:location.href.slice(0,500)
   }));
   const shot=source.get('screenshot');if(shot instanceof File&&shot.size)payload.set('screenshot',shot,shot.name||'screenshot');
   const response=await fetch(`${URL}/functions/v1/report-trip-issue`,{method:'POST',headers:{Authorization:`Bearer ${token}`,apikey:KEY},body:payload});
   const out=await response.json().catch(()=>({}));if(!response.ok||!out?.ok)throw Error(out?.error||'Issue report could not be sent.');
   close();say('Issue reported. Thank you — we’ll investigate it.');
 }catch(error){
   console.error('girls-trip-issue-report',error);say(error?.message||'Issue report could not be sent.');
   if(button){button.disabled=false;button.textContent=old}
 }
}

document.addEventListener('click',event=>{
 const target=event.target.closest?.('[data-a="reportIssue"],[data-issue-close],[data-a="drawer"]');if(!target)return;
 if(target.dataset.a==='drawer')requestAnimationFrame(injectMenu);
 if(target.dataset.a==='reportIssue'){event.preventDefault();event.stopImmediatePropagation();openReport();}
 if(target.hasAttribute('data-issue-close')){event.preventDefault();event.stopImmediatePropagation();close();}
},true);

document.addEventListener('submit',event=>{
 const form=event.target.closest?.('#gtgIssueReportForm');if(!form)return;
 event.preventDefault();event.stopImmediatePropagation();void submit(form);
},true);

const root=drawer();
if(root)new MutationObserver(()=>queueMicrotask(injectMenu)).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
requestAnimationFrame(injectMenu);
})();
