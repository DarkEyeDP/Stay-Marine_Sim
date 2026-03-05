/* ═══════════════════════════════════════════════
   EVENTS MODULE
   Roll and resolve random events each month
   ═══════════════════════════════════════════════ */

const Events = {

  /** Roll for 0 or 1 random events this month */
  rollEvent(marine, forced = false) {
    // Base 35% chance of a second event; first event is always guaranteed
    if (!forced && Math.random() > 0.35) return null;

    // Filter eligible events — exclude recently fired events (last 2 quarters / 6 slots)
    const recentIds = (State.game && State.game.recentEventIds) || [];
    const eligible = EVENTS_DATA.filter(evt =>
      Events._meetsConditions(evt, marine) && !recentIds.includes(evt.id)
    );
    if (eligible.length === 0) return null;

    // Weight-based selection
    const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    let selected = eligible[eligible.length - 1];
    for (const evt of eligible) {
      roll -= evt.weight;
      if (roll <= 0) { selected = evt; break; }
    }

    // For deployment events, pick a random destination and attach it
    if (selected.deployLocations && selected.deployLocations.length) {
      const loc = selected.deployLocations[Math.floor(Math.random() * selected.deployLocations.length)];
      return Object.assign({}, selected, { chosenLocation: loc });
    }

    return selected;
  },

  /** Check if an event's trigger conditions are met */
  _meetsConditions(evt, marine) {
    const t = evt.trigger || {};
    if (t.minTIS         !== undefined && marine.timeInService < t.minTIS)             return false;
    if (t.maxTIS         !== undefined && marine.timeInService > t.maxTIS)             return false;
    if (t.minPhysical    !== undefined && marine.physicalFitness < t.minPhysical)      return false;
    if (t.maxPhysical    !== undefined && marine.physicalFitness > t.maxPhysical)      return false;
    if (t.minProfConduct !== undefined && marine.profConduct < t.minProfConduct)       return false;
    if (t.maxDiscipline  !== undefined && marine.disciplineRisk > t.maxDiscipline)     return false;
    if (t.minDisciplineRisk !== undefined && marine.disciplineRisk < t.minDisciplineRisk) return false;
    if (t.maxSavings     !== undefined && marine.savings > t.maxSavings)               return false;
    if (t.minSavings     !== undefined && marine.savings < t.minSavings)               return false;
    if (t.minDebt        !== undefined && marine.debt < t.minDebt)                     return false;
    if (t.maxDebt        !== undefined && marine.debt > t.maxDebt)                     return false;
    if (t.isDeployed     !== undefined && marine.isDeployed !== t.isDeployed)          return false;
    if (t.notDeployed       === true && marine.isDeployed)                             return false;
    if (t.notOrdersDeclined === true && marine.ordersDeclined)                         return false;
    if (t.isMarried      !== undefined && marine.isMarried !== t.isMarried)            return false;
    if (t.optemoMin      !== undefined && marine.optempo < t.optemoMin)                return false;
    if (t.minOptempo     !== undefined && marine.optempo < t.minOptempo)               return false;
    if (t.mosField            !== undefined && marine.mosField !== t.mosField)              return false;
    if (t.mosFields           !== undefined && !t.mosFields.includes(marine.mosField))      return false;
    if (t.retirementSubmitted !== undefined && !!marine.retirementSubmitted !== t.retirementSubmitted) return false;
    return true;
  },

  /** Resolve a player's choice for an event and return log entry */
  resolveChoice(marine, evt, choiceIndex) {
    const choice = evt.choices[choiceIndex];
    if (!choice) return;

    // Apply stat effects
    Character.applyEffects(marine, choice.effects || {});

    // Handle special choice flags
    if (choice.setMarried !== undefined) marine.isMarried = choice.setMarried;
    if (choice.bahIncrease)    marine.monthlyExpenses -= 150;  // married BAH offset
    if (choice.addChild)       marine.childCount = (marine.childCount || 0) + 1;
    if (choice.setInjury)      marine.injury = choice.setInjury;
    if (choice.meritoriousPromo) {
      // Trigger early promotion check
      Career.checkCompetitivePromotion(marine);
    }
    if (choice.combatAwardChance && Math.random() < choice.combatAwardChance) {
      marine.awards.push('Combat Action Ribbon');
      marine.profConduct = clamp(marine.profConduct + 3, 0, 100);
    }
    if (choice.njpRisk && Math.random() < choice.njpRisk) {
      marine.profConduct  = clamp(marine.profConduct  - 12, 0, 100);
      marine.reputationWithLeadership = clamp(marine.reputationWithLeadership - 10, 0, 100);
    }
    if (choice.injuryEscalateChance && Math.random() < choice.injuryEscalateChance) {
      marine.injury = 'major';
      marine.physicalFitness = clamp(marine.physicalFitness - 10, 0, 100);
    }
    if (choice.ptRetestChance) {
      if (Math.random() < choice.ptRetestChance) {
        marine.physicalFitness = clamp(marine.physicalFitness + 8, 0, 100);
        marine.profConduct     = clamp(marine.profConduct + 3, 0, 100);
      }
    }
    if (choice.reconAttempt) {
      if (marine.physicalFitness >= 90) {
        marine.certs.push('Recon Indoc Complete');
        marine.mosProficiency = clamp(marine.mosProficiency + 15, 0, 100);
        marine.physicalFitness = clamp(marine.physicalFitness + 5, 0, 100);
      } else {
        marine.stress = clamp(marine.stress + 15, 0, 100);
        marine.morale = clamp(marine.morale  - 10, 0, 100);
      }
    }
    if (choice.loanResolve) {
      // 50% chance buddy pays back
      if (Math.random() < 0.5) {
        marine.savings += 300;
        marine.networkStrength = clamp(marine.networkStrength + 3, 0, 100);
      } else {
        marine.morale = clamp(marine.morale - 3, 0, 100);
      }
    }

    // New car purchase — financing trap revealed on next advance
    if (choice.buyNewCar) {
      const CAR_PRICE = 25000;
      if (marine.savings >= 40000) {
        // Can pay cash — deduct the price outright
        marine.savings -= CAR_PRICE;
      } else {
        // Forced to finance at 20% APR, 60 months → ~$661/month
        marine.carLoanMonthly    = 661;
        marine.carLoanMonthsLeft = 60;
        marine.pendingCarLoanReveal = true;
      }
    }

    // School orders — grant the next resident PME if eligible
    if (choice.triggerSchoolSelect) {
      const nextPME = Career._nextRequiredPME(marine);
      const residentSchools = ['Career Course', 'SNCO Academy (resident)', 'SgtMaj Academy'];
      if (nextPME && residentSchools.includes(nextPME)) {
        marine.pmeCompleted.push(nextPME);
        marine.reputationWithLeadership = clamp(marine.reputationWithLeadership + 5, 0, 100);
      }
    }

    // Handle deployment flag
    if (evt.setDeployed) {
      marine.isDeployed = true;
      marine.deploymentMonthsLeft = evt.duration || 7;
    }

    Character.clampAll(marine);
    return choice.logEntry;
  },

  /**
   * Roll the next EAS wind-down event from the EVENTS_EAS pool.
   * Events are returned in sequential order; already-seen IDs (via recentEventIds)
   * are skipped so each fires once before cycling.
   */
  rollEASPrepEvent() {
    const recentIds = (State.game && State.game.recentEventIds) || [];
    const next = EVENTS_EAS.find(e => !recentIds.includes(e.id));
    return next || null;
  },

  /** Check if a deployment is ending this month */
  checkDeploymentEnd(marine) {
    if (!marine.isDeployed) return false;
    marine.deploymentMonthsLeft--;
    if (marine.deploymentMonthsLeft <= 0) {
      marine.isDeployed = false;
      marine.deploymentMonthsLeft = 0;
      // Return home: family boost, stress reduction
      marine.familyStability = clamp(marine.familyStability + 5, 0, 100);
      marine.morale          = clamp(marine.morale + 8, 0, 100);
      marine.stress          = clamp(marine.stress - 8, 0, 100);
      return true;
    }
    return false;
  },
};
