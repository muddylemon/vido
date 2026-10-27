// leaf1.js — I: Of the Four Quadrants. Four horsemen ride into a 2×2 matrix; the fourth sleeps under a lapis tide.
'use strict';
const L1_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.L1_SPEC),
  overflow: t => t > 21
};
let L1_Q = [];

// a tapered limb along a centreline: pts [[x,y]...], ws half-widths per point; hoof = black hoof at the end
function l1_limb(g, pts, ws, fill = PAL.vellum, hoof = true) {
  const Lp = [], Rp = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    Lp.push([pts[i][0] + nx * ws[i], pts[i][1] + ny * ws[i]]); Rp.push([pts[i][0] - nx * ws[i], pts[i][1] - ny * ws[i]]);
  }
  ink(g, poly(Lp.concat(Rp.reverse())), fill, 2);
  if (hoof) { const h = pts[pts.length - 1]; g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(h[0], h[1] - 1, ws[ws.length - 1] + 3, 4, 0, 0, 6.283); g.fill(); }
}

function buildLeaf1() {
  seed(11); const L = SP.l1 = {};
  const I = BOOK.inner, qw = I.w / 2, qh = I.h / 2;
  L1_Q = [
    { x: I.x, y: I.y, w: qw, h: qh, label: 'Unjust War', dir: 1, halt: 13.0, attr: 'sword', armUp: true },
    { x: I.x + qw, y: I.y, w: qw, h: qh, label: 'Just War', dir: -1, halt: 14.2, attr: 'scabbard', armUp: false },
    { x: I.x, y: I.y + qh, w: qw, h: qh, label: 'Just Peace', dir: 1, halt: 15.4, attr: 'dove', armUp: true },
    { x: I.x + qw, y: I.y + qh, w: qw, h: qh, label: 'Unjust Peace', dir: -1, halt: 16.6, attr: 'pillow', armUp: false }
  ];
  // --- the horse (230×150, facing right, pivot at the hooves' ground point) ---
  L.horse = cutout(230, 150, (g, w, h) => {
    const tail = g2 => { g2.beginPath(); g2.moveTo(48, 54); g2.quadraticCurveTo(16, 64, 6, 108); g2.quadraticCurveTo(12, 112, 18, 108); g2.quadraticCurveTo(30, 74, 56, 66); g2.closePath(); };
    ink(g, tail, PAL.vellum, 2); hatch(g, tail, 1.25, 3, .8, PAL.ink, [0, 0, w, h], .75);
    const barrel = g2 => smoothPoly(g2, [[46, 54], [72, 42], [112, 38], [152, 40], [176, 50], [184, 70], [174, 92], [142, 102], [92, 104], [58, 96], [40, 78]]);
    ink(g, barrel, PAL.vellum, 2.4);
    hatch(g, [barrel, half(0, 74, w, h)], .15, 4.5, .85, PAL.ink, [0, 0, w, h], .5);
    hatch(g, [barrel, half(150, 30, w, 80)], 1.0, 5, .8, PAL.ink, [0, 0, w, h], .3);
    const neck = g2 => { g2.beginPath(); g2.moveTo(148, 44); g2.quadraticCurveTo(170, 34, 190, 10); g2.lineTo(214, 18); g2.quadraticCurveTo(202, 46, 180, 62); g2.quadraticCurveTo(166, 56, 148, 50); g2.closePath(); };
    ink(g, neck, PAL.vellum, 2.4); hatch(g, [neck, half(170, 20, 230, 70)], .95, 4, .8, PAL.ink, [0, 0, w, h], .45);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.7;
    for (let i = 0; i < 10; i++) { const k = i / 9, x = lerp(150, 192, k), y = lerp(42, 10, k); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 6, y - 4, x - 9 + rnd(-2, 2), y - 10 + rnd(-2, 2)); g.stroke(); }
    const head = g2 => { g2.beginPath(); g2.moveTo(188, 12); g2.lineTo(204, 2); g2.lineTo(216, 18); g2.lineTo(230, 36); g2.lineTo(226, 48); g2.lineTo(212, 48); g2.lineTo(200, 36); g2.lineTo(186, 26); g2.closePath(); };
    ink(g, head, PAL.vellum, 2.2); hatch(g, [head, half(200, 30, 232, 50)], .6, 3.5, .7, PAL.ink, [0, 0, w, h], .4);
    const ear = g2 => { g2.beginPath(); g2.moveTo(198, 8); g2.lineTo(196, -6); g2.lineTo(206, 4); g2.closePath(); }; ink(g, ear, PAL.vellum, 1.6);
    g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(205, 18, 3.2, 2.4, .4, 0, 6.283); g.fill();
    g.beginPath(); g.arc(226, 42, 1.8, 0, 6.283); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(222, 46); g.lineTo(230, 44); g.stroke();
    g.lineWidth = 1.3; g.beginPath(); g.moveTo(212, 20); g.lineTo(218, 44); g.moveTo(192, 22); g.quadraticCurveTo(208, 30, 222, 44); g.stroke();   // bridle
    const cloth = g2 => { g2.beginPath(); g2.moveTo(92, 40); g2.lineTo(146, 40); g2.lineTo(150, 72); g2.lineTo(96, 76); g2.closePath(); };
    ink(g, cloth, PAL.vellum, 1.8); hatch(g, cloth, .8, 3.2, .8, PAL.ink, [0, 0, w, h], .6);
    const saddle = g2 => { g2.beginPath(); g2.moveTo(98, 42); g2.quadraticCurveTo(120, 30, 142, 40); g2.quadraticCurveTo(122, 48, 98, 46); g2.closePath(); }; ink(g, saddle, PAL.vellum2, 1.8);
  }, { ax: .5, ay: 1 });
  // legs: a/b gallop frames, s standing, k kneeling (front legs folded)
  const SETS = {
    a: [[[72, 92], [60, 118], [50, 140]], [[168, 92], [172, 118], [178, 140]], [[62, 92], [42, 116], [24, 140]], [[158, 92], [182, 112], [204, 138]]],
    b: [[[72, 92], [86, 118], [90, 140]], [[168, 92], [158, 118], [146, 138]], [[62, 92], [80, 116], [74, 140]], [[158, 92], [150, 116], [132, 136]]],
    s: [[[76, 92], [74, 118], [74, 140]], [[170, 92], [174, 118], [176, 140]], [[62, 92], [58, 116], [56, 140]], [[156, 92], [158, 116], [158, 140]]],
    k: [[[76, 92], [74, 118], [74, 140]], [[170, 92], [186, 124], [164, 134]], [[62, 92], [58, 116], [56, 140]], [[156, 92], [172, 128], [146, 136]]]
  };
  L.legs = {};
  for (const k in SETS) L.legs[k] = cutout(230, 150, g => { SETS[k].forEach((leg, i) => l1_limb(g, leg, [9, 6.5, 4.5], i < 2 ? PAL.vellum2 : PAL.vellum)); }, { ax: .5, ay: 1 });
  // --- the rider (100×120, pivot at the hips), arm raised or lowered ---
  const rider = up => (g, w, h) => {
    const cape = g2 => { g2.beginPath(); g2.moveTo(38, 22); g2.quadraticCurveTo(14, 50, 8, 96); g2.lineTo(26, 92); g2.quadraticCurveTo(28, 60, 44, 44); g2.closePath(); };
    ink(g, cape, PAL.vellum, 2); hatch(g, cape, 1.1, 4, .8, PAL.ink, [0, 0, w, h], .55);
    l1_limb(g, [[54, 68], [68, 90], [74, 108]], [9, 6.5, 5.5], PAL.vellum, false);
    const boot = g2 => { g2.beginPath(); g2.moveTo(66, 100); g2.lineTo(84, 100); g2.lineTo(92, 114); g2.lineTo(64, 116); g2.closePath(); }; ink(g, boot, PAL.ink2, 1.6);
    const tunic = g2 => { g2.beginPath(); g2.moveTo(32, 20); g2.lineTo(60, 20); g2.lineTo(66, 44); g2.lineTo(62, 74); g2.lineTo(30, 76); g2.lineTo(26, 44); g2.closePath(); };
    ink(g, tunic, PAL.vellum, 2.2); hatch(g, [tunic, half(0, 0, 42, h)], 1.3, 4, .8, PAL.ink, [0, 0, w, h], .5);
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(28, 50); g.lineTo(64, 48); g.stroke();
    if (up) l1_limb(g, [[56, 26], [72, 8], [82, -6]], [7, 5.5, 4.5], PAL.vellum, false); else l1_limb(g, [[56, 26], [72, 46], [78, 60]], [7, 5.5, 4.5], PAL.vellum, false);
    const hand = up ? [82, -6] : [78, 60]; const hp = g2 => { g2.beginPath(); g2.arc(hand[0], hand[1], 6, 0, 6.283); }; ink(g, hp, PAL.vellum, 1.6);
  };
  L.riderUp = cutout(100, 120, rider(true), { ax: .45, ay: 70 / 120 });
  L.riderDown = cutout(100, 120, rider(false), { ax: .45, ay: 70 / 120 });
  L.head = cutout(44, 50, (g, w, h) => {
    const face = g2 => { g2.beginPath(); g2.ellipse(22, 30, 13, 16, 0, 0, 6.283); }; ink(g, face, PAL.vellum, 2);
    hatch(g, [face, half(0, 0, 18, h)], 1.2, 3.5, .7, PAL.ink, [0, 0, w, h], .45);
    const helm = g2 => { g2.beginPath(); g2.moveTo(4, 24); g2.quadraticCurveTo(6, 2, 22, 2); g2.quadraticCurveTo(38, 2, 40, 24); g2.lineTo(44, 26); g2.lineTo(0, 26); g2.closePath(); };
    ink(g, helm, PAL.vellum2, 2); hatch(g, helm, .3, 3, .8, PAL.ink, [0, 0, w, h], .5);
    g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(28, 32, 2.2, 1.6, 0, 0, 6.283); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(30, 34); g.lineTo(36, 40); g.lineTo(31, 41); g.stroke();
    g.beginPath(); g.moveTo(28, 44); g.lineTo(34, 44); g.stroke();
  }, { ax: .5, ay: 1 });
  // --- the four attributes ---
  L.sword = cutout(24, 100, (g, w, h) => {
    const blade = g2 => { g2.beginPath(); g2.moveTo(12, 0); g2.lineTo(17, 8); g2.lineTo(17, 74); g2.lineTo(7, 74); g2.lineTo(7, 8); g2.closePath(); }; ink(g, blade, PAL.vellum, 1.8);
    g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(12, 8); g.lineTo(12, 72); g.stroke();
    const guard = g2 => { g2.beginPath(); g2.rect(1, 74, 22, 5); }; ink(g, guard, PAL.ink2, 1.4);
    const grip = g2 => { g2.beginPath(); g2.rect(9, 79, 6, 14); }; ink(g, grip, PAL.vellum2, 1.4); hatch(g, grip, 0, 2.5, .7, PAL.ink, [0, 0, w, h], .7);
    const pommel = g2 => { g2.beginPath(); g2.arc(12, 96, 4, 0, 6.283); }; ink(g, pommel, PAL.ink2, 1.2);
  }, { ax: .5, ay: .86 });
  L.scabbard = cutout(80, 22, (g, w, h) => {
    const sc = g2 => { g2.beginPath(); g2.moveTo(4, 6); g2.lineTo(70, 2); g2.quadraticCurveTo(80, 8, 70, 18); g2.lineTo(4, 16); g2.closePath(); }; ink(g, sc, PAL.vellum, 1.8); hatch(g, sc, .2, 3, .7, PAL.ink, [0, 0, w, h], .5);
    const hilt = g2 => { g2.beginPath(); g2.rect(0, 2, 6, 18); }; ink(g, hilt, PAL.ink2, 1.2);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.strokeRect(60, 3, 6, 14);
  }, { ax: .1, ay: .5 });
  L.dove = cutout(44, 36, (g, w, h) => {
    const wing = g2 => { g2.beginPath(); g2.moveTo(16, 22); g2.quadraticCurveTo(8, 4, 26, 0); g2.quadraticCurveTo(30, 10, 24, 22); g2.closePath(); }; ink(g, wing, PAL.vellum, 1.6); hatch(g, wing, 1.2, 2.6, .6, PAL.ink, [0, 0, w, h], .5);
    const body = g2 => { g2.beginPath(); g2.ellipse(20, 26, 14, 8, -.2, 0, 6.283); }; ink(g, body, PAL.vellum, 1.6);
    const tail = g2 => { g2.beginPath(); g2.moveTo(8, 24); g2.lineTo(0, 30); g2.lineTo(2, 34); g2.lineTo(10, 30); g2.closePath(); }; ink(g, tail, PAL.vellum, 1.4);
    const hd = g2 => { g2.beginPath(); g2.arc(34, 20, 5, 0, 6.283); }; ink(g, hd, PAL.vellum, 1.6);
    g.fillStyle = PAL.ink; g.beginPath(); g.arc(36, 19, 1.2, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(39, 21); g.lineTo(44, 22); g.lineTo(39, 24); g.closePath(); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(42, 23); g.lineTo(44, 30); g.stroke();
  }, { ax: .3, ay: .95 });
  L.pillow = cutout(64, 40, (g, w, h) => {
    const pl = g2 => { g2.beginPath(); g2.moveTo(4, 6); g2.quadraticCurveTo(32, 0, 60, 6); g2.quadraticCurveTo(64, 20, 60, 34); g2.quadraticCurveTo(32, 40, 4, 34); g2.quadraticCurveTo(0, 20, 4, 6); g2.closePath(); };
    ink(g, pl, PAL.vellum, 1.8); hatch(g, [pl, half(0, 22, w, h)], .1, 3.5, .7, PAL.ink, [0, 0, w, h], .4);
    g.fillStyle = PAL.ink; for (const [x, y] of [[4, 6], [60, 6], [4, 34], [60, 34]]) { g.beginPath(); g.arc(x, y, 2.4, 0, 6.283); g.fill(); }
    g.beginPath(); g.arc(32, 20, 2.2, 0, 6.283); g.fill();
  }, { ax: .5, ay: .5 });
}

