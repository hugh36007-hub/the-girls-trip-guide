/* Fast startup prewarm for the private Girls trip app.
   Read-only requests are de-duplicated briefly so the main app can reuse work
   already in flight instead of loading auth, trip data and optional media in
   separate sequential phases. */
(()=>{
'use strict';
if(window.__GTG_FAST_START__)return;window.__GTG_FAST_START__=true;

const SUPABASE='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const READ_RPC=new Set(['trip_storage_usage','vault_is_configured','has_active_vault_session','trip_media_contribution_breakdown']);
const app=document.getElementById('app');
let cacheActive=true;

function setStatus(text){
 const p=document.querySelector('.gtg-boot-title p');
 if(p){p.textContent=text;p.setAttribute('role','status');p.setAttribute('aria-live','polite');}
}
setStatus('Opening your secure trip…');

const nativeFetch=window.fetch.bind(window);
const inflight=new Map();
const cached=new Map();
function requestInfo(input,init={}){
 const url=typeof input==='string'?input:input?.url||String(input||'');
 const method=String(init?.method||(typeof input==='object'&&input?.method)||'GET').toUpperCase();
 const body=typeof init?.body==='string'?init.body:'';
 return {url,method,body};
}
function isSafeRead(info){
 let u;try{u=new URL(info.url,location.href)}catch{return false}
 if(u.origin!==SUPABASE)return false;
 if(info.method==='GET'&&(u.pathname.startsWith('/rest/v1/')||u.pathname==='/auth/v1/user'))return true;
 if(info.method!=='POST')return false;
 const rpc=u.pathname.match(/^\/rest\/v1\/rpc\/([^/?#]+)/)?.[1]||'';
 if(READ_RPC.has(rpc))return true;
 return u.pathname.startsWith('/storage/v1/object/sign/');
}
window.fetch=function(input,init){
 const info=requestInfo(input,init);
 if(!cacheActive||!isSafeRead(info))return nativeFetch(input,init);
 const k=`${info.method}|${info.url}|${info.body}`;
 const hit=cached.get(k);
 if(hit&&Date.now()-hit.at<20000)return Promise.resolve(hit.response.clone());
 let master=inflight.get(k);
 if(!master){
  master=nativeFetch(input,init).then(r=>{
   if(r?.ok)cached.set(k,{at:Date.now(),response:r.clone()});
   return r;
  }).finally(()=>inflight.delete(k));
  inflight.set(k,master);
 }
 return master.then(r=>r.clone());
};

function stopCachingSoon(){
 cacheActive=false;
 setTimeout(()=>{cached.clear();inflight.clear();},1000);
}
if(app){
 const observer=new MutationObserver(()=>{
  if(app.querySelector('.dashboard,.auth-screen')){stopCachingSoon();observer.disconnect();}
 });
 observer.observe(app,{childList:true,subtree:true});
}

async function prewarm(){
 if(!window.supabase?.createClient)return;
 const client=window.supabase.createClient(SUPABASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

 setStatus('Checking your secure sign-in…');
 const sessionPromise=client.auth.getSession().catch(()=>({data:{session:null}}));
 const userPromise=client.auth.getUser().catch(()=>({data:{user:null}}));
 const [{data:sessionData},{data:userData}]=await Promise.all([sessionPromise,userPromise]);
 const user=userData?.user||sessionData?.session?.user||null;
 if(!user)return;

 setStatus('Finding your trip…');
 const profilePromise=Promise.resolve(client.from('profiles').select('*').eq('id',user.id).maybeSingle());
 const tripsPromise=Promise.resolve(client.from('trips').select('*').eq('product_key','girls').order('start_date',{ascending:false}));
 const [,tripsResult]=await Promise.allSettled([profilePromise,tripsPromise]);
 const trips=tripsResult.status==='fulfilled'&&!tripsResult.value.error?(tripsResult.value.data||[]):[];
 const url=new URL(location.href);
 const requested=url.searchParams.get('trip_id')||'';
 let tripId=UUID.test(requested)&&trips.some(t=>t.id===requested)?requested:'';
 if(!tripId&&trips.length===1)tripId=trips[0].id;
 if(!tripId)return;

 setStatus('Loading the plan…');
 const q=client;
 const core=[
  q.from('trips').select('*').eq('id',tripId).eq('product_key','girls').single(),
  q.from('trip_members').select('*').eq('trip_id',tripId).order('created_at'),
  q.from('bookings').select('*').eq('trip_id',tripId).order('created_at'),
  q.from('booking_participants').select('*').eq('trip_id',tripId),
  q.from('documents').select('*').eq('trip_id',tripId).order('created_at'),
  q.from('expenses').select('*').eq('trip_id',tripId).order('created_at'),
  q.from('expense_participants').select('*').eq('trip_id',tripId),
  q.from('payment_requests').select('*').eq('trip_id',tripId).order('created_at'),
  q.from('payment_request_participants').select('*').eq('trip_id',tripId),
  q.from('trip_entitlements').select('*').eq('trip_id',tripId).eq('active',true),
  q.from('communication_settings').select('*').eq('trip_id',tripId).maybeSingle()
 ].map(p=>Promise.resolve(p));

 const [tripResult,membersResult,entitlementsResult]=await Promise.all([core[0],core[1],core[9]]);
 const trip=tripResult?.data||null;
 const members=membersResult?.data||[];
 const entitlements=entitlementsResult?.data||[];
 if(!trip)return;
 const full=entitlements.some(x=>x.active!==false&&['full_trip','evidence'].includes(x.entitlement));

 setStatus('Finishing the details…');
 const extras=[Promise.resolve(client.rpc('trip_storage_usage',{target_trip_id:tripId}))];
 if(trip.hero_storage_path)extras.push(Promise.resolve(client.storage.from('btg-evidence').createSignedUrl(trip.hero_storage_path,3600)));
 for(const m of members){if(m.avatar_path)extras.push(Promise.resolve(client.storage.from('btg-documents').createSignedUrl(m.avatar_path,3600)));}
 if(full){
  extras.push(Promise.resolve(client.rpc('vault_is_configured',{p_trip_id:tripId})));
  extras.push(Promise.resolve(client.rpc('has_active_vault_session',{target_trip_id:tripId})));
  extras.push(Promise.resolve(client.rpc('trip_media_contribution_breakdown',{p_trip_id:tripId})));
  extras.push(Promise.resolve(client.from('trip_messages').select('*').eq('trip_id',tripId).order('created_at',{ascending:false}).limit(100)));
  const mediaPromise=Promise.resolve(client.from('media').select('*').eq('trip_id',tripId).eq('album','evidence').order('created_at',{ascending:false}).limit(250));
  extras.push(mediaPromise);
  const media=await mediaPromise.catch(()=>({data:[]}));
  if(url.searchParams.get('action')==='evidence'){
   for(const item of (media?.data||[]).slice(0,6)){
    const path=item.thumbnail_path||item.storage_path;
    if(path)extras.push(Promise.resolve(client.storage.from('btg-evidence').createSignedUrl(path,3600)));
   }
  }
 }
 await Promise.allSettled([...core,...extras]);
 setStatus('Almost there…');
}

prewarm().catch(()=>{});

setTimeout(()=>{
 if(!app?.querySelector('.gtg-boot-shell'))return;
 setStatus('Still connecting. If this does not open in a few seconds, refresh once.');
},5000);
setTimeout(()=>{
 if(!app?.querySelector('.gtg-boot-shell'))return;
 const title=app.querySelector('.gtg-boot-title');
 if(title&&!title.querySelector('.gtg-boot-retry')){
  const b=document.createElement('button');
  b.className='btn gtg-boot-retry';b.type='button';b.textContent='Retry';
  b.style.marginTop='18px';b.addEventListener('click',()=>location.reload());title.appendChild(b);
 }
},9000);

window.addEventListener('pagehide',stopCachingSoon,{once:true});
})();
