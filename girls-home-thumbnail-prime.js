/* Girls home-screen Evidence thumbnail primer: cache first 30 stored thumbnails without decoding originals. */
(()=>{
'use strict';
if(window.__GTG_HOME_THUMBNAIL_PRIME__)return;window.__GTG_HOME_THUMBNAIL_PRIME__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co',KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const THUMB_LIMIT=30,CONCURRENT=2,START_DELAY=1400,PAUSE_AFTER_INPUT=900,SIGNED_SECONDS=3600;
let client=null,timer=0,pauseUntil=0,runToken=0,controller=null,tripKey='',running=false,applyTimer=0;
const primed=new Map();
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const connection=()=>navigator.connection||navigator.mozConnection||navigator.webkitConnection||null;
const constrained=()=>{const c=connection();return Boolean(c?.saveData||/^(slow-2g|2g)$/i.test(String(c?.effectiveType||'')))};
const evidenceActive=()=>Boolean(document.querySelector('.gtg-immersive-media-host,[data-panel="evidence"] .gallery .gtg-mobile-media-tile'));
const homeReady=()=>Boolean(tripId()&&document.querySelector('#app .appbar')&&!evidenceActive());
function markInput(){pauseUntil=Date.now()+PAUSE_AFTER_INPUT}
function cancel(){runToken++;running=false;controller?.abort();controller=null}
function resetForTrip(){const id=tripId();if(!id||id===tripKey)return;cancel();tripKey=id;primed.clear()}
function idleTurn(token){return new Promise(resolve=>{
  const check=()=>{
    if(token!==runToken||document.visibilityState==='hidden'||evidenceActive()){resolve(false);return}
    const delay=pauseUntil-Date.now();if(delay>0){setTimeout(check,Math.min(delay,250));return}
    if('requestIdleCallback'in window)requestIdleCallback(()=>resolve(token===runToken&&!evidenceActive()&&document.visibilityState!=='hidden'),{timeout:700});
    else setTimeout(()=>resolve(token===runToken&&!evidenceActive()&&document.visibilityState!=='hidden'),60);
  };check();
})}
async function cacheThumb(row,token,signal){
  if(token!==runToken||!row?.thumbnail_path||signal.aborted)return;
  const ready=await idleTurn(token);if(!ready||signal.aborted)return;
  const {data,error}=await db().storage.from('btg-evidence').createSignedUrl(row.thumbnail_path,SIGNED_SECONDS);if(error||!data?.signedUrl||signal.aborted)return;
  const url=data.signedUrl,response=await fetch(url,{cache:'force-cache',credentials:'omit',priority:'low',signal});
  if(response.ok||response.type==='opaque'){primed.set(String(row.id),url);scheduleApply()}
}
async function prime(){
  resetForTrip();if(running||!homeReady()||constrained()||document.visibilityState==='hidden'||!tripKey)return;
  const q=db();if(!q)return;running=true;const token=++runToken;controller=new AbortController();
  try{
    const {data,error}=await q.from('media').select('id,thumbnail_path,created_at').eq('trip_id',tripKey).eq('album','evidence').order('created_at',{ascending:false}).limit(THUMB_LIMIT);if(error)throw error;
    const rows=(data||[]).filter(row=>row?.thumbnail_path);let cursor=0;
    const worker=async()=>{while(token===runToken&&!controller.signal.aborted){const row=rows[cursor++];if(!row)return;if(primed.has(String(row.id)))continue;try{await cacheThumb(row,token,controller.signal)}catch(error){if(error?.name!=='AbortError')console.debug?.('Evidence thumbnail prime skipped.',error)}}};
    await Promise.all(Array.from({length:Math.min(CONCURRENT,rows.length)},worker));
  }catch(error){if(error?.name!=='AbortError')console.debug?.('Evidence thumbnail prime unavailable.',error)}
  finally{if(token===runToken){running=false;controller=null}}
}
function applyPrimed(){clearTimeout(applyTimer);document.querySelectorAll('[data-panel="evidence"] [data-media-id]').forEach(node=>{const id=node.dataset?.mediaId||node.closest?.('[data-media-id]')?.dataset?.mediaId||'',url=primed.get(String(id));if(!url)return;const img=node instanceof HTMLImageElement?node:node.querySelector?.('img');if(img&&!img.getAttribute('src')){img.decoding='async';img.setAttribute('src',url)}})}
function scheduleApply(){clearTimeout(applyTimer);applyTimer=setTimeout(applyPrimed,12)}
function schedule(delay=START_DELAY){clearTimeout(timer);timer=setTimeout(()=>{if(homeReady()&&!constrained())void prime()},delay)}
function boot(){
  if(!window.supabase?.createClient){setTimeout(boot,60);return}resetForTrip();schedule();
  const mo=new MutationObserver(()=>{resetForTrip();scheduleApply();if(evidenceActive())cancel();else if(homeReady()&&!running&&primed.size<THUMB_LIMIT)schedule(500)});mo.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('pointerdown',event=>{markInput();if(event.target.closest?.('[data-tab="evidence"],[data-media-id]'))cancel()},{capture:true,passive:true});
  document.addEventListener('keydown',markInput,{capture:true,passive:true});window.addEventListener('scroll',markInput,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')cancel();else schedule(700)});
  window.addEventListener('pageshow',()=>schedule(900));
  window.addEventListener('gtg:media-uploaded',()=>{primed.clear();schedule(500)});
  window.GTGHomeThumbnailPrime={prime,cancel,peek:id=>primed.get(String(id))||'',apply:applyPrimed,stats:()=>({tripId:tripKey,primed:primed.size,running,limit:THUMB_LIMIT,concurrent:CONCURRENT,constrained:constrained()})};
}
boot();
})();
