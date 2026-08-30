/* GTG media quality: use generated thumbnails; never synthesize full-size grid images. */
(()=>{
'use strict';
if(window.__GTG_MEDIA_QUALITY_FIX__)return;window.__GTG_MEDIA_QUALITY_FIX__=true;
let timer=0;
function tune(){clearTimeout(timer);timer=setTimeout(()=>{[...document.querySelectorAll('[data-panel="evidence"] .gallery .gtg-mobile-media-tile img')].forEach((image,index)=>{image.decoding='async';image.loading=index<12?'eager':'lazy';try{image.fetchPriority=index<6?'high':'auto'}catch{}})},20)}
tune();const observer=new MutationObserver(tune);observer.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('pageshow',tune);
})();

