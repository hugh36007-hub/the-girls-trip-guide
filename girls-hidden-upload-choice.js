(() => {
'use strict';
let bypassOriginalUpload=false;

function openDestinationChoice(sourceButton){
 const root=document.getElementById('modalRoot');
 if(!root)return;
 root.innerHTML=`<div class="modal"><h2>Where should this go?</h2><p>Choose the normal Evidence gallery or add it straight to the Hidden Gallery. You do not need the PIN to add hidden media; the PIN is only needed to view it.</p><div class="form" style="gap:12px"><button type="button" class="btn primary" data-upload-destination="evidence">Evidence</button><button type="button" class="btn" data-a="vaultUpload">Hidden Gallery</button></div><div class="modal-actions"><button type="button" class="btn" data-a="close">Cancel</button></div></div>`;
 root.classList.add('open');
 const evidence=root.querySelector('[data-upload-destination="evidence"]');
 evidence?.addEventListener('click',()=>{
   root.classList.remove('open');
   root.innerHTML='';
   bypassOriginalUpload=true;
   try{sourceButton.click()}finally{queueMicrotask(()=>{bypassOriginalUpload=false})}
 },{once:true});
}

document.addEventListener('click',event=>{
 const button=event.target.closest('[data-a="upload"]');
 if(!button||bypassOriginalUpload)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 openDestinationChoice(button);
},true);

function tripRole(){
 const text=document.querySelector('.trip-title span')?.textContent||'';
 return /organiser/i.test(text)?'owner':/member/i.test(text)?'member':'';
}
function dockButton(dock,tab){return dock.querySelector(`button[data-tab="${tab}"]`)}
function memberUploadButton(){
 const b=document.createElement('button');
 b.type='button';
 b.className='dock-role-primary';
 b.dataset.roleUpload='1';
 b.innerHTML='<span>＋</span><small>Upload</small>';
 b.setAttribute('aria-label','Upload photos or video');
 return b;
}
function normaliseDock(){
 const dock=document.querySelector('nav.dock'),who=tripRole();
 if(!dock||!who)return;
 const overview=dockButton(dock,'overview'),plan=dockButton(dock,'plan'),group=dockButton(dock,'group'),evidence=dockButton(dock,'evidence');
 if(!overview||!plan||!group||!evidence)return;
 let centre;
 if(who==='owner'){
   centre=dockButton(dock,'money');
   if(!centre)return;
   centre.classList.add('dock-role-primary');
 }else{
   centre=dock.querySelector('[data-role-upload]')||memberUploadButton();
 }
 const wanted=[overview,plan,centre,group,evidence],current=[...dock.children];
 if(current.length===wanted.length&&wanted.every((node,i)=>current[i]===node))return;
 dock.replaceChildren(...wanted);
}

const style=document.createElement('style');
style.textContent='.dock .dock-role-primary{background:var(--pink);color:#13070d;box-shadow:0 10px 24px rgba(255,79,163,.24)}.dock .dock-role-primary span,.dock .dock-role-primary small{color:#13070d}.dock .dock-role-primary.active{background:var(--pink);color:#13070d}@media(max-width:600px){.dock .dock-role-primary{transform:translateY(-4px)}}';
document.head.appendChild(style);

document.addEventListener('click',event=>{
 const button=event.target.closest('[data-role-upload]');
 if(!button)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 const uploader=document.querySelector('[data-a="upload"]');
 if(uploader){uploader.click();return;}
 document.querySelector('nav.dock button[data-tab="evidence"]')?.click();
},true);

const dockObserver=new MutationObserver(()=>{
 clearTimeout(window.__gtgRoleDockTimer);
 window.__gtgRoleDockTimer=setTimeout(normaliseDock,20);
});
dockObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('popstate',()=>setTimeout(normaliseDock,40));
setTimeout(normaliseDock,80);
})();
