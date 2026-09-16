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

  /* THE MONEY, ONE SET OF FIGURES, and this file was built for exactly this and
     then not used for it.

     On 15 September a reviewer found the same tender closing at three different
     times on three screens and called it the most damaging thing in the product.
     This file was the answer. On 16 September the same fault turned up in the one
     place that matters more than a tender, and nobody had looked:

         apps/insights/index.html           paid in 30 days    P136
         apps/accounts/index.html           paid in 30 days    P12,845
         apps/cockpit/index.html            paid in 30 days    P186,400
         apps/demo/roles.html               paid in 30 days    P2,140

     Four screens, four invented numbers, for one fact. A factor of one thousand
     three hundred between the smallest and the largest. Two reviewers separately
     named it the reason not to put this console in front of the managing director,
     and they were right: she will open two screens in her first five minutes,
     because that is what an owner does, and the moment they disagree about money
     she is finished with all of it.

     None of those files was broken. Each was written at a different sitting and
     nothing ever compared them, which is the same cause as the tender and is the
     only kind of bug that a test cannot find by looking at one file at a time.

     So the money lives here now, once. hub/tests/example-consistency.test.js fails
     the build if any screen carries its own figure again.

     THE SHAPE OF THE INVENTED BUSINESS: a courier doing roughly two hundred
     thousand pula a month, with about a quarter of that outstanding at any moment
     and a fifth of the outstanding past due. Those ratios are what make the
     numbers look like a real company rather than like numbers. */
  var cash = {
    paid_30d_thebe: 18640000,        // P186,400 collected in the last thirty days
    invoiced_30d_thebe: 21180000,    // P211,800 billed in the same window
    owed_thebe: 5240000,             // P52,400 outstanding right now
    overdue_thebe: 1310000,          // P13,100 of that is past its due date
    overdue_by_customer: [
      { customer_id: 'cus_kalahari', customer_name: 'EXAMPLE Kalahari Meats', amount_thebe: 612000, days: 41 },
      { customer_id: 'cus_blue_aloe', customer_name: 'EXAMPLE Blue Aloe Chemists', amount_thebe: 388000, days: 22 },
      { customer_id: 'cus_chobe', customer_name: 'EXAMPLE Chobe Traders', amount_thebe: 310000, days: 12 }
    ],
    paid_top: 'EXAMPLE Kalahari Meats'
  };

  /* Revenue by customer, which is the bar the MD has never been shown. The top
     three add to 58 per cent of the month, and that concentration IS the finding:
     it is the largest single risk in a business this size and no screen has ever
     said it out loud. */
  var revenue_by_customer = [
    { customer_id: 'cus_kalahari', customer_name: 'EXAMPLE Kalahari Meats', thebe: 5420000 },
    { customer_id: 'cus_standards', customer_name: 'EXAMPLE Standards Board', thebe: 3910000 },
    { customer_id: 'cus_blue_aloe', customer_name: 'EXAMPLE Blue Aloe Chemists', thebe: 2960000 },
    { customer_id: 'cus_chobe', customer_name: 'EXAMPLE Chobe Traders', thebe: 2240000 },
    { customer_id: 'cus_gaba', customer_name: 'EXAMPLE Gaborone Dental', thebe: 1680000 },
    { customer_id: 'cus_bots', customer_name: 'EXAMPLE Botswana Seed', thebe: 1290000 },
    { customer_id: 'cus_other', customer_name: 'EXAMPLE nineteen smaller accounts', thebe: 3680000 }
  ];

  function concentration() {
    var total = revenue_by_customer.reduce(function (n, r) { return n + r.thebe; }, 0);
    var top3 = revenue_by_customer.slice(0, 3).reduce(function (n, r) { return n + r.thebe; }, 0);
    return {
      total_thebe: total,
      top3_thebe: top3,
      top3_share: total ? Math.round(top3 / total * 100) : null,
      rows: revenue_by_customer.map(function (r) {
        return { name: r.customer_name, thebe: r.thebe,
                 share: total ? Math.round(r.thebe / total * 100) : null };
      })
    };
  }

  /* THE PEOPLE, THE ROSTER AND WHAT CUSTOMERS COST, as example figures.

     The engines went live tonight as hub routes and there was nothing to LOOK at,
     which makes them an address rather than a product. The demonstration copy has
     no hub at all, so the same shapes the hub returns are written here as invented
     people doing invented work.

     Every name is invented and checked against the lead book by the publish gate,
     which has already caught me once tonight reaching for a real company because it
     sounded plausible.

     THE FIGURES ARE DELIBERATELY UNCOMFORTABLE. A demonstration where everybody is
     fine shows nothing. Here one driver has worked nineteen days without a break,
     one licence runs out in three weeks, one person carries a third of the work, one
     road has a single driver who has ever driven it, and one customer fails a
     quarter of their deliveries. Those are the findings this layer exists to
     produce, so the example holds one of each and the screen can be judged on
     whether it makes them obvious. */
  var people = {
    known: true,
    window_days: 30,
    total_deliveries: 214,
    people: [
      { name: 'EXAMPLE Thato M', deliveries: 76, deliveries_before: 71,
        on_time: { known: true, value: 94, of: 74 },
        movement: { points: -1, say: 'the same as their own month before', worse: false },
        pod: { known: true, value: 99, of: 76 }, failed: 2,
        stretch: { known: true, days: 19 },
        licence: { known: true, days_left: 412, warn: false, say: 'in date' } },
      { name: 'EXAMPLE Boitumelo K', deliveries: 58, deliveries_before: 61,
        on_time: { known: true, value: 88, of: 55 },
        movement: { points: -3, say: 'down 3 points against their own month before', worse: false },
        pod: { known: true, value: 96, of: 58 }, failed: 5,
        stretch: { known: true, days: 4 },
        licence: { known: true, days_left: 21, warn: true, say: 'expires in 21 days' } },
      { name: 'EXAMPLE Kagiso T', deliveries: 49, deliveries_before: 62,
        on_time: { known: true, value: 79, of: 47 },
        movement: { points: -13, say: 'down 13 points against their own month before', worse: true },
        pod: { known: true, value: 91, of: 49 }, failed: 7,
        stretch: { known: true, days: 6 },
        licence: { known: true, days_left: 180, warn: false, say: 'in date' } },
      { name: 'EXAMPLE Neo S', deliveries: 31, deliveries_before: 28,
        on_time: { known: true, value: 97, of: 30 },
        movement: { points: 4, say: 'up 4 points against their own month before', worse: false },
        pod: { known: true, value: 100, of: 31 }, failed: 1,
        stretch: { known: true, days: 2 },
        licence: { known: false, why: 'no licence expiry is recorded for this person' } }
    ],
    exposures: [
      { kind: 'no break', who: 'EXAMPLE Thato M', level: 'high',
        say: 'EXAMPLE Thato M has worked 19 days in a row.',
        why: 'This is a company risk before it is anything else. Tiredness is the cheapest cause of an accident to prevent and the most expensive to explain afterwards, and nobody in this building is currently counting.',
        do_this: 'Give them a day. If the run cannot lose them for a day, that is the finding: one person is a single point of failure.',
        actions: [{"who":"EXAMPLE Thato M","id":"book_rest","label":"Book them a day off","primary":true,"sends":false,"does":"Writes a day of leave into the roster and shows you who can cover the road they usually take.","needs":["date"]},{"who":"EXAMPLE Thato M","id":"see_cover","label":"Who could cover","sends":false,"does":"Lists everybody who has actually driven their road in the last sixty days, so the cover is somebody who knows it rather than somebody who is free."}] },
      { kind: 'single point', who: 'EXAMPLE Thato M', level: 'high',
        say: 'EXAMPLE Thato M carried 36 per cent of every delivery this month.',
        why: 'If that person is ill for a week, that much of the work has nowhere to go. It is the same risk as one customer carrying the revenue, in the other column.',
        do_this: 'Find out whether it is the round, the vehicle or the person, then spread whichever one of those you can.',
        actions: [{"who":"EXAMPLE Thato M","id":"spread_round","label":"Spread this round","primary":true,"sends":false,"does":"Shows the roads only this person drives, and who is closest to being able to take one. Spreading a round is a decision, so it writes nothing until you say which road and who."},{"who":"EXAMPLE Thato M","id":"note","label":"Write it down for later","sends":false,"does":"Saves this as a note against that person so it is still here next month."}] },
      { kind: 'licence', who: 'EXAMPLE Boitumelo K', level: 'watch',
        say: 'EXAMPLE Boitumelo K licence expires in 21 days.',
        why: 'A driver on an expired licence voids the insurance on whatever they are driving, and the first anybody hears of it is usually an accident.',
        do_this: 'Book the renewal now and hold the date.',
        actions: [{"who":"EXAMPLE Boitumelo K","id":"set_renewal","label":"Mark the renewal booked","primary":true,"sends":false,"does":"Records that the renewal has been arranged and stops this card coming back every day until the new date is in.","needs":["date"]},{"who":"EXAMPLE Boitumelo K","id":"remind","label":"Remind me in a week","sends":false,"does":"Puts it back on this page in seven days rather than tomorrow."}] },
      { kind: 'slipping', who: 'EXAMPLE Kagiso T', level: 'watch',
        say: 'EXAMPLE Kagiso T is down 13 points against their own month before.',
        why: 'Measured against their OWN previous month, not against anybody else, so it is not a route or a round that changed. Something has.',
        do_this: 'Ask them what changed before deciding what it means. It is as often a vehicle or a customer as it is a person.',
        actions: [{"who":"EXAMPLE Kagiso T","id":"ask_first","label":"Write the question first","primary":true,"sends":false,"does":"Writes the opening line for the conversation, framed as a question about what changed rather than as a complaint about a number. Nothing is sent: you read it, change it, and speak to them yourself.","message":"I noticed your deliveries have been harder to get out on time this month than last. Before I assume anything, what has changed? Is it the vehicle, the round, a customer, or something else going on?"},{"who":"EXAMPLE Kagiso T","id":"check_vehicle","label":"Check their vehicle first","sends":false,"does":"Opens the fleet record for whatever they have been driving. It is as often the van as the person and that is the cheaper thing to rule out."}] },
      { kind: 'licence unknown', who: 'EXAMPLE Neo S', level: 'watch',
        say: 'No licence expiry is recorded for EXAMPLE Neo S.',
        why: 'Not knowing is the same exposure as an expired one, because nobody can be told to renew a date nobody holds.',
        do_this: 'Photograph the licence and put the date in.',
        actions: [{"who":"EXAMPLE Neo S","id":"set_licence","label":"Add the licence date","primary":true,"sends":false,"does":"Takes the expiry off the licence and puts it in, which turns an unknown into something the system can warn you about.","needs":["date"]}] }
    ],
    say: '5 things about the people running this company that no screen has ever shown you. Most of them are the company carrying a risk, not somebody doing badly.'
  };

  var roster = {
    known: true,
    date: '2026-09-16',
    off: [
      { name: 'EXAMPLE Neo S', kind: 'sick', say: 'off sick', planned: false,
        from: '2026-09-15', to: null, note: '',
        back: 'NO RETURN DATE. An absence with no end is how a week becomes three, and nobody notices because nothing ever falls due.' },
      { name: 'EXAMPLE Lorato D', kind: 'leave', say: 'on leave', planned: true,
        from: '2026-09-14', to: '2026-09-22', note: 'booked in July', back: 'back 2026-09-22' }
    ],
    findings: [
      { level: 'high', route: 'Kasane',
        say: 'Nobody available has driven Kasane in the last 60 days.',
        why: 'Every person who knows this road is off today. It has run 7 times in that window, so it is not a road this company can simply not do.',
        do_this: 'Either move the work, or send somebody with whoever ran it last so that this cannot happen again for the same reason.',
        actions: [{"id":"move_work","label":"Move the work booked today","primary":true,"sends":false,"does":"Shows what is promised on that road today and what each one would cost to move, so the decision is made against the promises rather than against a blank map."},{"id":"pair_next","label":"Pair somebody on it next time","sends":false,"does":"Books a second person onto the next run of this road with whoever drove it last, which is the only thing that stops this happening again for the same reason."}] },
      { level: 'watch', route: 'Ghanzi',
        say: 'Only EXAMPLE Thato M has driven Ghanzi in the last 60 days.',
        why: 'One person is the entire capability for this road. They are not off today, and the day they are, this becomes the sentence above.',
        do_this: 'Put a second person on it once, deliberately, before it is urgent.',
        actions: [{"id":"pair_next","label":"Put a second person on it","primary":true,"sends":false,"does":"Books somebody onto the next run alongside the one person who knows this road. Doing it once, deliberately, is cheaper than doing it in a hurry."}] },
      { level: 'watch', who: 'EXAMPLE Neo S',
        say: 'EXAMPLE Neo S is off sick with no return date.',
        why: 'An absence with no end never falls due, so nobody is ever reminded to ask. This is how a week quietly becomes three.',
        do_this: 'Put an expected date on it, even a wrong one. A date that moves is visible; no date at all is not.',
        actions: [{"id":"set_return","label":"Set an expected date","primary":true,"sends":false,"does":"Puts an expected return on the absence. A date that moves is visible; no date at all is not.","needs":["date"]},{"id":"check_in","label":"Write a message to check in","sends":false,"does":"Writes a short message asking how they are and when they expect to be back. It asks after the person before it asks after the date, and nothing is sent until you send it.","message":"Morning, just checking in, no rush at all. How are you doing? When you have an idea of when you might be back, let me know so I can sort the runs out. Take the time you need."}] }
    ],
    say: '2 away today. 3 things follow from that which nothing else on any screen would tell you.'
  };

  var worth = {
    known: true,
    window_days: 90,
    cost_basis: { known: false,
      why: 'the fuel table holds 0 rows. Two fills are the minimum that can produce a cost per kilometre, because one fill says how much fuel was bought and two say how far it went.',
      who: 'any driver, on the next fill, by photographing the slip in the driver app' },
    customers: [
      { name: 'EXAMPLE Kalahari Meats', jobs: 96, failed: 4,
        fail_rate: { known: true, value: 4 }, billed_thebe: 5420000,
        days_to_pay: { known: true, days: 28, slow: false }, margin: { known: false } },
      { name: 'EXAMPLE Standards Board', jobs: 61, failed: 2,
        fail_rate: { known: true, value: 3 }, billed_thebe: 3910000,
        days_to_pay: { known: true, days: 62, slow: true }, margin: { known: false } },
      { name: 'EXAMPLE Blue Aloe Chemists', jobs: 44, failed: 11,
        fail_rate: { known: true, value: 25 }, billed_thebe: 2960000,
        days_to_pay: { known: true, days: 31, slow: false }, margin: { known: false } }
    ],
    findings: [
      { who: 'EXAMPLE Blue Aloe Chemists', level: 'high',
        say: 'EXAMPLE Blue Aloe Chemists failed 25 per cent of deliveries, 11 of 44.',
        why: 'Every one of those is a second journey with the same fuel, the same hour and the same vehicle taken off something else, and not one of them is on an invoice. This is the cost that never appears anywhere.',
        do_this: 'Look at the reasons before the customer. wrong address 9, refused 2. A wrong address repeated nine times is a data problem, not a customer problem.',
        actions: [{"id":"fix_addresses","label":"Look at the addresses first","primary":true,"sends":false,"does":"Lists every failed delivery for this customer with the address as it was given. If the same one is wrong nine times, it is one correction and not a difficult conversation."},{"id":"ask_customer","label":"Write to the customer","sends":false,"does":"Writes a note offering to check the delivery details together. It offers help rather than assigning blame, and nothing is sent until you send it.","message":"Good day, this is Sprint Couriers. We have had a few deliveries to you that did not get through first time, and we would rather fix that than keep trying. Could we check the delivery address and a contact number for the receiving side with you? It should save us both the second trip."}] },
      { who: 'EXAMPLE Standards Board', level: 'watch',
        say: 'EXAMPLE Standards Board takes 62 days to pay.',
        why: 'Money owed that long is money this company has lent them, without interest and without agreeing to.',
        do_this: 'Worth knowing what the signed terms actually say before anybody raises it, because half of slow paying is a terms mismatch nobody ever read.',
        actions: [{"id":"read_terms","label":"What did we agree","primary":true,"sends":false,"does":"Opens the signed terms for this customer. Half of slow paying is a terms mismatch nobody has read, and going in without checking is how a good account gets an argument it did not deserve."},{"id":"statement","label":"Draft a statement","sends":false,"does":"Prepares the statement of what is outstanding. It is a draft and it goes nowhere until somebody sends it."}] }
    ],
    say: 'What each customer is WORTH can be shown. What they COST cannot, yet, because the fuel table holds 0 rows. Until that changes, no margin on this page is real, and it is better to say so than to print a confident wrong one.'
  };

  /* THE DECISION LOG, as example figures.

     The demonstration copy has to show the one thing that makes this worth having,
     which is NOT the diary. It is the row that comes back: somebody marked a licence
     renewal booked nine days ago and the date in the system has not moved.

     That row is the only thing in this product that holds a person to something they
     said, so the example carries one of each: a decision that was carried out and
     went quiet, a decision that cannot be checked by software and is waiting to be
     closed by hand, and the one that did not happen. */
  var decisions = {
    known: true,
    unkept: [
      { decision_id: 'EXAMPLE dec_4471', action_id: 'set_renewal', days_ago: 9,
        level: 'high', checkable: true, decided_at: '2026-09-07',
        say: 'You marked this renewal booked 9 days ago and the licence date has not moved. Either it was booked and nobody wrote the new date down, or it was not booked. From here those look the same and they end the same way.',
        why: 'This says what the system can see and nothing more: the licence expiry date moves further out has not happened. The commonest reason is that it was done and nobody came back to write it down, which is worth two minutes to fix either way.',
        do_this: 'Do it now, or write down what happened instead.',
        actions: [
          { id: 'set_licence', label: 'Put the new date in now', primary: true, sends: false,
            does: 'Takes the expiry off the renewed licence and puts it in, which closes this and stops it coming back.',
            needs: ['date'] },
          { id: 'close_by_hand', label: 'It was handled another way', sends: false,
            does: 'Closes this row with a note saying what actually happened, for the ones no software can check.' }
        ] },
      { decision_id: 'EXAMPLE dec_4462', action_id: 'spread_round', days_ago: 12,
        level: 'watch', checkable: false, decided_at: '2026-09-04',
        say: 'A decision made 12 days ago has not shown up in the system.',
        why: 'This one cannot be checked automatically, so it is here until somebody says what happened rather than quietly disappearing.',
        do_this: 'This one cannot be checked automatically. Close it by hand if it is done.',
        actions: [
          { id: 'close_by_hand', label: 'Close it with a note', primary: true, sends: false,
            does: 'Records what actually happened so this row stops asking and the answer is still here in a month.' }
        ] }
    ],
    history: [
      { action_id: 'book_rest', note: 'Book them a day off, 2026-09-18', decided_at: '2026-09-16', done: false },
      { action_id: 'fix_addresses', note: 'Look at the addresses first', decided_at: '2026-09-15', done: true },
      { action_id: 'set_return', note: 'Set an expected date, 2026-09-22', decided_at: '2026-09-14', done: true },
      { action_id: 'ask_first', note: 'Write the question first', decided_at: '2026-09-12', done: true }
    ],
    say: '2 decisions made more than 7 days ago that nothing in the system can confirm happened.'
  };

  var API = {
    NOW: NOW,
    decisions: decisions,
    people: people,
    roster: roster,
    worth: worth,
    cash: cash,
    revenue_by_customer: revenue_by_customer,
    concentration: concentration,
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
