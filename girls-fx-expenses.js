/* Girls local-currency expenses: direct-loaded controller over the authoritative core expense form. */
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
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const rateCache=new Map();
let client=null,tripCache=null,tripCacheId='',rowTimer=0;

function db(){if(!client&&window.supabase?.createClient)client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function tripId(){return new URL(location.href).searchParams.get('trip_id')||''}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function toast(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3600)}
function resetBusy(form){form?.removeAttribute?.('aria-busy');if(form?.dataset)delete form.dataset.actionBusy;const b=form?.querySelector?.('button[type="submit"],.modal-actions .btn.primary');if(!b)return;b.disabled=false;b.removeAttribute('aria-disabled');b.classList.remove('is-busy');if(b.dataset.busyOriginal){b.innerHTML=b.dataset.busyOriginal;delete b.dataset.busyOriginal}}
async function waitForSession(c,attempts=16){for(let i=0;i<attempts;i+=1){const {data,error}=await c.auth.getSession();if(error)throw error;if(data?.session?.access_token)return data.session;if(i<attempts-1)await sleep(100)}return null}
function recordId(form){return form?.querySelector?.('[name="__gtg_record_id"],[name="id"]')?.value||''}
function dedupePeople(form){const select=form?.querySelector?.('select[name="people"][multiple]');if(!select)return;const seen=new Set();[...select.options].forEach(option=>{const key=String(option.value||'').trim();if(!key||seen.has(key))option.remove();else seen.add(key)})}
function inferCurrency(destination){
 const s=String(destination||'').trim().toLowerCase();if(!s)return'';const has=(...xs)=>xs.some(x=>s.includes(x));
 if(has('north cyprus','northern cyprus','kyrenia','girne','famagusta','gazimağusa','gazimagusa','lefkoşa','lefkoşa'))return'TRY';
 if(has('ibiza','majorca','mallorca','menorca','spain','barcelona','madrid','marbella','tenerife','lanzarote','gran canaria','france','paris','nice','italy','rome','milan','florence','venice','portugal','lisbon','algarve','netherlands','amsterdam','germany','berlin','munich','greece','athens','crete','mykonos','santorini','cyprus','ireland','dublin','austria','vienna','belgium','brussels','croatia','split','dubrovnik','malta','finland','helsinki','estonia','latvia','lithuania','slovakia','slovenia','luxembourg'))return'EUR';
 if(has('turkey','türkiye','turkiye','istanbul','antalya','bodrum','marmaris','dalaman'))return'TRY';
 if(has('dubai','abu dhabi','uae','united arab emirates'))return'AED';
 if(has('united states','usa','new york','miami','las vegas','los angeles','orlando','hawaii'))return'USD';
 if(has('switzerland','zurich','geneva'))return'CHF';if(has('thailand','bangkok','phuket','koh samui','krabi'))return'THB';if(has('japan','tokyo','osaka','kyoto'))return'JPY';
 if(has('australia','sydney','melbourne','perth'))return'AUD';if(has('canada','toronto','vancouver','montreal'))return'CAD';if(has('new zealand','auckland','queenstown'))return'NZD';
 if(has('sweden','stockholm'))return'SEK';if(has('norway','oslo'))return'NOK';if(has('denmark','copenhagen'))return'DKK';if(has('poland','krakow','warsaw'))return'PLN';if(has('prague','czech'))return'CZK';if(has('budapest','hungary'))return'HUF';if(has('romania','bucharest'))return'RON';
 if(has('iceland','reykjavik'))return'ISK';if(has('south africa','cape town','johannesburg'))return'ZAR';if(has('morocco','marrakech','agadir'))return'MAD';if(has('egypt','cairo','sharm','hurghada'))return'EGP';
 if(has('mexico','cancun','tulum'))return'MXN';if(has('brazil','rio de janeiro','sao paulo','são paulo'))return'BRL';if(has('india','delhi','mumbai','goa'))return'INR';if(has('singapore'))return'SGD';if(has('hong kong'))return'HKD';if(has('indonesia','bali','jakarta'))return'IDR';if(has('malaysia','kuala lumpur'))return'MYR';if(has('china','beijing','shanghai'))return'CNY';if(has('south korea','seoul'))return'KRW';
 if(has('uk','united kingdom','england','scotland','wales','london','manchester','edinburgh','belfast'))return'GBP';return'';
}
function currencyOptions(selected){return CURRENCIES.map(c=>`<option value="${c}" ${c===selected?'selected':''}>${esc(c)} · ${esc(SYMBOL[c]||c)}</option>`).join('')}
function localMoney(value,currency){try{return new Intl.NumberFormat('en-GB',{style:'currency',currency,maximumFractionDigits:2}).format(Number(value||0))}catch{return`${currency} ${Number(value||0).toFixed(2)}`}}
function gbp(value){return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Number(value||0))}
async function trip(){const id=tripId(),c=db();if(!id||!c)return null;if(tripCache&&tripCacheId===id)return tripCache;const session=await waitForSession(c);if(!session)return null;const {data,error}=await c.from('trips').select('id,owner_id,product_key,destination,currency,currency_override').eq('id',id).eq('product_key','girls').maybeSingle();if(error)throw error;tripCache=data||null;tripCacheId=id;return tripCache}
function effectiveCurrency(t){if(!t)return'GBP';if(t.currency_override&&t.currency)return String(t.currency).toUpperCase();return inferCurrency(t.destination)||String(t.currency||'GBP').toUpperCase()}
async function fxRate(currency,amount){const code=String(currency||'GBP').toUpperCase();if(code==='GBP')return{rate:1,rate_date:new Date().toISOString().slice(0,10),source:'GBP',gbp_amount:Number(amount||0)};let cached=rateCache.get(code);if(cached)return{...cached,gbp_amount:Number(amount||0)*cached.rate};const c=db();if(!c)throw Error('Secure services did not load.');const session=await waitForSession(c);if(!session?.access_token)throw Error('Your session expired. Sign in again.');const res=await fetch(FX,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({from_currency:code,amount:Number(amount||0)})});const out=await res.json().catch(()=>({}));if(!res.ok||!Number(out.rate))throw Error(out.error||'Exchange rate unavailable.');cached={rate:Number(out.rate),rate_date:String(out.rate_date||new Date().toISOString().slice(0,10)),source:String(out.source||'FX rate')};rateCache.set(code,cached);return{...cached,gbp_amount:Number(amount||0)*cached.rate}}
function installStyles(){if(document.getElementById('gtg-fx-expense-css'))return;const s=document.createElement('style');s.id='gtg-fx-expense-css';s.textContent=`#expenseForm .gtg-fx-preview{margin:-2px 0 4px;padding:10px 12px;border:1px solid rgba(255,79,163,.22);border-radius:11px;background:#fff8fb;color:#75636c;font-size:11px;line-height:1.45}#expenseForm .gtg-fx-preview b{color:#191316}.gtg-local-spend{margin-top:4px;color:#9a7487;font-size:10px;line-height:1.35}.gtg-currency-note{margin-top:5px;color:#9a7487;font-size:10px;line-height:1.35}`;document.head.appendChild(s)}

