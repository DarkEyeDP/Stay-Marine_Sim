/* ===============================================
   FINANCE MODULE
   Pay tables, BAH, BAS, monthly budget calculations
   =============================================== */

const Finance = {

  // Base Pay Table (monthly, approximate 2003-2010 era)
  BASE_PAY: {
    'E-1': 1100,
    'E-2': 1230,
    'E-3': 1295,
    'E-4': 1440,
    'E-5': 1680,
    'E-6': 1850,
    'E-7': 2140,
    'E-8': 2560,
    'E-9': 3100,
  },

  // Used only for pension calculations; represents realistic pay at retirement grade.
  RETIREMENT_BASE_PAY: {
    'E-4': 2900,
    'E-5': 3200,
    'E-6': 3700,
    'E-7': 4100,
    'E-8': 6200,
    'E-9': 7500,
  },

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

  BAH: {
    low: { single: 500, married: 750 },
    medium: { single: 750, married: 1050 },
    high: { single: 950, married: 1350 },
    very_high: { single: 1200, married: 1650 },
    'n/a': { single: 400, married: 600 },
  },

  BAS: 250,
  COMBAT_PAY: 225,
  SEA_PAY: 150,

  assignment(marine) {
    return ASSIGNMENTS_DATA.find(a => a.id === marine.assignmentId) || ASSIGNMENTS_DATA[0];
  },

  bahEligible(marine) {
    const gradeOrder = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9'];
    const gradeIdx = gradeOrder.indexOf(marine.payGrade);
    return !!marine.isMarried || gradeIdx >= gradeOrder.indexOf('E-6');
  },

  monthlyBah(marine) {
    if (!Finance.bahEligible(marine)) return 0;
    const assignment = Finance.assignment(marine);
    const col = assignment.costOfLiving || 'medium';
    const bahStatus = marine.isMarried ? 'married' : 'single';
    return (Finance.BAH[col] && Finance.BAH[col][bahStatus]) || 0;
  },

  monthlyGross(marine) {
    const base = Finance.BASE_PAY[marine.payGrade] || 1100;
    const tisYears = marine.timeInService / 12;
    const seniorityTiers = Math.floor(tisYears / 2);
    const seniorityBonus = (Finance.SENIORITY_BONUS_PER_2YR[marine.payGrade] || 0) * Math.min(seniorityTiers, 6);
    const bah = Finance.monthlyBah(marine);
    const bas = Finance.BAS;

    let special = 0;
    if (marine.isDeployed) {
      special += Finance.COMBAT_PAY;
      special += Finance.SEA_PAY;
    }

    return base + seniorityBonus + bah + bas + special;
  },

  costOfLivingExpenseAdjustment(marine) {
    const col = Finance.assignment(marine).costOfLiving || 'medium';
    return {
      low: 0,
      medium: 50,
      high: 125,
      very_high: 225,
      'n/a': 25,
    }[col] || 0;
  },

  lifestyleExpense(marine) {
    const score = Math.max(1, Math.min(5, marine.lifestyleScore || 3));
    return {
      1: 75,
      2: 175,
      3: 325,
      4: 525,
      5: 775,
    }[score] || 325;
  },

  minimumDebtPayment(marine) {
    if ((marine.debt || 0) <= 0) return 0;
    return Math.max(Math.round(marine.debt * 0.03), 50);
  },

  monthlyExpenses(marine) {
    let expenses = marine.monthlyExpenses;
    expenses += Finance.costOfLivingExpenseAdjustment(marine);
    expenses += Finance.lifestyleExpense(marine);
    expenses += (marine.childCount || 0) * 300;
    if (marine.carLoanMonthsLeft > 0) {
      expenses += marine.carLoanMonthly || 0;
    }

    if (marine.injury === 'minor') expenses += 50;
    if (marine.injury === 'major') expenses += 200;

    return expenses;
  },

  runMonthly(marine) {
    if (marine.debt > 0) {
      marine.debt += Math.round(marine.debt * 0.01);
    }

    const gross = Finance.monthlyGross(marine);
    const expenses = Finance.monthlyExpenses(marine);
    const net = gross - expenses;
    if (marine.carLoanMonthsLeft > 0) {
      marine.carLoanMonthsLeft = Math.max(0, marine.carLoanMonthsLeft - 1);
    }

    marine.checking = (marine.checking || 0) + net;

    if (marine.checking > 0) {
      const goal = marine.savingsGoal || 0;
      const transfer = Math.min(goal, marine.checking);
      marine.checking -= transfer;
      marine.savings += transfer;
      if (marine.checking > 350) {
        marine.morale = clamp(marine.morale + 0.5, 0, 100);
      }
    }

    if (marine.checking < 0) {
      marine.savings += marine.checking;
      marine.checking = 0;
      if (marine.savings < 0) {
        marine.debt += Math.abs(marine.savings);
        marine.savings = 0;
      }
    }

    if (marine.debt > 10000) {
      marine.stress = clamp(marine.stress + 3, 0, 100);
      marine.morale = clamp(marine.morale - 1, 0, 100);
    } else if (marine.debt > 5000) {
      marine.stress = clamp(marine.stress + 1, 0, 100);
    }

    if ((marine.checking || 0) < 100 && (marine.savings || 0) < 500) {
      marine.stress = clamp(marine.stress + 1, 0, 100);
      marine.morale = clamp(marine.morale - 1, 0, 100);
    }

    if (marine.savings > 10000) {
      marine.stress = clamp(marine.stress - 1, 0, 100);
    }

    return {
      gross,
      expenses,
      net,
      savings: marine.savings,
      debt: marine.debt,
      checking: marine.checking,
    };
  },

  fmt(amount) {
    const n = Math.round(amount);
    if (n < 0) return '-$' + (-n).toLocaleString();
    return '$' + n.toLocaleString();
  },

  deploymentBreakdown(marine, months, isCombat = false) {
    const base = Finance.BASE_PAY[marine.payGrade] || 1100;
    const tisYears = marine.timeInService / 12;
    const seniority = (Finance.SENIORITY_BONUS_PER_2YR[marine.payGrade] || 0) * Math.min(Math.floor(tisYears / 2), 6);
    const effectiveBase = base + seniority;
    const bah = Finance.monthlyBah(marine);
    const bas = Finance.BAS;
    const combatPay = Finance.COMBAT_PAY;
    const seaPay = Finance.SEA_PAY;
    const specialPay = combatPay + seaPay;
    const monthlyTotal = effectiveBase + bah + bas + specialPay;
    const taxRate = 0.22;
    const taxFreeAmt = isCombat ? effectiveBase + specialPay : specialPay;
    const monthlyTaxSaved = Math.round(taxFreeAmt * taxRate);
    const totalTaxSaved = monthlyTaxSaved * months;
    const totalEarnings = monthlyTotal * months;

    return {
      effectiveBase,
      bah,
      bas,
      specialPay,
      combatPay,
      seaPay,
      monthlyTotal,
      monthlyTaxSaved,
      totalTaxSaved,
      totalEarnings,
      months,
      isCombat,
    };
  },
};

