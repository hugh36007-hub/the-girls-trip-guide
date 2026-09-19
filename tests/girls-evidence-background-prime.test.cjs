const fs=require('node:fs');
const assert=require('node:assert/strict');
const primer=fs.readFileSync('girls-home-thumbnail-prime.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const evidence=fs.readFileSync('girls-evidence-parity.js','utf8');

assert.match(primer,/BATCH_SIZE=9/,'background Evidence preparation must work in batches of nine');
assert.match(primer,/CONCURRENT=2/,'background preview preparation must stay low-concurrency');
assert.match(primer,/requestIdleCallback/,'background work must yield to foreground app work');
assert.match(primer,/priority:'low'/,'preview fetches must remain low priority');
assert.match(primer,/saveData/,'browser data-saving preference must be respected');
assert.match(primer,/visibilityState==='hidden'/,'hidden pages must stop background preparation');
assert.match(primer,/transform:\{width:480,height:480,resize:'cover',quality:64\}/,'missing stored thumbnails must use a lightweight transformed preview');
assert.match(primer,/offset\+=BATCH_SIZE/,'Evidence previews must advance batch-by-batch');
assert.equal((loader.match(/girls-home-thumbnail-prime\.js\?v=2/g)||[]).length,1,'quiet preview primer must have one runtime owner');
assert.match(loader,/appTheme:\[[\s\S]*girls-home-thumbnail-prime\.js\?v=2/,'preview preparation must start at app level, not wait for Evidence');
assert.match(evidence,/GTGHomeThumbnailPrime\?\.peek/,'Evidence grid must reuse already-prepared previews');
console.log('PASS Girls Evidence previews prepare quietly in batches of nine');
