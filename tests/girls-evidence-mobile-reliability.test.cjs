const fs=require('fs');
const assert=require('assert');

const evidence=fs.readFileSync('girls-evidence-parity.js','utf8');
const dock=fs.readFileSync('girls-role-aware-dock.js','utf8');

assert(evidence.includes('async function ensureEvidenceDom()'),'Evidence must repair an initially empty gallery after media arrives');
assert(evidence.includes("window.addEventListener('gtg:core-data-ready'"),'Evidence must recheck the gallery when core media loading completes');
assert(evidence.includes(".eq('album','evidence')"),'Evidence repair must remain isolated to the official Evidence album');
assert(evidence.includes("gallery.querySelector('[data-media-id]')"),'Evidence repair must not duplicate an already-rendered gallery');
assert(evidence.includes("row.thumbnail_path?await signed(row,'thumbnail'):await signed(row,'preview')"),'Evidence should prefer the thumbnail and fall back to a signed preview');
assert(evidence.includes("await fallbackPhoto(img,row,token)"),'Evidence must fall back to the original photo if preview generation is unavailable');

assert(dock.includes('const HIDDEN_GALLERY_HOLD_MS=4000'),'Hidden Gallery hold must remain exactly four seconds');
assert(dock.includes("button[data-tab=\"evidence\"]"),'Hidden Gallery hold must attach only to the Evidence dock control');
assert(dock.includes("proxy.dataset.a='vault'"),'Long hold must use the existing PIN-gated vault action');
assert(dock.includes("document.addEventListener('touchstart'"),'Android touch hold must be handled explicitly');
assert(dock.includes("document.addEventListener('touchcancel'"),'Cancelled mobile gestures must not open Hidden Gallery');
assert(dock.includes("document.addEventListener('contextmenu'"),'Browser long-press menus must not steal the Evidence hold');
assert(dock.includes("dataset.homeComposition==='full'"),'Hidden Gallery hold must remain Full Trip only');

console.log('Girls Evidence mobile reliability contract PASS');
