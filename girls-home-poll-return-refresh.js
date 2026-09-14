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

/*
The core trip app changes tabs without a popstate event. The Home social hub already
re-queries poll state when Home renders; removing the stale nodes at navigation time
prevents a closed poll from being painted while that fresh query completes.
*/
document.addEventListener('click',event=>{
 const tab=event.target.closest?.('[data-tab]');
 if(!tab)return;
 clearPollUi();
},false);

installCompactPollStyle();
})();
