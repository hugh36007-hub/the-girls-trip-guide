(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
const path=clean(location.pathname);
const add=(id,css)=>{if(document.getElementById(id))return;const style=document.createElement('style');style.id=id;style.textContent=css;document.head.appendChild(style)};

if(path==='/the-gals') add('the-gals-hero-contrast-fix',`
html.gtg-white-site body .hero-shell,html.gtg-white-site body .hero-shell .hero,html.gtg-white-site body .hero-shell .hero-copy{color:#fff!important}
html.gtg-white-site body .hero-shell .hero-copy h1{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.3)!important}
html.gtg-white-site body .hero-shell .hero-copy h1 span,html.gtg-white-site body .hero-shell .hero-copy .eyebrow{color:#ff4fa3!important}
html.gtg-white-site body .hero-shell .hero-copy .lead{color:rgba(255,255,255,.88)!important;text-shadow:0 1px 8px rgba(0,0,0,.22)!important}
html.gtg-white-site body .hero-shell .hero-copy .button:not(.primary){color:#fff!important;border-color:rgba(255,255,255,.72)!important;background:rgba(5,3,5,.34)!important;box-shadow:none!important}
html.gtg-white-site body .hero-shell .hero-copy .button.primary{background:#ff4fa3!important;border-color:#ff4fa3!important;color:#10080d!important}
html.gtg-white-site body .benefit-card,html.gtg-white-site body .how-card,html.gtg-white-site body .how-upgrade{background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.38)!important;box-shadow:0 16px 38px rgba(63,28,46,.075)!important}
html.gtg-white-site body .how-card h3,html.gtg-white-site body .how-upgrade h3{color:#191316!important}
html.gtg-white-site body .how-card p,html.gtg-white-site body .how-upgrade p{color:#55454d!important}
html.gtg-white-site body .how-number,html.gtg-white-site body .upgrade-number{color:#fff!important;-webkit-text-stroke:1.5px #ff4fa3!important}
html.gtg-white-site body .upgrade-points span{background:#fff3f8!important;border:1.25px solid rgba(255,79,163,.46)!important;color:#8b355f!important;box-shadow:0 6px 16px rgba(63,28,46,.045)!important;font-weight:800!important}
html.gtg-white-site body .how-upgrade{padding:24px 28px!important;gap:24px!important}
html.gtg-white-site body .upgrade-kicker{color:#8a6576!important}
html.gtg-white-site body .how-footer{color:#55454d!important;margin-top:26px!important;text-shadow:none!important}
html.gtg-white-site body .how-footer:before{color:#ff4fa3!important}
html.gtg-white-site body .how-footer:after{background:linear-gradient(90deg,transparent,rgba(255,79,163,.56),transparent)!important}
@media(max-width:700px){html.gtg-white-site body .how-upgrade{padding:20px!important;gap:12px!important}html.gtg-white-site body .upgrade-points span{min-height:38px!important;color:#7a2f54!important}html.gtg-white-site body .how-footer{margin-top:22px!important;color:#55454d!important}}
`);

if(path==='/gals') add('gals-page-refinement-compat',`
html.gtg-white-site body .hero{background:radial-gradient(circle at 78% 15%,rgba(255,79,163,.22),transparent 28%),linear-gradient(180deg,#100910,#070507)!important;color:#fff!important}
html.gtg-white-site body .hero h1{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.32)!important}
html.gtg-white-site body .hero h1 span{color:#ff4fa3!important}
html.gtg-white-site body .hero .hero-kicker{color:#ff82c0!important}
html.gtg-white-site body .hero .hero-copy>p{color:rgba(255,255,255,.86)!important;text-shadow:0 1px 8px rgba(0,0,0,.2)!important}
html.gtg-white-site body .hero .cta.secondary{color:#fff!important;border-color:rgba(255,255,255,.72)!important;background:rgba(5,3,5,.34)!important}
html.gtg-white-site body .hero .cta.primary{background:#ff4fa3!important;color:#fff!important}
html.gtg-white-site body .intro-strip{background:#fff!important;border-bottom:1px solid rgba(255,79,163,.18)!important}
html.gtg-white-site body .strip-item{padding:18px 22px!important;border-right:1px solid rgba(25,19,22,.08)!important}
html.gtg-white-site body .strip-item b{color:#ed2f8b!important}html.gtg-white-site body .strip-item span{color:#55454d!important}
html.gtg-white-site body .team{padding:56px 0 64px!important;background:#fff!important}html.gtg-white-site body .team-head{margin-bottom:30px!important}
html.gtg-white-site body .team-head h2{color:#191316!important;text-shadow:0 2px 10px rgba(48,22,34,.06)!important}html.gtg-white-site body .team-head h2 span{color:#ed2f8b!important}html.gtg-white-site body .team-head .sub{color:#55454d!important}
html.gtg-white-site body .character{border-top-color:rgba(255,79,163,.17)!important;padding:36px 0!important}html.gtg-white-site body .character .role{color:#ed2f8b!important}html.gtg-white-site body .character h3{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.055)!important}html.gtg-white-site body .character h3 span{color:#ed2f8b!important}html.gtg-white-site body .character-lead{color:#3f3037!important}html.gtg-white-site body .character-copy>p:not(.role):not(.character-lead){color:#55454d!important}
html.gtg-white-site body .does span{background:linear-gradient(180deg,#fff8fb 0%,#fff3f8 100%)!important;border:1.5px solid rgba(255,79,163,.34)!important;color:#46363e!important;box-shadow:0 8px 20px rgba(63,28,46,.045)!important}html.gtg-white-site body .does span:before{color:#ed2f8b!important}
html.gtg-white-site body .message{background:linear-gradient(90deg,#fff0f6 0%,#fff9fc 100%)!important;border-left:3px solid #ff4fa3!important;color:#46363e!important;box-shadow:0 10px 26px rgba(63,28,46,.05)!important}html.gtg-white-site body .message b{color:#ed2f8b!important}
html.gtg-white-site body .portrait{border-color:rgba(255,79,163,.38)!important;box-shadow:0 18px 42px rgba(63,28,46,.09)!important}
html.gtg-white-site body .triggers{padding:62px 0!important;background:#fff!important;border-color:rgba(255,79,163,.16)!important}html.gtg-white-site body .triggers h2{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.055)!important}html.gtg-white-site body .triggers h2 span{color:#ed2f8b!important}html.gtg-white-site body .triggers-copy>p{color:#55454d!important}
html.gtg-white-site body .trigger{background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.34)!important;box-shadow:0 10px 26px rgba(63,28,46,.05)!important}html.gtg-white-site body .trigger strong{color:#ed2f8b!important}html.gtg-white-site body .trigger span{color:#55454d!important}html.gtg-white-site body .trigger b{color:#191316!important}
html.gtg-white-site body .closing{padding:70px 20px 76px!important;background:#fff!important}html.gtg-white-site body .closing-script{color:#ed2f8b!important}html.gtg-white-site body .closing h2{color:#191316!important;text-shadow:0 2px 10px rgba(48,22,34,.06)!important}html.gtg-white-site body .closing p{color:#55454d!important}html.gtg-white-site body .closing .price-note{color:#6b5962!important}
@media(max-width:700px){html.gtg-white-site body .strip-item{padding:13px 12px!important}html.gtg-white-site body .team{padding:34px 0 42px!important}html.gtg-white-site body .character{padding:24px 0!important}html.gtg-white-site body .message{margin-top:14px!important;padding:14px 15px!important}html.gtg-white-site body .triggers{padding:42px 0!important}html.gtg-white-site body .closing{padding:50px 18px 56px!important}}
`);

if(path==='/briefing') add('briefing-page-refinement-compat',`
html.gtg-white-site body .hero{background:#080508!important;color:#fff!important}
html.gtg-white-site body .hero:after{background:linear-gradient(90deg,rgba(5,3,5,.78) 0%,rgba(5,3,5,.64) 20%,rgba(5,3,5,.36) 38%,rgba(5,3,5,.10) 58%,rgba(5,3,5,0) 76%)!important}
html.gtg-white-site body .hero .eyebrow{color:#ff4fa3!important}html.gtg-white-site body .hero h1{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.34)!important}html.gtg-white-site body .hero h1 span{color:#ff4fa3!important}
html.gtg-white-site body .hero-copy p{color:rgba(255,255,255,.88)!important;text-shadow:0 1px 8px rgba(0,0,0,.24)!important}html.gtg-white-site body .hero-copy p strong{color:#fff!important;font-weight:800!important}html.gtg-white-site body .hero-rule{background:#ff4fa3!important;box-shadow:0 0 16px rgba(255,79,163,.20)!important}
html.gtg-white-site body .briefing{background:#fff!important}html.gtg-white-site body .brief-row{padding:42px 0!important;border-bottom:1px solid rgba(255,79,163,.15)!important}html.gtg-white-site body .brief-row h2{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.05)!important}html.gtg-white-site body .brief-copy{color:#55454d!important}html.gtg-white-site body .brief-copy strong{color:#191316!important}html.gtg-white-site body .num,html.gtg-white-site body .section-kicker{color:#ed2f8b!important}
html.gtg-white-site body .rule-card{background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.38)!important;box-shadow:0 14px 32px rgba(63,28,46,.065)!important;color:#191316!important}html.gtg-white-site body .rule-card b{color:#191316!important}html.gtg-white-site body .rule-card>span:not(.rule-fallback){color:#55454d!important}html.gtg-white-site body .rule-icon{border-color:rgba(255,79,163,.34)!important;background:#fff5f9!important;box-shadow:0 8px 20px rgba(63,28,46,.045)!important}
html.gtg-white-site body .closing{padding:68px 20px 74px!important;background:#fff!important;border-top:1px solid rgba(255,79,163,.15)!important}html.gtg-white-site body .closing-script{color:#ed2f8b!important}html.gtg-white-site body .closing h2{color:#191316!important;text-shadow:0 2px 10px rgba(48,22,34,.06)!important}html.gtg-white-site body .closing p{color:#55454d!important}
@media(max-width:700px){html.gtg-white-site body .hero:after{background:linear-gradient(180deg,rgba(5,3,5,0) 0%,rgba(5,3,5,0) 48%,rgba(5,3,5,.16) 55%,rgba(5,3,5,.88) 64%,#050305 100%)!important}html.gtg-white-site body .brief-row{padding:26px 0!important}html.gtg-white-site body .rule-card{padding:14px 15px!important}html.gtg-white-site body .closing{padding:48px 18px 54px!important}}
`);
})();
