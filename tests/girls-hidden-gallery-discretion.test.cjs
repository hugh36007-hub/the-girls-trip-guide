const fs=require('fs');
const assert=require('assert');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const guide=fs.readFileSync('evidence-intro-dismiss.js','utf8');
const intro=fs.readFileSync('girls-hidden-gallery-intro.js','utf8');
const home=fs.readFileSync('girls-home-refinements.js','utf8');
const dock=fs.readFileSync('girls-role-aware-dock.js','utf8');
const vaultUx=fs.readFileSync('girls-hero-vault-ux.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

const evidence=app.slice(app.indexOf('function panelEvidence()'),app.indexOf('function panelGroup()'));

assert(!evidence.includes('data-a="vault"'),'Evidence header must not expose Hidden Gallery viewing');
assert(evidence.includes('data-a="upload"'),'Evidence upload action must remain available');
assert(app.includes(".eq('album','evidence')"),'Official Evidence must remain a separate query');
assert(app.includes(".eq('album','vault')"),'Hidden Gallery must remain a separate query');
assert(app.includes("if(!S.vaultUnlocked)return openModal('Hidden Gallery'"),'Hidden media must remain behind the unlock gate');

assert(home.includes('PHOTO_HOLD_MS=4000'),'Home Hidden Gallery hold must remain four seconds');
assert(home.includes('Hold 4 seconds for Hidden Gallery.'),'Home latest-photo accessibility copy must explain the four-second hold');
assert(home.includes('window.GTGVault?.open'),'Home gesture must call the core vault entry directly');
assert(home.includes('&&photoExpanded(photo)'),'collapsed Latest Photo must not start a Hidden Gallery hold');
assert(!home.includes("dataset.a='vault'"),'Home gesture must not use a hidden proxy vault button');
assert(!dock.includes('HIDDEN_GALLERY_HOLD_MS'),'Evidence dock must not own a Hidden Gallery long press');
assert(!dock.includes("proxy.dataset.a='vault'"),'Evidence dock must not use a proxy vault button');
assert(!intro.includes("new PointerEvent('pointercancel'"),'intro script must not synthesize pointer cancellation');
assert(!intro.includes('direct&&!direct.hidden'),'intro script must not intercept or open the vault');
assert(intro.includes('#drawerRoot [data-a="vault"]'),'passive stale-entry cleanup must remain');
assert(intro.includes('press and hold the expanded photo for 4 seconds'),'runtime accessibility copy must preserve the Home gesture');

assert(guide.includes('gtg-evidence-gallery-guide-dismissed-v1'),'Guide dismissal must persist');
for(const copy of ['Two separate galleries','visible to everyone confirmed on the trip','tap Latest Photo once to expand it','press and hold the expanded photo for 4 seconds','4-digit trip PIN','never appear in Evidence or on Home'])assert(guide.includes(copy),`Missing guide copy: ${copy}`);
assert(!guide.includes('max-width: 700px'),'Guide must behave consistently on mobile and desktop');
assert(!vaultUx.includes('data-vault-privacy-note'),'Permanent duplicate privacy note must be removed');
assert(!vaultUx.includes('hardenVaultButton'),'Hero UX must not rewrite Hidden Gallery controls');

assert(loader.includes('/girls-hidden-gallery-intro.js?v=20260920-1'),'Passive Hidden Gallery intro must load app-wide');
assert(loader.includes('/girls-home-refinements.js?v=3'),'single Home gesture controller must be cache-busted');
assert(!loader.includes('girls-vault-contract-fix.js'),'unsafe mutation observer PIN correction must not load');
assert(!loader.match(/evidenceFull:\[[\s\S]*?girls-hidden-gallery-intro\.js/),'Hidden Gallery guide must not depend on opening Evidence');
assert(html.includes('/girls-app-v2.js?v=12')&&html.includes('/girls-session-guard.js?v=3')&&html.includes('/girls-hero-vault-ux.js?v=5')&&html.includes('/girls-role-aware-dock.js?v=4')&&html.includes('/girls-performance-loader.js?v=28'),'Updated scripts must be cache-busted');
assert(sw.includes("gtg-pwa-v48-travel-documents-light")&&sw.includes('/girls-app-v2.js?v=12')&&sw.includes('/girls-session-guard.js?v=3')&&sw.includes('/girls-performance-loader.js?v=28'),'PWA cache generation must include the repaired runtime');

console.log('Girls Hidden Gallery discretion contract PASS');
