/* Full Trip home hero: render the live layout immediately, then hydrate photo/chat data. */
(() => {
'use strict';
if(!document.querySelector('link[data-live-dashboard-hero]')){
  const link=document.createElement('link');
  link.rel='stylesheet';link.href='/live-dashboard-hero.css?v=4';link.dataset.liveDashboardHero='1';
  document.head.appendChild(link);
}
const URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,rotateTimer=0,mountBusy=false,mountQueued=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]||c));
const fmt=v=>v?new Date(`${String(v).slice(0,10)}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'TBC';
function db(){if(!client&&window.supabase?.createClient)client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}

async function loadSnapshot(tripId){
  const q=db();if(!q)return null;
  const [tripRes,mediaRes,membersRes,userRes]=await Promise.all([
    q.from('trips').select('id,name,start_date,end_date,owner_id').eq('id',tripId).eq('product_key','girls').single(),
    q.from('media').select('id,storage_path,thumbnail_path,mime_type,created_at').eq('trip_id',tripId).eq('album','evidence').like('mime_type','image/%').order('created_at',{ascending:false}).limit(5),
    q.from('trip_members').select('id,name,user_id').eq('trip_id',tripId),
    q.auth.getUser()
  ]);
  if(tripRes.error)return null;
  const urls=(await Promise.all((mediaRes.data||[]).map(async row=>{
    const path=row.thumbnail_path||row.storage_path;if(!path)return'';
    const {data}=await q.storage.from('btg-evidence').createSignedUrl(path,1800);
    return data?.signedUrl||'';
  }))).filter(Boolean);
  const members=membersRes.data||[];
  return {trip:tripRes.data,urls,members,memberCount:members.length,isOwner:userRes.data?.user?.id===tripRes.data.owner_id};
}

function openGroupChat(){
  const tab=document.querySelector('[data-tab="group"]');
  if(!tab)return;
  tab.click();
  setTimeout(()=>document.querySelector('[data-gtg-trip-social]')?.scrollIntoView({block:'start'}),240);
}

function buildShell(hero,titleSource){
  const title=titleSource.cloneNode(true);
  title.className='live-hero-title';
  const eyebrow=title.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='FOR THE RECORD';
  const oldDates=title.querySelector('p')?.textContent||'';
  if(title.querySelector('p'))title.querySelector('p').textContent='Loading trip snapshot…';

  hero.classList.add('live-snapshot-hero');hero.dataset.liveSnapshot='1';hero.innerHTML='';hero.appendChild(title);

  const photo=document.createElement('div');photo.className='live-photo-block';
  photo.innerHTML=`<div class="live-hero-label"><span>Latest photo</span><span aria-hidden="true">↻</span></div><div class="live-photo-frame"><button type="button" class="live-photo-open" data-a="vault" aria-label="Open Hidden Gallery"><span class="live-photo-empty">Loading latest photo…</span></button><button type="button" class="live-photo-add" data-a="upload">+ Add trip photo</button></div>`;
  hero.appendChild(photo);

  const msg=document.createElement('div');msg.className='live-message-card';
  msg.setAttribute('role','button');msg.setAttribute('tabindex','0');msg.setAttribute('aria-label','Open group chat');
  msg.innerHTML=`<div class="live-hero-label"><span>Latest message</span></div><div class="live-message-meta"><span class="live-message-avatar">…</span><b>Chat</b><time></time></div><p>Checking latest chat…</p>`;
  msg.addEventListener('click',openGroupChat);msg.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openGroupChat()}});
  hero.appendChild(msg);

  const dates=document.createElement('div');dates.className='live-date-card';dates.innerHTML=`<b>Trip dates</b><span>${esc(oldDates||'Loading…')}</span>`;hero.appendChild(dates);
  return {title,photoOpen:photo.querySelector('.live-photo-open'),dates};
}

function requestMount(){if(mountBusy){mountQueued=true;return;}queueMicrotask(()=>void mount())}

async function mount(){
  if(mountBusy){mountQueued=true;return;}
  const hero=document.querySelector('.dashboard .hero-card');
  if(!hero||hero.dataset.liveSnapshot==='1')return;
  const paid=[...hero.querySelectorAll('.eyebrow')].some(x=>/full trip/i.test(x.textContent||''));if(!paid)return;
  const tripId=new URL(location.href).searchParams.get('trip_id');if(!tripId)return;
  const titleSource=hero.querySelector('.hero-meta>div:first-child');if(!titleSource)return;

  mountBusy=true;mountQueued=false;
  const shell=buildShell(hero,titleSource);
  try{
    const snap=await loadSnapshot(tripId).catch(error=>{console.warn('Girls live hero data unavailable.',error);return null});
    if(!snap||!hero.isConnected)return;
    const subtitle=shell.title.querySelector('p');if(subtitle)subtitle.textContent=`${snap.trip.name} · ${snap.memberCount} crew`;
    const span=shell.dates.querySelector('span');if(span)span.innerHTML=`${fmt(snap.trip.start_date)}<br>${fmt(snap.trip.end_date)}`;
    if(snap.urls[0])shell.photoOpen.innerHTML=`<img src="${esc(snap.urls[0])}" alt="Latest trip photo" decoding="async">`;
    else shell.photoOpen.innerHTML='<span class="live-photo-empty">No trip photos yet.</span>';

    clearInterval(rotateTimer);
    if(snap.urls.length>1){let i=0;rotateTimer=setInterval(()=>{const img=hero.querySelector('.live-photo-open img');if(!img||!hero.isConnected){clearInterval(rotateTimer);return}i=(i+1)%snap.urls.length;img.src=snap.urls[i]},6000)}
  }finally{
    mountBusy=false;
    if(mountQueued){mountQueued=false;setTimeout(requestMount,0)}
  }
}

const observer=new MutationObserver(requestMount);
observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
requestMount();
})();
