(()=>{
'use strict';
const STATE=/^[A-Za-z0-9_-]{43}$/;
const status=document.getElementById('status');
function validAuthToken(token){return typeof token==='string'&&token.length>=16&&token.length<=2048&&!/[\u0000-\u001f\u007f\s]/.test(token);}
function fail(message){if(status){status.textContent=message;status.className='error';}}
function run(){
  try{
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const state=hash.get('state')||'';
    const tokenHash=hash.get('token_hash')||'';
    if(!STATE.test(state))throw new Error('This invitation state is invalid. Ask the organiser for a fresh invitation.');
    if(!validAuthToken(tokenHash))throw new Error('This invitation authentication token is invalid. Ask the organiser for a fresh invitation.');
    history.replaceState({},'',location.pathname);
    const target=new URL('/invite-return.html',location.origin);
    target.hash=new URLSearchParams({state,token_hash:tokenHash,type:'email'}).toString();
    location.replace(target.toString());
  }catch(error){fail(error?.message||'This invitation could not be opened.');}
}
run();
})();
