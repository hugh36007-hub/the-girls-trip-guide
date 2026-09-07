(()=>{
'use strict';
const NEW_LOGO='/assets/images/hero-trans.png';
const NEW_LOGO_ABS=`https://thegirlstripguide.com${NEW_LOGO}`;
const PUBLIC_PATHS=new Set(['/','/situation','/the-gals','/free-vs-full','/gals','/briefing','/contact','/terms','/privacy','/cookie-policy','/refund-policy','/safety','/create-trip','/full-trip']);
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
const currentPath=clean(location.pathname);

function wireLogo(){
  document.querySelectorAll('img').forEach(img=>{
    const src=img.getAttribute('src')||'';
    const isBrand=src.includes('girls-trip-guide-logo')||!!img.closest('.site-header .brand,.footer .brand,.site-logo');
    if(!isBrand)return;
    if(img.getAttribute('src')!==NEW_LOGO)img.setAttribute('src',NEW_LOGO);
    img.alt='The Girls Trip Guide — Good Plans. Better Stories.';
    img.style.background='transparent';
  });
  document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"]').forEach(link=>link.setAttribute('href',NEW_LOGO));
  document.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"]').forEach(meta=>{
    const value=meta.getAttribute('content')||'';
    if(value.includes('girls-trip-guide-logo'))meta.setAttribute('content',NEW_LOGO_ABS);
  });
  document.querySelectorAll('script[data-site-schema]').forEach(schema=>{
    if(schema.textContent.includes('girls-trip-guide-logo'))schema.textContent=schema.textContent.replaceAll('https://thegirlstripguide.com/assets/images/girls-trip-guide-logo.webp',NEW_LOGO_ABS).replaceAll('https://thegirlstripguide.com/assets/images/girls-trip-guide-logo.png',NEW_LOGO_ABS);
  });
}

wireLogo();
const theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.setAttribute('content','#ffffff');
const scheme=document.querySelector('meta[name="color-scheme"]');if(scheme)scheme.setAttribute('content','light');
document.documentElement.classList.add('gtg-white-site');
if(PUBLIC_PATHS.has(currentPath))document.documentElement.classList.add('gtg-public-page');

if(PUBLIC_PATHS.has(currentPath)){
  document.querySelectorAll('main > section').forEach(section=>{
    const cls=(section.className||'').toString().toLowerCase();
    const bg=getComputedStyle(section).backgroundImage||'';
    const photographic=bg.includes('url(')||cls.includes('plan-hero')||cls.includes('product-hero')||cls.includes('hero-shell');
    if(!photographic)section.classList.add('gtg-light-surface');
  });
}