// a horseman at ground point (x,y), facing dir (±1), scale s. o: {legs, bob, drop, bodyRot, riderRot, headRot, attr, armUp}
function l1_horseman(g, x, y, dir, s, o) {
  const L = SP.l1; g.save(); g.translate(x, y); g.scale(dir * s, s);
  spr(g, L.legs[o.legs || 's'], 0, 0);
  g.translate(0, (o.drop || 0) - (o.bob || 0)); g.rotate(o.bodyRot || 0);
  spr(g, L.horse, 0, 0);
  g.translate(3, -108); g.rotate(o.riderRot || 0);
  if (o.attr === 'pillow') spr(g, L.pillow, 24, -14, -.25);
  spr(g, o.armUp ? L.riderUp : L.riderDown, 0, 0);
  if (o.attr === 'scabbard') spr(g, L.scabbard, -8, 6, .5);
  spr(g, L.head, 0, -50, o.headRot || 0);
  if (o.attr === 'sword') spr(g, L.sword, 37, -76, .15);
  if (o.attr === 'dove') spr(g, L.dove, 37, -76);
  g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.beginPath();                       // reins to the bit
  if (o.armUp) { g.moveTo(10, -2); g.quadraticCurveTo(60, 24, 104, 2); } else { g.moveTo(33, -10); g.quadraticCurveTo(70, 10, 104, 2); }
  g.stroke(); g.restore();
}

