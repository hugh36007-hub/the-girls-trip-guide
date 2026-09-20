import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const appRaw=fs.readFileSync(path.join(root,'girls-app-v2.js'),'utf8');
const feedback=fs.readFileSync(path.join(root,'girls-action-feedback.js'),'utf8');
const guard=fs.readFileSync(path.join(root,'girls-session-guard.js'),'utf8');
const chrome=[process.env.CHROME_BIN,process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(fs.existsSync);
assert(chrome,'Chrome/Chromium required');

const bootMarker="window.addEventListener('popstate',boot);boot();";
assert(appRaw.includes(bootMarker),'core boot marker changed');
const appSource=appRaw.replace(bootMarker,"window.__GTGCoreTest={S,vaultModal,renderVault,loadVaultState,closeModal};");

const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gtg-vault-controller-'));
const debugPort=11900+Math.floor(Math.random()*300);
let stderr='';
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,`--remote-debugging-port=${debugPort}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
proc.stderr?.on('data',d=>stderr=(stderr+String(d)).slice(-8000));

const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function target(){for(let i=0;i<400;i++){if(proc.exitCode!==null)throw Error(`Chrome exited ${proc.exitCode}: ${stderr}`);try{const r=await fetch(`http://127.0.0.1:${debugPort}/json`);if(r.ok){const p=(await r.json()).find(x=>x.type==='page');if(p)return p}}catch{}await wait(100)}throw Error(`Chrome unavailable: ${stderr}`)}
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),pending=new Map();let id=0;ws.onopen=()=>resolve({call(method,params={}){return new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}))})},close(){ws.close()}});ws.onerror=reject;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(m.error.message)):p.res(m.result)}}})}
async function evalJs(c,expression){const r=await c.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}

const fakeBackend=String.raw`
window.__calls=[];
window.__configured=false;
window.__active=false;
window.__currentUserId='owner';
function __query(data=[]){
 const q={
   select(){return q},eq(){return q},in(){return q},update(){return q},insert(){return q},delete(){return q},order(){return Promise.resolve({data,error:null})},
   maybeSingle(){return Promise.resolve({data:null,error:null})},single(){return Promise.resolve({data:null,error:null})},
   then(resolve,reject){return Promise.resolve({data,error:null}).then(resolve,reject)}
 };
 return q;
}
window.__client={
 auth:{
   getUser:async()=>({data:{user:window.__currentUserId?{id:window.__currentUserId}:null},error:null}),
   getSession:async()=>({data:{session:{access_token:'test'}}}),
   onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),
   signOut:async()=>({})
 },
 from:()=>__query([]),
 storage:{from:()=>({createSignedUrl:async()=>({data:{signedUrl:''},error:null}),remove:async()=>({error:null}),upload:async()=>({error:null})})},
 rpc:async(name,args)=>{
   window.__calls.push({name,args:{...args}});
   if(name==='vault_is_configured')return {data:window.__configured,error:null};
   if(name==='has_active_vault_session')return {data:window.__active,error:null};
   if(name==='set_vault_pin'){
     if(!/^\\d{4}$/.test(String(args?.p_pin||'')))return {data:false,error:{message:'invalid pin'}};
     window.__configured=true;window.__active=false;return {data:true,error:null};
   }
   if(name==='unlock_vault'){
     const ok=window.__configured&&String(args?.p_pin)==='1234';
     window.__active=ok;return {data:ok,error:null};
   }
   if(name==='lock_vault'){window.__active=false;return {data:true,error:null};}
   return {data:true,error:null};
 }
};
window.supabase={createClient:()=>window.__client};
window.__GTG_FX_FIXED_BOOTSTRAP__=true;
`;

