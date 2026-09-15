/* Ensure Girls FX expenses loads only after Supabase is ready on mobile browsers. */
(()=>{
'use strict';
if(window.__GTG_FX_EXPENSES_BOOTSTRAP__)return;window.__GTG_FX_EXPENSES_BOOTSTRAP__=true;
const SRC='/girls-fx-expenses.js?v=3';
let timer=0,attempts=0;
function loaded(){return Boolean(window.__GTG_FX_EXPENSES__)}
function load(){
 if(loaded())return true;
 if(!window.supabase?.createClient)return false;
 if(document.querySelector(`script[src="${SRC}"]`))return true;
 const script=document.createElement('script');
 script.src=SRC;
 script.async=false;
 script.dataset.gtgFxCore='1';
 (document.body||document.head||document.documentElement).appendChild(script);
 return true;
}
function ensure(){
 clearTimeout(timer);
 if(load())return;
 attempts+=1;
 if(attempts<100)timer=setTimeout(ensure,100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
window.addEventListener('pageshow',()=>{attempts=0;ensure()});
document.addEventListener('pointerdown',event=>{
 if(!event.target.closest?.('[data-tab="money"],[data-role-money],[data-a="addExpense"],[data-a="editTrip"],[data-a="drawer"]'))return;
 attempts=0;ensure();
},{capture:true,passive:true});
})();