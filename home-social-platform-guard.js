/* Platform guard for Home social hub. Keeps optional browser APIs safe. */
(()=>{
'use strict';
if(window.__GTG_HOME_SOCIAL_PLATFORM_GUARD__)return;window.__GTG_HOME_SOCIAL_PLATFORM_GUARD__=true;
if(!('visualViewport' in window)){try{Object.defineProperty(window,'visualViewport',{value:null,configurable:true})}catch{window.visualViewport=null}}
})();
