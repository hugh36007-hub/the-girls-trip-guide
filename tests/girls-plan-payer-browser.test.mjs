import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const harness=path.join(here,'girls-plan-payer-browser.html');

function browserPath(){
 const candidates=[process.env.CHROME_BIN,process.env.CHROMIUM_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
 return candidates.find(p=>fs.existsSync(p))||'';
}

test('Girls mobile Plan payer picker commits selection and closes',()=>{
 const bin=browserPath();
 assert.ok(bin,'Chromium/Chrome is required for the Plan payer browser regression');
 const out=spawnSync(bin,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files',
  '--window-size=390,844','--virtual-time-budget=2500','--dump-dom',pathToFileURL(harness).href
 ],{encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
 assert.equal(out.status,0,`Plan payer Chromium failed: ${out.stderr||out.stdout}`);
 assert.match(out.stdout,/data-test-result="PASS"/,`Plan payer interaction failed:\n${out.stdout}\n${out.stderr}`);
 assert.match(out.stdout,/data-payer-value="filiz"/,'Filiz must be written to the real payer select');
 assert.match(out.stdout,/data-payer-label="Filiz"/,'Visible payer trigger must update to Filiz');
 assert.match(out.stdout,/data-menu-hidden="true"/,'Payer list must close immediately after selection');
});
