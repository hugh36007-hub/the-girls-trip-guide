/* Girls Trip Guide — discreet Hidden Gallery Home-only view entry and runtime guard. */
(()=>{
'use strict';
if(window.__GTG_HIDDEN_GALLERY_INTRO__)return;
window.__GTG_HIDDEN_GALLERY_INTRO__=true;

const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000)};

function stripDirectEntries(){
 document.querySelectorAll('#drawerRoot [data-a="vault"]').forEach(button=>button.remove());
 // Remove any stale duplicate explainer left in the DOM by an older cached build.
 document.querySelectorAll('[data-hidden-gallery-intro]').forEach(box=>box.remove());
}

function photoTarget(event){
 return event.target.closest?.('.dashboard[data-home-composition="full"] .live-snapshot-hero .live-photo-block');
}
function updatePhotoLabel(){
 document.querySelectorAll('.dashboard[data-home-composition="full"] .live-snapshot-hero .live-photo-open').forEach(open=>{
   open.setAttribute('aria-label','Tap once to expand photo. Then press and hold the expanded photo for 4 seconds and release to open Hidden Gallery. Tap the expanded photo normally to open Evidence.');
 });
}

function install(){
 stripDirectEntries();
 updatePhotoLabel();
}

function schedule(){[0,80,240,650].forEach(ms=>setTimeout(install,ms))}


document.addEventListener('click',event=>{
 const direct=event.target.closest?.('[data-a="vault"]');
 if(direct&&!direct.hidden){
   event.preventDefault();
   event.stopImmediatePropagation();
   stripDirectEntries();
   toast('Hidden Gallery: on Home, tap Latest Photo once, then hold the expanded photo for 4 seconds.');
   return;
 }

 if(photoTarget(event))queueMicrotask(updatePhotoLabel);
 if(event.target.closest?.('[data-a="drawer"],[data-tab]'))setTimeout(()=>{stripDirectEntries();install()},0);
},true);

window.addEventListener('popstate',schedule);
window.addEventListener('pageshow',schedule);
window.addEventListener('gtg:core-data-ready',schedule);
schedule();
})();
