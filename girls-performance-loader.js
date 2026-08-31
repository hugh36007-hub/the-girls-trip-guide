/* Girls performance: defer only route-specific and noncritical enhancements. */
(()=>{
'use strict';
if(window.__GTG_PERFORMANCE_LOADER__)return;window.__GTG_PERFORMANCE_LOADER__=true;

const BUNDLES={
  parity:['/girls-product-parity.js?v=1'],
  shell:['/girls-section-layout.js?v=1','/girls-inner-page-polish.js?v=1'],
  plan:['/girls-document-audience.js?v=1'],
  money:['/girls-payment-nudge.js?v=2'],
  group:['/girls-trip-social.js?v=2','/girls-chat-sheet.js?v=2','/girls-conversation-inbox.js?v=1','/conversation-header-align.js?v=1','/girls-poll-nudge.js?v=1'],
  evidence:[
    '/girls-vault-contract-fix.js?v=1',
    '/girls-hidden-upload-choice.js?v=1',
    '/girls-media-performance-max.js?v=2',
    '/girls-media-ux-plus.js?v=2',
    '/girls-evidence-parity.js?v=2',
    '/girls-media-quality-fix.js?v=4',
    '/girls-mobile-evidence-grid.js?v=2',
    '/girls-media-readiness.js?v=2',
    '/girls-direct-photo-viewer.js?v=4',
    '/girls-media-flow-refinement.js?v=1',
    '/girls-media-social.js?v=1',
    '/evidence-intro-dismiss.js?v=1',
    '/video-thumbnail-fix.js?v=1'
  ],
  drawer:['/girls-free-entitlement-guard.js?v=1'],
  home:['/girls-home-thumbnail-prime.js?v=1'],
  upload:['https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/dist/tus.min.js']
};
const STYLES={
  shell:['/girls-section-layout.css?v=1','/girls-product-parity.css?v=1','/girls-inner-page-polish.css?v=1'],
  plan:['/girls-document-audience.css?v=1']
};
const loaded=new Set(),pending=new Map(),loadedStyles=new Set(),pendingStyles=new Map();
const visible=()=>document.visibilityState!=='hidden';
const action=()=>new URL(location.href).searchParams.get('action')||'overview';
const idle=cb=>{'requestIdleCallback'in window?requestIdleCallback(cb):setTimeout(cb,180)};

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
async function loadRoute(route){
 if(!['plan','money','group','evidence'].includes(route))return;
 await loadBundle('shell');
 if(route==='plan')await loadBundle('plan');
 if(route==='money')await loadBundle('money');
 if(route==='group')await loadBundle('group');
 if(route==='evidence')await loadBundle('evidence');
}

function afterDashboard(callback,delay=0){
 const run=()=>setTimeout(()=>{if(visible())callback()},delay);
 if(document.querySelector('.dashboard')){run();return}
 const app=document.getElementById('app');if(!app)return;
 const observer=new MutationObserver(()=>{if(!document.querySelector('.dashboard'))return;observer.disconnect();run()});
 observer.observe(app,{childList:true});
}
function scheduleInitial(){
 const route=action();
 if(route!=='overview')afterDashboard(()=>void loadRoute(route),0);
 if(route==='group'||route==='evidence'||route==='plan'||route==='money')afterDashboard(()=>idle(()=>void loadBundle('parity')),600);
 if(route==='overview')afterDashboard(()=>setTimeout(()=>{if(visible()&&action()==='overview')idle(()=>void loadBundle('home'))},15000),0);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleInitial,{once:true});else scheduleInitial();
window.addEventListener('popstate',()=>{const route=action();void loadRoute(route);if(route!=='overview')idle(()=>void loadBundle('parity'))});

document.addEventListener('pointerdown',event=>{
 const target=event.target.closest?.('[data-tab],[data-a],[data-action],[data-trip-social-tab],[data-parity-comms],[data-role-expense],[data-role-upload]');if(!target)return;
 const tab=target.dataset.tab||'';const a=target.dataset.a||target.dataset.action||'';
 if(['plan','money','group','evidence'].includes(tab)){void loadRoute(tab);void loadBundle('parity')}
 if(target.matches('[data-role-expense]')||a==='addExpense')void loadRoute('money');
 if(target.matches('[data-role-upload]')||['upload','vault','vaultUpload'].includes(a)){void loadRoute('evidence');void loadBundle('upload')}
 if(a==='addDocument')void loadRoute('plan');
 if(a==='drawer')void loadBundle('drawer');
 if(tab==='group'||target.matches('[data-trip-social-tab],[data-parity-comms]'))void loadRoute('group');
},{capture:true,passive:true});

let homeIntent=false;
function loadHomeIntent(){if(homeIntent||action()!=='overview')return;homeIntent=true;void loadBundle('parity')}
window.addEventListener('scroll',()=>{if((window.scrollY||0)>40)loadHomeIntent()},{passive:true});
document.addEventListener('keydown',event=>{if(event.key==='PageDown'||event.key==='End')loadHomeIntent()},{passive:true});

window.GTGPerformance={loadBundle,loadRoute};
})();
