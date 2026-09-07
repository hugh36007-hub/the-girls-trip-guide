/* Safe Batch 1 public parity. Static page only; no MutationObserver. */
(()=>{
'use strict';
if(window.__GTG_BATCH1_PUBLIC_SAFE__)return;
window.__GTG_BATCH1_PUBLIC_SAFE__=true;
const run=()=>{
  const path=location.pathname.replace(/\/+$/,'')||'/';
  if(path!=='/'&&path!=='/index.html')return;
  const full=document.querySelector('.full-arrangement');
  if(!full||full.dataset.batch1Safe==='1')return;
  full.dataset.batch1Safe='1';
  const copy=full.querySelector('.full-arrangement-copy');
  if(copy)copy.textContent='Same trip. Less chasing. The £24.99 one-off upgrade adds Grace and the GALS, automated trip nudges, stronger payment chasing, full photo and video uploads, both galleries and richer prompts before, during and after the trip.';
  const benefits=full.querySelector('.full-arrangement-benefits');
  if(benefits){
    benefits.replaceChildren(...[
      'Grace + automated trip communications',
      'Stronger payment nudges and chasing',
      'Full photo & video sharing',
      'Official Version + Hidden Gallery',
      'Richer prompts across the whole trip'
    ].map(text=>{const s=document.createElement('span');s.textContent=text;return s;}));
  }
  const price=full.querySelector('.full-arrangement-price');
  if(price){
    const primary=price.querySelector('a.pill');
    if(primary){primary.textContent='START WITH FULL TRIP →';primary.href='/create-trip';}
    if(!price.querySelector('[data-batch1-compare]')){
      const compare=document.createElement('a');
      compare.href='/free-vs-full';
      compare.className='gals-tease-button';
      compare.dataset.batch1Compare='1';
      compare.textContent='SEE FREE VS FULL →';
      const tease=price.querySelector('.gals-tease');
      tease?price.insertBefore(compare,tease):price.appendChild(compare);
    }
    if(!price.querySelector('[data-batch1-note]')){
      const note=document.createElement('p');
      note.dataset.batch1Note='1';
      note.textContent='Set the trip up first. The upgrade is then applied to that trip.';
      note.style.cssText='margin:12px auto 0;max-width:290px;color:#6c5962;font-size:11px;line-height:1.45';
      price.appendChild(note);
    }
  }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
