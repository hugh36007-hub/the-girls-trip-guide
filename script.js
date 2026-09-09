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

const applyResearchShellStyles=()=>{
  if(!isResearch||document.getElementById('gtg-research-shell'))return;
  const style=document.createElement('style');
  style.id='gtg-research-shell';
  style.textContent=`
.site-header{height:82px!important;position:relative;z-index:100}
.site-header .wrap.nav{width:min(1500px,calc(100% - 48px))!important;max-width:none!important;height:82px!important;min-height:82px!important;margin:0 auto!important;padding:0!important;display:flex!important;align-items:center!important;gap:24px!important}
.brand.site-logo{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:120px!important;height:72px!important;overflow:visible!important;flex:0 0 120px!important;margin-right:auto!important;background:transparent!important}
.brand.site-logo img{display:block!important;width:auto!important;height:70px!important;max-width:112px!important;object-fit:contain!important}
.nav-links{display:flex!important;align-items:center!important;gap:22px!important;margin:0!important;padding:0!important;font:800 11px/1 Inter,Arial,sans-serif!important;text-transform:uppercase!important;white-space:nowrap!important}
.nav-links a{display:inline-flex!important;align-items:center!important;min-height:42px!important}
.nav-cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:150px!important;min-width:150px!important;max-width:150px!important;height:46px!important;min-height:46px!important;margin:0!important;padding:0!important;border-radius:10px!important;font:900 12px/1 Inter,Arial,sans-serif!important;text-transform:uppercase!important;white-space:nowrap!important}
.mobile-plan-link,.mobile-drawer{display:none!important}
.menu-button{border:0;background:transparent;cursor:pointer}
@media(max-width:1120px) and (min-width:701px){.site-header .wrap.nav{gap:14px!important}.nav-links{gap:12px!important;font-size:10px!important}.nav-cta{width:140px!important;min-width:140px!important;max-width:140px!important;font-size:10px!important}.brand.site-logo{width:100px!important;flex-basis:100px!important}.brand.site-logo img{max-width:100px!important}}
@media(max-width:700px){
 .site-header{position:sticky!important;top:0!important;height:auto!important}
 .site-header .wrap.nav{width:min(100% - 32px,1500px)!important;height:76px!important;min-height:76px!important;gap:8px!important;flex-wrap:nowrap!important;align-items:center!important;position:relative!important}
 .brand.site-logo{width:96px!important;height:66px!important;flex:0 0 96px!important}.brand.site-logo img{height:62px!important;max-width:92px!important}
 .nav-links,.site-header.open .nav-links,.nav-cta{display:none!important}
 .mobile-plan-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;margin-left:auto!important;min-height:34px!important;padding:0 12px!important;border:1px solid rgba(255,79,163,.78)!important;border-radius:999px!important;font:900 9px/1 Inter,Arial,sans-serif!important;letter-spacing:.045em!important;text-transform:uppercase!important;white-space:nowrap!important}
 .menu-button{display:flex!important;align-items:center!important;justify-content:center!important;width:44px!important;height:44px!important;flex:0 0 44px!important;margin-left:0!important;padding:0!important;font-size:27px!important;line-height:1!important}
 .mobile-drawer{position:absolute!important;left:0!important;right:0!important;top:100%!important;z-index:100!important;display:none!important;padding:14px 18px 18px!important;border-top:1px solid rgba(255,79,163,.16)!important;border-bottom:1px solid rgba(255,79,163,.28)!important}
 .site-header.open .mobile-drawer{display:grid!important;gap:3px!important}
 .mobile-drawer a{display:flex!important;align-items:center!important;justify-content:space-between!important;min-height:48px!important;padding:0 8px!important;border-bottom:1px solid rgba(25,19,22,.08)!important;font:800 12px/1 Inter,Arial,sans-serif!important;letter-spacing:.06em!important;text-transform:uppercase!important}
 .mobile-drawer a:last-child{border-bottom:0!important}.mobile-drawer a::after{content:'→';color:#ff70b7;font-size:14px}
}`;
  document.head.appendChild(style);
};
applyResearchShellStyles();

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
  if(navLinks){navLinks.innerHTML='<a href="/situation">So… what’s the plan?</a><a href="/the-gals#how-it-works">How It Works</a><a href="/free-vs-full">Free vs Full</a><a href="/gals">The GALS</a><a href="/briefing">The Briefing</a>';}
  const button=document.getElementById('menuButton');
  const nav=button?.parentElement;
  if(button&&nav){
    button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','mobileNavigation');
    if(!nav.querySelector('.mobile-plan-link')){const a=document.createElement('a');a.className='mobile-plan-link';a.href='/create-trip';a.textContent='Plan your trip';nav.insertBefore(a,button);}
    if(!header.querySelector('.mobile-drawer')){
      const d=document.createElement('nav');d.className='mobile-drawer';d.id='mobileNavigation';d.setAttribute('aria-label','Mobile navigation');d.innerHTML='<a href="/situation">So… what’s the plan?</a><a href="/the-gals#how-it-works">How It Works</a><a href="/free-vs-full">Free vs Full</a><a href="/gals">The GALS</a><a href="/briefing">The Briefing</a><a href="/create-trip">Create a Free Trip</a>';header.appendChild(d);d.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{header.classList.remove('open');button.setAttribute('aria-expanded','false')}));
    }
    if(!button.dataset.sharedShellBound){button.dataset.sharedShellBound='true';button.addEventListener('click',()=>{const open=header.classList.toggle('open');button.setAttribute('aria-expanded',String(open))});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('open')){header.classList.remove('open');button.setAttribute('aria-expanded','false');button.focus()}});}
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
  if(document.readyState==='loading'){document.write(`<script src="${theme}"><\/script>`);}else{const t=document.createElement('script');t.src=theme;t.async=false;t.addEventListener('load',forceApprovedHeader,{once:true});document.head.appendChild(t);}
  return;
}

if(document.readyState==='loading'){
  document.write(`<script src="${core}"><\/script><script src="${theme}"><\/script><script src="${heroSurface}"><\/script><script src="${situation}"><\/script><script src="${heroContrast}"><\/script><script src="${freeVsFull}"><\/script><script src="${galsRefine}"><\/script><script src="${briefingRefine}"><\/script><script src="${appLight}"><\/script><script src="${mobilePublic}"><\/script><script src="${briefingMobile}"><\/script><script src="${homeFade}"><\/script><script src="${batchPublic}"><\/script>`);
  return;
}
const a=document.createElement('script');a.src=core;a.async=false;
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
                      hf.addEventListener('load',()=>{const bp=document.createElement('script');bp.src=batchPublic;bp.async=false;bp.addEventListener('load',forceApprovedHeader,{once:true});document.head.appendChild(bp);});document.head.appendChild(hf);
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