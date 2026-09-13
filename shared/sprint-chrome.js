/* Sprint OS: the bar shrinks as you scroll. Brick 75.

   Luther, 13 Sep 2026: "make the bar shrink as you scroll."

   Brick 74 gave the wordmark the whole first row at 72 px with the title under
   it, which cost a 129 px sticky header, sixteen per cent of a phone screen that
   never came back. This buys most of it back: scroll down and the wordmark
   shrinks, the title slides up beside it, and the two rows become one. Scroll
   back to the top and it opens out again.

   Three things it is careful about:

     * It never moves while you are reading. The change happens once, at a
       threshold, with a small dead zone either side, so a bar cannot flicker
       between two sizes when a thumb rests mid scroll.
     * It costs nothing per frame. The scroll listener is passive and does no
       measuring; it flips one class and the stylesheet does the rest.
     * A person who has asked their phone for less motion gets none. If the
       system says prefers-reduced-motion, the bar still shrinks but without
       the animation, because the point is the space, not the movement.

   Works on the home page's .topbar and on every department header, and is
   loaded by pages that already carry a shared script, so no page markup
   changes. */
(function () {
  'use strict';

  var SHRINK_AT = 46;    // px scrolled before the bar collapses
  var GROW_AT = 14;      // and back below this, so the two never fight
  var bars = [];
  var small = false;
  var ticking = false;

  var CSS = '' +
    /* the animation, on the bar and the things inside it */
    'header, .topbar{transition:min-height .18s ease, box-shadow .18s ease}' +
    'header img, .topbar img{transition:height .18s ease}' +
    'header .titles, header > h1{transition:margin .18s ease, font-size .18s ease}' +
    /* --- the small state --- */
    '.sp-small.topbar{min-height:52px}' +
    '.sp-small.topbar img{height:40px}' +
    /* a department header folds its two rows into one: the break stops breaking */
    'header.sp-small{min-height:0}' +
    'header.sp-small::after{flex-basis:0;width:0}' +
    'header.sp-small img{height:44px}' +
    'header.sp-small .titles, header.sp-small > h1{margin:6px 0 6px;padding-left:12px}' +
    'header.sp-small .titles h1, header.sp-small > h1{font-size:14px}' +
    'header.sp-small .titles .who{display:none}' +        /* the signed in name is not needed while scrolling */
    'header.sp-small .hdr-bell, header.sp-small .sync-badge, header.sp-small #pulseWidget{margin:6px 0}' +
    'header.sp-small .sync-badge{font-size:10px;padding:4px 9px}' +
    /* a shrunk bar earns a shadow, so it reads as floating above the list */
    '.sp-small{box-shadow:0 14px 30px -18px rgba(0,0,0,.85)}' +
    '@media (prefers-reduced-motion: reduce){' +
      'header, .topbar, header img, .topbar img, header .titles, header > h1{transition:none}' +
    '}';

  function injectCss() {
    if (document.getElementById('sp-chrome-css')) return;
    var s = document.createElement('style');
    s.id = 'sp-chrome-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function apply(next) {
    if (next === small) return;
    small = next;
    for (var i = 0; i < bars.length; i++) bars[i].classList.toggle('sp-small', small);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      // a dead zone between the two thresholds: a thumb resting mid scroll
      // must never make the bar flicker between sizes
      if (!small && y > SHRINK_AT) apply(true);
      else if (small && y < GROW_AT) apply(false);
    });
  }

  function boot() {
    bars = [].slice.call(document.querySelectorAll('header, .topbar'))
      .filter(function (el) { return el.querySelector('img'); });
    if (!bars.length) return;
    injectCss();
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();   // a page restored mid scroll starts in the right state
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.SprintChrome = { shrink: function () { apply(true); }, expand: function () { apply(false); },
                          isSmall: function () { return small; } };
})();
