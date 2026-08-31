/* Girls performance: route-aware post-paint loading for noncritical enhancements. */
(()=>{
'use strict';
if(window.__GTG_PERFORMANCE_LOADER__)return;window.__GTG_PERFORMANCE_LOADER__=true;

const BUNDLES={
  parity:['/girls-product-parity.js?v=1'],
  group:['/girls-trip-social.js?v=2','/girls-chat-sheet.js?v=2','/girls-poll-nudge.js?v=1'],
  evidence:['/girls-media-social.js?v=1','/evidence-intro-dismiss.js?v=1'],
  hero:['/girls-live-dashboard-hero.js?v=1'],
  home:['/girls-home-thumbnail-prime.js?v=1'],
  upload:['https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/dist/tus.min.js']
};
const loaded=new Set();
const pending=new Map();
const visible=()=>document.visibilityState!=='hidden';
const action=()=>new URL(location.href).searchParams.get('action')||'overview';
const idle=cb=>{'requestIdleCallback'in window?requestIdleCallback(cb):setTimeout(cb,180)};

function loadScript(src){
 if(loaded.has(src)||document.querySelector(`script[src="${src}"]`)){loaded.add(src);return Promise.resolve()}
 if(pending.has(src))return pending.get(src);
 const job=new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.async=false;s.dataset.gtgDeferred='1';s.onload=()=>{loaded.add(src);pending.delete(src);resolve()};s.onerror=()=>{pending.delete(src);resolve()};document.body.appendChild(s)});
 pending.set(src,job);return job;
}
async function loadBundle(name){for(const src of BUNDLES[name]||[])await loadScript(src)}

function afterDashboard(callback,delay=0){
 const run=()=>setTimeout(()=>{if(visible())callback()},delay);
 if(document.querySelector('.dashboard')){run();return}
 const app=document.getElementById('app');if(!app)return;
 const observer=new MutationObserver(()=>{if(!document.querySelector('.dashboard'))return;observer.disconnect();run()});
 observer.observe(app,{childList:true,subtree:true});
}
function scheduleInitial(){
 const route=action();
 if(route==='overview')afterDashboard(()=>void loadBundle('hero'),40);
 afterDashboard(()=>idle(()=>void loadBundle('parity')),route==='overview'?1200:220);
 if(route==='group')afterDashboard(()=>idle(()=>void loadBundle('group')),260);
 if(route==='evidence')afterDashboard(()=>idle(()=>void loadBundle('evidence')),160);
 if(route==='overview')afterDashboard(()=>setTimeout(()=>{if(visible())idle(()=>void loadBundle('home'))},6000),0);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleInitial,{once:true});else scheduleInitial();
window.addEventListener('popstate',()=>{
 const route=action();
 if(route==='overview')void loadBundle('hero');
 if(route==='group')void loadBundle('group');
 if(route==='evidence')void loadBundle('evidence');
});

/* User intent always wins over background scheduling. */
document.addEventListener('pointerdown',event=>{
 const target=event.target.closest?.('[data-tab],[data-a],[data-action],[data-trip-social-tab],[data-parity-comms]');if(!target)return;
 const tab=target.dataset.tab||'';const a=target.dataset.a||target.dataset.action||'';
 if(tab==='overview')void loadBundle('hero');
 if(tab==='group'||target.matches('[data-trip-social-tab],[data-parity-comms]'))void loadBundle('group');
 if(tab==='evidence'||['upload','vault'].includes(a))void loadBundle('evidence');
 if(['upload','vault'].includes(a)||target.closest?.('#uploadForm,#vaultUploadForm'))void loadBundle('upload');
},{capture:true,passive:true});

document.addEventListener('visibilitychange',()=>{if(visible()&&action()==='overview'){if(!loaded.has(BUNDLES.hero[0]))void loadBundle('hero');if(!loaded.has(BUNDLES.parity[0]))afterDashboard(()=>idle(()=>void loadBundle('parity')),500)}});
})();
