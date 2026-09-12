const fs=require('node:fs');
const assert=require('node:assert/strict');

const source=fs.readFileSync('supabase/functions/girls-auth-otp/index.ts','utf8');

assert(source.includes('https://thegirlstripguide.com/assets/images/hero-trans.png'),'OTP email must use the approved Girls logo');
assert(!source.includes('girls-trip-guide-logo'),'Legacy Girls logo must not return to the OTP email');

console.log('PASS Girls OTP email uses approved logo');
