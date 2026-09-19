const fs=require('fs');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const home=fs.readFileSync('girls-home-refinements.js','utf8');
const intro=fs.readFileSync('girls-hidden-gallery-intro.js','utf8');
const ux=fs.readFileSync('girls-hero-vault-ux.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const checks=[
 ['evidence loads only evidence album', app.includes(".eq('album','evidence')")],
 ['vault loads only vault album', app.includes(".eq('album','vault')")],
 ['vault signs from vault bucket', app.includes("signPath('btg-vault'")],
 ['vault upload targets vault album', app.includes("doUpload(d.getAll('files'),'vault')")],
 ['vault requires server session for sensitive actions', ux.includes("rpc('has_active_vault_session'")],
 ['first-open PIN is exactly four digits', app.includes('required pattern="[0-9]{4}" minlength="4" maxlength="4"')],
 ['first-open PIN establishes the vault session', app.includes("rpc('set_vault_pin'")&&app.includes("rpc('unlock_vault'")&&app.includes('S.vaultConfigured=true;S.vaultUnlocked=true')],
 ['PIN guard is available from Home', loader.includes('/girls-vault-contract-fix.js?v=2')&&!loader.match(/evidenceFull:\[[\s\S]*?girls-vault-contract-fix\.js/)],
 ['Home uses direct vault API rather than a synthetic hidden button', home.includes('const opener=window.GTGVault?.open')&&!home.includes("b.dataset.a='vault'")],
 ['mobile hold is isolated to the expanded photo control', home.includes('PHOTO_HOLD_MS=4000')&&home.includes("open.dataset.gtgHiddenHoldBound='1'")&&home.includes("photoHold={kind:'local'")&&home.includes('if(shouldOpen)setTimeout(openHidden,0)')&&!home.includes("document.addEventListener('touchstart'")],
 ['collapsed photo never starts the hold timer', home.includes("const photo=currentPhoto();if(!photo||!photoExpanded(photo))return;")],
 ['core exports one safe vault opener', app.includes('window.GTGVault={open:openVaultFromHome}')&&app.includes('if(vaultOpening)return false')],
 ['synthetic pointer-cancel conflict removed', !intro.includes("dispatchEvent(new PointerEvent('pointercancel'")]
];
for(const [name,ok] of checks){if(!ok){console.error('FAIL:',name);process.exit(1)}console.log('PASS:',name)}
