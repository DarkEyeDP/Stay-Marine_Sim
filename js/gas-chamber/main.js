/* ── Landscape orientation prompt ───────────────── */
(function () {
  const screen = document.getElementById('rotate-screen');
  const skip   = document.getElementById('rotate-skip');
  let dismissed = false;
  let autoTimer = null;

  function isPortraitMobile() {
    return window.innerWidth < 768 && window.innerHeight > window.innerWidth;
  }

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(autoTimer);
    screen.classList.remove('visible');
  }

  function check() {
    if (dismissed) return;
    if (isPortraitMobile()) {
      screen.classList.add('visible');
      autoTimer = setTimeout(dismiss, 5000);
    } else {
      dismiss();
    }
  }

  skip.addEventListener('click', dismiss);
  window.addEventListener('resize', () => { if (!dismissed && !isPortraitMobile()) dismiss(); });
  check();
})();

/* ── Matter.js destructure ──────────────────────── */
const { Engine, World, Bodies, Body, Composites, Constraint, Vector, Events } = Matter;

/* ── Canvas + context ───────────────────────────── */
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

/* ── DOM references ─────────────────────────────── */
const hudMarines    = document.getElementById('hud-marines');
const hudWarning    = document.getElementById('hud-warning');
const menuScreen    = document.getElementById('menu-screen');
const resultScreen  = document.getElementById('result-screen');
const resultKicker  = document.getElementById('result-kicker');
const resultTitle   = document.getElementById('result-title');
const resultText    = document.getElementById('result-text');
const resultSummary = document.getElementById('result-summary');

/* ── Zoom ───────────────────────────────────────── */
// Desktop fixed at 1.25; mobile scales so ~620 world-units fit the screen width
let ZOOM = window.innerWidth >= 768 ? 1.25 : window.innerWidth / 620;
window.addEventListener('resize', () => {
  ZOOM = window.innerWidth >= 768 ? 1.25 : window.innerWidth / 620;
});

/* ── Game state ─────────────────────────────────── */
let state = {
  engine: null, world: null, truck: null,
  marines: [], dust: [], flames: [], obstacles: [],
  terrainBodies: [], terrainSurfaces: [],
  bridgePlanks: [], bridgeConstraints: [],
  camera: { x: 0, y: 0 },
  input: {
    accelerate: false,
    brake:      false,
    reverse:    false,
    keyboardAccelerate: false,
    keyboardBrake:      false,
    keyboardReverse:    false,
    btnAccelerate: false,
    btnBrake:      false,
    btnReverse:    false,
    flamethrower:  false,
    pointers: new Map()
  },
  stunt: { preloadTimer: 0, wheelieBoostTimer: 0, lastDrive: 0 },
  headlights:      false,
  isSkidding:      false,
  started:         false,
  gameOver:        false,
  startGraceTimer: 0,
  parkedTimer:     0,
  flippedTimer:    0,
  marineCount:     0,
  startTime:       0,
  elapsedMs:       0,
  rafId:           0,
  lastTime:        0,
  waitMarine:      { speech: null, idleTimer: 5, reacted: false }
};

/* ── Park hold constant ─────────────────────────── */
const PARK_HOLD = 3.0;   // seconds player must stay in zone

/* ── Game init / reset ──────────────────────────── */
function initGame() {
  cancelAnimationFrame(state.rafId);
  state.engine = Engine.create({ gravity: { x: 0, y: WORLD.gravityY, scale: 0.001 } });
  state.world  = state.engine.world;
  Object.assign(state, {
    started: true, gameOver: false, isSkidding: false,
    startGraceTimer: 0.9, parkedTimer: 0, flippedTimer: 0,
    elapsedMs: 0, startTime: performance.now(), lastTime: performance.now(),
    dust: [], obstacles: [], terrainBodies: [], terrainSurfaces: [],
    bridgePlanks: [], bridgeConstraints: [], marines: [], truckSplats: [],
    marineCount: WORLD.totalMarines, totalPukes: 0,
    waitMarine: { speech: null, idleTimer: 3 + Math.random() * 5, reacted: false }
  });
  state.input.accelerate = false;
  state.input.brake      = false;
  state.input.reverse    = false;
  state.input.keyboardAccelerate = false;
  state.input.keyboardBrake      = false;
  state.input.keyboardReverse    = false;
  state.input.pointers.clear();
  state.stunt.preloadTimer = 0;
  state.stunt.wheelieBoostTimer = 0;
  state.stunt.lastDrive = 0;
  buildWorld();
  menuScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  state.rafId = requestAnimationFrame(gameLoop);
}

