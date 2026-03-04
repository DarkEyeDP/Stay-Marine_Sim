/* ═══════════════════════════════════════════════
   UI MODULE
   All DOM rendering, screen transitions, stat bars
   ═══════════════════════════════════════════════ */

const UI = {

  // ── Screen Management ────────────────────────

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  // ── Character Creation ───────────────────────

  renderCreateScreen() {
    // Wire gender buttons
    const genderSelect = document.getElementById('gender-select');
    genderSelect.querySelectorAll('.gender-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        genderSelect.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        UI._checkCreateReady();
      });
    });

    // Render backgrounds
    const bgList = document.getElementById('background-list');
    bgList.innerHTML = '';
    BACKGROUNDS.forEach(bg => {
      const el = document.createElement('div');
      el.className = 'card-select-item';
      el.dataset.id = bg.id;
      el.innerHTML = `
        <div class="cs-title">${bg.title}</div>
        <div class="cs-desc">${bg.desc}</div>
        <div class="cs-bonuses">${bg.bonuses}</div>
      `;
      el.addEventListener('click', () => {
        bgList.querySelectorAll('.card-select-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        UI._checkCreateReady();
      });
      bgList.appendChild(el);
    });

    // Render MOS filters
    const filterRow = document.getElementById('mos-filter');
    filterRow.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All';
    allBtn.dataset.field = 'all';
    filterRow.appendChild(allBtn);
    Object.entries(MOS_FIELDS).forEach(([field, info]) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = info.label;
      btn.dataset.field = field;
      filterRow.appendChild(btn);
    });
    filterRow.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterRow.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      UI.renderMOSList(btn.dataset.field);
    });

    UI.renderMOSList('all');
  },

  renderMOSList(filterField) {
    const mosList = document.getElementById('mos-list');
    const prev = mosList.querySelector('.card-select-item.selected');
    const prevId = prev ? prev.dataset.id : null;
    mosList.innerHTML = '';

    const filtered = filterField === 'all'
      ? MOS_DATA
      : MOS_DATA.filter(m => m.field === filterField);

    filtered.forEach(mos => {
      const el = document.createElement('div');
      el.className = 'card-select-item';
      el.dataset.id = mos.id;
      if (mos.id === prevId) el.classList.add('selected');

      const fieldInfo = MOS_FIELDS[mos.field];
      const fieldColor = fieldInfo ? fieldInfo.color : '#888';

      el.innerHTML = `
        <div class="cs-title">
          <span style="color:${fieldColor}">${mos.code}</span> — ${mos.title}
        </div>
        <div class="cs-desc">${mos.description}</div>
        <div class="cs-bonuses">Optempo: ${'▮'.repeat(mos.optempo)}${'▯'.repeat(5 - mos.optempo)} | Civilian Value: ${mos.civilianValue}%</div>
      `;
      el.addEventListener('click', () => {
        mosList.querySelectorAll('.card-select-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        UI._checkCreateReady();
      });
      mosList.appendChild(el);
    });
  },

  _checkCreateReady() {
    const name = document.getElementById('input-name').value.trim();
    const bg = document.querySelector('#background-list .card-select-item.selected');
    const mos = document.querySelector('#mos-list .card-select-item.selected');
    const gender = document.querySelector('#gender-select .gender-btn.selected');
    document.getElementById('btn-start-bootcamp').disabled = !(name && bg && mos && gender);
  },

  getCreateSelections() {
    return {
      name: document.getElementById('input-name').value.trim(),
      backgroundId: document.querySelector('#background-list .card-select-item.selected')?.dataset.id,
      mosId: document.querySelector('#mos-list .card-select-item.selected')?.dataset.id,
      gender: document.querySelector('#gender-select .gender-btn.selected')?.dataset.gender,
    };
  },

  // ── Boot Camp ────────────────────────────────

  _bcSteps: [
    {
      phase: 'YELLOW FOOTPRINTS',
      title: 'Receiving — Day 1',
      text: 'You step off the bus at MCRD San Diego. A Drill Instructor materializes from the darkness, screaming at you before your feet hit the yellow footprints. Your civilian life is officially over. Welcome to the United States Marine Corps.',
      stats: null,
    },
    {
      phase: 'PHASE 1',
      title: 'The Crucible',
      text: 'Six weeks of physical conditioning, drill, and Marine Corps history. Your body aches, your mind pushes past limits you didn\'t know existed. The DIs never let up. You learn to be part of something larger than yourself.',
      stats: { physicalFitness: 8, morale: 5, disciplineRisk: -5 },
    },
    {
      phase: 'SOI/MCT',
      title: 'School of Infantry / MCT',
      text: 'You\'ve earned your Eagle, Globe, and Anchor, and today you report to SOI-West for your Infantry/Combat training. Here you learn the tactics, techniques, and procedures of combat. You get your first look at the kind of Marine you might become.',
      stats: { mosProficiency: 10, physicalFitness: 5, stress: 5 },
    },
    {
      phase: 'FIRST DUTY STATION',
      title: 'Reporting to Your Unit',
      text: 'You check in to your first unit. The SNCOs size you up immediately. You have everything to prove and nothing to fall back on. Your career begins now.',
      stats: null,
    },
  ],
  _bcStep: 0,

  startBootCamp() {
    UI._bcStep = 0;
    UI.renderBootCampStep();
    UI.showScreen('screen-bootcamp');
  },

  renderBootCampStep() {
    const step = UI._bcSteps[UI._bcStep];
    document.getElementById('bc-phase-label').textContent = step.phase;
    document.getElementById('bc-title').textContent = step.title;
    document.getElementById('bc-narrative').textContent = step.text;

    const statsEl = document.getElementById('bc-stat-preview');
    statsEl.innerHTML = '';
    if (step.stats) {
      Object.entries(step.stats).forEach(([key, val]) => {
        const chip = document.createElement('div');
        chip.className = 'bc-stat-chip';
        chip.textContent = `${UI._statLabel(key)} ${val > 0 ? '+' : ''}${val}`;
        statsEl.appendChild(chip);
      });
    }

    const btn = document.getElementById('btn-bc-next');
    btn.textContent = UI._bcStep < UI._bcSteps.length - 1 ? 'CONTINUE' : 'BEGIN YOUR CAREER';
  },

  advanceBootCamp() {
    const step = UI._bcSteps[UI._bcStep];
    if (step.stats) {
      Character.applyEffects(State.game.marine, step.stats);
    }
    UI._bcStep++;
    if (UI._bcStep >= UI._bcSteps.length) {
      // Boot camp counts toward TIS: ~3 months MCRD + 1 month MCT/SOI = 4 months.
      // Advance the marine's TIS/TIG and the game calendar before entering the fleet.
      const BOOTCAMP_MONTHS = 4;
      const m = State.game.marine;
      m.timeInService = BOOTCAMP_MONTHS;
      m.timeInGrade   = BOOTCAMP_MONTHS;
      for (let i = 0; i < BOOTCAMP_MONTHS; i++) State.advanceMonth();
      State.save();
      UI.showGameScreen();
    } else {
      UI.renderBootCampStep();
    }
  },

  // ── Main Game Screen ─────────────────────────

  showGameScreen() {
    // Clear stale state from any previous game session
    document.getElementById('events-container').innerHTML = '';
    document.getElementById('alerts-container').innerHTML = '';
    UI._pendingEventChoices = {};
    UI._selectedFocuses = new Map();
    UI._focusBudgetSpent = 0;
    UI.showScreen('screen-game');
    UI.renderGameState(null);
    UI.renderMonthlyChoices();
  },

  /** Full game state render (called after each month) */
  renderGameState(monthResult) {
    const m = State.game.marine;
    const g = State.game;

    // Rank badge & marine info
    document.getElementById('rank-badge').textContent = m.payGrade;
    document.getElementById('rank-title-display').textContent = m.rankTitle;
    document.getElementById('marine-name').textContent = m.name;
    document.getElementById('marine-sub').textContent = `${m.mosCode} · ${m.mosTitle}`;
    UI.updateRifleQualBadge(m.rifleQualLevel);

    // Date / TIS
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.getElementById('turn-date').textContent = `${months[g.month - 1].toUpperCase()} ${g.year}`;
    const tisYears = Math.floor(m.timeInService / 12);
    const tisMons = m.timeInService % 12;
    document.getElementById('turn-tis').textContent = `${tisYears}y ${tisMons}m · ${m.rankAbbr}`;

    // Assignment
    const asgn = ASSIGNMENTS_DATA.find(a => a.id === m.assignmentId) || ASSIGNMENTS_DATA[0];
    document.getElementById('billet-label').textContent = m.isDeployed ? '⚔ DEPLOYED' : BILLET_TIERS[m.billetTier]?.label;
    document.getElementById('billet-location').textContent = m.isDeployed ? `Return in ${m.deploymentMonthsLeft}mo` : asgn.name;

    // Stat bars
    const gradeOrder = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'];
    const isNCO = gradeOrder.indexOf(m.payGrade) >= 4;  // E-5+
    const profConductLabel = isNCO ? 'RS/RO Fitness Report' : 'Proficiency / Conduct';

    UI.renderStat('stat-physicalFitness', m.physicalFitness, 'Physical Fitness (PFT)');
    UI.renderStat('stat-profConduct', m.profConduct, profConductLabel);
    UI.renderStat('stat-mosProficiency', m.mosProficiency, 'MOS Proficiency');
    UI.renderStat('stat-disciplineRisk', m.disciplineRisk, 'Discipline Risk', true);
    UI.renderStat('stat-morale', m.morale, 'Morale');
    UI.renderStat('stat-stress', m.stress, 'Stress', true);
    UI.renderStat('stat-familyStability', m.familyStability, 'Family Stability');
    UI.renderStatText('stat-injury', `Injury: ${m.injury.charAt(0).toUpperCase() + m.injury.slice(1)}`);
    UI.renderStat('stat-civilianEmployability', m.civilianEmployability, 'Civilian Employability');
    UI._updateTabIndicators(m);

    // Finance
    const gross = Finance.monthlyGross(m);
    const bills = Finance.monthlyExpenses(m);
    const net   = gross - bills;
    document.getElementById('fin-pay').textContent   = Finance.fmt(gross) + '/mo';
    document.getElementById('fin-bills').textContent = Finance.fmt(bills) + '/mo';
    const netEl = document.getElementById('fin-net');
    if (netEl) {
      netEl.textContent = (net >= 0 ? '+' : '') + Finance.fmt(net) + '/mo';
      netEl.className = 'fin-val ' + (net >= 0 ? 'fin-positive' : 'fin-negative');
    }
    const checkEl = document.getElementById('fin-checking');
    if (checkEl) checkEl.textContent = Finance.fmt(m.checking || 0);
    document.getElementById('fin-savings').textContent = Finance.fmt(m.savings);
    document.getElementById('fin-debt').textContent = Finance.fmt(m.debt);
    document.getElementById('fin-edu').textContent = `${m.educationCredits} cr (${m.degreeProgress})`;
    document.getElementById('fin-gibill').textContent = `${m.giBillMonths} months`;

    // Car loan row
    const carLoanRow = document.getElementById('fin-carloan-row');
    if (m.carLoanMonthsLeft > 0) {
      carLoanRow.classList.remove('hidden');
      document.getElementById('fin-carloan').textContent = `${Finance.fmt(m.carLoanMonthly)}/mo (${m.carLoanMonthsLeft}mo left)`;
    } else {
      carLoanRow.classList.add('hidden');
    }

    // Savings planner
    UI.renderSavingsPlanner(m, gross, bills);

    // Career tracks
    const tracks = Character.trackProgress(m, m.timeInService);
    UI.renderTrack('track-retirement', 'Retirement', tracks.retirement);
    UI.renderTrack('track-achiever', 'High Achiever', tracks.achiever);
    UI.renderTrack('track-civilian', 'Smooth EAS', tracks.civilian);
    UI.renderTrack('track-family', 'Family First', tracks.family);

    // Orientation panel — show until dismissed; hide for any loaded save that predates this flag
    const orientEl = document.getElementById('orientation-panel');
    if (orientEl) {
      const show = State.game.orientationDismissed === false && m.timeInService < 6;
      orientEl.classList.toggle('hidden', !show);
    }

    // Alerts
    if (monthResult) {
      UI.renderAlerts(monthResult.alerts);
      UI.renderEvents(monthResult.events);
    }

    // Show advance button if no pending events
    UI.checkAdvanceReady();
  },

  renderStat(elId, value, label, invert = false) {
    const el = document.getElementById(elId);
    if (!el) return;

    const pct = clamp(value, 0, 100);
    let colorClass = '';
    let pulseClass = '';
    if (invert) {
      // For inverted stats (stress, discipline risk) — high is bad
      colorClass  = pct > 70 ? 'warning'     : pct > 45 ? 'caution' : 'invert-good';
      pulseClass  = pct > 70 ? 'stat-pulse-danger' : pct > 45 ? 'stat-pulse-caution' : '';
    } else {
      colorClass  = pct < 30 ? 'warning'     : pct < 55 ? 'caution' : '';
      pulseClass  = pct < 30 ? 'stat-pulse-danger' : pct < 55 ? 'stat-pulse-caution' : '';
    }

    // Apply / remove pulse class on the persistent container div
    el.classList.remove('stat-pulse-danger', 'stat-pulse-caution');
    if (pulseClass) el.classList.add(pulseClass);

    el.innerHTML = `
      <div class="stat-label-row">
        <span class="stat-name">${label}</span>
        <span class="stat-val">${Math.round(value)}</span>
      </div>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill ${colorClass}" style="width:${pct}%"></div>
      </div>
    `;
  },

  renderStatText(elId, text) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = `<div class="stat-label-row"><span class="stat-name">${text}</span></div>`;
  },

  renderTrack(elId, label, pct) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = `
      <div class="track-label-row">
        <span class="track-name">${label}</span>
        <span class="track-pct">${Math.round(pct)}%</span>
      </div>
      <div class="track-bar-bg">
        <div class="track-bar-fill" style="width:${pct}%"></div>
      </div>
    `;
  },

  renderAlerts(alerts) {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';
    (alerts || []).forEach(a => {
      const el = document.createElement('div');
      el.className = `alert alert-${a.type}`;
      el.textContent = a.text;
      container.appendChild(el);
    });
  },

  renderEvents(events) {
    const container = document.getElementById('events-container');
    container.innerHTML = '';
    UI._pendingEventChoices = {};
    UI._currentEvents = events || [];

    (events || []).forEach(evt => {
      const card = document.createElement('div');
      card.className = `event-card cat-border-${evt.category}`;
      card.dataset.eventId = evt.id;

      const catClass = `cat-${evt.category}`;
      const locationHtml = evt.chosenLocation ? `
        <div class="deploy-location-banner">
          <span class="deploy-loc-name">📍 ${evt.chosenLocation.name}</span>
          <span class="deploy-loc-region">${evt.chosenLocation.region}</span>
          <div class="deploy-loc-context">${evt.chosenLocation.context}</div>
        </div>` : '';
      const payHtml = evt.setDeployed ? UI._deployPayHtml(State.game.marine, evt.duration || 7, evt.id === 'evt_oif_deployment') : '';
      card.innerHTML = `
        <div class="event-card-header">
          <span class="event-category ${catClass}">${evt.category.toUpperCase()}</span>
          ${evt.title}
        </div>
        <div class="event-card-body">${evt.narrative}${locationHtml}</div>
        ${payHtml}
        <div class="event-card-choices" id="choices-${evt.id}"></div>
      `;

      const choicesEl = card.querySelector(`#choices-${evt.id}`);

      if (evt.isChance) {
        // Chance event — show impact summary, then a single acknowledge button
        if (evt.chanceImpact) {
          const impactEl = document.createElement('div');
          impactEl.className = `chance-impact ${evt.chanceType || 'neutral'}`;
          impactEl.textContent = evt.chanceImpact;
          card.querySelector('.event-card-body').after(impactEl);
        }
        const btn = document.createElement('button');
        btn.className = evt.choices[0].gameOverState ? 'chance-ack-btn chance-ack-brig' : 'chance-ack-btn';
        // Pre-click: action label. Post-click (in _resolveEventChoice): past-tense confirmation.
        btn.textContent = evt.choices[0].gameOverState
          ? (evt.choices[0].text || 'FACE THE CHARGES')
          : 'ACKNOWLEDGE';
        btn.addEventListener('click', () => {
          UI._resolveEventChoice(evt, 0, card, choicesEl);
        });
        choicesEl.appendChild(btn);
      } else {
        evt.choices.forEach((choice, idx) => {
          const btn = document.createElement('button');
          btn.className = 'event-choice-btn';
          btn.innerHTML = `${choice.text}<span class="choice-hint">${choice.hint || ''}</span>`;
          btn.addEventListener('click', () => {
            UI._selectEventChoice(evt, idx, card, choicesEl);
          });
          choicesEl.appendChild(btn);
        });
      }

      UI._pendingEventChoices[evt.id] = false;
      container.appendChild(card);
    });

    UI.checkAdvanceReady();
  },

  /** Build the deployment pay breakdown HTML block for an event card */
  _deployPayHtml(marine, months, isCombat) {
    const b = Finance.deploymentBreakdown(marine, months, isCombat);
    const tfBadge = '<span class="tax-free-badge">TAX-FREE</span>';
    const baseTF = isCombat ? tfBadge : '';
    return `
      <div class="deploy-pay-block">
        <div class="deploy-pay-title">DEPLOYMENT PAY ESTIMATE — ${months} MONTHS</div>
        <div class="deploy-pay-rows">
          <div class="deploy-pay-row"><span>Base Pay</span><span>${Finance.fmt(b.effectiveBase)}/mo ${baseTF}</span></div>
          <div class="deploy-pay-row"><span>BAH (home station rate)</span><span>${Finance.fmt(b.bah)}/mo</span></div>
          <div class="deploy-pay-row"><span>BAS</span><span>${Finance.fmt(b.bas)}/mo</span></div>
          <div class="deploy-pay-row"><span>Combat / Sea Pay</span><span>${Finance.fmt(b.specialPay)}/mo ${tfBadge}</span></div>
          <div class="deploy-pay-divider"></div>
          <div class="deploy-pay-row total"><span>Monthly Total</span><span>${Finance.fmt(b.monthlyTotal)}</span></div>
          <div class="deploy-pay-row savings"><span>Est. Tax Savings</span><span>~${Finance.fmt(b.monthlyTaxSaved)}/mo</span></div>
          <div class="deploy-pay-row grand"><span>${months}-Month Earnings</span><span>~${Finance.fmt(b.totalEarnings)}</span></div>
          <div class="deploy-pay-row grand-savings"><span>Total Tax Savings</span><span>~${Finance.fmt(b.totalTaxSaved)}</span></div>
        </div>
      </div>`;
  },

  _pendingEventChoices: {},
  _currentEvents: [],

  /** Soft-select a choice on a regular event card — allows changing before advancing */
  _selectEventChoice(evt, choiceIdx, _card, choicesEl) {
    UI._pendingEventChoices[evt.id] = choiceIdx;

    // Highlight selected, de-highlight others — keep all buttons enabled
    choicesEl.querySelectorAll('.event-choice-btn').forEach((btn, i) => {
      if (i === choiceIdx) {
        btn.style.borderColor = 'var(--green)';
        btn.style.background  = 'rgba(76,175,80,0.1)';
      } else {
        btn.style.borderColor = '';
        btn.style.background  = '';
      }
    });

    UI.checkAdvanceReady();
  },

  /** Immediate-resolve for chance events only (single ack button, no choice to change) */
  _resolveEventChoice(evt, choiceIdx, card, choicesEl) {
    const choice = evt.choices[choiceIdx];
    if (!choice) return;

    // Guard: ignore extra clicks after already resolved
    if (UI._pendingEventChoices[evt.id] === true) return;

    const logEntry = Events.resolveChoice(State.game.marine, evt, choiceIdx);
    if (logEntry) {
      State.game.log.unshift({ date: Engine._dateStr(), text: logEntry, major: false });
    }

    // Disable the ack button and flip to past-tense confirmation text
    const ackBtn = choicesEl.querySelector('.chance-ack-btn');
    if (ackBtn) {
      ackBtn.disabled = true;
      if (!choice.gameOverState) ackBtn.textContent = '✓ ACKNOWLEDGED';
    }

    // Add resolved badge to event card header
    const header = card.querySelector('.event-card-header');
    if (header && !header.querySelector('.evt-resolved-badge')) {
      const badge = document.createElement('span');
      badge.className = 'evt-resolved-badge';
      badge.textContent = ' \u2713 RESOLVED';
      header.appendChild(badge);
    }

    // Track recently resolved events so the same event can't re-roll next quarter
    UI._pendingEventChoices[evt.id] = true;
    if (!State.game.recentEventIds) State.game.recentEventIds = [];
    State.game.recentEventIds.unshift(evt.id);
    if (State.game.recentEventIds.length > 6) State.game.recentEventIds.pop();

    State.save();

    // Game-ending event (brig / dishonorable discharge)
    if (choice.gameOverState) {
      setTimeout(() => {
        UI.showEndState(choice.gameOverState);
        State.clearSave();
      }, 800);
      return;
    }

    // Refresh stat bars and finance numbers
    UI._refreshStatBars();
    UI.checkAdvanceReady();
  },

  /** Lightweight stat-only refresh — does not touch events or focus choices */
  _refreshStatBars() {
    const m = State.game.marine;
    const gradeOrder = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'];
    const isNCO = gradeOrder.indexOf(m.payGrade) >= 4;
    const profConductLabel = isNCO ? 'RS/RO Fitness Report' : 'Proficiency / Conduct';

    UI.renderStat('stat-physicalFitness', m.physicalFitness, 'Physical Fitness (PFT)');
    UI.renderStat('stat-profConduct', m.profConduct, profConductLabel);
    UI.renderStat('stat-mosProficiency', m.mosProficiency, 'MOS Proficiency');
    UI.renderStat('stat-disciplineRisk', m.disciplineRisk, 'Discipline Risk', true);
    UI.renderStat('stat-morale', m.morale, 'Morale');
    UI.renderStat('stat-stress', m.stress, 'Stress', true);
    UI.renderStat('stat-familyStability', m.familyStability, 'Family Stability');
    UI.renderStatText('stat-injury', `Injury: ${m.injury.charAt(0).toUpperCase() + m.injury.slice(1)}`);
    UI.renderStat('stat-civilianEmployability', m.civilianEmployability, 'Civilian Employability');
    UI._updateTabIndicators(m);

    const gross = Finance.monthlyGross(m);
    const bills = Finance.monthlyExpenses(m);
    const net2  = gross - bills;
    document.getElementById('fin-pay').textContent = Finance.fmt(gross) + '/mo';
    const billsEl2 = document.getElementById('fin-bills');
    if (billsEl2) billsEl2.textContent = Finance.fmt(bills) + '/mo';
    const netEl2 = document.getElementById('fin-net');
    if (netEl2) {
      netEl2.textContent = (net2 >= 0 ? '+' : '') + Finance.fmt(net2) + '/mo';
      netEl2.className = 'fin-val ' + (net2 >= 0 ? 'fin-positive' : 'fin-negative');
    }
    const checkEl2 = document.getElementById('fin-checking');
    if (checkEl2) checkEl2.textContent = Finance.fmt(m.checking || 0);
    document.getElementById('fin-savings').textContent = Finance.fmt(m.savings);
    document.getElementById('fin-debt').textContent = Finance.fmt(m.debt);
  },

  renderMonthlyChoices() {
    const m = State.game.marine;
    const container = document.getElementById('choices-list');
    container.innerHTML = '';
    UI._selectedFocuses = new Map();
    UI._focusBudgetSpent = 0;
    UI.checkAdvanceReady();

    const budget = Engine.focusBudget(m);

    // Bandwidth display
    const bwEl = document.getElementById('bandwidth-display');
    if (bwEl) UI._renderBandwidth(bwEl, budget, 0);

    Engine.availableChoices(m).forEach(choice => {
      const cost = choice.cost || 1;
      const btn = document.createElement('button');
      btn.className = 'monthly-choice-btn';
      btn.dataset.choiceId = choice.id;
      btn.dataset.cost = cost;

      const refreshBtn = () => {
        const count = UI._selectedFocuses.get(choice.id) || 0;
        btn.classList.toggle('selected', count > 0);
        btn.classList.toggle('unaffordable', count === 0 && cost > budget - UI._focusBudgetSpent);
        const multiplierHtml = count > 1
          ? `<span class="choice-multiplier">×${count}</span>`
          : '';
        const decrementHtml = count > 0
          ? `<span class="choice-decrement" title="Remove one">−</span>`
          : '';
        const label = choice.dynamicLabel ? choice.dynamicLabel(m) : choice.label;
        const hint  = choice.dynamicHint  ? choice.dynamicHint(m)  : choice.hint;
        btn.innerHTML = `
          <div class="choice-main">
            <span class="choice-label">${label}</span>
            <span class="choice-effects">${hint}</span>
          </div>
          <div class="choice-right">
            ${decrementHtml}
            ${multiplierHtml}
            <span class="choice-cost" title="${cost} bandwidth">${cost}</span>
          </div>
        `;
      };

      refreshBtn();

      btn.addEventListener('click', (e) => {
        const isDecrement = !!e.target.closest('.choice-decrement');
        const currentCount = UI._selectedFocuses.get(choice.id) || 0;
        const remaining = budget - UI._focusBudgetSpent;

        if (isDecrement) {
          if (currentCount > 0) {
            UI._focusBudgetSpent -= cost;
            if (currentCount === 1) {
              UI._selectedFocuses.delete(choice.id);
            } else {
              UI._selectedFocuses.set(choice.id, currentCount - 1);
            }
          }
        } else {
          // Increment if budget allows
          if (remaining >= cost) {
            UI._selectedFocuses.set(choice.id, currentCount + 1);
            UI._focusBudgetSpent += cost;
          }
        }

        refreshBtn();

        // Update bandwidth pips
        const bwEl2 = document.getElementById('bandwidth-display');
        if (bwEl2) UI._renderBandwidth(bwEl2, budget, UI._focusBudgetSpent);

        // Re-evaluate affordability on all other buttons
        const remaining2 = budget - UI._focusBudgetSpent;
        container.querySelectorAll('.monthly-choice-btn').forEach(b => {
          const bCount = UI._selectedFocuses.get(b.dataset.choiceId) || 0;
          if (bCount > 0) {
            b.classList.remove('unaffordable');
          } else {
            b.classList.toggle('unaffordable', parseInt(b.dataset.cost, 10) > remaining2);
          }
        });

        UI.checkAdvanceReady();
      });

      // Initial affordability state
      if (cost > budget) btn.classList.add('unaffordable');
      container.appendChild(btn);
    });
  },

  /** Render bandwidth pip display */
  _renderBandwidth(el, budget, spent) {
    const remaining = budget - spent;
    let pips = '';
    for (let i = 0; i < budget; i++) {
      pips += `<span class="bw-pip ${i < remaining ? 'bw-pip-on' : 'bw-pip-off'}"></span>`;
    }
    el.innerHTML = `
      <span class="bw-title">BANDWIDTH</span>
      <div class="bw-pips-row">${pips}<span class="bw-label">${remaining} / ${budget}</span></div>
    `;
  },

  _selectedFocuses: new Map(),
  _focusBudgetSpent: 0,

  // ── Tooltips ──────────────────────────────────

  /**
   * Wire up a single shared floating tooltip for the whole page.
   * Desktop: follows the cursor over any [data-tip] element.
   * Mobile:  tap a [data-tip] element to show; tap elsewhere to dismiss.
   * Call once from DOMContentLoaded.
   */

  /** Update the qual badge in the marine header. level = null | 'UNQ' | 'Marksman' | 'Sharpshooter' | 'Expert' */
  updateRifleQualBadge(level) {
    const badge = document.getElementById('marine-qual-badge');
    if (!badge) return;
    if (!level) {
      badge.className = 'qual-badge hidden';
      return;
    }
    badge.textContent = level.toUpperCase();
    badge.className   = 'qual-badge qual-badge-' + level.toLowerCase();
  },

  initTooltips() {
    const tip = document.getElementById('game-tooltip');
    if (!tip) return;

    let _tipEl = null;

    const showAt = (text, left, top) => {
      tip.textContent = text;
      tip.classList.remove('hidden');
      // Clamp so tip never goes off-screen
      const tipW = tip.offsetWidth  || 240;
      const tipH = tip.offsetHeight || 80;
      const margin = 8;
      if (left + tipW > window.innerWidth  - margin) left = window.innerWidth  - tipW - margin;
      if (top  + tipH > window.innerHeight - margin) top  = window.innerHeight - tipH - margin;
      if (left < margin) left = margin;
      if (top  < margin) top  = margin;
      tip.style.left = left + 'px';
      tip.style.top  = top  + 'px';
    };

    const hide = () => {
      tip.classList.add('hidden');
      _tipEl = null;
    };

    // ── Desktop: follow cursor ──────────────────
    document.addEventListener('mousemove', (e) => {
      const el = e.target.closest('[data-tip]');
      if (el) {
        _tipEl = el;
        const margin = 14;
        showAt(el.getAttribute('data-tip'), e.clientX + margin, e.clientY + margin);
      } else {
        if (_tipEl) hide();
      }
    });

    // Hide when cursor leaves the window
    document.addEventListener('mouseleave', hide);

    // ── Mobile: tap to show / tap elsewhere to dismiss ──
    document.addEventListener('touchend', (e) => {
      const el = e.target.closest('[data-tip]');
      if (el) {
        // Tapping the same element a second time dismisses
        if (_tipEl === el && !tip.classList.contains('hidden')) {
          hide();
          return;
        }
        _tipEl = el;
        const rect = el.getBoundingClientRect();
        let left = rect.left;
        let top  = rect.bottom + 8;
        // If tooltip would go below the fold, show it above the element instead
        const estH = 80;
        if (top + estH > window.innerHeight) top = rect.top - estH - 8;
        showAt(el.getAttribute('data-tip'), left, top);
      } else {
        if (_tipEl) hide();
      }
    }, { passive: true });
  },

  /**
   * Update the two blinking indicator dots on the mobile STATS tab.
   * One dot for READINESS (physicalFitness, profConduct, mosProficiency, disciplineRisk),
   * one for WELL-BEING (morale, stress, familyStability).
   * Dot is 'danger' (red/fast) if any stat in the group is in the warning zone,
   * 'caution' (yellow/slow) if any is in the caution zone.
   */
  _updateTabIndicators(m) {
    const indReadiness = document.getElementById('tab-ind-readiness');
    const indWellbeing = document.getElementById('tab-ind-wellbeing');
    if (!indReadiness || !indWellbeing) return;

    const sev = (val, invert) => {
      const pct = clamp(val, 0, 100);
      if (invert) return pct > 70 ? 'danger' : pct > 45 ? 'caution' : 'none';
      return pct < 30 ? 'danger' : pct < 55 ? 'caution' : 'none';
    };

    const worst = (...levels) => {
      if (levels.includes('danger')) return 'danger';
      if (levels.includes('caution')) return 'caution';
      return 'none';
    };

    const readinessLvl = worst(
      sev(m.physicalFitness, false),
      sev(m.profConduct, false),
      sev(m.mosProficiency, false),
      sev(m.disciplineRisk, true),
    );

    const wellbeingLvl = worst(
      sev(m.morale, false),
      sev(m.stress, true),
      sev(m.familyStability, false),
    );

    const apply = (el, lvl) => {
      el.className = `tab-indicator${lvl !== 'none' ? ' ' + lvl : ''}`;
    };

    apply(indReadiness, readinessLvl);
    apply(indWellbeing, wellbeingLvl);
  },

  checkAdvanceReady() {
    // All events must have a selection (number index) or be fully resolved (true for chance events)
    const allEventsResolved = Object.values(UI._pendingEventChoices).every(v => v !== false);
    const hasNoEvents = Object.keys(UI._pendingEventChoices).length === 0;
    const focusChosen = UI._selectedFocuses.size > 0;

    const ready = (allEventsResolved || hasNoEvents) && focusChosen;
    document.getElementById('btn-advance').disabled = !ready;
  },

  // ── Decision Modal ────────────────────────────

  showDecisionModal(config) {
    document.getElementById('modal-icon').textContent = config.icon || '⚠';
    document.getElementById('modal-title').textContent = config.title;
    document.getElementById('modal-body').innerHTML = config.body;

    const choicesEl = document.getElementById('modal-choices');
    choicesEl.innerHTML = '';
    config.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'modal-choice-btn';
      btn.innerHTML = `
        <div class="mc-title">${choice.title}</div>
        <div class="mc-desc">${choice.desc}</div>
        ${choice.effect ? `<div class="mc-effect">${choice.effect}</div>` : ''}
      `;
      btn.addEventListener('click', () => {
        UI.hideDecisionModal();
        choice.onSelect();
      });
      choicesEl.appendChild(btn);
    });

    document.getElementById('modal-decision').classList.remove('hidden');
  },

  hideDecisionModal() {
    document.getElementById('modal-decision').classList.add('hidden');
  },

  // ── Reenlistment Decision ─────────────────────

  showReenlistmentModal(winInfo, marine, onDecision) {
    const m = marine || State.game.marine;
    const tisYears = Math.floor(m.timeInService / 12);
    const tisMons = m.timeInService % 12;

    const bodyHtml = `
      <p>Your <strong>${winInfo.label}</strong> is open. You must decide whether to reenlist or begin EAS out-processing.</p>
      <p>Rank: <strong>${m.rankAbbr}</strong> | TIS: <strong>${tisYears}y ${tisMons}m</strong> | ProCon: <strong>${Math.round(m.profConduct)}</strong></p>
      <p>Savings: <strong>${Finance.fmt(m.savings)}</strong> | GI Bill: <strong>${m.giBillMonths} months remaining</strong></p>
    `;

    const choices = CONTRACT_LENGTHS.map(yrs => {
      const srb = Career.calculateSRB(m, yrs);
      const newEAS = Math.floor((m.timeInService + yrs * 12) / 12);
      return {
        title: `Reenlist — ${yrs}-Year Contract`,
        desc: `EAS at ${newEAS} years TIS`,
        effect: srb > 0 ? `SRB Bonus: ${Finance.fmt(srb)}` : 'No SRB for this term',
        onSelect: () => onDecision('reenlist', { years: yrs, srb }),
      };
    });

    choices.push({
      title: 'Separate — EAS',
      desc: 'End active duty. Begin transition to civilian life or reserve component.',
      effect: `Education: ${m.educationCredits} credits (${m.degreeProgress})`,
      onSelect: () => onDecision('eas', null),
    });

    UI.showDecisionModal({
      icon: '📋',
      title: winInfo.label,
      body: bodyHtml,
      choices,
    });
  },

  // ── End State ─────────────────────────────────

  showEndState(endStateId) {
    const m = State.game.marine;
    const tis = m.timeInService;
    const config = END_STATES[endStateId] || END_STATES['basic_eas'];

    document.getElementById('end-icon').textContent = config.icon;
    document.getElementById('end-title').textContent = config.title;
    document.getElementById('end-subtitle').textContent = `${m.rankAbbr} ${m.name} — ${config.subtitle}`;
    document.getElementById('end-narrative').innerHTML = config.narrative(m, tis);

    const statsEl = document.getElementById('end-stats');
    statsEl.innerHTML = `
      <div class="end-stat-chip"><span class="esc-label">Final Rank</span><span class="esc-val">${m.rankAbbr}</span></div>
      <div class="end-stat-chip"><span class="esc-label">Time in Service</span><span class="esc-val">${Math.floor(tis / 12)}y ${tis % 12}m</span></div>
      <div class="end-stat-chip"><span class="esc-label">Savings</span><span class="esc-val">${Finance.fmt(m.savings)}</span></div>
      <div class="end-stat-chip"><span class="esc-label">Education</span><span class="esc-val">${m.educationCredits} cr</span></div>
      <div class="end-stat-chip"><span class="esc-label">Awards</span><span class="esc-val">${m.awards.length || 0}</span></div>
      <div class="end-stat-chip"><span class="esc-label">Family</span><span class="esc-val">${m.isMarried ? (m.childCount > 0 ? `Married, ${m.childCount} kid(s)` : 'Married') : 'Single'}</span></div>
    `;

    UI.showScreen('screen-end');
    UI.renderEndOutlook(endStateId, m, tis);
  },

  /** Render the civilian/retirement outcome analysis below the end-screen narrative */
  renderEndOutlook(endStateId, marine, tis) {
    const el = document.getElementById('end-outlook');
    if (!el) return;

    const easStates = ['smooth_civilian', 'family_first', 'high_achiever_eas', 'basic_eas', 'bad_discharge', 'medical_discharge'];
    const isEAS = easStates.includes(endStateId);
    const isRetirement = endStateId === 'retirement' || endStateId === 'high_achiever_retirement';

    let html = '';

    // ── EAS — Civilian outlook + road not taken ──────────────────────────
    if (isEAS) {
      const outlook = Career.civilianOutlook(marine, tis);
      const retire = Career.retirementProjection(marine, tis);

      const fmtSalary = n => `$${n.toLocaleString()}`;

      html += `
        <div class="eo-section">
          <div class="eo-section-title">CIVILIAN OUTLOOK</div>
          <div class="eo-tier eo-tier-${outlook.tierColor}">JOB PROSPECTS: ${outlook.tier.toUpperCase()}</div>
          <div class="eo-salary-row">
            <span class="eo-label">First-year salary estimate</span>
            <span class="eo-salary-val">${fmtSalary(outlook.salaryMin)} – ${fmtSalary(outlook.salaryMax)}</span>
          </div>
          <div class="eo-salary-row">
            <span class="eo-label">Financial runway</span>
            <span class="eo-salary-val ${outlook.runwayMonths < 2 ? 'eo-val-bad' : ''}">
              ${outlook.runwayMonths > 0 ? `~${outlook.runwayMonths} months` : 'None — must work immediately'}
            </span>
          </div>
          <div class="eo-factors">
            ${outlook.factors.map(f => `
              <div class="eo-factor eo-factor-${f.type}">
                <span class="eo-factor-icon">${f.type === 'good' ? '✓' : '✗'}</span>
                <span>${f.text}</span>
              </div>
            `).join('')}
          </div>
          <div class="eo-family-row">
            <span class="eo-label">Family:</span> ${outlook.familyOutlook}
          </div>
        </div>
      `;

      // ── Reserve component section ────────────────────────────────────────
      if (marine.reserveStatus === 'SMCR' || marine.reserveStatus === 'IRR') {
        const reservePath = Career.reserveRetirementPath(marine, tis);

        if (marine.reserveStatus === 'SMCR') {
          const tisYears = Math.floor(tis / 12);
          html += `
            <div class="eo-section">
              <div class="eo-section-title">SELECTED MARINE CORPS RESERVE — SMCR DRILLING</div>
              <p class="eo-body">
                You're staying connected. One weekend a month. Two weeks of Annual Training each summer.
                You keep your rank, your clearance, and your paycheck — even if it's not full-time.
              </p>
              <div class="eo-comparison">
                <div class="eo-comp-row">
                  <span class="eo-comp-label">Monthly drill pay</span>
                  <span class="eo-comp-val">~${Finance.fmt(reservePath ? reservePath.monthlyDrillPay : 0)}/mo</span>
                </div>
                <div class="eo-comp-row">
                  <span class="eo-comp-label">Annual Training supplement</span>
                  <span class="eo-comp-val">~${Finance.fmt(reservePath ? reservePath.monthlyATPay : 0)}/mo equiv</span>
                </div>
                <div class="eo-comp-row">
                  <span class="eo-comp-label">Total reserve income</span>
                  <span class="eo-comp-val">~${Finance.fmt(reservePath ? reservePath.totalMonthlyDrill : 0)}/mo</span>
                </div>
                ${reservePath ? `
                <div class="eo-comp-row">
                  <span class="eo-comp-label">Reserve good years needed</span>
                  <span class="eo-comp-val">${reservePath.reserveYearsNeeded} more years</span>
                </div>
                <div class="eo-comp-row">
                  <span class="eo-comp-label">Reserve retirement eligible at</span>
                  <span class="eo-comp-val">Age 60 (${60 - (18 + tisYears)} years away)</span>
                </div>
                ` : ''}
              </div>
              ${reservePath ? `
              <div class="eo-pension-block">
                <div class="eo-pension-label">Reserve retirement pay at age 60 (est.)</div>
                <div class="eo-pension-amount">~${Finance.fmt(reservePath.monthlyPension)}/mo</div>
                <div class="eo-pension-sub">If you complete ${reservePath.reserveYearsNeeded} satisfactory reserve years · projected ${reservePath.projAbbr}</div>
                <div class="eo-pension-lifetime">+ VA healthcare eligibility at 60 · commissary/PX access</div>
              </div>
              ` : ''}
              <div class="eo-factors">
                <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>Military network stays active — referrals, references, career doors</span></div>
                <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>Leadership credentials remain current on your resume</span></div>
                <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>Security clearance maintained through reserve service</span></div>
                <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>USERRA protects your civilian job if mobilized</span></div>
                <div class="eo-factor eo-factor-bad"><span class="eo-factor-icon">✗</span><span>GWOT mobilization risk is real — reserve units are actively deploying</span></div>
                <div class="eo-factor eo-factor-bad"><span class="eo-factor-icon">✗</span><span>Some civilian employers hesitate to hire reservists (illegal to discriminate, but it happens)</span></div>
                <div class="eo-factor eo-factor-bad"><span class="eo-factor-icon">✗</span><span>One weekend/month + two weeks/year away from family and civilian career</span></div>
              </div>
              <div class="eo-reserve-hub">
                <a href="https://reservehub.swf.army.mil/" target="_blank" rel="noopener noreferrer" class="eo-reserve-hub-link"><span>Find Open SMCR Billets Nationwide → Reserve Hub</span></a>
              </div>
            </div>
          `;
        } else if (marine.reserveStatus === 'IRR') {
          const remainingMSO = Math.max(0, 96 - tis);
          const remainingYrs = Math.ceil(remainingMSO / 12);
          html += `
            <div class="eo-section">
              <div class="eo-section-title">INDIVIDUAL READY RESERVE — IRR STATUS</div>
              <p class="eo-body">
                No drills. No pay. No weekend commitments. You're a warm body in a database — until the Corps needs you.
              </p>
              <div class="eo-comparison">
                <div class="eo-comp-row">
                  <span class="eo-comp-label">Remaining MSO obligation</span>
                  <span class="eo-comp-val">${remainingYrs > 0 ? `~${remainingYrs} year${remainingYrs !== 1 ? 's' : ''}` : 'Fulfilled'}</span>
                </div>
                <div class="eo-comp-row">
                  <span class="eo-comp-label">Drill pay</span>
                  <span class="eo-comp-val eo-val-bad">$0 — non-drilling</span>
                </div>
                <div class="eo-comp-row">
                  <span class="eo-comp-label">Reserve retirement path</span>
                  <span class="eo-comp-val eo-val-bad">None — no good years accruing</span>
                </div>
              </div>
              <div class="eo-factors">
                <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>Full civilian focus — no military obligations on your time</span></div>
                <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>Weekends and leave are entirely yours</span></div>
                <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>No employer concerns about mobilization taking you away</span></div>
                ${remainingYrs > 0 ? `
                <div class="eo-factor eo-factor-bad"><span class="eo-factor-icon">✗</span><span>Subject to involuntary recall for up to ${remainingYrs} more year${remainingYrs !== 1 ? 's' : ''} — especially dangerous in GWOT era</span></div>
                ` : ''}
                <div class="eo-factor eo-factor-bad"><span class="eo-factor-icon">✗</span><span>Military network will fade without active contact</span></div>
                <div class="eo-factor eo-factor-bad"><span class="eo-factor-icon">✗</span><span>No additional retirement credits — active pension only possible if recalled to active duty long enough</span></div>
              </div>
            </div>
          `;
        }
      }

      if (retire && retire.yearsLeft > 0) {
        html += `
          <div class="eo-section">
            <div class="eo-section-title">THE ROAD NOT TAKEN</div>
            <p class="eo-body">Had you stayed to 20 years of active service:</p>
            <div class="eo-comparison">
              <div class="eo-comp-row">
                <span class="eo-comp-label">Years still required</span>
                <span class="eo-comp-val">${retire.yearsLeft} more years</span>
              </div>
              <div class="eo-comp-row">
                <span class="eo-comp-label">Projected retirement rank</span>
                <span class="eo-comp-val">${retire.projAbbr} (${retire.projGrade})</span>
              </div>
              <div class="eo-comp-row">
                <span class="eo-comp-label">Est. additional deployments</span>
                <span class="eo-comp-val">~${retire.deployEstimate}</span>
              </div>
              <div class="eo-comp-row">
                <span class="eo-comp-label">Est. additional PCS moves</span>
                <span class="eo-comp-val">~${retire.pcsEstimate}</span>
              </div>
            </div>
            <div class="eo-pension-block">
              <div class="eo-pension-label">Monthly retirement pay (tax-free, for life)</div>
              <div class="eo-pension-amount">~${Finance.fmt(retire.monthlyPension)}/mo</div>
              <div class="eo-pension-sub">+ VA healthcare · commissary/PX · space-A travel</div>
              <div class="eo-pension-lifetime">20-year pension value: ~${Finance.fmt(retire.pensionLifetime)}</div>
            </div>
            <p class="eo-body eo-body-muted">
              The pension floor is real — and so is what those ${retire.yearsLeft} years would have cost.
              Neither path is wrong. It depends on what you're building toward.
            </p>
          </div>
        `;
      }

      // ── VA Disability estimate ───────────────────────────────────────────
      const va = Career.estimateVADisability(marine, tis);
      html += `
        <div class="eo-section">
          <div class="eo-section-title">VA DISABILITY ESTIMATE</div>
          <p class="eo-va-note">Based on your service record. File your claim before you out-process — VA claims take months to process and the clock starts at separation, not when you file.</p>
          <div class="eo-pension-block">
            <div class="eo-pension-label">Monthly VA compensation (est., tax-free)</div>
            <div class="eo-pension-amount">$${va.monthlyLow.toLocaleString()} – $${va.monthlyHigh.toLocaleString()}/mo</div>
            <div class="eo-pension-sub">Based on estimated ${va.ratingLow}%–${va.ratingHigh}% combined disability rating</div>
          </div>
          <div class="eo-factors">
            ${va.conditions.map(c => `
              <div class="eo-factor eo-factor-neutral">
                <span class="eo-factor-icon">·</span>
                <span>${c}</span>
              </div>
            `).join('')}
          </div>
          ${va.thresholds.length ? `
            <div class="eo-section-title eo-section-title-sub">BENEFITS LIKELY UNLOCKED</div>
            <div class="eo-factors">
              ${va.thresholds.map(t => `
                <div class="eo-factor eo-factor-good">
                  <span class="eo-factor-icon">✓</span>
                  <span>${t}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${va.tdiuEligible ? `
            <p class="eo-body eo-body-muted">At 70%+ combined, you may qualify for TDIU — receiving 100%-equivalent monthly pay ($3,831) if the disability prevents substantially gainful employment.</p>
          ` : ''}
        </div>
      `;
    }

    // ── Retirement — benefits + civilian comparison ───────────────────────
    if (isRetirement) {
      const basePay = Finance.RETIREMENT_BASE_PAY[marine.payGrade] || Finance.BASE_PAY[marine.payGrade] || 2140;
      const monthlyPension = Math.round(basePay * 0.50);
      const pensionLifetime = monthlyPension * 12 * 20;
      const tisYears = Math.floor(tis / 12);
      const retireAge = 18 + tisYears;   // roughly — enlisted at 18

      html += `
        <div class="eo-section">
          <div class="eo-section-title">RETIREMENT BENEFITS</div>
          <div class="eo-pension-block">
            <div class="eo-pension-label">Monthly retirement pay (tax-free, for life)</div>
            <div class="eo-pension-amount">${Finance.fmt(monthlyPension)}/mo</div>
            <div class="eo-pension-sub">50% of ${marine.payGrade} base pay — yours from approximately age ${retireAge}</div>
            <div class="eo-pension-lifetime">20-year pension value: ~${Finance.fmt(pensionLifetime)}</div>
          </div>
          <div class="eo-factors">
            <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>Full VA healthcare — no premiums, no deductibles</span></div>
            <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>Commissary and PX access — significant household savings</span></div>
            <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>Space-A travel on military aircraft</span></div>
            <div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>DD-214 and veteran preference in federal hiring</span></div>
            ${marine.educationCredits >= 20 ? `<div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>${marine.educationCredits} college credits — GI Bill still available for unused months</span></div>` : ''}
            ${marine.savings >= 10000 ? `<div class="eo-factor eo-factor-good"><span class="eo-factor-icon">✓</span><span>${Finance.fmt(marine.savings)} in savings stacked on top of the pension</span></div>` : ''}
          </div>
        </div>
        <div class="eo-section">
          <div class="eo-section-title">WHAT COMES NEXT</div>
          <p class="eo-body">
            Marines retire young — around age ${retireAge}. That's decades of working life ahead.
            With a pension as your floor, you can take risks that civilians with no safety net can't afford to take.
            Second career. Business. Education. Whatever you choose — you choose it on your terms.
          </p>
          <p class="eo-body eo-body-muted">
            Marines who got out at 4–8 years and went civilian are in the workforce now with no pension and no guarantee.
            You played the long game. The pension is yours. Semper Fi.
          </p>
        </div>
        ${(() => {
          const va = Career.estimateVADisability(marine, tis);
          return `
            <div class="eo-section">
              <div class="eo-section-title">VA DISABILITY ESTIMATE</div>
              <p class="eo-va-note">Retirees can receive VA disability pay on top of retirement pay. Don't leave this on the table — document everything at your separation physical.</p>
              <div class="eo-pension-block">
                <div class="eo-pension-label">Monthly VA compensation (est., tax-free)</div>
                <div class="eo-pension-amount">$${va.monthlyLow.toLocaleString()} – $${va.monthlyHigh.toLocaleString()}/mo</div>
                <div class="eo-pension-sub">Based on estimated ${va.ratingLow}%–${va.ratingHigh}% combined disability rating</div>
                ${(va.crdpEligible || va.crdpPossible) ? `<div class="eo-pension-lifetime">CRDP: ${va.crdpEligible ? 'Eligible' : 'Possible'} — full pension + full VA pay simultaneously at 50%+</div>` : ''}
              </div>
              ${(va.crdpEligible || va.crdpPossible) ? `
                <p class="eo-body eo-body-muted">At 50%+ VA rating, CRDP means you receive your full retirement pension AND your full VA disability check simultaneously. DFAS applies this automatically — no application needed.</p>
              ` : ''}
              <div class="eo-factors">
                ${va.conditions.map(c => `
                  <div class="eo-factor eo-factor-neutral">
                    <span class="eo-factor-icon">·</span>
                    <span>${c}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        })()}
      `;
    }

    el.innerHTML = html;
  },

  // ── Mobile Tabs ───────────────────────────────

  _activeTab: 'events',

  _switchTab(target) {
    const prev = UI._activeTab;
    UI._activeTab = target;

    // Determine slide direction: events is "left", stats is "right"
    const slideClass = (prev === 'events' && target === 'stats') ? 'tab-slide-from-right' :
                       (prev === 'stats'  && target === 'events') ? 'tab-slide-from-left'  : '';

    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === target));
    document.querySelectorAll('.tab-panel').forEach(p => {
      const isTarget = p.dataset.tabTarget === target;
      p.classList.toggle('active', isTarget);
      if (isTarget && slideClass) {
        p.classList.add(slideClass);
        p.addEventListener('animationend', () => p.classList.remove(slideClass), { once: true });
      }
    });
  },

  initTabs() {
    document.getElementById('mobile-tabs').addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      UI._switchTab(tab.dataset.tab);
    });

    // Fix initial state: remove active from any panel that isn't the default tab
    UI._switchTab('events');

    UI._initSwipe();
  },

  _initSwipe() {
    const layout = document.querySelector('.game-layout');
    if (!layout) return;
    let startX = 0;
    let startY = 0;
    layout.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    layout.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      // Only register as a horizontal swipe if horizontal motion dominates
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0 && UI._activeTab === 'events') UI._switchTab('stats');   // swipe left → stats
      if (dx > 0 && UI._activeTab === 'stats')  UI._switchTab('events');  // swipe right → events
    }, { passive: true });
  },

  // ── Savings Planner ───────────────────────────

  renderSavingsPlanner(m, gross, bills) {
    const el = document.getElementById('savings-planner');
    if (!el) return;
    const disposable = gross - bills;
    const goal = m.savingsGoal || 0;
    const lifestyle = Math.max(0, disposable - goal);

    el.innerHTML = `
      <div class="sp-row">
        <span class="sp-label">Disposable / mo</span>
        <span class="sp-val ${disposable < 0 ? 'danger' : ''}">${Finance.fmt(disposable)}</span>
      </div>
      <div class="sp-row sp-goal-row">
        <span class="sp-label">Savings Goal</span>
        <div class="sp-controls">
          <button class="sp-btn" id="sp-minus">&#8722;</button>
          <span class="sp-val" id="sp-goal-val">${Finance.fmt(goal)}/mo</span>
          <button class="sp-btn" id="sp-plus">+</button>
        </div>
      </div>
      <div class="sp-row">
        <span class="sp-label">Discretionary</span>
        <span class="sp-val">${Finance.fmt(lifestyle)}/mo</span>
      </div>
      <div class="sp-note">${goal === 0 ? 'Saving nothing \u2014 spending everything.' : lifestyle > 300 ? 'You\'re living well and saving.' : 'Tight budget. Discipline.'}</div>
    `;

    document.getElementById('sp-minus').addEventListener('click', () => {
      m.savingsGoal = Math.max(0, (m.savingsGoal || 0) - 50);
      State.save();
      UI.renderSavingsPlanner(m, gross, bills);
    });
    document.getElementById('sp-plus').addEventListener('click', () => {
      const maxGoal = Math.max(0, disposable);
      m.savingsGoal = Math.min(maxGoal, (m.savingsGoal || 0) + 50);
      State.save();
      UI.renderSavingsPlanner(m, gross, bills);
    });
  },

  // ── Helpers ───────────────────────────────────

  _statLabel(key) {
    const labels = {
      physicalFitness: 'Physical',
      morale: 'Morale',
      disciplineRisk: 'Discipline Risk',
      mosProficiency: 'MOS Prof',
      stress: 'Stress',
      familyStability: 'Family',
      profConduct: 'Pro/Con',
      savings: 'Savings',
    };
    return labels[key] || key;
  },
};

