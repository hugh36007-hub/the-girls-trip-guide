/* Girls Trip Guide — organiser-controlled member expense entry.
   Members may create expenses only when the organiser enables it; payer is locked to self. */
(()=>{
'use strict';
if(window.__GTG_MEMBER_EXPENSE_PERMISSION__)return;
window.__GTG_MEMBER_EXPENSE_PERMISSION__=true;

const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,context=null,contextTripId='',decorateTimer=0;

function db(){
 if(!client&&window.supabase?.createClient){
  client=window.supabase.createClient(SUPABASE_URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 }
 return client;
}
function tripId(){return new URL(location.href).searchParams.get('trip_id')||''}
function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000)}
function activeMoney(){return Boolean(document.querySelector('.panel[data-panel="money"].active')||new URL(location.href).searchParams.get('action')==='money')}
function installStyle(){
 if(document.getElementById('gtg-member-expense-permission-css'))return;
 const style=document.createElement('style');
 style.id='gtg-member-expense-permission-css';
 style.textContent=`
.gtg-member-expense-setting{margin:10px 0 0;padding:11px 12px;border:1px solid rgba(255,79,163,.22);border-radius:12px;background:#fff8fb;display:flex;align-items:center;justify-content:space-between;gap:12px}
.gtg-member-expense-setting b{display:block;font-size:11px;line-height:1.2;color:#191316}
.gtg-member-expense-setting small{display:block;margin-top:3px;font-size:9px;line-height:1.35;color:#8b6d7c}
.gtg-member-expense-switch{position:relative;display:inline-flex;flex:0 0 auto;width:42px;height:24px}
.gtg-member-expense-switch input{position:absolute;opacity:0;pointer-events:none}
.gtg-member-expense-switch span{width:42px;height:24px;border-radius:999px;background:#d8c9d0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);transition:.16s ease;position:relative}
.gtg-member-expense-switch span::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:white;box-shadow:0 2px 7px rgba(0,0,0,.16);transition:.16s ease}
.gtg-member-expense-switch input:checked+span{background:var(--pink,#ed2f8b)}
.gtg-member-expense-switch input:checked+span::after{transform:translateX(18px)}
.gtg-member-expense-switch input:disabled+span{opacity:.55}
.gtg-member-expense-status{margin-top:9px;font-size:10px;line-height:1.35;color:#8b6d7c}
#expenseForm .gtg-member-payer-note{margin-top:5px;font-size:10px;line-height:1.35;color:#8b6d7c}
`;
 document.head.appendChild(style);
}

async function loadContext(force=false){
 const id=tripId(),c=db();
 if(!id||!c)return null;
 if(!force&&context&&contextTripId===id)return context;
 const {data:{user},error:userError}=await c.auth.getUser();
 if(userError||!user)return null;
 const [tripResult,memberResult]=await Promise.all([
  c.from('trips').select('id,owner_id,product_key,members_can_add_expenses').eq('id',id).eq('product_key','girls').maybeSingle(),
  c.from('trip_members').select('id,user_id,status,role').eq('trip_id',id).eq('user_id',user.id).maybeSingle()
 ]);
 if(tripResult.error||!tripResult.data)return null;
 const owner=tripResult.data.owner_id===user.id;
 const member=memberResult.data||null;
 context={trip:tripResult.data,user,owner,member,enabled:tripResult.data.members_can_add_expenses!==false};
 contextTripId=id;
 return context;
}

function ensureMemberTools(summary){
 let tools=summary.querySelector(':scope > .gtg-plan-tools[data-gtg-member-expense-tools]');
 if(tools)return tools;
 tools=document.createElement('div');
 tools.className='gtg-plan-tools';
 tools.dataset.gtgMemberExpenseTools='1';
 const strip=summary.querySelector(':scope > .gtg-money-strip');
 if(strip)strip.insertAdjacentElement('afterend',tools);else summary.appendChild(tools);
 return tools;
}
function renderOwner(summary,ctx){
 let row=summary.querySelector(':scope > .gtg-member-expense-setting');
 if(!row){
  row=document.createElement('div');
  row.className='gtg-member-expense-setting';
  row.innerHTML='<div><b>Members can add expenses</b><small>Members can record expenses they personally paid. Organiser controls remain unchanged.</small></div><label class="gtg-member-expense-switch"><input type="checkbox" data-gtg-member-expense-toggle><span aria-hidden="true"></span></label>';
  const tools=summary.querySelector(':scope > .gtg-plan-tools');
  if(tools)tools.insertAdjacentElement('afterend',row);else summary.appendChild(row);
 }
 const input=row.querySelector('[data-gtg-member-expense-toggle]');
 if(input)input.checked=ctx.enabled;
 summary.querySelector('[data-gtg-member-expense-status]')?.remove();
 summary.querySelector('[data-gtg-member-expense-tools]')?.remove();
}
function renderMember(summary,ctx){
 summary.querySelector(':scope > .gtg-member-expense-setting')?.remove();
 const old=summary.querySelector('[data-gtg-member-expense-status]');
 if(ctx.enabled){
  old?.remove();
  const tools=ensureMemberTools(summary);
  if(!tools.querySelector('[data-gtg-member-add-expense]')){
   const button=document.createElement('button');
   button.className='btn primary';
   button.type='button';
   button.dataset.a='addExpense';
   button.dataset.gtgMemberAddExpense='1';
   button.textContent='+ Add expense';
   tools.appendChild(button);
  }
 }else{
  summary.querySelector('[data-gtg-member-expense-tools]')?.remove();
  if(!old){
   const note=document.createElement('div');
   note.className='gtg-member-expense-status';
   note.dataset.gtgMemberExpenseStatus='1';
   note.textContent='Expense entry is currently organiser-only.';
   summary.appendChild(note);
  }
 }
}

async function decorate(attempt=0){
 clearTimeout(decorateTimer);
 if(!activeMoney())return;
 const ctx=await loadContext();
 if(!ctx)return;
 const summary=document.querySelector('.panel[data-panel="money"].active .gtg-money-summary')||document.querySelector('.gtg-money-summary');
 if(!summary){
  if(attempt<12)decorateTimer=setTimeout(()=>void decorate(attempt+1),120);
  return;
 }
 installStyle();
 if(ctx.owner)renderOwner(summary,ctx);else if(ctx.member?.status==='confirmed')renderMember(summary,ctx);
}

function lockMemberPayer(attempt=0){
 const ctx=context;
 if(!ctx||ctx.owner||!ctx.enabled||!ctx.member?.id)return;
 const form=document.querySelector('#expenseForm');
 if(!form){if(attempt<10)setTimeout(()=>lockMemberPayer(attempt+1),60);return}
 const payer=form.querySelector('select[name="payer"]');
 if(!payer)return;
 [...payer.options].forEach(option=>{option.disabled=option.value!==ctx.member.id});
 payer.value=ctx.member.id;
 payer.setAttribute('aria-label','Paid by you');
 payer.style.pointerEvents='none';
 payer.style.backgroundColor='#f6f1f3';
 const field=payer.closest('.field');
 const label=field?.querySelector('label');
 if(label)label.textContent='Paid by (you)';
 if(field&&!field.querySelector('.gtg-member-payer-note')){
  const note=document.createElement('div');
  note.className='gtg-member-payer-note';
  note.textContent='Members can only add expenses they personally paid.';
  field.appendChild(note);
 }
}

document.addEventListener('change',async event=>{
 const input=event.target?.closest?.('[data-gtg-member-expense-toggle]');
 if(!input)return;
 const ctx=await loadContext();
 if(!ctx?.owner)return;
 const wanted=Boolean(input.checked),previous=ctx.enabled;
 input.disabled=true;
 try{
  const {error}=await db().rpc('set_girls_member_expense_permission',{p_trip_id:ctx.trip.id,p_enabled:wanted});
  if(error)throw error;
  ctx.enabled=wanted;
  toast(wanted?'Members can now add their own expenses.':'Member expense entry is now off.');
 }catch(err){
  input.checked=previous;
  console.error('Girls member expense permission update failed',err);
  toast(err.message||'Could not update member expense permission.');
 }finally{input.disabled=false}
});

document.addEventListener('click',event=>{
 const moneyTab=event.target?.closest?.('[data-tab="money"],[data-parity-go="money"]');
 if(moneyTab)setTimeout(()=>void decorate(0),60);
 if(event.target?.closest?.('[data-gtg-member-add-expense],[data-a="addExpense"]'))setTimeout(()=>lockMemberPayer(0),0);
},true);

window.addEventListener('pageshow',()=>setTimeout(()=>void decorate(0),100));
window.addEventListener('popstate',()=>setTimeout(()=>void decorate(0),80));
window.addEventListener('gtg:core-data-ready',()=>{context=null;contextTripId='';setTimeout(()=>void decorate(0),60)});
installStyle();
setTimeout(()=>void decorate(0),100);
})();