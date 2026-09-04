/* Girls critical startup: keep one stable private shell visible until the final view is ready. */
(()=>{
'use strict';
if(window.__GTG_CRITICAL_STYLE_LOADER__)return;window.__GTG_CRITICAL_STYLE_LOADER__=true;
const styles=[
 '/mobile-viewport-lock.css?v=2',
 '/girls-action-feedback.css?v=1',
 '/girls-drawer-fix.css?v=1',
 '/girls-hero-vault-ux.css?v=1',
 '/girls-final-refinement.css?v=1',
 '/girls-date-focus-fix.css?v=1',
 '/live-dashboard-hero.css?v=6'
];
for(const href of styles){
 if(document.querySelector(`link[rel="stylesheet"][href="${href}"]`))continue;
 const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.gtgPerfStyle='1';
 if(href.startsWith('/live-dashboard-hero.css'))link.dataset.liveDashboardHero='1';
 document.head.appendChild(link);
}

function loadFinalHome(){
 for(const src of ['/girls-live-dashboard-hero.js?v=6','/girls-live-chat-sync.js?v=3','/girls-parity-refresh-20260904.js?v=1']){
   if(document.querySelector(`script[src="${src}"]`))continue;
   const script=document.createElement('script');script.src=src;script.async=false;script.dataset.gtgCriticalHome='1';document.head.appendChild(script);
 }
}

function installStablePaintCover(){
 const app=document.getElementById('app');if(!app||document.getElementById('gtg-first-paint-cover'))return;
 const cover=app.cloneNode(true);cover.id='gtg-first-paint-cover';cover.setAttribute('aria-hidden','true');
 Object.assign(cover.style,{position:'fixed',inset:'0',zIndex:'2147483645',overflow:'auto',background:'#070507',pointerEvents:'none'});
 document.body.appendChild(cover);
 let released=false;
 const route=()=>new URL(location.href).searchParams.get('action')||'overview';
 const finalReady=()=>{
   if(app.querySelector('.auth-screen'))return true;
   const dashboard=app.querySelector('.dashboard:not([aria-busy="true"])');if(!dashboard)return false;
   const hero=dashboard.querySelector('.hero-card');if(!hero)return true;
   const paid=[...hero.querySelectorAll('.eyebrow')].some(node=>/full trip/i.test(node.textContent||''));
   if(paid&&route()==='overview')return hero.classList.contains('live-snapshot-hero');
   return true;
 };
 const release=()=>{
   if(released)return;released=true;observer.disconnect();
   requestAnimationFrame(()=>requestAnimationFrame(()=>cover.remove()));
 };
 const check=()=>{if(finalReady())release()};
 const observer=new MutationObserver(check);observer.observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-busy']});
 check();setTimeout(release,7000);
}

/* This defer script runs before girls-app-v2.js: freeze the parsed loading shell,
   then pre-register the final Home transformer before secure data can render. */
installStablePaintCover();
loadFinalHome();
})();