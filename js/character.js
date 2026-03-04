/* ═══════════════════════════════════════════════
   CHARACTER MODEL
   Marine constructor, stat helpers, computed scores
   ═══════════════════════════════════════════════ */

const Character = {

  /** Create a new Marine from character creation choices */
  create(name, mosId, backgroundId, gender = 'male') {
    const mos = MOS_DATA.find(m => m.id === mosId);
    const bg  = BACKGROUNDS.find(b => b.id === backgroundId);

    const formattedName = name.trim().replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const isFemale = gender === 'female';

    const marine = {
      name: formattedName,
      gender,
      pronoun:    isFemale ? 'she'     : 'he',
      pronounObj: isFemale ? 'her'     : 'him',
      pronounPos: isFemale ? 'her'     : 'his',
      pronounRefl:isFemale ? 'herself' : 'himself',
      mosId,
      backgroundId,
      mosCode: mos.code,
      mosTitle: mos.title,
      mosField: mos.field,

      // ── Rank / Time ──────────────────────
      payGrade:     'E-1',
      rankAbbr:     'Pvt',
      rankTitle:    'Private',
      timeInService: 0,    // months
      timeInGrade:   0,    // months
      contractEnd:   48,   // months of TIS when current contract ends (default 4 yr)

      // ── Readiness & Performance ───────────
      physicalFitness:  clamp(50 + (bg.stats.physicalFitness || 0) + (mos.startingStats.physicalFitness || 0), 20, 100),
      profConduct:      clamp(50 + (bg.stats.profConduct     || 0) + (mos.startingStats.profConduct     || 0), 20, 100),
      mosProficiency:   clamp(30 + (bg.stats.mosProficiency  || 0) + (mos.startingStats.mosProficiency  || 0), 10, 100),
      disciplineRisk:   clamp(30 + (bg.stats.disciplineRisk  || 0) + (mos.startingStats.disciplineRisk  || 0),  0, 100),

      // ── Career Momentum ───────────────────
      billetTier:       1,
      pmeCompleted:     [],
      certs:            [],
      awards:           [],

      // ── Well-being ────────────────────────
      stress:           clamp(20 + (bg.stats.stress          || 0) + (mos.startingStats.stress          || 0),  0, 100),
      morale:           clamp(70 + (bg.stats.morale          || 0) + (mos.startingStats.morale          || 0),  0, 100),
      injury:           'none',    // none | minor | major
      familyStability:  clamp(60 + (bg.stats.familyStability || 0) + (mos.startingStats.familyStability || 0),  0, 100),

      // ── Finance ───────────────────────────
      savings:          clamp(500 + (bg.stats.savings        || 0) + (mos.startingStats.savings         || 0), 0, Infinity),
      debt:             clamp(2000 + (bg.stats.debt          || 0) + (mos.startingStats.debt            || 0), 0, Infinity),
      lifestyleScore:   2,
      // Base non-housing expenses: phone (~$80), car insurance (~$150),
      // gas (~$120), eating out/going out (~$350), hygiene/incidentals (~$100),
      // subscriptions/entertainment (~$100), random spending (~$200) ≈ $1,100
      // Plus barracks lifestyle costs (field day supplies, boot polish, etc.) ≈ $200
      monthlyExpenses:  1300,    // base non-housing, non-food expenses

      // ── Transition ────────────────────────
      civilianEmployability: clamp(20 + (bg.stats.civilianEmployability || 0) + (mos.startingStats.civilianEmployability || 0), 0, 100),
      educationCredits:      0,
      giBillMonths:          36,
      degreeProgress:        'none',   // none | inProgress | associate | bachelor | master

      // ── Assignment ───────────────────────
      assignmentId:    'assign_pendleton',  // default first duty station
      isDeployed:      false,
      deploymentMonthsLeft: 0,
      monthsAtStation: 0,   // months at current duty station (PCS trigger)
      pcsEligibleAt:   30,  // threshold (months at station) before PCS orders fire; randomized 36-48 after each move
      ordersDeclined:  false, // true = declined PCS; blocks PCS, deployments, TA for rest of contract

      // ── Hidden mechanics ─────────────────
      reputationWithLeadership: 50,
      networkStrength:           20,
      optempo:                   mos.optempo,

      // ── Flags ─────────────────────────────
      isMarried:    false,
      childCount:   0,
      hasBachelor:  false,

      // ── Car Loan ──────────────────────────
      carLoanMonthly:      0,     // monthly payment added to expenses
      carLoanMonthsLeft:   0,     // months remaining on loan (60 = 5 yr)
      pendingCarLoanReveal: false, // true = reveal financing trap next advance

      // ── Checking Account ──────────────────
      checking: 400,   // liquid balance; pay flows in, bills flow out each month

      // ── Reserve Component ─────────────────
      reserveStatus: 'none',  // 'none' | 'IRR' | 'SMCR' — set at EAS

      // ── Rifle Qualification ────────────────
      rifleQualLevel: null,   // null | 'UNQ' | 'Marksman' | 'Sharpshooter' | 'Expert'
      rifleQualScore: 0,

      // ── Savings Goal ─────────────────────
      savingsGoal: 200,   // player-set monthly savings target ($)
    };

    return marine;
  },

  /** Clamp a stat to its valid range */
  clamp(marine, stat, min = 0, max = 100) {
    marine[stat] = clamp(marine[stat], min, max);
  },

  /** Apply an effects object to the marine's stats */
  applyEffects(marine, effects) {
    const numericStats = [
      'physicalFitness','profConduct','mosProficiency','disciplineRisk',
      'stress','morale','familyStability','savings','debt',
      'civilianEmployability','educationCredits','giBillMonths',
      'reputationWithLeadership','networkStrength','billetTier','lifestyleScore',
    ];
    for (const [key, val] of Object.entries(effects)) {
      if (numericStats.includes(key)) {
        marine[key] = (marine[key] || 0) + val;
      } else if (key === 'degreeProgress') {
        // Only upgrade, never downgrade
        const levels = ['none','inProgress','associate','bachelor','master'];
        const curr = levels.indexOf(marine.degreeProgress);
        const next = levels.indexOf(val);
        if (next > curr) marine.degreeProgress = val;
      }
    }
    Character.clampAll(marine);
  },

  /** Clamp all stats to valid ranges */
  clampAll(marine) {
    marine.physicalFitness         = clamp(marine.physicalFitness,          0, 100);
    marine.profConduct             = clamp(marine.profConduct,               0, 100);
    marine.mosProficiency          = clamp(marine.mosProficiency,            0, 100);
    marine.disciplineRisk          = clamp(marine.disciplineRisk,            0, 100);
    marine.stress                  = clamp(marine.stress,                    0, 100);
    marine.morale                  = clamp(marine.morale,                    0, 100);
    marine.familyStability         = clamp(marine.familyStability,           0, 100);
    marine.civilianEmployability   = clamp(marine.civilianEmployability,      0, 100);
    marine.educationCredits        = clamp(marine.educationCredits,           0, 200);
    marine.giBillMonths            = clamp(marine.giBillMonths,               0,  36);
    marine.reputationWithLeadership= clamp(marine.reputationWithLeadership,   0, 100);
    marine.networkStrength         = clamp(marine.networkStrength,            0, 100);
    marine.billetTier              = clamp(Math.round(marine.billetTier),     1,   5);
    marine.lifestyleScore          = clamp(Math.round(marine.lifestyleScore), 1,   5);
    marine.savings                 = Math.max(0, marine.savings);
    marine.debt                    = Math.max(0, marine.debt);
    marine.checking                = Math.max(0, marine.checking || 0);
  },

  /** Compute promotion competitiveness score (0–100) */
  promotionScore(marine) {
    const pmeWeight = Math.min(marine.pmeCompleted.length * 8, 24);
    const awardsWeight = Math.min(marine.awards.length * 3, 12);
    const billetWeight = (marine.billetTier - 1) * 5;
    const score =
      marine.physicalFitness  * 0.20 +
      marine.profConduct       * 0.30 +
      marine.mosProficiency    * 0.15 +
      pmeWeight                       +
      awardsWeight                    +
      billetWeight;
    return clamp(Math.round(score), 0, 100);
  },

  /** Compute end-state track progress percentages */
  trackProgress(marine, tis) {
    const tisYears = tis / 12;

    // Retirement: needs 20+ years, decent rank, discipline intact
    const retirementBase = Math.min(tisYears / 20, 1) * 0.5;
    const retirementDiscipline = (marine.profConduct / 100) * 0.3;
    const retirementHealth = (marine.physicalFitness / 100) * 0.2;
    const retirement = clamp(Math.round((retirementBase + retirementDiscipline + retirementHealth) * 100), 0, 100);

    // High Achiever: promotion score, PME, billet tier
    const achiever = clamp(Math.round(
      (Character.promotionScore(marine) * 0.5) +
      (Math.min(marine.pmeCompleted.length * 10, 30)) +
      ((marine.billetTier - 1) * 5)
    ), 0, 100);

    // Civilian Exit: savings, employability, education, low debt
    const debtPenalty = Math.min(marine.debt / 500, 20);
    const civilian = clamp(Math.round(
      (marine.civilianEmployability * 0.4) +
      (Math.min(marine.educationCredits / 1.2, 50) * 0.4) +
      (Math.min(marine.savings / 200, 20)) -
      debtPenalty
    ), 0, 100);

    // Family-First: family stability, morale, low stress, lifestyle
    const family = clamp(Math.round(
      (marine.familyStability * 0.4) +
      (marine.morale * 0.3) +
      ((100 - marine.stress) * 0.2) +
      (marine.lifestyleScore * 2)
    ), 0, 100);

    return { retirement, achiever, civilian, family };
  },
};

