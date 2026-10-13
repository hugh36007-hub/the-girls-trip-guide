/* Girls web media safety: Report and Block for other members' photos and videos.
   The native apps get the same controls from native-app.js (window.GTGNativeSafety);
   this file is the website's equivalent and does nothing inside the native shell. */
(()=>{
'use strict';
if(window.GTG_NATIVE||window.__GTG_MEDIA_SAFETY__)return;window.__GTG_MEDIA_SAFETY__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co',KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP',SUPPORT=`${SUPA}/functions/v1/girls-contact-email`;
/* Same storage key as the native shell, so every script reads one block list name. */
const BLOCK_KEY='gtg-native-blocked-users-v1';
let client=null,timer=0,userId='';
const creators=new Map();
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
function toast(msg){const el=document.getElementById('toast');if(!el){console.warn(msg);return}el.textContent=msg;el.classList.add('show');clearTimeout(el.__mediaSafety);el.__mediaSafety=setTimeout(()=>el.classList.remove('show'),3500)}

function blockedUsers(){try{return new Set(JSON.parse(localStorage.getItem(BLOCK_KEY)||'[]').map(String))}catch{return new Set()}}
function saveBlocked(set){try{localStorage.setItem(BLOCK_KEY,JSON.stringify([...set]));return true}catch{return false}}
const isBlocked=id=>Boolean(id)&&blockedUsers().has(String(id));
const changed=detail=>window.dispatchEvent(new CustomEvent('gtg:native-block-list-changed',{detail}));
function blockUser(id,name='this group member'){
 if(!id||!confirm(`Block ${name}? Their photos and videos will be hidden on this device.`))return false;
 const blocked=blockedUsers();blocked.add(String(id));
 if(!saveBlocked(blocked)){toast('This browser would not save the block. Check that site storage is allowed.');return false}
 changed({userId:String(id)});toast('Blocked on this device. Their photos and videos are now hidden.');return true;
}
function unblockAll(){
 if(!confirm('Unblock everyone you have blocked on this device? Their photos and videos will be shown again.'))return false;
 if(!saveBlocked(new Set())){toast('This browser would not save the change.');return false}
 changed({});toast('Unblocked. Their photos and videos are shown again.');return true;
}
async function reportContent({kind='trip-media',id='',senderUserId='',body=''}={}){
 if(!confirm('Send this to The Girls Trip Guide safety team for review?'))return false;
 const reason=prompt('Briefly tell us what is wrong with this content:','Inappropriate content');
 if(!reason?.trim())return false;
 try{
  const q=db();if(!q)throw Error('Secure services are still loading. Please try again.');
  const {data:{session}}=await q.auth.getSession(),user=session?.user;
  if(!user?.email)throw Error('Sign in again before sending this report.');
  const [profile,trip]=await Promise.all([
   q.from('profiles').select('display_name').eq('id',user.id).maybeSingle(),
   q.from('trips').select('name').eq('id',tripId()).eq('product_key','girls').maybeSingle()
  ]);
  const name=String(profile.data?.display_name||'').trim();
  const res=await fetch(SUPPORT,{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY},body:JSON.stringify({
   name:name.length>=2?name:'Girls Trip Guide member',email:user.email,tripName:trip.data?.name||'',category:'safety-report',website:'',
   message:[
    'In-app safety report (website).',
    `Reason: ${reason.trim().slice(0,500)}`,
    `Content type: ${kind}`,
    `Content ID: ${id}`,
    `Trip ID: ${tripId()}`,
    `Uploaded by user ID: ${senderUserId||'unknown'}`,
    `Reported by user ID: ${user.id}`,
    `Content: ${String(body).slice(0,1800)}`
   ].join('\n')
  })});
  const out=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(out.error||'The report could not be sent.');
  toast('Report received. The content will be reviewed.');return true;
 }catch(error){toast(error?.message||'The report could not be sent.');return false}
}

function installStyles(){if(document.getElementById('gtg-media-safety-css'))return;const s=document.createElement('style');s.id='gtg-media-safety-css';s.textContent=`
.gallery>.media.gtg-media-blocked{display:none!important}
.media .media-tools{flex-wrap:wrap;justify-content:flex-end}
.gtg-blocked-notice{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 14px;margin:0 0 12px;padding:10px 14px;border:1px solid var(--line,rgba(255,79,163,.25));border-radius:12px;font-size:13px;line-height:1.4}
.gtg-blocked-notice button{border:1px solid currentColor;border-radius:9px;background:transparent;color:inherit;padding:7px 12px;font:inherit;font-weight:800;cursor:pointer}`;document.head.appendChild(s)}

const evidenceTiles=()=>[...document.querySelectorAll('[data-panel="evidence"] .gallery > .media')].map(tile=>({tile,id:tile.dataset.mediaId||tile.querySelector('[data-media-id]')?.dataset.mediaId||''})).filter(x=>x.id);
/* Hidden Gallery tiles carry their id and uploader from the core renderer. */
const vaultTiles=()=>[...document.querySelectorAll('#modalRoot .gallery > .media[data-gtg-vault-media]')].map(tile=>({tile,id:tile.dataset.gtgVaultMedia,creator:tile.dataset.gtgUploader||''}));
async function loadCreators(ids){
 const missing=[...new Set(ids.map(String))].filter(id=>!creators.has(id));
 for(let i=0;i<missing.length;i+=80){
  const {data,error}=await db().from('media').select('id,created_by').eq('trip_id',tripId()).in('id',missing.slice(i,i+80));
  if(error)return;(data||[]).forEach(row=>creators.set(String(row.id),row.created_by||''));
 }
}
function decorate(tile,id,creator){
 if(!creator||!userId||creator===userId||tile.classList.contains('gtg-mobile-media-tile'))return;
 let tools=tile.querySelector(':scope > .media-tools');
 if(tools?.querySelector('[data-gtg-safety-report]'))return;
 if(!tools){tools=document.createElement('div');tools.className='media-tools';tile.appendChild(tools)}
 for(const [action,label] of [['report','Report'],['block','Block']]){
  const button=document.createElement('button');button.type='button';button.textContent=label;
  button.dataset[action==='report'?'gtgSafetyReport':'gtgSafetyBlock']=String(id);button.dataset.gtgSafetyUploader=String(creator);
  tools.appendChild(button);
 }
}
function notice(gallery,count){
 if(!gallery)return;
 let el=gallery.previousElementSibling?.matches?.('[data-gtg-blocked-notice]')?gallery.previousElementSibling:null;
 if(!count){el?.remove();return}
 const text=`${count} photo${count===1?'':'s'} or video${count===1?'':'s'} from people you blocked ${count===1?'is':'are'} hidden on this device.`;
 if(!el){el=document.createElement('div');el.className='gtg-blocked-notice';el.dataset.gtgBlockedNotice='1';el.innerHTML='<span></span><button type="button" data-gtg-safety-unblock>Unblock</button>';gallery.before(el)}
 const span=el.querySelector('span');if(span.textContent!==text)span.textContent=text;
}
async function apply(){
 const q=db();if(!q||!tripId())return;
 const evidence=evidenceTiles(),vault=vaultTiles();
 if(!evidence.length&&!vault.length){document.querySelectorAll('[data-gtg-blocked-notice]').forEach(el=>el.remove());return}
 if(!userId){const {data:{session}}=await q.auth.getSession();userId=session?.user?.id||''}
 await loadCreators(evidence.map(x=>x.id));
 const blocked=blockedUsers(),hidden=new Map();
 for(const {tile,id,creator=creators.get(String(id))||''} of [...evidence,...vault]){
  if(!tile.isConnected)continue;
  const hide=Boolean(creator)&&blocked.has(String(creator)),gallery=tile.parentElement;
  if(hide!==tile.classList.contains('gtg-media-blocked')){tile.classList.toggle('gtg-media-blocked',hide);tile.hidden=hide}
  hidden.set(gallery,(hidden.get(gallery)||0)+(hide?1:0));
  decorate(tile,id,creator);
 }
 for(const [gallery,count] of hidden)notice(gallery,count);
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>void apply().catch(error=>console.warn('Girls media safety could not update the gallery.',error)),120)}

function boot(){
 if(!window.supabase?.createClient){setTimeout(boot,60);return}
 installStyles();
 document.addEventListener('click',event=>{
  const unblock=event.target.closest?.('[data-gtg-safety-unblock]');
  if(unblock){event.preventDefault();event.stopPropagation();unblockAll();return}
  const button=event.target.closest?.('[data-gtg-safety-report],[data-gtg-safety-block]');if(!button)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  const report=button.dataset.gtgSafetyReport,id=report||button.dataset.gtgSafetyBlock,uploader=button.dataset.gtgSafetyUploader||'';
  const media=button.closest('.media')?.querySelector('img,video');
  if(report)void reportContent({kind:'trip-media',id,senderUserId:uploader,body:media?.getAttribute('alt')||(media?.tagName==='VIDEO'?'Trip video':'Trip photo')});
  else blockUser(uploader);
 },true);
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('gtg:native-block-list-changed',schedule);
 window.addEventListener('gtg:media-uploaded',schedule);
 window.addEventListener('pageshow',schedule);
 schedule();
}
window.GTGMediaSafety={isBlocked,blockUser,unblockAll,reportContent};
boot();
})();
