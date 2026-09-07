(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/situation')return;

const replacements={
  '.trip-tool-money img':'/assets/images/ChatGPT Image Sep 7, 2026, 11_08_47 AM.png',
  '.trip-tool-reminders img':'/assets/images/ChatGPT Image Sep 7, 2026, 11_08_54 AM.png',
  '.trip-tool-receipts img':'/assets/images/ChatGPT Image Sep 7, 2026, 11_08_58 AM.png'
};
for(const [selector,src] of Object.entries(replacements)){
  const img=document.querySelector(selector);
  if(!img)continue;
  img.removeAttribute('srcset');
  img.src=src;
  img.decoding='async';
}

const heroStyle=document.createElement('style');
heroStyle.textContent=`
.plan-hero:after{
  background:linear-gradient(
    90deg,
    rgba(8,4,7,.62) 0%,
    rgba(8,4,7,.34) 30%,
    rgba(8,4,7,.10) 52%,
    rgba(8,4,7,0) 72%
  )!important;
}
.plan-hero h1,
.plan-hero .scribble,
.plan-hero .innocent{
  text-shadow:0 2px 10px rgba(0,0,0,.22);
}
@media(max-width:700px){
  .plan-hero:after{
    background:linear-gradient(
      180deg,
      rgba(8,5,7,0) 0%,
      rgba(8,5,7,0) 40%,
      rgba(8,5,7,.14) 48%,
      rgba(8,5,7,.78) 58%,
      #080508 100%
    )!important;
  }
}
`;
document.head.appendChild(heroStyle);
})();
