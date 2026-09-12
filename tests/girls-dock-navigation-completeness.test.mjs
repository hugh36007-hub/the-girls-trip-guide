import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dockSource=fs.readFileSync(path.join(root,'girls-role-aware-dock.js'),'utf8');
const chrome=[process.env.CHROME_BIN,process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(fs.existsSync);
assert(chrome,'Chrome/Chromium required');
const port=9950+Math.floor(Math.random()*40),profile=fs.mkdtempSync(path.join(os.tmpdir(),'gtg-dock-'));let stderr='';
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,`--remote-debugging-port=${port}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
proc.stderr?.on('data',d=>stderr=(stderr+String(d)).slice(-8000));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function target(){for(let i=0;i<300;i++){if(proc.exitCode!==null)throw Error(`Chrome exited before DevTools started (${proc.exitCode}). ${stderr}`);try{const r=await fetch(`http://127.0.0.1:${port}/json/list`);if(r.ok){const j=await r.json();const page=j.find(x=>x.type==='page');if(page)return page}}catch{}await wait(100)}throw Error(`Chrome unavailable ${stderr}`)}
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),pending=new Map();let id=0;ws.onopen=()=>resolve({call(method,params={}){return new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}))})},close(){ws.close()}});ws.onerror=reject;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(m.error.message)):p.res(m.result.value??m.result)}}})}
async function evalJs(c,expression){const r=await c.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
const baseDock=`<nav class="dock"><button data-tab="overview"><span>⌂</span><small>Overview</small></button><button data-tab="plan"><span>✦</span><small>Plan</small></button><button data-tab="money"><span>£</span><small>Money</small></button><button data-tab="evidence"><span>▣</span><small>Evidence</small></button><button data-tab="group"><span>●</span><small>Group</small></button></nav>`;
try{
 const t=await target(),c=await connect(t.webSocketDebuggerUrl);await c.call('Runtime.enable');await c.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:false});
 await evalJs(c,`document.body.innerHTML='<div id="app"></div>';true`);
 await evalJs(c,dockSource);await wait(80);
 for(const role of ['owner','member']){
   await evalJs(c,`document.getElementById('app').innerHTML='<main class="dashboard" data-trip-role="${role}"></main>'+${JSON.stringify(baseDock)};true`);await wait(100);
   const result=await evalJs(c,`(()=>{const d=document.querySelector('nav.dock');const buttons=[...d.querySelectorAll(':scope>button')];return{tabs:buttons.map(b=>b.dataset.tab||''),labels:buttons.map(b=>b.querySelector('.dock-label')?.textContent||b.querySelector('small')?.textContent||''),count:buttons.length,moneyIndex:buttons.findIndex(b=>b.dataset.tab==='money'),uploadCount:d.querySelectorAll('[data-role-upload]').length,cols:getComputedStyle(d).gridTemplateColumns.trim().split(/\\s+/).filter(Boolean).length}})()`);
   assert.deepEqual(result.tabs,['overview','plan','money','group','evidence'],`${role} dock destinations changed: ${result.tabs.join(',')}`);
   assert.deepEqual(result.labels,['Home','Plan','Money','Group','Evidence'],`${role} dock labels changed`);
   assert.equal(result.count,5,`${role} dock must contain five destinations`);
   assert.equal(result.moneyIndex,2,`${role} Money must remain the centre destination`);
   assert.equal(result.uploadCount,0,`${role} dock must not replace Money with Upload`);
   assert.equal(result.cols,5,`${role} dock must render five mobile columns`);
 }
 console.log('PASS Girls dock navigation: owner and member both render Home, Plan, Money, Group, Evidence');c.close();
}finally{proc.kill('SIGKILL');try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
