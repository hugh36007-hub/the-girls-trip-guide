const fs=require('fs');
const assert=require('assert');
const bootstrap=fs.readFileSync('girls-fx-expenses-bootstrap.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');

assert(bootstrap.includes("window.supabase?.createClient"),'FX bootstrap must wait for Supabase readiness');
assert(bootstrap.includes("/girls-fx-expenses.js?v=2"),'FX bootstrap must force the fresh FX script version');
assert(bootstrap.includes("setTimeout(ensure,100)"),'FX bootstrap must retry instead of failing permanently');
assert(bootstrap.includes("[data-a=\"addExpense\"]"),'FX bootstrap must react to expense entry on mobile');
assert(loader.includes("/girls-fx-expenses-bootstrap.js?v=1"),'FX bootstrap must load with the core app theme bundle');
assert(!loader.includes("/girls-fx-expenses.js?v=1"),'Old direct FX loader must be removed to avoid the readiness race');

console.log('Girls FX mobile bootstrap contract PASS');
