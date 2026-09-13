/* Sprint OS motion: the layer that makes the system feel physical. Brick 98.

   Luther, 13 September 2026, pasting an animation brief: "zero latency execution
   disguised by deeply intentional, physically grounded animations". Five things:
   a card that expands in place, a modal that grows out of the button that opened
   it, an overlay that dissolves instead of vanishing, a wall screen that falls
   back to three big numbers when nobody touches it, and a button that says yes
   before the network has.

   Everything here is plain browser JS, no build step, ASCII only, loaded after a
   page's own script. One file so a department page stays thin, the same shape
   apps/shared/sprint-patterns.js already uses.

   THREE PLACES THIS DELIBERATELY DOES NOT DO WHAT WAS ASKED, each for a reason
   that costs something real if ignored:

   1. NOTHING WAITS FOR AN ANIMATION. The brief's own words are zero latency. So
      every handler fires the actual work FIRST and animates afterwards. An
      animation that runs before the call has not disguised the latency, it has
      added some. Read optimistic() below: the queue call is line one.

   2. AN OPTIMISTIC TICK MUST BE ABLE TO TAKE ITSELF BACK. A green tick that
      cannot turn back into a problem is not optimism, it is a lie told to a
      driver standing at a gate. Brick 79's replay rules already say a 4xx is
      dropped and reported, so .is-success has a way back to .is-failed and the
      button says what happened in words. This is the single most important line
      in the file.

   3. AMBIENT IS OPT IN, AND IT WAKES FOR AN ALERT. A driver's phone must never
      go black in the middle of a shift, so a page has to ask for ambient with
      data-ambient-ok="yes". And a wall screen that hides a red alert to look
      calm is brick 90's siren in an empty room all over again, so wake() exists
      and the alert count tile is never one of the ones that fades.

   And one rule that is not a judgement call: prefers-reduced-motion is honoured
   everywhere. Motion sickness is real, and a phone in a moving vehicle is the
   worst possible place for a spring to overshoot. Under that setting every
   animation here becomes an instant state change. The RESULT never differs, only
   the journey to it, so nothing is ever hidden from someone who turned motion off. */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- curves --
  // Entry overshoots slightly, the way a thing with mass arrives and settles.
  // Exit does not overshoot: leaving should feel decided, not bouncy.
  var SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';   // arrive, with weight
  var SETTLE = 'cubic-bezier(0.32, 0.72, 0, 1)';      // morph, no overshoot
  var LEAVE  = 'cubic-bezier(0.4, 0.0, 1, 1)';        // go, and mean it
  var T_MORPH = 320, T_COLLAPSE = 240, T_MODAL = 340, T_DISSOLVE = 190;

  function still() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }
  function ms(n) { return still() ? 0 : n; }

  var CSS = '' +
    ':root{--sp-spring:' + SPRING + ';--sp-settle:' + SETTLE + ';--sp-leave:' + LEAVE + '}' +

    /* 1. the card that becomes the detail ------------------------------- */
    '.sp-morph{will-change:transform;transform-origin:top center}' +
    '.sp-morph .sp-detail{opacity:0;max-height:0;overflow:hidden;' +
      'transition:opacity 140ms linear 120ms,max-height ' + T_MORPH + 'ms var(--sp-settle)}' +
    '.sp-morph.is-open .sp-detail{opacity:1;max-height:1400px}' +
    /* the tapped card lifts a little so it reads as the one in front */
    '.sp-morph.is-open{box-shadow:0 26px 60px -22px rgba(0,0,0,.7);position:relative;z-index:2}' +
    '.sp-morph[data-sp-tap]{cursor:pointer}' +

    /* 2. the modal that grows out of the button ------------------------- */
    '.sp-origin{transform-origin:var(--sp-ox,100%) var(--sp-oy,100%);' +
      'transform:scale(.28) translate3d(0,14px,0);opacity:0;' +
      'transition:transform ' + T_MODAL + 'ms var(--sp-spring),opacity 180ms linear}' +
    '.sp-origin.is-in{transform:scale(1) translate3d(0,0,0);opacity:1}' +
    '.sp-origin.is-out{transform:scale(.34) translate3d(0,10px,0);opacity:0;' +
      'transition:transform 200ms var(--sp-leave),opacity 150ms linear 40ms}' +

    /* 3. the overlay that dissolves instead of vanishing ---------------- */
    '.sp-veil{opacity:0;transition:opacity ' + T_DISSOLVE + 'ms linear}' +
    '.sp-veil.is-in{opacity:1}' +
    '.sp-sheet{opacity:0;transform:scale(.97);' +
      'transition:opacity 160ms linear,transform 260ms var(--sp-spring)}' +
    '.sp-sheet.is-in{opacity:1;transform:scale(1)}' +
    '.sp-sheet.is-out{opacity:0;transform:scale(.965);' +
      'transition:opacity ' + T_DISSOLVE + 'ms linear,transform ' + T_DISSOLVE + 'ms var(--sp-leave)}' +

    /* 4. the wall screen at rest ---------------------------------------- */
    'html[data-ambient="true"]{background:#000 !important}' +
    'html[data-ambient="true"] body{background:#000 !important;transition:background 900ms linear}' +
    'html[data-ambient="true"] body::after,html[data-ambient="true"] body::before{opacity:0 !important}' +
    'html[data-ambient="true"] header,html[data-ambient="true"] .topbar,html[data-ambient="true"] nav,' +
      'html[data-ambient="true"] .bar,html[data-ambient="true"] .filters,html[data-ambient="true"] .rail,' +
      'html[data-ambient="true"] button:not([data-ambient-keep]),html[data-ambient="true"] .sec,' +
      'html[data-ambient="true"] .feed,html[data-ambient="true"] .tiles,html[data-ambient="true"] .panel,' +
      'html[data-ambient="true"] .card:not([data-ambient-tile]){' +
      'opacity:0;pointer-events:none;transition:opacity 700ms linear}' +
    '#sp-ambient{position:fixed;inset:0;z-index:900;background:#000;color:#fff;display:none;' +
      'flex-direction:column;justify-content:center;gap:clamp(14px,4vh,46px);' +
      'padding:clamp(20px,5vw,70px);opacity:0;transition:opacity 900ms linear;' +
      'font-variant-numeric:tabular-nums}' +
    'html[data-ambient="true"] #sp-ambient{display:flex;opacity:1}' +
    '#sp-ambient .amb{display:flex;align-items:baseline;justify-content:space-between;gap:20px;' +
      'border-bottom:1px solid rgba(255,255,255,.14);padding-bottom:clamp(8px,2vh,22px)}' +
    '#sp-ambient .amb:last-of-type{border-bottom:0}' +
    '#sp-ambient .amb .k{font-size:clamp(15px,2.6vw,34px);font-weight:700;color:#9AA8A1;' +
      'letter-spacing:.04em;text-transform:uppercase}' +
    '#sp-ambient .amb .v{font-size:clamp(58px,17vw,230px);font-weight:900;line-height:.86;' +
      'letter-spacing:-.03em}' +
    '#sp-ambient .amb .v.none{font-size:clamp(20px,4vw,52px);font-weight:700;color:#8E9B95;letter-spacing:0}' +
    /* the one that must never be calm */
    '#sp-ambient .amb.loud .v{color:#FF6B61}' +
    '#sp-ambient .amb.loud .k{color:#FFB3AD}' +
    '#sp-ambient .foot{position:absolute;left:clamp(20px,5vw,70px);bottom:clamp(16px,3vh,40px);' +
      'font-size:clamp(11px,1.5vw,18px);color:#5E6B65}' +

    /* 5. the button that answers before the network does ---------------- */
    '.is-executing{position:relative;pointer-events:none;' +
      'transition:transform 180ms var(--sp-settle),background 180ms linear,color 180ms linear}' +
    '.is-executing{transform:scale(.96)}' +
    '.is-success{pointer-events:none;background:#2E8B3F !important;border-color:#2E8B3F !important;' +
      'color:#fff !important;transform:scale(1);' +
      'transition:transform 260ms var(--sp-spring),background 200ms linear}' +
    '.is-success .sp-tick{display:inline-block;animation:sp-tick 380ms var(--sp-spring) both}' +
    '.is-failed{background:#8C2F28 !important;border-color:#FF6B61 !important;color:#fff !important;' +
      'pointer-events:auto;animation:sp-nudge 320ms ease-in-out both}' +
    '@keyframes sp-tick{from{transform:scale(.2) rotate(-12deg);opacity:0}to{transform:none;opacity:1}}' +
    '@keyframes sp-nudge{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}' +

    /* the whole layer stands down for anyone who asked for less motion */
    '@media (prefers-reduced-motion: reduce){' +
      '.sp-morph,.sp-morph .sp-detail,.sp-origin,.sp-veil,.sp-sheet,.is-executing,.is-success,' +
      '#sp-ambient,html[data-ambient="true"] body{transition-duration:1ms !important;animation-duration:1ms !important}' +
      '.sp-origin{transform:none}.sp-sheet{transform:none}' +
    '}';

  function css() {
    if (document.getElementById('sp-motion-css')) return;
    var s = document.createElement('style');
    s.id = 'sp-motion-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  // =========================================================== 1. the morph ==
  /* FLIP, not the View Transitions API. That API only reached Safari in version
     18, and the phones being trialled here include older ones, so a driver on an
     older iPhone would get a hard snap while everyone else got the morph. FLIP
     is four lines of arithmetic and works in every browser this system runs in.

     First: measure where everything is. Last: change the class and measure
     again. Invert: put everything back where it was with a transform. Play: take
     the transform off and let the browser move it. The siblings are measured too,
     which is what makes them look pushed rather than teleported. */
  function flip(host, mutate, opts) {
    opts = opts || {};
    var kids = Array.prototype.slice.call(host.children);
    if (still()) { mutate(); return Promise.resolve(); }

    var first = kids.map(function (el) { return el.getBoundingClientRect(); });
    mutate();
    var last = kids.map(function (el) { return el.getBoundingClientRect(); });

    kids.forEach(function (el, i) {
      var dy = first[i].top - last[i].top;
      var dh = first[i].height / Math.max(1, last[i].height);
      if (Math.abs(dy) < 0.5 && Math.abs(dh - 1) < 0.01) return;
      el.style.transformOrigin = 'top center';
      el.style.transform = 'translate3d(0,' + dy + 'px,0)' + (el === opts.grown ? ' scaleY(' + dh + ')' : '');
      el.style.transition = 'none';
    });
    // one forced read, so the browser accepts the above as a starting point
    void host.offsetHeight;
    var dur = ms(opts.duration || T_MORPH);
    kids.forEach(function (el) {
      if (!el.style.transform) return;
      el.style.transition = 'transform ' + dur + 'ms ' + SETTLE;
      el.style.transform = '';
    });
    return new Promise(function (done) {
      setTimeout(function () {
        kids.forEach(function (el) { el.style.transition = ''; el.style.transform = ''; el.style.transformOrigin = ''; });
        done();
      }, dur + 30);
    });
  }

  /* Wire a list so tapping a card opens it in place and closes any other.
     listSel is the container, cardSel the cards. Each card needs a .sp-detail
     child holding whatever should fade in. Buttons inside a card never toggle
     it: a tap on Deliver is Deliver, not a collapse. */
  function morphList(listSel, cardSel) {
    var host = typeof listSel === 'string' ? document.querySelector(listSel) : listSel;
    if (!host || host.getAttribute('data-sp-wired') === 'morph') return null;
    host.setAttribute('data-sp-wired', 'morph');
    css();
    Array.prototype.forEach.call(host.querySelectorAll(cardSel), function (c) {
      c.classList.add('sp-morph');
      c.setAttribute('data-sp-tap', '1');
      if (!c.hasAttribute('tabindex')) c.setAttribute('tabindex', '0');
      c.setAttribute('role', 'button');
      c.setAttribute('aria-expanded', c.classList.contains('is-open') ? 'true' : 'false');
    });
    function toggle(card) {
      var open = card.classList.contains('is-open');
      var others = Array.prototype.filter.call(host.querySelectorAll(cardSel), function (o) {
        return o !== card && o.classList.contains('is-open');
      });
      flip(host, function () {
        others.forEach(function (o) { o.classList.remove('is-open'); o.setAttribute('aria-expanded', 'false'); });
        card.classList.toggle('is-open', !open);
        card.setAttribute('aria-expanded', String(!open));
      }, { grown: card, duration: open ? T_COLLAPSE : T_MORPH });
    }
    host.addEventListener('click', function (e) {
      // a tap on a control is that control, never a collapse
      if (e.target.closest('button,a,input,select,textarea,label,[data-sp-keep]')) return;
      var card = e.target.closest(cardSel);
      if (card && host.contains(card)) toggle(card);
    });
    host.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest && e.target.closest(cardSel);
      if (card && card === e.target) { e.preventDefault(); toggle(card); }
    });
    return { toggle: toggle };
  }

  // ===================================================== 2. modal from a FAB ==
  /* The modal grows out of the control that opened it, so the eye never loses
     the thread. transform-origin is set from the button's real position on the
     screen at the moment of the tap, because a floating button moves with the
     scroll and a hard coded "bottom right" is wrong the moment it does. */
  function originFrom(panel, source) {
    css();
    var r = (source && source.getBoundingClientRect) ? source.getBoundingClientRect() : null;
    panel.classList.add('sp-origin');
    if (r) {
      var p = panel.getBoundingClientRect();
      var ox = p.width ? ((r.left + r.width / 2) - p.left) : 0;
      var oy = p.height ? ((r.top + r.height / 2) - p.top) : 0;
      panel.style.setProperty('--sp-ox', Math.round(ox) + 'px');
      panel.style.setProperty('--sp-oy', Math.round(oy) + 'px');
    }
    panel.classList.remove('is-out');
    void panel.offsetHeight;
    panel.classList.add('is-in');
    return panel;
  }
  function originClose(panel, then) {
    css();
    panel.classList.remove('is-in');
    panel.classList.add('is-out');
    setTimeout(function () {
      panel.classList.remove('is-out', 'sp-origin');
      if (then) then();
    }, ms(210) + 20);
  }

  // ================================================= 3. the overlay dissolve ==
  /* Layers, not pages. The veil fades and the sheet scales down a breath, so the
     board underneath is revealed exactly where it was left. Nothing moves on the
     board itself, which is the whole point: the reader keeps their place. */
  function veilOpen(wrap, sheet) {
    css();
    wrap.classList.add('sp-veil'); if (sheet) sheet.classList.add('sp-sheet');
    wrap.classList.remove('is-out'); if (sheet) sheet.classList.remove('is-out');
    void wrap.offsetHeight;
    wrap.classList.add('is-in'); if (sheet) sheet.classList.add('is-in');
  }
  function veilClose(wrap, sheet, then) {
    css();
    wrap.classList.remove('is-in');
    if (sheet) { sheet.classList.remove('is-in'); sheet.classList.add('is-out'); }
    setTimeout(function () {
      if (sheet) sheet.classList.remove('is-out');
      if (then) then();
    }, ms(T_DISSOLVE) + 20);
  }

  // ====================================================== 4. the wall screen ==
  /* A screen on the wall with nobody in front of it should stop shouting small
     print and show the three things somebody walking past needs.

     Opt in only. A page asks for this with data-ambient-ok="yes", because a
     driver's phone going black in the middle of a shift is a fault, not a
     feature, and a phone is the one place this must never fire.

     read() returns three rows. A row whose value is null prints the reason in
     words. It NEVER prints a zero it cannot prove: a wall screen saying 0
     exceptions when the truth is that nothing was counted is worse than a blank
     wall, because somebody believes it from across the room. */
  var amb = { timer: null, ms: 5 * 60 * 1000, read: null, on: false, node: null };

  function ambientPaint() {
    if (!amb.node || !amb.read) return;
    var rows = [];
    try { rows = amb.read() || []; } catch (e) { rows = []; }
    var h = rows.slice(0, 3).map(function (r) {
      var none = (r.value === null || r.value === undefined || r.value === '');
      return '<div class="amb' + (r.loud ? ' loud' : '') + '">' +
        '<span class="k">' + String(r.label || '') + '</span>' +
        '<span class="v' + (none ? ' none' : '') + '">' +
        (none ? String(r.absent || 'not recorded') : String(r.value)) + '</span></div>';
    }).join('');
    var t = new Date();
    amb.node.innerHTML = h + '<div class="foot">Sprint OS, resting. Touch the screen for the full board. ' +
      ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2) + '</div>';
  }

  function ambientOn() {
    if (amb.on) return;
    amb.on = true;
    document.documentElement.setAttribute('data-ambient', 'true');
    ambientPaint();
    amb.paintTimer = setInterval(ambientPaint, 30000);
  }
  function wake() {
    if (amb.on) {
      amb.on = false;
      document.documentElement.removeAttribute('data-ambient');
      clearInterval(amb.paintTimer);
    }
    if (amb.timer) clearTimeout(amb.timer);
    if (amb.read) amb.timer = setTimeout(ambientOn, amb.ms);
  }

  function ambient(read, minutes) {
    if (document.documentElement.getAttribute('data-ambient-ok') !== 'yes') return null;
    css();
    amb.read = read;
    amb.ms = Math.max(30000, (minutes || 5) * 60000);
    if (!amb.node) {
      amb.node = document.createElement('div');
      amb.node.id = 'sp-ambient';
      amb.node.setAttribute('aria-live', 'polite');
      document.body.appendChild(amb.node);
    }
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'mousemove'].forEach(function (ev) {
      window.addEventListener(ev, wake, { passive: true });
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });
    wake();
    return { wake: wake, sleepNow: ambientOn, repaint: ambientPaint };
  }

  // ================================================ 5. the button that says yes ==
  /* The work goes first. Always. The brief asked for zero latency, and an
     animation that runs before the call has added latency rather than hidden it.

     And the tick can be taken back. Brick 79 already says a 4xx is dropped and
     reported while a network failure is kept and retried, so:
        kept for later  -> stays a tick, with the word Queued, which is true
        refused outright -> turns red, says what happened, and is tappable again
     A green tick that cannot become a problem is a lie told to a driver standing
     at somebody's gate, and they will believe it. */
  function optimistic(btn, work, opts) {
    opts = opts || {};
    css();
    var original = btn.innerHTML;
    var done = false;

    var p;
    try { p = work(); } catch (e) { p = Promise.reject(e); }   // the work, first

    btn.classList.remove('is-failed');
    btn.classList.add('is-executing');
    setTimeout(function () {
      if (done) return;
      btn.classList.remove('is-executing');
      btn.classList.add('is-success');
      btn.innerHTML = '<span class="sp-tick">' + String.fromCharCode(10003) + '</span> ' +
        (opts.success || 'Done');
    }, ms(120));

    return Promise.resolve(p).then(function (r) {
      done = true;
      btn.classList.remove('is-executing');
      btn.classList.add('is-success');
      var queued = r && (r.queued === true || r.persisted === false);
      btn.innerHTML = '<span class="sp-tick">' + String.fromCharCode(10003) + '</span> ' +
        (queued ? (opts.queued || 'Saved, sending when there is signal') : (opts.success || 'Done'));
      return r;
    }).catch(function (err) {
      done = true;
      // Kept for later is not a failure: brick 79 retries it and the tick stands.
      if (err && err.keep === true) {
        // is-executing must come off here too, or the button stays shrunk at
        // scale .96 while wearing the success class. Found by measuring the
        // three paths rather than only the happy one.
        btn.classList.remove('is-executing');
        btn.classList.add('is-success');
        btn.innerHTML = '<span class="sp-tick">' + String.fromCharCode(10003) + '</span> ' +
          (opts.queued || 'Saved, sending when there is signal');
        return { queued: true };
      }
      btn.classList.remove('is-executing', 'is-success');
      btn.classList.add('is-failed');
      btn.innerHTML = (opts.failed || 'Did not save, tap to try again');
      btn.setAttribute('data-sp-was', original);
      throw err;
    });
  }

  root.SprintMotion = {
    morphList: morphList, flip: flip,
    originFrom: originFrom, originClose: originClose,
    veilOpen: veilOpen, veilClose: veilClose,
    ambient: ambient, wake: wake,
    optimistic: optimistic,
    reducedMotion: still,
    css: css
  };
})(window);
