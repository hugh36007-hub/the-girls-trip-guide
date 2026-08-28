import fs from 'node:fs';

const js=fs.readFileSync('girls-hero-vault-ux.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const checks=[
 ['hero script loaded',html.includes('/girls-hero-vault-ux.js?v=1')],
 ['hero stylesheet loaded',html.includes('/girls-hero-vault-ux.css?v=1')],
 ['change hero control',js.includes('Change trip hero')],
 ['set hero wording',js.includes('Set as trip hero')],
 ['hidden gallery explicit',js.includes('Open Hidden Gallery')],
 ['server vault session gate',js.includes("rpc('has_active_vault_session'")],
 ['vault privacy copy',js.includes('Nothing stored there is shown on this page')]
];
for(const [name,ok] of checks){if(!ok){console.error(`FAIL: ${name}`);process.exit(1)}console.log(`PASS: ${name}`)}
