const fs=require('fs');
const assert=require('assert');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const guide=fs.readFileSync('evidence-intro-dismiss.js','utf8');
const intro=fs.readFileSync('girls-hidden-gallery-intro.js','utf8');
const home=fs.readFileSync('girls-home-refinements.js','utf8');
const vaultUx=fs.readFileSync('girls-hero-vault-ux.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

const evidence=app.slice(app.indexOf('function panelEvidence()'),app.indexOf('function panelGroup()'));

assert(!evidence.includes('data-a="vault"'),'Evidence header must not expose Hidden Gallery viewing');
assert(evidence.includes('data-a="upload"'),'Evidence upload action must remain available');
assert(app.includes(".eq('album','evidence')"),'Official Evidence must remain a separate query');
assert(app.includes(".eq('album','vault')"),'Hidden Gallery must remain a separate query');
assert(app.indexOf("if(!S.vaultUnlocked)return openModal('Hidden Gallery'")<app.indexOf('await renderVault()'),'Hidden media must render only after the unlock gate');

assert(home.includes('PHOTO_HOLD_MS=4000'),'Home Hidden Gallery hold must remain four seconds');
assert(home.includes('Hold 4 seconds for Hidden Gallery.'),'Home latest-photo accessibility copy must explain the four-second hold');
assert(intro.includes('#drawerRoot [data-a="vault"]'),'Runtime guard must remove direct Hidden Gallery menu entries');
assert(intro.includes('press and hold the Latest Photo panel for 4 seconds'),'First-arrival banner must explain the Home gesture');
assert(intro.includes('You can still send photos or videos to the Hidden Gallery from Upload without unlocking it.'),'Banner must distinguish upload from viewing');
assert(!intro.includes('data-hidden-gallery-open'),'Banner must not provide a direct Hidden Gallery viewing button');
assert(intro.includes('gtg:hidden-gallery-intro-v2:'),'Corrected guide must be shown once even if the old guide was dismissed');

assert(guide.includes('gtg-evidence-gallery-guide-dismissed-v1'),'Guide dismissal must persist');
for(const copy of ['Two separate galleries','visible to everyone confirmed on the trip','4-digit trip PIN','never appear in Evidence or on Home'])assert(guide.includes(copy),`Missing guide copy: ${copy}`);
assert(!guide.includes('max-width: 700px'),'Guide must behave consistently on mobile and desktop');
assert(!vaultUx.includes('data-vault-privacy-note'),'Permanent duplicate privacy note must be removed');

assert(loader.includes('/girls-hidden-gallery-intro.js?v=20260915-2'),'Hidden Gallery guide/guard must load app-wide');
assert(!loader.match(/evidenceFull:\[[\s\S]*?girls-hidden-gallery-intro\.js/),'Hidden Gallery guide must not depend on opening Evidence');
assert(html.includes('/girls-app-v2.js?v=7')&&html.includes('/girls-hero-vault-ux.js?v=4')&&html.includes('/girls-performance-loader.js?v=14'),'Updated scripts must be cache-busted');
assert(sw.includes("gtg-pwa-v32-hidden-gallery-home-entry")&&sw.includes('/girls-performance-loader.js?v=14'),'PWA cache generation must include the updated loader');

console.log('Girls Hidden Gallery discretion contract PASS');
