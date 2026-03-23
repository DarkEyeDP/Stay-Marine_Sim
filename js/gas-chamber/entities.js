/* ── Speech phrase arrays ───────────────────────── */
const _SPEECH_AIR = [
  "AAAAAHHH!!",  "SEMPER FLYYYY",  "WEEEEEEE",
  "I CAN FLY!!",  "WORTH IT",  "TELL MY FAMILY",
  "THIS WASN'T IN THE CONTRACT",  "FREEDOM!!",
  "OOOORAH!!",  "THE CORPS IS CRUEL",  "BYE!!",
  "I REGRET EVERYTHING",  "YEET",  "HELP",
];
const _SPEECH_GHOST = [
  "i'm free...",  "tell my family...",  "still beats army...",
  "worth it...",  "oorah...",  "no more PT...",
  "i can see everything...",  "carry on marines...",
  "i'm at peace now...",  "i died doing what i hated...",
  "see you at chow...",  "give me my boot bands back...",
];
const _SPEECH_WAIT = [
  "where is everyone...",  "any day now...",
  "i've been here for hours",  "my feet hurt",
  "did they forget about me?",  "still waiting...",
  "sgt said 0800...",  "it is now 1400",
  "hurry up and wait",  "classic",
  "i should've reenlisted",  "this is fine",
  "getting old out here",  "hello?",
  "someone please",  "i brought snacks for nothing",
];
const _SPEECH_ARRIVAL_FULL  = ["all present! let's go!", "finally, all six!",  "that's what i'm talking about"];
const _SPEECH_ARRIVAL_MOST  = ["where's the rest?",  "i count five...",  "who'd we lose?",  "almost full strength"];
const _SPEECH_ARRIVAL_SOME  = ["only half made it?!",  "we lost half the squad",  "sergeant is gonna hear about this"];
const _SPEECH_ARRIVAL_FEW   = ["there's barely anyone here",  "where is everybody??",  "this is not good",  "oh no..."];
const _SPEECH_ARRIVAL_NONE  = ["...is anyone in there?",  "the truck arrived alone",  "they sent an empty truck??",  "WHAT HAPPENED"];
const _SPEECH_IDLE = [
  "ARE WE THERE YET",  "CHOW TIME?",  "I NEED A NAP",
  "ANYONE GOT DIP?",  "I COULD EAT",  "HURRY UP AND WAIT",
  "3 MORE YEARS...",  "WHEN DO I EAS?",  "I HATE MONDAYS",
  "CALL MY WIFE",  "MY FEET HURT",  "IS THAT A TACO BELL?",
  "OORAH I GUESS",  "WHERE'S THE GUNNY?",  "NEED COFFEE",
  "THIS SUCKS",  "WHAT TIME IS IT",  "GOOD MORNING VIETNAM",
  "I'M SO BORED",  "SEMPER FI I GUESS",  "I'M COLD",
  "BOOT",  "SQUAD GOALS",  "I MISS WIFI",
  "MY RECRUITER LIED",  "STILL BETTER THAN ARMY",
];
const _SPEECH_JOLT = [
  "WHAT THE—",  "MY BACK!!",  "HOLD ON!",  "WHO'S DRIVING?!",
  "OORAH??",  "NOT AGAIN",  "I HATE THIS",  "UNFAIR!!",
  "WHERE'S THE ROAD?!",  "I JOINED FOR COLLEGE",
  "MY RECRUITER LIED",  "SEMPER FI THIS!",
  "WHY GOD WHY",  "I MISS MY MOM",  "SAVE ME",
  "IS THIS LEGAL?!",  "MY COVER'S GONE",
  "SOMEONE HELP",  "THIS IS FINE",  "KILL ME",
];
const _SPEECH_PUKE = [
  "UGH...",  "OH NO",  "...BLEH",
  "I REGRET CHOW",  "PRAY FOR ME",
  "NOT ON MY BOOTS",  "CORPSMAN UP",
];

/* ── Waiting marine position ────────────────────── */
const WAIT_MARINE_X = WORLD.finish.x - 30;
const WAIT_MARINE_Y = WORLD.finish.y - 14;

