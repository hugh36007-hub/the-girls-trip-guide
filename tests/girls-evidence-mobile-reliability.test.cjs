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

assert(!dock.includes('HIDDEN_GALLERY_HOLD_MS'),'Evidence dock must not compete with the Home Hidden Gallery controller');
assert(!dock.includes("proxy.dataset.a='vault'"),'Evidence dock must not synthesize a vault action');

console.log('Girls Evidence mobile reliability contract PASS');
