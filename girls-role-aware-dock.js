(() => {
'use strict';

function role(){
  const text=document.querySelector('.trip-title span')?.textContent||'';
  return /organiser/i.test(text)?'owner':/member/i.test(text)?'member':'';
}

function buttonFor(dock,tab){return dock.querySelector(`button[data-tab="${tab}"]`)}

function makeMemberUpload(){
  const b=document.createElement('button');
  b.type='button';
  b.className='dock-role-primary';
  b.dataset.roleUpload='1';
  b.innerHTML='<span>＋</span><small>Upload</small>';
  b.setAttribute('aria-label','Upload photos or video');
  return b;
}

function normaliseDock(){
  const dock=document.querySelector('nav.dock');
  const who=role();
  if(!dock||!who)return;

  const overview=buttonFor(dock,'overview');
  const plan=buttonFor(dock,'plan');
  const group=buttonFor(dock,'group');
  const evidence=buttonFor(dock,'evidence');
  if(!overview||!plan||!group||!evidence)return;

  let centre;
  if(who==='owner'){
    centre=buttonFor(dock,'money');
    if(!centre)return;
    centre.classList.add('dock-role-primary');
  }else{
    centre=dock.querySelector('[data-role-upload]')||makeMemberUpload();
  }

  const wanted=[overview,plan,centre,group,evidence];
  const current=[...dock.children];
  if(current.length===wanted.length&&wanted.every((node,i)=>current[i]===node))return;
  dock.replaceChildren(...wanted);
}

// Members get the prominent contribution action. Paid members open the existing
// upload destination chooser; Free members are taken to Evidence where the
// Full Trip gate is explained rather than exposing organiser money controls.
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-role-upload]');
  if(!b)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const uploader=document.querySelector('[data-a="upload"]');
  if(uploader){uploader.click();return;}
  document.querySelector('nav.dock button[data-tab="evidence"]')?.click();
},true);

const observer=new MutationObserver(()=>{
  clearTimeout(window.__gtgRoleDockTimer);
  window.__gtgRoleDockTimer=setTimeout(normaliseDock,20);
});
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('popstate',()=>setTimeout(normaliseDock,40));
setTimeout(normaliseDock,80);
})();
