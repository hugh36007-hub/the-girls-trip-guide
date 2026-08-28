const fs=require('fs');
const js=fs.readFileSync('girls-hero-vault-ux.js','utf8');
for(const [name,needle] of [
 ['overview change hero button','Change trip hero'],
 ['evidence set hero label','Set as trip hero'],
 ['trip appearance action','data-a="tripAppearance"'],
 ['hero click support','gtg-editable-hero']
]){if(!js.includes(needle)){console.error('FAIL:',name);process.exit(1)}console.log('PASS:',name)}