/* ── Camera behavior ────────────────────────────────
   Trails the truck with a forward look-ahead. Vertical smoothing absorbs suspension bounce.
─────────────────────────────────────────────────── */
function updateCamera(dt) {
  const pos     = state.truck.body.position;
  const vw = window.innerWidth / ZOOM, vh = window.innerHeight / ZOOM;
  const targetX = Math.max(0, Math.min(pos.x - vw * 0.28, WORLD.levelLength - vw));
  const targetY = pos.y - vh * 0.54;
  state.camera.x += (targetX - state.camera.x) * Math.min(1, dt * 3.6);
  state.camera.y += (targetY - state.camera.y) * Math.min(1, dt * 2.8);
}

function localPoint(body, point) {
  return Vector.rotate(Vector.sub(point, body.position), -body.angle);
}

function isMarineInTruck(marineBody) {
  const local = localPoint(state.truck.body, marineBody.position);
  return local.x > -96 && local.x < 20 && local.y > -94 && local.y < 2;
}

/* ── Passenger tracking ─────────────────────────────
   Marine is "lost" if outside the bed bounds for >0.65 s.
─────────────────────────────────────────────────── */
function updateMarines(dt) {
  let remaining = 0;
  state.marines.forEach(marine => {
    if (marine.lost) {
      marine.ghostTime = (marine.ghostTime || 0) + dt;
      // Ghost keeps chattering on its own timer
      marine.idleTimer -= dt;
      if (marine.idleTimer <= 0) {
        marine.idleTimer = 5 + Math.random() * 8;
        marine.speech = {
          text:  _SPEECH_GHOST[Math.floor(Math.random() * _SPEECH_GHOST.length)],
          timer: 3.5 + Math.random() * 2.0,
          ghost: true
        };
      }
      if (marine.speech) {
        marine.speech.timer -= dt;
        if (marine.speech.timer <= 0) marine.speech = null;
      }
      return;
    }
    const inside = isMarineInTruck(marine.body);
    const local  = localPoint(state.truck.body, marine.body.position);
    const definitelyOut = !inside && (
      marine.body.position.y > state.truck.body.position.y + 100 ||
      local.x < -128 || local.x > 56 || local.y < -136
    );
    if (state.startGraceTimer > 0)  marine.outTimer = 0;
    else if (definitelyOut)         marine.outTimer += dt;
    else                            marine.outTimer = Math.max(0, marine.outTimer - dt * 2);

    // Airborne speech — fires once when they first leave the truck
    if (definitelyOut && !marine.airborne) {
      marine.airborne = true;
      marine.speech = {
        text:  _SPEECH_AIR[Math.floor(Math.random() * _SPEECH_AIR.length)],
        timer: 2.5 + Math.random() * 1.0
      };
    } else if (!definitelyOut) {
      marine.airborne = false;
    }

    if (marine.outTimer > 0.65) { marine.lost = true; return; }

    // Sickness from jostling
    const jolt = Math.hypot(
      marine.body.velocity.x - marine.prevVel.x,
      marine.body.velocity.y - marine.prevVel.y
    );
    marine.prevVel.x = marine.body.velocity.x;
    marine.prevVel.y = marine.body.velocity.y;
    marine.sickness = Math.max(0, Math.min(100, marine.sickness + jolt * 1.0 - dt * 9));
    marine.pukeCooldown = Math.max(0, marine.pukeCooldown - dt);

    // Start a puke session (limited duration, then cooldown)
    if (marine.sickness > 90 && !marine.puking && marine.pukeCooldown <= 0) {
      state.totalPukes = (state.totalPukes || 0) + 1;
      marine.puking    = true;
      marine.pukeTimer = 1.8 + Math.random() * 1.4;  // puke for 1.8–3.2s
      // Puke speech
      if (!marine.speech || marine.speech.timer < 0.4) {
        marine.speech = {
          text:  _SPEECH_PUKE[Math.floor(Math.random() * _SPEECH_PUKE.length)],
          timer: 2.2 + Math.random() * 0.8
        };
      }
    }
    if (marine.puking) {
      marine.pukeTimer -= dt;
      if (marine.pukeTimer <= 0) {
        marine.puking       = false;
        marine.sickness     = 0;                       // reset — back to normal, can get sick again
        marine.pukeCooldown = 10 + Math.random() * 6; // 10–16s before next session
      }
    }

    // Idle random chatter
    marine.idleTimer -= dt;
    if (marine.idleTimer <= 0) {
      marine.idleTimer = 9 + Math.random() * 14;
      if (!marine.speech || marine.speech.timer < 0.3) {
        marine.speech = {
          text:  _SPEECH_IDLE[Math.floor(Math.random() * _SPEECH_IDLE.length)],
          timer: 2.2 + Math.random() * 1.0
        };
      }
    }

    // Speech from big jolts
    if (jolt > 2.8 && (!marine.speech || marine.speech.timer < 0.3) && Math.random() < 0.012) {
      marine.speech = {
        text:  _SPEECH_JOLT[Math.floor(Math.random() * _SPEECH_JOLT.length)],
        timer: 2.0 + Math.random() * 1.0
      };
    }
    // Decay existing speech bubble
    if (marine.speech) {
      marine.speech.timer -= dt;
      if (marine.speech.timer <= 0) marine.speech = null;
    }

    remaining++;
  });
  state.marineCount = remaining;
}

