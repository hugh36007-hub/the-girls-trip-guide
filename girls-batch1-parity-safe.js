/* Safe Batch 1 parity: idempotent DOM patches, bounded observers, no self-mutating loop. */
(()=>{
'use strict';
if(window.__GTG_BATCH1_SAFE__)return;
window.__GTG_BATCH1_SAFE__=true;
if(!location.pathname.startsWith('/create-trip'))return;

const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const DRAFT='gtg-safe-b1-trip-draft';
const app=document.getElementById('app');
const modal=document.getElementById('modalRoot');
const drawer=document.getElementById('drawerRoot');
if(!app||!modal||!drawer)return;
let client=null,scheduled=false,working=false;
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const owner=()=>/organiser/i.test(document.querySelector('.trip-title span')?.textContent||'');
const free=()=>/free trip/i.test(document.querySelector('.hero-card .eyebrow')?.textContent||'')||/full trip feature/i.test(document.querySelector('.stat[data-tab="evidence"] small')?.textContent||'');
const readDraft=()=>{try{return JSON.parse(sessionStorage.getItem(DRAFT)||'null')}catch{return null}};
const saveDraft=d=>sessionStorage.setItem(DRAFT,JSON.stringify(d));
const clearDraft=()=>sessionStorage.removeItem(DRAFT);

const style=document.createElement('style');
style.id='gtg-b1-safe-style';
style.textContent=`
.gtg-b1-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 16px}.gtg-b1-summary>div{border:1px solid rgba(255,79,163,.25);border-radius:15px;background:#fff;padding:14px;color:#191316}.gtg-b1-summary b{display:block;font:900 25px/1 'Barlow Condensed',sans-serif}.gtg-b1-summary span{display:block;margin-top:6px;color:#75686e;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.gtg-b1-cats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 14px}.gtg-b1-cats button{border:1px solid rgba(255,79,163,.25);border-radius:15px;background:#fff;padding:13px;text-align:left;color:#191316;cursor:pointer}.gtg-b1-cats span{display:block;color:#ed2f8b;font-size:9px;font-weight:900;text-transform:uppercase}.gtg-b1-cats b{display:block;margin-top:6px;font:900 23px/1 'Barlow Condensed',sans-serif}.gtg-b1-cats small{color:#776b71}
.gtg-b1-damage{margin-top:22px;padding-top:22px;border-top:1px solid rgba(255,79,163,.22)}.gtg-b1-damage .gtg-b1-money-copy>.section-head{display:none}.gtg-b1-damage-nav{display:flex;justify-content:flex-end;margin-top:12px}
.gtg-b1-checks{display:grid;gap:8px}.gtg-b1-checks label{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,79,163,.25);border-radius:11px;padding:10px;background:#fff;color:#191316;font-weight:700}.gtg-b1-checks input{width:18px!important;height:18px!important;accent-color:#ff4fa3}.gtg-b1-native{position:absolute!important;left:-9999px!important;opacity:0!important;width:1px!important;height:1px!important}
.gtg-b1-upgrade{border:1px solid rgba(255,79,163,.28);border-radius:20px;background:#fff;padding:24px;color:#191316}.gtg-b1-upgrade header{text-align:center}.gtg-b1-upgrade header img{width:70px;height:70px;object-fit:contain}.gtg-b1-upgrade h2{margin:8px 0;font:900 clamp(38px,5vw,56px)/.94 'Barlow Condensed',sans-serif;text-transform:uppercase}.gtg-b1-upgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}.gtg-b1-upitem{display:grid;grid-template-columns:22px 1fr;gap:8px;border:1px solid rgba(255,79,163,.22);border-radius:14px;background:#fff9fc;padding:13px}.gtg-b1-upitem i{font-style:normal;color:#ed2f8b;font-weight:900}.gtg-b1-upitem b{display:block}.gtg-b1-upitem span{display:block;margin-top:3px;color:#74686e;font-size:11px;line-height:1.4}.gtg-b1-price{text-align:center;border-top:1px solid rgba(255,79,163,.2);padding-top:16px}.gtg-b1-price strong{font:900 42px/1 'Barlow Condensed',sans-serif;color:#ed2f8b}.gtg-b1-convince{display:block;margin:12px auto;border:1px solid #ed2f8b;border-radius:999px;background:#fff;color:#ed2f8b;padding:9px 18px;font-weight:900}.gtg-b1-grace{display:none;grid-template-columns:180px 1fr;gap:16px;margin-top:16px;padding:14px;border:1px solid rgba(255,79,163,.2);border-radius:14px;background:#fff9fc}.gtg-b1-grace.open{display:grid}.gtg-b1-grace img{width:100%;height:270px;object-fit:cover;border-radius:10px}.gtg-b1-grace p{color:#655960!important;font-size:12px!important;line-height:1.5!important}
.gtg-b1-preview{max-width:820px}.gtg-b1-feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:18px 0}.gtg-b1-feature{border:1px solid rgba(255,79,163,.22);border-radius:12px;background:#fff9fc;padding:12px;color:#191316}.gtg-b1-feature b{display:block}.gtg-b1-feature span{display:block;margin-top:4px;color:#71656b;font-size:11px;line-height:1.4}.gtg-b1-status{min-height:18px;color:#ed2f8b;font-size:11px;margin-top:8px}
@media(max-width:700px){.gtg-b1-summary,.gtg-b1-cats{grid-template-columns:repeat(2,1fr)}.gtg-b1-upgrid,.gtg-b1-feature-grid,.gtg-b1-grace{grid-template-columns:1fr}.gtg-b1-grace img{height:250px}}
`;
document.head.appendChild(style);

function openSafeModal(title,body,klass=''){
  modal.innerHTML=`<div class="modal ${klass}"><h2>${title}</h2>${body}</div>`;
  modal.classList.add('open');
}
function setStatus(msg){const x=modal.querySelector('.gtg-b1-status');if(x)x.textContent=msg||'';}
function preview(){
  openSafeModal('What you get.',`<div class="gtg-b1-preview"><p>Enough to get the trip out of the group chat and into one organised, private place. No card required.</p><div class="gtg-b1-feature-grid">${[
    ['Private trip','Invite-only access for the people actually going.'],['Trip dashboard','Destination, dates, countdown, group and current status.'],['The plan','Flights, stays, transfers, activities and bookings together.'],['Travel documents','Tickets, confirmations and useful paperwork.'],['Money','Costs, splits and manual payment requests.'],['Group management','Invitations and membership in one place.'],['Chat & polls','Trip messages and proper group decisions.'],['Upgrade later','The same trip stays intact if you add Full Trip.']
  ].map(x=>`<div class="gtg-b1-feature"><b>✓ ${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><p><strong>Full Trip (£24.99 one-off)</strong> adds Grace and the GALS, automated communications, stronger payment chasing, full photo/video sharing, Official Version, Hidden Gallery and richer prompts.</p><div class="modal-actions"><button type="button" class="btn" data-a="close">Not for me</button><button type="button" class="btn primary" data-gtg-safe-details>I'm in →</button></div></div>`,'gtg-b1-preview');
}
function details(){
  const d=readDraft()||{};
  openSafeModal('Create your trip',`<p>Five details. No committee meeting required.</p><form id="gtgSafeDetails" class="form"><div class="field"><label>Trip name</label><input name="name" required value="${esc(d.name||'')}" placeholder="Ibiza 2027"></div><div class="field"><label>Destination</label><input name="destination" required value="${esc(d.destination||'')}" placeholder="Ibiza"></div><div class="form-row"><div class="field"><label>Starts</label><input type="date" name="start" required value="${esc(d.start||'')}"></div><div class="field"><label>Ends</label><input type="date" name="end" required value="${esc(d.end||'')}"></div></div><div class="field"><label>Your name</label><input name="owner" required autocomplete="name" value="${esc(d.owner||'')}"></div><div class="field"><label>Your email</label><input type="email" name="email" required autocomplete="email" value="${esc(d.email||'')}"></div><div class="gtg-b1-status"></div><div class="modal-actions"><button type="button" class="btn" data-gtg-safe-back>Back</button><button class="btn primary">Send secure code</button></div></form>`);
}
async function sendCode(d){
  working=true;setStatus('Sending secure code…');
  try{
    const res=await fetch(`${SUPA}/functions/v1/girls-auth-otp`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:d.email})});
    const out=await res.json().catch(()=>({}));
    if(!res.ok)throw Error(out.error||'Could not send the secure code.');
    openSafeModal('Check your email',`<p>Enter the 8-digit code sent to <strong>${esc(d.email)}</strong>.</p><form id="gtgSafeOtp" class="form"><div class="field"><label>Secure code</label><input name="code" required maxlength="8" inputmode="numeric" autocomplete="one-time-code"></div><div class="gtg-b1-status"></div><div class="modal-actions"><button type="button" class="btn" data-gtg-safe-edit>Edit details</button><button class="btn primary">Continue →</button></div></form>`);
  } finally {working=false;}
}
async function finishCreate(code){
  const d=readDraft();if(!d)throw Error('Trip details expired. Start again.');
  const q=db();if(!q)throw Error('Secure services did not load.');
  working=true;setStatus('Creating your trip…');
  try{
    const verified=await q.auth.verifyOtp({email:d.email,token:code,type:'email'});if(verified.error)throw verified.error;
    const user=verified.data.user;if(!user)throw Error('Secure sign-in could not be completed.');
    await q.from('profiles').upsert({id:user.id,display_name:d.owner},{onConflict:'id'}).catch(()=>{});
    const r=await q.rpc('create_girls_trip_for_current_user',{p_name:d.name,p_destination:d.destination,p_start:d.start,p_end:d.end,p_timezone:'Europe/London',p_creation_token:crypto.randomUUID()});
    if(r.error)throw r.error;
    const tripId=typeof r.data==='string'?r.data:r.data?.id||r.data;if(!tripId)throw Error('Trip could not be opened.');
    await q.from('trip_members').update({name:d.owner}).eq('trip_id',tripId).eq('user_id',user.id).catch(()=>{});
    clearDraft();location.href=`/create-trip?trip_id=${encodeURIComponent(tripId)}`;
  } finally {working=false;}
}

function patchDrawer(){
  const list=drawer.classList.contains('open')&&drawer.querySelector('.drawer-list');if(!list)return;
  if(free()&&owner()&&!list.querySelector('[data-gtg-safe-upgrade]')){
    const b=document.createElement('button');b.dataset.a='upgrade';b.dataset.gtgSafeUpgrade='1';b.innerHTML='<b>Unlock Full Trip</b><small>£24.99 one-off</small>';
    const safety=[...list.children].find(x=>/safety/i.test(x.textContent||''));safety?list.insertBefore(b,safety):list.appendChild(b);
  }
  if(!list.querySelector('[data-gtg-safe-home]')){
    const b=document.createElement('button');b.dataset.a='home';b.dataset.gtgSafeHome='1';b.innerHTML='<b>Home</b><small>Keep the session</small>';
    const sign=[...list.children].find(x=>/sign out/i.test(x.textContent||''));sign?list.insertBefore(b,sign):list.appendChild(b);
  }
}
function patchPlan(){
  const p=document.querySelector('[data-panel="plan"]');if(!p)return;
  if(!p.querySelector('.gtg-b1-cats')){
    const cards=[...p.querySelectorAll(':scope>.card-grid .booking')];
    const groups=[['Travel',['flight']],['Accommodation',['hotel','stay']],['Local transport',['transfer']],['Other',['activity','other']]];
    const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(n);
    const box=document.createElement('div');box.className='gtg-b1-cats';
    groups.forEach(([label,kinds])=>{const rows=cards.filter(c=>kinds.includes((c.querySelector('.kicker')?.textContent||'').trim().toLowerCase()));const sum=rows.reduce((n,c)=>n+(Number((c.querySelector('.price')?.textContent||'').replace(/[^0-9.-]/g,''))||0),0);const b=document.createElement('button');b.type='button';b.innerHTML=`<span>${label}</span><b>${money(sum)}</b><small>${rows.length} item${rows.length===1?'':'s'}</small>`;box.appendChild(b);});
    p.querySelector('.section-head')?.insertAdjacentElement('afterend',box);
  }
  if(!p.querySelector('.gtg-b1-damage')){
    const moneyPanel=document.querySelector('[data-panel="money"]');if(!moneyPanel)return;
    const sec=document.createElement('section');sec.className='gtg-b1-damage';sec.innerHTML='<div class="section-head"><div><h2>The <span>Damage</span></h2><p>Bookings and expenses, without the forensic accounting in WhatsApp.</p></div></div><div class="gtg-b1-money-copy"></div><div class="gtg-b1-damage-nav"><button type="button" class="btn" data-gtg-open-money>Open full money view →</button></div>';
    const clone=moneyPanel.cloneNode(true);clone.classList.add('active');clone.removeAttribute('data-panel');sec.querySelector('.gtg-b1-money-copy').appendChild(clone);p.appendChild(sec);
  }
}
function patchDock(){
  if(!owner())return;const b=document.querySelector('.dock button[data-tab="money"],.dock button[data-a="addExpense"]');if(!b||b.dataset.gtgSafeDock==='1')return;
  b.dataset.gtgSafeDock='1';delete b.dataset.tab;b.dataset.a='addExpense';const label=b.querySelector('small');if(label)label.textContent='Expense';
}
function patchExpense(){
  const select=modal.querySelector('#expenseForm select[name="people"][multiple]');if(!select||select.dataset.gtgSafeChecks==='1')return;
  select.dataset.gtgSafeChecks='1';select.classList.add('gtg-b1-native');const box=document.createElement('div');box.className='gtg-b1-checks';
  [...select.options].forEach(opt=>{const l=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.checked=opt.selected;cb.addEventListener('change',()=>{opt.selected=cb.checked;select.dispatchEvent(new Event('change',{bubbles:true}))});const s=document.createElement('span');s.textContent=opt.textContent;l.append(cb,s);box.appendChild(l)});select.closest('.field')?.appendChild(box);
}
function patchEvidence(){
  const p=document.querySelector('[data-panel="evidence"]');if(!p||p.querySelector('.gtg-b1-upgrade'))return;const old=p.querySelector('.card.upgrade');if(!old)return;
  const wrap=document.createElement('div');wrap.className='gtg-b1-upgrade';const items=[['20 GB shared media','Photos and videos kept with the trip for 12 months from activation.'],['The whole group can contribute','Everyone can add photos and videos to the same private trip.'],['Official Version','The shared gallery for the official record.'],['Hidden Gallery','A separate PIN-protected private gallery.'],['Grace + the GALS','Automated communications and richer prompts before, during and after.'],['Less chasing','Stronger payment nudges and organiser support.']];
  wrap.innerHTML=`<header><img src="assets/images/girls-trip-guide-logo.webp" alt=""><div class="eyebrow">Full Trip</div><h2>Lock in all the moments in one place.</h2><p>Free keeps the plan organised. Full Trip turns it into the shared record.</p></header><div class="gtg-b1-upgrid">${items.map(i=>`<div class="gtg-b1-upitem"><i>✓</i><div><b>${i[0]}</b><span>${i[1]}</span></div></div>`).join('')}</div><button type="button" class="gtg-b1-convince" data-gtg-convince>Convince me</button><div class="gtg-b1-price"><strong>£24.99</strong> one-off · covers the whole trip<br>${owner()?'<button class="btn primary" data-a="upgrade" style="margin-top:12px">Unlock Full Trip →</button>':''}<p>No per-person charge. Your existing trip, group, plan, costs, chat and polls stay exactly where they are.</p></div><section class="gtg-b1-grace"><img src="assets/images/grace.webp" alt="Grace"><div><div class="eyebrow">Grace's answer</div><h3>Right. Here's the problem.</h3><p>By Monday the best bits are scattered across everyone's camera rolls. Somebody has the only good video; somebody else says, <strong>“I'll send them later.”</strong></p><p>You organised the trip for what happened when you got there. Full Trip keeps the good stuff together while everyone still has it and gives the organiser 12 months to download the record independently.</p></div></section>`;
  old.replaceWith(wrap);
}
function patchGroup(){
  const p=document.querySelector('[data-panel="group"]');if(!p||p.querySelector('.gtg-b1-summary'))return;const cards=[...p.querySelectorAll('.crew-card')];if(!cards.length)return;
  const confirmed=cards.filter(c=>/confirmed/i.test(c.textContent||'')).length;const passport=cards.filter(c=>/passport ✓/i.test(c.textContent||'')).length;const uploads=cards.reduce((n,c)=>n+(Number((c.textContent||'').match(/(\d+) uploads/i)?.[1]||0)),0);
  const box=document.createElement('div');box.className='gtg-b1-summary';box.innerHTML=`<div><b>${confirmed}/${cards.length}</b><span>Confirmed</span></div><div><b>${Math.max(0,cards.length-confirmed)}</b><span>Invites pending</span></div><div><b>${passport}/${cards.length}</b><span>Passports confirmed</span></div><div><b>${free()?'—':uploads}</b><span>Uploads</span></div>`;p.querySelector('.section-head')?.insertAdjacentElement('afterend',box);
  if(owner()&&!p.querySelector('[data-gtg-reminders]')){const actions=p.querySelector('.section-head .actions');if(actions){const b=document.createElement('button');b.className='btn';b.type='button';b.dataset.gtgReminders='1';b.textContent='Trip reminders';b.addEventListener('click',()=>{drawer.querySelector('[data-a="settings"]')?.click()});actions.appendChild(b)}}
}
function apply(){patchDrawer();patchPlan();patchDock();patchExpense();patchEvidence();patchGroup();}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()});}

