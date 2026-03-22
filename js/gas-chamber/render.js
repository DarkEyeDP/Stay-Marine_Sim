/* ── Coordinate transform ───────────────────────── */
function worldToScreen(pt) { return { x: pt.x - state.camera.x, y: pt.y - state.camera.y }; }

/* ── Render pipeline ────────────────────────────── */
function render() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.save();
  ctx.scale(ZOOM, ZOOM);
  renderSky();
  renderParallaxHills();
  renderBackgroundProps();
  renderTerrain();
  renderBridge();
  renderFinishZone();
  renderObstacles();
  renderDust();
  renderMarines();
  renderTruck();
  renderWaitMarine();
  renderParkTimer();
  ctx.restore();
}

function renderSky() {
  const vw = window.innerWidth / ZOOM, vh = window.innerHeight / ZOOM;
  const g = ctx.createLinearGradient(0, 0, 0, vh);
  g.addColorStop(0,    '#1a2420');
  g.addColorStop(0.55, '#263428');
  g.addColorStop(1,    '#3e5030');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, vw, vh);
}

function renderParallaxHills() {
  const vw = window.innerWidth / ZOOM, vh = window.innerHeight / ZOOM;
  [
    { color: '#283820', speed: 0.16, seed: 120 },
    { color: '#324a28', speed: 0.28, seed: 80  }
  ].forEach(layer => {
    ctx.beginPath();
    ctx.moveTo(0, vh);
    for (let x = 0; x <= vw + 100; x += 48) {
      const wx = state.camera.x * layer.speed + x;
      const y  = Math.round(vh - 170
        - Math.sin((wx + layer.seed) * 0.004) * 13
        - Math.cos(wx * 0.007) * 10);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fillStyle = layer.color;
    ctx.fill();
  });
}

// Gas chamber quonset hut + sign + flag
function renderBackgroundProps() {
  const t   = performance.now() / 1000;
  const hut = worldToScreen({ x: 4500, y: 390 });

  ctx.save();
  ctx.translate(hut.x, hut.y);

  // ── Sandbag perimeter ──
  ctx.fillStyle = '#6a5a38';
  ctx.fillRect(-130, 2, 260, 22);
  ctx.fillStyle = '#5a4a2c';
  for (let i = -126; i < 128; i += 20)
    { ctx.beginPath(); ctx.ellipse(i + 9, 10, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); }

  // ── End walls (flat faces of the Quonset) ──
  ctx.fillStyle = '#484840';
  ctx.fillRect(-124, -88, 18, 90);   // left end wall
  ctx.fillRect(106,  -88, 18, 90);   // right end wall

  // ── Quonset arch body — filled semicircle ──
  const archW = 115, archH = 90;
  ctx.fillStyle = '#3e3e36';
  ctx.beginPath();
  ctx.moveTo(-archW, 0);
  ctx.bezierCurveTo(-archW, -archH * 1.35, archW, -archH * 1.35, archW, 0);
  ctx.closePath();
  ctx.fill();

  // ── Corrugated steel ribs (arched lines) ──
  ctx.strokeStyle = '#303028'; ctx.lineWidth = 1.5;
  for (let rx = -archW + 14; rx < archW; rx += 14) {
    const frac = Math.abs(rx) / archW;
    const ribH = archH * Math.sqrt(Math.max(0, 1 - frac * frac)) * 1.35;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.quadraticCurveTo(rx, -ribH * 1.1, rx, -ribH);
    ctx.stroke();
  }
  // Highlight ridge along the top spine
  ctx.strokeStyle = '#505044'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-archW, 0);
  ctx.bezierCurveTo(-archW, -archH * 1.35, archW, -archH * 1.35, archW, 0);
  ctx.stroke();

  // ── Door (recessed arch shape in end wall) ──
  ctx.fillStyle = '#101010';
  ctx.beginPath();
  ctx.rect(-22, -56, 44, 58);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -56, 22, Math.PI, 0);
  ctx.fill();
  // Door frame
  ctx.strokeStyle = '#606050'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-22, 0); ctx.lineTo(-22, -56);
  ctx.arc(0, -56, 22, Math.PI, 0);
  ctx.lineTo(22, 0);
  ctx.stroke();

  // ── Hazard warning stripe above door ──
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#b89018' : '#1e1e10';
    ctx.fillRect(-22 + i * 5.5, -65, 5.5, 6);
  }

  // ── "GAS CHAMBER" stencil on arch ──
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#c8b840';
  ctx.font = 'bold 11px "Share Tech Mono","Courier New",monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('GAS CHAMBER', 0, -48);
  ctx.restore();

  ctx.restore();

  // ── Flag pole (left of hut) ──
  const poleWorldX = 4358;
  const pole = { x: poleWorldX - state.camera.x, y: terrainHeightAt(poleWorldX) - state.camera.y };
  ctx.strokeStyle = '#8a8878'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(pole.x, pole.y); ctx.lineTo(pole.x, pole.y - 110); ctx.stroke();
  // Finial ball
  ctx.fillStyle = '#c4b040';
  ctx.beginPath(); ctx.arc(pole.x, pole.y - 110, 4, 0, Math.PI * 2); ctx.fill();

  // ── Waving flag (sine-wave cloth simulation) ──
  const flagY  = pole.y - 105;
  const flagW  = 48, flagH = 28;
  const segs   = 10;
  const speed  = 1.8, amp = 5;

  // Flag fill — draw as a filled polygon following the wave
  ctx.beginPath();
  ctx.moveTo(pole.x, flagY);
  for (let s = 0; s <= segs; s++) {
    const fx   = pole.x + (s / segs) * flagW;
    const wave = Math.sin(t * speed - s * 0.7) * amp * (s / segs);
    ctx.lineTo(fx, flagY + wave);
  }
  for (let s = segs; s >= 0; s--) {
    const fx   = pole.x + (s / segs) * flagW;
    const wave = Math.sin(t * speed - s * 0.7) * amp * (s / segs);
    ctx.lineTo(fx, flagY + flagH + wave);
  }
  ctx.closePath();
  ctx.fillStyle = '#8a1a1a'; ctx.fill();

  // Eagle-Globe-Anchor stand-in: small USMC stencil on flag
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#f0d060';
  ctx.font = 'bold 7px "Share Tech Mono","Courier New",monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const flagMidX = pole.x + flagW * 0.52;
  const flagMidY = flagY + flagH * 0.5 + Math.sin(t * speed - 3.5 * 0.7) * amp * 0.5;
  ctx.fillText('USMC', flagMidX, flagMidY);
  ctx.restore();

  // Flag top & bottom rope lines
  ctx.strokeStyle = '#706858'; ctx.lineWidth = 1;
  for (let edge = 0; edge <= 1; edge++) {
    ctx.beginPath();
    ctx.moveTo(pole.x, flagY + edge * flagH);
    for (let s = 0; s <= segs; s++) {
      const fx   = pole.x + (s / segs) * flagW;
      const wave = Math.sin(t * speed - s * 0.7) * amp * (s / segs);
      ctx.lineTo(fx, flagY + edge * flagH + wave);
    }
    ctx.stroke();
  }
}

