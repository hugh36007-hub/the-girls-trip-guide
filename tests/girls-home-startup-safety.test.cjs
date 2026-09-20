const fs=require('node:fs');
const assert=require('node:assert/strict');

const critical=fs.readFileSync('girls-critical-style-loader.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const guard=fs.readFileSync('girls-session-guard.js','utf8');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert.doesNotMatch(critical,/MutationObserver|gtg-first-paint-cover|finalReady|failsafeCheck|loadCriticalScript/,'critical styling must not control Home readiness or execute Home scripts');
assert.match(critical,/const BASE_STYLES=/,'critical loader must be styling-only');
assert.match(critical,/live-dashboard-hero\.css\?v=10/,'authoritative Home styling must be available before app paint');
assert.equal((loader.match(/\/girls-live-dashboard-hero\.js/g)||[]).length,1,'Home hero runtime must have one loader owner');
assert.equal((html.match(/\/girls-home-social-hub-v3\.js/g)||[]).length,1,'Free Home chat must load directly with the core dashboard');
assert.equal((loader.match(/\/girls-home-social-hub-v3\.js/g)||[]).length,0,'deferred Home bundle must not duplicate the core chat owner');
assert.doesNotMatch(loader,/girls-home-hero-layout-match/,'legacy black Free hero override must not load');
assert.equal((loader.match(/\/girls-home-scoreboard-fit\.js/g)||[]).length,1,'Home scoreboard runtime must have one loader owner');
assert.doesNotMatch(guard,/girls-home-social-hub-v3|girls-home-scoreboard-fit/,'session security must not own Home UI startup');
assert.match(loader,/if\(route==='overview'\)afterDashboard\(\(\)=>void loadBundle\('home'\),0\)/,'Home enhancement bundle must start once after the core dashboard exists');
assert.doesNotMatch(loader,/12000|gtg-home-route-pending|GTGCritical/,'Home startup must not contain artificial twelve-second delays or a second readiness gate');
assert.match(app,/renderDashboard\(\);\n const activeTripId=/,'core dashboard must render before nonessential media and presentation reads');
assert.match(app,/await Promise\.all\(\[loadProfile\(\)\.catch\(\(\)=>null\),listTrips\(\)\]\)/,'profile and trip discovery must run concurrently');
assert.match(app,/Promise\.allSettled\(deferred\)/,'nonessential startup reads must settle without blocking first dashboard render');
assert.match(app,/async function loadAvatars\(\)\{await Promise\.all/,'avatar signing must be concurrent');
assert.match(html,/girls-critical-style-loader\.js\?v=20260914-1/,'critical style loader cache version missing');
assert.match(html,/girls-app-v2\.js\?v=12/,'core app cache version missing');
assert.match(html,/girls-session-guard\.js\?v=3/,'session guard cache version missing');
assert.match(html,/girls-home-social-hub-v3\.js\?v=20260914-1/,'core Free chat cache version missing');
assert.match(html,/girls-performance-loader\.js\?v=22/,'runtime loader cache version missing');
assert.match(sw,/gtg-pwa-v41-hidden-gallery-controller/,'service worker cache must advance for push delivery');
assert.doesNotMatch(sw,/home-startup-failsafe/,'obsolete startup-failsafe cache must be retired');

console.log('Girls Home runtime consolidation: PASS');
