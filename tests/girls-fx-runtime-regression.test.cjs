const fs=require('fs');
const assert=require('assert/strict');

const fx=fs.readFileSync('girls-fx-expenses.js','utf8');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const dateFlow=fs.readFileSync('girls-date-flow.js','utf8');

assert(fx.includes("'ibiza'")&&fx.includes("return'EUR'"),'Ibiza must default to EUR');
assert(fx.includes("form.querySelector('input[name=\"amount\"]')"),'FX controller must enhance the core Amount field');
assert(fx.includes("currencyField.className='field gtg-fx-currency'"),'Currency control must be inserted into the core expense form');
assert(fx.includes("form.dataset.gtgFxReady='1'"),'Expense form must not become FX-ready until enhancement completes');
assert(fx.includes("form.id==='expenseForm'")&&fx.includes('stopImmediatePropagation()'),'FX controller must own expense submit before the legacy save handler');
assert(fx.includes('save_girls_expense_fx'),'FX-aware RPC must own expense persistence');
assert(fx.includes('p_local_amount:amount')&&fx.includes('p_gbp_rate:fx.rate')&&fx.includes('p_rate_date:fx.rate_date'),'Save must persist local amount and locked FX metadata');
assert(!fx.includes("from('trip_members')"),'FX controller must not independently reload trip members');

const expenseStart=app.indexOf('function expenseModal(existing=null)');
assert(expenseStart>=0,'Core expense modal must exist');
const expenseSlice=app.slice(expenseStart,expenseStart+2200);
assert(expenseSlice.includes('S.members.map'),'Core expense modal must use the already-loaded authoritative member state');
assert(expenseSlice.includes('name="payer"')&&expenseSlice.includes('name="people"'),'Core expense modal must render payer and split members from the same state');

const appPos=html.indexOf('/girls-app-v2.js?v=7');
const fxPos=html.indexOf('/girls-fx-expenses.js?v=4');
const datePos=html.indexOf('/girls-date-flow.js?v=6');
assert(appPos>=0&&fxPos>appPos&&datePos>fxPos,'FX runtime must load after app core and before secondary form enhancers');
assert(dateFlow.includes('dedupePeopleOptions(people)')&&dateFlow.includes('const rendered=new Set()'),'Visible split renderer must dedupe member IDs');

console.log('PASS Girls FX runtime: core member source, EUR enhancement, FX save ownership, and split dedupe');
