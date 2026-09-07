(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/the-gals')return;

const style=document.createElement('style');
style.id='the-gals-hero-contrast-fix';
style.textContent=`
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
`;
document.head.appendChild(style);
})();
