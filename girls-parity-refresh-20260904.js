/* 4 Sep 2026 Girls parity refresh: dock, Home snapshot, poll discovery, Free clarity and checkout consent. */
(()=>{
'use strict';
if(window.__GTG_PARITY_REFRESH_20260904__)return;window.__GTG_PARITY_REFRESH_20260904__=true;

const LEGAL_VERSION='2026-09-04-2';
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const svg=body=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const STAT_ICONS={
 plan:svg('<rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5v-1h6v1"/><path d="m8.5 9.5 1.2 1.2 2-2.2"/><path d="M13 10h2.5"/><path d="m8.5 14.5 1.2 1.2 2-2.2"/><path d="M13 15h2.5"/>'),
 money:svg('<path d="M14.8 6.2c-.8-.8-1.8-1.2-3-1.2-2.1 0-3.6 1.2-3.6 3 0 1.7 1.2 2.5 3.6 3.1 2.1.5 3.4 1.2 3.4 3 0 1.9-1.5 3.2-3.7 3.2-1.5 0-2.8-.5-3.8-1.5"/><path d="M11.7 3.3v16.9"/>'),
 evidence:svg('<path d="M7.2 6.5 8.5 4.7h7l1.3 1.8h2.4A1.8 1.8 0 0 1 21 8.3v9A1.8 1.8 0 0 1 19.2 19H4.8A1.8 1.8 0 0 1 3 17.2v-9a1.8 1.8 0 0 1 1.8-1.8h2.4Z"/><circle cx="12" cy="12.5" r="3.3"/>'),
 group:svg('<circle cx="9" cy="9" r="2.6"/><circle cx="16.5" cy="10" r="2"/><path d="M4.5 18c.5-3 2.2-4.5 4.5-4.5s4 1.5 4.5 4.5"/><path d="M14 14.5c2.8-.5 5 .8 5.5 3.5"/>')
};

const style=document.createElement('style');
style.id='gtg-parity-refresh-20260904-css';
style.textContent=`
/* One coherent dock treatment: the centre action is no longer permanently highlighted. */
html body .dock.gtg-option7 button.active{color:var(--pink2,#ff83c1)!important;background:transparent!important}
html body .dock.gtg-option7 .dock-role-primary{color:rgba(255,255,255,.62)!important;background:transparent!important;border-color:transparent!important;box-shadow:none!important;transform:none!important}
html body .dock.gtg-option7 .dock-role-primary::after{display:none!important}
/* Scrolled state: a bare, aligned icon rail with full-size tap targets. */
@media(max-width:700px){
 html body .dock.gtg-option7.is-compact{width:clamp(228px,64vw,248px)!important;min-height:44px!important;height:44px!important;padding:0 2px!important;gap:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important;border:0!important;border-radius:0!important;bottom:max(10px,env(safe-area-inset-bottom))!important;background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
 html body .dock.gtg-option7.is-compact button{flex:1 1 0!important;min-width:44px!important;width:44px!important;max-width:48px!important;min-height:44px!important;height:44px!important;padding:0!important;margin:0!important;gap:0!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;border:0!important;border-radius:0!important;color:rgba(255,255,255,.64)!important;background:transparent!important;transform:none!important;box-shadow:none!important;filter:drop-shadow(0 2px 5px rgba(0,0,0,.9))}
 html body .dock.gtg-option7.is-compact .dock-icon{display:block!important;width:20px!important;height:20px!important;margin:0!important;padding:0!important;transform:none!important}
 html body .dock.gtg-option7.is-compact .dock-label{display:none!important}
 html body .dock.gtg-option7.is-compact button.active{color:var(--pink2,#ff83c1)!important}
 html body .dock.gtg-option7.is-compact button.active::after{display:block!important;bottom:0!important;width:20px!important;height:2px!important;border-radius:999px!important;background:var(--pink2,#ff83c1)!important}
 html body .dashboard:has(+ .dock.gtg-option7.is-compact),html body .screen:has(.dock.gtg-option7.is-compact) .dashboard{padding-bottom:calc(60px + env(safe-area-inset-bottom))!important}
 /* Fill the paid Home hero instead of leaving dead space. */
 .hero-card.live-snapshot-hero{grid-template-rows:auto minmax(145px,1fr)!important;align-items:stretch!important;align-content:stretch!important}
 .hero-card.live-snapshot-hero .live-message-card,.hero-card.live-snapshot-hero .live-photo-block{min-height:145px}
 .hero-card.live-snapshot-hero .live-message-card{display:flex;flex-direction:column}
 .hero-card.live-snapshot-hero .live-photo-frame{min-height:118px}
 .hero-card.live-snapshot-hero .live-message-meta[hidden]{display:none!important}
 .hero-card.live-snapshot-hero .live-message-card.gtg-empty-message>p{margin:auto 0!important;color:rgba(255,255,255,.58)!important}
}
@media(max-width:390px){html body .dock.gtg-option7.is-compact{width:clamp(228px,64vw,242px)!important}.hero-card.live-snapshot-hero{grid-template-rows:auto minmax(142px,1fr)!important}.hero-card.live-snapshot-hero .live-message-card,.hero-card.live-snapshot-hero .live-photo-block{min-height:142px}.hero-card.live-snapshot-hero .live-photo-frame{min-height:115px}}
/* Dashboard stat icons use the same line language as navigation. */
.stat-row .stat.gtg-stat-iconised{position:relative;padding-left:82px!important}
.stat-row .gtg-stat-icon{position:absolute;left:18px;top:50%;width:48px;height:48px;border:1px solid rgba(255,123,193,.4);border-radius:50%;display:grid;place-items:center;color:var(--pink2,#ff83c1);transform:translateY(-50%);background:radial-gradient(circle at 50% 30%,rgba(255,79,163,.14),rgba(10,7,10,.9) 66%)}
.stat-row .gtg-stat-icon svg{width:23px;height:23px}
@media(max-width:600px){.stat-row .stat.gtg-stat-iconised{padding-left:70px!important}.stat-row .gtg-stat-icon{left:13px;width:44px;height:44px}.stat-row .gtg-stat-icon svg{width:21px;height:21px}}
/* Full-screen chat close belongs top-right. */
.gtg-home-chat-toolbar .gtg-home-chat-close{grid-column:3!important;grid-row:1!important;justify-self:end!important;z-index:2}
.gtg-home-chat-toolbar .gtg-home-chat-title{grid-column:2!important;grid-row:1!important}
.gtg-home-chat-toolbar>span[aria-hidden="true"]:last-child{display:none!important}
/* Poll discovery. */
.gtg-poll-alert{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 14px;align-items:center;width:100%;margin:0 0 14px;padding:15px 17px;border:1px solid rgba(255,123,193,.46);border-radius:16px;background:linear-gradient(135deg,rgba(255,79,163,.11),#120d12);color:#fff;text-align:left;box-shadow:0 10px 28px rgba(0,0,0,.18)}
.gtg-poll-alert small{grid-column:1;color:var(--pink2,#ff83c1);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.gtg-poll-alert strong{grid-column:1;font-size:17px;line-height:1.3}.gtg-poll-alert span{grid-column:1;color:rgba(255,255,255,.62);font-size:12px}.gtg-poll-alert em{grid-column:2;grid-row:1/4;align-self:center;color:var(--pink2,#ff83c1);font-size:11px;font-style:normal;font-weight:900;text-transform:uppercase;white-space:nowrap}
.gtg-poll-hero-alert{position:absolute;z-index:7;right:180px;bottom:18px;width:min(290px,calc(100% - 205px));min-height:94px;padding:12px 13px;display:grid;align-content:center;gap:4px;border:1px solid rgba(255,123,193,.54);border-radius:15px;background:rgba(10,6,10,.91);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;text-align:left;box-shadow:0 10px 28px rgba(0,0,0,.3)}
.gtg-poll-hero-alert small{color:var(--pink2,#ff83c1);font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.gtg-poll-hero-alert strong{font-size:14px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.gtg-poll-hero-alert em{color:var(--pink2,#ff83c1);font-size:10px;font-style:normal;font-weight:900;text-transform:uppercase}
.gtg-poll-dock-badge{position:absolute;top:1px;right:calc(50% - 24px);min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--pink2,#ff83c1);color:#160a11;display:grid;place-items:center;font-size:9px;font-weight:900;line-height:1;box-shadow:0 0 0 2px #090609;pointer-events:none}.dock [data-tab="group"]{position:relative}
@media(max-width:560px){.gtg-poll-hero-alert{right:150px;bottom:14px;width:calc(100% - 170px);min-height:96px;padding:10px}.gtg-poll-hero-alert strong{font-size:12.5px}.gtg-poll-hero-alert small,.gtg-poll-hero-alert em{font-size:8px}.gtg-poll-alert{grid-template-columns:1fr}.gtg-poll-alert em{grid-column:1;grid-row:auto;margin-top:3px}}
`;
document.head.appendChild(style);

/* Make the revised checkout legal version authoritative without rewriting the core app. */
if(!window.__GTG_LEGAL_FETCH_PATCH__){
 window.__GTG_LEGAL_FETCH_PATCH__=true;
 const originalFetch=window.fetch.bind(window);
 window.fetch=(input,init)=>{
   try{
     const url=typeof input==='string'?input:input?.url||'';
     if(url.includes('/functions/v1/girls-stripe-checkout')&&typeof init?.body==='string'){
       const body=JSON.parse(init.body);
       if(body?.action==='create'){
         body.legalVersion=LEGAL_VERSION;body.refundPolicyVersion=LEGAL_VERSION;
         return originalFetch(input,{...init,body:JSON.stringify(body)});
       }
     }
   }catch{}
   return originalFetch(input,init);
 };
}

function isFree(){return /free trip/i.test(document.querySelector('.hero-card .eyebrow')?.textContent||'')}
function replaceExact(selector,from,to){document.querySelectorAll(selector).forEach(el=>{if(el.textContent.trim()===from)el.textContent=to})}
function decorateStats(){document.querySelectorAll('.stat-row .stat[data-tab]').forEach(stat=>{const kind=stat.dataset.tab;if(!STAT_ICONS[kind]||stat.querySelector('.gtg-stat-icon'))return;const icon=document.createElement('span');icon.className='gtg-stat-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=STAT_ICONS[kind];stat.prepend(icon);stat.classList.add('gtg-stat-iconised')})}
function fixEmptyMessage(){
 const card=document.querySelector('.dashboard .live-snapshot-hero .live-message-card');if(!card)return;
 const body=card.querySelector(':scope>p'),meta=card.querySelector('.live-message-meta');
 const empty=body?.textContent?.trim()==='No chat messages yet.';
 if(empty){card.classList.add('gtg-empty-message');if(meta)meta.hidden=true;const avatar=meta?.querySelector('.live-message-avatar'),name=meta?.querySelector('b');if(avatar)avatar.textContent='';if(name)name.textContent=''}
 else{card.classList.remove('gtg-empty-message');if(meta?.hidden)meta.hidden=false}
}
function fixChatClose(){const b=document.querySelector('[data-gtg-home-chat-close]');if(!b)return;if(b.textContent!=='×')b.textContent='×';b.setAttribute('aria-label','Close group chat')}
function fixCopy(){
 replaceExact('small','Passports checked','Passports confirmed');
 if(isFree()){
   document.querySelectorAll('.stat[data-tab="evidence"]').forEach(stat=>{const value=stat.querySelector(':scope>b'),note=stat.querySelector(':scope>small');if(value)value.textContent='Locked';if(note)note.textContent='See Full Trip'})
 }
 document.querySelectorAll('.card p').forEach(p=>{
   const t=p.textContent.trim();
   if(t==='Evidence, hidden gallery, GALS messages and 20 GB for 12 months are active.')p.textContent='Full Trip is active: Evidence, Hidden Gallery, GALS messages and 20 GB of media storage for 12 months from activation.';
   else if(t==='Full photo/video uploads, Hidden Gallery, the GALS message system and 20 GB for 12 months.')p.textContent='Full photo/video uploads, Hidden Gallery, the GALS message system and 20 GB for 12 months from activation.';
   else if(t==='Up to 20 GB of trip photos and video for 12 months, plus the Hidden Gallery.')p.textContent='Up to 20 GB of trip photos and video for 12 months from activation, plus the Hidden Gallery. Before the storage window ends, the organiser should download the album and share or keep that copy independently.';
 });
 const form=document.getElementById('legalCheckoutForm');if(form){
   const immediate=form.querySelector('input[name="immediate"]')?.closest('label')?.querySelector('span');
   if(immediate)immediate.textContent='I request immediate access to Full Trip. I understand that by asking for digital content to be supplied immediately, my statutory 14-day cancellation right for that digital content may end once supply begins. My other statutory consumer rights are unaffected.';
   const intro=form.closest('.modal')?.querySelector(':scope>p');
   if(intro)intro.innerHTML='<strong>Full Trip · £24.99 one-off.</strong> Includes the GALS message system, shared photo and video uploads, both galleries, richer prompts and 20 GB of trip media storage for 12 months from activation.';
 }
}
function normalise(){decorateStats();fixEmptyMessage();fixChatClose();fixCopy();syncPollUi()}
let queued=false;
const app=document.getElementById('app');
if(app)new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;normalise()})}).observe(app,{childList:true,subtree:true,characterData:true});
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;normalise()})}).observe(document.body,{childList:true,subtree:true});
normalise();

