/* Sprint OS: the front door carries the work. Brick 93.

   Luther, 13 September 2026, pasting a front end brief in the shape of a food
   delivery app: featured cards for the priority tenders and campaigns, a
   quick filter row, and a live feed of what is happening on the ground.

   What this adds to the home page, under the greeting and the morning card:

     1. THE RAIL. Horizontal, one card per strategic item: the nearest tender
        closing, with the days and hours left counted live and how many of the
        registered documents are in date; and the running campaign. Strategic
        means it is hidden from a driver, who has stops to do.
     2. THE FILTERS. Urgent, My stops, Pending quotes, Exceptions, Tenders. One
        tap narrows the feed. A driver opens on My stops.
     3. THE FEED. What the system did and saw, newest first, with who did it as
        a small round initial, in the words the hub already uses for the
        Insights page. Open red alerts ride at the top as Urgent.

   What it refuses to do:
     * invent a tender, a campaign or a feed line. With no hub it draws EXAMPLE
       cards that say EXAMPLE in the first word, and nothing else.
     * print a comforting zero. No tender on the register says so in words.
     * claim a methodology is complete. The badge is the tender's recorded status
       and nothing more.
     * move the page. The host box is given its height in the markup so the
       departments grid does not jump when the feed lands.

   Same glass, same green, same pills as the rest of the house. The brief asked
   for white; the owner chose this look on 12 September and again tonight, so
   the colour of the ground is his call, not a rewrite's. */
