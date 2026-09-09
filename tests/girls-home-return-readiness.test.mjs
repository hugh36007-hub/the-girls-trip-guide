import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const loader=fs.readFileSync(path.join(root,'girls-performance-loader.js'),'utf8');
const chrome=[process.env.CHROME_BIN,process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(fs.existsSync);
assert(chrome,'Chrome/Chromium required');
assert.match(loader,/async function openHome\(target=null\)/,'one Home readiness entry function required');
assert.match(loader,/homeTab&&isFull\(\)/,'Full-only Home click gate required');
assert.match(loader,/gtgHomeReady/,'post-readiness Home click must bypass once');

const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gtg-home-return-')),debugPort=11600+Math.floor(Math.random()*300);let stderr='';
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,`--remote-debugging-port=${debugPort}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
proc.stderr?.on('data',d=>stderr=(stderr+String(d)).slice(-8000));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function target(){for(let i=0;i<400;i++){if(proc.exitCode!==null)throw Error(`Chrome exited ${proc.exitCode}: ${stderr}`);try{const r=await fetch(`http://127.0.0.1:${debugPort}/json`);if(r.ok){const p=(await r.json()).find(x=>x.type==='page');if(p)return p}}catch{}await wait(100)}throw Error(`Chrome unavailable: ${stderr}`)}
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),pending=new Map();let id=0;ws.onopen=()=>resolve({call(method,params={}){return new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}))})},close(){ws.close()}});ws.onerror=reject;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(m.error.message)):p.res(m.result)}}})}
async function evalJs(c,expression){const r=await c.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
function instrument(){return loader.replace("const action=()=>new URL(location.href).searchParams.get('action')||'overview';","const action=()=> 'evidence';").replace("const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';","const tripId=()=> 'test-trip';").replace("location.assign('/create-trip');","void 0;");}
async function setPage(c,mode){
 const html=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body><div id="app"><main class="dashboard" data-home-composition="${mode}"><section class="panel" data-panel="overview"><button data-tab="overview">Home</button><div class="hero-card live-snapshot-hero" data-live-snapshot="1" data-full-hero-owner="girls-app-v2"></div></section><section class="panel active" data-panel="evidence">Evidence</section></main></div></body>`;
 await c.call('Page.setDocumentContent',{frameId:(await c.call('Page.getFrameTree')).frameTree.frame.id,html});
 await evalJs(c,`window.__events=[];window.GTGCritical={ensureHomeAssets:()=>new Promise(resolve=>setTimeout(()=>{window.__events.push('home-assets');resolve()},80))};document.addEventListener('click',e=>{if(e.target.closest?.('[data-tab="overview"]')){window.__events.push('activate');document.querySelector('[data-panel=evidence]').classList.remove('active');document.querySelector('[data-panel=overview]').classList.add('active')}});`);
 await evalJs(c,instrument());
}
try{
 const t=await target(),c=await connect(t.webSocketDebuggerUrl);await c.call('Runtime.enable');await c.call('Page.enable');await c.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true,screenWidth:390,screenHeight:844});
 await setPage(c,'full');await evalJs(c,"document.querySelector('[data-tab=overview]').click()");await wait(30);
 let out=await evalJs(c,"({events:window.__events.slice(),home:document.querySelector('[data-panel=overview]').classList.contains('active')})");
 assert.equal(out.home,false,'Full Home must not activate while Home assets are pending');
 await wait(120);out=await evalJs(c,"({events:window.__events.slice(),home:document.querySelector('[data-panel=overview]').classList.contains('active')})");
 assert.equal(out.home,true,'Full Home must activate after readiness');assert(out.events.indexOf('home-assets')<out.events.indexOf('activate'),'Full Home assets must be ready before activation');

 await c.call('Page.navigate',{url:'about:blank'});await wait(100);await setPage(c,'free');await evalJs(c,"document.querySelector('[data-tab=overview]').click()");await wait(20);
 out=await evalJs(c,"({events:window.__events.slice(),home:document.querySelector('[data-panel=overview]').classList.contains('active')})");
 assert.equal(out.home,true,'Free Home must retain synchronous existing navigation');assert(!out.events.includes('home-assets'),'Free must not invoke Full Home asset readiness');
 console.log('PASS Girls Home return: Evidence to Full Home waits for authoritative assets; Free unchanged');c.close();
}finally{proc.kill('SIGKILL');try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
