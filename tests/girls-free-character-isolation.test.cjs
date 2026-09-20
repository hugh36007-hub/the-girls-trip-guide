const fs=require('fs');
const assert=require('assert');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const overview=app.match(/function panelOverview\(\)\{[\s\S]*?\nfunction panelPlan\(\)/)?.[0]||'';

assert(overview,'panelOverview source missing');
assert(overview.includes("tripNote=paid()?'<div class=\"grace-note\""),'Grace must be rendered only through the paid overview branch');
assert(overview.includes('gtg-free-trip-note'),'Free overview needs a neutral product-owned status note');
assert(overview.includes('Your plan, money, group and travel documents stay together here.'),'Free overview neutral copy missing');
assert(!/tripNote='[^']*Grace/.test(overview),'Free overview must not default to a GALS character');
assert(overview.includes('gtg-free-trip-note\" style=\"grid-template-columns:1fr'),'Free status note must not reserve empty portrait space');

console.log('Girls Free character isolation: PASS');
