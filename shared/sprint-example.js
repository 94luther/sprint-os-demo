/* Sprint OS: ONE set of example facts, for every screen. Brick 103.

   WHY THIS FILE EXISTS, and it is worth reading before changing anything in it.

   An outside reviewer looked at the demo on 15 September 2026 and found the same
   tender, the EXAMPLE Standards Board courier and logistics services, closing at
   three different times depending on which screen was open:

       Home            in 12 days and 3 hours
       Tender Desk     in 4 days
       The diary       in 23 days

   They called it the most damaging issue in the whole product, and they were
   right. Everything else on the list is a rough edge. This one attacks the only
   thing an operations system actually sells, which is that the number on the
   screen is the number. A reader who catches the system contradicting itself once
   stops believing the parts they cannot check, and those are the parts that
   matter.

   The cause was not a bug. Every screen was behaving perfectly. Each one simply
   carried its OWN invented example list, written at a different sitting, and
   nothing ever compared them. Five files held a Standards Board tender and no two
   of them agreed:

       apps/shared/sprint-front.js     12 days 3 hours
       apps/tenders/index.html         4 days
       apps/cockpit/index.html         4 days
       apps/shared/sprint-horizon.js   23 days
       apps/incidents/index.html       a DELIVERY to the same customer, which
                                       shares the name and so read as a fourth
                                       version of the same deadline

   The same sitting also found Home saying four of six documents were in date
   while the register listed seven of them.

   So: one file, one clock, one set of facts. Every screen reads from here and no
   screen invents its own. The tests in hub/tests/example-consistency.test.js fail
   the build if any screen carries its own tender date again, which is what stops
   this coming back in a month when nobody remembers the review.

   THE CLOCK
     One `NOW`, captured once when this file parses, and every date derived from
     it as an offset in minutes. Two screens open at the same moment therefore
     agree to the second. Offsets, never fixed dates, because a fixed date in a
     demo goes stale and starts showing negative days to whoever opens it next
     month. */
