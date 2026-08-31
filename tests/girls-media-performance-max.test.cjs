const fs=require('fs');
const perf=fs.readFileSync('girls-media-performance-max.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const perfPos=loader.indexOf('/girls-media-performance-max.js?v=2'),uxPos=loader.indexOf('/girls-media-ux-plus.js?v=2');
const checks=[
  ['direct storage preconnect',perf.includes('vtcmvwixfqyxqghibsla.storage.supabase.co')&&perf.includes("addLink('preconnect'")],
  ['small-first photos',perf.includes('Number(a.file.size||0)-Number(b.file.size||0)')],
  ['videos preserved after photos',perf.includes('if(a.video!==b.video)return a.video?1:-1')],
  ['gallery containment',perf.includes('content-visibility:auto')&&perf.includes('contain-intrinsic-size')],
  ['bounded thumbnail priority',perf.includes("img.loading=index<12?'eager':'lazy'")&&perf.includes("img.fetchPriority=index<6?'high':'auto'")],
  ['gallery videos do not preload metadata',perf.includes("video.preload='none'")&&!perf.includes("video.preload='metadata'")],
  ['bounded explicit tuning',perf.includes('function scheduleTune()')&&!perf.includes('MutationObserver')],
  ['durable Evidence upload refreshes app state',perf.includes('function syncEvidenceState(event)')&&perf.includes("event?.detail?.album!=='evidence'")&&perf.includes("window.dispatchEvent(new Event('popstate'))")],
  ['resume notice',perf.includes('gtg-upload-intent:')&&perf.includes('select the same file again')],
  ['media layers excluded from Home startup',!html.includes('/girls-media-performance-max.js?v=2')&&!html.includes('/girls-media-ux-plus.js?v=2')],
  ['performance layer loads before UX+ on Evidence route',perfPos>=0&&uxPos>perfPos&&loader.includes("if(route==='evidence')await loadBundle('evidence')")]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}if(failed)process.exit(1);
