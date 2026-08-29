const fs=require('fs');
const src=fs.readFileSync('girls-media-ux-plus.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
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
  'gtg-optimistic'
];
for(const x of checks)if(!src.includes(x))throw new Error(`Missing Girls media UX contract: ${x}`);
if(!html.includes('/girls-media-ux-plus.js?v=1'))throw new Error('Girls media UX enhancer is not loaded by create-trip.html');
const persist=src.indexOf(".from('media').insert");
const defer=src.indexOf("if(!isVid)defer(async()=>");
if(persist<0||defer<0||persist>defer)throw new Error('Girls upload must be durable before deferred thumbnail work.');
console.log('Girls media UX+ contract OK');
