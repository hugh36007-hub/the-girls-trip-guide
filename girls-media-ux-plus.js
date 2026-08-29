/* Girls media UX+ — fast, durable, adaptive uploads for iPhone Safari and modern browsers. */
(() => {
'use strict';
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co',KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP',IMAGE_MAX=50*1024*1024,VIDEO_MAX=500*1024*1024,QUOTA=20*1024*1024*1024;
let client;
const db=()=>client||(client=window.supabase.createClient(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const safe=n=>String(n||'file').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-110)||'file';
const video=f=>String(f?.type||'').startsWith('video/'),image=f=>String(f?.type||'').startsWith('image/');
const human=n=>n<1048576?`${Math.round(n/1024)} KB`:`${(n/1048576).toFixed(n<10485760?1:0)} MB`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));

function concurrency(){const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;if(c?.saveData||['slow-2g','2g'].includes(c?.effectiveType))return 1;if(c?.effectiveType==='3g')return 2;const mem=Number(navigator.deviceMemory||4),cores=Number(navigator.hardwareConcurrency||4);return mem<=2||cores<=2?1:mem<=4||cores<=4?2:3}
function tripId(){return new URL(location.href).searchParams.get('trip_id')||''}
function modalRoot(){return document.getElementById('modalRoot')}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function style(){if(document.getElementById('gtg-media-ux-plus-style'))return;const s=document.createElement('style');s.id='gtg-media-ux-plus-style';s.textContent=`.gtg-media-ux{display:grid;gap:12px}.gtg-media-ux-list{display:grid;gap:8px;max-height:min(46vh,430px);overflow:auto}.gtg-media-ux-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08)}.gtg-media-ux-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gtg-media-ux-row b{font-size:11px;color:var(--muted)}.gtg-media-ux-row b.ok{color:#8bd3a7}.gtg-media-ux-row b.fail{color:#ff8b99}.gtg-media-ux-note{font-size:11px;color:var(--muted);line-height:1.45}.gtg-optimistic{position:relative}.gtg-optimistic:after{content:'Saved';position:absolute;left:8px;top:8px;padding:4px 7px;border-radius:999px;background:rgba(12,8,11,.82);color:#fff;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}`;document.head.appendChild(s)}

async function compressPhoto(file){
  if(!image(file)||file.size<1600000||typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'||typeof createImageBitmap==='undefined')return file;
  const workerCode=`self.onmessage=async e=>{const f=e.data;try{const b=await createImageBitmap(f,{imageOrientation:'from-image'});const max=3000,scale=Math.min(1,max/Math.max(b.width,b.height));if(scale>=.98){self.postMessage({same:true});return}const w=Math.max(1,Math.round(b.width*scale)),h=Math.max(1,Math.round(b.height*scale)),c=new OffscreenCanvas(w,h),x=c.getContext('2d',{alpha:false});x.drawImage(b,0,0,w,h);b.close?.();const blob=await c.convertToBlob({type:'image/webp',quality:.82});self.postMessage({blob})}catch{self.postMessage({same:true})}}`;
  const url=URL.createObjectURL(new Blob([workerCode],{type:'text/javascript'}));
  try{return await new Promise(resolve=>{const w=new Worker(url),timer=setTimeout(()=>{w.terminate();resolve(file)},5000);w.onmessage=e=>{clearTimeout(timer);w.terminate();const blob=e.data?.blob;resolve(blob&&blob.size<file.size?new File([blob],`${file.name.replace(/\.[^.]+$/,'')}.webp`,{type:'image/webp',lastModified:file.lastModified}):file)};w.onerror=()=>{clearTimeout(timer);w.terminate();resolve(file)};w.postMessage(file)})}finally{URL.revokeObjectURL(url)}
}

async function storageUpload(bucket,path,file,onProgress=()=>{}){
  onProgress(0,0,file.size);
  if(file.size<=6*1024*1024){const {error}=await db().storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type||undefined,cacheControl:'3600'});if(error)throw error;onProgress(1,file.size,file.size);return path}
  if(!window.tus?.Upload)throw Error('The resumable upload service did not load. Refresh and try again.');
  const {data:{session}}=await db().auth.getSession();if(!session?.access_token)throw Error('Your secure session expired. Sign in again.');
  const prefix=`${tripId()}/${session.user.id}/`;let finalPath=path;
  await new Promise((resolve,reject)=>{const up=new window.tus.Upload(file,{endpoint:`https://vtcmvwixfqyxqghibsla.storage.supabase.co/storage/v1/upload/resumable`,retryDelays:[0,1000,3000,5000,10000,20000],headers:{authorization:`Bearer ${session.access_token}`,apikey:KEY,'x-upsert':'false'},metadata:{bucketName:bucket,objectName:path,contentType:file.type||'application/octet-stream',cacheControl:'3600'},uploadDataDuringCreation:true,chunkSize:6*1024*1024,removeFingerprintOnSuccess:true,uploadSize:file.size,onProgress:(sent,total)=>onProgress(total?sent/total:0,sent,total),onError:reject,onSuccess:()=>{onProgress(1,file.size,file.size);resolve()}});up.findPreviousUploads().then(prev=>{const old=(prev||[]).find(x=>x?.metadata?.bucketName===bucket&&String(x?.metadata?.objectName||'').startsWith(prefix));if(old){finalPath=old.metadata.objectName;up.options.metadata={...up.options.metadata,objectName:finalPath};up.resumeFromPreviousUpload(old)}up.start()}).catch(()=>up.start())});return finalPath
}