const css=document.createElement('style');
css.id='gtg-sitewide-white-theme';
css.textContent=`
html.gtg-white-site,html.gtg-white-site body{background:#fff!important;color:#191316!important}
html.gtg-white-site body .site-header{background:rgba(255,255,255,.98)!important;border-bottom:1px solid rgba(25,19,22,.10)!important;box-shadow:0 1px 10px rgba(25,19,22,.045)!important}
html.gtg-white-site body .site-header .brand,html.gtg-white-site body .site-header .brand.site-logo{background:transparent!important;overflow:visible!important}
html.gtg-white-site body .site-header .brand img,html.gtg-white-site body .site-header img.brand-logo,html.gtg-white-site body .site-header .brand.site-logo img{display:block!important;width:auto!important;height:70px!important;max-width:112px!important;object-fit:contain!important;background:transparent!important}
html.gtg-white-site body .site-header .nav-links a{color:#191316!important}
html.gtg-white-site body .site-header .nav-links a:hover,html.gtg-white-site body .site-header .nav-links a.active{color:#ed2f8b!important}
html.gtg-white-site body .site-header .nav-cta{background:#ff4fa3!important;color:#fff!important;box-shadow:0 10px 24px rgba(237,47,139,.18)!important}
html.gtg-white-site body .site-header .menu-button{color:#191316!important}
html.gtg-white-site body .site-header .mobile-plan-link{background:#fff!important;color:#ed2f8b!important;border-color:rgba(255,79,163,.7)!important}
html.gtg-white-site body .site-header .mobile-drawer{background:#fff!important;border-color:rgba(255,79,163,.18)!important;box-shadow:0 16px 30px rgba(35,18,27,.12)!important}
html.gtg-white-site body .site-header .mobile-drawer a{color:#191316!important;border-bottom-color:rgba(25,19,22,.08)!important}

html.gtg-public-page body main{background:#fff!important;color:#191316!important}
html.gtg-public-page body main>section.gtg-light-surface{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.14)!important}
html.gtg-public-page body main>section.gtg-light-surface h1,
html.gtg-public-page body main>section.gtg-light-surface h2,
html.gtg-public-page body main>section.gtg-light-surface h3,
html.gtg-public-page body main>section.gtg-light-surface h4,
html.gtg-public-page body main>section.gtg-light-surface strong{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.055)}
html.gtg-public-page body main>section.gtg-light-surface p,
html.gtg-public-page body main>section.gtg-light-surface li,
html.gtg-public-page body main>section.gtg-light-surface small,
html.gtg-public-page body main>section.gtg-light-surface td{color:#55454d!important}
html.gtg-public-page body main>section.gtg-light-surface .scribble,
html.gtg-public-page body main>section.gtg-light-surface .eyebrow,
html.gtg-public-page body main>section.gtg-light-surface .kicker,
html.gtg-public-page body main>section.gtg-light-surface [class*="kicker"],
html.gtg-public-page body main>section.gtg-light-surface .quote,
html.gtg-public-page body main>section.gtg-light-surface .handoff,
html.gtg-public-page body main>section.gtg-light-surface .fun-note,
html.gtg-public-page body main>section.gtg-light-surface .trip-tools-note,
html.gtg-public-page body main>section.gtg-light-surface .role,
html.gtg-public-page body main>section.gtg-light-surface h1 span,
html.gtg-public-page body main>section.gtg-light-surface h2 span{color:#ed2f8b!important}

html.gtg-public-page body main>section.gtg-light-surface [class*="card"],
html.gtg-public-page body main>section.gtg-light-surface [class*="statement"],
html.gtg-public-page body main>section.gtg-light-surface [class*="choice"],
html.gtg-public-page body main>section.gtg-light-surface [class*="faq-item"],
html.gtg-public-page body main>section.gtg-light-surface [class*="full-item"],
html.gtg-public-page body main>section.gtg-light-surface [class*="matrix-wrap"],
html.gtg-public-page body main>section.gtg-light-surface [class*="how-upgrade"]{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.32)!important;box-shadow:0 16px 42px rgba(68,31,49,.08)!important}
html.gtg-public-page body main>section.gtg-light-surface [class*="card"] p,
html.gtg-public-page body main>section.gtg-light-surface [class*="statement"] p,
html.gtg-public-page body main>section.gtg-light-surface [class*="choice"] p,
html.gtg-public-page body main>section.gtg-light-surface [class*="faq-item"] p,
html.gtg-public-page body main>section.gtg-light-surface [class*="full-item"] p,
html.gtg-public-page body main>section.gtg-light-surface [class*="how-upgrade"] p{color:#55454d!important}
html.gtg-public-page body main>section.gtg-light-surface table th{color:#191316!important;background:rgba(255,79,163,.07)!important;border-color:rgba(25,19,22,.08)!important}
html.gtg-public-page body main>section.gtg-light-surface table td{background:#fff!important;border-color:rgba(25,19,22,.08)!important}
html.gtg-public-page body main>section.gtg-light-surface .yes,
html.gtg-public-page body main>section.gtg-light-surface .gals-line,
html.gtg-public-page body main>section.gtg-light-surface .choice-label,
html.gtg-public-page body main>section.gtg-light-surface .tag{color:#ed2f8b!important}
html.gtg-public-page body main>section.gtg-light-surface .cta.primary,
html.gtg-public-page body main>section.gtg-light-surface .button.primary,
html.gtg-public-page body main>section.gtg-light-surface .gals-cta,
html.gtg-public-page body main>section.gtg-light-surface .upgrade-cta{background:#ff4fa3!important;color:#fff!important;border-color:#ff4fa3!important}
html.gtg-public-page body main>section.gtg-light-surface .cta.secondary,
html.gtg-public-page body main>section.gtg-light-surface .button:not(.primary){background:#fff!important;color:#ed2f8b!important;border-color:rgba(255,79,163,.58)!important}

html.gtg-white-site body .footer{background:#fff!important;color:#191316!important;border-top:1px solid rgba(255,79,163,.13)!important}
html.gtg-white-site body .footer .brand,html.gtg-white-site body .footer .brand.site-logo{background:transparent!important;overflow:visible!important}
html.gtg-white-site body .footer .brand img,html.gtg-white-site body .footer img.brand-logo,html.gtg-white-site body .footer .brand.site-logo img{display:block!important;width:auto!important;height:104px!important;max-width:150px!important;object-fit:contain!important;background:transparent!important}
html.gtg-white-site body .footer h3{color:#ed2f8b!important}
html.gtg-white-site body .footer a:not(.brand){color:#55454d!important}
html.gtg-white-site body .footer p{color:#6c5962!important}
html.gtg-white-site body .footer .footer-bottom{border-top-color:rgba(25,19,22,.10)!important;color:#8a7881!important}
@media(max-width:700px){
 html.gtg-white-site body .site-header .brand img,html.gtg-white-site body .site-header img.brand-logo,html.gtg-white-site body .site-header .brand.site-logo img{height:62px!important;max-width:92px!important}
 html.gtg-white-site body .footer .brand img,html.gtg-white-site body .footer img.brand-logo,html.gtg-white-site body .footer .brand.site-logo img{height:96px!important;max-width:138px!important}
}
`;
document.head.appendChild(css);
wireLogo();
})();