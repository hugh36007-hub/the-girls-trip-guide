const fs=require('fs');
const assert=require('assert');
const js=fs.readFileSync('girls-product-parity.js','utf8');
const css=fs.readFileSync('girls-product-parity.css','utf8');
const polish=fs.readFileSync('girls-inner-page-polish.js','utf8');
assert(js.includes('function addBookingForKind(kind)'),'empty plan categories must open the correctly typed booking form');
assert(js.includes("!state.bookings.some(x=>x.kind===kind)"),'populated plan categories must remain filters');
const html=fs.readFileSync('create-trip.html','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const must=(text,token,label)=>assert(text.includes(token),`Missing ${label||token}`);

// Free product experience.
for(const code of ['F01','F02','F03','F04','F05','F06','F07']) must(js,code,`Free reminder ${code}`);
must(js,'Trip reminders','Free reminders UI');
must(js,'Seven practical reminders','Free reminder explanation');
must(js,"!state.paid&&(a==='settings'||a==='tripAppearance')",'Free paid-feature action guard');
must(js,"text.includes('gals settings')||text.includes('trip appearance')",'Free drawer entitlement guard');

// Overview and navigation parity.
for(const token of ['Next on the plan','State of affairs','Getting started','Message the group','Message history','What I owe']) must(js,token,token);
for(const token of ['data-parity-go="plan"','data-parity-go="money"','data-parity-go="group"','gtg-dock-badge']) must(js,token,token);

// Plan, money and group parity.
for(const token of ['Travel','Accommodation','Local transport','Activities','Other','Invite another','Outstanding requests','Passports checked','Invites pending']) must(js,token,token);

// Mobile Plan/Money presentation has one late authoritative owner.
for(const token of ['gtg-plan-money-mobile-authority','panel[data-panel="money"].active .money-row','padding-bottom:calc(128px + env(safe-area-inset-bottom))','gtg-kind-chooser','gtgMobileKindSource']) must(polish,token,`Plan/Money mobile authority: ${token}`);
must(polish,"appbar.classList.toggle('gtg-inner-appbar'",'inner header route resync');
must(polish,"select.dispatchEvent(new Event('change',{bubbles:true}))",'booking type value bridge');
assert(polish.includes('background:#fff!important'),'Plan/Money mobile light surfaces must override legacy dark refinement');

// Full Trip communications and Evidence parity.
for(const token of ['GALS communications','Who handles the messages?','Automatic routing','The Boss','The Organised One','The Chaos Agent','The Hammer','Payment reminders','Gallery nudges','Post-trip upload reminders']) must(js,token,token);
for(const token of ['Photos','Videos','New · 72h','20 GB','Trip storage']) must(js,token,token);

// Preserve Girls design and keep parity supplementary to the authoritative runtime.
must(html,'girls-app-v2.js','authoritative Girls runtime');
assert(!html.includes('girls-product-parity.css'),'parity stylesheet must not be requested on the Home critical path');
must(loader,'/girls-product-parity.css?v=1','route-lazy parity stylesheet');
assert(/\/girls-product-parity\.js\?v=\d+/.test(loader),'Missing route-lazy parity runtime');
assert(!html.includes('defer src="/girls-product-parity.js'),'parity runtime must not compete with the critical dashboard load');
assert(!js.includes('Coach')&&!js.includes('Freddy')&&!js.includes('Mickey')&&!js.includes('Charlie'),'Boys character identity leaked into Girls parity layer');
assert(css.includes('var(--pink')&&css.includes("'Barlow Condensed'"),'Girls design tokens not reused');
console.log('Girls product parity UI audit PASS');
