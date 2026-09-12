const fs=require('node:fs');
const assert=require('node:assert/strict');

const app=fs.readFileSync('girls-app-v2.js','utf8');
const dock=fs.readFileSync('girls-role-aware-dock.js','utf8');
const loader=fs.readFileSync('girls-critical-style-loader.js','utf8');

assert(!loader.includes('/girls-member-view-parity.js'),'legacy member DOM rewriter must remain retired');
assert(app.includes("function tripRole(){if(isOwner())return 'owner';return currentMember()?.status==='confirmed'?'member':'denied'}"),'core must resolve owner, exact confirmed member, otherwise denied');
assert(app.includes('data-trip-role="${role}"'),'core must publish the authenticated role independently');
assert(app.includes('data-home-composition="${paid()?\'full\':\'free\'}"'),'entitlement composition must remain separate from role');
assert(dock.includes("const role=document.querySelector('.dashboard')?.dataset.tripRole||''"),'dock must consume the core role');
assert(!dock.includes('.trip-title span')&&!dock.includes("dockButton(dock,'money'))rememberedRole"),'dock must not infer role from copy or navigation controls');
assert(dock.includes("decorate(money,'money','Money','Money')")&&dock.includes('const wanted=[overview,plan,money,group,evidence]'),'owner and member navigation must both retain Money in the complete five-item dock');
assert(!dock.includes('memberUploadButton')&&!dock.includes('data-role-upload'),'member navigation must not replace Money with an Upload-only control');
assert(app.includes('data-a="addExpense"')&&app.includes('data-a="editBooking"')&&app.includes('data-a="invite"'),'owner capabilities must remain present behind core owner checks');

console.log('Girls member role/view contract passed.');
