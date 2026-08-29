(()=>{
'use strict';
const URL='https://vtcmvwixfqyxqghibsla.supabase.co',KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,timer=0,rendering=false;
const money=v=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Number(v||0));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
function db(){if(!client&&window.supabase?.createClient)client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function tripId(){return new URLSearchParams(location.search).get('trip_id')||''}
function toast(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000)}
function installStyles(){if(document.getElementById('gtg-payment-nudge-css'))return;const s=document.createElement('style');s.id='gtg-payment-nudge-css';s.textContent=`
.gtg-payment-nudges{margin:14px 0 22px}.gtg-payment-nudges-head{margin-bottom:12px}.gtg-payment-nudges-head h3{margin:5px 0 5px;font:800 28px/1 'Barlow Condensed',sans-serif;text-transform:uppercase}.gtg-payment-nudges-head p{margin:0;color:var(--muted);font-size:12px}.gtg-nudge-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.gtg-nudge-card{border:1px solid var(--line);border-radius:15px;background:#0d090d;padding:15px}.gtg-nudge-card small{display:block;color:var(--muted);font-size:10px}.gtg-nudge-card strong{display:block;margin:5px 0 10px;font:800 25px/1 'Barlow Condensed',sans-serif}.gtg-nudge-card.owes strong{color:#ff9ba6}.gtg-nudge-card.owed strong{color:var(--pink2)}.gtg-nudge-note{margin-bottom:12px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:rgba(255,79,163,.06);color:var(--muted);font-size:11px;line-height:1.5}.gtg-nudge-note b{color:var(--pink2)}.gtg-nudge-card .btn{width:100%;margin-top:2px}
@media(max-width:600px){.gtg-nudge-grid{grid-template-columns:1fr 1fr}.gtg-nudge-card{padding:13px}.gtg-nudge-card strong{font-size:22px}.gtg-nudge-card .btn{padding:9px 6px;font-size:9px}}
`;document.head.append(s)}
function compute(members,bookings,bp,expenses,ep){
 const map=new Map(members.map(m=>[m.id,0]));
 const apply=(rows,people,amountKey)=>{for(const row of rows){const payer=row.payer_member_id;if(!payer||!map.has(payer))continue;const ps=people.filter(p=>p[amountKey==='total_cost'?'booking_id':'expense_id']===row.id);if(!ps.length)continue;const share=Number(row[amountKey]||0)/ps.length;if(!Number.isFinite(share)||share<=0)continue;for(const p of ps){if(p.member_id===payer||p.settled_at||!map.has(p.member_id))continue;map.set(payer,map.get(payer)+share);map.set(p.member_id,map.get(p.member_id)-share)}}};
 apply(bookings,bp,'total_cost');apply(expenses,ep,'amount');return map;
}
async function snapshot(){
 const c=db(),id=tripId();if(!c||!id)return null;const {data:{user}}=await c.auth.getUser();if(!user)return null;
 const q=await Promise.all([
  c.from('trips').select('id,owner_id,product_key').eq('id',id).maybeSingle(),c.from('trip_members').select('id,name,email,user_id,role').eq('trip_id',id),c.from('bookings').select('id,total_cost,payer_member_id').eq('trip_id',id),c.from('booking_participants').select('booking_id,member_id,settled_at').eq('trip_id',id),c.from('expenses').select('id,amount,payer_member_id').eq('trip_id',id),c.from('expense_participants').select('expense_id,member_id,settled_at').eq('trip_id',id)
 ]);if(q.some(x=>x.error))throw q.find(x=>x.error).error;const [t,m,b,bp,e,ep]=q;if(!t.data||t.data.product_key!=='girls'||t.data.owner_id!==user.id)return null;
 return {user,trip:t.data,members:m.data||[],bookings:b.data||[],bp:bp.data||[],expenses:e.data||[],ep:ep.data||[]};
}
async function render(){
 clearTimeout(timer);if(rendering)return;const root=document.querySelector('.panel[data-panel="money"].active');if(!root)return;rendering=true;installStyles();
 try{const s=await snapshot();if(!s)return;const balances=compute(s.members,s.bookings,s.bp,s.expenses,s.ep),unresolved=s.bookings.filter(x=>Number(x.total_cost||0)>0&&!x.payer_member_id).length+s.expenses.filter(x=>Number(x.amount||0)>0&&!x.payer_member_id).length;
  document.querySelector('[data-girls-payment-nudges]')?.remove();const panel=document.createElement('section');panel.className='gtg-payment-nudges';panel.dataset.girlsPaymentNudges='1';
  panel.innerHTML=`<div class="gtg-payment-nudges-head"><div class="eyebrow">Payment nudges</div><h3>Who still owes?</h3><p>Send a private reminder to anyone with a genuine outstanding share.</p></div>${unresolved?`<div class="gtg-nudge-note"><b>Confirm who paid first.</b> ${unresolved} cost${unresolved===1?'':'s'} still ${unresolved===1?'has':'have'} no payer, so ${unresolved===1?'it is':'they are'} not treated as personal debt yet.</div>`:''}<div class="gtg-nudge-grid">${s.members.map(m=>{const net=balances.get(m.id)||0,can=net<-.01&&m.email&&m.user_id!==s.user.id;return `<article class="gtg-nudge-card ${net<-.01?'owes':'owed'}"><small>${esc(m.name)}</small><strong>${net>=0?'+':''}${money(net)}</strong>${can?`<button class="btn" type="button" data-girls-payment-nudge="${m.id}">Nudge payment</button>`:''}</article>`}).join('')}</div>`;
  const summary=root.querySelector('[data-parity-block="money"]');if(summary)summary.insertAdjacentElement('afterend',panel);else root.prepend(panel);
 }catch(error){console.warn('Girls payment nudge panel unavailable',error)}finally{rendering=false}
}
function schedule(ms=180){clearTimeout(timer);timer=setTimeout(()=>void render(),ms)}
async function send(button){const c=db(),id=tripId();if(!c||!id)return;button.disabled=true;button.textContent='Sending…';try{const {data:{session}}=await c.auth.getSession();if(!session?.access_token)throw new Error('Your session expired. Sign in again.');const response=await fetch(`${URL}/functions/v1/girls-payment-nudge`,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({tripId:id,recipientMemberId:button.dataset.girlsPaymentNudge})});const out=await response.json().catch(()=>({}));if(!response.ok||!out.ok)throw new Error(out.error||'Payment nudge could not be sent.');button.textContent='Sent';toast(out.sent===false?'Payment nudge queued.':'Payment nudge sent.')}catch(error){button.disabled=false;button.textContent='Nudge payment';toast(error?.message||'Payment nudge could not be sent.')}}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-girls-payment-nudge]');if(b){e.preventDefault();e.stopPropagation();void send(b);return}if(e.target.closest?.('[data-tab="money"],[data-a="addExpense"],[data-a="editBooking"],[data-a="manageExpense"],[data-a="manageBookingMoney"]'))schedule(350)},true);
document.addEventListener('submit',()=>schedule(1000),true);window.addEventListener('pageshow',()=>schedule(600));window.addEventListener('popstate',()=>schedule(350));setTimeout(()=>schedule(0),900);setTimeout(()=>schedule(0),2200);
})();
