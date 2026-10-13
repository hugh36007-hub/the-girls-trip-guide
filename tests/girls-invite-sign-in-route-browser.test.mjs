// Invite Step B, website side: what the real Girls app does with the sign-in route that
// girls-accept-invite sends existing accounts to (/create-trip?join=1&code=…&person=…&invite=signin).
// Runs girls-app-v2.js in a real browser against a stubbed backend.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const root=process.cwd();
const chrome=[process.env.CHROME_BIN,process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(fs.existsSync);
if(!chrome)throw Error('Chrome is required for the invite sign-in route browser test.');

const TRIP='44444444-4444-4444-8444-444444444444',ROUTE='join=1&code=ABCD1234&person=Invited+Person&invite=signin';
// Minimal supabase-js stand-in. window.__user is the signed-in account (null = signed out);
// window.__join decides what join_girls_trip_by_code answers.
const stub=`
window.__calls=[];window.__otpRequests=[];
window.__user=new URL(location.href).searchParams.get('as')?{id:'user-1',email:'invited.person@example.test'}:null;
function query(){const q={select:()=>q,eq:()=>q,in:()=>q,not:()=>q,order:()=>q,limit:()=>q,maybeSingle:()=>Promise.resolve({data:null,error:null}),single:()=>Promise.resolve({data:null,error:null}),then:(ok,no)=>Promise.resolve({data:[],error:null}).then(ok,no)};return q}
const client={
 auth:{getUser:async()=>({data:{user:window.__user},error:null}),getSession:async()=>({data:{session:window.__user?{access_token:'t',user:window.__user}:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({}),
  verifyOtp:async args=>{window.__calls.push({name:'verifyOtp',args});window.__user={id:'user-1',email:args.email};return {data:{user:window.__user,session:{access_token:'t'}},error:null}}},
 from:()=>query(),storage:{from:()=>({createSignedUrl:async()=>({data:{signedUrl:''},error:null})})},channel:()=>({on(){return this},subscribe(){return this}}),removeChannel(){},
 rpc:async(name,args)=>{window.__calls.push({name,args});if(name==='join_girls_trip_by_code'){if(window.__join==='refused')return {data:null,error:{message:'This email has not been invited to this trip.'}};if(window.__join==='stale')return {data:null,error:null};return {data:'${TRIP}',error:null}}return {data:null,error:null}}
};
window.supabase={createClient:()=>client};
const realFetch=window.fetch;
window.fetch=async(url,init)=>{if(String(url).includes('/functions/v1/girls-auth-otp')){window.__otpRequests.push(JSON.parse(init.body));return new Response(JSON.stringify({ok:true}),{status:200,headers:{'Content-Type':'application/json'}})}return realFetch(url,init)};
`;
const page=`<!doctype html><meta charset="utf-8"><title>invite sign-in route</title><div id="app"></div><div id="modalRoot"></div><div id="drawerRoot"></div><div id="toast"></div><script>${stub}</script><script src="/girls-app-v2.js"></script>`;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname==='/create-trip'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(page);return}
 if(url.pathname==='/girls-app-v2.js'){res.writeHead(200,{'Content-Type':'application/javascript'});res.end(fs.readFileSync(path.join(root,'girls-app-v2.js')));return}
 res.writeHead(404);res.end();
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;

