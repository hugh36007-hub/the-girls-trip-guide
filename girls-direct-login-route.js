/* Route normal OTP sign-in cleanly, while secure invitations always win and open their exact trip. */
(()=>{
'use strict';
if(window.__GTG_DIRECT_LOGIN_ROUTE__)return;window.__GTG_DIRECT_LOGIN_ROUTE__=true;
const KEY='gtg-direct-after-otp';
const INVITE_KEY='gtg-invite-target-trip';
const app=document.getElementById('app');
if(!app)return;

function arm(){sessionStorage.setItem(KEY,String(Date.now()))}
function clearDirect(){sessionStorage.removeItem(KEY)}
function armed(){
  const started=Number(sessionStorage.getItem(KEY)||0);
  if(!started)return false;
  if(Date.now()-started>45000){clearDirect();return false}
  return true;
}
function inviteTarget(){
  const id=sessionStorage.getItem(INVITE_KEY)||'';
  const started=Number(sessionStorage.getItem(`${INVITE_KEY}:started`)||0);
  if(!/^[0-9a-f-]{36}$/i.test(id))return '';
  if(started&&Date.now()-started>5*60*1000){
    sessionStorage.removeItem(INVITE_KEY);
    sessionStorage.removeItem(`${INVITE_KEY}:started`);
    return '';
  }
  return id;
}
function clearInvite(){
  sessionStorage.removeItem(INVITE_KEY);
  sessionStorage.removeItem(`${INVITE_KEY}:started`);
  sessionStorage.removeItem(`${INVITE_KEY}:retry`);
}
function routeIfReady(){
  const target=inviteTarget();
  const picker=app.querySelector('.trip-list');
  if(picker){
    const trips=[...picker.querySelectorAll('[data-trip]')];
    if(target){
      const exact=trips.find(button=>button.dataset.trip===target);
      if(exact){clearDirect();exact.click();return true;}
      /* Never fall through to a different trip when this session came from a
         secure email invitation. Wait for the exact membership to appear. */
      return false;
    }
    if(armed()){
      if(trips.length===1){clearDirect();trips[0].click();return true;}
      clearDirect();
    }
    return false;
  }

  if(target&&app.querySelector('.dashboard')){
    const current=new URL(location.href).searchParams.get('trip_id')||'';
    if(current===target){clearInvite();clearDirect();return true;}
    const attempts=Number(sessionStorage.getItem(`${INVITE_KEY}:retry`)||0);
    if(attempts<1){
      sessionStorage.setItem(`${INVITE_KEY}:retry`,String(attempts+1));
      const u=new URL('/create-trip',location.origin);
      u.searchParams.set('trip_id',target);
      u.searchParams.set('action','plan');
      u.searchParams.set('invite','accepted');
      location.replace(u.toString());
      return true;
    }
    /* Failing closed is safer than silently opening the wrong trip. */
    app.innerHTML='<main class="auth-screen"><section class="auth-card"><div class="eyebrow">Private invitation</div><h1>We could not open the invited trip.</h1><p>Your sign-in worked, but this invitation has not linked to the correct trip yet. Ask the organiser to resend the invitation rather than continuing in another trip.</p><div class="auth-actions"><button class="btn primary" onclick="location.reload()">Try again</button><button class="btn" onclick="location.href=\'/create-trip\'">My trips</button></div></section></main>';
    return true;
  }
  return false;
}

document.addEventListener('submit',event=>{
  const form=event.target;
  if(!(form instanceof HTMLFormElement)||form.id!=='otpForm')return;
  const intent=form.querySelector('[name="intent"]')?.value||'signin';
  if(intent==='signin')arm();else clearDirect();
},true);

const observer=new MutationObserver(()=>routeIfReady());
observer.observe(app,{childList:true,subtree:true});
routeIfReady();
window.addEventListener('pagehide',()=>{if(!inviteTarget())clearDirect()},{once:true});
})();
