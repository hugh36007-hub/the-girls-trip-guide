const fs=require('node:fs');
const assert=require('node:assert/strict');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert.match(app,/\[data-a="addBooking"\],\[data-a="addExpense"\],\[data-a="addRequest"\]/,'core organiser actions must share a protected click path');
assert.match(app,/e\.preventDefault\(\);e\.stopImmediatePropagation\(\);[\s\S]{0,220}if\(!isOwner\(\)\)/,'protected organiser actions must stop competing layers and verify ownership');
assert.match(app,/t\.dataset\.a==='addBooking'\)bookingModal\(\)/,'Add Plan item must open the core booking form');
assert.match(app,/t\.dataset\.a==='addExpense'\)expenseModal\(\)/,'Add expense must open the core expense form');
assert.match(app,/else requestModal\(\)/,'Request payment must open the core request form');
assert.match(html,/girls-app-v2\.js\?v=8/,'core organiser action fix must be cache-busted');
assert.match(sw,/gtg-pwa-v31-organiser-actions/,'PWA cache must advance for organiser action fix');

console.log('Girls organiser core actions: PASS');
