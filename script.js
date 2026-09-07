(()=>{
'use strict';
const core='/script-core.js?v=20260907-1';
const theme='/sitewide-light.js?v=20260907-2';
const heroSurface='/hero-surface-correction.js?v=20260907-1';
const situation='/situation-image-fix.js?v=20260907-3';
const heroContrast='/the-gals-hero-contrast-fix.js?v=20260907-3';
const freeVsFull='/free-vs-full-refinement.js?v=20260907-1';
const galsRefine='/gals-page-refinement.js?v=20260907-2';
const briefingRefine='/briefing-page-refinement.js?v=20260907-4';
const appLight='/logged-in-light-theme.js?v=20260907-1';
const mobilePublic='/mobile-front-of-house-fixes.js?v=20260907-2';
const homeFade='/homepage-hero-fade-fix.js?v=20260907-2';
const batch1='/girls-batch1-public.js?v=20260907-1';
if(document.readyState==='loading'){
  document.write(`<script src="${core}"><\/script><script src="${theme}"><\/script><script src="${heroSurface}"><\/script><script src="${situation}"><\/script><script src="${heroContrast}"><\/script><script src="${freeVsFull}"><\/script><script src="${galsRefine}"><\/script><script src="${briefingRefine}"><\/script><script src="${appLight}"><\/script><script src="${mobilePublic}"><\/script><script src="${homeFade}"><\/script><script src="${batch1}"><\/script>`);
  return;
}
const sources=[core,theme,heroSurface,situation,heroContrast,freeVsFull,galsRefine,briefingRefine,appLight,mobilePublic,homeFade,batch1];
let chain=Promise.resolve();
for(const src of sources){chain=chain.then(()=>new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=resolve;document.head.appendChild(s)}));}
})();
