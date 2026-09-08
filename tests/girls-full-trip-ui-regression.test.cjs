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
assert.match(fullHero,/dataset\.homeComposition!=='full'/,'Full hero must mount only in Full composition');
assert.match(freeHero,/dataset\.homeComposition==='free'/,'Free hero must mount only in Free composition');
assert.match(freeHero,/!hero\.isConnected\|\|!isFreeHome\(hero\)/,'Free hero must recheck composition after its async trip lookup');
assert.match(freeSocial,/!isFreeHome\(\)\)\{clearHome\(\);return\}/,'Free social renderer must remove its UI when Full composition takes ownership');
assert.match(evidence,/classList\.toggle\('gtg-mobile-media-grid',hasMedia\)/,'mobile Evidence grid must activate only when media exists');
assert.match(evidence,/gtg-mobile-media-empty/,'empty Evidence must have an explicit transparent state');
assert.match(parity,/const hasComms=Boolean/,'Group parity must detect an existing promoted communications action');
assert.match(polish,/all\.forEach\(button=>\{if\(button!==keep\)button\.remove\(\)\}\)/,'Group polish must remove duplicate communications actions');

console.log('Girls Full Trip UI regression contract: PASS');