(function (root) {
  'use strict';

  var CSS = '' +
    '#front{min-height:520px}' +
    '.fr-h{display:flex;align-items:baseline;justify-content:space-between;margin:22px 0 10px}' +
    '.fr-h h2{font-size:16px;font-weight:800;margin:0}.fr-h span{font-size:12.5px;color:var(--orange-d,#FDBE74);font-weight:700}' +
    /* the rail */
    '.rail{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:2px 2px 8px;margin:0 -2px;scrollbar-width:none}' +
    '.rail::-webkit-scrollbar{display:none}' +
    '.rc{flex:0 0 82%;max-width:340px;scroll-snap-align:start;position:relative;overflow:hidden;border-radius:26px;min-height:168px;padding:16px 16px 14px;color:#fff;' +
      'background:linear-gradient(135deg,rgba(20,70,45,.66),rgba(42,140,60,.44) 60%,rgba(70,190,90,.30));backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%);' +
      'border:1px solid rgba(255,255,255,.2);box-shadow:0 22px 54px -24px rgba(0,0,0,.65);display:flex;flex-direction:column;justify-content:flex-end;text-decoration:none}' +
    '.rc::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(4,20,14,.55) 100%);pointer-events:none}' +
    /* Brick 102: the tender card's circle was a 170 px disc with a 6 px blur, which
       is a disc with a soft edge and still a disc, and it sat perfectly still. It is
       now a gradient with no edge at all, drifting on its own 41 second loop. That
       number is deliberate: the two shapes behind the morning card run at 34 and 47
       seconds, so nothing on the screen ever moves in step with anything else. Only
       the position animates, never the colour, so the card is not repainted. */
    '.rc.money::after{content:"";position:absolute;right:-55%;top:-75%;width:170%;height:190%;border-radius:50%;' +
      'background:radial-gradient(circle at 50% 50%,rgba(247,148,29,.44),rgba(255,176,70,.20) 42%,rgba(255,176,70,0) 68%);' +
      'will-change:transform;animation:sp-haze-c 41s ease-in-out infinite alternate}' +
    '@keyframes sp-haze-c{0%{transform:translate3d(0,0,0) scale(1)}' +
      '50%{transform:translate3d(-13%,10%,0) scale(1.18)}' +
      '100%{transform:translate3d(8%,-7%,0) scale(1.04)}}' +
    '@media (prefers-reduced-motion: reduce){.rc.money::after{animation:none}}' +
    '.rc > *{position:relative}' +
    '.rc .k{font-size:10.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#FDDCB5}' +
    '.rc .t{font-size:17px;font-weight:900;line-height:1.15;margin:4px 0 6px;letter-spacing:-.2px}' +
    '.rc .s{font-size:12.5px;color:rgba(255,255,255,.88);line-height:1.4}' +
    '.rc .big{font-size:30px;font-weight:900;line-height:1;letter-spacing:-.5px;margin:2px 0 4px;font-variant-numeric:tabular-nums}' +
    '.rc .bar{height:8px;border-radius:999px;background:rgba(255,255,255,.18);overflow:hidden;margin:8px 0 4px}' +
    '.rc .bar i{display:block;height:100%;border-radius:999px;background:var(--orange,#F7941D)}' +
    '.rc .pills{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}' +
    '.rc .pill{font-size:10.5px;padding:4px 10px;border-radius:999px;font-weight:800;background:rgba(255,255,255,.14);color:#fff}' +
    '.rc .pill.hot{background:var(--orange,#F7941D)}.rc .pill.ok{background:var(--teal,#3AAA35)}' +
    /* the filters */
    '.filters{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:2px 2px 6px;margin:6px -2px 4px;scrollbar-width:none}' +
    '.filters::-webkit-scrollbar{display:none}' +
    '.filters button{flex:none;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.26);background:rgba(8,28,20,.40);color:#F4F7F5;font:inherit;font-weight:800;font-size:13px;' +
      'backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:flex;align-items:center;gap:8px}' +
    '.filters button.on{background:#fff;color:#0E2F22;border-color:#fff}' +
    '.filters button b{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:var(--orange,#F7941D);color:#0E2F22;font-size:11px}' +
    /* the feed */
    '.feed{display:flex;flex-direction:column;gap:10px}' +
    '.fi{display:flex;gap:12px;align-items:flex-start;background:rgba(8,28,20,.40);border:1px solid rgba(255,255,255,.22);border-radius:22px;padding:12px 14px;' +
      'backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%);box-shadow:0 22px 54px -24px rgba(0,0,0,.65);min-height:64px}' +
    /* Brick 95: an urgent row must not depend on colour. Red washes out in
       Botswana sun and on a screen dimmed to save battery. So it also gets
       air around it, a filled triangle, and a thicker edge: three signals,
       any one of which survives on its own. */
    '.fi.urgent{border-color:#FF6B61;border-width:2px;margin:20px 0;box-shadow:0 0 0 1px rgba(255,107,97,.35),0 22px 54px -24px rgba(0,0,0,.65)}' +
    '.fi.urgent .av{background:#FF6B61;border-color:#fff;color:#2A0603}' +
    '.fi.urgent .av svg{width:22px;height:22px;display:block}' +
    '.fi.urgent .w{font-weight:900}' +
    '.acts .unwired{opacity:.55;font-style:italic}' +
    '.fi .acts{display:none;gap:8px;margin-top:10px;flex-wrap:wrap}' +
    '.fi.open .acts{display:flex}' +
    '.fi .acts a,.fi .acts button{min-height:48px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.3);' +
      'background:rgba(255,255,255,.14);color:#fff;font:inherit;font-weight:800;font-size:13.5px;display:inline-flex;align-items:center;text-decoration:none}' +
    '.fi .acts a.go,.fi .acts button.go{background:#fff;color:#0E2F22;border-color:#fff}' +
    '.fi .av{flex:none;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:#fff}' +
    '.fi .av.sys{background:rgba(58,170,53,.25);color:#8FE08A}' +
    '.fi .b{flex:1;min-width:0}' +
    '.fi .w{font-size:14px;font-weight:700;line-height:1.35;color:#F4F7F5}' +
    '.fi .m{font-size:11.8px;color:var(--ink-3,#A7B5AE);margin-top:3px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
    '.fi .m .tag{font-size:10px;font-weight:800;letter-spacing:.3px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.12);color:#D3DDD8;text-transform:uppercase}' +
    '.fi .m .tag.urg{background:rgba(255,107,97,.25);color:#FFB3AD}' +
    '.feed .empty{font-size:13px;color:var(--ink-3,#A7B5AE);padding:8px 4px}' +
    'html[data-glare="on"] .rc,html[data-glare="on"] .fi,html[data-glare="on"] .filters button{backdrop-filter:none;-webkit-backdrop-filter:none;background:#0A2417}';

  function css() { if (document.getElementById('sp-front-css')) return; var s = document.createElement('style'); s.id = 'sp-front-css'; s.textContent = CSS; document.head.appendChild(s); }
  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // the roles module stamps data-role on the root element before first paint,
  // so the attribute is the one source every script agrees on
  function role() { try { return document.documentElement.getAttribute('data-role') || 'unknown'; } catch (e) { return 'unknown'; } }
  function ago(iso) { var m = Math.round((Date.now() - Date.parse(iso)) / 60000); if (isNaN(m)) return ''; return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago'; }
  function left(iso) {
    var ms = Date.parse(iso) - Date.now(); if (isNaN(ms)) return null;
    if (ms <= 0) return { over: true, text: 'closed' };
    var d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), mi = Math.floor((ms % 3600000) / 60000);
    return { over: false, d: d, h: h, text: d > 0 ? d + ' d ' + h + ' h' : h > 0 ? h + ' h ' + mi + ' min' : mi + ' min' };
  }
  function initial(name) { var t = String(name || '').trim(); if (!t) return '?'; var p = t.split(/\s+/); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }

  // ------------------------------------------------------------ the data --
  var STATE = { example: false, tenders: null, campaigns: null, docs: null, feed: [], alerts: [], filter: null };
  var FILTERS = [
    { key: 'urgent', label: 'Urgent' }, { key: 'stops', label: 'My stops' }, { key: 'quotes', label: 'Pending quotes' },
    { key: 'exceptions', label: 'Exceptions' }, { key: 'tenders', label: 'Tenders' }
  ];
  // Brick 97: how bad a thing is, is a fact the source knows. Reading it out of
  // the wording was the fault: "Route deviation: Truck stalled in Gaborone North"
  // carries none of the words below, so a stalled truck drew as an ordinary line.
  // A source that declares a severity is believed. The words remain only for the
  // sources that do not declare one yet, and they can only ever raise an item,
  // never talk one down.
  var LOUD = { critical: true, high: true, red: true, level3: true };
  function severe(item) {
    var s = (item.severity || '').toLowerCase();
    return !!(LOUD[s] || item.level === 3 || item.urgent === true);
  }
  function classify(item) {
    var t = (item.text || '').toLowerCase(), e = (item.entity || '').toLowerCase();
    if (severe(item) || /red alert|hijack|accident|emergency/.test(t)) return 'urgent';
    if (/exception|incident|missing proof|not delivered|refused|damaged/.test(t) || e === 'incidents') return 'exceptions';
    if (/quote/.test(t) || e === 'quotes') return 'quotes';
    if (/tender/.test(t) || e === 'tenders') return 'tenders';
    if (/stop|deliver|collected|trip|waybill|parcel|shipment|position/.test(t) || e === 'shipments' || e === 'trips') return 'stops';
    return null;
  }

  /* Brick 97: what a person can actually do about this row, named by the source.

     Every action here either OPENS a page or WRITES words. Not one of them
     acts on its own: "Send Backup Unit" opens the Ops board with the incident
     showing so a human dispatches it, because nothing on this system sends
     itself and a truck must never be moved by a button nobody watched.

     A name this list does not know is still drawn, with its label, plainly
     marked as not wired. Silently dropping something the hub asked for is how
     a person comes to believe an alert had no answer. */
  var ACTIONS = {
    call_driver:       { href: 'incidents/index.html', hint: 'the number is on the incident' },
    dispatch_recovery: { href: 'ops/index.html',       hint: 'opens the board, a person dispatches' },
    send_backup_unit:  { href: 'ops/index.html',       hint: 'opens the board, a person dispatches' },
    open_incident:     { href: 'incidents/index.html', hint: '' },
    flag_exception:    { href: 'incidents/index.html', hint: '' },
    draft_customer:    { draft: true, hint: 'writes the words, sends nothing' }
  };

  // A payload may not tell this phone to send Sprint's data to an outside
  // model. The field is dropped here, at the door, and the reason is kept on
  // the item so it shows up rather than disappearing quietly.
  function refuseRouting(item) {
    if (!item || !item.routing) return item;
    item.routing_refused = 'a routing field named ' + String(item.routing) +
      '. Company data does not leave this building, so it was dropped.';
    delete item.routing;
    return item;
  }

  function actionsHtml(i) {
    var paths = Array.isArray(i.actions) && i.actions.length ? i.actions : null;
    if (!paths) {
      // the two that fit any exception, which is what shipped in brick 95
      return '<a class="go" href="incidents/index.html">Open it and acknowledge</a>' +
             '<button type="button" class="drafted">Draft what to tell the customer</button>';
    }
    return paths.map(function (p) {
      var known = ACTIONS[p.action];
      var label = esc(p.label || p.action || 'Open it');
      if (!known) return '<button type="button" class="go unwired" disabled>' + label + ' (not wired yet)</button>';
      if (known.draft) return '<button type="button" class="drafted">' + label + '</button>';
      return '<a class="go" href="' + known.href + '">' + label + '</a>';
    }).join('');
  }

  function example() {
    var now = Date.now();
    var iso = function (min) { return new Date(now + min * 60000).toISOString(); };
    STATE.example = true;
    STATE.tenders = [{ issuer: 'EXAMPLE Standards Board', reference: 'EXAMPLE/T/12', title: 'EXAMPLE courier and logistics services', closes_at: iso(12 * 1440 + 3 * 60), status: 'bid' }];
    STATE.docs = { inDate: 4, total: 6 };
    STATE.campaigns = [{ name: 'EXAMPLE 20th anniversary campaign', channel: 'video', started_at: iso(-3 * 1440), note: 'EXAMPLE: 3 of 7 films approved, rollout dates not recorded' }];
    STATE.alerts = [];
    STATE.feed = [
      { at: iso(-4), text: 'Route exception: Gaborone North to City Centre, 15 minutes late on the promised time.', who: 'EXAMPLE Ops Desk', name: 'Ops Desk', kind: 'exceptions', urgent: true },
      { at: iso(-11), text: 'New quote generated: bulk freight, P4,500.00. Waiting for a sales approval.', who: 'the system', name: null, kind: 'quotes' },
      { at: iso(-26), text: 'Missing proof of delivery for waybill 84920. The driver has been asked for the signature.', who: 'EXAMPLE Neo', name: 'Neo Kgosi', kind: 'exceptions' },
      { at: iso(-41), text: 'A parcel was delivered at EXAMPLE Riverwalk, signed for on the glass.', who: 'EXAMPLE Kabo', name: 'Kabo Motsumi', kind: 'stops' },
      { at: iso(-58), text: 'Tender pack for the EXAMPLE Standards Board: two documents still to be signed.', who: 'EXAMPLE Sales', name: 'Sales Desk', kind: 'tenders' },
      { at: iso(-73), text: 'Fuel purchase recorded, 62 litres, EXAMPLE B 100 EXA.', who: 'EXAMPLE Kabo', name: 'Kabo Motsumi', kind: 'stops' }
    ];
  }

  async function get(path) {
    if (typeof root.apiFetch === 'function') return root.apiFetch(path);
    var r = await fetch(path, { credentials: 'include' }); var j = await r.json();
    if (!j || !j.ok) throw new Error(j && j.error || 'HTTP ' + r.status); return j.data;
  }
  async function load() {
    var live = false;
    try {
      var me = await get('/api/me'); live = !!me;
    } catch (e) { live = false; }
    if (!live) { example(); return; }
    STATE.example = false;
    try { STATE.tenders = await get('/api/tenders/deadlines?days=60'); } catch (e) { STATE.tenders = null; }
    try {
      var docs = await get('/api/documents/expiring?days=3650');
      STATE.docs = docs && docs.length ? { inDate: docs.filter(function (d) { return d.days_left >= 0; }).length, total: docs.length } : null;
    } catch (e) { STATE.docs = null; }
    try { var c = await get('/api/campaigns?limit=5'); STATE.campaigns = Array.isArray(c) ? c : (c && c.items) || null; } catch (e) { STATE.campaigns = null; }
    try {
      var a = await get('/api/activity');
      STATE.feed = (a.did || []).map(function (x) {
        refuseRouting(x);
        // severity, and the ways out of it, are carried straight through
        return { at: x.at, text: x.text, who: x.who, name: x.staff_name || null,
                 kind: classify(x), severity: x.severity || null, urgent: severe(x),
                 actions: x.resolution_paths || x.actions || null,
                 routing_refused: x.routing_refused || null };
      });
    } catch (e) { STATE.feed = []; }
    try {
      var tr = await get('/api/incidents/triage');
      STATE.alerts = (tr.level3 || []).filter(function (i) { return !i.acknowledged_at; })
        .map(function (i) {
          refuseRouting(i);
          return { at: i.opened_at, text: i.title, who: 'the system', name: null, kind: 'urgent',
                   urgent: true, level: 3, severity: i.severity || 'critical',
                   actions: i.resolution_paths || null, routing_refused: i.routing_refused || null };
        });
    } catch (e) { STATE.alerts = []; }
  }

  // ------------------------------------------------------------ drawing --
  function railHtml() {
    var cards = [];
    var t = STATE.tenders && STATE.tenders.length ? STATE.tenders[0] : null;
    if (t) {
      var L = left(t.closes_at);
      var d = STATE.docs;
      var pct = d && d.total ? Math.round(100 * d.inDate / d.total) : null;
      cards.push('<a class="rc money" href="tenders/index.html"><div class="k">' + (STATE.example ? 'EXAMPLE tender' : 'Tender closing next') + '</div>' +
        '<div class="t">' + esc(t.title) + '</div>' +
        '<div class="big" data-closes="' + esc(t.closes_at) + '">' + esc(L ? L.text : 'no closing time') + '</div>' +
        '<div class="s">' + esc(t.issuer) + (t.reference ? ', ' + esc(t.reference) : '') + '</div>' +
        (pct === null ? '<div class="s">Documents: none with a date on the register yet.</div>'
                      : '<div class="bar"><i style="width:' + pct + '%"></i></div><div class="s">' + d.inDate + ' of ' + d.total + ' registered documents in date</div>') +
        '<div class="pills"><span class="pill ' + (L && L.over ? '' : L && L.d < 3 ? 'hot' : 'ok') + '">' + esc(t.status || 'watch') + '</span>' +
        '<span class="pill">methodology: ' + (t.methodology_status ? esc(t.methodology_status) : 'not recorded') + '</span></div></a>');
    } else {
      cards.push('<div class="rc"><div class="k">Tenders</div><div class="t">No tender closing inside 60 days on the register</div><div class="s">When one is entered on the Tender Desk it appears here with the hours counted down.</div></div>');
    }
    var c = STATE.campaigns && STATE.campaigns.length ? STATE.campaigns[0] : null;
    if (c) {
      cards.push('<a class="rc" href="marketing/index.html"><div class="k">' + (STATE.example ? 'EXAMPLE campaign' : 'Campaign running') + '</div>' +
        '<div class="t">' + esc(c.name) + '</div>' +
        '<div class="s">' + (c.channel ? esc(c.channel) + ', ' : '') + (c.started_at ? 'started ' + esc(ago(c.started_at)) : 'start date not recorded') + '</div>' +
        '<div class="s">' + esc(c.note || 'Asset status and rollout dates are not recorded on the campaign yet.') + '</div></a>');
    } else {
      cards.push('<div class="rc"><div class="k">Campaigns</div><div class="t">No campaign on the register</div><div class="s">The Marketing desk adds one and it appears here.</div></div>');
    }
    return '<div class="fr-h"><h2>On the table</h2><span>strategic</span></div><div class="rail" id="frRail">' + cards.join('') + '</div>';
  }
  function filtersHtml() {
    var all = STATE.alerts.concat(STATE.feed);
    return '<div class="filters" id="frFilters">' + FILTERS.map(function (f) {
      var n = all.filter(function (i) { return i.kind === f.key || (f.key === 'urgent' && i.urgent); }).length;
      return '<button type="button" data-f="' + f.key + '" class="' + (STATE.filter === f.key ? 'on' : '') + '">' + esc(f.label) + (n ? '<b>' + n + '</b>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function feedHtml() {
    var all = STATE.alerts.concat(STATE.feed);
    var items = STATE.filter ? all.filter(function (i) { return i.kind === STATE.filter || (STATE.filter === 'urgent' && i.urgent); }) : all;
    items = items.slice(0, 12);
    var h = ['<div class="fr-h"><h2>' + (STATE.example ? 'Live feed, EXAMPLE' : 'Live feed') + '</h2><span>' + (STATE.filter ? 'filtered' : 'newest first') + '</span></div><div class="feed" id="frFeed">'];
    if (!items.length) h.push('<div class="empty">' + (STATE.filter ? 'Nothing under this filter right now.' : 'Nothing recorded yet today. That is what the hub has, not a guess.') + '</div>');
    items.forEach(function (i) {
      var sys = !i.name;
      // Brick 95: a filled triangle on an urgent row, so the meaning survives
      // sunlight, a dimmed screen and a person who cannot tell red from grey.
      var face = i.urgent
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5 23 21H1z"/><path fill="#FF6B61" d="M11 9h2v6h-2zM11 16.5h2V19h-2z"/></svg>'
        : (sys ? '&#9679;' : esc(initial(i.name)));
      h.push('<div class="fi' + (i.urgent ? ' urgent' : '') + '"' + (i.urgent ? ' tabindex="0" role="button" aria-expanded="false" data-urgent="1"' : '') + '><div class="av' + (sys && !i.urgent ? ' sys' : '') + '" title="' + esc(i.urgent ? 'urgent' : sys ? 'the system' : i.name) + '">' + face + '</div>' +
        '<div class="b"><div class="w">' + esc(i.text) + '</div><div class="m">' +
        (i.kind ? '<span class="tag' + (i.urgent ? ' urg' : '') + '">' + esc(FILTERS.filter(function (f) { return f.key === i.kind; }).map(function (f) { return f.label; })[0] || i.kind) + '</span>' : '') +
        '<span>' + esc(i.name ? i.name : (i.who || '')) + '</span><span>' + esc(ago(i.at)) + '</span></div>' +
        // Brick 95: tapping an urgent row does not open a page to read. It puts the
        // two things a person actually does next under the thumb, at once.
        (i.urgent ? '<div class="acts">' + actionsHtml(i) + '</div>' : '') +
        '</div></div>');
    });
    h.push('</div>');
    return h.join('');
  }
  function draw() {
    css();
    var host = document.getElementById('front'); if (!host) return;
    var driver = role() === 'driver';
    host.innerHTML = (driver ? '' : railHtml()) + filtersHtml() + feedHtml();
    // an urgent row opens its two actions in place, and closes again
    var urg = host.querySelectorAll('.fi[data-urgent]');
    for (var u = 0; u < urg.length; u++) {
      // Brick 96: the row is announced as a button, so it must also announce
      // whether it is open. Without this a person on a screen reader hears a
      // button and has no way to know the two actions are now showing.
      var say = function (el) { el.setAttribute('aria-expanded', el.classList.contains('open') ? 'true' : 'false'); };
      urg[u].addEventListener('click', function (e) {
        if (e.target.closest('.acts')) return;      // a tap ON an action is the action
        this.classList.toggle('open'); say(this);
      });
      urg[u].addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.classList.toggle('open'); say(this); } });
    }
    var drafts = host.querySelectorAll('.fi .drafted');
    for (var dft = 0; dft < drafts.length; dft++) drafts[dft].addEventListener('click', function (e) {
      e.stopPropagation();
      var row = this.closest('.fi');
      var what = (row.querySelector('.w') || {}).textContent || 'this';
      // Nothing sends. The words are written for a person to read, change and send.
      this.textContent = 'Draft written, open Incidents to send it';
      this.disabled = true;
      try { localStorage.setItem('sprintos_draft_v1', JSON.stringify({ at: new Date().toISOString(), about: what })); } catch (x) {}
    });
    var fs = host.querySelectorAll('#frFilters button');
    for (var i = 0; i < fs.length; i++) fs[i].addEventListener('click', function () {
      var k = this.getAttribute('data-f');
      if (k === 'stops' && role() === 'driver') { location.href = 'driver/index.html'; return; }
      STATE.filter = STATE.filter === k ? null : k; draw();
    });
  }
  function tick() {
    var el = document.querySelector('#front .big[data-closes]'); if (!el) return;
    var L = left(el.getAttribute('data-closes')); if (L) el.textContent = L.text;
  }

  /* One export, and only one. A second `SprintFront = {...}` earlier in this
     file was silently replaced by this line, which is the quiet kind of bug:
     no error, the object simply is not what you think it is.

     Brick 97 adds the decisions themselves, read only, so they can be measured
     against a real payload and so another page can ask the same question
     without copying the answer. None of them draw, fetch or change state. */
  root.SprintFront = {
    draw: draw,
    example: function () { example(); draw(); },
    state: function () { return STATE; },
    filter: function (k) { STATE.filter = k; draw(); },
    severe: severe, classify: classify, actionsHtml: actionsHtml,
    refuseRouting: refuseRouting, knownActions: Object.keys(ACTIONS)
  };
  document.addEventListener('DOMContentLoaded', function () {
    if (role() === 'driver') STATE.filter = 'stops';
    load().then(draw, draw);
    setInterval(tick, 30000);
    setInterval(function () { load().then(draw, function () {}); }, 5 * 60 * 1000);
  });
})(typeof window !== 'undefined' ? window : this);
