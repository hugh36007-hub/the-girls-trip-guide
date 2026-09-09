(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/free-vs-full')return;

const style=document.createElement('style');
style.id='free-vs-full-refinement';
style.textContent=`
/* Free vs Full — scoped light-theme refinement */
html.gtg-white-site body .hero{padding:68px 0 64px!important;background:#fff!important;border-bottom:1px solid rgba(255,79,163,.16)!important}
html.gtg-white-site body .hero:before{background:linear-gradient(90deg,transparent,rgba(255,79,163,.42),transparent)!important}
html.gtg-white-site body .hero h1{color:#191316!important;text-shadow:0 2px 12px rgba(48,22,34,.075)!important}
html.gtg-white-site body .hero h1 span{color:#ed2f8b!important}
html.gtg-white-site body .hero-copy>p{color:#55454d!important}
html.gtg-white-site body .hero .scribble{color:#ed2f8b!important}
html.gtg-white-site body .hero-card{background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.40)!important;box-shadow:0 20px 48px rgba(63,28,46,.10)!important;color:#191316!important}
html.gtg-white-site body .hero-card strong,html.gtg-white-site body .hero-card .price b{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.055)!important}
html.gtg-white-site body .hero-card p{color:#55454d!important}
html.gtg-white-site body .hero-card .price{border-top-color:rgba(25,19,22,.10)!important}

html.gtg-white-site body .section{padding:64px 0!important}
html.gtg-white-site body .section-head{margin-bottom:32px!important}
html.gtg-white-site body .section-head>p:last-child{margin-top:16px!important}

html.gtg-white-site body .statement{align-items:center!important;margin-bottom:34px!important;padding:30px 32px!important;background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.36)!important;box-shadow:0 16px 38px rgba(63,28,46,.075)!important}
html.gtg-white-site body .statement .big{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.055)!important}
html.gtg-white-site body .statement .big span{color:#ed2f8b!important}
html.gtg-white-site body .statement p{color:#55454d!important}

html.gtg-white-site body .feature-grid{gap:18px!important}
html.gtg-white-site body .feature{padding:28px!important;background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.40)!important;box-shadow:0 16px 38px rgba(63,28,46,.08)!important;color:#191316!important}
html.gtg-white-site body .feature-num{color:#ed2f8b!important;-webkit-text-stroke:0!important;text-shadow:0 1px 8px rgba(237,47,139,.08)!important}
html.gtg-white-site body .feature h3{color:#191316!important;text-shadow:0 1px 7px rgba(48,22,34,.05)!important}
html.gtg-white-site body .feature p{color:#55454d!important}
html.gtg-white-site body .free-punch{margin-top:24px!important;padding:22px 28px!important;background:linear-gradient(90deg,#fff4f9 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.42)!important;box-shadow:0 12px 30px rgba(63,28,46,.06)!important;color:#3c2d34!important}
html.gtg-white-site body .free-punch span{color:#ed2f8b!important}

html.gtg-white-site body .full-top{gap:48px!important}
html.gtg-white-site body .full-list{gap:14px!important}
html.gtg-white-site body .full-item{background:#fff!important;border:1.5px solid rgba(255,79,163,.34)!important;box-shadow:0 14px 34px rgba(63,28,46,.065)!important}
html.gtg-white-site body .full-item h3{color:#191316!important}
html.gtg-white-site body .full-item p{color:#55454d!important}
html.gtg-white-site body .full-icon{background:#fff3f8!important;border-color:rgba(255,79,163,.48)!important;color:#ed2f8b!important}
html.gtg-white-site body .price-card{background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.44)!important;box-shadow:0 18px 44px rgba(63,28,46,.09)!important}
html.gtg-white-site body .price-card .amount,html.gtg-white-site body .price-card .amount small{color:#191316!important}
html.gtg-white-site body .price-card p{color:#55454d!important}

html.gtg-white-site body .matrix-wrap{background:#fff!important;border:1.5px solid rgba(255,79,163,.40)!important;box-shadow:0 16px 38px rgba(63,28,46,.065)!important}
html.gtg-white-site body .matrix th{background:#fff1f7!important;color:#191316!important;border-bottom-color:rgba(25,19,22,.09)!important}
html.gtg-white-site body .matrix td{background:#fff!important;color:#55454d!important;border-bottom-color:rgba(25,19,22,.08)!important}
html.gtg-white-site body .matrix td:first-child{color:#30242a!important}
html.gtg-white-site body .matrix-note{color:#65535c!important;margin-top:16px!important}

html.gtg-white-site body .choice-grid{gap:18px!important}
html.gtg-white-site body .choice{padding:30px!important;background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.36)!important;box-shadow:0 15px 36px rgba(63,28,46,.07)!important}
html.gtg-white-site body .choice.full{border-color:rgba(255,79,163,.48)!important;box-shadow:0 16px 40px rgba(63,28,46,.085)!important}
html.gtg-white-site body .choice h3{color:#191316!important}
html.gtg-white-site body .choice p,html.gtg-white-site body .choice li{color:#55454d!important}
html.gtg-white-site body .choice ul{margin-top:18px!important}
html.gtg-white-site body .choice .cta{margin-top:20px!important}

html.gtg-white-site body .faq-grid{gap:12px!important}
html.gtg-white-site body .faq-item{padding:22px 24px!important;background:#fff!important;border:1.5px solid rgba(255,79,163,.34)!important;box-shadow:0 12px 30px rgba(63,28,46,.055)!important}
html.gtg-white-site body .faq-item h3{color:#191316!important}
html.gtg-white-site body .faq-item p{color:#55454d!important}

html.gtg-white-site body .closing{padding:68px 20px 72px!important;background:#fff!important}
html.gtg-white-site body .closing .scribble{color:#ed2f8b!important}
html.gtg-white-site body .closing h2{color:#191316!important;text-shadow:0 2px 10px rgba(48,22,34,.065)!important}
html.gtg-white-site body .closing p{color:#55454d!important}
html.gtg-white-site body .closing .hero-actions{margin-top:24px!important}

@media(max-width:1050px){
 html.gtg-white-site body .hero{padding:54px 0!important}
 html.gtg-white-site body .section{padding:56px 0!important}
 html.gtg-white-site body .full-top{gap:34px!important}
}
@media(max-width:700px){
 html.gtg-white-site body .hero{padding:34px 0 44px!important}
 html.gtg-white-site body .hero-grid{gap:26px!important}
 html.gtg-white-site body .section{padding:44px 0!important}
 html.gtg-white-site body .section-head{margin-bottom:24px!important}
 html.gtg-white-site body .statement{padding:22px!important;margin-bottom:26px!important}
 html.gtg-white-site body .feature{padding:22px!important}
 html.gtg-white-site body .free-punch{padding:20px 22px!important}
 html.gtg-white-site body .choice{padding:24px!important}
 html.gtg-white-site body .faq-item{padding:20px!important}
 html.gtg-white-site body .closing{padding:52px 18px 58px!important}
}
`;
document.head.appendChild(style);
})();
