/* Content-only refinement for Grace's Convince Me answer. No route or data changes. */
(()=>{
'use strict';
if(window.__GTG_GRACE_CONVINCE_V2__)return;
window.__GTG_GRACE_CONVINCE_V2__=true;

const copy=`<img src="assets/images/grace.webp" alt="Grace"><div class="gtg-b1-grace-copy"><div class="eyebrow">Grace's answer</div><h3>Right. Let me put it properly.</h3><p>By the Monday after the trip, the best bits are already scattered across six different phones. One person has the only video worth keeping. Someone else has 84 nearly identical photos and says, <strong>“I’ll send them later.”</strong> She won’t.</p><p>Then WhatsApp gets involved. Photos get compressed, videos disappear into old chats, and six months from now you’re scrolling through thousands of unrelated pictures trying to remember who had the good ones. Give it a couple of years, change a phone or two, and half the trip may as well never have happened.</p><p><strong>You didn’t organise all this to remember the flight number. You organised it for the moments that made the trip worth taking.</strong></p><p>Full Trip keeps those moments together while everyone still has them. The GALS keep the group moving, everyone can upload into the same private trip, Official Version keeps the shared record together, and Hidden Gallery keeps the other material separate.</p><p>You’ve got 12 months from activation to get it all together. Before that window closes, the organiser downloads the full album and keeps or shares that copy independently. After that, you’re not relying on us to store it forever — you’ve got the trip in your own hands.</p><p><strong>£24.99 is not really for storage. It is for not losing the trip after you’ve already spent hundreds or thousands making it happen.</strong></p><p>Still not convinced? Go back to the last trip worth remembering and try rebuilding it from WhatsApp, camera rolls and “I’ll send them later.” Then tell me you don’t see the point.</p></div>`;

function strengthen(){
  const panel=document.querySelector('.gtg-b1-grace');
  if(!panel||panel.dataset.copyV2==='1')return;
  panel.dataset.copyV2='1';
  panel.innerHTML=copy;
}

const style=document.createElement('style');
style.textContent=`.gtg-b1-grace[data-copy-v2="1"] .gtg-b1-grace-copy p{font-size:13px!important;line-height:1.58!important;margin:0 0 12px!important}.gtg-b1-grace[data-copy-v2="1"] .gtg-b1-grace-copy p:last-child{margin-bottom:0!important}.gtg-b1-grace[data-copy-v2="1"] .gtg-b1-grace-copy strong{color:#24171e}.gtg-b1-grace[data-copy-v2="1"] img{height:100%;min-height:420px;max-height:560px;object-position:center top}@media(max-width:700px){.gtg-b1-grace[data-copy-v2="1"] img{height:300px;min-height:0;max-height:none;object-fit:contain}}`;
document.head.appendChild(style);

document.addEventListener('click',event=>{
  if(!event.target.closest?.('[data-gtg-convince]'))return;
  strengthen();
  setTimeout(strengthen,0);
},false);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(strengthen,0),{once:true});
else setTimeout(strengthen,0);
})();
