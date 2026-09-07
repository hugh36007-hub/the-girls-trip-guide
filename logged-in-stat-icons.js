(()=>{
'use strict';
if(document.getElementById('gtg-stat-icon-refinement'))return;

const ICONS={
  plan:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="m9 11 1.6 1.6L14 9.2"/><path d="M9 16h6"/></svg>`,
  money:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.2 7.2c-.7-1.5-2-2.4-3.8-2.4-2.3 0-4 1.6-4 3.9v6.8"/><path d="M6.5 11.2h7"/><path d="M6.5 15.5h10"/><path d="M8.4 15.5c0 2-1 3.1-2.7 3.7h11.1"/></svg>`,
  evidence:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h3l1.3-2h5.4l1.3 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13.5" r="3.7"/></svg>`,
  group:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 19c.4-3.4 2.5-5.3 5.5-5.3s5.1 1.9 5.5 5.3"/><path d="M14.5 14.5c3.6-.3 5.5 1.5 6 4.5"/></svg>`
};

const style=document.createElement('style');
style.id='gtg-stat-icon-refinement';
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
}
html.gtg-app-light .stat-row>.stat::before,
html.gtg-app-light .stat-row>.stat::after{content:none!important;display:none!important}
html.gtg-app-light .stat-row>.stat>.gtg-stat-icon{
  grid-column:1!important;
  grid-row:1 / span 3!important;
  width:50px!important;
  height:50px!important;
  border-radius:50%!important;
  display:grid!important;
  place-items:center!important;
  background:linear-gradient(180deg,#fff7fb 0%,#ffeaf4 100%)!important;
  border:1.5px solid rgba(255,79,163,.34)!important;
  box-shadow:0 8px 18px rgba(237,47,139,.08)!important;
  color:#ed2f8b!important;
  flex:none!important;
}
html.gtg-app-light .stat-row>.stat>.gtg-stat-icon svg{
  width:25px!important;
  height:25px!important;
  fill:none!important;
  stroke:currentColor!important;
  stroke-width:1.8!important;
  stroke-linecap:round!important;
  stroke-linejoin:round!important;
  display:block!important;
}
html.gtg-app-light .stat-row>.stat>b,
html.gtg-app-light .stat-row>.stat>span:not(.gtg-stat-icon),
html.gtg-app-light .stat-row>.stat>small{grid-column:2!important;min-width:0!important}
html.gtg-app-light .stat-row>.stat>b{grid-row:1!important;margin:0!important;line-height:1!important}
html.gtg-app-light .stat-row>.stat>span:not(.gtg-stat-icon){grid-row:2!important;margin-top:2px!important}
html.gtg-app-light .stat-row>.stat>small{grid-row:3!important;margin-top:4px!important}
html.gtg-app-light .stat-row>.stat:hover>.gtg-stat-icon{
  border-color:rgba(255,79,163,.56)!important;
  background:linear-gradient(180deg,#fff3f9 0%,#ffe4f1 100%)!important;
  box-shadow:0 10px 22px rgba(237,47,139,.12)!important;
}
@media(max-width:600px){
  html.gtg-app-light .stat-row>.stat{grid-template-columns:44px minmax(0,1fr)!important;column-gap:11px!important;padding:13px!important}
  html.gtg-app-light .stat-row>.stat>.gtg-stat-icon{width:42px!important;height:42px!important}
  html.gtg-app-light .stat-row>.stat>.gtg-stat-icon svg{width:22px!important;height:22px!important}
}
`;
document.head.appendChild(style);

function refine(){
  document.querySelectorAll('.stat-row>.stat[data-tab]').forEach(btn=>{
    const key=btn.dataset.tab;
    if(!ICONS[key]||btn.querySelector(':scope>.gtg-stat-icon'))return;
    const icon=document.createElement('span');
    icon.className='gtg-stat-icon';
    icon.setAttribute('aria-hidden','true');
    icon.innerHTML=ICONS[key];
    btn.prepend(icon);
  });
}

refine();
const app=document.getElementById('app');
if(app)new MutationObserver(refine).observe(app,{childList:true,subtree:true});
window.addEventListener('popstate',()=>requestAnimationFrame(refine));
})();
