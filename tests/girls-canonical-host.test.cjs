// Sign-in and the support form only work on the apex origin, so the pages that use
// them must send www visitors to the apex before anything else runs.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
for(const page of ['create-trip.html','contact.html']){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert(scripts.length,`${page} has no scripts`);
  const [,attrs,code]=scripts[0];
  assert(!/\bsrc=/.test(attrs)&&code.includes("www.thegirlstripguide.com"),`${page}: the www redirect must be the first script on the page`);
  assert(html.indexOf(scripts[0][0])<html.indexOf('<link'),`${page}: the www redirect must run before stylesheets and other resources load`);
  const visit=href=>{const u=new URL(href);let target=null;vm.runInNewContext(code,{location:{hostname:u.hostname,pathname:u.pathname,search:u.search,hash:u.hash,replace:value=>{target=value}}});return target};
  assert.strictEqual(visit(`https://www.thegirlstripguide.com/${page.replace('.html','')}?trip_id=abc&action=plan#x=1`),`https://thegirlstripguide.com/${page.replace('.html','')}?trip_id=abc&action=plan#x=1`,`${page}: www must go to the same path, query and fragment on the apex`);
  for(const host of ['thegirlstripguide.com','the-girls-trip-guide.pages.dev','localhost'])assert.strictEqual(visit(`https://${host}/${page}`),null,`${page}: ${host} must not be redirected`);
}
console.log('PASS: app and contact pages send www visitors to the apex origin.');
