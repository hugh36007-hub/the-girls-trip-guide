// Web Report and Block for trip photos and videos, run in a real browser against a stubbed backend.
// Covers gallery cards, the Hidden Gallery, the mobile viewer tray, the Home photo and the native no-op.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const root=process.cwd();
const chrome=[process.env.CHROME_BIN,process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(fs.existsSync);
if(!chrome)throw Error('Chrome is required for the media safety browser test.');

const ME='11111111-1111-4111-8111-111111111111',ANNA='22222222-2222-4222-8222-222222222222',BEA='33333333-3333-4333-8333-333333333333',TRIP='44444444-4444-4444-8444-444444444444';
const MEDIA=[
 {id:'m-mine',created_by:ME,mime_type:'image/jpeg',album:'evidence',storage_path:'p/mine.jpg',thumbnail_path:'t/mine.webp',file_name:'mine.jpg',created_at:'2026-10-02T10:00:00Z',visibility_state:'visible'},
 {id:'m-anna',created_by:ANNA,mime_type:'image/jpeg',album:'evidence',storage_path:'p/anna.jpg',thumbnail_path:'t/anna.webp',file_name:'anna.jpg',created_at:'2026-10-03T10:00:00Z',visibility_state:'visible'},
 {id:'m-bea',created_by:BEA,mime_type:'video/mp4',album:'evidence',storage_path:'p/bea.mp4',thumbnail_path:'t/bea.webp',file_name:'bea.mp4',created_at:'2026-10-01T10:00:00Z',visibility_state:'visible'}
];

// Minimal supabase-js stand-in: chainable, awaitable queries answered from the fixtures above.
const stub=`
window.__posts=[];window.__dialogs=[];window.__backClicks=0;
window.confirm=m=>{window.__dialogs.push(m);return window.__confirm!==false};
window.prompt=m=>{window.__dialogs.push(m);return window.__reason===undefined?'It is not appropriate':window.__reason};
const MEDIA=${JSON.stringify(MEDIA)};
function answer(table,filters,single,newestFirst){
 let rows=[];
 if(table==='media'){rows=MEDIA.filter(r=>filters.every(([kind,col,val])=>kind==='in'?val.map(String).includes(String(r[col])):kind==='like'?String(r[col]).startsWith(String(val).replace('%','')):kind==='eq'&&col in r?String(r[col])===String(val):true))}
 if(newestFirst)rows=[...rows].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 if(table==='profiles')rows=[{display_name:'Me Myself'}];
 if(table==='trips')rows=[{name:'Lisbon 2027',owner_id:'${ANNA}'}];
 return {data:single?(rows[0]||null):rows,error:null};
}
function query(table){
 const filters=[];let single=false,newestFirst=false;
 const q={select:()=>q,order:(c,o)=>{newestFirst=c==='created_at'&&o?.ascending===false;return q},limit:()=>q,not:()=>q,eq:(c,v)=>{filters.push(['eq',c,v]);return q},in:(c,v)=>{filters.push(['in',c,v]);return q},like:(c,v)=>{filters.push(['like',c,v]);return q},maybeSingle:()=>{single=true;return q},single:()=>{single=true;return q},then:(ok,no)=>Promise.resolve(answer(table,filters,single,newestFirst)).then(ok,no)};
 return q;
}
const session={user:{id:'${ME}',email:'me@example.test'},access_token:'token'};
const client={auth:{getSession:async()=>({data:{session}}),getUser:async()=>({data:{user:session.user}})},from:query,rpc:()=>query('rpc'),storage:{from:()=>({createSignedUrl:async p=>({data:{signedUrl:'/signed/'+p},error:null})})},channel:()=>({on(){return this},subscribe(){return this}}),removeChannel(){}};
window.supabase={createClient:()=>client};
const realFetch=window.fetch;
window.fetch=async(url,init)=>{if(String(url).includes('/functions/v1/girls-contact-email')){window.__posts.push({url:String(url),headers:init.headers,body:JSON.parse(init.body)});return new Response(JSON.stringify({ok:true}),{status:200,headers:{'Content-Type':'application/json'}})}return realFetch(url,init)};
`;
const tile=m=>`<div class="media">${m.mime_type.startsWith('video/')?`<video data-media-id="${m.id}"></video>`:`<img data-media-id="${m.id}" alt="${m.file_name}">`}<div class="media-tools">${m.created_by===ME?`<button data-delete-media="${m.id}">Delete</button>`:''}</div></div>`;
const page=`<!doctype html><meta charset="utf-8"><title>media safety</title>
<div id="toast"></div>
<div id="app"><main class="dashboard" data-home-composition="full">
 <section class="hero-card live-snapshot-hero" data-live-snapshot="1" data-full-hero-owner="girls-app-v2"><button class="live-photo-open"></button></section>
 <section class="panel active" data-panel="evidence"><div class="gallery">${MEDIA.map(tile).join('')}</div></section>
</main></div>
<div id="modalRoot"><div class="modal"><div class="gallery">
 <div class="media" data-gtg-vault-media="v-anna" data-gtg-uploader="${ANNA}"><img src="" alt=""></div>
 <div class="media" data-gtg-vault-media="v-mine" data-gtg-uploader="${ME}"><img src="" alt=""><div class="media-tools"><button data-a="deleteVaultMedia" data-id="v-mine">Delete</button></div></div>
</div></div></div>
<script>${stub}</script>`;

const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname==='/create-trip'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(url.searchParams.get('native')?page.replace('<script>','<script>window.GTG_NATIVE=true;'):page);return}
 const file=path.join(root,path.basename(url.pathname));
 if(/^\/[a-z0-9-]+\.(js|css)$/.test(url.pathname)&&fs.existsSync(file)){res.writeHead(200,{'Content-Type':url.pathname.endsWith('.css')?'text/css':'application/javascript'});res.end(fs.readFileSync(file));return}
 res.writeHead(404);res.end();
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;

