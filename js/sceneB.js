// sceneB.js — 3: bloodstream highway & pancreas works, 4: the jammed cell door, 5: the Hand, 6: furnace morph.
'use strict';
const T3_START = 2.55, T5_HAND = 5.55, T6_MORPH = 6.62, T6_END = 7.45;
const DOOR = [2140, 318], CHUTE = [985, 452], GROUND = 606;
const FACT = [380, 648];

function camBlood(t) {
  let cx = 640 + 1500 * eIO(seg(t, 3.3, 4.3)), cy = 360, z = 1;
  const kd = eIO(seg(t, 4.2, 5.4));
  z = lerp(1, 1.12, kd); cy = lerp(360, 380, kd);
  return [cx, cy, z];
}

// ---------- keys: deterministic choreography ----------
const NKEYS = 150;
let KEYS = null;
function planKeys() {
  KEYS = []; seed(900);
  const heapSlots = [];
  for (let r = 0; r < 7; r++) { const wdt = 470 - r * 58, n = Math.floor(wdt / 25); for (let c = 0; c < n; c++) heapSlots.push([DOOR[0] - wdt / 2 + c * 25 + rnd(-6, 6), GROUND - 6 - r * 13 + rnd(-4, 4), rnd(-1.4, 1.4)]); }
  let hole = 0, heap = 0, q = 0;
  for (let i = 0; i < NKEYS; i++) {
    const K = { te: 2.72 + i * .0082, v: [rnd(250, 560), rnd(-620, -240)], tf: rnd(.3, .5), spin: rnd(-14, 14), lane: rnd(250, 520), s: rnd(950, 1150), v3: rnd(0, 2) | 0 };
    let slot;
    if (i % 3 === 0 && hole < KEYHOLES.length) {            // jammed into a keyhole at a silly angle
      const [hx, hy, hr] = KEYHOLES[hole++]; const ang = rnd(-.9, .9) + (hx < 0 ? 0 : Math.PI * (rnd() < .3 ? 1 : 0));
      slot = { x: DOOR[0] + hx - Math.cos(ang) * 50, y: DOOR[1] + hy - Math.sin(ang) * 50, a: ang, kind: 'hole', bend: rnd() < .25 };
    } else if (heap < heapSlots.length) { const [x, y, a] = heapSlots[heap++]; slot = { x, y, a, kind: 'heap' }; }
    else { slot = { x: DOOR[0] - 330 - q * 46, y: 505 + (q % 2) * 34 + rnd(-4, 4), a: rnd(-.12, .12), kind: 'queue', q: q++ }; }
    K.slot = slot;
    const p1 = [CHUTE[0] + K.v[0] * K.tf, CHUTE[1] + K.v[1] * K.tf + 450 * K.tf * K.tf];
    K.p1 = p1; K.ta = K.te + K.tf + Math.max(.25, (slot.x - p1[0] - 60) / K.s);
    KEYS.push(K);
  }
  // sugar cubes drift along too, then settle at the foot of the door
  SUGAR = [];
  for (let i = 0; i < 22; i++) {
    const x0 = rnd(-200, 1400), lane = rnd(220, 540);
    const slot = [DOOR[0] - 240 + rnd(0, 480), GROUND - 10 - rnd(0, 60) * (1 - Math.abs(i - 11) / 11), rnd(-.6, .6)];
    SUGAR.push({ x0, lane, slot, ta: 4.3 + i * .04 + rnd(0, .3), spin: rnd(-3, 3) });
  }
}
let SUGAR = [];

function keyPos(K, t) {
  const tau = t - K.te;
  if (tau < 0) return null;
  if (tau < K.tf) return [CHUTE[0] + K.v[0] * tau, CHUTE[1] + K.v[1] * tau + 450 * tau * tau, K.spin * tau, 1];
  if (t < K.ta) {
    const u = tau - K.tf, y = lerp(K.p1[1], K.lane, eOut(clamp(u / .45)));
    return [K.p1[0] + K.s * u, y + Math.sin(u * 9 + K.te * 30) * 5, lerp(K.spin * K.tf, 0, eOut(clamp(u / .3))), 1];
  }
  const u = t - K.ta, k = clamp(u / .16), from = [K.p1[0] + K.s * (K.ta - K.te - K.tf), K.lane];
  const S = K.slot, e = eBack(k);
  let x = lerp(from[0], S.x, e), y = lerp(from[1], S.y, eOut(k)) - Math.sin(k * Math.PI) * (S.kind === 'heap' ? 40 : 10), a = lerp(0, S.a, e);
  if (S.kind === 'queue' && t > 5.05 && t < 5.45) y -= Math.max(0, Math.sin((t - 5.05) * 22 - S.q * .7)) * 7;   // impatient honking wave
  return [x, y, a, 1];
}

