const fs=require('fs');
const js=fs.readFileSync('girls-role-aware-dock.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const checks=[
 ['role-aware dock is explicitly loaded',html.includes('girls-role-aware-dock.js')],
 ['shared five-position order',js.includes('const wanted=[overview,plan,centre,group,evidence]')],
 ['owner centre is Money',js.includes("centre=dockButton(dock,'money')")],
 ['member centre is Upload',js.includes("<small>Upload</small>")&&js.includes('data-role-upload')],
 ['member upload uses existing uploader',js.includes("document.querySelector('[data-a=\"upload\"]')")],
 ['free member falls back to Evidence',js.includes("button[data-tab=\"evidence\"]")]
];
for(const [name,ok] of checks){if(!ok){console.error('FAIL:',name);process.exit(1)}console.log('PASS:',name)}
