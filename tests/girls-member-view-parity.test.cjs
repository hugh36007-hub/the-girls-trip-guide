const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('girls-member-view-parity.js','utf8');
const loader=fs.readFileSync('girls-critical-style-loader.js','utf8');

assert(loader.includes('/girls-member-view-parity.js?v=1'),'member parity guard must load on the private trip shell');
assert(source.includes("q.from('trip_members').select('id,user_id,name,role,created_at')"),'member parity context must fetch only non-admin crew profile fields');
assert(!source.includes("trip_members').select('id,user_id,name,email"),'member parity context must not request crew email addresses');
assert(!source.includes('passport_confirmed'),'member parity context must not request passport administration state');
assert(source.includes("if(/passport/i.test(label))span.remove()"),'member views must remove passport summary widgets added by other layers');
assert(source.includes("panel.querySelector('.balance-grid')?.remove()"),'member Money must remove the group-wide balance/ledger presentation');
assert(source.includes("person=>person.member_id===ctx.member.id"),'payment requests must be scoped to the signed-in member');
assert(source.includes("<div class=\"eyebrow\">What I owe</div>"),'member Money must show the member personal position');
assert(source.includes("<div class=\"eyebrow\">What is owed to me</div>"),'member Money must preserve personal credits without exposing peer balances');
assert(source.includes('data-gtg-readonly-profile'),'group members must retain a read-only profile interaction');
assert(source.includes('data-gtg-member-uploads'),'group contribution totals must remain useful Evidence navigation');
assert(source.includes("setText(card.querySelector('.crew-id small')"),'crew cards must replace the core email/passport/balance metadata for members');
assert(source.includes("stat.querySelector(':scope>small')"),'Home Money summary must be member-scoped');

console.log('Girls member view parity contract passed.');
