/* Sprint OS: a real map of Botswana, drawn on this machine. Brick 105.

   Luther, 16 Sep 2026: "why doesn't the fleet show a real map of Botswana with
   dots for each car, notifications about idle drivers, fuel."

   THE HONEST ANSWER, in two halves, because they have different owners.

   HALF ONE, WHY THERE WAS NO MAP: every map you have ever seen on the web is
   made of image tiles fetched from Google, Mapbox or OpenStreetMap as you pan.
   Each of those fetches tells that company the office IP address and the exact
   patch of Botswana being looked at. A fleet map does that continuously, so the
   shape of Sprint's operation, which depots matter, which routes run, where the
   vehicles sit, would be readable by a third party from the request log alone.

   There is a test in this repository, hub/tests/apps-egress.test.js, that fails
   the build on ANY external URL under apps/. It is not an accident that no map
   appeared: the guard was doing its job.

   So this map is drawn, not fetched. The outline below is geometry in this file,
   the dots come from the office database, and nothing leaves the machine. It
   works with the network unplugged, which a tile map never does.

   HALF TWO, WHY THE DOTS WILL BE EMPTY TONIGHT, and this is the real finding:

       vehicles           3 rows
       vehicle_positions  0 rows
       trips              0 rows
       fuel_purchases     0 rows

   The table is there. The driver app posts a position every sixty seconds while
   a trip is open. No trip has ever been opened, so no position has ever been
   posted. The fleet page already carries "Where every vehicle is", kilometres
   per litre by vehicle and by driver, fuel spend month on month, cost per
   delivery by lane and service due. Every one of those screens is built and
   every one of them is empty for the same single reason.

   That is worth saying plainly to whoever reads this next: the fleet board does
   not need building. It needs one driver to open a trip on their phone and one
   driver to log one fuel fill. Everything else is already waiting for them.

   WHAT THE OUTLINE IS, and what it is not: a simplified national boundary, good
   enough to tell Maun from Gaborone at a glance, which is the entire job of a
   locator map. It is not a survey and no distance should ever be measured off
   it. Real distances come from the road engine on 127.0.0.1, which drives on
   the actual road network. */
