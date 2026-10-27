// sceneA.js — 1: the cake ride & catapult, 2: down the throat-pipe.
'use strict';

function withCam(g, cx, cy, z, rot, fn) {
  g.save(); g.translate(W / 2, H / 2); if (rot) g.rotate(-rot); g.scale(z, z); g.translate(-cx, -cy); fn(); g.restore();
}
const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

// ---------------- Scene 1 ----------------
const T1_COLLAPSE = 1.30, T1_END = 1.76;
const THROAT = [1000, 492];
function cakeRig(t, tq) {
  const k = eIO(seg(t, 0, 1.22));
  const fx = lerp(170, 470, k) + (t > T1_COLLAPSE ? 0 : 0), fy = 572 + Math.sin(tq * 9) * 5;
  let frot = -.04 + Math.sin(tq * 7) * .02;
  if (t > T1_COLLAPSE) frot += -.42 * eBack(seg(t, T1_COLLAPSE, T1_COLLAPSE + .12)) + .5 * eIn(seg(t, T1_COLLAPSE + .15, T1_END));
  // wobble grows toward the collapse; tiny freeze just before it
  const frozen = t > 1.19 && t < T1_COLLAPSE;
  const tw = frozen ? 1.19 : tq;
  const amp = .35 + 1.4 * eIn(seg(t, .3, 1.19));
  const base = rot2(60, -18, frot);
  let p = [fx + base[0], fy + base[1]], a = frot;
  const layers = [];
  for (let i = 0; i < 7; i++) {
    a += amp * Math.sin(tw * 7.5 - i * .6) * (.012 + i * .007);
    layers.push({ x: p[0] + Math.sin(i * 2.1) * 7, y: p[1], a });
    const d = rot2(0, -43, a); p = [p[0] + d[0], p[1] + d[1]];
  }
  a += amp * Math.sin(tw * 7.5 - 4.6) * .06;
  return { fx, fy, frot, layers, top: { x: p[0], y: p[1], a } };
}
function topPath(t, rig0) {    // the catapulted icing-crown (that's us) arcs into the throat
  const k = seg(t, T1_COLLAPSE, T1_COLLAPSE + .34), e = eIn(k) * .6 + k * .4;
  const x = lerp(rig0.x, THROAT[0], e), y = lerp(rig0.y, THROAT[1], e) - Math.sin(k * Math.PI) * 70;
  return { x, y, a: rig0.a + k * 6.8 };
}
function scene1(g, t) {
  const tq = stepT(t, 15);
  const rig = cakeRig(t, tq);
  const rig0 = cakeRig(T1_COLLAPSE - .001, stepT(T1_COLLAPSE - .001, 15));
  const us = t < T1_COLLAPSE ? rig.top : topPath(t, rig0.top);

  // camera: wide → climbs onto the cake (first-person ride) → follows our flight into the throat
  let cx = 640, cy = 360, z = 1, r = 0;
  const kr = eIO(seg(t, .38, 1.0));
  const rideC = [rig.top.x + 150, rig.top.y + 150];
  cx = lerp(640, rideC[0], kr); cy = lerp(360, rideC[1], kr); z = lerp(1, 1.6, kr); r = rig.top.a * .7 * kr;
  if (t >= T1_COLLAPSE) {
    const kc = seg(t, T1_COLLAPSE, T1_END), rc0 = [rig0.top.x + 150, rig0.top.y + 150];
    const follow = eIO(clamp(kc * 1.6));
    cx = lerp(rc0[0], us.x, follow); cy = lerp(rc0[1], us.y, follow);
    cx = lerp(cx, THROAT[0], eIn(kc)); cy = lerp(cy, THROAT[1], eIn(kc));
    z = 1.6 * Math.pow(40 / 1.6, eIn(kc)); r = rig0.top.a * .7 * (1 - eOut(kc));
  }
  withCam(g, cx, cy, z, r, () => {
    g.drawImage(SP.parlour, -110, -60);
    // the Diner's face, jaw hinging open in two stiff jerks
    const jawA = .16 * snap(t, .62, .1) + .2 * snap(t, .9, .1);
    // mouth cavity = the wedge between the upper teeth and the hinged jaw's lip
    const jp = (lx, ly) => { const [x, y] = rot2((lx - 595) * .9, (ly - 15) * .9, -jawA); return [1282 + x, 424 + y]; };
    spr(g, SP.faceBack, 1030, 540);
    g.save(); g.beginPath(); g.moveTo(...jp(120, 30)); g.quadraticCurveTo(800, 400, 900, 408); g.lineTo(1300, 400);
    for (const [lx, ly] of [[600, 22], [490, 42], [320, 56], [180, 44]]) g.lineTo(...jp(lx, ly));
    g.closePath(); g.clip();
    g.translate(THROAT[0], THROAT[1] - 20); g.drawImage(SP.throat, -310, -220); g.restore();
    spr(g, SP.jaw, 1282, 424, -jawA, .9, .9);
    spr(g, SP.mouthUp, 1032, 146, 0, .9, .9);
    if (t > .95 && t < 1.25) {                                            // gold-tooth glint
      const k = seg(t, .95, 1.25), s = Math.sin(k * Math.PI) * 26;
      g.save(); g.translate(1032 + (5 * 44 + 196 + 12 - 350) * .9, 146 + 285 * .9); g.rotate(k * 2); g.fillStyle = '#fff8d8';
      g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? s * .22 : s, a = i / 8 * 6.283; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill(); g.restore();
    }
    // the fork & the tower
    spr(g, SP.fork, rig.fx, rig.fy, rig.frot);
    if (t < T1_COLLAPSE) {
      rig.layers.forEach((L, i) => spr(g, SP.layers[i], L.x, L.y, L.a));
    } else {
      const dt = t - T1_COLLAPSE;
      rig0.layers.forEach((L, i) => {
        seed(500 + i);
        const vx = (i % 2 ? -1 : 1) * rnd(120, 420), vy = -rnd(150, 520) - i * 40, sp = rnd(-6, 6);
        spr(g, SP.layers[i], L.x + vx * dt, L.y + vy * dt + 2200 * dt * dt, L.a + sp * dt);
      });
    }
    drawCrown(g, us, tq, t < T1_COLLAPSE ? 1 : 1 - .9 * eIn(seg(t, T1_COLLAPSE, T1_COLLAPSE + .34)));
  });
  // curtains stay on the proscenium (screen space), parting slightly as we fly
  const part = eIn(seg(t, T1_COLLAPSE, T1_END)) * 260;
  spr(g, SP.curtain, -60 - part, -20, 0);
  spr(g, SP.curtain, W + 60 + part, -20, 0, -1, 1);
}
function drawCrown(g, us, tq, s = 1) {
  if (s <= .02) return;
  g.save(); g.translate(us.x, us.y); g.rotate(us.a); g.scale(s, s);
  spr(g, SP.flag, -78, -8, -.1 + Math.sin(tq * 11) * .12);
  spr(g, SP.icing, 0, 0);
  spr(g, SP.cherry, 14, -16, Math.sin(tq * 9 + 1) * .1);
  g.restore();
}

