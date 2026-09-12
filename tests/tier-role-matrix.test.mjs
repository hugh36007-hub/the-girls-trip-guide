import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync('girls-app-v2.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');

// Shared authority: entitlement is server-loaded and product access is Girls-only.
assert.match(app,/function paid\(\)\{return S\.entitlements\.some\(x=>x\.active!==false&&\['full_trip','evidence'\]\.includes\(x\.entitlement\)\)\}/,
  'paid state must come from active Full/Evidence entitlements');
assert.match(app,/from\('trips'\)\.select\('\*'\)\.eq\('product_key','girls'\)/,
  'trip listing must stay product-scoped to Girls');
assert.match(app,/from\('trips'\)\.select\('\*'\)\.eq\('id',tripId\)\.eq\('product_key','girls'\)\.single\(\)/,
  'direct trip load must stay product-scoped to Girls');

// Free organiser + Free member: media data and paid runtime remain fail-closed.
assert.match(app,/async function loadMedia\(\)\{S\.media=\[\];S\.urls=\{\};if\(!S\.trip\|\|!paid\(\)\)return;/,
  'Free trips must not load Evidence media');
assert.match(app,/async function loadVaultState\(\)\{S\.vaultConfigured=false;S\.vaultUnlocked=false;if\(!S\.trip\|\|!paid\(\)\)return;/,
  'Free trips must not initialise Hidden Gallery state');
assert.match(app,/if\(paid\(\)\)await Promise\.all\(\[loadContributions\(\)\.catch\(\(\)=>\{\}\),loadMessages\(\)\.catch\(\(\)=>\{\}\)\]\)/,
  'paid contribution/message loading must remain entitlement-gated');
assert.match(app,/data-home-composition="\$\{paid\(\)\?'full':'free'\}" data-trip-role="\$\{role\}"/,
  'dashboard must expose authoritative tier and role state');
assert.match(app,/function panelEvidence\(\)\{if\(!paid\(\)\)return `[\s\S]*Included with Full Trip[\s\S]*isOwner\(\)\?'<div class="actions"[\s\S]*data-a="upgrade"/,
  'Free Evidence must be locked and only the organiser may see the purchase CTA');
assert.match(app,/\$\{paid\(\)\?` · \$\{c\.total\|\|0\} uploads`:''\}/,
  'Free Group cards must not show paid upload counts');
assert.match(app,/\$\{paid\(\)\?'<button data-a="vault"><b>Hidden Gallery<\/b>/,
  'Free drawer must not expose Hidden Gallery');

// Full organiser + Full member: current paid media path remains intact.
assert.match(app,/The official version of events\.'\,'<button class="btn primary" data-a="upload">Upload<\/button>'\)/,
  'Full Evidence must retain Upload');
assert.match(app,/\(m\.created_by===S\.user\.id\|\|isOwner\(\)\)\?`<button data-delete-media=/,
  'Full member must retain own-media removal while organiser retains moderation');

// Runtime isolation: Free and Full must never share paid media bundles by accident.
assert.match(loader,/evidenceFull:\[/,'Full Evidence bundle must be explicit');
assert.match(loader,/evidenceFree:\[/,'Free Evidence bundle must be explicit');
assert.match(loader,/const composition=\(\)=>document\.querySelector\('\.dashboard'\)\?\.dataset\.homeComposition\|\|''/,
  'runtime loader must read authoritative composition state');
assert.match(loader,/if\(mode==='full'\)await loadBundle\('evidenceFull'\)/,
  'Full Evidence runtime must require Full composition');
assert.match(loader,/else if\(mode==='free'\)await loadBundle\('evidenceFree'\)/,
  'Free Evidence runtime must require Free composition');
assert.match(loader,/if\(isFull\(\)&&\(target\.matches\('\[data-role-upload\]'\)\|\|\['upload','vault','vaultUpload'\]\.includes\(a\)\)\)\{void loadRoute\('evidence'\);void loadBundle\('upload'\)\}/,
  'resumable upload runtime must be Full-only');

console.log('Girls tier/role matrix passed: Free organiser, Free member, Full organiser, Full member.');
