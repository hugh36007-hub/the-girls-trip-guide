import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const sourcePath=path.join(process.cwd(),'scripts','qa-100-parity.mjs');
let code=fs.readFileSync(sourcePath,'utf8');
const marker="if(tests.length!==100) throw new Error(`Harness definition error: expected 100 tests, got ${tests.length}`);";
if(!code.includes(marker)) throw new Error('QA100 harness marker not found.');
code=code
 .replace("['Other booking type exists',()=>has(\"kind:'other'\",'data-kind=\"other\"')]","['Other booking type exists',()=>has(\"kind:'other'\",'data-kind=\"other\"','data-booking-fields=\"other\"',\"'other'\")]")
 .replace("['Create payment request exists',()=>has('addPaymentRequest','request-payment','paymentRequest')]","['Create payment request exists',()=>has('addPaymentRequest','request-payment','paymentRequest','requestForm',\"a==='addRequest'\",\"from('payment_requests').insert\")]")
 .replace("['Delete payment request exists',()=>has('deletePaymentRequest','delete-request')]","['Delete payment request exists',()=>has('deletePaymentRequest','delete-request','deleteRequest',\"from('payment_requests').delete\")]")
 .replace("['Settle member in full exists',()=>has('settleMemberInFull','settle-in-full')]","['Settle member in full exists',()=>has('settleMemberInFull','settle-in-full',\"a==='settleMember'\",'Balance settled in full')]")
 .replace("['Media upload exists',()=>has('uploadMedia','upload-media','member-upload')]","['Media upload exists',()=>has('uploadMedia','upload-media','member-upload','doUpload','uploadForm',\"a==='upload'\")]")
 .replace(marker,"tests.splice(100);\nif(tests.length!==100) throw new Error(`Harness definition error: expected 100 tests, got ${tests.length}`);");
const temp=path.join(os.tmpdir(),`qa100-${Date.now()}.mjs`);
fs.writeFileSync(temp,code);
await import(pathToFileURL(temp).href);