// ---------------- Scene 2 ----------------
const T2_START = T1_END, T2_END = 2.66;
function scene2(g, t) {
  const tl = t - T2_START, tq = stepT(t, 15);
  const dist = 3.2 * tl + 6.5 * tl * tl;
  const vp = (z) => [640 + Math.sin(z * .9 + tl * 2.2) * 30 * z, 360 + Math.cos(z * .7 + tl * 1.7) * 22 * z];
  const bg = g.createRadialGradient(...vp(6), 20, 640, 360, 800);
  bg.addColorStop(0, '#120403'); bg.addColorStop(.35, '#3c0f0b'); bg.addColorStop(1, '#8a3a2e');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // the red glow of the bloodstream at the far end
  const glowK = seg(t, 2.3, T2_END);
  if (glowK > 0) { const [x, y] = vp(5); g.save(); g.globalAlpha = eIn(glowK); g.drawImage(SP.glow, x - 300, y - 300, 600, 600); g.restore(); }
  const SPC = .55;
  const j0 = Math.floor(dist / SPC);
  for (let j = j0 + 14; j >= j0; j--) {
    const z = j * SPC - dist + .35;
    if (z <= .06) continue;
    const s = .95 / z, [x, y] = vp(z);
    const ring = SP.rings[((j % 4) + 4) % 4];
    const a = clamp(1.6 - z * .3);
    spr(g, ring, x, y, j * .7 + tl * .5, s, s, a);
    if (j % 7 === 3) spr(g, SP.valve, x + Math.cos(j) * 380 * s, y + Math.sin(j) * 380 * s, tq * 9, s * .9, s * .9, a);
  }
  // our crown of icing & its cherry rattle down the pipe with us
  const us = { x: 640 + Math.sin(tq * 5) * 40 + 120, y: 520 + Math.cos(tq * 4) * 25, a: tq * 3.1 };
  drawCrown(g, { x: lerp(THROAT[0] - 350, us.x, eOut(seg(t, T2_START, T2_START + .25))), y: us.y + 120 * (1 - eOut(seg(t, T2_START, T2_START + .25))), a: us.a }, tq);
  for (let i = 0; i < 6; i++) {                          // tumbling crumbs
    seed(600 + i); const ph = rnd(0, 1), sx = rnd(-1, 1), sy = rnd(-1, 1);
    const k = ((tl * .9 + ph) % 1), s = .15 + k * k * 1.2;
    spr(g, SP.layers[i], 640 + sx * 700 * k * k, 360 + sy * 420 * k * k, tq * 4 + i, s * .5, s * .5);
  }
}
