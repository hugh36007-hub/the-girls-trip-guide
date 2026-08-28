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
})();