async function enhanceExpense(form){
 if(!form||form.dataset.gtgFxReady==='1'||form.dataset.gtgFxLoading==='1')return form?.dataset.gtgFxReady==='1';
 form.dataset.gtgFxOwned='1';form.dataset.gtgFxLoading='1';dedupePeople(form);installStyles();
 const submit=form.querySelector('button[type="submit"],.modal-actions .btn.primary');if(submit)submit.disabled=true;
 try{
  const t=await trip();if(!t)throw Error('Trip could not be loaded.');
  const id=recordId(form);let existing=null;if(id){const {data,error}=await db().from('expenses').select('id,amount,original_amount,original_currency,gbp_rate,fx_rate_date,fx_source').eq('id',id).eq('trip_id',t.id).maybeSingle();if(error)throw error;existing=data||null}
  const amount=form.querySelector('input[name="amount"]');if(!amount)throw Error('Amount field is unavailable.');const amountField=amount.closest('.field');if(!amountField)throw Error('Amount field layout is unavailable.');
  const currency=String(existing?.original_currency||effectiveCurrency(t)||'GBP').toUpperCase();if(existing?.original_amount!=null)amount.value=String(existing.original_amount);
  const label=amountField.querySelector('label');if(label)label.textContent=`Amount (${currency})`;
  form.querySelector('.gtg-fx-currency')?.remove();form.querySelector('.gtg-fx-preview')?.remove();
  const currencyField=document.createElement('div');currencyField.className='field gtg-fx-currency';currencyField.innerHTML=`<label>Currency</label><select name="currency">${currencyOptions(currency)}</select><div class="gtg-currency-note">${t.currency_override?'Trip currency set by organiser':inferCurrency(t.destination)?`Suggested from ${esc(t.destination)}`:'Choose the currency you paid in'}</div>`;amountField.insertAdjacentElement('beforebegin',currencyField);
  const preview=document.createElement('div');preview.className='gtg-fx-preview';preview.textContent='Enter the amount to see the GBP equivalent.';amountField.insertAdjacentElement('afterend',preview);
  const select=currencyField.querySelector('select');let timer=0;
  const update=()=>{clearTimeout(timer);timer=setTimeout(async()=>{const code=String(select.value||'GBP').toUpperCase(),number=Number(amount.value||0);if(label)label.textContent=`Amount (${code})`;if(!(number>0)){preview.textContent='Enter the amount to see the GBP equivalent.';return}preview.textContent='Checking exchange rate…';try{const fx=await fxRate(code,number);preview.innerHTML=code==='GBP'?`Recorded as <b>${gbp(number)}</b>.`:`${localMoney(number,code)} ≈ <b>${gbp(fx.gbp_amount)}</b><br>Rate ${fx.rate.toFixed(6)} · ${esc(fx.rate_date)} · locked when saved.`}catch(err){preview.textContent=err.message||'Exchange rate unavailable.'}},220)};
  select.addEventListener('change',()=>{rateCache.delete(select.value);update();requestAnimationFrame(()=>select.blur())});amount.addEventListener('input',update);
  form.dataset.gtgFxReady='1';dedupePeople(form);if(submit)submit.disabled=false;update();return true;
 }catch(err){console.error('Girls FX expense setup failed',err);toast(err.message||'Could not prepare currency conversion.');if(submit)submit.disabled=false;return false}finally{delete form.dataset.gtgFxLoading}
}