/* Trip-wide poll discovery: latest open Free poll persists after voting; pending polls badge the Group tab. */
let client=null,pending=[],latestOpen=null,voted=new Set(),pollBusy=false,lastPollRefresh=0,pollChannel=null,pollTrip='';
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
function syncBadge(){
 const tab=document.querySelector('.dock [data-tab="group"]');document.querySelectorAll('.gtg-poll-dock-badge').forEach(x=>{if(x.parentElement!==tab)x.remove()});
 if(!tab||!pending.length){tab?.querySelector('.gtg-poll-dock-badge')?.remove();return}
 let badge=tab.querySelector('.gtg-poll-dock-badge');if(!badge){badge=document.createElement('span');badge.className='gtg-poll-dock-badge';tab.appendChild(badge)}badge.textContent=pending.length>9?'9+':String(pending.length);badge.setAttribute('aria-label',`${pending.length} poll${pending.length===1?'':'s'} waiting for your vote`)
}
function pollMarkup(p,count,hero,hasVoted){return hero?`<small>${hasVoted?'Poll open':count===1?'Vote needed':`${count} votes needed`}</small><strong>${esc(p.question)}</strong><em>${hasVoted?'View results ›':'Vote now ›'}</em>`:`<small>${count===1?'Vote needed':`${count} votes needed`}</small><strong>${esc(p.question)}</strong><span>${count===1?'A group poll is waiting for you.':'This is the latest group poll waiting for your vote.'}</span><em>Vote now ›</em>`}
function syncAlert(){
 const hero=document.querySelector('.dashboard .hero-card'),stat=document.querySelector('.dashboard .stat-row'),free=isFree();
 if(free&&latestOpen&&hero){document.querySelectorAll('.gtg-poll-alert').forEach(x=>x.remove());let b=hero.querySelector('.gtg-poll-hero-alert');if(!b){b=document.createElement('button');b.type='button';b.className='gtg-poll-hero-alert';hero.appendChild(b)}const has=voted.has(String(latestOpen.id)),key=`${latestOpen.id}:${pending.length}:${has}:${latestOpen.question}`;if(b.dataset.state!==key){b.dataset.state=key;b.dataset.gtgPollDiscovery=latestOpen.id;b.innerHTML=pollMarkup(latestOpen,pending.length,true,has)}return}
 document.querySelectorAll('.gtg-poll-hero-alert').forEach(x=>x.remove());
 if(!free&&pending.length&&stat){let b=document.querySelector('.gtg-poll-alert');if(!b){b=document.createElement('button');b.type='button';b.className='gtg-poll-alert';stat.before(b)}const p=pending[0],key=`${p.id}:${pending.length}:${p.question}`;if(b.dataset.state!==key){b.dataset.state=key;b.dataset.gtgPollDiscovery=p.id;b.innerHTML=pollMarkup(p,pending.length,false,false)}}else document.querySelectorAll('.gtg-poll-alert').forEach(x=>x.remove())
}
function syncPollUi(){syncBadge();syncAlert()}
async function refreshPolls(force=false){
 const id=tripId(),c=db();if(!id||!c){pending=[];latestOpen=null;voted=new Set();syncPollUi();return}
 const now=Date.now();if(pollBusy||(!force&&now-lastPollRefresh<5000)){syncPollUi();return}pollBusy=true;
 try{
   const [{data:{user}},{data:polls,error}]=await Promise.all([c.auth.getUser(),c.from('trip_polls').select('id,question,status,closes_at,created_at').eq('trip_id',id).eq('status','open').order('created_at',{ascending:false}).limit(30)]);
   if(error)throw error;const open=(polls||[]).filter(p=>!p.closes_at||new Date(p.closes_at)>new Date());latestOpen=open[0]||null;
   if(!user||!open.length){pending=open;voted=new Set();lastPollRefresh=Date.now();syncPollUi();return}
   const ids=open.map(p=>p.id),{data:votes,error:ve}=await c.from('trip_poll_votes').select('poll_id').eq('voter_user_id',user.id).in('poll_id',ids);if(ve)throw ve;
   voted=new Set((votes||[]).map(x=>String(x.poll_id)));pending=open.filter(p=>!voted.has(String(p.id)));lastPollRefresh=Date.now();syncPollUi();ensurePollRealtime();
 }catch(error){console.warn('Girls poll discovery unavailable.',error)}finally{pollBusy=false}
}
function ensurePollRealtime(){const c=db(),id=tripId();if(!c||!id||pollTrip===id&&pollChannel)return;if(pollChannel)c.removeChannel(pollChannel);pollTrip=id;pollChannel=c.channel(`gtg-poll-discovery-${id}`).on('postgres_changes',{event:'*',schema:'public',table:'trip_polls',filter:`trip_id=eq.${id}`},()=>{lastPollRefresh=0;void refreshPolls(true)}).on('postgres_changes',{event:'*',schema:'public',table:'trip_poll_votes',filter:`trip_id=eq.${id}`},()=>{lastPollRefresh=0;void refreshPolls(true)}).subscribe()}
function focusPoll(id){
 document.querySelector('.dock [data-tab="group"]')?.click();let tries=0;
 const open=()=>{const tab=document.querySelector('[data-gtg-social-tab="polls"]');if(tab&&!tab.classList.contains('active'))tab.click();const option=document.querySelector(`[data-gtg-poll-vote="${CSS.escape(String(id))}"]`),card=option?.closest('.gtg-poll-card');if(card){card.scrollIntoView({behavior:'smooth',block:'center'});return true}if(tries++<14){setTimeout(open,120);return false}return false};setTimeout(open,120)
}
document.addEventListener('click',event=>{const b=event.target.closest?.('[data-gtg-poll-discovery]');if(!b)return;event.preventDefault();event.stopPropagation();focusPoll(b.dataset.gtgPollDiscovery)},true);
document.addEventListener('click',event=>{if(event.target.closest?.('[data-gtg-poll-vote]'))setTimeout(()=>{lastPollRefresh=0;void refreshPolls(true)},450)},true);
function pollBoot(){if(!window.supabase?.createClient){setTimeout(pollBoot,80);return}void refreshPolls(true);ensurePollRealtime()}
pollBoot();window.addEventListener('pageshow',()=>{lastPollRefresh=0;void refreshPolls(true)});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){lastPollRefresh=0;void refreshPolls(true)}});
})();