function renderTerrain() {
  state.terrainSurfaces.forEach(surface => {
    const isPark       = surface.renderType === 'parkingLot';
    const fillColor    = isPark ? '#484840' : '#5e4c30';
    const surfaceColor = isPark ? '#6a6a54' : '#8a7248';
    const first        = surface.points[0];
    const last         = surface.points[surface.points.length - 1];

    ctx.beginPath();
    ctx.moveTo(first[0] - state.camera.x, window.innerHeight / ZOOM + 120);
    surface.points.forEach(pt => ctx.lineTo(pt[0] - state.camera.x, pt[1] - state.camera.y));
    ctx.lineTo(last[0] - state.camera.x, window.innerHeight / ZOOM + 120);
    ctx.closePath();
    ctx.fillStyle = fillColor; ctx.fill();

    ctx.beginPath();
    surface.points.forEach((pt, i) => {
      i === 0
        ? ctx.moveTo(pt[0] - state.camera.x, pt[1] - state.camera.y)
        : ctx.lineTo(pt[0] - state.camera.x, pt[1] - state.camera.y);
    });
    ctx.strokeStyle = surfaceColor; ctx.lineWidth = 5; ctx.stroke();

    surface.points.forEach((pt, i) => {
      if (i === surface.points.length - 1) return;
      const x = Math.round(pt[0] - state.camera.x);
      const y = Math.round(pt[1] - state.camera.y);
      ctx.fillStyle = isPark ? 'rgba(180,160,50,0.22)' : '#6e5c3a';
      ctx.fillRect(x, y, 4, 10);
    });
  });
}

function renderBridge() {
  if (!state.bridgePlanks.length) return;
  state.bridgePlanks.forEach(plank => {
    renderBodyPolygon(plank, '#7a5a2e', '#4e3618');
    ctx.beginPath();
    ctx.moveTo(plank.vertices[0].x - state.camera.x, plank.vertices[0].y - state.camera.y);
    ctx.lineTo(plank.vertices[1].x - state.camera.x, plank.vertices[1].y - state.camera.y);
    ctx.strokeStyle = '#9a7040'; ctx.lineWidth = 2; ctx.stroke();
  });
  const left  = worldToScreen({ x: 3008, y: 353 });
  const right = worldToScreen({ x: 3462, y: 374 });
  ctx.strokeStyle = '#3a2e14'; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y); ctx.lineTo(left.x, left.y - 56);
  ctx.moveTo(right.x, right.y); ctx.lineTo(right.x, right.y - 56);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(left.x  - 10, left.y  - 52); ctx.lineTo(left.x  + 10, left.y  - 52);
  ctx.moveTo(right.x - 10, right.y - 52); ctx.lineTo(right.x + 10, right.y - 52);
  ctx.stroke();
  ctx.strokeStyle = '#2e2410'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y - 52);
  ctx.bezierCurveTo(left.x + 100, left.y + 20, right.x - 100, right.y + 20, right.x, right.y - 52);
  ctx.stroke();
}

