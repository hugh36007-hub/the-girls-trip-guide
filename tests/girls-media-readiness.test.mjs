import fs from 'node:fs';
import assert from 'node:assert/strict';
const readiness=fs.readFileSync('girls-media-readiness.js','utf8');
const viewer=fs.readFileSync('girls-direct-photo-viewer.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
assert.match(readiness,/cache:6,concurrent:2,ahead:1,behind:1,margin:400,prime:0/,'fast connections must use a small bounded original cache');
assert.match(readiness,/cache:3,concurrent:1,ahead:0,behind:0,margin:120,prime:0/,'constrained connections must use a minimal cache');
assert.match(readiness,/document\.visibilityState==='hidden'/,'hidden pages must pause queued warming');
assert.match(readiness,/saveData/);assert.match(readiness,/isVideo\(r\)\|\|!r\.storage_path/);
assert.match(readiness,/warmAroundIndex/);assert.match(readiness,/pointerdown/);
assert.match(viewer,/class="track"/,'viewer must keep a persistent track');
assert.match(viewer,/const indexes=\[active\.index-1,active\.index,active\.index\+1\]/,'viewer must keep previous/current/next slots');
assert.match(viewer,/GTGMediaReadiness/,'viewer must reuse the readiness cache');
assert.match(viewer,/video\.preload=priority==='high'\?'metadata':'none'/,'video neighbours must remain lightweight');
const warmIndex=html.indexOf('/girls-media-readiness.js?v=2'),viewerIndex=html.indexOf('/girls-direct-photo-viewer.js?v=4');
assert(warmIndex>0&&viewerIndex>warmIndex);
console.log('PASS Girls bounded media readiness and persistent three-slide viewer');

