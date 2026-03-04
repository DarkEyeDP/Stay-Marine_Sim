/* ═══════════════════════════════════════════════
   EVENTS — PRE-RETIREMENT
   Fires when retirementSubmitted: true
   ═══════════════════════════════════════════════ */

const EVENTS_RETIREMENT = [

  // ══════════════════ PRE-RETIREMENT ══════════════════

  {
    id: 'evt_tap_program',
    category: 'career',
    title: 'Transition Assistance Program (TAP)',
    weight: 35,
    trigger: { retirementSubmitted: true, notDeployed: true },
    narrative: 'TAP class is a week of mandatory transition briefings — résumé writing, VA benefits, job interview prep, financial planning post-retirement. Some guys sleep through it. Others treat it like an op-order. Your choice of attitude determines how much you actually get out of it.',
    choices: [
      {
        text: 'Engage fully — take notes, ask questions, network with the instructors.',
        hint: '++Civilian Employ., +Edu Credits, +NetworkStrength',
        effects: { civilianEmployability: 10, educationCredits: 4, networkStrength: 6, stress: -4 },
        logEntry: 'Completed TAP — fully engaged.',
      },
      {
        text: 'Show up, check the box, and use the free time to work on your résumé.',
        hint: '+Civilian Employ. — solid baseline',
        effects: { civilianEmployability: 5, stress: -3 },
        logEntry: 'Completed TAP.',
      },
      {
        text: 'Skip most of it. You already know what you\'re doing.',
        hint: 'Minimal benefit — opportunity cost',
        effects: { civilianEmployability: 2 },
        logEntry: 'Partially attended TAP class.',
      },
    ],
  },

  {
    id: 'evt_retirement_medical',
    category: 'personal',
    title: 'Retirement Separation Physical',
    weight: 30,
    trigger: { retirementSubmitted: true },
    narrative: 'IPAC schedules your separation physical — a full medical screening before you get out. The doctor asks about every ache, every injury you pushed through, every year of wear and tear. This is your one chance to get service-connected injuries documented for a VA disability rating. What you say here matters for the rest of your life.',
    choices: [
      {
        text: 'Be thorough — list every injury, every chronic issue, every old complaint.',
        hint: '+VA claim foundation, -Stress (peace of mind), may flag medical history',
        effects: { stress: -8, civilianEmployability: 3 },
        logEntry: 'Documented all injuries thoroughly at separation physical.',
      },
      {
        text: 'Report the obvious ones and mention your back/knees/shoulder.',
        hint: 'Covers the major stuff — solid baseline claim',
        effects: { stress: -4, civilianEmployability: 2 },
        logEntry: 'Completed separation physical — noted primary injuries.',
      },
      {
        text: 'Say you\'re fine. Marines don\'t complain.',
        hint: '-VA claim potential — same culture that hurt you is hurting you again',
        effects: { stress: 4, morale: -3 },
        logEntry: 'Under-reported injuries at separation physical.',
      },
    ],
  },

  {
    id: 'evt_sbp_brief',
    category: 'finance',
    title: 'Survivor Benefit Plan (SBP) Decision',
    weight: 25,
    trigger: { retirementSubmitted: true },
    narrative: 'Before retirement, you attend a mandatory SBP brief. The Survivor Benefit Plan lets you designate a portion of your pension to a survivor — typically your spouse — if you die first. It costs a percentage of your retired pay each month. If you\'re married, this decision matters. If you\'re single, it\'s less critical but still a real choice.',
    isChance: true,
    chanceType: 'positive',
    chanceImpact: 'SBP briefing complete',
    choices: [
      {
        text: 'Acknowledge',
        hint: 'SBP decision noted — affects post-retirement pension',
        effects: { civilianEmployability: 2, stress: -2 },
        logEntry: 'Attended Survivor Benefit Plan brief.',
      },
    ],
  },

  {
    id: 'evt_checkout_procedures',
    category: 'career',
    title: 'Checking Out of the Unit',
    weight: 28,
    trigger: { retirementSubmitted: true, notDeployed: true },
    narrative: 'You\'re officially on the checkout sheet — S-1, S-4, armory, dental, JAG, finance, housing, medical records. Every office wants your signature and your gear. It\'s bureaucratic chaos, but it\'s the final lap. How you handle this last stretch says a lot about who you are as a Marine.',
    choices: [
      {
        text: 'Be meticulous. Every chit signed, every record squared away before you leave.',
        hint: '+ProCon final, -Stress (it\'s handled), +Reputation',
        effects: { profConduct: 4, stress: -6, reputationWithLeadership: 5, morale: 5 },
        logEntry: 'Completed all checkout procedures — everything squared away.',
      },
      {
        text: 'Handle it steady but without rushing. Good enough is good enough.',
        hint: 'Solid exit — no drama',
        effects: { stress: -4, morale: 3 },
        logEntry: 'Completed checkout procedures.',
      },
      {
        text: 'Rush through it. You\'re basically a civilian already.',
        hint: '+Stress (admin errors catch up), -ProCon slightly',
        effects: { profConduct: -3, stress: 5, morale: -2 },
        logEntry: 'Rushed checkout — loose ends on departure.',
      },
    ],
  },

  {
    id: 'evt_retirement_ceremony_prep',
    category: 'career',
    title: 'Retirement Ceremony',
    weight: 20,
    trigger: { retirementSubmitted: true, notDeployed: true },
    narrative: 'Your command is putting together a retirement ceremony. The XO asks how formal you want it — a full ceremony with dress blues, a formation, a speech from the CO, and a flag presentation, or something low-key with your section and a handshake. It\'s your call. This is the last thing the Corps does in your name.',
    isChance: true,
    chanceType: 'positive',
    chanceImpact: 'Retirement ceremony scheduled',
    choices: [
      {
        text: 'Go full ceremony. You earned every piece of it.',
        hint: '++Morale, +FamilyStability — you deserve the recognition',
        effects: { morale: 12, familyStability: 8, stress: -5, networkStrength: 4 },
        logEntry: 'Full retirement ceremony — dress blues, formation, and flag presentation.',
      },
    ],
  },

];
