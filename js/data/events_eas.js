/* ═══════════════════════════════════════════════
   EVENTS — EAS WIND-DOWN
   Sequential out-processing events that fire one
   per quarter after the player chooses EAS at the
   reenlistment window. Each event is acknowledge-
   only (no branching decisions), grounding the
   last few turns in the reality of leaving.
   ═══════════════════════════════════════════════ */

const EVENTS_EAS = [
  {
    id: 'eas_prep_tap',
    category: 'eas',
    title: 'TRS CLASS — WEEK ONE',
    weight: 1,
    trigger: {},
    isChance: true,
    chanceType: 'neutral',
    narrative: 'You report to the base education center for the first day of the Transition Readiness Seminar. A retired MSgt up front runs through VA benefits, resume writing, and job search basics. Most of the other Marines in the room look like they\'re doing math in their heads — figuring out what civilian life actually costs. It\'s a lot to take in. But it\'s real now.',
    choices: [
      {
        text: 'ACKNOWLEDGED',
        effects: { civilianEmployability: 3 },
      },
    ],
  },
  {
    id: 'eas_prep_physical',
    category: 'eas',
    title: 'FINAL PHYSICAL',
    weight: 1,
    trigger: {},
    isChance: true,
    chanceType: 'neutral',
    narrative: 'The medical center is busy. You go station to station — hearing test, vision, blood pressure, the full workup. A corpsman documents every existing condition for your VA claim. The dental chair leaves a mark. When it\'s done, a medical officer signs the paperwork. Your body is officially catalogued. Everything they\'ve put it through is now on record.',
    choices: [
      {
        text: 'ACKNOWLEDGED',
        effects: { stress: -2 },
      },
    ],
  },
  {
    id: 'eas_prep_gear',
    category: 'eas',
    title: 'IIF GEAR TURN-IN',
    weight: 1,
    trigger: {},
    isChance: true,
    chanceType: 'neutral',
    narrative: 'You go to IIF and the civilian clerk calls your name and prints out your inventory checklist. Helmet, flak, ILBE, gas mask, and every piece of gear they\'ve issued you. Some of it you\'ve had for years. You pull it all out, inventoried and laid flat. The clerk checks each line, grunts, and stamps the form. One more block cleared.',
    choices: [
      {
        text: 'ACKNOWLEDGED',
        effects: {},
      },
    ],
  },
  {
    id: 'eas_prep_barracks',
    category: 'eas',
    title: 'CLEARING THE BARRACKS',
    weight: 1,
    trigger: {},
    isChance: true,
    chanceType: 'neutral',
    narrative: 'You start breaking down your room. Every corner you\'ve lived in for the past few years — the locker, the rack, the tiny desk. There\'s more stuff than you remembered. You haul boxes to your car, bag what you don\'t need, and decide what\'s worth shipping. A buddy from the floor knocks and helps you carry the heaviest boxes without saying much. He\'s already thinking about his own EAS next year.',
    choices: [
      {
        text: 'ACKNOWLEDGED',
        effects: { morale: -3, familyStability: 2 },
      },
    ],
  },
  {
    id: 'eas_prep_family',
    category: 'eas',
    title: 'COORDINATING THE MOVE',
    weight: 1,
    trigger: {},
    isChance: true,
    chanceType: 'neutral',
    narrative: 'You call home and spend an hour on logistics — where you\'ll stay when you get back, what job leads are real, how long savings will hold. The conversation is good. There\'s nervousness underneath it, but mostly it\'s relief. They\'ve been waiting for this call. You hang up and feel the weight of the decision differently now — not lighter exactly, but more settled.',
    choices: [
      {
        text: 'ACKNOWLEDGED',
        effects: { familyStability: 5, morale: 3 },
      },
    ],
  },
  {
    id: 'eas_prep_dd214',
    category: 'eas',
    title: 'IPAC — DD-214 PACKAGE',
    weight: 1,
    trigger: {},
    isChance: true,
    chanceType: 'neutral',
    narrative: 'IPAC calls you in to review your newly minted DD-214. You go through every line — service dates, MOS, awards, character of discharge. The clerk makes two corrections you caught yourself. She reprints it and slides it across the counter. You hold the paper for a moment longer than expected. This is the document that proves you were here and now becomes the blanket everyone weirdly brags about.',
    choices: [
      {
        text: 'ACKNOWLEDGED',
        effects: { stress: -3 },
      },
    ],
  },
];
