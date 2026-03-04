/* ═══════════════════════════════════════════════
   RIFLE QUALIFICATION MINI-GAME
   Player aims with mouse / finger. Physics sway
   drifts the crosshair around the aim point.
   Hold to fill ring, release to fire.
   3 positions × 5 shots = 15 total (max 150 pts).
   ═══════════════════════════════════════════════ */

const RifleQual = {

  // ── Position configs ─────────────────────────
  POSITIONS: [
    {
      id: 'sitting',
      label: 'SITTING',
      desc: '5 shots, sitting. Most stable position. Mouse: hover to aim. Mobile: tap anywhere and drag to move the crosshair — hold to fill the ring, release to fire.',
      holdMs: 3000,
      impulseStrength: 1.1,
      maxSway: 26,
      errorRad: 4,
    },
    {
      id: 'kneeling',
      label: 'KNEELING',
      desc: '5 shots, kneeling. Less stable — the crosshair drifts more. Time your shot when it passes over the target.',
      holdMs: 2200,
      impulseStrength: 2.0,
      maxSway: 44,
      errorRad: 8,
    },
    {
      id: 'standing',
      label: 'STANDING',
      desc: '5 shots, standing offhand. Hardest position. Sway ramps up the longer you hold — fire quickly at the right moment.',
      holdMs: 1800,
      impulseStrength: 3.2,
      maxSway: 60,
      errorRad: 13,
      standupShake: true,
    },
  ],

  SHOTS_PER_POS: 5,
  SPRING_K:      0.030,
  DAMPING:       0.88,

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
  _onComplete: null,
  _scores:     [],
  _posIdx:     0,
  _shotIdx:    0,
  _wind:       { dir: 0, strength: 0, label: 'CALM' },

  // Aim point — player moves this with mouse/touch (relative to canvas center)
  _aimX: 0, _aimY: 0,

  // Relative drag state (touch: crosshair tracks delta from initial tap, not absolute position)
  _relDragActive: false,
  _relDragClientX: 0, _relDragClientY: 0,
  _relDragAimX: 0, _relDragAimY: 0,

  // Physics sway — perturbation around the aim point
  _swayX: 0, _swayY: 0,
  _velX:  0, _velY:  0,
  _impulseTick: 0,

  // Hold state
  _isHolding: false,
  _holdStart: 0,

  // Pre-range quiz state
  _quizPhase:    'brief',   // 'brief' | 'safety' | 'conditions' | 'fail' | 'pass' | 'done'
  _quizSlots:    [],        // [null | itemId] — what's in each numbered slot
  _quizSelected: null,      // id of the currently selected pool card (or null)
  _quizItems:    [],        // [{id, text}] — items for the current quiz round

  // Quiz drag-and-drop state
  _dragId:      null,   // id of item currently being dragged (ghost visible)
  _dragGhost:   null,   // ghost DOM element
  _dragPendId:  null,   // id of pending drag (pointerdown but not yet moved > threshold)
  _dragStartX:  0,
  _dragStartY:  0,
  _dragStarted: false,  // true once drag threshold exceeded
  _docListen:   false,  // whether doc pointermove/up listeners are attached

  // Canvas
  _canvas:  null,
  _ctx:     null,
  _size:    0,
  _cx: 0, _cy: 0,
  _bullR:    0,    // radius of the score-10 dot
  _ringStep: 0,    // width of each score 1-9 ring
  _scopeR:  0,
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
    RifleQual._onComplete = onComplete;
    RifleQual._scores     = [];
    RifleQual._posIdx     = 0;
    RifleQual._shotIdx    = 0;
    RifleQual._phase      = 'idle';
    RifleQual._isHolding  = false;
    RifleQual._aimX       = 0;
    RifleQual._aimY       = 0;

    RifleQual._rollWind();
    UI.showScreen('screen-rifle-qual');
    RifleQual._setupCanvas();
    RifleQual._initScorecard();
    RifleQual._showPreRange();
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
    RifleQual._targetR  = size * 0.40;
    RifleQual._bullR    = size * 0.013;   // tiny 10-ring dot
    RifleQual._ringStep = (RifleQual._targetR - RifleQual._bullR) / 9;

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

    // Fire button — hold only, no aim update (secondary / accessibility)
    const fireBtn = document.getElementById('rq-btn-fire');
    if (fireBtn) {
      fireBtn.addEventListener('pointerdown',  RifleQual._onFireBtnDown, { passive: false });
      fireBtn.addEventListener('pointerup',    RifleQual._onPointerUp);
      fireBtn.addEventListener('pointerleave', RifleQual._onPointerUp);
    }

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
      RifleQual._aimX = raw_x * s;
      RifleQual._aimY = raw_y * s;
    } else {
      RifleQual._aimX = raw_x;
      RifleQual._aimY = raw_y;
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
          RifleQual._aimX = nx * s;
          RifleQual._aimY = ny * s;
        } else {
          RifleQual._aimX = nx;
          RifleQual._aimY = ny;
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
    try { RifleQual._canvas.setPointerCapture(e.pointerId); } catch (_) {}

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

  _onFireBtnDown(e) {
    e.preventDefault();
    if (RifleQual._phase !== 'idle' && RifleQual._phase !== 'aiming') return;
    if (RifleQual._isHolding) return;
    RifleQual._startHold();
  },

  _startHold() {
    RifleQual._isHolding = true;
    RifleQual._holdStart = performance.now();
    RifleQual._phase     = 'aiming';
    RifleQual._setInstruction('HOLD — RELEASE TO FIRE');
    const btn = document.getElementById('rq-btn-fire');
    if (btn) { btn.textContent = 'RELEASE TO FIRE'; btn.classList.add('holding'); }
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
    RifleQual._impulseTick = 12 + Math.floor(Math.random() * 20);
    RifleQual._isHolding   = false;
    RifleQual._relDragActive = false;
    RifleQual._phase       = 'idle';
    RifleQual._updateTopbar();
    RifleQual._setInstruction('AIM WITH MOUSE / FINGER — HOLD TO FIRE');

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

    // Wind shifts where sway naturally settles (relative to aim point)
    const windBiasX = RifleQual._wind.dir * RifleQual._wind.strength * pos.maxSway * 0.90;

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

    // Random impulses
    RifleQual._impulseTick -= dt;
    if (RifleQual._impulseTick <= 0) {
      const imp = pos.impulseStrength + extraImpulse;
      RifleQual._velX += (Math.random() - 0.5) * imp * 2;
      RifleQual._velY += (Math.random() - 0.5) * imp * 2;
      RifleQual._impulseTick = 12 + Math.floor(Math.random() * 24);
    }

    // Clamp sway magnitude
    const maxS    = pos.maxSway + extraSway;
    const swayMag = Math.sqrt(RifleQual._swayX ** 2 + RifleQual._swayY ** 2);
    if (swayMag > maxS) {
      const s = maxS / swayMag;
      RifleQual._swayX *= s;
      RifleQual._swayY *= s;
    }
  },

  // ── Drawing ───────────────────────────────────
  _drawTargetRings(ctx) {
    const { _cx: cx, _cy: cy, _targetR: targetR, _bullR: bullR, _ringStep: ringStep } = RifleQual;
    // Scores 1-9: each ring is ringStep wide, drawn outside-in so each overwrites previous
    const fills = [
      '#1c2218', '#222a1c',   // 1-2: beyond target zone
      '#d4d0b8', '#c0bc9e',   // 3-4: white scoring zone
      '#6a1414', '#7c1c1c',   // 5-6: red zone
      '#1a1a1a', '#141414',   // 7-8: black zone
      '#0e0e0e',              // 9: black bull ring
    ];
    for (let score = 1; score <= 9; score++) {
      // Outer edge of this score's ring
      const r = bullR + (10 - score) * ringStep;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = fills[score - 1];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.055)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }
    // Score 10: tiny white dot in the center
    ctx.beginPath();
    ctx.arc(cx, cy, bullR, 0, Math.PI * 2);
    ctx.fillStyle = '#f0ede0';
    ctx.fill();
  },

  _drawFrame(holdPct) {
    const ctx = RifleQual._ctx;
    const { _cx: cx, _cy: cy, _scopeR: scopeR } = RifleQual;

    // Crosshair is aim point PLUS sway perturbation
    const chX = cx + RifleQual._aimX + RifleQual._swayX;
    const chY = cy + RifleQual._aimY + RifleQual._swayY;

    ctx.clearRect(0, 0, RifleQual._size, RifleQual._size);

    // Clip to circular scope
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#050705';
    ctx.fillRect(0, 0, RifleQual._size, RifleQual._size);

    RifleQual._drawTargetRings(ctx);

    // Vignette
    const vig = ctx.createRadialGradient(cx, cy, scopeR * 0.6, cx, cy, scopeR);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2);
    ctx.fillStyle = vig;
    ctx.fill();

    // Crosshair lines (gap at center so bull center is visible)
    const chLen = scopeR * 0.30;
    const gapR  = 7;
    ctx.strokeStyle = 'rgba(220, 50, 50, 0.9)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.moveTo(chX - chLen, chY); ctx.lineTo(chX - gapR, chY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(chX + gapR,  chY); ctx.lineTo(chX + chLen, chY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(chX, chY - chLen); ctx.lineTo(chX, chY - gapR); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(chX, chY + gapR);  ctx.lineTo(chX, chY + chLen); ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(chX, chY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 50, 50, 0.92)';
    ctx.fill();

    ctx.restore();

    // Scope outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2);
    ctx.strokeStyle = '#0a0e07';
    ctx.lineWidth   = 8;
    ctx.stroke();

    // Hold ring (clockwise arc from 12 o'clock)
    if (holdPct > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle   = startAngle + holdPct * Math.PI * 2;
      const arcColor   = holdPct < 0.40 ? '#4caf50' : holdPct < 0.72 ? '#f0b429' : '#e53935';
      ctx.beginPath();
      ctx.arc(cx, cy, scopeR - 3, startAngle, endAngle);
      ctx.strokeStyle = arcColor;
      ctx.lineWidth   = 5;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
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
      const scoreColor = score >= 8 ? '#4caf50' : score >= 5 ? '#f0b429' : '#e53935';
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
    // Impact = aim + sway + jitter (all relative to canvas center = target center)
    const dx    = RifleQual._aimX + RifleQual._swayX + Math.cos(angle) * mag;
    const dy    = RifleQual._aimY + RifleQual._swayY + Math.sin(angle) * mag;
    const score = RifleQual._scoreShot(dx, dy);

    RifleQual._lastScore = score;
    RifleQual._scores.push(score);
    RifleQual._updateScorecard();

    // Flash
    const flash = document.getElementById('rq-flash');
    if (flash) {
      flash.textContent = score === 0 ? 'MISS' : String(score);
      flash.className   = 'rq-flash ' + (score >= 8 ? 'rq-flash-good' : score >= 5 ? 'rq-flash-ok' : 'rq-flash-bad');
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
    if (dist <= RifleQual._bullR)      return 10;
    if (dist >  RifleQual._targetR)    return 0;
    return Math.max(1, 10 - Math.ceil((dist - RifleQual._bullR) / RifleQual._ringStep));
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
      cell.className   = 'rq-sc-cell rq-sc-filled ' + (s >= 8 ? 'rq-sc-good' : s >= 5 ? 'rq-sc-ok' : 'rq-sc-bad');
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

    const m = State.game.marine;
    document.getElementById('rqp-narrative').textContent =
      `The S-3 has posted your name on this week's range schedule. You sign out your ${m.mosId === 'mos_0311' || m.mosId === 'mos_0321' ? 'M16A4' : 'M16A4 service rifle'} from the armory and draw your gear at the 200-yard line. Before the first detail steps to the firing line, the Range Safety Officer halts the formation. "Before any Marine on my range touches a trigger, you're going to show me you know your weapons handling." He holds up a clipboard. "Weapons safety rules and conditions — put them in the correct order. You miss one, you don't shoot, and your platoon sergeant will hear why."`;

    const old = document.getElementById('rqp-btn-ack');
    const btn = old.cloneNode(true);
    old.parentNode.replaceChild(btn, old);
    btn.addEventListener('click', () => {
      document.getElementById('rqp-brief').classList.add('hidden');
      RifleQual._startQuiz('safety');
    });
  },

  _startQuiz(type) {
    RifleQual._quizPhase    = type;
    RifleQual._quizSelected = null;
    // Reset drag state
    RifleQual._dragId       = null;
    RifleQual._dragPendId   = null;
    RifleQual._dragStarted  = false;
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

      document.getElementById('rqp-slots').setAttribute('data-drag-active', '1');
      RifleQual._renderQuizState();
    }
    if (RifleQual._dragStarted && RifleQual._dragGhost) {
      RifleQual._moveDragGhost(e.clientX, e.clientY);
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
      // Finish drag — detect drop target
      RifleQual._dragStarted = false;
      RifleQual._dragId      = null;

      if (RifleQual._dragGhost) {
        RifleQual._dragGhost.remove();
        RifleQual._dragGhost = null;
      }
      document.getElementById('rqp-slots').removeAttribute('data-drag-active');

      // elementFromPoint after ghost is removed
      const el       = document.elementFromPoint(e.clientX, e.clientY);
      const slotArea = el ? el.closest('.rqp-slot-area') : null;

      if (slotArea) {
        const slotIdx = parseInt(slotArea.dataset.slot, 10);
        // Remove card from its previous slot if it was there
        const prevSlot = RifleQual._quizSlots.indexOf(id);
        if (prevSlot >= 0) RifleQual._quizSlots[prevSlot] = null;
        // If target slot is occupied, swap (occupant returns to pool)
        RifleQual._quizSlots[slotIdx] = id;
      } else {
        // Dropped outside — return to pool (remove from any slot)
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
    slotsEl.querySelectorAll('.rqp-slot-area').forEach((area, i) => {
      const occ = RifleQual._quizSlots[i];
      if (occ !== null) {
        area.textContent = RifleQual._quizItems[occ].text;
        area.className   = 'rqp-slot-area slot-filled';
      } else {
        area.textContent = '— drag here —';
        area.className   = RifleQual._quizSelected !== null
          ? 'rqp-slot-area slot-target'   // hint: this slot can receive a card
          : 'rqp-slot-area';
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
      if (RifleQual._quizPhase === 'safety') {
        // Passed safety rules — now quiz weapon conditions
        RifleQual._startQuiz('conditions');
      } else {
        // Passed both — show pass screen before stepping to the line
        RifleQual._quizPhase = 'pass';
        RifleQual._showPassScreen();
      }
    } else {
      const msg = RifleQual._quizPhase === 'safety'
        ? 'You failed to correctly order the Four Weapons Safety Rules. The Range Safety Officer removes you from the firing line. You are assigned UNQUALIFIED. Your platoon sergeant will be notified.'
        : 'You failed to correctly identify the Weapon Conditions for the M16/M4. The Range Safety Officer removes you from the firing line. You are assigned UNQUALIFIED. Your platoon sergeant will be notified.';
      RifleQual._quizFail(msg);
    }
  },

  _showPassScreen() {
    document.getElementById('rqp-quiz').classList.add('hidden');
    document.getElementById('rqp-pass').classList.remove('hidden');
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
    document.getElementById('rqp-fail-text').textContent = msg;

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
    if (total >= 130) return 'Expert';
    if (total >= 110) return 'Sharpshooter';
    if (total >= 90)  return 'Marksman';
    return 'UNQ';
  },

  _showResults() {
    const total   = RifleQual._scores.reduce((a, b) => a + b, 0);
    const level   = RifleQual._qualLevel(total);
    const results = document.getElementById('rq-results');
    results.classList.remove('hidden');

    const qualEl  = document.getElementById('rq-results-qual');
    qualEl.textContent = level.toUpperCase();
    qualEl.className   = 'rq-results-qual rq-qual-' + level.toLowerCase();
    document.getElementById('rq-results-score').textContent = `${total} / 150`;

    document.getElementById('rq-results-breakdown').innerHTML =
      RifleQual.POSITIONS.map((pos, i) => {
        const slice = RifleQual._scores.slice(i * RifleQual.SHOTS_PER_POS, (i + 1) * RifleQual.SHOTS_PER_POS);
        return `<span>${pos.label}: ${slice.reduce((a, b) => a + b, 0)}/50</span>`;
      }).join('');

    const effectText = {
      'Expert':       '+5 ProCon  |  +8 Morale  |  +6 Reputation',
      'Sharpshooter': '+3 ProCon  |  +5 Morale  |  +3 Reputation',
      'Marksman':     '+1 ProCon  |  +2 Morale',
      'UNQ':          '-5 ProCon  |  -8 Morale  |  -6 Reputation  |  +10 DisciplineRisk',
    };
    document.getElementById('rq-results-effects').textContent = effectText[level] || '';

    const old  = document.getElementById('rq-btn-done');
    const done = old.cloneNode(true);
    old.parentNode.replaceChild(done, old);
    done.addEventListener('click', () => {
      results.classList.add('hidden');
      RifleQual._applyAndFinish(level, total);
    });
  },

  _applyAndFinish(level, total) {
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
      text:  `Annual rifle qualification: ${level} (${total}/150)`,
      major: true,
    });
    State.save();

    UI.updateRifleQualBadge(level);
    UI.showScreen('screen-game');
    RifleQual._onComplete();
  },
};
