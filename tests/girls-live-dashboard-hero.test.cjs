const fs=require('node:fs');
const assert=require('node:assert/strict');

const source=fs.readFileSync('girls-live-dashboard-hero.js','utf8');
const critical=fs.readFileSync('girls-critical-style-loader.js','utf8');
const dateFlow=fs.readFileSync('girls-date-flow.js','utf8');

assert.doesNotMatch(source,/const URL=/,'Supabase URL must not shadow the browser URL constructor');
assert.match(source,/__GTG_LIVE_DASHBOARD_HERO__/,'the dashboard hero runtime must be a singleton');
assert.match(source,/new globalThis\.URL\(location\.href\)/,'trip ID parsing must use the browser URL constructor explicitly');
assert.match(source,/if\(mountScheduled\)return/,'mutation bursts must coalesce into one pending mount');
assert.match(source,/mount\(\)\.catch\(/,'scheduled async mounts must handle top-level failures');
assert.match(critical,/girls-live-dashboard-hero\.js\?v=7/,'the critical loader must cache-bust the corrected runtime');
assert.doesNotMatch(dateFlow,/girls-live-dashboard-hero\.js/,'the legacy date flow must not load a duplicate hero runtime');

console.log('Girls live dashboard hero safety: PASS');
