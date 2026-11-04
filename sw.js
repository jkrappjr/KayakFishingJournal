const CACHE='kfj-mobile-v37';
const CORE=['./','./index.html','./styles-v37.css','./app-v36.js','./learn-data.js','./db.js','./journal-bridge.js','./bait-data.js','./manifest.json','./bait-side-v35.js','./lure-images.js','./lure-orientation.js','./assets/river/side.webp','./assets/lures/spinner.webp','./assets/lures/crank.webp','./assets/lures/wacky.webp','./assets/lures/jig.webp','./assets/lures/ned-rigged.webp','./assets/lures/swim.webp','./assets/lures/tube.webp','./assets/lures/chatter.webp','./assets/lures/plopper-hooks.webp','./assets/lures/softjerk.webp','./assets/lures/hardjerk.webp','./assets/lures/creature.webp','./assets/lures/buzz.webp','./assets/river/seam.webp','./assets/river/boulder.webp','./assets/river/ledge.webp','./assets/river/eddy.webp','./assets/river/riffle.webp','./assets/river/tailout.webp','./assets/river/pool.webp','./assets/river/wood.webp','./assets/river/bank.webp','./assets/river/eddy-lesson.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 const url=new URL(e.request.url);
 const code=e.request.mode==='navigate'||/\.(?:js|css)$/.test(url.pathname);
 const key=e.request.mode==='navigate'?'./index.html':e.request;
 if(code){
  e.respondWith(fetch(new Request(e.request,{cache:'no-cache'})).then(async r=>{
   if(!r.ok)throw new Error('HTTP '+r.status);
   const c=await caches.open(CACHE);await c.put(key,r.clone());return r;
  }).catch(async()=>{const c=await caches.open(CACHE);return (await c.match(key))||Response.error()}));
 }else{
  e.respondWith(caches.open(CACHE).then(async c=>{
   const cached=await c.match(e.request);if(cached)return cached;
   const r=await fetch(e.request);if(r.ok)await c.put(e.request,r.clone());return r;
  }));
 }
});