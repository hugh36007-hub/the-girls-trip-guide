/* Girls media performance-max layer: preconnect, small-first scheduling and lightweight gallery rendering. */
(() => {
'use strict';
const STORAGE_HOST='https://vtcmvwixfqyxqghibsla.storage.supabase.co';

function addLink(rel,href,crossOrigin=false){
  if(document.head.querySelector(`link[rel="${rel}"][href="${href}"]`))return;
  const link=document.createElement('link');link.rel=rel;link.href=href;if(crossOrigin)link.crossOrigin='anonymous';document.head.appendChild(link);
}
function prewarm(){
  addLink('dns-prefetch','//vtcmvwixfqyxqghibsla.storage.supabase.co');
  addLink('preconnect',STORAGE_HOST,true);
}
function installStyle(){
  if(document.getElementById('gtg-media-performance-max-style'))return;
  const style=document.createElement('style');style.id='gtg-media-performance-max-style';style.textContent=`
    [data-panel="evidence"] .gallery .media{content-visibility:auto;contain-intrinsic-size:320px 260px;contain:layout paint style}
    [data-panel="evidence"] .gallery img,[data-panel="evidence"] .gallery video{contain:layout paint}
  `;document.head.appendChild(style);
}
function reorderSmallFirst(input){
  const files=[...(input.files||[])];if(files.length<2||typeof DataTransfer==='undefined')return;
  const ranked=files.map((file,index)=>({file,index,video:String(file.type||'').startsWith('video/')})).sort((a,b)=>{
    if(a.video!==b.video)return a.video?1:-1;
    if(a.video)return a.index-b.index;
    return Number(a.file.size||0)-Number(b.file.size||0)||a.index-b.index;
  });
  if(ranked.every((x,i)=>x.file===files[i]))return;
  try{const dt=new DataTransfer();ranked.forEach(x=>dt.items.add(x.file));input.files=dt.files;}catch{}
}
function tuneGallery(root=document){
  const images=[...root.querySelectorAll?.('[data-panel="evidence"] .gallery img')||[]];
  images.forEach((img,index)=>{img.decoding='async';img.loading=index<12?'eager':'lazy';try{img.fetchPriority=index<6?'high':'auto'}catch{}});
  const videos=[...root.querySelectorAll?.('[data-panel="evidence"] .gallery video')||[]];videos.forEach(video=>{video.preload='none';});
}
function scheduleTune(){[0,80,350,1200].forEach(delay=>setTimeout(()=>tuneGallery(),delay));}
function syncEvidenceState(event){
  scheduleTune();
  if(event?.detail?.album!=='evidence')return;
  setTimeout(()=>window.dispatchEvent(new Event('popstate')),80);
}
function interruptedIntent(){
  try{
    const tripId=new URL(location.href).searchParams.get('trip_id');if(!tripId)return;
    const raw=localStorage.getItem(`gtg-upload-intent:${tripId}`);if(!raw)return;
    const intent=JSON.parse(raw),age=Date.now()-Number(intent?.at||0);if(age<0||age>24*60*60*1000){localStorage.removeItem(`gtg-upload-intent:${tripId}`);return;}
    if(sessionStorage.getItem(`gtg-upload-resume-notice:${tripId}`))return;
    sessionStorage.setItem(`gtg-upload-resume-notice:${tripId}`,'1');
    setTimeout(()=>{const toast=document.getElementById('toast');if(!toast)return;toast.textContent='An interrupted upload can resume — select the same file again.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4200);},700);
  }catch{}
}

prewarm();installStyle();
document.addEventListener('change',event=>{const input=event.target.closest?.('#uploadForm input[type="file"],#vaultUploadForm input[type="file"]');if(input)reorderSmallFirst(input);},true);
document.addEventListener('pointerover',event=>{if(event.target.closest?.('[data-a="upload"],[data-a="vault"],button[data-tab="evidence"],#uploadForm input[type="file"],#vaultUploadForm input[type="file"]'))prewarm();},{capture:true,passive:true});
document.addEventListener('click',event=>{if(event.target.closest?.('[data-tab="evidence"],[data-a="upload"],[data-delete-media]'))scheduleTune();},true);
window.addEventListener('gtg:media-uploaded',syncEvidenceState);
window.addEventListener('pageshow',scheduleTune);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleTune();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{scheduleTune();interruptedIntent();},{once:true});else{scheduleTune();interruptedIntent();}
})();


