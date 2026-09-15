/* Girls local-currency expenses: authoritative Add Expense flow. */
(()=>{
'use strict';
if(window.__GTG_FX_EXPENSES__)return;
window.__GTG_FX_EXPENSES__=true;
window.__GTG_FX_EXPENSES_NATIVE__=true;

const URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const FX=`${URL}/functions/v1/girls-fx-rate`;
const CURRENCIES=['GBP','EUR','USD','TRY','AED','CHF','JPY','THB','AUD','CAD','NZD','SEK','NOK','DKK','PLN','CZK','HUF','RON','ISK','ZAR','MAD','EGP','MXN','BRL','INR','SGD','HKD','IDR','MYR','CNY','KRW'];
const SYMBOL={GBP:'£',EUR:'€',USD:'$',TRY:'₺',AED:'د.إ',CHF:'CHF',JPY:'¥',THB:'฿',AUD:'A$',CAD:'C$',NZD:'NZ$',SEK:'kr',NOK:'kr',DKK:'kr',PLN:'zł',CZK:'Kč',HUF:'Ft',RON:'lei',ISK:'kr',ZAR:'R',MAD:'DH',EGP:'E£',MXN:'Mex$',BRL:'R$',INR:'₹',SGD:'S$',HKD:'HK$',IDR:'Rp',MYR:'RM',CNY:'¥',KRW:'₩'};
let client=null,tripCache=null,tripCacheId='',rowTimer=0;
const rateCache=new Map();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function db(){
 if(!client&&window.supabase?.createClient)client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return client;
}
function tripId(){return new URL(location.href).searchParams.get('trip_id')||''}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function toast(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3600)}
function resetBusy(form){form?.removeAttribute?.('aria-busy');if(form?.dataset)delete form.dataset.actionBusy;const b=form?.querySelector?.('button[type="submit"],.modal-actions .btn.primary');if(!b)return;b.disabled=false;b.removeAttribute('aria-disabled');b.classList.remove('is-busy');if(b.dataset.busyOriginal){b.innerHTML=b.dataset.busyOriginal;delete b.dataset.busyOriginal}}
async function waitForSession(c,attempts=16){
 for(let i=0;i<attempts;i+=1){const {data,error}=await c.auth.getSession();if(error)throw error;if(data?.session?.access_token)return data.session;if(i<attempts-1)await sleep(100)}
 return null;
}
function dedupePeople(selectOrForm){
 const select=selectOrForm?.matches?.('select[name="people"][multiple]')?selectOrForm:selectOrForm?.querySelector?.('select[name="people"][multiple]');
 if(!select)return;
 const seen=new Set();
 [...select.options].forEach(option=>{const key=String(option.value||'').trim();if(!key||seen.has(key))option.remove();else seen.add(key)});
}
function inferCurrency(destination){
 const s=String(destination||'').trim().toLowerCase();if(!s)return'';
 const has=(...xs)=>xs.some(x=>s.includes(x));
 if(has('north cyprus','northern cyprus','kyrenia','girne','famagusta','gazimağusa','gazimagusa','lefkoşa','lefkoşa'))return'TRY';
 if(has('ibiza','majorca','mallorca','menorca','spain','barcelona','madrid','marbella','tenerife','lanzarote','gran canaria','france','paris','nice','italy','rome','milan','florence','venice','portugal','lisbon','algarve','netherlands','amsterdam','germany','berlin','munich','greece','athens','crete','mykonos','santorini','cyprus','ireland','dublin','austria','vienna','belgium','brussels','croatia','split','dubrovnik','malta','finland','helsinki','estonia','latvia','lithuania','slovakia','slovenia','luxembourg'))return'EUR';
 if(has('turkey','türkiye','turkiye','istanbul','antalya','bodrum','marmaris','dalaman'))return'TRY';
 if(has('dubai','abu dhabi','uae','united arab emirates'))return'AED';
 if(has('united states','usa','new york','miami','las vegas','los angeles','orlando','hawaii'))return'USD';
 if(has('switzerland','zurich','geneva'))return'CHF';
 if(has('thailand','bangkok','phuket','koh samui','krabi'))return'THB';
 if(has('japan','tokyo','osaka','kyoto'))return'JPY';
 if(has('australia','sydney','melbourne','perth'))return'AUD';
 if(has('canada','toronto','vancouver','montreal'))return'CAD';
 if(has('new zealand','auckland','queenstown'))return'NZD';
 if(has('sweden','stockholm'))return'SEK';if(has('norway','oslo'))return'NOK';if(has('denmark','copenhagen'))return'DKK';
 if(has('poland','krakow','warsaw'))return'PLN';if(has('prague','czech'))return'CZK';if(has('budapest','hungary'))return'HUF';if(has('romania','bucharest'))return'RON';
 if(has('iceland','reykjavik'))return'ISK';if(has('south africa','cape town','johannesburg'))return'ZAR';if(has('morocco','marrakech','agadir'))return'MAD';if(has('egypt','cairo','sharm','hurghada'))return'EGP';
 if(has('mexico','cancun','tulum'))return'MXN';if(has('brazil','rio de janeiro','sao paulo','são paulo'))return'BRL';if(has('india','delhi','mumbai','goa'))return'INR';
 if(has('singapore'))return'SGD';if(has('hong kong'))return'HKD';if(has('indonesia','bali','jakarta'))return'IDR';if(has('malaysia','kuala lumpur'))return'MYR';if(has('china','beijing','shanghai'))return'CNY';if(has('south korea','seoul'))return'KRW';
 if(has('uk','united kingdom','england','scotland','wales','london','manchester','edinburgh','belfast'))return'GBP';
 return'';
}
function currencyOptions(selected){return CURRENCIES.map(c=>`<option value="${c}" ${c===selected?'selected':''}>${esc(c)} · ${esc(SYMBOL[c]||c)}</option>`).join('')}
function localMoney(value,currency){try{return new Intl.NumberFormat('en-GB',{style:'currency',currency,maximumFractionDigits:2}).format(Number(value||0))}catch{return`${currency} ${Number(value||0).toFixed(2)}`}}
function gbp(value){return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Number(value||0))}
async function trip(){
 const id=tripId(),c=db();if(!id||!c)return null;if(tripCache&&tripCacheId===id)return tripCache;
 const session=await waitForSession(c);if(!session)return null;
 const {data,error}=await c.from('trips').select('id,owner_id,product_key,destination,currency,currency_override').eq('id',id).eq('product_key','girls').maybeSingle();if(error)throw error;
 tripCache=data||null;tripCacheId=id;return tripCache;
}
async function tripMembers(id){
 const c=db();if(!c)return[];const {data,error}=await c.from('trip_members').select('id,name,status,role,created_at').eq('trip_id',id).order('created_at');if(error)throw error;
 const seen=new Set();return(data||[]).filter(m=>{const key=String(m.id||'');if(!key||seen.has(key))return false;seen.add(key);return true});
}
function effectiveCurrency(t){if(!t)return'GBP';if(t.currency_override&&t.currency)return String(t.currency).toUpperCase();return inferCurrency(t.destination)||String(t.currency||'GBP').toUpperCase()}
async function fxRate(currency,amount){
 const code=String(currency||'GBP').toUpperCase();if(code==='GBP')return{rate:1,rate_date:new Date().toISOString().slice(0,10),source:'GBP',gbp_amount:Number(amount||0)};
 let cached=rateCache.get(code);if(cached)return{...cached,gbp_amount:Number(amount||0)*cached.rate};
 const c=db();if(!c)throw Error('Secure services did not load.');const session=await waitForSession(c);if(!session?.access_token)throw Error('Your session expired. Sign in again.');
 const res=await fetch(FX,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({from_currency:code,amount:Number(amount||0)})});
 const out=await res.json().catch(()=>({}));if(!res.ok||!Number(out.rate))throw Error(out.error||'Exchange rate unavailable.');cached={rate:Number(out.rate),rate_date:String(out.rate_date||new Date().toISOString().slice(0,10)),source:String(out.source||'FX rate')};rateCache.set(code,cached);return{...cached,gbp_amount:Number(amount||0)*cached.rate};
}
function installStyles(){
 if(document.getElementById('gtg-fx-expense-css'))return;
 const s=document.createElement('style');s.id='gtg-fx-expense-css';s.textContent=`#expenseForm .gtg-fx-preview{margin:-2px 0 4px;padding:10px 12px;border:1px solid rgba(255,79,163,.22);border-radius:11px;background:#fff8fb;color:#75636c;font-size:11px;line-height:1.45}#expenseForm .gtg-fx-preview b{color:#191316}.gtg-local-spend{margin-top:4px;color:#9a7487;font-size:10px;line-height:1.35}.gtg-currency-note{margin-top:5px;color:#9a7487;font-size:10px;line-height:1.35}#expenseForm .gtg-expense-split-checks{display:grid;gap:8px}#expenseForm .gtg-expense-split-option{display:flex;align-items:center;gap:10px;min-height:44px;padding:10px 12px;border:1px solid rgba(255,79,163,.28);border-radius:12px;background:#fff;font-weight:600;cursor:pointer}#expenseForm .gtg-expense-split-option input{width:18px;height:18px;margin:0;flex:0 0 auto;accent-color:#ff4fa3}`;document.head.appendChild(s);
}
function expenseMarkup(t,members){
 const currency=effectiveCurrency(t);const opts=members.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('');const split=members.map(m=>`<label class="gtg-expense-split-option"><input type="checkbox" data-gtg-split-member="${esc(m.id)}" checked><span>${esc(m.name)}</span></label>`).join('');
 return `<div class="modal"><h2>Add expense</h2><form id="expenseForm" class="form" data-gtg-fx-native="1" data-gtg-fx-ready="1"><div class="field"><label>What was it?</label><input name="description" type="text" required></div><div class="field gtg-fx-currency"><label>Currency</label><select name="currency">${currencyOptions(currency)}</select><div class="gtg-currency-note">${t.currency_override?'Trip currency set by organiser':inferCurrency(t.destination)?`Suggested from ${esc(t.destination)}`:'Choose the currency you paid in'}</div></div><div class="field"><label data-gtg-amount-label>Amount (${esc(currency)})</label><input name="amount" type="number" required min="0.01" step="0.01" inputmode="decimal" placeholder="0.00"></div><div class="gtg-fx-preview">Enter the amount to see the GBP equivalent.</div><div class="field"><label>Paid by</label><select name="payer" required>${opts}</select></div><div class="field"><label>Split between</label><select name="people" multiple data-gtg-checkbox-source="1" style="display:none" aria-hidden="true" tabindex="-1">${members.map(m=>`<option value="${esc(m.id)}" selected>${esc(m.name)}</option>`).join('')}</select><div class="gtg-expense-split-checks" data-expense-split-checks="1">${split}</div></div><div class="modal-actions"><button type="button" class="btn" data-a="close">Cancel</button><button type="submit" class="btn primary">Save</button></div></form></div>`;
}
function syncSplit(form){
 const people=form.querySelector('select[name="people"][multiple]');if(!people)return;dedupePeople(people);
 form.querySelectorAll('[data-gtg-split-member]').forEach(box=>{const option=[...people.options].find(o=>o.value===box.dataset.gtgSplitMember);if(option)option.selected=box.checked});
}
function bindExpenseForm(form,t){
 if(!form)return;installStyles();dedupePeople(form);
 const amount=form.querySelector('input[name="amount"]'),currency=form.querySelector('select[name="currency"]'),label=form.querySelector('[data-gtg-amount-label]'),preview=form.querySelector('.gtg-fx-preview'),payer=form.querySelector('select[name="payer"]');let timer=0;
 const update=()=>{clearTimeout(timer);timer=setTimeout(async()=>{const code=String(currency.value||'GBP').toUpperCase(),number=Number(amount.value||0);if(label)label.textContent=`Amount (${code})`;if(!(number>0)){preview.textContent='Enter the amount to see the GBP equivalent.';return}preview.textContent='Checking exchange rate…';try{const fx=await fxRate(code,number);preview.innerHTML=code==='GBP'?`Recorded as <b>${gbp(number)}</b>.`:`${localMoney(number,code)} ≈ <b>${gbp(fx.gbp_amount)}</b><br>Rate ${fx.rate.toFixed(6)} · ${esc(fx.rate_date)} · locked when saved.`}catch(err){preview.textContent=err.message||'Exchange rate unavailable.'}},220)};
 currency.addEventListener('change',()=>{rateCache.delete(currency.value);update();requestAnimationFrame(()=>currency.blur())});amount.addEventListener('input',update);payer?.addEventListener('change',()=>requestAnimationFrame(()=>payer.blur()));form.querySelectorAll('[data-gtg-split-member]').forEach(box=>box.addEventListener('change',()=>syncSplit(form)));
 form.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();syncSplit(form);void saveExpense(form,t).catch(err=>{console.error(err);resetBusy(form);toast(err.message||'Could not save expense.')})},true);
 update();
}
async function saveExpense(form,t){
 const c=db();if(!c||!t)throw Error('Trip could not be loaded.');const amount=Number(form.querySelector('input[name="amount"]')?.value||0),currency=String(form.querySelector('select[name="currency"]')?.value||effectiveCurrency(t)).toUpperCase(),description=String(form.querySelector('input[name="description"]')?.value||'').trim(),payer=String(form.querySelector('select[name="payer"]')?.value||''),peopleSelect=form.querySelector('select[name="people"][multiple]'),people=[...new Set([...(peopleSelect?.selectedOptions||[])].map(o=>o.value).filter(Boolean))];
 if(!description)throw Error('What was it? is required.');if(!(amount>0))throw Error('Enter the amount you paid.');if(!payer)throw Error('Choose who paid.');if(!people.length)throw Error('Choose at least one group member.');
 const fx=await fxRate(currency,amount);const {error}=await c.rpc('save_girls_expense_fx',{p_expense_id:null,p_trip_id:t.id,p_description:description,p_local_amount:amount,p_currency:currency,p_gbp_rate:fx.rate,p_rate_date:fx.rate_date,p_fx_source:fx.source,p_payer_member_id:payer,p_participant_ids:people,p_settled_member_ids:[]});if(error)throw error;
 if(!t.currency_override){await c.from('trips').update({currency}).eq('id',t.id).eq('product_key','girls').eq('currency_override',false).catch(()=>{});tripCache={...t,currency}}
 location.reload();
}
async function openNativeExpense(){
 const root=document.getElementById('modalRoot')||document.getElementById('modal-root');if(!root)throw Error('Expense window could not be opened.');installStyles();root.innerHTML='<div class="modal"><h2>Add expense</h2><div class="empty">Loading…</div></div>';root.classList.add('open');
 const t=await trip();if(!t)throw Error('Trip could not be loaded.');const members=await tripMembers(t.id);if(!members.length)throw Error('No group members are available for this trip.');root.innerHTML=expenseMarkup(t,members);root.classList.add('open');const form=root.querySelector('#expenseForm');bindExpenseForm(form,t);requestAnimationFrame(()=>form?.querySelector('input[name="description"]')?.focus());
}
async function enhanceTripSettings(form){
 if(!form||form.dataset.gtgCurrencyReady==='1'||form.dataset.gtgCurrencyLoading==='1')return;form.dataset.gtgCurrencyLoading='1';
 try{const t=await trip();if(!t)return;const destination=form.querySelector('input[name="destination"]');if(!destination)return;const chosen=effectiveCurrency(t);form.querySelector('.gtg-trip-currency')?.remove();const field=document.createElement('div');field.className='field gtg-trip-currency';field.innerHTML=`<label>Trip spending currency</label><select name="tripCurrency">${currencyOptions(chosen)}</select><div class="gtg-currency-note">Suggested from destination. You can override it.</div>`;destination.closest('.field')?.insertAdjacentElement('afterend',field);const select=field.querySelector('select');let manual=false;select.addEventListener('change',()=>{manual=true;requestAnimationFrame(()=>select.blur())});destination.addEventListener('input',()=>{if(manual)return;const suggested=inferCurrency(destination.value);if(suggested&&CURRENCIES.includes(suggested))select.value=suggested});form.dataset.gtgCurrencyReady='1'}catch(err){console.warn('Girls trip currency setting unavailable',err)}finally{delete form.dataset.gtgCurrencyLoading}
}
async function saveTripSettings(form){
 const c=db(),t=await trip();if(!c||!t)throw Error('Trip could not be loaded.');const d=new FormData(form),currency=String(d.get('tripCurrency')||effectiveCurrency(t)).toUpperCase();const {error}=await c.from('trips').update({name:String(d.get('name')||'').trim(),destination:String(d.get('destination')||'').trim(),start_date:d.get('start'),end_date:d.get('end'),currency,currency_override:true}).eq('id',t.id).eq('product_key','girls');if(error)throw error;tripCache=null;toast('Trip settings saved.');location.reload();
}
async function annotateExpenses(){
 clearTimeout(rowTimer);const root=document.querySelector('.panel[data-panel="money"].active');if(!root)return;try{const t=await trip();if(!t)return;const {data,error}=await db().from('expenses').select('id,amount,original_amount,original_currency,gbp_rate,fx_rate_date').eq('trip_id',t.id).order('created_at');if(error)throw error;const rows=[...root.querySelectorAll('.balance-grid>.card:first-child .money-row')];(data||[]).forEach((e,i)=>{const row=rows[i];if(!row)return;row.querySelector('.gtg-local-spend')?.remove();const code=String(e.original_currency||'GBP').toUpperCase();if(code==='GBP'||e.original_amount==null)return;const note=document.createElement('div');note.className='gtg-local-spend';note.textContent=`${localMoney(e.original_amount,code)} local · rate ${Number(e.gbp_rate||0).toFixed(6)} · ${e.fx_rate_date||''}`;row.querySelector('div:first-child')?.appendChild(note)})}catch(err){console.warn('Girls FX expense labels unavailable',err)}
}
function scheduleRows(ms=300){clearTimeout(rowTimer);rowTimer=setTimeout(()=>void annotateExpenses(),ms)}
function scanModal(){
 const root=document.getElementById('modalRoot')||document.getElementById('modal-root');if(!root)return;void enhanceTripSettings(root.querySelector('#editTripForm'));
 const legacy=root.querySelector('#expenseForm:not([data-gtg-fx-native="1"])');if(legacy)void openNativeExpense().catch(err=>{console.error(err);toast(err.message||'Could not open expense.')});
}

