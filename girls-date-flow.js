(()=>{'use strict';
function nextEnd(start){
 const end=start?.form?.querySelector('input[name="end"][type="date"]');
 if(!end)return;
 end.min=start.value||'';
 if(end.value&&start.value&&end.value<start.value)end.value='';
 requestAnimationFrame(()=>{try{end.focus({preventScroll:true})}catch{end.focus()}try{end.showPicker?.()}catch{}});
}
document.addEventListener('change',e=>{
 const el=e.target;
 if(!(el instanceof HTMLInputElement)||el.type!=='date')return;
 if(el.name==='start'&&el.value)nextEnd(el);
},true);
document.addEventListener('focusin',e=>{
 const el=e.target;
 if(!(el instanceof HTMLInputElement)||el.type!=='date'||el.name!=='end')return;
 const start=el.form?.querySelector('input[name="start"][type="date"]');
 if(start?.value)el.min=start.value;
},true);
})();

(()=>{'use strict';
const FORM_SELECTOR='#bookingForm,#expenseForm,form[data-form="booking"],form[data-form="expense"]';
function installStyles(){
 if(document.getElementById('trip-form-hardening-v1'))return;
 const style=document.createElement('style');
 style.id='trip-form-hardening-v1';
 style.textContent=`
#modal-root{position:relative;z-index:1200}
#modal-root .modal-backdrop{z-index:1200!important}
body.modal-open .bottom-dock{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
#modalRoot.modal-wrap.open{z-index:1200!important}
.selected-crew[hidden],#bookingForm .field[hidden]{display:none!important}
#expenseForm .gtg-expense-split-checks{display:grid;gap:8px}
#expenseForm .gtg-expense-split-option{display:flex;align-items:center;gap:10px;min-height:44px;padding:10px 12px;border:1px solid rgba(255,79,163,.28);border-radius:12px;background:#fff;font-weight:600;cursor:pointer}
#expenseForm .gtg-expense-split-option input{width:18px;height:18px;margin:0;flex:0 0 auto;accent-color:#ff4fa3}
@media(max-width:700px){
 #modal-root .modal-backdrop{overflow-y:auto!important;padding-bottom:calc(24px + env(safe-area-inset-bottom))!important}
 #modal-root .modal,#modalRoot.open .modal{max-height:calc(100dvh - 24px - env(safe-area-inset-top))!important;overflow-y:auto!important;overscroll-behavior:contain;scroll-padding-bottom:calc(28px + env(safe-area-inset-bottom));padding-bottom:calc(28px + env(safe-area-inset-bottom))!important}
 #modalRoot.modal-wrap.open{place-items:start center!important;overflow-y:auto!important;padding:12px 12px calc(24px + env(safe-area-inset-bottom))!important}
}`;
 document.head.append(style);
}
function isTripMoneyInput(el){
 return el instanceof HTMLInputElement&&el.type==='number'&&(el.name==='cost'||el.name==='amount')&&Boolean(el.form?.matches(FORM_SELECTOR));
}
function clearDefaultZero(el){
 if(!isTripMoneyInput(el))return;
 el.inputMode='decimal';
 if(!el.placeholder)el.placeholder='0.00';
 if(/^0(?:\.0+)?$/.test(String(el.value||'').trim()))el.value='';
}
function normaliseLeadingZeros(el){
 if(!isTripMoneyInput(el))return;
 let value=String(el.value||'');
 if(/^0+\d/.test(value))value=value.replace(/^0+(?=\d)/,'');
 else if(/^0{2,}\./.test(value))value=`0${value.replace(/^0+/,'')}`;
 if(value!==el.value)el.value=value;
}
function selectedField(form){
 if(!form)return null;
 if(form.matches('form[data-form="booking"]'))return form.querySelector('.selected-crew');
 const people=form.querySelector('select[name="people"][multiple]');
 return people?.closest('.field')||null;
}
function enhanceBookingForm(form){
 if(!form||form.getAttribute('id')!=='bookingForm')return;
 const kind=form.querySelector('select[name="kind"]');
 if(kind&&!kind.dataset.gtgCloseBound){
  kind.dataset.gtgCloseBound='1';
  kind.addEventListener('change',()=>requestAnimationFrame(()=>kind.blur()));
 }
}
function dedupePeopleOptions(people){
 if(!people)return;
 const seen=new Set();
 [...people.options].forEach(option=>{const key=String(option.value||'').trim();if(!key||seen.has(key))option.remove();else seen.add(key)});
}
function enhanceExpenseForm(form){
 if(!form||form.getAttribute('id')!=='expenseForm')return;
 const payer=form.querySelector('select[name="payer"]');
 if(payer&&!payer.dataset.gtgCloseBound){
  payer.dataset.gtgCloseBound='1';
  payer.addEventListener('change',()=>requestAnimationFrame(()=>payer.blur()));
 }
 const people=form.querySelector('select[name="people"][multiple]');
 if(!people)return;
 dedupePeopleOptions(people);
 if(people.dataset.gtgCheckboxSource==='1')return;
 people.dataset.gtgCheckboxSource='1';
 people.required=false;
 people.style.display='none';
 people.setAttribute('aria-hidden','true');
 people.tabIndex=-1;
 const oldChecks=form.querySelector('[data-expense-split-checks="1"]');
 if(oldChecks)oldChecks.remove();
 const checks=document.createElement('div');
 checks.className='gtg-expense-split-checks';
 checks.dataset.expenseSplitChecks='1';
 const rendered=new Set();
 for(const option of people.options){
  if(rendered.has(option.value))continue;
  rendered.add(option.value);
  const label=document.createElement('label');
  label.className='gtg-expense-split-option';
  const input=document.createElement('input');
  input.type='checkbox';
  input.checked=option.selected;
  input.value=option.value;
  input.setAttribute('aria-label',option.textContent||'Group member');
  input.addEventListener('change',()=>{
   option.selected=input.checked;
   people.dispatchEvent(new Event('change',{bubbles:true}));
  });
  const text=document.createElement('span');
  text.textContent=option.textContent||'';
  label.append(input,text);
  checks.append(label);
 }
 people.insertAdjacentElement('afterend',checks);
}
function setText(el,text){
 if(el&&el.textContent!==text)el.textContent=text;
}
function syncSplit(form){
 if(!form?.matches(FORM_SELECTOR))return;
 const split=form.querySelector('select[name="splitMode"]');
 if(!split)return;
 const field=selectedField(form);
 if(form.getAttribute('id')==='bookingForm'){
  setText(split.options[0],'Entire group — including anyone added later');
  setText(split.options[1],'Selected group only');
  const label=field?.querySelector('label');setText(label,'Selected group');
 }
 if(!field)return;
 const show=split.value==='selected';
 field.hidden=!show;
 field.setAttribute('aria-hidden',show?'false':'true');
}
function syncActiveForms(){
 installStyles();
 document.querySelectorAll(FORM_SELECTOR).forEach(form=>{
  form.querySelectorAll('input[type="number"][name="cost"],input[type="number"][name="amount"]').forEach(clearDefaultZero);
  enhanceBookingForm(form);
  enhanceExpenseForm(form);
  syncSplit(form);
 });
}
const modalRoot=document.getElementById('modalRoot')||document.getElementById('modal-root');
if(modalRoot)new MutationObserver(()=>queueMicrotask(syncActiveForms)).observe(modalRoot,{childList:true,subtree:true});
document.addEventListener('change',e=>{const el=e.target;if(el instanceof HTMLSelectElement&&el.name==='splitMode')syncSplit(el.form)});
document.addEventListener('focusin',e=>clearDefaultZero(e.target));
document.addEventListener('input',e=>normaliseLeadingZeros(e.target));
window.addEventListener('pageshow',syncActiveForms);
installStyles();
setTimeout(syncActiveForms,0);
})();
