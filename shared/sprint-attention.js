/* ONE QUEUE. Everything that could need somebody, ranked against everything else.

   17 September 2026. The Do this now card compared people exposures against roster
   findings and nothing else, so a driver needing a rest could occupy the single most
   valuable card on the screen while a vehicle sat in an incident. Its Open button
   also went to the same page whatever it was about.

   That is the fault worth fixing properly, because a card that claims to be the most
   important thing in the business and is not tells a confident lie every morning.

   HOW IT RANKS, and the two numbers are deliberately different things.

     SEVERITY is how bad it is if nothing happens. A tender missed is gone forever.
     A driver without a rest is a risk that has been growing for days.

     URGENCY is how fast the door is closing. A tender closing in an hour and a
     tender closing in three weeks have the same severity and nothing like the same
     urgency.

   They are MULTIPLIED, never added, because the whole point is that a small thing
   about to become impossible outranks a large thing with a week of room. Adding them
   lets a big slow problem sit on top of a small fast one forever, which is how every
   list of priorities eventually stops being read.

   CONSEQUENCE is in plain words on every row, because a number that cannot say what
   happens if it is ignored is not a priority, it is a ranking.

   AND EVERY ROW CARRIES ITS OWN DESTINATION. The old card sent everybody to Insights
   whatever it was about, which is the interface equivalent of pointing at a building.
*/
'use strict';
(function (root) {

/* Severity, 1 to 5, by what it costs if nobody does anything at all. */
const SEV = {
  incident: 5,        // a vehicle or a person is in trouble right now
  sla_breach: 4,      // a promise to a customer is about to break
  tender_close: 4,    // a door that shuts once and never opens again
  weather: 3,         // a van heading into something, still preventable
  licence: 3,         // an expired licence voids insurance on every load
  no_break: 3,        // tiredness is the cheapest accident to prevent
  uncovered_route: 3, // work that cannot happen tomorrow
  overdue_cash: 2,    // money that is late is not money that is lost
  uninvoiced: 2,      // it is still owed, it just has not been asked for
  slipping: 2,        // somebody getting worse, worth a conversation
  single_point: 2,
  default: 1
};

/* How fast the door is closing, from minutes where there are minutes. */
function urgency(minutes) {
  if (minutes == null) return 1.2;      // no clock on it, ordinary
  if (minutes < 0) return 3.2;          // already past
  if (minutes <= 60) return 3;
  if (minutes <= 240) return 2.2;
  if (minutes <= 60 * 24) return 1.5;
  if (minutes <= 60 * 24 * 3) return 1.1;
  return 0.6;                           // a long way off, keep it off the top
}

function row(o) {
  const sev = SEV[o.kind] || SEV.default;
  const urg = urgency(o.minutes_left);
  return {
    id: o.id,
    kind: o.kind,
    severity: sev,
    urgency: Number(urg.toFixed(2)),
    score: Number((sev * urg).toFixed(2)),
    entity: o.entity || null,
    title: o.title,
    instruction: o.instruction || '',
    consequence: o.consequence || '',
    destination: o.destination,
    minutes_left: o.minutes_left == null ? null : o.minutes_left
  };
}

/* CANONICAL IDENTITY, and it is never the wording.

   Two sources can report one event: the triage sweep raises a red alert and the
   activity feed carries the same incident, and Home was concatenating both, showing
   it twice and counting it twice.

   The identity of an event is its kind plus the thing it is about. NOT its text: two
   genuine events with identical wording at different times are two events, and
   deduplicating on words would quietly delete the second one. Where two rows are the
   same thing, the STRONGEST survives and takes the union of what can be done. */
function canonical(r) {
  return r.kind + '::' + (r.entity && (r.entity.id || r.entity.ref) ? (r.entity.id || r.entity.ref) : (r.id || ''));
}

function dedupe(rows) {
  const seen = new Map();
  for (const r of rows) {
    const k = canonical(r);
    const had = seen.get(k);
    if (!had) { seen.set(k, r); continue; }
    /* Same thing from two mouths. Keep the loudest and lose nothing. */
    if (r.score > had.score) {
      r.also_seen_as = (had.also_seen_as || []).concat([had.id]);
      seen.set(k, r);
    } else {
      had.also_seen_as = (had.also_seen_as || []).concat([r.id]);
    }
  }
  return [...seen.values()];
}

/* Build the queue from whatever this copy actually has. Every input is optional,
   because the office system has all of them and the demonstration copy has some. */
function build(sources) {
  sources = sources || {};
  const out = [];

  for (const i of sources.incidents || []) {
    out.push(row({
      id: i.id, kind: i.level === 3 ? 'incident' : 'sla_breach',
      entity: { id: i.vehicle_id || i.shipment_id || i.id, ref: i.waybill },
      minutes_left: i.minutes_left,
      title: i.title || 'An incident is open',
      instruction: i.do_this || 'Open the incident desk and take it on.',
      consequence: 'A customer finds out before Sprint does.',
      destination: 'incidents/index.html'
    }));
  }

  for (const t of sources.tenders || []) {
    out.push(row({
      id: t.id || ('tender_' + (t.title || '')), kind: 'tender_close',
      entity: { id: t.id, ref: t.reference },
      minutes_left: t.closes_in_minutes,
      title: t.title || 'A tender is closing',
      instruction: t.do_this || 'Check the pack is complete and lodge it.',
      consequence: 'A tender that closes is gone. There is no late.',
      destination: 'tenders/index.html'
    }));
  }

  for (const g of sources.weather || []) {
    out.push(row({
      id: 'wx_' + (g.customer_id || g.customer_name), kind: 'weather',
      entity: { id: g.customer_id },
      minutes_left: g.soonest_minutes,
      title: g.why || 'Consignments are going into weather',
      instruction: 'Tell them before the weather does. The message is written.',
      consequence: 'The customer hears it from the rain instead of from Sprint.',
      destination: 'insights/index.html'
    }));
  }

  for (const e of sources.people || []) {
    out.push(row({
      id: 'p_' + (e.kind || '') + '_' + (e.who || ''), kind: kindOf(e.kind),
      entity: { id: e.who },
      minutes_left: null,
      title: e.say, instruction: e.do_this,
      consequence: e.why, destination: 'insights/index.html'
    }));
  }

  for (const f of sources.roster || []) {
    out.push(row({
      id: 'r_' + (f.route || f.who || ''), kind: f.route ? 'uncovered_route' : 'no_break',
      entity: { id: f.route || f.who },
      minutes_left: null,
      title: f.say, instruction: f.do_this,
      consequence: f.why, destination: 'fleet/index.html'
    }));
  }

  if (sources.cash && sources.cash.overdue_thebe) {
    out.push(row({
      id: 'cash_overdue', kind: 'overdue_cash',
      entity: { id: 'overdue' }, minutes_left: null,
      title: 'Money is past its due date',
      instruction: 'Open the chase list, oldest first.',
      consequence: 'Money owed for sixty days is money this company has lent, without agreeing to.',
      destination: 'accounts/index.html'
    }));
  }

  return dedupe(out).sort((a, b) => b.score - a.score);
}

function kindOf(k) {
  if (k === 'licence' || k === 'licence unknown') return 'licence';
  if (k === 'no break') return 'no_break';
  if (k === 'single point') return 'single_point';
  if (k === 'slipping') return 'slipping';
  return 'default';
}

/* What Home shows. One row, and an honest answer when there is nothing, which is NOT
   the same as an honest answer when nothing loaded. */
function first(sources, opts) {
  const q = build(sources);
  if (opts && opts.loaded === false) {
    return {
      known: false,
      title: 'Waiting for data.',
      instruction: 'This cannot say whether anything needs you, because nothing has ' +
        'loaded. That is not the same as a quiet morning.',
      destination: 'insights/index.html'
    };
  }
  if (!q.length) {
    return {
      known: true, empty: true,
      title: 'Nothing needs you this morning.',
      instruction: 'Every source answered and none of them raised anything.',
      destination: 'insights/index.html'
    };
  }
  return Object.assign({ known: true, queue_length: q.length }, q[0]);
}

  var API = { build: build, first: first, dedupe: dedupe, canonical: canonical, urgency: urgency, SEV: SEV };
  if (typeof module === 'object' && module.exports) module.exports = API;
  root.SprintAttention = API;
})(typeof self !== 'undefined' ? self : this);
