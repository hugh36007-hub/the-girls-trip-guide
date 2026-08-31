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
  'requestIdleCallback',
  'gtg-upload-intent:',
  'gtg-optimistic',
  "waitFor(source,isVid?'loadeddata':'load',isVid?2600:2200)",
  "waitFor(source,'seeked',1200)",
  "if(album==='evidence'||!isVid)defer(async()=>",
  "new CustomEvent('gtg:thumbnail-ready'",
  "new CustomEvent('gtg:media-uploaded'"
];
for(const x of checks)if(!src.includes(x))throw new Error(`Missing Girls media UX contract: ${x}`);
if(html.includes('/girls-media-ux-plus.js?v=2'))throw new Error('Girls media UX enhancer must not execute on Home startup');
if(!loader.includes('/girls-media-ux-plus.js?v=2')||!loader.includes("if(route==='evidence')await loadBundle('evidence')"))throw new Error('Girls media UX enhancer v2 must load with the Evidence route');
const persist=src.indexOf(".from('media').insert");
const defer=src.indexOf("if(album==='evidence'||!isVid)defer(async()=>");
if(persist<0||defer<0||persist>defer)throw new Error('Girls upload must be durable before deferred thumbnail work.');
if(!src.includes("const isVid=video(file),isImg=image(file);if(!isVid&&!isImg)return null"))throw new Error('Girls thumbnail worker must support both photos and Evidence videos.');
console.log('Girls media UX+ contract OK');
