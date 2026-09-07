const fs=require('node:fs');
const assert=require('node:assert/strict');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
const headers=fs.readFileSync('_headers','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert.equal(manifest.display,'standalone','PWA display must remain standalone');
assert(manifest.icons.some(i=>i.sizes==='192x192'&&i.purpose==='any'),'192x192 install icon missing');
assert(manifest.icons.some(i=>i.sizes==='512x512'&&i.purpose==='any'),'512x512 install icon missing');
assert(manifest.icons.some(i=>i.sizes==='512x512'&&String(i.purpose).includes('maskable')),'maskable install icon missing');
for(const icon of manifest.icons){
  const clean=String(icon.src).split('?')[0].replace(/^\//,'');
  assert(fs.existsSync(clean),`Manifest icon does not exist: ${clean}`);
}
assert(sw.includes("CACHE_VERSION='gtg-pwa-v2'"),'PWA cache version must be v2 or newer');
assert(sw.includes('/manifest.webmanifest'),'Manifest must be in app shell');
assert(headers.includes('Content-Security-Policy:'),'Girls CSP missing');
assert(headers.includes("frame-ancestors 'none'"),'CSP frame-ancestors protection missing');
assert(headers.includes("base-uri 'none'"),'CSP base-uri protection missing');
assert(headers.includes('https://fonts.googleapis.com'),'Google Fonts stylesheet source missing from CSP');
assert(headers.includes('https://fonts.gstatic.com'),'Google Fonts font source missing from CSP');
console.log('Girls PWA and browser-security contract: PASS');
