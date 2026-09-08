/* Girls critical startup: load only what the current private route needs. */
(()=>{
'use strict';
if(window.__GTG_CRITICAL_STYLE_LOADER__)return;window.__GTG_CRITICAL_STYLE_LOADER__=true;

const route=()=>new URL(location.href).searchParams.get('action')||'overview';
const currentRoute=route();

/* Home startup polish is CSS-only by design. Do not mutate the app DOM here: this
   loader already observes #app later and DOM writes from that observer can self-trigger. */
if(currentRoute==='overview'){
 const startupStyle=document.createElement('style');
 startupStyle.id='gtg-safe-home-startup-polish';
 startupStyle.textContent=`
  .dashboard[aria-busy="true"] .hero-card>img,
  #gtg-first-paint-cover .hero-card>img{visibility:hidden!important}
  .dashboard[aria-busy="true"] .hero-card,
  #gtg-first-paint-cover .hero-card{background:radial-gradient(circle at 18% 18%,rgba(255,79,163,.10),transparent 34%),linear-gradient(145deg,#160d15,#0b080b)!important}
  .appbar .brand img{display:none!important}
  .appbar .brand::before{content:'The Girls Trip Guide ♡';display:block;white-space:nowrap;font:800 17px/1 'Barlow Condensed',sans-serif;letter-spacing:-.015em;text-transform:uppercase;color:#191316}
  @media(max-width:600px){.appbar .brand::before{font-size:15px}}
 `;
 document.head.appendChild(startupStyle);
}

const styles=[
 '/mobile-viewport-lock.css?v=2',
 '/girls-action-feedback.css?v=1',
 '/girls-drawer-fix.css?v=1',
 '/girls-hero-vault-ux.css?v=1',
 '/girls-final-refinement.css?v=1',
 '/girls-date-focus-fix.css?v=1'
];
if(currentRoute==='overview')styles.push('/live-dashboard-hero.css?v=6');

for(const href of styles){
 if(document.querySelector(`link[rel="stylesheet"][href="${href}"]`))continue;
 const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.gtgPerfStyle='1';
 if(href.startsWith('/live-dashboard-hero.css'))link.dataset.liveDashboardHero='1';
 document.head.appendChild(link);
}

function loadScripts(sources,kind){
 for(const src of sources){
   if(document.querySelector(`script[src="${src}"]`))continue;
   const script=document.createElement('script');script.src=src;script.async=false;script.dataset.gtgCritical=kind;document.head.appendChild(script);
 }
}

function loadRouteCritical(){
 /* Role restrictions apply everywhere in the signed-in trip app. */
 loadScripts(['/girls-member-view-parity.js?v=1'],'global');
 if(currentRoute!=='overview')return;

 /* Home is the only route that needs the live hero/social stack at first paint.
    v3 is authoritative; the obsolete Home social v2 is deliberately not loaded. */
 loadScripts([
   '/home-social-platform-guard.js?v=20260908-2',
   '/girls-home-hero-background.js?v=20260908-2',
   '/girls-home-hero-layout-match.js?v=20260908-4',
   '/girls-live-dashboard-hero.js?v=8',
   '/girls-live-chat-sync.js?v=3',
   '/girls-home-refinements.js?v=1',
   '/girls-home-social-hub-v3.js?v=20260908-4',
   '/girls-home-scoreboard-fit.js?v=20260908-3',
   '/girls-parity-refresh-20260904.js?v=4'
 ],'home');
}

function installStablePaintCover(){
 /* The paint cover exists to prevent the Home hero multi-render/flicker. Inner routes
    do not need a cloned full-page DOM sitting above the real application. */
 if(currentRoute!=='overview')return;
 const app=document.getElementById('app');if(!app||document.getElementById('gtg-first-paint-cover'))return;
 const cover=app.cloneNode(true);cover.id='gtg-first-paint-cover';cover.setAttribute('aria-hidden','true');
 Object.assign(cover.style,{position:'fixed',inset:'0',zIndex:'2147483645',overflow:'auto',background:'#070507',pointerEvents:'none'});
 document.body.appendChild(cover);
 let released=false;
 const finalReady=()=>{
   if(app.querySelector('.auth-screen'))return true;
   const dashboard=app.querySelector('.dashboard:not([aria-busy="true"])');if(!dashboard)return false;
   const hero=dashboard.querySelector('.hero-card');if(!hero)return true;
   const paid=[...hero.querySelectorAll('.eyebrow')].some(node=>/full trip/i.test(node.textContent||''));
   if(paid)return hero.classList.contains('live-snapshot-hero');
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

installStablePaintCover();
loadRouteCritical();
})();
