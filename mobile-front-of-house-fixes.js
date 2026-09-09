(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
const path=clean(location.pathname);
const publicPaths=new Set(['/','/situation','/the-gals','/gals','/briefing','/free-vs-full']);
if(!publicPaths.has(path))return;
document.body.dataset.gtgMobilePath=path.replace(/^\//,'')||'home';

const style=document.createElement('style');
style.id='gtg-mobile-front-of-house-fixes';
style.textContent=`
@media(max-width:760px){
  /* Mobile shell: fully opaque, compact and isolated from scrolling page content. */
  body[data-gtg-mobile-path] .site-header{
    position:sticky!important;
    top:0!important;
    z-index:5000!important;
    height:84px!important;
    min-height:84px!important;
    padding:0!important;
    background:#fff!important;
    background-color:#fff!important;
    opacity:1!important;
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
    isolation:isolate!important;
    border-bottom:1px solid rgba(25,19,22,.10)!important;
    box-shadow:0 3px 14px rgba(42,20,31,.07)!important;
  }
  body[data-gtg-mobile-path] .site-header .nav{
    height:84px!important;
    min-height:84px!important;
    background:#fff!important;
    align-items:center!important;
  }
  body[data-gtg-mobile-path] .site-header .brand{height:74px!important;display:flex!important;align-items:center!important}
  body[data-gtg-mobile-path] .site-header .brand img,
  body[data-gtg-mobile-path] .site-header img.brand-logo{height:68px!important;max-width:104px!important;width:auto!important;object-fit:contain!important}
  body[data-gtg-mobile-path] .site-header .mobile-plan-link{
    min-height:46px!important;
    padding:0 17px!important;
    border-radius:999px!important;
    background:#fff!important;
    color:#ed2f8b!important;
    border:1.5px solid rgba(237,47,139,.55)!important;
    box-shadow:none!important;
    font-size:12px!important;
  }
  body[data-gtg-mobile-path] .site-header .menu-button{
    width:44px!important;
    height:44px!important;
    min-width:44px!important;
    display:grid!important;
    place-items:center!important;
    background:#fff!important;
    color:#191316!important;
    border:0!important;
    font-size:28px!important;
    line-height:1!important;
  }
  body[data-gtg-mobile-path] main{position:relative!important;z-index:1!important;isolation:isolate!important}

  /* Briefing hero: use the clean mobile pattern already working on Situation — image first, copy second. */
  body[data-gtg-mobile-path="briefing"] .hero{
    display:block!important;
    min-height:0!important;
    height:auto!important;
    overflow:hidden!important;
    background:#070507!important;
    border-bottom:0!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero-image{
    position:relative!important;
    inset:auto!important;
    display:block!important;
    width:100%!important;
    max-width:none!important;
    height:auto!important;
    aspect-ratio:1672/941!important;
    object-fit:cover!important;
    object-position:center center!important;
    background:#070507!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero:before,
  body[data-gtg-mobile-path="briefing"] .hero:after{display:none!important;content:none!important;background:none!important}
  body[data-gtg-mobile-path="briefing"] .hero-inner{
    position:relative!important;
    min-height:0!important;
    width:100%!important;
    padding:25px 16px 30px!important;
    display:block!important;
    background:#070507!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero-inner.wrap{width:100%!important;margin:0!important}
  body[data-gtg-mobile-path="briefing"] .hero-copy{position:static!important;max-width:none!important;padding:0!important}
  body[data-gtg-mobile-path="briefing"] .hero .eyebrow{
    position:static!important;
    display:block!important;
    margin:0 0 10px!important;
    color:#ff62ad!important;
    font-size:12px!important;
    line-height:1.25!important;
    letter-spacing:.18em!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero .eyebrow span{display:inline!important;margin-right:6px!important}
  body[data-gtg-mobile-path="briefing"] .hero h1{
    position:static!important;
    width:auto!important;
    max-width:none!important;
    margin:0!important;
    color:#fff!important;
    font-size:54px!important;
    line-height:.84!important;
    text-shadow:none!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero h1 span{color:#ff4fa3!important}
  body[data-gtg-mobile-path="briefing"] .hero-copy>p{
    margin:18px 0 0!important;
    max-width:none!important;
    color:rgba(255,255,255,.90)!important;
    font-size:15px!important;
    line-height:1.52!important;
    text-shadow:none!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero-copy>p strong{display:block!important;color:#fff!important;margin-top:12px!important}
  body[data-gtg-mobile-path="briefing"] .hero-rule{margin-top:20px!important;width:74px!important;height:3px!important}

  /* Briefing rule icons must fit inside their frames, never crop/zoom. */
  body[data-gtg-mobile-path="briefing"] .rule-icon{overflow:hidden!important;background:#fff7fb!important}
  body[data-gtg-mobile-path="briefing"] .rule-icon img{
    width:100%!important;
    height:100%!important;
    object-fit:contain!important;
    object-position:center!important;
    transform:none!important;
    padding:2px!important;
  }

  /* GALS hero: clean image block then high-contrast copy block. */
  body[data-gtg-mobile-path="gals"] .hero{
    display:block!important;
    min-height:0!important;
    height:auto!important;
    overflow:hidden!important;
    background:#070507!important;
    border-bottom:0!important;
  }
  body[data-gtg-mobile-path="gals"] .hero-image{
    position:relative!important;
    inset:auto!important;
    display:block!important;
    width:100%!important;
    max-width:none!important;
    height:auto!important;
    aspect-ratio:1672/941!important;
    object-fit:cover!important;
    object-position:center center!important;
    background:#070507!important;
  }
  body[data-gtg-mobile-path="gals"] .hero:before,
  body[data-gtg-mobile-path="gals"] .hero:after{display:none!important;content:none!important;background:none!important}
  body[data-gtg-mobile-path="gals"] .hero-inner{
    position:relative!important;
    min-height:0!important;
    width:100%!important;
    padding:26px 16px 32px!important;
    display:block!important;
    background:#070507!important;
  }
  body[data-gtg-mobile-path="gals"] .hero-inner.wrap{width:100%!important;margin:0!important}
  body[data-gtg-mobile-path="gals"] .hero-copy{position:static!important;max-width:none!important;padding:0!important}
  body[data-gtg-mobile-path="gals"] .hero-kicker{
    margin:0 0 9px!important;
    color:#ff62ad!important;
    font-size:29px!important;
    line-height:1!important;
  }
  body[data-gtg-mobile-path="gals"] .hero h1{
    margin:0!important;
    color:#fff!important;
    font-size:54px!important;
    line-height:.84!important;
    text-shadow:none!important;
  }
  body[data-gtg-mobile-path="gals"] .hero h1 span{color:#ff4fa3!important}
  body[data-gtg-mobile-path="gals"] .hero-copy>p{
    margin:18px 0 0!important;
    color:rgba(255,255,255,.90)!important;
    font-size:15px!important;
    line-height:1.52!important;
    text-shadow:none!important;
  }
  body[data-gtg-mobile-path="gals"] .hero-actions{margin-top:22px!important;gap:10px!important}
  body[data-gtg-mobile-path="gals"] .hero-actions .cta{min-height:50px!important}

  /* Free vs Full matrix: remove legacy black cells and make it a true mobile three-column card list. */
  body[data-gtg-mobile-path="free-vs-full"] .matrix-section,
  body[data-gtg-mobile-path="free-vs-full"] .matrix-section.gtg-light-surface{background:#fff!important}
  body[data-gtg-mobile-path="free-vs-full"] .matrix-wrap{
    overflow:visible!important;
    border:0!important;
    background:transparent!important;
    box-shadow:none!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix{
    display:block!important;
    width:100%!important;
    min-width:0!important;
    border:0!important;
    border-collapse:separate!important;
    background:transparent!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix thead,
  body[data-gtg-mobile-path="free-vs-full"] .matrix tbody{display:block!important;background:transparent!important}
  body[data-gtg-mobile-path="free-vs-full"] .matrix thead tr{
    display:grid!important;
    grid-template-columns:minmax(0,1fr) 58px 76px!important;
    align-items:end!important;
    padding:0 8px 10px!important;
    background:transparent!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix th{
    padding:0!important;
    background:transparent!important;
    border:0!important;
    color:#191316!important;
    font-size:11px!important;
    line-height:1.15!important;
    text-align:center!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix th:first-child{font-size:0!important;color:transparent!important}
  body[data-gtg-mobile-path="free-vs-full"] .matrix th:nth-child(3){color:#ed2f8b!important}
  body[data-gtg-mobile-path="free-vs-full"] .matrix tbody{display:grid!important;gap:9px!important}
  body[data-gtg-mobile-path="free-vs-full"] .matrix tbody tr{
    display:grid!important;
    grid-template-columns:minmax(0,1fr) 58px 76px!important;
    align-items:stretch!important;
    min-height:78px!important;
    overflow:hidden!important;
    background:#fff!important;
    border:1.5px solid rgba(255,79,163,.34)!important;
    border-radius:14px!important;
    box-shadow:0 8px 22px rgba(63,28,46,.05)!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix td,
  body[data-gtg-mobile-path="free-vs-full"] .matrix td:nth-child(2),
  body[data-gtg-mobile-path="free-vs-full"] .matrix td:nth-child(3){
    min-width:0!important;
    min-height:78px!important;
    width:auto!important;
    height:auto!important;
    padding:14px 9px!important;
    border:0!important;
    border-radius:0!important;
    background:#fff!important;
    color:#55454d!important;
    font-size:13.5px!important;
    line-height:1.35!important;
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix td:first-child{
    justify-content:flex-start!important;
    padding-left:16px!important;
    padding-right:12px!important;
    color:#30242a!important;
    font-weight:700!important;
    text-align:left!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix td:nth-child(2),
  body[data-gtg-mobile-path="free-vs-full"] .matrix td:nth-child(3){
    background:#fffafd!important;
    border-left:1px solid rgba(255,79,163,.18)!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix td.yes{
    color:#ed2f8b!important;
    font-size:27px!important;
    font-weight:900!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .matrix td.dash{
    color:#8b7882!important;
    font-size:20px!important;
    font-weight:600!important;
  }

  /* Full Trip feature cards: compact mobile layout with one coherent icon language. */
  body[data-gtg-mobile-path="free-vs-full"] .full-list{gap:12px!important}
  body[data-gtg-mobile-path="free-vs-full"] .full-item{
    grid-template-columns:52px minmax(0,1fr)!important;
    gap:15px!important;
    align-items:start!important;
    padding:18px!important;
    border-radius:16px!important;
    background:#fff!important;
    border:1.5px solid rgba(255,79,163,.30)!important;
    box-shadow:0 10px 26px rgba(63,28,46,.05)!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .full-icon{
    width:50px!important;
    height:50px!important;
    min-width:50px!important;
    border-radius:50%!important;
    display:grid!important;
    place-items:center!important;
    background:#fff3f8!important;
    border:1.5px solid rgba(255,79,163,.42)!important;
    color:#ed2f8b!important;
    box-shadow:0 7px 18px rgba(237,47,139,.07)!important;
    font-size:0!important;
    overflow:hidden!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .full-icon svg{
    width:25px!important;
    height:25px!important;
    fill:none!important;
    stroke:currentColor!important;
    stroke-width:1.8!important;
    stroke-linecap:round!important;
    stroke-linejoin:round!important;
    display:block!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .full-item h3{
    margin:1px 0 8px!important;
    color:#191316!important;
    font-size:29px!important;
    line-height:.98!important;
  }
  body[data-gtg-mobile-path="free-vs-full"] .full-item p{
    color:#5e4d56!important;
    font-size:14.5px!important;
    line-height:1.5!important;
  }

  /* Prevent large public-page sections from carrying desktop spacing into narrow viewports. */
  body[data-gtg-mobile-path="briefing"] .brief-row{padding-top:27px!important;padding-bottom:27px!important}
  body[data-gtg-mobile-path="free-vs-full"] .section{padding-top:48px!important;padding-bottom:48px!important}
}
`;
document.head.appendChild(style);

const FEATURE_ICONS=[
  `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.4"/><path d="M3 19c.5-3.5 2.5-5.4 5-5.4s4.6 1.9 5.1 5.4"/><path d="M13.7 14.5c3.8-.3 6 1.5 6.5 4.5"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.2"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M8 12h8M10 17h4"/><circle cx="7" cy="7" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="12" cy="17" r="1.5"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h3l1.4-2h5.2l1.4 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13.5" r="3.7"/></svg>`,
  `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></svg>`
];
function applyFeatureIcons(){
  if(path!=='/free-vs-full'||!matchMedia('(max-width:760px)').matches)return;
  document.querySelectorAll('.full-list .full-icon').forEach((el,i)=>{
    if(FEATURE_ICONS[i]&&el.innerHTML!==FEATURE_ICONS[i])el.innerHTML=FEATURE_ICONS[i];
  });
}
applyFeatureIcons();
const observer=new MutationObserver(()=>applyFeatureIcons());
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',applyFeatureIcons,{passive:true});
})();