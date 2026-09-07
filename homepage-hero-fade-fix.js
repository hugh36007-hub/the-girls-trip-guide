(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/')return;

const apply=()=>{
  const inlineTheme=document.getElementById('homepage-light-theme');
  if(!inlineTheme)return;

  let override=document.getElementById('gtg-homepage-hero-fade-authoritative');
  if(override)override.remove();

  override=document.createElement('style');
  override.id='gtg-homepage-hero-fade-authoritative';
  override.textContent=`
@media(min-width:601px){
  body main#top .hero{
    border-bottom:4px solid #ff4fa3!important;
  }
  body main#top .hero .hero-shade{
    background:transparent!important;
  }
  body main#top .hero .paper-rip{
    display:none!important;
  }
  body main#top .hero .hero-copy,
  body main#top .hero .hero-intro,
  body main#top .hero .hero-note,
  body main#top .hero .hero-join,
  body main#top .hero h1{
    color:#fff!important;
    text-shadow:0 2px 8px rgba(0,0,0,.88),0 1px 2px rgba(0,0,0,.95)!important;
  }
  body main#top .hero .mini-label,
  body main#top .hero h1 span,
  body main#top .hero .hero-join a{
    color:#ff4fa3!important;
    text-shadow:0 2px 8px rgba(0,0,0,.88),0 1px 2px rgba(0,0,0,.95)!important;
  }
  body main#top .hero .hero-intro strong,
  body main#top .hero .hero-note strong{
    color:#fff!important;
  }
  body main#top .hero .pill-outline{
    border-color:#fff!important;
    color:#fff!important;
    background:rgba(10,6,9,.24)!important;
    text-shadow:0 1px 3px rgba(0,0,0,.75)!important;
  }
  body main#top .hero .hero-how-cta{
    color:#fff!important;
    border-color:rgba(255,255,255,.9)!important;
    background:rgba(10,6,9,.20)!important;
    text-shadow:0 1px 3px rgba(0,0,0,.72)!important;
  }
}
@media(max-width:600px){
  body main#top .hero{
    border-bottom:4px solid #ff4fa3!important;
  }
}
`;

  inlineTheme.insertAdjacentElement('afterend',override);
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',apply,{once:true});
}else{
  apply();
}
})();
