/* Girls session guard: keep rendered trip permissions aligned with the live Supabase account. */
(() => {
'use strict';
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,renderedUserId,checking=false,reloading=false;

function db(){
  if(client)return client;
  if(!window.supabase?.createClient)return null;
  client=window.supabase.createClient(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return client;
}
function tripId(){return new URL(location.href).searchParams.get('trip_id')||'';}
function tripOpen(){return Boolean(tripId()||document.querySelector('.dashboard'));}
function reloadForIdentityChange(){if(reloading)return;reloading=true;location.reload();}
async function currentUser(){
  const c=db();if(!c)return null;
  const {data,error}=await c.auth.getUser();
  if(error&&error.name!=='AuthSessionMissingError')throw error;
  return data?.user||null;
}
async function reconcile(){
  if(checking||reloading)return;
  checking=true;
  try{
    const user=await currentUser(),nextId=user?.id||null;
    if(renderedUserId===undefined){renderedUserId=nextId;return;}
    if(!tripOpen()){renderedUserId=nextId;return;}
    if(nextId!==renderedUserId)reloadForIdentityChange();
  }catch(error){console.warn('Girls session identity check skipped.',error);}
  finally{checking=false;}
}
async function identityPreflight(){
  const user=await currentUser(),liveId=user?.id||null;
  if(renderedUserId===undefined)renderedUserId=liveId;
  if(!liveId||liveId!==renderedUserId){reloadForIdentityChange();return null;}
  return user;
}
async function ownerPreflight(){
  const user=await identityPreflight(),tid=tripId();if(!user||!tid)return false;
  const {data,error}=await db().from('trips').select('id,owner_id,product_key').eq('id',tid).eq('product_key','girls').maybeSingle();
  if(error)throw error;
  if(!data||data.owner_id!==user.id){reloadForIdentityChange();return false;}
  return true;
}
async function mediaDeletePreflight(mediaId){
  const user=await identityPreflight(),tid=tripId();if(!user||!tid||!mediaId)return false;
  const [{data:row,error:mediaError},{data:trip,error:tripError}]=await Promise.all([
    db().from('media').select('id,trip_id,created_by').eq('id',mediaId).eq('trip_id',tid).maybeSingle(),
    db().from('trips').select('id,owner_id,product_key').eq('id',tid).eq('product_key','girls').maybeSingle()
  ]);
  if(mediaError)throw mediaError;if(tripError)throw tripError;
  if(!row||!trip||(row.created_by!==user.id&&trip.owner_id!==user.id)){reloadForIdentityChange();return false;}
  return true;
}

/* Entry screen escape: Plan your trip is a full page, so provide an explicit close control back to the public site. */
function ensureAuthClose(){
  const card=document.querySelector('.auth-screen .auth-card');
  if(!card||!card.querySelector('[data-a="signin"]')||card.querySelector('.auth-close-home'))return;
  if(!document.getElementById('gtg-auth-close-style')){
    const style=document.createElement('style');
    style.id='gtg-auth-close-style';
    style.textContent='.auth-card{position:relative}.auth-close-home{position:absolute;top:16px;right:16px;width:42px;height:42px;display:grid;place-items:center;border:1px solid rgba(255,79,163,.34);border-radius:50%;background:rgba(7,5,7,.72);color:#fff;text-decoration:none;font:300 30px/1 Arial,sans-serif;z-index:3;transition:border-color .15s,background .15s}.auth-close-home:hover,.auth-close-home:focus-visible{border-color:#ff4fa3;background:rgba(255,79,163,.12);outline:none}@media(max-width:600px){.auth-close-home{top:13px;right:13px;width:38px;height:38px;font-size:27px}}';
    document.head.appendChild(style);
  }
  const close=document.createElement('a');
  close.className='auth-close-home';
  close.href='/';
  close.setAttribute('aria-label','Close and return to The Girls Trip Guide');
  close.textContent='×';
  card.appendChild(close);
}
const authCloseObserver=new MutationObserver(ensureAuthClose);
authCloseObserver.observe(document.documentElement,{childList:true,subtree:true});
ensureAuthClose();

const protectedSelector='[data-a="setMediaHero"],[data-a="removeHero"],[data-delete-media],[data-a="deleteVaultMedia"]';
document.addEventListener('click',async event=>{
  const target=event.target.closest?.(protectedSelector);if(!target)return;
  if(target.dataset.gtgSessionGuardBypass==='1'){delete target.dataset.gtgSessionGuardBypass;return;}
  event.preventDefault();event.stopImmediatePropagation();
  try{
    const ownerOnly=target.matches('[data-a="setMediaHero"],[data-a="removeHero"]');
    const mediaId=target.dataset.deleteMedia||target.dataset.id||'';
    const allowed=ownerOnly?await ownerPreflight():await mediaDeletePreflight(mediaId);
    if(!allowed||reloading)return;
    target.dataset.gtgSessionGuardBypass='1';target.click();
  }catch(error){console.warn('Girls Evidence permission preflight failed.',error);reloadForIdentityChange();}
},true);

document.addEventListener('submit',async event=>{
  const form=event.target;if(!(form instanceof HTMLFormElement)||!['heroForm','setPinForm'].includes(form.id))return;
  if(form.dataset.gtgSessionGuardBypass==='1'){delete form.dataset.gtgSessionGuardBypass;return;}
  event.preventDefault();event.stopImmediatePropagation();
  const submitter=event.submitter;
  try{
    if(!await ownerPreflight()||reloading)return;
    form.dataset.gtgSessionGuardBypass='1';
    if(submitter instanceof HTMLElement&&submitter.isConnected)form.requestSubmit(submitter);else form.requestSubmit();
  }catch(error){console.warn('Girls owner permission preflight failed.',error);reloadForIdentityChange();}
},true);

const c=db();
if(c){
  currentUser().then(user=>{renderedUserId=user?.id||null;}).catch(error=>console.warn('Girls session baseline unavailable.',error));
  c.auth.onAuthStateChange((_event,session)=>{
    const nextId=session?.user?.id||null;
    if(renderedUserId===undefined){renderedUserId=nextId;return;}
    if(!tripOpen()){renderedUserId=nextId;return;}
    if(nextId!==renderedUserId)reloadForIdentityChange();
  });
}
window.addEventListener('focus',()=>void reconcile());
window.addEventListener('pageshow',()=>void reconcile());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void reconcile();});
})();
