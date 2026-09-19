const fs=require('fs');
const src=fs.readFileSync('girls-media-ux-plus.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const checks=[
  'storage.supabase.co/storage/v1/upload/resumable',
  'chunkSize:6*1024*1024',
  'retryDelays:[0,1000,3000,5000,10000,20000]',
  'OffscreenCanvas',
  'createImageBitmap',
  'await pool(photos,concurrency(),work)',
  'await pool(videos,1,work)',
  ".from('media').insert",
  'gtg-upload-intent:',
  'gtg-optimistic',
  "waitFor(source,isVid?'loadeddata':'load',isVid?2600:2200)",
  "waitFor(source,'seeked',1200)",
  "new CustomEvent('gtg:thumbnail-ready'",
  "new CustomEvent('gtg:media-uploaded'"
];
for(const x of checks)if(!src.includes(x))throw new Error(`Missing Girls media UX contract: ${x}`);
if(html.includes('/girls-media-ux-plus.js?v=4'))throw new Error('Girls media UX enhancer must not execute on Home startup');
if(!loader.includes('/girls-media-ux-plus.js?v=4')||!loader.includes("if(mode==='full')await loadBundle('evidenceFull')"))throw new Error('Girls media UX enhancer v4 must load only with the Full Evidence route');
const preview=src.indexOf('const blob=await makeThumb(prepared)');
const persist=src.indexOf(".from('media').insert");
if(preview<0||persist<0||preview>persist)throw new Error('Girls preview processing must run before the media insert.');
for(const marker of ["thumbnail_status:thumbnailStatus","thumbnail_attempts:1","thumbnail_error:thumbnailError"])if(!src.includes(marker))throw new Error(`Missing Girls processed-media marker: ${marker}`);
if(!src.includes("const isVid=video(file),isImg=image(file);if(!isVid&&!isImg)return null"))throw new Error('Girls thumbnail worker must support both photos and videos.');
console.log('Girls media UX+ contract OK');
