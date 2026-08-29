const fs=require('fs');
const script=fs.readFileSync('girls-evidence-parity.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const checks=[
 ['parity layer loaded',html.includes('/girls-evidence-parity.js?v=1')],
 ['unseen count persisted per trip',script.includes('gtg-evidence-seen-count:')&&script.includes('localStorage.setItem')],
 ['Evidence open clears badge',script.includes('if(evidenceOpen()){saveSeen(total);setBadge(0);return}')],
 ['badge only uses unseen delta',script.includes('setBadge(Math.max(0,total-seen))')],
 ['first migration baseline does not mark old media new',script.includes('if(seen===null){saveSeen(total);setBadge(0);return}')],
 ['dock badge is attribute based',script.includes('data-unseen-evidence')&&script.includes('attr(data-unseen-evidence)')],
 ['broken thumbnail falls back to original',script.includes("select('storage_path,album')")&&script.includes('createSignedUrl(data.storage_path,1200)')],
 ['fallback is one shot',script.includes("img.dataset.fullFallback==='1'")&&script.includes("img.dataset.fullFallback='1'")]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);
console.log('Girls Evidence parity contract OK');
