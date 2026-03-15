/* ═══════════════════════════════════════════════
   RIFLE QUALIFICATION MINI-GAME
   Player aims with mouse / finger. Physics sway
   drifts the crosshair around the aim point.
   Hold to fill ring, release to fire.
   3 positions × 5 shots = 15 total (max 75 pts).
   ═══════════════════════════════════════════════ */

const RifleQual = {

  // ── Position configs ─────────────────────────
  POSITIONS: [
    {
      id: 'prone',
      label: 'PRONE',
      desc: '5 shots, prone at 500 yards. Use the 5 tick on the reticle. Mouse: hover to aim. Mobile: tap anywhere and drag to move the reticle — hold to fill the ring, release to fire.',
      holdMs: 3000,
      impulseStrength: 1.1,
      maxSway: 26,
      errorRad: 4,
      distanceYds: 500,
      holdTick: 5,
      targetScale: 0.323,
      breathAmp: 0.92,
    },
    {
      id: 'kneeling',
      label: 'KNEELING',
      desc: '5 shots, kneeling at 300 yards. Less stable — the reticle drifts more. Use the 4 tick for holdover and time your shot as it passes over center.',
      holdMs: 2200,
      impulseStrength: 2.0,
      maxSway: 44,
      errorRad: 8,
      distanceYds: 300,
      holdTick: 4,
      targetScale: 0.391,
      breathAmp: 1.00,
    },
    {
      id: 'standing',
      label: 'STANDING',
      desc: '5 shots, standing offhand at 100 yards. Hardest position. Use the top marker for holdover. Sway ramps up the longer you hold — fire quickly at the right moment.',
      holdMs: 1800,
      impulseStrength: 3.2,
      maxSway: 60,
      errorRad: 13,
      standupShake: true,
      distanceYds: 100,
      holdTick: 0,
      targetScale: 0.476,
      breathAmp: 1.08,
    },
  ],

  SHOTS_PER_POS: 5,
  SPRING_K:      0.014,
  DAMPING:       0.965,
  WIND_BIAS_MULT: 2.35,

  // Input lag / inertia model (reticle trails input heavily)
  AIM_LAG_K:       0.010,
  AIM_LAG_DAMPING: 0.90,
  BREATH_SPEED: 0.036,
  BREATH_AMP_X: 3.4,
  BREATH_AMP_Y: 7.6,

  // ── Weapons knowledge data ────────────────────
  SAFETY_RULES: [
    'Treat every weapon as if it were loaded.',
    'Never point a weapon at anything you do not intend to shoot.',
    'Keep your finger straight and off the trigger until you are ready to fire.',
    'Keep the weapon on safe until you intend to fire.',
  ],
  WEAPON_CONDITIONS: [
    'Magazine inserted, round in chamber, bolt forward, safety on, ejection port cover closed.',
    'Not applicable to the M16/M4 service rifle.',
    'Magazine inserted, chamber empty, bolt forward, safety on, ejection port cover closed.',
    'Magazine removed, chamber empty, bolt forward, safety on, ejection port cover closed.',
  ],

  // ── Runtime state ────────────────────────────
  _onComplete:   null,
  _practiceMode: false,   // true = standalone practice; skips quiz, no stat effects
  _scores:     [],
  _posIdx:     0,
  _shotIdx:    0,
  _wind:       { dir: 0, strength: 0, label: 'CALM' },

  // Aim point — player moves this with mouse/touch (relative to canvas center)
  _aimX: 0, _aimY: 0,
  _targetAimX: 0, _targetAimY: 0,
  _aimVelX: 0, _aimVelY: 0,

  // Relative drag state (touch: crosshair tracks delta from initial tap, not absolute position)
  _relDragActive: false,
  _relDragClientX: 0, _relDragClientY: 0,
  _relDragAimX: 0, _relDragAimY: 0,

  // Physics sway — perturbation around the aim point
  _swayX: 0, _swayY: 0,
  _breathX: 0, _breathY: 0,
  _breathT: 0,
  _velX:  0, _velY:  0,

  // Hold state
  _isHolding: false,
  _holdStart: 0,

  // Pre-range quiz state
  _quizPhase:     'brief',  // 'brief' | 'safety' | 'conditions' | 'fail' | 'pass' | 'done'
  _quizSlots:     [],       // [null | itemId] — what's in each numbered slot
  _quizSelected:  null,     // id of the currently selected pool card (or null)
  _quizItems:     [],       // [{id, text}] — items for the current quiz round
  _quizAttempts:  0,        // wrong submissions this phase (3 = kicked off range)
  _quizShowWrong: false,    // true = highlight incorrect slots in red

  // Quiz drag-and-drop state
  _dragId:       null,   // id of item currently being dragged (ghost visible)
  _dragGhost:    null,   // ghost DOM element
  _dragPendId:   null,   // id of pending drag (pointerdown but not yet moved > threshold)
  _dragStartX:   0,
  _dragStartY:   0,
  _dragStarted:  false,  // true once drag threshold exceeded
  _docListen:    false,  // whether doc pointermove/up listeners are attached
  _hoverSlotIdx: null,   // slot index the ghost is currently hovering over (null = none)

  // Canvas
  _canvas:  null,
  _ctx:     null,
  _size:    0,
  _cx: 0, _cy: 0,
  _bullR:    0,    // radius of the score-10 dot
  _ringStep: 0,    // width of each score 2-4 ring
  _scopeR:  0,
  _baseTargetR: 0,
  _targetR: 0,

  // Shot impact cached for pit animation
  _lastScore: 0,
  _pitStart:  0,

  // Animation
  _raf:    0,
  _phase:  'idle',
  _lastTs: 0,

  // ── Entry point ──────────────────────────────
  start(onComplete) {
    RifleQual._onComplete   = onComplete;
    RifleQual._practiceMode = false;
    RifleQual._scores       = [];
    RifleQual._posIdx     = 0;
    RifleQual._shotIdx    = 0;
    RifleQual._phase      = 'idle';
    RifleQual._isHolding  = false;
    RifleQual._aimX       = 0;
    RifleQual._aimY       = 0;
    RifleQual._targetAimX = 0;
    RifleQual._targetAimY = 0;
    RifleQual._aimVelX    = 0;
    RifleQual._aimVelY    = 0;
    RifleQual._breathX    = 0;
    RifleQual._breathY    = 0;
    RifleQual._breathT    = 0;

    RifleQual._rollWind();
    UI.showScreen('screen-rifle-qual');
    RifleQual._setupCanvas();
    RifleQual._initScorecard();
    RifleQual._showPreRange();
  },

  /** Launch the range as a standalone practice session (no quiz, no stat effects). */
  startPractice() {
    RifleQual._practiceMode = true;
    RifleQual._onComplete   = null;
    RifleQual._scores       = [];
    RifleQual._posIdx       = 0;
    RifleQual._shotIdx      = 0;
    RifleQual._phase        = 'idle';
    RifleQual._isHolding    = false;
    RifleQual._aimX         = 0;
    RifleQual._aimY         = 0;
    RifleQual._targetAimX   = 0;
    RifleQual._targetAimY   = 0;
    RifleQual._aimVelX      = 0;
    RifleQual._aimVelY      = 0;
    RifleQual._breathX      = 0;
    RifleQual._breathY      = 0;
    RifleQual._breathT      = 0;

    RifleQual._rollWind();
    UI.showScreen('screen-rifle-qual');
    // rq-prerange has no hidden class by default — explicitly hide it so the
    // pre-range brief/quiz overlay doesn't appear over the position intro
    document.getElementById('rq-prerange').classList.add('hidden');
    RifleQual._setupCanvas();
    RifleQual._initScorecard();
    // Skip the weapons knowledge quiz — go straight to the firing line
    RifleQual._showPositionIntro(0);
  },

  // ── Wind ─────────────────────────────────────
  _rollWind() {
    const strength = Math.random();
    const dir = Math.random() < 0.5 ? -1 : 1;
    let label, bias;
    if (strength < 0.12) {
      label = 'CALM'; bias = 0;
      RifleQual._wind = { dir: 0, strength: 0, label };
    } else if (strength < 0.45) {
      label = dir < 0 ? '← LIGHT' : 'LIGHT →';
      bias  = 0.18;
      RifleQual._wind = { dir, strength: bias, label };
    } else if (strength < 0.75) {
      label = dir < 0 ? '←← MODERATE' : 'MODERATE →→';
      bias  = 0.32;
      RifleQual._wind = { dir, strength: bias, label };
    } else {
      label = dir < 0 ? '←←← STRONG' : 'STRONG →→→';
      bias  = 0.52;
      RifleQual._wind = { dir, strength: bias, label };
    }
    const el = document.getElementById('rq-wind-val');
    if (el) el.textContent = RifleQual._wind.label;
  },

  // ── Canvas setup ─────────────────────────────
  _setupCanvas() {
    const canvas = document.getElementById('rq-canvas');
    RifleQual._canvas = canvas;

    const dpr  = window.devicePixelRatio || 1;
    const size = Math.min(window.innerWidth - 32, 360);
    RifleQual._size    = size;
    RifleQual._cx      = size / 2;
    RifleQual._cy      = size / 2;
    RifleQual._scopeR   = size / 2 - 4;
    RifleQual._baseTargetR = size * 0.20;
    RifleQual._targetR  = RifleQual._baseTargetR;
    RifleQual._bullR    = size * 0.013;   // tiny 10-ring dot
    RifleQual._ringStep = (RifleQual._targetR - RifleQual._bullR) / 3;

    canvas.width        = size * dpr;
    canvas.height       = size * dpr;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    RifleQual._ctx = ctx;

    // Attach canvas input listeners
    canvas.addEventListener('pointermove',  RifleQual._onPointerMove,  { passive: false });
    canvas.addEventListener('pointerdown',  RifleQual._onPointerDown,  { passive: false });
    canvas.addEventListener('pointerup',    RifleQual._onPointerUp);
    canvas.addEventListener('pointerleave', RifleQual._onPointerLeave);

    RifleQual._drawFrame(0);
  },

  // ── Pointer helpers ───────────────────────────
  _updateAim(e) {
    const rect = RifleQual._canvas.getBoundingClientRect();
    const raw_x = e.clientX - rect.left - RifleQual._cx;
    const raw_y = e.clientY - rect.top  - RifleQual._cy;
    // Clamp aim to 88% of scope so crosshair stays inside rings
    const maxAim = RifleQual._scopeR * 0.88;
    const mag    = Math.sqrt(raw_x * raw_x + raw_y * raw_y);
    if (mag > maxAim) {
      const s = maxAim / mag;
      RifleQual._targetAimX = raw_x * s;
      RifleQual._targetAimY = raw_y * s;
    } else {
      RifleQual._targetAimX = raw_x;
      RifleQual._targetAimY = raw_y;
    }
  },

  _onPointerMove(e) {
    e.preventDefault();
    if (e.pointerType === 'touch') {
      // Relative mode: crosshair tracks delta from where the finger first landed
      if (RifleQual._relDragActive) {
        const sensitivity = 1.2;
        const nx = RifleQual._relDragAimX + (e.clientX - RifleQual._relDragClientX) * sensitivity;
        const ny = RifleQual._relDragAimY + (e.clientY - RifleQual._relDragClientY) * sensitivity;
        const maxAim = RifleQual._scopeR * 0.88;
        const mag    = Math.sqrt(nx * nx + ny * ny);
        if (mag > maxAim) {
          const s = maxAim / mag;
          RifleQual._targetAimX = nx * s;
          RifleQual._targetAimY = ny * s;
        } else {
          RifleQual._targetAimX = nx;
          RifleQual._targetAimY = ny;
        }
      }
    } else {
      // Absolute mode: crosshair follows mouse cursor directly
      RifleQual._updateAim(e);
    }
  },

  _onPointerDown(e) {
    e.preventDefault();
    if (RifleQual._phase !== 'idle' && RifleQual._phase !== 'aiming') return;
    if (RifleQual._isHolding) return;

    // Capture so drag/release keep firing even outside canvas
    try { RifleQual._canvas.setPointerCapture(e.pointerId); } catch { /* intentional — may fail on some browsers */ }

    if (e.pointerType === 'touch') {
      // Relative mode: record tap origin and current aim; crosshair stays in place
      RifleQual._relDragActive  = true;
      RifleQual._relDragClientX = e.clientX;
      RifleQual._relDragClientY = e.clientY;
      RifleQual._relDragAimX    = RifleQual._aimX;
      RifleQual._relDragAimY    = RifleQual._aimY;
    } else {
      // Absolute mode: jump aim to cursor position
      RifleQual._updateAim(e);
    }
    RifleQual._startHold();
  },

  _onPointerUp(e) {
    RifleQual._relDragActive = false;
    if (!RifleQual._isHolding) return;
    if (RifleQual._phase !== 'aiming') return;
    const pos     = RifleQual.POSITIONS[RifleQual._posIdx];
    const holdPct = Math.min((performance.now() - RifleQual._holdStart) / pos.holdMs, 1.0);
    RifleQual._isHolding = false;
    RifleQual._resolveShot(holdPct);
  },

  _onPointerLeave(e) {
    // Only fire if this is a non-captured pointer (i.e. mouse left without holding)
    // If we have pointer capture, this shouldn't fire until capture is released
    if (!RifleQual._isHolding) return;
    // Let the pointerup handler fire naturally via capture
  },

  _startHold() {
    RifleQual._isHolding = true;
    RifleQual._holdStart = performance.now();
    RifleQual._phase     = 'aiming';
    RifleQual._setInstruction('HOLDING — RELEASE TO FIRE');
  },

  // ── Intro overlays ────────────────────────────
  _showPositionIntro(posIdx) {
    cancelAnimationFrame(RifleQual._raf);
    const pos     = RifleQual.POSITIONS[posIdx];
    const overlay = document.getElementById('rq-overlay');
    overlay.classList.remove('hidden');

    document.getElementById('rq-overlay-phase').textContent =
      `POSITION ${posIdx + 1} OF ${RifleQual.POSITIONS.length}`;
    document.getElementById('rq-overlay-pos').textContent   = pos.label;
    document.getElementById('rq-overlay-desc').textContent  = pos.desc;

    const old = document.getElementById('rq-btn-begin');
    const btn = old.cloneNode(true);
    old.parentNode.replaceChild(btn, old);
    btn.textContent = posIdx === 0 ? 'FIRE WHEN READY' : `BEGIN ${pos.label}`;
    btn.addEventListener('click', () => {
      overlay.classList.add('hidden');
      RifleQual._startPosition();
    });
  },

  _startPosition() {
    const pos = RifleQual.POSITIONS[RifleQual._posIdx];
    // Seed sway with a small random perturbation around aim
    RifleQual._swayX = (Math.random() - 0.5) * pos.maxSway * 0.2;
    RifleQual._swayY = (Math.random() - 0.5) * pos.maxSway * 0.2;
    RifleQual._velX  = (Math.random() - 0.5) * pos.impulseStrength * 0.4;
    RifleQual._velY  = (Math.random() - 0.5) * pos.impulseStrength * 0.4;
    RifleQual._aimX  = 0;
    RifleQual._aimY  = 0;
    RifleQual._targetAimX = 0;
    RifleQual._targetAimY = 0;
    RifleQual._aimVelX = 0;
    RifleQual._aimVelY = 0;
    RifleQual._breathX = 0;
    RifleQual._breathY = 0;
    RifleQual._breathT = Math.random() * Math.PI * 2;
    RifleQual._targetR = RifleQual._baseTargetR * (pos.targetScale || 1.0);
    RifleQual._ringStep = (RifleQual._targetR - RifleQual._bullR) / 3;
    RifleQual._isHolding   = false;
    RifleQual._relDragActive = false;
    RifleQual._phase       = 'idle';
    RifleQual._updateTopbar();
    RifleQual._setInstruction(`AIM ${RifleQual._getHoldLabel(pos)} — HOLD TO FIRE`);

    const fireBtn = document.getElementById('rq-btn-fire');
    if (fireBtn) { fireBtn.textContent = 'HOLD TO FIRE'; fireBtn.classList.remove('holding'); }

    RifleQual._lastTs = performance.now();
    cancelAnimationFrame(RifleQual._raf);
    RifleQual._raf = requestAnimationFrame(RifleQual._loop);
  },

  // ── Physics / Animation loop ─────────────────
  _loop(ts) {
    const dt = Math.min((ts - RifleQual._lastTs) / 16.67, 4);
    RifleQual._lastTs = ts;

    if (RifleQual._phase === 'pit') {
      const elapsed = ts - RifleQual._pitStart;
      RifleQual._drawPit(elapsed);
      if (elapsed >= 1600) {
        RifleQual._afterPit();
        return;
      }
      RifleQual._raf = requestAnimationFrame(RifleQual._loop);
      return;
    }

    if (RifleQual._phase !== 'idle' && RifleQual._phase !== 'aiming') return;

    RifleQual._applyPhysics(dt);

    let holdPct = 0;
    if (RifleQual._isHolding) {
      const pos = RifleQual.POSITIONS[RifleQual._posIdx];
      holdPct = Math.min((ts - RifleQual._holdStart) / pos.holdMs, 1.0);
      if (holdPct >= 1.0) {
        RifleQual._isHolding = false;
        RifleQual._resolveShot(1.0);
        return;
      }
    }

    RifleQual._drawFrame(holdPct);
    RifleQual._raf = requestAnimationFrame(RifleQual._loop);
  },

  // Physics: sway drifts around aim point (wind shifts equilibrium)
  _applyPhysics(dt) {
    const pos = RifleQual.POSITIONS[RifleQual._posIdx];
    const k   = RifleQual.SPRING_K * dt;
    const d   = Math.pow(RifleQual.DAMPING, dt);
    const aimK = RifleQual.AIM_LAG_K * dt;
    const aimD = Math.pow(RifleQual.AIM_LAG_DAMPING, dt);

    // Reticle input inertia: heavily lagged movement with drift on release.
    RifleQual._aimVelX = RifleQual._aimVelX * aimD + (RifleQual._targetAimX - RifleQual._aimX) * aimK;
    RifleQual._aimVelY = RifleQual._aimVelY * aimD + (RifleQual._targetAimY - RifleQual._aimY) * aimK;
    RifleQual._aimX += RifleQual._aimVelX * dt;
    RifleQual._aimY += RifleQual._aimVelY * dt;

    // Allow some overshoot but keep reticle in scope.
    const maxAimLive = RifleQual._scopeR * 0.93;
    const aimMag = Math.sqrt(RifleQual._aimX ** 2 + RifleQual._aimY ** 2);
    if (aimMag > maxAimLive) {
      const s = maxAimLive / aimMag;
      RifleQual._aimX *= s;
      RifleQual._aimY *= s;
      RifleQual._aimVelX *= 0.82;
      RifleQual._aimVelY *= 0.82;
    }

    // Wind shifts where sway naturally settles (relative to aim point)
    const windBiasX = RifleQual._wind.dir * RifleQual._wind.strength * pos.maxSway * RifleQual.WIND_BIAS_MULT;

    // Standing shake: holding longer = more sway range + wilder impulses
    let extraImpulse = 0, extraSway = 0;
    if (pos.standupShake && RifleQual._isHolding) {
      const hp     = Math.min((performance.now() - RifleQual._holdStart) / pos.holdMs, 1.0);
      extraImpulse = hp * hp * 5.0;
      extraSway    = hp * hp * 50;
    }

    // Spring toward wind equilibrium
    RifleQual._velX = RifleQual._velX * d + (windBiasX - RifleQual._swayX) * k;
    RifleQual._velY = RifleQual._velY * d + (0          - RifleQual._swayY) * k;

    RifleQual._swayX += RifleQual._velX * dt;
    RifleQual._swayY += RifleQual._velY * dt;

    // Smooth micro-perturbation: far less jerky than burst impulses.
    const imp = pos.impulseStrength + extraImpulse;
    RifleQual._velX += (Math.random() - 0.5) * imp * 0.11 * dt;
    RifleQual._velY += (Math.random() - 0.5) * imp * 0.11 * dt;

    // Clamp sway magnitude
    const maxS    = (pos.maxSway * 1.70) + extraSway;
    const swayMag = Math.sqrt(RifleQual._swayX ** 2 + RifleQual._swayY ** 2);
    if (swayMag > maxS) {
      const s = maxS / swayMag;
      RifleQual._swayX *= s;
      RifleQual._swayY *= s;
    }

    // Breathing oscillator: pronounced, continuous figure-8 style chest movement.
    const breathAmp = pos.breathAmp || 1.0;
    RifleQual._breathT += dt * RifleQual.BREATH_SPEED;
    RifleQual._breathX = Math.sin(RifleQual._breathT * 0.85) * RifleQual.BREATH_AMP_X * breathAmp;
    RifleQual._breathY = Math.cos(RifleQual._breathT) * RifleQual.BREATH_AMP_Y * breathAmp
      + Math.sin(RifleQual._breathT * 2.05) * (RifleQual.BREATH_AMP_Y * 0.25) * breathAmp;
  },

  _getHoldoverPx(pos) {
    const mark = (pos.holdTick === undefined || pos.holdTick === null) ? 5 : pos.holdTick;
    if (mark === 0) return 0;
    const offsets = RifleQual._getBdcTickOffsets(RifleQual._scopeR * 0.75);
    return offsets[mark] || offsets[5];
  },

  _getHoldLabel(pos) {
    if (!pos || !pos.distanceYds) return 'WITH MOUSE / FINGER';
    if (pos.holdTick === 0) return `${pos.distanceYds} YD — USE TOP MARKER`;
    return `${pos.distanceYds} YD — USE ${pos.holdTick || 5} TICK`;
  },

  _getBdcTickOffsets(useR) {
    const r = useR || RifleQual._scopeR;
    const arrowH = r * 0.095;      // must match chevH in _drawRcoReticle
    const gapHeadTo4 = r * 0.026; // gap below crosshair to first stadia
    const gap45 = r * 0.056;
    const gap56 = r * 0.076;
    const gap67 = r * 0.098;
    const gap78 = r * 0.125; // largest separation
    const y4 = arrowH + gapHeadTo4;
    const y5 = y4 + gap45;
    const y6 = y5 + gap56;
    const y7 = y6 + gap67;
    const y8 = y7 + gap78;
    return { 4: y4, 5: y5, 6: y6, 7: y7, 8: y8 };
  },

  // ── Drawing ───────────────────────────────────
  _drawTargetRings(ctx) {
    const { _cx: cx, _cy: cy, _bullR: bullR, _ringStep: ringStep } = RifleQual;
    const pos = RifleQual.POSITIONS[RifleQual._posIdx] || {};
    const dist = pos.distanceYds || 100;
    const blurPx = dist >= 500 ? 0.6 : dist >= 300 ? 0.3 : 0;

    ctx.save();
    if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`;

    // Scores 2-4: each ring is ringStep wide, drawn outside-in so each overwrites previous
    const fills = [
      '#0f0f0f',              // 2: outer score ring
      '#1d1d1d',              // 3
      '#2a2a2a',              // 4
    ];
    for (let score = 2; score <= 4; score++) {
      // Outer edge of this score's ring
      const r = bullR + (5 - score) * ringStep;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = fills[score - 2];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.055)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }
    // Score 5: center dot
    ctx.beginPath();
    ctx.arc(cx, cy, bullR, 0, Math.PI * 2);
    ctx.fillStyle = '#f0ede0';
    ctx.fill();

    ctx.restore();
  },

  _drawOuterRangeBackdrop(ctx) {
    const w = RifleQual._size;
    const h = RifleQual._size;

    // Very blurry field/range backdrop for area outside the optic tube.
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0.00, '#95a4b0');
    sky.addColorStop(0.45, '#7f8d96');
    sky.addColorStop(0.46, '#76826d');
    sky.addColorStop(1.00, '#5f6a54');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.filter = 'blur(4.5px)';
    ctx.globalAlpha = 0.75;

    // Soft berm/horizon bands.
    ctx.fillStyle = '#6f7a5f';
    ctx.fillRect(-10, h * 0.52, w + 20, h * 0.12);
    ctx.fillStyle = '#5c664f';
    ctx.fillRect(-10, h * 0.64, w + 20, h * 0.20);
    ctx.fillStyle = '#4d5746';
    ctx.fillRect(-10, h * 0.81, w + 20, h * 0.22);

    // Blurry distant forms.
    ctx.fillStyle = 'rgba(58, 65, 55, 0.55)';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.58, w * 0.24, h * 0.08, -0.08, 0, Math.PI * 2);
    ctx.ellipse(w * 0.70, h * 0.56, w * 0.26, h * 0.09, 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  _drawFieldBackdrop(ctx, tubeX, tubeY, tubeR) {
    const w = RifleQual._size;
    const h = RifleQual._size;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0.00, '#89a8d3');
    sky.addColorStop(0.42, '#7fa1cc');
    sky.addColorStop(0.43, '#7c915e');
    sky.addColorStop(1.00, '#50643e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Ground bands with visible texture so grass looks sharper in-scope.
    ctx.fillStyle = '#6f8750';
    ctx.fillRect(0, h * 0.45, w, h * 0.16);
    ctx.fillStyle = '#5a7442';
    ctx.fillRect(0, h * 0.61, w, h * 0.22);
    ctx.fillStyle = '#4e6439';
    ctx.fillRect(0, h * 0.83, w, h * 0.17);

    // Sharp grass blades / streaks.
    ctx.strokeStyle = 'rgba(38,56,27,0.32)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 7) {
      const y0 = h * (0.63 + (x % 23) * 0.0007);
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x + 1, y0 - 7 - ((x * 3) % 9));
      ctx.stroke();
    }
  },

  _drawTargetPost(ctx) {
    const x = RifleQual._cx;
    const y = RifleQual._cy;
    const r = RifleQual._targetR;

    // Brown post under target.
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(x - r * 0.12, y + r * 0.94, r * 0.24, r * 1.9);
    ctx.fillStyle = '#845a34';
    ctx.fillRect(x - r * 0.06, y + r * 0.94, r * 0.12, r * 1.9);
  },

  _drawTinyBlurredTarget(ctx, tubeX, tubeY, tubeR) {
    const x = RifleQual._cx;
    const y = RifleQual._cy;
    const r = Math.max(2, RifleQual._targetR * 0.20);

    // Only show small ghost target when target is outside or near edge of tube.
    const dx = x - tubeX;
    const dy = y - tubeY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < tubeR * 0.75) return;

    ctx.save();
    ctx.filter = 'blur(1.25px)';
    ctx.globalAlpha = 0.68;
    ctx.fillStyle = '#d6d3c8';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4f3720';
    ctx.fillRect(x - r * 0.12, y + r * 0.8, r * 0.24, r * 2.2);
    ctx.restore();
  },

  _drawFrame(holdPct) {
    const ctx = RifleQual._ctx;
    const { _cx: cx, _cy: cy, _scopeR: scopeR } = RifleQual;
    const tubeR = scopeR * 0.75;

    // Crosshair is aim point PLUS sway perturbation
    const chX = cx + RifleQual._aimX + RifleQual._swayX + RifleQual._breathX;
    const chY = cy + RifleQual._aimY + RifleQual._swayY + RifleQual._breathY;
    const tubeX = chX;
    const tubeY = chY;

    ctx.clearRect(0, 0, RifleQual._size, RifleQual._size);
    RifleQual._drawOuterRangeBackdrop(ctx);
    RifleQual._drawTinyBlurredTarget(ctx, tubeX, tubeY, tubeR);

    // Clip to circular scope
    ctx.save();
    ctx.beginPath();
    ctx.arc(tubeX, tubeY, tubeR, 0, Math.PI * 2);
    ctx.clip();

    RifleQual._drawFieldBackdrop(ctx, tubeX, tubeY, tubeR);
    RifleQual._drawTargetPost(ctx);

    RifleQual._drawTargetRings(ctx);

    // Vignette
    const vig = ctx.createRadialGradient(tubeX, tubeY, tubeR * 0.6, tubeX, tubeY, tubeR);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.beginPath();
    ctx.arc(tubeX, tubeY, tubeR, 0, Math.PI * 2);
    ctx.fillStyle = vig;
    ctx.fill();

    RifleQual._drawRcoReticle(ctx, chX, chY, tubeR);

    ctx.restore();

    // Scope outer ring hugs the visible tube.
    ctx.beginPath();
    ctx.arc(tubeX, tubeY, tubeR + 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#5a5f63';
    ctx.lineWidth   = 4;
    ctx.stroke();

    // Hold ring (clockwise arc from 12 o'clock)
    if (holdPct > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle   = startAngle + holdPct * Math.PI * 2;
      const arcColor   = holdPct < 0.40 ? '#4caf50' : holdPct < 0.72 ? '#f0b429' : '#e53935';
      ctx.beginPath();
      // Keep progress indicator independent of moving tube and clearly visible.
      ctx.arc(cx, cy, scopeR - 8, startAngle, endAngle);
      ctx.strokeStyle = arcColor;
      ctx.lineWidth   = 5;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
  },

  _drawRcoReticle(ctx, chX, chY, scopeR) {
    const pos        = RifleQual.POSITIONS[RifleQual._posIdx];
    const activeTick = pos && pos.holdTick !== null ? pos.holdTick : 5;

    // Chevron = red illuminated. Everything else = light etched (readable on dark bg).
    const chevRed    = 'rgba(220, 30, 30, 0.98)';
    const etch       = 'rgba(190, 180, 160, 0.82)';
    const lw = 1.5;

    const offsets   = RifleQual._getBdcTickOffsets(scopeR);
    const chevHalfW = scopeR * 0.042;   // narrow for sharp angle
    const chevH     = scopeR * 0.095;   // tall for sharp angle
    const xhY       = chY + chevH;   // horizontal crosshair sits at chevron base

    // ── Chevron (red illuminated — primary aiming point) ──
    ctx.strokeStyle = chevRed;
    ctx.lineWidth   = lw * 1.6;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(chX - chevHalfW, xhY);
    ctx.lineTo(chX, chY);
    ctx.lineTo(chX + chevHalfW, xhY);
    ctx.stroke();

    // ── Long horizontal crosshair with internal tick marks ──
    // Gap in center leaves room for the chevron — arms start well outside chevron legs.
    // Each arm has 3 evenly-spaced internal ticks (4 equal segments) + taller end caps.
    const armInner = scopeR * 0.12;    // wider gap so chevron sits clearly in open space
    const armOuter = scopeR * 0.88;
    const armLen   = armOuter - armInner;
    const t1x      = armInner + armLen * 0.25;
    const t2x      = armInner + armLen * 0.50;
    const t3x      = armInner + armLen * 0.75;
    const tickH    = scopeR * 0.020;
    const capH     = scopeR * 0.030;

    ctx.strokeStyle = etch;
    ctx.lineWidth   = lw;
    ctx.lineCap     = 'butt';

    ctx.beginPath();
    ctx.moveTo(chX - armInner, xhY);  ctx.lineTo(chX - armOuter, xhY);   // left arm
    ctx.moveTo(chX + armInner, xhY);  ctx.lineTo(chX + armOuter, xhY);   // right arm
    ctx.stroke();

    [t1x, t2x, t3x].forEach(tx => {
      ctx.beginPath();
      ctx.moveTo(chX - tx, xhY - tickH);  ctx.lineTo(chX - tx, xhY + tickH);   // left tick
      ctx.moveTo(chX + tx, xhY - tickH);  ctx.lineTo(chX + tx, xhY + tickH);   // right tick
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.moveTo(chX - armOuter, xhY - capH);  ctx.lineTo(chX - armOuter, xhY + capH);  // left cap
    ctx.moveTo(chX + armOuter, xhY - capH);  ctx.lineTo(chX + armOuter, xhY + capH);  // right cap
    ctx.stroke();

    // ── Vertical stadia line from crosshair down through all BDC marks ──
    const y8 = chY + offsets[8];
    ctx.strokeStyle = etch;
    ctx.lineWidth   = lw * 0.85;
    ctx.lineCap     = 'butt';
    ctx.beginPath();
    ctx.moveTo(chX, xhY - scopeR * 0.020);
    ctx.lineTo(chX, y8 + scopeR * 0.018);
    ctx.stroke();

    // ── BDC stadia marks — widest at top (4), narrowest at bottom (8); "4" and "6" labeled ──
    const bdcMarks = [
      { mark: 4, hw: scopeR * 0.075, label: '4', red: true },
      { mark: 5, hw: scopeR * 0.065, label: null, red: false },
      { mark: 6, hw: scopeR * 0.055, label: '6', red: false },
      { mark: 7, hw: scopeR * 0.045, label: null, red: false },
      { mark: 8, hw: scopeR * 0.040, label: null, red: false },
    ];

    const fontSize = Math.max(7, Math.round(scopeR * 0.085));
    ctx.font         = `bold ${fontSize}px monospace`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineCap      = 'round';

    bdcMarks.forEach(({ mark, hw, label, red }) => {
      const y      = chY + offsets[mark];
      const active = activeTick === mark;
      ctx.strokeStyle = (red || active) ? chevRed : etch;
      ctx.lineWidth   = lw;
      ctx.beginPath();
      ctx.moveTo(chX - hw, y);
      ctx.lineTo(chX + hw, y);
      ctx.stroke();
      if (label) {
        ctx.fillStyle = chevRed;
        ctx.fillText(label, chX + hw + scopeR * 0.020, y);
      }
    });
  },

  _drawPit(elapsed) {
    // 0-300ms target fades out | 300-1100ms show score | 1100-1600ms target fades in
    let targetAlpha, resultAlpha;
    if (elapsed < 300) {
      targetAlpha = 1 - elapsed / 300;
      resultAlpha = 0;
    } else if (elapsed < 1100) {
      targetAlpha = 0;
      resultAlpha = Math.min((elapsed - 300) / 180, 1);
    } else {
      const t2    = elapsed - 1100;
      targetAlpha = Math.min(t2 / 500, 1);
      resultAlpha = Math.max(1 - t2 / 160, 0);
    }

    const ctx = RifleQual._ctx;
    const { _cx: cx, _cy: cy, _scopeR: scopeR } = RifleQual;

    ctx.clearRect(0, 0, RifleQual._size, RifleQual._size);
    // Keep tube mask during pit animation too.
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, RifleQual._size, RifleQual._size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#050705';
    ctx.fillRect(0, 0, RifleQual._size, RifleQual._size);

    if (targetAlpha > 0.01) {
      ctx.globalAlpha = targetAlpha;
      RifleQual._drawTargetRings(ctx);
      ctx.globalAlpha = 1;
    }

    if (resultAlpha > 0.01) {
      ctx.globalAlpha = resultAlpha;
      const score      = RifleQual._lastScore;
      const scoreColor = score >= 4 ? '#4caf50' : score >= 3 ? '#f0b429' : '#e53935';
      ctx.fillStyle    = scoreColor;
      ctx.font         = `bold ${Math.floor(scopeR * 0.55)}px monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(score === 0 ? 'MISS' : String(score), cx, cy - 6);
      ctx.fillStyle = '#7a8a6a';
      ctx.font      = `${Math.floor(scopeR * 0.13)}px monospace`;
      ctx.fillText(score === 0 ? 'NO SCORE' : 'POINTS', cx, cy + scopeR * 0.27);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2);
    ctx.strokeStyle = '#0a0e07';
    ctx.lineWidth   = 8;
    ctx.stroke();
  },

  // ── Shot resolution ───────────────────────────
  _resolveShot(holdPct) {
    cancelAnimationFrame(RifleQual._raf);

    const pos = RifleQual.POSITIONS[RifleQual._posIdx];

    // Jitter penalty for releasing very early (shaky technique)
    let jitterR = pos.errorRad * 0.30;
    if (holdPct < 0.15) jitterR *= 3.0;
    else if (holdPct < 0.35) jitterR *= 1.8;

    const angle = Math.random() * Math.PI * 2;
    const mag   = Math.random() * jitterR;
    const holdDy = RifleQual._getHoldoverPx(pos);
    // Impact = aim + sway + jitter (all relative to canvas center = target center)
    const dx    = RifleQual._aimX + RifleQual._swayX + RifleQual._breathX + Math.cos(angle) * mag;
    const dy    = RifleQual._aimY + RifleQual._swayY + RifleQual._breathY + holdDy + Math.sin(angle) * mag;
    const score = RifleQual._scoreShot(dx, dy);

    RifleQual._lastScore = score;
    RifleQual._scores.push(score);
    RifleQual._updateScorecard();

    // Flash
    const flash = document.getElementById('rq-flash');
    if (flash) {
      flash.textContent = score === 0 ? 'MISS' : String(score);
      flash.className   = 'rq-flash ' + (score >= 4 ? 'rq-flash-good' : score >= 3 ? 'rq-flash-ok' : 'rq-flash-bad');
      setTimeout(() => { if (flash) flash.className = 'rq-flash hidden'; }, 420);
    }

    // Pit animation
    RifleQual._phase    = 'pit';
    RifleQual._pitStart = performance.now();
    RifleQual._lastTs   = RifleQual._pitStart;
    RifleQual._raf      = requestAnimationFrame(RifleQual._loop);
  },

  _scoreShot(dx, dy) {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= RifleQual._bullR)      return 5;
    if (dist >  RifleQual._targetR)    return 0;
    return Math.max(2, 5 - Math.ceil((dist - RifleQual._bullR) / RifleQual._ringStep));
  },

  _afterPit() {
    RifleQual._shotIdx++;

    if (RifleQual._shotIdx >= RifleQual.SHOTS_PER_POS) {
      RifleQual._posIdx++;
      RifleQual._shotIdx = 0;

      if (RifleQual._posIdx >= RifleQual.POSITIONS.length) {
        RifleQual._phase = 'done';
        RifleQual._showResults();
        return;
      }
      RifleQual._showPositionIntro(RifleQual._posIdx);
      return;
    }

    RifleQual._startPosition();
  },

  // ── Topbar ────────────────────────────────────
  _updateTopbar() {
    const posIdx = Math.min(RifleQual._posIdx, RifleQual.POSITIONS.length - 1);
    const pos    = RifleQual.POSITIONS[posIdx];
    const get    = (id) => document.getElementById(id);
    if (get('rq-pos-name'))   get('rq-pos-name').textContent   = pos.label;
    if (get('rq-pos-num'))    get('rq-pos-num').textContent    = `POSITION ${posIdx + 1} OF ${RifleQual.POSITIONS.length}`;
    if (get('rq-shot-count')) get('rq-shot-count').textContent = `SHOT ${RifleQual._shotIdx + 1} OF ${RifleQual.SHOTS_PER_POS}`;
    if (get('rq-dist-chip'))  get('rq-dist-chip').textContent  = `${pos.distanceYds || 500} YD`;
  },

  _setInstruction(text) {
    const el = document.getElementById('rq-instruction');
    if (el) el.textContent = text;
  },

  // ── Scorecard ────────────────────────────────
  _initScorecard() {
    const body = document.getElementById('rq-sc-body');
    if (!body) return;
    body.innerHTML = '';
    for (let row = 0; row < RifleQual.SHOTS_PER_POS; row++) {
      for (let col = 0; col < RifleQual.POSITIONS.length; col++) {
        const cell       = document.createElement('span');
        cell.id          = `rq-cell-${col}-${row}`;
        cell.className   = 'rq-sc-cell';
        cell.textContent = '—';
        body.appendChild(cell);
      }
    }
    for (let col = 0; col < RifleQual.POSITIONS.length; col++) {
      const el = document.getElementById(`rq-total-${col}`);
      if (el) el.textContent = '—';
    }
  },

  _updateScorecard() {
    const scores = RifleQual._scores;
    for (let i = 0; i < scores.length; i++) {
      const col  = Math.floor(i / RifleQual.SHOTS_PER_POS);
      const row  = i % RifleQual.SHOTS_PER_POS;
      const cell = document.getElementById(`rq-cell-${col}-${row}`);
      if (!cell) continue;
      const s      = scores[i];
      cell.textContent = s;
      cell.className   = 'rq-sc-cell rq-sc-filled ' + (s >= 4 ? 'rq-sc-good' : s >= 3 ? 'rq-sc-ok' : 'rq-sc-bad');
    }
    for (let col = 0; col < RifleQual.POSITIONS.length; col++) {
      const start = col * RifleQual.SHOTS_PER_POS;
      const slice = scores.slice(start, start + RifleQual.SHOTS_PER_POS);
      if (slice.length === RifleQual.SHOTS_PER_POS) {
        const el = document.getElementById(`rq-total-${col}`);
        if (el) el.textContent = slice.reduce((a, b) => a + b, 0);
      }
    }
  },

  // ── Pre-range brief + weapons safety quiz ─────

  _showPreRange() {
    RifleQual._quizPhase = 'brief';
    document.getElementById('rq-prerange').classList.remove('hidden');
    document.getElementById('rqp-brief').classList.remove('hidden');
    document.getElementById('rqp-quiz').classList.add('hidden');
    document.getElementById('rqp-fail').classList.add('hidden');
    document.getElementById('rqp-pass').classList.add('hidden');

    UI._glowText(document.getElementById('rqp-narrative'),
      `You were told at the last minute that you are shooting on this weeks rifle range. You get to the armory at 0430 to sign out your M16A4 from the armory and draw your gear. After some classes from the CMT, the coaches ask a series of questions to confirm we all know our safety procedures. "Look shooters, we need you all to pass this without question, so I hope you all paid attention during the classes this morning." He's holding a clipboard with our names on it. "Weapons safety rules and conditions — each of you must tell me them in the correct order. If you can't pass either of these tests, you will be dropped from this range, and your 1stSgt will deal with you."`
    );

    const old = document.getElementById('rqp-btn-ack');
    const btn = old.cloneNode(true);
    old.parentNode.replaceChild(btn, old);
    btn.addEventListener('click', () => {
      document.getElementById('rqp-brief').classList.add('hidden');
      RifleQual._startQuiz('safety');
    });
  },

  _startQuiz(type) {
    RifleQual._quizPhase     = type;
    RifleQual._quizSelected  = null;
    RifleQual._quizAttempts  = 0;
    RifleQual._quizShowWrong = false;
    // Reset drag state
    RifleQual._dragId       = null;
    RifleQual._dragPendId   = null;
    RifleQual._dragStarted  = false;
    RifleQual._hoverSlotIdx = null;
    if (RifleQual._dragGhost) { RifleQual._dragGhost.remove(); RifleQual._dragGhost = null; }
    if (RifleQual._docListen) {
      document.removeEventListener('pointermove', RifleQual._onDocPointerMove);
      document.removeEventListener('pointerup',   RifleQual._onDocPointerUp);
      RifleQual._docListen = false;
    }

    const quizEl = document.getElementById('rqp-quiz');
    quizEl.classList.remove('hidden');

    let rawItems, slotLabels, title, sub;
    if (type === 'safety') {
      title      = 'WEAPONS SAFETY RULES';
      sub        = 'Drag each rule into the correct numbered slot (1 – 4).';
      rawItems   = RifleQual.SAFETY_RULES.map((text, i) => ({ id: i, text }));
      slotLabels = ['RULE 1', 'RULE 2', 'RULE 3', 'RULE 4'];
    } else {
      title      = 'WEAPON CONDITIONS';
      sub        = 'Drag each description to the correct condition number (1 – 4).';
      rawItems   = RifleQual.WEAPON_CONDITIONS.map((text, i) => ({ id: i, text }));
      slotLabels = ['CONDITION 1', 'CONDITION 2', 'CONDITION 3', 'CONDITION 4'];
    }

    RifleQual._quizItems = rawItems;
    RifleQual._quizSlots = new Array(4).fill(null);

    // Shuffle items for display
    const shuffled = [...rawItems].sort(() => Math.random() - 0.5);

    document.getElementById('rqp-quiz-title').textContent = title;
    document.getElementById('rqp-quiz-sub').textContent   = sub;

    // Clear any leftover error message from a previous quiz session
    const errEl = document.getElementById('rqp-quiz-error');
    if (errEl) { errEl.textContent = ''; errEl.classList.add('hidden'); }

    // Build slot rows
    const slotsEl = document.getElementById('rqp-slots');
    slotsEl.removeAttribute('data-drag-active');
    slotsEl.innerHTML = '';
    slotLabels.forEach((label, i) => {
      const row  = document.createElement('div');
      row.className = 'rqp-slot';

      const lbl  = document.createElement('span');
      lbl.className   = 'rqp-slot-label';
      lbl.textContent = label;

      const area = document.createElement('div');
      area.className    = 'rqp-slot-area';
      area.dataset.slot = i;
      area.textContent  = '— drag here —';
      area.addEventListener('click', () => RifleQual._onSlotClick(i));

      row.appendChild(lbl);
      row.appendChild(area);
      slotsEl.appendChild(row);
    });

    // Build pool with drag-enabled cards
    const poolEl = document.getElementById('rqp-pool');
    poolEl.innerHTML = '<div class="rqp-pool-label">DRAG TO A SLOT — or tap to select, then tap a slot</div>';
    shuffled.forEach(item => {
      const card = document.createElement('div');
      card.className      = 'rqp-card';
      card.dataset.cardId = item.id;
      card.textContent    = item.text;
      card.addEventListener('pointerdown', (e) => RifleQual._onItemPointerDown(e, item.id));
      poolEl.appendChild(card);
    });

    // Fresh submit button
    const old    = document.getElementById('rqp-btn-submit');
    const newBtn = old.cloneNode(false);
    newBtn.id          = 'rqp-btn-submit';
    newBtn.className   = 'btn btn-primary';
    newBtn.disabled    = true;
    newBtn.textContent = 'SUBMIT';
    newBtn.addEventListener('click', RifleQual._onQuizSubmit);
    old.parentNode.replaceChild(newBtn, old);
  },

  // ── Quiz drag-and-drop ────────────────────────

  _onItemPointerDown(e, id) {
    e.preventDefault();
    e.stopPropagation();
    RifleQual._dragPendId  = id;
    RifleQual._dragStartX  = e.clientX;
    RifleQual._dragStartY  = e.clientY;
    RifleQual._dragStarted = false;
    RifleQual._dragId      = null;
    if (!RifleQual._docListen) {
      document.addEventListener('pointermove', RifleQual._onDocPointerMove, { passive: false });
      document.addEventListener('pointerup',   RifleQual._onDocPointerUp);
      RifleQual._docListen = true;
    }
  },

  _onDocPointerMove(e) {
    if (RifleQual._dragPendId === null) return;
    const dx = e.clientX - RifleQual._dragStartX;
    const dy = e.clientY - RifleQual._dragStartY;
    if (!RifleQual._dragStarted && Math.sqrt(dx * dx + dy * dy) > 8) {
      // Threshold exceeded — initiate drag
      RifleQual._dragStarted = true;
      RifleQual._dragId      = RifleQual._dragPendId;
      RifleQual._quizSelected = null;   // clear any tap-selection

      const item  = RifleQual._quizItems.find(it => it.id === RifleQual._dragId);
      const ghost = document.createElement('div');
      ghost.className   = 'rqp-drag-ghost';
      ghost.textContent = item ? item.text : '';
      document.body.appendChild(ghost);
      RifleQual._dragGhost = ghost;

      RifleQual._renderQuizState();
    }
    if (RifleQual._dragStarted && RifleQual._dragGhost) {
      RifleQual._moveDragGhost(e.clientX, e.clientY);
      // Hit-test ghost center to find which slot it's over (ghost is above finger)
      const g  = RifleQual._dragGhost;
      const gh = g.offsetHeight || 40;
      const gx = e.clientX;
      const gy = e.clientY - gh / 2 - 12;
      g.style.visibility = 'hidden';
      const under    = document.elementFromPoint(gx, gy);
      g.style.visibility = '';
      const slotArea = under ? under.closest('.rqp-slot-area') : null;
      const newHover = slotArea ? parseInt(slotArea.dataset.slot, 10) : null;
      if (newHover !== RifleQual._hoverSlotIdx) {
        RifleQual._hoverSlotIdx = newHover;
        RifleQual._renderQuizState();
      }
    }
  },

  _moveDragGhost(x, y) {
    const g = RifleQual._dragGhost;
    if (!g) return;
    // Position ghost centered above finger / cursor
    const gw = g.offsetWidth  || 200;
    const gh = g.offsetHeight || 40;
    g.style.left = (x - gw / 2) + 'px';
    g.style.top  = (y - gh - 12) + 'px';
  },

  _onDocPointerUp(e) {
    document.removeEventListener('pointermove', RifleQual._onDocPointerMove);
    document.removeEventListener('pointerup',   RifleQual._onDocPointerUp);
    RifleQual._docListen = false;

    if (RifleQual._dragPendId === null) return;
    const id = RifleQual._dragPendId;
    RifleQual._dragPendId = null;

    if (RifleQual._dragStarted) {
      // Capture hovered slot before resetting state
      const dropSlotIdx = RifleQual._hoverSlotIdx;
      RifleQual._dragStarted  = false;
      RifleQual._dragId       = null;
      RifleQual._hoverSlotIdx = null;

      if (RifleQual._dragGhost) {
        RifleQual._dragGhost.remove();
        RifleQual._dragGhost = null;
      }

      if (dropSlotIdx !== null) {
        RifleQual._clearQuizError();
        // Remove card from its previous slot if it was there
        const prevSlot = RifleQual._quizSlots.indexOf(id);
        if (prevSlot >= 0) RifleQual._quizSlots[prevSlot] = null;
        // Place into target slot (any occupant returns to pool automatically)
        RifleQual._quizSlots[dropSlotIdx] = id;
      } else {
        // Dropped outside any slot — return card to pool
        const prevSlot = RifleQual._quizSlots.indexOf(id);
        if (prevSlot >= 0) RifleQual._quizSlots[prevSlot] = null;
      }
    } else {
      // Was a tap — fall back to click-to-select behavior
      RifleQual._onCardClick(id);
    }

    RifleQual._renderQuizState();
  },

  _onCardClick(id) {
    RifleQual._clearQuizError();
    const slotIdx = RifleQual._quizSlots.indexOf(id);
    if (slotIdx >= 0) {
      // Card is in a slot — pull it back to pool and select it
      RifleQual._quizSlots[slotIdx] = null;
      RifleQual._quizSelected = id;
    } else {
      // Card is in the pool — toggle selection
      RifleQual._quizSelected = (RifleQual._quizSelected === id) ? null : id;
    }
    RifleQual._renderQuizState();
  },

  _onSlotClick(slotIdx) {
    RifleQual._clearQuizError();
    const occupied = RifleQual._quizSlots[slotIdx];
    if (occupied !== null) {
      if (RifleQual._quizSelected !== null) {
        // Swap: occupied card goes back to pool, selected card takes the slot
        RifleQual._quizSlots[slotIdx] = RifleQual._quizSelected;
        RifleQual._quizSelected = null;
      } else {
        // Pick up the card that's already in this slot
        RifleQual._quizSlots[slotIdx] = null;
        RifleQual._quizSelected = occupied;
      }
    } else {
      if (RifleQual._quizSelected !== null) {
        // Drop selected card into this empty slot
        RifleQual._quizSlots[slotIdx] = RifleQual._quizSelected;
        RifleQual._quizSelected = null;
      }
    }
    RifleQual._renderQuizState();
  },

  _renderQuizState() {
    const slotsEl = document.getElementById('rqp-slots');
    const poolEl  = document.getElementById('rqp-pool');

    // Update slot areas
    const isDragging = RifleQual._dragId !== null;
    slotsEl.querySelectorAll('.rqp-slot-area').forEach((area, i) => {
      const occ     = RifleQual._quizSlots[i];
      const isHover = isDragging && i === RifleQual._hoverSlotIdx;
      const isWrong = RifleQual._quizShowWrong && occ !== null && occ !== i;
      if (occ !== null) {
        area.textContent = RifleQual._quizItems[occ].text;
        let cls = 'rqp-slot-area slot-filled';
        if (isWrong) cls += ' slot-wrong';
        if (isHover) cls += ' slot-hover';
        area.className = cls;
      } else {
        area.textContent = '— drag here —';
        if (isHover) {
          area.className = 'rqp-slot-area slot-hover';
        } else if (RifleQual._quizSelected !== null) {
          area.className = 'rqp-slot-area slot-target';
        } else {
          area.className = 'rqp-slot-area';
        }
      }
    });

    // Update pool cards (hide those that are in slots)
    const inSlots = new Set(RifleQual._quizSlots.filter(v => v !== null));
    poolEl.querySelectorAll('.rqp-card').forEach(card => {
      const cid = parseInt(card.dataset.cardId, 10);
      if (inSlots.has(cid)) {
        card.style.display = 'none';
      } else {
        card.style.display = '';
        if (cid === RifleQual._dragId) {
          card.className = 'rqp-card rqp-dragging';
        } else if (cid === RifleQual._quizSelected) {
          card.className = 'rqp-card rqp-selected';
        } else {
          card.className = 'rqp-card';
        }
      }
    });

    // Enable submit only when all slots are filled
    const btn = document.getElementById('rqp-btn-submit');
    if (btn) btn.disabled = RifleQual._quizSlots.some(v => v === null);
  },

  _onQuizSubmit() {
    const allCorrect = RifleQual._quizSlots.every((occupantId, slotIdx) => occupantId === slotIdx);

    if (allCorrect) {
      RifleQual._clearQuizError();
      if (RifleQual._quizPhase === 'safety') {
        RifleQual._startQuiz('conditions');
      } else {
        RifleQual._quizPhase = 'pass';
        RifleQual._showPassScreen();
      }
      return;
    }

    RifleQual._quizAttempts++;

    if (RifleQual._quizAttempts >= 3) {
      // Three strikes — removed from range as a safety violator
      RifleQual._quizShowWrong = false;
      const msg = RifleQual._quizPhase === 'safety'
        ? 'After three failed attempts to recite the Four Weapons Safety Rules in order, the RSO steps in front of you. "You clearly were not paying attention during the classes. You are being dropped from this range." Your 1stSgt is notified before you reach the parking lot. Assigned UNQUALIFIED.'
        : 'After three failed attempts to identify the Weapon Conditions, the RSO steps in front of you. "You clearly were not paying attention during the classes. You are being dropped from this range." Your 1stSgt is notified. Assigned UNQUALIFIED.';
      RifleQual._quizFail(msg);
    } else {
      // Show inline error with wrong slots highlighted — player can fix and retry
      const remaining = 3 - RifleQual._quizAttempts;
      RifleQual._quizShowWrong = true;
      const errEl = document.getElementById('rqp-quiz-error');
      if (errEl) {
        errEl.textContent = `INCORRECT — ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining. Fix the highlighted slots and resubmit.`;
        errEl.classList.remove('hidden');
      }
      RifleQual._renderQuizState();
    }
  },

  _clearQuizError() {
    RifleQual._quizShowWrong = false;
    const el = document.getElementById('rqp-quiz-error');
    if (el) el.classList.add('hidden');
  },

  _showPassScreen() {
    document.getElementById('rqp-quiz').classList.add('hidden');
    document.getElementById('rqp-pass').classList.remove('hidden');
    UI._glowText(
      document.getElementById('rqp-pass-text'),
      'The coach looks up from the clipboard. "Good job, you actually listened and weren\'t sleeping. Go grab your ammo and head over to the 500 yard line." You walk in the cold morning air over to a coach handing out bundles of ammo, exactly the number of rounds you will be shooting today, which is placed into your cover that everyone is using as a handy dump pouch. You sit on the bench and drop all your gear before heading to the firing line for the tower to give you their brief over the loud speakers. "Man that tower can talk fast, they sound like an auctioneer. I sure do hope I shoot expert today..."'
    );
    const old = document.getElementById('rqp-btn-pass');
    const btn = old.cloneNode(true);
    old.parentNode.replaceChild(btn, old);
    btn.addEventListener('click', () => {
      document.getElementById('rq-prerange').classList.add('hidden');
      RifleQual._quizPhase = 'done';
      RifleQual._showPositionIntro(0);
    });
  },

  _quizFail(msg) {
    RifleQual._quizPhase = 'fail';
    document.getElementById('rqp-quiz').classList.add('hidden');
    document.getElementById('rqp-brief').classList.add('hidden');
    const failEl = document.getElementById('rqp-fail');
    failEl.classList.remove('hidden');
    UI._glowText(document.getElementById('rqp-fail-text'), msg);

    const old = document.getElementById('rqp-btn-fail-done');
    const btn = old.cloneNode(true);
    old.parentNode.replaceChild(btn, old);
    btn.addEventListener('click', () => {
      document.getElementById('rq-prerange').classList.add('hidden');
      RifleQual._applyQuizFail();
    });
  },

  _applyQuizFail() {
    const m = State.game.marine;
    m.rifleQualLevel = 'UNQ';
    m.rifleQualScore = 0;
    Character.applyEffects(m, { profConduct: -8, morale: -10, reputationWithLeadership: -12, disciplineRisk: 15 });
    State.game.rifleQualCompleted = true;
    State.game.log.unshift({
      date:  Engine._dateStr(),
      text:  'Failed weapons safety quiz — assigned UNQUALIFIED without firing a shot.',
      major: true,
    });
    State.save();
    UI.updateRifleQualBadge('UNQ');
    UI.showScreen('screen-game');
    RifleQual._onComplete();
  },

  // ── Results ───────────────────────────────────
  _qualLevel(total) {
    if (total >= 65) return 'Expert';
    if (total >= 55) return 'Sharpshooter';
    if (total >= 45) return 'Marksman';
    return 'UNQ';
  },

  _showResults() {
    const total   = RifleQual._scores.reduce((a, b) => a + b, 0);
    const level   = RifleQual._qualLevel(total);
    const results = document.getElementById('rq-results');
    results.classList.remove('hidden');

    document.querySelector('#rq-results .rq-results-label').textContent =
      RifleQual._practiceMode ? 'RIFLE RANGE — PRACTICE' : 'ANNUAL RIFLE QUALIFICATION';

    const qualEl  = document.getElementById('rq-results-qual');
    qualEl.textContent = level.toUpperCase();
    qualEl.className   = 'rq-results-qual rq-qual-' + level.toLowerCase();
    document.getElementById('rq-results-score').textContent = `${total} / 75`;

    const badgeMap = { Expert: 'expert-badge.svg', Sharpshooter: 'sharpshooter-badge.svg', Marksman: 'marksmanship-badge.svg' };
    const badgeEl  = document.getElementById('rq-results-badge');
    if (badgeMap[level]) {
      badgeEl.src = `img/${badgeMap[level]}`;
      badgeEl.alt = level;
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.classList.add('hidden');
    }

    document.getElementById('rq-results-breakdown').innerHTML =
      RifleQual.POSITIONS.map((pos, i) => {
        const slice = RifleQual._scores.slice(i * RifleQual.SHOTS_PER_POS, (i + 1) * RifleQual.SHOTS_PER_POS);
        return `<span>${pos.label}: ${slice.reduce((a, b) => a + b, 0)}/25</span>`;
      }).join('');

    const effectsEl = document.getElementById('rq-results-effects');
    if (RifleQual._practiceMode) {
      effectsEl.textContent = 'Practice score — no career effects applied.';
    } else {
      const effectText = {
        'Expert':       '+5 ProCon  |  +8 Morale  |  +6 Reputation',
        'Sharpshooter': '+3 ProCon  |  +5 Morale  |  +3 Reputation',
        'Marksman':     '+1 ProCon  |  +2 Morale',
        'UNQ':          '-5 ProCon  |  -8 Morale  |  -6 Reputation  |  +10 DisciplineRisk',
      };
      effectsEl.textContent = effectText[level] || '';
    }

    const old  = document.getElementById('rq-btn-done');
    const done = old.cloneNode(true);
    old.parentNode.replaceChild(done, old);
    done.textContent = RifleQual._practiceMode ? 'BACK TO MAIN MENU' : 'RETURN TO UNIT';
    done.addEventListener('click', () => {
      results.classList.add('hidden');
      RifleQual._applyAndFinish(level, total);
    });
  },

  _applyAndFinish(level, total) {
    if (RifleQual._practiceMode) {
      // Practice mode — no stat effects, no save; return to the title screen
      RifleQual._practiceMode = false;
      UI.showScreen('screen-title');
      return;
    }

    const m = State.game.marine;
    m.rifleQualLevel = level;
    m.rifleQualScore = total;

    const effects = {
      'Expert':       { profConduct: 5,  morale: 8,  reputationWithLeadership: 6 },
      'Sharpshooter': { profConduct: 3,  morale: 5,  reputationWithLeadership: 3 },
      'Marksman':     { profConduct: 1,  morale: 2 },
      'UNQ':          { profConduct: -5, morale: -8, reputationWithLeadership: -6, disciplineRisk: 10 },
    };
    Character.applyEffects(m, effects[level] || {});

    State.game.rifleQualCompleted = true;
    State.game.log.unshift({
      date:  Engine._dateStr(),
      text:  `Annual rifle qualification: ${level} (${total}/75)`,
      major: true,
    });
    State.save();

    UI.updateRifleQualBadge(level);
    UI.showScreen('screen-game');
    RifleQual._onComplete();
  },
};
