/* ── World constants ────────────────────────────── */
const WORLD = {
  gravityY:         1.22,
  terrainThickness: 44,
  startX:           260,
  startY:           470,
  levelLength:      5200,
  finish: { x: 4370, y: 398, width: 260, height: 34 },
  minMarines:       4,
  totalMarines:     6,
  skidSpeedThreshold: 2.8   // px/frame - above this, braking causes skid
};

/* ── Canvas resize ──────────────────────────────── */
function resizeCanvas() {
  const ratio   = window.devicePixelRatio || 1;
  canvas.width  = Math.floor(window.innerWidth  * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

/* ── Terrain generation ─────────────────────────────
   Catmull-Rom spline → static angled rectangles.
   Level design: flat start → washboard bumps → big hill climb →
   ridge step-up → high plateau → deep IED crater → bridge approach.
─────────────────────────────────────────────────── */
function addTerrainSegment(x1, y1, x2, y2, renderType = 'terrain') {
  const length  = Vector.magnitude({ x: x2 - x1, y: y2 - y1 });
  const angle   = Math.atan2(y2 - y1, x2 - x1);
  const normal  = { x: -(y2 - y1) / length, y: (x2 - x1) / length };
  const centerX = (x1 + x2) / 2 + normal.x * (WORLD.terrainThickness * 0.5);
  const centerY = (y1 + y2) / 2 + normal.y * (WORLD.terrainThickness * 0.5);
  const body    = Bodies.rectangle(centerX, centerY, length, WORLD.terrainThickness, {
    isStatic: true, friction: 0.92, restitution: 0.04, angle, label: 'terrain'
  });
  body.renderType = renderType;
  state.terrainBodies.push(body);
  World.add(state.world, body);
  return body;
}

function sampleSpline(controlPoints, samplesPerSegment = 7) {
  const sampled = [];
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const p0 = controlPoints[Math.max(0, i - 1)];
    const p1 = controlPoints[i];
    const p2 = controlPoints[i + 1];
    const p3 = controlPoints[Math.min(controlPoints.length - 1, i + 2)];
    for (let step = 0; step < samplesPerSegment; step++) {
      const t = step / samplesPerSegment, t2 = t * t, t3 = t2 * t;
      const x = 0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3);
      const y = 0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3);
      if (!sampled.length || x > sampled[sampled.length - 1][0]) sampled.push([x, y]);
    }
  }
  sampled.push(controlPoints[controlPoints.length - 1]);
  return sampled;
}

function addTerrainProfile(points, renderType = 'terrain') {
  for (let i = 0; i < points.length - 1; i++)
    addTerrainSegment(points[i][0], points[i][1], points[i+1][0], points[i+1][1], renderType);
  state.terrainSurfaces.push({ points, renderType });
}

function terrainHeightAt(x) {
  for (const surface of state.terrainSurfaces) {
    for (let i = 0; i < surface.points.length - 1; i++) {
      const p1 = surface.points[i], p2 = surface.points[i + 1];
      const minX = Math.min(p1[0], p2[0]), maxX = Math.max(p1[0], p2[0]);
      if (x >= minX && x <= maxX) {
        const span = p2[0] - p1[0];
        return p1[1] + (p2[1] - p1[1]) * (span === 0 ? 0 : (x - p1[0]) / span);
      }
    }
  }
  return 560;
}

function getTruckSpawnY(x) { return terrainHeightAt(x) - 56; }

function zeroBodyMotion(body) {
  Body.setVelocity(body, { x: 0, y: 0 });
  Body.setAngularVelocity(body, 0);
}

function settleTruck(truck) {
  for (let i = 0; i < 80; i++) Engine.update(state.engine, 1000 / 60);
  zeroBodyMotion(truck.body);
  zeroBodyMotion(truck.frontWheel);
  zeroBodyMotion(truck.rearWheel);
}

