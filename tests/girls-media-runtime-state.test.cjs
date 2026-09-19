const fs=require('node:fs');
const assert=require('node:assert/strict');
const core=fs.readFileSync('girls-app-v2.js','utf8');
const ux=fs.readFileSync('girls-media-ux-plus.js','utf8');
for(const [name,src] of [['core',core],['ux',ux]]){
  assert(src.includes('thumbnail_status:thumbnailStatus'),`${name} upload must send thumbnail_status`);
  assert(src.includes('thumbnail_attempts:1'),`${name} upload must record a preview attempt before insert`);
  assert(src.includes('thumbnail_error:thumbnailError'),`${name} upload must record preview failure state`);
}
const uxPreview=ux.indexOf('const blob=await makeThumb(prepared)');
const uxInsert=ux.indexOf(".from('media').insert");
assert(uxPreview>=0&&uxInsert>uxPreview,'enhanced Girls uploader must process preview before media insert');
const corePreview=core.indexOf('const thumb=await makeThumb(file)');
const coreInsert=core.indexOf(".from('media').insert",core.indexOf('async function doUpload'));
assert(corePreview>=0&&coreInsert>corePreview,'core Girls uploader must process preview before media insert');
console.log('Girls media runtime state: PASS');
