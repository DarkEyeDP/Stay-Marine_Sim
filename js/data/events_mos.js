/* ═══════════════════════════════════════════════
   EVENTS — MOS-SPECIFIC (Infantry, Intelligence, Logistics, Communications,
   Admin, Motor Transport, Aviation, Law Enforcement, Artillery)
   ═══════════════════════════════════════════════ */

const EVENTS_MOS = [

  // ══════════════════ MOS-SPECIFIC: INFANTRY ══════════════════
  {
    id: 'evt_infantry_knees',
    category: 'personal',
    title: 'The Grunt Tax',
    weight: 10,
    trigger: { mosField: 'infantry', minTIS: 24 },
    narrative: 'Your knees have started filing formal complaints. Years of humping 80-pound packs across mountains and beaches have left you with that distinctive grunt shuffle — the one where every set of stairs gets a little extra respect. The corpsman says it\'s "normal wear" for your MOS. Your body disagrees. You\'re not even 25.',
    choices: [
      {
        text: 'Get evaluated and start physical therapy. Take care of the equipment.',
        hint: '+Long-term fitness, minor injury status — but addressed before it gets worse',
        effects: { stress: -3, physicalFitness: 3, familyStability: 2 },
        setInjury: 'minor',
      },
      {
        text: 'Motrin and drive on. Pain is just weakness leaving the body.',
        hint: 'Classic grunt response — risk of escalation down the road',
        effects: { reputationWithLeadership: 3, stress: 3, physicalFitness: -4 },
        injuryEscalateChance: 0.25,
      },
      {
        text: 'Start modifying your PT and investing in recovery seriously.',
        hint: '+Morale, protects long-term — smarter than you look',
        effects: { physicalFitness: 2, morale: 4, stress: -2 },
      },
    ],
  },

  {
    id: 'evt_infantry_recruiter_offer',
    category: 'career',
    title: 'Recruiting Duty: You\'ve Been Selected',
    weight: 7,
    trigger: { mosField: 'infantry', minTIS: 36, maxTIS: 96 },
    narrative: 'Your GySgt pulls you in and delivers what he clearly thinks is good news: you\'ve been selected for recruiting duty consideration. Three years in a small town in Ohio, wearing your dress blues, convincing 18-year-olds to enlist. High chance of getting a by-name-request. Regularish hours. A chance to "represent the Corps." Your buddy who did it came back with a Nissan Altima, a regional sales mindset, and a look in his eye.',
    choices: [
      {
        text: 'Accept it. Recruiting duty is a crucible that builds leadership.',
        hint: '+ProCon, +NetworkStrength, +CivilianEmployability — sales skills transfer',
        effects: { profConduct: 5, networkStrength: 8, civilianEmployability: 8, stress: -5, morale: 3 },
      },
      {
        text: 'Volunteer to defer — you want one more deployment first.',
        hint: '+Morale, keeps you in the operational force',
        effects: { morale: 5, mosProficiency: 4, reputationWithLeadership: 2 },
      },
      {
        text: 'Work the system — request a waiver and stay in the operating forces.',
        hint: 'May or may not work. Shows preference for ops over admin.',
        effects: { reputationWithLeadership: -3, stress: 4, mosProficiency: 2 },
      },
    ],
  },

  {
    id: 'evt_infantry_eas_reality',
    category: 'personal',
    title: 'The Wake-Up Call at the Gate',
    weight: 8,
    trigger: { mosField: 'infantry', minTIS: 24 },
    narrative: 'A former 0311 you deployed with — one of the best field Marines you\'ve ever known — shows up at the gate as a civilian contractor. He got out two years ago. He\'s making three times your salary. He also says it took him 18 months to find that job, he\'s still not sleeping right, and the hardest thing he\'s ever done was figure out how to talk about his combat experience in a job interview. "The resume doesn\'t translate itself," he tells you.',
    choices: [
      {
        text: 'Take the conversation seriously. Start building transferable skills now.',
        hint: '+CivilianEmployability, +EducationCredits — future you will appreciate this',
        effects: { civilianEmployability: 6, educationCredits: 4, stress: 3, morale: 3 },
      },
      {
        text: 'Your plan is to reenlist. Focus on the mission in front of you.',
        hint: '+Morale, +MOS focus — the mission matters',
        effects: { morale: 4, mosProficiency: 3, stress: -2 },
      },
      {
        text: 'Tell him about the TAP program. You\'ll worry about it later.',
        hint: 'Neutral — kicking the can down the road',
        effects: { stress: 1 },
      },
    ],
  },

  // ══════════════════ MOS-SPECIFIC: INTELLIGENCE ══════════════════
  {
    id: 'evt_intel_foreign_contact',
    category: 'discipline',
    title: 'Foreign Contact Report Required',
    weight: 8,
    trigger: { mosField: 'intelligence', minTIS: 12 },
    narrative: 'At a social event off base, you met someone who was asking unusually specific questions about your work — not classified details, but patterns that someone trained would notice. They were charming. Personable. Probably nothing. But you have a TS/SCI clearance and a legal obligation to report any contact that could constitute a foreign intelligence approach. Your career depends on that clearance.',
    choices: [
      {
        text: 'Report the contact to your security officer immediately.',
        hint: '+ProCon, +Reputation — protecting your clearance is protecting your career',
        effects: { profConduct: 6, reputationWithLeadership: 5, stress: 4, civilianEmployability: 3 },
      },
      {
        text: 'Document it yourself in writing but wait to see if it recurs.',
        hint: 'Moderate — paper trail exists, but delayed reporting is noted',
        effects: { profConduct: 2, stress: 5, disciplineRisk: 4 },
      },
      {
        text: 'It was probably nothing. Skip the report.',
        hint: 'High risk — security failure could end your clearance and career',
        effects: { disciplineRisk: 15, profConduct: -8, stress: 8 },
      },
    ],
  },

  {
    id: 'evt_intel_contractor_offer',
    category: 'career',
    title: 'The Three-Letter Agency Call',
    weight: 7,
    trigger: { mosField: 'intelligence', minTIS: 24 },
    narrative: 'You get a LinkedIn message. Then a follow-up email. A defense contractor you\'ve never heard of — subsidiary of a company you definitely have heard of — wants to talk about a GS-12 equivalent position leveraging your MOS skills and clearance. They want a commitment before your EAS date. The salary is... real. For the first time, you find yourself running the math on what staying actually costs.',
    choices: [
      {
        text: 'Schedule a call. Understand what your clearance is worth on the market.',
        hint: '+CivilianEmployability, +NetworkStrength — market awareness is valuable',
        effects: { civilianEmployability: 8, networkStrength: 6, stress: 3, morale: 4 },
      },
      {
        text: 'Ignore it. Your obligation is to the Corps right now.',
        hint: '+Morale, +Reputation — professional focus',
        effects: { morale: 3, reputationWithLeadership: 3, profConduct: 2 },
      },
      {
        text: 'Report the unsolicited approach to your security officer.',
        hint: 'Technically correct — contractor approach to cleared personnel is reportable',
        effects: { profConduct: 4, reputationWithLeadership: 5, stress: 2 },
      },
    ],
  },

  {
    id: 'evt_intel_surge_watch',
    category: 'unit',
    title: '72-Hour Exercise Watch Cycle',
    weight: 9,
    trigger: { mosField: 'intelligence', minTIS: 6 },
    narrative: 'A major exercise just kicked off and your shop is running 12-on/12-off watch cycles. Except they\'re actually more like 14-on/10-off once you account for briefings, gear checks, and the fact that your SSgt doesn\'t believe in full shift changeovers. You\'re producing solid analytical product, but you haven\'t seen sunlight in two days and you ate an MRE for dinner.',
    choices: [
      {
        text: 'Drive on. This is what intelligence Marines are for.',
        hint: '+Proficiency, ++Stress — the intel never stops',
        effects: { mosProficiency: 7, stress: 12, morale: -4, reputationWithLeadership: 6 },
      },
      {
        text: 'Do your job well, but advocate for proper rest protocols for the section.',
        hint: '+ProCon, +Morale for section — leadership means looking out for your people',
        effects: { profConduct: 4, reputationWithLeadership: 5, morale: 3, stress: 6, mosProficiency: 4 },
      },
    ],
  },

  // ══════════════════ MOS-SPECIFIC: LOGISTICS ══════════════════
  {
    id: 'evt_logistics_missing_gear',
    category: 'unit',
    title: 'The Disappearing $42,000 Problem',
    weight: 9,
    trigger: { mosField: 'logistics', minTIS: 12 },
    narrative: 'Quarterly property accountability check. You\'re staring at a line item — a piece of communications gear worth $42,000 — that is physically not where it\'s supposed to be and hasn\'t been logged out. Nobody knows where it is. Your name is on the property book. In the Marine Corps, equipment doesn\'t lose itself.',
    choices: [
      {
        text: 'Launch a full investigation. It will show up or you\'ll find who\'s responsible.',
        hint: '+ProCon, +Reputation — accountability is the foundation of logistics',
        effects: { profConduct: 5, reputationWithLeadership: 6, stress: 10, mosProficiency: 4 },
      },
      {
        text: 'Quietly ask around before escalating. Give it 48 hours.',
        hint: 'Reasonable — but if it surfaces after you delayed, you own that',
        effects: { stress: 8, mosProficiency: 3, profConduct: 2 },
      },
      {
        text: 'Report it immediately to the CO and accept the accountability',
        hint: 'Painful but professional — commanders respect Marines who own their books',
        effects: { profConduct: 4, reputationWithLeadership: 4, stress: 12, morale: -5 },
      },
    ],
  },

  {
    id: 'evt_logistics_supply_leverage',
    category: 'career',
    title: 'You Have What Everyone Needs',
    weight: 8,
    trigger: { mosField: 'logistics', minTIS: 18 },
    narrative: 'Through legitimate requisition, good timing, and the time-honored logistics tradition of "creative acquisition," your section has a significant surplus of Class II and Class VII items that three other sections have been trying to get for months. Your GySgt quietly asks you what you want to do with it. In the Marine Corps supply system, having what others need is a form of currency.',
    choices: [
      {
        text: 'Distribute it fairly. The mission comes first.',
        hint: '+ProCon, +Network — generosity in the supply system is remembered',
        effects: { profConduct: 4, networkStrength: 8, reputationWithLeadership: 5, morale: 3 },
      },
      {
        text: 'Use it as leverage to get your section\'s equipment priorities bumped.',
        hint: '+Section readiness, some political friction — welcome to logistics',
        effects: { mosProficiency: 5, reputationWithLeadership: 2, networkStrength: 3, stress: 3 },
      },
    ],
  },

  // ══════════════════ MOS-SPECIFIC: COMMUNICATIONS ══════════════════
  {
    id: 'evt_comm_tech_recruiter',
    category: 'personal',
    title: 'Silicon Valley Found You',
    weight: 8,
    trigger: { mosField: 'communications', minTIS: 24 },
    narrative: 'A recruiter from a company you\'ve actually heard of found your LinkedIn profile — the one you set up as a joke. They want to talk about a network engineering role. The base salary alone is more than your annual military compensation. You\'re halfway through your current enlistment. For the first time, the math on staying in starts feeling less obvious.',
    choices: [
      {
        text: 'Have the conversation. Market intelligence is never wasted.',
        hint: '+CivilianEmployability, +NetworkStrength — knowing your options is smart',
        effects: { civilianEmployability: 10, networkStrength: 5, morale: 5, stress: 2 },
      },
      {
        text: 'Politely decline. You\'re not done with the Corps yet.',
        hint: '+Morale, +Reputation — mission focus',
        effects: { morale: 4, reputationWithLeadership: 3, profConduct: 2 },
      },
      {
        text: 'Engage seriously and start studying for civilian certs on the side.',
        hint: '+CivilianEmployability significantly, +Stress — ambitious parallel path',
        effects: { civilianEmployability: 12, educationCredits: 4, stress: 8, mosProficiency: 2 },
      },
    ],
  },

  {
    id: 'evt_comm_network_outage',
    category: 'unit',
    title: 'Network Down — General in the Building',
    weight: 7,
    trigger: { mosField: 'communications', minTIS: 6 },
    narrative: 'The three-star is twenty minutes out for a VTC and your network just went down. Not slow — down. Your SSgt is looking at you with the calm of a man who has already decided whose fault this is going to be. You have seventeen minutes and four possible failure points. The entire chain of command is now aware of your existence.',
    choices: [
      {
        text: 'Systematic troubleshoot. Check physical layer first, work up the stack.',
        hint: '+MOS Proficiency, ++Stress — if you fix it, you\'re the hero',
        effects: { mosProficiency: 8, stress: 14, reputationWithLeadership: 8, morale: 3 },
      },
      {
        text: 'Call in backup from battalion comms. Two sets of eyes are better than one.',
        hint: '+Teamwork, -Solo reputation — but the network comes back up',
        effects: { mosProficiency: 4, networkStrength: 5, reputationWithLeadership: 4, stress: 8 },
      },
      {
        text: 'Recommend the VTC be pushed 30 minutes. Communicate the issue clearly.',
        hint: '+ProCon — managing up honestly is a skill',
        effects: { profConduct: 5, reputationWithLeadership: 3, stress: 6, mosProficiency: 3 },
      },
    ],
  },

  // ══════════════════ MOS-SPECIFIC: ADMIN ══════════════════
  {
    id: 'evt_admin_erbs_error',
    category: 'career',
    title: 'Your Service Record Has a Problem',
    weight: 8,
    trigger: { mosField: 'admin', minTIS: 12 },
    narrative: 'You\'re auditing your own ERB — something you should do quarterly but most Marines don\'t — and you spot it. A training course you completed 18 months ago isn\'t in the system. A meritorious mast citation is missing. Two items that would directly affect your promotion composite score. The admin shop that processed it has since moved on. You know exactly how this happened because you\'ve processed these same records yourself.',
    choices: [
      {
        text: 'Submit a formal correction package with full documentation.',
        hint: '+ProCon, +Promotion score — your record should reflect reality',
        effects: { profConduct: 4, mosProficiency: 3, stress: 5, reputationWithLeadership: 3 },
      },
      {
        text: 'Fix it quietly using your admin access. You know the system.',
        hint: 'Efficient but ethically gray — unauthorized record changes is a serious violation',
        effects: { disciplineRisk: 12, profConduct: -5, stress: 6 },
      },
      {
        text: 'Document it and brief your SSgt on the discrepancy.',
        hint: '+Transparency, +Reputation — loop in your chain of command',
        effects: { profConduct: 5, reputationWithLeadership: 6, mosProficiency: 3, stress: 4 },
      },
    ],
  },

  {
    id: 'evt_admin_page11_pressure',
    category: 'discipline',
    title: 'The Captain Wants a Favor',
    weight: 5,
    trigger: { mosField: 'admin', minTIS: 18 },
    narrative: 'A company officer asks you to "adjust the language" on a Page 11 counseling entry for a Marine who is clearly his protégé. Not fabricate — just soften. Make a documented failure look like a learning moment. You process these records. You have access. He\'s making it clear this is a career-positive move for you if you help. You also know this Marine\'s actual performance, and you know the regulations on official record falsification.',
    choices: [
      {
        text: 'Decline. You don\'t falsify official records for anyone.',
        hint: '+ProCon significantly, -Relationship with officer — integrity is non-negotiable',
        effects: { profConduct: 8, reputationWithLeadership: -5, disciplineRisk: -5, stress: 8, morale: 4 },
      },
      {
        text: 'Report the request to the First Sergeant.',
        hint: '+ProCon, escalates appropriately — this is the right call',
        effects: { profConduct: 10, reputationWithLeadership: 3, stress: 10, disciplineRisk: -8 },
      },
      {
        text: 'Do it. He said it would be remembered. Pick your battles.',
        hint: 'Short-term favor, long-term exposure — falsifying records ends careers',
        effects: { profConduct: -12, disciplineRisk: 18, reputationWithLeadership: 2, stress: 8 },
      },
    ],
  },

  // ══════════════════ MOS-SPECIFIC: MOTOR TRANSPORT ══════════════════
  {
    id: 'evt_motort_cdl_chance',
    category: 'career',
    title: 'CDL Testing Slot Available',
    weight: 9,
    trigger: { mosField: 'motor_t', minTIS: 12 },
    narrative: 'A testing slot opened up at the state DMV for Commercial Driver\'s License (CDL-A) certification. Your MOS experience counts toward the skills test. It requires study time on your own and getting approved leave for the test day, but a CDL is one of the most portable certifications in the civilian job market. Trucking companies actively recruit Marine drivers. You\'ve got the stick time. Now it\'s about making it official.',
    choices: [
      {
        text: 'Study up and take the test. Lock in the certification.',
        hint: '+CivilianEmployability significantly — a CDL is career insurance',
        effects: { civilianEmployability: 12, stress: 5, morale: 5 },
      },
      {
        text: 'Put it off until next cycle. Too much going on right now.',
        hint: 'No immediate downside — but the slot won\'t always be there',
        effects: { stress: -1 },
      },
    ],
  },

  {
    id: 'evt_motort_red_x_vehicle',
    category: 'discipline',
    title: 'Tasked to Drive a Deadlined Vehicle',
    weight: 7,
    trigger: { mosField: 'motor_t', minTIS: 12 },
    narrative: 'Your SSgt walks up and tells you to take a 7-ton out for a training run. The vehicle has a red X on the PMCS sheet — an open work order for a brake system issue. It hasn\'t been cleared by maintenance. "It\'ll be fine," he says. "Just around the block." You know the regs. You also know the consequences of a brake failure on a 7-ton.',
    choices: [
      {
        text: 'Refuse. You don\'t operate a deadlined vehicle. Full stop.',
        hint: '+ProCon, +Safety — this is the correct answer. Leadership may not be happy.',
        effects: { profConduct: 6, reputationWithLeadership: -4, stress: 5, disciplineRisk: -5 },
      },
      {
        text: 'Escalate immediately to the Motor Pool OIC.',
        hint: '+ProCon, goes over SSgt\'s head — right call, political friction',
        effects: { profConduct: 8, reputationWithLeadership: -3, stress: 6, mosProficiency: 3 },
      },
      {
        text: 'Do it. It\'s just a short run and your SSgt said it\'s fine.',
        hint: 'Serious safety risk. If something happens, you own it.',
        effects: { disciplineRisk: 10, stress: 8, profConduct: -6, reputationWithLeadership: 2 },
        injuryEscalateChance: 0.15,
      },
    ],
  },

  // ══════════════════ MOS-SPECIFIC: AVIATION ══════════════════
  {
    id: 'evt_arff_emergency',
    category: 'unit',
    title: 'Aircraft Emergency — All Hands',
    weight: 8,
    trigger: { mosField: 'aviation', minTIS: 12 },
    narrative: 'The crash alarm goes off. An aircraft is declaring emergency — hydraulic failure on approach. Your ARFF crew responds in under two minutes. Foam trucks in position. The aircraft comes in hard and fast. Everything you\'ve trained for is happening right now, for real, in front of the entire air station. You know the drill cold. This is what the job is.',
    choices: [
      {
        text: 'Execute the emergency response exactly as trained. Textbook.',
        hint: '+MOS Proficiency, +ProCon, +Reputation — this is your moment',
        effects: { mosProficiency: 8, profConduct: 7, reputationWithLeadership: 10, morale: 8, stress: 10 },
      },
      {
        text: 'Follow the lead of your section chief while providing sharp support.',
        hint: '+Teamwork, solid performance — good team player',
        effects: { mosProficiency: 5, profConduct: 4, reputationWithLeadership: 6, stress: 8 },
      },
    ],
  },

  {
    id: 'evt_aviation_faa_group',
    category: 'career',
    title: 'FAA Certification Study Group',
    weight: 7,
    trigger: { mosField: 'aviation', minTIS: 18 },
    narrative: 'Three Marines in your aviation unit are forming an off-hours study group to prepare for FAA certifications — Airframe and Powerplant (A&P) for the maintenance side, or Aircraft Rescue and Firefighting credentials for ARFF. The FAA certs translate directly to civilian aviation employment. Airlines, airports, and defense contractors actively recruit for these. It\'s extra work, but so is being broke after EAS.',
    choices: [
      {
        text: 'Join the study group. Invest in your civilian future now.',
        hint: '+CivilianEmployability, +NetworkStrength, +EducationCredits',
        effects: { civilianEmployability: 10, networkStrength: 6, educationCredits: 4, stress: 5, morale: 3 },
      },
      {
        text: 'Focus on your current duties. Certifications can wait.',
        hint: 'No cost now, but the group is moving without you',
        effects: { mosProficiency: 3, stress: -2 },
      },
    ],
  },

  // ══════════════════ MOS-SPECIFIC: LAW ENFORCEMENT ══════════════════
  {
    id: 'evt_mp_pd_recruiter',
    category: 'career',
    title: 'Police Department at the Gate',
    weight: 8,
    trigger: { mosField: 'law_enforcement', minTIS: 24 },
    narrative: 'A recruiter from a major metropolitan police department has set up a table at the MCX. They\'re specifically targeting Marine MPs — they know what you\'ve trained for and they want it. The starting salary is competitive, the benefits are solid, and they\'ll waive the written exam for veteran applicants. Three Marines from your section are already filling out applications. One of them looks at you: "You\'d be a natural."',
    choices: [
      {
        text: 'Grab the brochure and have a real conversation. Know your options.',
        hint: '+CivilianEmployability, +NetworkStrength — civilian PD is a natural transition',
        effects: { civilianEmployability: 8, networkStrength: 5, morale: 4, stress: 2 },
      },
      {
        text: 'Not yet. You have more to do in the Marine Corps first.',
        hint: '+Morale, keeps mission focus',
        effects: { morale: 4, reputationWithLeadership: 3, mosProficiency: 2 },
      },
      {
        text: 'Apply seriously. Start building your transition file now.',
        hint: '+CivilianEmployability significantly — being selective and prepared matters',
        effects: { civilianEmployability: 12, educationCredits: 3, networkStrength: 6, stress: 6 },
      },
    ],
  },

  {
    id: 'evt_mp_use_of_force',
    category: 'discipline',
    title: 'Difficult Traffic Stop Escalation',
    weight: 7,
    trigger: { mosField: 'law_enforcement', minTIS: 12 },
    narrative: 'A routine vehicle stop on base goes sideways. The driver is agitated, refuses to comply with verbal commands, and reaches toward the center console as you approach. Your partner is watching your back. The decision tree you\'ve trained to run is running in real time. This is the job — and your response becomes part of the record.',
    choices: [
      {
        text: 'De-escalate verbally. Control the situation through presence and tone.',
        hint: '+ProCon, +MOS Proficiency — textbook execution under pressure',
        effects: { profConduct: 6, mosProficiency: 7, reputationWithLeadership: 6, stress: 8, civilianEmployability: 4 },
      },
      {
        text: 'Draw and issue verbal commands. Establish clear dominance of the scene.',
        hint: 'Justified given the behavior — clean report, elevated tension',
        effects: { profConduct: 3, mosProficiency: 4, reputationWithLeadership: 3, stress: 12 },
      },
      {
        text: 'Call for backup before making contact. Two-officer approach.',
        hint: '+Teamwork, +Safety — slower but by the book',
        effects: { profConduct: 5, networkStrength: 4, reputationWithLeadership: 4, stress: 6 },
      },
    ],
  },

  // ══════════════════ MOS-SPECIFIC: ARTILLERY ══════════════════
  {
    id: 'evt_arty_hang_fire',
    category: 'unit',
    title: 'Hang Fire — Follow the Protocol',
    weight: 7,
    trigger: { mosField: 'artillery', minTIS: 12 },
    narrative: 'Live fire exercise. The fire command has been issued, charge is set, round is loaded — and nothing happens. Hang fire. The round did not fire but it\'s still in the tube. Your section knows the protocol cold: wait 30 seconds, don\'t touch anything, clear the firing line. But the range control officer is on the radio pushing for a status update. The round is still in there. The gun is still hot.',
    choices: [
      {
        text: 'Follow the hang fire protocol exactly. 30 seconds, then by the book.',
        hint: '+ProCon, +Reputation — correct execution under pressure',
        effects: { profConduct: 7, reputationWithLeadership: 8, mosProficiency: 6, stress: 8 },
      },
      {
        text: 'Follow protocol and clearly communicate the situation to range control.',
        hint: '+MOS Proficiency, +Leadership — communication is part of the job',
        effects: { profConduct: 6, mosProficiency: 7, reputationWithLeadership: 7, stress: 6 },
      },
      {
        text: 'Expedite the clearance — the range officer is waiting.',
        hint: 'Shortcutting hang fire protocol is how people die. High injury risk.',
        effects: { disciplineRisk: 15, profConduct: -10, reputationWithLeadership: -8, stress: 12 },
        injuryEscalateChance: 0.4,
      },
    ],
  },

  {
    id: 'evt_arty_fist_billet',
    category: 'career',
    title: 'FIST Team Billet Opens Up',
    weight: 7,
    trigger: { mosField: 'artillery', minTIS: 18, maxTIS: 96 },
    narrative: 'A Fire Support Team (FIST) billet is available — you\'d be embedded with an infantry battalion as the fire support Marine. More optempo. Higher physical demand. You\'d see more of the operational picture than most artillery Marines ever do. It\'s a career differentiator. It\'s also a different kind of hard.',
    choices: [
      {
        text: 'Put your name in. The FIST is where artillery Marines get tested.',
        hint: '+MOS Proficiency, +Reputation, ++Stress — high-visibility assignment',
        effects: { mosProficiency: 8, reputationWithLeadership: 10, profConduct: 4, stress: 12, morale: 5 },
      },
      {
        text: 'Stay in the gun line. You\'re building depth where you are.',
        hint: '+MOS at current position — steady career development',
        effects: { mosProficiency: 4, morale: 3, stress: -2 },
      },
    ],
  },

];
