const fs=require('fs');
const js=fs.readFileSync('girls-role-aware-dock.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const checks=[
 ['role-aware dock v3 is explicitly loaded',html.includes('girls-role-aware-dock.js?v=3')],
 ['shared five-position order',js.includes('const wanted=[overview,plan,centre,group,evidence]')],
 ['owner centre is Money',js.includes('data-role-money')&&js.includes("decorate(centre,who==='owner'?'money':'upload'")],
 ['role detection consumes the authoritative core role',js.includes("dataset.tripRole")&&!js.includes('.trip-title span')&&!js.includes("dockButton(dock,'money'))rememberedRole")],
 ['member centre is Upload',js.includes('data-role-upload')&&js.includes("decorate(centre,who==='owner'?'money':'upload'")],
 ['member upload uses existing uploader',js.includes("document.querySelector('[data-a=\"upload\"]')")],
 ['free member falls back to Evidence',js.includes('button[data-tab="evidence"]')],
 ['vector icon set is installed',js.includes('const ICONS=')&&js.includes('<svg viewBox="0 0 24 24"')],
 ['scroll compact state preserves touch target',js.includes("classList.toggle('is-compact'")&&js.includes('min-height:46px')]
 ,['core role is identity-based and confirmed-member-only',app.includes("function tripRole(){if(isOwner())return 'owner';return currentMember()?.status==='confirmed'?'member':'denied'}")]
 ,['core publishes role separately from entitlement',app.includes('data-trip-role="${role}"')&&app.includes('data-home-composition="${paid()?\'full\':\'free\'}"')]
];
for(const [name,ok] of checks){if(!ok){console.error('FAIL:',name);process.exit(1)}console.log('PASS:',name)}
