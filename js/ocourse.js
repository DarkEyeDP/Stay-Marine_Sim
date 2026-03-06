/* ═══════════════════════════════════════════════
   O-COURSE — Marine Corps Obstacle Course Runner
   16-bit style mini-game | vanilla JS + Canvas

   Controls (desktop):
     ↑ / W / Space  — Jump / Mash (interactive obstacles)
     ↓ / S          — Duck (clear logs, low wires)
     ← / A          — Slow down / Mash Left (balance log)
     → / D          — Sprint / Mash Right (mud pit, balance log)

   Controls (mobile):
     Swipe Up       — Jump / Mash Up
     Swipe Down     — Duck
     Swipe Left     — Slow / Mash Left
     Swipe Right    — Sprint / Mash Right
   ═══════════════════════════════════════════════ */

'use strict';

const OcourseGame = {

  /* ── Virtual resolution ───────────────────── */
  VW: 320,
  VH: 180,
  GY: 140,      // ground surface Y in virtual coords
  PLX: 72,      // player fixed screen X

  /* ── Course length (~75s at base speed) ───── */
  TOTAL: 6750,

  /* ── Physics ──────────────────────────────── */
  GRAV:   400,
  JUMP_V: -222,
  BASE_V:  90,

  /* ── Course obstacle sequence ─────────────── */
  COURSE: [
    { t: 'hurdle',  p: 0.05 },
    { t: 'trench',  p: 0.13 },
    { t: 'rope',    p: 0.21 },
    { t: 'hurdle',  p: 0.28 },
    { t: 'mudpit',  p: 0.36 },
    { t: 'wall',    p: 0.43 },
    { t: 'ballog',  p: 0.51 },
    { t: 'barrier', p: 0.58 },
    { t: 'lowwire', p: 0.65 },
    { t: 'pullbar', p: 0.73 },
    { t: 'trench',  p: 0.80 },
    { t: 'log',     p: 0.87 },
    { t: 'wall',    p: 0.94 },
  ],

  /* ── Obstacle definitions ─────────────────── */
  DEFS: {
    hurdle:  { w: 12, h: 26, a: 'jump',     hint: '[ \u2191 ] JUMP'    },
    wall:    { w: 16, h: 54, a: 'jump',     hint: '[ \u2191 ] JUMP'    },
    trench:  { w: 50, h:  0, a: 'jump',     hint: '[ \u2191 ] JUMP'    },
    log:     { w: 42, h: 14, a: 'duck',     hint: '[ \u2193 ] DUCK'    },
    mudpit:  { w: 72, h:  5, a: 'interact', hint: '[ \u2192 ] PUSH!'   },
    barrier: { w: 14, h: 40, a: 'jump',     hint: '[ \u2191 ] JUMP'    },
    lowwire: { w: 58, h: 22, a: 'duck',     hint: '[ \u2193 ] DUCK'    },
    rope:    { w: 20, h: 70, a: 'interact', hint: '[ \u2191 ] CLIMB!'  },
    pullbar: { w: 22, h: 50, a: 'interact', hint: '[ \u2191 ] PULL!'   },
    ballog:  { w: 64, h: 16, a: 'interact', hint: 'BALANCE!'           },
  },

  /* ── Runtime state ────────────────────────── */
  _cv: null, _cx: null,
  _sc: 1, _ox: 0, _oy: 0,
  _raf: null, _t0: 0,
  _initialized: false,
  _gs: 'idle',
  _wx: 0, _vm: 1.0,
  _py: 0, _pvy: 0,
  _ps: 'run', _pfr: 0,
  _pi: 0, _hf: 0, _hp: 3,
  _obs: [], _ni: 0,
  _bgx: 0,
  _K: { u: false, d: false, l: false, r: false },
  _ju: false, _jl: false, _jr: false,
  _tx: 0, _ty: 0,
  _ia: null,   // active interaction object

  /* ════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════ */

  launch() {
    UI.showScreen('screen-ocourse');
    if (!this._initialized) this._init();
    this._resize();
    this._reset();
    this._gs = 'start';
    this._startLoop();
  },

  exit() {
    this._stopLoop();
    this._K = { u: false, d: false, l: false, r: false };
    this._ia = null;
    UI.showScreen('screen-title');
  },

  /* ════════════════════════════════════════════
     SETUP
     ════════════════════════════════════════════ */

  _init() {
    this._initialized = true;
    this._cv = document.getElementById('oc-canvas');
    this._cx = this._cv.getContext('2d');
    this._cx.imageSmoothingEnabled = false;
    this._bindInput();
    window.addEventListener('resize', () => this._resize());
  },

  _resize() {
    const el = document.getElementById('screen-ocourse');
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    this._cv.width  = w;
    this._cv.height = h;
    this._sc = Math.min(w / this.VW, h / this.VH);
    this._ox = Math.floor((w - this.VW * this._sc) / 2);
    this._oy = Math.floor((h - this.VH * this._sc) / 2);
  },

  _reset() {
    this._wx = 0; this._vm = 1.0;
    this._py = this.GY; this._pvy = 0;
    this._ps = 'run'; this._pfr = 0;
    this._pi = 0; this._hf = 0; this._hp = 3;
    this._obs = []; this._ni = 0;
    this._bgx = 0;
    this._K = { u: false, d: false, l: false, r: false };
    this._ju = false; this._jl = false; this._jr = false;
    this._ia = null;
  },

  /* ════════════════════════════════════════════
     GAME LOOP
     ════════════════════════════════════════════ */

  _startLoop() {
    this._stopLoop();
    this._t0 = performance.now();
    const tick = (t) => {
      const dt = Math.min((t - this._t0) / 1000, 0.05);
      this._t0 = t;
      if (this._gs === 'playing') this._update(dt);
      this._draw();
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  },

  _stopLoop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  },

  /* ════════════════════════════════════════════
     UPDATE
     ════════════════════════════════════════════ */

  _update(dt) {
    // Dispatch to interaction handler when active
    if (this._ia) {
      this._updateInteraction(dt);
      return;
    }

    // Speed control
    if (this._K.l)      this._vm = Math.max(0.50, this._vm - 1.4 * dt);
    else if (this._K.r) this._vm = Math.min(1.60, this._vm + 1.4 * dt);
    else                this._vm += (1.0 - this._vm) * 3.0 * dt;

    const spd = this.BASE_V * this._vm;
    this._wx  += spd * dt;
    this._bgx += spd * 0.35 * dt;

    // Player physics
    if (this._ps === 'jump') {
      this._pvy += this.GRAV * dt;
      this._py  += this._pvy * dt;
      if (this._py >= this.GY) {
        this._py = this.GY; this._pvy = 0; this._ps = 'run';
      }
    }

    if (this._ju && this._ps !== 'jump') {
      this._py = this.GY - 1; this._pvy = this.JUMP_V; this._ps = 'jump';
    }
    this._ju = false;
    this._jl = false;
    this._jr = false;

    if (this._K.d && this._ps === 'run')   this._ps = 'duck';
    if (!this._K.d && this._ps === 'duck') this._ps = 'run';

    if (this._pi > 0) this._pi -= dt;
    if (this._hf > 0) this._hf -= dt;
    this._pfr += dt * 10;

    this._spawn();
    this._updateObs();
    this._collide();

    if (this._wx >= this.TOTAL) this._gs = 'win';
  },

  _spawn() {
    while (this._ni < this.COURSE.length) {
      const entry = this.COURSE[this._ni];
      const wx    = entry.p * this.TOTAL;
      if (this._toSX(wx) > this.VW + 60) break;
      this._obs.push({
        t: entry.t, wx,
        sx: this._toSX(wx),
        def: this.DEFS[entry.t],
        cleared: false, hit: false, judged: false,
      });
      this._ni++;
    }
  },

  _updateObs() {
    for (const o of this._obs) o.sx = this._toSX(o.wx);
    this._obs = this._obs.filter(o => o.sx > -180);
  },

  _collide() {
    if (this._ia) return;
    for (const o of this._obs) {
      if (o.judged) continue;
      const center = o.sx + o.def.w / 2;
      if (center > this.PLX) continue;

      if (o.def.a === 'interact') {
        this._startInteraction(o);
        continue;
      }

      o.judged = true;
      if (this._pi > 0) { o.cleared = true; continue; }

      let ok = false;
      switch (o.def.a) {
        case 'jump': ok = (this._ps === 'jump'); break;
        case 'duck': ok = (this._ps === 'duck'); break;
      }
      if (ok) { o.cleared = true; }
      else    { o.hit = true; this._damage(); }
    }
  },

  _damage() {
    this._hp--;
    this._pi = 1.8;
    this._hf = 0.4;
    this._ps = 'run';
    if (this._hp <= 0) { this._hp = 0; this._gs = 'dead'; }
  },

  _toSX(wx) { return wx - this._wx + this.PLX; },

  /* ════════════════════════════════════════════
     INTERACTION SYSTEM
     ════════════════════════════════════════════ */

  _startInteraction(o) {
    o.judged = true;
    const d = o.def;

    if (o.t === 'rope') {
      this._ia = {
        type: 'rope', obs: o,
        progress: 0, max: 8, timer: 6.0,
        phase: 'climb',          // climb | slide | done
        slideTimer: 0, slideTotal: 1.6,
        topY: this.GY - 42,     // feet position at top of climb
        charY: this.GY,
      };
    } else if (o.t === 'pullbar') {
      this._ia = {
        type: 'pullbar', obs: o,
        progress: 0, max: 7, timer: 5.0,
        phase: 'pull',           // pull | done
        topY: this.GY - 24,     // feet hang below the bar
        charY: this.GY,
      };
    } else if (o.t === 'mudpit') {
      this._ia = {
        type: 'mud', obs: o,
        progress: 0, max: 10, timer: 6.5,
        phase: 'push',           // push | done
        startX: this.PLX,
        endX: ~~(o.sx + d.w - 8),
        charX: this.PLX,
      };
    } else if (o.t === 'ballog') {
      const seq = [];
      for (let i = 0; i < 6; i++) seq.push(Math.random() < 0.5 ? 'l' : 'r');
      this._ia = {
        type: 'ballog', obs: o,
        seq, seqIdx: 0, mistakes: 0,
        timer: 10.0,
        phase: 'balance',        // balance | done
        wobble: 0, wobbleVel: 0, wrongFlash: 0,
        startX: this.PLX,
        endX: ~~(o.sx + d.w - 8),
        charX: this.PLX,
        logY: this.GY - d.h,
      };
    }
  },

  _updateInteraction(dt) {
    const ia = this._ia;
    if (!ia) return;

    // Consume just-pressed flags
    const ju = this._ju; this._ju = false;
    const jl = this._jl; this._jl = false;
    const jr = this._jr; this._jr = false;

    // Timers that run regardless
    if (this._hf > 0) this._hf -= dt;
    if (this._pi > 0) this._pi -= dt;
    this._pfr += dt * 10;

    if (ia.type === 'rope')    this._updateClimb(dt, ia, ju);
    else if (ia.type === 'pullbar') this._updatePull(dt, ia, ju);
    else if (ia.type === 'mud')    this._updateMud(dt, ia, jr);
    else if (ia.type === 'ballog') this._updateBallog(dt, ia, jl, jr);

    if (ia.phase === 'done') this._endInteraction();
  },

  _updateClimb(dt, ia, ju) {
    if (ia.phase === 'climb') {
      ia.timer -= dt;
      if (ju) ia.progress++;
      const pct = Math.min(ia.progress / ia.max, 1);
      ia.charY = this.GY + (ia.topY - this.GY) * pct;

      if (ia.progress >= ia.max) {
        ia.obs.cleared = true;
        ia.phase = 'slide';
        ia.slideTimer = ia.slideTotal;
        ia.charY = ia.topY;
      } else if (ia.timer <= 0) {
        if (this._pi <= 0) { ia.obs.hit = true; this._damage(); }
        else                { ia.obs.cleared = true; }
        ia.phase = 'done';
      }
    } else if (ia.phase === 'slide') {
      ia.slideTimer -= dt;
      const pct = 1 - Math.max(ia.slideTimer / ia.slideTotal, 0);
      ia.charY = ia.topY + (this.GY - ia.topY) * pct;
      if (ia.slideTimer <= 0) ia.phase = 'done';
    }
  },

  _updatePull(dt, ia, ju) {
    ia.timer -= dt;
    if (ju) ia.progress++;
    const pct = Math.min(ia.progress / ia.max, 1);
    ia.charY = this.GY + (ia.topY - this.GY) * pct;

    if (ia.progress >= ia.max) {
      ia.obs.cleared = true;
      ia.phase = 'done';
    } else if (ia.timer <= 0) {
      if (this._pi <= 0) { ia.obs.hit = true; this._damage(); }
      else                { ia.obs.cleared = true; }
      ia.phase = 'done';
    }
  },

  _updateMud(dt, ia, jr) {
    ia.timer -= dt;
    if (jr) ia.progress++;
    const pct = Math.min(ia.progress / ia.max, 1);
    ia.charX = ia.startX + (ia.endX - ia.startX) * pct;

    if (ia.progress >= ia.max) {
      ia.obs.cleared = true;
      ia.phase = 'done';
    } else if (ia.timer <= 0) {
      if (this._pi <= 0) { ia.obs.hit = true; this._damage(); }
      else                { ia.obs.cleared = true; }
      ia.phase = 'done';
    }
  },

  _updateBallog(dt, ia, jl, jr) {
    ia.timer -= dt;
    if (ia.wrongFlash > 0) ia.wrongFlash -= dt;

    // Wobble physics
    ia.wobble    += ia.wobbleVel * dt;
    ia.wobbleVel *= 0.88;
    ia.wobble    *= 0.96;

    const expected = ia.seq[ia.seqIdx];
    const pressed  = jl ? 'l' : jr ? 'r' : null;

    if (pressed && ia.phase === 'balance') {
      if (pressed === expected) {
        ia.seqIdx++;
        ia.wobbleVel += (Math.random() - 0.5) * 14;
        const pct = ia.seqIdx / ia.seq.length;
        ia.charX = ia.startX + (ia.endX - ia.startX) * pct;
      } else {
        ia.mistakes++;
        ia.wrongFlash = 0.4;
        ia.wobbleVel += (Math.random() < 0.5 ? -75 : 75);
      }
    }

    if (ia.seqIdx >= ia.seq.length) {
      ia.obs.cleared = true;
      ia.phase = 'done';
    } else if (ia.mistakes >= 3 || Math.abs(ia.wobble) > 13) {
      if (this._pi <= 0) { ia.obs.hit = true; this._damage(); }
      else                { ia.obs.cleared = true; }
      ia.phase = 'done';
    } else if (ia.timer <= 0) {
      if (this._pi <= 0) { ia.obs.hit = true; this._damage(); }
      else                { ia.obs.cleared = true; }
      ia.phase = 'done';
    }
  },

  _endInteraction() {
    const ia = this._ia;
    // Advance world so the obstacle is behind the player
    if (ia.obs.cleared) {
      this._wx = ia.obs.wx + ia.obs.def.w / 2 + 36;
    }
    this._ju = false; this._jl = false; this._jr = false;
    this._ia = null;
    this._py  = this.GY;
    this._pvy = 0;
    this._ps  = 'run';
  },

  /* ════════════════════════════════════════════
     DRAW
     ════════════════════════════════════════════ */

  _draw() {
    const cx = this._cx, cv = this._cv;
    cx.fillStyle = '#000';
    cx.fillRect(0, 0, cv.width, cv.height);

    cx.save();
    cx.translate(this._ox, this._oy);
    cx.scale(this._sc, this._sc);
    cx.imageSmoothingEnabled = false;

    if (this._gs === 'start') {
      this._dStart(cx);
    } else {
      this._dBg(cx);
      this._dGround(cx);
      this._dFinish(cx);
      this._dObs(cx);
      this._dPlayer(cx);
      if (this._ia) this._dInteract(cx);
      this._dHUD(cx);
      if (this._hf > 0) {
        cx.fillStyle = `rgba(200,0,0,${(this._hf / 0.4) * 0.32})`;
        cx.fillRect(0, 0, this.VW, this.VH);
      }
      if (this._gs === 'dead') this._dDead(cx);
      if (this._gs === 'win')  this._dWin(cx);
    }

    cx.restore();
  },

  /* ── Background (16-bit layered) ──────────── */

  _dBg(cx) {
    cx.fillStyle = '#0a1520';
    cx.fillRect(0, 0, this.VW, this.GY * 0.35 | 0);
    cx.fillStyle = '#112236';
    cx.fillRect(0, this.GY * 0.35 | 0, this.VW, this.GY * 0.30 | 0);
    cx.fillStyle = '#1a3a2c';
    cx.fillRect(0, this.GY * 0.65 | 0, this.VW, this.GY * 0.35 | 0);

    cx.fillStyle = '#4a6878';
    const stars = [12,5, 40,8, 75,3, 110,11, 148,6, 182,2, 215,9, 250,4, 288,7, 305,12];
    for (let i = 0; i < stars.length; i += 2) cx.fillRect(stars[i], stars[i+1], 1, 1);
    cx.fillStyle = '#6a8898';
    const stars2 = [28,14, 60,3, 92,18, 130,7, 165,15, 200,5, 238,13, 272,8, 310,16];
    for (let i = 0; i < stars2.length; i += 2) cx.fillRect(stars2[i], stars2[i+1], 1, 1);

    cx.fillStyle = '#0d2218';
    const h3off = this._bgx * 0.08 % 80;
    for (let x = -h3off; x < this.VW + 80; x += 80) {
      const bx = ~~x;
      cx.fillRect(bx,      this.GY - 50, 75, 50);
      cx.fillRect(bx + 40, this.GY - 36, 55, 36);
    }
    cx.fillStyle = '#102a1c';
    const h2off = this._bgx * 0.18 % 64;
    for (let x = -h2off; x < this.VW + 64; x += 64) {
      const bx = ~~x;
      cx.fillRect(bx,      this.GY - 38, 60, 38);
      cx.fillRect(bx + 32, this.GY - 26, 42, 26);
    }

    cx.fillStyle = '#0c1e10';
    const t1off = this._bgx * 0.30 % 36;
    for (let x = -t1off; x < this.VW + 16; x += 18) {
      const tx = ~~x;
      cx.fillRect(tx + 5, this.GY - 28, 3, 18);
      cx.fillRect(tx + 2, this.GY - 38, 9, 14);
      cx.fillRect(tx + 3, this.GY - 44, 7,  8);
      cx.fillRect(tx + 4, this.GY - 48, 5,  6);
    }
    cx.fillStyle = '#162814';
    const t2off = this._bgx * 0.48 % 28;
    for (let x = -t2off; x < this.VW + 14; x += 14) {
      const tx = ~~x;
      cx.fillRect(tx + 3, this.GY - 22, 2, 14);
      cx.fillRect(tx + 1, this.GY - 30, 6, 10);
      cx.fillRect(tx + 2, this.GY - 36, 4,  8);
    }
  },

  /* ── Ground ─────────────────────────────── */

  _dGround(cx) {
    cx.fillStyle = '#1e1008';
    cx.fillRect(0, this.GY, this.VW, this.VH - this.GY);
    cx.fillStyle = '#2c1a0c';
    cx.fillRect(0, this.GY + 6, this.VW, this.VH - this.GY - 6);
    cx.fillStyle = '#1a0e06';
    cx.fillRect(0, this.GY + 14, this.VW, this.VH - this.GY - 14);

    cx.fillStyle = '#4a7830';
    cx.fillRect(0, this.GY,     this.VW, 1);
    cx.fillStyle = '#3e6228';
    cx.fillRect(0, this.GY + 1, this.VW, 2);
    cx.fillStyle = '#2e4a1e';
    cx.fillRect(0, this.GY + 3, this.VW, 2);

    cx.fillStyle = '#3a2810';
    const d1 = this._wx * 0.85 % 22;
    for (let x = -d1; x < this.VW; x += 22) {
      cx.fillRect(~~x,      this.GY + 6,  4, 2);
      cx.fillRect(~~x + 11, this.GY + 10, 3, 2);
      cx.fillRect(~~x + 5,  this.GY + 15, 5, 2);
    }
    cx.fillStyle = '#4a3618';
    const d2 = this._wx * 0.65 % 30;
    for (let x = -d2; x < this.VW; x += 30) {
      cx.fillRect(~~x + 8, this.GY + 8, 2, 1);
    }
  },

  /* ── Finish line ─────────────────────────── */

  _dFinish(cx) {
    const sx = this._toSX(this.TOTAL - 160);
    if (sx < -30 || sx > this.VW + 10) return;
    const x = ~~sx;

    cx.fillStyle = '#c8a828';
    cx.fillRect(x, this.GY - 60, 4, 60);
    cx.fillStyle = '#a08818';
    cx.fillRect(x + 2, this.GY - 60, 2, 60);

    const bx = x + 4, by = this.GY - 60;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        cx.fillStyle = (row + col) % 2 === 0 ? '#f4f4f0' : '#181818';
        cx.fillRect(bx + col * 11, by + row * 8, 11, 8);
      }
    }
    cx.strokeStyle = '#806820';
    cx.lineWidth = 1;
    cx.strokeRect(bx, by, 44, 16);
    cx.fillStyle = '#181818';
    cx.font = 'bold 5px monospace';
    cx.textAlign = 'left';
    cx.textBaseline = 'middle';
    cx.fillText('FINISH', bx + 3, by + 8);
    cx.fillStyle = '#c8a828';
    cx.fillRect(x - 2, this.GY, 6, 8);
    cx.fillStyle = '#806820';
    cx.fillRect(x - 2, this.GY, 6, 2);
  },

  /* ── Obstacles ──────────────────────────── */

  _dObs(cx) {
    for (const o of this._obs) {
      if (o.cleared) {
        cx.globalAlpha = 0.55;
        this._dOneObs(cx, o);
        cx.globalAlpha = 1;
        continue;
      }

      if (o.hit) cx.globalAlpha = 0.38;
      this._dOneObs(cx, o);
      cx.globalAlpha = 1;

      if (!o.judged) {
        const dist = o.sx - this.PLX;
        if (dist > 4 && dist < 140) {
          cx.globalAlpha = Math.min(1, (140 - dist) / 55);
          const chipY = Math.min(this.GY - o.def.h - 14, this.GY - 24);
          this._dHint(cx, ~~(o.sx + o.def.w / 2), chipY, o.def.hint, o.def.a);
          cx.globalAlpha = 1;
        }
      }
    }
  },

  _dHint(cx, cxc, cy, text, action) {
    const tw  = text.length * 4 + 8;
    const col = action === 'duck'     ? '#60b8ff'
              : action === 'interact' ? '#e060e0'
              : action === 'slow'     ? '#f0a030'
              : '#f8e040';
    cx.fillStyle = 'rgba(0,0,0,0.80)';
    cx.fillRect(cxc - (tw / 2 | 0) - 1, cy - 6, tw + 2, 10);
    cx.fillStyle = col;
    cx.fillRect(cxc - (tw / 2 | 0) - 1, cy - 6, 2, 10);
    cx.font = 'bold 5px monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText(text, cxc, cy - 1);
  },

  _dOneObs(cx, o) {
    const x = ~~o.sx, d = o.def;
    switch (o.t) {
      case 'hurdle':  this._dHurdle(cx, x, d);  break;
      case 'wall':    this._dWall(cx, x, d);    break;
      case 'trench':  this._dTrench(cx, x, d);  break;
      case 'log':     this._dLog(cx, x, d);     break;
      case 'mudpit':  this._dMudpit(cx, x, d);  break;
      case 'barrier': this._dBarrier(cx, x, d); break;
      case 'lowwire': this._dLowwire(cx, x, d); break;
      case 'rope':    this._dRope(cx, x, d);    break;
      case 'pullbar': this._dPullbar(cx, x, d); break;
      case 'ballog':  this._dBallog(cx, x, d);  break;
    }
  },

  _dHurdle(cx, x, d) {
    cx.fillStyle = '#7a4a28';
    cx.fillRect(x, this.GY - d.h, 3, d.h);
    cx.fillRect(x + d.w - 3, this.GY - d.h, 3, d.h);
    cx.fillStyle = '#5a3018';
    cx.fillRect(x + 1, this.GY - d.h, 1, d.h);
    cx.fillRect(x + d.w - 2, this.GY - d.h, 1, d.h);
    cx.fillStyle = '#9a6038';
    cx.fillRect(x, this.GY - d.h, 1, d.h);
    const seg = 3;
    for (let i = 0; i < d.w; i += seg * 2) {
      cx.fillStyle = '#d82818';
      cx.fillRect(x + i, this.GY - d.h, Math.min(seg, d.w - i), 5);
      cx.fillStyle = '#f0ede8';
      cx.fillRect(x + i + seg, this.GY - d.h, Math.min(seg, Math.max(0, d.w - i - seg)), 5);
    }
    cx.fillStyle = '#ff5040';
    cx.fillRect(x, this.GY - d.h, d.w, 1);
    cx.fillStyle = '#801008';
    cx.fillRect(x, this.GY - d.h + 5, d.w, 1);
  },

  _dWall(cx, x, d) {
    cx.fillStyle = '#586860';
    cx.fillRect(x, this.GY - d.h, d.w, d.h);
    for (let r = 0; r < d.h; r += 9) {
      cx.fillStyle = '#38484a';
      cx.fillRect(x, this.GY - d.h + r, d.w, 1);
      const offset = (r / 9 % 2 === 0) ? 0 : 4;
      for (let c = offset; c <= d.w; c += 8) {
        cx.fillStyle = '#38484a';
        cx.fillRect(x + c, this.GY - d.h + r, 1, 8);
      }
    }
    cx.fillStyle = '#6a7a72';
    for (let r = 0; r < d.h; r += 9) {
      const off = (r / 9 % 2 === 0) ? 0 : 4;
      for (let c = off + 1; c < d.w; c += 8) {
        if (c + 6 < d.w) cx.fillRect(x + c, this.GY - d.h + r + 1, 6, 1);
      }
    }
    cx.fillStyle = '#7a8a82';
    cx.fillRect(x - 1, this.GY - d.h - 2, d.w + 2, 3);
    cx.fillStyle = '#5a6a62';
    cx.fillRect(x - 1, this.GY - d.h, d.w + 2, 1);
    cx.fillStyle = '#28383a';
    cx.fillRect(x + d.w, this.GY - d.h + 1, 2, d.h);
  },

  _dTrench(cx, x, d) {
    cx.fillStyle = '#100c06';
    cx.fillRect(x, this.GY, d.w, this.VH - this.GY);
    cx.fillStyle = '#201408';
    cx.fillRect(x + 2, this.GY, d.w - 4, 8);
    cx.fillStyle = '#180e06';
    cx.fillRect(x + 2, this.GY + 8, d.w - 4, 8);
    cx.fillStyle = '#3a2c18';
    cx.fillRect(x,           this.GY + 2, 3, this.VH - this.GY - 2);
    cx.fillRect(x + d.w - 3, this.GY + 2, 3, this.VH - this.GY - 2);
    cx.fillStyle = '#4a7030';
    cx.fillRect(x - 2, this.GY - 1, 4, 3);
    cx.fillRect(x + d.w - 2, this.GY - 1, 4, 3);
    cx.fillStyle = '#3a5820';
    cx.fillRect(x - 1, this.GY - 2, 3, 2);
    cx.fillRect(x + d.w - 2, this.GY - 2, 3, 2);
    cx.fillStyle = '#5a3c20';
    cx.fillRect(x - 3, this.GY - 3, 5, 4);
    cx.fillRect(x + d.w - 2, this.GY - 3, 5, 4);
  },

  _dLog(cx, x, d) {
    cx.fillStyle = '#7c5430';
    cx.fillRect(x, this.GY - d.h, d.w, d.h);
    cx.fillStyle = '#9a6a40';
    cx.fillRect(x + 5, this.GY - d.h,      d.w - 10, 3);
    cx.fillRect(x + 5, this.GY - d.h + 6,  d.w - 10, 2);
    cx.fillRect(x + 5, this.GY - d.h + 11, d.w - 10, 2);
    cx.fillStyle = '#5a3c20';
    cx.fillRect(x + 5, this.GY - d.h + 3,  d.w - 10, 3);
    cx.fillRect(x + 5, this.GY - d.h + 8,  d.w - 10, 3);
    cx.fillStyle = '#3c2818';
    cx.fillRect(x,           this.GY - d.h, 5, d.h);
    cx.fillRect(x + d.w - 5, this.GY - d.h, 5, d.h);
    cx.fillStyle = '#5a3a20';
    cx.fillRect(x + 1, this.GY - d.h + 2, 3, d.h - 4);
    cx.fillStyle = '#7a5030';
    cx.fillRect(x + 2, this.GY - d.h + 3, 1, d.h - 6);
    cx.fillStyle = '#aa7a50';
    cx.fillRect(x + 5, this.GY - d.h, d.w - 10, 1);
    cx.fillStyle = '#1e1008';
    cx.fillRect(x + 3, this.GY, d.w - 6, 3);
  },

  _dMudpit(cx, x, d) {
    cx.fillStyle = '#3c2608';
    cx.fillRect(x, this.GY - d.h, d.w, d.h + 14);
    cx.fillStyle = '#5a3c14';
    cx.fillRect(x, this.GY - d.h, d.w, d.h + 2);
    cx.fillStyle = '#6e4c1c';
    cx.fillRect(x + 2, this.GY - d.h, d.w - 4, d.h);
    cx.fillStyle = '#2c1a06';
    for (let i = 8; i < d.w - 8; i += 16) {
      cx.fillRect(x + i, this.GY - 3, 10, 1);
      cx.fillRect(x + i + 4, this.GY - 1, 6, 1);
    }
    cx.fillStyle = '#8a6a2c';
    cx.fillRect(x - 2, this.GY - d.h - 1, 4, d.h + 3);
    cx.fillRect(x + d.w - 2, this.GY - d.h - 1, 4, d.h + 3);
    cx.fillStyle = '#5a4818';
    cx.fillRect(x - 2, this.GY - d.h - 1, 2, d.h + 3);
    cx.fillRect(x + d.w, this.GY - d.h - 1, 2, d.h + 3);
    cx.fillStyle = '#4a7830'; cx.fillRect(x - 2, this.GY, d.w + 4, 1);
    cx.fillStyle = '#3e6228'; cx.fillRect(x - 2, this.GY + 1, d.w + 4, 2);
    cx.fillStyle = '#2e4a1e'; cx.fillRect(x - 2, this.GY + 3, d.w + 4, 2);
  },

  _dBarrier(cx, x, d) {
    cx.fillStyle = '#4a5c30';
    cx.fillRect(x, this.GY - d.h, 3, d.h);
    cx.fillRect(x + d.w - 3, this.GY - d.h, 3, d.h);
    cx.fillStyle = '#2e3c1e';
    cx.fillRect(x + 2, this.GY - d.h, 1, d.h);
    cx.fillRect(x + d.w - 1, this.GY - d.h, 1, d.h);
    for (let b = 0; b < d.h; b += 9) {
      const by = this.GY - d.h + b;
      const bh = Math.min(7, d.h - b);
      cx.fillStyle = '#527040';
      cx.fillRect(x + 3, by, d.w - 6, bh);
      cx.fillStyle = '#627848';
      cx.fillRect(x + 3, by, d.w - 6, 1);
      cx.fillStyle = '#3a4c28';
      if (b + bh < d.h) cx.fillRect(x + 3, by + bh, d.w - 6, 1);
      cx.fillStyle = '#3e5a30';
      cx.fillRect(x + 3, by + 3, d.w - 6, 1);
    }
    cx.fillStyle = '#728050';
    cx.fillRect(x - 1, this.GY - d.h - 1, d.w + 2, 2);
  },

  _dLowwire(cx, x, d) {
    cx.fillStyle = '#606858';
    cx.fillRect(x,           this.GY - 42, 4, 42);
    cx.fillRect(x + d.w - 4, this.GY - 42, 4, 42);
    cx.fillStyle = '#808870';
    cx.fillRect(x,           this.GY - 42, 1, 42);
    cx.fillRect(x + d.w - 4, this.GY - 42, 1, 42);
    cx.fillStyle = '#404838';
    cx.fillRect(x + 3,       this.GY - 42, 1, 42);
    cx.fillRect(x + d.w - 1, this.GY - 42, 1, 42);
    cx.fillStyle = '#505848';
    cx.fillRect(x - 1, this.GY - 42, d.w + 2, 3);
    cx.fillStyle = '#707860';
    cx.fillRect(x - 1, this.GY - 42, d.w + 2, 1);
    cx.strokeStyle = '#c8a858';
    cx.lineWidth = 1;
    cx.setLineDash([5, 3]);
    cx.beginPath();
    cx.moveTo(x + 4, this.GY - d.h);
    cx.lineTo(x + d.w - 4, this.GY - d.h);
    cx.stroke();
    cx.strokeStyle = '#a88838';
    cx.beginPath();
    cx.moveTo(x + 4, this.GY - d.h + 4);
    cx.lineTo(x + d.w - 4, this.GY - d.h + 4);
    cx.stroke();
    cx.setLineDash([]);
    cx.fillStyle = '#e8c870';
    cx.fillRect(x + 8, this.GY - d.h, 3, 1);
    cx.fillStyle = '#c89830';
    cx.font = 'bold 4px monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText('LOW WIRE', x + (d.w / 2 | 0), this.GY - d.h - 7);
  },

  /* ── New interactive obstacle visuals ─────── */

  _dRope(cx, x, d) {
    const GY = this.GY;
    // Left post
    cx.fillStyle = '#7a5a28';
    cx.fillRect(x, GY - d.h, 4, d.h);
    cx.fillStyle = '#9a7a40';
    cx.fillRect(x, GY - d.h, 1, d.h);
    cx.fillStyle = '#5a3a18';
    cx.fillRect(x + 3, GY - d.h, 1, d.h);
    // Right post
    cx.fillStyle = '#7a5a28';
    cx.fillRect(x + d.w - 4, GY - d.h, 4, d.h);
    cx.fillStyle = '#9a7a40';
    cx.fillRect(x + d.w - 4, GY - d.h, 1, d.h);
    // Top crossbar
    cx.fillStyle = '#8a6a30';
    cx.fillRect(x - 2, GY - d.h - 2, d.w + 4, 5);
    cx.fillStyle = '#aa8a50';
    cx.fillRect(x - 2, GY - d.h - 2, d.w + 4, 1);
    cx.fillStyle = '#5a4020';
    cx.fillRect(x - 2, GY - d.h + 2, d.w + 4, 1);
    // Rope (center, hanging)
    const rx = x + (d.w / 2 | 0);
    cx.fillStyle = '#a08040';
    cx.fillRect(rx - 2, GY - d.h + 4, 4, d.h - 4);
    // Knots every 8px
    for (let ry = GY - d.h + 6; ry < GY - 2; ry += 8) {
      cx.fillStyle = '#7a5c28';
      cx.fillRect(rx - 3, ry, 6, 3);
      cx.fillStyle = '#c0a060';
      cx.fillRect(rx - 2, ry, 1, 1);
    }
    // Rope highlight stripe
    cx.fillStyle = '#c0a060';
    cx.fillRect(rx - 1, GY - d.h + 4, 1, d.h - 4);
    // Label
    cx.fillStyle = '#c89830';
    cx.font = 'bold 4px monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText('ROPE', rx, GY - d.h - 8);
  },

  _dPullbar(cx, x, d) {
    const GY = this.GY;
    // Left post (metal poles)
    cx.fillStyle = '#606858';
    cx.fillRect(x, GY - d.h, 4, d.h);
    cx.fillStyle = '#808870';
    cx.fillRect(x, GY - d.h, 1, d.h);
    cx.fillStyle = '#404838';
    cx.fillRect(x + 3, GY - d.h, 1, d.h);
    // Right post
    cx.fillStyle = '#606858';
    cx.fillRect(x + d.w - 4, GY - d.h, 4, d.h);
    cx.fillStyle = '#808870';
    cx.fillRect(x + d.w - 4, GY - d.h, 1, d.h);
    cx.fillStyle = '#404838';
    cx.fillRect(x + d.w - 1, GY - d.h, 1, d.h);
    // Horizontal bar (thick pipe)
    cx.fillStyle = '#909888';
    cx.fillRect(x - 2, GY - d.h - 2, d.w + 4, 6);
    cx.fillStyle = '#c0c8b8';  // top shine
    cx.fillRect(x - 2, GY - d.h - 2, d.w + 4, 1);
    cx.fillStyle = '#505848';  // bottom shadow
    cx.fillRect(x - 2, GY - d.h + 3, d.w + 4, 1);
    // Grip tape wrapping
    cx.fillStyle = '#303828';
    for (let gx = x + 2; gx < x + d.w - 2; gx += 5) {
      cx.fillRect(gx, GY - d.h - 1, 2, 4);
    }
    // Label
    cx.fillStyle = '#70b0d0';
    cx.font = 'bold 4px monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText('PULL-OVER BAR', x + (d.w / 2 | 0), GY - d.h - 9);
  },

  _dBallog(cx, x, d) {
    const GY = this.GY;
    // Log body (wide balance beam)
    cx.fillStyle = '#7c5430';
    cx.fillRect(x, GY - d.h, d.w, d.h);
    // Bark texture
    cx.fillStyle = '#9a6a40';
    cx.fillRect(x + 5, GY - d.h,      d.w - 10, 3);
    cx.fillRect(x + 5, GY - d.h + 7,  d.w - 10, 2);
    cx.fillStyle = '#5a3c20';
    cx.fillRect(x + 5, GY - d.h + 3,  d.w - 10, 4);
    cx.fillRect(x + 5, GY - d.h + 9,  d.w - 10, 4);
    // End caps with growth rings
    cx.fillStyle = '#3c2818';
    cx.fillRect(x,           GY - d.h, 5, d.h);
    cx.fillRect(x + d.w - 5, GY - d.h, 5, d.h);
    cx.fillStyle = '#5a3a20';
    cx.fillRect(x + 1, GY - d.h + 2, 3, d.h - 4);
    cx.fillStyle = '#7a5030';
    cx.fillRect(x + 2, GY - d.h + 3, 1, d.h - 6);
    cx.fillStyle = '#5a3a20';
    cx.fillRect(x + d.w - 4, GY - d.h + 2, 3, d.h - 4);
    // Top highlight
    cx.fillStyle = '#aa7a50';
    cx.fillRect(x + 5, GY - d.h, d.w - 10, 1);
    // Support stakes
    cx.fillStyle = '#6a4820';
    cx.fillRect(x + 8,       GY, 4, 8);
    cx.fillRect(x + d.w - 12, GY, 4, 8);
    cx.fillStyle = '#4a3010';
    cx.fillRect(x + 9,       GY, 2, 8);
    cx.fillRect(x + d.w - 11, GY, 2, 8);
    // Label
    cx.fillStyle = '#d0b060';
    cx.font = 'bold 4px monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText('BALANCE LOG', x + (d.w / 2 | 0), GY - d.h - 7);
  },

  /* ── Player sprite (detailed 16-bit Marine) ── */

  _dPlayer(cx) {
    if (this._pi > 0 && ~~(this._pi * 9) % 2 === 0) return;

    const ia = this._ia;
    if (ia) {
      const P = 2;
      if (ia.type === 'rope' || ia.type === 'pullbar') {
        this._drawClimbSprite(cx, this.PLX, ~~ia.charY, P);
      } else if (ia.type === 'mud') {
        this._drawMudSprite(cx, ~~ia.charX, this.GY, P);
      } else if (ia.type === 'ballog') {
        this._drawBalanceSprite(cx, ~~ia.charX, ~~ia.logY, P, ia.wobble);
      }
      return;
    }

    const px = this.PLX;
    const py = ~~this._py;
    const P  = 2;
    const fr = ~~this._pfr % 4;
    const isJump = this._ps === 'jump';
    const isDuck = this._ps === 'duck';

    if (isDuck) {
      this._drawDuckSprite(cx, px, py, P);
    } else {
      this._drawStandSprite(cx, px, py, P, fr, isJump);
    }
  },

  _drawClimbSprite(cx, px, py, P) {
    // ── CLIMBING (rope / pull-over bar) — arms raised, gripping above ──

    // Helmet
    cx.fillStyle = '#1c2e12';
    cx.fillRect(px - 3*P, py - 17*P, 5*P, 2*P);
    cx.fillRect(px - 4*P, py - 15*P, 7*P, 3*P);
    cx.fillStyle = '#283c18';
    cx.fillRect(px - 4*P, py - 15*P, P, 3*P);
    cx.fillStyle = '#111808';
    cx.fillRect(px - 5*P, py - 12*P, 9*P, P);
    cx.fillStyle = '#4a5a30';
    cx.fillRect(px - 4*P, py - 14*P, 7*P, P);

    // Face
    cx.fillStyle = '#c89a62';
    cx.fillRect(px - 2*P, py - 11*P, 5*P, 4*P);
    cx.fillStyle = '#28201a';
    cx.fillRect(px - P,   py - 10*P, P, P);
    cx.fillRect(px + P,   py - 10*P, P, P);
    cx.fillStyle = '#a07848';
    cx.fillRect(px,       py - 9*P, P, P);

    // Neck
    cx.fillStyle = '#a07848';
    cx.fillRect(px - P, py - 7*P, 2*P, P);

    // Body
    cx.fillStyle = '#3e5230';
    cx.fillRect(px - 3*P, py - 6*P, 6*P, 5*P);
    cx.fillStyle = '#4a6038';
    cx.fillRect(px - 3*P, py - 6*P, P, 5*P);
    cx.fillStyle = '#2e3e22';
    cx.fillRect(px + 2*P, py - 6*P, P, 5*P);
    // Plate carrier
    cx.fillStyle = '#506840';
    cx.fillRect(px - 2*P, py - 6*P, 4*P, 2*P);
    // MOLLE pouches
    cx.fillStyle = '#2a3820';
    cx.fillRect(px - 2*P, py - 4*P, 2*P, 2*P);
    cx.fillRect(px,       py - 4*P, 2*P, 2*P);

    // Arms raised UP (gripping rope above head)
    cx.fillStyle = '#3a4c28';
    cx.fillRect(px - 5*P, py - 14*P, 2*P, 8*P);  // left arm up
    cx.fillRect(px + 3*P, py - 14*P, 2*P, 8*P);  // right arm up
    cx.fillStyle = '#4a5c34';
    cx.fillRect(px - 5*P, py - 14*P, P, 8*P);
    // Gloves at top (gripping)
    cx.fillStyle = '#1e2814';
    cx.fillRect(px - 5*P, py - 14*P, 2*P, 2*P);
    cx.fillRect(px + 3*P, py - 14*P, 2*P, 2*P);

    // Legs dangling
    cx.fillStyle = '#3a4828';
    cx.fillRect(px - 2*P, py - 2*P, 2*P, 4*P);
    cx.fillRect(px + P,   py - 2*P, 2*P, 4*P);
    cx.fillStyle = '#2e3c22';
    cx.fillRect(px - 2*P, py + 2*P, 2*P, 2*P);
    cx.fillRect(px + P,   py + 2*P, 2*P, 2*P);
    // Boots
    cx.fillStyle = '#1e1408';
    cx.fillRect(px - 3*P, py + 4*P, 3*P, 2*P);
    cx.fillRect(px + P,   py + 4*P, 3*P, 2*P);
    cx.fillStyle = '#2e2410';
    cx.fillRect(px - 3*P, py + 4*P, 3*P, P);
    cx.fillRect(px + P,   py + 4*P, 3*P, P);
  },

  _drawMudSprite(cx, px, py, P) {
    // ── WADING through mud — hunched forward, arms pushing ──

    // Helmet (tilted forward)
    cx.fillStyle = '#1c2e12';
    cx.fillRect(px - 4*P, py - 15*P, 5*P, 2*P);
    cx.fillRect(px - 5*P, py - 13*P, 7*P, 3*P);
    cx.fillStyle = '#283c18';
    cx.fillRect(px - 5*P, py - 13*P, P, 3*P);
    cx.fillStyle = '#111808';
    cx.fillRect(px - 5*P, py - 10*P, 9*P, P);
    cx.fillStyle = '#4a5a30';
    cx.fillRect(px - 5*P, py - 12*P, 7*P, P);

    // Face (looking forward/down under effort)
    cx.fillStyle = '#c89a62';
    cx.fillRect(px - 3*P, py - 9*P, 4*P, 4*P);
    cx.fillStyle = '#28201a';
    cx.fillRect(px - 2*P, py - 8*P, P, P);
    cx.fillRect(px,       py - 8*P, P, P);
    cx.fillStyle = '#a07848';
    cx.fillRect(px - P,   py - 7*P, P, P);

    // Body — hunched forward
    cx.fillStyle = '#3e5230';
    cx.fillRect(px - 4*P, py - 6*P, 8*P, 4*P);
    cx.fillStyle = '#4a6038';
    cx.fillRect(px - 4*P, py - 6*P, P, 4*P);
    cx.fillStyle = '#506840';
    cx.fillRect(px - 3*P, py - 6*P, 6*P, 2*P);
    cx.fillStyle = '#2a3820';
    cx.fillRect(px - 2*P, py - 4*P, 2*P, 2*P);
    cx.fillRect(px + P,   py - 4*P, 2*P, 2*P);

    // Front arm pushing through mud
    cx.fillStyle = '#3a4c28';
    cx.fillRect(px + 3*P, py - 6*P, 3*P, 2*P);
    cx.fillRect(px + 5*P, py - 5*P, 2*P, 2*P);
    cx.fillStyle = '#1e2814';
    cx.fillRect(px + 6*P, py - 5*P, 2*P, 2*P);

    // Back arm
    cx.fillStyle = '#3a4c28';
    cx.fillRect(px - 6*P, py - 6*P, 3*P, 2*P);
    cx.fillStyle = '#1e2814';
    cx.fillRect(px - 7*P, py - 5*P, 2*P, 2*P);

    // Legs (submerged in mud — short, barely visible)
    cx.fillStyle = '#3a4828';
    cx.fillRect(px - 3*P, py - 2*P, 2*P, 2*P);
    cx.fillRect(px + P,   py - 2*P, 2*P, 2*P);
    // Mud splash on boots
    cx.fillStyle = '#5a3c14';
    cx.fillRect(px - 4*P, py - P, 3*P, P);
    cx.fillRect(px + P,   py - P, 3*P, P);
    cx.fillStyle = '#7a5020';
    cx.fillRect(px - 4*P, py - 2*P, P, P);
    cx.fillRect(px + 3*P, py - 2*P, P, P);
    // Mud surface covering boots
    cx.fillStyle = '#6e4c1c';
    cx.fillRect(px - 5*P, py, 4*P, P);
    cx.fillRect(px + P,   py, 4*P, P);
  },

  _drawBalanceSprite(cx, px, py, P, wobble) {
    // ── BALANCING on log — arms spread wide, wobble offset on upper body ──
    const wb = ~~(wobble * 0.6);  // scale wobble for visual lean

    // Helmet (with wobble lean)
    cx.fillStyle = '#1c2e12';
    cx.fillRect(px - 3*P + wb, py - 17*P, 5*P, 2*P);
    cx.fillRect(px - 4*P + wb, py - 15*P, 7*P, 3*P);
    cx.fillStyle = '#283c18';
    cx.fillRect(px - 4*P + wb, py - 15*P, P, 3*P);
    cx.fillStyle = '#111808';
    cx.fillRect(px - 5*P + wb, py - 12*P, 9*P, P);
    cx.fillStyle = '#4a5a30';
    cx.fillRect(px - 4*P + wb, py - 14*P, 7*P, P);

    // Face
    cx.fillStyle = '#c89a62';
    cx.fillRect(px - 2*P + wb, py - 11*P, 5*P, 4*P);
    cx.fillStyle = '#28201a';
    cx.fillRect(px - P + wb,   py - 10*P, P, P);
    cx.fillRect(px + P + wb,   py - 10*P, P, P);
    cx.fillStyle = '#a07848';
    cx.fillRect(px + wb,       py - 9*P, P, P);

    // Neck
    cx.fillStyle = '#a07848';
    cx.fillRect(px - P + wb, py - 7*P, 2*P, P);

    // Body
    cx.fillStyle = '#3e5230';
    cx.fillRect(px - 3*P + wb, py - 6*P, 6*P, 5*P);
    cx.fillStyle = '#4a6038';
    cx.fillRect(px - 3*P + wb, py - 6*P, P, 5*P);
    cx.fillStyle = '#506840';
    cx.fillRect(px - 2*P + wb, py - 6*P, 4*P, 2*P);
    cx.fillStyle = '#2a3820';
    cx.fillRect(px - 2*P + wb, py - 4*P, 2*P, 2*P);
    cx.fillRect(px + wb,       py - 4*P, 2*P, 2*P);

    // Arms spread WIDE for balance (wobble tilts them)
    cx.fillStyle = '#3a4c28';
    cx.fillRect(px - 10*P + wb, py - 6*P, 7*P, 2*P);  // left arm spread
    cx.fillRect(px + 3*P  + wb, py - 6*P, 7*P, 2*P);  // right arm spread
    cx.fillStyle = '#4a5c34';
    cx.fillRect(px - 10*P + wb, py - 6*P, P, 2*P);
    // Gloves at ends
    cx.fillStyle = '#1e2814';
    cx.fillRect(px - 11*P + wb, py - 6*P, 2*P, 2*P);
    cx.fillRect(px + 9*P  + wb, py - 6*P, 2*P, 2*P);

    // Legs (standing on log — no wobble, planted)
    cx.fillStyle = '#3a4828';
    cx.fillRect(px - 2*P, py - 3*P, 2*P, 3*P);
    cx.fillRect(px + P,   py - 3*P, 2*P, 3*P);
    cx.fillStyle = '#2e3c22';
    cx.fillRect(px - 2*P, py, 2*P, P);
    cx.fillRect(px + P,   py, 2*P, P);
    // Boots on log surface
    cx.fillStyle = '#1e1408';
    cx.fillRect(px - 3*P, py, 3*P, P + 1);
    cx.fillRect(px + P,   py, 3*P, P + 1);
    cx.fillStyle = '#2e2410';
    cx.fillRect(px - 3*P, py, 3*P, 1);
    cx.fillRect(px + P,   py, 3*P, 1);
  },

  _drawDuckSprite(cx, px, py, P) {
    // ── DUCKING (low-crawl posture) ──
    cx.fillStyle = '#1c2e12';
    cx.fillRect(px - 4*P, py - 8*P, 6*P, 2*P);
    cx.fillStyle = '#283c18';
    cx.fillRect(px - 4*P, py - 8*P, P, 2*P);
    cx.fillStyle = '#141e0a';
    cx.fillRect(px - 5*P, py - 7*P, 8*P, P);

    cx.fillStyle = '#c89a62';
    cx.fillRect(px - 3*P, py - 6*P, 4*P, 2*P);
    cx.fillStyle = '#2a2018';
    cx.fillRect(px - 2*P, py - 6*P, P, P);
    cx.fillStyle = '#b08050';
    cx.fillRect(px,       py - 6*P, P, P);

    cx.fillStyle = '#a07848';
    cx.fillRect(px - P, py - 4*P, 2*P, P);

    cx.fillStyle = '#3e5230';
    cx.fillRect(px - 5*P, py - 3*P, 8*P, 2*P);
    cx.fillStyle = '#2e3e22';
    cx.fillRect(px - 3*P, py - 3*P, 2*P, 2*P);
    cx.fillRect(px - P,   py - 3*P, 2*P, 2*P);
    cx.fillStyle = '#6a7850';
    cx.fillRect(px - 4*P, py - 4*P, P, 2*P);
    cx.fillRect(px + 2*P, py - 4*P, P, 2*P);

    cx.fillStyle = '#3a4c28';
    cx.fillRect(px - 6*P, py - 4*P, 2*P, 3*P);
    cx.fillRect(px + 3*P, py - 4*P, 2*P, 3*P);
    cx.fillStyle = '#1e2814';
    cx.fillRect(px - 7*P, py - 3*P, 2*P, 2*P);
    cx.fillRect(px + 4*P, py - 3*P, 2*P, 2*P);

    cx.fillStyle = '#344428';
    cx.fillRect(px - 4*P, py - 2*P, 6*P, P);
    cx.fillStyle = '#7a8060';
    cx.fillRect(px - P, py - 2*P, 2*P, P);

    cx.fillStyle = '#3a4828';
    cx.fillRect(px - 4*P, py - P, 4*P, P);
    cx.fillRect(px,       py - P, 4*P, P);
    cx.fillStyle = '#2e3c1e';
    cx.fillRect(px - 5*P, py, 3*P, P);
    cx.fillRect(px + P,   py, 3*P, P);
    cx.fillStyle = '#1e1408';
    cx.fillRect(px - 6*P, py, 3*P, P);
    cx.fillRect(px + P,   py, 3*P, P);
  },

  _drawStandSprite(cx, px, py, P, fr, isJump) {
    // ── STANDING / RUNNING / JUMPING ──
    cx.fillStyle = '#1c2e12';
    cx.fillRect(px - 3*P, py - 17*P, 5*P, 2*P);
    cx.fillRect(px - 4*P, py - 15*P, 7*P, 3*P);
    cx.fillStyle = '#283c18';
    cx.fillRect(px - 4*P, py - 15*P, P, 3*P);
    cx.fillStyle = '#141e0a';
    cx.fillRect(px + 2*P, py - 15*P, P, 3*P);
    cx.fillStyle = '#111808';
    cx.fillRect(px - 5*P, py - 12*P, 9*P, P);
    cx.fillStyle = '#4a5a30';
    cx.fillRect(px - 4*P, py - 14*P, 7*P, P);
    cx.fillStyle = '#404830';
    cx.fillRect(px - 2*P, py - 17*P, 2*P, P);

    cx.fillStyle = '#c89a62';
    cx.fillRect(px - 2*P, py - 11*P, 5*P, 4*P);
    cx.fillStyle = '#d8aa72';
    cx.fillRect(px - 2*P, py - 11*P, P, 2*P);
    cx.fillStyle = '#28201a';
    cx.fillRect(px - P,   py - 10*P, P, P);
    cx.fillRect(px + P,   py - 10*P, P, P);
    cx.fillStyle = '#d8d0c0';
    cx.fillRect(px - P - 1, py - 10*P, 1, P);
    cx.fillRect(px + P + 1, py - 10*P, 1, P);
    cx.fillStyle = '#a07848';
    cx.fillRect(px,        py - 9*P, P, P);
    cx.fillStyle = '#9a7040';
    cx.fillRect(px - 2*P, py - 8*P, 5*P, P);
    cx.fillStyle = '#283018';
    cx.fillRect(px - 2*P, py - 11*P, P, 4*P);
    cx.fillRect(px + 2*P, py - 11*P, P, 4*P);

    cx.fillStyle = '#a07848';
    cx.fillRect(px - P, py - 7*P, 2*P, P);
    cx.fillStyle = '#4e6034';
    cx.fillRect(px - 2*P, py - 7*P, P, P);
    cx.fillRect(px + P,   py - 7*P, P, P);

    cx.fillStyle = '#3e5230';
    cx.fillRect(px - 3*P, py - 6*P, 6*P, 5*P);
    cx.fillStyle = '#4a6038';
    cx.fillRect(px - 3*P, py - 6*P, P, 5*P);
    cx.fillStyle = '#2e3e22';
    cx.fillRect(px + 2*P, py - 6*P, P, 5*P);
    cx.fillStyle = '#506840';
    cx.fillRect(px - 2*P, py - 6*P, 4*P, 2*P);
    cx.fillStyle = '#384c28';
    cx.fillRect(px - 2*P, py - 5*P, 4*P, P);
    cx.fillStyle = '#2a3820';
    cx.fillRect(px - 2*P, py - 4*P, 2*P, 2*P);
    cx.fillRect(px,       py - 4*P, 2*P, 2*P);
    cx.fillStyle = '#1e2c16';
    cx.fillRect(px - 2*P, py - 3*P, P, P);
    cx.fillRect(px,       py - 3*P, P, P);
    cx.fillRect(px + P,   py - 3*P, P, P);
    cx.fillStyle = '#8a7850';
    cx.fillRect(px - 3*P, py - 6*P, P, 2*P);

    cx.fillStyle = '#5a4828';
    cx.fillRect(px - 3*P, py - 2*P, 6*P, P);
    cx.fillStyle = '#9a8858';
    cx.fillRect(px - P, py - 2*P, 2*P, P);
    cx.fillStyle = '#c8b878';
    cx.fillRect(px - P, py - 2*P, P, P);

    cx.fillStyle = '#3a4c28';
    cx.fillRect(px - 5*P, py - 6*P, 2*P, 4*P);
    cx.fillStyle = '#4a5c34';
    cx.fillRect(px - 5*P, py - 6*P, P, 4*P);
    cx.fillStyle = '#1e2814';
    cx.fillRect(px - 5*P, py - 3*P, 2*P, 2*P);
    cx.fillStyle = '#3a4c28';
    cx.fillRect(px + 3*P, py - 6*P, 2*P, 4*P);
    cx.fillStyle = '#2e3c22';
    cx.fillRect(px + 4*P, py - 6*P, P, 4*P);
    cx.fillStyle = '#1e2814';
    cx.fillRect(px + 3*P, py - 3*P, 2*P, 2*P);

    cx.fillStyle = '#181a14';
    cx.fillRect(px + 5*P, py - 8*P, P,   8*P);
    cx.fillStyle = '#242820';
    cx.fillRect(px + 4*P, py - 8*P, 2*P, P);
    cx.fillStyle = '#1c1e18';
    cx.fillRect(px + 3*P, py - 7*P, 3*P, 3*P);
    cx.fillStyle = '#2a2e24';
    cx.fillRect(px + 3*P, py - 6*P, P,   2*P);
    cx.fillStyle = '#181a14';
    cx.fillRect(px + 3*P, py - 7*P, 3*P, P);
    cx.fillStyle = '#303428';
    cx.fillRect(px + 4*P, py - 5*P, P,   3*P);
    cx.fillStyle = '#3a3e30';
    cx.fillRect(px + 5*P, py - 9*P, P,   P);

    if (isJump) {
      cx.fillStyle = '#3a4828';
      cx.fillRect(px - 3*P, py - 4*P, 2*P, 3*P);
      cx.fillRect(px + P,   py - 4*P, 2*P, 3*P);
      cx.fillStyle = '#2e3c22';
      cx.fillRect(px - 4*P, py - 3*P, 2*P, 2*P);
      cx.fillRect(px + 2*P, py - 3*P, 2*P, 2*P);
      cx.fillStyle = '#1e1408';
      cx.fillRect(px - 5*P, py - 2*P, 3*P, 2*P);
      cx.fillRect(px + 2*P, py - 2*P, 3*P, 2*P);
      cx.fillStyle = '#2e2410';
      cx.fillRect(px - 5*P, py - 2*P, 3*P, P);
      cx.fillRect(px + 2*P, py - 2*P, 3*P, P);
    } else {
      cx.fillStyle = '#3a4828';
      const leftFwd = fr < 2;
      const lty = leftFwd ? 3 : 2;
      const lby = leftFwd ? 1 : 2;
      cx.fillRect(px - 3*P, py - lty*P, 2*P, lty*P);
      cx.fillStyle = '#2e3c22';
      cx.fillRect(px - 3*P, py - lby*P, 2*P, lby*P);
      cx.fillStyle = '#4a5c30';
      cx.fillRect(px - 3*P, py - (lty + lby - 1)*P, P, P);

      cx.fillStyle = '#3a4828';
      const rty = leftFwd ? 2 : 3;
      const rby = leftFwd ? 2 : 1;
      cx.fillRect(px + P, py - rty*P, 2*P, rty*P);
      cx.fillStyle = '#2e3c22';
      cx.fillRect(px + P, py - rby*P, 2*P, rby*P);
      cx.fillStyle = '#4a5c30';
      cx.fillRect(px + P, py - (rty + rby - 1)*P, P, P);

      cx.fillStyle = '#1e1408';
      const lb = leftFwd ? 0 : P;
      const rb = leftFwd ? P : 0;
      cx.fillRect(px - 4*P, py - lb, 4*P, P + 1);
      cx.fillRect(px + P,   py - rb, 4*P, P + 1);
      cx.fillStyle = '#3a2c18';
      cx.fillRect(px - 4*P, py - lb, 4*P, 1);
      cx.fillRect(px + P,   py - rb, 4*P, 1);
      cx.fillStyle = '#0e0a06';
      cx.fillRect(px - 4*P, py - lb + P, 4*P, 1);
      cx.fillRect(px + P,   py - rb + P, 4*P, 1);
    }
  },

  /* ── Interaction overlay UI ──────────────── */

  _dInteract(cx) {
    const ia = this._ia;
    if (!ia) return;

    if (ia.type === 'rope' || ia.type === 'pullbar') {
      // Vertical progress bar — right side
      const bx = this.VW - 16, by = 18, bh = this.VH - 52;
      cx.fillStyle = 'rgba(0,0,0,0.72)';
      cx.fillRect(bx - 4, by - 4, 20, bh + 22);

      // Bar background
      cx.fillStyle = '#0e1e0c';
      cx.fillRect(bx, by, 12, bh);

      // Fill (bottom-up)
      const pct  = Math.min(ia.progress / ia.max, 1);
      const fillH = ~~(bh * pct);
      if (fillH > 0) {
        cx.fillStyle = '#1e6a1c';
        cx.fillRect(bx, by + bh - fillH, 12, fillH);
        cx.fillStyle = '#38a836';
        cx.fillRect(bx, by + bh - fillH, 12, 2);
        cx.fillStyle = '#70e850';
        cx.fillRect(bx, by + bh - fillH, 2, fillH);
      }
      cx.strokeStyle = '#2a7028';
      cx.lineWidth = 1;
      cx.strokeRect(bx, by, 12, bh);

      // Tick marks
      cx.fillStyle = '#1a4818';
      for (let t = 1; t < ia.max; t++) {
        const ty = by + bh - ~~(bh * t / ia.max);
        cx.fillRect(bx + 10, ty, 2, 1);
      }

      // Timer
      const maxT  = ia.type === 'rope' ? 6.0 : 5.0;
      const tPct  = Math.max(ia.timer / maxT, 0);
      cx.fillStyle = tPct > 0.4 ? '#70c860' : '#e06030';
      cx.font = 'bold 5px monospace';
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.fillText(`${Math.ceil(Math.max(ia.timer, 0))}s`, bx + 6, by - 7);

      // Action label — pulse blink
      if (ia.phase === 'slide') {
        cx.fillStyle = '#60e060';
        cx.font = 'bold 6px monospace';
        cx.textAlign = 'center';
        cx.fillText('SLIDING DOWN!', this.VW / 2, this.VH - 8);
      } else {
        if (~~(performance.now() / 320) % 2 === 0) {
          cx.fillStyle = '#f8e040';
          cx.font = 'bold 5px monospace';
          cx.textAlign = 'center';
          cx.fillText(ia.type === 'rope' ? '[ \u2191 ] MASH TO CLIMB!' : '[ \u2191 ] MASH TO PULL OVER!',
                      this.VW / 2, this.VH - 8);
        }
      }
    }

    else if (ia.type === 'mud') {
      // Horizontal progress bar — bottom strip
      const bx = 8, by = this.VH - 22, bw = this.VW - 16, bh = 8;
      cx.fillStyle = 'rgba(0,0,0,0.72)';
      cx.fillRect(0, by - 14, this.VW, 36);

      // Track
      cx.fillStyle = '#2c1808';
      cx.fillRect(bx, by, bw, bh);

      // Fill
      const pct   = Math.min(ia.progress / ia.max, 1);
      const fillW = ~~(bw * pct);
      if (fillW > 0) {
        cx.fillStyle = '#7a4010';
        cx.fillRect(bx, by, fillW, bh);
        cx.fillStyle = '#c07828';
        cx.fillRect(bx, by, fillW, 2);
      }
      cx.strokeStyle = '#5a3010';
      cx.lineWidth = 1;
      cx.strokeRect(bx, by, bw, bh);

      // Mud ripple deco inside bar
      cx.fillStyle = 'rgba(180,120,40,0.30)';
      for (let mx = bx + 4; mx < bx + fillW - 4; mx += 10) {
        cx.fillRect(mx, by + 3, 6, 2);
      }

      // Timer
      const tPct = Math.max(ia.timer / 6.5, 0);
      cx.fillStyle = tPct > 0.4 ? '#70c860' : '#e06030';
      cx.font = 'bold 5px monospace';
      cx.textAlign = 'right';
      cx.textBaseline = 'middle';
      cx.fillText(`${Math.ceil(Math.max(ia.timer, 0))}s`, this.VW - 10, by + 4);

      // Prompt — blink
      if (~~(performance.now() / 320) % 2 === 0) {
        cx.fillStyle = '#f0a030';
        cx.font = 'bold 5px monospace';
        cx.textAlign = 'center';
        cx.fillText('[ \u2192 ] MASH — PUSH THROUGH THE MUD!', this.VW / 2, by - 6);
      }
    }

    else if (ia.type === 'ballog') {
      // Bottom panel
      const panelY = this.VH - 40;
      cx.fillStyle = 'rgba(0,0,0,0.78)';
      cx.fillRect(0, panelY, this.VW, 40);

      // Title
      cx.fillStyle = '#d0b060';
      cx.font = 'bold 5px monospace';
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.fillText('BALANCE LOG', this.VW / 2, panelY + 6);

      // Arrow sequence
      const seqLen = ia.seq.length;
      const arrW   = 20;
      const startX = (this.VW / 2) - (seqLen * arrW / 2);
      for (let i = 0; i < seqLen; i++) {
        const ax   = startX + i * arrW + arrW / 2;
        const ay   = panelY + 20;
        const dir  = ia.seq[i];
        const done = i < ia.seqIdx;
        const cur  = i === ia.seqIdx;
        const arrow = dir === 'l' ? '\u2190' : '\u2192';

        if (done) {
          cx.fillStyle = '#286028';
          cx.font = '8px monospace';
        } else if (cur) {
          if (ia.wrongFlash > 0) {
            cx.fillStyle = `rgba(255,60,60,${Math.min(1, ia.wrongFlash / 0.4)})`;
          } else {
            cx.fillStyle = dir === 'l' ? '#60c0ff' : '#f0e040';
          }
          cx.font = 'bold 12px monospace';
        } else {
          cx.fillStyle = '#3a4830';
          cx.font = '7px monospace';
        }
        cx.textAlign = 'center';
        cx.textBaseline = 'middle';
        cx.fillText(arrow, ax, ay);
      }

      // Wobble meter (left side)
      const wmX = 4, wmY = panelY + 10, wmW = 56, wmH = 6;
      cx.fillStyle = '#141c12';
      cx.fillRect(wmX, wmY, wmW, wmH);
      const wobNorm = Math.min(Math.abs(ia.wobble) / 13, 1);
      const wCol    = wobNorm < 0.45 ? '#40d040' : wobNorm < 0.75 ? '#d0c030' : '#d03030';
      const halfW   = wmW / 2 | 0;
      if (ia.wobble < 0) {
        cx.fillStyle = wCol;
        cx.fillRect(wmX + halfW - ~~(halfW * wobNorm), wmY, ~~(halfW * wobNorm), wmH);
      } else {
        cx.fillStyle = wCol;
        cx.fillRect(wmX + halfW, wmY, ~~(halfW * wobNorm), wmH);
      }
      // Center mark
      cx.fillStyle = '#60a060';
      cx.fillRect(wmX + halfW, wmY, 1, wmH);
      cx.strokeStyle = '#284028';
      cx.lineWidth = 1;
      cx.strokeRect(wmX, wmY, wmW, wmH);

      // Mistakes remaining
      const mistLeft = 3 - ia.mistakes;
      cx.fillStyle = mistLeft === 3 ? '#405840'
                   : mistLeft === 2 ? '#807020'
                   : '#803020';
      cx.font = '4px monospace';
      cx.textAlign = 'left';
      cx.fillText(`FALLS: ${mistLeft}`, wmX, panelY + 20);

      // Timer
      const tPct = Math.max(ia.timer / 10.0, 0);
      cx.fillStyle = tPct > 0.4 ? '#406040' : '#c06030';
      cx.font = 'bold 5px monospace';
      cx.textAlign = 'right';
      cx.fillText(`${Math.ceil(Math.max(ia.timer, 0))}s`, this.VW - 4, panelY + 7);
    }
  },

  /* ── HUD ────────────────────────────────── */

  _dHUD(cx) {
    cx.fillStyle = 'rgba(0,0,0,0.70)';
    cx.fillRect(0, 0, this.VW, 15);

    const prog = Math.min(this._wx / this.TOTAL, 1);
    cx.fillStyle = '#142812';
    cx.fillRect(2, 2, this.VW - 4, 7);
    cx.fillStyle = '#1e5a1c';
    cx.fillRect(2, 2, ~~((this.VW - 4) * prog), 7);
    cx.fillStyle = '#38a836';
    cx.fillRect(2, 2, ~~((this.VW - 4) * prog), 2);
    cx.fillStyle = '#0c3010';
    cx.fillRect(2, 8, ~~((this.VW - 4) * prog), 1);
    cx.strokeStyle = '#2a7028';
    cx.lineWidth = 1;
    cx.strokeRect(2, 2, this.VW - 4, 7);
    cx.fillStyle = '#f0d840';
    cx.fillRect(this.VW - 4, 1, 2, 9);
    cx.fillStyle = '#c0a820';
    cx.fillRect(this.VW - 4, 6, 2, 4);

    for (let i = 0; i < 3; i++) {
      this._dHeart(cx, 3 + i * 11, 10, i < this._hp);
    }

    const nextObs = this._obs.find(o => !o.judged && o.sx > this.PLX);
    if (nextObs) {
      const dist = nextObs.sx - this.PLX;
      if (dist < 100) {
        const alpha = Math.min(1, (100 - dist) / 40);
        cx.globalAlpha = alpha;
        cx.fillStyle = '#708860';
        cx.font = '5px monospace';
        cx.textAlign = 'center';
        cx.textBaseline = 'middle';
        cx.fillText(nextObs.t.toUpperCase(), this.VW / 2, 5);
        cx.globalAlpha = 1;
      }
    }

    cx.fillStyle = '#70b860';
    cx.font = 'bold 5px monospace';
    cx.textAlign = 'right';
    cx.textBaseline = 'middle';
    cx.fillText(`${~~(prog * 100)}%`, this.VW - 7, 6);

    if (!this._ia && (this._K.l || this._K.r)) {
      cx.fillStyle = this._K.r ? '#50cc50' : '#e06030';
      cx.font = '5px monospace';
      cx.textAlign = 'left';
      cx.fillText(this._K.r ? '>> SPRINT' : '<< CAUTION', 4, this.VH - 4);
    }
  },

  _dHeart(cx, x, y, filled) {
    cx.fillStyle = filled ? '#c41818' : '#280808';
    cx.fillRect(x + 1, y,     3, 2);
    cx.fillRect(x + 5, y,     3, 2);
    cx.fillRect(x,     y + 1, 9, 4);
    cx.fillRect(x + 1, y + 5, 7, 1);
    cx.fillRect(x + 2, y + 6, 5, 1);
    cx.fillRect(x + 3, y + 7, 3, 1);
    if (filled) {
      cx.fillStyle = '#e84040';
      cx.fillRect(x + 1, y,     1, 2);
      cx.fillRect(x + 5, y,     1, 2);
      cx.fillRect(x,     y + 1, 2, 2);
      cx.fillRect(x + 5, y + 1, 2, 1);
      cx.fillStyle = '#ff6060';
      cx.fillRect(x + 1, y + 1, 1, 1);
    }
  },

  /* ── Overlay screens ────────────────────── */

  _dStart(cx) {
    cx.fillStyle = '#080e0a';
    cx.fillRect(0, 0, this.VW, this.VH);
    cx.fillStyle = 'rgba(0,0,0,0.14)';
    for (let y = 0; y < this.VH; y += 2) cx.fillRect(0, y, this.VW, 1);

    const mid = this.VW / 2;
    this._dEGA(cx, mid, 30);

    cx.fillStyle = '#d4a828';
    cx.font = 'bold 16px monospace';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('O-COURSE', mid, 62);

    cx.fillStyle = '#5a8050';
    cx.font = '6px monospace';
    cx.fillText('MARINE CORPS OBSTACLE COURSE', mid, 74);

    cx.fillStyle = '#243a1e';
    cx.fillRect(mid - 68, 80, 136, 1);

    const ctrls = [
      { k: '[ \u2191 ]', v: 'JUMP  /  MASH (interactive)', c: '#f8e040' },
      { k: '[ \u2193 ]', v: 'DUCK  /  SLIDE UNDER',        c: '#60c0ff' },
      { k: '[ \u2190 ]', v: 'SLOW  /  BALANCE LEFT',       c: '#e07030' },
      { k: '[ \u2192 ]', v: 'SPRINT / BALANCE RIGHT',      c: '#60d060' },
    ];
    ctrls.forEach((c, i) => {
      cx.fillStyle = c.c;
      cx.font = '6px monospace';
      cx.textAlign = 'right';
      cx.fillText(c.k, mid - 2, 92 + i * 11);
      cx.fillStyle = '#a0b888';
      cx.textAlign = 'left';
      cx.fillText(c.v, mid + 2, 92 + i * 11);
    });

    cx.fillStyle = '#485840';
    cx.font = '5px monospace';
    cx.textAlign = 'center';
    cx.fillText('MOBILE: SWIPE IN ANY DIRECTION', mid, 140);

    if (~~(performance.now() / 580) % 2 === 0) {
      cx.fillStyle = '#e8c038';
      cx.font = 'bold 7px monospace';
      cx.fillText('PRESS ANY KEY TO BEGIN', mid, 153);
    }

    cx.fillStyle = '#3a4a30';
    cx.font = '5px monospace';
    cx.fillText('ESC \u2014 EXIT TO MAIN MENU', mid, 166);
  },

  _dEGA(cx, cx_, cy) {
    const g = '#c8a030';
    cx.fillStyle = g;
    cx.fillRect(cx_ - 9, cy - 9, 18, 18);
    cx.fillStyle = '#080e08';
    cx.fillRect(cx_ - 6, cy - 6, 12, 12);
    cx.fillStyle = g;
    cx.fillRect(cx_ - 9, cy - 1, 18, 2);
    cx.fillRect(cx_ - 1, cy - 9, 2, 18);
    cx.fillRect(cx_ - 18, cy - 11, 9, 3);
    cx.fillRect(cx_ - 18, cy - 9,  6, 2);
    cx.fillRect(cx_ + 9,  cy - 11, 9, 3);
    cx.fillRect(cx_ + 12, cy - 9,  6, 2);
    cx.fillRect(cx_ - 2, cy - 13, 4, 4);
    cx.fillRect(cx_ - 1, cy + 8,  2, 8);
    cx.fillRect(cx_ - 5, cy + 8, 10, 2);
    cx.fillRect(cx_ - 4, cy + 14, 3, 2);
    cx.fillRect(cx_ + 1, cy + 14, 3, 2);
  },

  _dDead(cx) {
    cx.fillStyle = 'rgba(80,0,0,0.72)';
    cx.fillRect(0, 0, this.VW, this.VH);
    cx.fillStyle = 'rgba(0,0,0,0.14)';
    for (let y = 0; y < this.VH; y += 2) cx.fillRect(0, y, this.VW, 1);

    const mid = this.VW / 2;
    cx.textAlign = 'center'; cx.textBaseline = 'middle';

    cx.fillStyle = '#ff3030';
    cx.font = 'bold 16px monospace';
    cx.fillText('COURSE FAILED', mid, this.VH / 2 - 28);

    cx.fillStyle = '#906050';
    cx.font = '7px monospace';
    cx.fillText(`DISTANCE: ${~~(Math.min(this._wx / this.TOTAL, 1) * 100)}%`, mid, this.VH / 2 - 10);

    if (~~(performance.now() / 680) % 2 === 0) {
      cx.fillStyle = '#f0b030';
      cx.font = 'bold 7px monospace';
      cx.fillText('ANY KEY \u2014 TRY AGAIN', mid, this.VH / 2 + 16);
    }
    cx.fillStyle = '#505040';
    cx.font = '6px monospace';
    cx.fillText('ESC \u2014 MAIN MENU', mid, this.VH / 2 + 30);
  },

  _dWin(cx) {
    cx.fillStyle = 'rgba(0,36,0,0.78)';
    cx.fillRect(0, 0, this.VW, this.VH);
    cx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 0; y < this.VH; y += 2) cx.fillRect(0, y, this.VW, 1);

    const mid = this.VW / 2;
    cx.textAlign = 'center'; cx.textBaseline = 'middle';

    cx.fillStyle = '#f0d030';
    cx.font = 'bold 14px monospace';
    cx.fillText('COURSE COMPLETE!', mid, this.VH / 2 - 36);

    const rating = this._hp >= 3 ? 'FIRST CLASS' : this._hp === 2 ? 'QUALIFIED' : 'MARGINAL';
    const rcol   = this._hp >= 3 ? '#50e050'     : this._hp === 2 ? '#a0d050'   : '#e09030';
    cx.fillStyle = rcol;
    cx.font = 'bold 10px monospace';
    cx.fillText(rating, mid, this.VH / 2 - 18);

    cx.fillStyle = '#80c070';
    cx.font = '7px monospace';
    cx.fillText(`HEALTH: ${this._hp} / 3`, mid, this.VH / 2 - 2);

    if (~~(performance.now() / 680) % 2 === 0) {
      cx.fillStyle = '#f0f060';
      cx.font = 'bold 7px monospace';
      cx.fillText('ANY KEY \u2014 MAIN MENU', mid, this.VH / 2 + 20);
    }
  },

  /* ════════════════════════════════════════════
     INPUT
     ════════════════════════════════════════════ */

  _bindInput() {
    const onKey = (e) => {
      const scr = document.getElementById('screen-ocourse');
      if (!scr || !scr.classList.contains('active')) return;

      if (e.type === 'keydown') {
        switch (e.key) {
          case 'ArrowUp':    case 'w': case 'W': case ' ':
            if (!this._K.u) this._ju = true;
            this._K.u = true; e.preventDefault(); break;
          case 'ArrowDown':  case 's': case 'S':
            this._K.d = true; e.preventDefault(); break;
          case 'ArrowLeft':  case 'a': case 'A':
            if (!this._K.l) this._jl = true;
            this._K.l = true; e.preventDefault(); break;
          case 'ArrowRight': case 'd': case 'D':
            if (!this._K.r) this._jr = true;
            this._K.r = true; e.preventDefault(); break;
          case 'Escape':
            this.exit(); return;
        }
        this._onAnyKey();
      } else {
        switch (e.key) {
          case 'ArrowUp':    case 'w': case 'W': case ' ':  this._K.u = false; break;
          case 'ArrowDown':  case 's': case 'S':            this._K.d = false; break;
          case 'ArrowLeft':  case 'a': case 'A':            this._K.l = false; break;
          case 'ArrowRight': case 'd': case 'D':            this._K.r = false; break;
        }
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup',   onKey);

    this._cv.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      this._tx = t.clientX; this._ty = t.clientY;
      this._onAnyKey();
    }, { passive: false });

    this._cv.addEventListener('touchend', (e) => {
      e.preventDefault();
      const t  = e.changedTouches[0];
      const dx = t.clientX - this._tx;
      const dy = t.clientY - this._ty;
      const MIN = 20;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > MIN) {
          if (dx < 0) {
            this._jl = true;
            this._K.l = true; setTimeout(() => { this._K.l = false; }, 350);
          } else {
            this._jr = true;
            this._K.r = true; setTimeout(() => { this._K.r = false; }, 350);
          }
        }
      } else {
        if (Math.abs(dy) > MIN) {
          if (dy < 0) { this._ju = true; }
          else        { this._K.d = true; setTimeout(() => { this._K.d = false; }, 450); }
        }
      }
    }, { passive: false });
  },

  _onAnyKey() {
    if (this._gs === 'start') {
      this._gs = 'playing';
    } else if (this._gs === 'dead') {
      this._reset();
      this._gs = 'playing';
    } else if (this._gs === 'win') {
      this.exit();
    }
  },

};
