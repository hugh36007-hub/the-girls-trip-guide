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
const batch1='/girls-batch1-public.js?v=20260907-2';
if(document.readyState==='loading'){
  document.write(`<script src="${core}"><\/script><script src="${theme}"><\/script><script src="${heroSurface}"><\/script><script src="${situation}"><\/script><script src="${heroContrast}"><\/script><script src="${freeVsFull}"><\/script><script src="${galsRefine}"><\/script><script src="${briefingRefine}"><\/script><script src="${appLight}"><\/script><script src="${mobilePublic}"><\/script><script src="${homeFade}"><\/script><script src="${batch1}"><\/script>`);
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
    const hs=document.createElement('script');
    hs.src=heroSurface;
    hs.async=false;
    hs.addEventListener('load',()=>{
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
              g.addEventListener('load',()=>{
                const h=document.createElement('script');
                h.src=appLight;
                h.async=false;
                h.addEventListener('load',()=>{
                  const m=document.createElement('script');
                  m.src=mobilePublic;
                  m.async=false;
                  m.addEventListener('load',()=>{
                    const hf=document.createElement('script');
                    hf.src=homeFade;
                    hf.async=false;
                    hf.addEventListener('load',()=>{
                      const p=document.createElement('script');
                      p.src=batch1;
                      p.async=false;
                      document.head.appendChild(p);
                    });
                    document.head.appendChild(hf);
                  });
                  document.head.appendChild(m);
                });
                document.head.appendChild(h);
              });
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
    document.head.appendChild(hs);
  });
  document.head.appendChild(b);
});
document.head.appendChild(a);
})();