async function saveExpense(form){
 const ready=form.dataset.gtgFxReady==='1'||await enhanceExpense(form);if(!ready)throw Error('Currency conversion is not ready.');
 const c=db(),t=await trip();if(!c||!t)throw Error('Trip could not be loaded.');dedupePeople(form);
 const amount=Number(form.querySelector('input[name="amount"]')?.value||0),currency=String(form.querySelector('select[name="currency"]')?.value||effectiveCurrency(t)).toUpperCase(),description=String(form.querySelector('input[name="description"]')?.value||'').trim(),payer=String(form.querySelector('select[name="payer"]')?.value||''),peopleSelect=form.querySelector('select[name="people"][multiple]'),people=[...new Set([...(peopleSelect?.selectedOptions||[])].map(o=>o.value).filter(Boolean))],existing=recordId(form)||null;
 if(!description)throw Error('What was it? is required.');if(!(amount>0))throw Error('Enter the amount you paid.');if(!payer)throw Error('Choose who paid.');if(!people.length)throw Error('Choose at least one group member.');
 let settled=[];if(existing){const {data,error}=await c.from('expense_participants').select('member_id,settled_at').eq('expense_id',existing).eq('trip_id',t.id);if(error)throw error;settled=(data||[]).filter(x=>x.settled_at&&people.includes(x.member_id)).map(x=>x.member_id)}
 const fx=await fxRate(currency,amount);const {error}=await c.rpc('save_girls_expense_fx',{p_expense_id:existing,p_trip_id:t.id,p_description:description,p_local_amount:amount,p_currency:currency,p_gbp_rate:fx.rate,p_rate_date:fx.rate_date,p_fx_source:fx.source,p_payer_member_id:payer,p_participant_ids:people,p_settled_member_ids:settled});if(error)throw error;
 if(!t.currency_override){await c.from('trips').update({currency}).eq('id',t.id).eq('product_key','girls').eq('currency_override',false).catch(()=>{});tripCache={...t,currency}}
 location.reload();
}

