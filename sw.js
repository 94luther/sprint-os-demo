/* Sprint OS service worker. Brick 70.

   Two jobs, and only two:
   1. Let the app be added to a phone's home screen and open when there is no
      signal, by keeping the shell files on the phone.
   2. Turn a tap on a notification into the right screen opening.

   What it deliberately does NOT do: subscribe to any push service. A push
   subscription means a message transits Google or Apple, and whether Sprint is
   comfortable with that is the owner's decision, set out in
   docs/PUSH-DECISION.md. Until she says yes, nothing here talks to anyone. */
var CACHE = 'sprint-os-shell-v1';
var SHELL = ['./', './index.html', './shared/sprint-theme.css', './shared/sprint-notify.js',
             './shared/sprint-report.js', './shared/logo-mark.png', './manifest.webmanifest'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // one missing file must not stop the install
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Network first, so a fresh publish is seen at once; the cache only answers
// when there is no signal. The hub's API is never cached: a stale number is
// worse than no number.
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.indexOf('/api/') !== -1) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && res.ok && url.origin === self.location.origin) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});

// A tap on a notification opens the screen it names, or brings the app forward.
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var go = (e.notification.data && e.notification.data.href) || './index.html';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if ('focus' in list[i]) { list[i].navigate(go); return list[i].focus(); }
    }
    return self.clients.openWindow(go);
  }));
});
