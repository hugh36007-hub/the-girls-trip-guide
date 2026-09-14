/* Girls inner-page header authority: Home keeps branding; Plan/Money/Group/Evidence keep trip context visible. */
(()=>{
'use strict';
if(window.__GTG_COMPACT_INNER_HEADER__)return;window.__GTG_COMPACT_INNER_HEADER__=true;
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/create-trip')return;

const style=document.createElement('style');
style.id='gtg-compact-inner-header-css';
style.textContent=`
html.gtg-app-light .appbar.gtg-inner-appbar{min-height:48px!important;padding:5px 12px!important}
html.gtg-app-light .appbar.gtg-inner-appbar .appbar-inner{min-height:38px!important;gap:8px!important}
html.gtg-app-light .appbar.gtg-inner-appbar .brand{display:none!important}
html.gtg-app-light .appbar.gtg-inner-appbar .trip-title{margin:0 auto 0 0!important;min-width:0!important;display:flex!important;align-items:baseline!important;gap:6px!important;text-align:left!important}
html.gtg-app-light .appbar.gtg-inner-appbar .trip-title strong{display:block!important;max-width:150px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#191316!important;font-size:12px!important;font-weight:800!important;letter-spacing:.02em!important}
html.gtg-app-light .appbar.gtg-inner-appbar .trip-title span{display:block!important;max-width:170px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#9a7487!important;font-size:8px!important;font-weight:800!important;letter-spacing:.11em!important;text-transform:uppercase!important}
html.gtg-app-light .appbar.gtg-inner-appbar .trip-title span:before{content:'· ';color:#cdb7c2!important}
html.gtg-app-light .appbar.gtg-inner-appbar .icon-btn{width:38px!important;height:38px!important;flex:0 0 38px!important;border-radius:12px!important}
html.gtg-app-light .appbar.gtg-inner-appbar + .dashboard{padding-top:9px!important}
@media(max-width:390px){
 html.gtg-app-light .appbar.gtg-inner-appbar{min-height:52px!important}
 html.gtg-app-light .appbar.gtg-inner-appbar .appbar-inner{min-height:42px!important}
 html.gtg-app-light .appbar.gtg-inner-appbar .trip-title{display:grid!important;align-content:center!important;align-items:center!important;gap:1px!important}
 html.gtg-app-light .appbar.gtg-inner-appbar .trip-title strong{max-width:220px!important}
 html.gtg-app-light .appbar.gtg-inner-appbar .trip-title span{display:block!important;max-width:220px!important;margin-top:0!important}
 html.gtg-app-light .appbar.gtg-inner-appbar .trip-title span:before{content:none!important}
}
`;
document.head.appendChild(style);

function action(){return new URL(location.href).searchParams.get('action')||'overview'}
function sync(){
 const appbar=document.querySelector('.appbar');if(!appbar)return;
 const inner=['plan','money','group','evidence'].includes(action());
 appbar.classList.toggle('gtg-inner-appbar',inner);
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})}
const root=document.getElementById('app')||document.body;
new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
window.addEventListener('popstate',schedule);
window.addEventListener('pageshow',schedule);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule()});
schedule();
})();
