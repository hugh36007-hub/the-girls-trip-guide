const fs=require('node:fs');
const assert=require('node:assert/strict');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const live=fs.readFileSync('girls-live-dashboard-hero.js','utf8');
const heroUx=fs.readFileSync('girls-hero-vault-ux.js','utf8');

assert.match(app,/if\(paid\(\)\)return `<section class="hero-card live-snapshot-hero"[^`]*data-full-hero-owner="girls-app-v2"/,'Full must render its final hero directly in core');
assert.match(app,/return `<section class="hero-card"><img src="\$\{esc\(hero\(\)\)\}"/,'Free must retain its existing hero path');
assert.equal((app.match(/data-full-hero-owner="girls-app-v2"/g)||[]).length,1,'core must declare exactly one Full hero owner');
assert.doesNotMatch(live,/buildShell|hero\.innerHTML\s*=|replaceWith\(hero/,'live runtime must not replace the Full hero DOM');
assert.match(live,/coreHero\(\)/,'live runtime must hydrate only the core-owned hero');
assert.match(heroUx,/live-snapshot-hero\[data-full-hero-owner="girls-app-v2"\]/,'legacy hero UX must exclude current Full hero');

console.log('PASS Girls Full Home single renderer source contract');
