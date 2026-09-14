const fs=require('fs');
const assert=require('assert/strict');

const src=fs.readFileSync('girls-home-shell-parity.js','utf8');
assert(src.includes('function syncHomeMoney()'),'Home shell must own running Money total');
assert(src.includes('.stat-row .stat[data-tab="plan"] small'),'Home total must read the booked Plan subtotal');
assert(src.includes('[data-panel="money"] .balance-grid .card:first-child h3'),'Home total must read the Expenses subtotal');
assert(src.includes('moneyStat.textContent=formatMoney(booked+expenses)'),'Home Money tile must show bookings plus expenses');
console.log('PASS Home Money tile uses running trip total');
