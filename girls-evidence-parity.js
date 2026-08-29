/* Girls Evidence parity: unseen badge semantics + robust image fallback. */
(() => {
'use strict';
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client;
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const tripId=()=>new URL(location.href).searchParams.get('trip_id')||'';
const seenKey=()=>`gtg-evidence-seen-count:${tripId()}`;

function evidenceTotal(){const n=document.querySelector('.stat[data-tab="evidence"] b');return Math.max(0,Number(n?.textContent)||0)}
function evidenceButton(){return document.querySelector('nav.dock button[data-tab="evidence"]')}
function evidenceOpen(){return Boolean(document.querySelector('[data-panel="evidence"].active')||evidenceButton()?.classList.contains('active'))}
function seenCount(){try{const raw=localStorage.getItem(seenKey());return raw===null?null:Math.max(0,Number(raw)||0)}catch{return null}}
function saveSeen(value){try{localStorage.setItem(seenKey(),String(Math.max(0,Number(value)||0)))}catch{}}
function setBadge(count){const button=evidenceButton();if(!button)return;const n=Math.max(0,Number(count)||0);if(n)button.dataset.unseenEvidence=String(Math.min(99,n));else delete button.dataset.unseenEvidence}
function syncBadge(){const total=evidenceTotal();if(!tripId()||!document.querySelector('.stat[data-tab="evidence"]'))return;if(evidenceOpen()){saveSeen(total);setBadge(0);return}const seen=seenCount();if(seen===null){saveSeen(total);setBadge(0);return}setBadge(Math.max(0,total-seen))}
function markSeen(){saveSeen(evidenceTotal());setBadge(0)}

const style=document.createElement('style');style.id='gtg-evidence-parity-style';style.textContent=`
.dock.gtg-option7 button[data-tab="evidence"][data-unseen-evidence]::before{content:attr(data-unseen-evidence);position:absolute;top:-3px;right:4px;z-index:4;min-width:20px;height:20px;padding:0 5px;border-radius:999px;display:grid;place-items:center;background:var(--pink2,#ff83c1);color:#160a10;font:900 10px/1 Inter,sans-serif;box-shadow:0 5px 14px rgba(0,0,0,.35)}
.dock.gtg-option7.is-compact button[data-tab="evidence"][data-unseen-evidence]::before{top:-5px;right:0}
`;
if(!document.getElementById(style.id))document.head.appendChild(style);

document.addEventListener('click',event=>{if(event.target.closest?.('[data-tab="evidence"]')){markSeen();setTimeout(syncBadge,40)}},true);

document.addEventListener('error',async event=>{
  const img=event.target;if(!(img instanceof HTMLImageElement)||!img.matches('[data-panel="evidence"] img[data-media-id]')||img.dataset.fullFallback==='1')return;
  img.dataset.fullFallback='1';
  const mediaId=img.dataset.mediaId;if(!mediaId||!db())return;
  try{
    const {data,error}=await db().from('media').select('storage_path,album').eq('id',mediaId).maybeSingle();if(error||!data?.storage_path)throw error||new Error('Missing media path');
    const bucket=data.album==='vault'?'btg-vault':'btg-evidence';const {data:signed,error:signError}=await db().storage.from(bucket).createSignedUrl(data.storage_path,1200);if(signError||!signed?.signedUrl)throw signError||new Error('Could not sign original');
    img.src=signed.signedUrl;
  }catch(error){console.warn('Evidence preview fallback unavailable.',error)}
},true);

const observer=new MutationObserver(()=>{clearTimeout(window.__gtgEvidenceParityTimer);window.__gtgEvidenceParityTimer=setTimeout(syncBadge,25)});
observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
window.addEventListener('pageshow',()=>setTimeout(syncBadge,80));
setTimeout(syncBadge,120);
})();
