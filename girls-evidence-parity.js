/* Girls Evidence parity: unseen badges plus one resilient preview owner for the visible gallery. */
(() => {
'use strict';
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client;
const rowCache=new Map();
const hydrating=new Set();
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const seenKey=()=>`gtg-evidence-seen-count:${tripId()}`;
const isVideo=row=>String(row?.mime_type||'').startsWith('video/');

function evidenceTotal(){const n=document.querySelector('.stat[data-tab="evidence"] b');return Math.max(0,Number(n?.textContent)||0)}
function evidenceButton(){return document.querySelector('nav.dock button[data-tab="evidence"]')}
function evidenceOpen(){return Boolean(document.querySelector('[data-panel="evidence"].active')||evidenceButton()?.classList.contains('active'))}
function seenCount(){try{const raw=localStorage.getItem(seenKey());return raw===null?null:Math.max(0,Number(raw)||0)}catch{return null}}
function saveSeen(value){try{localStorage.setItem(seenKey(),String(Math.max(0,Number(value)||0)))}catch{}}
function setBadge(count){const button=evidenceButton();if(!button)return;const n=Math.max(0,Number(count)||0);if(n)button.dataset.unseenEvidence=String(Math.min(99,n));else delete button.dataset.unseenEvidence}
function syncBadge(){const total=evidenceTotal();if(!tripId()||!document.querySelector('.stat[data-tab="evidence"]'))return;if(evidenceOpen()){saveSeen(total);setBadge(0);return}const seen=seenCount();if(seen===null){saveSeen(total);setBadge(0);return}setBadge(Math.max(0,total-seen))}
function markSeen(){saveSeen(evidenceTotal());setBadge(0)}

const style=document.createElement('style');style.id='gtg-evidence-parity-style';style.textContent=`
.dock.gtg-option7 button[data-tab="evidence"][data-unseen-evidence]::before{content:attr(data-unseen-evidence);position:absolute;top:-3px;right:4px;z-index:4;min-width:20px;height:20px;padding:0 5px;border-radius:999px;display:grid;place-items:center;background:var(--pink2,#ff83c1);color:#160a10;font:900 10px/1 Inter,sans-serif;box-shadow:0 5px 14px rgba(0,0,0,.35)}
.dock.gtg-option7.is-compact button[data-tab="evidence"][data-unseen-evidence]::before{top:-5px;right:0}
[data-panel="evidence"] .gtg-video-preview{position:relative;width:100%;min-height:220px;border:0;padding:0;overflow:hidden;background:#151116;color:#fff;cursor:pointer;display:grid;place-items:center;font:800 12px/1.2 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase}
[data-panel="evidence"] .gtg-video-preview img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
[data-panel="evidence"] .gtg-video-preview span{position:relative;z-index:2;padding:9px 12px;border-radius:999px;background:rgba(12,8,11,.78);box-shadow:0 6px 18px rgba(0,0,0,.28)}
[data-panel="evidence"] video[data-gtg-video-full="1"]{width:100%;height:auto;max-height:78vh;background:#090709}
`;
if(!document.getElementById(style.id))document.head.appendChild(style);

async function rowsFor(ids){
  const tid=tripId(),missing=ids.filter(id=>id&&!rowCache.has(id));if(!tid||!missing.length)return;
  for(let offset=0;offset<missing.length;offset+=40){
    const batch=missing.slice(offset,offset+40);
    const {data,error}=await db().from('media').select('id,trip_id,album,storage_path,thumbnail_path,mime_type,file_name').eq('trip_id',tid).eq('album','evidence').in('id',batch);
    if(error)throw error;(data||[]).forEach(row=>rowCache.set(row.id,row));
  }
}
async function signed(row,kind='preview'){
  const bucket=row.album==='vault'?'btg-vault':'btg-evidence';
  const path=kind==='thumbnail'?row.thumbnail_path:row.storage_path;if(!path)return'';
  const options=kind==='preview'&&!isVideo(row)?{transform:{width:720,height:720,resize:'contain',quality:72}}:undefined;
  const {data,error}=await db().storage.from(bucket).createSignedUrl(path,1800,options);if(error)throw error;return data?.signedUrl||'';
}
async function fallbackPhoto(img,row,token){
  if(!img.isConnected||img.dataset.gtgPreviewToken!==token||img.dataset.fullFallback==='1')return;
  img.dataset.fullFallback='1';
  try{const url=await signed(row,'original');if(url&&img.isConnected&&img.dataset.gtgPreviewToken===token)img.src=url;}
  catch(error){console.warn('Evidence original fallback unavailable.',error);}
}
async function hydratePhoto(row,img){
  const token=`${row.id}:${row.thumbnail_path||row.storage_path||''}`;
  if(img.dataset.gtgPreviewToken===token&&img.dataset.gtgPreviewReady==='1'&&img.complete&&Number(img.naturalWidth)>0)return;
  img.dataset.gtgPreviewToken=token;img.dataset.gtgPreviewReady='0';img.dataset.fullFallback='0';img.loading='lazy';img.decoding='async';
  img.addEventListener('load',()=>{if(img.dataset.gtgPreviewToken===token)img.dataset.gtgPreviewReady='1'},{once:true});
  img.addEventListener('error',()=>void fallbackPhoto(img,row,token),{once:true});
  try{
    const url=row.thumbnail_path?await signed(row,'thumbnail'):await signed(row,'preview');
    if(!url)throw Error('No preview URL');
    if(img.isConnected&&img.dataset.gtgPreviewToken===token)img.src=url;
  }catch{await fallbackPhoto(img,row,token)}
}
async function decorateVideoButton(button,row){
  const token=`${row.id}:${row.thumbnail_path||''}`;if(button.dataset.gtgPreviewToken===token)return;
  button.dataset.gtgPreviewToken=token;button.replaceChildren();
  const badge=document.createElement('span');badge.textContent='▶ Video';
  if(row.thumbnail_path){
    try{const url=await signed(row,'thumbnail');if(url&&button.isConnected&&button.dataset.gtgPreviewToken===token){const img=document.createElement('img');img.alt='Trip video preview';img.loading='lazy';img.decoding='async';img.src=url;button.append(img)}}catch{}
  }
  button.append(badge);
}
async function hydrateVideo(row,node){
  if(node?.dataset?.gtgVideoFull==='1')return;
  const tile=node?.closest?.('.media');if(!tile)return;
  let button=tile.querySelector('button[data-gtg-video-preview="1"]');
  if(!button){
    button=document.createElement('button');button.type='button';button.className='gtg-video-preview';button.dataset.gtgVideoPreview='1';button.dataset.mediaId=row.id;button.setAttribute('aria-label',`Play ${row.file_name||'trip video'}`);
    if(node?.isConnected)node.replaceWith(button);else tile.prepend(button);
  }
  await decorateVideoButton(button,row);
}
async function hydrateEvidence(){
  if(!evidenceOpen()||!db())return;
  const panel=document.querySelector('[data-panel="evidence"]');if(!panel)return;
  const nodes=[...panel.querySelectorAll('[data-media-id]')];const ids=[...new Set(nodes.map(node=>node.dataset.mediaId).filter(Boolean))];if(!ids.length)return;
  try{await rowsFor(ids)}catch(error){console.warn('Evidence rows unavailable.',error);return;}
  for(let offset=0;offset<ids.length;offset+=6){
    await Promise.all(ids.slice(offset,offset+6).map(async id=>{
      if(hydrating.has(id))return;const row=rowCache.get(id);if(!row)return;hydrating.add(id);
      try{
        const node=panel.querySelector(`[data-media-id="${id}"]`);if(!node)return;
        if(isVideo(row))await hydrateVideo(row,node);
        else if(node instanceof HTMLImageElement)await hydratePhoto(row,node);
      }finally{hydrating.delete(id)}
    }));
  }
}
async function playVideo(button){
  const id=button.dataset.mediaId;if(!id)return;
  try{
    await rowsFor([id]);const row=rowCache.get(id);if(!row)return;
    const url=await signed(row,'original');if(!url)throw Error('Video URL unavailable');
    const video=document.createElement('video');video.controls=true;video.autoplay=true;video.playsInline=true;video.preload='metadata';video.dataset.gtgVideoFull='1';video.src=url;button.replaceWith(video);video.play?.().catch(()=>{});
  }catch(error){console.warn('Evidence video unavailable.',error)}
}
function scheduleHydration(){
  [0,80,350,1200,3000].forEach(delay=>setTimeout(()=>{syncBadge();void hydrateEvidence()},delay));
}

document.addEventListener('click',event=>{
  const videoButton=event.target.closest?.('button[data-gtg-video-preview="1"]');if(videoButton){event.preventDefault();void playVideo(videoButton);return;}
  if(event.target.closest?.('[data-tab="evidence"]')){markSeen();scheduleHydration();return;}
  if(event.target.closest?.('[data-a="upload"],[data-delete-media],[data-a="filterEvidence"]'))scheduleHydration();
},true);
document.addEventListener('submit',event=>{if(event.target?.id==='uploadForm')scheduleHydration()},true);
window.addEventListener('gtg:media-uploaded',event=>{if(event.detail?.album==='evidence'){rowCache.clear();scheduleHydration()}});
window.addEventListener('gtg:thumbnail-ready',event=>{if(event.detail?.album==='evidence'){rowCache.delete(event.detail.mediaId);scheduleHydration()}});
window.addEventListener('pageshow',()=>{rowCache.clear();scheduleHydration()});
window.addEventListener('focus',scheduleHydration);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleHydration()});
setTimeout(scheduleHydration,120);
})();
