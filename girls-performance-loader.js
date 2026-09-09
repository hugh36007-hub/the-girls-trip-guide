/* Girls performance: route-specific loading with strict Full/Free Evidence isolation. */
(()=>{
'use strict';
if(window.__GTG_PERFORMANCE_LOADER__)return;window.__GTG_PERFORMANCE_LOADER__=true;

const DOC_SRC='/girls-document-audience.js?v=20260908-2';
const REMINDER_SRC='/girls-free-reminders-parity.js?v=20260908-7';
const BUNDLES={
  appTheme:[
    '/logged-in-light-theme.js?v=20260909-1',
    '/logged-in-light-polish.js?v=20260908-4',
    '/girls-compact-inner-header.js?v=20260908-1',
    '/logged-in-light-theme-final-fix.js?v=20260907-1',
    '/logged-in-stat-icons.js?v=20260907-2',
    '/girls-direct-login-route.js?v=20260907-2',
    '/girls-resend-invite-fix.js?v=20260907-1',
    '/girls-home-shell-parity.js?v=20260909-1'
  ],
  onboarding:['/girls-batch1-parity-safe-v2.js?v=20260907-2','/girls-convince-copy-v2.js?v=20260907-1'],
  parity:['/girls-product-parity.js?v=4'],
  shell:['/girls-section-layout.js?v=1','/girls-inner-page-polish.js?v=2'],
  planDocuments:[DOC_SRC],
  money:['/girls-payment-nudge.js?v=2'],
  groupCore:[
    '/girls-trip-social.js?v=3',
    '/girls-chat-sheet.js?v=4',
    '/girls-chat-visibility-stability-fix.js?v=20260908-2',
    '/girls-conversation-inbox.js?v=2',
    '/conversation-header-align.js?v=2'
  ],
  groupPollExtras:['/girls-poll-nudge.js?v=2'],
  evidenceShared:['/evidence-intro-dismiss.js?v=3'],
  evidenceFull:[
    '/girls-vault-contract-fix.js?v=2',
    '/girls-hidden-upload-choice.js?v=1',
    '/girls-media-performance-max.js?v=2',
    '/girls-media-ux-plus.js?v=2',
    '/girls-evidence-parity.js?v=2',
    '/girls-media-quality-fix.js?v=5',
    '/girls-media-readiness.js?v=3',
    '/girls-direct-photo-viewer.js?v=5',
    '/girls-gallery-no-zoom.js?v=1',
    '/girls-media-flow-refinement.js?v=2',
    '/girls-media-social.js?v=1',
    '/video-thumbnail-fix.js?v=1'
  ],
  evidenceFree:[
    '/girls-evidence-light-corner-fix.js?v=20260907-1',
    '/girls-free-evidence-upsell-restore.js?v=20260908-1',
    '/girls-convince-copy-v2.js?v=20260907-1'
  ],
  reminders:[REMINDER_SRC],
  drawer:['/girls-free-entitlement-guard.js?v=1','/trip-export-menu-guard.js?v=1','/trip-export.js?v=1'],
  home:['/girls-home-thumbnail-prime.js?v=1'],
  upload:['https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/dist/tus.min.js']
};
const STYLES={
  shell:['/girls-section-layout.css?v=1','/girls-product-parity.css?v=1','/girls-inner-page-polish.css?v=1'],
  planDocuments:['/girls-document-audience.css?v=20260908-2'],
  evidenceFull:['/girls-evidence-core-grid.css?v=2'],
  reminders:['/girls-free-reminders-parity.css?v=20260908-7']
};
const loaded=new Set(),pending=new Map(),loadedStyles=new Set(),pendingStyles=new Map();
const visible=()=>document.visibilityState!=='hidden';
const action=()=>new URL(location.href).searchParams.get('action')||'overview';
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const composition=()=>document.querySelector('.dashboard')?.dataset.homeComposition||'';
const isFull=()=>composition()==='full';
const idle=cb=>{'requestIdleCallback'in window?requestIdleCallback(cb,{timeout:1200}):setTimeout(cb,220)};

function loadStyle(href){
 if(loadedStyles.has(href)||document.querySelector(`link[rel="stylesheet"][href="${href}"]`)){loadedStyles.add(href);return Promise.resolve()}
 if(pendingStyles.has(href))return pendingStyles.get(href);
 const job=new Promise(resolve=>{const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.gtgDeferredStyle='1';link.onload=()=>{loadedStyles.add(href);pendingStyles.delete(href);resolve()};link.onerror=()=>{pendingStyles.delete(href);resolve()};document.head.appendChild(link)});
 pendingStyles.set(href,job);return job;
}
function loadScript(src){
 if(loaded.has(src)||document.querySelector(`script[src="${src}"]`)){loaded.add(src);return Promise.resolve()}
 if(pending.has(src))return pending.get(src);
 const job=new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.async=false;s.dataset.gtgDeferred='1';s.onload=()=>{loaded.add(src);pending.delete(src);resolve()};s.onerror=()=>{pending.delete(src);resolve()};document.body.appendChild(s)});
 pending.set(src,job);return job;
}
async function loadBundle(name){
 for(const href of STYLES[name]||[])await loadStyle(href);
 for(const src of BUNDLES[name]||[])await loadScript(src);
}
async function loadEvidence(){
 await loadBundle('evidenceShared');
 const mode=composition();
 if(mode==='full')await loadBundle('evidenceFull');
 else if(mode==='free')await loadBundle('evidenceFree');
}
async function loadRoute(route){
 if(!['plan','money','group','evidence'].includes(route))return;
 await loadBundle('shell');
 if(route==='plan')await loadBundle('planDocuments');
 if(route==='money')await loadBundle('money');
 if(route==='group')await loadBundle('groupCore');
 if(route==='evidence')await loadEvidence();
}
async function openEvidence(target=null){
 await loadRoute('evidence');
 document.documentElement.classList.remove('gtg-evidence-route-pending');
 if(!target?.isConnected)return;
 target.dataset.gtgEvidenceReady='1';
 target.click();
}
async function openHome(target=null){
 if(isFull()){
   document.documentElement.classList.add('gtg-home-route-pending');
   await window.GTGCritical?.ensureHomeAssets?.();
 }
 await loadBundle('home');
 document.documentElement.classList.remove('gtg-home-route-pending');
 if(!target?.isConnected)return;
 target.dataset.gtgHomeReady='1';
 target.click();
}