function waitFor(target,event,ms){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{cleanup();reject(Error('Preview decode timed out.'))},ms);
    const ok=()=>{cleanup();resolve()};
    const bad=()=>{cleanup();reject(Error('Preview could not be decoded.'))};
    const cleanup=()=>{clearTimeout(timer);target.removeEventListener(event,ok);target.removeEventListener('error',bad)};
    target.addEventListener(event,ok,{once:true});target.addEventListener('error',bad,{once:true});
  });
}
async function makeThumb(file){
  const isVid=video(file),isImg=image(file);if(!isVid&&!isImg)return null;
  const url=URL.createObjectURL(file);
  try{
    const source=isVid?document.createElement('video'):new Image();
    if(isVid){source.muted=true;source.playsInline=true;source.preload='auto'}else source.decoding='async';
    const ready=waitFor(source,isVid?'loadeddata':'load',isVid?2600:2200);
    source.src=url;if(isVid)source.load();await ready;
    if(isVid&&Number.isFinite(source.duration)&&source.duration>.2){
      const seek=waitFor(source,'seeked',1200).catch(()=>null);
      try{source.currentTime=Math.min(.35,source.duration/4)}catch{}
      await seek;
    }
    const width=source.videoWidth||source.naturalWidth||source.width,height=source.videoHeight||source.naturalHeight||source.height;if(!width||!height)return null;
    const max=360,scale=Math.min(1,max/Math.max(width,height)),canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
    canvas.getContext('2d',{alpha:false}).drawImage(source,0,0,canvas.width,canvas.height);
    return await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.62));
  }catch{return null}finally{URL.revokeObjectURL(url)}
}
function defer(fn){(window.requestIdleCallback?window.requestIdleCallback:cb=>setTimeout(cb,50))(()=>Promise.resolve().then(fn).catch(e=>console.warn('Deferred preview skipped.',e)),{timeout:2500})}

function optimistic(row,file,album){if(album!=='evidence')return;const gallery=document.querySelector('[data-panel="evidence"] .gallery');if(!gallery)return;gallery.querySelector('.empty')?.remove();const box=document.createElement('div');box.className='media gtg-optimistic';box.dataset.optimisticMedia=row.id;if(video(file)){box.innerHTML='<div style="aspect-ratio:4/3;display:grid;place-items:center;background:#151116;color:var(--muted);font-weight:800">VIDEO · SAVED</div>'}else{const url=URL.createObjectURL(file);box.innerHTML=`<img src="${url}" alt="${esc(file.name)}" loading="eager" decoding="async">`;setTimeout(()=>URL.revokeObjectURL(url),300000)}gallery.prepend(box);const stat=document.querySelector('.stat[data-tab="evidence"] b');if(stat){const n=Number(stat.textContent)||0;stat.textContent=String(n+1)}}

async function persist(file,album,onProgress){
  const isVid=video(file),limit=isVid?VIDEO_MAX:IMAGE_MAX;if(file.size>limit)throw Error(isVid?`${file.name} is over 500 MB.`:`${file.name} is over 50 MB.`);
  const prepared=isVid?file:await compressPhoto(file),bucket=album==='vault'?'btg-vault':'btg-evidence';const {data:{session}}=await db().auth.getSession();if(!session?.user)throw Error('Your secure session expired. Sign in again.');const path=await storageUpload(bucket,`${tripId()}/${session.user.id}/${uid()}-${safe(prepared.name||file.name)}`,prepared,onProgress);
  let row;try{const {data,error}=await db().from('media').insert({trip_id:tripId(),album,storage_path:path,thumbnail_path:null,file_name:file.name,mime_type:file.type,size_bytes:prepared.size,created_by:session.user.id}).select('*').single();if(error)throw error;row=data}catch(e){await db().storage.from(bucket).remove([path]).catch(()=>{});throw e}
  optimistic(row,file,album);
  if(album==='evidence'||!isVid)defer(async()=>{
    const blob=await makeThumb(prepared);if(!blob)return;
    const p=`${tripId()}/${session.user.id}/thumb-${uid()}.webp`;
    try{
      await storageUpload(bucket,p,new File([blob],'thumbnail.webp',{type:'image/webp'}));
      const {error}=await db().from('media').update({thumbnail_path:p}).eq('id',row.id).eq('trip_id',tripId());if(error)throw error;
      window.dispatchEvent(new CustomEvent('gtg:thumbnail-ready',{detail:{mediaId:row.id,album}}));
    }catch(error){console.warn('Deferred preview skipped.',error);await db().storage.from(bucket).remove([p]).catch(()=>{})}
  });
  return row
}
async function pool(items,limit,work){let i=0;async function next(){while(i<items.length){const n=i++;await work(items[n])}}await Promise.all(Array.from({length:Math.min(limit,items.length)},next))}
function rowStatus(i,text,klass=''){const b=document.querySelector(`[data-gtg-upload-row="${i}"] b`);if(b){b.textContent=text;b.className=klass}}

