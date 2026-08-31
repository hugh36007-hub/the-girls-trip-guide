/* Full Trip home hero: live latest photos + latest message. */
(() => {
'use strict';
if(!document.querySelector('link[data-live-dashboard-hero]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/live-dashboard-hero.css?v=3';link.dataset.liveDashboardHero='1';document.head.appendChild(link)}
const URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,rotateTimer=0,mountToken=0,mountBusy=false,mountQueued=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const fmt=v=>v?new Date(`${String(v).slice(0,10)}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'TBC';
const relativeTime=value=>{const ms=Date.now()-new Date(value||0).getTime();if(!Number.isFinite(ms)||ms<0)return'';const m=Math.floor(ms/60000);if(m<1)return'now';if(m<60)return`${m}m ago`;const h=Math.floor(m/60);if(h<24)return`${h}h ago`;return`${Math.floor(h/24)}d ago`};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const preload=url=>new Promise(resolve=>{if(!url){resolve();return;}const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve()};img.onload=()=>{if(img.decode)img.decode().catch(()=>{}).finally(finish);else finish()};img.onerror=finish;img.src=url;setTimeout(finish,1800)});
function db(){if(!client&&window.supabase?.createClient)client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false}});return client}
async function loadSnapshot(tripId){
  const q=db();if(!q)return null;
  await q.auth.getSession().catch(()=>null);
  const getMedia=()=>q.from('media').select('id,storage_path,thumbnail_path,mime_type,created_at').eq('trip_id',tripId).eq('album','evidence').like('mime_type','image/%').order('created_at',{ascending:false}).limit(5);
  let [tripRes,mediaRes,msgRes,membersRes,userRes]=await Promise.all([
    q.from('trips').select('id,name,start_date,end_date,owner_id').eq('id',tripId).eq('product_key','girls').single(),
    getMedia(),
    q.from('trip_messages').select('message,created_at,sender_user_id,recipient_member_id').eq('trip_id',tripId).order('created_at',{ascending:false}).limit(1),
    q.from('trip_members').select('id,name,user_id').eq('trip_id',tripId),
    q.auth.getUser()
  ]);
  if(tripRes.error)return null;
  if(!mediaRes.error&&!(mediaRes.data||[]).length){await wait(220);mediaRes=await getMedia()}
  const urls=[];
  for(const row of mediaRes.data||[]){
    const path=row.thumbnail_path||row.storage_path;if(!path)continue;
    const {data}=await q.storage.from('btg-evidence').createSignedUrl(path,1800);if(data?.signedUrl)urls.push(data.signedUrl);
  }
  const latest=msgRes.data?.[0]||null,members=membersRes.data||[],sender=latest?members.find(m=>m.user_id===latest.sender_user_id):null;
  return {trip:tripRes.data,urls,message:latest?{text:latest.message,at:latest.created_at,from:sender?.name||'Organiser',to:latest.recipient_member_id||''}:null,members,memberCount:members.length,isOwner:userRes.data?.user?.id===tripRes.data.owner_id};
}
async function openMessages(snap){
  if(!snap?.message){const proxy=document.createElement('button');proxy.type='button';proxy.dataset.a='messageCrew';proxy.hidden=true;document.body.appendChild(proxy);proxy.click();proxy.remove();return;}
  const q=db(),recipient=snap.message.to||'';
  let query=q.from('trip_messages').select('message,created_at,sender_user_id,recipient_member_id').eq('trip_id',snap.trip.id).order('created_at',{ascending:true}).limit(100);
  query=recipient?query.eq('recipient_member_id',recipient):query.is('recipient_member_id',null);
  const {data,error}=await query;if(error)return;
  const label=recipient?(snap.members.find(m=>m.id===recipient)?.name||'Group member'):'Whole group';
  const rows=(data||[]).map(row=>{const sender=snap.members.find(m=>m.user_id===row.sender_user_id)?.name||'Organiser';return `<div class="money-row"><div><b>${esc(sender)}</b><div style="font-size:11px;color:var(--muted);margin-top:4px;line-height:1.45">${esc(row.message)}</div><div style="font-size:9px;color:var(--muted);margin-top:5px">${esc(new Date(row.created_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}</div></div></div>`}).join('')||'<div class="empty">No messages in this conversation yet.</div>';
  const root=document.getElementById('modalRoot');if(!root)return;
  root.innerHTML=`<div class="modal"><h2>${esc(label)}</h2><div class="card" style="max-height:42vh;overflow:auto;margin:14px 0"><div class="eyebrow">Conversation</div>${rows}</div><form id="messageForm" class="form"><input type="hidden" name="recipient" value="${esc(recipient)}"><div class="field"><label>Message</label><textarea name="message" required maxlength="500" placeholder="Write a message…"></textarea></div><div class="modal-actions"><button type="button" class="btn" data-a="close">Close</button><button class="btn primary">Send</button></div></form></div>`;
  root.classList.add('open');
}
function requestMount(){
  if(mountBusy){mountQueued=true;return;}
  queueMicrotask(()=>void mount());
}
async function mount(){
  if(mountBusy){mountQueued=true;return;}
  const hero=document.querySelector('.dashboard .hero-card');
  if(!hero||hero.dataset.liveSnapshot==='1')return;
  const paid=[...hero.querySelectorAll('.eyebrow')].some(x=>/full trip/i.test(x.textContent||''));if(!paid)return;
  const tripId=new URL(location.href).searchParams.get('trip_id');if(!tripId)return;
  const titleSource=hero.querySelector('.hero-meta>div:first-child');if(!titleSource)return;
  mountBusy=true;mountQueued=false;
  const token=++mountToken;
  try{
    const snap=await loadSnapshot(tripId).catch(()=>null);if(!snap)return;
    if(token!==mountToken||!hero.isConnected){mountQueued=true;return;}
    if(snap.urls[0])await preload(snap.urls[0]);
    if(token!==mountToken||!hero.isConnected){mountQueued=true;return;}
    const title=titleSource.cloneNode(true);title.className='live-hero-title';const eyebrow=title.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='FOR THE RECORD';
    const subtitle=title.querySelector('p');if(subtitle)subtitle.textContent=`${snap.trip.name} · ${snap.memberCount} crew`;
    hero.classList.add('live-snapshot-hero');hero.dataset.liveSnapshot='1';hero.innerHTML='';hero.appendChild(title);
    const photo=document.createElement('div');photo.className='live-photo-block';
    photo.innerHTML=`<div class="live-hero-label"><span>Latest photo</span><span aria-hidden="true">↻</span></div><div class="live-photo-frame"><button type="button" class="live-photo-open" data-a="vault" aria-label="Open Hidden Gallery">${snap.urls[0]?`<img src="${esc(snap.urls[0])}" alt="Latest trip photo">`:'<span class="live-photo-empty">No trip photos yet.</span>'}</button><button type="button" class="live-photo-add" data-a="upload">+ Add trip photo</button></div>`;
    hero.appendChild(photo);
    const msg=document.createElement('div');msg.className='live-message-card';msg.innerHTML=`<div class="live-hero-label"><span>Latest message</span></div><div class="live-message-meta"><span class="live-message-avatar">${esc((snap.message?.from||'T').slice(0,1).toUpperCase())}</span><b>${esc(snap.message?.from||'Trip')}</b><time>${esc(snap.message?relativeTime(snap.message.at):'')}</time></div><p>${esc(snap.message?.text||'No trip messages yet.')}</p>`;
    if(snap.isOwner){
      msg.setAttribute('role','button');msg.setAttribute('tabindex','0');msg.setAttribute('aria-label',snap.message?'Open this conversation':'Start a message');
      msg.addEventListener('click',()=>void openMessages(snap));
      msg.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();void openMessages(snap)}});
    }
    hero.appendChild(msg);
    const dates=document.createElement('div');dates.className='live-date-card';dates.innerHTML=`<b>Trip dates</b><span>${fmt(snap.trip.start_date)}<br>${fmt(snap.trip.end_date)}</span>`;hero.appendChild(dates);
    clearInterval(rotateTimer);if(snap.urls.length>1){let i=0;rotateTimer=setInterval(()=>{const img=hero.querySelector('.live-photo-open img');if(!img||!hero.isConnected){clearInterval(rotateTimer);return}i=(i+1)%snap.urls.length;img.src=snap.urls[i]},6000)}
  }finally{
    mountBusy=false;
    if(mountQueued){mountQueued=false;setTimeout(requestMount,0)}
  }
}
const observer=new MutationObserver(requestMount);observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});requestMount();
})();