async function enhanceTripSettings(form){if(!form||form.dataset.gtgCurrencyReady==='1'||form.dataset.gtgCurrencyLoading==='1')return;form.dataset.gtgCurrencyLoading='1';try{const t=await trip();if(!t)return;const destination=form.querySelector('input[name="destination"]');if(!destination)return;const chosen=effectiveCurrency(t);form.querySelector('.gtg-trip-currency')?.remove();const field=document.createElement('div');field.className='field gtg-trip-currency';field.innerHTML=`<label>Trip spending currency</label><select name="tripCurrency">${currencyOptions(chosen)}</select><div class="gtg-currency-note">Suggested from destination. You can override it.</div>`;destination.closest('.field')?.insertAdjacentElement('afterend',field);const select=field.querySelector('select');let manual=false;select.addEventListener('change',()=>{manual=true;requestAnimationFrame(()=>select.blur())});destination.addEventListener('input',()=>{if(manual)return;const suggested=inferCurrency(destination.value);if(suggested&&CURRENCIES.includes(suggested))select.value=suggested});form.dataset.gtgCurrencyReady='1'}catch(err){console.warn('Girls trip currency setting unavailable',err)}finally{delete form.dataset.gtgCurrencyLoading}}
async function saveTripSettings(form){const c=db(),t=await trip();if(!c||!t)throw Error('Trip could not be loaded.');if(form.dataset.gtgCurrencyReady!=='1')await enhanceTripSettings(form);const d=new FormData(form),currency=String(d.get('tripCurrency')||effectiveCurrency(t)).toUpperCase();const {error}=await c.from('trips').update({name:String(d.get('name')||'').trim(),destination:String(d.get('destination')||'').trim(),start_date:d.get('start'),end_date:d.get('end'),currency,currency_override:true}).eq('id',t.id).eq('product_key','girls');if(error)throw error;tripCache=null;toast('Trip settings saved.');location.reload()}
async function annotateExpenses(){clearTimeout(rowTimer);const root=document.querySelector('.panel[data-panel="money"].active');if(!root)return;try{const t=await trip();if(!t)return;const {data,error}=await db().from('expenses').select('id,amount,original_amount,original_currency,gbp_rate,fx_rate_date').eq('trip_id',t.id).order('created_at');if(error)throw error;const rows=[...root.querySelectorAll('.balance-grid>.card:first-child .money-row')];(data||[]).forEach((e,i)=>{const row=rows[i];if(!row)return;row.querySelector('.gtg-local-spend')?.remove();const code=String(e.original_currency||'GBP').toUpperCase();if(code==='GBP'||e.original_amount==null)return;const note=document.createElement('div');note.className='gtg-local-spend';note.textContent=`${localMoney(e.original_amount,code)} local · rate ${Number(e.gbp_rate||0).toFixed(6)} · ${e.fx_rate_date||''}`;row.querySelector('div:first-child')?.appendChild(note)})}catch(err){console.warn('Girls FX expense labels unavailable',err)}}
function scheduleRows(ms=300){clearTimeout(rowTimer);rowTimer=setTimeout(()=>void annotateExpenses(),ms)}
function scanModal(){const root=document.getElementById('modalRoot')||document.getElementById('modal-root');if(!root)return;const expense=root.querySelector('#expenseForm');if(expense){dedupePeople(expense);void enhanceExpense(expense)}void enhanceTripSettings(root.querySelector('#editTripForm'))}

const modal=document.getElementById('modalRoot')||document.getElementById('modal-root');if(modal)new MutationObserver(()=>queueMicrotask(scanModal)).observe(modal,{childList:true,subtree:true});
document.addEventListener('submit',event=>{const form=event.target;if(!(form instanceof HTMLFormElement))return;if(form.id==='expenseForm'){event.preventDefault();event.stopImmediatePropagation();void saveExpense(form).catch(err=>{console.error(err);resetBusy(form);toast(err.message||'Could not save expense.')});return}if(form.id==='editTripForm'){event.preventDefault();event.stopImmediatePropagation();void saveTripSettings(form).catch(err=>{console.error(err);resetBusy(form);toast(err.message||'Could not save trip settings.')})}},true);
document.addEventListener('click',event=>{if(event.target.closest?.('[data-tab="money"]'))scheduleRows(500);if(event.target.closest?.('[data-a="addExpense"],[data-a="editTrip"]'))setTimeout(scanModal,0)},true);
window.addEventListener('pageshow',()=>{scanModal();scheduleRows(700)});window.addEventListener('popstate',()=>scheduleRows(400));installStyles();scanModal();scheduleRows(900);
if(window.__GTG_FX_TEST__)window.__GTG_FX_TEST_HOOKS__={inferCurrency,effectiveCurrency};
})();
