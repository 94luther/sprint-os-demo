const CACHE = 'sprint-incidents-v1';
const SHELL = ['./', './index.html', './manifest.json', '../shared/logo-mark.png'];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate', (e)=>{
  /* 16 Sep 2026: this used to delete EVERY cache that was not its own, which
     meant opening this one department wiped the main app's shell AND its
     offline queue, the cache holding deliveries captured with no signal.
     It never bit anybody only because this file has always answered 404 on
     the public demo, so the worker never registered there. Now it clears
     only its OWN older versions and leaves every other cache alone. */
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith('sprint-incidents-') && k!==CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});
self.addEventListener('fetch', (e)=>{
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.pathname.startsWith('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchPromise = fetch(e.request).then(res=>{
        if(res && res.ok){ const clone=res.clone(); caches.open(CACHE).then(c=>c.put(e.request, clone)); }
        return res;
      }).catch(()=> cached);
      return cached || fetchPromise;
    })
  );
});
