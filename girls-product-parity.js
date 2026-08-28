(() => {
'use strict';

const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const SUPABASE_KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const FREE_REMINDERS=[
 {code:'F01',title:'Group still missing',when:'When nobody else has joined',message:'Your trip is set up, but nobody else has joined yet. Invite the people who are coming so everyone can see the same plan.',action:'Open the group'},
 {code:'F02',title:'Booking details missing',when:'When a booking is incomplete',message:'A booking is missing information. Add the remaining detail so the plan stays useful for everyone.',action:'Open the plan'},
 {code:'F03',title:'Payment due',when:'When a trip payment is due',message:'A trip payment is due. Open the trip to review the amount, deadline and payment status.',action:'Open money'},
 {code:'F04',title:'Seven days to go',when:'One week before departure',message:'Your trip starts in one week. Check the plan, bookings and outstanding details while there is still time to fix them.',action:'Open the plan'},
 {code:'F05',title:'Final check',when:'The day before departure',message:'Your trip starts tomorrow. Check the meeting point, travel times and anything the group still needs to know.',action:'Open the plan'},
 {code:'F06',title:'Expense incomplete',when:'When an expense is incomplete',message:'An expense is missing information. Add the payer or split so the balance remains accurate.',action:'Open money'},
 {code:'F07',title:'Money still unsettled',when:'After the trip',message:'There is still money to settle for this trip. Review the outstanding balance and update anything already paid.',action:'Open money'}
];
const GALS={
 'grace-auto':{name:'Leave it to Grace',role:'Automatic routing',img:'grace.webp',sample:'Grace sends each job to the right person.'},
 grace:{name:'Grace',role:'The Boss',img:'grace.webp',sample:'Everything is where it should be. Let’s keep it that way.'},
 ava:{name:'Ava',role:'The Organised One',img:'ava.webp',sample:'One detail is missing. I have already noticed.'},
 lola:{name:'Lola',role:'The Chaos Agent',img:'lola.webp',sample:'Three days to go. Statistically, this is still organised.'},
 seb:{name:'Seb',role:'The Hammer',img:'seb.webp',sample:'Grace asked. Ava itemised. I’m the third reminder.'}
};
const state={client:null,user:null,trip:null,members:[],bookings:[],documents:[],expenses:[],expensePeople:[],requests:[],requestPeople:[],entitlements:[],settings:null,messages:[],media:[],paid:false,owner:false,ready:false,lastTripId:null};
let refreshTimer=0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const money=v=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Number(v||0));
const fmt=v=>v?new Date(`${String(v).slice(0,10)}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'TBC';
function tripId(){return new URL(location.href).searchParams.get('trip_id')||''}
function tab(){return document.querySelector('.dock [data-tab].active')?.dataset?.tab||new URL(location.href).searchParams.get('action')||'overview'}
function db(){if(!state.client){if(!window.supabase?.createClient)return null;state.client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}return state.client}
function toast(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}
function dueRequests(){return state.requestPeople.filter(p=>!p.paid_at).length}
function totalRecorded(){return state.bookings.reduce((n,x)=>n+Number(x.total_cost||0),0)+state.expenses.reduce((n,x)=>n+Number(x.amount||0),0)}
function myMember(){return state.members.find(m=>m.user_id===state.user?.id)}
function myOwed(){const me=myMember();if(!me)return 0;let total=0;for(const r of state.requests){const people=state.requestPeople.filter(p=>p.payment_request_id===r.id&&!p.paid_at);if(people.some(p=>p.member_id===me.id))total+=Number(r.amount||0)}return total}
function confirmedCount(){return state.members.filter(m=>m.role==='organiser'||m.role==='owner'||m.status==='confirmed').length}
function passportCount(){return state.members.filter(m=>m.passport_confirmed).length}
function nextBooking(){return [...state.bookings].sort((a,b)=>String(a.details?.departureDate||a.details?.checkIn||a.created_at).localeCompare(String(b.details?.departureDate||b.details?.checkIn||b.created_at)))[0]||null}
function bookingLabel(b){const d=b?.details||{};return d.title||d.hotel||d.airline||({flight:'Flight',hotel:'Stay',transfer:'Transfer',activity:'Activity',other:'Other'}[b?.kind]||'Plan item')}
function bookingDate(b){const d=b?.details||{};return d.departureDate||d.checkIn||''}

async function load(){
 const id=tripId(),client=db();if(!id||!client)return false;
 try{
  const {data:{user}}=await client.auth.getUser();if(!user)return false;
  state.user=user;
  const qs=await Promise.all([
   client.from('trips').select('*').eq('id',id).eq('product_key','girls').maybeSingle(),
   client.from('trip_members').select('*').eq('trip_id',id).order('created_at'),
   client.from('bookings').select('*').eq('trip_id',id).order('created_at'),
   client.from('documents').select('*').eq('trip_id',id).order('created_at'),
   client.from('expenses').select('*').eq('trip_id',id).order('created_at'),
   client.from('expense_participants').select('*').eq('trip_id',id),
   client.from('payment_requests').select('*').eq('trip_id',id).order('created_at'),
   client.from('payment_request_participants').select('*').eq('trip_id',id),
   client.from('trip_entitlements').select('*').eq('trip_id',id).eq('active',true),
   client.from('communication_settings').select('*').eq('trip_id',id).maybeSingle(),
   client.from('trip_messages').select('*').eq('trip_id',id).order('created_at',{ascending:false}).limit(50),
   client.from('media').select('id,album,mime_type,created_at,created_by').eq('trip_id',id).eq('album','evidence').order('created_at',{ascending:false}).limit(250)
  ]);
  if(qs[0].error||!qs[0].data)return false;
  const [t,m,b,d,e,ep,r,rp,en,set,msg,media]=qs;
  Object.assign(state,{trip:t.data,members:m.data||[],bookings:b.data||[],documents:d.data||[],expenses:e.data||[],expensePeople:ep.data||[],requests:r.data||[],requestPeople:rp.data||[],entitlements:en.data||[],settings:set.data||null,messages:msg.data||[],media:media.data||[]});
  state.paid=state.entitlements.some(x=>x.active!==false&&['full_trip','evidence','full_comms'].includes(x.entitlement));
  state.owner=state.trip.owner_id===state.user.id;state.ready=true;state.lastTripId=id;
  return true;
 }catch(err){console.warn('Girls parity layer load failed',err);return false}
}

function sectionRoot(){return document.querySelector('.dashboard .panel.active')||document.querySelector('.dashboard [id="tab-content"]')||document.querySelector('.dashboard')}
function removeOld(){document.querySelectorAll('[data-parity-block]').forEach(x=>x.remove())}
function goto(section){const btn=document.querySelector(`.dock [data-tab="${section}"]`);if(btn){btn.click();return}const u=new URL(location.href);u.searchParams.set('action',section);history.pushState({},'',u);location.reload()}
function triggerExisting(action){const el=document.querySelector(`[data-a="${action}"],[data-action="${action}"]`);if(el){el.click();return true}return false}

function overview(){
 if(tab()!=='overview')return;
 const dashboard=document.querySelector('.dashboard');if(!dashboard)return;
 const anchor=document.querySelector('.stat-row');
 const next=nextBooking(),pending=Math.max(0,state.members.length-confirmedCount());
 const block=document.createElement('section');block.dataset.parityBlock='overview';block.className='gtg-parity-overview';
 block.innerHTML=`<div class="gtg-overview-grid">
  <article class="card gtg-overview-card"><div class="eyebrow">Trip overview</div><h2>${next?'Next on the plan':'Ready when you are'}</h2><p>${next?`${esc(bookingLabel(next))}${bookingDate(next)?` · ${fmt(bookingDate(next))}`:''}`:'Add the first booking and keep the useful version in one place.'}</p><div class="gtg-inline-actions"><button class="btn" data-parity-go="plan">Open plan</button>${state.owner?'<button class="btn" data-parity-existing="addBooking">Add first item</button>':''}</div></article>
  <article class="card gtg-overview-card"><div class="eyebrow">State of affairs</div><h2>${dueRequests()} outstanding</h2><p>${money(totalRecorded())} recorded across bookings and expenses.</p><div class="gtg-inline-actions"><button class="btn" data-parity-go="money">Open money</button></div></article>
 </div>
 <div class="gtg-overview-strip"><span><b>${confirmedCount()}/${state.members.length}</b><small>Group confirmed</small></span><span><b>${pending}</b><small>Invites pending</small></span><span><b>${passportCount()}/${state.members.length}</b><small>Passports checked</small></span><span><b>${state.media.length}</b><small>Evidence</small></span></div>
 ${state.owner&&!state.bookings.length&&!state.documents.length?`<aside class="gtg-get-started"><div><span class="eyebrow">Getting started</span><b>Start with the group, then add what is booked.</b><small>Keep travel, stays, documents and costs together.</small></div><button class="btn primary" data-parity-go="group">Open the group</button></aside>`:''}
 ${state.paid&&state.owner?messagePanel():state.paid&&!state.owner?memberOverview():''}`;
 if(anchor)anchor.insertAdjacentElement('afterend',block);else dashboard.prepend(block)
}
function messagePanel(){return `<article class="card gtg-message-panel"><div class="section-head"><div><div class="eyebrow">Organiser</div><h2>Message the group</h2><p>Post a useful note to the trip. It stays with the recipient, date and time.</p></div></div><form data-parity-message><textarea name="message" maxlength="500" required placeholder="Meet in reception at 7.30. Do not be late."></textarea><button class="btn primary">Post to everyone</button></form><div class="gtg-message-history"><h3>Message history</h3>${state.messages.slice(0,8).map(x=>`<div class="gtg-message-row"><div><b>${x.recipient_member_id?esc(state.members.find(m=>m.id===x.recipient_member_id)?.name||'Group member'):'Everyone'}</b><small>${new Date(x.created_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</small></div><p>${esc(x.message)}</p></div>`).join('')||'<div class="empty">No trip messages have been posted yet.</div>'}</div></article>`}
function memberOverview(){return `<article class="card gtg-member-summary"><div class="eyebrow">Your trip</div><h2>What I owe</h2><strong>${money(myOwed())}</strong><p>Your organiser controls the official trip details. You can read the plan and contribute to the paid gallery.</p><div class="gtg-inline-actions"><button class="btn" data-parity-go="plan">View plan</button><button class="btn" data-parity-go="evidence">View evidence</button></div></article>`}

function planEnhance(){
 if(tab()!=='plan')return;const root=sectionRoot();if(!root)return;
 const cats=[['flight','Travel'],['hotel','Accommodation'],['transfer','Local transport'],['activity','Activities'],['other','Other']];
 const block=document.createElement('section');block.dataset.parityBlock='plan';block.className='gtg-plan-summary';
 block.innerHTML=`<div class="gtg-plan-categories">${cats.map(([key,label])=>{const rows=state.bookings.filter(x=>x.kind===key),sum=rows.reduce((n,x)=>n+Number(x.total_cost||0),0);return `<button data-parity-filter-kind="${key}"><span>${esc(label)}</span><b>${money(sum)}</b><small>${rows.length} item${rows.length===1?'':'s'}</small></button>`}).join('')}</div><div class="gtg-plan-tools">${state.owner?'<button class="btn" data-parity-existing="addBooking">+ Add something</button><button class="btn" data-parity-existing="addDocument">+ Document</button><button class="btn" data-parity-existing="invite">+ Invite another</button>':''}<button class="btn" data-parity-filter-kind="all">Show all</button></div>`;
 root.prepend(block)
}

function moneyEnhance(){
 if(tab()!=='money')return;const root=sectionRoot();if(!root)return;
 const block=document.createElement('section');block.dataset.parityBlock='money';block.className='gtg-money-summary';
 const outstanding=dueRequests();
 block.innerHTML=`<div class="gtg-money-strip"><span><small>Total recorded</small><b>${money(totalRecorded())}</b></span><span><small>Outstanding requests</small><b>${outstanding}</b></span>${!state.owner?`<span><small>What I owe</small><b>${money(myOwed())}</b></span>`:''}</div>${state.owner?'<div class="gtg-plan-tools"><button class="btn primary" data-parity-existing="addExpense">+ Add expense</button><button class="btn" data-parity-existing="addRequest">Request payment</button></div>':''}`;
 root.prepend(block)
}

function groupEnhance(){
 if(tab()!=='group')return;const root=sectionRoot();if(!root)return;
 const pending=Math.max(0,state.members.length-confirmedCount());
 const block=document.createElement('section');block.dataset.parityBlock='group';block.className='gtg-group-summary';
 block.innerHTML=`<div class="gtg-overview-strip"><span><b>${confirmedCount()}/${state.members.length}</b><small>Confirmed</small></span><span><b>${pending}</b><small>Invites pending</small></span><span><b>${passportCount()}/${state.members.length}</b><small>Passports checked</small></span><span><b>${state.paid?state.media.length:'—'}</b><small>Uploads</small></span></div>${state.owner?'<div class="gtg-plan-tools"><button class="btn primary" data-parity-existing="invite">+ Invite</button>'+ (state.paid?'<button class="btn" data-parity-comms>GALS communications</button>':'<button class="btn" data-parity-reminders>Trip reminders</button>')+'</div>':`<article class="card gtg-readonly"><div class="eyebrow">Member view</div><b>Read only</b><p>The organiser controls names, passports, invitations and official trip details.</p></article>`}`;
 root.prepend(block)
}

function evidenceEnhance(){
 if(tab()!=='evidence')return;const root=sectionRoot();if(!root)return;
 const photos=state.media.filter(x=>String(x.mime_type||'').startsWith('image/')).length,videos=state.media.filter(x=>String(x.mime_type||'').startsWith('video/')).length;
 const recent=state.media.filter(x=>Date.now()-new Date(x.created_at).getTime()<72*3600000).length;
 const block=document.createElement('section');block.dataset.parityBlock='evidence';block.className='gtg-evidence-summary';
 block.innerHTML=state.paid?`<div class="gtg-overview-strip"><span><b>${photos}</b><small>Photos</small></span><span><b>${videos}</b><small>Videos</small></span><span><b>${recent}</b><small>New · 72h</small></span><span><b>20 GB</b><small>Trip storage</small></span></div>${!state.owner?'<p class="gtg-member-evidence-note">You can add your own photos and videos. Official trip details remain read only.</p>':''}`:`<article class="card gtg-free-evidence"><div class="eyebrow">Full Trip feature</div><h2>The evidence starts with Full Trip.</h2><p>Photo and video sharing, 20 GB for 12 months and the Hidden Gallery are part of the £24.99 one-off upgrade.</p></article>`;
 root.prepend(block)
}

function dockBadges(){
 const dock=document.querySelector('.dock');if(!dock)return;
 dock.querySelectorAll('.gtg-dock-badge').forEach(x=>x.remove());
 const moneyBtn=dock.querySelector('[data-tab="money"]'),evidenceBtn=dock.querySelector('[data-tab="evidence"]'),groupBtn=dock.querySelector('[data-tab="group"]');
 const add=(btn,n,label='')=>{if(!btn||!n)return;const b=document.createElement('span');b.className='gtg-dock-badge';b.textContent=n>99?'99+':String(n);b.title=label;btn.appendChild(b)};
 add(moneyBtn,dueRequests(),'Outstanding payments');add(evidenceBtn,state.paid?state.media.length:0,'Evidence');add(groupBtn,Math.max(0,state.members.length-confirmedCount()),'Pending invitations')
}

function drawerEntitlements(){
 const drawer=document.getElementById('drawerRoot');if(!drawer?.classList.contains('open'))return;
 const buttons=[...drawer.querySelectorAll('button')];
 for(const b of buttons){const text=(b.textContent||'').toLowerCase();if(!state.paid&&(text.includes('gals settings')||text.includes('trip appearance')))b.style.display='none'}
 if(drawer.querySelector('[data-parity-drawer]'))return;
 const list=drawer.querySelector('.drawer-list');if(!list)return;
 const btn=document.createElement('button');btn.dataset.parityDrawer='1';btn.innerHTML=state.paid?'<b>GALS communications</b><small>Characters, reminders and message controls</small>':'<b>Trip reminders</b><small>Seven standard reminders included with Free</small>';
 btn.addEventListener('click',()=>state.paid?openComms():openReminders());
 const switchBtn=[...list.querySelectorAll('button')].find(x=>(x.textContent||'').toLowerCase().includes('trip settings'));
 if(switchBtn)switchBtn.insertAdjacentElement('beforebegin',btn);else list.prepend(btn)
}

function openReminders(){
 const root=document.getElementById('modalRoot');if(!root)return;
 root.innerHTML=`<div class="modal gtg-parity-modal"><div class="gtg-modal-head"><div><div class="eyebrow">Free Trip</div><h2>Trip reminders</h2><p>Seven practical reminders. No GALS characters on Free.</p></div><b class="gtg-reminder-count">7</b></div><div class="gtg-reminders">${FREE_REMINDERS.map(x=>`<button type="button" data-parity-preview="${x.code}"><span>${x.code}</span><div><b>${esc(x.title)}</b><small>${esc(x.when)}</small></div><em>Included</em></button>`).join('')}</div><article class="card gtg-upgrade-comparison"><div class="eyebrow">Full Trip</div><h3>Seven reminders become the full operation.</h3><p>Full Trip adds 39 trip messages, Grace, Ava, Lola and Seb, richer prompts, Evidence and Hidden Gallery.</p><button class="btn primary" data-parity-existing="upgrade">See Full Trip</button></article><div class="modal-actions"><button class="btn" data-parity-close>Close</button></div></div>`;root.classList.add('open')
}
function openPreview(code){const x=FREE_REMINDERS.find(r=>r.code===code);if(!x)return;const root=document.getElementById('modalRoot');root.innerHTML=`<div class="modal gtg-reminder-preview"><span class="eyebrow">${esc(x.code)} · Standard reminder</span><h2>${esc(x.title)}</h2><p>${esc(x.message)}</p><small>${esc(x.when)}</small><div class="modal-actions"><button class="btn" data-parity-reminders>Back</button></div></div>`;root.classList.add('open')}
function openComms(){
 if(!state.paid){openReminders();return}const root=document.getElementById('modalRoot'),mode=state.settings?.character_mode||'grace-auto';if(!root)return;
 const on=(key)=>state.settings?.[key]!==false;
 root.innerHTML=`<div class="modal gtg-parity-modal gtg-comms-modal"><div class="gtg-modal-head"><div><div class="eyebrow">Full Trip</div><h2>Who handles the messages?</h2><p>Leave it to Grace and the system routes the right job to the right GALS character.</p></div></div><form data-parity-comms-form><div class="gtg-gals-selector">${Object.entries(GALS).map(([id,g])=>`<label class="${mode===id?'active':''}"><input type="radio" name="mode" value="${id}" ${mode===id?'checked':''} ${!state.owner?'disabled':''}><img src="assets/images/${g.img}" alt=""><small>${esc(g.role)}</small><b>${esc(g.name)}</b><p>${esc(g.sample)}</p></label>`).join('')}</div><div class="gtg-comms-covered"><article><div class="eyebrow">Grace</div><b>General organisation and final instructions</b></article><article><div class="eyebrow">Ava</div><b>Missing information and practical chasing</b></article><article><div class="eyebrow">Seb</div><b>Ignored payments and escalation</b></article><article><div class="eyebrow">Lola</div><b>Countdowns, gallery and momentum</b></article></div><div class="gtg-toggle-list">${[['enabled','Communications enabled'],['payments','Payment reminders'],['countdowns','Countdowns'],['gallery_nudges','Gallery nudges'],['upload_celebrations','Upload celebrations'],['expense_nudges','Expense nudges'],['post_trip_uploads','Post-trip upload reminders']].map(([key,label])=>`<label><span>${label}</span><input type="checkbox" name="${key}" ${on(key)?'checked':''} ${!state.owner?'disabled':''}></label>`).join('')}</div><div class="modal-actions"><button type="button" class="btn" data-parity-close>Close</button>${state.owner?'<button class="btn primary">Save communications</button>':''}</div></form></div>`;root.classList.add('open')
}

function filterKind(kind){
 const root=sectionRoot();if(!root)return;
 const cards=[...root.querySelectorAll('.booking')];if(!cards.length){toast('Use the category totals as the summary; all plan items remain below.');return}
 if(kind==='all'){cards.forEach(x=>x.hidden=false);return}
 const matchingIds=new Set(state.bookings.filter(b=>b.kind===kind).map(b=>b.id));
 cards.forEach(card=>{const id=card.dataset.id||card.querySelector('[data-id]')?.dataset?.id;card.hidden=id?!matchingIds.has(id):false})
}

async function sendMessage(form){if(!state.owner||!state.paid)return;const input=form.querySelector('[name="message"]'),message=String(input?.value||'').trim();if(!message)return;const {error}=await db().from('trip_messages').insert({trip_id:state.trip.id,sender_user_id:state.user.id,recipient_member_id:null,message});if(error){toast(error.message);return}input.value='';await load();apply();toast('Message posted to the group.')}
async function saveComms(form){if(!state.owner||!state.paid)return;const fd=new FormData(form),body={trip_id:state.trip.id,character_mode:String(fd.get('mode')||'grace-auto')};for(const key of ['enabled','payments','countdowns','gallery_nudges','upload_celebrations','expense_nudges','post_trip_uploads'])body[key]=fd.get(key)==='on';const {error}=await db().from('communication_settings').upsert(body,{onConflict:'trip_id'});if(error){toast(error.message);return}state.settings={...(state.settings||{}),...body};document.getElementById('modalRoot')?.classList.remove('open');toast('GALS communications saved.')}

function restrictMemberControls(){
 if(state.owner)return;
 const dangerous=['add','edit','delete','remove','settle','request payment','invite','trip settings','trip appearance','gals settings'];
 document.querySelectorAll('.dashboard button,.drawer button').forEach(b=>{const t=(b.textContent||'').trim().toLowerCase();if(dangerous.some(x=>t===x||t.startsWith(x+' ')||t.includes('remove member')))b.hidden=true})
}

function apply(){
 if(!state.ready||state.lastTripId!==tripId())return;
 removeOld();overview();planEnhance();moneyEnhance();groupEnhance();evidenceEnhance();dockBadges();drawerEntitlements();restrictMemberControls()
}
async function refreshAndApply(){if(await load())apply()}
function schedule(delay=80){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{load().then(ok=>{if(ok)apply()})},delay)}

// Capture entitlement-sensitive actions before the legacy handlers see them.
document.addEventListener('click',e=>{
 const target=e.target.closest('button,[data-a],[data-action],[data-parity-go],[data-parity-existing]');if(!target)return;
 const a=String(target.dataset.a||target.dataset.action||'');
 if(!state.paid&&(a==='settings'||a==='tripAppearance')){e.preventDefault();e.stopImmediatePropagation();toast('That is included with Full Trip.');return}
 if(target.dataset.parityGo){e.preventDefault();goto(target.dataset.parityGo);setTimeout(()=>schedule(40),0);return}
 if(target.dataset.parityExisting){e.preventDefault();const action=target.dataset.parityExisting;if(action==='upgrade'){const legacy=document.querySelector('[data-a="upgrade"],[data-action="upgrade"]');if(legacy)legacy.click();else location.href='/full-trip.html';return}triggerExisting(action);return}
 if(target.dataset.parityReminders!==undefined){e.preventDefault();openReminders();return}
 if(target.dataset.parityComms!==undefined){e.preventDefault();openComms();return}
 if(target.dataset.parityClose!==undefined){e.preventDefault();document.getElementById('modalRoot')?.classList.remove('open');return}
 if(target.dataset.parityPreview){e.preventDefault();openPreview(target.dataset.parityPreview);return}
 if(target.dataset.parityFilterKind){e.preventDefault();filterKind(target.dataset.parityFilterKind);return}
 if(target.closest('.dock [data-tab]')||a==='drawer')setTimeout(()=>schedule(40),0);else if(a)setTimeout(()=>schedule(350),0)
},true);

document.addEventListener('submit',e=>{
 if(e.target.matches('[data-parity-message]')){e.preventDefault();e.stopImmediatePropagation();sendMessage(e.target);return}
 if(e.target.matches('[data-parity-comms-form]')){e.preventDefault();e.stopImmediatePropagation();saveComms(e.target);return}
 setTimeout(()=>schedule(450),0)
},true);

window.addEventListener('popstate',()=>schedule(40));
const drawer=document.getElementById('drawerRoot');if(drawer){new MutationObserver(()=>{if(state.ready)drawerEntitlements()}).observe(drawer,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshAndApply,{once:true});else refreshAndApply();
})();
