(()=>{
'use strict';
if(window.__TRIP_EXPORT_V1__)return;window.__TRIP_EXPORT_V1__=true;

const isBoys=Boolean(window.BTGClean);
const PRODUCT=isBoys?'boys':'girls';
const ACCENT=isBoys?'#e2bb68':'#ff83c1';
const SUPABASE_URL='https://vtcmvwixfqyxqghibsla.supabase.co';
const SUPABASE_KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
const MOBILE_PART=120*1024*1024;
const DESKTOP_PART=500*1024*1024;
let ownClient=null,accessCache=null,accessKey='',overlay=null,bodyOverflow='';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const safe=v=>String(v||'file').normalize('NFKD').replace(/[^a-zA-Z0-9._ -]+/g,'-').replace(/\s+/g,' ').trim().slice(0,120)||'file';
const bytes=n=>{n=Number(n||0);if(!n)return'0 B';const u=['B','KB','MB','GB','TB'];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return`${n>=10||i===0?n.toFixed(i?1:0):n.toFixed(2)} ${u[i]}`};
const tripId=()=>isBoys?window.BTGClean?.state?.trip?.id||'':new URLSearchParams(location.search).get('trip_id')||'';
const db=()=>{if(isBoys&&window.BTGClean?.Backend?.db)return window.BTGClean.Backend.db();if(ownClient)return ownClient;if(!window.supabase?.createClient)throw Error('Secure services are not ready.');return ownClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})};
const notify=msg=>{if(isBoys&&window.BTGClean?.toast)return window.BTGClean.toast(msg,4200);const t=document.getElementById('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),4200)}};

function injectCss(){
 if(document.getElementById('trip-export-css'))return;
 const s=document.createElement('style');s.id='trip-export-css';s.textContent=`
 .trip-export-overlay{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.78);backdrop-filter:blur(12px);display:grid;place-items:center;padding:18px;color:#f6f2e9;font-family:Inter,system-ui,sans-serif}
 .trip-export-card{width:min(660px,100%);max-height:min(86vh,820px);overflow:auto;border:1px solid color-mix(in srgb,${ACCENT} 48%,transparent);border-radius:24px;background:linear-gradient(145deg,#151515,#090a0b);box-shadow:0 30px 90px rgba(0,0,0,.55);padding:24px}
 .trip-export-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.trip-export-kicker{color:${ACCENT};font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.trip-export-card h2{margin:7px 0 5px;font:800 38px/1 'Barlow Condensed',Inter,sans-serif;text-transform:uppercase}.trip-export-card p{margin:0;color:rgba(255,255,255,.68);font-size:13px;line-height:1.55}.trip-export-close{width:42px;height:42px;flex:0 0 42px;border:1px solid rgba(255,255,255,.14);border-radius:13px;background:#101112;color:#fff;font-size:24px}
 .trip-export-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:20px 0}.trip-export-stat{border:1px solid rgba(255,255,255,.09);border-radius:14px;background:#0d0e0f;padding:13px}.trip-export-stat b{display:block;color:${ACCENT};font-size:20px}.trip-export-stat span{display:block;margin-top:4px;color:rgba(255,255,255,.5);font-size:9px;text-transform:uppercase;letter-spacing:.08em}
 .trip-export-note{border:1px solid color-mix(in srgb,${ACCENT} 28%,transparent);border-radius:14px;background:color-mix(in srgb,${ACCENT} 6%,#0b0c0d);padding:13px 14px;margin:14px 0;color:rgba(255,255,255,.72);font-size:11px;line-height:1.5}.trip-export-note strong{color:${ACCENT}}
 .trip-export-parts{display:grid;gap:9px;margin-top:16px}.trip-export-part{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border:1px solid rgba(255,255,255,.1);border-radius:15px;background:#0c0d0e;padding:13px 14px}.trip-export-part b{display:block;font-size:13px}.trip-export-part small{display:block;margin-top:4px;color:rgba(255,255,255,.48);font-size:10px}.trip-export-btn{border:1px solid color-mix(in srgb,${ACCENT} 72%,transparent);border-radius:999px;background:color-mix(in srgb,${ACCENT} 12%,#0b0c0d);color:${ACCENT};padding:10px 13px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}.trip-export-btn.primary{background:${ACCENT};color:#111;border-color:${ACCENT}}.trip-export-btn:disabled{opacity:.45}
 .trip-export-progress{height:7px;border-radius:999px;overflow:hidden;background:#242526;margin-top:10px}.trip-export-progress i{display:block;width:0;height:100%;background:${ACCENT};transition:width .18s}.trip-export-status{margin-top:7px;color:rgba(255,255,255,.56);font-size:10px}
 @media(max-width:520px){.trip-export-card{padding:19px 16px;border-radius:20px}.trip-export-card h2{font-size:32px}.trip-export-summary{grid-template-columns:1fr 1fr}.trip-export-part{grid-template-columns:1fr}.trip-export-btn{width:100%}}
 `;document.head.appendChild(s);
}

async function access(){
 const id=tripId();if(!id)return null;
 if(accessCache&&accessKey===id)return accessCache;
 const q=db(),user=(await q.auth.getUser()).data?.user;if(!user)return null;
 const [tr,en]=await Promise.all([
   q.from('trips').select('id,owner_id,name,destination,start_date,end_date,product_key,hero_storage_path').eq('id',id).eq('product_key',PRODUCT).maybeSingle(),
   q.from('trip_entitlements').select('entitlement,active').eq('trip_id',id).eq('active',true)
 ]);
 if(tr.error||!tr.data)return null;
 const paid=(en.data||[]).some(x=>['full_trip','evidence'].includes(x.entitlement)&&x.active!==false);
 accessKey=id;accessCache={id,user,trip:tr.data,paid,owner:tr.data.owner_id===user.id};return accessCache;
}

async function maybeInject(){
 const list=document.querySelector('.drawer-list');if(!list||list.querySelector('[data-trip-export]'))return;
 const a=await access().catch(()=>null);if(!a?.paid||!a.owner||!list.isConnected)return;
 const b=document.createElement('button');b.type='button';b.dataset.tripExport='1';b.innerHTML='<b>Download trip</b><small>Photos, video, documents and trip data</small>';
 const signout=[...list.querySelectorAll('button')].find(x=>/sign out/i.test(x.textContent||''));list.insertBefore(b,signout||null);
}

function closeMenus(){
 if(isBoys)window.BTGClean?.closeModal?.();
 const d=document.getElementById('drawerRoot');d?.classList.remove('open');
}
function closeOverlay(){if(!overlay)return;overlay.remove();overlay=null;document.body.style.overflow=bodyOverflow}
function setOverlay(html){injectCss();closeOverlay();bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';overlay=document.createElement('div');overlay.className='trip-export-overlay';overlay.innerHTML=`<section class="trip-export-card" role="dialog" aria-modal="true" aria-label="Download trip">${html}</section>`;document.body.appendChild(overlay)}
function head(title,sub){return `<div class="trip-export-head"><div><div class="trip-export-kicker">Full Trip export</div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div><button class="trip-export-close" type="button" data-export-close aria-label="Close">×</button></div>`}

async function safeRows(table,id){
 try{const out=[];let from=0;for(;;){const r=await db().from(table).select('*').eq('trip_id',id).range(from,from+999);if(r.error)throw r.error;const rows=r.data||[];out.push(...rows);if(rows.length<1000)break;from+=1000}return out}catch(error){console.warn(`Export table ${table} unavailable`,error);return[]}
}
async function collect(){
 const a=await access();if(!a?.owner)throw Error('Only the trip organiser can download the complete trip.');if(!a.paid)throw Error('Complete trip download is a Full Trip feature.');
 const tables=['trip_members','bookings','booking_participants','documents','expenses','expense_participants','payment_requests','payment_request_participants','trip_messages','trip_chat_messages','trip_polls','trip_poll_options','trip_poll_votes','communication_settings'];
 const results=await Promise.all(tables.map(t=>safeRows(t,a.id)));
 const data={exported_at:new Date().toISOString(),product:PRODUCT,trip:a.trip};tables.forEach((t,i)=>data[t]=results[i]);
 const media=await safeRows('media',a.id);data.media=media.map(({storage_path,thumbnail_path,...rest})=>({...rest,storage_path,thumbnail_path}));
 const files=[],seen=new Set();
 const add=(bucket,path,name,folder,size=0)=>{if(!path)return;const key=`${bucket}:${path}`;if(seen.has(key))return;seen.add(key);files.push({bucket,path,name:safe(name||path.split('/').pop()),folder,size:Number(size||0)})};
 for(const m of media)add(m.album==='vault'?'btg-vault':'btg-evidence',m.storage_path,m.file_name,m.album==='vault'?'Hidden Gallery':'Evidence',m.size_bytes);
 for(const d of data.documents)add('btg-documents',d.storage_path,d.file_name||d.name,'Documents',d.size_bytes);
 for(const m of data.trip_members)add('btg-documents',m.avatar_path,`${m.name||'crew'}-photo.webp`,'Crew Photos',0);
 if(a.trip.hero_storage_path)add('btg-evidence',a.trip.hero_storage_path,'trip-hero','Trip Hero',0);
 return {access:a,data,files};
}

function csv(rows,cols){
 const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;return [cols.map(c=>q(typeof c==='string'?c:c.name)).join(','),...rows.map(r=>cols.map(c=>q(typeof c==='string'?r[c]:c.get(r))).join(','))].join('\r\n');
}
function metadataFiles(pack){
 const d=pack.data,trip=d.trip||{};
 const summary=`${isBoys?'THE BOYS TRIP GUIDE':'THE GIRLS TRIP GUIDE'}\nFULL TRIP EXPORT\n\nTrip: ${trip.name||''}\nDestination: ${trip.destination||''}\nDates: ${trip.start_date||''} to ${trip.end_date||''}\nExported: ${d.exported_at}\n\nThis export contains the trip plan, crew/group data, costs, chats, polls, documents and original uploaded media available to the organiser at export time. Hidden Gallery media remains subject to the trip's Hidden Gallery access controls.\n`;
 return [
  {name:'Trip Data/README.txt',text:summary},
  {name:'Trip Data/trip-data.json',text:JSON.stringify(d,null,2)},
  {name:'Trip Data/crew.csv',text:csv(d.trip_members||[],['name','email','role','status','passport_confirmed','created_at'])},
  {name:'Trip Data/plan.csv',text:csv(d.bookings||[],['kind','total_cost','payer_member_id','split_mode','created_at',{name:'details',get:r=>JSON.stringify(r.details||{})}])},
  {name:'Trip Data/expenses.csv',text:csv(d.expenses||[],['description','amount','payer_member_id','created_at'])},
  {name:'Trip Data/chat.csv',text:csv(d.trip_chat_messages||[],['sender_member_id','sender_user_id','message','created_at'])},
  {name:'Trip Data/organiser-messages.csv',text:csv(d.trip_messages||[],['sender_user_id','recipient_member_id','message','created_at'])}
 ];
}
function partition(pack){
 const mobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent),limit=mobile?MOBILE_PART:DESKTOP_PART,parts=[];let current={kind:'zip',files:[],size:0};
 for(const f of pack.files){
   if(f.size>limit){if(current.files.length){parts.push(current);current={kind:'zip',files:[],size:0}}else if(!parts.some(p=>p.kind==='zip')){parts.push(current);current={kind:'zip',files:[],size:0}}parts.push({kind:'direct',files:[f],size:f.size});continue}
   if(current.files.length&&current.size+f.size>limit){parts.push(current);current={kind:'zip',files:[],size:0}}
   current.files.push(f);current.size+=f.size;
 }
 if(current.files.length||!parts.some(p=>p.kind==='zip'))parts.push(current);
 return parts;
}
async function ensureZip(){if(window.JSZip)return window.JSZip;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';s.onload=resolve;s.onerror=()=>reject(Error('The ZIP service could not load.'));document.head.appendChild(s)});return window.JSZip}
async function signed(file,download=false){const opts=download?{download:file.name}:undefined;const r=await db().storage.from(file.bucket).createSignedUrl(file.path,3600,opts);if(r.error||!r.data?.signedUrl)throw r.error||Error(`Could not prepare ${file.name}`);return r.data.signedUrl}
function triggerBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
function archiveName(pack,index,total){const base=safe(pack.access.trip.name||'trip').replace(/\s+/g,'-').toLowerCase();return total>1?`${base}-part-${index+1}-of-${total}.zip`:`${base}-full-trip.zip`}

async function downloadPart(pack,part,index,total,button){
 if(button.disabled)return;button.disabled=true;const old=button.textContent;button.textContent='Preparing…';
 const status=overlay?.querySelector(`[data-export-status="${index}"]`),bar=overlay?.querySelector(`[data-export-bar="${index}"] i`);
 try{
  if(part.kind==='direct'){
    const f=part.files[0],url=await signed(f,true);const a=document.createElement('a');a.href=url;a.download=f.name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();if(status)status.textContent='Download started.';button.textContent='Download again';button.disabled=false;return;
  }
  const JSZip=await ensureZip(),zip=new JSZip();for(const m of metadataFiles(pack))zip.file(m.name,m.text);
  zip.file('README.txt',`Part ${index+1} of ${total} from ${pack.access.trip.name}. Keep all parts for the complete export.`);
  for(let i=0;i<part.files.length;i++){
    const f=part.files[i];if(status)status.textContent=`Adding ${i+1} of ${part.files.length}: ${f.name}`;if(bar)bar.style.width=`${Math.round((i/Math.max(1,part.files.length))*80)}%`;
    const url=await signed(f,false),res=await fetch(url);if(!res.ok)throw Error(`Could not download ${f.name}. If it is hidden media, unlock the Hidden Gallery and try again.`);zip.file(`${f.folder}/${String(i+1).padStart(4,'0')}-${f.name}`,await res.blob(),{binary:true,compression:'STORE'});
  }
  if(status)status.textContent='Building ZIP…';const blob=await zip.generateAsync({type:'blob',compression:'STORE',streamFiles:true},m=>{if(bar)bar.style.width=`${80+Math.round(m.percent*.2)}%`});triggerBlob(blob,archiveName(pack,index,total));if(bar)bar.style.width='100%';if(status)status.textContent='Download started.';
 }catch(error){console.error(error);if(status)status.textContent=error.message||'Download failed.';notify(error.message||'Trip download failed.');button.disabled=false;button.textContent=old;return}
 button.textContent='Download again';button.disabled=false;
}

function renderReady(pack){
 const parts=partition(pack),media=pack.data.media||[],docs=pack.data.documents||[],totalSize=pack.files.reduce((n,f)=>n+f.size,0);
 setOverlay(`${head('Download trip',pack.access.trip.name)}<div class="trip-export-summary"><div class="trip-export-stat"><b>${media.length}</b><span>photos + videos</span></div><div class="trip-export-stat"><b>${docs.length}</b><span>documents</span></div><div class="trip-export-stat"><b>${bytes(totalSize)}</b><span>known file size</span></div></div><div class="trip-export-note"><strong>Complete export.</strong> Trip data is included in Part 1. Large trips are split into manageable parts so mobile browsers do not run out of memory.</div><div class="trip-export-parts">${parts.map((p,i)=>{const direct=p.kind==='direct',f=p.files[0];return `<div class="trip-export-part"><div><b>${direct?`Large file · ${esc(f.name)}`:`${parts.length===1?'Complete trip':`Part ${i+1} of ${parts.length}`}`}</b><small>${direct?`${esc(f.folder)} · ${bytes(f.size)}`:`${p.files.length} file${p.files.length===1?'':'s'} · ${bytes(p.size)}${i===0?' · includes trip data':''}`}</small><div class="trip-export-progress"><i data-export-bar-inner></i></div><div class="trip-export-status" data-export-status="${i}">Ready.</div></div><button class="trip-export-btn ${parts.length===1?'primary':''}" type="button" data-export-part="${i}">${direct?'Download file':'Download'}</button></div>`}).join('')}</div>`);
 parts.forEach((p,i)=>{const row=overlay.querySelector(`[data-export-part="${i}"]`)?.closest('.trip-export-part');const bar=row?.querySelector('.trip-export-progress i');if(bar)bar.parentElement.dataset.exportBar=String(i)});
 overlay.__pack=pack;overlay.__parts=parts;
}
async function openExport(){
 closeMenus();setOverlay(`${head('Download trip','Preparing your complete Full Trip export…')}<div class="trip-export-note">Checking photos, video, documents, plan, costs and conversations.</div><div class="trip-export-progress"><i style="width:34%"></i></div><div class="trip-export-status">Preparing file list…</div>`);
 try{renderReady(await collect())}catch(error){console.error(error);setOverlay(`${head('Download unavailable',error.message||'The export could not be prepared.')}<div class="trip-export-note">Nothing has been downloaded or changed.</div>`)}
}

const observer=new MutationObserver(()=>void maybeInject());observer.observe(document.body,{childList:true,subtree:true});
document.addEventListener('pointerdown',event=>{if(event.target.closest?.('[data-action="menu"],[data-a="drawer"]'))setTimeout(()=>void maybeInject(),0)},{capture:true,passive:true});
document.addEventListener('click',event=>{
 if(event.target.closest?.('[data-trip-export]')){event.preventDefault();event.stopPropagation();void openExport();return}
 if(event.target.closest?.('[data-export-close]')||event.target===overlay){event.preventDefault();closeOverlay();return}
 const b=event.target.closest?.('[data-export-part]');if(b&&overlay?.__pack){event.preventDefault();const i=Number(b.dataset.exportPart);void downloadPart(overlay.__pack,overlay.__parts[i],i,overlay.__parts.length,b)}
},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay)closeOverlay()});
setTimeout(()=>void maybeInject(),800);
})();