/* ── Game loop ──────────────────────────────────── */
function gameLoop(now) {
  if (!state.started) return;
  const deltaMs = Math.min(33, now - state.lastTime || 16.67);
  state.lastTime  = now;
  state.elapsedMs = now - state.startTime;
  updateControls(deltaMs);
  Engine.update(state.engine, deltaMs);
  updateGameState(deltaMs / 1000);
  render();
  if (!state.gameOver) state.rafId = requestAnimationFrame(gameLoop);
}

/* ── Input / drive controls ──────────────────────────
   Mirrors the reference implementation pattern:
   linear angular-velocity increment per frame, capped at max,
   all values scaled by (deltaMs/16.67) for frame-rate independence.
─────────────────────────────────────────────────── */
function updateControls(deltaMs) {
  if (!state.truck || state.gameOver) return;

  const MAX_SPIN     = 0.80;
  const MAX_SPIN_REV = 0.45;
  const scale        = deltaMs / 16.67;                        // 1.0 at 60fps, 2.0 at 30fps
  const ACCEL        = 0.006  * scale;                         // ~2.2 s to full speed at 60fps
  const ACCEL_REV    = 0.004  * scale;
  const decayBrake   = Math.pow(0.72, scale);                  // frame-rate-independent decay
  const decayCoast   = Math.pow(0.990, scale);

  const rAV = state.truck.rearWheel.angularVelocity;
  const fAV = state.truck.frontWheel.angularVelocity;
  const spd = Math.abs(state.truck.body.velocity.x);

  // ── BRAKE ──────────────────────────────────────────────────
  if (state.input.brake && !state.input.accelerate) {
    const hardBrake = spd > WORLD.skidSpeedThreshold;
    const decay     = hardBrake ? Math.pow(0.10, scale) : decayBrake;
    Body.setAngularVelocity(state.truck.rearWheel,  rAV * decay);
    Body.setAngularVelocity(state.truck.frontWheel, fAV * decay);
    if (hardBrake) {
      state.truck.rearWheel.friction  = 0.15;
      state.truck.frontWheel.friction = 0.15;
    } else {
      state.truck.rearWheel.friction  = 0.9;
      state.truck.frontWheel.friction = 0.9;
    }
    state.isSkidding = hardBrake;
    return;
  }

  // Restore grip
  state.truck.rearWheel.friction  = 0.9;
  state.truck.frontWheel.friction = 0.9;
  state.isSkidding = false;

  // ── REVERSE ────────────────────────────────────────────────
  if (state.input.reverse && !state.input.accelerate) {
    Body.setAngularVelocity(state.truck.rearWheel,  Math.max(rAV - ACCEL_REV, -MAX_SPIN_REV));
    Body.setAngularVelocity(state.truck.frontWheel, Math.max(fAV - ACCEL_REV, -MAX_SPIN_REV));
    return;
  }

  // ── ACCELERATE ─────────────────────────────────────────────
  if (state.input.accelerate) {
    Body.setAngularVelocity(state.truck.rearWheel,  Math.min(rAV + ACCEL, MAX_SPIN));
    Body.setAngularVelocity(state.truck.frontWheel, Math.min(fAV + ACCEL, MAX_SPIN));
    return;
  }

  // ── COAST ──────────────────────────────────────────────────
  Body.setAngularVelocity(state.truck.rearWheel,  rAV * decayCoast);
  Body.setAngularVelocity(state.truck.frontWheel, fAV * decayCoast);
}

function updateGameState(dt) {
  state.startGraceTimer = Math.max(0, state.startGraceTimer - dt);
  updateCamera(dt);
  updateTruckGravity();
  updateTruckSplats(dt);
  updateMarines(dt);
  updateWaitMarine(dt);
  updateDust(dt);
  if (state.input.flamethrower && !state.gameOver) emitFlames();
  updateFlames(dt);
  updateIdleRumble(dt);
  updateHud();
  checkFailure(dt);
  checkWin(dt);
}

/* ── HUD update ─────────────────────────────────── */
function updateHud() {
  const n = state.marineCount;
  hudMarines.textContent = n + ' / ' + WORLD.totalMarines;
  hudMarines.className   = 'hud-marines ' + (n >= WORLD.totalMarines ? 'good' : n > 0 ? 'warn' : 'bad');

  const tiltDeg = Math.abs(state.truck.body.angle) * (180 / Math.PI);
  const skidMsg = state.isSkidding ? ' — SKIDDING' : '';
  hudWarning.textContent = tiltDeg > 55 ? '⚠ DANGEROUS TILT' + skidMsg : (state.isSkidding ? '⚠ SKIDDING' : '');
}