const port=9900+Math.floor(Math.random()*90),profile=fs.mkdtempSync(path.join(os.tmpdir(),'gtg-invite-route-'));
let stderr='';
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,`--remote-debugging-port=${port}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
proc.stderr?.on('data',d=>stderr=(stderr+String(d)).slice(-8000));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function target(){for(let i=0;i<300;i++){if(proc.exitCode!==null)throw Error(`Chrome exited before DevTools started (${proc.exitCode}). ${stderr}`);try{const r=await fetch(`http://127.0.0.1:${port}/json/list`);if(r.ok){const p=(await r.json()).find(x=>x.type==='page');if(p)return p}}catch{}await wait(100)}throw Error(`Chrome unavailable ${stderr}`)}
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),pending=new Map();let id=0;ws.onopen=()=>resolve({call(method,params={}){return new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}))})},close(){ws.close()}});ws.onerror=reject;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(m.error.message)):p.res(m.result)}}})}
async function evalJs(c,expression){const r=await c.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
const open=async(c,query)=>{await c.call('Page.navigate',{url:`${origin}/create-trip?${query}`});await wait(500)};
const modal=`(()=>{const m=document.querySelector('#modalRoot .modal');return m?{title:m.querySelector('h2').textContent,text:[...m.querySelectorAll('p')].map(p=>p.textContent).join(' | '),form:m.querySelector('form')?.id||'',fields:Object.fromEntries([...m.querySelectorAll('input:not([type=hidden])')].map(i=>[i.name,i.value]))}:null})()`;
const submit=id=>`(async()=>{document.getElementById('${id}').requestSubmit();await new Promise(r=>setTimeout(r,350));return {modal:${modal},toast:document.getElementById('toast').textContent,search:location.search,calls:window.__calls.filter(c=>c.name==='join_girls_trip_by_code'||c.name==='verifyOtp')}})()`;
const NOTICE=/You already have an account\. Sign in with the email this invitation was sent to and the trip will be added\./;

try{
 const c=await connect((await target()).webSocketDebuggerUrl);
 await c.call('Runtime.enable');await c.call('Page.enable');

 // 1. Signed out on the sign-in route: told to sign in, and nothing about the invited address is filled in.
 await open(c,ROUTE);
 let out=await evalJs(c,modal);
 assert.equal(out.title,'Join a trip');assert.equal(out.form,'emailForm');assert.match(out.text,NOTICE);assert.deepEqual(out.fields,{email:''},'the invited address must not be filled in');

 // 2. Signing in with the emailed code leads to the join form, filled from the route; joining attaches the trip.
 out=await evalJs(c,`(async()=>{const f=document.getElementById('emailForm');f.elements.email.value='invited.person@example.test';f.requestSubmit();await new Promise(r=>setTimeout(r,350));const sent=window.__otpRequests;const o=document.getElementById('otpForm');o.elements.code.value='12345678';o.requestSubmit();await new Promise(r=>setTimeout(r,450));return {sent,modal:${modal}}})()`);
 assert.deepEqual(out.sent,[{email:'invited.person@example.test'}],'the normal sign-in code request must be used');
 assert.equal(out.modal.form,'joinForm');assert.deepEqual(out.modal.fields,{name:'Invited Person',code:'ABCD1234'},'the join form must be filled from the sign-in route');
 assert.match(out.modal.text,/Your invitation details are filled in\./);
 out=await evalJs(c,submit('joinForm'));
 assert.deepEqual(out.calls.at(-1),{name:'join_girls_trip_by_code',args:{p_code:'ABCD1234',p_name:'Invited Person'}});
 assert.equal(out.search,`?trip_id=${TRIP}`,'a completed join must leave only the trip in the address bar');

 // 3. Already signed in as the invited account: the filled join form appears straight away.
 await open(c,`${ROUTE}&as=invited`);
 out=await evalJs(c,modal);
 assert.equal(out.form,'joinForm');assert.deepEqual(out.fields,{name:'Invited Person',code:'ABCD1234'});

 // 4. Signed in as a different account: the server refuses, the message says why, nothing is attached.
 out=await evalJs(c,`(async()=>{window.__join='refused';return ${submit('joinForm')}})()`);
 assert.equal(out.toast,'This invitation was sent to a different email address. Sign out, then sign in with that address.');
 assert.equal(out.modal?.form,'joinForm','a refused join must leave the form open');assert(!out.search.includes('trip_id'),'a refused join must not open a trip');

 // 5. A trip code that is no longer valid gives a clear message instead of opening a trip called "null".
 out=await evalJs(c,`(async()=>{window.__join='stale';return ${submit('joinForm')}})()`);
 assert.equal(out.toast,'That invite code is not valid any more. Ask the organiser for a fresh invitation.');assert(!out.search.includes('trip_id'));

 // 6. The ordinary "Join a trip" link is unchanged: no account message, empty form.
 await open(c,'join=1');
 out=await evalJs(c,modal);
 assert.equal(out.form,'emailForm');assert.doesNotMatch(out.text,NOTICE);
 await open(c,'join=1&as=someone');
 out=await evalJs(c,modal);
 assert.equal(out.form,'joinForm');assert.deepEqual(out.fields,{name:'',code:''});assert.match(out.text,/Use the private code from the organiser\./);

 // 7. Values from the address bar are shown as text, never as markup.
 await open(c,`join=1&invite=signin&as=x&code=${encodeURIComponent('"><img src=x onerror=window.__xss=1>')}&person=${encodeURIComponent('<b>Eve</b>')}`);
 out=await evalJs(c,`({modal:${modal},xss:window.__xss||0,injected:document.querySelectorAll('#modalRoot img,#modalRoot b').length})`);
 assert.equal(out.xss,0);assert.equal(out.injected,0);assert.equal(out.modal.fields.name,'<b>Eve</b>');

 c.close();
 console.log('PASS: Girls app handles the invitation sign-in route (signed out, sign-in, join, refusal, stale code, plain join link).');
}finally{
 proc.kill('SIGKILL');server.close();try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
