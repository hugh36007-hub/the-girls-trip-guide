const fs=require('fs');
const assert=require('assert/strict');
const bootstrap=fs.readFileSync('girls-fx-expenses-bootstrap.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');

assert(html.includes('/girls-fx-expenses.js?v=4'),'FX runtime must be loaded directly by create-trip.html');
assert(html.indexOf('/girls-fx-expenses.js?v=4')>html.indexOf('/girls-app-v2.js?v=8'),'Direct FX runtime must load after app core');
assert(html.indexOf('/girls-fx-expenses.js?v=4')<html.indexOf('/girls-date-flow.js?v=6'),'Direct FX runtime must own Add Expense before secondary form enhancers');
assert(bootstrap.includes('window.__GTG_FX_EXPENSES__'),'Legacy bootstrap must no-op when direct FX runtime is already active');
assert(bootstrap.includes('/girls-fx-expenses.js?v=3'),'Compatibility bootstrap remains available for older cached HTML');
assert(loader.includes('/girls-fx-expenses-bootstrap.js?v=1'),'Compatibility bootstrap may remain in appTheme during rollout');

console.log('Girls FX direct mobile runtime contract PASS');
