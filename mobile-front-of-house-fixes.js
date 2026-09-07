(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
const path=clean(location.pathname);
const publicPaths=new Set(['/','/situation','/the-gals','/gals','/briefing','/free-vs-full']);
if(!publicPaths.has(path))return;

const style=document.createElement('style');
style.id='gtg-mobile-front-of-house-fixes';
style.textContent=`
@media(max-width:760px){
  /* Fully opaque mobile header: stop page content ghosting through the sticky shell. */
  html.gtg-white-site body .site-header{
    background:#fff!important;
    background-color:#fff!important;
    opacity:1!important;
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
    isolation:isolate!important;
    z-index:1000!important;
    border-bottom:1px solid rgba(25,19,22,.10)!important;
    box-shadow:0 3px 14px rgba(42,20,31,.07)!important;
  }
  html.gtg-white-site body .site-header .nav{background:#fff!important}
  html.gtg-white-site body .site-header .brand,
  html.gtg-white-site body .site-header .mobile-plan-link,
  html.gtg-white-site body .site-header .menu-button{position:relative!important;z-index:2!important}

  /* Briefing: on phones the image and copy become two deliberate blocks. No fog/gradient bridge. */
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero{
    min-height:0!important;
    height:auto!important;
    background:#070507!important;
    overflow:hidden!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero-image{
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
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero:after{display:none!important;content:none!important}
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero-inner{
    min-height:0!important;
    padding:24px 0 30px!important;
    display:block!important;
    background:#070507!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero-copy{
    position:static!important;
    max-width:none!important;
    padding:0!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero .eyebrow{
    position:static!important;
    display:block!important;
    margin:0 0 10px!important;
    color:#ff62ad!important;
    font-size:12px!important;
    line-height:1.25!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero .eyebrow span{display:inline!important;margin-right:6px!important}
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero h1{
    position:static!important;
    width:auto!important;
    max-width:none!important;
    margin:0!important;
    color:#fff!important;
    font-size:56px!important;
    line-height:.84!important;
    text-shadow:none!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero h1 span{color:#ff4fa3!important}
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero-copy>p{
    margin:18px 0 0!important;
    max-width:none!important;
    color:rgba(255,255,255,.92)!important;
    font-size:16px!important;
    line-height:1.52!important;
    text-shadow:none!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero-copy>p strong{color:#fff!important;margin-top:12px!important}
  html.gtg-white-site body[data-gtg-mobile-path="briefing"] .hero-rule{margin-top:20px!important;width:72px!important}

  /* GALS: same clean image-above / copy-below treatment; keep the image itself unobscured. */
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero{
    min-height:0!important;
    height:auto!important;
    background:#070507!important;
    overflow:hidden!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero-image{
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
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero:after{display:none!important;content:none!important}
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero-inner{
    min-height:0!important;
    padding:26px 0 32px!important;
    display:block!important;
    background:#070507!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero-copy{max-width:none!important;padding:0!important}
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero-kicker{
    margin:0 0 9px!important;
    color:#ff62ad!important;
    font-size:30px!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero h1{
    margin:0!important;
    color:#fff!important;
    font-size:56px!important;
    line-height:.84!important;
    text-shadow:none!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero h1 span{color:#ff4fa3!important}
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero-copy>p{
    margin:18px 0 0!important;
    color:rgba(255,255,255,.92)!important;
    font-size:15.5px!important;
    line-height:1.52!important;
    text-shadow:none!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="gals"] .hero-actions{margin-top:22px!important;gap:10px!important}

  /* Free vs Full: mobile comparison becomes a genuinely light three-column component. */
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix-wrap{
    overflow:visible!important;
    border:0!important;
    background:transparent!important;
    box-shadow:none!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix{
    display:block!important;
    width:100%!important;
    min-width:0!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix thead,
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix tbody{display:block!important}
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix thead tr{
    display:grid!important;
    grid-template-columns:minmax(0,1fr) 58px 76px!important;
    align-items:end!important;
    padding:0 8px 10px!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix th{
    padding:0!important;
    background:transparent!important;
    border:0!important;
    color:#191316!important;
    font-size:11px!important;
    line-height:1.15!important;
    text-align:center!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix th:first-child{font-size:0!important;color:transparent!important}
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix th:nth-child(3){color:#ed2f8b!important}
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix tbody{display:grid!important;gap:9px!important}
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix tbody tr{
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
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix td{
    min-width:0!important;
    min-height:78px!important;
    padding:14px 9px!important;
    border:0!important;
    background:#fff!important;
    color:#55454d!important;
    font-size:13.5px!important;
    line-height:1.35!important;
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix td:first-child{
    justify-content:flex-start!important;
    padding-left:16px!important;
    padding-right:12px!important;
    color:#30242a!important;
    font-weight:700!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix td:nth-child(2),
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix td:nth-child(3){
    width:auto!important;
    height:auto!important;
    min-height:78px!important;
    align-self:stretch!important;
    justify-self:stretch!important;
    border-radius:0!important;
    border-left:1px solid rgba(255,79,163,.18)!important;
    background:#fffafd!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix td.yes{
    color:#ed2f8b!important;
    font-size:27px!important;
    font-weight:900!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .matrix td.dash{
    color:#8b7882!important;
    font-size:20px!important;
    font-weight:600!important;
  }

  /* Full Trip feature cards: tighter mobile rhythm and one icon language. */
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .full-list{gap:12px!important}
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .full-item{
    grid-template-columns:52px minmax(0,1fr)!important;
    gap:15px!important;
    align-items:start!important;
    padding:18px!important;
    border-radius:16px!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .full-icon{
    width:50px!important;
    height:50px!important;
    border-radius:50%!important;
    display:grid!important;
    place-items:center!important;
    background:#fff3f8!important;
    border:1.5px solid rgba(255,79,163,.42)!important;
    color:#ed2f8b!important;
    box-shadow:0 7px 18px rgba(237,47,139,.07)!important;
    font-size:0!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .full-icon svg{
    width:25px!important;
    height:25px!important;
    fill:none!important;
    stroke:currentColor!important;
    stroke-width:1.8!important;
    stroke-linecap:round!important;
    stroke-linejoin:round!important;
    display:block!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .full-item h3{
    margin:1px 0 8px!important;
    font-size:29px!important;
    line-height:.98!important;
  }
  html.gtg-white-site body[data-gtg-mobile-path="free-vs-full"] .full-item p{
    font-size:14.5px!important;
    line-height:1.5!important;
  }

  /* General mobile spacing: keep headings below the sticky shell instead of visibly bleeding under it. */
  html.gtg-white-site body main{isolation:isolate!important}
}
`;
document.head.appendChild(style);

document.body.dataset.gtgMobilePath=path.replace(/^\//,'')||'home';

if(path==='/free-vs-full' && matchMedia('(max-width:760px)').matches){
  const icons=[
    `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.4"/><path d="M3 19c.5-3.5 2.5-5.4 5-5.4s4.6 1.9 5.1 5.4"/><path d="M13.7 14.5c3.8-.3 6 1.5 6.5 4.5"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17h9"/><path d="M7.5 17V9.5a4.5 4.5 0 0 1 9 0V17"/><path d="M5.5 17h12.5"/><path d="M10 20h4"/><path d="m17 5 2-2 2 2"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H9l-5 3v-14Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h3l1.4-2h5.2l1.4 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13.5" r="3.7"/></svg>`,
    `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></svg>`
  ];
  document.querySelectorAll('.full-list .full-icon').forEach((el,i)=>{if(icons[i])el.innerHTML=icons[i]});
}
})();