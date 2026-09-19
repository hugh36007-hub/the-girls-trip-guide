const fs=require('fs');
const app=fs.readFileSync('girls-app-v2.js','utf8');
const ux=fs.readFileSync('girls-hero-vault-ux.js','utf8');
const checks=[
 ['evidence loads only evidence album', app.includes(".eq('album','evidence')")],
 ['vault loads only vault album', app.includes(".eq('album','vault')")],
 ['vault signs from vault bucket', app.includes("signPath('btg-vault'")],
 ['vault upload targets vault album', app.includes("doUpload(d.getAll('files'),'vault')")],
 ['vault requires server session for sensitive actions', ux.includes("rpc('has_active_vault_session'")]
];
for(const [name,ok] of checks){if(!ok){console.error('FAIL:',name);process.exit(1)}console.log('PASS:',name)}
