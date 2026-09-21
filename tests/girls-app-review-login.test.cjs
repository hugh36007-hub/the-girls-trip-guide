const fs=require('fs');
const assert=require('assert');
const src=fs.readFileSync('girls-app-v2.js','utf8');

assert(src.includes("const APP_REVIEW_EMAIL='appreview@thegirlstripguide.com';"),'Reviewer email must be exact and explicit');
assert(src.includes("email===APP_REVIEW_EMAIL"),'Reviewer password flow must only activate for the dedicated reviewer account');
assert(src.includes("db().auth.signInWithPassword({email,password})"),'Reviewer account must use Supabase password auth');
assert(src.includes("if(email!==APP_REVIEW_EMAIL)throw Error('Reviewer sign-in is not available for this account.')"),'Password sign-in must fail closed for every other account');
assert(src.includes("fetch(CFG.authOtp"),'Normal users must continue through the Girls OTP function');
assert(!src.includes(".auth.signInWithOtp"),'Frontend must not bypass Girls OTP throttling');

console.log('PASS restricted Apple App Review sign-in contract');