const port=9700+Math.floor(Math.random()*200),profile=fs.mkdtempSync(path.join(os.tmpdir(),'gtg-media-safety-'));
let stderr='';
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,`--remote-debugging-port=${port}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
proc.stderr?.on('data',d=>stderr=(stderr+String(d)).slice(-8000));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function target(){for(let i=0;i<300;i++){if(proc.exitCode!==null)throw Error(`Chrome exited before DevTools started (${proc.exitCode}). ${stderr}`);try{const r=await fetch(`http://127.0.0.1:${port}/json/list`);if(r.ok){const p=(await r.json()).find(x=>x.type==='page');if(p)return p}}catch{}await wait(100)}throw Error(`Chrome unavailable ${stderr}`)}
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),pending=new Map();let id=0;ws.onopen=()=>resolve({call(method,params={}){return new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}))})},close(){ws.close()}});ws.onerror=reject;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(m.error.message)):p.res(m.result)}}})}
async function evalJs(c,expression){const r=await c.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
const load=(c,...scripts)=>evalJs(c,`(async()=>{for(const src of ${JSON.stringify(scripts)})await new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(Error('could not load '+src));document.head.appendChild(s)});await new Promise(r=>setTimeout(r,400));return true})()`);
const open=async(c,query='')=>{await c.call('Page.navigate',{url:`${origin}/create-trip?trip_id=${TRIP}${query}`});await wait(350)};
const cards=`[...document.querySelectorAll('[data-panel="evidence"] .gallery > .media')].map(t=>({id:t.querySelector('[data-media-id]').dataset.mediaId,shown:t.getClientRects().length>0,buttons:[...t.querySelectorAll('.media-tools button')].map(b=>b.textContent)}))`;

try{
 const c=await connect((await target()).webSocketDebuggerUrl);
 await c.call('Runtime.enable');await c.call('Page.enable');

 // 1. Gallery cards and Hidden Gallery: controls on other people's media only.
 await open(c);await evalJs(c,'localStorage.clear();true');await load(c,'/girls-media-safety.js');
 let out=await evalJs(c,`({cards:${cards},vault:[...document.querySelectorAll('#modalRoot .media')].map(t=>[...t.querySelectorAll('.media-tools button')].map(b=>b.textContent))})`);
 assert.deepEqual(out.cards,[{id:'m-mine',shown:true,buttons:['Delete']},{id:'m-anna',shown:true,buttons:['Report','Block']},{id:'m-bea',shown:true,buttons:['Report','Block']}],'gallery cards must offer Report and Block on other members\' media only');
 assert.deepEqual(out.vault,[['Report','Block'],['Delete']],'Hidden Gallery must offer Report and Block on other members\' media only');

 // 2. Report: one email to the support intake carrying the media, trip and both user ids.
 out=await evalJs(c,`(async()=>{document.querySelector('[data-gtg-safety-report="m-anna"]').click();await new Promise(r=>setTimeout(r,250));return {posts:window.__posts,toast:document.getElementById('toast').textContent,cards:${cards}}})()`);
 assert.equal(out.posts.length,1,'a report must send exactly one request');
 const post=out.posts[0];
 assert.match(post.url,/\/functions\/v1\/girls-contact-email$/);
 assert.equal(post.body.category,'safety-report');assert.equal(post.body.email,'me@example.test');assert.equal(post.body.name,'Me Myself');assert.equal(post.body.tripName,'Lisbon 2027');assert.equal(post.body.website,'');
 for(const line of ['Reason: It is not appropriate','Content type: trip-media','Content ID: m-anna',`Trip ID: ${TRIP}`,`Uploaded by user ID: ${ANNA}`,`Reported by user ID: ${ME}`,'Content: anna.jpg'])assert(post.body.message.includes(line),`report must include "${line}"`);
 assert.match(out.toast,/Report received/);
 assert(out.cards.every(card=>card.shown),'reporting must not hide anything');
 out=await evalJs(c,`(async()=>{window.__reason='  ';document.querySelector('[data-gtg-safety-report="m-bea"]').click();await new Promise(r=>setTimeout(r,150));window.__reason=undefined;return window.__posts.length})()`);
 assert.equal(out,1,'a report with no reason must not be sent');

 // 3. Block: cancel does nothing; confirm hides that uploader everywhere and survives a reload.
 out=await evalJs(c,`(async()=>{window.__confirm=false;document.querySelector('[data-gtg-safety-block="m-anna"]').click();await new Promise(r=>setTimeout(r,250));window.__confirm=true;return {stored:localStorage.getItem('gtg-native-blocked-users-v1'),cards:${cards}}})()`);
 assert.equal(out.stored,null,'a cancelled block must store nothing');assert(out.cards.every(card=>card.shown));
 out=await evalJs(c,`(async()=>{document.querySelector('[data-gtg-safety-block="m-anna"]').click();await new Promise(r=>setTimeout(r,350));return {stored:JSON.parse(localStorage.getItem('gtg-native-blocked-users-v1')),cards:${cards},vault:[...document.querySelectorAll('#modalRoot .media')].map(t=>t.getClientRects().length>0),notices:[...document.querySelectorAll('[data-gtg-blocked-notice] span')].map(n=>n.textContent),blocked:window.GTGMediaSafety.isBlocked('${ANNA}'),other:window.GTGMediaSafety.isBlocked('${BEA}')}})()`);
 assert.deepEqual(out.stored,[ANNA]);assert.equal(out.blocked,true);assert.equal(out.other,false);
 assert.deepEqual(out.cards.map(card=>[card.id,card.shown]),[['m-mine',true],['m-anna',false],['m-bea',true]],'blocking must hide only that uploader\'s gallery media');
 assert.deepEqual(out.vault,[false,true],'blocking must hide that uploader in the Hidden Gallery');
 assert.equal(out.notices.length,2);assert.match(out.notices[0],/^1 photo or video from people you blocked is hidden on this device\.$/);
 await open(c);await load(c,'/girls-media-safety.js');
 out=await evalJs(c,cards);
 assert.deepEqual(out.map(card=>card.shown),[true,false,true],'the block must survive a reload');

 // 4. Home photo leaves out blocked uploaders: the newest photo is Anna's, who is blocked here.
 await load(c,'/girls-live-dashboard-hero.js');
 out=await evalJs(c,`document.querySelector('.live-photo-open img')?.getAttribute('src')||''`);
 assert.equal(out,'/signed/t/mine.webp','Home photo must skip blocked uploaders');

 // 5. Unblock restores everything.
 out=await evalJs(c,`(async()=>{document.querySelector('[data-gtg-safety-unblock]').click();await new Promise(r=>setTimeout(r,350));return {stored:localStorage.getItem('gtg-native-blocked-users-v1'),cards:${cards},notices:document.querySelectorAll('[data-gtg-blocked-notice]').length}})()`);
 assert.equal(out.stored,'[]');assert(out.cards.every(card=>card.shown),'unblocking must show the media again');assert.equal(out.notices,0);

 // 6. Mobile viewer tray: Report and Block on someone else's media, not on your own; Block closes the viewer.
 await open(c);await evalJs(c,'localStorage.clear();true');await load(c,'/girls-media-safety.js','/girls-media-social.js');
 const tray=id=>evalJs(c,`(async()=>{let host=document.querySelector('.gtg-immersive-media-host');if(!host){host=document.createElement('div');host.className='gtg-immersive-media-host';const shadow=host.attachShadow({mode:'open'});shadow.innerHTML='<div class="viewer"><button class="back"></button></div>';shadow.querySelector('.back').addEventListener('click',()=>window.__backClicks++);document.body.appendChild(host);await new Promise(r=>setTimeout(r,500))}const row=MEDIA.find(r=>r.id==='${id}');host.dispatchEvent(new CustomEvent('gtg:viewer-media-change',{detail:{mediaId:row.id,row}}));await new Promise(r=>setTimeout(r,200));const t=host.shadowRoot.querySelector('.gtg-social-tray');return {labels:[...t.querySelectorAll('button')].map(b=>b.textContent),five:t.classList.contains('native'),columns:getComputedStyle(t).gridTemplateColumns.split(' ').length}})()`);
 out=await tray('m-mine');
 assert.deepEqual(out,{labels:['Delete','Hide','Comment'],five:false,columns:3},'the viewer must not offer Report or Block on your own media');
 out=await tray('m-bea');
 assert.deepEqual(out,{labels:['Delete','Hide','Comment','Report','Block'],five:true,columns:5},'the viewer must offer Report and Block on someone else\'s media in one row');
 out=await evalJs(c,`(async()=>{const t=document.querySelector('.gtg-immersive-media-host').shadowRoot.querySelector('.gtg-social-tray');window.__confirm=false;t.querySelector('[data-native-media-block]').click();await new Promise(r=>setTimeout(r,150));const cancelled=window.__backClicks;window.__confirm=true;t.querySelector('[data-native-media-block]').click();await new Promise(r=>setTimeout(r,300));return {cancelled,closed:window.__backClicks,stored:JSON.parse(localStorage.getItem('gtg-native-blocked-users-v1')),cards:${cards}}})()`);
 assert.equal(out.cancelled,0,'a cancelled block must leave the viewer open');assert.equal(out.closed,1,'blocking must close the viewer');
 assert.deepEqual(out.stored,[BEA]);assert.deepEqual(out.cards.map(card=>card.shown),[true,true,false]);

 // 7. Inside the native shell this file stays out of the way; the shell has its own bridge.
 await open(c,'&native=1');await load(c,'/girls-media-safety.js');
 out=await evalJs(c,`({bridge:typeof window.GTGMediaSafety,buttons:document.querySelectorAll('[data-gtg-safety-report],[data-gtg-safety-block]').length})`);
 assert.deepEqual(out,{bridge:'undefined',buttons:0},'the website safety layer must not run in the native shell');

 c.close();
 console.log('PASS: web media Report and Block (gallery, Hidden Gallery, viewer tray, Home photo, native no-op).');
}finally{
 proc.kill('SIGKILL');server.close();try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
