/* Legacy compatibility shim. Hero visuals are now owned by the Free layout runtime or live-dashboard-hero.css. */
(()=>{
'use strict';
if(window.__GTG_HOME_HERO_BACKGROUND__)return;window.__GTG_HOME_HERO_BACKGROUND__=true;
const clean=()=>document.querySelectorAll('.dashboard .hero-card.gtg-home-no-photo').forEach(hero=>hero.classList.remove('gtg-home-no-photo'));
clean();
const app=document.getElementById('app');if(app)new MutationObserver(clean).observe(app,{childList:true,subtree:true});
})();