// Waiting marine at the gas chamber lot
function updateWaitMarine(dt) {
  const wm  = state.waitMarine;
  const tx  = state.truck ? state.truck.body.position.x : 0;
  const inZone = tx > WORLD.finish.x - 80;

  // Decay speech
  if (wm.speech) {
    wm.speech.timer -= dt;
    if (wm.speech.timer <= 0) wm.speech = null;
  }

  // React once when the truck enters the finish area
  if (inZone && !wm.reacted) {
    wm.reacted = true;
    const n = state.marineCount;
    const pool = n >= WORLD.totalMarines ? _SPEECH_ARRIVAL_FULL
               : n >= WORLD.totalMarines - 1 ? _SPEECH_ARRIVAL_MOST
               : n >= Math.ceil(WORLD.totalMarines / 2) ? _SPEECH_ARRIVAL_SOME
               : n > 0 ? _SPEECH_ARRIVAL_FEW
               : _SPEECH_ARRIVAL_NONE;
    wm.speech = { text: pool[Math.floor(Math.random() * pool.length)], timer: 5.0 };
    wm.idleTimer = 6;
    return;
  }

  // Idle chatter while waiting
  if (!inZone) {
    wm.idleTimer -= dt;
    if (wm.idleTimer <= 0) {
      wm.idleTimer = 5 + Math.random() * 7;
      if (!wm.speech || wm.speech.timer < 0.4)
        wm.speech = { text: _SPEECH_WAIT[Math.floor(Math.random() * _SPEECH_WAIT.length)], timer: 3.0 + Math.random() * 1.5 };
    }
  }
}

// Truck puke splats — drip downward (in local body space) and fade
function updateTruckSplats(dt) {
  state.truckSplats = state.truckSplats.filter(s => {
    s.drip = Math.min(s.drip + s.dripSpd * dt * 60, s.maxDrip);
    s.alpha -= dt * 0.04;
    return s.alpha > 0;
  });
}

// Extra gravity on the truck only — marines unaffected (global gravity unchanged)
function updateTruckGravity() {
  if (!state.truck) return;
  const extraG = 0.00062;  // additional downward acceleration (tunable)
  [state.truck.body, state.truck.frontWheel, state.truck.rearWheel].forEach(b => {
    Body.applyForce(b, b.position, { x: 0, y: b.mass * extraG });
  });
}

// Slight engine vibration when sitting still — random micro-impulses on the chassis
function updateIdleRumble(dt) {
  if (!state.truck || state.gameOver) return;
  const speed = Vector.magnitude(state.truck.body.velocity);
  if (speed > 1.2) return;  // only perceptible when nearly stopped
  // Fire a tiny random jolt every ~8 frames on average
  if (Math.random() < dt * 7.5) {
    const jx = (Math.random() - 0.5) * 0.000018;
    const jy = (Math.random() - 0.5) * 0.000010;
    Body.applyForce(state.truck.body, state.truck.body.position, { x: jx, y: jy });
  }
}

