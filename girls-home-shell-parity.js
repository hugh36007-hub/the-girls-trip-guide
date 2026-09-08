/* Girls Home shell parity: restore approved branding and use Boys-style compact screen discipline. */
(()=>{
'use strict';
if(window.__GTG_HOME_SHELL_PARITY__)return;window.__GTG_HOME_SHELL_PARITY__=true;
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/create-trip')return;

const style=document.createElement('style');
style.id='gtg-home-shell-parity-css';
style.textContent=`
html.gtg-home-shell .appbar{height:60px!important;min-height:60px!important;background:rgba(255,255,255,.985)!important;border-bottom:1px solid rgba(255,79,163,.18)!important;box-shadow:0 1px 10px rgba(40,20,30,.045)!important}
html.gtg-home-shell .appbar .appbar-inner{width:min(100% - 24px,1280px)!important;height:60px!important;gap:9px!important}
html.gtg-home-shell .appbar .brand{display:flex!important;align-items:center!important;flex:0 0 auto!important;margin:0!important;padding:0!important;background:transparent!important}
html.gtg-home-shell .appbar .brand img{display:block!important;width:58px!important;height:48px!important;max-width:58px!important;object-fit:contain!important;background:transparent!important;border-radius:0!important}
html.gtg-home-shell .appbar .trip-title{display:block!important;margin:0 2px 0 auto!important;min-width:0!important;text-align:right!important}
html.gtg-home-shell .appbar .trip-title strong{display:block!important;max-width:155px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font:800 14px/1 'Barlow Condensed',sans-serif!important;color:#191316!important;text-transform:none!important;letter-spacing:.01em!important}
html.gtg-home-shell .appbar .trip-title span{display:block!important;max-width:155px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;margin-top:4px!important;font-size:8.5px!important;font-weight:800!important;color:#9a7487!important;text-transform:uppercase!important;letter-spacing:.10em!important}
html.gtg-home-shell .appbar .icon-btn{width:40px!important;height:40px!important;flex:0 0 40px!important;border-radius:12px!important}
html.gtg-home-shell .dashboard{padding-top:10px!important;padding-bottom:148px!important}
html.gtg-home-shell .dock{height:62px!important;bottom:max(8px,env(safe-area-inset-bottom))!important;width:min(640px,calc(100% - 24px))!important;padding:6px!important;border-radius:20px!important}
html.gtg-home-shell .dock button{border-radius:13px!important;gap:2px!important}
html.gtg-home-shell .dock button span{font-size:16px!important}
html.gtg-home-shell .dock button small{font-size:8px!important}
@media(max-width:600px){
 html.gtg-home-shell .appbar{height:58px!important;min-height:58px!important}
 html.gtg-home-shell .appbar .appbar-inner{height:58px!important;width:calc(100% - 20px)!important;gap:8px!important}
 html.gtg-home-shell .appbar .brand img{width:54px!important;height:44px!important;max-width:54px!important}
 html.gtg-home-shell .appbar .trip-title strong{font-size:13px!important;max-width:132px!important}
 html.gtg-home-shell .appbar .trip-title span{font-size:8px!important;max-width:132px!important}
 html.gtg-home-shell .appbar .icon-btn{width:38px!important;height:38px!important;flex-basis:38px!important}
 html.gtg-home-shell .dashboard{padding-top:8px!important;padding-bottom:138px!important}
 html.gtg-home-shell .dock{height:58px!important;bottom:max(6px,env(safe-area-inset-bottom))!important;width:calc(100% - 20px)!important;padding:5px!important;border-radius:18px!important}
 html.gtg-home-shell .dock button span{font-size:15px!important}
 html.gtg-home-shell .dock button small{font-size:7.5px!important}
}
`;
document.head.appendChild(style);

function action(){return new URL(location.href).searchParams.get('action')||'overview'}
function sync(){
 const home=action()==='overview';
 document.documentElement.classList.toggle('gtg-home-shell',home);
 const appbar=document.querySelector('.appbar');
 if(!appbar)return;
 appbar.classList.toggle('gtg-home-appbar',home);
 if(!home)return;
 const img=appbar.querySelector('.brand img');
 if(img){
   img.src='/assets/images/girls-trip-guide-logo.png';
   img.alt='The Girls Trip Guide';
   img.removeAttribute('width');img.removeAttribute('height');
 }
 const title=appbar.querySelector('.trip-title');
 if(title)title.style.removeProperty('display');
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})}
const root=document.getElementById('app')||document.body;
new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
window.addEventListener('popstate',schedule);
window.addEventListener('pageshow',schedule);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule()});
schedule();
})();
