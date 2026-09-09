const fs=require('node:fs');
const assert=require('node:assert/strict');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const fullHero=fs.readFileSync('girls-live-dashboard-hero.js','utf8');
const freeHero=fs.readFileSync('girls-home-hero-layout-match.js','utf8');
const freeSocial=fs.readFileSync('girls-home-social-hub-v3.js','utf8');
const evidence=fs.readFileSync('girls-mobile-evidence-grid.js','utf8');
const parity=fs.readFileSync('girls-product-parity.js','utf8');
const polish=fs.readFileSync('girls-inner-page-polish.js','utf8');

assert.match(app,/data-home-composition="\$\{paid\(\)\?'full':'free'\}"/,'authoritative app render must declare the entitlement-based Home composition');
assert.match(app,/if\(paid\(\)\)return `<section class="hero-card live-snapshot-hero"/,'Full hero must be created only by the paid core composition path');
assert.match(fullHero,/\.dashboard\[data-home-composition="full"\][^']*data-full-hero-owner="girls-app-v2"/,'Full hero hydration must target only the authoritative Full composition');
assert.match(freeHero,/dataset\.homeComposition==='free'/,'Free hero must mount only in Free composition');
assert.match(freeHero,/!hero\.isConnected\|\|!isFreeHome\(hero\)/,'Free hero must recheck composition after its async trip lookup');
assert.match(freeSocial,/!isFreeHome\(\)\)\{clearHome\(\);return\}/,'Free social renderer must remove its UI when Full composition takes ownership');
assert.match(evidence,/classList\.toggle\('gtg-mobile-media-grid',hasMedia\)/,'legacy mobile Evidence grid contract remains inert but structurally valid');
assert.match(evidence,/gtg-mobile-media-empty/,'legacy empty Evidence contract remains structurally valid');
assert.match(parity,/const hasComms=Boolean/,'Group parity must detect an existing promoted communications action');
assert.match(polish,/all\.forEach\(button=>\{if\(button!==keep\)button\.remove\(\)\}\)/,'Group polish must remove duplicate communications actions');
const switchTab=app.match(/function switchTab\(tab\)\{([^}]|\}(?!\nfunction))*\}/)?.[0]||'';
assert.match(switchTab,/classList\.toggle\('active'/,'ordinary tab switching must reuse the existing rendered dashboard');
assert.doesNotMatch(switchTab,/renderDashboard\(/,'ordinary Plan/Money/Group/Evidence → Home switching must not rerender the dashboard');

console.log('Girls Full Trip UI regression contract: PASS');
