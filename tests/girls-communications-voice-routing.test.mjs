import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GIRLS_FIXED_CHARACTERS,
  GIRLS_AUTO_ROUTE,
  GIRLS_VOICE_LIBRARY,
  GIRLS_SUBJECT_LIBRARY,
  resolveGirlsCommunication,
  resolveGirlsVoiceMessage,
  resolveGirlsVoiceSubject,
} from '../supabase/functions/_shared/girls-communications-voices.mjs';

assert.deepEqual(GIRLS_FIXED_CHARACTERS, ['grace','ava','lola','seb']);
for (const character of GIRLS_FIXED_CHARACTERS) {
  assert.equal(GIRLS_VOICE_LIBRARY[character].length, 39, `${character} must have T01-T39 copy`);
  assert.equal(GIRLS_SUBJECT_LIBRARY[character].length, 39, `${character} must have T01-T39 subjects`);
  for (let n=1;n<=39;n++) {
    const code=`T${String(n).padStart(2,'0')}`;
    const resolved=resolveGirlsCommunication(code, character);
    assert.equal(resolved.character, character, `${code} fixed ${character} sender must stay ${character}`);
    assert.equal(resolved.message, resolveGirlsVoiceMessage(code, character), `${code} fixed ${character} copy must match sender`);
    assert.equal(resolved.subject, resolveGirlsVoiceSubject(code, character), `${code} fixed ${character} subject must match sender`);
    assert.ok(resolved.message.length>0, `${code} ${character} must have copy`);
    assert.ok(resolved.subject.length>0, `${code} ${character} must have subject`);
  }
}
for (let n=1;n<=39;n++) {
  const code=`T${String(n).padStart(2,'0')}`;
  const resolved=resolveGirlsCommunication(code, 'grace-auto');
  assert.equal(resolved.character, GIRLS_AUTO_ROUTE[code], `${code} automatic route`);
  assert.equal(resolved.message, resolveGirlsVoiceMessage(code, resolved.character), `${code} automatic copy must match routed sender`);
  assert.equal(resolved.subject, resolveGirlsVoiceSubject(code, resolved.character), `${code} automatic subject must match routed sender`);
}
const payment=resolveGirlsCommunication('T11','grace',{payment:'£42.00',dueDay:'now'});
assert.match(payment.message,/£42\.00/);
assert.ok(!payment.message.includes('{{'), 'payment tokens must never leak');

const processSource=fs.readFileSync(new URL('../supabase/functions/girls-process-communications/index.ts', import.meta.url),'utf8');
assert.match(processSource,/resolveGirlsCommunication\(row\.trigger_code,mode\)/);
assert.match(processSource,/message=resolved\.message\|\|trig\[2\]/);
assert.match(processSource,/emailSubject=resolved\.subject\|\|trig\[0\]/);
assert.match(processSource,/if\(full&&character!==['"]system['"]\)/, 'Free/system path must remain outside Full resolver');

const paymentSource=fs.readFileSync(new URL('../supabase/functions/girls-payment-nudge/index.ts', import.meta.url),'utf8');
assert.match(paymentSource,/resolveGirlsCommunication\(['"]T11['"],mode/);
assert.ok(!paymentSource.includes('FULL_MESSAGES'), 'Payment nudge must not maintain a second character copy table');
assert.match(paymentSource,/emailSubject=resolved\.subject\|\|emailSubject/);

console.log('Girls communications voice routing: PASS');
console.log('Fixed character mode: 4 x 39 sender/copy pairs verified');
console.log('Grace-auto: 39 trigger routes verified');
console.log('Free/system path: unchanged by Full resolver');
