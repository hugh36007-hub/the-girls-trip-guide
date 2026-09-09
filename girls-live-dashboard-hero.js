/* Full Trip Home: hydrate the core-owned Full hero without replacing its DOM structure. */
(()=>{
'use strict';
if(window.__GTG_LIVE_DASHBOARD_HERO__)return;window.__GTG_LIVE_DASHBOARD_HERO__=true;
if(!document.querySelector('link[data-live-dashboard-hero]')){
  const link=document.createElement('link');
  link.rel='stylesheet';link.href='/live-dashboard-hero.css?v=10';link.dataset.liveDashboardHero='1';
  document.head.appendChild(link);
}
const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,rotateTimer=0,hydrateBusy=false,hydrateQueued=false,hydrateScheduled=false;
function db(){if(!client&&window.supabase?.createClient)client=window.supabase.createClient(SUPABASE_URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function coreHero(){return document.querySelector('.dashboard[data-home-composition="full"] .hero-card.live-snapshot-hero[data-live-snapshot="1"][data-full-hero-owner="girls-app-v2"]')}

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

function paintPhoto(button,url){
  if(url){const img=new Image();img.src=url;img.alt='Latest trip photo';img.decoding='async';button.replaceChildren(img);return}
  const empty=document.createElement('span');empty.className='live-photo-empty';empty.textContent='No trip photos yet.';button.replaceChildren(empty);
}

function requestHydrate(){
  if(hydrateBusy){hydrateQueued=true;return}
  if(hydrateScheduled)return;
  hydrateScheduled=true;
  queueMicrotask(()=>{hydrateScheduled=false;void hydrate().catch(error=>console.error('Girls Full Home photo hydration failed.',error))});
}

async function hydrate(){
  if(hydrateBusy){hydrateQueued=true;return}
  const hero=coreHero();if(!hero||hero.dataset.livePhotoHydrated==='1'||hero.dataset.livePhotoHydration==='loading')return;
  const q=db();if(!q){setTimeout(requestHydrate,60);return}
  const tripId=new globalThis.URL(location.href).searchParams.get('trip_id');if(!tripId)return;
  const photoOpen=hero.querySelector('.live-photo-open');if(!photoOpen)return;
  hero.dataset.livePhotoHydration='loading';hydrateBusy=true;hydrateQueued=false;
  try{
    const urls=await photoUrls(tripId).catch(error=>{console.warn('Girls latest trip photos unavailable.',error);return[]});
    if(!hero.isConnected||hero!==coreHero())return;
    paintPhoto(photoOpen,urls[0]||'');
    hero.dataset.livePhotoHydrated='1';
    clearInterval(rotateTimer);
    if(urls.length>1){let i=0;rotateTimer=setInterval(()=>{if(!hero.isConnected||hero!==coreHero()){clearInterval(rotateTimer);return}const img=hero.querySelector('.live-photo-open img');if(!img){clearInterval(rotateTimer);return}i=(i+1)%urls.length;img.src=urls[i]},6000)}
  }finally{
    if(hero.isConnected)delete hero.dataset.livePhotoHydration;
    hydrateBusy=false;
    if(hydrateQueued){hydrateQueued=false;setTimeout(requestHydrate,0)}
  }
}

const observer=new MutationObserver(requestHydrate);
observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
window.addEventListener('pageshow',requestHydrate);
window.addEventListener('popstate',requestHydrate);
requestHydrate();
})();
