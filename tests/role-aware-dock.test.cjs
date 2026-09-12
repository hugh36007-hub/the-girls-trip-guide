const fs=require('fs');
const js=fs.readFileSync('girls-role-aware-dock.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const checks=[
 ['role-aware dock is explicitly loaded',html.includes('girls-role-aware-dock.js?v=3')],
 ['shared five-position order keeps Money',js.includes('const wanted=[overview,plan,money,group,evidence]')],
 ['Money is decorated as the centre navigation item',js.includes("decorate(money,'money','Money','Money')")],
 ['Money is present for both organiser and member roles',js.includes("money=dockButton(dock,'money')||moneyButton()")&&!js.includes("who==='owner'?'money':'upload'")],
 ['member dock no longer substitutes Upload for Money',!js.includes('data-role-upload')&&!js.includes('memberUploadButton')],
 ['core dashboard exposes the Money panel',app.includes('data-panel="money"')&&app.includes("['overview','plan','money','evidence','group']")],
 ['core role is identity-based and confirmed-member-only',app.includes("function tripRole(){if(isOwner())return 'owner';return currentMember()?.status==='confirmed'?'member':'denied'}")],
 ['core publishes role separately from entitlement',app.includes('data-trip-role="${role}"')&&app.includes('data-home-composition="${paid()?\'full\':\'free\'}"')],
 ['vector icon set is installed',js.includes('const ICONS=')&&js.includes('<svg viewBox="0 0 24 24"')],
 ['scroll compact state preserves touch target',js.includes("classList.toggle('is-compact'")&&js.includes('min-height:46px')]
];
for(const [name,ok] of checks){if(!ok){console.error('FAIL:',name);process.exit(1)}console.log('PASS:',name)}