function sugarPos(C, t) {
  if (t < C.ta) { const x = C.x0 + (t - T3_START) * 520; return [x, C.lane + Math.sin(t * 3 + C.x0) * 10, t * C.spin]; }
  const k = clamp((t - C.ta) / .2), e = eOut(k);
  const from = [C.x0 + (C.ta - T3_START) * 520, C.lane];
  let x = lerp(from[0], C.slot[0], e), y = lerp(from[1], C.slot[1], eBounce(k)), a = lerp(C.ta * C.spin, C.slot[2], e);
  const ts = sweepTime(x);                                      // the Hand swats it away
  if (t > ts) { const d = t - ts; seed(Math.floor(C.x0 * 10)); x += rnd(700, 1100) * d; y += -rnd(600, 1000) * d + 1900 * d * d; a += rnd(8, 16) * d; }
  return [x, y, a];
}

// ---------- the Hand ----------
const SWEEP = [5.84, 6.06, DOOR[0] - 470, DOOR[0] + 300];
function sweepTime(x) { return SWEEP[0] + clamp((x - SWEEP[2]) / (SWEEP[3] - SWEEP[2])) * (SWEEP[1] - SWEEP[0]); }
const LEVER = [DOOR[0] + 395, DOOR[1] + 250];
function handPose(t) {
  const K = [   // [time, x, y, rot]
    [5.55, DOOR[0] - 900, DOOR[1] - 520, .6], [5.70, DOOR[0] - 520, DOOR[1] - 120, .35], [5.80, DOOR[0] - 580, DOOR[1] - 170, .45],
    [5.84, DOOR[0] - 560, GROUND - 60, .12], [6.06, DOOR[0] + 260, GROUND - 70, .05], [6.20, 2120, 330, -.05],
    [6.30, 2142, 395, 0], [6.40, 2350, 397, 0], [6.72, LEVER[0] + 500, LEVER[1] - 900, -.6]];
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 0; i < K.length - 1; i++) if (t <= K[i + 1][0]) {
    const k = eIO(seg(t, K[i][0], K[i + 1][0])); return [lerp(K[i][1], K[i + 1][1], k), lerp(K[i][2], K[i + 1][2], k), lerp(K[i][3], K[i + 1][3], k)];
  }
  return K[K.length - 1].slice(1);
}
const BUTTER_DROP = 6.28;
const GEARS = [[DOOR[0] + 350, DOOR[1] - 170, 0, 1], [DOOR[0] + 455, DOOR[1] - 60, 2, -1.45], [DOOR[0] + 372, DOOR[1] + 34, 4, 2.05]];

