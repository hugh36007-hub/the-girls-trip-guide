(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/the-gals')return;

const style=document.createElement('style');
style.id='the-gals-hero-contrast-fix';
style.textContent=`
/* Dark photographic hero contrast */
html.gtg-white-site body .hero-shell,
html.gtg-white-site body .hero-shell .hero,
html.gtg-white-site body .hero-shell .hero-copy{color:#fff!important}
html.gtg-white-site body .hero-shell .hero-copy h1{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.3)!important}
html.gtg-white-site body .hero-shell .hero-copy h1 span{color:#ff4fa3!important}
html.gtg-white-site body .hero-shell .hero-copy .eyebrow{color:#ff4fa3!important}
html.gtg-white-site body .hero-shell .hero-copy .lead{color:rgba(255,255,255,.88)!important;text-shadow:0 1px 8px rgba(0,0,0,.22)!important}
html.gtg-white-site body .hero-shell .hero-copy .button:not(.primary){color:#fff!important;border-color:rgba(255,255,255,.72)!important;background:rgba(5,3,5,.34)!important;box-shadow:none!important}
html.gtg-white-site body .hero-shell .hero-copy .button:not(.primary):hover{border-color:#ff4fa3!important;color:#ff8bc3!important;background:rgba(5,3,5,.48)!important}
html.gtg-white-site body .hero-shell .hero-copy .button.primary{background:#ff4fa3!important;border-color:#ff4fa3!important;color:#10080d!important}

/* Light-theme card consistency */
html.gtg-white-site body .benefit-card,
html.gtg-white-site body .how-card,
html.gtg-white-site body .how-upgrade{
  background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;
  border:1.5px solid rgba(255,79,163,.38)!important;
  box-shadow:0 16px 38px rgba(63,28,46,.075)!important;
}
html.gtg-white-site body .how-card h3,
html.gtg-white-site body .how-upgrade h3{color:#191316!important}
html.gtg-white-site body .how-card p,
html.gtg-white-site body .how-upgrade p{color:#55454d!important}
html.gtg-white-site body .how-number,
html.gtg-white-site body .upgrade-number{color:#fff!important;-webkit-text-stroke:1.5px #ff4fa3!important}

/* Full Trip pills — restore contrast on white */
html.gtg-white-site body .upgrade-points span{
  background:#fff3f8!important;
  border:1.25px solid rgba(255,79,163,.46)!important;
  color:#8b355f!important;
  box-shadow:0 6px 16px rgba(63,28,46,.045)!important;
  font-weight:800!important;
}

/* Step 05 tighter, clearer */
html.gtg-white-site body .how-upgrade{
  padding:24px 28px!important;
  gap:24px!important;
}
html.gtg-white-site body .upgrade-kicker{color:#8a6576!important}

/* Footer line under the steps — was washed out after white conversion */
html.gtg-white-site body .how-footer{
  color:#55454d!important;
  margin-top:26px!important;
  text-shadow:none!important;
}
html.gtg-white-site body .how-footer:before{color:#ff4fa3!important}
html.gtg-white-site body .how-footer:after{background:linear-gradient(90deg,transparent,rgba(255,79,163,.56),transparent)!important}

@media(max-width:700px){
 html.gtg-white-site body .how-upgrade{padding:20px!important;gap:12px!important}
 html.gtg-white-site body .upgrade-points span{min-height:38px!important;color:#7a2f54!important}
 html.gtg-white-site body .how-footer{margin-top:22px!important;color:#55454d!important}
}
`;
document.head.appendChild(style);
})();
