/* THE TICK. One timer for the whole application. Brick 99.

   20 September 2026. The map arrived on the front page this evening and it draws
   ONCE. A director who leaves the page open for ten minutes is looking at a
   picture of ten minutes ago, and because the vehicles pulse it looks live the
   whole time. A stale map that animates is a worse lie than a static one, because
   the animation is the thing telling her it is current.

   WHY A SHARED TICKER AND NOT setInterval WHEREVER IT IS NEEDED.

     A page that sets its own interval keeps running in a background tab. Ten
     tabs, ten timers, a phone battery gone by lunchtime and a hub answering
     questions nobody is reading. Every tick here stops when the tab is hidden
     and fires once immediately when it comes back, so the first thing a person
     sees on returning is current rather than whatever was on screen when they
     left.

     A failing tick that keeps its rhythm is worse than no tick. If the hub is
     down, retrying every twenty seconds forever is a small denial of service
     aimed at your own building. The delay doubles on each consecutive failure up
     to a ceiling and resets the moment one succeeds.

     AND A TICK MUST NEVER OVERLAP ITSELF. A slow answer plus a fixed interval
     means two requests in flight and the older one landing last, which paints
     the OLDER truth over the newer one. Nothing is scheduled until the previous
     run has finished, whatever it finished as.

   WHAT IT DELIBERATELY DOES NOT DO. It does not decide what is stale. Freshness
   is a property of the DATA, not of how often somebody asked for it, and the two
   get confused constantly: a tick running every twenty seconds tells you nothing
   at all about whether the position it fetched was recorded two minutes ago or
   two hours ago. sprint-map.js owns that judgement because it owns the dots. */
(function (root) {
  'use strict';

  var MIN = 4000;          // never hammer, whatever a caller asks for
  var MAX_BACKOFF = 8;     // doubling stops here, so a long outage settles
  var ticks = [];

  function hidden() {
    try { return document.visibilityState === 'hidden'; } catch (e) { return false; }
  }

  /* every(ms, run, opts) -> a handle with stop(), now() and state().

     run may return a promise. Its rejection is caught and counted as a failure
     rather than escaping into the console, because a tick that throws once and
     dies leaves a page that looks live and never updates again, which is the
     exact fault this file exists to fix. */
  function every(ms, run, opts) {
    opts = opts || {};
    var period = Math.max(MIN, Number(ms) || 20000);
    var timer = null, running = false, stopped = false, fails = 0, lastOk = null;

    function delay() {
      /* doubling, and the ceiling matters: without one, an overnight outage ends
         with a tick scheduled days out and a page that never recovers */
      return period * Math.pow(2, Math.min(fails, MAX_BACKOFF));
    }

    function schedule() {
      if (stopped || timer) return;
      if (hidden()) return;              // nothing runs behind a hidden tab
      timer = setTimeout(fire, delay());
    }

    function fire() {
      timer = null;
      if (stopped || running) return;
      if (hidden()) return;
      running = true;
      var done = function (okd) {
        running = false;
        if (okd) { fails = 0; lastOk = Date.now(); } else { fails++; }
        schedule();                       // only ever scheduled after finishing
      };
      var out;
      try { out = run(); } catch (e) { done(false); return; }
      if (out && typeof out.then === 'function') {
        out.then(function () { done(true); }, function () { done(false); });
      } else { done(true); }
    }

    function wake() {
      if (stopped || hidden()) return;
      if (timer) { clearTimeout(timer); timer = null; }
      fire();                             // straight away, not after a full period
    }

    try {
      document.addEventListener('visibilitychange', function () {
        if (hidden()) { if (timer) { clearTimeout(timer); timer = null; } }
        else { wake(); }
      });
      root.addEventListener('focus', wake);
    } catch (e) {}

    var handle = {
      now: wake,
      stop: function () { stopped = true; if (timer) { clearTimeout(timer); timer = null; } },
      state: function () {
        return { period: period, failures: fails, last_success: lastOk, running: running };
      }
    };
    ticks.push(handle);
    if (opts.immediate !== false) { try { fire(); } catch (e) {} } else { schedule(); }
    return handle;
  }

  function stopAll() { ticks.forEach(function (t) { t.stop(); }); ticks = []; }

  root.SprintLive = { every: every, stopAll: stopAll, MIN: MIN };
})(window);
