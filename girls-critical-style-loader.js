/* Girls critical first-paint loader: isolated light cover + deterministic Home handoff. */
(()=>{
'use strict';
if(window.__GTG_CRITICAL_STYLE_LOADER__)return;window.__GTG_CRITICAL_STYLE_LOADER__=true;
const route=()=>new globalThis.URL(location.href).searchParams.get('action')||'overview';
const home=()=>route()==='overview';

function installStartupPolish(){
 if(document.getElementById('gtg-safe-home-startup-polish'))return;
 const style=document.createElement('style');style.id='gtg-safe-home-startup-polish';style.textContent=`
#gtg-first-paint-cover{position:fixed;inset:0;z-index:2147482500;overflow:auto;background:radial-gradient(circle at 14% 0,rgba(255,79,163,.055),transparent 30%),#fff;opacity:1;pointer-events:none;transition:opacity 140ms ease}
#gtg-first-paint-cover.gtg-cover-leaving{opacity:0}
@media(max-width:600px){#gtg-first-paint-cover .gtg-boot-hero,.gtg-boot-shell .gtg-boot-hero{min-height:340px!important}}
@media(max-width:700px) and (max-height:700px){#gtg-first-paint-cover .gtg-boot-hero,.gtg-boot-shell .gtg-boot-hero{min-height:300px!important}}
@media(prefers-reduced-motion:reduce){#gtg-first-paint-cover{transition:none!important}}
`;
 document.head.appendChild(style);
}

const styles=['/mobile-viewport-lock.css?v=2','/girls-action-feedback.css?v=1','/girls-drawer-fix.css?v=1','/girls-hero-vault-ux.css?v=1','/girls-final-refinement.css?v=1','/girls-date-focus-fix.css?v=1'];
if(home())styles.push('/live-dashboard-hero.css?v=8');
for(const href of styles){if(document.querySelector(`link[rel="stylesheet"][href="${href}"]`))continue;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.gtgCritical='1';document.head.appendChild(link)}

const scripts=home()?[
 '/home-social-platform-guard.js?v=20260908-2',
 '/girls-home-hero-layout-match.js?v=20260909-1',
 '/girls-live-dashboard-hero.js?v=10',
 '/girls-live-chat-sync.js?v=3',
 '/girls-home-refinements.js?v=1',
 '/girls-home-social-hub-v3.js?v=20260908-4',
 '/girls-home-scoreboard-fit.js?v=20260908-3',
 '/girls-parity-refresh-20260904.js?v=4'
]:[];
for(const src of scripts){if(document.querySelector(`script[src="${src}"]`))continue;const s=document.createElement('script');s.src=src;s.async=false;s.dataset.gtgCritical='1';document.body.appendChild(s)}

let cover=null,observer=null,released=false,releaseTimer=0;
function installStablePaintCover(){
 if(!home()||window.__GTG_FIRST_PAINT_DONE__||document.getElementById('gtg-first-paint-cover'))return;
 const app=document.getElementById('app'),boot=app?.querySelector(':scope > .gtg-boot-shell');if(!app||!boot)return;
 cover=document.createElement('div');cover.id='gtg-first-paint-cover';cover.setAttribute('aria-hidden','true');cover.innerHTML=boot.outerHTML;document.body.appendChild(cover);
}
function lightReady(){return document.documentElement.classList.contains('gtg-app-light')&&document.documentElement.classList.contains('gtg-home-shell')}
function finalReady(){
 const app=document.getElementById('app');if(!app)return false;
 if(app.querySelector('.auth-screen'))return document.documentElement.classList.contains('gtg-app-light');
 if(!lightReady())return false;
 const dashboard=app.querySelector('.dashboard[data-home-composition]');if(!dashboard||dashboard.getAttribute('aria-busy')==='true')return false;
 const mode=dashboard.dataset.homeComposition;if(mode!=='free'&&mode!=='full')return false;
 const hero=dashboard.querySelector(':scope .hero-card');if(!hero||dashboard.querySelectorAll(':scope .hero-card').length!==1)return false;
 const stats=dashboard.querySelectorAll(':scope .stat-row>.stat');if(stats.length!==4)return false;
 if(mode==='full'){
  if(!hero.matches('.live-snapshot-hero[data-live-snapshot="1"]'))return false;
  if(hero.dataset.fullHeroOwner!=='live-dashboard-hero')return false;
  if(hero.querySelectorAll(':scope>.live-hero-title').length!==1)return false;
  if(hero.querySelectorAll(':scope>.live-date-card').length!==1)return false;
  if(hero.querySelectorAll(':scope>.live-message-card').length!==1)return false;
  if(hero.querySelectorAll(':scope>.live-photo-block').length!==1)return false;
  return true;
 }
 if(!hero.classList.contains('gtg-boys-layout'))return false;
 if(hero.querySelectorAll(':scope>.gtg-countdown').length!==1)return false;
 if(hero.querySelectorAll(':scope>.trip-stamp,:scope>.gtg-trip-stamp-final').length!==1)return false;
 return true;
}
function removeCover(){if(cover?.isConnected)cover.remove();cover=null}
function release(){
 if(released||!finalReady())return;released=true;window.__GTG_FIRST_PAINT_DONE__=true;observer?.disconnect();observer=null;
 if(!cover)return;
 const reduce=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;if(reduce){removeCover();return}
 cover.classList.add('gtg-cover-leaving');
 const finish=()=>{clearTimeout(releaseTimer);removeCover()};cover.addEventListener('transitionend',finish,{once:true});releaseTimer=setTimeout(finish,190);
}
function check(){if(finalReady())release()}

installStartupPolish();
installStablePaintCover();
if(home()&&!window.__GTG_FIRST_PAINT_DONE__){
 observer=new MutationObserver(check);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-home-composition','data-live-snapshot','aria-busy']});
 requestAnimationFrame(()=>requestAnimationFrame(check));
 setTimeout(()=>{if(!released)console.warn('[GTG startup] Home cover is waiting for a complete Free/Full composition.')},9000);
}
})();
