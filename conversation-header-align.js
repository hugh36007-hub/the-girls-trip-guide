(()=>{
'use strict';
if(window.__TRIP_CHAT_HEADER_ALIGN__)return;window.__TRIP_CHAT_HEADER_ALIGN__=true;
function align(){
  const social=document.querySelector('[data-gtg-trip-social]');if(!social)return;
  const head=social.querySelector('.gtg-social-head');
  const open=social.querySelector('[data-gtg-convo-open]');
  const eyebrow=head?.querySelector('.eyebrow');
  if(!head||!open||!eyebrow)return;
  let row=head.querySelector('.trip-chat-topline');
  if(!row){row=document.createElement('div');row.className='trip-chat-topline';eyebrow.parentNode.insertBefore(row,eyebrow);row.appendChild(eyebrow)}
  if(open.parentNode!==row)row.appendChild(open);
  const titleRow=social.querySelector('.gtg-convo-title-row');
  if(titleRow){const h3=titleRow.querySelector('h3');if(h3&&titleRow.parentNode){titleRow.parentNode.insertBefore(h3,titleRow);titleRow.remove()}}
}
const style=document.createElement('style');style.textContent=`
.gtg-social-head>div:first-child{min-width:0;flex:1}.trip-chat-topline{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin-bottom:5px}.trip-chat-topline .eyebrow{margin:0}.trip-chat-topline .gtg-convo-open{flex:0 0 auto;margin-left:auto;min-height:34px;padding:0 13px}.gtg-social-head h3{margin-top:0!important}
@media(max-width:600px){.gtg-social-head{display:block}.gtg-social-head>div:first-child{width:100%}.trip-chat-topline{width:100%}.gtg-social-tabs{margin-top:12px}}
`;document.head.appendChild(style);
const mo=new MutationObserver(align);mo.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});align();
})();
