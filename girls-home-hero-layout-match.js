(()=>{
'use strict';
if(window.__GTG_HOME_HERO_LAYOUT_MATCH__)return;window.__GTG_HOME_HERO_LAYOUT_MATCH__=true;
const SUPA='https://vtcmvwixfqyxqghibsla.supabase.co';
const KEY='sb_publishable_qBQzJjFxSToEGxPJEcmskg_GNd4M4cP';
let client=null,working=false,cachedTrip=null;
const db=()=>client||(client=window.supabase?.createClient?.(SUPA,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const css=document.createElement('style');css.id='gtg-home-hero-layout-match-css';css.textContent=`
.dashboard .hero-card.gtg-boys-layout{position:relative!important;min-height:340px!important;overflow:hidden!important;background:radial-gradient(circle at 82% 12%,rgba(255,79,163,.12),transparent 30%),linear-gradient(145deg,#1b1218 0%,#100b0f 50%,#080608 100%)!important;border-color:rgba(255,79,163,.32)!important}
.dashboard .hero-card.gtg-boys-layout>img{display:none!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta{position:absolute!important;inset:0!important;display:block!important;padding:0!important;z-index:2!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child{position:absolute!important;left:24px!important;top:78px!important;max-width:64%!important;color:#fff!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child>.eyebrow{display:none!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta h1{margin:0!important;color:#fff!important;font-size:clamp(50px,7.8vw,72px)!important;line-height:.9!important;letter-spacing:-.025em!important}
.dashboard .hero-card.gtg-boys-layout .hero-meta h1 span{color:#ff69ad!important;white-space:nowrap}
.dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child>p{margin:15px 0 0!important;padding-left:12px!important;border-left:2px solid #ff4fa3!important;color:#f3e7ed!important;font-size:13px!important}
.dashboard .hero-card.gtg-boys-layout .gtg-countdown{position:absolute!important;z-index:9!important;top:14px!important;right:14px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:30px!important;padding:7px 10px!important;border:1px solid rgba(255,79,163,.48)!important;border-radius:999px!important;background:rgba(12,7,11,.9)!important;color:#ff69ad!important;font-size:9px!important;font-weight:900!important;letter-spacing:.13em!important;line-height:1!important;text-transform:uppercase!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final{display:block!important;position:absolute!important;z-index:9!important;top:56px!important;right:14px!important;bottom:auto!important;left:auto!important;width:122px!important;min-width:0!important;max-width:122px!important;box-sizing:border-box!important;margin:0!important;padding:12px 10px!important;border:1px solid rgba(255,79,163,.3)!important;border-radius:14px!important;background:rgba(12,7,11,.9)!important;color:#fff!important;text-align:left!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp b,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final b{display:block!important;margin:0 0 8px!important;color:#ff69ad!important;font-size:9px!important;font-weight:900!important;letter-spacing:.12em!important;text-transform:uppercase!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp span,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final span{display:block!important;color:#fff!important;font-size:11px!important;line-height:1.45!important}
.dashboard .hero-card.gtg-boys-layout .trip-stamp small,.dashboard .hero-card.gtg-boys-layout .trip-stamp button,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final button{display:block!important;width:100%!important;margin:8px 0 0!important;padding:7px 0 0!important;border:0!important;border-top:1px solid rgba(255,79,163,.18)!important;background:transparent!important;color:#ff69ad!important;font-size:8px!important;font-weight:900!important;letter-spacing:.08em!important;text-align:left!important;text-transform:uppercase!important;cursor:pointer!important}
@media(max-width:700px){
 .dashboard .hero-card.gtg-boys-layout .hero-meta h1{font-size:48px!important}
 .dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child{left:24px!important;top:78px!important;max-width:64%!important}
}
/* Narrow phones such as 390px iPhones need a smaller single-line destination/year title.
   The date card is already compact; this prevents the title from running underneath it. */
@media(max-width:400px){
 .dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child{left:22px!important;max-width:calc(100% - 154px)!important}
 .dashboard .hero-card.gtg-boys-layout .hero-meta h1{font-size:40px!important;letter-spacing:-.04em!important;white-space:nowrap!important}
 .dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child>p{font-size:12px!important}
}
@media(max-width:700px) and (max-height:700px){
 .dashboard .hero-card.gtg-boys-layout{min-height:300px!important}
 .dashboard .hero-card.gtg-boys-layout .hero-meta>div:first-child{top:66px!important}
 .dashboard .hero-card.gtg-boys-layout .hero-meta h1{font-size:44px!important}
 .dashboard .hero-card.gtg-boys-layout .gtg-countdown{top:12px!important;right:12px!important}
 .dashboard .hero-card.gtg-boys-layout .trip-stamp,.dashboard .hero-card.gtg-boys-layout .gtg-trip-stamp-final{top:52px!important;right:12px!important;padding:10px!important;width:118px!important}
 .gtg-home-poll-v2{padding:10px 12px 94px!important;margin-top:10px!important;margin-bottom:0!important}
 .gtg-home-poll-v2 h3{margin:4px 0 7px!important;font-size:19px!important;line-height:1.15!important}
 .gtg-home-poll-v2 .opts{gap:6px!important}
 .gtg-home-poll-v2 .opts button{padding:8px 10px!important;min-height:34px!important}
}
`;
document.head.appendChild(css);
function dateUtc(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?Date.UTC(+m[1],+m[2]-1,+m[3]):NaN}
function daysTo(v){const start=dateUtc(v),now=new Date(),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());return Number.isFinite(start)?Math.max(0,Math.round((start-today)/86400000)):null}
function fmt(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(!m)return'TBC';return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],12)).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}
async function getTrip(id){if(cachedTrip?.id===id)return cachedTrip;const q=db();if(!q)return null;const {data,error}=await q.from('trips').select('id,name,destination,start_date,end_date').eq('id',id).eq('product_key','girls').single();if(error)throw error;cachedTrip=data||null;return cachedTrip}
async function sync(){
 const u=new URL(location.href),action=u.searchParams.get('action')||'overview',tripId=u.searchParams.get('trip_id')||'';if(action!=='overview'||!tripId||working)return;
 const hero=document.querySelector('.dashboard .hero-card');if(!hero)return;working=true;
 try{
  const trip=await getTrip(tripId);if(!trip)return;hero.classList.add('gtg-boys-layout');
  const copy=hero.querySelector('.hero-meta>div:first-child'),h1=copy?.querySelector('h1'),p=copy?.querySelector('p');
  const year=String(trip.start_date||'').slice(0,4);if(h1)h1.innerHTML=`${String(trip.destination||'Trip').toUpperCase()}${year?` <span>${year}</span>`:''}`;
  const count=document.querySelector('.stat[data-tab="group"] b')?.textContent?.trim()||'';if(p)p.textContent=`${trip.name}${count?` · ${count} group`:''}`;
  let badge=hero.querySelector('.gtg-countdown');if(!badge){badge=document.createElement('div');badge.className='gtg-countdown';hero.appendChild(badge)}const n=daysTo(trip.start_date);badge.textContent=n===0?'Trip day':Number.isFinite(n)?`${n} days to go`:'Trip dates';
  let stamp=hero.querySelector('.trip-stamp,.gtg-trip-stamp-final');if(!stamp){stamp=document.createElement('aside');stamp.className='gtg-trip-stamp-final';hero.appendChild(stamp)}
  const organiser=/organiser/i.test(document.querySelector('.trip-title')?.textContent||'');stamp.innerHTML=`<b>Trip dates</b><span>${fmt(trip.start_date)}<br>${fmt(trip.end_date)}</span>${organiser?'<button type="button" data-a="editTrip">Edit dates</button>':''}`;
 }catch(e){console.warn('Girls Home hero parity sync skipped',e)}finally{working=false}
}
let timer=0;const schedule=(ms=80)=>{clearTimeout(timer);timer=setTimeout(()=>void sync(),ms)};
const root=document.getElementById('app')||document.body;new MutationObserver(()=>schedule(120)).observe(root,{childList:true,subtree:false});window.addEventListener('popstate',()=>{cachedTrip=null;schedule(40)});window.addEventListener('pageshow',()=>schedule(40));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule(40)});schedule(0);
})();