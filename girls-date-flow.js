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
function syncSplit(form){
 if(!form?.matches(FORM_SELECTOR))return;
 const split=form.querySelector('select[name="splitMode"]');
 if(!split)return;
 const field=selectedField(form);
 if(form.id==='bookingForm'){
  if(split.options[0])split.options[0].textContent='Entire group — including anyone added later';
  if(split.options[1])split.options[1].textContent='Selected group only';
  const label=field?.querySelector('label');if(label)label.textContent='Selected group';
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
  syncSplit(form);
 });
}
document.addEventListener('click',()=>queueMicrotask(syncActiveForms));
document.addEventListener('change',e=>{const el=e.target;if(el instanceof HTMLSelectElement&&el.name==='splitMode')syncSplit(el.form)});
document.addEventListener('focusin',e=>clearDefaultZero(e.target));
document.addEventListener('input',e=>normaliseLeadingZeros(e.target));
window.addEventListener('pageshow',syncActiveForms);
installStyles();
setTimeout(syncActiveForms,0);
})();

(()=>{'use strict';if(document.querySelector('script[data-live-dashboard-loader="girls"]'))return;const script=document.createElement('script');script.src='/girls-live-dashboard-hero.js?v=4';script.async=false;script.dataset.liveDashboardLoader='girls';document.head.append(script)})();
