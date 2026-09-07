(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/gals')return;

const style=document.createElement('style');
style.id='gals-page-refinement';
style.textContent=`
/* GALS page — scoped white-theme refinement */
html.gtg-white-site body .hero{background:radial-gradient(circle at 78% 15%,rgba(255,79,163,.22),transparent 28%),linear-gradient(180deg,#100910,#070507)!important;color:#fff!important}
html.gtg-white-site body .hero:after{background:linear-gradient(90deg,rgba(7,5,7,.64) 0%,rgba(7,5,7,.48) 22%,rgba(7,5,7,.24) 42%,rgba(7,5,7,.08) 56%,rgba(7,5,7,0) 69%)!important}
html.gtg-white-site body .hero h1{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,.32)!important}
html.gtg-white-site body .hero h1 span{color:#ff4fa3!important}
html.gtg-white-site body .hero .hero-kicker{color:#ff82c0!important}
html.gtg-white-site body .hero .hero-copy>p{color:rgba(255,255,255,.86)!important;text-shadow:0 1px 8px rgba(0,0,0,.2)!important}
html.gtg-white-site body .hero .cta.secondary{color:#fff!important;border-color:rgba(255,255,255,.72)!important;background:rgba(5,3,5,.34)!important}
html.gtg-white-site body .hero .cta.primary{background:#ff4fa3!important;color:#fff!important}

html.gtg-white-site body .intro-strip{background:#fff!important;border-bottom:1px solid rgba(255,79,163,.18)!important}
html.gtg-white-site body .strip-item{padding:18px 22px!important;border-right:1px solid rgba(25,19,22,.08)!important}
html.gtg-white-site body .strip-item b{color:#ed2f8b!important}
html.gtg-white-site body .strip-item span{color:#55454d!important}

html.gtg-white-site body .team{padding:56px 0 64px!important;background:#fff!important}
html.gtg-white-site body .team-head{margin-bottom:30px!important}
html.gtg-white-site body .team-head h2{color:#191316!important;text-shadow:0 2px 10px rgba(48,22,34,.06)!important}
html.gtg-white-site body .team-head h2 span{color:#ed2f8b!important}
html.gtg-white-site body .team-head .sub{color:#55454d!important}

html.gtg-white-site body .character{border-top-color:rgba(255,79,163,.17)!important;padding:36px 0!important}
html.gtg-white-site body .character .role{color:#ed2f8b!important}
html.gtg-white-site body .character h3{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.055)!important}
html.gtg-white-site body .character h3 span{color:#ed2f8b!important}
html.gtg-white-site body .character-lead{color:#3f3037!important}
html.gtg-white-site body .character-copy>p:not(.role):not(.character-lead){color:#55454d!important}

html.gtg-white-site body .does{gap:10px 18px!important}
html.gtg-white-site body .does span{background:linear-gradient(180deg,#fff8fb 0%,#fff3f8 100%)!important;border:1.5px solid rgba(255,79,163,.34)!important;color:#46363e!important;box-shadow:0 8px 20px rgba(63,28,46,.045)!important}
html.gtg-white-site body .does span:before{color:#ed2f8b!important}

html.gtg-white-site body .message{background:linear-gradient(90deg,#fff0f6 0%,#fff9fc 100%)!important;border-left:3px solid #ff4fa3!important;color:#46363e!important;box-shadow:0 10px 26px rgba(63,28,46,.05)!important}
html.gtg-white-site body .message b{color:#ed2f8b!important}

html.gtg-white-site body .portrait{border-color:rgba(255,79,163,.38)!important;box-shadow:0 18px 42px rgba(63,28,46,.09)!important}

html.gtg-white-site body .triggers{padding:62px 0!important;background:#fff!important;border-color:rgba(255,79,163,.16)!important}
html.gtg-white-site body .triggers h2{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.055)!important}
html.gtg-white-site body .triggers h2 span{color:#ed2f8b!important}
html.gtg-white-site body .triggers-copy>p{color:#55454d!important}
html.gtg-white-site body .trigger{background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;border:1.5px solid rgba(255,79,163,.34)!important;box-shadow:0 10px 26px rgba(63,28,46,.05)!important}
html.gtg-white-site body .trigger strong{color:#ed2f8b!important}
html.gtg-white-site body .trigger span{color:#55454d!important}
html.gtg-white-site body .trigger b{color:#191316!important}

html.gtg-white-site body .closing{padding:70px 20px 76px!important;background:#fff!important}
html.gtg-white-site body .closing-script{color:#ed2f8b!important}
html.gtg-white-site body .closing h2{color:#191316!important;text-shadow:0 2px 10px rgba(48,22,34,.06)!important}
html.gtg-white-site body .closing p{color:#55454d!important}
html.gtg-white-site body .closing .price-note{color:#6b5962!important}

@media(max-width:700px){
 html.gtg-white-site body .hero:after{background:linear-gradient(0deg,#070507 0%,rgba(7,5,7,.88) 36%,rgba(7,5,7,.24) 66%,rgba(7,5,7,0) 100%)!important}
 html.gtg-white-site body .strip-item{padding:13px 12px!important}
 html.gtg-white-site body .team{padding:34px 0 42px!important}
 html.gtg-white-site body .team-head{margin-bottom:20px!important}
 html.gtg-white-site body .character{padding:24px 0!important}
 html.gtg-white-site body .does{gap:8px!important}
 html.gtg-white-site body .does span{font-size:11px!important;padding:10px 9px 10px 27px!important}
 html.gtg-white-site body .message{margin-top:14px!important;padding:14px 15px!important}
 html.gtg-white-site body .triggers{padding:42px 0!important}
 html.gtg-white-site body .closing{padding:50px 18px 56px!important}
}
`;
document.head.appendChild(style);
})();
