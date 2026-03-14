/* ═══════════════════════════════════════════════
   EVENTS — CHANCE (Positive, Negative, Catastrophic)
   isChance: true — player acknowledges; no real choice.
   ═══════════════════════════════════════════════ */

const EVENTS_CHANCE = [

  // ══════════════════ CHANCE EVENTS ══════════════════
  // isChance: true — player acknowledges; no real choice. Used for windfalls,
  // setbacks, and (at high disciplineRisk) game-ending consequences.

  // ── POSITIVE ──────────────────────────────────────

  {
    id: 'evt_marine_corps_ball',
    category: 'morale',
    title: 'Marine Corps Birthday Ball',
    weight: 100,
    oncePerYear: true,
    trigger: { triggerMonth: 11 },
    isChance: true,
    narrative: `November 10th. The Corps turns another year older. You and your unit are dressed in your Blues, the ballroom smells like floor wax and tradition, and somewhere a decorated Marine is reading a letter from the Commandant. The color guard, the cutting of the cake, the youngest and oldest Marines sharing the first slice — it hits different every time. Whatever your feelings about the Corps, tonight you remember why you joined the Corps.`,
    chanceImpact: '+Morale, +Unit Cohesion',
    chanceType: 'positive',
    choices: [{
      text: 'SEMPER FIDELIS',
      effects: { morale: 10, stress: -3, profConduct: 1 },
    }],
  },

  {
    id: 'evt_family_day',
    category: 'morale',
    title: 'Unit Family Day',
    weight: 10,
    trigger: { notDeployed: true },
    isChance: true,
    narrative: `Command organized a Family Day on base — BBQ, field games, and a chance to actually see your Marines as human beings outside of PT and formations. The spouses and kids running around the parade deck, someone's toddler wearing a cover three sizes too big. For one afternoon the Corps lets everyone exhale. You leave feeling like the unit is more than just a job.`,
    chanceImpact: '+Morale, +Family Stability',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { morale: 6, familyStability: 5, stress: -2 },
    }],
  },

  {
    id: 'evt_good_counseling',
    category: 'career',
    title: 'Positive Counseling Session',
    weight: 9,
    trigger: { maxGrade: 'E-4', notDeployed: true },
    isChance: true,
    narrative: `Your NCO sat you down for your quarterly counseling. You expected the usual clipboard-and-checklist routine, but he actually talked to you — where you're headed, what you need to work on, and what he sees in you. "You've got the right attitude. Keep your head down, stay out of the barracks drama, and you'll make rank ahead of your peers." Walking out of that office, you feel like someone in your chain actually gives a damn.`,
    chanceImpact: '+Morale, +ProCon',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { morale: 7, profConduct: 3, stress: -3 },
    }],
  },

  {
    id: 'evt_chance_tax_refund',
    category: 'finance',
    title: 'Tax Season Windfall',
    weight: 8,
    trigger: {},
    isChance: true,
    narrative: 'Your federal tax return hit your account. Military pay, deductions, and the combat pay exclusion all added up in your favor this year. Not life-changing — but real money.',
    chanceImpact: '+$1,400 Savings',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: 1400, morale: 5 },
    }],
  },

  {
    id: 'evt_chance_bah_increase',
    category: 'finance',
    title: 'BAH Rate Adjustment',
    weight: 7,
    trigger: {},
    isChance: true,
    narrative: 'DoD released the annual BAH rate tables. Your duty station\'s housing allowance went up — the civilian rental market around base has gotten more expensive, and the rates followed it.',
    chanceImpact: '+$240 (BAH increase, 3 months)',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: 240, morale: 3 },
    }],
  },

  {
    id: 'evt_chance_back_pay',
    category: 'finance',
    title: 'Pay Discrepancy — Resolved in Your Favor',
    weight: 7,
    trigger: {},
    isChance: true,
    narrative: 'Disbursing finally corrected a pay error from three months ago. You\'d flagged it twice and were starting to think it would just disappear. The back pay hit your account this morning.',
    chanceImpact: '+$900 Savings',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: 900, stress: -4 },
    }],
  },

  {
    id: 'evt_chance_unit_citation',
    category: 'career',
    title: 'Unit Earns Meritorious Unit Citation',
    weight: 6,
    trigger: { minTIS: 6 },
    isChance: true,
    narrative: 'Your battalion has been awarded a Meritorious Unit Citation for performance during the last major exercise. Every Marine in the unit benefits from the recognition. Your service record will reflect it.',
    chanceImpact: '+ProCon, +Reputation, +Morale',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { profConduct: 4, reputationWithLeadership: 4, morale: 6 },
    }],
  },

  {
    id: 'evt_chance_coined_sgtml',
    category: 'career',
    title: 'Coined by the SgtMaj',
    weight: 5,
    trigger: { minProfConduct: 65, minTIS: 12 },
    isChance: true,
    narrative: 'The Sergeant Major spotted your work during a field exercise and called you out in front of the unit. He pressed a challenge coin into your hand without a word. These moments build reputations.',
    chanceImpact: '+Morale, +Reputation',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { morale: 8, reputationWithLeadership: 8, profConduct: 3 },
    }],
  },

  {
    id: 'evt_chance_clearance_upgrade',
    category: 'career',
    title: 'Security Clearance Upgraded',
    weight: 5,
    trigger: { mosFields: ['intelligence', 'communications', 'admin'], minTIS: 18 },
    isChance: true,
    narrative: 'Your investigation came back clean and the upgrade was approved. The new access level opens billets and contractor pathways that weren\'t available before. On paper, your civilian market value just went up.',
    chanceImpact: '+10 Civilian Employability',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { civilianEmployability: 10, morale: 4 },
    }],
  },

  {
    id: 'evt_chance_good_fitrep',
    category: 'career',
    title: 'Outstanding Fitness Report',
    weight: 7,
    trigger: { minProfConduct: 70, minTIS: 18 },
    isChance: true,
    narrative: 'Your CO called you in to go over your fitness report. The narrative section has language that boards notice — "unlimited potential," "send immediately to the next level." You didn\'t expect it to be this strong.',
    chanceImpact: '+ProCon, +Reputation',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { profConduct: 6, reputationWithLeadership: 7, morale: 5 },
    }],
  },

  {
    id: 'evt_chance_clep_credits',
    category: 'career',
    title: 'CLEP Exam Passed',
    weight: 7,
    trigger: {},
    isChance: true,
    narrative: 'The base education center ran a CLEP testing event. You studied for a week and sat the exam — and passed. Fifteen college credit hours, officially earned. They go directly toward your degree plan. The GI Bill works better when you\'re already partway there.',
    chanceImpact: '+15 Education Credits',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { educationCredits: 15, civilianEmployability: 3, morale: 4 },
    }],
  },

  {
    id: 'evt_chance_srb_increase',
    category: 'finance',
    title: 'SRB Multiplier Increased',
    weight: 5,
    trigger: { minTIS: 30, maxTIS: 72 },
    isChance: true,
    narrative: 'HQMC released updated SRB multipliers this quarter. Your MOS is now listed at a higher bonus tier. If you reenlist in the current window, the calculation works out better than it would have last quarter.',
    chanceImpact: '+$1,500 (SRB rate adjustment)',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: 1500, morale: 6 },
    }],
  },

  {
    id: 'evt_chance_medical_clearance',
    category: 'personal',
    title: 'Full Duty Medical Clearance',
    weight: 7,
    trigger: {},
    isChance: true,
    narrative: 'Your annual physical came back clean. The doc gave you the strongest possible readiness endorsement — no waivers, no profiles, no restrictions. You\'re at full capacity and it shows.',
    chanceImpact: '+Fitness, +Morale',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { physicalFitness: 5, morale: 5, stress: -3 },
    }],
  },

  {
    id: 'evt_chance_employer_fair',
    category: 'career',
    title: 'Employer Hiring Fair on Base',
    weight: 6,
    trigger: {},
    isChance: true,
    narrative: 'MCCS hosted an employer hiring fair. Defense contractors, logistics firms, tech companies — all specifically recruiting veterans. You made some contacts and picked up a few business cards. The conversations were eye-opening.',
    chanceImpact: '+NetworkStrength, +CivilianEmployability',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { civilianEmployability: 6, networkStrength: 6, morale: 3 },
    }],
  },

  {
    id: 'evt_chance_award_approved',
    category: 'career',
    title: 'Award Package Finally Approved',
    weight: 6,
    trigger: { minProfConduct: 60, minTIS: 12 },
    isChance: true,
    narrative: 'The award package your GySgt submitted three months ago finally cleared battalion and went into your service record. The Navy Achievement Medal is in. Small recognition, but your record now reflects work that almost went unacknowledged.',
    chanceImpact: '+ProCon, +Reputation',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { profConduct: 5, reputationWithLeadership: 5, morale: 6 },
      grantAward: 'Navy Achievement Medal',
    }],
  },

  // ── NEGATIVE ──────────────────────────────────────

  {
    id: 'evt_chance_car_breakin',
    category: 'finance',
    title: 'Vehicle Broken Into',
    weight: 9,
    trigger: {},
    isChance: true,
    narrative: 'Someone broke the window on your car in the parking lot outside the barracks. Your gym bag, some electronics, and a small amount of cash are gone. The PMO report is filed but the odds of recovery are low.',
    chanceImpact: '-$600 Savings',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -600, stress: 6, morale: -4 },
    }],
  },

  {
    id: 'evt_chance_identity_fraud',
    category: 'finance',
    title: 'Credit Card Fraud Discovered',
    weight: 8,
    trigger: {},
    isChance: true,
    narrative: 'Your bank flagged unusual activity on your account. Someone has been making purchases with your card number for the past two weeks. The bank will reverse the charges eventually — but it takes time, and the dispute process has added stress you don\'t need right now.',
    chanceImpact: '+$800 Debt (dispute in progress)',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { debt: 800, stress: 8, morale: -5 },
    }],
  },

  {
    id: 'evt_chance_weigh_in_flag',
    category: 'discipline',
    title: 'Flagged at Random Body Composition Check',
    weight: 7,
    trigger: { maxPhysical: 65 },
    isChance: true,
    narrative: 'Command ordered a random BCP check. You came in just over the tape measurement standard. Nothing formal yet, but your SSgt was informed and a note went in your file. You need to get ahead of this fast.',
    chanceImpact: '-ProCon, +Discipline Risk',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { profConduct: -5, disciplineRisk: 6, stress: 7 },
    }],
  },

  {
    id: 'evt_chance_social_media',
    category: 'discipline',
    title: 'Social Media Post Flagged by Command',
    weight: 8,
    trigger: { maxTIS: 72 },
    isChance: true,
    narrative: 'A post you made — not classified, not even intentionally controversial — got screenshotted and sent up the chain. OPSEC guidelines are clear. Your SSgt read them to you in the hallway. A Page 11 counseling entry is now in your record.',
    chanceImpact: '-ProCon, Page 11 Counseling',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { profConduct: -5, reputationWithLeadership: -6, disciplineRisk: 5 },
    }],
  },

  {
    id: 'evt_chance_traffic_ticket',
    category: 'discipline',
    title: 'Traffic Violation on Base',
    weight: 8,
    trigger: {},
    isChance: true,
    narrative: 'PMO pulled you over on base for speeding in a 15 mph zone. The ticket goes in the system and your CO was notified. It\'s minor — but on-base violations show up in the system. Your SSgt gave you a look at formation that said everything.',
    chanceImpact: '-$150 Fine, +Discipline Risk',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { disciplineRisk: 8, savings: -150, stress: 4 },
    }],
  },

  {
    id: 'evt_chance_barracks_damage',
    category: 'finance',
    title: 'Barracks Water Leak — Gear Damaged',
    weight: 7,
    trigger: { maxTIS: 48 },
    isChance: true,
    narrative: 'A pipe burst in the room above yours overnight. By morning, water had soaked through the ceiling and hit your gear. Barracks maintenance will fix the structural issue. Replacing your uniform items and electronics is your problem.',
    chanceImpact: '-$400 Savings',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -400, stress: 5, morale: -4 },
    }],
  },

  {
    id: 'evt_chance_dysentery',
    category: 'personal',
    title: 'You Have Dysentery',
    weight: 5,
    trigger: {},
    isChance: true,
    narrative: 'It started after morning chow. By noon you were sprinting to the head every twenty minutes. By evening your SSgt was calling you "Oregon Trail" in front of the entire platoon. No one knows if it was the field mess, the lounge fridge someone left unlocked over the long weekend, or just an act of God — but the outcome is the same. You have dysentery. Three days of pure misery, one IV bag at medical, and an entry you\'ll be explaining at every PHA for the rest of your career.',
    chanceImpact: '-Fitness, +Stress, -Morale',
    chanceType: 'negative',
    choices: [{
      text: 'SURVIVED — barely.',
      effects: { physicalFitness: -8, stress: 10, morale: -7 },
      logEntry: 'Sick call x3. Dysentery. IV fluids. The platoon will never let you live it down.',
    }],
  },

  {
    id: 'evt_chance_family_expense',
    category: 'personal',
    title: 'Emergency Wire Home',
    weight: 8,
    trigger: { maxSavings: 12000 },  // not a crisis if finances are solid
    isChance: true,
    narrative: 'A family situation back home required you to wire money immediately — car broke down, medical bill, just needing help. You didn\'t hesitate. Marines take care of their people, and that includes the family they came from.',
    chanceImpact: '-$1,000 Savings',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -1000, stress: 7, familyStability: 3 },
    }],
  },

  {
    id: 'evt_chance_overpay_clawback',
    category: 'finance',
    title: 'Payroll Overpayment — You Must Repay',
    weight: 7,
    trigger: { maxSavings: 14000 },  // painful only when savings are thin
    isChance: true,
    narrative: 'Disbursing discovered they\'ve been overpaying you for the past two months — a clerical error on their end. That doesn\'t matter. The money is owed back. They set up automatic deductions from your next three paychecks. This is a known Marine Corps experience.',
    chanceImpact: '-$700 Savings',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -700, stress: 8, morale: -5 },
    }],
  },

  {
    id: 'evt_chance_profile',
    category: 'personal',
    title: 'Placed on Limited Duty Profile',
    weight: 7,
    trigger: {},
    isChance: true,
    narrative: 'The battalion surgeon reviewed your last physical and flagged an issue you\'d been managing quietly. You\'re on a limited duty profile — no running, no load-bearing, modified PT. It\'s temporary, but you\'re off the full-duty roster until it resolves.',
    chanceImpact: '-Fitness, +Stress, Minor Injury Status',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { physicalFitness: -8, stress: 8, morale: -5 },
      setInjury: 'minor',
    }],
  },

  {
    id: 'evt_chance_roommate_issues',
    category: 'personal',
    title: 'New Barracks Roommate is a Problem',
    weight: 8,
    trigger: { maxTIS: 48 },
    isChance: true,
    narrative: 'You got a new barracks roommate. He\'s loud, leaves gear everywhere, and his friends show up at 0100 on weekdays. Your section leader is already watching the room. You\'re accountable for what happens in there.',
    chanceImpact: '+Stress, +Discipline Risk',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { stress: 7, disciplineRisk: 6, morale: -5 },
    }],
  },

  {
    id: 'evt_chance_vehicle_impound',
    category: 'discipline',
    title: 'Vehicle Impounded — Expired Registration',
    weight: 7,
    trigger: {},
    isChance: true,
    narrative: 'PMO ran a base pass check and flagged your vehicle — registration expired two months ago. Impounded until you can produce current registration. The impound fee, the DMV paperwork, and the lost time all add up.',
    chanceImpact: '-$350, +Discipline Risk',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -350, disciplineRisk: 5, stress: 4 },
    }],
  },

  {
    id: 'evt_chance_section_incident',
    category: 'unit',
    title: 'Marine in Your Section Arrested Off Base',
    weight: 6,
    trigger: { minTIS: 18 },
    isChance: true,
    narrative: 'One of the Marines in your section was arrested off base over the weekend — bar fight, disorderly conduct. Command knows. They always know. Your GySgt asked what your read was on this Marine. Your answer will matter.',
    chanceImpact: '-Reputation, +Stress',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { reputationWithLeadership: -6, stress: 8, morale: -5 },
    }],
  },

  {
    id: 'evt_chance_bah_decrease',
    category: 'finance',
    title: 'BAH Rate Recalculated — Rate Drops',
    weight: 6,
    trigger: { maxSavings: 16000 },  // a rate dip only stings when margins are tight
    isChance: true,
    narrative: 'The DoD BAH rate update this year moved in the wrong direction for your zip code. The civilian rental market around base apparently cooled. Your monthly housing allowance drops slightly. You\'ll feel it at the end of the month.',
    chanceImpact: '-$240 (BAH decrease, 3 months)',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -240, stress: 5, morale: -3 },
    }],
  },

  {
    id: 'evt_chance_medical_bill',
    category: 'finance',
    title: 'Unexpected Medical Bill',
    weight: 8,
    trigger: { maxSavings: 10000 },  // Tricare gap only hurts when cash is tight
    isChance: true,
    narrative: 'A Tricare claim from your last ER visit was partially denied. You had to cover a cost-share you weren\'t expecting. Military healthcare is good — but billing gaps and coverage errors show up at the worst times.',
    chanceImpact: '-$550 Savings',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -550, stress: 5 },
    }],
  },

  {
    id: 'evt_chance_flipl',
    category: 'discipline',
    title: 'FLIPL Initiated — Missing Equipment',
    weight: 6,
    trigger: { minTIS: 12 },
    isChance: true,
    narrative: 'A Financial Liability Investigation of Property Loss was opened against your section. Gear from the last training op went unaccounted for in the post-event inventory and you\'re listed as a responsible party. Even if it clears you, the process is slow and visible to your chain of command.',
    chanceImpact: '-ProCon, +Stress, -$500 Potential Liability',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { profConduct: -4, disciplineRisk: 8, stress: 10, savings: -500 },
    }],
  },

  {
    id: 'evt_chance_eas_request_denied',
    category: 'career',
    title: 'Early Separation Request Denied',
    weight: 5,
    trigger: { minTIS: 12, maxTIS: 48 },
    isChance: true,
    narrative: 'You put in paperwork to explore an early out option. The command denied it. Your contract is your contract. The Marine Corps has authority over your timeline, and right now they\'ve decided you\'re staying. You were ready for this — but it still stings.',
    chanceImpact: '-Morale, +Stress',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { stress: 8, morale: -8 },
    }],
  },

  // ── CATASTROPHIC (game-over — minDisciplineRisk: 50+) ─────────────────
  // These only become eligible after sustained bad decision-making.

  {
    id: 'evt_chance_dui',
    category: 'discipline',
    title: 'DUI Arrest — On-Base Checkpoint',
    weight: 3,
    trigger: { minDisciplineRisk: 50 },
    isChance: true,
    narrative: 'PMO was running a checkpoint near the main gate. You thought you were fine. You were not. The breathalyzer said otherwise. A DUI on a military installation triggers mandatory court-martial processing under the UCMJ. Your CO has no discretion here. Your career is over.',
    chanceImpact: 'COURT-MARTIAL — DISHONORABLE DISCHARGE',
    chanceType: 'catastrophic',
    choices: [{
      text: 'FACE THE CHARGES',
      effects: { profConduct: -50, disciplineRisk: 50 },
      gameOverState: 'brig_discharge',
    }],
  },

  {
    id: 'evt_chance_drug_test',
    category: 'discipline',
    title: 'Urinalysis — Positive Result',
    weight: 3,
    trigger: { minDisciplineRisk: 50 },
    isChance: true,
    narrative: 'Random UA came back positive. Zero tolerance. There is no mitigation, no appeal, no nuance. The USMC does not negotiate on this. You are being processed for administrative separation under other than honorable conditions. Your career in the Marine Corps is over.',
    chanceImpact: 'DISHONORABLE DISCHARGE — ZERO TOLERANCE',
    chanceType: 'catastrophic',
    choices: [{
      text: 'FACE THE CONSEQUENCES',
      effects: { profConduct: -50, disciplineRisk: 50 },
      gameOverState: 'brig_discharge',
    }],
  },

  {
    id: 'evt_chance_ucmj_assault',
    category: 'discipline',
    title: 'Assault Charges — UCMJ Article 128',
    weight: 2,
    trigger: { minDisciplineRisk: 60 },
    isChance: true,
    narrative: 'An altercation off base turned physical. The other party filed reports with both civilian police and the MPs. Military law applies to you everywhere. Article 128 charges have been referred to a general court-martial. This is the end of your career in uniform.',
    chanceImpact: 'COURT-MARTIAL — DISHONORABLE DISCHARGE',
    chanceType: 'catastrophic',
    choices: [{
      text: 'FACE THE CHARGES',
      effects: { profConduct: -50, disciplineRisk: 50 },
      gameOverState: 'brig_discharge',
    }],
  },

];
