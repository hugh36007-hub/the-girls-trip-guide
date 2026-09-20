const fs=require('node:fs');
const assert=require('node:assert/strict');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const parity=fs.readFileSync('girls-product-parity.js','utf8');
const tour=fs.readFileSync('girls-dashboard-tour.js','utf8');
const report=fs.readFileSync('girls-trip-issue-report.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');

assert(app.includes('<b>GALS communications</b><small>Choose characters, reminders and message controls</small>'),'core paid drawer must expose one clear GALS entry');
assert(app.includes('<b>Trip details</b><small>Edit the trip name, destination and dates</small>'),'Trip details drawer copy missing');
assert(app.includes('<b>Trip appearance</b><small>Change the trip hero image</small>'),'Trip appearance drawer copy missing');
assert(app.includes('<b>My details</b><small>Edit your name, mobile and address</small>'),'My details drawer copy missing');
assert(app.includes('<b>Switch trip</b><small>Open a different Girls trip</small>'),'Switch trip drawer copy missing');

assert(parity.includes("if(state.paid&&coreComms){existing?.remove();return}"),'paid parity layer must defer to the core GALS drawer entry');
assert(!parity.includes("state.paid?'<b>GALS communications</b>"),'parity layer must not inject a second paid GALS entry');
assert(parity.includes("<b>Trip reminders</b><small>View the seven standard reminders included with Free</small>"),'Free reminder drawer entry must remain');

assert(tour.includes("const list=drawer.querySelector('.drawer-list')"),'Show me around must live inside the drawer list');
assert(tour.includes("<b>Show me around</b><small>Replay the dashboard guide</small>"),'Show me around must be a normal labelled drawer row');
assert(tour.includes("report=list.querySelector('[data-a=\"reportIssue\"],[data-action=\"report-issue\"]')"),'tour replay must order before launch/support actions');

assert(report.includes("payload.set('productKey','girls')"),'Girls issue reports must be attributed to Girls');
assert(report.includes('/functions/v1/report-trip-issue'),'Girls issue reporter must use the shared launch-report endpoint');
assert(report.includes('image/heic,image/heif'),'Girls issue reporter must accept iPhone screenshot formats');
assert(report.includes("button.innerHTML='<b>Report an issue</b><small>Tell us what went wrong and attach a screenshot</small>'"),'Report an issue drawer entry copy missing');
assert(report.includes("list.insertBefore(button,safety||signout||null)"),'Report an issue must sit before Safety & reporting');
assert(loader.includes("'/girls-trip-issue-report.js?v=1'"),'Girls issue reporter must load with the drawer bundle');

console.log('Girls drawer and launch-reporting contract OK');
