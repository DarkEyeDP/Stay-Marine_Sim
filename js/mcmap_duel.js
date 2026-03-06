/* MCMAP Duel Mini-Game: Street-fighter style sparring drill */

const MCMAPDuel = {
  _running: false,
  _bound: false,
  _raf: 0,
  _lastTs: 0,
  _koTimer: 0,

  _gravity: 1800,
  _moveSpeed: 280,
  _jumpSpeed: 680,
  _arenaPadding: 30,

  _round: 1,
  _playerInput: { left: false, right: false, up: false, down: false },
  _keyState: {},
  _aiThink: 0,

  _player: null,
  _ai: null,

  MOVES: {
    jab: { name: 'Vertical Jab', damage: 7, range: 82, startup: 0.08, active: 0.11, recovery: 0.2, knockback: 110, stun: 0.14, blockable: true },
    cross: { name: 'Cross Counter', damage: 12, range: 92, startup: 0.11, active: 0.1, recovery: 0.24, knockback: 150, stun: 0.18, blockable: true },
    elbow: { name: 'Forward Elbow Smash', damage: 16, range: 102, startup: 0.12, active: 0.11, recovery: 0.27, knockback: 180, stun: 0.22, blockable: true },
    frontKick: { name: 'MCMAP Front Kick', damage: 14, range: 112, startup: 0.13, active: 0.12, recovery: 0.24, knockback: 175, stun: 0.2, blockable: true },
    legSweep: { name: 'Leg Sweep', damage: 18, range: 104, startup: 0.16, active: 0.12, recovery: 0.3, knockback: 210, stun: 0.26, blockable: true },
    hipThrow: { name: 'Hip Throw', damage: 22, range: 72, startup: 0.13, active: 0.1, recovery: 0.34, knockback: 280, stun: 0.35, blockable: false },
    hammerLock: { name: 'Hammer Fist', damage: 15, range: 88, startup: 0.14, active: 0.11, recovery: 0.24, knockback: 160, stun: 0.2, blockable: true },
    ridgeHand: { name: 'Ridge Hand', damage: 13, range: 94, startup: 0.1, active: 0.11, recovery: 0.22, knockback: 135, stun: 0.16, blockable: true },
  },

  startPractice() {
    this._bindIfNeeded();
    this._resetRound(true);
    this._showAnnouncer('FIGHT', 'fight');
    UI.showScreen('screen-mcmap');
    this._running = true;
    this._lastTs = 0;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(ts => this._loop(ts));
  },

  exitToMenu() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    if (this._koTimer) clearTimeout(this._koTimer);
    this._koTimer = 0;
    this._clearHeldInputs();
    UI.showScreen('screen-title');
  },

  _newFighter(name, x) {
    return {
      name,
      x,
      y: 0,
      vx: 0,
      vy: 0,
      health: 100,
      facing: 1,
      attack: null,
      attackCooldown: 0,
      stun: 0,
      jumpCooldown: 0,
      hitFlash: 0,
      blocking: false,
      aiMoveDir: 0,
    };
  },

  _resetRound(fullResetRoundNumber = false) {
    const arenaWidth = this._arenaWidth();
    if (fullResetRoundNumber) this._round = 1;
    this._player = this._newFighter('PLAYER', arenaWidth * 0.28);
    this._ai = this._newFighter('AI', arenaWidth * 0.72);
    this._aiThink = 0.2;
    this._clearHeldInputs();
    this._setMoveText('mcmap-player-move', '-');
    this._setMoveText('mcmap-ai-move', '-');
    const roundEl = document.getElementById('mcmap-round');
    if (roundEl) roundEl.textContent = `ROUND ${this._round}`;
    this._updateHud();
    this._renderFighter(this._player, document.getElementById('mcmap-player'));
    this._renderFighter(this._ai, document.getElementById('mcmap-ai'));
  },

  _bindIfNeeded() {
    if (this._bound) return;
    this._bound = true;

    const backBtn = document.getElementById('btn-mcmap-back');
    if (backBtn) backBtn.addEventListener('click', () => this.exitToMenu());

    document.querySelectorAll('#screen-mcmap .mcmap-dir').forEach(btn => {
      const dir = btn.dataset.dir;
      const set = pressed => {
        this._setDir(dir, pressed);
        btn.classList.toggle('active', pressed);
      };
      btn.addEventListener('pointerdown', e => { e.preventDefault(); set(true); });
      btn.addEventListener('pointerup', () => set(false));
      btn.addEventListener('pointercancel', () => set(false));
      btn.addEventListener('pointerleave', () => set(false));
    });

    document.querySelectorAll('#screen-mcmap .mcmap-action').forEach(btn => {
      const attack = btn.dataset.attack;
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        btn.classList.add('active');
        this._queuePlayerAttack(attack);
      });
      const clear = () => btn.classList.remove('active');
      btn.addEventListener('pointerup', clear);
      btn.addEventListener('pointercancel', clear);
      btn.addEventListener('pointerleave', clear);
    });

    window.addEventListener('keydown', e => {
      const code = e.code;
      if (!this._running && code !== 'Escape') return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyJ', 'KeyK', 'KeyL', 'Escape'].includes(code)) {
        e.preventDefault();
      }
      if (code === 'Escape' && this._running) {
        this.exitToMenu();
        return;
      }
      if (this._keyState[code]) return;
      this._keyState[code] = true;
      this._handleKey(code, true);
    });

    window.addEventListener('keyup', e => {
      const code = e.code;
      this._keyState[code] = false;
      this._handleKey(code, false);
    });
  },

  _handleKey(code, down) {
    if (code === 'ArrowLeft') this._setDir('left', down);
    if (code === 'ArrowRight') this._setDir('right', down);
    if (code === 'ArrowUp') this._setDir('up', down);
    if (code === 'ArrowDown') this._setDir('down', down);
    if (down && code === 'KeyJ') this._queuePlayerAttack('light');
    if (down && code === 'KeyK') this._queuePlayerAttack('heavy');
    if (down && code === 'KeyL') this._queuePlayerAttack('grapple');
  },

  _setDir(dir, val) {
    this._playerInput[dir] = val;
  },

  _queuePlayerAttack(kind) {
    if (!this._running) return;
    const moveKey = this._pickMoveForInput(this._player, kind, true);
    this._tryStartAttack(this._player, this._ai, moveKey, 'mcmap-player-move');
  },

  _pickMoveForInput(fighter, kind, isPlayer) {
    const forward = this._isForwardHeld(fighter, isPlayer);
    const back = this._isBackHeld(fighter, isPlayer);
    const down = isPlayer ? this._playerInput.down : false;

    if (kind === 'light') {
      if (forward) return 'frontKick';
      if (back) return 'ridgeHand';
      return 'jab';
    }

    if (kind === 'heavy') {
      if (down) return 'legSweep';
      if (forward) return 'elbow';
      return 'cross';
    }

    if (kind === 'grapple') {
      if (forward) return 'hipThrow';
      if (down) return 'hammerLock';
      return 'hammerLock';
    }

    return 'jab';
  },

  _isForwardHeld(fighter, isPlayer) {
    if (!isPlayer) return fighter.aiMoveDir === fighter.facing;
    return fighter.facing === 1 ? this._playerInput.right : this._playerInput.left;
  },

  _isBackHeld(fighter, isPlayer) {
    if (!isPlayer) return fighter.aiMoveDir === -fighter.facing;
    return fighter.facing === 1 ? this._playerInput.left : this._playerInput.right;
  },

  _tryStartAttack(attacker, defender, moveKey, moveFeedId) {
    const move = this.MOVES[moveKey];
    if (!move) return;
    if (attacker.attack || attacker.attackCooldown > 0 || attacker.stun > 0) return;

    attacker.attack = {
      key: moveKey,
      t: 0,
      didHit: false,
      spec: { ...move, key: moveKey },
    };
    attacker.attackCooldown = move.startup + move.active + move.recovery;
    this._setMoveText(moveFeedId, move.name);
  },

  _setMoveText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  _loop(ts) {
    if (!this._running) return;
    if (!this._lastTs) this._lastTs = ts;
    const dt = Math.min(0.033, (ts - this._lastTs) / 1000);
    this._lastTs = ts;

    this._updateFacing();
    this._updatePlayerInput(dt);
    this._updateAI(dt);
    this._simulateFighter(this._player, this._ai, dt, true);
    this._simulateFighter(this._ai, this._player, dt, false);
    this._resolvePush();

    this._renderFighter(this._player, document.getElementById('mcmap-player'));
    this._renderFighter(this._ai, document.getElementById('mcmap-ai'));
    this._updateHud();

    this._checkKO();

    this._raf = requestAnimationFrame(nextTs => this._loop(nextTs));
  },

  _updateFacing() {
    if (!this._player || !this._ai) return;
    this._player.facing = this._player.x <= this._ai.x ? 1 : -1;
    this._ai.facing = -this._player.facing;
  },

  _updatePlayerInput(dt) {
    const p = this._player;
    if (!p || p.stun > 0 || p.attack) return;

    let dir = 0;
    if (this._playerInput.left && !this._playerInput.right) dir = -1;
    if (this._playerInput.right && !this._playerInput.left) dir = 1;

    p.vx = dir * this._moveSpeed;
    if (this._playerInput.up && p.y === 0 && p.jumpCooldown <= 0) {
      p.vy = this._jumpSpeed;
      p.jumpCooldown = 0.45;
      this._playerInput.up = false;
    }
    p.blocking = this._isBackHeld(p, true) && p.y === 0 && !p.attack;

    if (p.jumpCooldown > 0) p.jumpCooldown = Math.max(0, p.jumpCooldown - dt);
  },

  _updateAI(dt) {
    const ai = this._ai;
    const player = this._player;
    if (!ai || !player) return;

    ai.blocking = false;
    ai.aiMoveDir = 0;

    if (ai.stun > 0 || ai.attack) return;

    this._aiThink -= dt;
    const dist = Math.abs(ai.x - player.x);

    if (dist > 130) {
      ai.aiMoveDir = ai.x < player.x ? 1 : -1;
    } else if (dist < 70 && Math.random() < 0.25) {
      ai.aiMoveDir = ai.x < player.x ? -1 : 1;
      ai.blocking = true;
    }

    ai.vx = ai.aiMoveDir * (this._moveSpeed * 0.88);

    if (ai.y === 0 && ai.jumpCooldown <= 0 && Math.random() < 0.004) {
      ai.vy = this._jumpSpeed * 0.92;
      ai.jumpCooldown = 0.6;
    }

    if (this._aiThink <= 0) {
      this._aiThink = 0.16 + Math.random() * 0.35;
      const roll = Math.random();

      let attackType = 'light';
      if (dist < 82 && roll > 0.68) attackType = 'grapple';
      else if (roll > 0.42) attackType = 'heavy';

      const moveKey = this._pickAIMove(attackType, dist);
      this._tryStartAttack(ai, player, moveKey, 'mcmap-ai-move');
    }

    if (ai.jumpCooldown > 0) ai.jumpCooldown = Math.max(0, ai.jumpCooldown - dt);
  },

  _pickAIMove(kind, dist) {
    if (kind === 'grapple' && dist < 90) return 'hipThrow';
    if (kind === 'heavy' && dist > 95) return 'elbow';
    if (kind === 'heavy' && Math.random() < 0.35) return 'legSweep';
    if (kind === 'light' && dist > 100) return 'frontKick';
    if (kind === 'light' && Math.random() < 0.3) return 'ridgeHand';
    return kind === 'heavy' ? 'cross' : 'jab';
  },

  _simulateFighter(f, enemy, dt, isPlayer) {
    if (!f || !enemy) return;

    f.x += f.vx * dt;
    f.vx *= f.y > 0 ? 0.99 : 0.82;

    if (f.y > 0 || f.vy > 0) {
      f.vy -= this._gravity * dt;
      f.y = Math.max(0, f.y + f.vy * dt);
      if (f.y === 0) f.vy = 0;
    }

    const minX = this._arenaPadding;
    const maxX = this._arenaWidth() - this._arenaPadding;
    f.x = Math.max(minX, Math.min(maxX, f.x));

    if (f.stun > 0) f.stun = Math.max(0, f.stun - dt);
    if (f.attackCooldown > 0) f.attackCooldown = Math.max(0, f.attackCooldown - dt);
    if (f.hitFlash > 0) f.hitFlash = Math.max(0, f.hitFlash - dt);

    if (f.attack) {
      const atk = f.attack;
      atk.t += dt;
      const spec = atk.spec;
      const start = spec.startup;
      const endActive = spec.startup + spec.active;
      const endAll = endActive + spec.recovery;

      if (!atk.didHit && atk.t >= start && atk.t <= endActive) {
        this._attemptHit(f, enemy, spec);
        atk.didHit = true;
      }

      if (atk.t >= endAll) {
        f.attack = null;
      }
    }

    if (isPlayer && f.blocking && Math.abs(enemy.x - f.x) < 95 && !enemy.attack) {
      // tiny guard drift to keep spacing dynamic.
      f.vx -= f.facing * 18;
    }
  },

  _attemptHit(attacker, defender, spec) {
    const dist = Math.abs(attacker.x - defender.x);
    const samePlane = Math.abs(attacker.y - defender.y) < 80;
    if (dist > spec.range || !samePlane) return;

    const defenderBlocking = defender.blocking && spec.blockable;
    const damage = defenderBlocking ? Math.max(1, Math.round(spec.damage * 0.35)) : spec.damage;
    defender.health = Math.max(0, defender.health - damage);

    const hitDir = attacker.facing;
    const kb = defenderBlocking ? spec.knockback * 0.4 : spec.knockback;
    defender.vx += hitDir * kb;

    if (!defenderBlocking) defender.stun = Math.max(defender.stun, spec.stun);
    defender.hitFlash = 0.14;

    if (spec.key === 'hipThrow') {
      defender.vy = this._jumpSpeed * 0.32;
    }
  },

  _resolvePush() {
    const p = this._player;
    const ai = this._ai;
    const gap = Math.abs(p.x - ai.x);
    const minGap = 58;
    if (gap >= minGap) return;

    const overlap = (minGap - gap) / 2;
    const dir = p.x < ai.x ? -1 : 1;
    p.x += dir * overlap;
    ai.x -= dir * overlap;
  },

  _checkKO() {
    if (this._koTimer || !this._running) return;

    if (this._player.health <= 0 || this._ai.health <= 0) {
      const playerWon = this._ai.health <= 0;
      this._showAnnouncer(playerWon ? 'KO - YOU WIN' : 'KO - YOU LOSE', playerWon ? 'win' : 'lose');
      this._round += 1;
      this._koTimer = setTimeout(() => {
        this._koTimer = 0;
        this._resetRound(false);
        this._showAnnouncer('FIGHT', 'fight');
      }, 2200);
    }
  },

  _showAnnouncer(text, tone) {
    const el = document.getElementById('mcmap-announcer');
    if (!el) return;
    el.textContent = text;
    el.style.color = tone === 'lose' ? '#ff8e8e' : tone === 'win' ? '#ffe08e' : '#ffdf8c';
  },

  _updateHud() {
    const playerFill = document.getElementById('mcmap-player-health');
    const aiFill = document.getElementById('mcmap-ai-health');
    if (playerFill) playerFill.style.width = `${this._player.health}%`;
    if (aiFill) aiFill.style.width = `${this._ai.health}%`;
  },

  _renderFighter(f, el) {
    if (!f || !el) return;
    el.style.left = `${f.x}px`;
    el.style.transform = `translateX(-50%) translateY(${-f.y}px) scaleX(${f.facing})`;
    el.classList.toggle('attacking', !!f.attack);
    el.classList.toggle('blocking', !!f.blocking);
    el.classList.toggle('hit', f.hitFlash > 0);
  },

  _arenaWidth() {
    const arena = document.getElementById('mcmap-arena');
    return arena ? arena.clientWidth : 900;
  },

  _clearHeldInputs() {
    this._playerInput.left = false;
    this._playerInput.right = false;
    this._playerInput.up = false;
    this._playerInput.down = false;
    Object.keys(this._keyState).forEach(k => { this._keyState[k] = false; });
    document.querySelectorAll('#screen-mcmap .mcmap-btn.active').forEach(el => el.classList.remove('active'));
  },
};


