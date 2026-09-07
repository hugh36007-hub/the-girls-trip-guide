/* After a normal website OTP sign-in, skip the trip picker when there is only one Girls trip. */
(()=>{
'use strict';
if(window.__GTG_DIRECT_LOGIN_ROUTE__)return;window.__GTG_DIRECT_LOGIN_ROUTE__=true;
const KEY='gtg-direct-after-otp';
const app=document.getElementById('app');
if(!app)return;
function arm(){sessionStorage.setItem(KEY,String(Date.now()))}
function clear(){sessionStorage.removeItem(KEY)}
function armed(){const started=Number(sessionStorage.getItem(KEY)||0);if(!started)return false;if(Date.now()-started>45000){clear();return false}return true}
function routeIfReady(){if(!armed())return false;const picker=app.querySelector('.trip-list');if(!picker)return false;const trips=[...picker.querySelectorAll('[data-trip]')];if(trips.length===1){clear();trips[0].click();return true}clear();return false}
document.addEventListener('submit',event=>{const form=event.target;if(!(form instanceof HTMLFormElement)||form.id!=='otpForm')return;const intent=form.querySelector('[name="intent"]')?.value||'signin';if(intent==='signin')arm();else clear()},true);
const observer=new MutationObserver(()=>routeIfReady());observer.observe(app,{childList:true,subtree:true});routeIfReady();window.addEventListener('pagehide',clear,{once:true});
})();
(()=>{if(document.querySelector('script[data-gtg-batch1]'))return;const s=document.createElement('script');s.src='/girls-batch1-parity.js?v=20260907-1';s.async=false;s.dataset.gtgBatch1='1';document.head.appendChild(s)})();
