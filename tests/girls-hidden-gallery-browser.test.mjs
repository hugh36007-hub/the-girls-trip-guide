import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const harness=path.join(here,'girls-hidden-gallery-browser.html');

function browserPath(){
  const candidates=[
    process.env.CHROME_BIN,
    process.env.CHROMIUM_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  return candidates.find(p=>fs.existsSync(p))||'';
}

function runBrowser(label,size){
  const bin=browserPath();
  assert.ok(bin,'Chromium/Chrome is required for the Hidden Gallery browser regression');
  const url=pathToFileURL(harness).href;
  const args=[
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--allow-file-access-from-files',
    `--window-size=${size}`,
    '--virtual-time-budget=33000',
    '--dump-dom',
    url
  ];
  const out=spawnSync(bin,args,{encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024});
  assert.equal(out.status,0,`${label} Chromium failed: ${out.stderr||out.stdout}`);
  assert.match(out.stdout,/data-test-result="PASS"/,`${label} browser interaction regression failed:\n${out.stdout}\n${out.stderr}`);
  assert.match(out.stdout,/data-vault-opens="2"/,`${label} should produce exactly two successful Hidden Gallery opens`);
  assert.match(out.stdout,/data-evidence-clicks="1"/,`${label} should preserve normal Evidence navigation after hold suppression`);
}

test('Girls Hidden Gallery desktop Chromium interaction',()=>runBrowser('desktop','1280,800'));
test('Girls Hidden Gallery mobile Chromium interaction',()=>runBrowser('mobile','390,844'));
