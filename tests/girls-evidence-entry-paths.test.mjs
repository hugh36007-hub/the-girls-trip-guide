import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const loader=fs.readFileSync(path.join(root,'girls-performance-loader.js'),'utf8');
const critical=fs.readFileSync(path.join(root,'girls-critical-style-loader.js'),'utf8');
const chrome=[process.env.CHROME_BIN,process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(fs.existsSync);
assert(chrome,'Chrome/Chromium required');

assert.match(critical,/if\(evidence\(\)\)document\.documentElement\.classList\.add\('gtg-evidence-route-pending'\)/,'direct Evidence must install the pre-paint gate');
assert.match(critical,/gtg-evidence-route-pending[\s\S]*data-home-composition=\\"full\\"[\s\S]*data-panel=\\"evidence\\"/,'direct gate must be Full-only');
assert.match(loader,/async function openEvidence\(target=null\)/,'one async Evidence entry function must own readiness');
assert.match(loader,/await loadRoute\('evidence'\)[\s\S]*classList\.remove\('gtg-evidence-route-pending'\)/,'Evidence must load before the direct gate is released');
assert.match(loader,/evidenceTab&&isFull\(\)/,'Full Evidence clicks must use the readiness gate');
assert.match(loader,/gtgEvidenceReady/,'the synthetic post-load click must bypass the gate exactly once');

const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gtg-evidence-entry-')),debugPort=11200+Math.floor(Math.random()*300);let stderr='';
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,`--remote-debugging-port=${debugPort}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
proc.stderr?.on('data',d=>stderr=(stderr+String(d)).slice(-8000));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function target(){for(let i=0;i<400;i++){if(proc.exitCode!==null)throw Error(`Chrome exited ${proc.exitCode}: ${stderr}`);try{const r=await fetch(`http://127.0.0.1:${debugPort}/json`);if(r.ok){const p=(await r.json()).find(x=>x.type==='page');if(p)return p}}catch{}await wait(100)}throw Error(`Chrome unavailable: ${stderr}`)}
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),pending=new Map();let id=0;ws.onopen=()=>resolve({call(method,params={}){return new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}))})},close(){ws.close()}});ws.onerror=reject;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(m.error.message)):p.res(m.result)}}})}
async function evalJs(c,expression){const r=await c.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}

function instrument(action){return loader
 .replace("const action=()=>new URL(location.href).searchParams.get('action')||'overview';",`const action=()=> '${action}';`)
 .replace("const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';","const tripId=()=> 'test-trip';")
 .replace("location.assign('/create-trip');","window.__hardResetCalls=(window.__hardResetCalls||0)+1;");}
async function page(c,mode,active=false){
 const html=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body><div id="app"><main class="dashboard" data-home-composition="${mode}"><section class="panel ${active?'active':''}" data-panel="evidence"><button data-tab="evidence">Evidence</button>${mode==='free'?'<div class="card upgrade">Free</div>':'<div class="gallery"><div class="media"></div></div>'}</section></main></div></body>`;
 await c.call('Page.setDocumentContent',{frameId:(await c.call('Page.getFrameTree')).frameTree.frame.id,html});
 await evalJs(c,`window.__events=[];window.__styles=[];window.__scripts=[];const ha=document.head.appendChild.bind(document.head);document.head.appendChild=function(n){if(n?.tagName==='LINK'&&n.dataset?.gtgDeferredStyle==='1'){const h=n.getAttribute('href');window.__styles.push(h);window.__events.push('style:'+h);n.removeAttribute('href');const out=ha(n);queueMicrotask(()=>n.onload?.());return out}return ha(n)};const ba=document.body.appendChild.bind(document.body);document.body.appendChild=function(n){if(n?.tagName==='SCRIPT'&&n.dataset?.gtgDeferred==='1'){const s=n.getAttribute('src');window.__scripts.push(s);n.removeAttribute('src');const out=ba(n);queueMicrotask(()=>n.onload?.());return out}return ba(n)};document.addEventListener('click',e=>{if(e.target.closest?.('[data-tab="evidence"]')){window.__events.push('activate');document.querySelector('[data-panel="evidence"]')?.classList.add('active')} });`);
}

try{
 const t=await target(),c=await connect(t.webSocketDebuggerUrl);await c.call('Runtime.enable');await c.call('Page.enable');await c.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true,screenWidth:390,screenHeight:844});

 // Direct refresh: the Full panel is already active, but remains gated until the final grid style/bundle is ready.
 await page(c,'full',true);await evalJs(c,"document.documentElement.classList.add('gtg-evidence-route-pending')");await evalJs(c,instrument('evidence'));await wait(900);
 let out=await evalJs(c,"({pending:document.documentElement.classList.contains('gtg-evidence-route-pending'),styles:window.__styles.slice()})");
 assert.equal(out.pending,false,'direct Full Evidence gate must release after readiness');
 assert(out.styles.includes('/girls-evidence-core-grid.css?v=1'),'direct Full Evidence must load final grid CSS before release');

 // Bottom tab: pointerdown may preload, but activation must still occur only after the final Full style is ready.
 await c.call('Page.navigate',{url:'about:blank'});await wait(120);await page(c,'full',false);await evalJs(c,instrument('overview'));await evalJs(c,"const b=document.querySelector('[data-tab=evidence]');b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));b.click()");await wait(900);
 out=await evalJs(c,"({events:window.__events.slice(),active:document.querySelector('[data-panel=evidence]').classList.contains('active')})");
 assert(out.active,'bottom Evidence tab must activate');
 assert(out.events.indexOf('style:/girls-evidence-core-grid.css?v=1')>=0,'bottom tab must request final grid style');
 assert(out.events.indexOf('style:/girls-evidence-core-grid.css?v=1')<out.events.indexOf('activate'),'bottom tab must not activate before final grid style');

 // Home path: programmatic click has no pointerdown; the click gate must still load the same Full bundle first.
 await c.call('Page.navigate',{url:'about:blank'});await wait(120);await page(c,'full',false);await evalJs(c,instrument('overview'));await evalJs(c,"document.querySelector('[data-tab=evidence]').click()");await wait(900);
 out=await evalJs(c,"({events:window.__events.slice(),active:document.querySelector('[data-panel=evidence]').classList.contains('active')})");
 assert(out.active,'Home programmatic Evidence click must activate');
 assert(out.events.indexOf('style:/girls-evidence-core-grid.css?v=1')>=0,'Home path must request final grid style without pointerdown');
 assert(out.events.indexOf('style:/girls-evidence-core-grid.css?v=1')<out.events.indexOf('activate'),'Home path must not activate before final grid style');

 // Free remains on the existing synchronous path and never requests Full grid styling.
 await c.call('Page.navigate',{url:'about:blank'});await wait(120);await page(c,'free',false);await evalJs(c,instrument('overview'));await evalJs(c,"document.querySelector('[data-tab=evidence]').click()");await wait(120);
 out=await evalJs(c,"({events:window.__events.slice(),styles:window.__styles.slice(),active:document.querySelector('[data-panel=evidence]').classList.contains('active')})");
 assert(out.active,'Free Evidence must retain its existing click path');
 assert(!out.styles.includes('/girls-evidence-core-grid.css?v=1'),'Free must never request Full grid styling');

 console.log('PASS Girls Evidence entry paths: direct, bottom tab, Home programmatic click, Free isolation');c.close();
}finally{proc.kill('SIGKILL');try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
