/* ═══════════════════════════════════════════════
   RANDOM EVENTS DATA
   Each event: id, category, title, weight, trigger conditions,
   narrative text, and choices (each choice has effects)
   ═══════════════════════════════════════════════ */

const EVENTS_DATA = [

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
        logEntry: 'Deployed on MEU.',
      },
      {
        text: 'Request a hold for personal/family reasons (if eligible).',
        hint: 'Avoids deployment — may hurt career standing',
        effects: { stress: -5, familyStability: 5, profConduct: -3, reputationWithLeadership: -8, morale: -5 },
        logEntry: 'Held back from MEU deployment.',
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
        logEntry: 'Combat deployment.',
        combatAwardChance: 0.3,
      },
      {
        text: 'Do your job, stay focused, come home safe.',
        hint: '+Proficiency, +ProCon, ++Stress',
        effects: { mosProficiency: 6, profConduct: 3, stress: 15, familyStability: -12, reputationWithLeadership: 5 },
        logEntry: 'Combat deployment — steady.',
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
        logEntry: 'Meritorious promotion submitted.',
        meritoriousPromo: true,
      },
      {
        text: 'Decline — I\'ll earn it through normal channels.',
        hint: 'No early promotion but shows humility (unusual choice)',
        effects: { profConduct: 2, morale: 3 },
        logEntry: 'Declined meritorious promotion.',
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
        logEntry: 'Applied for school seat.',
        triggerSchoolSelect: true,
      },
      {
        text: 'Pass this time — better opportunities may come.',
        hint: 'No immediate effect',
        effects: {},
        logEntry: 'Passed on school opportunity.',
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
        logEntry: 'Gained a senior mentor.',
      },
      {
        text: 'Politely acknowledge but stay focused on your own path.',
        hint: 'Neutral — mild relationship building',
        effects: { networkStrength: 3, reputationWithLeadership: 2 },
        logEntry: 'Acknowledged senior NCO interest.',
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
        logEntry: 'Filed IG complaint against toxic leader.',
      },
      {
        text: 'Tough it out. Drive on and protect your Marines.',
        hint: '+Stress but shows resilience',
        effects: { stress: 10, morale: -5, profConduct: 2, reputationWithLeadership: 3 },
        logEntry: 'Endured difficult leadership situation.',
      },
      {
        text: 'Request a lateral move or PCS out of the unit.',
        hint: 'Avoids the situation but may look like running',
        effects: { stress: -8, morale: 3, reputationWithLeadership: -3 },
        logEntry: 'Requested transfer away from toxic leadership.',
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
        logEntry: 'NAM nomination in progress.',
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
        logEntry: 'Got married.',
        setMarried: true,
        bahIncrease: true,
      },
      {
        text: 'Wait until the timing is better — maybe after this next deployment.',
        hint: 'No immediate change',
        effects: { familyStability: -3, morale: -3 },
        logEntry: 'Delayed marriage decision.',
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
        logEntry: 'New baby — family growing.',
        addChild: true,
        expenseIncrease: 400,
      },
      {
        text: 'Lean into the support network. Connect with the family readiness officer.',
        hint: '+FamilyStability, -Stress vs solo approach',
        effects: { familyStability: 15, stress: 3, morale: 8, networkStrength: 3 },
        logEntry: 'New baby — tapping support resources.',
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
        logEntry: 'Supported family through deployment hardship.',
      },
      {
        text: 'Get your spouse connected with the FRO and support networks on base.',
        hint: '+FamilyStability over time',
        effects: { familyStability: 5, networkStrength: 3 },
        logEntry: 'Connected family with base support resources.',
      },
      {
        text: 'Request emergency leave through Red Cross.',
        hint: 'Goes home briefly — may affect profConduct and reputation',
        effects: { familyStability: 15, morale: 8, profConduct: -3, reputationWithLeadership: -5 },
        logEntry: 'Emergency leave for family situation.',
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
        logEntry: 'Paid for car repairs out of pocket.',
      },
      {
        text: 'Finance the repairs. Keep cash liquid.',
        hint: '+Debt, +Stress long-term',
        effects: { debt: 1100, stress: 5 },
        logEntry: 'Financed car repairs.',
      },
      {
        text: 'Get a different (used) car. The old one is a money pit.',
        hint: '-Savings, potential debt, fresh start',
        effects: { savings: -2000, debt: 3000, stress: 5 },
        logEntry: 'Purchased a replacement vehicle.',
      },
      {
        text: 'Buy a new car. Fresh start, full warranty.',
        hint: 'Brand new vehicle — figure out the paperwork later',
        effects: { morale: 5, stress: -2 },
        logEntry: 'Signed papers for a new car.',
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
        logEntry: 'Lent money to a fellow Marine.',
        loanResolve: true,
      },
      {
        text: 'No — money and friends don\'t mix.',
        hint: 'Preserve savings, minor social friction',
        effects: { stress: 2 },
        logEntry: 'Declined to lend money.',
      },
      {
        text: 'Point him to the MCCS financial counseling center.',
        hint: '+NetworkStrength, saves you money',
        effects: { networkStrength: 2, morale: 2 },
        logEntry: 'Directed buddy to financial resources.',
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
        logEntry: 'Used SRB bonus to pay off debt.',
      },
      {
        text: 'Build an emergency fund (savings).',
        hint: '+Savings, stable foundation',
        effects: { savings: 5000, stress: -3 },
        logEntry: 'Invested SRB bonus into savings.',
      },
      {
        text: 'Spend it on experiences and gear. YOLO, this is the Marine Corps.',
        hint: '-Savings, +Morale short-term, regret long-term',
        effects: { morale: 8, savings: -2000, debt: 1000, stress: 5 },
        logEntry: 'Spent SRB bonus — living in the moment.',
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
        logEntry: 'Defused liberty incident.',
      },
      {
        text: 'Walk away. Not your fight.',
        hint: 'Avoids involvement but leaves buddy exposed',
        effects: { profConduct: -2, reputationWithLeadership: -3, stress: 4 },
        logEntry: 'Distanced from liberty incident.',
      },
      {
        text: 'Join the situation. Semper Fi, got your boy\'s back.',
        hint: 'High risk of NJP or worse',
        effects: { disciplineRisk: 20, profConduct: -10, reputationWithLeadership: -10 },
        logEntry: 'Involved in liberty altercation.',
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
        logEntry: 'Received NJP. Accepted punishment.',
      },
      {
        text: 'Request trial by court-martial (risky — may be worse).',
        hint: 'Gamble — outcome weighted by ProCon baseline',
        effects: { stress: 20 },
        logEntry: 'Requested court-martial in lieu of NJP.',
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
        logEntry: 'PFT failure — retesting next cycle.',
        ptRetestChance: 0.7,
      },
      {
        text: 'Accept the failure and note it. Focus on the CFT to compensate.',
        hint: '-ProCon, -Promo score',
        effects: { profConduct: -8, reputationWithLeadership: -5, stress: 6 },
        logEntry: 'PFT failure — noted on record.',
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
        logEntry: 'Led IG inspection prep.',
      },
      {
        text: 'Do the minimum required. It\'s an inspection, not combat.',
        hint: 'Neutral results',
        effects: { stress: 3 },
        logEntry: 'Got through IG inspection.',
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
        logEntry: 'Adapted to new leadership culture.',
      },
      {
        text: 'Push back through proper channels if policies seem unfair.',
        hint: 'May improve or hurt reputation depending on approach',
        effects: { reputationWithLeadership: -3, stress: 5, morale: 3 },
        logEntry: 'Questioned new leadership direction.',
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
        logEntry: 'Pushed through minor training injury.',
        injuryEscalateChance: 0.3,
      },
      {
        text: 'See the corpsman and get checked out.',
        hint: 'May be pulled from training, but protects long-term health',
        effects: { stress: 2, physicalFitness: -2, familyStability: 2 },
        logEntry: 'Sought medical attention for training injury.',
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
        logEntry: 'Applied for Recon indoc.',
        reconAttempt: true,
      },
      {
        text: 'Not the right time. Focus on the current career path.',
        hint: 'No change',
        effects: {},
        logEntry: 'Passed on Recon opportunity.',
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
        logEntry: 'Saved first paycheck responsibly.',
      },
      {
        text: 'Buy something nice. You earned it.',
        hint: '-Savings, +Morale short-term',
        effects: { savings: -800, morale: 8, debt: 500 },
        logEntry: 'Splurged on first payday.',
      },
      {
        text: 'Talk to the MCCS financial counselor first.',
        hint: '+Financial literacy, good foundation',
        effects: { savings: 300, civilianEmployability: 4, debt: -200 },
        logEntry: 'Got financial counseling early.',
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
        logEntry: 'Used off-base payday loan.',
      },
      {
        text: 'Call family back home and ask for a temporary loan.',
        hint: '-FamilyStability slightly, but far better interest rate',
        effects: { savings: 400, familyStability: -4, stress: 3 },
        logEntry: 'Borrowed from family rather than lender.',
      },
      {
        text: 'Go to Marine Relief Society for an interest-free loan.',
        hint: 'Best option — MRS exists for exactly this',
        effects: { savings: 400, stress: -2, networkStrength: 3 },
        logEntry: 'Used Marine Relief Society for emergency funds.',
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
        logEntry: 'Failed barracks inspection — corrected.',
      },
      {
        text: 'Make excuses. Blame your roommate.',
        hint: 'Worsens perception with leadership',
        effects: { profConduct: -6, reputationWithLeadership: -8, disciplineRisk: 8, stress: 7 },
        logEntry: 'Failed barracks inspection — deflected blame.',
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
        logEntry: 'Participated in unauthorized barracks party.',
        njpRisk: 0.3,
      },
      {
        text: 'Go, but don\'t drink. Stay aware.',
        hint: 'Social points, minimal legal risk',
        effects: { morale: 3, networkStrength: 3, disciplineRisk: 4 },
        logEntry: 'At barracks party — stayed smart.',
      },
      {
        text: 'Shut it down or leave before it escalates.',
        hint: '+ProCon, -Morale (party pooper), +Reputation',
        effects: { profConduct: 3, morale: -4, reputationWithLeadership: 4, disciplineRisk: -5 },
        logEntry: 'Left or stopped barracks party.',
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
        logEntry: 'Prepared intensively for promotion board.',
      },
      {
        text: 'Study the professional knowledge and refine your uniform.',
        hint: '+ProCon, moderate effort',
        effects: { profConduct: 3, mosProficiency: 3, stress: 4 },
        logEntry: 'Studied for promotion board.',
      },
      {
        text: 'Let your record speak for itself. Stay relaxed.',
        hint: 'No boost — natural baseline',
        effects: { stress: -2 },
        logEntry: 'Took a relaxed approach to promotion board.',
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
        logEntry: 'Got a tattoo within Marine Corps regulations.',
      },
      {
        text: 'Skip it. Keep all options open.',
        hint: 'No effect — preserves full eligibility',
        effects: {},
        logEntry: 'Decided against getting a tattoo.',
      },
      {
        text: 'Get a tattoo in a visible location — neck piece.',
        hint: '+Morale, -Career eligibility for some billets/schools',
        effects: { morale: 8, reputationWithLeadership: -5, savings: -200, disciplineRisk: 5 },
        logEntry: 'Got a visible tattoo — may limit future opportunities.',
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
        logEntry: 'Prepared for NCO of the Quarter board.',
        awardChance: 0.65,
      },
      {
        text: 'Show up, do your best, see what happens.',
        hint: '+Reputation either way — it\'s an honor to be nominated',
        effects: { profConduct: 2, reputationWithLeadership: 4, stress: 2 },
        logEntry: 'Participated in NCO of the Quarter board.',
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
        logEntry: 'Received Letter of Appreciation from CO.',
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
        logEntry: 'Mentored a struggling junior Marine.',
      },
      {
        text: 'Give him the resources and let him figure it out.',
        hint: 'Balanced approach — modest positive',
        effects: { reputationWithLeadership: 3, morale: 2 },
        logEntry: 'Supported junior Marine with resources.',
      },
      {
        text: 'Report him to the GySgt as unfit. Some Marines don\'t belong.',
        hint: 'Harsh — damages your leadership reputation',
        effects: { reputationWithLeadership: -6, morale: -3, profConduct: -2 },
        logEntry: 'Recommended admin action for junior Marine.',
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
        logEntry: 'Led high-visibility battalion project.',
      },
      {
        text: 'Accept but manage expectations about your workload.',
        hint: '+Reputation, less stress',
        effects: { networkStrength: 5, reputationWithLeadership: 6, stress: 4 },
        logEntry: 'Participated in battalion-level project.',
      },
      {
        text: 'Decline — your platoon needs you right now.',
        hint: '-Reputation with SgtMaj, +Unit loyalty',
        effects: { reputationWithLeadership: -4, morale: 3, stress: -3 },
        logEntry: 'Declined battalion project to focus on unit.',
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
        logEntry: 'Reported credit theft through proper channels.',
      },
      {
        text: 'Let it go, but make sure the next project is undeniably yours.',
        hint: '-Morale short-term, smart long play',
        effects: { morale: -6, stress: 5, mosProficiency: 3, networkStrength: 2 },
        logEntry: 'Moved past credit theft — focused on next opportunity.',
      },
      {
        text: 'Call him out publicly in front of the NCO section.',
        hint: 'Satisfying but professionally dangerous',
        effects: { morale: 3, reputationWithLeadership: -10, disciplineRisk: 10, stress: 6 },
        logEntry: 'Confronted SSgt publicly over stolen credit.',
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
        logEntry: 'Navigated leadership friction diplomatically.',
      },
      {
        text: 'Privately approach the GySgt to address the situation.',
        hint: '+Reputation with GySgt, risk if Sergeant finds out',
        effects: { reputationWithLeadership: 5, stress: 5, disciplineRisk: 4 },
        logEntry: 'Brought leadership conflict to GySgt\'s attention.',
      },
      {
        text: 'Talk to your peers. At least you\'re not alone.',
        hint: '-Discipline risk (gossip), +Morale temporarily',
        effects: { morale: 4, disciplineRisk: 5, networkStrength: 3, stress: 3 },
        logEntry: 'Shared frustrations about leadership with peers.',
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
        logEntry: 'Kept low profile during toxic command climate.',
      },
      {
        text: 'Continue operating with integrity — do the right thing.',
        hint: '+ProCon, +Morale, some risk of exposure',
        effects: { profConduct: 3, morale: 4, stress: 6, reputationWithLeadership: 3 },
        logEntry: 'Maintained standards despite toxic culture.',
      },
      {
        text: 'Submit command climate survey feedback honestly.',
        hint: '+Integrity, anonymous but some risk',
        effects: { profConduct: 4, reputationWithLeadership: 2, stress: 4 },
        logEntry: 'Submitted honest command climate survey.',
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
        logEntry: 'Refused order to falsify training records.',
      },
      {
        text: 'Do it but document your objection in writing to the SgtMaj.',
        hint: 'Protects yourself while flagging the problem',
        effects: { profConduct: 2, reputationWithLeadership: -3, stress: 6, networkStrength: 3 },
        logEntry: 'Complied under protest — escalated through proper channels.',
      },
      {
        text: 'Do it. You need this SSgt on your side.',
        hint: '-Integrity, if discovered it\'s your career',
        effects: { profConduct: -8, disciplineRisk: 12, reputationWithLeadership: 3, stress: 5 },
        logEntry: 'Falsified training records on SSgt\'s order.',
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
        logEntry: 'Responded to favoritism by outperforming.',
      },
      {
        text: 'Request a conversation with the GySgt about advancement.',
        hint: 'Assertive — may help or backfire',
        effects: { reputationWithLeadership: 3, stress: 5, morale: 3 },
        logEntry: 'Addressed advancement opportunities directly with GySgt.',
      },
      {
        text: 'Go directly to the First Sergeant.',
        hint: '+Integrity, significant political risk',
        effects: { reputationWithLeadership: -6, stress: 8, profConduct: 2, disciplineRisk: 5 },
        logEntry: 'Escalated favoritism concern to First Sergeant.',
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
        logEntry: 'Led remedial PT program for struggling Marine.',
      },
      {
        text: 'Assign a peer NCO to run his program.',
        hint: 'Adequate — delegating is leadership too',
        effects: { reputationWithLeadership: 2, stress: 1 },
        logEntry: 'Delegated remedial PT oversight.',
      },
      {
        text: 'Initiate admin separation process. The Corps sets the standard.',
        hint: 'Hard but sometimes necessary — reputation impact varies',
        effects: { reputationWithLeadership: -3, morale: -5, profConduct: 2 },
        logEntry: 'Initiated administrative action for PT failure.',
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
        logEntry: 'Reported suspected drug use through chain of command.',
      },
      {
        text: 'Confront the Marine directly first. Give him a chance.',
        hint: 'Compassionate — risky if he doesn\'t respond',
        effects: { reputationWithLeadership: 2, stress: 5, morale: 2, disciplineRisk: 4 },
        logEntry: 'Confronted Marine about suspected drug use directly.',
      },
      {
        text: 'Stay out of it. You\'re not sure enough to act.',
        hint: '-ProCon if it surfaces later, -Reputation',
        effects: { profConduct: -5, reputationWithLeadership: -5, disciplineRisk: 8 },
        logEntry: 'Ignored suspected drug use in section.',
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
        logEntry: 'Stopped hazing in the barracks.',
      },
      {
        text: 'Counsel the private privately and monitor the situation.',
        hint: 'Moderate — not fully addressing it',
        effects: { profConduct: 2, reputationWithLeadership: 2, stress: 3 },
        logEntry: 'Monitored hazing situation — counseled junior Marine.',
      },
      {
        text: 'Stay out of it. It\'s not your platoon\'s business.',
        hint: '-ProCon heavily if CO finds out later',
        effects: { profConduct: -7, reputationWithLeadership: -8, disciplineRisk: 8 },
        logEntry: 'Ignored hazing incident.',
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
        logEntry: 'Cleared name after being falsely blamed.',
      },
      {
        text: 'Let it go publicly. Handle it with your peer directly.',
        hint: '-Short-term rep, builds long-term trust',
        effects: { stress: 8, morale: -5, networkStrength: -3, profConduct: -2 },
        logEntry: 'Addressed peer conflict privately.',
      },
      {
        text: 'Retaliate — return the favor at the next opportunity.',
        hint: 'Toxic escalation — career risk',
        effects: { disciplineRisk: 10, reputationWithLeadership: -8, morale: 2, stress: 6 },
        logEntry: 'Retaliated against peer NCO.',
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
        logEntry: 'Proposed alternative training plan to SSgt.',
      },
      {
        text: 'Execute the plan as ordered. He\'s the SSgt.',
        hint: '+Obedience, -MOS morale, safe choice',
        effects: { profConduct: 2, mosProficiency: -2, morale: -3 },
        logEntry: 'Executed SSgt\'s training plan as ordered.',
      },
      {
        text: 'Voice your concerns at the section leaders\' meeting.',
        hint: '+MOS credibility, SSgt may see as insubordinate',
        effects: { mosProficiency: 4, reputationWithLeadership: -4, stress: 5, disciplineRisk: 4 },
        logEntry: 'Challenged SSgt\'s plan in front of section leaders.',
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
        logEntry: 'Requested preferred PCS location for family.',
      },
      {
        text: 'Explain the reality of Marine Corps orders and work through it together.',
        hint: '+FamilyStability long-term — honest communication',
        effects: { familyStability: 5, morale: 3, stress: 4 },
        logEntry: 'Had honest conversation with spouse about PCS reality.',
      },
      {
        text: 'Promise you\'ll get the orders changed — even if you\'re not sure.',
        hint: 'Short-term fix, creates expectation that may not be met',
        effects: { familyStability: 6, stress: 6, morale: 2 },
        logEntry: 'Promised spouse preferred PCS orders.',
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
        logEntry: 'Broke up — focused on the mission.',
      },
      {
        text: 'Fight for the relationship. Request emergency leave.',
        hint: 'May or may not work, -Reputation short-term',
        effects: { familyStability: 5, morale: 2, stress: 8, reputationWithLeadership: -3 },
        logEntry: 'Took emergency leave to address relationship.',
      },
      {
        text: 'Lean on your NCOs and close friends in the unit.',
        hint: '+NetworkStrength, -Morale offset',
        effects: { networkStrength: 5, morale: -4, stress: 3, familyStability: -5 },
        logEntry: 'Processed relationship loss with unit support.',
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
        logEntry: 'Supported family crisis with funds and resources.',
      },
      {
        text: 'Request compassionate leave through your CO.',
        hint: 'Goes home briefly — morale restored, -Career perception',
        effects: { familyStability: 12, morale: 5, stress: -4, reputationWithLeadership: -4 },
        logEntry: 'Took compassionate leave for family crisis.',
      },
      {
        text: 'Call regularly but stay in place. Your unit depends on you.',
        hint: '+Reputation, -FamilyStability',
        effects: { reputationWithLeadership: 3, familyStability: -5, stress: 7, morale: -4 },
        logEntry: 'Stayed with unit during family crisis.',
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
        logEntry: 'Sought marital counseling.',
      },
      {
        text: 'Agree to separate. Handle it with dignity and fairness.',
        hint: '-FamilyStability, but minimizes long-term damage',
        effects: { familyStability: -20, morale: -10, stress: 12, savings: -2000, debt: 3000 },
        logEntry: 'Began separation proceedings.',
        setMarried: false,
      },
      {
        text: 'Throw yourself into work. Avoid the problem.',
        hint: 'Short-term cope — accelerates breakdown',
        effects: { familyStability: -12, mosProficiency: 4, stress: 10, morale: -8 },
        logEntry: 'Avoided marriage issues by burying in work.',
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
        logEntry: 'Explained military career to family.',
      },
      {
        text: 'Shrug it off. They\'ll come around when they see your progression.',
        hint: 'No change — compartmentalize',
        effects: { stress: 2, morale: -2 },
        logEntry: 'Shrugged off family misunderstanding.',
      },
      {
        text: 'Vent frustration to your closest buddy in the unit.',
        hint: '+NetworkStrength, releases stress',
        effects: { networkStrength: 4, stress: -4, morale: 2 },
        logEntry: 'Vented about family to a trusted peer.',
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
        logEntry: 'Sought mental health support.',
      },
      {
        text: 'Thank him but handle it yourself — PT, diet, sleep.',
        hint: '-Stress moderately, takes longer',
        effects: { stress: -6, morale: 3, physicalFitness: 4 },
        logEntry: 'Managed burnout through self-care.',
      },
      {
        text: 'Push through. Weakness isn\'t an option.',
        hint: 'Stress continues accumulating',
        effects: { stress: 4, morale: -5, disciplineRisk: 5, physicalFitness: -3 },
        logEntry: 'Ignored burnout warning signs.',
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
        logEntry: 'Checked in on struggling buddy directly.',
      },
      {
        text: 'Report your concern to the chaplain and corpsman.',
        hint: 'Gets professionals involved — right call',
        effects: { profConduct: 4, reputationWithLeadership: 5, stress: 5, morale: 2 },
        logEntry: 'Reported buddy\'s mental health to chain of support.',
      },
      {
        text: 'Give him space. Maybe he just needs time.',
        hint: 'High risk of doing nothing — regret likely',
        effects: { stress: 6, morale: -8, disciplineRisk: 3 },
        logEntry: 'Gave struggling buddy space — hoped for the best.',
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
        logEntry: 'Paid down debt aggressively after past-due notice.',
      },
      {
        text: 'Minimum payment. Handle it next month.',
        hint: 'Interest keeps compounding. Hole keeps deepening.',
        effects: { stress: 8, morale: -5 },
        logEntry: 'Made minimum payment on overdue debt.',
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
        logEntry: 'Set up payment plan with collections agency.',
      },
      {
        text: 'Block the numbers. Fake it until you make it.',
        hint: 'Debt and stress spiral. Leadership trust erodes.',
        effects: { stress: 14, morale: -10, disciplineRisk: 6, reputationWithLeadership: -6 },
        logEntry: 'Avoided debt collectors — problem unresolved.',
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
        logEntry: 'Presented debt reduction plan to First Sergeant.',
      },
      {
        text: 'Minimize it. Tell them it\'s already handled.',
        hint: 'Buys time — but lying to your First Sergeant has a cost.',
        effects: { disciplineRisk: 18, stress: 10, reputationWithLeadership: -12, profConduct: -5 },
        logEntry: 'Downplayed financial trouble to command — bought time.',
      },
    ],
  },

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
        logEntry: 'Sought treatment for chronic knee pain.',
        setInjury: 'minor',
      },
      {
        text: 'Motrin and drive on. Pain is just weakness leaving the body.',
        hint: 'Classic grunt response — risk of escalation down the road',
        effects: { reputationWithLeadership: 3, stress: 3, physicalFitness: -4 },
        logEntry: 'Pushed through knee pain — declined medical evaluation.',
        injuryEscalateChance: 0.25,
      },
      {
        text: 'Start modifying your PT and investing in recovery seriously.',
        hint: '+Morale, protects long-term — smarter than you look',
        effects: { physicalFitness: 2, morale: 4, stress: -2 },
        logEntry: 'Started proactive injury prevention routine.',
      },
    ],
  },

  {
    id: 'evt_infantry_recruiter_offer',
    category: 'career',
    title: 'Recruiting Duty: You\'ve Been Selected',
    weight: 7,
    trigger: { mosField: 'infantry', minTIS: 36, maxTIS: 96 },
    narrative: 'Your GySgt pulls you in and delivers what he clearly thinks is good news: you\'ve been selected for recruiting duty consideration. Three years in a small town in Ohio, wearing your dress blues, convincing 18-year-olds to enlist. Guaranteed shore duty. Regular hours. A chance to "represent the Corps." Your buddy who did it came back with a Nissan Altima, a regional sales mindset, and a look in his eye.',
    choices: [
      {
        text: 'Accept it. Recruiting duty is a crucible that builds leadership.',
        hint: '+ProCon, +NetworkStrength, +CivilianEmployability — sales skills transfer',
        effects: { profConduct: 5, networkStrength: 8, civilianEmployability: 8, stress: -5, morale: 3 },
        logEntry: 'Accepted recruiting duty orders.',
      },
      {
        text: 'Volunteer to defer — you want one more deployment first.',
        hint: '+Morale, keeps you in the operational force',
        effects: { morale: 5, mosProficiency: 4, reputationWithLeadership: 2 },
        logEntry: 'Deferred recruiting duty for operational assignment.',
      },
      {
        text: 'Work the system — request a waiver and stay in the operating forces.',
        hint: 'May or may not work. Shows preference for ops over admin.',
        effects: { reputationWithLeadership: -3, stress: 4, mosProficiency: 2 },
        logEntry: 'Attempted to waiver out of recruiting duty.',
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
        logEntry: 'Had a career reality check — started building transition skills.',
      },
      {
        text: 'Your plan is to reenlist. Focus on the mission in front of you.',
        hint: '+Morale, +MOS focus — the mission matters',
        effects: { morale: 4, mosProficiency: 3, stress: -2 },
        logEntry: 'Renewed focus on reenlistment over transition planning.',
      },
      {
        text: 'Tell him about the TAP program. You\'ll worry about it later.',
        hint: 'Neutral — kicking the can down the road',
        effects: { stress: 1 },
        logEntry: 'Acknowledged transition challenge — deferred planning.',
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
        logEntry: 'Reported potential foreign contact to security officer.',
      },
      {
        text: 'Document it yourself in writing but wait to see if it recurs.',
        hint: 'Moderate — paper trail exists, but delayed reporting is noted',
        effects: { profConduct: 2, stress: 5, disciplineRisk: 4 },
        logEntry: 'Documented suspicious contact — monitor and report if needed.',
      },
      {
        text: 'It was probably nothing. Skip the report.',
        hint: 'High risk — security failure could end your clearance and career',
        effects: { disciplineRisk: 15, profConduct: -8, stress: 8 },
        logEntry: 'Failed to report suspicious foreign contact.',
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
        logEntry: 'Explored defense contractor opportunity — market research.',
      },
      {
        text: 'Ignore it. Your obligation is to the Corps right now.',
        hint: '+Morale, +Reputation — professional focus',
        effects: { morale: 3, reputationWithLeadership: 3, profConduct: 2 },
        logEntry: 'Declined early contractor approach — staying focused.',
      },
      {
        text: 'Report the unsolicited approach to your security officer.',
        hint: 'Technically correct — contractor approach to cleared personnel is reportable',
        effects: { profConduct: 4, reputationWithLeadership: 5, stress: 2 },
        logEntry: 'Reported unsolicited contractor contact to security officer.',
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
        logEntry: 'Powered through 72-hour intel surge.',
      },
      {
        text: 'Do your job well, but advocate for proper rest protocols for the section.',
        hint: '+ProCon, +Morale for section — leadership means looking out for your people',
        effects: { profConduct: 4, reputationWithLeadership: 5, morale: 3, stress: 6, mosProficiency: 4 },
        logEntry: 'Led with professionalism during intel surge — pushed for section welfare.',
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
        logEntry: 'Launched property investigation — located missing gear.',
      },
      {
        text: 'Quietly ask around before escalating. Give it 48 hours.',
        hint: 'Reasonable — but if it surfaces after you delayed, you own that',
        effects: { stress: 8, mosProficiency: 3, profConduct: 2 },
        logEntry: 'Investigated missing property discreetly before reporting.',
      },
      {
        text: 'Report it immediately to the CO and accept the accountability',
        hint: 'Painful but professional — commanders respect Marines who own their books',
        effects: { profConduct: 4, reputationWithLeadership: 4, stress: 12, morale: -5 },
        logEntry: 'Reported missing property to commanding officer immediately.',
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
        logEntry: 'Distributed surplus gear fairly across the unit.',
      },
      {
        text: 'Use it as leverage to get your section\'s equipment priorities bumped.',
        hint: '+Section readiness, some political friction — welcome to logistics',
        effects: { mosProficiency: 5, reputationWithLeadership: 2, networkStrength: 3, stress: 3 },
        logEntry: 'Traded surplus gear to resolve section equipment shortfall.',
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
        logEntry: 'Explored civilian tech opportunity — assessed market value.',
      },
      {
        text: 'Politely decline. You\'re not done with the Corps yet.',
        hint: '+Morale, +Reputation — mission focus',
        effects: { morale: 4, reputationWithLeadership: 3, profConduct: 2 },
        logEntry: 'Declined civilian tech approach — staying the course.',
      },
      {
        text: 'Engage seriously and start studying for civilian certs on the side.',
        hint: '+CivilianEmployability significantly, +Stress — ambitious parallel path',
        effects: { civilianEmployability: 12, educationCredits: 4, stress: 8, mosProficiency: 2 },
        logEntry: 'Started building civilian tech credentials while serving.',
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
        logEntry: 'Resolved critical network outage under command pressure.',
      },
      {
        text: 'Call in backup from battalion comms. Two sets of eyes are better than one.',
        hint: '+Teamwork, -Solo reputation — but the network comes back up',
        effects: { mosProficiency: 4, networkStrength: 5, reputationWithLeadership: 4, stress: 8 },
        logEntry: 'Coordinated rapid fix for network outage with battalion support.',
      },
      {
        text: 'Recommend the VTC be pushed 30 minutes. Communicate the issue clearly.',
        hint: '+ProCon — managing up honestly is a skill',
        effects: { profConduct: 5, reputationWithLeadership: 3, stress: 6, mosProficiency: 3 },
        logEntry: 'Communicated network issue to command — requested delay.',
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
        logEntry: 'Identified and corrected service record errors.',
      },
      {
        text: 'Fix it quietly using your admin access. You know the system.',
        hint: 'Efficient but ethically gray — unauthorized record changes is a serious violation',
        effects: { disciplineRisk: 12, profConduct: -5, stress: 6 },
        logEntry: 'Corrected service record through unofficial channels.',
      },
      {
        text: 'Document it and brief your SSgt on the discrepancy.',
        hint: '+Transparency, +Reputation — loop in your chain of command',
        effects: { profConduct: 5, reputationWithLeadership: 6, mosProficiency: 3, stress: 4 },
        logEntry: 'Briefed SSgt on service record discrepancies — proper channels.',
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
        logEntry: 'Refused to falsify service record — held the line.',
      },
      {
        text: 'Report the request to the First Sergeant.',
        hint: '+ProCon, escalates appropriately — this is the right call',
        effects: { profConduct: 10, reputationWithLeadership: 3, stress: 10, disciplineRisk: -8 },
        logEntry: 'Reported improper request to First Sergeant.',
      },
      {
        text: 'Do it. He said it would be remembered. Pick your battles.',
        hint: 'Short-term favor, long-term exposure — falsifying records ends careers',
        effects: { profConduct: -12, disciplineRisk: 18, reputationWithLeadership: 2, stress: 8 },
        logEntry: 'Falsified service record under officer pressure.',
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
        logEntry: 'Earned CDL-A certification.',
      },
      {
        text: 'Put it off until next cycle. Too much going on right now.',
        hint: 'No immediate downside — but the slot won\'t always be there',
        effects: { stress: -1 },
        logEntry: 'Deferred CDL certification opportunity.',
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
        logEntry: 'Refused to operate deadlined vehicle — upheld safety standards.',
      },
      {
        text: 'Escalate immediately to the Motor Pool OIC.',
        hint: '+ProCon, goes over SSgt\'s head — right call, political friction',
        effects: { profConduct: 8, reputationWithLeadership: -3, stress: 6, mosProficiency: 3 },
        logEntry: 'Escalated deadlined vehicle issue to Motor Pool OIC.',
      },
      {
        text: 'Do it. It\'s just a short run and your SSgt said it\'s fine.',
        hint: 'Serious safety risk. If something happens, you own it.',
        effects: { disciplineRisk: 10, stress: 8, profConduct: -6, reputationWithLeadership: 2 },
        logEntry: 'Operated deadlined vehicle on SSgt direction.',
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
        logEntry: 'Led ARFF response to aircraft emergency — executed flawlessly.',
      },
      {
        text: 'Follow the lead of your section chief while providing sharp support.',
        hint: '+Teamwork, solid performance — good team player',
        effects: { mosProficiency: 5, profConduct: 4, reputationWithLeadership: 6, stress: 8 },
        logEntry: 'Supported ARFF section chief during aircraft emergency.',
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
        logEntry: 'Joined FAA certification study group.',
      },
      {
        text: 'Focus on your current duties. Certifications can wait.',
        hint: 'No cost now, but the group is moving without you',
        effects: { mosProficiency: 3, stress: -2 },
        logEntry: 'Focused on current duties — passed on FAA study group.',
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
        logEntry: 'Explored civilian law enforcement career path.',
      },
      {
        text: 'Not yet. You have more to do in the Marine Corps first.',
        hint: '+Morale, keeps mission focus',
        effects: { morale: 4, reputationWithLeadership: 3, mosProficiency: 2 },
        logEntry: 'Declined civilian LE recruitment — staying the course.',
      },
      {
        text: 'Apply seriously. Start building your transition file now.',
        hint: '+CivilianEmployability significantly — being selective and prepared matters',
        effects: { civilianEmployability: 12, educationCredits: 3, networkStrength: 6, stress: 6 },
        logEntry: 'Began formal application process for civilian law enforcement.',
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
        logEntry: 'De-escalated tense traffic stop professionally.',
      },
      {
        text: 'Draw and issue verbal commands. Establish clear dominance of the scene.',
        hint: 'Justified given the behavior — clean report, elevated tension',
        effects: { profConduct: 3, mosProficiency: 4, reputationWithLeadership: 3, stress: 12 },
        logEntry: 'Used escalated force posture to control traffic stop.',
      },
      {
        text: 'Call for backup before making contact. Two-officer approach.',
        hint: '+Teamwork, +Safety — slower but by the book',
        effects: { profConduct: 5, networkStrength: 4, reputationWithLeadership: 4, stress: 6 },
        logEntry: 'Requested backup before approaching agitated motorist.',
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
        logEntry: 'Executed hang fire protocol exactly as trained.',
      },
      {
        text: 'Follow protocol and clearly communicate the situation to range control.',
        hint: '+MOS Proficiency, +Leadership — communication is part of the job',
        effects: { profConduct: 6, mosProficiency: 7, reputationWithLeadership: 7, stress: 6 },
        logEntry: 'Executed hang fire protocol with clear comms to range control.',
      },
      {
        text: 'Expedite the clearance — the range officer is waiting.',
        hint: 'Shortcutting hang fire protocol is how people die. High injury risk.',
        effects: { disciplineRisk: 15, profConduct: -10, reputationWithLeadership: -8, stress: 12 },
        logEntry: 'Rushed hang fire clearance — violated protocol.',
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
        logEntry: 'Accepted FIST team billet — embedded fire support role.',
      },
      {
        text: 'Stay in the gun line. You\'re building depth where you are.',
        hint: '+MOS at current position — steady career development',
        effects: { mosProficiency: 4, morale: 3, stress: -2 },
        logEntry: 'Opted to develop further in gun line position.',
      },
    ],
  },

  // ══════════════════ CHANCE EVENTS ══════════════════
  // isChance: true — player acknowledges; no real choice. Used for windfalls,
  // setbacks, and (at high disciplineRisk) game-ending consequences.

  // ── POSITIVE ──────────────────────────────────────

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
      logEntry: 'Tax refund received.',
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
      logEntry: 'BAH rate increased.',
    }],
  },

  {
    id: 'evt_chance_back_pay',
    category: 'finance',
    title: 'Pay Discrepancy — Resolved in Your Favor',
    weight: 7,
    trigger: {},
    isChance: true,
    narrative: 'Finance finally corrected a pay error from three months ago. You\'d flagged it twice and were starting to think it would just disappear. The back pay hit your account this morning.',
    chanceImpact: '+$900 Savings',
    chanceType: 'positive',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: 900, stress: -4 },
      logEntry: 'Back pay received — pay discrepancy corrected.',
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
      logEntry: 'Unit Meritorious Unit Citation received.',
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
      logEntry: 'Coined by the Sergeant Major.',
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
      logEntry: 'Security clearance upgraded.',
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
      logEntry: 'Received outstanding fitness report.',
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
      logEntry: 'Passed CLEP exam — 15 college credits earned.',
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
      logEntry: 'SRB rate increase — better bonus window.',
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
      logEntry: 'Annual physical — full duty medical clearance.',
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
      logEntry: 'Attended employer hiring fair — expanded civilian network.',
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
      logEntry: 'Award package approved — NAM in service record.',
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
      logEntry: 'Vehicle broken into — gear stolen.',
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
      logEntry: 'Credit card fraud — dispute in progress.',
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
      logEntry: 'Flagged at BCP check — borderline body composition.',
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
      logEntry: 'Received Page 11 counseling for social media post.',
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
      logEntry: 'On-base traffic citation — CO notified.',
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
      logEntry: 'Barracks water damage — replaced personal gear.',
    }],
  },

  {
    id: 'evt_chance_family_expense',
    category: 'personal',
    title: 'Emergency Wire Home',
    weight: 8,
    trigger: {},
    isChance: true,
    narrative: 'A family situation back home required you to wire money immediately — car broke down, medical bill, just needing help. You didn\'t hesitate. Marines take care of their people, and that includes the family they came from.',
    chanceImpact: '-$1,000 Savings',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -1000, stress: 7, familyStability: 3 },
      logEntry: 'Emergency funds wired to family.',
    }],
  },

  {
    id: 'evt_chance_overpay_clawback',
    category: 'finance',
    title: 'Payroll Overpayment — You Must Repay',
    weight: 7,
    trigger: {},
    isChance: true,
    narrative: 'Finance discovered they\'ve been overpaying you for the past two months — a clerical error on their end. That doesn\'t matter. The money is owed back. They set up automatic deductions from your next three paychecks. This is a known Marine Corps experience.',
    chanceImpact: '-$700 Savings',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -700, stress: 8, morale: -5 },
      logEntry: 'Payroll overpayment recovered — deductions applied.',
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
      logEntry: 'Placed on limited duty profile.',
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
      logEntry: 'Barracks roommate situation creating issues.',
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
      logEntry: 'Vehicle impounded — expired registration on base.',
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
      logEntry: 'Marine in section arrested — unit reputation impact.',
    }],
  },

  {
    id: 'evt_chance_bah_decrease',
    category: 'finance',
    title: 'BAH Rate Recalculated — Rate Drops',
    weight: 6,
    trigger: {},
    isChance: true,
    narrative: 'The DoD BAH rate update this year moved in the wrong direction for your zip code. The civilian rental market around base apparently cooled. Your monthly housing allowance drops slightly. You\'ll feel it at the end of the month.',
    chanceImpact: '-$240 (BAH decrease, 3 months)',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -240, stress: 5, morale: -3 },
      logEntry: 'BAH rate reduced this quarter.',
    }],
  },

  {
    id: 'evt_chance_medical_bill',
    category: 'finance',
    title: 'Unexpected Medical Bill',
    weight: 8,
    trigger: {},
    isChance: true,
    narrative: 'A Tricare claim from your last ER visit was partially denied. You had to cover a cost-share you weren\'t expecting. Military healthcare is good — but billing gaps and coverage errors show up at the worst times.',
    chanceImpact: '-$550 Savings',
    chanceType: 'negative',
    choices: [{
      text: 'ACKNOWLEDGED',
      effects: { savings: -550, stress: 5 },
      logEntry: 'Unexpected Tricare cost-share — out of pocket.',
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
      logEntry: 'FLIPL initiated — missing equipment investigation.',
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
      logEntry: 'Early separation request denied.',
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
      logEntry: 'DUI arrest on base — court-martial initiated.',
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
      logEntry: 'UA positive — administrative separation initiated.',
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
      logEntry: 'Assault charges — UCMJ Article 128 court-martial.',
      gameOverState: 'brig_discharge',
    }],
  },

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
