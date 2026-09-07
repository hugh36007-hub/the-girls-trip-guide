/* Batch 1 public parity: match the Boys product proposition without changing Girls voice. */
(()=>{
'use strict';
if(window.__GTG_BATCH1_PUBLIC__)return;window.__GTG_BATCH1_PUBLIC__=true;
function apply(){
  const full=document.querySelector('.full-arrangement');
  if(full){
    const copy=full.querySelector('.full-arrangement-copy');
    if(copy)copy.textContent='Same trip. Less chasing. The £24.99 one-off upgrade adds Grace and the GALS, automated trip nudges, stronger payment chasing, full photo and video uploads, both galleries and richer prompts before, during and after the trip.';
    const benefits=full.querySelector('.full-arrangement-benefits');
    if(benefits)benefits.innerHTML='<span>Grace + automated trip communications</span><span>Stronger payment nudges and chasing</span><span>Full photo & video sharing</span><span>Official Version + Hidden Gallery</span><span>Richer prompts across the whole trip</span>';
    const price=full.querySelector('.full-arrangement-price');
    if(price&&!price.querySelector('[data-gtg-batch1-start]')){
      const existing=price.querySelector('a.pill');
      if(existing){existing.textContent='START WITH FULL TRIP →';existing.href='/create-trip';existing.dataset.gtgBatch1Start='1';}
      const compare=document.createElement('a');compare.href='/free-vs-full';compare.className='gals-tease-button gtg-batch1-compare';compare.textContent='SEE FREE VS FULL →';
      const tease=price.querySelector('.gals-tease');if(tease)price.insertBefore(compare,tease);else price.appendChild(compare);
      const note=document.createElement('p');note.className='gtg-batch1-set-up-note';note.textContent='Set the trip up first. The upgrade is then applied to that trip.';price.appendChild(note);
    }
  }
  return Boolean(full);
}
const style=document.createElement('style');style.id='gtg-batch1-public-css';style.textContent=`
.full-arrangement-benefits{grid-template-columns:1fr 1fr!important}
.full-arrangement-benefits span:last-child{grid-column:1/-1}
.gtg-batch1-compare{display:inline-flex!important;align-items:center;justify-content:center;margin-top:12px!important;text-decoration:none}
.gtg-batch1-set-up-note{margin:12px auto 0;max-width:290px;color:#74686f;font-size:11px;line-height:1.45}
@media(max-width:600px){.full-arrangement-benefits{grid-template-columns:1fr!important}.full-arrangement-benefits span:last-child{grid-column:auto}.gtg-batch1-set-up-note{font-size:10.5px}}
`;document.head.appendChild(style);
apply();new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();
