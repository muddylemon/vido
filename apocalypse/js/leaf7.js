// leaf7.js — VII: Here is Wisdom. The judgment seat, the sorting, the mirror, the number, the flood.
'use strict';
let L7_NOW = 0;
const L7_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.L7_SPEC),
  overflow: t => t > 117,
  get noFrame() { return L7_NOW > 117; }
};
const L7_SW = i => 104.5 + .8 * i, L7_N = 10, L7_SAVED = [2, 7];   // ten sweeps of the staff; two are let in
const L7_SEER = [850, 556, .62];                                  // the seer: feet position, scale (faces right)
const L7_S = [960, 596];                                         // the sorting spot
const L7_DOOR = [1020, 340];                                     // door centre (drawn at .8 → 240×400, bottom at 540)
const L7_GLASS = 83.5, L7_R = 30;                                // mirror: glass centre above the handle pivot; glass radius

function buildLeaf7() {
  seed(707); const L = SP.l7 = {};
  // a plainer stone wall than Leaf 0's, with the same floor
  L.wall = mk(504, 580); const g = L.wall.getContext('2d');
  g.fillStyle = PAL.vellum; g.fillRect(0, 0, 504, 580);
  for (let y = 0, r = 0; y < 470; y += 46, r++) {
    g.strokeStyle = PAL.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, y + 46 + rnd(-.5, .5)); g.lineTo(504, y + 46 + rnd(-.5, .5)); g.stroke();
    for (let x = (r % 2) * 42; x < 504; x += 84) { g.beginPath(); g.moveTo(x + rnd(-.5, .5), y); g.lineTo(x + rnd(-.5, .5), y + 46); g.stroke(); }
  }
  hatch(g, rect(0, 0, 504, 470), .03, 6, .6, PAL.ink, [0, 0, 504, 470], .16);
  xhatch(g, [rect(0, 0, 504, 470), poly([[0, 0], [504, 0], [504, 60], [300, 130], [200, 130], [0, 60]])], .7, 5, .7, PAL.ink, [0, 0, 504, 140], .3);  // vault shadow
  g.fillStyle = PAL.vellum2; g.fillRect(0, 470, 504, 110); g.strokeStyle = PAL.ink; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 470); g.lineTo(504, 470); g.stroke();
  for (let i = 0; i < 9; i++) { const x = i * 70 - 60; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, 580); g.lineTo(x + 60, 470); g.stroke(); }
  hatch(g, rect(0, 470, 504, 110), 0, 6, .7, PAL.ink, [0, 470, 504, 580], .3);

  // the throne: a high-backed chair with finials, the lectern's book on its seat (pivot bottom-centre)
  L.throne = cutout(110, 220, (g, w, h) => {
    const back = g2 => { g2.beginPath(); g2.moveTo(12, h - 40); g2.lineTo(12, 30); g2.lineTo(22, 6); g2.lineTo(32, 30); g2.lineTo(w / 2, 22); g2.lineTo(w - 32, 30); g2.lineTo(w - 22, 6); g2.lineTo(w - 12, 30); g2.lineTo(w - 12, h - 40); g2.closePath(); };
    ink(g, back, PAL.vellum, 2.4); hatch(g, back, 1.55, 5, .8, PAL.ink, [0, 0, w, h], .3);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(26, h - 50); g.lineTo(26, 70); g.quadraticCurveTo(w / 2, 20, w - 26, 70); g.lineTo(w - 26, h - 50); g.stroke();   // lancet tracery
    g.beginPath(); g.moveTo(w / 2, 36); g.lineTo(w / 2, h - 50); g.stroke();
    for (const x of [8, w - 16]) { const leg = g2 => { g2.beginPath(); g2.rect(x, h - 54, 8, 54); }; ink(g, leg, PAL.vellum, 2); hatch(g, leg, 0, 4, .8, PAL.ink, [0, 0, w, h], .4); }
    const seat = g2 => { g2.beginPath(); g2.rect(4, h - 70, w - 8, 16); }; ink(g, seat, PAL.vellum2, 2.2);
    const bk = g2 => { g2.beginPath(); g2.moveTo(22, h - 72); g2.quadraticCurveTo(w / 2, h - 86, w - 22, h - 72); g2.lineTo(w - 22, h - 66); g2.quadraticCurveTo(w / 2, h - 80, 22, h - 66); g2.closePath(); };
    ink(g, bk, PAL.vellum, 1.6); g.strokeStyle = PAL.ink; g.lineWidth = .8; g.beginPath(); g.moveTo(w / 2, h - 82); g.lineTo(w / 2, h - 70); g.stroke();
  }, { ax: .5, ay: 1 });
  // the staff (pivot where the hand grips it, 28% down)
  L.staff = cutout(16, 280, (g, w, h) => {
    const rod = g2 => { g2.beginPath(); g2.moveTo(5, 14); g2.lineTo(11, 14); g2.lineTo(10, h); g2.lineTo(6, h); g2.closePath(); };
    ink(g, rod, PAL.vellum, 2); hatch(g, rod, 1.5, 3, .7, PAL.ink, [0, 0, w, h], .5);
    const knob = g2 => { g2.beginPath(); g2.arc(8, 10, 7, 0, 6.283); }; ink(g, knob, PAL.gold2, 1.8);
  }, { ax: .5, ay: .28 });
  // the hand-mirror (pivot at the handle's end); glass centre L7_GLASS above the pivot, radius L7_R
  L.mirror = cutout(72, 124, (g, w, h) => {
    const handle = g2 => { g2.beginPath(); g2.moveTo(31, 70); g2.lineTo(41, 70); g2.lineTo(39, h - 2); g2.lineTo(33, h - 2); g2.closePath(); };
    ink(g, handle, PAL.vellum, 2); hatch(g, handle, 1.5, 3, .7, PAL.ink, [0, 0, w, h], .5);
    const frame = g2 => { g2.beginPath(); g2.arc(36, 38, 36, 0, 6.283); }; ink(g, frame, PAL.ink2, 2); hatch(g, frame, .8, 3, .8, PAL.vellum, [0, 0, w, h], .35);
    const glass = g2 => { g2.beginPath(); g2.arc(36, 38, 30, 0, 6.283); }; ink(g, glass, PAL.vellum2, 1.6); hatch(g, glass, -.8, 4, .7, PAL.ink, [0, 0, w, h], .18);
  }, { ax: .5, ay: .98 });
  // townsfolk, four types × three impressions (plain, gold for the saved, vermilion for the damned)
  L.folk = {};
  for (const tint of ['plain', 'gold', 'red']) L.folk[tint] = [0, 1, 2, 3].map(v => cutout(32, 46, (g, w, h) => l7_folk(g, w, h, v, tint), { ax: .5, ay: 1 }));
}
function l7_folk(g, w, h, v, tint) {
  const fill = tint === 'gold' ? PAL.gold2 : PAL.vellum, col = tint === 'red' ? PAL.vermilion : PAL.ink;
  const body = g2 => { g2.beginPath(); if (v === 2) { g2.moveTo(w * .32, h * .36); g2.lineTo(w * .68, h * .36); g2.lineTo(w * .92, h); g2.lineTo(w * .08, h); } else { g2.moveTo(w * .3, h * .36); g2.lineTo(w * .7, h * .36); g2.lineTo(w * .78, h * .78); g2.lineTo(w * .22, h * .78); } g2.closePath(); };
  ink(g, body, fill, 1.6, col); hatch(g, [body, half(0, 0, w * .5, h)], 1.3, 3, .7, col, [0, 0, w, h], .5);
  if (v !== 2) { g.strokeStyle = col; g.lineWidth = 2.2; g.beginPath(); g.moveTo(w * .38, h * .78); g.lineTo(w * .36, h); g.moveTo(w * .62, h * .78); g.lineTo(w * .64, h); g.stroke(); }
  const head = g2 => { g2.beginPath(); g2.arc(w / 2, h * .22, h * .13, 0, 6.283); }; ink(g, head, fill, 1.5, col);
  g.fillStyle = col; g.beginPath(); g.arc(w * .46, h * .21, 1, 0, 6.283); g.fill(); g.beginPath(); g.arc(w * .56, h * .21, 1, 0, 6.283); g.fill();
  if (v === 0) { const hat = g2 => { g2.beginPath(); g2.rect(w * .36, h * .02, w * .28, h * .1); }; ink(g, hat, fill, 1.4, col); g.strokeStyle = col; g.lineWidth = 1.6; g.beginPath(); g.moveTo(w * .24, h * .12); g.lineTo(w * .76, h * .12); g.stroke(); }
  if (v === 1) { const hood = g2 => { g2.beginPath(); g2.moveTo(w * .34, h * .26); g2.quadraticCurveTo(w * .3, h * .02, w / 2, 0); g2.quadraticCurveTo(w * .7, h * .02, w * .66, h * .26); g2.closePath(); }; ink(g, hood, fill, 1.4, col); }
  if (v === 2) { const bon = g2 => { g2.beginPath(); g2.arc(w / 2, h * .2, h * .15, Math.PI * 1.05, Math.PI * 1.95); g2.closePath(); }; ink(g, bon, fill, 1.4, col); }
  if (v === 3) { g.strokeStyle = col; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(w * .42 + i * 1.4, h * .3); g.lineTo(w * .4 + i * 1.6, h * .4); g.stroke(); } }
  if (tint === 'gold') wash(g, body, w / 2, h * .6, h * .5, PAL.gold, .5);
  if (tint === 'red') wash(g, body, w / 2, h * .6, h * .5, PAL.vermilion, .35);
}

