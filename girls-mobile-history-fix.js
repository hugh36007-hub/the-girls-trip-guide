/* Mobile browser history: keep Android Back inside the trip and close open modals first. */
(()=>{
'use strict';
if(window.__GTG_MOBILE_HISTORY_FIX__)return;window.__GTG_MOBILE_HISTORY_FIX__=true;
const modal=document.getElementById('modalRoot');
let modalWasOpen=Boolean(modal?.classList.contains('open'));
function sameTrip(a,b){try{const x=new URL(a),y=new URL(b);return x.origin===y.origin&&x.pathname===y.pathname&&x.searchParams.get('trip_id')===y.searchParams.get('trip_id')}catch{return false}}
function appState(extra={}){return {...(history.state||{}),gtgApp:true,...extra}}

document.addEventListener('click',event=>{
 const tab=event.target.closest?.('[data-tab]');if(!tab)return;
 const before=location.href;
 setTimeout(()=>{
  const after=location.href;if(before===after||!sameTrip(before,after))return;
  const previous=new URL(before),next=new URL(after);
  history.replaceState(appState({gtgTab:previous.searchParams.get('action')||'overview'}),'',previous);
  history.pushState(appState({gtgTab:next.searchParams.get('action')||'overview'}),'',next);
 },0);
},true);

function syncModalHistory(){
 if(!modal)return;
 const open=modal.classList.contains('open');
 if(open&&!modalWasOpen&&!history.state?.gtgModal){history.pushState(appState({gtgModal:true}),'',location.href)}
 else if(!open&&modalWasOpen&&history.state?.gtgModal){history.back()}
 modalWasOpen=open;
}
if(modal)new MutationObserver(syncModalHistory).observe(modal,{attributes:true,attributeFilter:['class'],childList:true});

window.addEventListener('popstate',()=>{
 if(modal?.classList.contains('open')){
  modal.classList.remove('open');
  modal.innerHTML='';
  modalWasOpen=false;
 }
});
})();
