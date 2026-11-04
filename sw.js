const CACHE='kfj-mobile-v34';
const CORE=['./','./index.html','./styles.css','./app.js','./learn-data.js','./db.js','./journal-bridge.js','./bait-data.js','./manifest.json','./bait-side.js','./lure-images.js','./lure-orientation.js','./assets/river/side.webp','./assets/lures/spinner.webp','./assets/lures/crank.webp','./assets/lures/wacky.webp','./assets/lures/jig.webp','./assets/lures/ned-rigged.webp','./assets/lures/swim.webp','./assets/lures/tube.webp','./assets/lures/chatter.webp','./assets/lures/plopper-hooks.webp','./assets/lures/softjerk.webp','./assets/lures/hardjerk.webp','./assets/lures/creature.webp','./assets/lures/buzz.webp','./assets/river/seam.webp','./assets/river/boulder.webp','./assets/river/ledge.webp','./assets/river/eddy.webp','./assets/river/riffle.webp','./assets/river/tailout.webp','./assets/river/pool.webp','./assets/river/wood.webp','./assets/river/bank.webp','./assets/river/eddy-lesson.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r}).catch(()=>caches.match('./index.html')));
  return;
 }
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(cached=>{
  const fresh=fetch(e.request).then(r=>{if(r&&r.status<400){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>cached);
  return cached||fresh;
 }));
});