// ---------------- the seer's pose ----------------
// front arm angle a (positive swings toward the figures); the hand hangs 89 px below the shoulder pivot
function l7_hand(a) { return [-30 - 89 * Math.sin(a), -150 + 89 * Math.cos(a)]; }
function l7_pose(t) {
  let a = -.35;
  for (let i = 0; i < L7_N; i++) { const T = L7_SW(i); if (t >= T && t < T + .6) a += .85 * snap(t, T, .1) * (1 - eIO(seg(t, T + .15, T + .55))); }
  const staff = t < 112.5, mirror = t >= 113;
  if (t >= 112.5 && t < 113) a = lerp(-.35, .3, eOut(seg(t, 112.5, 112.9)));      // sets the staff against the throne
  let mirrorRot = 0;
  if (mirror) { const k = eOut(seg(t, 113, 114)); a = lerp(.3, 1.8, k); mirrorRot = lerp(-.3, -2.4, k); }   // the glass tilted up before the face
  return { armL: a, armR: .15, staff, mirror, mirrorRot, headTilt: mirror ? .12 * eOut(seg(t, 113.2, 114)) : 0 };
}
// world position of the glass centre while the mirror is held
function l7_mirrorCentre(pose) {
  const [X, Y, s] = L7_SEER, a = pose.armL, m = a + pose.mirrorRot, [hx, hy] = l7_hand(a);
  const gx = hx + L7_GLASS * Math.sin(m), gy = hy - L7_GLASS * Math.cos(m);
  return [X - s * gx, Y + s * gy];
}
function l7_seer(g, pose) {
  const [X, Y, s] = L7_SEER, C = SP.common, L = SP.l7;
  g.save(); g.translate(X, Y); g.scale(-s, s);                   // mirrored: he faces the door and the line
  spr(g, C.seerArm, 28, -150, pose.armR);
  spr(g, C.seerBody, 0, 0);
  spr(g, C.seerHood, 2, -196, pose.headTilt);
  const a = pose.armL, [hx, hy] = l7_hand(a);
  spr(g, C.seerArm, -30, -150, a);
  if (pose.staff) spr(g, L.staff, hx, hy, a + .1);
  if (pose.mirror) spr(g, L.mirror, hx, hy, a + pose.mirrorRot);
  g.restore();
}