(function (root) {
  'use strict';

  /* Botswana, simplified, as longitude and latitude pairs. Public geography,
     traced from nothing: these are the national extremes and the recognisable
     turns between them, clockwise from the north west. */
  var OUTLINE = [
    [20.00, -17.78], [21.45, -18.00], [23.30, -17.98], [24.55, -18.02],
    /* Botswana's northern tip at Kazungula, where four countries meet. The
       first version of this edge ran 4 km too far south and put Kasane,
       the northernmost town in the country, outside Botswana. The test
       caught it. */
    [24.95, -17.86], [25.13, -17.74], [25.26, -17.76], [25.85, -18.30], [26.17, -19.53],
    [27.30, -20.48], [27.72, -20.50], [28.60, -21.65], [29.37, -22.09],
    [29.03, -22.20], [28.35, -22.58], [27.70, -23.20], [27.10, -23.55],
    [26.80, -24.25], [26.05, -24.68],
    /* The south eastern border along the Ngotwane. It ran too far west here
       and left Lobatse, which is in Botswana, outside Botswana. Caught by the
       same test that caught Kasane: every town this map labels must fall
       inside the outline this map draws. */
    [25.88, -25.30], [25.30, -25.75],
    [24.20, -25.83], [23.00, -25.98], [22.00, -26.20], [21.10, -26.85],
    [20.62, -26.48], [20.00, -25.30], [19.99, -22.00], [20.00, -19.50]
  ];

  /* Reference points, so a dot on the screen means somewhere. */
  var TOWNS = [
    { n: 'Gaborone',   lng: 25.91, lat: -24.65, big: true },
    { n: 'Francistown', lng: 27.51, lat: -21.17, big: true },
    { n: 'Maun',       lng: 23.42, lat: -19.99, big: true },
    { n: 'Kasane',     lng: 25.15, lat: -17.80 },
    { n: 'Ghanzi',     lng: 21.70, lat: -21.70 },
    { n: 'Palapye',    lng: 27.13, lat: -22.55 },
    { n: 'Serowe',     lng: 26.71, lat: -22.39 },
    { n: 'Lobatse',    lng: 25.68, lat: -25.22 },
    { n: 'Jwaneng',    lng: 24.73, lat: -24.60 },
    { n: 'Orapa',      lng: 25.37, lat: -21.31 },
    { n: 'Selebi Phikwe', lng: 27.84, lat: -21.98 },
    { n: 'Tsabong',    lng: 22.40, lat: -26.02 }
  ];

  var W = 340, H = 400, PAD = 14;
  var LNG0 = 19.8, LNG1 = 29.6, LAT0 = -17.5, LAT1 = -27.2;

  function x(lng) { return PAD + (lng - LNG0) / (LNG1 - LNG0) * (W - PAD * 2); }
  function y(lat) { return PAD + (lat - LAT0) / (LAT1 - LAT0) * (H - PAD * 2); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Is this point actually in Botswana?

     This was a rectangle first, and the rectangle was wrong in a way this
     project has been caught by before: Botswana reaches further east than
     Johannesburg does, so any box drawn around the country swallows a large
     piece of South Africa. A vehicle reported in Johannesburg would have been
     drawn as though it were in Botswana, near the eastern border, and believed.

     The test above caught it on the first run, which is the whole argument for
     writing the test before trusting the code.

     So the question is asked of the OUTLINE, not of a box: a ray cast east from
     the point crosses the border an odd number of times if the point is inside.
     The outline is already in this file, so this costs nothing extra and cannot
     drift away from the shape being drawn. */
  function onMap(p) {
    if (!p || typeof p.lat !== 'number' || typeof p.lng !== 'number') return false;
    if (!isFinite(p.lat) || !isFinite(p.lng)) return false;
    var inside = false;
    for (var i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
      var xi = OUTLINE[i][0], yi = OUTLINE[i][1];
      var xj = OUTLINE[j][0], yj = OUTLINE[j][1];
      var straddles = (yi > p.lat) !== (yj > p.lat);
      if (straddles && p.lng < (xj - xi) * (p.lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  /* Every state the system actually produces, in the words Luther uses for them.

     These were drawn as coloured dots with the words only in a tooltip, which on
     a phone means never: a thumb has nothing to hover with. So the words were
     technically present and practically absent. They are on the screen now. */
  var STATE_COLOUR = {
    incident: '#e0483e',
    moving: '#3AAA35',
    en_route: '#3AAA35',
    standing: '#F7941D',
    idle: '#F7941D',
    no_signal: '#8b8b84',
    no_trip: '#6f6f69',
    unknown: '#6f6f69'
  };
  var STATE_WORD = {
    incident: 'incident',
    moving: 'en route',
    en_route: 'en route',
    standing: 'idle',
    idle: 'idle',
    no_signal: 'no signal',
    no_trip: 'parked',
    unknown: 'not reporting'
  };
  /* What each state MEANS, because a word on its own still has to be learned.
     Shown in the legend, so nobody has to be told what orange is. */
  var STATE_MEANS = {
    incident: 'something has gone wrong and somebody should look now',
    moving: 'on a trip and moving',
    en_route: 'on a trip and moving',
    standing: 'on a trip but not moving',
    idle: 'on a trip but not moving',
    no_signal: 'has not reported in, usually a flat phone or no coverage',
    no_trip: 'no trip open, so nothing is expected from it',
    unknown: 'the vehicle reported no state at all, which is a fault in the app'
  };
  /* Incident first, then what is working, then what is quiet. A legend in
     alphabetical order teaches nothing; a legend in order of urgency does. */
  var STATE_ORDER = ['incident', 'standing', 'idle', 'moving', 'en_route', 'no_signal', 'no_trip', 'unknown'];

  /* The legend, built from what is ACTUALLY on the screen. It never lists a
     state nobody has today, because teaching a reader about a condition they
     cannot see is how a legend becomes wallpaper. */
  function legend(vehicles) {
    var seen = {}, order = [];
    (vehicles || []).forEach(function (v) {
      var k = v.state || 'unknown';
      if (!STATE_WORD[k]) k = 'unknown';
      if (!seen[k]) { seen[k] = 0; order.push(k); }
      seen[k]++;
    });
    if (!order.length) return '';
    order.sort(function (a, b) { return STATE_ORDER.indexOf(a) - STATE_ORDER.indexOf(b); });
    /* en route and moving are the same state under two names; never show both. */
    var used = {}, rows = [];
    order.forEach(function (k) {
      var word = STATE_WORD[k];
      if (used[word]) { return; }
      used[word] = true;
      rows.push('<li><i style="background:' + STATE_COLOUR[k] + '"></i>' +
        '<b>' + seen[k] + ' ' + esc(word) + '</b>' +
        '<small>' + esc(STATE_MEANS[k]) + '</small></li>');
    });
    return '<ul class="sp-map-key">' + rows.join('') + '</ul>';
  }

  function outlinePath() {
    return OUTLINE.map(function (p, i) {
      return (i ? 'L' : 'M') + x(p[0]).toFixed(1) + ' ' + y(p[1]).toFixed(1);
    }).join(' ') + ' Z';
  }

  /* vehicles: [{reg, state, standing_minutes, position:{lat,lng,recorded_at}, driver}] */
  function draw(vehicles, opts) {
    opts = opts || {};
    vehicles = vehicles || [];
    var placed = vehicles.filter(function (v) { return onMap(v.position); });
    var missing = vehicles.length - placed.length;

    var s = [];
    s.push('<svg class="sp-map" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="Map of Botswana showing where each vehicle is">');

    /* Heat goes UNDERNEATH the country and the dots. It is background: the
       vehicles and the town names have to stay readable on top of it, which is
       the same lesson as the glow painting over the text an hour ago. */
    if (opts.heat && opts.heat.length) {
      s.push(heat(opts.heat, opts).svg);
    }

    // the country
    s.push('<path d="' + outlinePath() + '" fill="rgba(255,255,255,.05)" ' +
      'stroke="rgba(255,255,255,.34)" stroke-width="1.5" stroke-linejoin="round"/>');

    // towns, quiet, so the vehicles are the loud thing
    TOWNS.forEach(function (t) {
      var tx = x(t.lng), ty = y(t.lat);
      s.push('<circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="' +
        (t.big ? 2.4 : 1.6) + '" fill="rgba(255,255,255,' + (t.big ? '.55' : '.32') + ')"/>');
      if (t.big) {
        s.push('<text x="' + (tx + 5).toFixed(1) + '" y="' + (ty + 3.2).toFixed(1) +
          '" font-size="8.5" fill="rgba(255,255,255,.62)">' + esc(t.n) + '</text>');
      }
    });

    // the vehicles
    placed.forEach(function (v) {
      var vx = x(v.position.lng), vy = y(v.position.lat);
      var col = STATE_COLOUR[v.state] || '#8b8b84';
      var stale = v.state === 'no_signal' || v.state === 'no_trip';
      if (!stale) {
        s.push('<circle cx="' + vx.toFixed(1) + '" cy="' + vy.toFixed(1) +
          '" r="11" fill="' + col + '" opacity=".16"/>');
      }
      s.push('<circle cx="' + vx.toFixed(1) + '" cy="' + vy.toFixed(1) + '" r="5" fill="' + col +
        '" stroke="rgba(0,0,0,.45)" stroke-width="1"><title>' + esc(v.reg) + ', ' +
        esc(STATE_WORD[v.state] || v.state) + '</title></circle>');
      /* The registration AND the state, beside the dot. The state used to live in
         a tooltip, which a thumb can never open. */
      s.push('<text x="' + (vx + 8).toFixed(1) + '" y="' + (vy - 6).toFixed(1) +
        '" font-size="9" font-weight="700" fill="#fff">' + esc(v.reg) + '</text>');
      s.push('<text x="' + (vx + 8).toFixed(1) + '" y="' + (vy + 3).toFixed(1) +
        '" font-size="7.6" font-weight="700" fill="' + col + '">' +
        esc((STATE_WORD[v.state] || v.state || 'not reporting').toUpperCase()) +
        (v.standing_minutes ? ' ' + v.standing_minutes + 'm' : '') + '</text>');
    });

    s.push('</svg>');
    s.push(legend(vehicles));

    // Never a bare map with nothing on it and no explanation.
    if (!vehicles.length) {
      s.push('<p class="sp-map-note">No vehicle has ever reported a position. The table ' +
        'is ready and the driver app posts one every sixty seconds while a trip is open, ' +
        'so this fills itself the first time a driver opens a trip. Nothing needs building.</p>');
    } else if (!placed.length) {
      s.push('<p class="sp-map-note">' + vehicles.length + ' vehicle' +
        (vehicles.length === 1 ? '' : 's') + ' on the books, none carrying a position yet.</p>');
    } else if (missing) {
      s.push('<p class="sp-map-note">' + missing + ' of ' + vehicles.length +
        ' not shown: no position recorded, or a position outside Botswana, which is ' +
        'usually a phone rather than a vehicle.</p>');
    }
    return s.join('');
  }

  /* ------------------------------------------------------------------
     WHERE a vehicle is standing decides whether standing is a problem.

     Luther, asked what the idle threshold should be, 16 Sep 2026:
     "more than 30 minutes on the a1 or in transit".

     He answered with a number AND a place, and the place is the important
     half. Thirty minutes at the depot is lunch. Thirty minutes on the A1
     between Mahalapye and Palapye is a breakdown, a puncture or a driver
     asleep, and nobody in the office knows which. A flat threshold raises the
     first and buries the second underneath it.
     ------------------------------------------------------------------ */

  /* Botswana's spine, south to north: Ramatlabama, Lobatse, Gaborone,
     Mahalapye, Palapye, Francistown, Nata, Kazungula. */
  var A1 = [
    [25.60, -25.72], [25.68, -25.22], [25.91, -24.65], [26.15, -24.15],
    [26.81, -23.10], [27.13, -22.55], [27.42, -21.98], [27.51, -21.17],
    [26.18, -20.21], [25.63, -19.00], [25.26, -17.80]
  ];

  /* Somewhere with a reason to stop. The depot, and every town the map already
     labels, which is a blunt proxy and honest about it: idle in the middle of
     Palapye is probably delivering, idle 40 km outside it is probably not.

     The real list is customer addresses. Nothing in the database knows where a
     delivery is GOING yet, which is open question 8, and this rule is now the
     second thing waiting on that answer. */
  var KNOWN_STOPS = [{ n: 'the Gaborone depot', lng: 25.9231, lat: -24.6282 }];

  function km(aLat, aLng, bLat, bLng) {
    var R = 6371, t = Math.PI / 180;
    var dLat = (bLat - aLat) * t, dLng = (bLng - aLng) * t;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(aLat * t) * Math.cos(bLat * t) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /* Distance from a point to a line segment, on the ground rather than on the
     page, so "near the A1" means the same at Lobatse as at Kasane. */
  function kmToSegment(p, a, b) {
    var lat0 = p.lat * Math.PI / 180;
    var px = p.lng * Math.cos(lat0), py = p.lat;
    var ax = a[0] * Math.cos(lat0), ay = a[1];
    var bx = b[0] * Math.cos(lat0), by = b[1];
    var dx = bx - ax, dy = by - ay;
    var len = dx * dx + dy * dy;
    var t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0;
    t = Math.max(0, Math.min(1, t));
    var cx = ax + t * dx, cy = ay + t * dy;
    return km(p.lat, p.lng, cy, cx / Math.cos(lat0));
  }

  function onA1(p, within) {
    if (!p) return false;
    within = within || 5;
    for (var i = 1; i < A1.length; i++) {
      if (kmToSegment(p, A1[i - 1], A1[i]) <= within) return true;
    }
    return false;
  }

  /* The nearest place worth stopping at, and how far away it is. */
  function nearestStop(p) {
    if (!p) return null;
    var best = null;
    KNOWN_STOPS.concat(TOWNS).forEach(function (t) {
      var d = km(p.lat, p.lng, t.lat, t.lng);
      if (!best || d < best.km) best = { n: t.n, km: d };
    });
    return best;
  }

  /* In words, so the alert is a sentence somebody can act on rather than a
     status nobody can. */
  function whereIs(p, stopWithin) {
    var near = nearestStop(p);
    var atStop = near && near.km <= (stopWithin || 3);
    if (atStop) return { at_stop: true, say: 'at ' + near.n };
    if (onA1(p)) {
      return { at_stop: false, on_a1: true,
        say: 'on the A1' + (near ? ', ' + Math.round(near.km) + ' km from ' + near.n : '') };
    }
    return { at_stop: false, on_a1: false,
      say: near ? Math.round(near.km) + ' km from ' + near.n : 'away from any known stop' };
  }

  /* What is worth interrupting somebody about. Thresholds are stated, never
     hidden, so a number that feels wrong can be argued with. */
  function alerts(vehicles, opts) {
    opts = opts || {};
    /* Luther's rule: 30 minutes, but only where standing still is not the job.
       At a depot or in a town the vehicle is almost certainly working, so that
       gets a far longer fuse and a quieter voice. */
    var idleInTransit = opts.idle_transit_minutes || 30;
    var idleAtStop = opts.idle_at_stop_minutes || 120;
    var staleAfter = opts.stale_minutes || 15;
    var out = [];
    (vehicles || []).forEach(function (v) {
      if ((v.state === 'standing' || v.state === 'idle') && v.standing_minutes) {
        var w = v.position ? whereIs(v.position, opts.stop_within_km) : null;
        var inTransit = !w || !w.at_stop;
        var limit = inTransit ? idleInTransit : idleAtStop;
        if (v.standing_minutes >= limit) {
          out.push({
            level: inTransit ? 'red' : 'amber',
            reg: v.reg,
            on_a1: !!(w && w.on_a1),
            at_stop: !!(w && w.at_stop),
            say: v.reg + ' has been standing ' + v.standing_minutes + ' minutes' +
              (w ? ' ' + w.say : '') + (v.driver ? ', ' + v.driver : '') + '.',
            why: inTransit
              ? 'Thirty minutes stopped away from a depot or a customer is a breakdown, a ' +
                'puncture or a driver nobody has heard from, and from the office there is no ' +
                'way to tell which. Ring the driver.'
              : 'Two hours at a stop is longer than a delivery or a lunch, so it is worth one ' +
                'question. Standing at a depot is not itself a problem.'
          });
        }
      }
      if (v.state === 'no_signal') {
        out.push({
          level: 'amber', reg: v.reg,
          say: v.reg + ' has not reported in for over ' + staleAfter + ' minutes.',
          why: 'Usually a flat phone or no coverage. It matters because this vehicle is ' +
            'missing from every number on this board until it reports again.'
        });
      }
    });
    return out;
  }

  /* THE HEAT LAYER. Luther: "even if the cars show like the Snapchat heatmap
     that would be cool."

     It is more than cool. It answers a question a courier owner cannot ask any
     other way: where does this fleet actually SPEND ITS TIME. Not where it
     delivers, which the waybills already say, but where the hours go. Heat over
     a customer's yard means waiting. Heat on a stretch of road means traffic, or
     a route nobody has re-planned. Heat at a fuel station is fine; heat beside
     one is not.

     HOW IT IS BUILT, and why not the obvious way.

     A real heatmap is a blur over a density grid, and a blur across a large area
     is painted on the processor every frame, which is exactly what makes those
     maps crawl on a cheap Android. So this bins the positions into a coarse grid
     first, then draws ONE soft radial gradient per occupied cell, weighted by
     how many positions fell in it. Fifty blobs instead of fifty thousand points,
     and the browser composites them.

     Square root, not linear, on the weight. One depot where every vehicle starts
     its day carries ten times the traffic of anywhere else, and on a linear
     scale it would be the only thing visible on the map.

     The ramp runs green to amber to red, matching the rest of the system, where
     red already means somebody should look.

     The legend speaks in hours, because a count of positions means nothing to a
     reader. A position is posted every sixty seconds, so one position is one
     minute of vehicle time in that square. */
  function heat(positions, opts) {
    opts = opts || {};
    positions = (positions || []).filter(onMap);
    var cells = Math.max(8, Math.min(40, opts.cells || 22));
    var minutesPer = opts.minutes_per_position || 1;

    if (!positions.length) {
      return {
        svg: '', cells: 0, peak_minutes: 0,
        say: 'Nothing to draw yet: no vehicle has ever reported a position, so there ' +
          'is no history to make heat out of. It builds itself from the day a driver ' +
          'first opens a trip, and gets more useful every week after that.'
      };
    }

    var grid = {}, peak = 0;
    positions.forEach(function (p) {
      var cx = Math.floor((p.lng - LNG0) / (LNG1 - LNG0) * cells);
      var cy = Math.floor((p.lat - LAT0) / (LAT1 - LAT0) * cells);
      var k = cx + ':' + cy;
      grid[k] = (grid[k] || 0) + 1;
      if (grid[k] > peak) peak = grid[k];
    });

    var cw = (W - PAD * 2) / cells, ch = (H - PAD * 2) / cells;
    var rad = Math.max(cw, ch) * 1.15;
    var parts = ['<defs>'];
    var ramp = ['58,170,53', '247,148,29', '224,72,62'];
    ramp.forEach(function (rgb, i) {
      parts.push('<radialGradient id="sp-heat-' + i + '">' +
        '<stop offset="0%" stop-color="rgb(' + rgb + ')" stop-opacity=".85"/>' +
        '<stop offset="55%" stop-color="rgb(' + rgb + ')" stop-opacity=".28"/>' +
        '<stop offset="100%" stop-color="rgb(' + rgb + ')" stop-opacity="0"/></radialGradient>');
    });
    parts.push('</defs>');

    var drawn = 0;
    Object.keys(grid).forEach(function (k) {
      var bits = k.split(':');
      var weight = Math.sqrt(grid[k] / peak);
      var band = weight > 0.72 ? 2 : (weight > 0.34 ? 1 : 0);
      var px = PAD + (Number(bits[0]) + 0.5) * cw;
      var py = PAD + (Number(bits[1]) + 0.5) * ch;
      parts.push('<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="' +
        (rad * (0.55 + weight * 0.75)).toFixed(1) + '" fill="url(#sp-heat-' + band + ')" opacity="' +
        Math.min(0.9, 0.25 + weight * 0.65).toFixed(2) + '"/>');
      drawn++;
    });

    var peakMinutes = peak * minutesPer;
    var hours = peakMinutes / 60;
    return {
      svg: '<g class="sp-heat" aria-hidden="true">' + parts.join('') + '</g>',
      cells: drawn,
      peak_minutes: peakMinutes,
      say: 'Built from ' + positions.length + ' recorded positions across ' + drawn +
        ' patches of the country. The hottest patch holds ' +
        (hours >= 1 ? hours.toFixed(1) + ' hours' : Math.round(peakMinutes) + ' minutes') +
        ' of vehicle time. Heat is where the hours go, not where the deliveries are, so ' +
        'a hot spot that is not a depot or a customer is worth asking about.'
    };
  }

  var API = { draw: draw, heat: heat, legend: legend, whereIs: whereIs, onA1: onA1, nearestStop: nearestStop, STATE_WORD: STATE_WORD, alerts: alerts, onMap: onMap, TOWNS: TOWNS, bounds: { LNG0: LNG0, LNG1: LNG1, LAT0: LAT0, LAT1: LAT1 } };
  if (typeof module === 'object' && module.exports) module.exports = API;
  root.SprintMap = API;
})(typeof self !== 'undefined' ? self : this);
