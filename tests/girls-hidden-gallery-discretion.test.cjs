const fs=require('fs');
const assert=require('assert');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const guide=fs.readFileSync('evidence-intro-dismiss.js','utf8');
const vaultUx=fs.readFileSync('girls-hero-vault-ux.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

const evidence=app.slice(app.indexOf('function panelEvidence()'),app.indexOf('function panelGroup()'));
const drawer=app.slice(app.indexOf('function drawerOpen()'),app.indexOf('function bookingModal('));

assert(!evidence.includes('data-a="vault"'),'Evidence header must not expose Hidden Gallery');
assert(evidence.includes('data-a="upload"'),'Evidence upload action must remain available');
assert(drawer.includes("paid()?'<button data-a=\"vault\""),'Paid trip menu must retain discreet Hidden Gallery access');
assert(app.includes(".eq('album','evidence')"),'Official Evidence must remain a separate query');
assert(app.includes(".eq('album','vault')"),'Hidden Gallery must remain a separate query');
assert(app.indexOf("if(!S.vaultUnlocked)return openModal('Hidden Gallery'")<app.indexOf('await renderVault()'),'Hidden media must render only after the unlock gate');

assert(guide.includes("gtg-evidence-gallery-guide-dismissed-v1"),'Guide dismissal must persist');
for(const copy of ['Two separate galleries','visible to everyone confirmed on the trip','4-digit trip PIN','never appear in Evidence or on Home'])assert(guide.includes(copy),`Missing guide copy: ${copy}`);
assert(!guide.includes('max-width: 700px'),'Guide must behave consistently on mobile and desktop');
assert(!vaultUx.includes('data-vault-privacy-note'),'Permanent duplicate privacy note must be removed');

assert(loader.includes('/evidence-intro-dismiss.js?v=2'),'Guide cache version not bumped');
assert(html.includes('/girls-app-v2.js?v=4')&&html.includes('/girls-hero-vault-ux.js?v=3')&&html.includes('/girls-performance-loader.js?v=4'),'Updated scripts must be cache-busted');
assert(sw.includes("gtg-pwa-v13"),'PWA cache generation not bumped');

console.log('Girls Hidden Gallery discretion contract PASS');