// ---------------- the scene ----------------
function l7_scene(g, p, t, tq, pose) {
  const L = SP.l7, C = SP.common;
  g.drawImage(L.wall, p.x, p.y);
  // the door opens a crack (hinged at its left) for each of the saved, then shuts
  const [dx, dy] = L7_DOOR; let gap = 0;
  for (const i of L7_SAVED) { const T = L7_SW(i); gap = Math.max(gap, 18 * clamp(snap(t, T + .3, .15)) * (1 - clamp(snap(t, T + .85, .12)))); }
  if (gap > .5) { g.fillStyle = PAL.ink; g.fillRect(dx + 120 - gap - 2, dy - 100, gap + 2, 300); }
  g.save(); g.translate(dx - 120, 0); g.scale(1 - gap / 240, 1); g.translate(-(dx - 120), 0); spr(g, C.door, dx, dy, 0, .8); g.restore();
  // the dais and the throne that was a lectern
  seed(71);
  const st1 = rrect(p.x + 14, 516, 216, 24, 1), st2 = rrect(p.x + 30, 496, 184, 20, 1);
  ink(g, st1, PAL.vellum2, 2.2); hatch(g, st1, 0, 4, .7, PAL.ink, [p.x, 510, p.x + 240, 545], .45);
  ink(g, st2, PAL.vellum2, 2.2); hatch(g, st2, 0, 4, .7, PAL.ink, [p.x, 490, p.x + 240, 520], .45);
  spr(g, L.throne, 792, 496);
  if (t >= 112.5) spr(g, L.staff, 838, 470, .2);                 // the staff, set down against the throne
  // the line of the world, waiting to be divided
  const S = L7_S; let m = 0;
  for (let i = 0; i < L7_N; i++) if (t > L7_SW(i) + .15) m = i + 1;
  const shift = m > 0 ? (m - 1) + eOut(seg(t, L7_SW(m - 1) + .15, L7_SW(m - 1) + .45)) : 0;
  const walk = Math.abs(Math.sin(tq * 6)) * 1.5, flying = [];
  for (let i = 0; i < L7_N; i++) {
    const T = L7_SW(i), v = i % 4, saved = L7_SAVED.includes(i);
    if (t <= T + .15) {
      const q = i - shift, x = S[0] + (i % 2 ? 6 : -6), y = S[1] + 46 * q + (q > .1 ? walk : 0);
      if (y < p.y + p.h + 50) spr(g, L.folk.plain[v], x, y, 0, 1);
      continue;
    }
    const u = seg(t, T + .15, T + .75); if (u >= 1) continue;
    if (saved) {
      const D = [dx + 108, dy + 196], k = eIO(u), sc = lerp(1, .72, u), al = 1 - seg(u, .8, 1);
      flying.push(() => spr(g, L.folk.gold[v], lerp(S[0], D[0], k), lerp(S[1], D[1], k), 0, sc, sc, al));
    } else {
      const dir = i % 2 ? 1 : -1, x = S[0] + dir * 340 * u, y = S[1] - 170 * Math.sin(Math.PI * u) + 40 * u * u, rot = dir * 7 * u;
      flying.push(() => spr(g, L.folk.red[v], x, y, rot, 1));
    }
  }
  l7_seer(g, pose);
  for (const f of flying) f();
}

