(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/briefing')return;

const apply=()=>{
  let style=document.getElementById('gtg-briefing-mobile-hero-fix');
  if(style)style.remove();
  style=document.createElement('style');
  style.id='gtg-briefing-mobile-hero-fix';
  style.textContent=`
@media(max-width:760px){
  html,body{overflow-x:hidden!important}
  body[data-gtg-mobile-path="briefing"] .hero{
    position:relative!important;
    display:block!important;
    min-height:590px!important;
    height:590px!important;
    overflow:hidden!important;
    background:#070507!important;
    border-bottom:3px solid #ed2f8b!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero-image{
    position:absolute!important;
    inset:0!important;
    width:100%!important;
    height:100%!important;
    max-width:none!important;
    aspect-ratio:auto!important;
    object-fit:cover!important;
    object-position:62% center!important;
    background:#070507!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero:before{display:none!important;content:none!important}
  body[data-gtg-mobile-path="briefing"] .hero:after{
    content:""!important;
    display:block!important;
    position:absolute!important;
    inset:0!important;
    z-index:1!important;
    pointer-events:none!important;
    background:linear-gradient(180deg,
      rgba(7,5,7,0) 0%,
      rgba(7,5,7,.02) 34%,
      rgba(7,5,7,.18) 48%,
      rgba(7,5,7,.68) 62%,
      rgba(7,5,7,.92) 76%,
      #070507 92%,
      #070507 100%
    )!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero-inner,
  body[data-gtg-mobile-path="briefing"] .hero-inner.wrap{
    position:relative!important;
    z-index:2!important;
    width:100%!important;
    min-height:590px!important;
    height:590px!important;
    margin:0!important;
    padding:0 18px 24px!important;
    display:flex!important;
    align-items:flex-end!important;
    background:transparent!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero-copy{
    position:static!important;
    width:100%!important;
    max-width:430px!important;
    padding:0!important;
    margin:0!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero .eyebrow{
    position:static!important;
    display:block!important;
    margin:0 0 9px!important;
    color:#ff5cab!important;
    font-size:11px!important;
    line-height:1.2!important;
    letter-spacing:.18em!important;
    text-shadow:0 2px 10px rgba(0,0,0,.45)!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero .eyebrow span{display:inline!important;margin-right:6px!important}
  body[data-gtg-mobile-path="briefing"] .hero h1{
    position:static!important;
    width:auto!important;
    max-width:none!important;
    margin:0!important;
    color:#fff!important;
    font-size:49px!important;
    line-height:.84!important;
    letter-spacing:-.025em!important;
    text-shadow:0 3px 16px rgba(0,0,0,.55)!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero h1 span{color:#ff4fa3!important}
  body[data-gtg-mobile-path="briefing"] .hero-copy>p{
    margin:15px 0 0!important;
    max-width:420px!important;
    color:rgba(255,255,255,.94)!important;
    font-size:14px!important;
    line-height:1.48!important;
    text-shadow:0 2px 10px rgba(0,0,0,.48)!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero-copy>p strong{
    display:block!important;
    margin-top:10px!important;
    color:#fff!important;
    font-weight:800!important;
  }
  body[data-gtg-mobile-path="briefing"] .hero-rule{
    width:72px!important;
    height:3px!important;
    margin-top:16px!important;
    background:#ff4fa3!important;
    box-shadow:0 0 14px rgba(255,79,163,.28)!important;
  }
}
@media(max-width:430px){
  body[data-gtg-mobile-path="briefing"] .hero,
  body[data-gtg-mobile-path="briefing"] .hero-inner,
  body[data-gtg-mobile-path="briefing"] .hero-inner.wrap{height:560px!important;min-height:560px!important}
  body[data-gtg-mobile-path="briefing"] .hero h1{font-size:45px!important}
  body[data-gtg-mobile-path="briefing"] .hero-copy>p{font-size:13.5px!important}
}
`;
  document.head.appendChild(style);
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
