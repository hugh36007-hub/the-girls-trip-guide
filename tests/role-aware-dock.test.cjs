const fs=require('fs');
const js=fs.readFileSync('girls-role-aware-dock.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const checks=[
 ['role-aware dock v2 is explicitly loaded',html.includes('girls-role-aware-dock.js?v=2')],
 ['shared five-position order',js.includes('const wanted=[overview,plan,centre,group,evidence]')],
 ['owner centre is direct Add Expense',js.includes('data-role-expense')&&js.includes('[data-panel="money"] [data-a="addExpense"]')],
 ['role detection uses permission-gated owner control',js.includes("?'owner':'member'")&&!js.includes('.trip-title span')],
 ['member centre is Upload',js.includes('data-role-upload')&&js.includes("decorate(centre,who==='owner'?'expense':'upload'")],
 ['member upload uses existing uploader',js.includes("document.querySelector('[data-a=\"upload\"]')")],
 ['free member falls back to Evidence',js.includes('button[data-tab="evidence"]')],
 ['vector icon set is installed',js.includes('const ICONS=')&&js.includes('<svg viewBox="0 0 24 24"')],
 ['scroll compact state preserves touch target',js.includes("classList.toggle('is-compact'")&&js.includes('min-height:46px')]
];
for(const [name,ok] of checks){if(!ok){console.error('FAIL:',name);process.exit(1)}console.log('PASS:',name)}