const observer=new MutationObserver(schedule);observer.observe(app,{childList:true,subtree:true});observer.observe(modal,{childList:true,subtree:true});observer.observe(drawer,{childList:true,subtree:true});
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-a]');if(!t)return;
  if(t.matches('[data-a="new"]')){e.preventDefault();e.stopImmediatePropagation();preview();return;}
  if(t.matches('[data-gtg-safe-details]')){e.preventDefault();details();return;}
  if(t.matches('[data-gtg-safe-back]')){e.preventDefault();preview();return;}
  if(t.matches('[data-gtg-safe-edit]')){e.preventDefault();details();return;}
  if(t.matches('[data-gtg-open-money]')){e.preventDefault();const u=new URL(location.href);u.searchParams.set('action','money');location.href=u.toString();return;}
  if(t.matches('[data-gtg-convince]')){e.preventDefault();t.closest('.gtg-b1-upgrade')?.querySelector('.gtg-b1-grace')?.classList.toggle('open');return;}
  setTimeout(schedule,0);
},true);
document.addEventListener('submit',e=>{
  const f=e.target;if(!(f instanceof HTMLFormElement))return;
  if(f.id==='gtgSafeDetails'){
    e.preventDefault();e.stopImmediatePropagation();if(working)return;const fd=new FormData(f);const d={name:String(fd.get('name')||'').trim(),destination:String(fd.get('destination')||'').trim(),start:String(fd.get('start')||''),end:String(fd.get('end')||''),owner:String(fd.get('owner')||'').trim(),email:String(fd.get('email')||'').trim().toLowerCase()};
    if(!d.name||!d.destination||!d.start||!d.end||!d.owner||!d.email){setStatus('Complete all five trip details.');return;}if(d.end<d.start){setStatus('The end date must be on or after the start date.');return;}saveDraft(d);sendCode(d).catch(err=>setStatus(err.message||'Could not send the secure code.'));return;
  }
  if(f.id==='gtgSafeOtp'){
    e.preventDefault();e.stopImmediatePropagation();if(working)return;const code=String(new FormData(f).get('code')||'').replace(/\D/g,'');if(code.length!==8){setStatus('Enter the 8-digit secure code.');return;}finishCreate(code).catch(err=>setStatus(err.message||'Could not create the trip.'));return;
  }
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();
