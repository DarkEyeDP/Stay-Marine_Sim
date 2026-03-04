/* ═══════════════════════════════════════════════
   CAREER MODULE
   Promotions, reenlistment, EAS, school tracking
   ═══════════════════════════════════════════════ */

const Career = {

  /** Check and apply automatic promotions (E-1 to E-3 are automatic) */
  checkAutomaticPromotion(marine) {
    const gradeOrder = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9'];
    const currentIdx = gradeOrder.indexOf(marine.payGrade);
    if (currentIdx >= gradeOrder.length - 1) return null;

    const nextGrade = gradeOrder[currentIdx + 1];
    const requirement = RANKS.find(r => r.grade === nextGrade && !r.isBilletGrade);
    if (!requirement) return null;

    if (nextGrade === 'E-2' || nextGrade === 'E-3') {
      if (marine.timeInService >= requirement.tisMins && marine.timeInGrade >= requirement.tigMins) {
        return Career._promote(marine, nextGrade);
      }
    }
    return null;
  },

  /** Check if a competitive promotion can happen (E-4+) */
  checkCompetitivePromotion(marine) {
    const gradeOrder = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9'];
    const currentIdx = gradeOrder.indexOf(marine.payGrade);
    if (currentIdx < 2 || currentIdx >= gradeOrder.length - 1) return null;

    const nextGrade = gradeOrder[currentIdx + 1];
    const requirement = RANKS.find(r => r.grade === nextGrade && !r.isBilletGrade);
    if (!requirement) return null;

    if (marine.timeInService < requirement.tisMins) return null;
    if (marine.timeInGrade   < requirement.tigMins)  return null;

    const reqPME = PME_REQUIREMENTS[nextGrade] || [];
    for (const pme of reqPME) {
      if (!marine.pmeCompleted.includes(pme)) return null;
    }

    if (requirement.requiresBoard) {
      const score = Character.promotionScore(marine);
      const boardChance = clamp((score - 50) / 50, 0.05, 0.85);
      if (Math.random() > boardChance) return null;
    } else {
      const score = Character.promotionScore(marine);
      const cutScore = Career._getCutScore(nextGrade);
      if (score < cutScore) return null;
      // Random variance — even if eligible not guaranteed every quarter
      if (Math.random() > 0.6) return null;
    }

    return Career._promote(marine, nextGrade);
  },

  _getCutScore(grade) {
    const cuts = { 'E-4': 38, 'E-5': 52, 'E-6': 62 };
    return cuts[grade] || 50;
  },

  _promote(marine, newGrade) {
    const rank = RANKS.find(r => r.grade === newGrade && !r.isBilletGrade);
    if (!rank) return null;

    marine.payGrade  = newGrade;
    marine.rankAbbr  = rank.abbr;
    marine.rankTitle = rank.title;
    marine.timeInGrade = 0;

    marine.profConduct = clamp(marine.profConduct + 2, 0, 100);
    marine.morale      = clamp(marine.morale      + 8, 0, 100);

    const tierMap = { 'E-3':1, 'E-4':2, 'E-5':2, 'E-6':3, 'E-7':3, 'E-8':4, 'E-9':5 };
    if (tierMap[newGrade] && tierMap[newGrade] > marine.billetTier) {
      marine.billetTier = tierMap[newGrade];
    }
    return { grade: newGrade, abbr: rank.abbr, title: rank.title };
  },

  // ── Reenlistment ─────────────────────────────

  /**
   * Check whether the reenlistment window should be shown this quarter.
   * Window opens at approximately 9 months before EAS (FY-based).
   * Only triggers once per contract (tracked by State.game.reenlistWindowOffered).
   */
  isReenlistWindowDue(marine) {
    if (State.game.reenlistWindowOffered) return false;
    const monthsToEAS = marine.contractEnd - marine.timeInService;
    // Open between 12 and 3 months before EAS; trigger on first quarter in that range
    return monthsToEAS > 0 && monthsToEAS <= 12;
  },

  /**
   * Describe the reenlistment window (fiscal year label).
   * Calculates which FY the EAS falls into and labels accordingly.
   */
  reenlistWindowLabel(marine) {
    // Calculate approximate EAS calendar date
    const monthsLeft = marine.contractEnd - marine.timeInService;
    let easMonth = State.game.month + monthsLeft;
    let easYear  = State.game.year;
    while (easMonth > 12) { easMonth -= 12; easYear++; }
    // FY: Oct–Sep. If EAS is Oct-Dec, FY = easYear+1; otherwise FY = easYear
    const fy = easMonth >= 10 ? easYear + 1 : easYear;
    return { label: `FY${fy} Reenlistment Window`, fy, easMonth, easYear };
  },

  /**
   * Calculate Selective Reenlistment Bonus.
   * Based on paygrade, MOS field, and contract length.
   */
  calculateSRB(marine, contractYears) {
    const srbBase = {
      'E-3': 5000,
      'E-4': 14000,
      'E-5': 22000,
      'E-6': 16000,
      'E-7': 10000,
      'E-8': 7000,
      'E-9': 0,
    };
    const base = srbBase[marine.payGrade] || 0;
    if (base === 0) return 0;

    // High-demand MOS fields get a bonus multiplier
    const mosDef = MOS_DATA.find(m => m.id === marine.mosId);
    const highDemandFields = ['infantry', 'artillery', 'intelligence', 'communications'];
    const mosMul = mosDef && highDemandFields.includes(mosDef.field) ? 1.3 : 1.0;

    // Longer contracts pay proportionally (4 yr = 1.0x, 6 yr = 1.4x, 2 yr = 0.6x)
    const yearMul = contractYears / 4;

    // ProCon quality modifier
    const qualMul = clamp(marine.profConduct / 80, 0.7, 1.3);

    const total = base * mosMul * yearMul * qualMul;
    return Math.round(total / 500) * 500;   // round to nearest $500
  },

  /** Execute reenlistment — extend contract, deposit SRB, reset window flag */
  reenlist(marine, contractYears, srbAmount) {
    marine.contractEnd = marine.timeInService + (contractYears * 12);
    marine.savings += srbAmount;
    marine.morale = clamp(marine.morale + 5, 0, 100);
    State.game.reenlistWindowOffered = false;  // reset for the new contract
    return srbAmount;
  },

  /**
   * Returns the next PME course the marine needs to complete for promotion eligibility.
   * Returns null if all required PME is already done.
   */
  _nextRequiredPME(marine) {
    const gradeOrder = ['E-4','E-5','E-6','E-7','E-8','E-9'];
    for (const grade of gradeOrder) {
      const reqs = PME_REQUIREMENTS[grade] || [];
      for (const req of reqs) {
        if (!marine.pmeCompleted.includes(req)) return req;
      }
    }
    return null;
  },

  /** True when current TIS has met or passed the contract end date */
  shouldTriggerEAS(marine) {
    return marine.timeInService >= marine.contractEnd;
  },

  /** Determine end state from the game state */
  determineEndState(marine, tis) {
    const tisYears = tis / 12;
    const tracks = Character.trackProgress(marine, tis);

    if (marine.profConduct < 20 || marine.disciplineRisk > 90) return 'bad_discharge';
    if (marine.injury === 'major' && marine.stress > 85)        return 'medical_discharge';

    if (tisYears >= 20 && marine.payGrade !== 'E-1' && marine.payGrade !== 'E-2') {
      if (marine.payGrade === 'E-9') return 'high_achiever_retirement';
      return 'retirement';
    }

    const maxTrack = Object.entries(tracks).sort((a,b) => b[1]-a[1])[0][0];
    if (maxTrack === 'achiever' && tracks.achiever > 60) return 'high_achiever_eas';
    if (maxTrack === 'civilian' && tracks.civilian > 55) return 'smooth_civilian';
    if (maxTrack === 'family'   && tracks.family   > 55) return 'family_first';
    return 'basic_eas';
  },

  /**
   * Compute civilian outcome metrics for EAS end states.
   * Returns job prospect tier, salary estimate, financial runway,
   * family outlook, and a list of positive/negative factors.
   */
  civilianOutlook(marine, tis) {
    const tisYears = tis / 12;
    const mosData  = MOS_DATA.find(m => m.id === marine.mosId);

    // ── Base salary range by MOS field (2003-era civilian market) ──
    const fieldSalaries = {
      infantry:        { min: 35000, max: 45000 },
      artillery:       { min: 36000, max: 46000 },
      logistics:       { min: 44000, max: 58000 },
      communications:  { min: 46000, max: 62000 },
      admin:           { min: 38000, max: 50000 },
      motor_t:         { min: 36000, max: 46000 },
      law_enforcement: { min: 42000, max: 56000 },
      aviation:        { min: 48000, max: 66000 },
      intelligence:    { min: 52000, max: 72000 },
    };
    const base = fieldSalaries[marine.mosField] || { min: 38000, max: 50000 };

    // ── Salary modifiers ──
    let mod = 0;
    if      (marine.degreeProgress === 'bachelor' || marine.degreeProgress === 'master') mod += 18000;
    else if (marine.degreeProgress === 'associate')                                       mod += 8000;
    else if (marine.educationCredits >= 60)                                               mod += 4000;
    if (marine.civilianEmployability >= 75) mod += (marine.civilianEmployability - 75) * 200;
    if (marine.networkStrength >= 60)       mod += 4000;
    if (marine.mosProficiency >= 80)        mod += 3000;
    mod += Math.min(Math.floor(tisYears) * 1000, 8000);   // experience premium, capped at $8k

    const salaryMin = Math.round((base.min + mod) / 1000) * 1000;
    const salaryMax = Math.round((base.max + mod) / 1000) * 1000;

    // ── Job prospect tier ──
    const score =
      (marine.civilianEmployability * 0.40) +
      (Math.min(marine.educationCredits / 1.2, 50) * 0.30) +
      (marine.networkStrength * 0.15) +
      Math.min(tisYears * 2, 16) +
      (marine.pmeCompleted.length * 3) +
      (marine.awards.length * 2);

    let tier, tierColor;
    if      (score >= 70) { tier = 'Excellent'; tierColor = 'good'; }
    else if (score >= 50) { tier = 'Good';      tierColor = 'good'; }
    else if (score >= 35) { tier = 'Fair';      tierColor = 'warn'; }
    else                  { tier = 'Difficult'; tierColor = 'bad';  }

    // ── Financial runway (months without income) ──
    const monthlyBurn  = 2800 + (marine.isMarried ? 1400 : 0) + (marine.childCount || 0) * 500;
    const netWorth     = marine.savings - marine.debt;
    const runwayMonths = netWorth > 0 ? Math.floor(netWorth / monthlyBurn) : 0;

    // ── Family outlook ──
    let familyOutlook;
    if      (marine.familyStability >= 65) familyOutlook = 'Strong — civilian routine and stability will help.';
    else if (marine.familyStability >= 45) familyOutlook = 'Strained but recoverable — you\'re finally going to be home.';
    else if (marine.familyStability >= 25) familyOutlook = 'Damaged. The transition will be hard on the family too.';
    else                                   familyOutlook = 'Critical — seek support. Transition counseling is available.';

    // ── Key factors (positive + negative) ──
    const factors = [];

    // Positive
    if (marine.degreeProgress === 'bachelor' || marine.degreeProgress === 'master') {
      const degLabel = marine.degreeProgress.charAt(0).toUpperCase() + marine.degreeProgress.slice(1);
      factors.push({ type: 'good', text: `${degLabel}'s degree — strong civilian credential` });
    } else if (marine.educationCredits >= 60) {
      factors.push({ type: 'good', text: `${marine.educationCredits} college credits — GI Bill can finish the degree` });
    }
    if (marine.giBillMonths >= 24 && marine.degreeProgress !== 'bachelor' && marine.degreeProgress !== 'master')
      factors.push({ type: 'good', text: `${marine.giBillMonths} months of GI Bill remaining` });
    if (marine.savings >= 12000)
      factors.push({ type: 'good', text: `${Finance.fmt(marine.savings)} in savings — solid financial runway` });
    else if (marine.savings >= 5000)
      factors.push({ type: 'good', text: `${Finance.fmt(marine.savings)} saved — some cushion to land on` });
    if (marine.networkStrength >= 65)
      factors.push({ type: 'good', text: 'Strong professional network — job leads will come' });
    if (marine.pmeCompleted.length >= 2)
      factors.push({ type: 'good', text: `${marine.pmeCompleted.length} PME courses — credentialed military leader` });
    if (marine.awards.length >= 2)
      factors.push({ type: 'good', text: `${marine.awards.length} military awards on the DD-214` });
    if (mosData && mosData.civilianValue >= 65)
      factors.push({ type: 'good', text: `${mosData.code} — high civilian skill transferability` });

    // Negative
    if (marine.debt >= 10000)
      factors.push({ type: 'bad', text: `${Finance.fmt(marine.debt)} in debt — financial pressure from day one` });
    else if (marine.debt >= 5000)
      factors.push({ type: 'bad', text: `${Finance.fmt(marine.debt)} in debt — manageable but limiting` });
    if (marine.savings < 3000)
      factors.push({ type: 'bad', text: 'Low savings — must find work immediately' });
    if (marine.civilianEmployability < 35)
      factors.push({ type: 'bad', text: 'MOS skills are hard to translate — civilian pivot required' });
    if (marine.injury === 'major')
      factors.push({ type: 'bad', text: 'Major injury — VA disability claim will take months to process' });
    if (marine.stress >= 70)
      factors.push({ type: 'bad', text: 'High stress on exit — transition mental health is a real risk' });
    if (marine.educationCredits < 30 && marine.giBillMonths < 12)
      factors.push({ type: 'bad', text: 'Limited education and almost no GI Bill remaining' });

    // ── Reserve component factors (set at EAS decision) ──
    if (marine.reserveStatus === 'SMCR') {
      factors.push({ type: 'good', text: 'SMCR drilling — military network stays active post-EAS' });
      factors.push({ type: 'good', text: 'Reserve drill pay supplements civilian income' });
      factors.push({ type: 'bad',  text: 'Mobilization risk — GWOT-era reserve units are deploying' });
    } else if (marine.reserveStatus === 'IRR') {
      factors.push({ type: 'bad', text: 'IRR subject to involuntary recall — GWOT recall orders are real' });
    }

    return { tier, tierColor, salaryMin, salaryMax, runwayMonths, familyOutlook, factors, netWorth };
  },

  /**
   * Compute reserve retirement eligibility and projection.
   * Returns null if they're already past 20 total qualifying years.
   * Reserve retirement begins at age 60 (or earlier with Title 10 active service credit).
   */
  reserveRetirementPath(marine, tis) {
    const tisYears       = tis / 12;
    const gradeOrder     = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9'];
    const rankAbbrMap    = {
      'E-1':'Pvt','E-2':'PFC','E-3':'LCpl','E-4':'Cpl',
      'E-5':'Sgt','E-6':'SSgt','E-7':'GySgt','E-8':'MSgt','E-9':'SgtMaj',
    };

    // Active service accrues retirement points at 365/year
    const activePoints   = Math.round(tisYears * 365);
    // Reserve good years needed to total 20 (7,300 points equivalent threshold)
    // Simplified: each reserve good year ≈ 75 points (48 drill + 15 AT + 12 membership)
    const reserveYearsNeeded = Math.max(0, 20 - tisYears);

    if (reserveYearsNeeded <= 0) return null;  // already at/past 20 years

    // Project retirement grade — reserve Marines typically retire at the grade they held on active duty
    // with modest progression if they serve 10+ reserve years
    const currentIdx     = gradeOrder.indexOf(marine.payGrade);
    const reserveBump    = reserveYearsNeeded >= 10 ? 1 : 0;  // one grade bump for long reserve service
    const projIdx        = clamp(currentIdx + reserveBump, currentIdx, 7);
    const projGrade      = gradeOrder[projIdx];
    const projAbbr       = rankAbbrMap[projGrade] || projGrade;

    // Reserve retirement pay formula (simplified Legacy):
    // (total retirement points / 360) × 2.5% × base pay at retirement
    const estReservePoints = activePoints + Math.round(reserveYearsNeeded * 75);
    const retireBasePay    = Finance.RETIREMENT_BASE_PAY[projGrade] || Finance.BASE_PAY[projGrade] || 2140;
    const monthlyPension   = Math.round((estReservePoints / 360) * 0.025 * retireBasePay);

    // Drill pay supplement (monthly)
    const basePay          = Finance.BASE_PAY[marine.payGrade] || 1680;
    const monthlyDrillPay  = Math.round((basePay / 30) * 4 / 10) * 10;
    const monthlyATPay     = Math.round((basePay / 30) * 14 / 12 / 10) * 10;

    return {
      projGrade, projAbbr,
      reserveYearsNeeded: Math.ceil(reserveYearsNeeded),
      monthlyPension,
      monthlyDrillPay,
      monthlyATPay,
      totalMonthlyDrill: monthlyDrillPay + monthlyATPay,
      activePoints,
      estReservePoints,
    };
  },

  /**
   * Project what retirement at 20 years would have looked like,
   * given the marine's current rank and performance trajectory.
   */
  retirementProjection(marine, tis) {
    const tisYears   = tis / 12;
    if (tisYears >= 20) return null;

    const yearsLeft  = 20 - tisYears;
    const gradeOrder = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9'];
    const rankAbbrMap = {
      'E-1':'Pvt', 'E-2':'PFC', 'E-3':'LCpl', 'E-4':'Cpl',
      'E-5':'Sgt', 'E-6':'SSgt','E-7':'GySgt','E-8':'MSgt','E-9':'SgtMaj',
    };
    const currentIdx = gradeOrder.indexOf(marine.payGrade);

    // Project retirement rank from performance score and time remaining
    const score      = Character.promotionScore(marine);
    const promoBump  = score >= 70 ? 2 : score >= 50 ? 1 : 0;
    const projIdx    = clamp(currentIdx + promoBump + Math.floor(yearsLeft / 5), currentIdx, 7);
    const projGrade  = gradeOrder[projIdx];
    const projAbbr   = rankAbbrMap[projGrade] || projGrade;

    // Legacy/Final Pay retirement: 50% of base pay at 20 years (uses realistic 20yr career rate)
    const retireBase     = Finance.RETIREMENT_BASE_PAY[projGrade] || Finance.BASE_PAY[projGrade] || 2140;
    const monthlyPension = Math.round(retireBase * 0.50);
    const pensionLifetime = monthlyPension * 12 * 20;   // 20 years post-retirement value

    // Estimate remaining commitment cost
    const deployEstimate = Math.max(1, Math.round((marine.optempo / 5) * yearsLeft * 0.4));
    const pcsEstimate    = Math.max(1, Math.round(yearsLeft / 3));

    return {
      projGrade, projAbbr, monthlyPension, pensionLifetime,
      yearsLeft: Math.ceil(yearsLeft),
      deployEstimate, pcsEstimate,
    };
  },

  /** Monthly natural stat drift */
  monthlyDrift(marine) {
    const optempo = marine.optempo;

    if (optempo >= 4) {
      marine.stress = clamp(marine.stress + 2, 0, 100);
    } else if (optempo >= 3) {
      marine.stress = clamp(marine.stress + 1, 0, 100);
    } else {
      marine.stress = clamp(marine.stress - 1, 0, 100);
    }

    if (marine.stress > 70) {
      marine.morale = clamp(marine.morale - 3, 0, 100);   // high stress — morale craters fast
    } else if (marine.stress > 45) {
      marine.morale = clamp(marine.morale - 1, 0, 100);   // moderate stress bleeds morale slowly
    } else if (marine.stress < 25) {
      marine.morale = clamp(marine.morale + 1, 0, 100);   // genuinely low stress — morale recovers
    }

    // Deployment wears on the spirit regardless of stress level
    if (marine.isDeployed) {
      marine.morale = clamp(marine.morale - 1, 0, 100);
    }

    // A Marine who isn't good at their job loses pride in it
    if (marine.mosProficiency < 35) {
      marine.morale = clamp(marine.morale - 1, 0, 100);
    }

    // Sustained low morale erodes conduct — a demoralized Marine starts cutting corners
    if (marine.morale < 35) {
      marine.profConduct = clamp(marine.profConduct - 0.5, 0, 100);
    }

    if (marine.injury === 'minor' && Math.random() < 0.3) {
      marine.injury = 'none';
    } else if (marine.injury === 'major' && Math.random() < 0.1) {
      marine.injury = 'minor';
    }

    if (marine.disciplineRisk > 30) {
      marine.disciplineRisk = clamp(marine.disciplineRisk - 1, 0, 100);
    }

    // ── Natural stat decay — requires active maintenance ───────────────
    // Physical fitness erodes without regular PT (focus_pt offsets this)
    marine.physicalFitness = clamp(marine.physicalFitness - 0.5, 0, 100);

    // MOS skills fade without practice (focus_mos offsets this)
    marine.mosProficiency = clamp(marine.mosProficiency - 0.3, 0, 100);

    // Chronic stress erodes proficiency & conduct over time
    if (marine.stress > 55) {
      marine.profConduct = clamp(marine.profConduct - 0.5, 0, 100);
    }

    // Marriage requires maintenance — family stability drifts without attention
    if (marine.isMarried) {
      marine.familyStability = clamp(marine.familyStability - 0.3, 0, 100);
    }

    Character.clampAll(marine);
  },
};