// ── End State Definitions ──────────────────────
const END_STATES = {
  retirement: {
    icon: '🎖',
    title: 'RETIREMENT — 20 YEARS OF SERVICE',
    subtitle: 'Honor. Commitment. Semper Fidelis.',
    narrative: (m, tis) => `After ${Math.floor(tis / 12)} years of service, ${m.rankAbbr} ${m.name} hangs up the uniform. The retirement ceremony is attended by Marines who served alongside you across multiple deployments, duty stations, and challenges that civilians will never understand. Your monthly retirement check is a small measure of what you earned. The brotherhood is forever.`,
  },
  high_achiever_retirement: {
    icon: '⭐',
    title: 'MASTER GUNNERY SERGEANT / SERGEANT MAJOR',
    subtitle: 'You reached the pinnacle of enlisted service.',
    narrative: (m, tis) => `${m.rankAbbr} ${m.name} — after ${Math.floor(tis / 12)} years of service, you have shaped the careers of hundreds of Marines. Your last formation is a sea of dress blues. Young Lance Corporals watch you with the same awe you once had for your first GySgt. The Marine Corps is better because you stayed.`,
  },
  smooth_civilian: {
    icon: '🎓',
    title: 'SMOOTH TRANSITION',
    subtitle: 'Education, savings, and a clear path forward.',
    narrative: (m, tis) => `${m.rankAbbr} ${m.name} separates after ${Math.floor(tis / 12)} years with ${m.educationCredits} college credits, ${Finance.fmt(m.savings)} in savings, and skills that translate directly to the civilian sector. The GI Bill funds the degree. The MOS experience lands the interviews. This is what a successful EAS looks like.`,
  },
  family_first: {
    icon: '🏠',
    title: 'FAMILY FIRST',
    subtitle: 'You chose what mattered most.',
    narrative: (m, tis) => `${m.rankAbbr} ${m.name} gets out after ${Math.floor(tis / 12)} years. The decision wasn't easy — the Corps was family too. But the real family at home needed more. The VA provides healthcare. The civilian career isn't glamorous yet, but the work-life balance lets you be present. Some Marines find their purpose after the Corps. You're one of them.`,
  },
  high_achiever_eas: {
    icon: '💼',
    title: 'HIGH-VALUE TRANSITION',
    subtitle: 'Your career record opens every door.',
    narrative: (m, tis) => `${m.rankAbbr} ${m.name} — ${Math.floor(tis / 12)} years, multiple deployments, ${m.pmeCompleted.length} PME courses, billets that most Marines never see. Defense contractors, federal agencies, and private sector employers are competing for your resume. You leave the Corps on your terms.`,
  },
  bad_discharge: {
    icon: '⚠',
    title: 'INVOLUNTARY SEPARATION',
    subtitle: 'The Corps ended it before you did.',
    narrative: (m, tis) => `${m.rankAbbr} ${m.name}'s time in the Marine Corps ends not by choice. After ${Math.floor(tis / 12)} years, the combination of disciplinary issues and eroded trust with leadership resulted in separation proceedings. It doesn't have to define you — but it will take time and deliberate effort to move forward. Many Marines have rebuilt. You can too.`,
  },
  medical_discharge: {
    icon: '🏥',
    title: 'MEDICAL SEPARATION',
    subtitle: 'The body gave everything it had.',
    narrative: (m, tis) => `${m.rankAbbr} ${m.name} is medically separated after ${Math.floor(tis / 12)} years. The injuries and stress accumulated over a career of service finally made continuation impossible. The VA disability rating provides some financial support. The transition is difficult — but your service was real, and the Marine Corps is grateful.`,
  },
  basic_eas: {
    icon: '🪖',
    title: 'END OF ACTIVE SERVICE',
    subtitle: 'You served. That matters.',
    narrative: (m, tis) => `${m.rankAbbr} ${m.name} completes their service commitment and separates from active duty after ${Math.floor(tis / 12)} years. The DD-214 is signed. The uniform goes in the closet. Whatever comes next — college, work, family — you carry the title of Marine with you. Once a Marine, always a Marine.`,
  },
  brig_discharge: {
    icon: '⛓',
    title: 'COURT-MARTIAL — DISHONORABLE DISCHARGE',
    subtitle: 'Career over. This one was preventable.',
    narrative: (m, tis) => `${m.rankAbbr} ${m.name} — ${Math.floor(tis / 12)} years of service ends in a courtroom. The urinalysis came back positive. The legal process moves fast when the evidence is clear. Court-martial proceedings, forfeiture of pay, confinement, and a dishonorable discharge. That characterization follows every background check, security clearance inquiry, and VA claim for decades to come. The Corps gave you everything it had. This is the hardest kind of ending — because it didn't have to go this way.`,
  },
};