(function (root) {
  'use strict';

  /* One clock. Captured at parse time, never re-read, so a page that stays open
     does not drift against a page opened beside it. */
  var NOW = Date.now();
  var at = function (minutes) { return new Date(NOW + minutes * 60000).toISOString(); };
  var DAY = 1440;

  /* The canonical tenders. The offset is in MINUTES, so a closing time is a time
     of day and not just a date: a tender closes at ten in the morning, and late
     by one minute is not submitted. Every screen that shows a countdown counts
     down to the same instant as every other screen. */
  var TENDERS = [
    {
      id: 'T4',
      issuer: 'EXAMPLE Mining Group',
      reference: 'EXAMPLE/COUR/07',
      title: 'Site to site courier, Jwaneng and Orapa',
      closes_in_minutes: 2 * DAY + 5 * 60,
      status: 'bid',
      notes: 'Ready. Awaiting PPRA renewal to submit.'
    },
    {
      id: 'T1',
      issuer: 'EXAMPLE Standards Board',
      reference: 'EXAMPLE/T/12',
      title: 'Courier and logistics services',
      closes_in_minutes: 4 * DAY + 2 * 60,
      status: 'bid',
      notes: 'PPRA registration lapsed, renewal filed 2 Sep.'
    },
    {
      id: 'T2',
      issuer: 'EXAMPLE Power Utility',
      reference: 'EXAMPLE/RFQ/44',
      title: 'Weekly parts courier, Gaborone to Morupule',
      closes_in_minutes: 11 * DAY + 3 * 60,
      status: 'watch',
      notes: ''
    },
    {
      id: 'T3',
      issuer: 'EXAMPLE Health Ministry',
      reference: 'EXAMPLE/T/09',
      title: 'Cold chain distribution, vaccines',
      closes_in_minutes: 19 * DAY + 60,
      status: 'watch',
      notes: 'Needs cold chain training sign off before bid.'
    },
    {
      id: 'T5',
      issuer: 'EXAMPLE Retail Bank',
      reference: 'EXAMPLE/PROC/21',
      title: 'Branch to branch document courier',
      closes_in_minutes: 27 * DAY + 4 * 60,
      status: 'watch',
      notes: ''
    }
  ];

  /* The canonical document register. Home used to say "4 of 6 in date" from two
     numbers typed into a file, while the register itself listed seven documents.
     Nothing counted anything. Now the count is DERIVED from this list, so the two
     screens cannot disagree: if a document is added here, both move together. */
  var DOCUMENTS = [
    { id: 'D1', name: 'EXAMPLE trade licence', category: 'statutory', expires_in_minutes: 41 * DAY },
    { id: 'D2', name: 'EXAMPLE BOCRA operating licence', category: 'statutory', expires_in_minutes: 300 * DAY },
    { id: 'D3', name: 'EXAMPLE tax clearance certificate', category: 'statutory', expires_in_minutes: 96 * DAY },
    { id: 'D4', name: 'EXAMPLE CIPA certificate', category: 'statutory', expires_in_minutes: 480 * DAY },
    { id: 'D5', name: 'EXAMPLE fleet insurance certificate', category: 'insurance', expires_in_minutes: 14 * DAY },
    { id: 'D6', name: 'EXAMPLE company profile', category: 'supporting', expires_in_minutes: -12 * DAY },
    { id: 'D7', name: 'EXAMPLE domestic tariff sheet', category: 'supporting', expires_in_minutes: -3 * DAY }
  ];

  function tenders() {
    return TENDERS.map(function (t) {
      var o = {};
      for (var k in t) { if (Object.prototype.hasOwnProperty.call(t, k)) o[k] = t[k]; }
      o.closes_at = at(t.closes_in_minutes);
      return o;
    });
  }

  /* The one the whole demo talks about, so no screen has to guess which. Looked
     up by its reference, never by its position: the list is sorted by closing
     time, so positions move whenever a date changes. */
  function hero() {
    var all = tenders();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === 'T1') return all[i];
    }
    return all[0];
  }

  function documents() {
    return DOCUMENTS.map(function (d) {
      var o = {};
      for (var k in d) { if (Object.prototype.hasOwnProperty.call(d, k)) o[k] = d[k]; }
      o.expires_at = at(d.expires_in_minutes);
      o.in_date = d.expires_in_minutes > 0;
      return o;
    });
  }

  /* Counted, never typed. An unproven number on a screen is a claim, and this is
     the arithmetic that makes it a fact instead. */
  function documentCount() {
    var all = documents();
    var good = all.filter(function (d) { return d.in_date; }).length;
    return { inDate: good, total: all.length, expired: all.length - good };
  }

  /* Records the search box can actually find. Brick 103, second half.

     The reviewer's FIRST finding, and the first thing anybody tries: the feed on
     the front page names waybill 84920, the guide says to type three letters of
     a waybill, and typing 849 answered "Could not reach the office system just
     now". On the public demo there is no office system and there never will be,
     by design, so search did not fail occasionally. It failed always, on the one
     interaction the guide leads with.

     These are the records behind that. Waybill 84920 is deliberately the one the
     feed talks about, so following the guide finds the thing the guide mentions,
     which is the whole point of a self contained example. */
  var SHIPMENTS = [
    {
      kind: 'shipment', waybill: '84920',
      title: 'Waybill 84920', subtitle: 'EXAMPLE Riverwalk Optometrists',
      status: 'delivered, proof of delivery missing',
      destination: 'EXAMPLE Riverwalk, Gaborone',
      promised_in_minutes: -90, delivered_in_minutes: -26,
      trip_note: 'the run was closed before the signature was captured',
      vehicle: { title: 'B 100 EXA', state: 'standing' },
      driver: { name: 'EXAMPLE Neo Kgosi' },
      incidents: [{ title: 'No signature captured on delivery', status: 'open' }],
      why: 'Delivered with nothing signed for it. If this customer disputes the delivery there is no proof, which is how a claim becomes the courier’s problem rather than a question.'
    },
    {
      kind: 'shipment', waybill: 'EXAMPLE/WB/3107',
      title: 'Waybill EXAMPLE/WB/3107', subtitle: 'EXAMPLE Standards Board tender documents',
      status: 'out for delivery, running late',
      destination: 'EXAMPLE Standards Board, Gaborone',
      promised_in_minutes: 42,
      priority: 'tender',
      trip_note: 'on the A1 south of Mahalapye, standing',
      vehicle: { title: 'B 100 EXA', state: 'standing' },
      driver: { name: 'EXAMPLE driver Kabo' },
      incidents: [{ title: 'RED ALERT: 42 minutes left and the vehicle is standing', status: 'open' }],
      why: 'A tender closes at a time of day. Late by one minute is not submitted, so this one parcel is the whole bid.'
    }
  ];

  var VEHICLES = [
    {
      kind: 'vehicle', reg: 'B 100 EXA',
      title: 'B 100 EXA', subtitle: 'EXAMPLE panel van',
      state: 'standing', standing_minutes: 23,
      documents_note: 'no expiry dates recorded against this vehicle',
      incidents: [{ title: 'Standing 23 minutes with a tender parcel aboard' }],
      why: 'Standing still with something time critical on board is the one combination worth interrupting somebody for.'
    },
    {
      kind: 'vehicle', reg: 'B 200 EXA',
      title: 'B 200 EXA', subtitle: 'EXAMPLE light truck',
      state: 'moving',
      documents_note: 'insurance expiry recorded, 14 days away',
      incidents: [],
      why: 'Nearest vehicle to the standing one, 11.4 km away.'
    }
  ];

  var CUSTOMERS = [
    {
      kind: 'customer', name: 'EXAMPLE Riverwalk Optometrists',
      title: 'EXAMPLE Riverwalk Optometrists', subtitle: 'Account customer, Gaborone',
      why: 'Sent fewer parcels each month for three months running. A customer does not resign, they just send less.'
    }
  ];

  /* Filled in against the one clock, same as the tenders. */
  function records() {
    var out = [];
    SHIPMENTS.forEach(function (s) {
      var o = {};
      for (var k in s) { if (Object.prototype.hasOwnProperty.call(s, k)) o[k] = s[k]; }
      if (s.promised_in_minutes !== undefined) o.promised_at = at(s.promised_in_minutes);
      if (s.delivered_in_minutes !== undefined) o.delivered_at = at(s.delivered_in_minutes);
      out.push(o);
    });
    return out.concat(VEHICLES, CUSTOMERS);
  }

  /* What the search box falls back to when there is no office system to ask.
     Matches the way a person actually types: any part of a waybill, a
     registration or a name, in any case, spaces ignored. */
  function find(query) {
    var q = String(query || '').toLowerCase().replace(/\s+/g, '');
    if (q.length < 2) return { count: 0, results: [], note: 'Type at least two characters.' };
    var hits = records().filter(function (r) {
      var hay = [r.waybill, r.reg, r.name, r.title, r.subtitle, r.destination]
        .filter(Boolean).join(' ').toLowerCase().replace(/\s+/g, '');
      return hay.indexOf(q) !== -1;
    });
    return {
      count: hits.length,
      results: hits,
      note: hits.length ? '' :
        'Nothing here matches "' + query + '". This demo carries a handful of invented records: ' +
        'try 84920, B 100 EXA, or Riverwalk.'
    };
  }

  var API = {
    NOW: NOW,
    at: at,
    DAY: DAY,
    tenders: tenders,
    hero: hero,
    documents: documents,
    documentCount: documentCount,
    records: records,
    find: find
  };

  if (typeof module === 'object' && module.exports) module.exports = API;
  root.SprintExample = API;
})(typeof self !== 'undefined' ? self : this);