/* ── Win / fail detection ───────────────────────────
   Fail: flipped >90° too long, OR marine count below minimum.
   Win:  inside finish zone, slow, upright.
─────────────────────────────────────────────────── */
function checkFailure(dt) {
  if (state.gameOver) return;

  // Drove off either end of the map
  const tx = state.truck.body.position.x;
  if (tx < -200)
    { endGame(false, 'The 7-ton reversed off the start of the route. Convoy aborted.'); return; }
  if (tx > WORLD.levelLength + 200)
    { endGame(false, 'The 7-ton drove off the end of the route. Convoy aborted.'); return; }

  if (Math.abs(state.truck.body.angle) > Math.PI / 2) state.flippedTimer += dt;
  else state.flippedTimer = Math.max(0, state.flippedTimer - dt * 1.5);
  if (state.flippedTimer > 0.9) {
    endGame(false, 'The 7-ton flipped past recoverable angle. Convoy aborted.');
    return;
  }
}

function checkWin(dt) {
  if (state.gameOver) return;
  const zx1 = WORLD.finish.x, zx2 = WORLD.finish.x + WORLD.finish.width;
  const rw  = state.truck.rearWheel.position.x;
  const fw  = state.truck.frontWheel.position.x;
  const inZone = rw > zx1 && rw < zx2 && fw > zx1 && fw < zx2;
  if (inZone) state.parkedTimer += dt;
  else        state.parkedTimer = Math.max(0, state.parkedTimer - dt * 2);
  if (state.parkedTimer >= PARK_HOLD)
    endGame(true, '7-ton is parked at the gas chamber lot. Marines delivered.');
}

function endGame(win, message) {
  state.gameOver = true;
  const seconds      = Math.max(1, Math.round(state.elapsedMs / 1000));
  const marinePts    = state.marineCount * 900;
  const parkBonus    = win ? 1800 : 0;
  const lostCount    = WORLD.totalMarines - state.marineCount;
  const lostPenalty  = lostCount * 350;
  const pukeCount    = state.totalPukes || 0;
  const pukePenalty  = pukeCount * 60;
  const timePenalty  = seconds * 12;
  const score        = Math.max(0, marinePts + parkBonus - lostPenalty - pukePenalty - timePenalty);

  resultKicker.textContent = 'After Action Report';
  resultTitle.textContent  = win ? 'Mission Complete' : 'Mission Failed';
  resultText.textContent   = message;
  resultScreen.classList.remove('hidden');

  const _gcMode = new URLSearchParams(window.location.search).get('mode') || 'practice';
  localStorage.setItem('gc_result', JSON.stringify({
    win, marineCount: state.marineCount, totalMarines: WORLD.totalMarines, score, mode: _gcMode
  }));

  // Build breakdown rows
  const rows = [
    { label: 'Marines delivered', detail: state.marineCount + ' / ' + WORLD.totalMarines + '  ×  900',                    value: marinePts,    cls: 'positive' },
    { label: 'Parking bonus',     detail: win ? 'Zone held 3s' : 'Not parked',                                            value: parkBonus,    cls: win ? 'positive' : 'negative' },
    { label: 'Marines lost',      detail: lostCount + ' KIA  ×  350',                                                     value: -lostPenalty, cls: lostCount > 0 ? 'negative' : 'positive' },
    { label: 'Puke incidents',    detail: pukeCount + ' session' + (pukeCount !== 1 ? 's' : '') + '  ×  60',              value: -pukePenalty, cls: pukeCount > 0 ? 'negative' : 'positive' },
    { label: 'Time penalty',      detail: seconds + 's  ×  12',                                                            value: -timePenalty, cls: 'negative' },
    { label: 'Final score',       detail: '',                                                                               value: score,        cls: 'total' },
  ];

  resultSummary.innerHTML = '';
  rows.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'aar-row ' + r.cls;
    row.innerHTML =
      '<span class="aar-row-label">' + r.label + (r.detail ? ' <span style="opacity:0.5;font-size:0.7em">— ' + r.detail + '</span>' : '') + '</span>' +
      '<span class="aar-row-val" id="aar-val-' + i + '">—</span>';
    resultSummary.appendChild(row);
  });

  // Sequential animated reveal
  rows.forEach((r, i) => {
    const delay = 350 + i * 520;
    setTimeout(() => {
      const rowEl = resultSummary.children[i];
      rowEl.classList.add('visible');
      const valEl = document.getElementById('aar-val-' + i);
      const target = r.value;
      const duration = i === rows.length - 1 ? 900 : 480;
      const start = performance.now();
      valEl.classList.add('aar-counting');
      function tick(now) {
        const t   = Math.min(1, (now - start) / duration);
        const cur = Math.round(target * (i === rows.length - 1
          ? 1 - Math.pow(1 - t, 3)   // ease-out cubic for final score
          : t));
        const sign = cur >= 0 ? '+' : '';
        valEl.textContent = (i === rows.length - 1 ? '' : sign) + cur.toLocaleString();
        if (t < 1) { requestAnimationFrame(tick); }
        else {
          valEl.textContent = (i === rows.length - 1 ? '' : (target >= 0 ? '+' : '')) + target.toLocaleString();
          valEl.classList.remove('aar-counting');
        }
      }
      requestAnimationFrame(tick);
    }, delay);
  });
}

