const fs=require('fs');
const assert=require('assert');

const resend=fs.readFileSync('girls-resend-invite-fix.js','utf8');
const history=fs.readFileSync('girls-mobile-history-fix.js','utf8');
const loader=fs.readFileSync('girls-performance-loader.js','utf8');
const backend=fs.readFileSync('supabase/functions/girls-trip-email/index.ts','utf8');

assert(resend.includes("resendModalOpen()"),'Resend must detect an already-open resend modal');
assert(resend.includes(".from('trip_members').select('id')"),'Late-loaded resend must resolve the exact member');
assert(resend.includes('memberId,memberId')===false,'Sanity check');
assert(resend.includes('memberId,name:')&&resend.includes('resend:true'),'Resend request must send exact memberId and resend=true');
assert(backend.includes("requestedMemberId=String(body.memberId||'')")&&backend.includes('resend=body.resend===true'),'Backend must retain exact-member resend contract');

assert(history.includes("history.pushState(appState({gtgTab:"),'Tab navigation must create browser history entries');
assert(history.includes('gtgModal:true'),'Open modals must receive an in-app history entry');
assert(history.includes("window.addEventListener('popstate'"),'Android/browser Back must be handled');
assert(history.includes("modal.classList.remove('open')"),'Back must close the open modal before leaving the app');

const resendIndex=loader.indexOf('/girls-resend-invite-fix.js?v=20260914-2');
const themeIndex=loader.indexOf('/logged-in-light-theme.js?v=20260909-1');
assert(resendIndex>-1&&resendIndex<themeIndex,'Resend repair must load before non-critical theme scripts');
assert(loader.includes('/girls-mobile-history-fix.js?v=1'),'Mobile history repair must be loaded');

console.log('Girls resend + Android history contract PASS');
