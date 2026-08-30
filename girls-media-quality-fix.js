/* Girls media quality hardening: Retina photo previews and natural mobile framing. */
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
    [data-panel="evidence"] .gallery .media:has(>img[data-media-id]){height:auto!important;aspect-ratio:auto!important;background:#090709!important}
    [data-panel="evidence"] .gallery .media>img[data-media-id]{display:block!important;width:100%!important;height:auto!important;max-height:none!important;aspect-ratio:auto!important;object-fit:contain!important;background:#090709!important}
  }
  `;document.head.appendChild(s);
}

async function rowFor(id){
  if(rows.has(id))return rows.get(id);if(loading.has(id))return null;const tid=tripId();if(!tid||!db())return null;
  loading.add(id);try{const {data,error}=await db().from('media').select('id,trip_id,album,storage_path,mime_type,file_name').eq('trip_id',tid).eq('id',id).maybeSingle();if(error)throw error;if(data)rows.set(id,data);return data||null}finally{loading.delete(id)}
}
async function retinaUrl(row){
  const key=`${row.id}:${row.storage_path}`,cached=urls.get(key);if(cached?.url&&cached.expiresAt>Date.now()+60000)return cached.url;
  const bucket=row.album==='vault'?'btg-vault':'btg-evidence';const {data,error}=await db().storage.from(bucket).createSignedUrl(row.storage_path,1800,{transform:{width:1280,height:1280,resize:'contain',quality:82}});if(error)throw error;
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
  if(!('IntersectionObserver'in window)){imgs.slice(0,12).forEach(img=>void upgrade(img));return}
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
