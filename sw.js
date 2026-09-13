/* Sprint OS service worker. Brick 70 gave it the shell; Brick 79 gives it the queue.

   Three jobs:
   1. Keep the app on the phone. Every page, stylesheet, script, picture and
      font is cached on first sight and served from the phone from then on
      (cache first), so the app opens in the bush with no signal. Pages are the
      one exception: a page is fetched from the network first and the cache
      answers only when there is none, because a fresh publish must be seen the
      moment the phone has signal, and a page is small.
   2. Keep the last numbers. Anything the hub answers under /api/ is served from
      the cache at once and refreshed behind it (stale while revalidate), with
      the fresh copy stored for next time. So the Cockpit opens instantly on the
      last figures it saw and updates a moment later, and never shows a spinner
      on a dead signal. The screens already mark what they show as live or
      example, so a stale figure is never mistaken for a fresh one. A failed or
      partial answer is never cached.
   3. Replay the queue. When the browser fires a Background Sync (Android
      Chrome) or a page asks, the queue in IndexedDB is sent in order, using the
      same rules the page uses (shared/sprint-db.js), even if the app is closed.

   What it deliberately does NOT do: subscribe to any push service. That
   decision is the owner's, set out in docs/PUSH-DECISION.md.

   The cache name carries the ?v= stamp this file was registered with, so a
   publish that changes this file opens fresh caches and the activate step
   throws the old ones away. */
importScripts('./shared/sprint-db.js');

var VERSION = (function () {
  try { return new URL(self.location.href).searchParams.get('v') || 'dev'; } catch (e) { return 'dev'; }
})();
var STATIC = 'sprint-os-static-' + VERSION;
var DATA = 'sprint-os-data-' + VERSION;
var SHELL = ['./', './index.html', './manifest.webmanifest',
             './shared/sprint-theme.css', './shared/sprint-notify.js', './shared/sprint-report.js',
             './shared/sprint-chrome.js', './shared/sprint-db.js', './shared/logo-mark.png',
             './shared/app-icon-192.png', './shared/app-icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(STATIC).then(function (c) {
    // one missing file must not stop the install
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== STATIC && k !== DATA; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function offlineAnswer() {
  return new Response(JSON.stringify({ ok: false, error: 'NO_SIGNAL', offline: true }),
    { status: 503, headers: { 'Content-Type': 'application/json', 'X-Sprint-Offline': '1' } });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                      // writes go to the network; the page queues them itself
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // the hub's data: answer from the cache at once, refresh behind it
  if (url.pathname.indexOf('/api/') !== -1) {
    e.respondWith(caches.open(DATA).then(function (c) {
      return c.match(req).then(function (cached) {
        var fresh = fetch(req).then(function (res) {
          if (res && res.ok) c.put(req, res.clone());
          return res;
        }).catch(function () { return null; });
        if (cached) {
          e.waitUntil(fresh);
          var h = new Headers(cached.headers); h.set('X-Sprint-From-Cache', '1');
          return cached.text().then(function (body) { return new Response(body, { status: cached.status, headers: h }); });
        }
        return fresh.then(function (res) { return res || offlineAnswer(); });
      });
    }));
    return;
  }

  // a page: network first so a publish is seen at once, the cache when there is no signal
  if (req.mode === 'navigate' || /\.html?$/.test(url.pathname) || /\/$/.test(url.pathname)) {
    e.respondWith(fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(STATIC).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
    }));
    return;
  }

  // everything else is the shell: cache first, then the network, and remember it
  e.respondWith(caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(STATIC).then(function (c) { c.put(req, copy); }); }
      return res;
    });
  }));
});

// the queue, replayed from inside the worker, with the app open or closed
function sendFromWorker(item) {
  return fetch(item.url, {
    method: item.method, credentials: 'include',
    headers: self.SprintDB.headers(item),
    body: item.body === undefined ? undefined : JSON.stringify(item.body)
  }).then(function (res) {
    if (res.ok) return;
    return res.json().catch(function () { return {}; }).then(function (j) {
      var err = new Error((j && j.error) || ('HTTP ' + res.status));
      err.status = res.status;
      throw err;
    });
  });
}
function tellPages(msg) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    list.forEach(function (c) { c.postMessage(msg); });
  });
}
function replayFromWorker(reason) {
  return self.SprintDB.replay(sendFromWorker).then(function (r) {
    return tellPages({ type: 'replayed', reason: reason, sent: r.sent.length, rejected: r.rejected.length,
                       dropped: r.dropped.length, kept: r.kept.length, stopped: r.stopped }).then(function () { return r; });
  }, function (e) {
    return tellPages({ type: 'replay-failed', reason: reason, error: String(e && e.message || e) });
  });
}
self.addEventListener('sync', function (e) {
  if (e.tag === self.SprintDB.SYNC_TAG) e.waitUntil(replayFromWorker('background sync'));
});
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'replay') e.waitUntil(replayFromWorker('page asked'));
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