function createTerrain() {
  // SECTION 1: Flat start + washboard bumps (rocks scatter here)
  addTerrainProfile(sampleSpline([
    [0,560],[160,558],[300,548],[420,560],[540,534],
    [640,550],[730,518],[820,536],[900,508]
  ], 8), 'terrain');

  // SECTION 2: First big hill climb with step at crest
  addTerrainProfile(sampleSpline([
    [900,508],[1040,486],[1200,464],[1360,440],
    [1460,424],[1560,408],[1620,426],[1660,446]
  ], 8), 'terrain');

  // SECTION 3: Ridge descent then dramatic step-up onto high plateau
  addTerrainProfile(sampleSpline([
    [1660,446],[1740,468],[1800,450],[1850,406],
    [1900,402],[1980,386],[2060,374],[2160,370]
  ], 8), 'terrain');

  // SECTION 4: High plateau then sharp IED crater dip
  addTerrainProfile(sampleSpline([
    [2160,370],[2240,358],[2320,354],[2400,360],
    [2470,388],[2520,416],[2570,410],[2630,390]
  ], 8), 'terrain');

  // SECTION 5: Climb out of crater to bridge approach
  addTerrainProfile(sampleSpline([
    [2630,390],[2720,368],[2820,352],[2920,350],[2985,350]
  ], 8), 'terrain');

  // Bridge approach ramp (left anchor)
  addTerrainProfile(sampleSpline([
    [2985,350],[2992,350],[3000,352],[3008,355]
  ], 6), 'terrain');

  // Right side of bridge → rocky descent
  addTerrainProfile(sampleSpline([
    [3462,376],[3520,386],[3600,400],
    [3720,416],[3880,400],[4040,404],[4200,406]
  ], 8), 'terrain');

  // Final flat parking lot
  addTerrainProfile([[4200,406],[4800,406]], 'parkingLot');
}

/* ── Obstacle construction ──────────────────────────
   All obstacles are placed AFTER createTerrain() so terrainHeightAt()
   returns accurate values for positioning on the surface.
   Types: rock, log, barrel, boulder, rubble
─────────────────────────────────────────────────── */
function createObstacles() {
  // Helper: y-position at terrain surface, optionally raised
  function surfaceY(x, riseAbove = 0) {
    return terrainHeightAt(x) - riseAbove;
  }

  // ── ROCK CLUSTER (x=540-830) — scattered in the washboard section ──
  const rocks = [
    { x: 558, r: 12 }, { x: 592, r:  8 }, { x: 628, r: 14 },
    { x: 668, r:  9 }, { x: 706, r: 11 }, { x: 748, r:  7 },
    { x: 794, r: 13 }
  ];
  rocks.forEach(rd => {
    const body = Bodies.circle(rd.x, surfaceY(rd.x, rd.r * 0.7), rd.r, {
      isStatic: true, friction: 0.8, restitution: 0.3, label: 'rock'
    });
    state.obstacles.push({ body, type: 'rock', radius: rd.r });
    World.add(state.world, body);
  });

  // ── LOG RAMP (x≈1440) — two logs forming a driveable /\ hump ──
  const rampAngle = 0.26;          // ~15° — steep enough to feel but driveable
  const halfLog   = 48;            // half of 96px log width
  const tipRise   = halfLog * Math.sin(rampAngle); // ~12px — height from center to tip
  const peakRise  = 28;            // how high the peak sits above terrain
  const peakX     = 1440;
  // Both log centers sit tipRise below the peak
  const logCenterY = surfaceY(peakX, peakRise - tipRise);

  const logLeft = Bodies.rectangle(peakX - halfLog, logCenterY, 96, 18, {
    isStatic: true, friction: 0.55, restitution: 0.2,
    angle: -rampAngle, label: 'log'   // left side: ascends toward peak (/)
  });
  const logRight = Bodies.rectangle(peakX + halfLog, logCenterY, 96, 18, {
    isStatic: true, friction: 0.55, restitution: 0.2,
    angle:  rampAngle, label: 'log'   // right side: descends from peak (\)
  });
  state.obstacles.push({ body: logLeft,  type: 'log' });
  state.obstacles.push({ body: logRight, type: 'log' });
  World.add(state.world, logLeft);
  World.add(state.world, logRight);

  // ── CRATER WARNING POSTS (x≈2470, 2570) — flanking the IED crater ──
  // Visual markers only (no collision), drawn in renderObstacles
  state.obstacles.push({ type: 'craterMarker', worldX: 2470, worldY: surfaceY(2470) });
  state.obstacles.push({ type: 'craterMarker', worldX: 2570, worldY: surfaceY(2570) });

  // ── RUBBLE FIELDS ──
  const rubbles = [
    // Foot of log ramp — one chunk right at the base of the left log
    { x: peakX - halfLog - 10, r: 11 },
    // Scattered chunks leading up to the ramp
    { x: 1310, r:  7 }, { x: 1340, r:  5 }, { x: 1370, r:  8 },
    // Post-bridge rubble field (expanded)
    { x: 3620, r:  9 }, { x: 3638, r:  6 }, { x: 3655, r: 12 },
    { x: 3674, r:  7 }, { x: 3692, r: 10 }, { x: 3710, r:  8 },
    { x: 3728, r:  6 }, { x: 3748, r: 11 }, { x: 3768, r:  7 },
    { x: 3788, r:  9 }, { x: 3810, r:  5 },
  ];
  rubbles.forEach(rd => {
    const body = Bodies.circle(rd.x, surfaceY(rd.x, rd.r * 0.6), rd.r, {
      isStatic: true, friction: 0.7, restitution: 0.35, label: 'rubble'
    });
    state.obstacles.push({ body, type: 'rubble', radius: rd.r });
    World.add(state.world, body);
  });
}

