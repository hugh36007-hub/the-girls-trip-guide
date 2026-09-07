(()=>{
'use strict';
const core='/script-core.js?v=20260907-1';
const theme='/sitewide-light.js?v=20260907-1';
const situation='/situation-image-fix.js?v=20260907-2';
const heroContrast='/the-gals-hero-contrast-fix.js?v=20260907-2';
const freeVsFull='/free-vs-full-refinement.js?v=20260907-1';
const galsRefine='/gals-page-refinement.js?v=20260907-1';
const briefingRefine='/briefing-page-refinement.js?v=20260907-1';
if(document.readyState==='loading'){
  document.write(`<script src="${core}"><\/script><script src="${theme}"><\/script><script src="${situation}"><\/script><script src="${heroContrast}"><\/script><script src="${freeVsFull}"><\/script><script src="${galsRefine}"><\/script><script src="${briefingRefine}"><\/script>`);
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
      d.addEventListener('load',()=>{
        const e=document.createElement('script');
        e.src=freeVsFull;
        e.async=false;
        e.addEventListener('load',()=>{
          const f=document.createElement('script');
          f.src=galsRefine;
          f.async=false;
          f.addEventListener('load',()=>{
            const g=document.createElement('script');
            g.src=briefingRefine;
            g.async=false;
            document.head.appendChild(g);
          });
          document.head.appendChild(f);
        });
        document.head.appendChild(e);
      });
      document.head.appendChild(d);
    });
    document.head.appendChild(c);
  });
  document.head.appendChild(b);
});
document.head.appendChild(a);
})();
