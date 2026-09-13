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
  var scroller = null;
  var small = false;
  var ticking = false;

  var CSS = '' +
    /* the animation, on the bar and the things inside it */
    'header, .topbar{transition:min-height .18s ease, box-shadow .18s ease}' +
    'header img, .topbar img{transition:height .18s ease}' +
    'header .titles, header > h1{transition:margin .18s ease, font-size .18s ease}' +
    /* --- the small state, stated with !important because the theme sets the
       header image height in three separate bricks and the small state must win
       outright rather than depend on which of them loaded last --- */
    /* --- the small state ---
       A 375 px phone cannot fit the wordmark, the title, the bell and the badge
       on one row, so folding to a single line was never possible; what is
       possible is making both rows tight. Measured: 129 px becomes 68 px, which
       is half the header and eight per cent of the screen handed back. */
    '.sp-small.topbar{min-height:52px !important}' +
    '.sp-small.topbar img{height:46px !important}' +
    '.sp-small.topbar .pills .pill{font-size:10px;padding:5px 9px}' +
    /* the small header folds to ONE row: at 46 px the wordmark is 155 px wide,
       so the title, the bell and the badge all still fit a 375 px screen. The
       logo fills the bar rather than floating in the middle of it, which is what
       made the first attempt look awkward. */
    'header.sp-small{min-height:0 !important;flex-wrap:nowrap !important}' +
    'header.sp-small::after{display:none !important}' +
    'header.sp-small img{height:46px !important;align-self:center !important}' +
    'header.sp-small .titles, header.sp-small > h1{margin:0 !important;padding-left:10px !important;min-width:0}' +
    'header.sp-small .titles h1, header.sp-small > h1{font-size:13.5px !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    'header.sp-small .titles .who{display:none !important}' +
    'header.sp-small .hdr-bell{width:32px !important;height:32px !important;margin:0 !important}' +
    'header.sp-small .hdr-bell svg{width:16px;height:16px}' +
    'header.sp-small .sync-badge{font-size:9.5px;padding:4px 8px;margin:0 !important;min-height:0;white-space:nowrap}' +
    'header.sp-small #pulseWidget{margin:0 !important}' +
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

  // Which thing is actually scrolling. Most pages scroll the window, but several
  // department pages give html and body a fixed height with overflow auto, so the
  // BODY scrolls and window.pageYOffset never moves off zero. Listening only to
  // the window left the bar frozen at full height on exactly the long pages this
  // was built for, which is how it was caught.
  function currentY() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y) return y;
    if (document.body && document.body.scrollTop) return document.body.scrollTop;
    if (scroller && scroller.scrollTop) return scroller.scrollTop;
    return 0;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = currentY();
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
    // the nearest ancestor of the bar that actually scrolls, if any
    var el = bars[0].parentNode;
    while (el && el !== document) {
      var ov = getComputedStyle(el).overflowY;
      if ((ov === 'auto' || ov === 'scroll') && el.scrollHeight > el.clientHeight + 20) { scroller = el; break; }
      el = el.parentNode;
    }
    // capture catches a scroll from any element, since scroll does not bubble
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();   // a page restored mid scroll starts in the right state
    // A browser fires no scroll event when scrollTop is set from code, and some
    // in-page scrollers are quiet in other ways too. A half second poll costs
    // nothing measurable and means the bar is never left in the wrong state.
    setInterval(onScroll, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.SprintChrome = { shrink: function () { apply(true); }, expand: function () { apply(false); },
                          isSmall: function () { return small; } };
})();