function l1_matrix(g, p, t) {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  const kv = eOut(seg(t, 11.7, 12.4)), kh = eOut(seg(t, 12.0, 12.7));
  g.save(); g.strokeStyle = PAL.ink; g.lineWidth = 3; g.lineCap = 'round'; seed(41);
  const rough = (x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); for (let i = 1; i <= 24; i++) { const k = i / 24; g.lineTo(lerp(x0, x1, k) + rnd(-1.2, 1.2), lerp(y0, y1, k) + rnd(-1.2, 1.2)); } g.stroke(); };
  if (kv > 0) { rough(cx, cy, cx, cy - p.h / 2 * kv); rough(cx, cy, cx, cy + p.h / 2 * kv); }
  if (kh > 0) { rough(cx, cy, cx - p.w / 2 * kh, cy); rough(cx, cy, cx + p.w / 2 * kh, cy); }
  g.globalAlpha = .35; g.lineWidth = 1.4;                                            // slipped second impression
  if (kv > 0) { rough(cx + 1.5, cy, cx + 1.5, cy - p.h / 2 * kv); rough(cx + 1.5, cy, cx + 1.5, cy + p.h / 2 * kv); }
  if (kh > 0) { rough(cx, cy + 1.5, cx - p.w / 2 * kh, cy + 1.5); rough(cx, cy + 1.5, cx + p.w / 2 * kh, cy + 1.5); }
  g.restore();
  L1_Q.forEach((q, i) => {
    const a = seg(t, 12.5 + i * .12, 12.9 + i * .12); if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    caps(g, q.label, q.dir > 0 ? q.x + 16 : q.x + q.w - 16, q.y + 28, 12, i === 3 ? PAL.vermilion : PAL.ink, 2.4, q.dir > 0 ? 'left' : 'right', 'bold');
    seed(50 + i); g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.lineCap = 'round';
    const gy = q.y + q.h - 36; g.beginPath(); g.moveTo(q.x + 18, gy); for (let x = q.x + 18; x <= q.x + q.w - 18; x += 10) g.lineTo(x, gy + rnd(-.8, .8)); g.stroke();
    for (let x = q.x + 30; x < q.x + q.w - 30; x += 34) { const j = rnd(-6, 6); g.beginPath(); g.moveTo(x + j, gy); g.lineTo(x + j - 3, gy - 7); g.moveTo(x + j, gy); g.lineTo(x + j + 2, gy - 9); g.moveTo(x + j, gy); g.lineTo(x + j + 5, gy - 6); g.stroke(); }
    g.restore();
  });
}