/* ── Dust + skid particles ──────────────────────────
   Normal drive → sandy tan dust. Hard braking → dark skid smoke.
─────────────────────────────────────────────────── */
function updateDust(dt) {
  const driving  = state.input.accelerate;
  const braking  = state.input.brake && !state.input.accelerate;
  const avgSpd   = (Math.abs(state.truck.frontWheel.angularVelocity) + Math.abs(state.truck.rearWheel.angularVelocity)) * 0.5;

  if (driving && avgSpd > 0.15) {
    // Acceleration dust from rear wheel
    const anchor = state.truck.rearWheel.position;
    state.dust.push({
      x: anchor.x + (Math.random() - 0.5) * 12, y: anchor.y + 12,
      vx: -(0.4 + Math.random() * 0.8), vy: -0.15 - Math.random() * 0.3,
      life: 0.65 + Math.random() * 0.4, size: 5 + Math.random() * 6,
      type: 'dust'
    });
  }

  if (state.isSkidding) {
    // Dark smoke from both wheels during hard brake
    [state.truck.rearWheel.position, state.truck.frontWheel.position].forEach(anchor => {
      if (Math.random() < 0.7) {
        state.dust.push({
          x: anchor.x + (Math.random() - 0.5) * 10, y: anchor.y + 8,
          vx: (Math.random() - 0.5) * 0.5, vy: -0.3 - Math.random() * 0.5,
          life: 0.9 + Math.random() * 0.5, size: 9 + Math.random() * 9,
          type: 'skid'
        });
      }
    });
  }

  // ── PUKE PARTICLES from sick marines ─────────────────────────
  state.marines.forEach(marine => {
    if (!marine.puking || marine.lost) return;
    if (Math.random() > 0.58) return;
    const cos = Math.cos(marine.body.angle), sin = Math.sin(marine.body.angle);
    const hx = marine.body.position.x - sin * 10;
    const hy = marine.body.position.y - cos * 10 - 4;
    const spd = 0.9 + Math.random() * 1.8;
    // 55% forward, 45% backward
    const dir = Math.random() < 0.55 ? 1 : -1;
    state.dust.push({
      x: hx + (Math.random() - 0.5) * 4,
      y: hy,
      vx: dir * spd,
      vy: -0.6 - Math.random() * 0.7,  // arcs up then drops
      life: 0.9 + Math.random() * 0.5,
      size: 3 + Math.random() * 4,
      type: 'puke',
      col: Math.random() > 0.45 ? '#7a9a18' : '#a8c020'
    });

    // Splat a blob on the truck body (local cargo bed coords)
    if (state.truck && Math.random() < 0.07 && state.truckSplats.length < 14) {
      state.truckSplats.push({
        lx:      -105 + Math.random() * 110,
        ly:      -11  + Math.random() * 18,
        size:    3 + Math.random() * 5,
        alpha:   0.75 + Math.random() * 0.2,
        drip:    0,
        dripSpd: 2.5 + Math.random() * 2.5,
        maxDrip: 10  + Math.random() * 14,
        dripOffX: (Math.random() - 0.5) * 3  // fixed horizontal wobble for drip
      });
    }
  });

  // ── IDLE EXHAUST — thin wisps even at rest ───────────────────
  if (!state.input.accelerate && !state.input.reverse && Math.random() < 0.18) {
    const body = state.truck.body;
    const cos  = Math.cos(body.angle), sin = Math.sin(body.angle);
    const pX = 10, pY = -96;
    const wx = body.position.x + pX * cos - pY * sin;
    const wy = body.position.y + pX * sin + pY * cos;
    state.dust.push({
      x: wx + (Math.random() - 0.5) * 3,
      y: wy + (Math.random() - 0.5) * 2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -0.22 - Math.random() * 0.14,
      life: 0.6 + Math.random() * 0.4,
      size: 2.5 + Math.random() * 2.5,
      type: 'exhaust',
      dark: false
    });
  }

  // ── DRIVING EXHAUST SMOKE from pipe tip ──────────────────────
  if (state.input.accelerate || state.input.reverse) {
    const body   = state.truck.body;
    const cos    = Math.cos(body.angle), sin = Math.sin(body.angle);
    // Pipe tip in local body space — top of stack behind the cab
    const pX = 10, pY = -96;
    const wx = body.position.x + pX * cos - pY * sin;
    const wy = body.position.y + pX * sin + pY * cos;
    // Heavier black smoke when under load (wheels still winding up)
    const underLoad = avgSpd < 0.35;
    const emit      = underLoad ? Math.random() < 0.85 : Math.random() < 0.5;
    if (emit) {
      // Drift opposite to truck's movement so smoke blows behind
      const truckVx = body.velocity.x;
      state.dust.push({
        x: wx + (Math.random() - 0.5) * 4,
        y: wy + (Math.random() - 0.5) * 3,
        vx: -(truckVx * 0.14) + (Math.random() - 0.5) * 0.12,
        vy: -0.45 - Math.random() * 0.25,            // rises
        life: 0.9 + Math.random() * 0.5,
        size: underLoad ? 6 + Math.random() * 5 : 4 + Math.random() * 4,
        type: 'exhaust',
        dark: underLoad
      });
    }
  }

  state.dust = state.dust.filter(p => {
    p.life -= dt; p.x += p.vx * 60 * dt; p.y += p.vy * 60 * dt;
    if (p.type === 'exhaust') {
      p.vy  *= 0.998;                                 // slight drag on rise
      p.size *= 1.004;                                // very subtle billow
    } else if (p.type === 'puke') {
      p.vy += 0.055;   // falls fast — chunky arc
      p.size *= 0.972;
      // Land on terrain → become a static ground splat
      const ground = terrainHeightAt(p.x);
      if (p.y >= ground - 4) {
        p.type = 'pukeSplat';
        p.x    = p.x; p.y = ground - 2;
        p.vx   = 0;   p.vy = 0;
        p.life = 1.4 + Math.random() * 0.6;  // life in seconds (net drain ÷8 → ~11-14s on ground)
        p.size = (p.size || 4) * 1.6;     // splat wider on impact
      }
    } else if (p.type === 'pukeSplat') {
      // Static — partially undo the top-of-filter drain so net rate is dt/8 (~11-14s total)
      p.life += dt * (1 - 1 / 8);
    } else if (p.type === 'skid') {
      p.vy += 0.004; p.size *= 0.980;
    } else {
      p.vy += 0.012; p.size *= 0.986;
    }
    return p.life > 0;
  });
}

