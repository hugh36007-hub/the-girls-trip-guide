(() => {
'use strict';

const svg=body=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICONS={
  home:svg('<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.5 10.4V20h13v-9.6"/><path d="M9.5 20v-5.5h5V20"/>'),
  plan:svg('<rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5v-1h6v1"/><path d="m8.5 9.5 1.2 1.2 2-2.2"/><path d="M13 10h2.5"/><path d="m8.5 14.5 1.2 1.2 2-2.2"/><path d="M13 15h2.5"/>'),
  expense:svg('<path d="M6 3.8h12v16.4l-2-1.2-2 1.2-2-1.2-2 1.2L8 19l-2 1.2V3.8Z"/><path d="M9 8h6"/><path d="M9 11.5h3"/><path d="M15.5 11.5v4"/><path d="M13.5 13.5h4"/>'),
  upload:svg('<rect x="3.5" y="5" width="17" height="14" rx="2.2"/><path d="m6.5 15 3.3-3.4 2.8 2.7 1.8-1.8 3.1 3.2"/><path d="M12 12V6.8"/><path d="m9.8 9 2.2-2.2L14.2 9"/>'),
  group:svg('<circle cx="9" cy="9" r="2.6"/><circle cx="16.5" cy="10" r="2"/><path d="M4.5 18c.5-3 2.2-4.5 4.5-4.5s4 1.5 4.5 4.5"/><path d="M14 14.5c2.8-.5 5 .8 5.5 3.5"/>'),
  evidence:svg('<path d="M7.2 6.5 8.5 4.7h7l1.3 1.8h2.4A1.8 1.8 0 0 1 21 8.3v9A1.8 1.8 0 0 1 19.2 19H4.8A1.8 1.8 0 0 1 3 17.2v-9a1.8 1.8 0 0 1 1.8-1.8h2.4Z"/><circle cx="12" cy="12.5" r="3.3"/>')
};

function tripRole(){
  if(!document.querySelector('nav.dock'))return '';
  return document.querySelector('[data-panel="money"] [data-a="addExpense"]')?'owner':'member';
}
function dockButton(dock,tab){return dock.querySelector(`button[data-tab="${tab}"]`)}
function ownerExpenseButton(){
  const b=document.createElement('button');
  b.type='button';
  b.className='dock-role-primary';
  b.dataset.roleExpense='1';
  b.setAttribute('aria-label','Add expense');
  return b;
}
function memberUploadButton(){
  const b=document.createElement('button');
  b.type='button';
  b.className='dock-role-primary';
  b.dataset.roleUpload='1';
  b.setAttribute('aria-label','Upload photos or video');
  return b;
}
function decorate(button,kind,label,aria=label){
  if(!button)return;
  button.setAttribute('aria-label',aria);
  const labelNode=button.querySelector('.dock-label');
  if(button.dataset.option7Icon===kind&&button.querySelector('.dock-icon')&&labelNode){
    if(labelNode.textContent!==label)labelNode.textContent=label;
    return;
  }
  const icon=document.createElement('span');
  icon.className='dock-icon';
  icon.setAttribute('aria-hidden','true');
  icon.innerHTML=ICONS[kind];
  const small=document.createElement('small');
  small.className='dock-label';
  small.textContent=label;
  button.replaceChildren(icon,small);
  button.dataset.option7Icon=kind;
}
function normaliseDock(){
  const dock=document.querySelector('nav.dock'),who=tripRole();
  if(!dock||!who)return;
  const overview=dockButton(dock,'overview'),plan=dockButton(dock,'plan'),group=dockButton(dock,'group'),evidence=dockButton(dock,'evidence');
  if(!overview||!plan||!group||!evidence)return;
  let centre;
  if(who==='owner'){
    centre=dock.querySelector('[data-role-expense]')||ownerExpenseButton();
  }else{
    centre=dock.querySelector('[data-role-upload]')||memberUploadButton();
  }
  centre.classList.add('dock-role-primary');

  decorate(overview,'home','Home','Home');
  decorate(plan,'plan','Plan','The Plan');
  decorate(centre,who==='owner'?'expense':'upload',who==='owner'?'Expense':'Upload',who==='owner'?'Add expense':'Upload photos or video');
  decorate(group,'group','Group','The Group');
  decorate(evidence,'evidence','Evidence','Evidence');
  dock.classList.add('gtg-option7');

  const wanted=[overview,plan,centre,group,evidence],current=[...dock.children];
  if(current.length!==wanted.length||!wanted.every((node,i)=>current[i]===node))dock.replaceChildren(...wanted);
}

const style=document.createElement('style');
style.id='gtg-option7-dock-style';
style.textContent=`
.dock.gtg-option7{height:auto;min-height:66px;align-items:stretch;width:min(520px,calc(100% - 24px));padding:6px 8px;border-radius:20px;background:rgba(9,5,9,.94);border-color:rgba(255,131,193,.25);box-shadow:0 16px 48px rgba(0,0,0,.46);transition:width .24s ease,padding .24s ease,border-radius .24s ease,background .24s ease}
.dock.gtg-option7 button{position:relative;min-width:0;min-height:54px;padding:6px 4px 8px;border-radius:14px!important;background:transparent!important;box-shadow:none!important;transform:none!important;color:rgba(255,255,255,.62);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;transition:min-height .22s ease,padding .22s ease,color .18s ease,background .18s ease}
.dock.gtg-option7 .dock-icon{display:block;width:23px;height:23px;font-size:0;line-height:0}
.dock.gtg-option7 .dock-icon svg{display:block;width:100%;height:100%}
.dock.gtg-option7 .dock-label{height:auto;max-height:16px;overflow:hidden;color:inherit!important;font-size:9px;font-weight:800;line-height:1.1;letter-spacing:.045em;text-transform:uppercase;white-space:nowrap;opacity:1;transition:max-height .18s ease,opacity .16s ease}
.dock.gtg-option7 button.active{color:#fff;background:transparent!important}
.dock.gtg-option7 button.active::after{content:"";position:absolute;left:50%;bottom:1px;width:24px;height:2px;border-radius:2px;background:var(--pink2,#ff83c1);transform:translateX(-50%);box-shadow:0 0 10px rgba(255,79,163,.28)}
.dock.gtg-option7 .dock-role-primary{color:var(--pink2,#ff83c1)!important;background:rgba(255,79,163,.075)!important}
.dock.gtg-option7 .dock-role-primary::after{display:none}
.dock.gtg-option7.is-compact{width:min(400px,calc(100% - 64px));min-height:52px;padding:3px 6px;border-radius:17px;background:rgba(9,5,9,.97)}
.dock.gtg-option7.is-compact button{min-height:46px;padding:5px 3px;gap:0}
.dock.gtg-option7.is-compact .dock-icon{width:21px;height:21px}
.dock.gtg-option7.is-compact .dock-label{max-height:0;opacity:0}
@media(max-width:430px){.dock.gtg-option7{width:calc(100% - 28px)}.dock.gtg-option7.is-compact{width:calc(100% - 72px)}}
@media(prefers-reduced-motion:reduce){.dock.gtg-option7,.dock.gtg-option7 button,.dock.gtg-option7 .dock-label{transition:none!important}}
`;
if(!document.getElementById(style.id))document.head.appendChild(style);

document.addEventListener('click',event=>{
  const expense=event.target.closest('[data-role-expense]');
  if(expense){
    event.preventDefault();
    event.stopImmediatePropagation();
    const add=document.querySelector('[data-panel="money"] [data-a="addExpense"]');
    if(add){add.click();return;}
    document.querySelector('.stat[data-tab="money"]')?.click();
    return;
  }
  const upload=event.target.closest('[data-role-upload]');
  if(!upload)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const uploader=document.querySelector('[data-a="upload"]');
  if(uploader){uploader.click();return;}
  document.querySelector('nav.dock button[data-tab="evidence"]')?.click();
},true);

let lastY=Math.max(0,window.scrollY||0),scrollTick=false;
function setCompact(value){
  document.querySelectorAll('nav.dock.gtg-option7').forEach(dock=>dock.classList.toggle('is-compact',Boolean(value)));
}
function handleScroll(){
  if(scrollTick)return;
  scrollTick=true;
  requestAnimationFrame(()=>{
    const y=Math.max(0,window.scrollY||document.documentElement.scrollTop||0);
    if(y<36)setCompact(false);
    else if(y>84&&y>lastY+2)setCompact(true);
    else if(y<lastY-2)setCompact(false);
    lastY=y;
    scrollTick=false;
  });
}
window.addEventListener('scroll',handleScroll,{passive:true});
document.addEventListener('pointerdown',event=>{
  const dock=event.target.closest?.('nav.dock.gtg-option7.is-compact');
  if(dock)dock.classList.remove('is-compact');
},{capture:true,passive:true});

const dockObserver=new MutationObserver(()=>{
  clearTimeout(window.__gtgRoleDockTimer);
  window.__gtgRoleDockTimer=setTimeout(normaliseDock,20);
});
dockObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('popstate',()=>setTimeout(normaliseDock,40));
setTimeout(()=>{normaliseDock();setCompact((window.scrollY||0)>100)},80);
})();