/* ── Bridge construction ────────────────────────────
   Chain of dynamic plank bodies, pinned at both ends.
─────────────────────────────────────────────────── */
function createBridge() {
  const start = { x: 3008, y: 355 }, end = { x: 3462, y: 376 };
  const plankCount = 11, plankLength = 42;
  const plankSpacing = (end.x - start.x) / (plankCount - 1);
  const anchors = [
    Bodies.circle(start.x, start.y - 2, 6, { isStatic: true }),
    Bodies.circle(end.x,   end.y   - 2, 6, { isStatic: true })
  ];
  const bridge = Composites.stack(start.x + plankLength * 0.5, start.y, plankCount, 1, 0, 0, (x, y, column) => {
    const t  = column / (plankCount - 1);
    const px = start.x + plankSpacing * column;
    const py = start.y + (end.y - start.y) * t;
    const body = Bodies.rectangle(px, py, plankLength, 14, {
      density: 0.0021, friction: 1.05, restitution: 0.04,
      chamfer: { radius: 3 }, label: 'bridgePlank'
    });
    state.bridgePlanks.push(body);
    return body;
  });
  Composites.chain(bridge, 0.47, 0, -0.47, 0, { stiffness: 0.997, damping: 0.34, length: 0 });
  const startC = Constraint.create({
    bodyA: anchors[0], bodyB: bridge.bodies[0],
    pointB: { x: -plankLength * 0.5, y: 0 }, stiffness: 0.995, damping: 0.22, length: 0
  });
  const endC = Constraint.create({
    bodyA: anchors[1], bodyB: bridge.bodies[bridge.bodies.length - 1],
    pointB: { x: plankLength * 0.5, y: 0 }, stiffness: 0.998, damping: 0.28, length: 0
  });
  state.bridgeConstraints.push(startC, endC);
  World.add(state.world, [anchors[0], anchors[1], bridge, startC, endC]);
}

/* ── Vehicle construction ───────────────────────────
   Compound chassis + two tread wheels on soft suspension constraints.
─────────────────────────────────────────────────── */
function createTruck(x, y) {
  const group      = Body.nextGroup(true);
  const rearAxleX  = -80;
  const frontAxleX = 74;

  const body = Body.create({
    parts: [
      Bodies.rectangle(x,       y,      214, 22),
      Bodies.rectangle(x - 28,  y - 16, 118, 14),
      Bodies.rectangle(x + 62,  y - 24,  74, 50),
      Bodies.rectangle(x + 102, y - 42,  34, 18),
      Bodies.rectangle(x - 98,  y - 38,  10, 46),
      Bodies.rectangle(x + 16,  y - 38,  12, 46)
    ],
    density: 0.0039, friction: 0.42, frictionAir: 0.02,
    restitution: 0.02, collisionFilter: { group }, label: 'truckBody'
  });

  const wheelOpts = {
    friction: 1.04, frictionStatic: 1.22, frictionAir: 0.012,
    restitution: 0.1, density: 0.0028,
    collisionFilter: { group }, label: 'wheel'
  };

  function createTreadWheel(wx, wy) {
    const radius = 30, outerRadius = 30;
    const wheel  = Bodies.circle(wx, wy, radius, wheelOpts, 18);
    wheel.renderRadius      = radius;
    wheel.renderOuterRadius = outerRadius;
    return wheel;
  }

  const rearWheel  = createTreadWheel(x + rearAxleX,  y + 34);
  const frontWheel = createTreadWheel(x + frontAxleX, y + 34);

  // length:0 constraints — one stable equilibrium regardless of timestep (no spring-length oscillation)
  const mk = (ax, ay, wheel) => Constraint.create({
    bodyA: body, pointA: { x: ax, y: ay }, bodyB: wheel,
    length: 0, stiffness: 0.25
  });

  const suspension = [
    mk(rearAxleX  - 10, 14, rearWheel),
    mk(rearAxleX  + 10, 14, rearWheel),
    mk(frontAxleX - 10, 14, frontWheel),
    mk(frontAxleX + 10, 14, frontWheel),
  ];

  World.add(state.world, [body, rearWheel, frontWheel, ...suspension]);
  return { body, rearWheel, frontWheel, suspension, rearAxleX, frontAxleX };
}

