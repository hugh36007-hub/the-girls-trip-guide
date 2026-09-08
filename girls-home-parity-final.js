/* Girls Home parity final: dates/countdown/scale + short viewport poll clearance. */
(()=>{
'use strict';
if(window.__GTG_HOME_PARITY_FINAL__)return;window.__GTG_HOME_PARITY_FINAL__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,working=false,lastTrip='';
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const css=document.createElement('style');css.id='gtg-home-parity-final-css';css.textContent=`
.dashboard .hero-card.gtg-boys-layout .trip-stamp,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final{display:block!important;position:absolute!important;z-index:9!important;top:72px!important;right:16px!important;width:124px!important;box-sizing:border-box!important;margin:0!important;padding:13px 12px!important;border:1px solid rgba(255,79,163,.34)!important;border-radius:14px!important;background:rgba(12,7,11,.92)!important;color:#fff!important;text-align:left!important;box-shadow:none!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp b,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final b{display:block!important;margin:0 0 8px!important;color:#ff69ad!important;font-size:9px!important;font-weight:900!important;letter-spacing:.12em!important;text-transform:uppercase!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp span,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final span{display:block!important;color:#fff!important;font-size:11px!important;line-height:1.5!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp small,.dashboard .hero-card.gtg-boys-layout .trip-stamp button,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final button{display:block!important;width:100%!important;margin:8px 0 0!important;padding:7px 0 0!important;border:0!important;border-top:1px solid rgba(255,79,163,.18)!important;background:transparent!important;color:#ff69ad!important;font:900 8px/1.2 inherit!important;letter-spacing:.08em!important;text-align:left!important;text-transform:uppercase!important;cursor:pointer!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta h1{font-size:clamp(50px,7.8vw,72px)!important;line-height:.9!important;letter-spacing:-.025em!important}
@media(max-width:700px){
 .dashboard .hero-card.gtg-boys-layout .hero-meta h1{font-size:48px!important}
 .dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child{top:78px!important;max-width:64%!important}
}
@media(max-width:700px) and (max-height:700px){
 .dashboard .hero-card.gtg-boys-layout{min-height:300px!important}
 .dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child{top:66px!important}
 .dashboard .hero-card.gtg-boys-layout .gtg-countdown{top:12px!important;right:12px!important;padding:7px 10px!important}
 .dashboard .hero-card.gtg-boys-layout .trip-stamp,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final{top:52px!important;right:12px!important;padding:10px!important;width:118px!important}
 .dashboard .hero-card.gtg-boys-layout .hero-meta h1{font-size:44px!important}
 .gtg-home-poll-v2{padding:10px 12px 94px!important;margin-top:10px!important}
 .gtg-home-poll-v2 h3{margin:4px 0 7px!important;font-size:19px!important}
 .gtg-home-poll-v2 .opts{gap:6px!important}
 .gtg-home-poll-v2 .opts button{padding:8px 10px!important;min-height:34px!important}
}
`;
document.head.appendChild(css);
function dateOnlyUtc(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?Date.UTC(+m[1],+m[2]-1,+m[3]):NaN}
function daysTo(v){const start=dateOnlyUtc(v),now=new Date(),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());return Number.isFinite(start)?Math.max(0,Math.round((start-today)/86400000)):null}
function fmt(v){if(!v)return'TBC';const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);if(!m)return'TBC';return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],12)).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}
async function sync(){
 const u=new URL(location.href),tripId=u.searchParams.get('trip_id')||'',action=u.searchParams.get('action')||'overview';if(action!=='overview'||!tripId)return;
 const hero=document.querySelector('.dashboard .hero-card');if(!hero||working)return;working=true;
 try{
  const q=db();if(!q)return;
  const {data,error}=await q.from('trips').select('id,name,destination,start_date,end_date').eq('id',tripId).eq('product_key','girls').single();if(error||!data)return;
  hero.classList.add('gtg-boys-layout');
  const copy=hero.querySelector('.hero-meta>div:first-child'),h1=copy?.querySelector('h1'),p=copy?.querySelector('p');
  const year=String(data.start_date||'').slice(0,4);if(h1)h1.innerHTML=`${String(data.destination||'Trip').toUpperCase()}${year?` <span>${year}</span>`:''}`;
  if(p){const existing=p.textContent||'',count=(existing.match(/·\s*([^·]+)$/)||[])[1]||'';p.textContent=`${data.name}${count?` · ${count.trim()}`:''}`}
  let badge=hero.querySelector('.gtg-countdown');if(!badge){badge=document.createElement('div');badge.className='gtg-countdown';hero.appendChild(badge)}const n=daysTo(data.start_date);badge.textContent=n===0?'Trip day':Number.isFinite(n)?`${n} days to go`:'Trip dates';
  let stamp=hero.querySelector('.trip-stamp,.gtg-trip-stamp-final');if(!stamp){stamp=document.createElement('aside');stamp.className='gtg-trip-stamp-final';hero.appendChild(stamp)}
  const organiser=/organiser/i.test(document.querySelector('.trip-title')?.textContent||'');stamp.innerHTML=`<b>Trip dates</b><span>${fmt(data.start_date)}<br>${fmt(data.end_date)}</span>${organiser?'<button type="button" data-a="editTrip">Edit dates</button>':''}`;
  lastTrip=tripId;
 }catch(e){console.warn('Girls Home parity sync skipped',e)}finally{working=false}
}
let timer=0;const schedule=(ms=80)=>{clearTimeout(timer);timer=setTimeout(()=>void sync(),ms)};
const root=document.getElementById('app')||document.body;new MutationObserver(()=>schedule(120)).observe(root,{childList:true,subtree:false});window.addEventListener('popstate',()=>schedule(40));window.addEventListener('pageshow',()=>schedule(40));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule(40)});schedule(0);
})();
