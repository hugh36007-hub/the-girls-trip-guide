(()=>{
'use strict';
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistration('/').then(reg=>reg?.update()).catch(()=>{});}
const core='/script-core.js?v=20260907-1';
const theme='/sitewide-light.js?v=20260907-2';
const heroSurface='/hero-surface-correction.js?v=20260907-1';
const situation='/situation-image-fix.js?v=20260907-3';
const heroContrast='/the-gals-hero-contrast-fix.js?v=20260907-3';
const freeVsFull='/free-vs-full-refinement.js?v=20260907-1';
const galsRefine='/gals-page-refinement.js?v=20260907-2';
const briefingRefine='/briefing-page-refinement.js?v=20260907-5';
const appLight='/logged-in-light-theme.js?v=20260907-1';
const mobilePublic='/mobile-front-of-house-fixes.js?v=20260907-2';
const briefingMobile='/briefing-mobile-hero-fix.js?v=20260907-1';
const homeFade='/homepage-hero-fade-fix.js?v=20260907-6';
const batchPublic='/girls-batch1-public-safe.js?v=20260907-1';

// Public informational pages must render the approved image mark even if a later
// sitewide refinement script is delayed or exits early on a non-product route.
const normalisePublicHeader=()=>{
  const header=document.getElementById('siteHeader');
  if(!header) return;
  const brand=header.querySelector('.brand');
  if(brand){
    brand.classList.add('site-logo');
    brand.setAttribute('aria-label','The Girls Trip Guide home');
    brand.setAttribute('href','/');
    if(!brand.querySelector('img')){
      brand.innerHTML='<img src="/assets/images/girls-trip-guide-logo.webp" alt="The Girls Trip Guide — Good Plans. Better Stories." loading="eager" decoding="async">';
    }
    Object.assign(brand.style,{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'120px',height:'72px',flex:'0 0 120px',marginRight:'auto',overflow:'hidden',background:'transparent'});
    const img=brand.querySelector('img');
    if(img) Object.assign(img.style,{display:'block',width:'120px',height:'auto',maxWidth:'none'});
  }
  const nav=document.getElementById('navLinks');
  if(nav&&nav.children.length<5){
    nav.innerHTML='<a href="/situation">So… what’s the plan?</a><a href="/the-gals#how-it-works">How It Works</a><a href="/free-vs-full">Free vs Full</a><a href="/gals">The GALS</a><a href="/briefing">The Briefing</a>';
  }
};
normalisePublicHeader();
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',normalisePublicHeader,{once:true});

const addInsightsFooterLink=()=>{
  const footer=document.querySelector('.footer');
  if(!footer||footer.querySelector('a[href="/insights"],a[href="/insights.html"],a[href="insights.html"]')) return;
  const links=[...footer.querySelectorAll('a')];
  const marker=links.find(a=>/sitemap/i.test(a.textContent||''))||links.find(a=>/^home$/i.test((a.textContent||'').trim()));
  if(!marker||!marker.parentNode) return;
  const link=document.createElement('a');
  link.href='/insights';
  link.textContent='Research & Insights';
  marker.parentNode.insertBefore(link,marker);
};
addInsightsFooterLink();
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addInsightsFooterLink,{once:true});
if(document.readyState==='loading'){
  document.write(`<script src="${core}"><\/script><script src="${theme}"><\/script><script src="${heroSurface}"><\/script><script src="${situation}"><\/script><script src="${heroContrast}"><\/script><script src="${freeVsFull}"><\/script><script src="${galsRefine}"><\/script><script src="${briefingRefine}"><\/script><script src="${appLight}"><\/script><script src="${mobilePublic}"><\/script><script src="${briefingMobile}"><\/script><script src="${homeFade}"><\/script><script src="${batchPublic}"><\/script>`);
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
                    const bm=document.createElement('script');
                    bm.src=briefingMobile;
                    bm.async=false;
                    bm.addEventListener('load',()=>{
                      const hf=document.createElement('script');
                      hf.src=homeFade;
                      hf.async=false;
                      hf.addEventListener('load',()=>{
                        const bp=document.createElement('script');
                        bp.src=batchPublic;
                        bp.async=false;
                        bp.addEventListener('load',()=>{normalisePublicHeader();addInsightsFooterLink();});
                        document.head.appendChild(bp);
                      });
                      document.head.appendChild(hf);
                    });
                    document.head.appendChild(bm);
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
