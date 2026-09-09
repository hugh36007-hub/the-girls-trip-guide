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

assert.match(loader,/evidenceFull:\[/,'Full Evidence bundle must be explicit');
assert.match(loader,/evidenceFree:\[/,'Free Evidence bundle must be explicit');
assert.match(loader,/const composition=\(\)=>document\.querySelector\('\.dashboard'\)\?\.dataset\.homeComposition\|\|''/,'authoritative composition state must gate Evidence loading');
assert.match(loader,/if\(mode==='full'\)await loadBundle\('evidenceFull'\)/,'Full bundle must require Full composition');
assert.match(loader,/else if\(mode==='free'\)await loadBundle\('evidenceFree'\)/,'Free bundle must require Free composition');
assert.match(loader,/if\(picker&&isFull\(\)\)[\s\S]*location\.assign\('\/create-trip'\)/,'leaving a Full dashboard must use a hard navigation boundary');
assert.doesNotMatch(loader,/girls-mobile-evidence-grid\.js/,'legacy Evidence DOM rewriter must not load');
assert.match(loader,/evidenceFull:\['\/girls-evidence-core-grid\.css\?v=1'\]/,'Full Evidence grid styling must be a Full-only style bundle');

const fullOnly=['/girls-vault-contract-fix.js?v=2','/girls-hidden-upload-choice.js?v=1','/girls-media-performance-max.js?v=2','/girls-media-ux-plus.js?v=2','/girls-evidence-parity.js?v=2','/girls-media-quality-fix.js?v=5','/girls-media-readiness.js?v=3','/girls-direct-photo-viewer.js?v=5','/girls-gallery-no-zoom.js?v=1','/girls-media-flow-refinement.js?v=2','/girls-media-social.js?v=1','/video-thumbnail-fix.js?v=1'];
const freeOnly=['/girls-evidence-light-corner-fix.js?v=20260907-1','/girls-free-evidence-upsell-restore.js?v=20260908-1','/girls-convince-copy-v2.js?v=20260907-1'];
const fullStyle='/girls-evidence-core-grid.css?v=1';
const instrumented=loader.replace("location.assign('/create-trip');","window.__hardResetCalls=(window.__hardResetCalls||0)+1;").replace("const action=()=>new URL(location.href).searchParams.get('action')||'overview';","const action=()=> 'evidence';").replace("const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';","const tripId=()=> 'test-trip';");

const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gtg-evidence-isolation-')),debugPort=10700+Math.floor(Math.random()*200);let stderr='';
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,`--remote-debugging-port=${debugPort}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
proc.stderr?.on('data',d=>stderr=(stderr+String(d)).slice(-8000));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function target(){for(let i=0;i<500;i++){if(proc.exitCode!==null)throw Error(`Chrome exited before DevTools started (code ${proc.exitCode}). ${stderr}`);try{const r=await fetch(`http://127.0.0.1:${debugPort}/json`);if(r.ok){const pages=await r.json(),p=pages.find(x=>x.type==='page')||pages[0];if(p)return p}}catch{}await wait(100)}throw Error(`Chrome unavailable. ${stderr}`)}
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),pending=new Map();let id=0;ws.onopen=()=>resolve({call(method,params={}){return new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}))})},close(){ws.close()}});ws.onerror=reject;ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.rej(Error(msg.error.message)):p.res(msg.result)}}})}
async function evaluate(client,expression){const r=await client.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
async function setPage(client,mode){
 const html=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body><div id="app"><main class="dashboard" data-home-composition="${mode}"><section class="panel active" data-panel="evidence"><button data-tab="evidence">Evidence</button><button data-a="picker">Switch trip</button>${mode==='full'?'<button data-a="upload">Upload</button>':'<div class="card upgrade">Free Evidence</div>'}</section></main></div></body>`;
 await client.call('Page.setDocumentContent',{frameId:(await client.call('Page.getFrameTree')).frameTree.frame.id,html});
 await evaluate(client,`window.__requested=[];window.__styleRequested=[];window.__pickerBubble=0;window.__hardResetCalls=0;const bodyAppend=document.body.appendChild.bind(document.body);document.body.appendChild=function(node){if(node?.tagName==='SCRIPT'&&node.dataset?.gtgDeferred==='1'){window.__requested.push(node.getAttribute('src'));node.removeAttribute('src');const out=bodyAppend(node);queueMicrotask(()=>node.onload?.());return out}return bodyAppend(node)};const headAppend=document.head.appendChild.bind(document.head);document.head.appendChild=function(node){if(node?.tagName==='LINK'&&node.dataset?.gtgDeferredStyle==='1'){window.__styleRequested.push(node.getAttribute('href'));node.removeAttribute('href');const out=headAppend(node);queueMicrotask(()=>node.onload?.());return out}return headAppend(node)};document.addEventListener('click',e=>{if(e.target.closest?.('[data-a="picker"]'))window.__pickerBubble++});`);
 await evaluate(client,instrumented);
 await wait(900);
}

try{
 const pageTarget=await target(),client=await connect(pageTarget.webSocketDebuggerUrl);await client.call('Runtime.enable');await client.call('Page.enable');await client.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true,screenWidth:390,screenHeight:844});
 await setPage(client,'full');
 const full=await evaluate(client,'({requested:window.__requested.slice(),styles:window.__styleRequested.slice(),composition:document.querySelector(\'.dashboard\')?.dataset.homeComposition})');
 assert.equal(full.composition,'full');for(const src of fullOnly)assert(full.requested.includes(src),`Full must load ${src}`);for(const src of freeOnly)assert(!full.requested.includes(src),`Full must not load Free-only ${src}`);assert(full.requested.includes('/evidence-intro-dismiss.js?v=3'),'Full must retain the shared dismissible Evidence guide');assert(full.styles.includes(fullStyle),'Full must load the core-owned mobile Evidence grid style');
 await evaluate(client,"document.querySelector('[data-a=picker]').click()");await wait(80);const fullExit=await evaluate(client,'({hard:window.__hardResetCalls,bubble:window.__pickerBubble})');assert.equal(fullExit.hard,1,'Full picker must invoke the hard reset boundary');assert.equal(fullExit.bubble,0,'Full picker must not continue into the SPA switch handler');

 await client.call('Page.navigate',{url:'about:blank'});await wait(200);const clean=await evaluate(client,"({loader:typeof window.__GTG_PERFORMANCE_LOADER__,fullClasses:document.querySelectorAll('.gtg-mobile-media-tile,.gtg-optimistic').length,fullStyles:document.querySelectorAll('[id^=gtg-media],[id^=gtg-mobile-evidence],[id^=gtg-evidence-parity]').length})");assert.equal(clean.loader,'undefined','hard navigation must clear the prior Full loader runtime');assert.equal(clean.fullClasses,0);assert.equal(clean.fullStyles,0);

 await setPage(client,'free');
 const free=await evaluate(client,'({requested:window.__requested.slice(),styles:window.__styleRequested.slice(),composition:document.querySelector(\'.dashboard\')?.dataset.homeComposition})');
 assert.equal(free.composition,'free');for(const src of fullOnly)assert(!free.requested.includes(src),`Free must never load Full-only ${src}`);for(const src of freeOnly)assert(free.requested.includes(src),`Free must retain ${src}`);assert(free.requested.includes('/evidence-intro-dismiss.js?v=3'),'Free must retain the existing shared Evidence guide');assert(!free.styles.includes(fullStyle),'Free must never load Full Evidence grid styling');
 await evaluate(client,"document.querySelector('[data-a=picker]').click()");await wait(80);const freeExit=await evaluate(client,'({hard:window.__hardResetCalls,bubble:window.__pickerBubble})');assert.equal(freeExit.hard,0,'Free picker must not use the Full reset boundary');assert.equal(freeExit.bubble,1,'Free picker click must continue to the existing Free handler path');
 console.log('PASS Girls Evidence isolation: mobile Chromium Full/Free bundles and Full exit reset');client.close();
}finally{proc.kill('SIGKILL');try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
