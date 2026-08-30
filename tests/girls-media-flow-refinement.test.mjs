import fs from 'node:fs';
import assert from 'node:assert/strict';
const flow=fs.readFileSync('girls-media-flow-refinement.js','utf8');
const viewer=fs.readFileSync('girls-direct-photo-viewer.js','utf8');
const social=fs.readFileSync('girls-media-social.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const grid=fs.readFileSync('girls-mobile-evidence-grid.js','utf8');
assert(flow.includes("image.loading=index<12?'eager':'lazy'"),'first 12 thumbnails must paint eagerly');
assert(flow.includes("image.fetchPriority=index<6?'high':'auto'"),'first six thumbnails must have high priority');
for(const obsolete of ['bridge(src)','handoff(g)','gtg-flow-adjacent',"addEventListener('touchstart'","addEventListener('submit'"])assert(!flow.includes(obsolete),`flow layer must not own ${obsolete}`);
for(const token of ['width:300vw','class="track"','class="slide current"','async function move(dir)','gtg:viewer-media-change',"addEventListener('touchstart'","addEventListener('touchmove'"])assert(viewer.includes(token),`missing persistent viewer contract: ${token}`);
assert(!social.includes('navigate(dx<0?1:-1)'),'social layer must not recreate the viewer to navigate');
assert(!social.includes("stage.addEventListener('touchstart'"),'social layer must not compete for gestures');
assert(!grid.includes('gtg-grid-media-icon'),'redundant lower-right view icon must remain removed');
const socialIndex=html.indexOf('/girls-media-social.js?v=1'),flowIndex=html.indexOf('/girls-media-flow-refinement.js?v=1');
assert(socialIndex>0&&flowIndex>socialIndex,'priority refinement must load after media social');
console.log('PASS Girls persistent carousel, single-owner gestures and eager thumbnail policy');

