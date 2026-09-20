const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('girls-booking-copy.js','utf8');

assert(src.includes("if(option.textContent!=='Accommodation')option.textContent='Accommodation'"),
  'booking copy must not rewrite option text on every observer callback');
assert(src.includes("if(label&&label.textContent!=='Accommodation')label.textContent='Accommodation'"),
  'booking copy must not rewrite the field label on every observer callback');
assert(src.includes("new MutationObserver(()=>relabel(modal))"),
  'booking modal relabel observer must remain scoped to modal changes');

console.log('Girls booking-copy mutation-loop regression contract OK');
