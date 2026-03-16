/* ═══════════════════════════════════════════════
   MONTHLY TURN ENGINE
   Each "turn" now advances 3 months (one quarter).
   ═══════════════════════════════════════════════ */

const Engine = {

  // ── Quarterly focus choices ─────────────────
  // cost: bandwidth points required to select this choice (budget = Engine.focusBudget())
  MONTHLY_CHOICES: [
    // ── Cost 3 ────────────────────────────────────────────────────────
    {
      id: 'focus_education',
      label: 'Take college courses (TA)',
      hint: '+Edu Credits, +Civilian Employ., +Stress, -Family, -MOS Focus',
      effects: { educationCredits: 6, civilianEmployability: 4, stress: 4, familyStability: -6, mosProficiency: -4 },
      cost: 3,
      unavailableWhenDeployed: true,
    },
    {
      id: 'focus_pme',
      label: 'Complete PME / correspondence course',
      hint: '+PME unlocked, +ProCon — required for promotion to next grade',
      effects: { profConduct: 3, mosProficiency: 3, stress: 4 },
      cost: 3,
      requiresNextDistancePME: true,
    },
    {
      id: 'focus_cover_down',
      label: 'Cover down on a vacant billet (deployed)',
      hint: '+ProCon, +Reputation, ++Stress — prove yourself downrange',
      effects: { profConduct: 5, reputationWithLeadership: 8, mosProficiency: 4, stress: 10 },
      cost: 3,
      requiresDeployed: true,
    },
    // ── Cost 2 ────────────────────────────────────────────────────────
    {
      id: 'focus_pt',
      label: 'Train PT hard this quarter',
      hint: '+Physical Fitness, +Stress (unavailable with major injury)',
      effects: { physicalFitness: 6, stress: 4 },
      cost: 2,
      unavailableWithMajorInjury: true,
    },
    {
      id: 'focus_mos',
      label: 'Sharpen MOS skills',
      hint: '+MOS Proficiency, +Promotion score, -Stress',
      effects: { mosProficiency: 6, stress: -2 },
      cost: 2,
    },
    {
      id: 'focus_volunteer',
      label: 'Volunteer for extra duties',
      hint: '+ProCon, +Reputation, +Stress',
      effects: { profConduct: 4, reputationWithLeadership: 6, stress: 6 },
      cost: 2,
    },
    {
      id: 'focus_savings',
      label: 'Side hustle / cut expenses',
      hint: '+$600 Savings, -Morale, lower lifestyle spending this quarter',
      effects: { savings: 600, morale: -4, lifestyleScore: -1, savingsGoal: 50 },
      cost: 2,
    },
    {
      id: 'focus_live_fast',
      label: 'Blow the paycheck on libo',
      hint: '++Morale, -Stress now, but +Lifestyle spending and debt temptation',
      effects: { morale: 8, stress: -4, lifestyleScore: 1, savingsGoal: -100, debt: 200 },
      cost: 1,
      unavailableWhenDeployed: true,
    },
    {
      id: 'focus_budget_lockdown',
      label: 'Barracks monk mode',
      hint: '+Savings goal, -Lifestyle spending, -Morale, better long-term stability',
      effects: { morale: -5, stress: 2, lifestyleScore: -1, savingsGoal: 150, savings: 250 },
      cost: 1,
    },
    {
      id: 'focus_reset_budget',
      label: 'Reset the budget',
      hint: 'Trim the nonsense without becoming miserable',
      effects: { morale: 1, stress: -2, savingsGoal: 50 },
      cost: 1,
    },
    {
      id: 'focus_network',
      label: 'Build professional relationships',
      hint: '+NetworkStrength, +Reputation',
      effects: { networkStrength: 6, reputationWithLeadership: 4 },
      cost: 2,
    },
    {
      id: 'focus_leadership',
      label: 'Develop your junior Marines',
      hint: '+Reputation, +ProCon, +Network — NCO responsibility',
      effects: { reputationWithLeadership: 6, profConduct: 4, networkStrength: 4, stress: 3 },
      cost: 2,
      requiresMinRank: 'E-5',
    },
    // ── Cost 2 — MOS-specific ─────────────────────────────────────────
    {
      id: 'focus_mos_intel_tradecraft',
      label: 'Refine analytical tradecraft',
      hint: '+MOS Proficiency, +Civilian Employability — your clearance is money in the bank',
      effects: { mosProficiency: 5, civilianEmployability: 5, stress: 3 },
      cost: 2,
      requiresMosField: 'intelligence',
    },
    {
      id: 'focus_mos_it_certs',
      label: 'Study for civilian IT certifications (CompTIA/CCNA)',
      hint: '+Civilian Employ. significantly, +Edu Credits — certs transfer directly to civilian market',
      effects: { civilianEmployability: 8, educationCredits: 3, mosProficiency: 3, stress: 5 },
      cost: 2,
      requiresMosField: 'communications',
    },
    {
      id: 'focus_mos_cdl_prep',
      label: 'Study and test for CDL certification',
      hint: '+Civilian Employ. significantly — a CDL opens trucking and fleet management doors after EAS',
      effects: { civilianEmployability: 10, stress: 4 },
      cost: 2,
      requiresMosField: 'motor_t',
    },
    {
      id: 'focus_mos_law_study',
      label: 'Study criminal justice and law enforcement procedure',
      hint: '+Civilian Employ., +MOS Proficiency — police departments value trained Marine vets',
      effects: { civilianEmployability: 6, mosProficiency: 4, educationCredits: 2, stress: 4 },
      cost: 2,
      requiresMosField: 'law_enforcement',
    },
    {
      id: 'focus_mos_arff_drills',
      label: 'Lead extra emergency response drills',
      hint: '+MOS Proficiency, +ProCon, +Reputation — ARFF certifications carry weight in civilian aviation',
      effects: { mosProficiency: 6, profConduct: 3, reputationWithLeadership: 5, stress: 4 },
      cost: 2,
      requiresMosField: 'aviation',
    },
    // ── Cost 1 ────────────────────────────────────────────────────────
    {
      id: 'focus_leave',
      label: 'Take leave — get away from the grind',
      hint: '++Morale, -Stress — earned time off makes a real difference',
      effects: { morale: 10, stress: -5 },
      cost: 1,
      unavailableWhenDeployed: true,
    },
    {
      id: 'focus_recovery',
      label: 'Rest and recover (lay low)',
      hint: '-Stress significantly, slight reputation cost, minor morale lift',
      effects: { stress: -12, morale: 2, reputationWithLeadership: -2 },
      cost: 1,
    },
    {
      id: 'focus_family',
      label: 'Invest time in family',
      hint: '++FamilyStability, -Stress, modest morale lift',
      effects: { familyStability: 10, morale: 3, stress: -4 },
      cost: 1,
      unavailableWhenDeployed: true,
    },
    {
      id: 'focus_paydebt',
      label: 'Make extra debt payment',    // overridden by dynamicLabel at render time
      hint:  'Pay toward debt from savings, -Stress',
      dynamicLabel: (m) => `Make extra debt payment (${Finance.fmt(Math.min(m.debt, 1500))})`,
      dynamicHint:  (m) => `-${Finance.fmt(Math.min(m.debt, 1500))} from savings → debt paydown · -Stress`,
      effects: {},    // handled specially in applyFocusChoice — NOT applied via Character.applyEffects
      cost: 1,
      requiresSavings: 1500,
      requiresDebt: true,
    },
  ],

  /**
   * Calculate available bandwidth for the quarter.
   * Base 5 + rank bonus (E-7/E-8 +1, E-9 +2) − stress penalty (>70 → -1, >85 → -2). Min 2.
   */
  focusBudget(marine) {
    const rankBonus = { 'E-7': 1, 'E-8': 1, 'E-9': 2 }[marine.payGrade] || 0;
    const stressPenalty = marine.stress > 85 ? 2 : marine.stress > 70 ? 1 : 0;
    return Math.max(2, 5 + rankBonus - stressPenalty);
  },

  /**
   * Run one quarter (3 months) of simulation.
   * Reenlistment window check is handled in main.js BEFORE calling runMonth.
   */
  runMonth() {
    const g = State.game;
    const m = g.marine;
    const result = {
      promotions:      [],
      alerts:          [],
      events:          [],
      financeReport:   null,
      deploymentEnded: false,
      gameOver:        false,
      endState:        null,
    };

    // ── Step 1: Advance time (3 months) ─────────
    m.timeInService    += 3;
    m.timeInGrade      += 3;
    m.monthsAtStation   = (m.monthsAtStation || 0) + 3;
    for (let i = 0; i < 3; i++) State.advanceMonth();

    // ── Step 2: Finance (3 months) ──────────────
    let finGross = 0, finExp = 0, finNet = 0;
    for (let i = 0; i < 3; i++) {
      const fr = Finance.runMonthly(m);
      finGross += fr.gross;
      finExp   += fr.expenses;
      finNet   += fr.net;
    }
    result.financeReport = { gross: finGross, expenses: finExp, net: finNet };

    // ── Step 3: Deployment countdown ────────────
    for (let i = 0; i < 3; i++) {
      const ended = Events.checkDeploymentEnd(m);
      if (ended && !result.deploymentEnded) {
        result.deploymentEnded = true;
        result.alerts.push({ type: 'good', text: 'You\'ve returned from deployment. Welcome home, Marine.' });
        g.log.unshift({ date: Engine._dateStr(), text: 'Returned from deployment.', major: true });
      }
    }

    // ── Step 4: Roll events this quarter ────────
    if (State.game.easDecided) {
      // EAS wind-down: inject one sequential out-processing event per quarter
      const easEvt = Events.rollEASPrepEvent();
      if (easEvt) result.events.push(easEvt);
    } else {
      const e1 = Events.rollEvent(m, true);   // guaranteed first event
      if (e1) result.events.push(e1);
      if (Math.random() < 0.45) {
        const e2 = Events.rollEvent(m);       // optional second event (35% gate inside)
        if (e2 && (!e1 || e2.id !== e1.id)) result.events.push(e2);
      }
    }

    // ── Step 5: Focus choice already applied ────
    // (Engine.applyFocusChoice called by main.js before runMonth)

    // ── Step 6: Stat drift (3 months) ───────────
    for (let i = 0; i < 3; i++) Career.monthlyDrift(m);

    // ── Step 7: Career checks ────────────────────
    const autoProm = Career.checkAutomaticPromotion(m);
    if (autoProm) {
      result.promotions.push(autoProm);
      result.alerts.push({ type: 'promo', text: `PROMOTED to ${autoProm.abbr} — ${autoProm.title}` });
      g.log.unshift({ date: Engine._dateStr(), text: `Promoted to ${autoProm.abbr}.`, major: true });
    }

    const compProm = Career.checkCompetitivePromotion(m);
    if (compProm) {
      result.promotions.push(compProm);
      result.alerts.push({ type: 'promo', text: `PROMOTED to ${compProm.abbr} — ${compProm.title}` });
      g.log.unshift({ date: Engine._dateStr(), text: `Promoted to ${compProm.abbr}.`, major: true });
    }

    // ── Step 8: Periodic awards (once per quarter) ──
    Career.checkPeriodicAwards(m, g, Engine._dateStr());

    // ── Step 9: Progress tracks updated by UI ───

    // ── Step 10: End-state checks ─────────────────
    if (m.profConduct < 15) {
      result.gameOver = true;
      result.endState = 'bad_discharge';
    } else if (m.injury === 'major' && m.stress >= 95) {
      result.gameOver = true;
      result.endState = 'medical_discharge';
    } else if (m.timeInService >= 300) {
      // Absolute 25-year hard cap — career must end
      result.gameOver = true;
      result.endState = Career.determineEndState(m, m.timeInService);
    }

    // ── Step 10: Save ────────────────────────────
    State.save();
    return result;
  },

  /** Apply the player's quarterly focus choice */
  applyFocusChoice(choiceId) {
    const choice = Engine.MONTHLY_CHOICES.find(c => c.id === choiceId);
    if (!choice) return;
    const m = State.game.marine;

    // ── Special case: debt payment uses the ACTUAL debt amount, not a fixed $1,500 ──
    if (choiceId === 'focus_paydebt') {
      const payAmount = Math.min(m.debt, 1500);
      m.savings = Math.max(0, m.savings - payAmount);
      m.debt    = Math.max(0, m.debt    - payAmount);
      m.stress  = clamp(m.stress - 4, 0, 100);
      m.morale  = clamp(m.morale + 3, 0, 100);
      m.savingsGoal = Math.max(0, (m.savingsGoal || 0) - 50);
      State.game.log.unshift({ date: Engine._dateStr(), text: `Extra debt payment: ${Finance.fmt(payAmount)}`, major: false });
      State.save();
      return;   // skip generic applyEffects and generic log entry
    }

    Character.applyEffects(m, choice.effects || {});

    // Volunteer focus: track count and award MOVSM every 3 times
    if (choiceId === 'focus_volunteer') {
      m.volunteerCount = (m.volunteerCount || 0) + 1;
      if (m.volunteerCount % 3 === 0) {
        m.awards.push('Military Outstanding Volunteer Service Medal');
        State.game.log.unshift({ date: Engine._dateStr(), text: 'Awarded: Military Outstanding Volunteer Service Medal', major: true });
      }
    }

    // PME focus: grant the next distance-learning course
    if (choiceId === 'focus_pme') {
      const nextPME = Career._nextRequiredPME(m);
      if (nextPME) {
        m.pmeCompleted.push(nextPME);
        State.game.log.unshift({ date: Engine._dateStr(), text: `PME completed: ${nextPME}`, major: true });
      }
    }

    State.game.log.unshift({ date: Engine._dateStr(), text: `Focus: ${choice.label}`, major: false });
    State.save();
  },

  /** Return focus choices available given marine's current state and context */
  availableChoices(marine) {
    const gradeOrder = ['E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9'];
    const currentRankIdx = gradeOrder.indexOf(marine.payGrade);
    // Distance-learning PME that can be completed without school orders
    const DISTANCE_PME = ['Marine Net: Cpl Course', "Sergeant's Course"];

    return Engine.MONTHLY_CHOICES.filter(c => {
      // Finance-gated
      if (c.requiresDebt && marine.debt < 100) return false;
      if (c.requiresSavings) {
        // For debt payment: only need enough savings to cover the actual debt (not always $1,500)
        const needed = c.id === 'focus_paydebt' ? Math.min(marine.debt, c.requiresSavings) : c.requiresSavings;
        if (marine.savings < needed) return false;
      }
      // Deployment context
      if (c.unavailableWhenDeployed && marine.isDeployed)           return false;
      if (c.requiresDeployed        && !marine.isDeployed)          return false;
      // Orders declined — TA requires command endorsement, which won't come
      if (c.id === 'focus_education' && marine.ordersDeclined)      return false;
      // Injury gate — intense PT not available with major injury
      if (c.unavailableWithMajorInjury && marine.injury === 'major') return false;
      // Rank gate
      if (c.requiresMinRank) {
        const minIdx = gradeOrder.indexOf(c.requiresMinRank);
        if (currentRankIdx < minIdx) return false;
      }
      // PME gate — only show when a distance PME course is needed for the NEXT promotion
      if (c.requiresNextDistancePME) {
        const nextGrade = gradeOrder[currentRankIdx + 1];
        const reqForNextGrade = PME_REQUIREMENTS[nextGrade] || [];
        const nextPME = Career._nextRequiredPME(marine);
        if (!nextPME || !DISTANCE_PME.includes(nextPME) || !reqForNextGrade.includes(nextPME)) return false;
      }
      // MOS field gate
      if (c.requiresMosField && marine.mosField !== c.requiresMosField) return false;
      if (c.requiresMosFields && !c.requiresMosFields.includes(marine.mosField)) return false;
      return true;
    });
  },

  _dateStr() {
    const g = State.game;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[g.month - 1]} ${g.year}`;
  },
};


