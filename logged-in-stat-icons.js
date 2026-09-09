(()=>{
'use strict';
if(document.getElementById('gtg-stat-icon-refinement-v2'))return;

/* Remove the v1 DOM-injected icons. The cards already have stable data-tab hooks,
   so v2 uses CSS pseudo-elements only. This cannot escape or float outside a card. */
document.querySelectorAll('.gtg-stat-icon').forEach(el=>el.remove());

const old=document.getElementById('gtg-stat-icon-refinement');
if(old)old.remove();

const style=document.createElement('style');
style.id='gtg-stat-icon-refinement-v2';
style.textContent=`
html.gtg-app-light .stat-row>.stat{
  display:grid!important;
  grid-template-columns:52px minmax(0,1fr)!important;
  grid-template-rows:auto auto auto!important;
  column-gap:14px!important;
  row-gap:2px!important;
  align-items:center!important;
  padding:16px 18px!important;
  text-align:left!important;
  overflow:hidden!important;
}

html.gtg-app-light .stat-row>.stat::before{
  content:""!important;
  display:block!important;
  grid-column:1!important;
  grid-row:1 / span 3!important;
  width:50px!important;
  height:50px!important;
  box-sizing:border-box!important;
  border-radius:50%!important;
  border:1.5px solid rgba(255,79,163,.34)!important;
  background-color:#fff0f6!important;
  background-repeat:no-repeat!important;
  background-position:center!important;
  background-size:25px 25px!important;
  box-shadow:0 7px 18px rgba(237,47,139,.08)!important;
  align-self:center!important;
  justify-self:start!important;
  position:static!important;
  inset:auto!important;
  transform:none!important;
}
html.gtg-app-light .stat-row>.stat::after{content:none!important;display:none!important}

html.gtg-app-light .stat-row>.stat[data-tab="plan"]::before{
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ed2f8b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='5' y='4' width='14' height='17' rx='2'/%3E%3Cpath d='M9 4.5V3h6v1.5M9 11l1.6 1.6L14 9.2M9 16h6'/%3E%3C/svg%3E")!important;
}
html.gtg-app-light .stat-row>.stat[data-tab="money"]::before{
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ed2f8b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16.2 7.2c-.7-1.5-2-2.4-3.8-2.4-2.3 0-4 1.6-4 3.9v6.8M6.5 11.2h7M6.5 15.5h10M8.4 15.5c0 2-1 3.1-2.7 3.7h11.1'/%3E%3C/svg%3E")!important;
}
html.gtg-app-light .stat-row>.stat[data-tab="evidence"]::before{
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ed2f8b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 7.5h3l1.3-2h5.4l1.3 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z'/%3E%3Ccircle cx='12' cy='13.5' r='3.7'/%3E%3C/svg%3E")!important;
}
html.gtg-app-light .stat-row>.stat[data-tab="group"]::before{
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ed2f8b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='9' cy='8' r='3'/%3E%3Ccircle cx='17' cy='9' r='2.4'/%3E%3Cpath d='M3.5 19c.4-3.4 2.5-5.3 5.5-5.3s5.1 1.9 5.5 5.3M14.5 14.5c3.6-.3 5.5 1.5 6 4.5'/%3E%3C/svg%3E")!important;
}

html.gtg-app-light .stat-row>.stat>b,
html.gtg-app-light .stat-row>.stat>span,
html.gtg-app-light .stat-row>.stat>small{
  grid-column:2!important;
  min-width:0!important;
  position:static!important;
  transform:none!important;
}
html.gtg-app-light .stat-row>.stat>b{grid-row:1!important;margin:0!important;line-height:1!important}
html.gtg-app-light .stat-row>.stat>span{grid-row:2!important;margin-top:2px!important}
html.gtg-app-light .stat-row>.stat>small{grid-row:3!important;margin-top:4px!important}

html.gtg-app-light .stat-row>.stat:hover::before{
  border-color:rgba(255,79,163,.56)!important;
  background-color:#ffe8f3!important;
  box-shadow:0 9px 21px rgba(237,47,139,.12)!important;
}

@media(max-width:600px){
  html.gtg-app-light .stat-row>.stat{
    grid-template-columns:44px minmax(0,1fr)!important;
    column-gap:11px!important;
    padding:13px!important;
  }
  html.gtg-app-light .stat-row>.stat::before{
    width:42px!important;
    height:42px!important;
    background-size:22px 22px!important;
  }
}
`;
document.head.appendChild(style);

/* Clean up any stale v1 icon node after app rerenders during this session. */
const app=document.getElementById('app');
if(app)new MutationObserver(()=>document.querySelectorAll('.gtg-stat-icon').forEach(el=>el.remove())).observe(app,{childList:true,subtree:true});
})();
