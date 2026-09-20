const fs=require('node:fs');
const assert=require('node:assert/strict');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');

assert(app.includes('Set your Hidden Gallery PIN'),'first-open setup title missing');
assert(app.includes('required pattern="[0-9]{4}" minlength="4" maxlength="4" inputmode="numeric" autocomplete="off"'),'setup PIN must be exactly four digits');
assert(app.includes("if(!/^\\d{4}$/.test(pin))throw Error('PIN must be exactly four digits.')"),'submit must reject anything except four digits');
assert(app.includes('The organiser has not set the Hidden Gallery PIN yet.'),'crew must see an unavailable state when no PIN exists');
assert(app.includes('window.GTGVault=Object.freeze({open:vaultModal})'),'core must expose one stable Hidden Gallery entry point');
assert(!app.includes('class="live-photo-open" data-a="vault"'),'Latest Photo must not directly dispatch the core vault action');
const set=app.indexOf("rpc('set_vault_pin'");
const unlock=app.indexOf("rpc('unlock_vault'",set);
assert(set>=0&&unlock>set,'successful first PIN save must immediately unlock with the same PIN');
assert(app.indexOf('S.vaultConfigured=true;S.vaultUnlocked=true',unlock)>unlock,'client vault state must become configured and unlocked after setup');
assert(loader.includes('/girls-home-refinements.js?v=3'),'the single Home gesture controller must load');
assert(!loader.includes('girls-vault-contract-fix.js'),'unsafe mutation-based PIN correction script must not load');
console.log('PASS Girls Home Hidden Gallery first-open PIN contract');
