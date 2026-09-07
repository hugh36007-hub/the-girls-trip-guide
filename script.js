(()=>{
'use strict';
const core='/script-core.js?v=20260907-1';
const theme='/sitewide-light.js?v=20260907-1';
if(document.readyState==='loading'){
  document.write(`<script src="${core}"><\/script><script src="${theme}"><\/script>`);
  return;
}
const a=document.createElement('script');
a.src=core;
a.async=false;
a.addEventListener('load',()=>{const b=document.createElement('script');b.src=theme;b.async=false;document.head.appendChild(b)});
document.head.appendChild(a);
})();