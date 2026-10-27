// sceneC.js — 7: the healthy ketone steam engine & the stack ride, 8: the startled gentleman.
'use strict';
const T7_START = T6_END, T8_ARRIVE = 8.9;
const ENG = [190, 270], FBW = [ENG[0] + 105, ENG[1] + 235], STACK_X = 830, STACK_TOP = -880;
const BAL = [820, -1600];

function camEngine(t) {
  let cx, cy, z;
  if (t < 7.95) {
    const k = seg(t, T7_START, 7.95); z = Math.pow(10, 1 - eIO(k));
    const m = (10 / z - 1) / 9;          // firebox glides from screen centre to its resting spot
    cx = FBW[0] - (FBW[0] - 640) * m / z; cy = FBW[1] - (FBW[1] - 420) * m / z;
  } else if (t < 8.2) { cx = 640; cy = 420; z = 1; }
  else if (t < 8.62) { const k = eIn(seg(t, 8.2, 8.62)); cx = lerp(640, 800, k); cy = lerp(420, -700, k); z = lerp(1, .92, k); }
  else { const k = eOut(seg(t, 8.62, 8.98)); cx = lerp(800, 850, k); cy = lerp(-700, -1895, k); z = lerp(.92, 1.4, k); }
  return [cx, cy, z];
}
function lerpCol(a, b, k) { const p = s => [1, 3, 5].map(i => parseInt(s.substr(i, 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; }

function armPose(t) {
  const REST = [.25, 1.3], GRAB = [-2.5, 2.31], LIFT = [-2.2, -2.837 + 6.283];
  const g1 = snap(t, 9.04, .12), l1 = eBack(seg(t, 9.2, 9.34));
  let a1 = lerp(REST[0], GRAB[0], g1), a2 = lerp(REST[1], GRAB[1], g1);
  if (t > 9.2) { a1 = lerp(GRAB[0], LIFT[0], l1); a2 = lerp(GRAB[1], LIFT[1], l1); }
  return [a1, a2];
}

function scene78(g, t) {
  const tq = stepT(t, 15);
  const [cx, cy, z] = camEngine(t);
  // sky: warm horizon → bright clear blue as we climb
  const k = clamp(-cy / 1800);
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, lerpCol('#b9cfc6', '#79b6d6', k)); sky.addColorStop(1, lerpCol('#efe0bd', '#cfe6ea', k));
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // sunburst behind the balloon (Victorian poster rays)
  const sb = seg(t, 8.66, 8.95);
  if (sb > 0) withCam(g, cx, cy, z, 0, () => {
    g.save(); g.translate(BAL[0], BAL[1] - 260); g.rotate(t * .15); g.globalAlpha = sb * .55;
    for (let i = 0; i < 28; i++) { g.fillStyle = i % 2 ? '#fff6d8' : '#f3dc98'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 1600, i / 28 * 6.283, (i + 1) / 28 * 6.283); g.fill(); }
    g.restore();
  });
  // far clouds (half-speed parallax)
  withCam(g, cx * .5 + 320, cy * .5, z, 0, () => {
    seed(950); for (let i = 0; i < 12; i++) spr(g, SP.clouds[i % 3], rnd(-200, 1500), rnd(-1200, 150), 0, .55, .55);
  });
  withCam(g, cx, cy, z, 0, () => {
    spr(g, SP.hills, -200, 760); spr(g, SP.hills, 1200, 740, 0, -1, 1);
    g.fillStyle = '#6d7a45'; g.fillRect(-400, 700, 2200, 800);
    hatch(g, rect(-400, 700, 2200, 800), .05, 5, 1, PAL.ink, [-400, 700, 1800, 1500], .35);
    // clean blue ketone flames glowing through the firebox window
    const fl = .9 + .1 * Math.sin(tq * 37);
    g.save(); g.globalAlpha = fl; g.drawImage(SP.glow, FBW[0] - 70, FBW[1] - 70, 140, 140); g.restore();
    for (let i = 0; i < 3; i++) spr(g, SP.blue[(i + Math.floor(tq * 15)) % 3], FBW[0] - 26 + i * 26, FBW[1] + 42, 0, .55, .5 + .15 * Math.sin(tq * 25 + i));
    // pistons, flywheel, and the engine body with a stiff happy chug
    const chug = Math.abs(Math.sin(tq * 14)) * 4, crank = t * 9;
    const fw = [1150, 555], cp = [fw[0] + Math.cos(crank) * 95, fw[1] + Math.sin(crank) * 95];
    spr(g, SP.flywheel, fw[0], fw[1], crank, .9);
    const xh = [940 + Math.cos(crank) * 40, 560];
    spr(g, SP.rod, xh[0], xh[1], Math.atan2(cp[1] - xh[1], cp[0] - xh[0]), Math.hypot(cp[0] - xh[0], cp[1] - xh[1]) / 245, 1);
    spr(g, SP.stack, STACK_X, ENG[1] + 128 - chug, 0);
    spr(g, SP.stackTop, STACK_X, STACK_TOP - 10 - chug);
    spr(g, SP.engine, ENG[0], ENG[1] - chug);
    // steady healthy puffs from the stack
    for (let p = 0; p < 14; p++) {
      const t0 = 7.3 + p * .1, d = t - t0; if (d < 0 || d > 1.5) continue;
      const s = .5 + d * 1.1; spr(g, SP.puff[p % 4], STACK_X + Math.sin(p * 2.3) * 40 * d, STACK_TOP - 30 - d * 420, p, s, s, 1 - seg(d, 1, 1.5));
    }
    // the blast out of the stack top
    const bt = t - 8.55;
    if (bt > 0) for (let p = 0; p < 12; p++) {
      const a = -Math.PI / 2 + (p / 11 - .5) * 2.6, v = 520 + (p % 3) * 160, s = .6 + bt * 2.2;
      spr(g, SP.puff[p % 4], STACK_X + Math.cos(a) * v * bt, STACK_TOP - 40 + Math.sin(a) * v * bt, p + bt, s, s, 1 - seg(bt, .5, 1));
    }
    // near clouds
    seed(960); for (let i = 0; i < 9; i++) { const x = rnd(-300, 1600), y = rnd(-2100, -400); if (Math.abs(x - BAL[0]) < 380 && y < -1500) continue; spr(g, SP.clouds[i % 3], x, y, 0, rnd(.8, 1.2), rnd(.8, 1.2)); }
    drawGent(g, t, tq);
    // our puff of steam, riding up with the camera and bumping the basket
    if (t > 8.6 && t < 9.4) {
      const kk = seg(t, 8.6, T8_ARRIVE), yy = t < T8_ARRIVE ? cy + 300 - 40 * kk : lerp(-1630, -1680, eOut(seg(t, T8_ARRIVE, 9.05)));
      const s = t < T8_ARRIVE ? 1.3 : 1.3 + (t - T8_ARRIVE) * 3, al = 1 - seg(t, T8_ARRIVE + .1, 9.4);
      spr(g, SP.puff[1], BAL[0] - 30, yy, 0, s, s * .8, al);
      spr(g, SP.puff[0], BAL[0] + 60, yy + 20, 1, s * .8, s * .7, al);
    }
  });
  // speed-lines while we rocket up the stack
  const sl = seg(t, 8.28, 8.5) * (1 - seg(t, 8.72, 8.92));
  if (sl > 0) {
    g.save(); g.globalAlpha = sl * .5; g.strokeStyle = PAL.ink; g.lineWidth = 1.6;
    seed(Math.floor(t * 30)); for (let i = 0; i < 26; i++) { const x = rnd(0, W), y = rnd(-100, H); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + rnd(80, 260)); g.stroke(); }
    g.restore();
  }
}