async function quotaRemaining(){const {data,error}=await db().rpc('trip_storage_usage',{target_trip_id:tripId()});if(error)return QUOTA;const row=Array.isArray(data)?data[0]:data;return Number(row?.remaining_bytes||QUOTA)}
async function run(files,album){
  const queue=files.slice(0,25);if(!queue.length)return;const remaining=await quotaRemaining(),total=queue.reduce((n,f)=>n+f.size,0);if(total>remaining)throw Error('This trip does not have enough storage left for this selection.');
  try{localStorage.setItem(`gtg-upload-intent:${tripId()}`,JSON.stringify({album,files:queue.map(f=>({name:f.name,size:f.size,type:f.type,lastModified:f.lastModified})),at:Date.now()}))}catch{}
  const root=modalRoot();root.innerHTML=`<div class="modal gtg-media-ux"><h2>Saving your evidence</h2><p data-gtg-upload-summary>0 of ${queue.length} saved</p><div class="progress"><i data-gtg-upload-bar style="width:0%"></i></div><div class="gtg-media-ux-list">${queue.map((f,i)=>`<div class="gtg-media-ux-row" data-gtg-upload-row="${i}"><span>${esc(f.name)}</span><b>Queued</b></div>`).join('')}</div><p class="gtg-media-ux-note">Once an item says Saved, it is safely in the trip. Large files resume from the last completed chunk if the same file is selected again.</p></div>`;root.classList.add('open');
  let saved=0,failed=0;const update=()=>{const s=document.querySelector('[data-gtg-upload-summary]'),bar=document.querySelector('[data-gtg-upload-bar]');if(s)s.textContent=`${saved} of ${queue.length} saved${failed?` · ${failed} failed`:''}`;if(bar)bar.style.width=`${Math.round(((saved+failed)/queue.length)*100)}%`};const indexed=queue.map((file,index)=>({file,index})),photos=indexed.filter(x=>!video(x.file)),videos=indexed.filter(x=>video(x.file));
  const work=async x=>{rowStatus(x.index,image(x.file)&&x.file.size>1600000?'Optimising…':'Starting…');try{await persist(x.file,album,(r,s,t)=>rowStatus(x.index,r>=1?'Saving…':`Uploading ${Math.round(r*100)}% · ${human(s)}/${human(t)}`));saved++;rowStatus(x.index,'Saved','ok')}catch(e){failed++;rowStatus(x.index,'Failed','fail');console.error(e)}update()};
  await pool(photos,concurrency(),work);await pool(videos,1,work);try{localStorage.removeItem(`gtg-upload-intent:${tripId()}`)}catch{};await wait(500);root.classList.remove('open');root.innerHTML='';
  window.dispatchEvent(new CustomEvent('gtg:media-uploaded',{detail:{album,saved,failed}}));
  const toast=document.getElementById('toast');if(toast){toast.textContent=failed?`${saved} uploaded · ${failed} failed. Re-select failed files to resume.`:`${saved} uploaded.`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4200)}
  if(album==='vault')setTimeout(()=>document.querySelector('[data-a="vault"]')?.click(),80)
}

style();
document.addEventListener('submit',event=>{const form=event.target;if(!(form instanceof HTMLFormElement)||!['uploadForm','vaultUploadForm'].includes(form.id))return;const files=[...(form.elements.files?.files||[])];if(!files.length)return;event.preventDefault();event.stopImmediatePropagation();run(files,form.id==='vaultUploadForm'?'vault':'evidence').catch(e=>{console.error(e);const root=modalRoot();root?.classList.remove('open');if(root)root.innerHTML='';const t=document.getElementById('toast');if(t){t.textContent=e?.message||'Upload failed.';t.classList.add('show')}})},true);
})();
