/* Girls Trip Guide — user-facing wording refinement only.
   No entitlement, role, payment, storage, auth or Hidden Gallery behaviour changes. */
(()=>{
'use strict';
if(window.__GTG_USER_FACING_WORDING_V1__)return;
window.__GTG_USER_FACING_WORDING_V1__=true;

const exactText=new Map([
  ['GALS settings','Grace & the GALS'],
  ['GALS communications','Grace & the GALS'],
  ['Character and reminder preferences','Characters, reminders and message controls'],
  ['GALS settings saved.','Message settings saved.'],
  ['GALS communications saved.','Message settings saved.']
]);

function replaceExactText(root){
  if(!root?.querySelectorAll)return;
  root.querySelectorAll('h1,h2,h3,h4,p,small,span,b,label,button').forEach(el=>{
    if(el.children.length)return;
    const current=(el.textContent||'').trim();
    const next=exactText.get(current);
    if(next&&current!==next)el.textContent=next;
  });
}

function removeHeroControls(root){
  if(!root?.querySelectorAll)return;
  root.querySelectorAll('[data-a="tripAppearance"],[data-a="setMediaHero"],.gtg-change-hero,.gtg-set-hero').forEach(el=>el.remove());
}

function refineViewer(host){
  const shadow=host?.shadowRoot;if(!shadow||host.dataset.wordingRefined==='1')return;
  host.dataset.wordingRefined='1';
  const apply=()=>{
    const menu=shadow.querySelector('.menu');if(!menu)return;
    [...menu.querySelectorAll('button')].forEach(btn=>{
      const text=(btn.textContent||'').trim();
      if(text==='Use as trip hero'){
        btn.remove();
        return;
      }
      if(text==='Remove media'){
        const current=shadow.querySelector('.slide.current .media');
        btn.textContent=current?.tagName==='VIDEO'?'Remove video':'Remove photo';
      }
    });
  };
  apply();
  new MutationObserver(apply).observe(shadow,{childList:true,subtree:true,characterData:true});
}

function refine(){
  replaceExactText(document);
  removeHeroControls(document);
  document.querySelectorAll('.gtg-immersive-media-host').forEach(refineViewer);
}

// Obsolete hero actions are user-invisible and cannot be invoked through stale UI.
document.addEventListener('click',event=>{
  if(!event.target.closest?.('[data-a="tripAppearance"],[data-a="setMediaHero"],.gtg-change-hero,.gtg-set-hero'))return;
  event.preventDefault();
  event.stopImmediatePropagation();
},true);

let queued=false;
const schedule=()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;refine()});
};
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refine,{once:true});else refine();
})();
