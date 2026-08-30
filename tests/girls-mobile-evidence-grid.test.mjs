import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const chrome=[process.env.CHROME_BIN,process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/opt/google/chrome/chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(fs.existsSync);assert(chrome,'Chrome/Chromium required');
const port=9900+Math.floor(Math.random()*90),profile=fs.mkdtempSync(path.join(os.tmpdir(),'gtg-grid-'));let stderr='';
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,`--remote-debugging-port=${port}`,'about:blank'],{stdio:['ignore','ignore','pipe']});proc.stderr?.on('data',d=>stderr=(stderr+String(d)).slice(-8000));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function target(){for(let i=0;i<120;i++){if(proc.exitCode!==null)throw Error(`Chrome exited before DevTools started (code ${proc.exitCode}). ${stderr}`);for(const endpoint of ['json/list','json']){try{const r=await fetch(`http://127.0.0.1:${port}/${endpoint}`);if(r.ok){const j=await r.json();const page=j.find?.(x=>x.type==='page')||j[0];if(page)return page}}catch{}}await wait(100)}throw Error(`Chrome unavailable ${stderr}`)}
function connect(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url),pending=new Map();let id=0;ws.onopen=()=>resolve({call(method,params={}){return new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}))})},close(){ws.close()}});ws.onerror=reject;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(m.error.message)):p.res(m.result)}}})}
async function evalJs(c,expression){const r=await c.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
try{
 const t=await target(),c=await connect(t.webSocketDebuggerUrl);await c.call('Runtime.enable');await c.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:false});
 const pixel='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
 const cards=Array.from({length:6},(_,i)=>`<article class="media"><img data-media-id="g${i}" src="${pixel}"><div class="media-tools"><button data-delete-media="g${i}">Delete</button></div></article>`).join('');
 await evalJs(c,`document.documentElement.style.background='#000';document.body.style.cssText='margin:0;background:#000';document.body.innerHTML='<section data-panel="evidence" style="width:calc(100% - 24px);margin:0 auto"><div class="gallery">${cards}</div></section>';`);
 await evalJs(c,fs.readFileSync(path.join(root,'girls-mobile-evidence-grid.js'),'utf8'));await wait(160);
 const result=await evalJs(c,`(()=>{const g=document.querySelector('.gtg-mobile-media-grid'),tiles=[...g.children],gs=getComputedStyle(g),gr=g.getBoundingClientRect();return{count:tiles.length,cols:gs.gridTemplateColumns.trim().split(/\\s+/).length,gap:parseFloat(gs.columnGap),gridWidth:gr.width,viewport:innerWidth,tools:document.querySelectorAll('.media-tools').length,tiles:tiles.map(t=>{const p=t.querySelector('.gtg-mobile-media-primary'),ic=t.querySelector('.gtg-grid-media-icon'),tr=t.getBoundingClientRect(),pr=p?.getBoundingClientRect(),cr=ic?.getBoundingClientRect(),cs=getComputedStyle(t),ps=p?getComputedStyle(p):null;return{ratio:tr.width/tr.height,radius:cs.borderRadius,childCount:t.children.length,fill:pr&&Math.abs(pr.width-tr.width)<1&&Math.abs(pr.height-tr.height)<1,fit:ps?.objectFit,mediaId:p?.dataset.mediaId||'',iconText:ic?.textContent||'',iconRight:cr?Math.round(tr.right-cr.right):null,iconBottom:cr?Math.round(tr.bottom-cr.bottom):null}})}})()`);
 assert.equal(result.count,6);assert.equal(result.cols,3);assert(Math.abs(result.gap-1)<.1);assert(Math.abs(result.gridWidth-result.viewport)<1.5);assert.equal(result.tools,0);
 for(const tile of result.tiles){assert(Math.abs(tile.ratio-.75)<.015);assert.equal(tile.radius,'0px');assert.equal(tile.childCount,2);assert(tile.fill);assert.equal(tile.fit,'cover');assert(tile.mediaId);assert(!/\d/.test(tile.iconText));assert(tile.iconRight>=5&&tile.iconRight<=7);assert(tile.iconBottom>=5&&tile.iconBottom<=7)}
 console.log('PASS Girls mobile Evidence grid: 3x portrait, full-bleed, 1px gap, square corners, no card chrome, lower-right icon without numbers');c.close();
}finally{proc.kill('SIGKILL');try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
