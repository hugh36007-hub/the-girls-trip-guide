/* Girls Plan copy: show "Accommodation" while preserving the stored booking kind "hotel". */
(()=>{
'use strict';
if(window.__GTG_BOOKING_COPY__)return;
window.__GTG_BOOKING_COPY__=true;

function relabel(root=document){
 const select=root.querySelector?.('#bookingForm select[name="kind"]')||document.querySelector('#bookingForm select[name="kind"]');
 if(select){
  const option=[...select.options].find(o=>o.value==='hotel'||o.textContent.trim().toLowerCase()==='hotel');
  if(option){option.value='hotel';option.textContent='accommodation'}
 }
 const input=root.querySelector?.('#bookingForm input[name="hotel"]')||document.querySelector('#bookingForm input[name="hotel"]');
 const label=input?.closest('.field')?.querySelector('label');
 if(label)label.textContent='Accommodation';
}

relabel();
const modal=document.getElementById('modalRoot');
if(modal)new MutationObserver(()=>relabel(modal)).observe(modal,{childList:true,subtree:true});
})();
