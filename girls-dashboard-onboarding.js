/* Girls Trip Guide — first-dashboard and Full Trip onboarding.
   Completion is stored in Supabase Auth user metadata with a per-account local fallback. */
(()=>{
'use strict';
if(window.__GTG_DASHBOARD_ONBOARDING_V1__)return;
window.__GTG_DASHBOARD_ONBOARDING_V1__=true;

const BASIC_KEY='gtg_dashboard_intro_v1';
const FULL_KEY='gtg_full_intro_v1';
let active=false,checking=false,highlighted=null,bodyOverflow='';

const basicSteps=[
  {title:'The Plan',copy:'Flights, stays, activities and travel documents live here. Keep the useful version in one place.',target:'[data-tab="plan"]'},
  {title:'Money',copy:'Track costs, booking splits and payment requests without digging back through the group chat.',target:'[data-tab="money"]'},
  {title:'The Group',copy:'See who is in, who is confirmed and the details that matter for everyone on the trip.',target:'[data-tab="group"]'},
  {title:'Evidence',copy:'This is where the trip record lives. Full Trip unlocks shared photos, video and the Hidden Gallery.',target:'[data-tab="evidence"]'}
];
const fullSteps=[
  {title:'Full Trip is live',copy:'The whole trip is unlocked: shared media, Grace and the GALS, richer prompts and 20 GB for 12 months.',target:'.dashboard'},
  {title:'Photos & video',copy:'Everyone can add the moments worth keeping. They stay together with the trip instead of disappearing into chats.',target:'[data-tab="evidence"]'},
  {title:'Hidden Gallery',copy:'Use the PIN-protected gallery for the photos and videos that should stay separate from the normal trip feed.',target:'[data-a="vault"]'},
  {title:'Grace & the GALS',copy:'Grace, Ava, Lola and Seb can now handle the nudges, reminders and messages that keep the trip moving.',target:'[data-a="drawer"]'}
];

function dashboard(){return document.querySelector('main.dashboard')}
function full(){return dashboard()?.dataset.homeComposition==='full'}
function client(){return window.GTGAuthClient||null}
function localKey(key,userId){return `${key}:${userId}`}
function localDone(key,userId){try{return localStorage.getItem(localKey(key,userId))==='1'}catch{return false}}
function markLocal(key,userId){try{localStorage.setItem(localKey(key,userId),'1')}catch{}}
function installStyles(){
  if(document.getElementById('gtg-dashboard-onboarding-style'))return;
  const style=document.createElement('style');style.id='gtg-dashboard-onboarding-style';style.textContent=`
.gtg-tour-backdrop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:18px;background:rgba(18,9,14,.74);backdrop-filter:blur(7px)}
.gtg-tour-card{width:min(470px,100%);max-height:min(690px,calc(100dvh - 36px));overflow:auto;border:1px solid rgba(255,79,163,.48);border-radius:24px;background:linear-gradient(145deg,#fff,#fff7fb);color:#21141b;box-shadow:0 28px 90px rgba(39,14,27,.34);padding:27px;font-family:Inter,Arial,sans-serif}
.gtg-tour-kicker{margin:0 0 10px;color:#ed2f8b;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.gtg-tour-card h2{margin:0;font:900 40px/.96 'Barlow Condensed',Inter,sans-serif;text-transform:uppercase;letter-spacing:-.018em}.gtg-tour-card p{margin:18px 0 0;color:#75636c;font-size:15px;line-height:1.6}.gtg-tour-progress{display:flex;align-items:center;gap:7px;margin-top:24px}.gtg-tour-progress i{width:7px;height:7px;border-radius:50%;background:#e6d8df}.gtg-tour-progress i.on{background:#ed2f8b}.gtg-tour-count{margin-left:auto;color:#9a8791;font-size:11px;font-weight:800}.gtg-tour-actions{display:grid;grid-template-columns:auto 1fr auto;gap:9px;margin-top:22px}.gtg-tour-actions button{min-height:44px;border-radius:12px;border:1px solid rgba(237,47,139,.24);background:#fff;color:#33212a;padding:0 14px;font-weight:800;cursor:pointer}.gtg-tour-actions .next{background:#ff4fa3;color:#fff;border-color:#ff4fa3}.gtg-tour-actions .skip{border-color:transparent;background:transparent;color:#9b8791;padding-left:0}.gtg-tour-target{position:relative!important;z-index:2147482999!important;outline:3px solid rgba(255,79,163,.92)!important;outline-offset:4px!important;box-shadow:0 0 0 7px rgba(255,79,163,.15)!important}
@media(max-width:600px){.gtg-tour-backdrop{place-items:end center;padding:10px}.gtg-tour-card{border-radius:20px;padding:22px 19px}.gtg-tour-card h2{font-size:36px}.gtg-tour-actions{grid-template-columns:1fr 1fr}.gtg-tour-actions .skip{grid-column:1/-1;grid-row:2;text-align:left}.gtg-tour-actions .back{grid-column:1}.gtg-tour-actions .next{grid-column:2}}
@media(prefers-reduced-motion:reduce){.gtg-tour-backdrop{backdrop-filter:none}}
`;
  document.head.appendChild(style);
}
function clearHighlight(){if(highlighted){highlighted.classList.remove('gtg-tour-target');highlighted=null}}
function highlight(selector){
  clearHighlight();if(!selector)return;
  const candidates=[...document.querySelectorAll(selector)].filter(el=>el.offsetParent!==null);
  highlighted=candidates[0]||null;if(highlighted)highlighted.classList.add('gtg-tour-target');
}
async function getUser(){
  const c=client();if(!c)return null;
  try{const {data}=await c.auth.getUser();return data?.user||null}catch{return null}
}
function metaDone(user,key){return Boolean(user?.user_metadata?.[key])||localDone(key,user?.id||'')}
async function markDone(user,key){
  if(!user?.id)return;markLocal(key,user.id);const c=client();if(!c)return;
  try{
    const next={...(user.user_metadata||{}),[key]:true};
    const {data,error}=await c.auth.updateUser({data:next});
    if(error)throw error;
    if(data?.user)user=data.user;
  }catch(error){console.warn('Dashboard onboarding completion will sync on a later session.',error)}
}
function showTour(kind,user){
  if(active)return;active=true;installStyles();
  const steps=kind==='full'?fullSteps:basicSteps,key=kind==='full'?FULL_KEY:BASIC_KEY;
  let index=0;
  const root=document.createElement('div');root.className='gtg-tour-backdrop';root.dataset.tourKind=kind;root.setAttribute('role','presentation');
  root.innerHTML='<section class="gtg-tour-card" role="dialog" aria-modal="true" aria-labelledby="gtg-tour-title"><div class="gtg-tour-kicker"></div><h2 id="gtg-tour-title"></h2><p class="gtg-tour-copy"></p><div class="gtg-tour-progress" aria-hidden="true"></div><div class="gtg-tour-actions"><button type="button" class="skip">Skip tour</button><button type="button" class="back">Back</button><button type="button" class="next">Next</button></div></section>';
  const kicker=root.querySelector('.gtg-tour-kicker'),title=root.querySelector('h2'),copy=root.querySelector('.gtg-tour-copy'),progress=root.querySelector('.gtg-tour-progress'),back=root.querySelector('.back'),next=root.querySelector('.next'),skip=root.querySelector('.skip');
  kicker.textContent=kind==='full'?'FULL TRIP · QUICK TOUR':'FIRST TIME HERE · QUICK TOUR';
  bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';document.body.appendChild(root);
  const render=()=>{
    const step=steps[index];title.textContent=step.title;copy.textContent=step.copy;back.disabled=index===0;next.textContent=index===steps.length-1?'Done':'Next';progress.innerHTML=steps.map((_,i)=>`<i class="${i===index?'on':''}"></i>`).join('')+`<span class="gtg-tour-count">${index+1} of ${steps.length}</span>`;highlight(step.target);next.focus({preventScroll:true});
  };
  const close=()=>{clearHighlight();root.remove();document.body.style.overflow=bodyOverflow;active=false};
  const finish=async()=>{await markDone(user,key);close();if(kind==='basic'&&full())setTimeout(check,500)};
  next.addEventListener('click',()=>{if(index<steps.length-1){index++;render()}else void finish()});
  back.addEventListener('click',()=>{if(index>0){index--;render()}});
  skip.addEventListener('click',()=>void finish());
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();void finish()}});
  render();
}
async function check(){
  if(active||checking||!dashboard())return;const c=client();if(!c){setTimeout(check,450);return}
  checking=true;
  try{
    const user=await getUser();if(!user?.id)return;
    if(!metaDone(user,BASIC_KEY)){showTour('basic',user);return}
    if(full()&&!metaDone(user,FULL_KEY))showTour('full',user);
  }finally{checking=false}
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;void check()},180)};
new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
window.addEventListener('pageshow',schedule);window.addEventListener('popstate',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();
