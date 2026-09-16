/* A way out that a thumb can reach. Every overlay, every page.

   16 September 2026. Luther, on the phone: "It doesn't close when I try to close
   it." That was the search panel, and it was fixed. Then a test was written to ask
   the same question of every other overlay in the app, and it found the identical
   bug in five more places:

     the drawer on Accounts, Sales, Tenders and Incidents. It slides in from the
     right at width:100% with a max-width of 420, so on a 375 pixel phone it fills
     the screen and there is no backdrop left to tap. Its only Close button floats
     at the TOP of a panel that scrolls, which is the one part of a phone a thumb
     cannot reach;

     the red alert on Incidents, which is worse. It is centred, it has no gesture,
     and for anybody who is not a manager there is no acknowledge button at all. A
     driver could open it and have no way to put it down.

   THE RULE THIS FILE ENFORCES: an overlay must be dismissable by a thumb, without
   aiming, in the bottom half of the screen. So each one gets:

     a DRAG in the direction it arrived from. The drawer came from the right, so it
     leaves to the right; a centred dialog leaves downwards, which is what every
     phone already teaches. The panel follows the finger, because a sheet that does
     not move under the thumb feels broken even when it works;

     a bottom anchored Close bar, injected only when the overlay does not already
     have a control in the bottom third of the screen, so a page that already got
     this right is not given a second button;

     the Escape key on the DOCUMENT, not on a field. That was the exact fault in
     the search panel: escape worked until you clicked a result, and a phone has no
     escape key anyway, so it was never the real answer.

   Transform and opacity only while the finger is down. Everything else repaints.

   It is a progressive enhancement and it never invents a close: if a page gives it
   no way to actually dismiss the thing, it does nothing rather than drawing a
   button that lies. */
(function (root, doc) {
  'use strict';

  var THUMB = 90;          // how far a drag must travel to count as a dismissal
  var BOTTOM_THIRD = 0.66; // a control below this fraction of the screen is reachable

  function css() {
    if (doc.getElementById('sp-reach-css')) return;
    var st = doc.createElement('style');
    st.id = 'sp-reach-css';
    st.textContent =
      '.sp-reach-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;' +
        'padding:10px 16px calc(14px + env(safe-area-inset-bottom,0px));' +
        'background:linear-gradient(to top,rgba(6,14,10,.96),rgba(6,14,10,.72) 62%,rgba(6,14,10,0));' +
        'display:flex;justify-content:center;pointer-events:none}' +
      '.sp-reach-bar button{pointer-events:auto;min-height:52px;min-width:180px;' +
        'border-radius:16px;border:2px solid rgba(255,255,255,.22);' +
        'background:rgba(255,255,255,.12);color:#F4F7F5;font:inherit;font-size:15px;font-weight:800;' +
        '-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}' +
      '.sp-reach-grip{position:absolute;left:50%;transform:translateX(-50%);top:6px;' +
        'width:42px;height:5px;border-radius:999px;background:rgba(255,255,255,.34);pointer-events:none}' +
      '@media (prefers-reduced-motion: reduce){.sp-reach-panel{transition:none !important}}';
    doc.head.appendChild(st);
  }

  /* Is there already something to press down where the hand is? */
  function reachableControl(panel) {
    var h = root.innerHeight || 800;
    var hits = panel.querySelectorAll('button, a, [role="button"]');
    for (var i = 0; i < hits.length; i++) {
      var r = hits[i].getBoundingClientRect();
      if (r.height > 0 && r.top > h * BOTTOM_THIRD) return true;
    }
    return false;
  }

  function drag(panel, axis, onDismiss) {
    var start = null, moved = 0;
    panel.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { start = null; return; }
      /* a drag that begins inside a scrolled list is a scroll, not a dismissal */
      if (axis === 'y' && panel.scrollTop > 0) { start = null; return; }
      start = axis === 'x' ? e.touches[0].clientX : e.touches[0].clientY;
      moved = 0;
      panel.style.transition = 'none';
    }, { passive: true });
    panel.addEventListener('touchmove', function (e) {
      if (start === null) return;
      var now = axis === 'x' ? e.touches[0].clientX : e.touches[0].clientY;
      moved = now - start;
      if (moved < 0) moved = 0;
      panel.style.transform = axis === 'x'
        ? 'translateX(' + moved + 'px)'
        : 'translateY(' + moved + 'px)';
    }, { passive: true });
    panel.addEventListener('touchend', function () {
      if (start === null) return;
      var far = moved > THUMB;
      start = null;
      panel.style.transition = 'transform .24s cubic-bezier(.22,.61,.36,1)';
      panel.style.transform = '';
      if (far) onDismiss();
    });
  }

  /* Wire one overlay. `close` is the page's OWN close, never one this file invents. */
  function wire(panel, opts) {
    if (!panel || panel.getAttribute('data-sp-reach') === 'on') return false;
    var close = opts && opts.close;
    if (typeof close !== 'function') return false;
    css();
    panel.setAttribute('data-sp-reach', 'on');
    panel.classList.add('sp-reach-panel');

    drag(panel, (opts && opts.axis) || 'y', close);

    if (opts && opts.grip) {
      var g = doc.createElement('i');
      g.className = 'sp-reach-grip';
      panel.insertBefore(g, panel.firstChild);
    }

    if (!reachableControl(panel)) {
      /* THE BAR GOES ON THE BODY, NOT INSIDE THE PANEL, and this is not a detail.

         The drawer is moved with transform:translateX. A transformed element
         becomes the containing block for any fixed position descendant, so a bar
         with left:0;right:0 inside the drawer is fixed to THE DRAWER, not to the
         screen, and it rode 255 pixels off the right hand edge with the panel it
         was supposed to be rescuing. A test measured it before anybody saw it.

         On the body it is fixed to the viewport, which is what fixed was always
         meant to mean, and it is shown and hidden with the panel by watching the
         one class the page already toggles. */
      var bar = doc.createElement('div');
      bar.className = 'sp-reach-bar';
      bar.style.display = 'none';
      var b = doc.createElement('button');
      b.type = 'button';
      b.textContent = (opts && opts.label) || 'Close';
      b.addEventListener('click', close);
      bar.appendChild(b);
      doc.body.appendChild(bar);

      var shown = function () {
        return panel.classList.contains('show') &&
          getComputedStyle(panel).display !== 'none';
      };
      var sync = function () { bar.style.display = shown() ? 'flex' : 'none'; };
      sync();
      if (root.MutationObserver) {
        new root.MutationObserver(sync).observe(panel, {
          attributes: true, attributeFilter: ['class', 'style']
        });
      }
    }
    return true;
  }

  /* Escape, once, on the document, for whatever is open. */
  var openers = [];
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    for (var i = openers.length - 1; i >= 0; i--) {
      if (openers[i].isOpen()) { openers[i].close(); return; }
    }
  });

  /* The drawer pattern, shared by four department pages. It arrives from the
     right, so it leaves to the right. */
  function drawer(opts) {
    var panel = doc.querySelector((opts && opts.panel) || '.drawer');
    if (!panel) return;
    var close = (opts && opts.close) || function () {
      if (typeof root.closeDrawer === 'function') root.closeDrawer();
    };
    wire(panel, { axis: 'x', close: close, label: (opts && opts.label) || 'Close' });
    openers.push({
      isOpen: function () { return panel.classList.contains('show'); },
      close: close
    });
  }

  root.SprintReach = { wire: wire, drawer: drawer, THUMB: THUMB };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', function () { drawer(); });
  } else {
    drawer();
  }
})(typeof self !== 'undefined' ? self : this, document);
