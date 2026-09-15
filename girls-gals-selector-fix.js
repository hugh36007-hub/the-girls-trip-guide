/* Girls GALS selector: make character cards visibly selectable and normalise portrait framing. */
(()=>{
'use strict';
if(window.__GTG_GALS_SELECTOR_FIX__)return;window.__GTG_GALS_SELECTOR_FIX__=true;

function installStyles(){
 if(document.getElementById('gtg-gals-selector-fix-css'))return;
 const style=document.createElement('style');
 style.id='gtg-gals-selector-fix-css';
 style.textContent=`
.gtg-gals-selector label{position:relative;transition:border-color .16s ease,background .16s ease,box-shadow .16s ease,transform .16s ease;user-select:none;-webkit-tap-highlight-color:transparent}
.gtg-gals-selector label:not(:has(input:disabled)){cursor:pointer}
.gtg-gals-selector label.active{border-color:#ff4fa3!important;background:#fff3f8!important;box-shadow:0 0 0 2px rgba(255,79,163,.11)!important}
.gtg-gals-selector label.active:after{content:'✓';position:absolute;top:8px;right:9px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#ff4fa3;color:#fff;font-weight:900;font-size:12px}
.gtg-gals-selector .gtg-gals-image-frame{width:86px;height:86px;margin:0 auto 2px;display:grid;place-items:center;overflow:hidden;border-radius:16px;background:linear-gradient(180deg,#fff 0%,#f8eef3 100%)}
.gtg-gals-selector .gtg-gals-image-frame img{display:block;width:100%!important;height:100%!important;border-radius:0!important;object-fit:contain!important;object-position:center bottom!important;transform-origin:center bottom}
.gtg-gals-selector label[data-gals-mode="grace-auto"] .gtg-gals-image-frame img,
.gtg-gals-selector label[data-gals-mode="grace"] .gtg-gals-image-frame img{transform:scale(1.38)}
.gtg-gals-selector label[data-gals-mode="lola"] .gtg-gals-image-frame img{transform:scale(1.42)}
.gtg-gals-selector label[data-gals-mode="ava"] .gtg-gals-image-frame img{transform:scale(1.08)}
.gtg-gals-selector label[data-gals-mode="seb"] .gtg-gals-image-frame img{transform:scale(1.10)}
@media(max-width:650px){.gtg-gals-selector .gtg-gals-image-frame{width:92px;height:92px}.gtg-gals-selector label{min-height:156px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}.gtg-gals-selector label:first-child{min-height:148px}}
`;
 document.head.appendChild(style);
}

function syncSelector(root=document){
 const selector=root.querySelector?.('.gtg-gals-selector')||document.querySelector('.gtg-gals-selector');
 if(!selector)return;
 const labels=[...selector.querySelectorAll('label')];
 for(const label of labels){
  const input=label.querySelector('input[type="radio"][name="mode"]');
  const img=label.querySelector('img');
  if(!input||!img)continue;
  label.dataset.galsMode=input.value;
  if(!img.parentElement?.classList.contains('gtg-gals-image-frame')){
   const frame=document.createElement('span');frame.className='gtg-gals-image-frame';
   img.replaceWith(frame);frame.appendChild(img);
  }
  label.classList.toggle('active',input.checked);
  label.setAttribute('aria-checked',input.checked?'true':'false');
  label.setAttribute('role','radio');
  label.tabIndex=input.disabled?-1:0;
 }
}

function selectLabel(label){
 const input=label?.querySelector('input[type="radio"][name="mode"]');
 if(!input||input.disabled)return;
 input.checked=true;
 input.dispatchEvent(new Event('change',{bubbles:true}));
}

document.addEventListener('change',event=>{
 const input=event.target.closest?.('.gtg-gals-selector input[type="radio"][name="mode"]');
 if(!input)return;
 syncSelector(input.closest('.gtg-gals-selector'));
},true);

document.addEventListener('click',event=>{
 const label=event.target.closest?.('.gtg-gals-selector label');
 if(!label)return;
 if(event.target.matches('input'))return;
 selectLabel(label);
},true);

document.addEventListener('keydown',event=>{
 const label=event.target.closest?.('.gtg-gals-selector label');
 if(!label||!['Enter',' '].includes(event.key))return;
 event.preventDefault();selectLabel(label);
},true);

installStyles();
const modal=document.getElementById('modalRoot');
if(modal)new MutationObserver(()=>syncSelector(modal)).observe(modal,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>syncSelector(),{once:true});else syncSelector();
})();

/* Girls Plan category tiles: make the tap visibly open the matching section and prevent repeated filter-handler taps. */
(()=>{
'use strict';
if(window.__GTG_PLAN_CATEGORY_INTERACTION_FIX__)return;window.__GTG_PLAN_CATEGORY_INTERACTION_FIX__=true;
let busy=false,releaseTimer=0;

function installPlanStyles(){
 if(document.getElementById('gtg-plan-category-interaction-css'))return;
 const style=document.createElement('style');
 style.id='gtg-plan-category-interaction-css';
 style.textContent=`
.gtg-plan-categories button[aria-pressed="true"]{border-color:var(--pink)!important;box-shadow:0 0 0 2px rgba(255,79,163,.10)!important;background:#fff4f8!important}
`;
 document.head.appendChild(style);
}

function release(ms=350){clearTimeout(releaseTimer);releaseTimer=setTimeout(()=>{busy=false},ms)}
function kindOf(card){return String(card.querySelector('.kicker')?.textContent||'').trim().toLowerCase()}
function setSelected(target){
 document.querySelectorAll('.gtg-plan-categories [data-parity-filter-kind]').forEach(button=>button.setAttribute('aria-pressed',button===target?'true':'false'));
}
function openAdd(kind){
 const add=document.querySelector('.panel[data-panel="plan"].active [data-a="addBooking"],.panel[data-panel="plan"].active [data-action="addBooking"]');
 if(!add)return false;
 add.click();
 setTimeout(()=>{
  const select=document.querySelector('#bookingForm select[name="kind"]');
  if(!select)return;
  select.value=kind;
  select.dispatchEvent(new Event('change',{bubbles:true}));
 },60);
 return true;
}
function handle(button){
 const plan=document.querySelector('.panel[data-panel="plan"].active');if(!plan)return;
 const kind=String(button.dataset.parityFilterKind||'');
 const cards=[...plan.querySelectorAll('.booking')];
 if(kind==='all'){
  cards.forEach(card=>card.hidden=false);
  setSelected(null);
  release(120);
  return;
 }
 const matches=cards.filter(card=>kindOf(card)===kind);
 if(!matches.length){
  openAdd(kind);
  release(450);
  return;
 }
 cards.forEach(card=>card.hidden=!matches.includes(card));
 setSelected(button);
 const first=matches[0];
 first.scrollIntoView({block:'start'});
 window.scrollBy({top:-84,left:0,behavior:'auto'});
 release(220);
}

window.addEventListener('click',event=>{
 const button=event.target.closest?.('.gtg-plan-categories [data-parity-filter-kind],.gtg-plan-tools [data-parity-filter-kind]');
 if(!button)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 if(busy)return;
 busy=true;
 requestAnimationFrame(()=>handle(button));
},true);

installPlanStyles();
})();
