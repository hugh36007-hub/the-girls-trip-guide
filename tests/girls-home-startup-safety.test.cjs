const fs=require('node:fs');
const assert=require('node:assert/strict');

const critical=fs.readFileSync('girls-critical-style-loader.js','utf8');
const shell=fs.readFileSync('girls-home-shell-parity.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert.match(critical,/gtg-safe-home-startup-polish/,'safe CSS-only startup polish must remain installed');
assert.match(critical,/function check\(\)\{if\(finalReady\(\)\)release\(\)\}/,'stable-paint observer callback must remain read-only');
assert.doesNotMatch(critical,/brand\.innerHTML|installBrandMark/,'critical observer path must never rewrite branding DOM');
assert.match(critical,/gtg-boot-shell/,'first-paint cover must clone only the isolated boot shell');
assert.match(critical,/__GTG_FIRST_PAINT_DONE__/,'the loading cover must be a one-shot cold-load feature');
assert.match(critical,/stats\.length!==4/,'the enhanced readiness gate must still wait for all four dashboard stats');
assert.match(critical,/function coreReady\(\)/,'startup must expose a core-dashboard readiness fallback');
assert.match(critical,/if\(force\?!coreReady\(\):!finalReady\(\)\)return/,'forced release must only occur after the core dashboard is complete');
assert.match(critical,/release\(true\)/,'startup watchdog must be able to fail open to the complete core dashboard');
assert.match(critical,/failsafeTimer=setTimeout\(failsafeCheck,9000\)/,'startup watchdog must begin after nine seconds');
assert.match(critical,/failsafeTimer=setTimeout\(failsafeCheck,1000\)/,'startup watchdog must keep checking until the core dashboard is ready');
assert.match(shell,/THE GIRLS TRIP/,'Home shell must render current text branding');
assert.match(shell,/\.brand img\{display:none!important\}/,'Home shell must hide the old image mark');
assert.doesNotMatch(shell,/girls-trip-guide-logo\.png/,'Home shell must not request the legacy PNG logo');
assert.match(html,/class="gtg-boot-brand"/,'static loading shell must use text branding');
assert.doesNotMatch(html,/class="gtg-boot-brand"[^>]*>\s*<img/,'static loading brand must not contain an image');
assert.doesNotMatch(html,/id="gtg-core-styles"/,'legacy dark inline application tokens must not remain in create-trip.html');
assert.match(html,/girls-critical-style-loader\.js\?v=20260913-1/,'create-trip must request the fixed startup loader version');
assert.match(sw,/gtg-pwa-v28-home-startup-failsafe/,'service worker cache must advance for the startup fix');
assert.match(sw,/girls-critical-style-loader\.js\?v=20260913-1/,'service worker shell must cache the fixed startup loader version');

console.log('Girls Home startup safety: PASS');
