/* GTG media flow refinement: one priority policy; gestures and comments have single owners. */
(()=>{
'use strict';
if(window.__GTG_MEDIA_FLOW_REFINEMENT__)return;window.__GTG_MEDIA_FLOW_REFINEMENT__=true;
let timer=0;
function applyPriority(){
 clearTimeout(timer);timer=setTimeout(()=>{
  [...document.querySelectorAll('[data-panel="evidence"] .gallery .gtg-mobile-media-tile')].forEach((tile,index)=>{
   const image=tile.matches?.('img')?tile:tile.querySelector('.gtg-mobile-media-primary,img');if(!image)return;
   image.decoding='async';image.loading=index<12?'eager':'lazy';try{image.fetchPriority=index<6?'high':'auto'}catch{}
  });
 },18);
}
function boot(){applyPriority();const observer=new MutationObserver(applyPriority);observer.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('pageshow',applyPriority)}
boot();
})();

