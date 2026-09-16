/* Press it once. The second press does nothing, and a retry is safe.

   17 September 2026. Save assignment, Advance status, Raise exception and Submit
   proof of delivery had no guard at all, and the proof of delivery does two posts one
   after the other. On a slow connection a person taps Submit, nothing appears to
   happen, and they tap again.

   THE BUTTON IS THE SMALLER HALF OF THIS AND IT IS WORTH BEING HONEST ABOUT THAT.
   Going grey does not prevent a duplicate: by the time the button changes, the first
   request is already crossing the wire, and a phone that retries after a timeout
   never asked the button anything. The guarantee is in the database, where key plus
   route is unique and a repeat is handed the first answer back.

   What the button does is the other thing that matters, which is telling a person
   what is going on. A control that does not react is a control somebody presses
   harder.

   THE KEY IS MADE ONCE PER ACTION, NOT PER PRESS. That is the whole trick. If a
   press fails and somebody tries again, the SAME key goes up, so the server can tell
   the difference between "this is the same delivery, finish it" and "this is a second
   delivery". A fresh key on every press would turn a retry into a duplicate, which is
   the exact fault this file exists to prevent.

   Use it:
       SprintOnce.guard(button, function (key) { return post('/api/x', { ... }, key); });
*/
(function (root) {
  'use strict';

  function makeKey() {
    try {
      if (root.crypto && root.crypto.randomUUID) return 'k_' + root.crypto.randomUUID();
    } catch (e) {}
    return 'k_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
  }

  function css() {
    if (document.getElementById('sp-once-css')) return;
    var st = document.createElement('style');
    st.id = 'sp-once-css';
    st.textContent =
      '[data-once-busy]{opacity:.62;pointer-events:none;position:relative}' +
      '[data-once-busy]::after{content:"";position:absolute;right:10px;top:50%;' +
        'width:14px;height:14px;margin-top:-7px;border-radius:50%;' +
        'border:2px solid rgba(255,255,255,.35);border-top-color:#fff;' +
        'animation:spOnce .7s linear infinite}' +
      '@keyframes spOnce{to{transform:rotate(360deg)}}' +
      '@media (prefers-reduced-motion: reduce){[data-once-busy]::after{animation:none}}';
    document.head.appendChild(st);
  }

  /* One action, one key, however many attempts it takes. */
  function guard(el, run, opts) {
    if (!el || typeof run !== 'function') return;
    opts = opts || {};
    css();
    if (el.getAttribute('data-once-wired')) return;
    el.setAttribute('data-once-wired', '1');

    var key = null;
    var inFlight = false;

    el.addEventListener('click', function (ev) {
      if (inFlight) {
        /* Not an error and not silence. Somebody pressing twice is somebody who
           thinks nothing happened, and they are owed an answer. */
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return;
      }
      inFlight = true;
      if (!key) key = makeKey();         // made once, reused by every retry
      var was = el.textContent;
      el.setAttribute('data-once-busy', '1');
      el.setAttribute('aria-busy', 'true');
      if (opts.busyText) el.textContent = opts.busyText;

      Promise.resolve()
        .then(function () { return run(key); })
        .then(function () {
          /* Done. The key is kept, not cleared: if this control is somehow pressed
             again for the same action, the server recognises it rather than doing
             the work twice. */
          el.removeAttribute('data-once-busy');
          el.removeAttribute('aria-busy');
          if (opts.doneText) el.textContent = opts.doneText;
          else if (opts.busyText) el.textContent = was;
          if (opts.disableAfter !== false) el.setAttribute('disabled', 'disabled');
          inFlight = false;
        })
        .catch(function (err) {
          /* It failed, so it must be pressable again, WITH THE SAME KEY. A fresh key
             here is how a retry becomes a duplicate. */
          el.removeAttribute('data-once-busy');
          el.removeAttribute('aria-busy');
          el.textContent = was;
          inFlight = false;
          if (typeof opts.onError === 'function') opts.onError(err);
        });
    }, true);
  }

  root.SprintOnce = { guard: guard, makeKey: makeKey };
})(typeof self !== 'undefined' ? self : this);
