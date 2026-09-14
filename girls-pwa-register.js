(()=>{
'use strict';
if(!('serviceWorker'in navigator))return;
window.addEventListener('load',async()=>{
 try{
  const hadController=Boolean(navigator.serviceWorker.controller);
  const registration=await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});
  const activate=worker=>{if(worker?.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage({type:'SKIP_WAITING'})};
  registration.addEventListener('updatefound',()=>{
   const worker=registration.installing;if(!worker)return;
   worker.addEventListener('statechange',()=>activate(worker));
  });
  if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
  await registration.update().catch(()=>{});
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController||reloading)return;reloading=true;location.reload()});
 }catch(error){console.warn('[GTG PWA] Service worker registration failed:',error)}
},{once:true});
})();