function drawGent(g, t, tq) {
  const bump = t > T8_ARRIVE ? Math.sin((t - T8_ARRIVE) * 40) * 10 * Math.exp(-(t - T8_ARRIVE) * 9) : 0;
  const bob = Math.sin(t * 2.2) * 4;
  g.save(); g.translate(0, bump + bob); g.rotate(bump * .002);
  const [bx, by] = BAL;
  // ropes & envelope
  spr(g, SP.balloon, bx, by - 400, 0);
  g.strokeStyle = '#4a3a28'; g.lineWidth = 2;
  for (const [x0, x1] of [[-78, -118], [78, 118], [-25, -40], [25, 40]]) { g.beginPath(); g.moveTo(bx + x0, by - 410); g.lineTo(bx + x1, by + 4); g.stroke(); }
  // gentleman
  const startled = t > 8.93;
  const jump = -16 * snap(t, 8.93, .08) + 10 * seg(t, 9.1, 9.3);
  spr(g, SP.torso, bx, by + 25);
  const [a1, a2] = armPose(t), sh = [bx + 88, by - 125];
  const el = [sh[0] - Math.sin(a1) * 100, sh[1] + Math.cos(a1) * 100];
  const gl = [el[0] - Math.sin(a2) * 102, el[1] + Math.cos(a2) * 102];
  const hx = bx, hy = by - 295 + jump;
  spr(g, startled ? SP.headS : SP.headN, hx, hy);
  // monocle pops off the startled eye
  const mt = t - 8.95;
  if (mt < 0) spr(g, SP.monocle, hx + 28, hy + 50);
  else { g.strokeStyle = PAL.gold; g.lineWidth = 1.5; const mx = hx + 28 + mt * 260, my = hy + 50 - mt * 420 + 1400 * mt * mt;
    g.beginPath(); g.moveTo(bx + 30, by - 90); g.quadraticCurveTo((bx + 30 + mx) / 2, Math.max(my, by - 90) + 40, mx, my); g.stroke(); spr(g, SP.monocle, mx, my, mt * 12); }
  // avocado on its spring, hidden under the hat until the reveal
  const pop = t - 9.34;
  if (pop > 0) {
    const sy = eBack(clamp(pop / .14)) * .9;
    spr(g, SP.spring, hx, hy - 12, 0, .9, sy);
    const wob = .3 * Math.sin(pop * 28) * Math.exp(-pop * 5);
    const wink = t > 9.7;
    spr(g, wink ? SP.avoWink : SP.avoFace, hx, hy - 12 - 100 * sy, wob, .95, .95 * (wink ? 1.03 : 1));
  }
  // arm & hat: hat rides with the glove once grabbed
  const grabbed = t > 9.16;
  const hatPos = grabbed ? [gl[0] - 73, gl[1] - 11] : [hx, hy + 20];
  const hatRot = grabbed ? -.18 * seg(t, 9.2, 9.34) : 0;
  spr(g, SP.bowler, hatPos[0], hatPos[1], hatRot, 1.2);
  spr(g, SP.upperArm, sh[0], sh[1], a1, .95);
  spr(g, SP.forearm, el[0], el[1], a2, .95);
  spr(g, SP.basket, bx, by);
  g.restore();
}
