(()=>{
'use strict';
if(window.__GTG_HOME_HERO_LAYOUT_MATCH__)return;window.__GTG_HOME_HERO_LAYOUT_MATCH__=true;
const css=document.createElement('style');css.id='gtg-home-hero-layout-match-css';css.textContent=`
.dashboard .hero-card.gtg-boys-layout{position:relative!important;min-height:340px!important;overflow:hidden!important;background:radial-gradient(circle at 82% 12%,rgba(255,79,163,.12),transparent 30%),linear-gradient(145deg,#1b1218 0%,#100b0f 50%,#080608 100%)!important;border-color:rgba(255,79,163,.32)!important}
.dashboard .hero-card.gtg-boys-layout>img{display:none!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta{position:absolute!important;inset:0!important;display:block!important;padding:0!important;z-index:2!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child{position:absolute!important;left:24px!important;top:82px!important;max-width:61%!important;color:#fff!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child>.eyebrow{display:none!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta h1{margin:0!important;color:#fff!important;font-size:clamp(42px,7vw,64px)!important;line-height:.9!important;letter-spacing:-.025em!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta h1 span{color:#ff69ad!important;white-space:nowrap}
.dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child>p{margin:15px 0 0!important;padding-left:12px!important;border-left:2px solid #ff4fa3!important;color:#f3e7ed!important;font-size:13px!important}
.dashboard .hero-card.gtg-boys-layout .gtg-countdown{position:absolute;z-index:8;top:16px;right:16px;padding:9px 12px;border:1px solid rgba(255,79,163,.48);border-radius:999px;background:rgba(12,7,11,.88);color:#ff69ad;font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
.dashboard .hero-card.gtg-boys-layout .trip-stamp{position:absolute!important;z-index:8!important;top:74px!important;right:16px!important;width:124px!important;box-sizing:border-box!important;margin:0!important;padding:13px 12px!important;border:1px solid rgba(255,79,163,.28)!important;border-radius:14px!important;background:rgba(12,7,11,.88)!important;color:#fff!important;text-align:left!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp b{display:block!important;margin:0 0 8px!important;color:#ff69ad!important;font-size:9px!important;letter-spacing:.12em!important;text-transform:uppercase!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp span{display:block!important;color:#fff!important;font-size:11px!important;line-height:1.5!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp small{display:block;margin-top:8px;padding-top:7px;border-top:1px solid rgba(255,79,163,.18);color:#ff69ad;font-size:8px;font-weight:900;text-transform:uppercase}
@media(max-width:700px){.dashboard .hero-card.gtg-boys-layout{min-height:340px!important}.dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child{left:24px!important;top:82px!important;max-width:62%!important}.dashboard .hero-card.gtg-boys-layout .hero-meta h1{font-size:40px!important}.dashboard .hero-card.gtg-boys-layout .trip-stamp{top:72px!important;right:16px!important}.dashboard .hero-card.gtg-boys-layout .gtg-countdown{right:16px!important}}
`;
document.head.appendChild(css);
function sync(){
 const action=new URL(location.href).searchParams.get('action')||'overview';if(action!=='overview')return;
 const hero=document.querySelector('.dashboard .hero-card');if(!hero)return;
 hero.classList.add('gtg-boys-layout');if(hero.dataset.gtgBoysLayout==='1')return;
 const copy=hero.querySelector('.hero-meta>div:first-child'),h1=copy?.querySelector('h1'),p=copy?.querySelector('p'),stamp=hero.querySelector('.hero-meta .trip-stamp');if(!copy||!h1||!p||!stamp)return;
 const destination=h1.childNodes[0]?.textContent?.trim()||'Trip',status=h1.querySelector('span')?.textContent||'',dates=p.textContent.trim(),year=(dates.match(/20\d{2}/)||[])[0]||'',trip=document.querySelector('.trip-title strong')?.textContent?.trim()||'The trip',count=document.querySelector('.stat[data-tab="group"] b')?.textContent?.trim()||'';
 h1.innerHTML=`${destination}${year?` <span>${year}</span>`:''}`;p.textContent=`${trip}${count?` · ${count} group`:''}`;
 const badge=document.createElement('div');badge.className='gtg-countdown';const n=(status.match(/\d+/)||[])[0];badge.textContent=n?`${n} days to go`:'Trip dates';hero.appendChild(badge);
 const parts=dates.split(/\s+[—–-]\s+/);stamp.innerHTML=`<b>Trip dates</b><span>${parts[0]||dates}${parts[1]?`<br>${parts[1]}`:''}</span>`;
 hero.dataset.gtgBoysLayout='1';
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})};
new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:false});window.addEventListener('popstate',schedule);window.addEventListener('pageshow',schedule);schedule();
})();
