(()=>{
'use strict';
if('serviceWorker' in navigator){navigator.serviceWorker.getRegistration('/').then(reg=>reg?.update()).catch(()=>{});}
const core='/script-core.js?v=20260909-2';
const theme='/sitewide-light.js?v=20260909-3';
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
const cleanPath=p=>((p||'/').replace(/\/+$/,'')||'/').replace(/\.html$/,'');
const path=cleanPath(location.pathname);
const RESEARCH_PATHS=new Set(['/insights','/group-trip-photo-problem']);
const isResearch=RESEARCH_PATHS.has(path);

const forceApprovedHeader=()=>{
  const header=document.getElementById('siteHeader');
  if(!header)return;
  const brand=header.querySelector('.brand');
  if(brand){
    brand.className='brand site-logo';
    brand.href='/';
    brand.setAttribute('aria-label','The Girls Trip Guide home');
    brand.innerHTML='<img src="/assets/images/hero-trans.png" alt="The Girls Trip Guide — Good Plans. Better Stories." loading="eager" decoding="async">';
    brand.removeAttribute('style');
    const img=brand.querySelector('img');
    if(img)img.removeAttribute('style');
  }
  const navLinks=document.getElementById('navLinks');
  if(navLinks){
    navLinks.innerHTML='<a href="/situation">So… what’s the plan?</a><a href="/the-gals#how-it-works">How It Works</a><a href="/free-vs-full">Free vs Full</a><a href="/gals">The GALS</a><a href="/briefing">The Briefing</a>';
  }
  const button=document.getElementById('menuButton');
  const nav=button?.parentElement;
  if(button&&nav){
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','mobileNavigation');
    if(!nav.querySelector('.mobile-plan-link')){
      const a=document.createElement('a');a.className='mobile-plan-link';a.href='/create-trip';a.textContent='Plan your trip';nav.insertBefore(a,button);
    }
    if(!header.querySelector('.mobile-drawer')){
      const d=document.createElement('nav');d.className='mobile-drawer';d.id='mobileNavigation';d.setAttribute('aria-label','Mobile navigation');
      d.innerHTML='<a href="/situation">So… what’s the plan?</a><a href="/the-gals#how-it-works">How It Works</a><a href="/free-vs-full">Free vs Full</a><a href="/gals">The GALS</a><a href="/briefing">The Briefing</a><a href="/create-trip">Create a Free Trip</a>';
      header.appendChild(d);
      d.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{header.classList.remove('open');button.setAttribute('aria-expanded','false')}));
    }
    if(!button.dataset.sharedShellBound){
      button.dataset.sharedShellBound='true';
      button.addEventListener('click',()=>{const open=header.classList.toggle('open');button.setAttribute('aria-expanded',String(open))});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('open')){header.classList.remove('open');button.setAttribute('aria-expanded','false');button.focus()}});
    }
  }
};
forceApprovedHeader();
document.addEventListener('DOMContentLoaded',forceApprovedHeader,{once:true});
window.addEventListener('load',forceApprovedHeader,{once:true});

const addInsightsFooterLink=()=>{
  const footer=document.querySelector('.footer');
  if(!footer||footer.querySelector('a[href="/insights"],a[href="/insights.html"],a[href="insights.html"]')) return;
  const links=[...footer.querySelectorAll('a')];
  const marker=links.find(a=>/sitemap/i.test(a.textContent||''))||links.find(a=>/^home$/i.test((a.textContent||'').trim()));
  if(!marker||!marker.parentNode) return;
  const link=document.createElement('a');link.href='/insights';link.textContent='Research & Insights';marker.parentNode.insertBefore(link,marker);
};
addInsightsFooterLink();
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addInsightsFooterLink,{once:true});

// Research pages own their SEO/article schema. Load the shared visual shell only,
// avoiding script-core's product-route metadata fallback.
if(isResearch){
  if(document.readyState==='loading'){
    document.write(`<script src="${theme}"><\/script>`);
  }else{
    const t=document.createElement('script');t.src=theme;t.async=false;t.addEventListener('load',forceApprovedHeader,{once:true});document.head.appendChild(t);
  }
  return;
}

if(document.readyState==='loading'){
  document.write(`<script src="${core}"><\/script><script src="${theme}"><\/script><script src="${heroSurface}"><\/script><script src="${situation}"><\/script><script src="${heroContrast}"><\/script><script src="${freeVsFull}"><\/script><script src="${galsRefine}"><\/script><script src="${briefingRefine}"><\/script><script src="${appLight}"><\/script><script src="${mobilePublic}"><\/script><script src="${briefingMobile}"><\/script><script src="${homeFade}"><\/script><script src="${batchPublic}"><\/script>`);
  return;
}
const a=document.createElement('script');
a.src=core;a.async=false;
a.addEventListener('load',()=>{
  const b=document.createElement('script');b.src=theme;b.async=false;
  b.addEventListener('load',()=>{
    const hs=document.createElement('script');hs.src=heroSurface;hs.async=false;
    hs.addEventListener('load',()=>{
      const c=document.createElement('script');c.src=situation;c.async=false;
      c.addEventListener('load',()=>{
        const d=document.createElement('script');d.src=heroContrast;d.async=false;
        d.addEventListener('load',()=>{
          const e=document.createElement('script');e.src=freeVsFull;e.async=false;
          e.addEventListener('load',()=>{
            const f=document.createElement('script');f.src=galsRefine;f.async=false;
            f.addEventListener('load',()=>{
              const g=document.createElement('script');g.src=briefingRefine;g.async=false;
              g.addEventListener('load',()=>{
                const h=document.createElement('script');h.src=appLight;h.async=false;
                h.addEventListener('load',()=>{
                  const m=document.createElement('script');m.src=mobilePublic;m.async=false;
                  m.addEventListener('load',()=>{
                    const bm=document.createElement('script');bm.src=briefingMobile;bm.async=false;
                    bm.addEventListener('load',()=>{
                      const hf=document.createElement('script');hf.src=homeFade;hf.async=false;
                      hf.addEventListener('load',()=>{
                        const bp=document.createElement('script');bp.src=batchPublic;bp.async=false;bp.addEventListener('load',forceApprovedHeader,{once:true});document.head.appendChild(bp);
                      });document.head.appendChild(hf);
                    });document.head.appendChild(bm);
                  });document.head.appendChild(m);
                });document.head.appendChild(h);
              });document.head.appendChild(g);
            });document.head.appendChild(f);
          });document.head.appendChild(e);
        });document.head.appendChild(d);
      });document.head.appendChild(c);
    });document.head.appendChild(hs);
  });document.head.appendChild(b);
});
document.head.appendChild(a);
})();