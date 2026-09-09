(()=>{
'use strict';
const STORAGE='gtg-invite-auth-state-v2';
const CALLBACK='https://thegirlstripguide.com/invite-return.html';
const SUPABASE_ORIGIN='https://vtcmvwixfqyxqghibsla.supabase.co';
const STATE=/^[A-Za-z0-9_-]{43}$/;
const status=document.getElementById('status');
function fail(message){if(status){status.textContent=message;status.className='error';}}
function exactCallback(raw){try{const a=new URL(raw),e=new URL(CALLBACK);return a.protocol==='https:'&&a.origin===e.origin&&a.pathname===e.pathname&&a.search===''&&a.hash===''&&a.toString()===e.toString()}catch{return false}}
async function run(){
  try{
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const state=hash.get('state')||'',magic=hash.get('magic')||'';
    if(!STATE.test(state))throw new Error('This invitation state is invalid. Ask the organiser for a fresh invitation.');
    const target=new URL(magic);
    if(target.protocol!=='https:'||target.origin!==SUPABASE_ORIGIN||target.pathname!=='/auth/v1/verify')throw new Error('This invitation could not be verified. Ask the organiser for a fresh invitation.');
    const effective=target.searchParams.get('redirect_to')||target.searchParams.get('redirectTo')||'';
    if(!exactCallback(effective))throw new Error('This invitation has an invalid return address. Ask the organiser for a fresh invitation.');
    localStorage.setItem(STORAGE,JSON.stringify({state,createdAt:Date.now()}));
    history.replaceState({},'',location.pathname);
    const browser=window.GTG_NATIVE&&window.Capacitor?.Plugins?.Browser;
    if(browser?.open){await browser.open({url:target.toString(),presentationStyle:'popover'});return;}
    location.replace(target.toString());
  }catch(error){fail(error?.message||'This invitation could not be opened.');}
}
void run();
})();
