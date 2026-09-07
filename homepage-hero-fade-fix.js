(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/')return;

const apply=()=>{
  let style=document.getElementById('gtg-homepage-hero-fade-fix');
  if(!style){
    style=document.createElement('style');
    style.id='gtg-homepage-hero-fade-fix';
    document.head.appendChild(style);
  }
  style.textContent=`
@media(min-width:601px){
  body main#top .hero .hero-shade{
    background:linear-gradient(90deg,
      rgba(255,255,255,1) 0%,
      rgba(255,255,255,1) 30%,
      rgba(255,255,255,.96) 32%,
      rgba(255,255,255,.78) 35%,
      rgba(255,255,255,.45) 38%,
      rgba(255,255,255,.18) 40%,
      rgba(255,255,255,0) 42%
    )!important;
  }
  body main#top .hero .hero-copy{
    max-width:520px!important;
  }
}
`;
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,0),{once:true});
}else{
  setTimeout(apply,0);
}
})();