/* ── Input listeners ────────────────────────────── */
function pointerDrive(side) {
  let active = false;
  state.input.pointers.forEach(s => { if (s === side) active = true; });
  return active;
}

function updateTouchFromPointers() {
  state.input.accelerate = state.input.keyboardAccelerate || state.input.btnAccelerate || pointerDrive('right');
  state.input.brake      = state.input.keyboardBrake      || state.input.btnBrake      || pointerDrive('left');
  state.input.reverse    = state.input.keyboardReverse    || state.input.btnReverse;
}

function keyHandler(e, pressed) {
  if (e.key === 'ArrowRight') { state.input.keyboardAccelerate = pressed; updateTouchFromPointers(); e.preventDefault(); }
  else if (e.key === 'ArrowDown') { state.input.keyboardBrake   = pressed; updateTouchFromPointers(); e.preventDefault(); }
  else if (e.key === 'ArrowLeft') { state.input.keyboardReverse = pressed; updateTouchFromPointers(); e.preventDefault(); }
  else if (e.key === 'ArrowUp')             { state.input.flamethrower = pressed; e.preventDefault(); }
  else if (e.key === 'r' || e.key === 'R') { if (pressed && state.started) initGame(); }
  else if (e.key === ' ') { if (pressed) state.headlights = !state.headlights; e.preventDefault(); }
}

function pointerSide(clientX) { return clientX > window.innerWidth * 0.5 ? 'right' : 'left'; }

document.addEventListener('keydown', e => keyHandler(e, true),  { passive: false });
document.addEventListener('keyup',   e => keyHandler(e, false), { passive: false });

window.addEventListener('pointerdown', e => {
  if (e.target.closest('button, [data-ctrl]')) return;
  state.input.pointers.set(e.pointerId, pointerSide(e.clientX));
  updateTouchFromPointers(); e.preventDefault();
}, { passive: false });

window.addEventListener('pointermove', e => {
  if (!state.input.pointers.has(e.pointerId)) return;
  state.input.pointers.set(e.pointerId, pointerSide(e.clientX));
  updateTouchFromPointers(); e.preventDefault();
}, { passive: false });

function clearPointer(e) { if (state.input.pointers.delete(e.pointerId)) updateTouchFromPointers(); }
window.addEventListener('pointerup',     clearPointer, { passive: true });
window.addEventListener('pointercancel', clearPointer, { passive: true });

/* ── Mobile control buttons ─────────────────────── */
[
  { id: 'ctrl-reverse', flag: 'btnReverse'    },
  { id: 'ctrl-brake',   flag: 'btnBrake'      },
  { id: 'ctrl-accel',   flag: 'btnAccelerate' },
].forEach(({ id, flag }) => {
  const el = document.getElementById(id);
  function press(e)   { e.preventDefault(); state.input[flag] = true;  el.classList.add('active');    updateTouchFromPointers(); }
  function release(e) {                      state.input[flag] = false; el.classList.remove('active'); updateTouchFromPointers(); }
  el.addEventListener('pointerdown',   press,   { passive: false });
  el.addEventListener('pointerup',     release, { passive: true });
  el.addEventListener('pointercancel', release, { passive: true });
  el.addEventListener('pointerleave',  release, { passive: true });
});

document.getElementById('start-button').addEventListener('click', initGame);
document.getElementById('restart-button').addEventListener('click', initGame);
document.getElementById('hud-restart-button').addEventListener('click', initGame);
document.getElementById('menu-button').addEventListener('click', () => {
  window.location.href = 'index.html';
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
render();