document.addEventListener('click',event=>{
 const target=event.target.closest?.('[data-a="addExpense"],[data-action="addExpense"],[data-parity-existing="addExpense"]');if(!target)return;
 event.preventDefault();event.stopImmediatePropagation();void openNativeExpense().catch(err=>{console.error(err);toast(err.message||'Could not open expense.')});
},true);
document.addEventListener('submit',event=>{const form=event.target;if(!(form instanceof HTMLFormElement)||form.id!=='editTripForm'||form.dataset.gtgCurrencyReady!=='1')return;event.preventDefault();event.stopImmediatePropagation();void saveTripSettings(form).catch(err=>{console.error(err);resetBusy(form);toast(err.message||'Could not save trip settings.')})},true);
document.addEventListener('click',event=>{if(event.target.closest?.('[data-tab="money"]'))scheduleRows(500)},true);
const modal=document.getElementById('modalRoot')||document.getElementById('modal-root');if(modal)new MutationObserver(()=>queueMicrotask(scanModal)).observe(modal,{childList:true,subtree:true});
window.addEventListener('pageshow',()=>scheduleRows(700));window.addEventListener('popstate',()=>scheduleRows(400));installStyles();scanModal();scheduleRows(900);

if(window.__GTG_FX_TEST__)window.__GTG_FX_TEST_HOOKS__={inferCurrency,effectiveCurrency,expenseMarkup};
})();
