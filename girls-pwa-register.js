(()=>{
'use strict';
if(!('serviceWorker'in navigator))return;
window.addEventListener('load',async()=>{
 try{
  const hadController=Boolean(navigator.serviceWorker.controller);
  const registration=await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});
  await registration.update().catch(()=>{});
  registration.addEventListener('updatefound',()=>{
   const worker=registration.installing;if(!worker)return;
   worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage({type:'SKIP_WAITING'})});
  });
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController||reloading)return;reloading=true;location.reload()});
 }catch(error){console.warn('[GTG PWA] Service worker registration failed:',error)}
},{once:true});
})();
