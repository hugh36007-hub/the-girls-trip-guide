/* Girls performance: defer noncritical social/chat/home-prime enhancements until first paint settles. */
(()=>{
'use strict';
if(window.__GTG_PERFORMANCE_LOADER__)return;window.__GTG_PERFORMANCE_LOADER__=true;
const scripts=[
 '/girls-trip-social.js?v=2',
 '/girls-chat-sheet.js?v=2',
 '/girls-media-social.js?v=1',
 '/girls-poll-nudge.js?v=1',
 '/girls-home-thumbnail-prime.js?v=1',
 '/evidence-intro-dismiss.js?v=1'
];
let started=false;
const visible=()=>document.visibilityState!=='hidden';
const idle=cb=>{'requestIdleCallback'in window?requestIdleCallback(cb,{timeout:1000}):setTimeout(cb,120)};
function loadScript(src){return new Promise(resolve=>{if(document.querySelector(`script[src="${src}"]`)){resolve();return}const s=document.createElement('script');s.src=src;s.async=false;s.dataset.gtgDeferred='1';s.onload=()=>resolve();s.onerror=()=>resolve();document.body.appendChild(s)})}
async function loadEnhancements(){
 if(started||!visible())return;started=true;
 for(const src of scripts){if(!visible()){started=false;return}await loadScript(src);await new Promise(r=>setTimeout(r,0))}
}
function schedule(){if(!visible())return;idle(()=>void loadEnhancements())}
if(document.readyState==='complete')setTimeout(schedule,70);else window.addEventListener('load',()=>setTimeout(schedule,70),{once:true});
document.addEventListener('visibilitychange',()=>{if(visible()&&!started)schedule()});
/* Immediate intent wins over idle scheduling. */
document.addEventListener('pointerdown',event=>{if(started)return;const target=event.target.closest?.('[data-tab="evidence"],[data-tab="group"],[data-trip-social-tab],[data-parity-comms]');if(target)void loadEnhancements()},{capture:true,passive:true});
})();
