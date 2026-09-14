const fs=require('node:fs');
const assert=require('node:assert/strict');

const publicRuntime=fs.readFileSync('script.js','utf8');
const publicCore=fs.readFileSync('script-core.js','utf8');
const critical=fs.readFileSync('girls-critical-style-loader.js','utf8');
const privateLoader=fs.readFileSync('girls-performance-loader.js','utf8');
const sessionGuard=fs.readFileSync('girls-session-guard.js','utf8');
const privateHtml=fs.readFileSync('create-trip.html','utf8');

assert.match(publicRuntime,/button\.dataset\.gtgNavBound/,'public navigation must have an idempotent owner');
assert.match(publicRuntime,/header\.classList\.toggle\('open'\)/,'public navigation owner must operate the hamburger');
assert.match(publicRuntime,/desktopCta\.textContent='Sign in'/,'desktop CTA must be Sign in');
assert.match(publicRuntime,/mobileCta\.textContent='Sign in'/,'mobile CTA must be Sign in');
assert.doesNotMatch(publicCore,/header\.classList\.toggle\('open'\)|createElement\('nav'\)/,'public core must not compete for hamburger ownership');

for(const src of ['girls-live-dashboard-hero.js','girls-live-chat-sync.js','girls-home-scoreboard-fit.js']){
 const pattern=new RegExp(src.replaceAll('.','\\.'),'g');
 assert.equal((privateLoader.match(pattern)||[]).length,1,`${src} must have exactly one private runtime registration`);
 assert(!critical.includes(src),`${src} must not be started by the style loader`);
 assert(!sessionGuard.includes(src),`${src} must not be started by the session security guard`);
}
assert.equal((privateHtml.match(/girls-home-social-hub-v3\.js/g)||[]).length,1,'Free Home chat must have one direct runtime registration');
assert(!privateLoader.includes('girls-home-social-hub-v3.js'),'Free Home chat must not have a deferred duplicate');
assert(!critical.includes('girls-home-social-hub-v3.js'),'Free Home chat must not be started by the style loader');
assert(!sessionGuard.includes('girls-home-social-hub-v3.js'),'Free Home chat must not be started by the session security guard');

console.log('Girls runtime ownership: PASS');
