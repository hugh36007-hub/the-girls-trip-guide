(() => {
'use strict';

function tripTier(){
  const eyebrow=document.querySelector('.hero-card .eyebrow');
  const text=String(eyebrow?.textContent||'').trim().toLowerCase();
  if(text.includes('full trip')) return 'full';
  if(text.includes('free trip')) return 'free';
  return 'unknown';
}

function enforceDrawerEntitlements(){
  if(tripTier()!=='free') return;
  const drawer=document.getElementById('drawerRoot');
  if(!drawer) return;
  drawer.querySelectorAll('[data-a="settings"]').forEach(button=>button.remove());
}

const drawer=document.getElementById('drawerRoot');
if(drawer){
  new MutationObserver(enforceDrawerEntitlements).observe(drawer,{childList:true,subtree:true});
}

document.addEventListener('click',event=>{
  const settings=event.target.closest?.('[data-a="settings"]');
  if(!settings||tripTier()!=='free') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  settings.remove();
},true);
})();