// ── Backgrounds ──────────────────────────────────
const BACKGROUNDS = [
  {
    id: 'bg_hometown',
    title: 'Small Town',
    desc: 'Grew up in a small town. Hard-working, resilient. Not much money but you know how to stretch a dollar.',
    bonuses: 'Physical +5 | Savings +$500 | Debt +$500',
    stats: { physicalFitness: 5, savings: 500, debt: 500 },
  },
  {
    id: 'bg_military_family',
    title: 'Military Family',
    desc: 'You grew up in a military family. You understand the culture, the language, and the sacrifice required.',
    bonuses: 'ProCon +5 | NetworkStrength +10 | FamilyStability -5',
    stats: { profConduct: 5, networkStrength: 10, familyStability: -5 },
  },
  {
    id: 'bg_college_dropout',
    title: 'College Dropout',
    desc: 'You started college but it wasn\'t for you. You have 30 credits and a hunger to prove something.',
    bonuses: 'Education Credits +30 | Civilian Employ. +8 | Savings -$1000',
    stats: { educationCredits: 30, civilianEmployability: 8, savings: -1000, debt: 5000 },
  },
  {
    id: 'bg_athlete',
    title: 'Former Athlete',
    desc: 'High school and community college sports. You\'re in excellent shape and competitive by nature.',
    bonuses: 'Physical Fitness +15 | Morale +5',
    stats: { physicalFitness: 15, morale: 5 },
  },
  {
    id: 'bg_street',
    title: 'Rough Upbringing',
    desc: 'Life wasn\'t easy. You learned early how to handle adversity and read people. The Corps is a fresh start.',
    bonuses: 'DisciplineRisk +10 | Morale +10 | ReputationWithLeadership -5',
    stats: { disciplineRisk: 10, morale: 10, reputationWithLeadership: -5, savings: -500 },
  },
];

/** Utility: clamp a number between min and max */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