test('Girls core Hidden Gallery setup, unlock, crew and busy-state browser path',async()=>{
 let c;
 try{
   const t=await target();c=await connect(t.webSocketDebuggerUrl);await c.call('Runtime.enable');await c.call('Page.enable');
   await c.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true,screenWidth:390,screenHeight:844});
   const frame=(await c.call('Page.getFrameTree')).frameTree.frame.id;
   await c.call('Page.setDocumentContent',{frameId:frame,html:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body><div id="app"></div><div id="modalRoot"></div><div id="drawerRoot"></div><div id="toast"></div><script data-gtg-member-expenses></script><script data-gtg-resend-core></script></body>'});
   await evalJs(c,fakeBackend);
   await evalJs(c,feedback);
   await evalJs(c,appSource);
   await evalJs(c,guard);
   await evalJs(c,`Object.assign(window.__GTGCoreTest.S,{user:{id:'owner'},trip:{id:'trip-1',owner_id:'owner'},entitlements:[{entitlement:'full_trip',active:true}],members:[{id:'m-owner',user_id:'owner',status:'confirmed',name:'Owner'},{id:'m-crew',user_id:'crew',status:'confirmed',name:'Crew'}]});`);

   let out=await evalJs(c,`(async()=>{await window.GTGVault.open();return {modals:document.querySelectorAll('#modalRoot .modal').length,title:document.querySelector('#modalRoot h2')?.textContent,setup:!!document.querySelector('#setPinForm'),pattern:document.querySelector('#setPinForm input')?.getAttribute('pattern'),min:document.querySelector('#setPinForm input')?.minLength,max:document.querySelector('#setPinForm input')?.maxLength}})()`);
   assert.deepEqual(out,{modals:1,title:'Set your Hidden Gallery PIN',setup:true,pattern:'[0-9]{4}',min:4,max:4});

   out=await evalJs(c,`(async()=>{const f=document.querySelector('#setPinForm'),i=f.elements.pin;i.value='123';f.querySelector('button.primary').click();await new Promise(r=>setTimeout(r,50));return {setCalls:window.__calls.filter(x=>x.name==='set_vault_pin').length,unlockCalls:window.__calls.filter(x=>x.name==='unlock_vault').length,valid:i.checkValidity()}})()`);
   assert.deepEqual(out,{setCalls:0,unlockCalls:0,valid:false},'three digits must be rejected before RPC');

   out=await evalJs(c,`(async()=>{const f=document.querySelector('#setPinForm'),i=f.elements.pin;i.value='12345';f.querySelector('button.primary').click();await new Promise(r=>setTimeout(r,50));return {setCalls:window.__calls.filter(x=>x.name==='set_vault_pin').length,unlockCalls:window.__calls.filter(x=>x.name==='unlock_vault').length,valid:i.checkValidity()}})()`);
   assert.deepEqual(out,{setCalls:0,unlockCalls:0,valid:false},'five digits must be rejected before RPC');

   out=await evalJs(c,`(async()=>{const f=document.querySelector('#setPinForm');f.elements.pin.value='1234';f.querySelector('button.primary').click();await new Promise(r=>setTimeout(r,120));return {calls:window.__calls.filter(x=>['set_vault_pin','unlock_vault'].includes(x.name)),gallery:document.querySelector('#modalRoot')?.textContent.includes('Nothing hidden yet.'),secondPin:!!document.querySelector('#unlockForm'),configured:window.__GTGCoreTest.S.vaultConfigured,unlocked:window.__GTGCoreTest.S.vaultUnlocked}})()`);
   assert.equal(out.calls.length,2);assert.equal(out.calls[0].name,'set_vault_pin');assert.equal(out.calls[1].name,'unlock_vault');assert.equal(out.calls[0].args.p_pin,'1234');assert.equal(out.calls[1].args.p_pin,'1234');
   assert.equal(out.gallery,true,'gallery must open immediately after setup');assert.equal(out.secondPin,false,'organiser must not be asked for the PIN twice');assert.equal(out.configured,true);assert.equal(out.unlocked,true);

   out=await evalJs(c,`(async()=>{document.querySelector('[data-a="vaultLock"]').click();await new Promise(r=>setTimeout(r,80));await window.GTGVault.open();const f=document.querySelector('#unlockForm');f.elements.pin.value='9999';f.querySelector('button.primary').click();await new Promise(r=>setTimeout(r,100));const afterWrong={error:document.getElementById('toast').textContent,busy:f.dataset.actionBusy||'',disabled:f.querySelector('button.primary').disabled,responsive:2+2};f.elements.pin.value='1234';f.querySelector('button.primary').click();await new Promise(r=>setTimeout(r,120));return {afterWrong,gallery:document.querySelector('#modalRoot')?.textContent.includes('Nothing hidden yet.'),wrong:window.__calls.filter(x=>x.name==='unlock_vault'&&x.args.p_pin==='9999').length,correct:window.__calls.filter(x=>x.name==='unlock_vault'&&x.args.p_pin==='1234').length}})()`);
   assert.match(out.afterWrong.error,/Incorrect PIN/);assert.equal(out.afterWrong.busy,'','wrong PIN must not leave the form busy');assert.equal(out.afterWrong.disabled,false,'wrong PIN must re-enable submit');assert.equal(out.afterWrong.responsive,4);assert.equal(out.wrong,1);assert.ok(out.correct>=2);assert.equal(out.gallery,true);

   out=await evalJs(c,`(async()=>{window.__configured=false;window.__active=false;window.__currentUserId='crew';Object.assign(window.__GTGCoreTest.S,{user:{id:'crew'},vaultConfigured:false,vaultUnlocked:false});window.__GTGCoreTest.closeModal();await window.GTGVault.open();return {copy:document.querySelector('#modalRoot')?.textContent,setup:!!document.querySelector('#setPinForm'),unlock:!!document.querySelector('#unlockForm')}})()`);
   assert.match(out.copy,/organiser has not set the Hidden Gallery PIN yet/i);assert.equal(out.setup,false);assert.equal(out.unlock,false);

   out=await evalJs(c,`(async()=>{window.__configured=true;window.__active=false;window.__GTGCoreTest.closeModal();await window.GTGVault.open();const f=document.querySelector('#unlockForm');const before={setup:!!document.querySelector('#setPinForm'),unlock:!!f};f.elements.pin.value='1234';f.querySelector('button.primary').click();await new Promise(r=>setTimeout(r,120));return {before,gallery:document.querySelector('#modalRoot')?.textContent.includes('Nothing hidden yet.')}})()`);
   assert.deepEqual(out.before,{setup:false,unlock:true},'crew can only unlock an already-configured gallery');assert.equal(out.gallery,true);

   out=await evalJs(c,`(async()=>{window.__GTGCoreTest.closeModal();window.__active=false;window.__GTGCoreTest.S.vaultUnlocked=false;await window.GTGVault.open();const one=document.querySelectorAll('#modalRoot .modal').length;window.__GTGCoreTest.closeModal();await window.GTGVault.open();const two=document.querySelectorAll('#modalRoot .modal').length;return {one,two}})()`);
   assert.deepEqual(out,{one:1,two:1},'repeated opens must not duplicate the modal');

   console.log('PASS Girls core Hidden Gallery setup/unlock/crew/browser controller');
 }finally{
   c?.close();proc.kill('SIGKILL');try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
 }
});
