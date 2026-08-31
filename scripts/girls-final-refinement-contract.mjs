import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync('girls-final-refinement.css','utf8');
const polishCss=fs.readFileSync('girls-inner-page-polish.css','utf8');
const polishJs=fs.readFileSync('girls-inner-page-polish.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const critical=fs.readFileSync('girls-critical-style-loader.js','utf8');
const deferred=fs.readFileSync('girls-performance-loader.js','utf8');
const manifest=fs.readFileSync('manifest.webmanifest','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const headers=fs.readFileSync('_headers','utf8');

for(const panel of ['plan','money','evidence','group']){
  assert(css.includes(`.panel[data-panel=\"${panel}\"].active) .hero-card`),`inner ${panel} page must hide repeated Home hero`);
  assert(css.includes(`.panel[data-panel=\"${panel}\"].active) .stat-row`),`inner ${panel} page must hide repeated Home stats`);
}
assert(css.includes('height:48px;min-height:48px'),'mobile inner appbar must be compact');
assert(css.includes('.trip-title{\n  display:flex!important'),'inner page must retain trip context');
assert(css.includes('Evidence shell only'),'Evidence styling must be shell-only');
assert(!css.includes('.gtg-mobile-media-tile{'),'final refinement must not redefine mobile Evidence tile geometry');
assert(!css.includes('.gtg-immersive-media-host{'),'final refinement must not redefine immersive viewer geometry');
assert(!polishCss.includes('.gtg-mobile-media-tile{'),'screenshot polish must not redefine Evidence tile geometry');
assert(!polishCss.includes('.gtg-immersive-media-host{'),'screenshot polish must not redefine immersive viewer geometry');

for(const token of [
  "head.insertAdjacentElement('afterend',summary)",
  "tab==='plan'",
  "tab==='money'",
  "tab==='group'",
  "data-parity-existing=\"invite\"",
  'gtg-drawer-close-top'
])assert(polishJs.includes(token),`missing screenshot hierarchy safeguard: ${token}`);
assert(polishCss.includes('padding-bottom:148px'),'inner pages must clear the floating dock');
assert(polishCss.includes('text-align:left'),'inner page titles must return to a clear left-aligned hierarchy');
assert(polishCss.includes('min-width:430px'),'wider phone summaries should compact into one row where appropriate');

for(const href of ['/mobile-viewport-lock.css?v=2','/girls-product-parity.css?v=1','/girls-final-refinement.css?v=1','/girls-inner-page-polish.css?v=1']){
  assert(html.includes(`rel=\"preload\" as=\"style\" href=\"${href}\"`),`missing nonblocking preload ${href}`);
  assert(critical.includes(href),`critical loader must activate ${href}`);
}
assert(html.includes('/girls-inner-page-polish.js?v=1'),'inner page hierarchy polish missing');
assert(html.indexOf('/girls-inner-page-polish.js?v=1')>html.indexOf('/girls-product-parity.js?v=1'),'inner page polish must run after parity injection');
assert(html.includes('/girls-critical-style-loader.js?v=1'),'critical style loader missing');
assert(html.includes('/girls-performance-loader.js?v=1'),'performance loader missing');
for(const src of ['/girls-trip-social.js?v=2','/girls-chat-sheet.js?v=2','/girls-media-social.js?v=1','/girls-poll-nudge.js?v=1','/girls-home-thumbnail-prime.js?v=1','/evidence-intro-dismiss.js?v=1']){
  assert(!html.includes(`defer src=\"${src}\"`),`noncritical script must not block startup: ${src}`);
  assert(deferred.includes(src),`deferred loader must retain ${src}`);
}
for(const src of ['/girls-role-aware-dock.js?v=2','/girls-media-readiness.js?v=2','/girls-direct-photo-viewer.js?v=4','/girls-media-flow-refinement.js?v=1']){
  assert(html.includes(src),`core interaction must remain immediate: ${src}`);
}
for(const token of ['requestIdleCallback','document.visibilityState','window.addEventListener(\'load\''])assert(deferred.includes(token),`performance loader missing ${token}`);

const parsed=JSON.parse(manifest);
assert.equal(parsed.start_url,'/create-trip?source=pwa');
assert.equal(parsed.display,'standalone');
assert(html.includes('rel="manifest" href="/manifest.webmanifest"'),'private app must advertise manifest');
assert(html.includes('/girls-pwa-register.js?v=1'),'service worker registration missing');
assert(sw.includes("request.mode==='navigate'"),'PWA navigation must be network-first');
assert(sw.includes("request.destination==='script'||request.destination==='style'"),'PWA scripts/styles must be network-first');
assert(headers.includes('/sw.js'),'service worker cache header missing');
assert(headers.includes('Service-Worker-Allowed: /'),'service worker scope header missing');

console.log('PASS Girls final refinement: compact inner shell, correct title-summary-content order, no duplicated controls, dock clearance, accessible drawer close, isolated Evidence geometry and PWA contract');
