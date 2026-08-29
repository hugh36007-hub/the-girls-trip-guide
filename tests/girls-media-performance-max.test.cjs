const fs=require('fs');
const perf=fs.readFileSync('girls-media-performance-max.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const checks=[
  ['direct storage preconnect',perf.includes('vtcmvwixfqyxqghibsla.storage.supabase.co')&&perf.includes("addLink('preconnect'")],
  ['small-first photos',perf.includes('Number(a.file.size||0)-Number(b.file.size||0)')],
  ['videos preserved after photos',perf.includes('if(a.video!==b.video)return a.video?1:-1')],
  ['gallery containment',perf.includes('content-visibility:auto')&&perf.includes('contain-intrinsic-size')],
  ['lazy offscreen images',perf.includes("img.loading='lazy'")&&perf.includes("img.fetchPriority='low'")],
  ['video metadata only',perf.includes("video.preload='metadata'")],
  ['resume notice',perf.includes('gtg-upload-intent:')&&perf.includes('select the same file again')],
  ['performance layer loads before UX+',html.indexOf('girls-media-performance-max.js')>-1&&html.indexOf('girls-media-performance-max.js')<html.indexOf('girls-media-ux-plus.js')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}if(failed)process.exit(1);
