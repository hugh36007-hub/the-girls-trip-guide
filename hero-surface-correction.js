(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
const path=clean(location.pathname);
if(path!=='/gals'&&path!=='/briefing')return;
const hero=document.querySelector('main > section.hero');
if(hero)hero.classList.remove('gtg-light-surface');
})();
