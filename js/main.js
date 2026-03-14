/* ═══════════════════════════════════════════════
   MAIN — Game Initialization & Screen Routing
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Version ────────────────────────────────────
  document.getElementById('app-version').textContent = `v${APP_VERSION}`;

  // ── Title Screen ──────────────────────────────
  const hasSave = State.hasSave();
  const continueBtn = document.getElementById('btn-continue');
  continueBtn.disabled = !hasSave;

  if (hasSave) {
    document.getElementById('save-hint').textContent = 'A saved career was found.';
  }

  document.getElementById('btn-new-game').addEventListener('click', () => {
    State.clearSave();
    UI.renderCreateScreen();
    UI.showScreen('screen-create');
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    if (State.load()) {
      UI.initTabs();
      UI.showGameScreen();
    }
  });

  document.getElementById('btn-rifle-practice').addEventListener('click', () => {
    RifleQual.startPractice();
  });

  document.getElementById('btn-create-back').addEventListener('click', () => {
    UI.showScreen('screen-title');
  });

  // ── Character Creation ────────────────────────
  document.getElementById('input-name').addEventListener('input', () => {
    UI._checkCreateReady();
  });

  // ── Name Generator ────────────────────────────
  const _GEN_LAST = [
    'Smith', 'Garcia', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore',
    'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Martinez',
    'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King',
    'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell',
    'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins',
    'Stewart', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera',
    'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James',
    'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson',
    'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington',
  ];
  const _GEN_MALE = [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher',
    'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Kenneth',
    'Joshua', 'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan',
    'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
    'Raymond', 'Frank', 'Gregory', 'Samuel', 'Patrick', 'Alexander', 'Jack', 'Dennis', 'Jerry', 'Tyler',
    'Aaron', 'Jose', 'Adam', 'Nathan', 'Henry', 'Douglas', 'Zachary', 'Peter', 'Kyle', 'Walter',
    'Ethan', 'Jeremy', 'Harold', 'Keith', 'Christian', 'Roger', 'Noah', 'Gerald', 'Carl', 'Terry',
  ];
  const _GEN_FEMALE = [
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
    'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna',
    'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura',
    'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
    'Samantha', 'Katherine', 'Christine', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
    'Diane', 'Virginia', 'Julie', 'Joyce', 'Victoria', 'Kelly', 'Christina', 'Lauren', 'Joan', 'Evelyn',
    'Olivia', 'Judith', 'Megan', 'Cheryl', 'Martha', 'Andrea', 'Frances', 'Hannah', 'Jacqueline', 'Ann',
  ];
  // Legendary Easter eggs — weighted by array size (~15% chance when rolled into this pool)
  const _GEN_LEGEND = [
    { last: 'Puller', m: 'Lewis', f: 'Lewis' }, // Chesty Puller
    { last: 'Daly', m: 'Dan', f: 'Dana' }, // Dan Daly — "Do you want to live forever?"
    { last: 'Basilone', m: 'John', f: 'Lena' }, // John Basilone / Lena Basilone
    { last: 'Hathcock', m: 'Carlos', f: 'Carlene' }, // Carlos Hathcock, legendary sniper
    { last: 'Butler', m: 'Smedley', f: 'Smedley' }, // Smedley Butler, double MOH
    { last: 'Mattis', m: 'James', f: 'Jamie' }, // Mad Dog Mattis
    { last: 'Lejeune', m: 'John', f: 'Jean' }, // Gen John Lejeune
    { last: 'Vandegrift', m: 'Alexander', f: 'Alexandra' }, // Gen Vandegrift, Guadalcanal
  ];
  // Funny Easter eggs
  const _GEN_FUNNY = [
    { last: 'Crayon', m: 'Blue', f: 'Scarlet' },
    { last: 'Motrin', m: 'Brandon', f: 'Beth' },
    { last: 'Silkies', m: 'Hugh', f: 'Sherry' }, // "Huge Silkies" / "Sure, Silkies"
    { last: 'Oorah', m: 'John', f: 'Jane' },
    { last: 'Devildog', m: 'Marc', f: 'Sara' },
    { last: 'Tun', m: 'Tavern', f: 'Tavern' }, // Birthplace of the Corps
    { last: 'Bootcamp', m: 'Justin', f: 'Justine' },
    { last: 'McGruff', m: 'Officer', f: 'Officer' }, //Easter egg addition from my son James
    // "Just in Boot Camp"
  ];

  function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  document.getElementById('btn-gen-name').addEventListener('click', () => {
    // Determine gender — auto-select if none chosen
    let genderBtn = document.querySelector('#gender-select .gender-btn.selected');
    if (!genderBtn) {
      const btns = document.querySelectorAll('#gender-select .gender-btn');
      genderBtn = btns[Math.floor(Math.random() * btns.length)];
      btns.forEach(b => b.classList.remove('selected'));
      genderBtn.classList.add('selected');
      UI._checkCreateReady();
    }
    const isMale = genderBtn.dataset.gender === 'male';

    // Roll for name type: 0-12 = legendary, 13-19 = funny, 20-99 = normal
    const roll = Math.floor(Math.random() * 100);
    let last, first;
    if (roll < 13) {
      const entry = _pick(_GEN_LEGEND);
      last = entry.last;
      first = isMale ? entry.m : entry.f;
    } else if (roll < 20) {
      const entry = _pick(_GEN_FUNNY);
      last = entry.last;
      first = isMale ? entry.m : entry.f;
    } else {
      last = _pick(_GEN_LAST);
      first = isMale ? _pick(_GEN_MALE) : _pick(_GEN_FEMALE);
    }

    const nameInput = document.getElementById('input-name');
    nameInput.value = `${last}, ${first}`;
    nameInput.dispatchEvent(new Event('input'));
  });

  document.getElementById('btn-start-bootcamp').addEventListener('click', () => {
    const { name, backgroundId, mosId, gender } = UI.getCreateSelections();
    const marine = Character.create(name, mosId, backgroundId, gender);
    State.init(marine);
    UI.initTabs();
    UI.startBootCamp();
  });

  // ── Boot Camp ─────────────────────────────────
  document.getElementById('btn-bc-next').addEventListener('click', () => {
    UI.advanceBootCamp();
  });

  // ── Advance Quarter ───────────────────────────
  document.getElementById('btn-advance').addEventListener('click', () => {
    Main.onAdvance();
  });

  // ── Orientation Panel Dismiss ─────────────────
  document.getElementById('btn-orientation-dismiss').addEventListener('click', () => {
    State.game.orientationDismissed = true;
    State.save();
    document.getElementById('orientation-panel').classList.add('hidden');
  });

  // ── Play Again ────────────────────────────────
  document.getElementById('btn-play-again').addEventListener('click', () => {
    State.clearSave();
    UI.renderCreateScreen();
    UI.showScreen('screen-create');
  });

  // Main Menu (mid-game)
  document.getElementById('btn-start-over').addEventListener('click', () => {
    State.save();
    continueBtn.disabled = false;
    document.getElementById('save-hint').textContent = 'Career saved. Continue Career to resume where you left off.';
    UI.showScreen('screen-title');
  });

  // Main Menu (shared mobile footer)
  document.getElementById('btn-start-over-mobile').addEventListener('click', () => {
    State.save();
    continueBtn.disabled = false;
    document.getElementById('save-hint').textContent = 'Career saved. Continue Career to resume where you left off.';
    UI.showScreen('screen-title');
  });

  // Main Menu (rifle range)
  document.getElementById('rq-btn-main-menu').addEventListener('click', () => {
    State.save();
    continueBtn.disabled = false;
    document.getElementById('save-hint').textContent = 'Career saved. Continue Career to resume where you left off.';
    UI.showScreen('screen-title');
  });

  // ── Init title screen ─────────────────────────
  UI.showScreen('screen-title');

  // ── Tooltips ──────────────────────────────────
  UI.initTooltips();
});

// ── Main game flow controller ──────────────────
const Main = {

  /** Called when player clicks "Advance Quarter" */
  onAdvance() {
    const m = State.game.marine;

    // 0. Apply deferred event choices (soft-selected on card, effects applied now on advance)
    UI._currentEvents.forEach(evt => {
      if (evt.isChance) return;  // chance events are resolved immediately on click
      const choiceIdx = UI._pendingEventChoices[evt.id];
      if (typeof choiceIdx !== 'number') return;
      const logEntry = Events.resolveChoice(m, evt, choiceIdx);
      if (logEntry) State.game.log.unshift({ date: Engine._dateStr(), text: logEntry, major: false });
      if (!State.game.recentEventIds) State.game.recentEventIds = [];
      State.game.recentEventIds.unshift(evt.id);
      if (State.game.recentEventIds.length > 6) State.game.recentEventIds.pop();
    });

    // 1. Apply all selected focus choices (Map<id, count> — apply each choice count times)
    UI._selectedFocuses.forEach((count, id) => {
      for (let i = 0; i < count; i++) Engine.applyFocusChoice(id);
    });

    // 1b. Car loan reveal — player finds out about the 20% APR after signing
    if (m.pendingCarLoanReveal) {
      m.pendingCarLoanReveal = false;
      State.save();
      UI.showDecisionModal({
        icon: '🚗',
        title: 'YOU SIGNED THE PAPERWORK',
        body: `
          <p>Congratulations on the new ride. The finance manager at the dealership was very friendly.</p>
          <p>You just noticed the loan terms in the fine print:</p>
          <p><strong>Vehicle: $25,000 | APR: 20% | Term: 60 months</strong></p>
          <p>Monthly payment: <strong>$661/month</strong> — for the next five years.</p>
          <p>Your savings wouldn't have covered it outright, so you had no choice. Welcome to military car lot financing.</p>
        `,
        choices: [
          {
            title: 'Got it. Continue.',
            desc: '$661/month added to your expenses for 60 months.',
            effect: '+$661/mo expenses',
            onSelect: () => {
              m.stress = clamp(m.stress + 8, 0, 100);
              m.morale = clamp(m.morale - 5, 0, 100);
              State.save();
              Main._checkEASAndRun();
            },
          },
        ],
      });
      return;
    }

    Main._checkEASAndRun();
  },

  /** Check EAS/reenlistment gates then run the quarter */
  _checkEASAndRun() {
    const m = State.game.marine;

    // 1. Rifle qualification — fires once per enlistment when TIS >= 4 and not deployed
    if (!State.game.rifleQualCompleted && m.timeInService >= 4 && !m.isDeployed) {
      RifleQual.start(() => Main._checkEASAndRun());
      return;
    }

    // 2. Check for forced EAS (contract already expired)
    if (Career.shouldTriggerEAS(m)) {
      // If retirement papers were already submitted and the marine hit 20 years, retire automatically
      if (m.retirementSubmitted && m.timeInService >= 240) {
        Main.triggerRetirement();
        return;
      }
      // Orders declined or EAS already decided — skip the modal; execute EAS directly
      if (m.ordersDeclined || State.game.easDecided) {
        if (m.timeInService >= 240) {
          Main.triggerRetirement();
        } else {
          Main.triggerEAS();
        }
        return;
      }
      Main.showEASDecision();
      return;
    }

    // 3. Check for reenlistment window (once per contract, ~9-12 months before EAS)
    if (Career.isReenlistWindowDue(m)) {
      State.game.reenlistWindowOffered = true;   // mark as offered
      // Orders declined — ineligible to reenlist; skip the window silently
      if (m.ordersDeclined) {
        Main._runAndRender();
        return;
      }
      // 18+ years TIS: show retirement submission modal instead of standard reenlistment
      if (m.timeInService >= 216) {
        Main.showRetirementSubmissionModal();
        return;
      }
      const winInfo = Career.reenlistWindowLabel(m);
      UI.showReenlistmentModal(winInfo, m, (decision, data) => {
        if (decision === 'reenlist') {
          const srb = Career.reenlist(m, data.years, data.srb);
          State.game.rifleQualCompleted = false;
          m.ordersDeclined = false;
          State.game.log.unshift({
            date: Engine._dateStr(),
            text: `Reenlisted — ${data.years}-year contract. SRB: ${Finance.fmt(srb)}.`,
            major: true,
          });
        } else {
          // Player chose EAS — begin wind-down period instead of ending immediately.
          // Out-processing events will fire each quarter until the contract expires.
          State.game.easDecided = true;
          const monthsLeft = m.contractEnd - m.timeInService;
          State.game.log.unshift({
            date: Engine._dateStr(),
            text: `EAS decision made — beginning out-processing. ${monthsLeft} months remaining on contract.`,
            major: true,
          });
          State.save();
        }
        Main._runAndRender();
      });
      return;
    }

    // 4. Check for PCS orders (24-month rotation, IPCOT-protected within 12mo of EAS)
    // Suppressed during EAS wind-down — no orders will move a Marine already out-processing
    if (!State.game.easDecided && PCS.isPCSDue(m)) {
      Main.showPCSDecision(() => Main._runAndRender());
      return;
    }

    Main._runAndRender();
  },

  showPCSDecision(onComplete) {
    const m = State.game.marine;
    const options = PCS.getOptions(m);
    const monthsAtStation = m.monthsAtStation || 0;
    const forced = monthsAtStation >= 36;
    const monthsToEAS = m.contractEnd - m.timeInService;
    const needsExtension = monthsToEAS < 12;

    // Safety: no eligible stations found (shouldn't happen, but guard anyway)
    if (options.length === 0) {
      onComplete();
      return;
    }

    // If < 2 years left on contract, require extension before accepting orders
    if (needsExtension) {
      const mosLeft = Math.round(monthsToEAS);
      const contractLabel = mosLeft >= 12
        ? `${Math.floor(mosLeft / 12)}y ${mosLeft % 12}m`
        : `${mosLeft} months`;
      const extChoices = [
        {
          title: 'Request OBLISERVE Extension (+24 months)',
          desc: 'Administratively extend your EAS by 24 months. Paperwork-heavy, but it lets you take the orders.',
          effect: 'Contract +24 months | Stress +3',
          onSelect: () => {
            m.contractEnd += 24;
            m.stress = clamp(m.stress + 3, 0, 100);
            State.game.log.unshift({ date: Engine._dateStr(), text: 'Contract extended 24 months to accept PCS orders.', major: false });
            State.save();
            Main.showPCSDecision(onComplete);  // recurse — now needsExtension is false
          },
        },
      ];
      if (!forced) {
        extChoices.push({
          title: 'Decline Orders',
          desc: 'Ride out the contract where you are. Until you reenlist, no PCS, no deployments, and no Tuition Assistance.',
          effect: 'Reputation −5 | Stress +5',
          onSelect: () => {
            m.reputationWithLeadership = clamp((m.reputationWithLeadership || 50) - 5, 0, 100);
            m.stress = clamp(m.stress + 5, 0, 100);
            m.ordersDeclined = true;
            State.game.log.unshift({ date: Engine._dateStr(), text: 'Declined PCS orders. Ineligible for PCS, deployments, and TA for the remainder of this contract.', major: true });
            State.save();
            onComplete();
          },
        });
      }
      UI.showDecisionModal({
        icon: '📋',
        title: forced ? 'MANDATORY PCS — EXTENSION REQUIRED' : 'PCS ORDERS — SHORT CONTRACT',
        body: `
          <p>Orders have been cut, but you only have <strong>${contractLabel}</strong> left on your current contract.</p>
          <p>HQMC requires at least <strong>12 months</strong> remaining on contract to accept PCS orders.</p>
          ${forced ? '<p><strong>These orders are non-negotiable — an extension is required.</strong></p>' : ''}
        `,
        choices: extChoices,
      });
      return;
    }

    const currentStation = ASSIGNMENTS_DATA.find(a => a.id === m.assignmentId);
    const currentName = currentStation ? currentStation.name : 'current station';

    const choices = options.map(station => {
      const cost = PCS.movingCost(m, station);
      const opLabel = PCS._optempoLabel(station.optempo);
      const colLabel = PCS._colLabel(station.costOfLiving);
      const famSign = station.familyEffect >= 0 ? '+' : '';
      const morSign = station.moraleEffect >= 0 ? '+' : '';

      return {
        title: `${station.name}`,
        desc: `<strong>${station.unit}</strong> — ${station.region}<br>${station.description}<br><em>Optempo: ${opLabel} &nbsp;|&nbsp; Cost of Living: ${colLabel}</em>`,
        effect: `Moving cost: ${Finance.fmt(cost)} | Family ${famSign}${station.familyEffect} | Morale ${morSign}${station.moraleEffect}`,
        onSelect: () => {
          PCS.apply(m, station.id);
          State.game.log.unshift({
            date: Engine._dateStr(),
            text: `PCS to ${station.name} (${station.unit}).`,
            major: true,
          });
          State.save();
          onComplete();
        },
      };
    });

    const yrs = Math.floor(monthsAtStation / 12);
    const mos = monthsAtStation % 12;
    const stayLabel = yrs > 0 ? `${yrs}y ${mos}m` : `${monthsAtStation} months`;

    UI.showDecisionModal({
      icon: '📦',
      title: forced ? 'PCS ORDERS — MANDATORY MOVE' : 'PCS ORDERS — TIME TO MOVE',
      body: `
        <p>You've been at <strong>${currentName}</strong> for <strong>${stayLabel}</strong>. Orders have been cut.</p>
        ${forced
          ? '<p><strong>These orders are non-negotiable. Pack your gear, Marine.</strong></p>'
          : '<p>The Corps is asking for your preference. Choose your next duty station.</p>'
        }
        <p><em>All moves include an adjustment period: -4 MOS Proficiency, +8 Stress, -3 Morale.</em></p>
      `,
      choices,
    });
  },

  /** Run the quarter engine and re-render */
  _runAndRender() {
    const result = Engine.runMonth();

    if (result.gameOver) {
      UI.showEndState(result.endState);   // render before clearing
      State.clearSave();
      return;
    }

    UI._selectedFocuses = new Map();
    UI._focusBudgetSpent = 0;
    UI.renderGameState(result);
    UI.renderMonthlyChoices();

    const eventsBody = document.querySelector('.events-body');
    if (eventsBody) eventsBody.scrollTop = 0;
  },

  showEASDecision() {
    const m = State.game.marine;
    const retirementEligible = m.timeInService >= 240;

    const easChoices = [
      {
        title: 'Reenlist — Stay In',
        desc: 'Sign a new contract and continue your career.',
        effect: null,
        onSelect: () => {
          const winInfo = { label: 'Reenlistment', fy: State.game.year };
          UI.showReenlistmentModal(winInfo, m, (decision, data) => {
            if (decision === 'reenlist') {
              Career.reenlist(m, data.years, data.srb);
              State.game.rifleQualCompleted = false;
              m.ordersDeclined = false;
              State.game.log.unshift({ date: Engine._dateStr(), text: `Reenlisted — ${data.years}yr.`, major: true });
              Main._runAndRender();
            } else {
              Main.triggerEAS();
            }
          });
        },
      },
      {
        title: 'Separate — EAS',
        desc: 'End your active duty service and begin the transition.',
        effect: null,
        onSelect: () => Main.triggerEAS(),
      },
    ];

    if (retirementEligible) {
      easChoices.unshift({
        title: 'Retire — 20-Year Career',
        desc: `You've earned it. ${Math.floor(m.timeInService / 12)} years of honorable service. Request retirement and receive your pension.`,
        effect: null,
        onSelect: () => Main.triggerRetirement(),
      });
    }

    UI.showDecisionModal({
      icon: '🪖',
      title: retirementEligible ? 'RETIREMENT ELIGIBLE — EAS' : 'END OF ACTIVE SERVICE — EAS',
      body: `
        <p>Your contract has ended. You must decide: ${retirementEligible ? 'retire, reenlist, or separate' : 'reenlist or separate'}?</p>
        <p>Current rank: <strong>${m.rankAbbr}</strong> | TIS: <strong>${Math.floor(m.timeInService / 12)}y ${m.timeInService % 12}m</strong></p>
        <p>Savings: <strong>${Finance.fmt(m.savings)}</strong> | GI Bill: <strong>${m.giBillMonths} months</strong></p>
        <p>Education: <strong>${m.educationCredits} credits (${m.degreeProgress})</strong></p>
      `,
      choices: easChoices,
    });
  },

  /**
   * Show the retirement submission modal (fires at reenlistment window when TIS >= 18 years).
   * Player can submit papers (pre-retirement period until 20yr), re-enlist, or separate early.
   */
  showRetirementSubmissionModal() {
    const m = State.game.marine;
    const tisYears = Math.floor(m.timeInService / 12);
    const tisMons = m.timeInService % 12;
    const monthsTo20 = Math.max(0, 240 - m.timeInService);
    const yearsTo20 = Math.floor(monthsTo20 / 12);
    const monsTo20 = monthsTo20 % 12;
    const alreadyAt20 = m.timeInService >= 240;

    const timeStr = tisMons > 0 ? `${tisYears} years ${tisMons} months` : `${tisYears} years`;
    const remainStr = yearsTo20 > 0
      ? `${yearsTo20}yr ${monsTo20 > 0 ? monsTo20 + 'mo' : ''}`.trim()
      : `${monsTo20}mo`;

    const choices = [];

    choices.push({
      title: alreadyAt20 ? 'Submit Retirement — You\'ve Earned It' : 'Submit Retirement Papers',
      desc: alreadyAt20
        ? `${tisYears} years of honorable service. Lock in your pension and begin terminal leave processing.`
        : `Lock in your intent to retire at 20 years. You'll stay on orders and complete TAP, medical screening, and check-out procedures. ${remainStr} remaining until retirement.`,
      effect: alreadyAt20 ? 'Full 20-year retirement pension' : `Pre-retirement transition period — ${remainStr}`,
      onSelect: () => {
        if (alreadyAt20) {
          Main.triggerRetirement();
        } else {
          m.retirementSubmitted = true;
          m.contractEnd = 240;   // serve to exactly 20 years
          m.morale = clamp(m.morale + 10, 0, 100);
          m.stress = clamp(m.stress - 5, 0, 100);
          State.game.log.unshift({
            date: Engine._dateStr(),
            text: `Retirement papers submitted. Pre-retirement transition period begins — ${remainStr} remaining.`,
            major: true,
          });
          State.save();
          Main._runAndRender();
        }
      },
    });

    // Re-enlist option (continue past 20 years)
    choices.push({
      title: 'Continue Service — Re-enlist',
      desc: 'Sign another contract and keep serving. Some Marines push to 22, 24, or even 30 years. Your call.',
      effect: null,
      onSelect: () => {
        const winInfo = Career.reenlistWindowLabel(m);
        UI.showReenlistmentModal(winInfo, m, (decision, data) => {
          if (decision === 'reenlist') {
            const srb = Career.reenlist(m, data.years, data.srb);
            State.game.rifleQualCompleted = false;
            m.ordersDeclined = false;
            State.game.log.unshift({
              date: Engine._dateStr(),
              text: `Reenlisted — ${data.years}-year contract. SRB: ${Finance.fmt(srb)}.`,
              major: true,
            });
            Main._runAndRender();
          } else {
            Main.triggerEAS();
          }
        });
      },
    });

    // Separate without retirement (walk away early)
    if (!alreadyAt20) {
      choices.push({
        title: 'Separate — EAS Without Retirement',
        desc: `Walk away now. You won't collect the pension — ${remainStr} short of 20 years. No going back.`,
        effect: 'No retirement pension',
        onSelect: () => Main.triggerEAS(),
      });
    }

    UI.showDecisionModal({
      icon: '🎖',
      title: alreadyAt20 ? '20 YEARS — RETIREMENT ELIGIBLE' : 'RETIREMENT WINDOW — 18+ YEARS TIS',
      body: `
        <p>You have served <strong>${timeStr}</strong> of honorable active duty service.</p>
        <p>Rank: <strong>${m.rankAbbr}</strong> | Savings: <strong>${Finance.fmt(m.savings)}</strong></p>
        ${!alreadyAt20
          ? `<p>You are <strong>${remainStr}</strong> away from a full 20-year retirement pension. Submit your papers now and serve out the remaining time, or make another call.</p>`
          : '<p>You have reached the 20-year mark. Your retirement pension is locked in. Time to hang up the uniform — or keep going.</p>'
        }
      `,
      choices,
    });
  },

  triggerRetirement() {
    const m = State.game.marine;
    const endStateId = m.payGrade === 'E-9' ? 'high_achiever_retirement' : 'retirement';
    UI.showEndState(endStateId);   // render before clearing — showEndState reads State.game.marine
    State.clearSave();
  },

  triggerEAS() {
    const m = State.game.marine;
    const proceed = () => {
      Main.showReserveDecision(() => {
        const endState = Career.determineEndState(m, m.timeInService);
        UI.showEndState(endState);   // render before clearing — reads State.game.marine
        State.clearSave();
      });
    };
    if (m.ordersDeclined) {
      Main._showOrdersDeclinedFarewell(proceed);
    } else {
      proceed();
    }
  },

  _showOrdersDeclinedFarewell(onComplete) {
    const m = State.game.marine;
    const tisYrs = Math.floor(m.timeInService / 12);
    const tisMons = m.timeInService % 12;
    const timeStr = tisMons > 0 ? `${tisYrs} years ${tisMons} months` : `${tisYrs} years`;

    UI.showDecisionModal({
      icon: '📋',
      title: 'LAST DAY OF ACTIVE DUTY',
      body: `
        <p>Today is your EAS date.</p>
        <p>You turned in your gear, signed the checkout sheet, and shook a few hands. The walk from the admin office to the main gate is one most Marines only take once. You've seen others do it. Now it's your turn — <strong>${m.rankAbbr} ${m.name}</strong>, <strong>${timeStr}</strong> of service.</p>
        <p>The clerk behind the window handed you a manila envelope without looking up. Your DD-214 was inside. Proof you were here. Proof you served.</p>
        <p>You walked through the gate, got in your car, and drove off base for the last time.</p>
      `,
      choices: [
        {
          title: 'COLLECT DD-214',
          desc: 'Your active duty service has ended. Time to decide what comes next.',
          effect: null,
          onSelect: onComplete,
        },
      ],
    });
  },

  /**
   * Show the SMCR vs IRR reserve component decision.
   * Fires for every EAS path (voluntary window, forced EAS, reenlist modal EAS choice).
   * Sets marine.reserveStatus before continuing to the end state screen.
   */
  showReserveDecision(onComplete) {
    const m = State.game.marine;
    const tisYears = Math.floor(m.timeInService / 12);
    const msoMonths = 96;   // 8-year total Military Service Obligation
    const remainingMSO = Math.max(0, msoMonths - m.timeInService);
    const remainingYears = Math.ceil(remainingMSO / 12);
    const hasRemainingMSO = remainingMSO > 0;

    // Drill pay: 4 drill periods/month × (base pay / 30)
    const basePay = Finance.BASE_PAY[m.payGrade] || 1680;
    const drillPayMo = Math.round((basePay / 30) * 4 / 10) * 10;   // round to $10
    // Annual Training: 14 days × (base pay / 30), averaged monthly
    const atPayMo = Math.round((basePay / 30) * 14 / 12 / 10) * 10;
    const totalMonthly = drillPayMo + atPayMo;

    // Reserve retirement: estimate whether they can hit 20 good years
    const reserveRetire = Career.reserveRetirementPath(m, m.timeInService);

    const msoLine = hasRemainingMSO
      ? `<p>You have <strong>${remainingYears} year${remainingYears !== 1 ? 's' : ''}</strong> remaining on your 8-year Military Service Obligation (MSO). You must serve in either a drilling reserve unit or the IRR.</p>`
      : `<p>You've fulfilled your 8-year MSO. Reserve service is now entirely voluntary.</p>`;

    UI.showDecisionModal({
      icon: '🎖',
      title: 'RESERVE COMPONENT DECISION',
      body: `
        ${msoLine}
        <p>Rank: <strong>${m.rankAbbr}</strong> | Active TIS: <strong>${tisYears} years</strong></p>
        <p>Choose how you'll serve your remaining obligation — or how far you're walking away.</p>
      `,
      choices: [
        {
          title: 'Selected Marine Corps Reserve (SMCR)',
          desc: `One weekend/month + two weeks annual training. Keep your clearance, your network, and your rank. Stay connected to the Corps while you build your civilian career.${reserveRetire ? ` With ${tisYears} active years, you're on track for reserve retirement at 60.` : ''}`,
          effect: `~${Finance.fmt(totalMonthly)}/mo drill pay | Network maintained | Mobilization risk`,
          onSelect: () => {
            m.reserveStatus = 'SMCR';
            State.save();
            onComplete();
          },
        },
        {
          title: 'Individual Ready Reserve (IRR)',
          desc: `Non-drilling. No commitment, no pay, no benefits. You remain subject to involuntary recall for the remainder of your MSO. During periods of high optempo, IRR Marines — especially those with combat MOS — get pulled back.`,
          effect: 'No pay | No drill commitment | Recall risk (GWOT era)',
          onSelect: () => {
            m.reserveStatus = 'IRR';
            State.save();
            onComplete();
          },
        },
      ],
    });
  },

};

