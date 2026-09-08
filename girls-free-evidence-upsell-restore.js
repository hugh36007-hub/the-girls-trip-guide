/* Restore the completed Girls Free Evidence -> Full Trip page without reloading the whole onboarding bundle. */
(()=>{
'use strict';
if(window.__GTG_FREE_EVIDENCE_UPSELL_RESTORE__)return;
window.__GTG_FREE_EVIDENCE_UPSELL_RESTORE__=true;
if(!location.pathname.startsWith('/create-trip'))return;

const app=document.getElementById('app')||document.body;
const isEvidence=()=>new URL(location.href).searchParams.get('action')==='evidence'||document.querySelector('.dock [data-tab="evidence"].active');
const isOwner=()=>/organiser/i.test(document.querySelector('.trip-title span')?.textContent||document.querySelector('.trip-title')?.textContent||'');

const style=document.createElement('style');
style.id='gtg-free-evidence-upsell-restore-style';
style.textContent=`
.gtg-b1-upgrade{border:1px solid rgba(255,79,163,.28);border-radius:20px;background:#fff;padding:24px;color:#191316}
.gtg-b1-upgrade header{text-align:center}
.gtg-b1-upgrade header img{width:70px;height:70px;object-fit:contain}
.gtg-b1-upgrade h2{margin:8px 0;font:900 clamp(38px,5vw,56px)/.94 'Barlow Condensed',sans-serif;text-transform:uppercase}
.gtg-b1-upgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}
.gtg-b1-upitem{display:grid;grid-template-columns:22px 1fr;gap:8px;border:1px solid rgba(255,79,163,.22);border-radius:14px;background:#fff9fc;padding:13px}
.gtg-b1-upitem i{font-style:normal;color:#ed2f8b;font-weight:900}
.gtg-b1-upitem b{display:block}
.gtg-b1-upitem span{display:block;margin-top:3px;color:#74686e;font-size:11px;line-height:1.4}
.gtg-b1-price{text-align:center;border-top:1px solid rgba(255,79,163,.2);padding-top:16px}
.gtg-b1-price strong{font:900 42px/1 'Barlow Condensed',sans-serif;color:#ed2f8b}
.gtg-b1-convince{display:block;margin:12px auto;border:1px solid #ed2f8b;border-radius:999px;background:#fff;color:#ed2f8b;padding:9px 18px;font-weight:900}
.gtg-b1-grace{display:none;grid-template-columns:180px 1fr;gap:16px;margin-top:16px;padding:14px;border:1px solid rgba(255,79,163,.2);border-radius:14px;background:#fff9fc}
.gtg-b1-grace.open{display:grid}
.gtg-b1-grace img{width:100%;height:270px;object-fit:cover;border-radius:10px}
.gtg-b1-grace p{color:#655960!important;font-size:12px!important;line-height:1.5!important}
[data-panel="evidence"]:has(.gtg-b1-upgrade) .gtg-free-evidence{display:none!important}
[data-panel="evidence"]:has(.gtg-b1-upgrade) .evidence-intro-dismiss{grid-template-columns:minmax(0,1fr)!important}
[data-panel="evidence"]:has(.gtg-b1-upgrade) .evidence-intro-dismiss-close{display:none!important}
@media(max-width:700px){
 .gtg-b1-upgrade{padding:20px 18px}
 .gtg-b1-upgrid,.gtg-b1-grace{grid-template-columns:1fr}
 .gtg-b1-grace img{height:250px}
}
`;
document.head.appendChild(style);

function mount(){
 if(!isEvidence())return;
 const panel=document.querySelector('[data-panel="evidence"]');
 if(!panel||panel.querySelector('.gtg-b1-upgrade'))return;
 const old=panel.querySelector('.card.upgrade');
 const fallback=panel.querySelector('.gtg-free-evidence');
 if(!old&&!fallback)return; // paid Evidence has neither; leave it untouched.

 const items=[
  ['20 GB shared media','Photos and videos kept with the trip for 12 months from activation.'],
  ['The whole group can contribute','Everyone can add photos and videos to the same private trip.'],
  ['Official Version','The shared gallery for the official record.'],
  ['Hidden Gallery','A separate PIN-protected private gallery.'],
  ['Grace + the GALS','Automated communications and richer prompts before, during and after.'],
  ['Less chasing','Stronger payment nudges and organiser support.']
 ];
 const wrap=document.createElement('div');
 wrap.className='gtg-b1-upgrade';
 wrap.innerHTML=`<header><img src="assets/images/girls-trip-guide-logo.webp" alt=""><div class="eyebrow">Full Trip</div><h2>Lock in all the moments in one place.</h2><p>Free keeps the plan organised. Full Trip turns it into the shared record.</p></header><div class="gtg-b1-upgrid">${items.map(i=>`<div class="gtg-b1-upitem"><i>✓</i><div><b>${i[0]}</b><span>${i[1]}</span></div></div>`).join('')}</div><button type="button" class="gtg-b1-convince" data-gtg-convince>Convince me</button><div class="gtg-b1-price"><strong>£24.99</strong> one-off · covers the whole trip<br>${isOwner()?'<button class="btn primary" data-a="upgrade" style="margin-top:12px">Unlock Full Trip →</button>':''}<p>No per-person charge. Your existing trip, group, plan, costs, chat and polls stay exactly where they are.</p></div><section class="gtg-b1-grace"><img src="assets/images/grace.webp" alt="Grace"><div><div class="eyebrow">Grace's answer</div><h3>Right. Here's the problem.</h3><p>By Monday the best bits are scattered across everyone's camera rolls. Somebody has the only good video; somebody else says, <strong>“I'll send them later.”</strong></p><p>You organised the trip for what happened when you got there. Full Trip keeps the good stuff together while everyone still has it and gives the organiser 12 months to download the record independently.</p></div></section>`;

 if(old)old.replaceWith(wrap);
 else fallback.insertAdjacentElement('afterend',wrap);
}

function schedule(){requestAnimationFrame(mount)}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
window.addEventListener('popstate',schedule);
window.addEventListener('pageshow',schedule);
document.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-gtg-convince]');
 if(!button)return;
 const panel=button.closest('.gtg-b1-upgrade')?.querySelector('.gtg-b1-grace');
 if(!panel)return;
 panel.classList.toggle('open');
 button.textContent=panel.classList.contains('open')?'Hide Grace':'Convince me';
},false);
schedule();
})();
