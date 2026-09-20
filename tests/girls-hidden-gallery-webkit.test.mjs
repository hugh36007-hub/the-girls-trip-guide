import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {webkit} from 'playwright';

const here=path.dirname(fileURLToPath(import.meta.url));
const harness=path.join(here,'girls-hidden-gallery-browser.html');

test('Girls Hidden Gallery real WebKit mobile gesture gate',async()=>{
 const browser=await webkit.launch({headless:true});
 try{
   const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
   const errors=[];
   page.on('pageerror',error=>errors.push(String(error)));
   await page.goto(pathToFileURL(harness).href);
   await page.waitForFunction(()=>document.body.dataset.testResult==='PASS'||document.body.dataset.testResult==='FAIL',null,{timeout:45000});
   const state=await page.evaluate(()=>({
     result:document.body.dataset.testResult,
     vaultOpens:document.body.dataset.vaultOpens,
     evidenceClicks:document.body.dataset.evidenceClicks,
     detail:document.getElementById('result')?.textContent||''
   }));
   assert.equal(state.result,'PASS',state.detail);
   assert.equal(state.vaultOpens,'2','WebKit must trigger the 4-second Hidden Gallery hold exactly twice in the harness');
   assert.equal(state.evidenceClicks,'1','WebKit must preserve the normal Evidence tap after hold suppression');
   assert.deepEqual(errors,[],'WebKit page errors: '+errors.join('\n'));
 }finally{
   await browser.close();
 }
});
