/* Girls Trip Guide — user-facing wording refinement plus Evidence badge ownership guard.
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

/* Auth/trip-picker card only: mirror the approved public-header logo assets. */
function syncApprovedAuthLogo(){
  const link=document.querySelector('.auth-screen .auth-card>a:first-child');
  const img=link?.querySelector('img');
  if(!link||!img)return;
  const src=img.getAttribute('src')||'';
  if(!/girls-trip-guide-logo\.(?:webp|png)(?:[?#].*)?$/i.test(src))return;
  link.innerHTML='<picture class="gtg-approved-auth-logo"><source media="(max-width:700px)" srcset="/assets/images/hero-trans-mobile.webp" type="image/webp"><img src="/assets/images/hero-trans.png" alt="The Girls Trip Guide — Good Plans. Better Stories." loading="eager" decoding="async"></picture>';
}

function evidenceTripId(){return new URL(location.href).searchParams.get('trip_id')||''}
function evidenceSeenKey(){const id=evidenceTripId();return id?`gtg-evidence-seen-count:${id}`:''}
function evidenceOpen(){return Boolean(document.querySelector('[data-panel="evidence"].active')||document.querySelector('nav.dock button[data-tab="evidence"]')?.classList.contains('active'))}
function readEvidenceSeen(){const key=evidenceSeenKey();if(!key)return null;try{const raw=localStorage.getItem(key);return raw===null?null:Math.max(0,Number(raw)||0)}catch{return null}}
function writeEvidenceSeen(value){const key=evidenceSeenKey();if(!key)return;try{localStorage.setItem(key,String(Math.max(0,Number(value)||0)))}catch{}}
function installEvidenceBadgeStyle(){
  if(document.getElementById('gtg-global-evidence-badge-style'))return;
  const style=document.createElement('style');style.id='gtg-global-evidence-badge-style';style.textContent=`
.dock.gtg-option7 button[data-tab="evidence"][data-unseen-evidence]::before{content:attr(data-unseen-evidence);position:absolute;top:-3px;right:4px;z-index:4;min-width:20px;height:20px;padding:0 5px;border-radius:999px;display:grid;place-items:center;background:var(--pink2,#ff83c1);color:#160a10;font:900 10px/1 Inter,sans-serif;box-shadow:0 5px 14px rgba(0,0,0,.35)}
.dock.gtg-option7.is-compact button[data-tab="evidence"][data-unseen-evidence]::before{top:-5px;right:0}`;
  document.head.appendChild(style);
}
function syncEvidenceBadge(){
  const button=document.querySelector('nav.dock button[data-tab="evidence"]');if(!button)return;
  const legacy=button.querySelector('.gtg-dock-badge');
  const legacyTotal=legacy?Math.max(0,Number.parseInt(legacy.textContent||'0',10)||0):0;
  const statTotal=Math.max(0,Number(document.querySelector('.stat[data-tab="evidence"] b')?.textContent)||0);
  const total=Math.max(statTotal,legacyTotal);
  legacy?.remove();
  if(!evidenceTripId()){delete button.dataset.unseenEvidence;return}
  if(evidenceOpen()){
    writeEvidenceSeen(total);
    delete button.dataset.unseenEvidence;
    return;
  }
  const seen=readEvidenceSeen();
  if(seen===null){
    writeEvidenceSeen(total);
    delete button.dataset.unseenEvidence;
    return;
  }
  const unseen=Math.max(0,total-seen);
  if(unseen)button.dataset.unseenEvidence=String(Math.min(99,unseen));else delete button.dataset.unseenEvidence;
}
function markEvidenceSeen(){
  const button=document.querySelector('nav.dock button[data-tab="evidence"]');
  if(!button)return;
  const legacy=button.querySelector('.gtg-dock-badge');
  const legacyTotal=legacy?Math.max(0,Number.parseInt(legacy.textContent||'0',10)||0):0;
  const statTotal=Math.max(0,Number(document.querySelector('.stat[data-tab="evidence"] b')?.textContent)||0);
  writeEvidenceSeen(Math.max(statTotal,legacyTotal));
  legacy?.remove();
  delete button.dataset.unseenEvidence;
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
  installEvidenceBadgeStyle();
  replaceExactText(document);
  removeHeroControls(document);
  syncApprovedAuthLogo();
  syncEvidenceBadge();
  document.querySelectorAll('.gtg-immersive-media-host').forEach(refineViewer);
}

// Obsolete hero actions are user-invisible and cannot be invoked through stale UI.
document.addEventListener('click',event=>{
  if(event.target.closest?.('[data-tab="evidence"]'))markEvidenceSeen();
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
window.addEventListener('popstate',schedule);
window.addEventListener('pageshow',schedule);
window.addEventListener('focus',schedule);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refine,{once:true});else refine();
})();