void loadBundle('appTheme');
if(!tripId())void loadBundle('onboarding');

function afterDashboard(callback,delay=0){
 const run=()=>setTimeout(()=>{if(visible())callback()},delay);
 if(document.querySelector('.dashboard')){run();return}
 const app=document.getElementById('app');if(!app)return;
 const observer=new MutationObserver(()=>{if(!document.querySelector('.dashboard'))return;observer.disconnect();run()});
 observer.observe(app,{childList:true});
}
function scheduleInitial(){
 const route=action();
 if(route==='evidence')afterDashboard(()=>void openEvidence(),0);
 else if(route!=='overview')afterDashboard(()=>void loadRoute(route),0);
 if(['group','evidence','plan','money'].includes(route))afterDashboard(()=>idle(()=>void loadBundle('parity')),700);
 if(route==='overview')afterDashboard(()=>setTimeout(()=>{if(visible()&&action()==='overview')idle(()=>void loadBundle('home'))},12000),0);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleInitial,{once:true});else scheduleInitial();
window.addEventListener('popstate',()=>{const route=action();if(route==='evidence')void openEvidence();else if(route==='overview')void openHome();else void loadRoute(route);if(route!=='overview')idle(()=>void loadBundle('parity'))});

document.addEventListener('pointerdown',event=>{
 const target=event.target.closest?.('[data-tab],[data-a],[data-action],[data-trip-social-tab],[data-gtg-social-tab],[data-parity-comms],[data-parity-reminders],[data-role-money],[data-role-upload]');if(!target)return;
 const tab=target.dataset.tab||'';const a=target.dataset.a||target.dataset.action||'';
 if(['plan','money','group','evidence'].includes(tab)){void loadRoute(tab);void loadBundle('parity')}
 if(tab==='overview'&&isFull())void window.GTGCritical?.ensureHomeAssets?.();
 if(target.matches('[data-role-money]')||a==='addExpense')void loadRoute('money');
 if(isFull()&&(target.matches('[data-role-upload]')||['upload','vault','vaultUpload'].includes(a))){void loadRoute('evidence');void loadBundle('upload')}
 if(a==='addDocument'||a==='openDocument')void loadBundle('planDocuments');
 if(a==='drawer')void loadBundle('drawer');
 if(tab==='group'||target.matches('[data-trip-social-tab],[data-gtg-social-tab],[data-parity-comms]'))void loadBundle('groupCore');
 if(target.matches('[data-gtg-social-tab="polls"]'))void loadBundle('groupPollExtras');
 if(target.matches('[data-parity-reminders]'))void loadBundle('reminders');
},{capture:true,passive:true});

document.addEventListener('click',event=>{
 const homeTab=event.target.closest?.('[data-tab="overview"]');
 if(homeTab&&isFull()){
   if(homeTab.dataset.gtgHomeReady==='1'){
     delete homeTab.dataset.gtgHomeReady;
   }else{
     event.preventDefault();event.stopImmediatePropagation();
     void openHome(homeTab);
     return;
   }
 }
 const evidenceTab=event.target.closest?.('[data-tab="evidence"]');
 if(evidenceTab&&isFull()){
   if(evidenceTab.dataset.gtgEvidenceReady==='1'){
     delete evidenceTab.dataset.gtgEvidenceReady;
   }else{
     event.preventDefault();event.stopImmediatePropagation();
     void openEvidence(evidenceTab);
     return;
   }
 }
 const picker=event.target.closest?.('[data-a="picker"]');
 if(picker&&isFull()){
   event.preventDefault();event.stopImmediatePropagation();
   location.assign('/create-trip');
   return;
 }
 const addDocument=event.target.closest?.('[data-a="addDocument"]');
 if(addDocument&&!loaded.has(DOC_SRC)){
   event.preventDefault();event.stopImmediatePropagation();
   const target=addDocument;
   void loadBundle('planDocuments').then(()=>{if(target.isConnected)target.click()});
   return;
 }
 const reminders=event.target.closest?.('[data-parity-reminders]');
 if(reminders&&!loaded.has(REMINDER_SRC)){
   event.preventDefault();event.stopImmediatePropagation();
   const target=reminders;
   void loadBundle('reminders').then(()=>{if(target.isConnected)target.click()});
 }
},{capture:true});

let homeIntent=false;
function loadHomeIntent(){if(homeIntent||action()!=='overview')return;homeIntent=true;void loadBundle('parity')}
window.addEventListener('scroll',()=>{if((window.scrollY||0)>40)loadHomeIntent()},{passive:true});
document.addEventListener('keydown',event=>{if(event.key==='PageDown'||event.key==='End')loadHomeIntent()},{passive:true});

window.GTGPerformance={loadBundle,loadRoute,openEvidence,openHome,composition};
})();
