(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/briefing')return;

const style=document.createElement('style');
style.id='briefing-page-refinement';
style.textContent=`
/* Briefing — scoped light-theme refinement */
html.gtg-white-site body .hero{background:#080508!important;color:#fff!important}
html.gtg-white-site body .hero:after{background:linear-gradient(90deg,rgba(5,3,5,.78) 0%,rgba(5,3,5,.64) 20%,rgba(5,3,5,.36) 38%,rgba(5,3,5,.10) 58%,rgba(5,3,5,0) 76%)!important}
html.gtg-white-site body .hero .eyebrow{color:#ff4fa3!important}
html.gtg-white-site body .hero h1{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.34)!important}
html.gtg-white-site body .hero h1 span{color:#ff4fa3!important}
html.gtg-white-site body .hero-copy p{color:rgba(255,255,255,.88)!important;text-shadow:0 1px 8px rgba(0,0,0,.24)!important}
html.gtg-white-site body .hero-copy p strong{color:#fff!important;font-weight:800!important}
html.gtg-white-site body .hero-rule{background:#ff4fa3!important;box-shadow:0 0 16px rgba(255,79,163,.20)!important}

html.gtg-white-site body .briefing{background:#fff!important}
html.gtg-white-site body .brief-row{padding:42px 0!important;border-bottom:1px solid rgba(255,79,163,.15)!important}
html.gtg-white-site body .brief-row h2{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.05)!important}
html.gtg-white-site body .brief-copy{color:#55454d!important}
html.gtg-white-site body .brief-copy strong{color:#191316!important}
html.gtg-white-site body .num,html.gtg-white-site body .section-kicker{color:#ed2f8b!important}

html.gtg-white-site body .rule-card{background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.38)!important;box-shadow:0 14px 32px rgba(63,28,46,.065)!important;color:#191316!important}
html.gtg-white-site body .rule-card b{color:#191316!important}
html.gtg-white-site body .rule-card>span:not(.rule-fallback){color:#55454d!important}
html.gtg-white-site body .rule-icon{border-color:rgba(255,79,163,.34)!important;background:#fff5f9!important;box-shadow:0 8px 20px rgba(63,28,46,.045)!important}

html.gtg-white-site body .closing{padding:68px 20px 74px!important;background:#fff!important;border-top:1px solid rgba(255,79,163,.15)!important}
html.gtg-white-site body .closing-script{color:#ed2f8b!important}
html.gtg-white-site body .closing h2{color:#191316!important;text-shadow:0 2px 10px rgba(48,22,34,.06)!important}
html.gtg-white-site body .closing p{color:#55454d!important}

@media(max-width:700px){
 html.gtg-white-site body .hero:after{background:linear-gradient(180deg,rgba(5,3,5,0) 0%,rgba(5,3,5,0) 48%,rgba(5,3,5,.16) 55%,rgba(5,3,5,.88) 64%,#050305 100%)!important}
 html.gtg-white-site body .brief-row{padding:26px 0!important}
 html.gtg-white-site body .rule-card{padding:14px 15px!important}
 html.gtg-white-site body .closing{padding:48px 18px 54px!important}
}
`;
document.head.appendChild(style);
})();
