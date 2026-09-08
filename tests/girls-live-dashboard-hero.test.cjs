const fs=require('node:fs');
const assert=require('node:assert/strict');

const source=fs.readFileSync('girls-live-dashboard-hero.js','utf8');

assert.doesNotMatch(source,/const URL=/,'Supabase URL must not shadow the browser URL constructor');
assert.match(source,/new globalThis\.URL\(location\.href\)/,'trip ID parsing must use the browser URL constructor explicitly');
assert.match(source,/if\(mountScheduled\)return/,'mutation bursts must coalesce into one pending mount');
assert.match(source,/mount\(\)\.catch\(/,'scheduled async mounts must handle top-level failures');

console.log('Girls live dashboard hero safety: PASS');
