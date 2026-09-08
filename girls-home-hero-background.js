/* Girls Home: remove the trip photo from the Home hero and use a dark luxury background matching the Boys layout language. */
(()=>{
'use strict';
if(window.__GTG_HOME_HERO_BACKGROUND__)return;window.__GTG_HOME_HERO_BACKGROUND__=true;
const STYLE_ID='gtg-home-hero-background-css';
function installStyles(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
.dashboard .hero-card.gtg-home-no-photo{position:relative;background:radial-gradient(circle at 84% 15%,rgba(255,79,163,.13),transparent 31%),radial-gradient(circle at 14% 88%,rgba(255,79,163,.06),transparent 32%),linear-gradient(145deg,#1b1218 0%,#100b0f 48%,#080608 100%)!important;border-color:rgba(255,79,163,.32)!important;box-shadow:0 18px 50px rgba(38,12,27,.18)!important}
.dashboard .hero-card.gtg-home-no-photo>img{display:none!important}
.dashboard .hero-card.gtg-home-no-photo:before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(135deg,rgba(0,0,0,.45),transparent 68%)}
.dashboard .hero-card.gtg-home-no-photo:after{background:linear-gradient(180deg,rgba(6,4,6,.02) 0%,rgba(6,4,6,.10) 44%,rgba(6,4,6,.42) 100%)!important}
.dashboard .hero-card.gtg-home-no-photo .hero-meta,.dashboard .hero-card.gtg-home-no-photo .gtg-home-chat-strip,.dashboard .hero-card.gtg-home-no-photo .gtg-home-score-v2{z-index:3}
@media(max-width:700px){.dashboard .hero-card.gtg-home-no-photo{background:radial-gradient(circle at 86% 14%,rgba(255,79,163,.16),transparent 35%),radial-gradient(circle at 12% 90%,rgba(255,79,163,.07),transparent 34%),linear-gradient(145deg,#1a1117 0%,#0f0a0e 52%,#070507 100%)!important}.dashboard .hero-card.gtg-home-no-photo:before{background-size:42px 42px}}
`;
 document.head.appendChild(s);
}
function sync(){
 installStyles();
 const home=(new URL(location.href)).searchParams.get('action')||'overview';
 if(home!=='overview')return;
 document.querySelector('.dashboard .hero-card')?.classList.add('gtg-home-no-photo');
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})}
const root=document.getElementById('app')||document.body;new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('popstate',schedule);window.addEventListener('pageshow',schedule);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule()});schedule();
})();
