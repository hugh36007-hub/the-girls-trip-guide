/* Video thumbnail correction: video elements must use the video file as src and the generated thumbnail as poster. */
(()=>{
'use strict';
if(window.__GTG_VIDEO_THUMBNAIL_FIX__)return;window.__GTG_VIDEO_THUMBNAIL_FIX__=true;
const URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,timer=0,busy=false;
function db(){if(client)return client;if(!window.supabase?.createClient)return null;client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
async function sign(bucket,path){if(!path)return'';const q=db();if(!q)return'';const {data,error}=await q.storage.from(bucket).createSignedUrl(path,1800);if(error)throw error;return data?.signedUrl||''}
function forceFrame(video){if(video.poster)return;video.preload='auto';try{video.load()}catch{};const seek=()=>{try{if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Math.min(.12,Math.max(.01,video.duration/20))}catch{}};if(video.readyState>=1)seek();else video.addEventListener('loadedmetadata',seek,{once:true});[400,900,1500,2200].forEach(ms=>setTimeout(()=>{if(!video.isConnected||video.poster)return;video.preload='auto';if(video.readyState===0)try{video.load()}catch{}},ms))}
async function scan(){
 if(busy)return;const videos=[...document.querySelectorAll('[data-panel="evidence"] video[data-media-id], .gallery video[data-media-id]')].filter(v=>v.dataset.videoThumbFixed!=='1');if(!videos.length)return;
 const q=db();if(!q)return;busy=true;
 try{
  const ids=[...new Set(videos.map(v=>v.dataset.mediaId).filter(Boolean))];
  const {data,error}=await q.from('media').select('id,album,storage_path,thumbnail_path,mime_type').in('id',ids);if(error)throw error;
  const rows=new Map((data||[]).map(r=>[String(r.id),r]));
  await Promise.all(videos.map(async video=>{
   const row=rows.get(String(video.dataset.mediaId));if(!row||!String(row.mime_type||'').startsWith('video/'))return;
   const bucket=row.album==='vault'?'btg-vault':'btg-evidence';
   try{
    const [src,poster]=await Promise.all([sign(bucket,row.storage_path),row.thumbnail_path?sign(bucket,row.thumbnail_path).catch(()=>''):Promise.resolve('')]);
    if(!video.isConnected||!src)return;
    video.src=src;video.playsInline=true;video.setAttribute('playsinline','');
    if(poster)video.poster=poster;
    video.dataset.videoThumbFixed='1';
    if(!poster)forceFrame(video);
   }catch(err){console.warn('Video thumbnail correction skipped.',err)}
  }));
 }catch(error){console.warn('Video thumbnail lookup failed.',error)}finally{busy=false}
}
function schedule(delay=40){clearTimeout(timer);timer=setTimeout(()=>void scan(),delay)}
new MutationObserver(()=>schedule()).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest?.('[data-tab="evidence"],[data-a="filterEvidence"]'))schedule(80)},true);window.addEventListener('gtg:media-uploaded',()=>schedule(120));window.addEventListener('pageshow',()=>schedule(0));schedule(0);setTimeout(()=>schedule(0),900);
})();
