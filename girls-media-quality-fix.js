/* Girls media quality hardening: sharp Instagram-style thumbnails while preserving the original-file viewer. */
(()=>{
'use strict';
if(window.__GTG_MEDIA_QUALITY_FIX__)return;window.__GTG_MEDIA_QUALITY_FIX__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co',KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client,io=null;const rows=new Map(),urls=new Map(),loading=new Set();
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const isVideo=row=>String(row?.mime_type||'').startsWith('video/');

function installStyles(){
  if(document.getElementById('gtg-media-quality-fix-css'))return;
  const s=document.createElement('style');s.id='gtg-media-quality-fix-css';s.textContent=`
  @media(max-width:600px){
    [data-panel="evidence"] .gallery{
      display:grid!important;
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      gap:1px!important;
      align-items:stretch!important;
      width:100vw!important;
      max-width:100vw!important;
      margin-left:calc(50% - 50vw)!important;
      margin-right:calc(50% - 50vw)!important;
      padding:0!important;
      background:#000!important;
    }
    [data-panel="evidence"] .gallery .media{
      position:relative!important;
      min-width:0!important;
      width:100%!important;
      height:auto!important;
      aspect-ratio:3/4!important;
      overflow:hidden!important;
      border:0!important;
      border-radius:0!important;
      background:#050305!important;
      margin:0!important;
      box-shadow:none!important;
    }
    [data-panel="evidence"] .gallery .media>img[data-media-id],
    [data-panel="evidence"] .gallery .media>video,
    [data-panel="evidence"] .gallery .gtg-video-preview{
      display:block!important;
      width:100%!important;
      height:100%!important;
      min-height:0!important;
      max-width:none!important;
      max-height:none!important;
      aspect-ratio:3/4!important;
      object-fit:cover!important;
      object-position:center!important;
      border:0!important;
      border-radius:0!important;
      background:#050305!important;
    }
    [data-panel="evidence"] .gallery .gtg-video-preview{position:relative!important;padding:0!important;overflow:hidden!important}
    [data-panel="evidence"] .gallery .gtg-video-preview img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;border-radius:0!important}
    [data-panel="evidence"] .gallery .gtg-video-preview span{display:none!important}
    [data-panel="evidence"] .gallery .media::after{content:none!important}
    [data-panel="evidence"] .gallery .media:has(>video)::after,
    [data-panel="evidence"] .gallery .media:has(.gtg-video-preview)::after{
      content:'▶'!important;
      position:absolute!important;
      right:7px!important;
      bottom:7px!important;
      z-index:4!important;
      display:grid!important;
      place-items:center!important;
      width:20px!important;
      height:20px!important;
      border-radius:50%!important;
      background:rgba(0,0,0,.46)!important;
      color:#fff!important;
      font-size:9px!important;
      font-weight:900!important;
      line-height:1!important;
      padding-left:1px!important;
      text-shadow:0 1px 4px #000!important;
      pointer-events:none!important;
    }
    [data-panel="evidence"] .gallery .media-tools{display:none!important}
    [data-panel="evidence"] .gallery .gtg-optimistic::after{display:none!important}
  }
  `;document.head.appendChild(s);
}

async function rowFor(id){
  if(rows.has(id))return rows.get(id);if(loading.has(id))return null;const tid=tripId();if(!tid||!db())return null;
  loading.add(id);try{const {data,error}=await db().from('media').select('id,trip_id,album,storage_path,mime_type,file_name').eq('trip_id',tid).eq('id',id).maybeSingle();if(error)throw error;if(data)rows.set(id,data);return data||null}finally{loading.delete(id)}
}
async function retinaUrl(row){
  const key=`${row.id}:${row.storage_path}`,cached=urls.get(key);if(cached?.url&&cached.expiresAt>Date.now()+60000)return cached.url;
  const bucket=row.album==='vault'?'btg-vault':'btg-evidence';const {data,error}=await db().storage.from(bucket).createSignedUrl(row.storage_path,1800,{transform:{width:720,height:960,resize:'cover',quality:80}});if(error)throw error;
  const url=data?.signedUrl||'';urls.set(key,{url,expiresAt:Date.now()+1800*1000});return url;
}
function preload(url){return new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.addEventListener('load',()=>resolve(img),{once:true});img.addEventListener('error',()=>reject(Error('Photo could not be loaded.')),{once:true});img.src=url})}
async function upgrade(img){
  if(!img?.isConnected||img.dataset.gtgRetinaReady==='1')return;const id=img.dataset.mediaId;if(!id)return;img.dataset.gtgRetinaReady='loading';
  try{const row=await rowFor(id);if(!row||isVideo(row)){delete img.dataset.gtgRetinaReady;return}const url=await retinaUrl(row);if(!url||!img.isConnected)return;const loaded=await preload(url);if(img.isConnected){img.src=loaded.src;img.dataset.gtgRetinaReady='1'}}
  catch(error){delete img.dataset.gtgRetinaReady;console.warn('Retina Girls evidence preview unavailable.',error)}
}
function observe(){
  io?.disconnect();io=null;const imgs=[...document.querySelectorAll('[data-panel="evidence"] .gallery img[data-media-id]')];if(!imgs.length)return;
  if(!('IntersectionObserver'in window)){imgs.slice(0,18).forEach(img=>void upgrade(img));return}
  io=new IntersectionObserver(entries=>entries.filter(e=>e.isIntersecting).forEach(e=>{io?.unobserve(e.target);void upgrade(e.target)}),{rootMargin:'700px 0px'});imgs.forEach(img=>io.observe(img));
}
function resetMedia(id){
  if(!id)return;rows.delete(id);for(const key of [...urls.keys()])if(key.startsWith(`${id}:`))urls.delete(key);
  document.querySelectorAll(`[data-media-id="${id}"]`).forEach(node=>{if(node instanceof HTMLImageElement)delete node.dataset.gtgRetinaReady});
}
function schedule(){[0,80,300,1000].forEach(delay=>setTimeout(observe,delay))}
function boot(){if(!window.supabase?.createClient){setTimeout(boot,50);return}installStyles();schedule();const mo=new MutationObserver(()=>{clearTimeout(window.__gtgMediaQualitySchedule);window.__gtgMediaQualitySchedule=setTimeout(schedule,25)});mo.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest?.('[data-tab="evidence"],[data-a="filterEvidence"]'))schedule()},true);window.addEventListener('gtg:media-uploaded',()=>{rows.clear();urls.clear();schedule()});window.addEventListener('gtg:thumbnail-ready',event=>{resetMedia(event.detail?.mediaId);schedule()});window.addEventListener('pageshow',schedule)}
boot();
})();
