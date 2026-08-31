/* Full Trip Home: claim the final shell immediately, then hydrate photo/chat data in place. */
(() => {
'use strict';
if(!document.querySelector('link[data-live-dashboard-hero]')){
  const link=document.createElement('link');
  link.rel='stylesheet';link.href='/live-dashboard-hero.css?v=5';link.dataset.liveDashboardHero='1';
  document.head.appendChild(link);
}
const URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,rotateTimer=0,mountBusy=false,mountQueued=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
function db(){if(!client&&window.supabase?.createClient)client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}

async function photoUrls(tripId){
  const q=db();if(!q||!tripId)return[];
  const {data,error}=await q.from('media')
    .select('id,storage_path,thumbnail_path,mime_type,created_at')
    .eq('trip_id',tripId).eq('album','evidence').like('mime_type','image/%')
    .order('created_at',{ascending:false}).limit(5);
  if(error)throw error;
  return (await Promise.all((data||[]).map(async row=>{
    const path=row.thumbnail_path||row.storage_path;if(!path)return'';
    const {data:signed}=await q.storage.from('btg-evidence').createSignedUrl(path,1800);
    return signed?.signedUrl||'';
  }))).filter(Boolean);
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
  const oldDates=hero.querySelector('.trip-stamp span')?.innerHTML||'TBC';

  hero.classList.add('live-snapshot-hero');hero.classList.remove('gtg-live-pending');hero.dataset.liveSnapshot='1';hero.innerHTML='';hero.appendChild(title);

  const photo=document.createElement('div');photo.className='live-photo-block';
  photo.innerHTML=`<div class="live-hero-label"><span>Latest photo</span><span aria-hidden="true">↻</span></div><div class="live-photo-frame"><button type="button" class="live-photo-open" data-a="vault" aria-label="Open Hidden Gallery"><span class="live-photo-empty live-data-loading" aria-label="Loading latest photo"><i></i></span></button><button type="button" class="live-photo-add" data-a="upload">+ Add trip photo</button></div>`;
  hero.appendChild(photo);

  const msg=document.createElement('div');msg.className='live-message-card live-message-loading';
  msg.setAttribute('role','button');msg.setAttribute('tabindex','0');msg.setAttribute('aria-label','Open group chat');
  msg.innerHTML=`<div class="live-hero-label"><span>Latest message</span></div><div class="live-message-meta"><span class="live-message-avatar" aria-hidden="true"></span><b><i class="live-line live-line-short"></i></b><time></time></div><p><i class="live-line"></i><i class="live-line live-line-mid"></i></p>`;
  msg.addEventListener('click',openGroupChat);msg.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openGroupChat()}});
  hero.appendChild(msg);

  const dates=document.createElement('div');dates.className='live-date-card';dates.innerHTML=`<b>Trip dates</b><span>${oldDates}</span>`;hero.appendChild(dates);
  return photo.querySelector('.live-photo-open');
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
  const photoOpen=buildShell(hero,titleSource);
  try{
    const urls=await photoUrls(tripId).catch(error=>{console.warn('Girls latest trip photos unavailable.',error);return[]});
    if(!hero.isConnected)return;
    if(urls[0])photoOpen.innerHTML=`<img src="${esc(urls[0])}" alt="Latest trip photo" decoding="async">`;
    else photoOpen.innerHTML='<span class="live-photo-empty">No trip photos yet.</span>';

    clearInterval(rotateTimer);
    if(urls.length>1){let i=0;rotateTimer=setInterval(()=>{const img=hero.querySelector('.live-photo-open img');if(!img||!hero.isConnected){clearInterval(rotateTimer);return}i=(i+1)%urls.length;img.src=urls[i]},6000)}
  }finally{
    mountBusy=false;
    if(mountQueued){mountQueued=false;setTimeout(requestMount,0)}
  }
}

const observer=new MutationObserver(requestMount);
observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
requestMount();
})();
