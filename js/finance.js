/* ═══════════════════════════════════════════════
   FINANCE MODULE
   Pay tables, BAH, BAS, monthly budget calculations
   ═══════════════════════════════════════════════ */

const Finance = {

  // ── Base Pay Table (monthly, approximate 2003–2010 era) ──
  // Indexed by payGrade, then years-of-service tier
  BASE_PAY: {
    'E-1': 1100,
    'E-2': 1230,
    'E-3': 1295,
    'E-4': 1440,   // E-4 over 2 years
    'E-5': 1680,
    'E-6': 1850,
    'E-7': 2140,
    'E-8': 2560,
    'E-9': 3100,
  },

  // ── Retirement Base Pay (20-year career rate, 2024 DFAS values) ──
  // Used only for pension calculations; represents realistic pay at retirement grade
  // E-7 @ 20yr = $4,100 → 50% pension = $2,050/mo
  // E-9 @ 26yr = $7,500 → 50% pension = $3,750/mo
  RETIREMENT_BASE_PAY: {
    'E-4': 2900,
    'E-5': 3200,
    'E-6': 3700,
    'E-7': 4100,
    'E-8': 6200,
    'E-9': 7500,
  },

  // Seniority bonus (extra per 2 years of service beyond base, capped)
  SENIORITY_BONUS_PER_2YR: {
    'E-1': 0,
    'E-2': 0,
    'E-3': 0,
    'E-4': 50,
    'E-5': 80,
    'E-6': 100,
    'E-7': 120,
    'E-8': 150,
    'E-9': 180,
  },

  // ── BAH Rates (simplified — by cost-of-living zone, married vs single) ──
  BAH: {
    low:      { single: 500,  married: 750  },
    medium:   { single: 750,  married: 1050 },
    high:     { single: 950,  married: 1350 },
    very_high:{ single: 1200, married: 1650 },
    'n/a':    { single: 400,  married: 600  }, // deployed — receive partial BAH
  },

  // ── BAS (Base Allowance for Subsistence) ──
  BAS: 250,  // Enlisted monthly BAS (approximation)

  // ── Combat Pay / Special Pay ──
  COMBAT_PAY:  225,   // monthly when deployed to combat zone
  SEA_PAY:     150,   // monthly when underway (MEU)

  /** Calculate monthly gross pay */
  monthlyGross(marine) {
    const base  = Finance.BASE_PAY[marine.payGrade] || 1100;
    const tisYears = (marine.timeInService / 12);
    const seniorityTiers = Math.floor(tisYears / 2);
    const seniorityBonus = (Finance.SENIORITY_BONUS_PER_2YR[marine.payGrade] || 0) * Math.min(seniorityTiers, 6);

    const assignment = ASSIGNMENTS_DATA.find(a => a.id === marine.assignmentId) || ASSIGNMENTS_DATA[0];
    const col = assignment.costOfLiving || 'medium';
    const bahStatus = marine.isMarried ? 'married' : 'single';
    const bah = Finance.BAH[col][bahStatus];

    const bas = Finance.BAS;

    let special = 0;
    if (marine.isDeployed) {
      special += Finance.COMBAT_PAY;
      special += Finance.SEA_PAY;
    }

    return base + seniorityBonus + bah + bas + special;
  },

  /** Calculate monthly expenses (housing, food not on base, bills, etc.) */
  monthlyExpenses(marine) {
    let expenses = marine.monthlyExpenses;  // base personal expenses

    // Lifestyle discretionary spending (going out, entertainment, etc.)
    // lifestyleScore 1–5: adds $100–$500/month on top of base
    expenses += (marine.lifestyleScore || 2) * 100;

    // Children cost money
    expenses += (marine.childCount || 0) * 300;

    // Debt minimum payments (4% of debt monthly, minimum $50)
    if (marine.debt > 0) {
      expenses += Math.max(Math.round(marine.debt * 0.04), 50);
    }

    // Car loan payment (separate from general debt)
    if (marine.carLoanMonthsLeft > 0) {
      expenses += marine.carLoanMonthly || 0;
    }

    // Injury medical copays
    if (marine.injury === 'minor') expenses += 50;
    if (marine.injury === 'major') expenses += 200;

    return expenses;
  },

  /** Run monthly finance update — returns delta report */
  runMonthly(marine) {
    // 1. Apply monthly interest on outstanding debt (12% APR = 1%/month)
    if (marine.debt > 0) {
      marine.debt += Math.round(marine.debt * 0.01);
    }

    const gross    = Finance.monthlyGross(marine);
    const expenses = Finance.monthlyExpenses(marine);
    const net      = gross - expenses;

    // 2. Tick down car loan
    if (marine.carLoanMonthsLeft > 0) {
      marine.carLoanMonthsLeft = Math.max(0, marine.carLoanMonthsLeft - 1);
    }

    // 3. Pay goes into checking; bills come out of checking
    marine.checking = (marine.checking || 0) + net;

    // 4. Transfer from checking → savings per the player's savings goal
    if (marine.checking > 0) {
      const goal     = marine.savingsGoal || 0;
      const transfer = Math.min(goal, marine.checking);
      marine.checking -= transfer;
      marine.savings  += transfer;
      // Small morale bump when there's healthy discretionary cash left over
      if (marine.checking > 400) {
        marine.morale = clamp(marine.morale + 0.5, 0, 100);
      }
    }

    // 5. Checking deficit — drain savings, then spill into debt
    if (marine.checking < 0) {
      marine.savings += marine.checking;
      marine.checking = 0;
      if (marine.savings < 0) {
        marine.debt    += Math.abs(marine.savings);
        marine.savings  = 0;
      }
    }

    // 6. Financial stress / relief
    if (marine.debt > 10000) {
      marine.stress = clamp(marine.stress + 3, 0, 100);
    } else if (marine.debt > 5000) {
      marine.stress = clamp(marine.stress + 1, 0, 100);
    }
    if (marine.savings > 10000) {
      marine.stress = clamp(marine.stress - 1, 0, 100);
    }

    return { gross, expenses, net, savings: marine.savings, debt: marine.debt, checking: marine.checking };
  },

  /** Format a dollar amount for display — always full dollar figures */
  fmt(amount) {
    const n = Math.round(amount);
    if (n < 0) return `-$${(-n).toLocaleString()}`;
    return `$${n.toLocaleString()}`;
  },

  /**
   * Calculate the deployment pay breakdown for display on the event card.
   * Returns all components and tax-free savings estimates.
   * @param {object} marine
   * @param {number} months - deployment duration
   * @param {boolean} isCombat - true for combat zone (base pay also tax-free), false for MEU
   */
  deploymentBreakdown(marine, months, isCombat = false) {
    const base = Finance.BASE_PAY[marine.payGrade] || 1100;
    const tisYears = marine.timeInService / 12;
    const seniority = (Finance.SENIORITY_BONUS_PER_2YR[marine.payGrade] || 0) * Math.min(Math.floor(tisYears / 2), 6);
    const effectiveBase = base + seniority;

    // BAH — stays at home station rate while deployed (Marines keep home BAH)
    const assignment = ASSIGNMENTS_DATA.find(a => a.id === marine.assignmentId) || ASSIGNMENTS_DATA[0];
    const col = assignment.costOfLiving || 'medium';
    const bahStatus = marine.isMarried ? 'married' : 'single';
    const bah = Finance.BAH[col][bahStatus];

    const bas = Finance.BAS;
    const combatPay = Finance.COMBAT_PAY;   // HFP/IDP — always tax-free
    const seaPay    = Finance.SEA_PAY;       // included in both MEU and combat
    const specialPay = combatPay + seaPay;

    const monthlyTotal = effectiveBase + bah + bas + specialPay;

    // Tax-free savings: in a combat zone, base pay + special pay = tax-free
    // Estimate using 22% effective federal rate (rough E3–E6 bracket)
    const TAX_RATE = 0.22;
    const taxableDeploy   = isCombat ? 0 : effectiveBase;   // combat = fully tax-free base pay
    const taxFreeAmt      = isCombat ? effectiveBase + specialPay : specialPay;
    const monthlyTaxSaved = Math.round(taxFreeAmt * TAX_RATE);
    const totalTaxSaved   = monthlyTaxSaved * months;
    const totalEarnings   = monthlyTotal * months;

    return {
      effectiveBase, bah, bas, specialPay, combatPay, seaPay,
      monthlyTotal, monthlyTaxSaved, totalTaxSaved, totalEarnings,
      months, isCombat,
    };
  },
};
