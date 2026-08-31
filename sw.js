const CACHE_VERSION='gtg-pwa-v2';
const STATIC_CACHE=`${CACHE_VERSION}-static`;
const PAGE_CACHE=`${CACHE_VERSION}-pages`;
const APP_SHELL=['/create-trip','/create-trip.html','/manifest.webmanifest','/assets/images/gtg-pwa-192.svg?v=1','/assets/images/girls-trip-guide-logo.webp'];

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(APP_SHELL)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gtg-pwa-')&&![STATIC_CACHE,PAGE_CACHE].includes(key)).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(url.pathname.startsWith('/functions/')||url.pathname.startsWith('/api/'))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{if(response?.ok){const copy=response.clone();caches.open(PAGE_CACHE).then(cache=>cache.put(request,copy))}return response}).catch(async()=>await caches.match(request)||await caches.match('/create-trip.html')));return;
 }
 if(request.destination==='script'||request.destination==='style'){
  event.respondWith(fetch(request).then(response=>{if(response?.ok){const copy=response.clone();caches.open(STATIC_CACHE).then(cache=>cache.put(request,copy))}return response}).catch(()=>caches.match(request)));return;
 }
 if(request.destination==='image'||request.destination==='font'){
  event.respondWith(caches.match(request).then(cached=>{const network=fetch(request).then(response=>{if(response?.ok){const copy=response.clone();caches.open(STATIC_CACHE).then(cache=>cache.put(request,copy))}return response}).catch(()=>cached);return cached||network}));
 }
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
