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
      rgba(255,250,252,.98) 0%,
      rgba(255,250,252,.94) 18%,
      rgba(255,250,252,.80) 28%,
      rgba(255,250,252,.50) 37%,
      rgba(255,250,252,.18) 46%,
      rgba(255,250,252,.04) 52%,
      rgba(255,250,252,0) 57%
    )!important;
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
