(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/situation')return;

/* Keep the four Situation images in the intended narrative order:
   Plan = planning/laptop (page markup)
   Money = payment phone
   Reminders = airport/luggage
   Receipts = celebration/selfie
*/
const replacements={
  '.trip-tool-money img':'/assets/images/ChatGPT Image Sep 7, 2026, 11_08_58 AM.png',
  '.trip-tool-reminders img':'/assets/images/ChatGPT Image Sep 7, 2026, 11_08_54 AM.png',
  '.trip-tool-receipts img':'/assets/images/ChatGPT Image Sep 7, 2026, 11_08_47 AM.png'
};
for(const [selector,src] of Object.entries(replacements)){
  const img=document.querySelector(selector);
  if(!img)continue;
  img.removeAttribute('srcset');
  img.src=src;
  img.decoding='async';
}

const heroStyle=document.createElement('style');
heroStyle.id='gtg-situation-hero-image-fix';
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
  text-shadow:0 2px 10px rgba(0,0,0,.28);
}

/* Mobile: keep the hero as one photographic composition. Do not split the
   image above a separate black copy block. */
@media(max-width:700px){
  .plan-hero{
    min-height:590px!important;
    align-items:flex-end!important;
    background-size:cover!important;
    background-position:61% center!important;
    background-color:#080508!important;
  }
  .plan-hero:after{
    background:
      linear-gradient(180deg,
        rgba(8,5,7,.02) 0%,
        rgba(8,5,7,.06) 34%,
        rgba(8,5,7,.38) 58%,
        rgba(8,5,7,.84) 82%,
        rgba(8,5,7,.94) 100%),
      linear-gradient(90deg,
        rgba(8,5,7,.42) 0%,
        rgba(8,5,7,.16) 54%,
        rgba(8,5,7,0) 88%)!important;
  }
  .plan-hero-copy{
    width:min(430px,94%)!important;
    padding:0 0 44px 4px!important;
  }
  .plan-hero .scribble{
    margin-bottom:8px!important;
    font-size:31px!important;
  }
  .plan-hero h1{
    font-size:60px!important;
    line-height:.84!important;
  }
  .plan-hero .innocent{
    margin-top:18px!important;
    font-size:24px!important;
  }
}

@media(max-width:390px){
  .plan-hero{min-height:560px!important;background-position:60% center!important}
  .plan-hero h1{font-size:56px!important}
  .plan-hero .scribble{font-size:29px!important}
}
`;
document.head.appendChild(heroStyle);
})();