/* ── Flamethrower ───────────────────────────────── */
function emitFlames() {
  if (!state.truck || !state.truck.body) return;
  const angle = state.truck.body.angle;
  const pos   = state.truck.body.position;
  const cos   = Math.cos(angle), sin = Math.sin(angle);

  // Winch position in local truck space
  const lx = 132, ly = -12;
  const wx = pos.x + lx * cos - ly * sin;
  const wy = pos.y + lx * sin + ly * cos;

  // Emit 4-6 particles per frame
  const count = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const spread  = (Math.random() - 0.5) * 0.55;
    const speed   = 3.5 + Math.random() * 4;
    const fa      = angle + spread;
    const phase   = Math.random(); // 0=core, 1=tip
    state.flames.push({
      x:     wx + (Math.random() - 0.5) * 4,
      y:     wy + (Math.random() - 0.5) * 4,
      vx:    Math.cos(fa) * speed,
      vy:    Math.sin(fa) * speed - 0.4,
      life:  1.0,
      decay: 1.8 + Math.random() * 1.4,
      size:  5 + Math.random() * 7,
      phase,
    });
  }
}

function updateFlames(dt) {
  state.flames = state.flames.filter(p => {
    p.life -= p.decay * dt;
    p.x   += p.vx;
    p.y   += p.vy;
    p.vx  *= 0.93;
    p.vy  *= 0.93;
    p.vy  -= 0.06;          // slight upward drift as heat rises
    p.size *= 0.955;
    return p.life > 0;
  });
}