// ---------------- the glass ----------------
function l7_reflection(g, M, z, t) {
  const R = L7_R * z, C = SP.common, sH = .42 * z;
  g.save(); clipInner(g);
  g.beginPath(); g.arc(M[0], M[1], R, 0, 6.283); g.fillStyle = PAL.vellum2; g.fill();
  g.save(); g.beginPath(); g.arc(M[0], M[1], R, 0, 6.283); g.clip();
  g.strokeStyle = PAL.ink; g.globalAlpha = .1; g.lineWidth = Math.max(1, z * .3);
  for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(M[0] - R + i * R * .3, M[1] - R); g.lineTo(M[0] - R + i * R * .3 + R * .8, M[1] + R); g.stroke(); }
  g.globalAlpha = 1;
  spr(g, C.seerHood, M[0] + 12.6 * sH, M[1] + 46 * sH, 0, sH);     // his own face, centred in the glass
  const na = seg(t, 116.5, 116.8);                                  // the number inked on the brow
  if (na > 0) {
    g.save(); g.translate(M[0] - 1 * sH, M[1] - 15 * sH); g.font = font(13 * sH, '', 'bold'); g.textAlign = 'center'; g.textBaseline = 'middle';
    if (na < 1) { g.globalAlpha = (1 - na) * .6; g.filter = `blur(${Math.max(1, sH * .5)}px)`; g.fillStyle = PAL.vermilion; g.fillText('66', 0, 0); g.filter = 'none'; }
    g.globalAlpha = na; g.fillStyle = PAL.vermilion; g.fillText('66', 0, 0); g.restore();
  }
  g.restore();
  // the rim, and the eyes that open in it
  g.beginPath(); g.arc(M[0], M[1], R + 3 * z, 0, 6.283); g.strokeStyle = PAL.ink; g.lineWidth = 6 * z; g.stroke();
  g.beginPath(); g.arc(M[0], M[1], R + 3 * z, 0, 6.283); g.strokeStyle = PAL.vellum; g.globalAlpha = .22; g.lineWidth = Math.max(1, z * .35); g.setLineDash([z * 2, z * 3]); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
  for (let i = 0; i < 12; i++) {
    const open = clamp(snap(t, 115 + i / 6, .12)); if (open <= 0) continue;
    const th = i / 12 * 6.283 - Math.PI / 2, rr = R + 3 * z;
    g.save(); g.translate(M[0] + Math.cos(th) * rr, M[1] + Math.sin(th) * rr); g.rotate(th + Math.PI / 2);
    eye(g, 0, 0, 2.8 * z, [0, .8], 1 - open); g.restore();
  }
  g.restore();
}

