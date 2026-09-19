/* Girls app-background Evidence primer: prepare thumbnail/preview cache in quiet batches of nine. */
(()=>{
'use strict';
if(window.__GTG_HOME_THUMBNAIL_PRIME__)return;window.__GTG_HOME_THUMBNAIL_PRIME__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co',KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const BATCH_SIZE=9,MAX_MEDIA=250,CONCURRENT=2,START_DELAY=900,PAUSE_AFTER_INPUT=1000,SIGNED_SECONDS=3600,BETWEEN_BATCH_MS=180;
let client=null,timer=0,pauseUntil=0,runToken=0,controller=null,tripKey='',running=false,applyTimer=0;
const primed=new Map();
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const connection=()=>navigator.connection||navigator.mozConnection||navigator.webkitConnection||null;
const constrained=()=>{const c=connection();return Boolean(c?.saveData||/^(slow-2g|2g)$/i.test(String(c?.effectiveType||'')))};
const evidenceActive=()=>Boolean(document.querySelector('.gtg-immersive-media-host,[data-panel="evidence"].active'));
const appReady=()=>Boolean(tripId()&&document.querySelector('#app .dashboard[data-home-composition="full"]')&&!evidenceActive());
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function markInput(){pauseUntil=Date.now()+PAUSE_AFTER_INPUT}
function cancel(){runToken++;running=false;controller?.abort();controller=null}
function resetForTrip(){const id=tripId();if(!id||id===tripKey)return;cancel();tripKey=id;primed.clear()}
function idleTurn(token){return new Promise(resolve=>{
  const check=()=>{
    if(token!==runToken||document.visibilityState==='hidden'||evidenceActive()){resolve(false);return}
    const delay=pauseUntil-Date.now();if(delay>0){setTimeout(check,Math.min(delay,250));return}
    if('requestIdleCallback'in window)requestIdleCallback(()=>resolve(token===runToken&&!evidenceActive()&&document.visibilityState!=='hidden'),{timeout:700});
    else setTimeout(()=>resolve(token===runToken&&!evidenceActive()&&document.visibilityState!=='hidden'),70);
  };check();
})}
async function previewUrl(row){
  if(row.thumbnail_path){
    const {data,error}=await db().storage.from('btg-evidence').createSignedUrl(row.thumbnail_path,SIGNED_SECONDS);
    if(error)throw error;
    return data?.signedUrl||'';
  }
  if(!row.storage_path)return'';
  const {data,error}=await db().storage.from('btg-evidence').createSignedUrl(row.storage_path,SIGNED_SECONDS,{transform:{width:480,height:480,resize:'cover',quality:64}});
  if(error)throw error;
  return data?.signedUrl||'';
}
async function cachePreview(row,token,signal){
  if(token!==runToken||!row?.id||signal.aborted)return;
  const ready=await idleTurn(token);if(!ready||signal.aborted)return;
  const url=await previewUrl(row);if(!url||signal.aborted)return;
  const response=await fetch(url,{cache:'force-cache',credentials:'omit',priority:'low',signal});
  if(response.ok||response.type==='opaque')primed.set(String(row.id),url);
}
async function prepareBatch(batch,token,signal){
  const ready=await idleTurn(token);if(!ready||signal.aborted)return false;
  let cursor=0;
  const worker=async()=>{while(token===runToken&&!signal.aborted){const row=batch[cursor++];if(!row)return;if(primed.has(String(row.id)))continue;try{await cachePreview(row,token,signal)}catch(error){if(error?.name!=='AbortError')console.debug?.('Evidence preview prime skipped.',error)}}};
  await Promise.all(Array.from({length:Math.min(CONCURRENT,batch.length)},worker));
  return token===runToken&&!signal.aborted;
}
async function prime(){
  resetForTrip();if(running||!appReady()||constrained()||document.visibilityState==='hidden'||!tripKey)return;
  const q=db();if(!q)return;running=true;const token=++runToken;controller=new AbortController();
  try{
    const {data,error}=await q.from('media').select('id,thumbnail_path,storage_path,mime_type,created_at').eq('trip_id',tripKey).eq('album','evidence').order('created_at',{ascending:false}).limit(MAX_MEDIA);if(error)throw error;
    const rows=(data||[]).filter(row=>String(row?.mime_type||'').startsWith('image/')&&row?.storage_path);
    for(let offset=0;offset<rows.length;offset+=BATCH_SIZE){
      if(token!==runToken||controller.signal.aborted||evidenceActive()||document.visibilityState==='hidden')break;
      const ok=await prepareBatch(rows.slice(offset,offset+BATCH_SIZE),token,controller.signal);if(!ok)break;
      if(offset+BATCH_SIZE<rows.length)await sleep(BETWEEN_BATCH_MS);
    }
  }catch(error){if(error?.name!=='AbortError')console.debug?.('Evidence preview prime unavailable.',error)}
  finally{if(token===runToken){running=false;controller=null}}
}
function applyPrimed(){clearTimeout(applyTimer);const panel=document.querySelector('[data-panel="evidence"].active');if(!panel)return;panel.querySelectorAll('[data-media-id]').forEach(node=>{const id=node.dataset?.mediaId||node.closest?.('[data-media-id]')?.dataset?.mediaId||'',url=primed.get(String(id));if(!url)return;const img=node instanceof HTMLImageElement?node:node.querySelector?.('img');if(img&&!img.getAttribute('src')){img.decoding='async';img.setAttribute('src',url)}})}
function scheduleApply(delay=12){clearTimeout(applyTimer);applyTimer=setTimeout(applyPrimed,delay)}
function schedule(delay=START_DELAY){clearTimeout(timer);timer=setTimeout(()=>{if(appReady()&&!constrained())void prime()},delay)}
function boot(){
  if(!window.supabase?.createClient){setTimeout(boot,60);return}resetForTrip();schedule();
  const mo=new MutationObserver(()=>{resetForTrip();if(evidenceActive())cancel();else if(appReady()&&!running)schedule(500)});mo.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('pointerdown',event=>{markInput();if(event.target.closest?.('[data-tab="evidence"],[data-media-id]')){scheduleApply(0);cancel()}},{capture:true,passive:true});
  document.addEventListener('click',event=>{if(event.target.closest?.('[data-tab="evidence"]'))scheduleApply(0)},true);
  document.addEventListener('keydown',markInput,{capture:true,passive:true});window.addEventListener('scroll',markInput,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')cancel();else schedule(650)});
  window.addEventListener('pageshow',()=>schedule(800));
  window.addEventListener('gtg:core-data-ready',()=>schedule(350));
  window.addEventListener('gtg:media-uploaded',()=>{primed.clear();schedule(450)});
  window.GTGHomeThumbnailPrime={prime,cancel,peek:id=>primed.get(String(id))||'',apply:applyPrimed,stats:()=>({tripId:tripKey,primed:primed.size,running,batchSize:BATCH_SIZE,maxMedia:MAX_MEDIA,concurrent:CONCURRENT,constrained:constrained()})};
}
boot();
})();
