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

  /* BOTSWANA, THE REAL SHAPE. 16 September 2026.

     Luther: "That map of Botswana is disgusting."

     He was looking at a thirty point polygon. Thirty points cannot draw a
     country: the Chobe finger in the north flattens into a stub, the long
     straight of the Namibian border gets a kink it does not have, and the
     Ngotwane in the south east, which is a river and therefore wriggles the
     whole way, came out as two ruled lines. It read as a shape somebody
     remembered rather than a country somebody knows, and every vehicle standing
     on it inherited that doubt.

     These 279 points are the actual national boundary, taken from Natural Earth
     at ten million scale, which is public domain, and reduced from 956 points
     with Douglas Peucker at a tolerance of 0.010 degrees, which is about one
     kilometre. One kilometre of error is invisible on a phone and a country is
     600 kilometres across, so the shape is exact to the eye at a twentieth of
     the data.

     IT IS STILL DRAWN AND NEVER FETCHED, which is the whole point of doing it
     this way. The coordinates are baked into this file. Nothing asks a tile
     server for a picture of where Sprint's vehicles are, because the pattern of
     requests alone would tell a stranger where this company operates. The build
     has a test that fails if any file under apps reaches an external address,
     and this change keeps that true.

     The towns are checked against this outline by hand and by test: every town
     this map labels must fall inside the country this map draws. That test has
     already caught two faults in the old shape, Kasane in the north and Lobatse
     in the south east, both of which were outside their own country. All twelve
     are inside this one. */
  var OUTLINE = [
    [25.260,-17.794],[25.219,-17.880],[25.255,-18.001],[25.296,-18.069],[25.388,-18.139],[25.508,-18.399],
    [25.622,-18.501],[25.670,-18.566],[25.762,-18.630],[25.779,-18.739],[25.815,-18.814],[25.941,-18.921],
    [25.968,-19.001],[25.949,-19.103],[26.034,-19.244],[26.155,-19.537],[26.194,-19.560],[26.303,-19.577],
    [26.333,-19.613],[26.312,-19.651],[26.385,-19.679],[26.432,-19.737],[26.549,-19.784],[26.596,-19.856],
    [26.674,-19.883],[26.714,-19.927],[26.812,-19.946],[26.925,-20.001],[27.027,-20.010],[27.097,-20.069],
    [27.202,-20.093],[27.266,-20.234],[27.284,-20.351],[27.268,-20.496],[27.341,-20.473],[27.591,-20.473],
    [27.698,-20.509],[27.703,-20.566],[27.682,-20.637],[27.710,-20.757],[27.676,-20.867],[27.667,-21.071],
    [27.709,-21.134],[27.794,-21.197],[27.885,-21.310],[27.950,-21.438],[27.940,-21.478],[27.953,-21.510],
    [27.971,-21.514],[27.990,-21.552],[28.033,-21.578],[28.322,-21.603],[28.465,-21.660],[28.554,-21.637],
    [28.616,-21.647],[28.861,-21.757],[29.039,-21.798],[29.058,-21.829],[29.018,-21.898],[29.014,-21.940],
    [29.041,-22.021],[29.108,-22.069],[29.239,-22.073],[29.274,-22.125],[29.350,-22.187],[29.222,-22.182],
    [29.169,-22.214],[29.039,-22.224],[28.960,-22.310],[28.968,-22.380],[28.930,-22.441],[28.913,-22.454],
    [28.847,-22.450],[28.817,-22.493],[28.522,-22.585],[28.459,-22.570],[28.377,-22.575],[28.302,-22.604],
    [28.251,-22.656],[28.196,-22.672],[28.160,-22.718],[28.155,-22.772],[28.117,-22.789],[28.104,-22.817],
    [28.047,-22.837],[28.054,-22.869],[28.037,-22.911],[27.937,-22.964],[27.946,-23.029],[27.930,-23.057],
    [27.816,-23.105],[27.822,-23.123],[27.774,-23.125],[27.789,-23.164],[27.754,-23.221],[27.726,-23.222],
    [27.698,-23.193],[27.647,-23.228],[27.608,-23.217],[27.563,-23.299],[27.569,-23.320],[27.549,-23.361],
    [27.453,-23.385],[27.425,-23.413],[27.411,-23.389],[27.361,-23.422],[27.350,-23.391],[27.296,-23.452],
    [27.203,-23.492],[27.191,-23.504],[27.206,-23.523],[27.171,-23.516],[27.157,-23.537],[27.127,-23.525],
    [27.137,-23.570],[27.113,-23.564],[27.075,-23.611],[27.062,-23.604],[27.070,-23.656],[27.038,-23.666],
    [27.014,-23.639],[26.967,-23.719],[26.839,-24.266],[26.693,-24.327],[26.623,-24.399],[26.531,-24.459],
    [26.469,-24.571],[26.404,-24.633],[26.279,-24.628],[26.014,-24.705],[25.966,-24.734],[25.868,-24.748],
    [25.877,-24.886],[25.835,-25.016],[25.695,-25.310],[25.664,-25.440],[25.587,-25.620],[25.458,-25.711],
    [25.386,-25.744],[25.178,-25.763],[25.013,-25.743],[24.908,-25.804],[24.829,-25.826],[24.665,-25.823],
    [24.457,-25.743],[24.389,-25.759],[24.339,-25.752],[24.183,-25.626],[24.006,-25.655],[24.009,-25.633],
    [23.988,-25.620],[23.925,-25.629],[23.807,-25.524],[23.769,-25.507],[23.743,-25.470],[23.687,-25.454],
    [23.497,-25.324],[23.459,-25.282],[23.381,-25.293],[23.266,-25.264],[23.216,-25.267],[23.072,-25.326],
    [23.055,-25.303],[23.031,-25.299],[22.920,-25.390],[22.888,-25.450],[22.845,-25.481],[22.814,-25.567],
    [22.833,-25.606],[22.811,-25.625],[22.810,-25.677],[22.740,-25.777],[22.765,-25.827],[22.709,-25.891],
    [22.727,-25.944],[22.710,-25.997],[22.662,-26.021],[22.665,-26.051],[22.545,-26.207],[22.451,-26.210],
    [22.343,-26.317],[22.248,-26.347],[22.197,-26.404],[22.146,-26.519],[22.058,-26.618],[21.999,-26.650],
    [21.781,-26.678],[21.769,-26.689],[21.778,-26.768],[21.762,-26.804],[21.665,-26.863],[21.499,-26.846],
    [21.427,-26.823],[21.122,-26.865],[20.990,-26.839],[20.908,-26.800],[20.852,-26.807],[20.691,-26.892],
    [20.615,-26.753],[20.609,-26.686],[20.632,-26.595],[20.605,-26.548],[20.605,-26.493],[20.623,-26.428],
    [20.753,-26.276],[20.841,-26.131],[20.804,-26.071],[20.794,-25.894],[20.756,-25.819],[20.727,-25.827],
    [20.738,-25.799],[20.717,-25.733],[20.663,-25.685],[20.671,-25.642],[20.638,-25.620],[20.671,-25.591],
    [20.663,-25.565],[20.619,-25.528],[20.620,-25.501],[20.657,-25.468],[20.607,-25.462],[20.612,-25.431],
    [20.597,-25.433],[20.588,-25.404],[20.542,-25.382],[20.511,-25.312],[20.516,-25.284],[20.485,-25.263],
    [20.482,-25.230],[20.434,-25.200],[20.445,-25.168],[20.365,-25.033],[20.236,-24.936],[20.108,-24.880],
    [20.029,-24.815],[19.981,-24.752],[19.978,-22.001],[20.972,-22.001],[20.985,-21.964],[20.975,-18.319],
    [21.476,-18.300],[22.981,-18.020],[23.293,-17.999],[23.334,-18.043],[23.334,-18.074],[23.396,-18.163],
    [23.396,-18.191],[23.429,-18.189],[23.464,-18.226],[23.502,-18.237],[23.527,-18.278],[23.519,-18.294],
    [23.561,-18.348],[23.547,-18.369],[23.579,-18.468],[23.610,-18.478],[23.716,-18.419],[23.913,-18.236],
    [23.916,-18.201],[23.951,-18.178],[23.971,-18.184],[24.057,-18.119],[24.102,-18.109],[24.218,-18.013],
    [24.296,-18.026],[24.351,-17.956],[24.422,-17.956],[24.506,-18.060],[24.564,-18.053],[24.731,-17.892],
    [24.821,-17.839],[24.931,-17.811],[24.953,-17.788],[24.983,-17.820],[25.020,-17.824],[25.047,-17.807],
    [25.057,-17.828],[25.121,-17.814],[25.154,-17.782]
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
  var LNG0 = 19.90, LNG1 = 29.44, LAT0 = -17.70, LAT1 = -26.99;

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
  /* LABEL PLACEMENT, because a map full of names on top of each other is worse
     than a map with no names at all.

     Measured in a browser on the first version: thirteen pairs of labels were
     sitting on each other. Serowe and Palapye are twenty kilometres apart, which
     is five pixels on a phone, so their names printed as one smear. Worse, a
     vehicle standing at Gaborone had its registration printed straight through
     the word Gaborone, and the registration is the thing she is looking for.

     So labels are placed in the order of how much they matter, and anything that
     would land on something already placed is simply not drawn:

       1. every vehicle, always, because that is the point of the map
       2. the four big towns, because they are how a person orients
       3. the smaller towns, only if there is room

     A dropped name is not a loss. The DOT is still there, and two names printed
     through each other tell nobody anything.

     Widths are estimated at 0.55 of the font size per character, which is close
     enough for a sans serif at these sizes and costs nothing. Measuring text
     properly needs a browser, and this file has to work inside a test as well. */
  function placer() {
    var taken = [];
    function box(cx, cy, text, size, toLeft) {
      var w = String(text).length * size * 0.55;
      return { x: toLeft ? cx - w : cx, y: cy - size, w: w, h: size + 2 };
    }
    return {
      fits: function (cx, cy, text, size, toLeft) {
        var b = box(cx, cy, text, size, toLeft);
        for (var i = 0; i < taken.length; i++) {
          var t = taken[i];
          if (b.x < t.x + t.w && t.x < b.x + b.w && b.y < t.y + t.h && t.y < b.y + b.h) return false;
        }
        return true;
      },
      take: function (cx, cy, text, size, toLeft) { taken.push(box(cx, cy, text, size, toLeft)); }
    };
  }

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

    /* THE COUNTRY, DRAWN AS A SURFACE RATHER THAN AN OUTLINE.

       The old version was a five per cent white fill and a hairline, which is how
       you draw a shape when you are not sure it is right. It read as a diagram of
       a country. Now that the boundary is the real one it can be lit like a piece
       of land: a gradient that is warmer in the populated south east and colder in
       the Kalahari, a soft edge light where it meets the card, and a shadow
       underneath so it SITS on the card instead of being printed on it.

       One filter, applied once, to one path. A filter is painted on the processor,
       so it is affordable exactly once and never on anything that moves. The
       vehicle pulse below uses transform only, for the same reason. */
    s.push('<defs>' +
      '<linearGradient id="spLand" x1="0" y1="0" x2="0.4" y2="1">' +
        '<stop offset="0" stop-color="#1B4B36" stop-opacity=".92"/>' +
        '<stop offset="0.55" stop-color="#153D2C" stop-opacity=".92"/>' +
        '<stop offset="1" stop-color="#1E5540" stop-opacity=".95"/>' +
      '</linearGradient>' +
      '<filter id="spLift" x="-12%" y="-12%" width="124%" height="124%">' +
        '<feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity=".45"/>' +
      '</filter>' +
      '</defs>');

    var path = outlinePath();
    s.push('<path d="' + path + '" fill="url(#spLand)" filter="url(#spLift)"/>');
    /* the edge light: a second stroke of the same path, brighter than the fill,
       so the coastline of a landlocked country still catches something */
    s.push('<path d="' + path + '" fill="none" stroke="rgba(180,230,200,.55)" ' +
      'stroke-width="1.6" stroke-linejoin="round"/>');

    /* THE A1. It is one road and it carries most of this business: Lobatse up
       through Gaborone, Palapye and Francistown to Kasane. A map of Botswana with
       no road on it makes every vehicle look like it is standing in a desert, and
       the one thing the managing director wants to know at a glance is whether a
       vehicle is ON the route or off it. */
    if (typeof A1 !== 'undefined' && A1.length) {
      var road = A1.map(function (c, i) {
        return (i ? 'L' : 'M') + x(c[0]).toFixed(1) + ' ' + y(c[1]).toFixed(1);
      }).join(' ');
      s.push('<path d="' + road + '" fill="none" stroke="rgba(247,148,29,.30)" ' +
        'stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>');
      s.push('<path d="' + road + '" fill="none" stroke="rgba(247,148,29,.75)" ' +
        'stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>');
    }

    /* Towns, all twelve named now rather than three. A dot with no name is not a
       reference point, it is a smudge, and the whole reason the towns are here is
       so a vehicle near one MEANS something. They stay quiet: the labels carry a
       dark halo drawn under the letters with paint-order, which is how you keep
       small text readable over a busy surface without putting a box behind it. */
    var place = placer();

    /* WHO GETS THEIR NAME PRINTED, AND IN WHAT ORDER.

       The four big towns go first. They are the skeleton: without Gaborone,
       Francistown, Maun and Kasane on the page a person cannot tell which part of
       the country they are looking at, and the vehicles become dots in a void.
       Only four names, so they cost almost nothing.

       Then the vehicles, which are the POINT of the map, and they get two tries:
       the side away from the edge first, and the other side if that is taken. A
       label that flips is better than a label that vanishes.

       Then the small towns, with whatever room is left. */
    var sideOf = function (px) { return px > W * 0.64; };
    TOWNS.filter(function (t) { return t.big; }).forEach(function (t) {
      var tx = x(t.lng), ty = y(t.lat), r = sideOf(tx);
      place.take(r ? tx - 5 : tx + 5, ty + 3.2, t.n, 8.8, r);
    });

    var vlabel = {};
    placed.forEach(function (v) {
      var pvx = x(v.position.lng), pvy = y(v.position.lat);
      var state = (STATE_WORD[v.state] || v.state || 'not reporting') +
        (v.standing_minutes ? ' ' + v.standing_minutes + 'm' : '');
      var first = sideOf(pvx);
      var side = first;
      var lx = side ? pvx - 8 : pvx + 8;
      if (!place.fits(lx, pvy - 7, v.reg, 9, side) ||
          !place.fits(lx, pvy + 3.5, state, 7.6, side)) {
        side = !first;
        lx = side ? pvx - 8 : pvx + 8;
      }
      place.take(lx, pvy - 7, v.reg, 9, side);
      place.take(lx, pvy + 3.5, state, 7.6, side);
      vlabel[v.reg] = { x: lx, side: side, state: state };
    });

    TOWNS.forEach(function (t) {
      var tx = x(t.lng), ty = y(t.lat);
      s.push('<circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) +
        '" r="' + (t.big ? 2.8 : 1.9) +
        '" fill="rgba(255,255,255,' + (t.big ? '.78' : '.42') + ')"/>');
      /* The label sits on whichever side has room. Francistown and Selebi Phikwe
         are both hard against the eastern border, and a label always drawn to the
         right ran off the card and landed on top of the other one. Past two thirds
         across, the name goes to the LEFT of its dot and the text is anchored at
         its end, so it grows back towards the middle of the country instead of off
         the edge of the screen. */
      var right = sideOf(tx);
      var size = t.big ? 8.8 : 7.4;
      var lx = right ? tx - 5 : tx + 5;
      /* the big four booked their space above; everybody else asks */
      if (!t.big) {
        if (!place.fits(lx, ty + 3.2, t.n, size, right)) return;
        place.take(lx, ty + 3.2, t.n, size, right);
      }
      s.push('<text x="' + lx.toFixed(1) + '" y="' + (ty + 3.2).toFixed(1) +
        '"' + (right ? ' text-anchor="end"' : '') +
        ' font-size="' + size + '" font-weight="' + (t.big ? '700' : '500') +
        '" fill="rgba(233,245,238,' + (t.big ? '.88' : '.58') + ')" ' +
        'stroke="rgba(6,24,16,.85)" stroke-width="2.4" paint-order="stroke" ' +
        'stroke-linejoin="round">' + esc(t.n) + '</text>');
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
      /* Same edge rule as the towns, and a dark halo under both lines. A white
         registration on a pale patch of heat was unreadable, and heat is exactly
         where the vehicles are. */
      var chosen = vlabel[v.reg] || { x: vx + 8, side: false };
      var vr = chosen.side;
      var vlx = chosen.x.toFixed(1);
      var anchor = vr ? ' text-anchor="end"' : '';
      s.push('<text x="' + vlx + '" y="' + (vy - 7).toFixed(1) + '"' + anchor +
        ' font-size="9" font-weight="700" fill="#fff" ' +
        'stroke="rgba(6,24,16,.88)" stroke-width="2.6" paint-order="stroke" ' +
        'stroke-linejoin="round">' + esc(v.reg) + '</text>');
      s.push('<text x="' + vlx + '" y="' + (vy + 3.5).toFixed(1) + '"' + anchor +
        ' font-size="7.6" font-weight="700" fill="' + col + '" ' +
        'stroke="rgba(6,24,16,.88)" stroke-width="2.4" paint-order="stroke" ' +
        'stroke-linejoin="round">' +
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