/* ── Marine physics bodies ──────────────────────────
   Compound bodies riding in the cargo bed. Can fall out over the sides.
─────────────────────────────────────────────────── */
function createMarine(x, y, tint) {
  const body = Body.create({
    parts: [Bodies.rectangle(x, y + 8, 10, 16), Bodies.circle(x, y - 4, 6)],
    density: 0.0011, friction: 0.44, frictionAir: 0.01, restitution: 0.72, label: 'marine'
  });
  body.renderTint = tint;
  return { body, lost: false, outTimer: 0, sickness: 0, puking: false,
           pukeTimer: 0, pukeCooldown: 0, prevVel: { x: 0, y: 0 },
           speech: null, idleTimer: 4 + Math.random() * 12,
           airborne: false };
}

function createMarines(truckBody) {
  const offsets = [-86, -70, -54, -38, -22, -6];
  const tints   = ['#5a6a3a','#4e5e30','#647248','#4a5a2e','#566636','#527040'];
  const marines = offsets.map((offset, i) => {
    const pos    = Vector.add(truckBody.position, { x: offset, y: -20 + (i % 2 === 0 ? 0 : -3) });
    const marine = createMarine(pos.x, pos.y, tints[i % tints.length]);
    zeroBodyMotion(marine.body);
    return marine;
  });
  World.add(state.world, marines.map(m => m.body));
  return marines;
}

function buildWorld() {
  World.add(state.world, Bodies.rectangle(
    WORLD.levelLength / 2, 1050, WORLD.levelLength + 1200, 220,
    { isStatic: true, label: 'worldFloor' }
  ));
  createTerrain();
  createBridge();
  createObstacles();   // ← after terrain so terrainHeightAt() works
  state.truck   = createTruck(WORLD.startX, getTruckSpawnY(WORLD.startX));
  settleTruck(state.truck);
  state.marines = createMarines(state.truck.body);
  state.camera.x = WORLD.startX - 220;
  state.camera.y = 270;

  // ── Marine-marine collision: extra bounce impulse on hard impacts ──
  Events.on(state.engine, 'collisionStart', function(event) {
    event.pairs.forEach(pair => {
      // Compound body parts report parent via .parent; fall back to self
      const bA = pair.bodyA.parent || pair.bodyA;
      const bB = pair.bodyB.parent || pair.bodyB;
      if (bA.label !== 'marine' || bB.label !== 'marine') return;

      const relVel = Vector.sub(bA.velocity, bB.velocity);
      const speed  = Vector.magnitude(relVel);
      if (speed < 1.8) return;   // only on meaningful impacts

      // Push each marine away from the other along their separation axis
      const sep = Vector.sub(bA.position, bB.position);
      const dir = Vector.magnitude(sep) > 0.001
        ? Vector.normalise(sep)
        : { x: (Math.random() - 0.5), y: -1 };  // fallback if exactly stacked

      const mag = speed * 0.00055;
      Body.applyForce(bA, bA.position, { x:  dir.x * mag, y:  dir.y * mag });
      Body.applyForce(bB, bB.position, { x: -dir.x * mag, y: -dir.y * mag });
    });
  });
}
