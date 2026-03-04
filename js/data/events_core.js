/* ═══════════════════════════════════════════════
   EVENTS — CORE (Deployment, Career, Personal, Finance, Discipline,
   Unit, Young Marine Life, Leadership, Conflicts, Family, Mental Health, Debt)
   ═══════════════════════════════════════════════ */

const EVENTS_CORE = [

  // ══════════════════ DEPLOYMENT ══════════════════
  {
    id: 'evt_meu_deployment',
    category: 'deployment',
    title: 'MEU Deployment Orders',
    weight: 15,
    trigger: { minTIS: 6, maxTIS: 200, notDeployed: true, optemoMin: 3, notOrdersDeclined: true },
    narrative: 'Orders come down — your unit is deploying on a MEU (Marine Expeditionary Unit). Seven months underway, the chance to prove yourself downrange.',
    deployLocations: [
      { name: 'Western Pacific (WestPac)', region: '7th Fleet AOR', context: 'Okinawa, Philippines, and the South China Sea. Amphibious exercises and rapid-response presence ops.' },
      { name: 'Mediterranean (Med Float)', region: '6th Fleet AOR', context: 'Spain, Italy, Greece. NATO exercises and contingency operations across North Africa and the Levant.' },
      { name: 'Horn of Africa', region: 'AFRICOM', context: 'Camp Lemonnier, Djibouti. Counterterrorism ops and partner force training across East Africa.' },
      { name: 'Persian Gulf / 5th Fleet', region: 'CENTCOM', context: 'Bahrain, UAE, and Gulf of Oman. Forward presence and maritime security operations.' },
    ],
    choices: [
      {
        text: 'Deploy with the unit. This is what we trained for.',
        hint: '+Morale, +Proficiency, ++Stress, -FamilyStability, +ProCon',
        effects: { morale: 5, mosProficiency: 8, stress: 15, familyStability: -12, profConduct: 4, reputationWithLeadership: 5 },
      },
      {
        text: 'Request a hold for personal/family reasons (if eligible).',
        hint: 'Avoids deployment — may hurt career standing',
        effects: { stress: -5, familyStability: 5, profConduct: -3, reputationWithLeadership: -8, morale: -5 },
        requiresFamily: true,
      },
    ],
    setDeployed: true,
    duration: 7,
  },

  {
    id: 'evt_oif_deployment',
    category: 'deployment',
    title: 'Combat Deployment Orders (OEF/OIF)',
    weight: 8,
    trigger: { minTIS: 12, maxTIS: 240, notDeployed: true, notOrdersDeclined: true },
    narrative: 'Your unit receives orders for a combat deployment. Seven to nine months in-country. Some of your peers look nervous. Your senior NCO tells you this is where Marines are made.',
    deployLocations: [
      { name: 'Helmand Province, Afghanistan', region: 'RC-Southwest / CENTCOM', context: 'FOB Leatherneck / Camp Bastion. Village stability ops, combat patrols, and IED-heavy terrain. Hostile Fire Pay applies.' },
      { name: 'Al Anbar Province, Iraq', region: 'MNF-W / CENTCOM', context: 'Camp Ramadi or Fallujah. Urban environment, persistent IED threat, high optempo from day one.' },
      { name: 'Kandahar, Afghanistan', region: 'RC-South / CENTCOM', context: 'Air assault operations and route clearance. Combined arms in complex terrain. High operational intensity.' },
      { name: 'Ninawa Province, Iraq', region: 'MNF-N / CENTCOM', context: 'Mosul area operations. Counter-insurgency, population engagement, and direct action missions.' },
    ],
    choices: [
      {
        text: 'Step up. Lead from the front.',
        hint: '++Proficiency, ++ProCon, +++Stress, combat award potential',
        effects: { mosProficiency: 12, profConduct: 6, stress: 20, familyStability: -15, reputationWithLeadership: 10, morale: 3 },
        combatAwardChance: 0.3,
      },
      {
        text: 'Do your job, stay focused, come home safe.',
        hint: '+Proficiency, +ProCon, ++Stress',
        effects: { mosProficiency: 6, profConduct: 3, stress: 15, familyStability: -12, reputationWithLeadership: 5 },
      },
    ],
    setDeployed: true,
    duration: 8,
  },

  // ══════════════════ CAREER ══════════════════
  {
    id: 'evt_meritorious_promo',
    category: 'career',
    title: 'Meritorious Promotion Recommended',
    weight: 6,
    trigger: { minProfConduct: 75, minPhysical: 75, minTIS: 12 },
    narrative: 'Your CO calls you in. Your performance has been exceptional. A meritorious promotion package is being submitted ahead of the normal timeline. This is a rare opportunity.',
    choices: [
      {
        text: 'Accept the meritorious promotion package.',
        hint: 'Early promotion — accelerates career track',
        effects: { profConduct: 3, morale: 10, reputationWithLeadership: 10 },
        meritoriousPromo: true,
      },
      {
        text: 'Decline — I\'ll earn it through normal channels.',
        hint: 'No early promotion but shows humility (unusual choice)',
        effects: { profConduct: 2, morale: 3 },
      },
    ],
  },

  {
    id: 'evt_school_orders',
    category: 'career',
    title: 'School Orders Available',
    weight: 10,
    trigger: { minTIS: 18 },
    narrative: 'The training and education office posts available school seats. There\'s a slot open for a course that could boost your career. Slots go fast.',
    choices: [
      {
        text: 'Put in for a school seat immediately.',
        hint: '+Proficiency, +Promotion score',
        effects: { mosProficiency: 6, profConduct: 2 },
        triggerSchoolSelect: true,
      },
      {
        text: 'Pass this time — better opportunities may come.',
        hint: 'No immediate effect',
        effects: {},
      },
    ],
  },

  {
    id: 'evt_great_leader',
    category: 'career',
    title: 'Exceptional Leadership Takes Notice',
    weight: 8,
    trigger: { minTIS: 6 },
    narrative: 'Your GySgt pulls you aside after a field op. "I\'ve been watching you. You\'ve got potential. I want to mentor you." Having a strong mentor can shape an entire career.',
    choices: [
      {
        text: 'Accept the mentorship and put in extra effort.',
        hint: '++NetworkStrength, +Reputation, +ProCon',
        effects: { networkStrength: 10, reputationWithLeadership: 8, profConduct: 3, mosProficiency: 5 },
      },
      {
        text: 'Politely acknowledge but stay focused on your own path.',
        hint: 'Neutral — mild relationship building',
        effects: { networkStrength: 3, reputationWithLeadership: 2 },
      },
    ],
  },

  {
    id: 'evt_toxic_leadership',
    category: 'career',
    title: 'Toxic Leadership in Your Chain',
    weight: 9,
    trigger: { minTIS: 6 },
    narrative: 'Your new SSgt is a micro-manager with a volatile temper. He targets Marines seemingly at random, and your section\'s morale is cratering. Command seems unaware — or doesn\'t care.',
    choices: [
      {
        text: 'Document everything. File an IG complaint.',
        hint: 'May improve situation long-term but risky short-term',
        effects: { stress: -5, morale: 5, reputationWithLeadership: -5, disciplineRisk: 5 },
      },
      {
        text: 'Tough it out. Drive on and protect your Marines.',
        hint: '+Stress but shows resilience',
        effects: { stress: 10, morale: -5, profConduct: 2, reputationWithLeadership: 3 },
      },
      {
        text: 'Request a lateral move or PCS out of the unit.',
        hint: 'Avoids the situation but may look like running',
        effects: { stress: -8, morale: 3, reputationWithLeadership: -3 },
      },
    ],
  },

  {
    id: 'evt_award_nomination',
    category: 'career',
    title: 'Nominated for Meritorious Award',
    weight: 7,
    trigger: { minProfConduct: 65, minTIS: 12 },
    narrative: 'Your section chief is putting you in for a NAM (Navy and Marine Corps Achievement Medal) for outstanding performance during the last exercise. It\'s being reviewed at the battalion level.',
    choices: [
      {
        text: 'This is team recognition — make sure the citation reflects your section.',
        hint: '+Morale, +NetworkStrength, award may still go through',
        effects: { morale: 5, networkStrength: 5, profConduct: 2 },
        awardChance: 0.75,
      },
    ],
    autoResolve: true,
    awardChance: 0.7,
  },

  // ══════════════════ PERSONAL ══════════════════
  {
    id: 'evt_marriage',
    category: 'personal',
    title: 'Getting Married',
    weight: 8,
    trigger: { minTIS: 12 },
    narrative: 'You\'ve been with your partner through multiple moves and a deployment. They\'ve asked you to make it official. Getting married in the Marine Corps comes with BAH changes, new responsibilities, and real stakes.',
    choices: [
      {
        text: 'Marry now — start building a life together.',
        hint: '+BAH, +FamilyStability, but more pressure on career decisions',
        effects: { familyStability: 20, morale: 10, savings: 2000 },
        setMarried: true,
        bahIncrease: true,
      },
      {
        text: 'Wait until the timing is better — maybe after this next deployment.',
        hint: 'No immediate change',
        effects: { familyStability: -3, morale: -3 },
      },
    ],
  },

  {
    id: 'evt_child',
    category: 'personal',
    title: 'New Baby on the Way',
    weight: 7,
    trigger: { minTIS: 12, isMarried: true },
    narrative: 'Your spouse is pregnant. A new child changes everything — your schedule, your finances, your priorities. The Marine Corps doesn\'t slow down, but your perspective might.',
    choices: [
      {
        text: 'Embrace it. Family first, mission always.',
        hint: '+FamilyStability long-term, +Stress short-term, +Expenses',
        effects: { familyStability: 10, stress: 8, morale: 5 },
        addChild: true,
        expenseIncrease: 400,
      },
      {
        text: 'Lean into the support network. Connect with the family readiness officer.',
        hint: '+FamilyStability, -Stress vs solo approach',
        effects: { familyStability: 15, stress: 3, morale: 8, networkStrength: 3 },
        addChild: true,
        expenseIncrease: 400,
      },
    ],
  },

  {
    id: 'evt_family_separation',
    category: 'personal',
    title: 'Family Struggling During Deployment',
    weight: 10,
    trigger: { isDeployed: true, isMarried: true },
    narrative: 'A letter from home — your spouse is struggling. The car broke down, the kids are sick, and the stress of solo parenting is taking a toll. The Red Cross message doesn\'t rise to emergency level, but the distance weighs on you.',
    choices: [
      {
        text: 'Send money from your combat savings. Handle what you can remotely.',
        hint: '-Savings, +FamilyStability, +Morale',
        effects: { familyStability: 8, morale: 5, savings: -800 },
      },
      {
        text: 'Get your spouse connected with the FRO and support networks on base.',
        hint: '+FamilyStability over time',
        effects: { familyStability: 5, networkStrength: 3 },
      },
      {
        text: 'Request emergency leave through Red Cross.',
        hint: 'Goes home briefly — may affect profConduct and reputation',
        effects: { familyStability: 15, morale: 8, profConduct: -3, reputationWithLeadership: -5 },
      },
    ],
  },

  // ══════════════════ FINANCE ══════════════════
  {
    id: 'evt_car_trouble',
    category: 'finance',
    title: 'Vehicle Breakdown',
    weight: 12,
    trigger: {},
    narrative: 'Your car just threw a check engine light. The mechanic says it\'s $800 minimum, probably $1,400 once they get into it. You need a vehicle to get to base.',
    choices: [
      {
        text: 'Pay cash for repairs. Take the hit.',
        hint: '-Savings, no debt incurred',
        effects: { savings: -1100, stress: 3 },
      },
      {
        text: 'Finance the repairs. Keep cash liquid.',
        hint: '+Debt, +Stress long-term',
        effects: { debt: 1100, stress: 5 },
      },
      {
        text: 'Get a different (used) car. The old one is a money pit.',
        hint: '-Savings, potential debt, fresh start',
        effects: { savings: -2000, debt: 3000, stress: 5 },
      },
      {
        text: 'Buy a new car. Fresh start, full warranty.',
        hint: 'Brand new vehicle — figure out the paperwork later',
        effects: { morale: 5, stress: -2 },
        buyNewCar: true,
      },
    ],
  },

  {
    id: 'evt_buddy_loan',
    category: 'finance',
    title: 'A Buddy Asks to Borrow Money',
    weight: 8,
    trigger: {},
    narrative: 'Your buddy is in a bad spot — he says he\'ll have it back by payday next week. You\'ve been there before. But you\'ve also heard this story end badly.',
    choices: [
      {
        text: 'Lend him the money — he\'s your boy.',
        hint: '-Savings, 50% chance of getting it back',
        effects: { savings: -300, morale: 3 },
        loanResolve: true,
      },
      {
        text: 'No — money and friends don\'t mix.',
        hint: 'Preserve savings, minor social friction',
        effects: { stress: 2 },
      },
      {
        text: 'Point him to the MCCS financial counseling center.',
        hint: '+NetworkStrength, saves you money',
        effects: { networkStrength: 2, morale: 2 },
      },
    ],
  },

  {
    id: 'evt_srb_bonus_advice',
    category: 'finance',
    title: 'First Paycheck + SRB — Now What?',
    weight: 5,
    trigger: { minTIS: 36, maxTIS: 48 },
    narrative: 'You just got your SRB bonus deposited. A buddy wants to take a group to Vegas. Your financial counselor says to invest it. Your senior NCO says pay off debt first.',
    choices: [
      {
        text: 'Pay off debt immediately.',
        hint: '-Debt, +LifestyleScore, +LongTermFinance',
        effects: { debt: -5000, lifestyleScore: 1, stress: -5 },
      },
      {
        text: 'Build an emergency fund (savings).',
        hint: '+Savings, stable foundation',
        effects: { savings: 5000, stress: -3 },
      },
      {
        text: 'Spend it on experiences and gear. YOLO, this is the Marine Corps.',
        hint: '-Savings, +Morale short-term, regret long-term',
        effects: { morale: 8, savings: -2000, debt: 1000, stress: 5 },
        delayed_effect: { stress: 8, morale: -5, delay: 6 },
      },
    ],
  },

  // ══════════════════ DISCIPLINE ══════════════════
  {
    id: 'evt_liberty_incident',
    category: 'discipline',
    title: 'Liberty Incident Risk',
    weight: 10,
    trigger: { maxDiscipline: 70 },
    narrative: 'Your section goes on liberty Friday night. Someone suggests a bar in town. The night is going well until a situation escalates — harsh words with some locals, your buddy throws a punch. You\'re standing right there.',
    choices: [
      {
        text: 'Intervene immediately. Pull your buddy out of there.',
        hint: '+ProCon, +Reputation, +Stress',
        effects: { profConduct: 5, reputationWithLeadership: 5, stress: 3, disciplineRisk: -5 },
      },
      {
        text: 'Walk away. Not your fight.',
        hint: 'Avoids involvement but leaves buddy exposed',
        effects: { profConduct: -2, reputationWithLeadership: -3, stress: 4 },
      },
      {
        text: 'Join the situation. Semper Fi, got your boy\'s back.',
        hint: 'High risk of NJP or worse',
        effects: { disciplineRisk: 20, profConduct: -10, reputationWithLeadership: -10 },
        njpRisk: 0.5,
      },
    ],
  },

  {
    id: 'evt_njp',
    category: 'discipline',
    title: 'Non-Judicial Punishment (NJP)',
    weight: 5,
    trigger: { minDisciplineRisk: 40 },
    narrative: 'It finally caught up to you. The CO is holding NJP for an incident from last month. This is a career-defining moment. How you respond matters as much as the charge.',
    choices: [
      {
        text: 'Accept NJP. Take your punishment, move on, prove yourself.',
        hint: '-ProCon heavily, -Reputation, but shows accountability',
        effects: { profConduct: -15, reputationWithLeadership: -8, disciplineRisk: -10, stress: 10, morale: -10 },
      },
      {
        text: 'Request trial by court-martial (risky — may be worse).',
        hint: 'Gamble — outcome weighted by ProCon baseline',
        effects: { stress: 20 },
        courtMartialGamble: true,
      },
    ],
  },

  {
    id: 'evt_pft_failure',
    category: 'discipline',
    title: 'PFT Failure',
    weight: 8,
    trigger: { maxPhysical: 55 },
    narrative: 'You failed the PFT this cycle. Even close to the cut scores, a failure goes on your record and affects your promotion package. The battalion CO is not happy.',
    choices: [
      {
        text: 'Request a re-test and train harder. Own the failure.',
        hint: '-ProCon for now, chance to recover with re-test',
        effects: { profConduct: -5, stress: 8, physicalFitness: 5 },
        ptRetestChance: 0.7,
      },
      {
        text: 'Accept the failure and note it. Focus on the CFT to compensate.',
        hint: '-ProCon, -Promo score',
        effects: { profConduct: -8, reputationWithLeadership: -5, stress: 6 },
      },
    ],
  },

  // ══════════════════ UNIT ══════════════════
  {
    id: 'evt_inspection',
    category: 'unit',
    title: 'IG Inspection',
    weight: 8,
    trigger: {},
    narrative: 'The unit is tasked with an Inspector General inspection. Every locker, vehicle, and record will be scrutinized. Your section chief puts you in charge of inspection prep.',
    choices: [
      {
        text: 'Go all-in on prep. Long hours, but nail it.',
        hint: '+ProCon, +Reputation, +Stress',
        effects: { profConduct: 5, reputationWithLeadership: 6, stress: 8, mosProficiency: 3 },
      },
      {
        text: 'Do the minimum required. It\'s an inspection, not combat.',
        hint: 'Neutral results',
        effects: { stress: 3 },
      },
    ],
  },

  {
    id: 'evt_leadership_change',
    category: 'unit',
    title: 'New Chain of Command',
    weight: 10,
    trigger: { minTIS: 6 },
    narrative: 'A new CO and Sergeant Major have taken over the battalion. The culture is shifting — more PT focus, stricter uniform standards, but also a commitment to professional development. Adjust or fall behind.',
    choices: [
      {
        text: 'Adapt quickly. Embrace the new culture and make it work for you.',
        hint: '+Reputation, +ProCon',
        effects: { reputationWithLeadership: 6, profConduct: 3, mosProficiency: 2 },
      },
      {
        text: 'Push back through proper channels if policies seem unfair.',
        hint: 'May improve or hurt reputation depending on approach',
        effects: { reputationWithLeadership: -3, stress: 5, morale: 3 },
      },
    ],
  },

  {
    id: 'evt_training_accident',
    category: 'unit',
    title: 'Training Injury',
    weight: 7,
    trigger: { minOptempo: 2 },
    narrative: 'During a field exercise, you take a hard fall crossing a ravine. The corpsman doesn\'t think it\'s serious, but you\'re limping. If you push through, you might aggravate it. If you see medical, you could be pulled from training.',
    choices: [
      {
        text: 'Push through. The unit needs you.',
        hint: '+Reputation, but risk of major injury',
        effects: { reputationWithLeadership: 3, stress: 5, physicalFitness: -5 },
        injuryEscalateChance: 0.3,
      },
      {
        text: 'See the corpsman and get checked out.',
        hint: 'May be pulled from training, but protects long-term health',
        effects: { stress: 2, physicalFitness: -2, familyStability: 2 },
        setInjury: 'minor',
      },
    ],
  },

  {
    id: 'evt_recon_selection',
    category: 'career',
    title: 'Recon Selection Opportunity',
    weight: 4,
    trigger: { minPhysical: 80, minTIS: 6, maxTIS: 48 },
    narrative: 'You\'ve been put on a list of candidates for Recon indoc. The physical requirement is brutal, the attrition rate is near 70%. But those who earn the title join an elite brotherhood.',
    choices: [
      {
        text: 'Put in the package. Give it everything.',
        hint: 'High risk/reward — requires 90 physical fitness to pass',
        effects: { morale: 5, reputationWithLeadership: 5, stress: 8 },
        reconAttempt: true,
      },
      {
        text: 'Not the right time. Focus on the current career path.',
        hint: 'No change',
        effects: {},
      },
    ],
  },

  // ══════════════════ YOUNG MARINE LIFE ══════════════════
  {
    id: 'evt_first_payday',
    category: 'finance',
    title: 'First Real Paycheck',
    weight: 20,
    trigger: { minTIS: 3, maxTIS: 15 },
    narrative: 'It\'s your first full paycheck as a Marine — more money than you\'ve ever had at once. The guys are already talking about what to buy. There\'s a car lot just off base and a predatory "military friendly" lender right next to it.',
    choices: [
      {
        text: 'Open a savings account and put half away. Be smart.',
        hint: '+Savings, +CivilianEmployability, -Morale slightly',
        effects: { savings: 600, civilianEmployability: 3, morale: -2 },
      },
      {
        text: 'Buy something nice. You earned it.',
        hint: '-Savings, +Morale short-term',
        effects: { savings: -800, morale: 8, debt: 500 },
      },
      {
        text: 'Talk to the MCCS financial counselor first.',
        hint: '+Financial literacy, good foundation',
        effects: { savings: 300, civilianEmployability: 4, debt: -200 },
      },
    ],
  },

  {
    id: 'evt_payday_loan',
    category: 'finance',
    title: 'Predatory Lender Near Base',
    weight: 9,
    trigger: { maxTIS: 30, maxSavings: 2500 },
    narrative: 'You\'re a few hundred short this month. There\'s a payday loan place right outside the gate — "1st Choice Military Loans." The sign says 30% APR but the Marines in line don\'t seem to care. Your buddy already owes them $2,000.',
    choices: [
      {
        text: 'Use the loan — just this once.',
        hint: 'Quick cash, but predatory interest piles up fast',
        effects: { savings: 400, debt: 600, stress: 6 },
      },
      {
        text: 'Call family back home and ask for a temporary loan.',
        hint: '-FamilyStability slightly, but far better interest rate',
        effects: { savings: 400, familyStability: -4, stress: 3 },
      },
      {
        text: 'Go to Marine Relief Society for an interest-free loan.',
        hint: 'Best option — MRS exists for exactly this',
        effects: { savings: 400, stress: -2, networkStrength: 3 },
      },
    ],
  },

  {
    id: 'evt_barracks_inspection',
    category: 'discipline',
    title: 'Barracks Inspection — Failed',
    weight: 8,
    trigger: { maxTIS: 24 },
    narrative: 'Your room failed barracks inspection. The GySgt is furious. You now have mandatory field day every night this week, and your name is on the 1stSgt\'s board. It\'s embarrassing but fixable.',
    choices: [
      {
        text: 'Own it completely. Clean, square away, and move on.',
        hint: '+ProCon recovery, -Stress eventually',
        effects: { profConduct: -3, stress: 5, disciplineRisk: -3, reputationWithLeadership: 2 },
      },
      {
        text: 'Make excuses. Blame your roommate.',
        hint: 'Worsens perception with leadership',
        effects: { profConduct: -6, reputationWithLeadership: -8, disciplineRisk: 8, stress: 7 },
      },
    ],
  },

  {
    id: 'evt_underage_drinking',
    category: 'discipline',
    title: 'Barracks Party Gets Out of Hand',
    weight: 9,
    trigger: { maxTIS: 30, maxDiscipline: 75 },
    narrative: 'Someone in the barracks is throwing a room party. The beer is flowing, the music is loud, and PMO is going to get called eventually. You\'re 20, a few guys are 18, and your NCO\'s room is at the end of the hall.',
    choices: [
      {
        text: 'Stay and enjoy it — you\'re a Marine, you\'re fine.',
        hint: '+Morale, high NJP risk',
        effects: { morale: 6, disciplineRisk: 15 },
        njpRisk: 0.3,
      },
      {
        text: 'Go, but don\'t drink. Stay aware.',
        hint: 'Social points, minimal legal risk',
        effects: { morale: 3, networkStrength: 3, disciplineRisk: 4 },
      },
      {
        text: 'Shut it down or leave before it escalates.',
        hint: '+ProCon, -Morale (party pooper), +Reputation',
        effects: { profConduct: 3, morale: -4, reputationWithLeadership: 4, disciplineRisk: -5 },
      },
    ],
  },

  {
    id: 'evt_first_promotion_board',
    category: 'career',
    title: 'Preparing for Your First Promotion Board',
    weight: 7,
    trigger: { minTIS: 18, maxTIS: 30 },
    narrative: 'The promotion board for Corporal is coming up. Your section chief says your cutting score is on the edge. You have a few weeks to prepare — PT, knowledge, uniform, and networking all matter.',
    choices: [
      {
        text: 'Full prep mode — PT, knowledge, uniform, everything.',
        hint: '+Promotion score, ++Stress short-term',
        effects: { physicalFitness: 5, profConduct: 4, stress: 8, mosProficiency: 4 },
      },
      {
        text: 'Study the professional knowledge and refine your uniform.',
        hint: '+ProCon, moderate effort',
        effects: { profConduct: 3, mosProficiency: 3, stress: 4 },
      },
      {
        text: 'Let your record speak for itself. Stay relaxed.',
        hint: 'No boost — natural baseline',
        effects: { stress: -2 },
      },
    ],
  },

  {
    id: 'evt_tattoo',
    category: 'personal',
    title: 'Ink or No Ink?',
    weight: 6,
    trigger: { maxTIS: 36 },
    narrative: 'Half the Marines in your section have tattoos. There\'s a shop in town running a deal. You\'ve been thinking about it for months. Marine Corps tattoo policy has gotten stricter — hands, neck, and face are off-limits. Visible tattoos above the collar can affect recruiting duty eligibility and some schools.',
    choices: [
      {
        text: 'Get a tattoo somewhere that stays within regs.',
        hint: '+Morale, no career impact if placement is correct',
        effects: { morale: 6, savings: -150 },
      },
      {
        text: 'Skip it. Keep all options open.',
        hint: 'No effect — preserves full eligibility',
        effects: {},
      },
      {
        text: 'Get a tattoo in a visible location — neck piece.',
        hint: '+Morale, -Career eligibility for some billets/schools',
        effects: { morale: 8, reputationWithLeadership: -5, savings: -200, disciplineRisk: 5 },
      },
    ],
  },

  // ══════════════════ LEADERSHIP — GOOD ══════════════════
  {
    id: 'evt_nco_of_the_quarter',
    category: 'career',
    title: 'NCO of the Quarter Board',
    weight: 6,
    trigger: { minTIS: 24, minProfConduct: 70 },
    narrative: 'Your SSgt nominated you for NCO of the Quarter. The board evaluates your uniform, military bearing, knowledge, and leadership potential. This is the kind of visibility that shapes careers.',
    choices: [
      {
        text: 'Prepare thoroughly. Treat it like a promotion board.',
        hint: '++ProCon, ++Reputation on success',
        effects: { profConduct: 5, reputationWithLeadership: 8, stress: 6, mosProficiency: 3 },
        awardChance: 0.65,
      },
      {
        text: 'Show up, do your best, see what happens.',
        hint: '+Reputation either way — it\'s an honor to be nominated',
        effects: { profConduct: 2, reputationWithLeadership: 4, stress: 2 },
        awardChance: 0.35,
      },
    ],
  },

  {
    id: 'evt_co_letter_appreciation',
    category: 'career',
    title: 'Letter of Appreciation from CO',
    weight: 5,
    trigger: { minProfConduct: 72, minTIS: 12 },
    narrative: 'Your Commanding Officer personally writes you a Letter of Appreciation for your performance during a major training event. It goes in your service record. This is the kind of document that boards see.',
    choices: [
      {
        text: 'Thank the CO professionally and keep pushing.',
        hint: '+ProCon, +Reputation — it\'s already in your record',
        effects: { profConduct: 4, reputationWithLeadership: 6, morale: 8 },
        awardChance: 1.0,
      },
    ],
    autoResolve: true,
    awardChance: 1.0,
  },

  {
    id: 'evt_mentor_junior_marine',
    category: 'career',
    title: 'A Junior Marine is Struggling',
    weight: 9,
    trigger: { minTIS: 18, minPhysical: 55 },
    narrative: 'There\'s a new Private in your section who is clearly overwhelmed — not performing well at PT, struggling with the culture, homesick. Your GySgt asks you to take him under your wing. How you handle this reflects on your leadership.',
    choices: [
      {
        text: 'Invest real time and effort into mentoring him.',
        hint: '+MOS Prof (teaching reinforces learning), +Reputation, +Morale',
        effects: { mosProficiency: 4, reputationWithLeadership: 7, morale: 5, stress: 3 },
      },
      {
        text: 'Give him the resources and let him figure it out.',
        hint: 'Balanced approach — modest positive',
        effects: { reputationWithLeadership: 3, morale: 2 },
      },
      {
        text: 'Report him to the GySgt as unfit. Some Marines don\'t belong.',
        hint: 'Harsh — damages your leadership reputation',
        effects: { reputationWithLeadership: -6, morale: -3, profConduct: -2 },
      },
    ],
  },

  {
    id: 'evt_snco_special_project',
    category: 'career',
    title: 'Selected for High-Visibility Project',
    weight: 6,
    trigger: { minProfConduct: 65, minTIS: 12 },
    narrative: 'The battalion SgtMaj needs a sharp NCO to help run a major battalion-level event — all hands, visiting general, the works. Your SSgt put your name in. It\'s extra work but everyone at battalion will know your name when it\'s done.',
    choices: [
      {
        text: 'Accept and execute flawlessly.',
        hint: '++NetworkStrength, +Reputation at battalion level',
        effects: { networkStrength: 10, reputationWithLeadership: 10, stress: 8, profConduct: 4 },
      },
      {
        text: 'Accept but manage expectations about your workload.',
        hint: '+Reputation, less stress',
        effects: { networkStrength: 5, reputationWithLeadership: 6, stress: 4 },
      },
      {
        text: 'Decline — your platoon needs you right now.',
        hint: '-Reputation with SgtMaj, +Unit loyalty',
        effects: { reputationWithLeadership: -4, morale: 3, stress: -3 },
      },
    ],
  },

  // ══════════════════ LEADERSHIP — BAD ══════════════════
  {
    id: 'evt_credit_stolen',
    category: 'career',
    title: 'Your Work, Someone Else\'s Credit',
    weight: 9,
    trigger: { minTIS: 12 },
    narrative: 'Your SSgt submitted a training brief you wrote under his own name to battalion. It got praised. He got a coin from the S3. You got nothing — and when you brought it up privately, he told you to "stay in your lane." Your fellow NCOs all know what happened.',
    choices: [
      {
        text: 'Document it and report it to the XO.',
        hint: 'Risk/reward — may help or escalate against you',
        effects: { stress: 8, reputationWithLeadership: -4, morale: -4, disciplineRisk: 4 },
      },
      {
        text: 'Let it go, but make sure the next project is undeniably yours.',
        hint: '-Morale short-term, smart long play',
        effects: { morale: -6, stress: 5, mosProficiency: 3, networkStrength: 2 },
      },
      {
        text: 'Call him out publicly in front of the NCO section.',
        hint: 'Satisfying but professionally dangerous',
        effects: { morale: 3, reputationWithLeadership: -10, disciplineRisk: 10, stress: 6 },
      },
    ],
  },

  {
    id: 'evt_leadership_friction',
    category: 'career',
    title: 'Caught Between Your Sergeant and GySgt',
    weight: 8,
    trigger: { minTIS: 12 },
    narrative: 'Your Sergeant and GySgt have an ongoing feud. You\'re in the middle — getting contradictory orders, being used as a messenger, and watching unit morale crater around you. You have to navigate this carefully.',
    choices: [
      {
        text: 'Stay strictly neutral. Execute both orders to the letter.',
        hint: '+ProCon, stressful, smart',
        effects: { stress: 10, profConduct: 3, morale: -3, reputationWithLeadership: 2 },
      },
      {
        text: 'Privately approach the GySgt to address the situation.',
        hint: '+Reputation with GySgt, risk if Sergeant finds out',
        effects: { reputationWithLeadership: 5, stress: 5, disciplineRisk: 4 },
      },
      {
        text: 'Talk to your peers. At least you\'re not alone.',
        hint: '-Discipline risk (gossip), +Morale temporarily',
        effects: { morale: 4, disciplineRisk: 5, networkStrength: 3, stress: 3 },
      },
    ],
  },

  {
    id: 'evt_zero_defect_culture',
    category: 'career',
    title: 'Zero-Defect Command Climate',
    weight: 8,
    trigger: { minTIS: 6 },
    narrative: 'The new CO runs a zero-defect unit — one mistake and your career is over, according to him. Marines are terrified to make decisions, nobody volunteers for anything, and the best NCOs are putting in EAS packages. The culture is eating the unit from the inside.',
    choices: [
      {
        text: 'Keep your head down and stay off the radar.',
        hint: '+Discipline security, -Morale, -Career growth',
        effects: { disciplineRisk: -5, morale: -8, reputationWithLeadership: -4, mosProficiency: -3 },
      },
      {
        text: 'Continue operating with integrity — do the right thing.',
        hint: '+ProCon, +Morale, some risk of exposure',
        effects: { profConduct: 3, morale: 4, stress: 6, reputationWithLeadership: 3 },
      },
      {
        text: 'Submit command climate survey feedback honestly.',
        hint: '+Integrity, anonymous but some risk',
        effects: { profConduct: 4, reputationWithLeadership: 2, stress: 4 },
      },
    ],
  },

  {
    id: 'evt_illegal_order',
    category: 'career',
    title: 'Questionable Order from Leadership',
    weight: 4,
    trigger: { minTIS: 12 },
    narrative: 'Your SSgt tells you to document a Marine\'s hours differently than they actually occurred — to make the unit\'s training metrics look better for the battalion CO\'s review. It\'s a small thing, but it\'s falsification of records. He says everyone does it.',
    choices: [
      {
        text: 'Refuse. You won\'t sign off on false records.',
        hint: '+ProCon integrity, -Reputation with SSgt, risk',
        effects: { profConduct: 6, reputationWithLeadership: -8, stress: 8, disciplineRisk: 5 },
      },
      {
        text: 'Do it but document your objection in writing to the SgtMaj.',
        hint: 'Protects yourself while flagging the problem',
        effects: { profConduct: 2, reputationWithLeadership: -3, stress: 6, networkStrength: 3 },
      },
      {
        text: 'Do it. You need this SSgt on your side.',
        hint: '-Integrity, if discovered it\'s your career',
        effects: { profConduct: -8, disciplineRisk: 12, reputationWithLeadership: 3, stress: 5 },
      },
    ],
  },

  {
    id: 'evt_favoritism',
    category: 'career',
    title: 'Senior NCO Playing Favorites',
    weight: 8,
    trigger: { minTIS: 6 },
    narrative: 'Your GySgt consistently gives the plum assignments, school seats, and positive evaluations to one Marine in your section — who also happens to be from the same hometown. You\'re performing better by every metric. It\'s visible to everyone.',
    choices: [
      {
        text: 'Work harder. Let performance be undeniable.',
        hint: '+MOS Prof, +ProCon, takes longer but respectable',
        effects: { mosProficiency: 6, profConduct: 3, stress: 6, morale: -4 },
      },
      {
        text: 'Request a conversation with the GySgt about advancement.',
        hint: 'Assertive — may help or backfire',
        effects: { reputationWithLeadership: 3, stress: 5, morale: 3 },
      },
      {
        text: 'Go directly to the First Sergeant.',
        hint: '+Integrity, significant political risk',
        effects: { reputationWithLeadership: -6, stress: 8, profConduct: 2, disciplineRisk: 5 },
      },
    ],
  },

  // ══════════════════ JUNIOR MARINE CONFLICTS ══════════════════
  {
    id: 'evt_junior_failing_pt',
    category: 'unit',
    title: 'One of Your Marines Can\'t Pass PT',
    weight: 8,
    trigger: { minTIS: 24, minPhysical: 55 },
    narrative: 'A Marine in your charge has failed two consecutive PFTs. He\'s a good Marine in every other way — sharp, motivated, technically proficient — but his run time is keeping him from promotion. You\'re responsible for his development.',
    choices: [
      {
        text: 'Build a personalized remedial PT plan and run it yourself.',
        hint: '+MOS Prof (leadership), +Reputation, +Morale for the section',
        effects: { mosProficiency: 3, reputationWithLeadership: 5, morale: 4, stress: 4 },
      },
      {
        text: 'Assign a peer NCO to run his program.',
        hint: 'Adequate — delegating is leadership too',
        effects: { reputationWithLeadership: 2, stress: 1 },
      },
      {
        text: 'Initiate admin separation process. The Corps sets the standard.',
        hint: 'Hard but sometimes necessary — reputation impact varies',
        effects: { reputationWithLeadership: -3, morale: -5, profConduct: 2 },
      },
    ],
  },

  {
    id: 'evt_junior_drug_use',
    category: 'discipline',
    title: 'Suspected Drug Use in Your Section',
    weight: 5,
    trigger: { minTIS: 18 },
    narrative: 'You find evidence suggesting a junior Marine in your section may be using drugs — dilated pupils, erratic behavior, something in his room. You\'re not certain. But you\'re his NCO. What you do next defines your leadership.',
    choices: [
      {
        text: 'Report your suspicion to the SSgt immediately.',
        hint: '+ProCon, +Reputation — this is your duty',
        effects: { profConduct: 5, reputationWithLeadership: 6, stress: 4, morale: -2 },
      },
      {
        text: 'Confront the Marine directly first. Give him a chance.',
        hint: 'Compassionate — risky if he doesn\'t respond',
        effects: { reputationWithLeadership: 2, stress: 5, morale: 2, disciplineRisk: 4 },
      },
      {
        text: 'Stay out of it. You\'re not sure enough to act.',
        hint: '-ProCon if it surfaces later, -Reputation',
        effects: { profConduct: -5, reputationWithLeadership: -5, disciplineRisk: 8 },
      },
    ],
  },

  {
    id: 'evt_bullying_in_section',
    category: 'unit',
    title: 'Hazing in the Barracks',
    weight: 6,
    trigger: { minTIS: 12 },
    narrative: 'You learn that a new Private in your platoon is being hazed — made to do degrading things, personal items stolen, locked out of his room at night. The guys doing it see it as "tradition." The Private hasn\'t reported it. But he\'s shutting down.',
    choices: [
      {
        text: 'Intervene immediately. Address it with the NCOs involved and your SSgt.',
        hint: '+ProCon, +Reputation, some social friction',
        effects: { profConduct: 6, reputationWithLeadership: 7, stress: 6, morale: -3, networkStrength: -2 },
      },
      {
        text: 'Counsel the private privately and monitor the situation.',
        hint: 'Moderate — not fully addressing it',
        effects: { profConduct: 2, reputationWithLeadership: 2, stress: 3 },
      },
      {
        text: 'Stay out of it. It\'s not your platoon\'s business.',
        hint: '-ProCon heavily if CO finds out later',
        effects: { profConduct: -7, reputationWithLeadership: -8, disciplineRisk: 8 },
      },
    ],
  },

  // ══════════════════ CONFLICTS WITH PEERS / SENIORS ══════════════════
  {
    id: 'evt_peer_throws_under_bus',
    category: 'career',
    title: 'Peer NCO Throws You Under the Bus',
    weight: 8,
    trigger: { minTIS: 18 },
    narrative: 'A fellow NCO blamed you for a training shortfall at the SNCOs\' call — in front of the GySgt. The failure wasn\'t yours, and everyone in the section knows it. But the GySgt has already noted it.',
    choices: [
      {
        text: 'Present the facts to the GySgt calmly, with documentation.',
        hint: '+ProCon recovery, +Reputation for professionalism',
        effects: { profConduct: 3, reputationWithLeadership: 5, stress: 7, morale: -3 },
      },
      {
        text: 'Let it go publicly. Handle it with your peer directly.',
        hint: '-Short-term rep, builds long-term trust',
        effects: { stress: 8, morale: -5, networkStrength: -3, profConduct: -2 },
      },
      {
        text: 'Retaliate — return the favor at the next opportunity.',
        hint: 'Toxic escalation — career risk',
        effects: { disciplineRisk: 10, reputationWithLeadership: -8, morale: 2, stress: 6 },
      },
    ],
  },

  {
    id: 'evt_disagreement_with_ssgt',
    category: 'career',
    title: 'You Disagree With Your SSgt\'s Approach',
    weight: 9,
    trigger: { minTIS: 24 },
    narrative: 'Your SSgt has a training plan for next week that you believe is tactically unsound and will cost you valuable range time. You\'ve done this before. He hasn\'t. But he outranks you and isn\'t asking for your opinion.',
    choices: [
      {
        text: 'Respectfully present an alternative in private.',
        hint: '+Reputation if he listens, slight risk if he doesn\'t',
        effects: { reputationWithLeadership: 3, mosProficiency: 3, stress: 4 },
      },
      {
        text: 'Execute the plan as ordered. He\'s the SSgt.',
        hint: '+Obedience, -MOS morale, safe choice',
        effects: { profConduct: 2, mosProficiency: -2, morale: -3 },
      },
      {
        text: 'Voice your concerns at the section leaders\' meeting.',
        hint: '+MOS credibility, SSgt may see as insubordinate',
        effects: { mosProficiency: 4, reputationWithLeadership: -4, stress: 5, disciplineRisk: 4 },
      },
    ],
  },

  // ══════════════════ FAMILY CONFLICTS ══════════════════
  {
    id: 'evt_spouse_pcs_ultimatum',
    category: 'personal',
    title: 'Spouse Ultimatum Before Next PCS',
    weight: 7,
    trigger: { isMarried: true, minTIS: 24 },
    narrative: 'PCS orders are coming up and your spouse has drawn a line: "Not 29 Palms. Not Okinawa. I need a real assignment." The Marine Corps doesn\'t negotiate. You have some influence over orders but not total control.',
    choices: [
      {
        text: 'Request preferred duty station through your assignment monitor.',
        hint: 'Attempt to accommodate — no guarantee',
        effects: { familyStability: 8, stress: 5, networkStrength: 3 },
      },
      {
        text: 'Explain the reality of Marine Corps orders and work through it together.',
        hint: '+FamilyStability long-term — honest communication',
        effects: { familyStability: 5, morale: 3, stress: 4 },
      },
      {
        text: 'Promise you\'ll get the orders changed — even if you\'re not sure.',
        hint: 'Short-term fix, creates expectation that may not be met',
        effects: { familyStability: 6, stress: 6, morale: 2 },
      },
    ],
  },

  {
    id: 'evt_long_distance_breakup',
    category: 'personal',
    title: 'Relationship Falling Apart',
    weight: 8,
    trigger: { minTIS: 6, maxTIS: 36 },
    narrative: 'The person you were with before you shipped has been drifting. The calls get shorter. The texts get fewer. Being in the Corps is hard on relationships — especially when you\'re stationed across the country or deployed. They just sent you a message that it\'s over.',
    choices: [
      {
        text: 'Accept it. Focus on the mission and your Marines.',
        hint: '-FamilyStability, -Morale short-term, +Focus',
        effects: { familyStability: -10, morale: -8, stress: 6, mosProficiency: 3 },
      },
      {
        text: 'Fight for the relationship. Request emergency leave.',
        hint: 'May or may not work, -Reputation short-term',
        effects: { familyStability: 5, morale: 2, stress: 8, reputationWithLeadership: -3 },
      },
      {
        text: 'Lean on your NCOs and close friends in the unit.',
        hint: '+NetworkStrength, -Morale offset',
        effects: { networkStrength: 5, morale: -4, stress: 3, familyStability: -5 },
      },
    ],
  },

  {
    id: 'evt_sibling_crisis',
    category: 'personal',
    title: 'Family Crisis Back Home',
    weight: 7,
    trigger: { minTIS: 6 },
    narrative: 'A call from your mom — your sibling is in serious trouble. Legal issues, addiction, maybe both. You\'re thousands of miles away, possibly deployed. You can send money, call in favors, or request emergency leave. But your unit needs you too.',
    choices: [
      {
        text: 'Send money and connect them with professional resources.',
        hint: '-Savings, +FamilyStability, shows commitment',
        effects: { familyStability: 8, savings: -1000, stress: 8, morale: -3 },
      },
      {
        text: 'Request compassionate leave through your CO.',
        hint: 'Goes home briefly — morale restored, -Career perception',
        effects: { familyStability: 12, morale: 5, stress: -4, reputationWithLeadership: -4 },
      },
      {
        text: 'Call regularly but stay in place. Your unit depends on you.',
        hint: '+Reputation, -FamilyStability',
        effects: { reputationWithLeadership: 3, familyStability: -5, stress: 7, morale: -4 },
      },
    ],
  },

  {
    id: 'evt_divorce',
    category: 'personal',
    title: 'Marriage Breaking Down',
    weight: 5,
    trigger: { isMarried: true, minTIS: 24 },
    narrative: 'The conversations have gotten shorter. The fights longer. Your spouse says they need a break, maybe more than that. Military divorce is complicated — BAH changes, custody, legal fees. Some Marines make it work. A lot don\'t.',
    choices: [
      {
        text: 'Seek marital counseling. Fight for the marriage.',
        hint: '+FamilyStability, effort required',
        effects: { familyStability: 10, stress: 6, morale: 4, savings: -500 },
      },
      {
        text: 'Agree to separate. Handle it with dignity and fairness.',
        hint: '-FamilyStability, but minimizes long-term damage',
        effects: { familyStability: -20, morale: -10, stress: 12, savings: -2000, debt: 3000 },
        setMarried: false,
      },
      {
        text: 'Throw yourself into work. Avoid the problem.',
        hint: 'Short-term cope — accelerates breakdown',
        effects: { familyStability: -12, mosProficiency: 4, stress: 10, morale: -8 },
      },
    ],
  },

  {
    id: 'evt_parents_dont_get_it',
    category: 'personal',
    title: 'Family Back Home Doesn\'t Understand',
    weight: 7,
    trigger: { minTIS: 6 },
    narrative: 'Your parents call and ask when you\'re "getting a real job." They don\'t understand the career, the culture, or why you signed up for another term. It\'s a small thing, but it stings — and you\'re already stressed from work.',
    choices: [
      {
        text: 'Patiently explain your career path and what the Corps means to you.',
        hint: '+FamilyStability long-term, +Morale',
        effects: { familyStability: 5, morale: 4, stress: 2 },
      },
      {
        text: 'Shrug it off. They\'ll come around when they see your progression.',
        hint: 'No change — compartmentalize',
        effects: { stress: 2, morale: -2 },
      },
      {
        text: 'Vent frustration to your closest buddy in the unit.',
        hint: '+NetworkStrength, releases stress',
        effects: { networkStrength: 4, stress: -4, morale: 2 },
      },
    ],
  },

  // ══════════════════ MENTAL HEALTH & WELLBEING ══════════════════
  {
    id: 'evt_mental_health_check',
    category: 'personal',
    title: 'Signs of Burnout',
    weight: 7,
    trigger: { minTIS: 24 },
    narrative: 'You\'re not sleeping well. Irritable at work, checked out at home. Small things set you off. A corpsman you respect pulls you aside and says: "Hey, I see you struggling. There\'s no shame in getting help." The Corps has resources — but there\'s still a stigma.',
    choices: [
      {
        text: 'Schedule an appointment. Mental health is physical health.',
        hint: '-Stress significantly, +Morale, no career impact',
        effects: { stress: -15, morale: 10, familyStability: 5, reputationWithLeadership: 2 },
      },
      {
        text: 'Thank him but handle it yourself — PT, diet, sleep.',
        hint: '-Stress moderately, takes longer',
        effects: { stress: -6, morale: 3, physicalFitness: 4 },
      },
      {
        text: 'Push through. Weakness isn\'t an option.',
        hint: 'Stress continues accumulating',
        effects: { stress: 4, morale: -5, disciplineRisk: 5, physicalFitness: -3 },
      },
    ],
  },

  {
    id: 'evt_buddy_struggling',
    category: 'personal',
    title: 'Your Best Friend in the Unit is in a Dark Place',
    weight: 6,
    trigger: { minTIS: 12 },
    narrative: 'Your closest friend in the unit — the guy who had your back on every deployment — has been acting differently. Withdrawn, angry, drinking too much. He made a comment last night that you can\'t unhear. You know what it might mean.',
    choices: [
      {
        text: 'Have an honest, direct conversation with him tonight.',
        hint: '+NetworkStrength, you might save a life',
        effects: { networkStrength: 8, morale: 3, stress: 8, familyStability: 2 },
      },
      {
        text: 'Report your concern to the chaplain and corpsman.',
        hint: 'Gets professionals involved — right call',
        effects: { profConduct: 4, reputationWithLeadership: 5, stress: 5, morale: 2 },
      },
      {
        text: 'Give him space. Maybe he just needs time.',
        hint: 'High risk of doing nothing — regret likely',
        effects: { stress: 6, morale: -8, disciplineRisk: 3 },
      },
    ],
  },

  // ══════════════════ DEBT ESCALATION ══════════════════
  {
    id: 'evt_debt_notice',
    category: 'finance',
    title: 'Past-Due Notice in Your Mailbox',
    weight: 9,
    trigger: { minDebt: 2000, notDeployed: true },
    narrative: 'A past-due notice from a creditor showed up in your mailbox. You\'ve been making minimum payments when you can, but the balance isn\'t going down — it\'s going up. Interest compounds every month you let it slide. This is how the hole gets deeper.',
    choices: [
      {
        text: 'Tighten the budget. Throw cash at the debt now.',
        hint: '-Savings, -Debt significantly, -Stress long-term',
        effects: { savings: -1000, debt: -1500, stress: -5, morale: -3 },
      },
      {
        text: 'Minimum payment. Handle it next month.',
        hint: 'Interest keeps compounding. Hole keeps deepening.',
        effects: { stress: 8, morale: -5 },
      },
    ],
  },

  {
    id: 'evt_debt_collector_call',
    category: 'finance',
    title: 'Debt Collectors Are Calling',
    weight: 7,
    trigger: { minDebt: 5000, notDeployed: true },
    narrative: 'Your phone rings at 0630. Not the duty NCO — a collections agency. Third call this week. Your SNCO pulled you aside after formation: "I don\'t know what\'s going on with you, but fix it. Leadership notices everything." Financial trouble follows you to work.',
    choices: [
      {
        text: 'Set up a formal payment plan. Get in front of it.',
        hint: '-Savings, -Debt, stabilizes situation with leadership',
        effects: { savings: -800, debt: -1200, stress: -8, reputationWithLeadership: 4 },
      },
      {
        text: 'Block the numbers. Fake it until you make it.',
        hint: 'Debt and stress spiral. Leadership trust erodes.',
        effects: { stress: 14, morale: -10, disciplineRisk: 6, reputationWithLeadership: -6 },
      },
    ],
  },

  {
    id: 'evt_debt_command_flag',
    category: 'discipline',
    title: 'Command Financial Review',
    weight: 5,
    trigger: { minDebt: 10000, notDeployed: true },
    narrative: 'Finance flagged your account. Your CO knows. Debt at this level is a security clearance concern and a reflection on unit readiness. You\'re standing in front of your First Sergeant. There is no good answer — only better and worse ones.',
    choices: [
      {
        text: 'Full transparency. Present a written debt reduction plan.',
        hint: 'Humbling. Builds trust back. Shows character.',
        effects: { profConduct: -4, reputationWithLeadership: 5, stress: -12, disciplineRisk: -8 },
      },
      {
        text: 'Minimize it. Tell them it\'s already handled.',
        hint: 'Buys time — but lying to your First Sergeant has a cost.',
        effects: { disciplineRisk: 18, stress: 10, reputationWithLeadership: -12, profConduct: -5 },
      },
    ],
  },

];
