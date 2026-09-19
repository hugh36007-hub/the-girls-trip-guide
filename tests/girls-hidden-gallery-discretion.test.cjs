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
assert(home.includes('Hold 4 seconds, then release for Hidden Gallery.'),'Home latest-photo accessibility copy must explain the four-second hold');
assert(intro.includes('#drawerRoot [data-a="vault"]'),'Runtime guard must remove direct Hidden Gallery menu entries');
assert(!intro.includes('There’s also a Hidden Gallery'),'Duplicate Hidden Gallery explainer card must not be rendered');
assert(intro.includes('press and hold the expanded photo for 4 seconds and release'),'Runtime accessibility copy must preserve the Home gesture');

assert(guide.includes('gtg-evidence-gallery-guide-dismissed-v1'),'Guide dismissal must persist');
for(const copy of ['Two separate galleries','visible to everyone confirmed on the trip','tap Latest Photo once to expand it','press and hold the expanded photo for 4 seconds','4-digit trip PIN','never appear in Evidence or on Home'])assert(guide.includes(copy),`Missing guide copy: ${copy}`);
assert(!guide.includes('max-width: 700px'),'Guide must behave consistently on mobile and desktop');
assert(!vaultUx.includes('data-vault-privacy-note'),'Permanent duplicate privacy note must be removed');

assert(loader.includes('/girls-hidden-gallery-intro.js?v=20260919-2'),'Hidden Gallery guide/guard must load app-wide');
assert(loader.includes('/girls-vault-contract-fix.js?v=2'),'4-digit PIN contract must load app-wide for Home entry');
assert(!loader.match(/evidenceFull:\[[\s\S]*?girls-vault-contract-fix\.js/),'PIN contract must not depend on Evidence loading');
assert(app.includes('required pattern="[0-9]{4}" minlength="4" maxlength="4"'),'core Home PIN form must enforce exactly four digits');
assert(!app.includes('Set a 4–8 digit PIN'),'obsolete 4–8 digit PIN copy must be removed');
assert(app.includes("rpc('set_vault_pin'")&&app.includes("rpc('unlock_vault'"),'first PIN save must immediately establish the secure vault session');
assert(app.includes('S.vaultConfigured=true;S.vaultUnlocked=true'),'successful PIN setup must open Hidden Gallery without asking for the PIN twice');
assert(app.includes('window.GTGVault={open:openVaultFromHome}'),'Home must call the core vault API directly');
assert(home.includes('const opener=window.GTGVault?.open')&&!home.includes("b.dataset.a='vault'"),'Home hold must not synthesize a hidden vault click');
assert(home.includes("document.addEventListener('touchstart'")&&home.includes("document.addEventListener('touchend'"),'mobile Hidden Gallery entry must use touch-native start/end handling');
assert(home.includes("event.preventDefault();")&&home.includes("if(ready&&target?.isConnected)setTimeout(openHidden,0)"),'mobile long hold must suppress native long-press and open only after touchend');
assert(home.includes("else if(target?.isConnected)setTimeout(openEvidence,0)"),'short expanded-photo taps must still open Evidence');
assert(home.includes("if(event.pointerType==='touch'||touchGestureActive)return;"),'pointer layer must not duplicate touch handling');
assert(!intro.includes("dispatchEvent(new PointerEvent('pointercancel'"),'guide layer must not inject synthetic pointer cancellation');
assert(!loader.match(/evidenceFull:\[[\s\S]*?girls-hidden-gallery-intro\.js/),'Hidden Gallery guide must not depend on opening Evidence');
assert(html.includes('/girls-app-v2.js?v=10')&&html.includes('/girls-hero-vault-ux.js?v=4')&&html.includes('/girls-performance-loader.js?v=19'),'Updated scripts must be cache-busted');
assert(sw.includes("gtg-pwa-v38-hidden-gallery-mobile-touch")&&sw.includes('/girls-performance-loader.js?v=18'),'PWA cache generation must include the updated loader');

console.log('Girls Hidden Gallery discretion contract PASS');
