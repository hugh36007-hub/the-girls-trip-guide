/* Girls paid-member parity: keep the organiser presentation while limiting member-only data to what the member should see. */
(()=>{
'use strict';
if(window.__GTG_MEMBER_VIEW_PARITY__)return;window.__GTG_MEMBER_VIEW_PARITY__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,ctx=null,loading=false,queued=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]||c));
const money=v=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Number(v||0));
const fmt=v=>v?new Date(`${String(v).slice(0,10)}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'TBC';
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const by=(rows,key,id)=>(rows||[]).filter(row=>row[key]===id);
const memberRole=row=>/^(owner|organiser)$/i.test(String(row?.role||''))?'Organiser':'Group member';

async function loadContext(){
 if(loading||ctx?.tripId===tripId())return ctx;const q=db(),tid=tripId();if(!q||!tid)return null;loading=true;
 try{
  const {data:{user}}=await q.auth.getUser();if(!user)return null;
  const tripResult=await q.from('trips').select('id,owner_id').eq('id',tid).eq('product_key','girls').maybeSingle();
  if(tripResult.error||!tripResult.data)return null;
  const owner=tripResult.data.owner_id===user.id;
  if(owner){ctx={tripId:tid,user,owner:true};return ctx}
  const results=await Promise.all([
   q.from('trip_members').select('id,user_id,name,role,created_at').eq('trip_id',tid).order('created_at'),
   q.from('bookings').select('id,kind,total_cost,payer_member_id,details').eq('trip_id',tid).order('created_at'),
   q.from('booking_participants').select('booking_id,member_id,settled_at').eq('trip_id',tid),
   q.from('expenses').select('id,description,amount,payer_member_id').eq('trip_id',tid).order('created_at'),
   q.from('expense_participants').select('expense_id,member_id,settled_at').eq('trip_id',tid),
   q.from('payment_requests').select('id,description,amount,deadline').eq('trip_id',tid).order('created_at'),
   q.from('payment_request_participants').select('payment_request_id,member_id,paid_at').eq('trip_id',tid),
   q.rpc('trip_media_contribution_breakdown',{p_trip_id:tid})
  ]);
  const [members,bookings,bp,expenses,ep,requests,rp,contrib]=results;
  const member=(members.data||[]).find(row=>row.user_id===user.id);if(!member)return null;
  const contributions={};for(const row of contrib.data||[])contributions[row.created_by]={photos:Number(row.photo_count||0),videos:Number(row.video_count||0),total:Number(row.total_count||0)};
  ctx={tripId:tid,user,owner:false,member,members:members.data||[],bookings:bookings.data||[],bp:bp.data||[],expenses:expenses.data||[],ep:ep.data||[],requests:requests.data||[],rp:rp.data||[],contributions};
  return ctx;
 }catch(error){console.warn('Girls member parity context unavailable.',error);return null}
 finally{loading=false}
}
function financialPosition(){
 if(!ctx?.member)return{net:0,owes:0,credit:0};const balances=new Map((ctx.members||[]).map(row=>[row.id,0]));
 const apply=(amount,payer,people)=>{const ids=(people||[]).map(row=>row.member_id),share=ids.length?Number(amount||0)/ids.length:0;for(const person of people||[]){if(person.member_id===payer||person.settled_at)continue;if(balances.has(payer))balances.set(payer,balances.get(payer)+share);if(balances.has(person.member_id))balances.set(person.member_id,balances.get(person.member_id)-share)}};
 for(const row of ctx.bookings||[])apply(row.total_cost,row.payer_member_id,by(ctx.bp,'booking_id',row.id));
 for(const row of ctx.expenses||[])apply(row.amount,row.payer_member_id,by(ctx.ep,'expense_id',row.id));
 const net=Number(balances.get(ctx.member.id)||0);return{net,owes:Math.max(0,-net),credit:Math.max(0,net)};
}
function myRequests(){return (ctx?.requests||[]).map(row=>({row,person:by(ctx.rp,'payment_request_id',row.id).find(person=>person.member_id===ctx.member.id)})).filter(x=>x.person)}
function unpaidRequests(){return myRequests().filter(x=>!x.person.paid_at)}
function bookingTitle(row){const d=row?.details||{};return d.title||d.name||d.hotel||d.airline||d.route||({flight:'Flight',hotel:'Stay',transfer:'Transfer',activity:'Activity',other:'Other'}[row?.kind]||'Booking')}
function personalRows(){
 const rows=[];
 for(const item of ctx.bookings||[]){const people=by(ctx.bp,'booking_id',item.id),mine=people.find(p=>p.member_id===ctx.member.id);if(!mine)continue;const share=people.length?Number(item.total_cost||0)/people.length:0;rows.push({kind:'Booking',label:bookingTitle(item),amount:share,status:item.payer_member_id===ctx.member.id?'Paid by you':mine.settled_at?'Settled':'Outstanding'})}
 for(const item of ctx.expenses||[]){const people=by(ctx.ep,'expense_id',item.id),mine=people.find(p=>p.member_id===ctx.member.id);if(!mine)continue;const share=people.length?Number(item.amount||0)/people.length:0;rows.push({kind:'Expense',label:item.description||'Trip expense',amount:share,status:item.payer_member_id===ctx.member.id?'Paid by you':mine.settled_at?'Settled':'Outstanding'})}
 return rows;
}
function stripPassportSummaries(){
 document.querySelectorAll('.gtg-overview-strip span').forEach(span=>{const label=span.querySelector('small')?.textContent||'';if(/passport/i.test(label))span.remove()});
}
function normaliseHome(){
 const position=financialPosition(),requests=unpaidRequests();
 const stat=document.querySelector('.stat-row .stat[data-tab="money"]');if(stat){const value=stat.querySelector(':scope>b'),note=stat.querySelector(':scope>small');if(value)value.textContent=money(position.owes);if(note)note.textContent=`${requests.length} payment request${requests.length===1?'':'s'} for you`}
 const overview=document.querySelector('.gtg-parity-overview');if(overview){const cards=[...overview.querySelectorAll('.gtg-overview-card')];if(cards[1]){const eye=cards[1].querySelector('.eyebrow'),h=cards[1].querySelector('h2'),p=cards[1].querySelector('p');if(eye)eye.textContent='Your position';if(h)h.textContent=position.owes>0?`${money(position.owes)} outstanding`:position.credit>0?`${money(position.credit)} owed to you`:'Settled';if(p)p.textContent=requests.length?`${requests.length} payment request${requests.length===1?'':'s'} currently needs your attention.`:'Nothing currently needs paying.'}}
  const summary=overview.querySelector('.gtg-member-summary');if(summary){const amount=summary.querySelector('strong');if(amount)amount.textContent=money(position.owes);const p=summary.querySelector('p');if(p)p.textContent='Your organiser controls the official trip details. You can read the same trip view and contribute without seeing other members’ private admin or balances.'}
 }
 stripPassportSummaries();
}
function normaliseGroup(){
 const panel=document.querySelector('[data-panel="group"]');if(!panel)return;
 const cards=[...panel.querySelectorAll('.crew-card')];cards.forEach((card,index)=>{
  const row=ctx.members?.[index];if(!row)return;const counts=ctx.contributions?.[row.user_id]||{total:0};
  const meta=card.querySelector('.crew-id small');if(meta)meta.textContent=`${memberRole(row)}${counts.total?` · ${counts.total} upload${counts.total===1?'':'s'}`:''}`;
  const avatar=card.querySelector('.avatar');if(avatar){avatar.dataset.gtgReadonlyProfile=row.id;avatar.setAttribute('role','button');avatar.setAttribute('tabindex','0');avatar.setAttribute('aria-label',`View ${row.name||'group member'} profile`)}
  let link=card.querySelector('[data-gtg-member-uploads]');
  if(counts.total&&!link){link=document.createElement('button');link.type='button';link.className='btn gtg-member-upload-link';link.dataset.gtgMemberUploads=row.user_id||'';link.textContent=`View ${counts.total} upload${counts.total===1?'':'s'} →`;card.querySelector('.crew-id')?.appendChild(link)}
 });
 stripPassportSummaries();
}
function renderMoney(){
 const panel=document.querySelector('[data-panel="money"]');if(!panel)return;
 panel.querySelector('.gtg-money-summary')?.remove();panel.querySelector('.balance-grid')?.remove();
 [...panel.children].forEach(node=>{if(node.classList?.contains('section-head')||node.classList?.contains('gtg-member-money-private'))return;if(node.matches?.('.card'))node.remove()});
 let box=panel.querySelector('.gtg-member-money-private');if(box)return;
 const position=financialPosition(),requests=myRequests(),rows=personalRows();
 box=document.createElement('div');box.className='gtg-member-money-private';
 box.innerHTML=`<div class="gtg-member-money-grid"><article class="card"><div class="eyebrow">What I owe</div><h3>${money(position.owes)}</h3><p>${position.owes>0?'Outstanding across your booking and expense shares.':'Nothing currently outstanding.'}</p></article><article class="card"><div class="eyebrow">What is owed to me</div><h3>${money(position.credit)}</h3><p>${position.credit>0?'Recorded money the group owes you.':'Nothing currently due back to you.'}</p></article></div>${requests.length?`<article class="card"><div class="eyebrow">Payment requests</div><h3>For you</h3>${requests.map(({row,person})=>`<div class="money-row"><div><b>${esc(row.description||'Trip payment')}</b><div class="gtg-member-money-note">${row.deadline?`Due ${fmt(row.deadline)} · `:''}${person.paid_at?'Paid':'Outstanding'}</div></div><span>${money(row.amount)}</span></div>`).join('')}</article>`:''}${rows.length?`<article class="card"><div class="eyebrow">Your trip costs</div><h3>Your shares</h3>${rows.map(row=>`<div class="money-row"><div><b>${esc(row.label)}</b><div class="gtg-member-money-note">${esc(row.kind)} · ${esc(row.status)}</div></div><span>${money(row.amount)}</span></div>`).join('')}</article>`:''}`;
 const head=panel.querySelector(':scope > .section-head');if(head)head.insertAdjacentElement('afterend',box);else panel.appendChild(box);
}
function normalise(){if(!ctx||ctx.owner||!ctx.member)return;normaliseHome();normaliseGroup();renderMoney()}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;normalise()})}
function openProfile(id){const row=ctx?.members?.find(member=>String(member.id)===String(id));if(!row)return;const counts=ctx.contributions?.[row.user_id]||{photos:0,videos:0,total:0},root=document.getElementById('modalRoot');if(!root)return;root.innerHTML=`<div class="modal"><div class="eyebrow">The group</div><h2>${esc(row.name||'Group member')}</h2><p>${memberRole(row)}${row.user_id===ctx.user.id?' · You':''}</p><div class="gtg-readonly-profile-stats"><span><b>${counts.photos||0}</b><small>Photos</small></span><span><b>${counts.videos||0}</b><small>Videos</small></span><span><b>${counts.total||0}</b><small>Total uploads</small></span></div><div class="modal-actions"><button class="btn primary" data-a="close">Close</button></div></div>`;root.classList.add('open')}
function openUploads(userId){const evidence=document.querySelector('.dock [data-tab="evidence"],.stat-row [data-tab="evidence"]');evidence?.click();setTimeout(()=>{const filter=document.querySelector(`[data-a="filterEvidence"][data-id="${CSS.escape(String(userId||''))}"]`);filter?.click()},60)}

document.addEventListener('click',event=>{if(!ctx||ctx.owner)return;const avatar=event.target.closest?.('[data-gtg-readonly-profile]');if(avatar){event.preventDefault();event.stopPropagation();openProfile(avatar.dataset.gtgReadonlyProfile);return}const uploads=event.target.closest?.('[data-gtg-member-uploads]');if(uploads){event.preventDefault();event.stopPropagation();openUploads(uploads.dataset.gtgMemberUploads)}},true);
document.addEventListener('keydown',event=>{if(!ctx||ctx.owner||!['Enter',' '].includes(event.key))return;const avatar=event.target.closest?.('[data-gtg-readonly-profile]');if(!avatar)return;event.preventDefault();openProfile(avatar.dataset.gtgReadonlyProfile)},true);

const style=document.createElement('style');style.id='gtg-member-view-parity-css';style.textContent=`
.gtg-member-money-private{display:grid;gap:14px}.gtg-member-money-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.gtg-member-money-private .card{margin:0}.gtg-member-money-note{font-size:10px;color:var(--muted);margin-top:4px}.gtg-member-upload-link{display:block;margin-top:8px;padding:7px 9px!important;font-size:9px!important}.gtg-readonly-profile-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0}.gtg-readonly-profile-stats span{display:grid;gap:3px;padding:11px;border:1px solid var(--line);border-radius:12px;text-align:center}.gtg-readonly-profile-stats b{color:var(--pink2);font-size:20px}.gtg-readonly-profile-stats small{color:var(--muted);font-size:9px;text-transform:uppercase}.crew-card .avatar[data-gtg-readonly-profile]{cursor:pointer}
@media(max-width:700px){.gtg-member-money-grid{grid-template-columns:1fr}}
`;document.head.appendChild(style);

async function boot(){if(!window.supabase?.createClient){setTimeout(boot,50);return}await loadContext();if(!ctx||ctx.owner)return;const root=document.getElementById('app')||document.body;new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule();window.addEventListener('pageshow',schedule);window.addEventListener('popstate',schedule)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else void boot();
})();
