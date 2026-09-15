/* Girls Trip Guide — one-time Full Trip Hidden Gallery explainer and discreet Home-only view entry. */
(()=>{
'use strict';
if(window.__GTG_HIDDEN_GALLERY_INTRO__)return;
window.__GTG_HIDDEN_GALLERY_INTRO__=true;

const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const key=()=>`gtg:hidden-gallery-intro-v3:${tripId()}`;
const seen=()=>{try{return localStorage.getItem(key())==='1'}catch{return false}};
const markSeen=()=>{try{localStorage.setItem(key(),'1')}catch{}};
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000)};

function installStyle(){
 if(document.getElementById('gtg-hidden-gallery-intro-css'))return;
 const s=document.createElement('style');
 s.id='gtg-hidden-gallery-intro-css';
 s.textContent=`
.gtg-hidden-gallery-intro{margin:0 0 16px;padding:14px 15px;border:1.5px solid rgba(255,79,163,.34);border-radius:16px;background:linear-gradient(135deg,#fff3f8 0%,#fff 74%);box-shadow:0 10px 28px rgba(63,28,46,.06);color:#191316}
.gtg-hidden-gallery-intro__top{display:flex;align-items:flex-start;gap:11px}
.gtg-hidden-gallery-intro__icon{flex:0 0 34px;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#ff4fa3;color:#fff;font-size:17px;font-weight:900}
.gtg-hidden-gallery-intro h3{margin:1px 0 4px;font:900 21px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#191316}
.gtg-hidden-gallery-intro p{margin:0;color:#67535d;font-size:11px;line-height:1.5}
.gtg-hidden-gallery-intro strong{color:#ed2f8b}
.gtg-hidden-gallery-intro__actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;padding-left:45px}
.gtg-hidden-gallery-intro__actions button{min-height:34px}
@media(max-width:600px){.gtg-hidden-gallery-intro{padding:12px 13px}.gtg-hidden-gallery-intro__actions{padding-left:0}.gtg-hidden-gallery-intro__actions .btn{flex:1}}
`;
 document.head.appendChild(s);
}

function stripDirectEntries(){
 document.querySelectorAll('#drawerRoot [data-a="vault"]').forEach(button=>button.remove());
}

function install(){
 stripDirectEntries();
 if(seen())return;
 const dash=document.querySelector('.dashboard[data-home-composition="full"]');
 if(!dash||dash.querySelector('[data-hidden-gallery-intro]'))return;
 const shell=dash.querySelector('.shell');
 const active=dash.querySelector('.panel.active');
 if(!shell||!active)return;
 installStyle();
 const box=document.createElement('aside');
 box.className='gtg-hidden-gallery-intro';
 box.dataset.hiddenGalleryIntro='1';
 box.setAttribute('role','note');
 box.innerHTML=`<div class="gtg-hidden-gallery-intro__top"><div class="gtg-hidden-gallery-intro__icon" aria-hidden="true">🔒</div><div><h3>There’s also a Hidden Gallery</h3><p>Full Trip includes a separate <strong>PIN-protected album</strong> for photos or videos you do not want in the main Evidence gallery. To view it, go to <strong>Home</strong>, <strong>tap Latest Photo once to expand it</strong>, then <strong>press and hold the expanded photo for 4 seconds</strong>. The organiser sets the trip PIN. You can still send photos or videos to the Hidden Gallery from Upload without unlocking it.</p></div></div><div class="gtg-hidden-gallery-intro__actions"><button type="button" class="btn primary" data-hidden-gallery-dismiss>Got it</button></div>`;
 shell.insertBefore(box,active);
}

function schedule(){[0,80,240,650].forEach(ms=>setTimeout(install,ms))}

document.addEventListener('click',event=>{
 const dismiss=event.target.closest?.('[data-hidden-gallery-dismiss]');
 if(dismiss){markSeen();dismiss.closest('[data-hidden-gallery-intro]')?.remove();return}

 const direct=event.target.closest?.('[data-a="vault"]');
 if(direct&&!direct.hidden){
   event.preventDefault();
   event.stopImmediatePropagation();
   stripDirectEntries();
   toast('Hidden Gallery: on Home, tap Latest Photo once, then hold the expanded photo for 4 seconds.');
   return;
 }

 if(event.target.closest?.('[data-a="drawer"],[data-tab]'))setTimeout(()=>{stripDirectEntries();install()},0);
},true);

window.addEventListener('popstate',schedule);
window.addEventListener('pageshow',schedule);
window.addEventListener('gtg:core-data-ready',schedule);
schedule();
})();