// ---------------- the frame breaks; the ink overflows the banks ----------------
function l7_capsWidth(text, size, spacing, weight) { MG.font = font(size, '', weight); let w = 0; for (const ch of text.toUpperCase()) w += MG.measureText(ch).width + spacing; return w - spacing; }
function l7_flood(g, t) {
  panelFrame(g);
  const k = seg(t, 117, 118), ca = seg(t, 117, 117.3), P = BOOK.panel, Cx = 942, Cy = 360;
  if (ca > 0 && k < 1) {
    const starts = [[P.x + P.w, P.y + 200, 1, 0], [P.x + 160, P.y, 0, -1], [P.x + 380, P.y + P.h, 0, 1], [P.x + P.w, P.y + 480, 1, 0], [P.x, P.y + 430, -1, 0], [P.x + 40, P.y, 0, -1]];
    g.save(); g.beginPath(); g.rect(40, 24, 1200, 672); g.clip(); g.globalAlpha = ca; g.lineCap = 'round'; g.lineJoin = 'round';
    starts.forEach(([x, y, hx, vy], i) => {
      g.beginPath(); g.moveTo(x, y); let cx = x, cy = y;
      for (let j = 1; j <= 5; j++) { cx += hx * 9 * j + (hash(i * 9 + j) - .5) * 24; cy += vy * 9 * j + (hash(i * 7 + j + 3) - .5) * 24; g.lineTo(cx, cy); }
      g.strokeStyle = PAL.vermilion; g.lineWidth = 3.5; g.stroke(); g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.stroke();
    });
    g.restore();
  }
  if (k > 0) {
    const R = 1060 * eIO(k), rad = a => R * (1 + .06 * Math.sin(a * 7 + t * 9) + .04 * Math.sin(a * 13 - t * 6));
    g.save(); g.beginPath(); g.rect(40, 24, 1200, 672); g.clip();
    const pts = []; for (let i = 0; i < 72; i++) { const a = i / 72 * 6.283; pts.push([Cx + Math.cos(a) * rad(a), Cy + Math.sin(a) * rad(a)]); }
    g.fillStyle = PAL.ink; smoothPoly(g, pts); g.fill();
    for (let j = 1; j <= 3; j++) {                         // engraved water lines behind the front
      g.beginPath();
      for (let i = 0; i < 72; i++) { const a = i / 72 * 6.283, r = rad(a) - j * 16 * (1 + .3 * Math.sin(a * 5 + j)); const x = Cx + Math.cos(a) * r, y = Cy + Math.sin(a) * r; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath(); g.strokeStyle = PAL.vellum; g.globalAlpha = .4 / j; g.lineWidth = 1.6; g.setLineDash([10, 14]); g.stroke();
    }
    g.setLineDash([]); g.globalAlpha = .7; g.strokeStyle = PAL.vellum; g.lineWidth = 1.8;
    for (let i = 0; i < (R > 110 ? 16 : 0); i++) {         // foam curls on the crest (once the ink has welled past the brow)
      const a = i / 16 * 6.283 + .2, r = rad(a) - 6, x = Cx + Math.cos(a) * r, y = Cy + Math.sin(a) * r;
      g.beginPath(); g.arc(x, y, 7 + 3 * hash(i), a + Math.PI * .2, a + Math.PI * 1.4); g.stroke();
    }
    g.globalAlpha = 1;
    if (k >= 1) g.fillRect(40, 24, 1200, 672);
    g.restore();
  }
  if (t >= 118) {                                          // HERE IS WISDOM, knocked out of the ink
    const words = [['Here', 118.2], ['Is', 118.6], ['Wisdom', 119.0]], size = 44, sp = 9, gapW = 34;
    const ws = words.map(([w]) => l7_capsWidth(w, size, sp, 'bold')), total = ws.reduce((a, b) => a + b, 0) + gapW * 2;
    let x = 640 - total / 2;
    g.save();
    words.forEach(([w, at], i) => { g.globalAlpha = seg(t, at, at + .35); caps(g, w, x, 380, size, PAL.vellum, sp, 'left', 'bold'); x += ws[i] + gapW; });
    g.globalAlpha = seg(t, 119.6, 120); caps(g, 'Rev. xiii. 18', 640, 424, 16, PAL.vermilion, 3, 'center');
    g.restore();
  }
}

function leaf7(g, t) {
  L7_NOW = t;
  spread(g, t, L7_SPEC, (g, p) => {
    const tq = stepT(t, 15), pose = l7_pose(t);
    const M = pose.mirror ? l7_mirrorCentre(pose) : null;
    const z = M ? 1 + 7 * eIO(seg(t, 113.8, 116)) : 1;
    g.save(); clipInner(g);
    if (z > 1) { g.translate(M[0], M[1]); g.scale(z, z); g.translate(-M[0], -M[1]); }
    l7_scene(g, p, t, tq, pose);
    g.restore();
    if (M) l7_reflection(g, M, z, t);
    if (t > 117) l7_flood(g, t);
  });
}