function renderFinishZone() {
  const x    = WORLD.finish.x - state.camera.x;
  const y    = WORLD.finish.y - state.camera.y;
  const prog = Math.min(1, state.parkedTimer / PARK_HOLD);
  const active = prog > 0;

  // Zone fill — only visible when actively holding
  if (active) {
    ctx.fillStyle = `rgba(74,135,65,${0.10 + prog * 0.22})`;
    ctx.fillRect(x, y - 16, WORLD.finish.width, WORLD.finish.height + 16);
  }

  // Hazard stripes on ground
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i % 2 === 0
      ? active ? `rgba(120,210,90,${0.5 + prog * 0.4})` : 'rgba(200,180,50,0.55)'
      : 'rgba(50,50,40,0.35)';
    ctx.fillRect(x + 14 + i * 32, y + 8, 18, 5);
  }

  // Holding timer text only
  if (active) {
    ctx.fillStyle = `rgba(120,210,90,${0.7 + prog * 0.3})`;
    ctx.font = 'bold 11px "Share Tech Mono","Courier New",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('HOLDING...', x + WORLD.finish.width * 0.5, y - 6);
  }
}

/* ── Obstacle renderer ──────────────────────────────
   Renders each obstacle type with appropriate military styling.
─────────────────────────────────────────────────── */
function renderObstacles() {
  state.obstacles.forEach(obs => {
    if (!obs.body && obs.type !== 'craterMarker') return;

    if (obs.type === 'craterMarker') {
      // Orange warning stake at crater edges
      const p = worldToScreen({ x: obs.worldX, y: obs.worldY });
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = '#8a3010';
      ctx.fillRect(-3, -36, 6, 36);
      ctx.fillStyle = '#cc4a18';
      ctx.fillRect(-5, -44, 10, 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, -38);
      ctx.restore();
      return;
    }

    const p = worldToScreen(obs.body.position);

    if (obs.type === 'rock' || obs.type === 'rubble') {
      // Use the physics body polygon (irregular from fromVertices)
      renderBodyPolygon(obs.body, obs.type === 'rubble' ? '#4e4840' : '#5a5448', '#3a3028');
      // Highlight edge
      ctx.strokeStyle = '#6a6050'; ctx.lineWidth = 1;
      ctx.beginPath();
      if (obs.body.vertices.length > 2) {
        ctx.moveTo(obs.body.vertices[0].x - state.camera.x, obs.body.vertices[0].y - state.camera.y);
        ctx.lineTo(obs.body.vertices[1].x - state.camera.x, obs.body.vertices[1].y - state.camera.y);
      }
      ctx.stroke();
      return;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(obs.body.angle);

    switch (obs.type) {
      case 'log': {
        // Weathered fallen tree trunk
        ctx.fillStyle = '#6a4a22'; ctx.strokeStyle = '#3e2810'; ctx.lineWidth = 2;
        ctx.fillRect(-48, -10, 96, 20); ctx.strokeRect(-48, -10, 96, 20);
        // Bark texture lines
        ctx.strokeStyle = '#4e3418'; ctx.lineWidth = 1;
        for (let lx = -38; lx < 40; lx += 14) {
          ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx + 4, 10); ctx.stroke();
        }
        // End-grain rings (both ends)
        [-44, 44].forEach(ex => {
          ctx.strokeStyle = '#3e2810'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(ex, 0, 8, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(ex, 0, 4, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = '#5a3a18';
          ctx.beginPath(); ctx.arc(ex, 0, 2, 0, Math.PI * 2); ctx.fill();
        });
        break;
      }

      case 'barrel': {
        const r = obs.radius;
        // OD green drum with stripe
        ctx.fillStyle = '#3a4e24'; ctx.strokeStyle = '#2a3618'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Drum band rings
        ctx.strokeStyle = '#2a3010'; ctx.lineWidth = 1.5;
        [-r * 0.5, 0, r * 0.5].forEach(ry => {
          ctx.beginPath(); ctx.arc(0, ry, r, -Math.PI * 0.4, Math.PI * 0.4); ctx.stroke();
        });
        // Warning stripe
        ctx.fillStyle = '#c8a020';
        ctx.fillRect(-r * 0.6, -r * 0.15, r * 1.2, r * 0.3);
        // Stencil text
        ctx.fillStyle = '#1a1a10';
        ctx.font = `bold ${Math.round(r * 0.42)}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('55G', 0, 0);
        break;
      }

      case 'boulder': {
        const r = obs.radius;
        // Large grey rock
        ctx.fillStyle = '#4a4840'; ctx.strokeStyle = '#2e2c28'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Surface crack lines (deterministic using radius as seed)
        ctx.strokeStyle = '#3a3830'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(-r * 0.28, -r * 0.22, r * 0.38, 0.4, 2.3); ctx.stroke();
        ctx.beginPath(); ctx.arc(r * 0.24, r * 0.18, r * 0.30, 2.8, 5.0); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-r * 0.1, -r * 0.5); ctx.lineTo(r * 0.15, r * 0.3);
        ctx.strokeStyle = '#2e2c26'; ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  });
}

function renderBodyPolygon(body, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(body.vertices[0].x - state.camera.x, body.vertices[0].y - state.camera.y);
  for (let i = 1; i < body.vertices.length; i++)
    ctx.lineTo(body.vertices[i].x - state.camera.x, body.vertices[i].y - state.camera.y);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

// Dust = sandy tan. Skid smoke = dark grey. Exhaust = dark charcoal, rises and billows.
function renderDust() {
  state.dust.forEach(p => {
    const pt = worldToScreen(p);
    if (p.type === 'puke') {
      ctx.globalAlpha = Math.max(0, p.life * 0.95);
      ctx.fillStyle   = p.col || '#7a9a18';
    } else if (p.type === 'pukeSplat') {
      // Flat ellipse on the ground — fades slowly (life range 0–2)
      ctx.globalAlpha = Math.max(0, Math.min(0.75, p.life * 0.5));
      ctx.fillStyle   = p.col || '#7a9a18';
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, p.size * 1.5, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return;
    } else if (p.type === 'exhaust') {
      ctx.globalAlpha = Math.max(0, p.life * 0.22);
      ctx.fillStyle   = p.dark ? '#111110' : '#242420';
    } else if (p.type === 'skid') {
      ctx.globalAlpha = Math.max(0, p.life * 0.38);
      ctx.fillStyle   = '#2a2a20';
    } else {
      ctx.globalAlpha = Math.max(0, p.life * 0.42);
      ctx.fillStyle   = '#a08858';
    }
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

/* ── Truck renderer ─────────────────────────────────
   Chassis drawn at physics body position/angle; wheels drawn separately.
─────────────────────────────────────────────────── */
function renderTruck() {
  const p = worldToScreen(state.truck.body.position);

  function bodyAnchor(lx, ly) {
    const r = Vector.rotate({ x: lx, y: ly }, state.truck.body.angle);
    return worldToScreen({ x: state.truck.body.position.x + r.x, y: state.truck.body.position.y + r.y });
  }

  function drawSuspBar(aA, aB, wPt) {
    const mx = (aA.x + wPt.x) * 0.5, my = (aA.y + wPt.y) * 0.5;
    const angle = Math.atan2(wPt.y - my, wPt.x - mx);
    const width = Math.hypot(wPt.x - mx, wPt.y - my) * 2;
    ctx.save();
    ctx.translate(mx, my); ctx.rotate(angle);
    ctx.fillStyle = '#1a2212'; ctx.fillRect(-width * 0.5, -4, width, 8);
    ctx.fillStyle = '#263018'; ctx.fillRect(-width * 0.5, -3, width, 3);
    ctx.restore();
  }

  const rSA = bodyAnchor(-92, 8), rSB = bodyAnchor(-52, 8);
  const fSA = bodyAnchor(58, 8),  fSB = bodyAnchor(10, 8);
  const rWP = worldToScreen(state.truck.rearWheel.position);
  const fWP = worldToScreen(state.truck.frontWheel.position);

  drawSuspBar(rSA, rSB, rWP);
  drawSuspBar(fSA, fSB, fWP);

  ctx.strokeStyle = 'rgba(120,160,80,0.25)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rSA.x, rSA.y); ctx.lineTo(rWP.x, rWP.y - 8);
  ctx.moveTo(rSB.x, rSB.y); ctx.lineTo(rWP.x, rWP.y - 8);
  ctx.moveTo(fSA.x, fSA.y); ctx.lineTo(fWP.x, fWP.y - 8);
  ctx.moveTo(fSB.x, fSB.y); ctx.lineTo(fWP.x, fWP.y - 8);
  ctx.stroke();

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(state.truck.body.angle);

  // ═══ CHASSIS FRAME RAILS ═══
  ctx.fillStyle = '#1c2810'; ctx.fillRect(-114, 8, 238, 10);
  ctx.fillStyle = '#141e0c';
  [-85, -55, -20, 20, 60].forEach(cx => ctx.fillRect(cx - 3, 8, 6, 10));

  // ═══ LOWER BODY PANEL (cab apron + front fender — fills gap y=-10 to y=8) ═══
  ctx.fillStyle = '#2e3c16'; ctx.fillRect(8, -10, 120, 18);   // spans cab → bumper
  ctx.strokeStyle = '#1c2a0e'; ctx.lineWidth = 1;
  ctx.strokeRect(8, -10, 120, 18);
  // Fender arch cut-out hint over front wheel
  ctx.fillStyle = '#232f10'; ctx.fillRect(36, -8, 46, 14);    // recessed wheel-well panel

  // ═══ REAR BUMPER / TOW PINTLE ═══
  ctx.fillStyle = '#1a2410'; ctx.fillRect(-120, 0, 10, 14);
  ctx.fillStyle = '#121a08'; ctx.fillRect(-122, 4, 6, 5);

  // ═══ CARGO BED SIDEBOARDS ═══
  ctx.fillStyle = '#2e3e18'; ctx.fillRect(-108, -8, 116, 16);
  ctx.fillStyle = '#3a4e20'; ctx.fillRect(-108, -12, 116, 5); // top rail
  // Vertical stake pockets
  ctx.strokeStyle = '#1e2c0e'; ctx.lineWidth = 1.5;
  for (let rx = -95; rx < 9; rx += 20) {
    ctx.beginPath(); ctx.moveTo(rx, -12); ctx.lineTo(rx, 8); ctx.stroke();
  }
  // Bare bow hoops (no canvas — open cargo bed)
  ctx.strokeStyle = '#2e3c16'; ctx.lineWidth = 2;
  for (let bx = -88; bx <= 4; bx += 24) {
    ctx.beginPath(); ctx.arc(bx, -12, 20, Math.PI, 0); ctx.stroke();
  }

  // ═══ TAILGATE (partially lowered — hinge at top rear, panel kicks out/down) ═══
  ctx.save();
  ctx.translate(-108, -12);  // hinge point at top of rear bed wall
  ctx.rotate(-0.42);         // ~24° back — clearly lowered, easy exit
  ctx.fillStyle = '#344418'; ctx.fillRect(-2, 0, 9, 18);
  ctx.strokeStyle = '#1e2c0e'; ctx.lineWidth = 1;
  ctx.strokeRect(-2, 0, 9, 18);
  ctx.fillStyle = '#263610'; ctx.fillRect(0, 7, 5, 4); // latch
  ctx.restore();

  // ═══ CAB (boxy, tall, straddles front axle) ═══
  ctx.fillStyle = '#3e5020';
  ctx.fillRect(8, -64, 56, 54);
  // Roof
  ctx.fillStyle = '#2e3c16'; ctx.fillRect(8, -64, 56, 8);
  // Firewall transition to hood
  ctx.fillStyle = '#344018'; ctx.fillRect(60, -64, 6, 54);

  // Windshield — two panes with center post
  ctx.fillStyle = '#0e1820';
  ctx.fillRect(12, -58, 19, 26);  // left pane
  ctx.fillRect(34, -58, 18, 26);  // right pane
  ctx.fillStyle = '#2a3614'; ctx.fillRect(31, -58, 4, 26); // center post
  // Reflections
  ctx.fillStyle = 'rgba(150,210,120,0.09)';
  ctx.fillRect(12, -58, 19, 7); ctx.fillRect(34, -58, 18, 7);

  // Rear cab window (small)
  ctx.fillStyle = '#0c141e'; ctx.fillRect(12, -28, 14, 14);

  // Door seam & panel outlines
  ctx.strokeStyle = '#263010'; ctx.lineWidth = 1.5;
  ctx.strokeRect(8, -64, 56, 54);
  ctx.beginPath(); ctx.moveTo(30, -64); ctx.lineTo(30, -10); ctx.stroke();

  // Door handle
  ctx.fillStyle = '#b4a030'; ctx.fillRect(16, -26, 10, 3); ctx.fillRect(16, -23, 3, 3);

  // Running board / step
  ctx.fillStyle = '#1a2610'; ctx.fillRect(8, -4, 24, 5);

  // USMC stencil on cab door
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#8aaa5a';
  ctx.font = 'bold 8px "Share Tech Mono","Courier New",monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('USMC', 12, -18);
  ctx.restore();

  // Side mirror arm + head
  ctx.fillStyle = '#243010'; ctx.fillRect(62, -55, 10, 4);
  ctx.fillStyle = '#1a2610'; ctx.fillRect(70, -60, 8, 12);

  // ═══ HOOD (long, prominent) ═══
  ctx.fillStyle = '#3a4c1e';
  ctx.fillRect(60, -44, 56, 34);
  // Top highlight edge
  ctx.fillStyle = '#445824'; ctx.fillRect(60, -44, 56, 5);
  // Center spine
  ctx.fillStyle = '#2e3c14'; ctx.fillRect(82, -43, 8, 33);
  // Hood louvers
  ctx.strokeStyle = '#263210'; ctx.lineWidth = 1;
  for (let vx = 68; vx < 114; vx += 8) {
    ctx.beginPath(); ctx.moveTo(vx, -37); ctx.lineTo(vx, -16); ctx.stroke();
  }
  // Hood outline
  ctx.strokeStyle = '#1e2c0e'; ctx.lineWidth = 1.5;
  ctx.strokeRect(60, -44, 56, 34);

  // ═══ FRONT GRILLE & BUMPER ═══
  // Grille surround
  ctx.fillStyle = '#222c0e'; ctx.fillRect(112, -38, 16, 28);
  // Grille mesh
  ctx.fillStyle = '#121808'; ctx.fillRect(114, -36, 12, 24);
  ctx.strokeStyle = '#2a3612'; ctx.lineWidth = 1;
  for (let gy = -33; gy < -14; gy += 4) {
    ctx.beginPath(); ctx.moveTo(114, gy); ctx.lineTo(126, gy); ctx.stroke();
  }
  // Heavy front bumper
  ctx.fillStyle = '#1c280e'; ctx.fillRect(120, -22, 12, 22);
  // Winch
  ctx.fillStyle = '#141c08'; ctx.fillRect(121, -18, 10, 11);
  ctx.strokeStyle = '#303e12'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(126, -12, 4, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(126, -16); ctx.lineTo(126, -8); ctx.stroke();
  // Headlight (top) + marker light (amber, lower)
  ctx.fillStyle = '#c4c070'; ctx.fillRect(112, -36, 8, 11);
  ctx.fillStyle = '#c09028'; ctx.fillRect(112, -23, 8, 7);

  // ═══ RADIO ANTENNA (rear of cab roof) ═══
  ctx.strokeStyle = '#283618'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(12, -64); ctx.lineTo(10, -96); ctx.stroke();
  ctx.fillStyle = '#222e10'; ctx.fillRect(7, -98, 6, 5);

  // ── Exhaust stack — rises from behind the cab ──
  ctx.fillStyle = '#181812'; ctx.fillRect(6, -92, 7, 30);    // shaft
  ctx.fillStyle = '#101010'; ctx.fillRect(4, -95, 11, 6);    // flared top
  ctx.fillStyle = '#0a0a08'; ctx.fillRect(5, -97, 9, 3);     // rim

  // ── Truck body puke splats (drip + fade, in local coords) ──
  state.truckSplats.forEach(s => {
    ctx.globalAlpha = Math.max(0, s.alpha);
    ctx.fillStyle   = '#7a9a18';
    ctx.beginPath();
    ctx.ellipse(s.lx, s.ly, s.size * 1.1, s.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    if (s.drip > 1) {
      ctx.strokeStyle = '#6a8814';
      ctx.lineWidth   = Math.max(0.5, s.size * 0.28);
      ctx.beginPath();
      ctx.moveTo(s.lx, s.ly + s.size * 0.4);
      ctx.lineTo(s.lx + s.dripOffX, s.ly + s.size * 0.4 + s.drip);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });

  ctx.restore();
  drawWheel(state.truck.rearWheel);
  drawWheel(state.truck.frontWheel);
}

function drawWheel(wheel) {
  const radius      = wheel.renderRadius      || wheel.circleRadius || 28;
  const outerRadius = wheel.renderOuterRadius || radius;
  const p = worldToScreen(wheel.position);
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(wheel.angle);
  ctx.fillStyle = '#181818';
  ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0e0e0e';
  for (let i = 0; i < 10; i++) {
    ctx.save(); ctx.rotate((Math.PI * 2 * i) / 10);
    ctx.fillRect(-3, -outerRadius, 6, 7); ctx.restore();
  }
  ctx.strokeStyle = '#101010'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#383a2e';
  ctx.beginPath(); ctx.arc(0, 0, radius * 0.52, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#484a3a';
  ctx.beginPath(); ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#282a20';
  const lugR = radius * 0.36;
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI * 2 * i) / 4;
    ctx.beginPath(); ctx.arc(Math.cos(a) * lugR, Math.sin(a) * lugR, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function renderMarines() {
  // Pass 1 — physical bodies (living upright, lost dimmed/slumped)
  state.marines.forEach(marine => {
    const p = worldToScreen(marine.body.position);
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(marine.body.angle);
    const sick = !marine.lost && marine.sickness > 40;
    ctx.globalAlpha = marine.lost ? 0.4 : 1;
    ctx.fillStyle = marine.lost ? '#2e2e22' : sick ? '#4a6a18' : marine.body.renderTint;
    ctx.fillRect(-5, 2, 10, 14);
    ctx.fillStyle = marine.lost ? '#242418' : sick ? '#3a5210' : '#263618';
    ctx.beginPath(); ctx.arc(0, -4, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = marine.lost ? '#1e1e14' : sick ? '#2e4010' : '#1e2e14';
    ctx.fillRect(-7, -5, 14, 3);
    // Sick face — squiggly mouth when puking
    if (marine.puking) {
      ctx.strokeStyle = '#8ab820'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, -2, 3, 0.2, Math.PI - 0.2); ctx.stroke();
    }
    ctx.restore();
  });

  // Pass 2 — ghost for each fallen marine
  state.marines.forEach(marine => {
    if (!marine.lost || !marine.ghostTime) return;
    const gt = marine.ghostTime;
    const p  = worldToScreen(marine.body.position);

    // Ghost drifts / bobs above body
    const hoverY = -52 - Math.sin(gt * 2.5) * 9;
    const swayX  = Math.sin(gt * 1.7 + marine.body.id * 1.3) * 13;
    const spin   = Math.sin(gt * 2.9 + marine.body.id) * 0.22;

    ctx.save();
    ctx.translate(p.x + swayX, p.y + hoverY);
    ctx.rotate(spin);
    ctx.globalAlpha = 0.52 + Math.sin(gt * 5.1) * 0.07;

    // Ghost skirt body (wavy bottom hem)
    const wv = Math.sin(gt * 6.3) * 3;
    ctx.fillStyle = 'rgba(195, 235, 175, 1)';
    ctx.beginPath();
    ctx.arc(0, -5, 9, Math.PI, 0);        // dome top
    ctx.lineTo(9, 10);
    ctx.quadraticCurveTo( 6, 15 + wv,  3, 11);
    ctx.quadraticCurveTo( 0, 16 - wv, -3, 11);
    ctx.quadraticCurveTo(-6, 15 + wv, -9, 11);
    ctx.lineTo(-9, 10);
    ctx.closePath();
    ctx.fill();

    // Helmet (ghost of a Marine keeps his cover)
    ctx.globalAlpha = 0.38 + Math.sin(gt * 5.1) * 0.05;
    ctx.fillStyle = 'rgba(160, 210, 140, 0.35)';
    ctx.strokeStyle = 'rgba(180, 230, 155, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, -7, 8, Math.PI, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(140, 195, 125, 0.25)';
    ctx.beginPath(); ctx.arc(0, -7, 8, Math.PI, 0, true); ctx.fill();

    // Ghost eyes — hollow circles
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = '#0c160a';
    ctx.beginPath(); ctx.arc(-3, -6, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 3, -6, 1.8, 0, Math.PI * 2); ctx.fill();

    // Dancing arms — each swings opposite phase
    ctx.globalAlpha = 0.50 + Math.sin(gt * 5.1) * 0.06;
    ctx.strokeStyle = 'rgba(195, 235, 175, 0.85)';
    ctx.lineWidth = 2;
    const a1 = Math.sin(gt * 4.2) * 1.1 - 0.6;
    const a2 = Math.sin(gt * 4.2 + Math.PI) * 1.1 - 0.6;
    // Left arm
    ctx.save(); ctx.translate(-9, 1); ctx.rotate(a1);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-7, 9); ctx.stroke();
    ctx.restore();
    // Right arm
    ctx.save(); ctx.translate(9, 1); ctx.rotate(a2);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7, 9); ctx.stroke();
    ctx.restore();

    ctx.restore();
  });

  // Pass 3 — speech bubbles (always upright, above each marine)
  ctx.font = 'bold 7px "Share Tech Mono","Courier New",monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  state.marines.forEach(marine => {
    if (!marine.speech || marine.speech.timer <= 0) return;
    const isGhost = marine.lost;
    const fade  = Math.min(1, marine.speech.timer * 2.5);
    const p     = worldToScreen(marine.body.position);
    const text  = marine.speech.text;
    const tw    = ctx.measureText(text).width;
    const bw    = tw + 10, bh = 13;
    const bx    = p.x - bw / 2;
    // Ghost bubbles float higher above the ghost itself
    const by    = p.y - (isGhost ? 80 : 36) - bh;

    ctx.globalAlpha = fade * (isGhost ? 0.72 : 0.93);

    // Bubble background
    ctx.fillStyle = isGhost ? 'rgba(195,235,175,0.82)' : '#deecd2';
    ctx.beginPath();
    ctx.moveTo(bx + 3, by);
    ctx.lineTo(bx + bw - 3, by);
    ctx.arcTo(bx + bw, by,     bx + bw, by + 3,     3);
    ctx.lineTo(bx + bw, by + bh - 3);
    ctx.arcTo(bx + bw, by + bh, bx + bw - 3, by + bh, 3);
    ctx.lineTo(bx + 3,  by + bh);
    ctx.arcTo(bx,       by + bh, bx, by + bh - 3,  3);
    ctx.lineTo(bx,      by + 3);
    ctx.arcTo(bx,       by,       bx + 3, by,        3);
    ctx.closePath();
    ctx.fill();

    // Bubble border
    ctx.strokeStyle = isGhost ? 'rgba(160,210,140,0.7)' : '#4a8741'; ctx.lineWidth = 1;
    ctx.stroke();

    // Tail
    ctx.fillStyle = isGhost ? 'rgba(195,235,175,0.82)' : '#deecd2';
    ctx.beginPath();
    ctx.moveTo(p.x - 4, by + bh);
    ctx.lineTo(p.x,     by + bh + 7);
    ctx.lineTo(p.x + 4, by + bh);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isGhost ? 'rgba(160,210,140,0.7)' : '#4a8741'; ctx.lineWidth = 1;
    ctx.stroke();

    // Text
    ctx.fillStyle = isGhost ? '#1a3014' : '#1a2810';
    ctx.fillText(text, p.x, by + bh / 2);
    ctx.globalAlpha = 1;
  });
}

function renderWaitMarine() {
  const wx  = WAIT_MARINE_X - state.camera.x;
  const gnd = terrainHeightAt(WAIT_MARINE_X) - state.camera.y;
  const wy  = gnd - 14;   // feet at ground, body top 14px above

  const t   = performance.now() / 1000;
  const tx  = state.truck ? state.truck.body.position.x : 0;
  const near = tx > WORLD.finish.x - 300;

  // Body
  ctx.fillStyle = '#526840';
  ctx.fillRect(wx - 5, wy, 10, 14);
  // Head
  ctx.fillStyle = '#3a5228';
  ctx.beginPath(); ctx.arc(wx, wy - 4, 6, 0, Math.PI * 2); ctx.fill();
  // Helmet
  ctx.fillStyle = '#2a3e1a';
  ctx.fillRect(wx - 7, wy - 7, 14, 3);
  // Left arm — hangs at side
  ctx.strokeStyle = '#3a4e20'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(wx - 5, wy + 2); ctx.lineTo(wx - 9, wy + 10); ctx.stroke();
  // Right arm — waves (faster + bigger when truck is close)
  const waveSpeed = near ? 6.5 : 2.2;
  const waveAmp   = near ? 1.0 : 0.45;
  const waveAngle = -Math.PI * 0.55 + Math.sin(t * waveSpeed) * waveAmp;
  ctx.save();
  ctx.translate(wx + 5, wy + 2);
  ctx.rotate(waveAngle);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 10);
  ctx.stroke();
  ctx.restore();

  // Speech bubble
  const wm = state.waitMarine;
  if (wm.speech && wm.speech.timer > 0) {
    const fade = Math.min(1, wm.speech.timer * 2);
    ctx.font = 'bold 7px "Share Tech Mono","Courier New",monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(wm.speech.text).width;
    const bw = tw + 10, bh = 13;
    const bx = wx - bw / 2;
    const by = wy - 34 - bh;

    ctx.globalAlpha = fade * 0.93;
    ctx.fillStyle = '#deecd2';
    ctx.beginPath();
    ctx.moveTo(bx + 3, by);
    ctx.lineTo(bx + bw - 3, by);
    ctx.arcTo(bx + bw, by,      bx + bw, by + 3,     3);
    ctx.lineTo(bx + bw, by + bh - 3);
    ctx.arcTo(bx + bw, by + bh,  bx + bw - 3, by + bh, 3);
    ctx.lineTo(bx + 3,  by + bh);
    ctx.arcTo(bx,       by + bh, bx, by + bh - 3,    3);
    ctx.lineTo(bx,      by + 3);
    ctx.arcTo(bx,       by,      bx + 3, by,          3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a8741'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#deecd2';
    ctx.beginPath();
    ctx.moveTo(wx - 4, by + bh); ctx.lineTo(wx, by + bh + 7); ctx.lineTo(wx + 4, by + bh);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#4a8741'; ctx.stroke();
    ctx.fillStyle = '#1a2810';
    ctx.fillText(wm.speech.text, wx, by + bh / 2);
    ctx.globalAlpha = 1;
  }
}

// Floating hold timer rendered in front of the truck in screen space
function renderParkTimer() {
  if (!state.truck || !state.started || state.gameOver) return;
  const prog = Math.min(1, state.parkedTimer / PARK_HOLD);
  if (prog <= 0) return;

  // Anchor to truck front (local x≈+110) so it floats ahead of the cab
  const angle  = state.truck.body.angle;
  const pos    = state.truck.body.position;
  const frontX = pos.x + Math.cos(angle) * 110 - Math.sin(angle) * 80;
  const frontY = pos.y + Math.sin(angle) * 110 + Math.cos(angle) * 80;
  const sp     = worldToScreen({ x: frontX, y: frontY });

  const bw = 80, bh = 8;
  const bx = sp.x - bw / 2, by = sp.y - bh / 2;

  // Track background
  ctx.fillStyle = 'rgba(10,18,8,0.82)';
  ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);

  // Fill — colour shifts green→bright-green as it fills
  const r = Math.round(60  + prog * 90);
  const g = Math.round(160 + prog * 75);
  ctx.fillStyle = `rgba(${r},${g},55,0.95)`;
  ctx.fillRect(bx, by, bw * prog, bh);

  // Border
  ctx.strokeStyle = 'rgba(100,180,65,0.7)'; ctx.lineWidth = 1;
  ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);

  // Countdown label to the right
  const secsLeft = Math.ceil(PARK_HOLD - state.parkedTimer);
  ctx.fillStyle = 'rgba(200,240,160,0.95)';
  ctx.font = 'bold 11px "Share Tech Mono","Courier New",monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(secsLeft + 's', bx + bw + 7, by + bh / 2);
}
