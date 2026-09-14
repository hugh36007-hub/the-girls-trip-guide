const fs=require('fs');
const assert=require('assert');
const parity=fs.readFileSync('girls-product-parity.js','utf8');
const safe=fs.readFileSync('girls-batch1-parity-safe-v2.js','utf8');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');

assert(parity.includes("state.owner&&!state.bookings.some(x=>x.kind===kind)"),'empty organiser category does not open Add Plan');
assert(parity.includes("select.value=kind"),'Add Plan is not preselected to the chosen category');
assert(parity.includes("select.dispatchEvent(new Event('change',{bubbles:true}))"),'typed booking fields are not refreshed');
assert(!safe.includes("delete b.dataset.tab;b.dataset.a='addExpense'"),'Money dock must not be rewritten into an expense shortcut');
assert(app.includes('data-tab="money"'),'Money dock navigation is missing');
assert(app.includes('data-a="addExpense"'),'organiser Add Expense action is missing');
assert(app.includes('data-a="addRequest"'),'organiser Request Payment action is missing');
assert(!html.includes('girls-action-feedback.js'),'cosmetic feedback script must not intercept core form submission');
console.log('Girls organiser Plan and Money entry contracts passed.');
