// CDN integrity contract: every cdn.jsdelivr.net script must load with Subresource Integrity,
// and the CSP must not allow the whole CDN host. Run from the repository root.
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const CDN='https://cdn.jsdelivr.net/';
const SRI=/sha(?:384|512)-[A-Za-z0-9+/]+=*/;
const failures=[];
const check=(name,ok)=>{console.log(`${ok?'PASS':'FAIL'}: ${name}`);if(!ok)failures.push(name)};
const rootFiles=ext=>fs.readdirSync('.').filter(name=>name.endsWith(ext)&&fs.statSync(name).isFile());
const used=new Set();
const attr=(tag,name)=>tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`,'i'))?.[1]||'';

// A pinned npm file that is also installed locally must hash to the declared value.
function installedHash(url){
  const match=url.slice(CDN.length).match(/^npm\/((?:@[^/]+\/)?[^/@]+)@([^/]+)\/(.+)$/);
  if(!match)return null;
  const [,pkg,version,file]=match,dir=`node_modules/${pkg}`;
  try{
    if(JSON.parse(fs.readFileSync(`${dir}/package.json`,'utf8')).version!==version)return null;
    return 'sha384-'+createHash('sha384').update(fs.readFileSync(`${dir}/${file}`)).digest('base64');
  }catch{return null}
}

for(const file of rootFiles('.html')){
  const html=fs.readFileSync(file,'utf8');
  const pinned=new Map();
  for(const [tag] of html.matchAll(/<script\b[^>]*>/gi)){
    const src=attr(tag,'src');
    if(!src.startsWith(CDN))continue;
    used.add(src);
    const integrity=attr(tag,'integrity');
    pinned.set(src,integrity);
    check(`${file}: static ${src} has integrity`,SRI.test(integrity));
    check(`${file}: static ${src} is crossorigin="anonymous"`,/\bcrossorigin=["']anonymous["']/i.test(tag));
    const local=installedHash(src);
    if(local)check(`${file}: integrity matches installed ${src.slice(CDN.length)}`,integrity===local);
  }
  // A preload only helps when it names the same file, hash and CORS mode as the script it serves.
  for(const [tag] of html.matchAll(/<link\b[^>]*>/gi)){
    const href=attr(tag,'href');
    if(!href.startsWith(CDN))continue;
    check(`${file}: preload ${href} matches a pinned script tag`,pinned.has(href)&&attr(tag,'integrity')===pinned.get(href)&&/\bcrossorigin=["']anonymous["']/i.test(tag));
  }
}

for(const file of rootFiles('.js')){
  const js=fs.readFileSync(file,'utf8');
  const urls=[...new Set(js.match(/https:\/\/cdn\.jsdelivr\.net\/[^'"`\s)]+/g)||[])];
  if(!urls.length)continue;
  urls.forEach(url=>used.add(url));
  const hashes=new Set(js.match(new RegExp(SRI.source,'g'))||[]);
  check(`${file}: ${urls.length} dynamic CDN script(s) each declare an integrity hash`,hashes.size>=urls.length&&(js.match(/\.integrity\s*=/g)||[]).length>=urls.length);
  check(`${file}: dynamic CDN script(s) set crossOrigin='anonymous'`,(js.match(/\.crossOrigin\s*=\s*['"]anonymous['"]/g)||[]).length>=urls.length);
  for(const url of urls){const local=installedHash(url);if(local)check(`${file}: integrity matches installed ${url.slice(CDN.length)}`,hashes.has(local))}
}

const csp=fs.readFileSync('_headers','utf8').match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1]||'';
const directives=new Map(csp.split(';').map(part=>part.trim().split(/\s+/)).filter(tokens=>tokens[0]).map(([name,...sources])=>[name,sources]));
const scriptSources=(directives.get('script-src')||[]).filter(source=>source.includes('cdn.jsdelivr.net'));
check('_headers: CSP has a script-src directive',directives.has('script-src'));
check('_headers: script-src does not allow all of cdn.jsdelivr.net',scriptSources.every(source=>/^https:\/\/cdn\.jsdelivr\.net\/[^*]+\.js$/.test(source)));
check('_headers: script-src lists exactly the CDN scripts in use',scriptSources.length===used.size&&scriptSources.every(source=>used.has(source)));
const elsewhere=[...directives].filter(([name,sources])=>name!=='script-src'&&sources.some(source=>source.includes('cdn.jsdelivr.net'))).map(([name])=>name);
check('_headers: no other directive allows cdn.jsdelivr.net',elsewhere.length===0);

if(failures.length){console.error(`\nCDN integrity contract: FAIL (${failures.length})`);process.exit(1)}
console.log(`\nCDN integrity contract: PASS (${used.size} pinned CDN scripts)`);