function l1_tide(g, q, t) {
  const k = eIO(seg(t, 20, 26)); if (k <= 0) return;
  const bot = q.y + q.h, top = bot - 174 * k;
  g.save(); g.beginPath(); g.rect(q.x, q.y, q.w, q.h); g.clip();
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .9; g.fillStyle = PAL.lapis;
  const edge = x => top + Math.sin(x * .045 + t * 2.5) * 4 + Math.sin(x * .11 - t * 1.7) * 2;
  g.beginPath(); g.moveTo(q.x - 10, edge(q.x - 10));
  for (let x = q.x - 10; x <= q.x + q.w + 10; x += 8) g.lineTo(x, edge(x));
  g.lineTo(q.x + q.w + 10, bot + 20); g.lineTo(q.x - 10, bot + 20); g.closePath(); g.fill();
  g.globalCompositeOperation = 'source-over'; g.strokeStyle = PAL.ink; g.lineWidth = 1; g.globalAlpha = .5;
  for (let y = top + 12; y < bot; y += 13) { g.beginPath(); for (let x = q.x; x <= q.x + q.w; x += 6) { const yy = y + Math.sin(x * .05 + y * .3 + t * 2) * 3; x === q.x ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
  g.strokeStyle = PAL.vellum; g.lineWidth = 2; g.globalAlpha = .85; g.beginPath();
  for (let x = q.x; x <= q.x + q.w; x += 6) { x === q.x ? g.moveTo(x, edge(x) + 1) : g.lineTo(x, edge(x) + 1); } g.stroke();
  g.restore();
}
// the tide seeps under the panel's bottom rule onto the page (drawn unclipped)
function l1_lip(g, p, t) {
  const q = L1_Q[3], d = 13 * eOut(seg(t, 21, 23)), y0 = p.y + p.h;
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .9; g.fillStyle = PAL.lapis;
  g.beginPath(); g.moveTo(q.x + 30, y0 - 1);
  for (let x = q.x + 30; x <= q.x + q.w - 20; x += 6) g.lineTo(x, y0 + d * (.55 + .45 * Math.sin(x * .07 + 1.3)) + Math.sin(x * .2 + t * 2) * .8);
  g.lineTo(q.x + q.w - 20, y0 - 1); g.closePath(); g.fill(); g.restore();
}

function l1_scene(g, p, t) {
  const tq = stepT(t, 15);
  l1_matrix(g, p, t);
  L1_Q.forEach((q, i) => {
    const tStart = q.halt - 1.0; if (t < tStart) return;
    const gy = q.y + q.h - 36, xStart = q.dir > 0 ? p.x - 150 : p.x + p.w + 150, xEnd = q.x + q.w / 2 - q.dir * 10 + (i === 3 ? -16 : 0);
    const k = eIO(seg(t, tStart, q.halt)), x = lerp(xStart, xEnd, k), moving = t < q.halt;
    const o = { attr: q.attr, armUp: q.armUp, legs: moving ? (Math.floor(t * 8) % 2 ? 'a' : 'b') : 's', bob: moving ? 3 * Math.abs(Math.sin(tq * 8 * Math.PI)) : 0 };
    o.bodyRot = -.07 * Math.sin(Math.PI * seg(t, q.halt, q.halt + .3));            // the halt: a lurch and settle
    if (i === 3) {                                                                 // the fourth rider sleeps; the horse kneels
      o.headRot = 1.0 * snap(t, 19.0, .12);
      o.riderRot = .3 * snap(t, 19.15, .15);
      const kn = snap(t, 19.3, .15); if (t >= 19.3) o.legs = 'k';
      o.bodyRot += .1 * kn; o.drop = 6 * kn;
    }
    l1_horseman(g, x, gy, q.dir, .8, o);
  });
  l1_tide(g, L1_Q[3], t);
  // PEACE AND SAFETY unfurls across the fourth quadrant
  const u = eOut(seg(t, 21.5, 22.1));
  if (u > 0) {
    const q = L1_Q[3]; g.save(); g.translate(q.x + q.w / 2, q.y + 52); g.scale(Math.max(.02, u), 1);
    seed(61); ribbon(g, 0, 0, 196, 28, 'Peace and Safety', { fill: PAL.vellum, col: PAL.lapis, size: 13, spacing: 2.6 });
    g.restore();
    g.save(); g.globalAlpha = seg(t, 22.3, 22.8); caps(g, '1 Thess. 5:3', q.x + q.w / 2, q.y + 84, 10, PAL.lapis, 2.2, 'center'); g.restore();
  }
}

function leaf1(g, t) {
  spread(g, t, L1_SPEC, (g, p) => {
    g.save(); clipInner(g); l1_scene(g, p, t); g.restore();
    if (t > 21) l1_lip(g, p, t);
  });
}
