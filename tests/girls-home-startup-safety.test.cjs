const fs=require('node:fs');
const assert=require('node:assert/strict');

const critical=fs.readFileSync('girls-critical-style-loader.js','utf8');
const shell=fs.readFileSync('girls-home-shell-parity.js','utf8');

assert.match(critical,/gtg-safe-home-startup-polish/,'safe CSS-only startup polish must remain installed');
assert.match(critical,/const check=\(\)=>\{if\(finalReady\(\)\)release\(\)\};/,'stable-paint observer callback must remain read-only');
assert.doesNotMatch(critical,/brand\.innerHTML|installBrandMark/,'critical observer path must never rewrite branding DOM');
assert.doesNotMatch(shell,/\.brand\.innerHTML|brand\.innerHTML/,'Home shell must not replace brand DOM');
assert.match(shell,/girls-trip-guide-logo\.webp/,'Home shell must use the lightweight WebP logo asset');
assert.doesNotMatch(shell,/girls-trip-guide-logo\.png/,'Home shell must not request the 681 KB legacy PNG logo');

console.log('Girls Home startup safety: PASS');
