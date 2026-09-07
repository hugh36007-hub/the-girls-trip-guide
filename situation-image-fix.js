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
})();
