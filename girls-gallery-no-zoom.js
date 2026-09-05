/* Girls Evidence: deliberately disable photo pinch/double-tap zoom while preserving normal gallery swipe navigation. */
(()=>{
'use strict';
if(window.__GTG_GALLERY_NO_ZOOM__)return;window.__GTG_GALLERY_NO_ZOOM__=true;
function media(host){return host?.shadowRoot?.querySelector('.slide.current .media')||null}
function reset(host){const m=media(host);if(!m||m.tagName==='VIDEO')return;m.style.transform='';m.style.transformOrigin='';m.classList.remove('zoomed')}
function stop(event){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}
function install(host){
 if(!host||host.dataset.gtgNoZoom==='1')return;host.dataset.gtgNoZoom='1';let multi=false;
 host.addEventListener('touchstart',event=>{if(event.touches.length>1){multi=true;stop(event);reset(host)}},{capture:true,passive:false});
 host.addEventListener('touchmove',event=>{if(multi||event.touches.length>1){multi=true;stop(event);reset(host)}},{capture:true,passive:false});
 host.addEventListener('touchend',event=>{if(!multi)return;stop(event);reset(host);if(!event.touches.length)multi=false},{capture:true,passive:false});
 host.addEventListener('touchcancel',event=>{if(multi)stop(event);multi=false;reset(host)},{capture:true,passive:false});
 host.addEventListener('dblclick',event=>{stop(event);reset(host)},{capture:true,passive:false});
 for(const type of ['gesturestart','gesturechange','gestureend'])host.addEventListener(type,event=>{stop(event);reset(host)},{capture:true,passive:false});
 host.addEventListener('gtg:viewer-media-change',()=>reset(host));reset(host)
}
function scan(){document.querySelectorAll('.gtg-immersive-media-host').forEach(install)}
const observer=new MutationObserver(scan);function boot(){observer.observe(document.body,{childList:true,subtree:true});scan()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
