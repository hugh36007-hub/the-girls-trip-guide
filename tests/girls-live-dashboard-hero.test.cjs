const fs=require('node:fs');
const assert=require('node:assert/strict');

const source=fs.readFileSync('girls-live-dashboard-hero.js','utf8');
const critical=fs.readFileSync('girls-critical-style-loader.js','utf8');
const dateFlow=fs.readFileSync('girls-date-flow.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert.doesNotMatch(source,/const URL=/,'Supabase URL must not shadow the browser URL constructor');
assert.match(source,/__GTG_LIVE_DASHBOARD_HERO__/,'the dashboard hero runtime must be a singleton');
assert.match(source,/new globalThis\.URL\(location\.href\)/,'trip ID parsing must use the browser URL constructor explicitly');
assert.match(source,/if\(mountScheduled\)return/,'mutation bursts must coalesce into one pending mount');
assert.match(source,/mount\(\)\.catch\(/,'scheduled async mounts must handle top-level failures');
assert.match(critical,/girls-live-dashboard-hero\.js\?v=7/,'the critical loader must cache-bust the corrected runtime');
assert.doesNotMatch(dateFlow,/girls-live-dashboard-hero\.js/,'the legacy date flow must not load a duplicate hero runtime');
assert.match(html,/girls-critical-style-loader\.js\?v=20260908-4/,'the private shell must cache-bust the corrected critical loader');
assert.match(html,/girls-date-flow\.js\?v=3/,'the private shell must cache-bust the duplicate-free date flow');
assert.match(html,/girls-pwa-register\.js\?v=2/,'the private shell must refresh PWA registration code');
assert.match(sw,/gtg-pwa-v8/,'the fixed private shell must replace the previous offline cache generation');

console.log('Girls live dashboard hero safety: PASS');
