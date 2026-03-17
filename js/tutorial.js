/* ═══════════════════════════════════════════════
   TUTORIAL — Interactive new-player guided tour
   Replaces the static "Reporting to the Fleet" panel.
   ═══════════════════════════════════════════════ */

const Tutorial = (() => {

  const STEPS = [
    {
      target:  null,
      pos:     'center',
      title:   'WELCOME TO THE FLEET',
      body:    "You've earned the title Marine. This quick tour covers the screen — takes about 30 seconds. You can skip it at any time."
    },
    {
      target:     () => document.getElementById('mobile-tabs'),
      pos:        'bottom',
      title:      'NAVIGATING THE SCREEN',
      body:       'Use these two tabs to switch between your Stats and the Events feed. Stats is your service record — Events is where decisions happen each quarter.',
      mobileOnly: true
    },
    {
      target:  () => document.querySelector('.marine-header'),
      tab:     'stats',
      pos:     'right',
      title:   'YOUR MARINE',
      body:    'Rank, name, and MOS live here. The rank badge updates with every promotion. Awards stack on the right as your service record builds.'
    },
    {
      target:  () => document.getElementById('stat-physicalFitness')?.closest('.stat-section'),
      tab:     'stats',
      pos:     'right',
      title:   'READINESS',
      body:    'Physical Fitness, Professional Conduct, MOS Proficiency, and Discipline Risk. Keep the first three high and the last one low — or NJP starts looking like a real possibility.'
    },
    {
      target:  () => document.getElementById('stat-morale')?.closest('.stat-section'),
      tab:     'stats',
      pos:     'right',
      title:   'WELL-BEING',
      body:    'High stress tanks morale. Low morale makes everything harder. Deployments, debt, injuries, and personal problems all push these needles.'
    },
    {
      target:  () => document.getElementById('fin-pay')?.closest('.stat-section') || document.getElementById('fin-pay'),
      tab:     'stats',
      pos:     'right',
      title:   'FINANCE',
      body:    'Gross pay minus bills equals your monthly net. Debt compounds every month — only a deliberate paydown clears it. A bad car loan early on can follow you for years.'
    },
    {
      target:  () => document.getElementById('savings-planner')?.closest('.stat-section'),
      tab:     'stats',
      pos:     'right',
      title:   'SAVINGS PLAN',
      body:    'Set a monthly savings target here. Whatever you allocate moves from checking to savings automatically — as long as the funds are there. Build a cushion early; emergencies will come.'
    },
    {
      target:  () => document.getElementById('stat-civilianEmployability')?.closest('.stat-section'),
      tab:     'stats',
      pos:     'right',
      title:   'TRANSITION READINESS',
      body:    'Your civilian employability and education credits. MOS value, clearance, certs, and school all push this up. If you plan to EAS, your post-service options depend on what you build here.'
    },
    {
      target:  () => document.querySelector('.career-tracks') || document.getElementById('track-retirement')?.closest('.stat-section'),
      tab:     'stats',
      pos:     'top',
      title:   'CAREER TRACKS',
      body:    'Four possible endings: Retirement, High Achiever EAS, Basic EAS, or Family First. Your quarterly choices move these meters. Some paths close permanently.'
    },
    {
      target:  () => document.querySelector('.turn-header'),
      tab:     'events',
      pos:     'bottom',
      title:   'TIME IN SERVICE',
      body:    'Current date, months served, rank, and assignment. Deployments and PCS orders surface here when they happen. Track how close you are to key milestones.'
    },
    {
      target:  () => document.getElementById('events-container'),
      tab:     'events',
      pos:     'left',
      title:   'EVENTS',
      body:    'Each quarter brings situations that need a decision. Some are minor. Some follow you for years. Read carefully before you choose — there are no take-backs.'
    },
    {
      target:  () => document.getElementById('monthly-choices'),
      tab:     'events',
      pos:     'left',
      title:   'FOCUS CHOICES',
      body:    'After events, you spend your bandwidth on what matters — fitness, career, finances, or family. You can only do so much each quarter. Prioritize deliberately.'
    },
    {
      target:  () => document.getElementById('btn-advance'),
      tab:     'events',
      pos:     'top',
      title:   'ADVANCE QUARTER',
      body:    "Resolve events, set your focus, then advance. Three months pass. Repeat until retirement or EAS — or until something goes sideways. Good luck, Marine.",
      final:   true
    }
  ];

  const MOBILE_BREAKPOINT = 720; // px — single-column layout below this

  let _active    = false;
  let _overlay   = null;
  let _highlight = null;
  let _popover   = null;

  // ── Public ────────────────────────────────────
  function start() {
    if (_active) return;
    _active = true;
    _buildDOM();
    _show(0);
  }

  // ── DOM construction ──────────────────────────
  function _buildDOM() {
    _overlay = document.createElement('div');
    _overlay.className = 'tour-overlay';
    document.body.appendChild(_overlay);

    _highlight = document.createElement('div');
    _highlight.className = 'tour-highlight';
    document.body.appendChild(_highlight);

    _popover = document.createElement('div');
    _popover.className = 'tour-popover';
    document.body.appendChild(_popover);
  }

  // ── Show a step ───────────────────────────────
  function _show(index) {
    const step   = STEPS[index];
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    // Skip mobile-only steps on desktop
    if (step.mobileOnly && !isMobile) { _show(index + 1); return; }

    const isLast = step.final || index === STEPS.length - 1;

    _popover.innerHTML =
      '<div class="tour-step-count">' + (index + 1) + ' \u2215 ' + STEPS.length + '</div>' +
      '<div class="tour-title">'      + step.title + '</div>' +
      '<div class="tour-body">'       + step.body  + '</div>' +
      '<div class="tour-actions">' +
        '<button class="tour-btn-skip">SKIP TOUR</button>' +
        '<div class="tour-nav">' +
          (index > 0 ? '<button class="tour-btn-back">&larr; BACK</button>' : '') +
          '<button class="tour-btn-next">' + (isLast ? '&#10003;&nbsp;BEGIN CAREER' : 'NEXT &rarr;') + '</button>' +
        '</div>' +
      '</div>';

    _popover.querySelector('.tour-btn-skip').addEventListener('click', _finish);
    _popover.querySelector('.tour-btn-next').addEventListener('click', () => {
      if (isLast) _finish();
      else        _show(index + 1);
    });
    const backBtn = _popover.querySelector('.tour-btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        let prev = index - 1;
        // Skip mobileOnly steps when going back on desktop
        if (prev >= 0 && STEPS[prev].mobileOnly && !isMobile) prev--;
        if (prev >= 0) _show(prev);
      });
    }

    // Re-animate popover on each step
    _popover.classList.remove('tour-pop-in');
    void _popover.offsetWidth; // force reflow
    _popover.classList.add('tour-pop-in');

    const tabSwitched = _switchTab(step);
    const delay       = tabSwitched ? 160 : 0;

    setTimeout(() => {
      const targetEl = step.target ? step.target() : null;
      if (!targetEl) {
        _overlay.style.background = 'rgba(0,0,0,0.82)';
        _highlight.style.display  = 'none';
        _positionCenter();
      } else if (isMobile) {
        _overlay.style.background = 'transparent';
        _positionAroundMobile(targetEl);
      } else {
        _overlay.style.background = 'transparent';
        _positionAround(targetEl, step.pos);
      }
    }, delay);
  }

  // ── Switch tab if needed, returns true if a switch happened ──
  function _switchTab(step) {
    if (!step.tab) return false;
    const tabBtn = document.querySelector('[data-tab="' + step.tab + '"]');
    if (!tabBtn || getComputedStyle(tabBtn).display === 'none') return false;
    // Only click if this tab isn't already active
    if (tabBtn.classList.contains('active')) return false;
    tabBtn.click();
    return true;
  }

  // ── Center card (no transform, avoids animation conflict) ──
  function _positionCenter() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const W  = Math.min(340, vw - 28);
    const left = Math.round((vw - W) / 2);
    const top  = Math.round(vh * 0.38); // slightly above center
    _popover.style.cssText =
      'position:fixed;width:' + W + 'px;left:' + left + 'px;top:' + top + 'px;';
  }

  // ── Mobile: highlight element, popover pinned to bottom ──
  function _positionAroundMobile(el) {
    _highlight.style.display = 'block';
    const pad = 6;
    const r   = el.getBoundingClientRect();
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;

    // Position highlight ring
    _highlight.style.top    = (r.top    - pad) + 'px';
    _highlight.style.left   = (r.left   - pad) + 'px';
    _highlight.style.width  = (r.width  + pad * 2) + 'px';
    _highlight.style.height = (r.height + pad * 2) + 'px';

    // Scroll element into view if needed
    const inView = r.top >= 0 && r.bottom <= vh;
    if (!inView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const r2 = el.getBoundingClientRect();
        _highlight.style.top    = (r2.top    - pad) + 'px';
        _highlight.style.left   = (r2.left   - pad) + 'px';
        _highlight.style.width  = (r2.width  + pad * 2) + 'px';
        _highlight.style.height = (r2.height + pad * 2) + 'px';
      }, 320);
    }

    // Anchor popover to top or bottom depending on where the element sits
    const W         = vw - 28;
    const left      = 14;
    const elMidY    = r.top + r.height / 2;
    const popH      = 210; // approx popover height
    const useBottom = elMidY < vh / 2; // element in upper half → popover at bottom
    const top       = useBottom ? vh - popH - 14 : 14;
    _popover.style.cssText =
      'position:fixed;width:' + W + 'px;left:' + left + 'px;top:' + top + 'px;';
  }

  // ── Desktop: position highlight + popover beside element ──
  function _positionAround(el, preferred) {
    _highlight.style.display = 'block';
    const pad = 6;
    const r   = el.getBoundingClientRect();

    _highlight.style.top    = (r.top    - pad) + 'px';
    _highlight.style.left   = (r.left   - pad) + 'px';
    _highlight.style.width  = (r.width  + pad * 2) + 'px';
    _highlight.style.height = (r.height + pad * 2) + 'px';

    const inView = r.top >= 0 && r.bottom <= window.innerHeight;
    if (!inView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const r2 = el.getBoundingClientRect();
        _highlight.style.top    = (r2.top    - pad) + 'px';
        _highlight.style.left   = (r2.left   - pad) + 'px';
        _highlight.style.width  = (r2.width  + pad * 2) + 'px';
        _highlight.style.height = (r2.height + pad * 2) + 'px';
        _positionPopover(r2, preferred);
      }, 320);
      return;
    }
    _positionPopover(r, preferred);
  }

  function _positionPopover(r, preferred) {
    const W  = Math.min(300, window.innerWidth - 28);
    const H  = 240; // approx height estimate
    const mg = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;

    // Cascade fallbacks if preferred direction has no room
    let pos = preferred;
    if (pos === 'right'  && r.right  + mg + W > vw) pos = 'left';
    if (pos === 'left'   && r.left   - mg - W < 0)  pos = 'right';
    if (pos === 'right'  && r.right  + mg + W > vw) pos = 'bottom';
    if (pos === 'bottom' && r.bottom + mg + H > vh) pos = 'top';
    if (pos === 'top'    && r.top    - mg - H < 0)  pos = 'center';

    let top, left;
    if      (pos === 'right')  { left = r.right  + mg;        top = cy - H / 2; }
    else if (pos === 'left')   { left = r.left   - W - mg;    top = cy - H / 2; }
    else if (pos === 'bottom') { left = cx - W / 2;           top = r.bottom + mg; }
    else if (pos === 'top')    { left = cx - W / 2;           top = r.top - H - mg; }
    else                       { left = (vw - W) / 2;         top = (vh - H) / 2; }

    left = Math.max(mg, Math.min(left, vw - W - mg));
    top  = Math.max(mg, Math.min(top,  vh - H - mg));

    _popover.style.cssText =
      'position:fixed;' +
      'width:'  + W                  + 'px;' +
      'left:'   + Math.round(left)   + 'px;' +
      'top:'    + Math.round(top)    + 'px;';
  }

  // ── Finish & clean up ─────────────────────────
  function _finish() {
    if (window.State && State.game) {
      State.game.orientationDismissed = true;
      State.save();
    }
    const old = document.getElementById('orientation-panel');
    if (old) old.classList.add('hidden');
    _destroy();
    _active = false;

    // Reset both panels to the top so the player starts fresh.
    // On mobile, inactive tab-panels are display:none — scrollTop won't stick
    // unless we briefly force display before the browser repaints.
    function _resetScroll(el) {
      if (!el) return;
      const hidden = getComputedStyle(el).display === 'none';
      if (hidden) el.style.display = 'block';
      el.scrollTop = 0;
      if (hidden) el.style.display = '';
    }
    _resetScroll(document.getElementById('panel-stats'));
    _resetScroll(document.querySelector('.events-body'));
  }

  function _destroy() {
    if (_overlay)   { _overlay.remove();   _overlay   = null; }
    if (_highlight) { _highlight.remove(); _highlight = null; }
    if (_popover)   { _popover.remove();   _popover   = null; }
  }

  return { start, get active() { return _active; } };
})();
