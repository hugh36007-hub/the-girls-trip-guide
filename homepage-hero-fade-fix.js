(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/')return;

const gradient=`linear-gradient(90deg,
  rgba(255,255,255,1) 0%,
  rgba(255,255,255,1) 29%,
  rgba(255,255,255,.98) 32%,
  rgba(255,255,255,.90) 35%,
  rgba(255,255,255,.66) 39%,
  rgba(255,255,255,.38) 43%,
  rgba(255,255,255,.15) 46%,
  rgba(255,255,255,.04) 48%,
  rgba(255,255,255,0) 50%
)`;

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
    border-bottom:1px solid rgba(237,47,139,.28)!important;
  }
  body main#top .hero .hero-shade{
    background:${gradient}!important;
  }
  body main#top .hero .hero-note,
  body main#top .hero .hero-join{
    color:#493942!important;
    text-shadow:0 1px 0 rgba(255,255,255,.98),0 0 7px rgba(255,255,255,.92)!important;
  }
  body main#top .hero .hero-note strong{
    color:#191316!important;
  }
}
@media(max-width:600px){
  body main#top .hero{
    border-bottom:1px solid rgba(237,47,139,.24)!important;
  }
}
`;

  /* Keep the homepage hero override after the late inline theme so it remains authoritative. */
  inlineTheme.insertAdjacentElement('afterend',override);
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',apply,{once:true});
}else{
  apply();
}
})();
