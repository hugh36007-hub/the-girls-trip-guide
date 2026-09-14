/* Girls critical styles: styling only. Runtime scripts are owned by girls-performance-loader.js. */
(()=>{
'use strict';
if(window.__GTG_CRITICAL_STYLE_LOADER__)return;
window.__GTG_CRITICAL_STYLE_LOADER__=true;
const route=()=>new globalThis.URL(location.href).searchParams.get('action')||'overview';
const evidence=()=>route()==='evidence';
if(evidence())document.documentElement.classList.add('gtg-evidence-route-pending');

const routeGuard=document.createElement('style');
routeGuard.id='gtg-route-paint-guard';
routeGuard.textContent='.gtg-evidence-route-pending .dashboard[data-home-composition="full"] [data-panel="evidence"].active{visibility:hidden!important}';
document.head.appendChild(routeGuard);

const BASE_STYLES=[
 '/mobile-viewport-lock.css?v=2',
 '/girls-action-feedback.css?v=1',
 '/girls-drawer-fix.css?v=1',
 '/girls-hero-vault-ux.css?v=1',
 '/girls-final-refinement.css?v=1',
 '/girls-date-focus-fix.css?v=1',
 '/live-dashboard-hero.css?v=10',
 '/girls-free-poll-hero-position.css?v=20260914-1'
];

for(const href of BASE_STYLES){
 if(document.querySelector(`link[rel="stylesheet"][href="${href}"]`))continue;
 const link=document.createElement('link');
 link.rel='stylesheet';
 link.href=href;
 link.dataset.gtgCritical='1';
 document.head.appendChild(link);
}
})();
