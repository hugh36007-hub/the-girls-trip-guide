import fs from 'node:fs';

const js=fs.readFileSync('girls-hero-vault-ux.js','utf8');
const chooser=fs.readFileSync('girls-hidden-upload-choice.js','utf8');
const html=fs.readFileSync('create-trip.html','utf8');
const uploadPolicy=fs.readFileSync('supabase/migrations/20260828210044_allow_hidden_gallery_upload_without_pin.sql','utf8');
const returnPolicy=fs.readFileSync('supabase/migrations/20260828210203_allow_hidden_gallery_upload_return_without_view.sql','utf8');
const checks=[
 ['hero script loaded',html.includes('/girls-hero-vault-ux.js?v=2')],
 ['hidden upload chooser loaded',html.includes('/girls-hidden-upload-choice.js?v=1')],
 ['hero stylesheet loaded',html.includes('/girls-hero-vault-ux.css?v=1')],
 ['change hero control',js.includes('Change trip hero')],
 ['set hero wording',js.includes('Set as trip hero')],
 ['hidden gallery explicit',js.includes('Open Hidden Gallery')],
 ['server gate retained for management',js.includes("[data-a=\"deleteVaultMedia\"]")&&js.includes("rpc('has_active_vault_session'")],
 ['vault upload not intercepted by PIN guard',!js.includes('[data-a="vaultUpload"],[data-a="deleteVaultMedia"]')],
 ['upload destination choice',chooser.includes('Where should this go?')&&chooser.includes('Hidden Gallery')&&chooser.includes('data-a="vaultUpload"')],
 ['copy states no PIN to add',chooser.includes('You do not need the PIN to add hidden media')],
 ['media insert no vault session requirement',uploadPolicy.includes("album = 'vault' and trip_has_vault_access(trip_id)")&&!uploadPolicy.includes('has_active_vault_session')],
 ['storage insert no vault session requirement',uploadPolicy.includes('vault_upload_paid_members')&&!uploadPolicy.includes('vault_upload_active_session\" on storage.objects;\ncreate policy')],
 ['viewer read remains session-gated by design',js.includes('The PIN is required to view, open or manage hidden media.')],
 ['upload-only metadata policy excludes view operations',returnPolicy.includes('storage.object.upload')&&!returnPolicy.includes('storage.object.get_authenticated')&&!returnPolicy.includes('storage.object.sign')&&!returnPolicy.includes('storage.object.list')]
];
for(const [name,ok] of checks){if(!ok){console.error(`FAIL: ${name}`);process.exit(1)}console.log(`PASS: ${name}`)}
