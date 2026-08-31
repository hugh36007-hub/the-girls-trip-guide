/* Girls performance: load only styles required by the initial private-app shell. */
(()=>{
'use strict';
if(window.__GTG_CRITICAL_STYLE_LOADER__)return;window.__GTG_CRITICAL_STYLE_LOADER__=true;
const styles=[
 '/mobile-viewport-lock.css?v=2',
 '/girls-action-feedback.css?v=1',
 '/girls-drawer-fix.css?v=1',
 '/girls-hero-vault-ux.css?v=1',
 '/girls-final-refinement.css?v=1'
];
for(const href of styles){
 if(document.querySelector(`link[rel="stylesheet"][href="${href}"]`))continue;
 const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.gtgPerfStyle='1';document.head.appendChild(link);
}
})();
