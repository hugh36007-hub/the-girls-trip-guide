/* Girls Web Push opt-in. Permission is requested only after an explicit user action. */
(()=>{
'use strict';
if(window.__GTG_PUSH_NOTIFICATIONS__)return;window.__GTG_PUSH_NOTIFICATIONS__=true;
const VAPID_PUBLIC='BBOvE39Xoa64X0oWNOAkUHAdaXvVxJ659yxEUipBEiLVisNIQqabKrnMoptXxGWnr9SG8-QMp8b0r-hHrtixoxg';
const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const ENDPOINT=`${SUPABASE_URL}/functions/v1/push-register`,PRODUCT='girls',PREF='gtg-push-optin-v1',FIRST_PROMPT='gtg-push-first-arrival-prompt-v1';
let client=null;
const supported=()=>('Notification'in window)&&('serviceWorker'in navigator)&&('PushManager'in window);
const keyBytes=value=>{const padding='='.repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out};
function db(){if(client)return client;if(!window.supabase?.createClient)return null;client=window.supabase.createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
async function session(){const c=db();if(!c)return null;try{return (await c.auth.getSession()).data?.session||null}catch{return null}}
async function post(action,subscription){
 const s=await session();if(!s?.access_token)throw new Error('Sign in required.');
 const data=subscription.toJSON(),keys=data.keys||{};
 const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${s.access_token}`},body:JSON.stringify({action,product_key:PRODUCT,platform:'web',provider:'webpush',endpoint:subscription.endpoint,p256dh:keys.p256dh||null,auth:keys.auth||null})});
 const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||'Notification registration failed.');return result;
}
async function current(){if(!supported())return null;const registration=await navigator.serviceWorker.ready;return registration.pushManager.getSubscription()}
async function enable(){
 if(!supported())throw new Error('Push notifications are not supported on this device.');
 const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
 if(permission!=='granted')throw new Error(permission==='denied'?'Notifications are blocked in browser settings.':'Notifications were not enabled.');
 const registration=await navigator.serviceWorker.ready;
 let subscription=await registration.pushManager.getSubscription();
 if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(VAPID_PUBLIC)});
 await post('register',subscription);localStorage.setItem(PREF,'1');return subscription;
}
async function disable(){const subscription=await current();if(subscription){try{await post('unregister',subscription)}catch(error){console.warn('[GTG push] unregister failed',error)}await subscription.unsubscribe().catch(()=>{})}localStorage.removeItem(PREF)}
function statusText(subscription){if(!supported())return'Not supported on this device';if(Notification.permission==='denied')return'Blocked in browser settings';return subscription&&localStorage.getItem(PREF)==='1'?'On for this device':'Off'}
async function refresh(root){const status=root?.querySelector('[data-gtg-push-status]'),button=root?.querySelector('[data-gtg-push-toggle]');if(!status||!button)return;const subscription=await current().catch(()=>null),on=Boolean(subscription&&localStorage.getItem(PREF)==='1');status.textContent=statusText(subscription);button.textContent=on?'Turn off notifications':'Turn on notifications';button.disabled=!supported()||Notification.permission==='denied';button.dataset.pushOn=on?'1':'0'}
function decorateProfile(){
 const form=document.querySelector('#profileForm');if(!form||form.querySelector('[data-gtg-push-settings]'))return false;
 const actions=form.querySelector('.form-actions, .actions, [data-profile-actions]'),section=document.createElement('div');section.className='field';section.dataset.gtgPushSettings='1';section.innerHTML='<label>Push notifications</label><p class="field-note">Get trip updates on this device. Notifications are only enabled when you choose them.</p><button class="ghost" type="button" data-gtg-push-toggle>Turn on notifications</button><small class="field-note" data-gtg-push-status>Checking…</small>';
 if(actions)form.insertBefore(section,actions);else form.append(section);void refresh(section);return true;
}
async function silentRefresh(){if(!supported()||Notification.permission!=='granted'||localStorage.getItem(PREF)!=='1')return;try{const subscription=await current();if(subscription)await post('register',subscription)}catch(error){console.warn('[GTG push] refresh failed',error)}}
function firstPromptSeen(){try{return localStorage.getItem(FIRST_PROMPT)==='1'}catch{return false}}
function markFirstPromptSeen(){try{localStorage.setItem(FIRST_PROMPT,'1')}catch{}}
function installFirstPromptStyle(){
 if(document.getElementById('gtg-first-push-prompt-css'))return;
 const style=document.createElement('style');style.id='gtg-first-push-prompt-css';style.textContent=`
.gtg-first-push{position:fixed;inset:0;z-index:2147482999;display:grid;place-items:center;padding:20px;background:rgba(20,10,17,.52);backdrop-filter:blur(4px)}
.gtg-first-push__card{width:min(420px,100%);border:1px solid rgba(255,79,163,.28);border-radius:20px;background:#fff;color:#191316;padding:22px;box-shadow:0 24px 70px rgba(36,17,28,.24);font-family:Inter,system-ui,sans-serif}
.gtg-first-push__icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:#fff0f7;color:#ed2f8b;font-size:24px;margin-bottom:14px}
.gtg-first-push__card h2{margin:0 0 8px;font-size:22px;line-height:1.15;color:#191316}
.gtg-first-push__card p{margin:0;color:#6c5962;font-size:13px;line-height:1.5}
.gtg-first-push__actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px}
.gtg-first-push button{border:0;border-radius:999px;padding:10px 14px;font:800 12px/1 Inter,system-ui,sans-serif;cursor:pointer}
.gtg-first-push [data-first-push-later]{background:#f5edf1;color:#5d4853}
.gtg-first-push [data-first-push-enable]{background:#ff4fa3;color:#fff}
.gtg-first-push button:disabled{opacity:.55;cursor:wait}
.gtg-first-push__status{display:block;min-height:18px;margin-top:10px;color:#a23a6f;font-size:11px}
`;document.head.appendChild(style)
}
function closeFirstPrompt(root){root?.remove()}
async function showFirstArrivalPrompt(){
 if(window.GTG_NATIVE||firstPromptSeen()||localStorage.getItem(PREF)==='1'||!supported())return false;
 markFirstPromptSeen();installFirstPromptStyle();
 const denied=Notification.permission==='denied',root=document.createElement('div');root.className='gtg-first-push';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Turn on trip notifications');
 root.innerHTML=`<section class="gtg-first-push__card"><div class="gtg-first-push__icon" aria-hidden="true">🔔</div><h2>Turn on trip notifications?</h2><p>${denied?'Notifications are currently blocked in your browser settings. Turn them on there so you do not miss trip updates and reminders.':'Get trip updates, reminders and important changes on this device. You can turn notifications off later in My details.'}</p><small class="gtg-first-push__status" data-first-push-status></small><div class="gtg-first-push__actions"><button type="button" data-first-push-later>${denied?'Close':'Not now'}</button>${denied?'':'<button type="button" data-first-push-enable>Turn on notifications</button>'}</div></section>`;
 document.body.appendChild(root);
 root.querySelector('[data-first-push-later]')?.addEventListener('click',()=>closeFirstPrompt(root),{once:true});
 const button=root.querySelector('[data-first-push-enable]'),status=root.querySelector('[data-first-push-status]');
 if(button)button.addEventListener('click',()=>{button.disabled=true;status.textContent='Turning notifications on…';void enable().then(()=>{status.textContent='Notifications are on.';setTimeout(()=>closeFirstPrompt(root),450)}).catch(error=>{status.textContent=error?.message||'Notifications could not be enabled.';button.disabled=false})},{once:true});
 return true
}
function scheduleProfileCheck(){[0,80,240,600].forEach(ms=>setTimeout(()=>decorateProfile(),ms))}
window.addEventListener('gtg:dashboard-tour-finished',event=>{if(event.detail?.kind==='first')setTimeout(()=>void showFirstArrivalPrompt(),100)});
document.addEventListener('click',event=>{const toggle=event.target.closest?.('[data-gtg-push-toggle]');if(toggle){event.preventDefault();const root=toggle.closest('[data-gtg-push-settings]');toggle.disabled=true;const run=toggle.dataset.pushOn==='1'?disable():enable();void run.catch(error=>{const toast=document.getElementById('toast');if(toast){toast.textContent=error?.message||'Notifications could not be changed.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200)}}).finally(()=>void refresh(root));return}scheduleProfileCheck()},true);
window.addEventListener('pageshow',()=>{scheduleProfileCheck();void silentRefresh()},{once:true});
scheduleProfileCheck();
})();
