const fs=require('node:fs');
const assert=require('node:assert/strict');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const vaultGuard=fs.readFileSync('girls-vault-contract-fix.js','utf8');

assert(app.includes('Set your Hidden Gallery PIN'),'first-open setup title missing');
assert(app.includes('required pattern="[0-9]{4}" minlength="4" maxlength="4"'),'setup PIN must be exactly four digits');
assert(app.includes("if(!/^\\d{4}$/.test(pin))throw Error('PIN must be exactly four digits.')"),'submit must reject anything except four digits');
const set=app.indexOf("rpc('set_vault_pin'");
const unlock=app.indexOf("rpc('unlock_vault'",set);
assert(set>=0&&unlock>set,'successful first PIN save must immediately unlock with the same PIN');
assert(app.indexOf('S.vaultConfigured=true;S.vaultUnlocked=true',unlock)>unlock,'client vault state must become configured and unlocked after setup');
assert.match(vaultGuard,/input\.pattern='\[0-9\]\{4\}'/,'app-wide PIN guard must match the backend four-digit contract');
assert.match(loader,/appTheme:\[[\s\S]*girls-vault-contract-fix\.js\?v=2/,'PIN guard must load before Home Hidden Gallery entry');
console.log('PASS Girls Home Hidden Gallery first-open PIN contract');
