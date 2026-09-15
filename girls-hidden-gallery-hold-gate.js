/* Girls Trip Guide — only allow the 4-second Hidden Gallery hold after Latest Photo is expanded. */
(()=>{
'use strict';
if(window.__GTG_HIDDEN_GALLERY_HOLD_GATE__)return;
window.__GTG_HIDDEN_GALLERY_HOLD_GATE__=true;

function photoTarget(event){
 return event.target.closest?.('.dashboard[data-home-composition="full"] .live-snapshot-hero .live-photo-block');
}
function isExpanded(photo){
 return Boolean(photo?.closest('.live-snapshot-hero')?.querySelector('.live-snapshot-bottom')?.classList.contains('is-photo-focused'));
}
function updateLabel(){
 document.querySelectorAll('.dashboard[data-home-composition="full"] .live-snapshot-hero .live-photo-open').forEach(open=>{
  open.setAttribute('aria-label','Tap once to expand photo. Then press and hold the expanded photo for 4 seconds to open Hidden Gallery. Tap the expanded photo normally to open Evidence.');
 });
}

window.addEventListener('pointerdown',event=>{
 if(event.pointerType==='mouse'&&event.button!==0)return;
 const photo=photoTarget(event);
 if(!photo||event.target.closest?.('.live-photo-add')||isExpanded(photo))return;
 // Let the normal click expand Latest Photo, but block the long-hold timer until it is expanded.
 event.stopImmediatePropagation();
 updateLabel();
},{capture:true,passive:true});

document.addEventListener('click',event=>{
 if(photoTarget(event))queueMicrotask(updateLabel);
},true);
window.addEventListener('pageshow',()=>setTimeout(updateLabel,80));
window.addEventListener('gtg:core-data-ready',()=>setTimeout(updateLabel,80));
setTimeout(updateLabel,120);
})();
