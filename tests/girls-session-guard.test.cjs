const fs=require('fs');
const src=fs.readFileSync('girls-session-guard.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const checks=[
 ['guard loaded after app core',html.includes('/girls-session-guard.js?v=2')&&html.indexOf('girls-app-v2.js')<html.indexOf('girls-session-guard.js')],
 ['guard does not bootstrap Home UI',!src.includes('GTG_HOME_SOCIAL_V3_BOOTSTRAP')&&!src.includes('girls-home-scoreboard-fit.js')],
 ['runtime loader owns Home UI',loader.includes('/girls-home-social-hub-v3.js?v=20260908-4')&&loader.includes('/girls-home-scoreboard-fit.js?v=20260908-3')],
 ['auth change subscription',src.includes('auth.onAuthStateChange')],
 ['focus reconciliation',src.includes("window.addEventListener('focus'")&&src.includes('visibilitychange')&&src.includes("window.addEventListener('pageshow'")],
 ['live user is server confirmed',src.includes('auth.getUser()')],
 ['identity mismatch reloads',src.includes('if(nextId!==renderedUserId)reloadForIdentityChange()')],
 ['hero changes verify current owner',src.includes('async function ownerPreflight()')&&src.includes(".eq('product_key','girls')")&&src.includes('data-a="setMediaHero"')],
 ['media delete verifies uploader or owner',src.includes('async function mediaDeletePreflight(mediaId)')&&src.includes('row.created_by!==user.id&&trip.owner_id!==user.id')],
 ['hidden media delete protected',src.includes('data-a="deleteVaultMedia"')],
 ['hero and vault setup submits protected',src.includes("['heroForm','setPinForm']")&&src.includes('form.requestSubmit')],
 ['safe replay avoids duplicate guard',src.includes('gtgSessionGuardBypass')&&src.includes('stopImmediatePropagation')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);
console.log('Girls session guard contract OK');