function drawBloodWorld(g, t, tq) {
  const [cx] = camBlood(t);
  // parallax plasma is drawn inside cam at .35 depth
  for (const o of [0, 1790]) g.drawImage(SP.plasma, (cx - 640) * .65 - 200 + o, 0);
  // the cell-membrane flat rising at the end of the road
  g.save(); g.beginPath(); g.moveTo(1500, -60); for (let y = -60; y <= 760; y += 40) g.lineTo(1500 + Math.sin(y * .03) * 18 + hash(y) * 10, y); g.lineTo(3000, 760); g.lineTo(3000, -60); g.clip();
  g.drawImage(SP.cellWall, 1480, -60); g.restore();
  g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); for (let y = -60; y <= 760; y += 40) g.lineTo(1500 + Math.sin(y * .03) * 18 + hash(y) * 10, y); g.stroke();
  for (let x = -300; x < 3200; x += 1190) spr(g, SP.wallTop, x, -8);
  // distant blood cells
  for (let i = 0; i < 16; i++) { seed(700 + i); const x0 = rnd(-200, 2800), y = rnd(170, 460), v = rnd(60, 160); spr(g, SP.rbc[i % 3], x0 + v * (t - T3_START), y + Math.sin(tq * 2 + i) * 8, tq * rnd(-1, 1), .55, .55 * rnd(.5, 1)); }
  // the pancreas works
  const pump = Math.sin(tq * 26);
  spr(g, SP.bellows, FACT[0] + 470, FACT[1] - 250, 0, 1, .7 + .3 * Math.abs(pump));
  spr(g, SP.factory, FACT[0], FACT[1]);
  spr(g, SP.pumpArm, FACT[0] + 250, FACT[1] - 190, -.25 + pump * .35);
  spr(g, SP.pumpArm, FACT[0] + 420, FACT[1] - 225, .3 - pump * .35, -1, 1);
  for (let k = 0; k < 26; k++) {                       // chimney smoke puffs
    const t0 = 2.2 + k * .11, d = t - t0; if (d < 0 || d > 1.6) continue;
    const ch = k % 2 ? [FACT[0] + 113, FACT[1] - 306] : [FACT[0] + 185, FACT[1] - 330];
    const s = .35 + d * .7; spr(g, SP.puff[k % 4], ch[0] - d * 90 + Math.sin(k) * 20, ch[1] - d * 170, k, s, s, 1 - seg(d, 1.1, 1.6));
  }
  if (t < 4.2) {                                         // chute belch
    const b = Math.max(0, Math.sin(tq * 26)); g.save(); g.globalAlpha = .6 * b; g.drawImage(SP.glow, CHUTE[0] - 50, CHUTE[1] - 50, 100, 100); g.restore();
  }
}

function drawDoorRig(g, t, tq) {
  const morph = seg(t, T6_MORPH, T6_MORPH + .25), iris = seg(t, 6.93, 7.12);
  // glow & fire behind the door (keyholes are punched through)
  if (morph > 0) {
    const fl = .85 + .15 * Math.sin(tq * 40);
    g.save(); g.globalAlpha = eOut(morph) * fl; g.drawImage(SP.glow, DOOR[0] - 300, DOOR[1] - 300, 600, 600); g.restore();
  }
  if (iris > 0) {
    g.save(); g.globalAlpha = 1; g.drawImage(SP.glow, DOOR[0] - 420, DOOR[1] - 420, 840, 840); g.restore();
    for (let i = 0; i < 12; i++) {                      // ring of roaring intake flames, pointing inward
      const a = i / 12 * 6.283 + tq * .8, r = 200;
      spr(g, SP.fire[(i + Math.floor(tq * 15)) % 3], DOOR[0] + Math.cos(a) * r, DOOR[1] + Math.sin(a) * r, a - Math.PI / 2, .9, .75 + .25 * Math.sin(tq * 30 + i));
    }
    g.save(); g.globalAlpha = .9; g.drawImage(SP.glow, DOOR[0] - 190, DOOR[1] - 190, 380, 380); g.restore();
    const s = .55 + .45 * eBack(seg(t, 6.93, 7.03));
    spr(g, SP.intake, DOOR[0], DOOR[1], -tq * .6, s * .92);
  }
  // gears (rusted & stuck → shiny & whirring after the lever)
  const shiny = seg(t, 6.36, 6.5);
  GEARS.forEach(([x, y, si, ph], i) => {
    const dir = i === 1 ? -1 : 1, rr = [90, 62, 44][i];
    const ang = t < 6.36 ? stepT(t, 3) * .06 * dir + ph : ph + .06 * 6.36 * dir + (t - 6.36) * 6 * dir * (90 / rr);
    const kz = eOut(1 - iris) ;
    spr(g, SP.gears[si], x + (x - DOOR[0]) * iris * 1.5, y, ang, kz, kz, 1 - shiny);
    if (shiny > 0) spr(g, SP.gears[si + 1], x + (x - DOOR[0]) * iris * 1.5, y, ang, kz, kz, shiny);
  });
  // butter lodged on the big gear hub
  if (t > BUTTER_DROP) {
    const k = clamp((t - BUTTER_DROP) / .2), [hx, hy, hr] = handPose(BUTTER_DROP), [bx, by] = rot2(-50, -38, hr);
    const x = lerp(hx + bx, GEARS[0][0] + 10, eIn(k)), y = lerp(hy + by, GEARS[0][1] - 20, eIn(k)) - Math.sin(k * Math.PI) * 120;
    spr(g, SP.butter, x + (GEARS[0][0] - DOOR[0]) * iris * 1.5, y, lerp(hr, .15, k), .7 * (1 - iris * .8));
  }
  spr(g, SP.leverBase, LEVER[0], LEVER[1], 0, 1 - iris);
  spr(g, SP.lever, LEVER[0], LEVER[1] - 6, -.55 + 1.1 * snap(t, 6.34, .09), 1 - iris);
  // the door itself (whole, then bursting as iris wedges)
  const shake = t > 6.78 && t < 6.93 ? [Math.sin(tq * 90) * 5, Math.cos(tq * 77) * 4] : [0, 0];
  if (iris <= 0) spr(g, SP.door, DOOR[0] + shake[0], DOOR[1] + shake[1]);
  else SP.doorWedges.forEach(({ a, s }, i) => {
    const d = eOut(iris) * 520, rr = (i % 2 ? 1 : -1) * iris * .6;
    spr(g, s, DOOR[0] + Math.cos(a) * d, DOOR[1] + Math.sin(a) * d, rr, 1 - iris * .35);
  });
}

