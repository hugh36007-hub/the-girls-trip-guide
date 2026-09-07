(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/')return;

const gradient=`linear-gradient(90deg,
  rgba(255,255,255,1) 0%,
  rgba(255,255,255,1) 29%,
  rgba(255,255,255,.96) 31%,
  rgba(255,255,255,.78) 34%,
  rgba(255,255,255,.48) 37%,
  rgba(255,255,255,.20) 40%,
  rgba(255,255,255,.06) 42%,
  rgba(255,255,255,0) 44%
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
  body main#top .hero .hero-shade{background:${gradient}!important}
}
`;

  /* Put the override immediately after the late homepage theme block so it wins the cascade. */
  inlineTheme.insertAdjacentElement('afterend',override);
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',apply,{once:true});
}else{
  apply();
}
})();
