/* Girls Trip Guide — GALS picker portrait crop and live selection state. */
(()=>{
'use strict';
if(window.__GTG_GALS_PICKER_REFINEMENT__)return;
window.__GTG_GALS_PICKER_REFINEMENT__=true;

function installStyles(){
 if(document.getElementById('gtg-gals-picker-refinement-css'))return;
 const style=document.createElement('style');
 style.id='gtg-gals-picker-refinement-css';
 style.textContent=`
#settingsForm .gals-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
#settingsForm .gal-option{position:relative!important;min-height:132px!important;padding:12px 8px 10px!important;border:1.5px solid rgba(255,79,163,.28)!important;border-radius:14px!important;background:#fff!important;color:#191316!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;transition:border-color .15s ease,background .15s ease,box-shadow .15s ease,transform .08s ease!important;-webkit-tap-highlight-color:transparent!important}
#settingsForm .gal-option:active{transform:scale(.985)!important}
#settingsForm .gal-option .gtg-gal-portrait{display:block!important;width:84px!important;height:84px!important;margin:0 auto 8px!important;border-radius:50%!important;overflow:hidden!important;background:#fff6fa!important;border:1px solid rgba(255,79,163,.18)!important;position:relative!important}
#settingsForm .gal-option .gtg-gal-portrait img{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;border-radius:0!important;object-fit:cover!important;object-position:center top!important;transform:scale(2.05)!important;transform-origin:50% 8%!important}
#settingsForm .gal-option[data-gal-mode="ava"] .gtg-gal-portrait img{transform:scale(2)!important;transform-origin:50% 8%!important}
#settingsForm .gal-option[data-gal-mode="lola"] .gtg-gal-portrait img{transform:scale(2.08)!important;transform-origin:50% 8%!important}
#settingsForm .gal-option[data-gal-mode="seb"] .gtg-gal-portrait img{transform:scale(1.95)!important;transform-origin:50% 7%!important}
#settingsForm .gal-option b{display:block!important;margin-top:0!important;font-size:12px!important;line-height:1.15!important;color:#191316!important;text-align:center!important}
#settingsForm .gal-option.active{border:2px solid #ff4fa3!important;background:linear-gradient(145deg,#fff 0%,#fff0f7 100%)!important;box-shadow:0 0 0 3px rgba(255,79,163,.10),0 8px 20px rgba(76,26,51,.08)!important}
#settingsForm .gal-option.active::after{content:'✓';position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#ff4fa3;color:#fff;font-size:13px;font-weight:900;box-shadow:0 3px 10px rgba(255,79,163,.22)}
#settingsForm .gal-option[data-gal-mode="grace-auto"]::before{content:'AUTO';position:absolute;top:9px;left:9px;padding:3px 5px;border-radius:999px;background:#fff1f7;color:#ed2f8b;border:1px solid rgba(255,79,163,.24);font-size:7px;font-weight:900;letter-spacing:.08em}
@media(max-width:380px){#settingsForm .gal-option .gtg-gal-portrait{width:78px!important;height:78px!important}#settingsForm .gal-option{min-height:124px!important}}
`;
 document.head.appendChild(style);
}

function sync(form){
 if(!form)return;
 form.querySelectorAll('.gal-option').forEach(option=>{
  const radio=option.querySelector('input[type="radio"][name="mode"]');
  const active=Boolean(radio?.checked);
  option.classList.toggle('active',active);
  option.setAttribute('aria-checked',active?'true':'false');
 });
}

function refine(){
 installStyles();
 const form=document.querySelector('#settingsForm');
 if(!form)return;
 form.querySelectorAll('.gal-option').forEach(option=>{
  const radio=option.querySelector('input[type="radio"][name="mode"]');
  if(!radio)return;
  option.dataset.galMode=radio.value;
  option.setAttribute('role','radio');
  option.tabIndex=0;
  const image=option.querySelector(':scope > img');
  if(image){
   const frame=document.createElement('span');
   frame.className='gtg-gal-portrait';
   option.insertBefore(frame,image);
   frame.appendChild(image);
  }
 });
 sync(form);
}

function select(option){
 const radio=option?.querySelector('input[type="radio"][name="mode"]');
 if(!radio)return;
 radio.checked=true;
 sync(radio.form);
 radio.dispatchEvent(new Event('change',{bubbles:true}));
}

document.addEventListener('click',event=>{
 const option=event.target.closest?.('#settingsForm .gal-option');
 if(!option)return;
 event.preventDefault();
 select(option);
},true);

document.addEventListener('change',event=>{
 if(event.target.matches?.('#settingsForm input[type="radio"][name="mode"]'))sync(event.target.form);
},true);

document.addEventListener('keydown',event=>{
 const option=event.target.closest?.('#settingsForm .gal-option');
 if(!option||!['Enter',' '].includes(event.key))return;
 event.preventDefault();
 select(option);
},true);

const root=document.getElementById('modalRoot');
if(root)new MutationObserver(()=>queueMicrotask(refine)).observe(root,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refine,{once:true});else refine();
})();
