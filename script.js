(()=>{
'use strict';
const core='/script-core.js?v=20260907-1';
const theme='/sitewide-light.js?v=20260907-1';
const situation='/situation-image-fix.js?v=20260907-2';
const heroContrast='/the-gals-hero-contrast-fix.js?v=20260907-1';
if(document.readyState==='loading'){
  document.write(`<script src="${core}"><\/script><script src="${theme}"><\/script><script src="${situation}"><\/script><script src="${heroContrast}"><\/script>`);
  return;
}
const a=document.createElement('script');
a.src=core;
a.async=false;
a.addEventListener('load',()=>{
  const b=document.createElement('script');
  b.src=theme;
  b.async=false;
  b.addEventListener('load',()=>{
    const c=document.createElement('script');
    c.src=situation;
    c.async=false;
    c.addEventListener('load',()=>{
      const d=document.createElement('script');
      d.src=heroContrast;
      d.async=false;
      document.head.appendChild(d);
    });
    document.head.appendChild(c);
  });
  document.head.appendChild(b);
});
document.head.appendChild(a);
})();