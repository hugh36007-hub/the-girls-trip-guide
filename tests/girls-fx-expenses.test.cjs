const fs=require('fs');
const assert=require('assert/strict');

const fx=fs.readFileSync('girls-fx-expenses.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const migration=fs.readFileSync('supabase/migrations/20260914203500_girls_local_currency_expenses.sql','utf8');
const edge=fs.readFileSync('supabase/functions/girls-fx-rate/index.ts','utf8');

assert(fx.includes("'ibiza'")&&fx.includes("return'EUR'"),'Ibiza must suggest EUR');
assert(fx.includes("'north cyprus'")&&fx.includes("return'TRY'"),'North Cyprus must suggest TRY');
assert(fx.includes('save_girls_expense_fx'),'Girls expenses must use the FX-aware RPC');
assert(fx.includes('original_currency')&&fx.includes('gbp_rate'),'Money rows must preserve/show local currency metadata');
assert(fx.includes('currency_override'),'Trip settings must support organiser currency override');
assert(fx.includes('waitForSession'),'FX trip reads must wait for the authenticated session');
assert(fx.includes("form.dataset.gtgFxOwned='1'"),'The core expense form must be explicitly owned by the FX controller');
assert(fx.includes("form.id==='expenseForm'")&&fx.includes('stopImmediatePropagation()'),'FX-aware submit must block the legacy GBP save path');
assert(fx.includes('dedupePeople(form)'),'Expense participants must be de-duplicated');
assert(!fx.includes("from('trip_members')"),'FX runtime must not create a second member-loading path');
assert(html.includes('/girls-fx-expenses.js?v=4'),'Trip page must load the FX runtime directly');
assert(html.indexOf('/girls-fx-expenses.js?v=4')>html.indexOf('/girls-app-v2.js?v=10'),'FX runtime must load after app core');
assert(migration.includes('original_amount numeric')&&migration.includes('original_currency text')&&migration.includes('gbp_rate numeric'),'FX storage columns missing');
assert(migration.includes("t.product_key = 'girls'"),'FX save RPC must be Girls-only');
assert(migration.includes('v_gbp_amount := round(p_local_amount * v_rate, 2)'),'GBP accounting amount must be computed server-side');
assert(edge.includes('Frankfurter / ECB')&&edge.includes('ExchangeRate-API'),'FX service must have primary and fallback rate sources');
console.log('PASS Girls local-currency expenses use the core member source and account in GBP');
