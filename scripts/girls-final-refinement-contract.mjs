import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync('girls-final-refinement.css','utf8');
const polishCss=fs.readFileSync('girls-inner-page-polish.css','utf8');
const polishJs=fs.readFileSync('girls-inner-page-polish.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const critical=fs.readFileSync('girls-critical-style-loader.js','utf8');
const deferred=fs.readFileSync('girls-performance-loader.js','utf8');
const authBridge=fs.readFileSync('girls-supabase-auth-bridge.js','utf8');
const dateFlow=fs.readFileSync('girls-date-flow.js','utf8');
const heroUx=fs.readFileSync('girls-hero-vault-ux.js','utf8');
const roleDock=fs.readFileSync('girls-role-aware-dock.js','utf8');
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
assert(polishCss.includes('padding-bottom:148px')||polishCss.includes('padding-bottom:132px'),'inner pages must clear the floating dock');
assert(polishCss.includes('text-align:left'),'inner page titles must return to a clear left-aligned hierarchy');
assert(polishCss.includes('min-width:430px'),'wider phone summaries should compact into one row where appropriate');

for(const href of ['/mobile-viewport-lock.css?v=2','/girls-final-refinement.css?v=1','/girls-hero-vault-ux.css?v=1']){
  assert(html.includes(`rel=\"preload\" as=\"style\" href=\"${href}\"`),`missing Home-shell preload ${href}`);
  assert(critical.includes(href),`critical loader must activate ${href}`);
}
for(const href of ['/girls-product-parity.css?v=1','/girls-inner-page-polish.css?v=1','/girls-document-audience.css?v=1']){
  assert(!html.includes(`rel=\"preload\" as=\"style\" href=\"${href}\"`),`route CSS must not preload on Home: ${href}`);
  assert(deferred.includes(href),`route loader must retain ${href}`);
}
assert(!html.includes('/girls-inner-page-polish.js?v=1'),'inner-page DOM polish must not execute on Home startup');
assert(deferred.includes('/girls-inner-page-polish.js?v=1'),'route loader must retain inner-page hierarchy polish');
assert(html.includes('/girls-critical-style-loader.js?v=1'),'critical style loader missing');
assert(html.includes('/girls-performance-loader.js?v=1'),'performance loader missing');

// Critical-path performance safeguards.
assert(html.includes('<style id="gtg-core-styles">'),'core private-app CSS must be inline so Home has no blocking first-party stylesheet request');
assert(!html.includes('rel="stylesheet" href="/girls-app.css?v=1"'),'girls-app.css must not remain render-blocking after the inline critical-shell move');
assert(html.includes('rel="preload" as="image" href="/assets/images/hero.webp"'),'default Home hero must be discoverable before runtime render');
assert(html.includes('fetchpriority="high"'),'Home hero preload must be high priority');
assert(html.includes('<main class="dashboard" aria-busy="true"'),'private app must ship a geometry-stable dashboard primer before Supabase hydration');
assert(html.includes('src="/assets/images/hero.webp" width="1600" height="900"'),'dashboard primer must reserve the LCP image geometry explicitly');
assert(html.includes('girls-trip-guide-logo.webp" width="512" height="512"'),'loading logo must reserve square geometry');
assert(!html.includes('rel="preconnect" href="https://fonts.googleapis.com"'),'async fonts must not consume a critical preconnect');
assert(!html.includes('rel="preconnect" href="https://fonts.gstatic.com"'),'font binaries must not consume a critical preconnect');
assert(!html.includes('rel="preconnect" href="https://cdn.jsdelivr.net"'),'Supabase script preload must replace a redundant jsDelivr preconnect');
assert(!html.includes('vtcmvwixfqyxqghibsla.storage.supabase.co" crossorigin'),'do not spend an initial preconnect on storage');
assert(html.includes('rel="preload" as="script" href="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4"'),'Supabase runtime must be discoverable from the head rather than waiting for the parser to reach the body');
assert(html.includes('media="print" onload="this.media=\'all\'"'),'Google Fonts CSS must not block first render');
assert(html.includes('defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4"'),'Supabase runtime must not block HTML parsing');
assert(html.includes('/girls-supabase-auth-bridge.js?v=1'),'deferred Girls OTP bridge missing');
assert(authBridge.includes('functions/v1/girls-auth-otp'),'OTP bridge must preserve isolated Girls auth routing');
assert(!html.includes('tus-js-client@4.3.1/dist/tus.min.js'),'resumable upload library must not execute on Home startup');
assert(deferred.includes('tus-js-client@4.3.1/dist/tus.min.js'),'upload intent must retain resumable upload support');
assert(!html.includes('defer src="/girls-product-parity.js?v=1"'),'supplementary parity data must not compete with initial dashboard load');
assert(deferred.includes('/girls-product-parity.js?v=1'),'route loader must retain the parity layer');
assert(!deferred.includes("route==='overview'?1200:220"),'Home parity must not auto-refresh the authoritative dashboard after paint');
assert(deferred.includes('15000'),'Home thumbnail prime must wait beyond the Lighthouse critical window');
assert(!dateFlow.includes('data-payment-nudge-loader'),'date helper must not side-load payment scripts');
assert(!dateFlow.includes('data-trip-social-loader'),'date helper must not side-load social scripts');
assert(heroUx.includes("observe(app,{childList:true})")&&!heroUx.includes("observe(document.documentElement"),'hero controls must observe only authoritative app rerenders');
assert(roleDock.includes("observe(app,{childList:true})")&&!roleDock.includes("observe(document.documentElement"),'dock normalisation must observe only authoritative app rerenders');

for(const src of [
 '/girls-vault-contract-fix.js?v=1','/girls-section-layout.js?v=1','/girls-free-entitlement-guard.js?v=1','/girls-inner-page-polish.js?v=1','/girls-document-audience.js?v=1','/girls-hidden-upload-choice.js?v=1','/girls-media-performance-max.js?v=2','/girls-media-ux-plus.js?v=2','/girls-evidence-parity.js?v=2','/girls-media-quality-fix.js?v=4','/girls-mobile-evidence-grid.js?v=2','/girls-media-readiness.js?v=2','/girls-direct-photo-viewer.js?v=4','/girls-media-flow-refinement.js?v=1','/girls-trip-social.js?v=2','/girls-chat-sheet.js?v=2','/girls-media-social.js?v=1','/girls-poll-nudge.js?v=1','/girls-home-thumbnail-prime.js?v=1','/evidence-intro-dismiss.js?v=1'
]){
  assert(!html.includes(`defer src=\"${src}\"`),`noncritical script must not execute on Home startup: ${src}`);
  assert(deferred.includes(src),`route loader must retain ${src}`);
}
for(const src of ['/girls-role-aware-dock.js?v=2','/girls-hero-vault-ux.js?v=2'])assert(html.includes(src),`Home-critical interaction must remain immediate: ${src}`);
for(const token of ['requestIdleCallback','document.visibilityState','MutationObserver','afterDashboard','loadRoute'])assert(deferred.includes(token),`performance loader missing ${token}`);

const parsed=JSON.parse(manifest);
assert.equal(parsed.start_url,'/create-trip?source=pwa');
assert.equal(parsed.display,'standalone');
assert(html.includes('rel="manifest" href="/manifest.webmanifest"'),'private app must advertise manifest');
assert(html.includes('/girls-pwa-register.js?v=1'),'service worker registration missing');
assert(sw.includes("request.mode==='navigate'"),'PWA navigation must be network-first');
assert(sw.includes("request.destination==='script'||request.destination==='style'"),'PWA scripts/styles must be network-first');
assert(headers.includes('/sw.js'),'service worker cache header missing');
assert(headers.includes('Service-Worker-Allowed: /'),'service worker scope header missing');

console.log('PASS Girls final refinement: compact shell, isolated Evidence geometry, route-lazy enhancements, bounded observers, inline critical CSS, early LCP primer, nonblocking auth/fonts and PWA contract');
