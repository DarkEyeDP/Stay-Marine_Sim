/* ═══════════════════════════════════════════════
   PCS MODULE
   Permanent Change of Station — duty station rotation
   ═══════════════════════════════════════════════ */

const PCS = {

  /**
   * Check if PCS orders should be cut this quarter.
   * - Not eligible if currently deployed.
   * - IPCOT protection: no PCS within 12 months of EAS.
   * - Eligible after 30 months at first station, 36–48 months at subsequent stations.
   */
  isPCSDue(marine) {
    if (marine.isDeployed) return false;
    if (marine.ordersDeclined) return false;   // locked out for remainder of contract
    const monthsToEAS = marine.contractEnd - marine.timeInService;
    if (monthsToEAS <= 12) return false;   // too close to EAS — IPCOT protection
    const threshold = marine.pcsEligibleAt || 24;
    return (marine.monthsAtStation || 0) >= threshold;
  },

  /**
   * Return up to 4 eligible duty station options for this marine.
   * Stations are filtered by MOS field compatibility.
   * The 4 options are chosen to offer distinct trade-offs:
   *   1. Corps needs  — highest optempo, career-beneficial
   *   2. QOL pick     — best morale + lifestyle combo
   *   3. Overseas     — if an overseas-eligible station exists
   *   4. Family/budget — best family effect (if married) or lowest CoL
   */
  getOptions(marine) {
    const eligible = ASSIGNMENTS_DATA.filter(a =>
      a.id !== marine.assignmentId &&
      !a.isDeployment &&
      (a.availableFields.includes('all') || a.availableFields.includes(marine.mosField))
    );

    // Fallback: if MOS field has no other compatible stations, offer any non-current non-deployment station
    if (eligible.length === 0) {
      return ASSIGNMENTS_DATA.filter(a => a.id !== marine.assignmentId && !a.isDeployment).slice(0, 4);
    }

    if (eligible.length <= 4) return eligible;

    const chosen = new Set();
    const pick   = [];

    // 1. Corps needs: high optempo (career-building, more deployments)
    const careerPick = [...eligible].sort((a, b) => b.optempo - a.optempo)[0];
    if (careerPick && !chosen.has(careerPick.id)) {
      pick.push(careerPick);
      chosen.add(careerPick.id);
    }

    // 2. QOL pick: best combined morale + lifestyle score
    const qolPick = [...eligible].sort(
      (a, b) => (b.moraleEffect + b.lifestyleScore) - (a.moraleEffect + a.lifestyleScore)
    )[0];
    if (qolPick && !chosen.has(qolPick.id)) {
      pick.push(qolPick);
      chosen.add(qolPick.id);
    }

    // 3. Overseas pick (Okinawa or Hawaii, if MOS-eligible)
    const overseasPick = eligible.find(
      a => (a.region === 'Overseas' || a.region === 'Hawaii') && !chosen.has(a.id)
    );
    if (overseasPick) {
      pick.push(overseasPick);
      chosen.add(overseasPick.id);
    }

    // 4. Family-friendly (married) or budget pick (single)
    const remaining = eligible.filter(a => !chosen.has(a.id));
    if (remaining.length > 0) {
      const colOrder = { low: 0, medium: 1, high: 2, very_high: 3, 'n/a': 4 };
      const lastPick = marine.isMarried
        ? remaining.sort((a, b) => b.familyEffect - a.familyEffect)[0]
        : remaining.sort((a, b) => (colOrder[a.costOfLiving] || 0) - (colOrder[b.costOfLiving] || 0))[0];
      if (lastPick) {
        pick.push(lastPick);
        chosen.add(lastPick.id);
      }
    }

    // Pad to 4 if any category produced duplicates
    for (const a of eligible) {
      if (pick.length >= 4) break;
      if (!chosen.has(a.id)) { pick.push(a); chosen.add(a.id); }
    }

    return pick;
  },

  /**
   * Calculate out-of-pocket moving costs.
   * DPS covers most of it — but there are always gaps Marines pay themselves.
   */
  movingCost(marine, station) {
    if (station.region === 'Overseas' || station.region === 'Hawaii') return 5000;
    return marine.isMarried ? 3000 : 1200;
  },

  /**
   * Apply a PCS move. Updates station, resets monthsAtStation,
   * adjusts optempo, applies moving stress and adjustment effects.
   */
  apply(marine, stationId) {
    const station = ASSIGNMENTS_DATA.find(a => a.id === stationId);
    if (!station) return;

    // Deduct moving costs — can go into debt
    const cost = PCS.movingCost(marine, station);
    marine.savings -= cost;
    if (marine.savings < 0) {
      marine.debt   += Math.abs(marine.savings);
      marine.savings = 0;
    }

    // Update assignment
    marine.assignmentId    = stationId;
    marine.monthsAtStation = 0;
    marine.optempo         = station.optempo;
    // Randomize next PCS window: 36–48 months (3–4 year tours, 3-month steps)
    marine.pcsEligibleAt   = 36 + Math.floor(Math.random() * 5) * 3;

    // Moving stress and adjustment period
    marine.stress         = clamp(marine.stress         + 8,  0, 100);
    marine.morale         = clamp(marine.morale         - 3,  0, 100);
    marine.mosProficiency = clamp(marine.mosProficiency - 4,  0, 100);

    // New station's environmental effects (half-strength on arrival)
    marine.morale          = clamp(marine.morale + Math.round(station.moraleEffect  / 2), 0, 100);
    marine.familyStability = clamp(marine.familyStability + Math.round(station.familyEffect / 2), 0, 100);

    Character.clampAll(marine);
    Achievements.recordAssignment(State.game, stationId, true);
  },

  /** Human-readable optempo label */
  _optempoLabel(level) {
    return ['', 'Low', 'Moderate', 'High', 'Very High', 'Extreme'][level] || '?';
  },

  /** Human-readable cost-of-living label */
  _colLabel(col) {
    const map = { low: 'Low', medium: 'Moderate', high: 'High', very_high: 'Very High', 'n/a': 'N/A' };
    return map[col] || col;
  },
};
