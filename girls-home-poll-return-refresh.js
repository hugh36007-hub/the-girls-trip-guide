/* Clear stale Home poll UI before re-entering Home so closed polls cannot flash. */
(()=>{
'use strict';
if(window.__GTG_HOME_POLL_RETURN_REFRESH__)return;
window.__GTG_HOME_POLL_RETURN_REFRESH__=true;

const POLL_SELECTOR='.gtg-home-poll-v3,.gtg-home-score-v3,.gtg-home-poll-v2,.gtg-home-score-v2,.gtg-poll-hero-alert,.gtg-poll-alert';
function clearPollUi(){document.querySelectorAll(POLL_SELECTOR).forEach(node=>node.remove())}
function installCompactPollStyle(){
 if(document.getElementById('gtg-home-poll-compact-css'))return;
 const style=document.createElement('style');
 style.id='gtg-home-poll-compact-css';
 style.textContent='@media(max-width:700px) and (max-height:700px){.gtg-home-poll-v3{padding:10px 12px 12px!important;min-height:0!important;height:auto!important}}';
 document.head.appendChild(style);
}
function refreshHomeAfterNavigation(){
 setTimeout(()=>{
  const current=new URL(location.href).searchParams.get('action')||'overview';
  if(current!=='overview')return;
  const app=document.getElementById('app');
  if(!app)return;
  /* The Home social hub observes direct app child changes. A zero-layout comment
     gives it one deterministic post-navigation refresh after the Home dataset is ready. */
  const marker=document.createComment('gtg-home-poll-return-refresh');
  app.appendChild(marker);
  marker.remove();
 },80);
}

/*
The core trip app changes tabs without a popstate event. Clear stale poll nodes at
navigation time, then give Home one deterministic refresh after its DOM has settled.
*/
document.addEventListener('click',event=>{
 const tab=event.target.closest?.('[data-tab]');
 if(!tab)return;
 clearPollUi();
 if(tab.dataset.tab==='overview')refreshHomeAfterNavigation();
},false);

installCompactPollStyle();
})();