function scene345(g, t) {
  const tq = stepT(t, 15);
  let [cx, cy, z] = camBlood(t);
  const suck = seg(t, 7.08, T6_END);
  if (suck > 0) { cx = lerp(cx, DOOR[0], eIO(clamp(suck * 2))); cy = lerp(cy, DOOR[1], eIO(clamp(suck * 2))); z = z * Math.pow(14, eIn(suck)); }
  if (!KEYS) planKeys();
  withCam(g, cx, cy, z, 0, () => {
    drawBloodWorld(g, t, tq);
    drawDoorRig(g, t, tq);
    const iris = seg(t, 6.93, 7.12), pull = seg(t, 6.98, 7.35);
    // sugar
    for (const C of SUGAR) { let [x, y, a] = sugarPos(C, t); spr(g, SP.sugar, x, y, a, .9); }
    // keys
    KEYS.forEach((K, i) => {
      const p = keyPos(K, t); if (!p) return;
      let [x, y, a] = p, sx = .8, sy = .8;
      if (K.slot.kind === 'hole' && K.slot.bend && t > K.ta + .2) sy = .8 * lerp(1, .45, seg(t, K.ta + .2, K.ta + .5));     // droopy defeated key
      if (K.slot.kind === 'hole' && t > 6.8) {                // morph: jammed keys ejected
        seed(i); const d = t - 6.8; x += rnd(-600, 600) * d; y += rnd(-600, 200) * d + 1500 * d * d; a += rnd(-10, 10) * d;
      } else if (pull > 0) {                                  // everything else is sucked into the intake
        seed(i * 3); const pk = clamp((pull - rnd(0, .5)) / .5), e = eIn(pk), sw = e * 3;
        const dx = x - DOOR[0], dy = y - DOOR[1];
        x = DOOR[0] + (dx * Math.cos(sw) - dy * Math.sin(sw)) * (1 - e); y = DOOR[1] + (dx * Math.sin(sw) + dy * Math.cos(sw)) * (1 - e); a += sw * 2; sx *= 1 - e * .8; sy *= 1 - e * .8;
        if (pk >= 1) return;
      }
      spr(g, SP.keys[K.v3], x, y, a, sx, sy);
    });
    // the Hand, with butter and avocado on its palm
    if (t > T5_HAND && t < 6.75) {
      const [hx, hy, hr] = handPose(t);
      if (t < BUTTER_DROP) { const [bx, by] = rot2(-50, -38, hr); spr(g, SP.butter, hx + bx, hy + by, hr, .7); }
      const [ax, ay] = rot2(110, -4, hr); spr(g, SP.avoHalf, hx + ax, hy + ay, hr + Math.sin(tq * 20) * .08, .9);
      const [sx0, sy0] = rot2(-340, 26, hr); spr(g, SP.sleeve, hx + sx0, hy + sy0, hr + .04, 1.05);
      spr(g, SP.hand, hx, hy, hr, 1.05);
    }
    // near blood cells & the lower bank
    for (let i = 0; i < 7; i++) { seed(800 + i); const x0 = rnd(0, 2800), y = rnd() < .5 ? rnd(90, 150) : rnd(640, 700), v = rnd(100, 200); spr(g, SP.rbc[i % 3], x0 + v * (t - T3_START), y, tq * .5 + i, 1.25, 1.25 * rnd(.6, 1)); }
    for (let x = -300; x < 3200; x += 1190) spr(g, SP.wallBot, x, 728);
  });
}
