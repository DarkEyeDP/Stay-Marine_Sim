/* ═══════════════════════════════════════════════
   EVENTS — DEPLOYED
   Events that only fire while the marine is on deployment.
   All triggers require isDeployed: true.
   ═══════════════════════════════════════════════ */

const EVENTS_DEPLOYED = [

  // ══════════════════ DOWNRANGE LIFE ══════════════════

  {
    id: 'evt_deploy_care_package',
    category: 'morale',
    title: 'Mail Call — Package from Home',
    weight: 14,
    trigger: { isDeployed: true },
    isChance: true,
    narrative: 'Mail call. Your name gets called twice — a box from home is waiting for you. Beef jerky, Gatorade powder, playing cards, a note from family. It sounds small. Downrange, it\'s everything. The guys nearby are watching, and you pass around the jerky without hesitation. That\'s a good morning.',
    chanceImpact: '+Morale, -Stress',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { morale: 12, stress: -6, familyStability: 5 },
      logEntry: 'Mail call — package from home.',
    }],
  },

  {
    id: 'evt_deploy_downtime',
    category: 'morale',
    title: 'Unexpected Stand-Down Day',
    weight: 10,
    trigger: { isDeployed: true },
    isChance: true,
    narrative: 'The op got pushed 48 hours. Command called an unofficial stand-down — no formations, no taskers, nothing on the schedule until 1800. You haven\'t had unstructured time in weeks. The gym is open. Letters go unwritten. For once, downrange doesn\'t feel like a clock running out.',
    chanceImpact: '+Morale, -Stress',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { morale: 8, stress: -8, physicalFitness: 3 },
      logEntry: 'Stand-down day. Used it well.',
    }],
  },

  {
    id: 'evt_deploy_hostile_fire_pay',
    category: 'finance',
    title: 'Combat Pay — First Hazardous Duty Month',
    weight: 6,
    trigger: { isDeployed: true },
    isChance: true,
    narrative: 'Your first full month in-theater. Hostile fire pay and tax exclusion both hit your account simultaneously. It\'s not enough to make you forget where you are — but you\'re banking more than you ever did in garrison. You send half home.',
    chanceImpact: '+$900 Savings (HFP + tax-free month)',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: 900, morale: 4 },
      logEntry: 'First HFP month — banking the difference.',
    }],
  },

  // ══════════════════ COMBAT / OPERATIONAL ══════════════════

  {
    id: 'evt_deploy_combat_patrol',
    category: 'deployment',
    title: 'Patrol Goes Sideways',
    weight: 12,
    trigger: { isDeployed: true },
    narrative: 'Your patrol moves into a sector that was quiet last week. It\'s not quiet now. Contact is brief but real — a burst of small arms from a tree line, your section returning fire, the noise and chaos of an actual exchange. No casualties on your side. The after-action will take hours. Right now you\'re accounting for your Marines.',
    choices: [
      {
        text: 'Keep the section calm, account for everyone, and report up the chain immediately.',
        hint: '+ProCon, +Reputation — leading from the front matters most in the chaos',
        effects: { profConduct: 5, reputationWithLeadership: 8, stress: 12, mosProficiency: 6 },
        combatAwardChance: 0.15,
        logEntry: 'Contact on patrol. Maintained accountability and reported.',
      },
      {
        text: 'Get your Marines behind cover and call it in. Stay small until QRF arrives.',
        hint: 'Safe, tactically sound — stress cost but no career damage',
        effects: { stress: 10, profConduct: 2, mosProficiency: 3 },
        logEntry: 'Contact on patrol. Established cover and called for support.',
      },
    ],
  },

  {
    id: 'evt_deploy_ied_near_miss',
    category: 'deployment',
    title: 'IED Strike — Vehicle Hit',
    weight: 8,
    trigger: { isDeployed: true },
    narrative: 'Your convoy hits a pressure-plate IED. The blast lifts the vehicle, fills the interior with dust and ringing silence. For five seconds, nobody moves. Then you start running accountability. The driver took the worst of it — his hearing is gone in one ear, possible concussion. He\'s breathing. You\'re all breathing. The vehicle is done. The mission continues on foot.',
    choices: [
      {
        text: 'Secure the site, account for every Marine, and request CASEVAC for the driver.',
        hint: '+ProCon, +Reputation — the only right answer',
        effects: { profConduct: 4, reputationWithLeadership: 8, stress: 18, morale: -5 },
        combatAwardChance: 0.2,
        logEntry: 'Vehicle hit by IED. Secured site and requested CASEVAC.',
      },
      {
        text: 'Continue mission. The driver can walk, CASEVAC will find us.',
        hint: '+Mission, high personal and moral cost',
        effects: { mosProficiency: 3, stress: 20, morale: -10, profConduct: -2 },
        logEntry: 'IED strike. Continued mission with injured crew.',
      },
    ],
  },

  {
    id: 'evt_deploy_leadership_moment',
    category: 'deployment',
    title: 'Platoon Commander is Down — You Have the Platoon',
    weight: 6,
    trigger: { isDeployed: true, minTIS: 18 },
    narrative: 'Your lieutenant took shrapnel during an indirect fire attack — not life-threatening, but he\'s being medevaced. You\'re the senior NCO in the field with 28 Marines, a partially completed mission, and a company CO on the radio asking for a status. This is the moment NCOs train for their entire career.',
    choices: [
      {
        text: 'Take command, execute the mission, and report back with accountability.',
        hint: '++ProCon, +++Reputation — this is what senior NCOs do',
        effects: { profConduct: 8, reputationWithLeadership: 15, stress: 15, mosProficiency: 8, morale: 5 },
        combatAwardChance: 0.35,
        logEntry: 'Assumed platoon command during CASEVAC. Mission complete.',
      },
      {
        text: 'Request another officer be sent forward before making any decisions.',
        hint: 'Safe — but missed opportunity to demonstrate leadership',
        effects: { stress: 8, reputationWithLeadership: -4, profConduct: -2 },
        logEntry: 'Requested officer support. Held in place.',
      },
    ],
  },

  {
    id: 'evt_deploy_local_national',
    category: 'deployment',
    title: 'Local National Approaches Your Position',
    weight: 10,
    trigger: { isDeployed: true },
    narrative: 'A local man approaches your checkpoint — not threatening, hands visible, but moving toward the wire at an odd hour. He has information, or claims to. Your interpreter is two checkpoints back. Your ROE is clear. Your gut is telling you something. What you do next is part of a bigger picture that you can\'t fully see from your position.',
    choices: [
      {
        text: 'Halt, maintain distance, and call for an interpreter before any interaction.',
        hint: '+ProCon, safe and professional — proper engagement protocol',
        effects: { profConduct: 4, reputationWithLeadership: 4, stress: 5, mosProficiency: 3 },
        logEntry: 'Local national contact. Requested interpreter. Followed ROE.',
      },
      {
        text: 'Wave him off. Not your problem, not your checkpoint.',
        hint: 'Avoids risk but may have missed actionable intelligence',
        effects: { stress: 2, profConduct: -1 },
        logEntry: 'Turned away local national contact.',
      },
      {
        text: 'Engage him directly — use hand signals and your limited language skills.',
        hint: '+MOS Proficiency, +Morale if it works — moderate risk',
        effects: { mosProficiency: 5, reputationWithLeadership: 3, stress: 6, morale: 3 },
        logEntry: 'Directly engaged local national. Passed information to intel.',
      },
    ],
  },

  // ══════════════════ DOWNRANGE CHALLENGES ══════════════════

  {
    id: 'evt_deploy_equipment_failure',
    category: 'unit',
    title: 'Critical Gear Fails Before Mission',
    weight: 9,
    trigger: { isDeployed: true },
    narrative: 'Three hours before your section steps off, your comms gear goes down hard — not a battery issue, something deeper. You have three options, two of which involve borrowing gear from other sections. The third is going without. The mission is already on the board.',
    choices: [
      {
        text: 'Work the problem — cannibalize parts from spares, fix what you can.',
        hint: '+MOS Proficiency, +Reputation — this is your job',
        effects: { mosProficiency: 8, reputationWithLeadership: 6, stress: 8, profConduct: 3 },
        logEntry: 'Comms failure before mission. Repaired using field expedients.',
      },
      {
        text: 'Report the issue up the chain and coordinate for replacement gear.',
        hint: '+ProCon for transparency, mission may be delayed',
        effects: { profConduct: 4, stress: 5, reputationWithLeadership: 2 },
        logEntry: 'Reported equipment failure. Received replacement before step-off.',
      },
      {
        text: 'Step off anyway — maintain noise discipline and rely on adjacent units.',
        hint: 'Mission focus — real risk if something goes wrong',
        effects: { morale: 3, disciplineRisk: 8, stress: 10, reputationWithLeadership: -3 },
        logEntry: 'Stepped off with degraded comms. Completed mission.',
      },
    ],
  },

  {
    id: 'evt_deploy_mental_health_downrange',
    category: 'personal',
    title: 'Marine in Your Section is Not Okay',
    weight: 8,
    trigger: { isDeployed: true, minTIS: 18 },
    narrative: 'You\'ve been watching one of your Marines. He\'s not sleeping. Short fuse. Two nights ago he sat outside the wire staring at nothing for an hour. You know what you\'re looking at. The corpsman is embedded with another platoon. The mission doesn\'t stop. But neither do you.',
    choices: [
      {
        text: 'Pull him aside privately and have the direct conversation tonight.',
        hint: '+ProCon, +Reputation as a leader — this is what NCOs do',
        effects: { profConduct: 5, reputationWithLeadership: 8, stress: 6, morale: 5, networkStrength: 5 },
        logEntry: 'Identified and addressed mental health concern in section. Coordinated with corpsman.',
      },
      {
        text: 'Quietly flag it to your SSgt without naming the Marine.',
        hint: 'Moderate — gets it on radar without direct intervention',
        effects: { reputationWithLeadership: 3, stress: 3, profConduct: 2 },
        logEntry: 'Flagged wellness concern to SSgt.',
      },
      {
        text: 'Wait and watch. Could be a bad week.',
        hint: '-ProCon if something happens later — the signs are already there',
        effects: { profConduct: -4, reputationWithLeadership: -5, stress: 4 },
        logEntry: 'Observed Marine showing signs of combat stress. No action taken.',
      },
    ],
  },

  {
    id: 'evt_deploy_indirect_fire',
    category: 'deployment',
    title: 'FOB Takes Indirect Fire',
    weight: 11,
    trigger: { isDeployed: true },
    isChance: true,
    narrative: 'The crump of outgoing is different from incoming. You know the difference now. The alarm goes off. Mortars are walking toward the FOB perimeter — two rounds close enough that the windows rattle and dust falls from the ceiling. You\'re in your rack at 0300. You\'re out the door and in the bunker before you\'re fully conscious. A few minutes later: all-clear. No casualties. Welcome to downrange.',
    chanceImpact: '+Stress, -Morale',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { stress: 10, morale: -5, profConduct: 2 },
      logEntry: 'FOB took indirect fire. No casualties. All accounted for.',
    }],
  },

  {
    id: 'evt_deploy_buddy_leans_on_you',
    category: 'personal',
    title: 'Your Battle Buddy Got a Red Cross Message',
    weight: 7,
    trigger: { isDeployed: true },
    narrative: 'Your closest friend in the platoon got a Red Cross message: parent in the hospital, serious condition. He\'s not eligible for emergency leave — the situation doesn\'t meet the threshold. He\'s going through it alone, six thousand miles away, surrounded by people who don\'t know what to say. You know what to say.',
    choices: [
      {
        text: 'Be present. Sit with him, listen, and cover his duties for the next few days.',
        hint: '+NetworkStrength, +Morale for both of you — this is unit cohesion',
        effects: { networkStrength: 8, morale: 5, stress: 3, reputationWithLeadership: 3, profConduct: 2 },
        logEntry: 'Supported battle buddy through family emergency. Covered his duties.',
      },
      {
        text: 'Tell him to talk to the chaplain. You\'re not equipped for this.',
        hint: 'Not wrong — but a missed human moment',
        effects: { networkStrength: 2, stress: 1 },
        logEntry: 'Referred battle buddy to chaplain.',
      },
    ],
  },

];
