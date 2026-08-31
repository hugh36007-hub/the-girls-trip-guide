const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('contact.html','utf8');
const client=fs.readFileSync('girls-contact.js','utf8');
const fn=fs.readFileSync('supabase/functions/girls-contact-email/index.ts','utf8');

assert(html.includes('id="contact-form"'),'Girls support form id missing');
assert(html.includes('name="attachment"'),'Girls support attachment input missing');
assert(html.includes('girls-contact.js?v=1'),'Girls backend support client is not loaded');
assert(!html.includes('Open email to Neville'),'Legacy mailto submit must not return');
assert(client.includes('/functions/v1/girls-contact-email'),'Girls support client endpoint missing');
assert(client.includes('10 * 1024 * 1024'),'Girls support attachment limit missing');
assert(fn.includes("'Access-Control-Allow-Origin':'https://thegirlstripguide.com'"),'Girls support CORS must be site-scoped');
assert(fn.includes("db.from('contact_enquiries')"),'Girls support enquiries must be persisted');
assert(fn.includes("db.rpc('girls_resend_api_key')"),'Girls support must use the restricted Girls Resend key');
assert(fn.includes('Too many messages from this connection'),'Girls support rate limit missing');
assert(fn.includes('validMagic'),'Girls support attachment magic-byte validation missing');
console.log('Girls backend support contract: PASS');
