const fs=require('fs');
const script=fs.readFileSync('girls-evidence-parity.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const checks=[
 ['parity layer loaded',html.includes('/girls-evidence-parity.js?v=2')],
 ['unseen count persisted per trip',script.includes('gtg-evidence-seen-count:')&&script.includes('localStorage.setItem')],
 ['Evidence open clears badge',script.includes('if(evidenceOpen()){saveSeen(total);setBadge(0);return}')],
 ['badge only uses unseen delta',script.includes('setBadge(Math.max(0,total-seen))')],
 ['first migration baseline does not mark old media new',script.includes('if(seen===null){saveSeen(total);setBadge(0);return}')],
 ['dock badge is attribute based',script.includes('data-unseen-evidence')&&script.includes('attr(data-unseen-evidence)')],
 ['thumbnail preferred',script.includes("row.thumbnail_path?await signed(row,'thumbnail'):await signed(row,'preview')")],
 ['missing thumbnail uses resized preview',script.includes("transform:{width:720,height:720,resize:'contain',quality:72}")],
 ['broken preview falls back to original',script.includes("signed(row,'original')")&&script.includes("img.dataset.fullFallback==='1'")],
 ['video tiles are lightweight',script.includes('gtg-video-preview')&&script.includes("video.preload='metadata'")&&script.includes("button.replaceWith(video)")],
 ['video originals wait for explicit play',script.indexOf("signed(row,'original')")>-1&&script.includes('async function playVideo(button)')],
 ['bounded hydration replaces DOM observer',script.includes('function scheduleHydration()')&&!script.includes('MutationObserver')],
 ['upload and thumbnail events rehydrate',script.includes("gtg:media-uploaded")&&script.includes("gtg:thumbnail-ready")]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);
console.log('Girls Evidence parity contract OK');
