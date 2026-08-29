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