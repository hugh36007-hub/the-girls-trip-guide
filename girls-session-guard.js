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
