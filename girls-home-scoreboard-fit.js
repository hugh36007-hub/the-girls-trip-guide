/* Girls Home poll scoreboard fit + compact top-summary refinement. */
(()=>{
'use strict';
if(window.__GTG_HOME_SCOREBOARD_FIT__)return;window.__GTG_HOME_SCOREBOARD_FIT__=true;
if(document.getElementById('gtg-home-scoreboard-fit-css'))return;
const style=document.createElement('style');
style.id='gtg-home-scoreboard-fit-css';
style.textContent=`
.dashboard .hero-card .gtg-home-score-v3{
  top:auto!important;
  right:auto!important;
  left:14px!important;
  bottom:82px!important;
  width:min(270px,calc(100% - 28px))!important;
  max-width:270px!important;
  padding:9px 11px!important;
  border-radius:12px!important;
  box-sizing:border-box!important;
  display:block!important;
  overflow:hidden!important;
  background:rgba(255,255,255,.96)!important;
  backdrop-filter:blur(10px)!important;
  box-shadow:0 8px 24px rgba(72,32,52,.12)!important;
}
.dashboard .hero-card .gtg-home-score-v3 small{
  font-size:7.5px!important;
  line-height:1!important;
  letter-spacing:.11em!important;
}
.dashboard .hero-card .gtg-home-score-v3 h3{
  margin:4px 0 5px!important;
  font-size:14px!important;
  line-height:1.05!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
.dashboard .hero-card .gtg-score-v3-row{
  grid-template-columns:minmax(0,1fr) auto!important;
  gap:2px 6px!important;
  margin-top:3px!important;
}
.dashboard .hero-card .gtg-score-v3-row span{
  font-size:9px!important;
  line-height:1.1!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
}
.dashboard .hero-card .gtg-score-v3-row b{
  font-size:8px!important;
  line-height:1.1!important;
  white-space:nowrap!important;
}
.dashboard .hero-card .gtg-score-v3-bar{
  height:3px!important;
  margin-top:1px!important;
}
.dashboard .hero-card .gtg-score-v3-total{
  margin-top:5px!important;
  font-size:7.5px!important;
  line-height:1!important;
}
.dashboard .hero-card:has(.gtg-home-score-v3) .hero-meta > :first-child{
  transform:translateY(-10px)!important;
}

/* Compact the two overview cards without changing the rest of Home. */
.gtg-parity-overview .gtg-overview-card{
  padding:16px 18px!important;
}
.gtg-parity-overview .gtg-overview-card .eyebrow{
  margin-bottom:8px!important;
}
.gtg-parity-overview .gtg-overview-title-row{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:10px!important;
}
.gtg-parity-overview .gtg-overview-title-row h2{
  flex:1 1 auto!important;
  min-width:0!important;
  margin:0!important;
  font-size:28px!important;
  line-height:.96!important;
}
.gtg-parity-overview .gtg-overview-title-row .btn{
  flex:0 0 auto!important;
  min-height:38px!important;
  margin:0!important;
  padding:9px 12px!important;
  font-size:9px!important;
  white-space:nowrap!important;
}
.gtg-parity-overview .gtg-overview-card>p{
  margin:9px 0 0!important;
  font-size:13px!important;
  line-height:1.35!important;
}

@media(max-width:700px){
  .dashboard .hero-card .gtg-home-score-v3{
    left:12px!important;
    bottom:80px!important;
    width:min(232px,calc(100% - 160px))!important;
    max-width:232px!important;
    padding:8px 10px!important;
  }
  .dashboard .hero-card .gtg-home-score-v3 h3{font-size:13px!important;margin:3px 0 4px!important}
  .dashboard .hero-card .gtg-score-v3-row{margin-top:2px!important}
  .dashboard .hero-card:has(.gtg-home-score-v3) .hero-meta > :first-child{
    transform:translateY(-18px)!important;
  }
  .gtg-parity-overview .gtg-overview-card{padding:15px 17px!important}
  .gtg-parity-overview .gtg-overview-title-row h2{font-size:27px!important}
  .gtg-parity-overview .gtg-overview-title-row .btn{min-height:36px!important;padding:8px 10px!important;font-size:8.5px!important}
}
@media(max-width:380px){
  .dashboard .hero-card .gtg-home-score-v3{
    width:calc(100% - 158px)!important;
    max-width:218px!important;
  }
  .gtg-parity-overview .gtg-overview-title-row h2{font-size:26px!important}
}
`;
document.head.appendChild(style);

const SB_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const SB_KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const money=v=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Number(v||0));
let client=null,snapshotPromise=null,observerTimer=0;
function db(){if(!client&&window.supabase?.createClient)client=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function tripId(){return new URLSearchParams(location.search).get('trip_id')||''}
function compute(members,bookings,bp,expenses,ep){
 const map=new Map(members.map(m=>[m.id,0]));
 const apply=(rows,people,amountKey,idKey)=>{for(const row of rows){const payer=row.payer_member_id;if(!payer||!map.has(payer))continue;const ps=people.filter(p=>p[idKey]===row.id);if(!ps.length)continue;const share=Number(row[amountKey]||0)/ps.length;if(!Number.isFinite(share)||share<=0)continue;for(const p of ps){if(p.member_id===payer||p.settled_at||!map.has(p.member_id))continue;map.set(payer,map.get(payer)+share);map.set(p.member_id,map.get(p.member_id)-share)}}};
 apply(bookings,bp,'total_cost','booking_id');apply(expenses,ep,'amount','expense_id');return map;
}
async function snapshot(){
 if(snapshotPromise)return snapshotPromise;
 snapshotPromise=(async()=>{
  const c=db(),id=tripId();if(!c||!id)return null;
  const q=await Promise.all([
   c.from('trip_members').select('id').eq('trip_id',id),
   c.from('bookings').select('id,total_cost,payer_member_id').eq('trip_id',id),
   c.from('booking_participants').select('booking_id,member_id,settled_at').eq('trip_id',id),
   c.from('expenses').select('id,amount,payer_member_id').eq('trip_id',id),
   c.from('expense_participants').select('expense_id,member_id,settled_at').eq('trip_id',id)
  ]);
  if(q.some(x=>x.error))throw q.find(x=>x.error).error;
  const [m,b,bp,e,ep]=q,balances=compute(m.data||[],b.data||[],bp.data||[],e.data||[],ep.data||[]);
  const outstanding=[...balances.values()].filter(v=>v>.005).reduce((n,v)=>n+v,0);
  return {bookings:b.data||[],outstanding};
 })().catch(err=>{console.warn('Girls Home balance summary unavailable',err);return null});
 return snapshotPromise;
}
function titleRow(card,button){
 const h2=card?.querySelector(':scope > h2');if(!card||!h2||!button)return;
 let row=card.querySelector(':scope > .gtg-overview-title-row');
 if(!row){row=document.createElement('div');row.className='gtg-overview-title-row';h2.before(row);row.appendChild(h2)}
 row.appendChild(button);
}
async function refine(){
 const cards=[...document.querySelectorAll('.gtg-parity-overview .gtg-overview-card')];if(cards.length<2)return;
 const plan=cards[0],moneyCard=cards[1];
 if(!plan.dataset.gtgTopRefined){
  const actions=plan.querySelector(':scope > .gtg-inline-actions');
  const openPlan=actions?.querySelector('[data-parity-go="plan"]');
  const addFirst=actions?.querySelector('[data-parity-existing="addBooking"]');
  const hasPlan=/next on the plan/i.test(plan.querySelector(':scope > h2')?.textContent||'');
  const chosen=hasPlan?openPlan:(addFirst||openPlan);
  if(chosen)titleRow(plan,chosen);
  actions?.remove();plan.dataset.gtgTopRefined='1';
 }
 if(!moneyCard.dataset.gtgTopRefined){
  const actions=moneyCard.querySelector(':scope > .gtg-inline-actions');
  const openMoney=actions?.querySelector('[data-parity-go="money"]');
  if(openMoney)titleRow(moneyCard,openMoney);
  actions?.remove();moneyCard.dataset.gtgTopRefined='1';
 }
 const data=await snapshot();if(!data||!moneyCard.isConnected)return;
 const heading=moneyCard.querySelector('.gtg-overview-title-row h2');if(heading)heading.textContent=`${money(data.outstanding)} outstanding`;
}
function schedule(ms=40){clearTimeout(observerTimer);observerTimer=setTimeout(()=>void refine(),ms)}
const observer=new MutationObserver(()=>schedule());observer.observe(document.body,{childList:true,subtree:true});
schedule(0);window.addEventListener('pageshow',()=>{snapshotPromise=null;schedule(80)});window.addEventListener('popstate',()=>schedule(80));
})();
