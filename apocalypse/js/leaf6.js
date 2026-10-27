// leaf6.js — VI: Of the Wink. A pope sets down the triple crown, walks to a quiet room, winks, and
// leaves breadcrumbs; the hooded seer crawls in after them on hands and knees.
'use strict';
const L6_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.L6_SPEC)
};
const L6_FLOOR = 600, L6_DOOR = 1070, L6_STAND = 1010;

function buildLeaf6() {
  seed(66); const L = SP.l6 = {};
  // --- the quiet room's small door: the dark opening, and the leaf hinged at its left edge ---
  L.doorway = cutout(130, 210, (g, w, h) => {
    const arch = g2 => { g2.beginPath(); g2.moveTo(0, h); g2.lineTo(0, 62); g2.arc(w / 2, 62, w / 2, Math.PI, 0); g2.lineTo(w, h); g2.closePath(); };
    g.save(); arch(g); g.clip(); g.fillStyle = PAL.ink; g.fillRect(0, 0, w, h); g.restore();
    xhatch(g, arch, .6, 3, 1, PAL.vellum, [0, 0, w, h], .16);
    g.strokeStyle = PAL.ink; g.lineWidth = 3; arch(g); g.stroke();
    g.lineWidth = 1.4;                                              // voussoirs of the arch
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * w / 2, 62 + Math.sin(a) * w / 2); g.lineTo(w / 2 + Math.cos(a) * (w / 2 + 9), 62 + Math.sin(a) * (w / 2 + 9)); g.stroke(); }
    g.beginPath(); g.moveTo(-9, 62); g.lineTo(-9, h); g.moveTo(w + 9, 62); g.lineTo(w + 9, h); g.stroke();
  }, { ax: 0, ay: 1 });
  L.doorLeaf = cutout(120, 204, (g, w, h) => {
    const arch = g2 => { g2.beginPath(); g2.moveTo(0, h); g2.lineTo(0, 58); g2.arc(w / 2, 58, w / 2, Math.PI, 0); g2.lineTo(w, h); g2.closePath(); };
    ink(g, arch, PAL.vellum, 2.4);
    g.save(); arch(g); g.clip();
    for (let x = 0; x < w; x += 30) { g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); hatch(g, rect(x, 0, 30, h), 1.52, 6, .6, PAL.ink, [0, 0, w, h], .3); }
    g.restore();
    const ring = g2 => { g2.beginPath(); g2.arc(w - 26, h * .55, 8, 0, 6.283); }; ink(g, ring, null, 2.2);
    for (const y of [86, 166]) { const hg = g2 => { g2.beginPath(); g2.rect(2, y - 4, 42, 8); }; ink(g, hg, PAL.ink2, 1.2); }
  }, { ax: 0, ay: 1 });
  // --- the pope, in pieces (emblematic: white cassock and cape, spectacles, zucchetto, the red shoes) ---
  const body = foot => cutout(110, 230, (g, w, h) => {
    const shoeA = g2 => { g2.beginPath(); g2.ellipse(w * .4 + (foot ? 10 : -4), h - 6, 13, 5, 0, 0, 6.283); };
    const shoeB = g2 => { g2.beginPath(); g2.ellipse(w * .6 + (foot ? -4 : 10), h - 6, 13, 5, 0, 0, 6.283); };
    ink(g, shoeA, PAL.vermilion, 1.5); ink(g, shoeB, PAL.vermilion, 1.5);
    const cas = g2 => { g2.beginPath(); g2.moveTo(w * .34, 0); g2.lineTo(w * .66, 0); g2.quadraticCurveTo(w * .78, 60, w * .8, 140); g2.lineTo(w * .88, h - 12); g2.lineTo(w * .12, h - 12); g2.lineTo(w * .2, 140); g2.quadraticCurveTo(w * .22, 60, w * .34, 0); g2.closePath(); };
    ink(g, cas, PAL.vellum, 2.2);
    hatch(g, [cas, half(0, 0, w * .3, h)], 1.3, 5, .8, PAL.ink, [0, 0, w, h], .4);
    for (let y = 78; y < h - 20; y += 14) { g.fillStyle = PAL.ink; g.beginPath(); g.arc(w * .5, y, 1.8, 0, 6.283); g.fill(); }
    const cape = g2 => { g2.beginPath(); g2.moveTo(w * .34, 0); g2.lineTo(w * .66, 0); g2.quadraticCurveTo(w * .86, 20, w * .84, 62); g2.quadraticCurveTo(w * .5, 72, w * .16, 62); g2.quadraticCurveTo(w * .14, 20, w * .34, 0); g2.closePath(); };
    ink(g, cape, PAL.vellum, 2.2); hatch(g, [cape, half(0, 0, w * .32, h)], 1.3, 4, .8, PAL.ink, [0, 0, w, h], .45);
    g.strokeStyle = PAL.ink; g.lineWidth = .8; g.beginPath(); g.moveTo(w * .5, 6); g.lineTo(w * .5, 44); g.stroke();
    g.strokeStyle = PAL.gold3; g.lineWidth = 2.6; g.beginPath(); g.moveTo(w * .5, 44); g.lineTo(w * .5, 68); g.moveTo(w * .42, 52); g.lineTo(w * .58, 52); g.stroke();   // pectoral cross
  }, { ax: .5, ay: 1 });
  L.body = [body(0), body(1)];
  L.headP = cutout(72, 84, (g, w, h) => {                         // profile, facing right
    const face = g2 => { g2.beginPath(); g2.moveTo(w * .3, h); g2.quadraticCurveTo(w * .2, h * .7, w * .3, h * .55); g2.quadraticCurveTo(w * .5, h * .75, w * .76, h * .68); g2.lineTo(w * .74, h * .62); g2.lineTo(w * .82, h * .58); g2.lineTo(w * .76, h * .54); g2.lineTo(w * .86, h * .46); g2.lineTo(w * .74, h * .42); g2.quadraticCurveTo(w * .76, h * .2, w * .5, h * .08); g2.quadraticCurveTo(w * .2, h * .1, w * .16, h * .4); g2.quadraticCurveTo(w * .14, h * .7, w * .3, h); g2.closePath(); };
    ink(g, face, PAL.vellum, 2.2);
    hatch(g, [face, half(0, 0, w * .4, h)], 1.2, 4.5, .8, PAL.ink, [0, 0, w, h], .4);
    const hair = g2 => { g2.beginPath(); g2.moveTo(w * .14, h * .4); g2.quadraticCurveTo(w * .12, h * .6, w * .22, h * .7); g2.quadraticCurveTo(w * .26, h * .5, w * .3, h * .42); g2.closePath(); }; ink(g, hair, PAL.vellum, 1.6); hatch(g, hair, 1.4, 2.4, .6, PAL.ink, [0, 0, w, h], .5);
    const zuc = g2 => { g2.beginPath(); g2.moveTo(w * .22, h * .22); g2.quadraticCurveTo(w * .5, 0, w * .78, h * .22); g2.quadraticCurveTo(w * .5, h * .16, w * .22, h * .22); g2.closePath(); }; ink(g, zuc, PAL.vellum, 2);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.beginPath(); g.arc(w * .62, h * .46, 8, 0, 6.283); g.stroke();
    g.beginPath(); g.moveTo(w * .7, h * .46); g.lineTo(w * .86, h * .44); g.moveTo(w * .54, h * .46); g.lineTo(w * .3, h * .5); g.stroke();
    g.fillStyle = PAL.ink; g.beginPath(); g.arc(w * .64, h * .46, 2, 0, 6.283); g.fill();
    g.lineWidth = 1.4; g.beginPath(); g.moveTo(w * .7, h * .62); g.lineTo(w * .78, h * .6); g.stroke();
    const ear = g2 => { g2.beginPath(); g2.ellipse(w * .32, h * .5, 5, 8, 0, 0, 6.283); }; ink(g, ear, PAL.vellum, 1.4);
  }, { ax: .45, ay: 1 });
  L.headF = cutout(76, 86, (g, w, h) => {                         // facing us
    const face = g2 => { g2.beginPath(); g2.ellipse(w / 2, h * .55, 28, 34, 0, 0, 6.283); };
    ink(g, face, PAL.vellum, 2.2); hatch(g, [face, half(0, 0, w * .3, h)], 1.2, 4.5, .8, PAL.ink, [0, 0, w, h], .35);
    for (const s of [-1, 1]) { const hr = g2 => { g2.beginPath(); g2.ellipse(w / 2 + s * 26, h * .5, 7, 14, 0, 0, 6.283); }; ink(g, hr, PAL.vellum, 1.6); hatch(g, hr, 1.5, 2.4, .6, PAL.ink, [0, 0, w, h], .5); }
    const zuc = g2 => { g2.beginPath(); g2.moveTo(w * .2, h * .26); g2.quadraticCurveTo(w / 2, 2, w * .8, h * .26); g2.quadraticCurveTo(w / 2, h * .2, w * .2, h * .26); g2.closePath(); }; ink(g, zuc, PAL.vellum, 2);
    eye(g, w * .38, h * .5, 7, [0, 0]); eye(g, w * .62, h * .5, 7, [0, 0]);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.6; for (const x of [w * .38, w * .62]) { g.beginPath(); g.arc(x, h * .5, 10.5, 0, 6.283); g.stroke(); } g.beginPath(); g.moveTo(w * .48, h * .5); g.lineTo(w * .52, h * .5); g.stroke();
    g.lineWidth = 1.4; g.beginPath(); g.moveTo(w / 2, h * .52); g.lineTo(w * .46, h * .66); g.lineTo(w * .52, h * .66); g.stroke();
    g.beginPath(); g.moveTo(w * .4, h * .76); g.quadraticCurveTo(w / 2, h * .84, w * .6, h * .76); g.stroke();
    for (const s of [-1, 1]) { const er = g2 => { g2.beginPath(); g2.ellipse(w / 2 + s * 30, h * .56, 4, 7, 0, 0, 6.283); }; ink(g, er, PAL.vellum, 1.3); }
  }, { ax: .5, ay: 1 });
  L.lid = cutout(22, 16, (g, w, h) => {                           // the winking eyelid
    const a = g2 => { g2.beginPath(); g2.moveTo(1, h / 2); g2.quadraticCurveTo(w / 2, -2, w - 1, h / 2); g2.quadraticCurveTo(w / 2, h + 2, 1, h / 2); g2.closePath(); };
    g.fillStyle = PAL.vellum; a(g); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(2, h / 2); g.quadraticCurveTo(w / 2, h * .95, w - 2, h / 2); g.stroke();
    g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(5 + i * 4, h * .66); g.lineTo(4 + i * 4, h * .95); g.stroke(); }
  });
  L.arm = cutout(36, 104, (g, w, h) => {
    const sl = g2 => { g2.beginPath(); g2.moveTo(8, 0); g2.lineTo(w - 8, 0); g2.quadraticCurveTo(w, h * .55, w - 4, h * .78); g2.lineTo(4, h * .78); g2.quadraticCurveTo(0, h * .55, 8, 0); g2.closePath(); };
    ink(g, sl, PAL.vellum, 2); hatch(g, [sl, half(0, 0, w * .4, h)], 1.3, 4.5, .8, PAL.ink, [0, 0, w, h], .4);
    const hand = g2 => { g2.beginPath(); g2.ellipse(w / 2, h * .87, 9, 11, 0, 0, 6.283); }; ink(g, hand, PAL.vellum, 1.6);
    g.strokeStyle = PAL.ink; g.lineWidth = .9; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(w / 2 + i * 4, h * .88); g.lineTo(w / 2 + i * 5, h * .98); g.stroke(); }
  }, { ax: .5, ay: .05 });
  L.tiara = cutout(62, 76, (g, w, h) => {                         // the triple crown: gold, vermilion jewels
    const bee = g2 => { g2.beginPath(); g2.moveTo(8, h - 6); g2.quadraticCurveTo(4, h * .4, w / 2, 6); g2.quadraticCurveTo(w - 4, h * .4, w - 8, h - 6); g2.closePath(); };
    ink(g, bee, PAL.vellum, 2); hatch(g, [bee, half(0, 0, w * .4, h)], 1.3, 4, .8, PAL.ink, [0, 0, w, h], .35);
    for (let i = 0; i < 3; i++) {
      const y = h - 10 - i * 20, hw = (w / 2 - 6) * (1 - i * .22);
      const crown = g2 => { g2.beginPath(); g2.moveTo(w / 2 - hw, y); for (let k = 0; k <= 6; k++) g2.lineTo(w / 2 - hw + k * (2 * hw / 6), y - (k % 2 ? 11 : 4)); g2.lineTo(w / 2 + hw, y + 6); g2.lineTo(w / 2 - hw, y + 6); g2.closePath(); };
      ink(g, crown, PAL.gold, 1.6);
      for (let k = 0; k < 3; k++) { g.fillStyle = PAL.vermilion; g.beginPath(); g.arc(w / 2 - hw + (k + .5) * (2 * hw / 3), y + 1, 2.2, 0, 6.283); g.fill(); }
    }
    g.strokeStyle = PAL.gold3; g.lineWidth = 2.4; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, -2); g.moveTo(w / 2 - 4, 2); g.lineTo(w / 2 + 4, 2); g.stroke();
    g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(10, h - 6); g.lineTo(6, h); g.moveTo(w - 10, h - 6); g.lineTo(w - 6, h); g.stroke();
  }, { ax: .5, ay: 1 });
  L.crumb = cutout(12, 10, (g, w, h) => { const b = g2 => blobPath(g2, w / 2, h / 2, 5, 3.6, 8, .25); ink(g, b, PAL.vellum, 1.2); g.fillStyle = PAL.vermilion; g.beginPath(); g.arc(w / 2 + 1, h / 2, 1.5, 0, 6.283); g.fill(); });
  L.stool = cutout(54, 60, (g, w, h) => {
    const top = g2 => { g2.beginPath(); g2.ellipse(w / 2, 8, 26, 7, 0, 0, 6.283); }; ink(g, top, PAL.vellum2, 2);
    g.strokeStyle = PAL.ink; g.lineWidth = 2.4; for (const [x0, x1] of [[10, 4], [w / 2, w / 2], [w - 10, w - 4]]) { g.beginPath(); g.moveTo(x0, 14); g.lineTo(x1, h - 2); g.stroke(); }
  }, { ax: .5, ay: 1 });
}

// where the pope is and what he is doing at t
function l6_pose(t) {
  const walk = seg(t, 93, 95.5), into = seg(t, 102, 102.45);
  let x = lerp(850, L6_STAND, walk); x = lerp(x, L6_DOOR + 58, into);
  const walking = (t > 93 && t < 95.5) || (t > 102 && t < 102.45);
  const step = walking ? Math.floor(stepT(t, 6) * 6) % 2 : 0;
  const k1 = Math.min(1, snap(t, 92, .18)), k2 = Math.min(1, snap(t, 92.5, .22));
  const bend = .5 * (snap(t, 92, .18) - snap(t, 92.5, .22)) + .12 * into;      // bows to set the crown down; stoops through the low door
  const front = t >= 96 && t < 102;
  const held = t < 92.3;
  const HOLD = [-1.4, -1.25], LOW = [-.5, -.35], sw = walking ? .25 * (step ? 1 : -1) : 0, REST = [-.12 + sw, .12 - sw];
  const mix = (A, B, k) => [lerp(A[0], B[0], k), lerp(A[1], B[1], k)];
  const armA = t < 92.5 ? mix(HOLD, LOW, k1) : t < 93 ? mix(LOW, REST, k2) : front ? [.08, -.08] : REST;
  return { x, y: L6_FLOOR + (walking && step ? -4 : 0), step, bend, front, held, armA, walking, into };
}
function l6_handPos(P) {                      // world position of the leading hand (arm 1, length 90)
  const sh = rot2(14, -196, P.bend), hd = rot2(0, 90, P.bend + P.armA[1]);
  return [P.x + sh[0] + hd[0], P.y + sh[1] + hd[1]];
}
function l6_pope(g, t, L, P) {
  const s = lerp(1, .62, P.into || 0);                                        // recedes into the quiet room
  g.save(); g.translate(P.x, P.y); g.scale(s, s); g.rotate(P.bend);
  spr(g, L.body[P.step], 0, 0);
  const sx = P.front ? 28 : 14;
  spr(g, L.arm, -sx, -196, P.armA[0]);
  spr(g, L.arm, sx, -196, P.armA[1]);
  const headY = -228;
  if (P.front) {
    const turnK = Math.min(1, snap(t, 96, .1));
    spr(g, L.headF, 0, headY, 0, 1, lerp(.92, 1, turnK));
    const wink = seg(t, 96, 96.08) * (1 - seg(t, 97.2, 97.3));
    if (wink > 0) spr(g, L.lid, -9, headY - 43, 0, 1, wink);        // his right eye shuts
  } else spr(g, L.headP, 0, headY);
  g.restore();
}
function l6_seer(g, t) {
  const ts = stepT(t, 4), hx = 690 + 60 * (ts - 98); if (hx < 520) return;
  const step = Math.floor(ts * 4) % 2, kx = hx - 197, ky = L6_FLOOR + (step ? -3 : 0);
  g.save(); g.translate(kx, ky);
  spr(g, SP.common.seerBody, 0, 0, 1.28);
  const sh = rot2(0, -192, 1.28), hd = rot2(0, -206, 1.28);
  spr(g, SP.common.seerArm, sh[0] - 10, sh[1], step ? .25 : -.2, .5, .5);
  spr(g, SP.common.seerArm, sh[0] + 12, sh[1] - 2, step ? -.2 : .25, .5, .5);
  spr(g, SP.common.seerHood, hd[0], hd[1] + 8, .95);
  g.restore();
  return hx;
}

function leaf6(g, t) {
  spread(g, t, L6_SPEC, (g, p) => {
    const L = SP.l6, f = Math.round(t * FPS), FLOOR = L6_FLOOR;
    // the room: wall with a dado rail and a small cross, floorboards
    g.fillStyle = PAL.vellum2; g.fillRect(p.x, FLOOR, p.w, p.y + p.h - FLOOR);
    g.strokeStyle = PAL.ink; g.lineWidth = 2.2; g.beginPath(); g.moveTo(p.x, FLOOR); g.lineTo(p.x + p.w, FLOOR); g.stroke();
    seed(61); hatch(g, rect(p.x, FLOOR, p.w, 50), 0, 6, .7, PAL.ink, [p.x, FLOOR, p.x + p.w, 650], .3);
    for (let i = 0; i < 8; i++) { const x = p.x + i * 72; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, 650); g.lineTo(x + 40, FLOOR); g.stroke(); }
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(p.x, 430); g.lineTo(p.x + p.w, 430); g.stroke();
    seed(62); hatch(g, rect(p.x, 422, p.w, 8), .05, 3, .6, PAL.ink, [p.x, 420, p.x + p.w, 432], .5);
    g.lineWidth = 3; g.beginPath(); g.moveTo(880, 150); g.lineTo(880, 210); g.moveTo(862, 168); g.lineTo(898, 168); g.stroke();
    spr(g, L.doorway, L6_DOOR, FLOOR);
    // stool and candle, flickering
    const flick = .8 + .2 * hash(f * 1.7);
    g.save(); g.globalAlpha = .16 * flick; const gl = g.createRadialGradient(740, 520, 2, 740, 520, 70); gl.addColorStop(0, PAL.gold2); gl.addColorStop(1, 'rgba(239,217,138,0)'); g.fillStyle = gl; g.fillRect(660, 440, 160, 160); g.restore();
    spr(g, L.stool, 740, FLOOR);
    spr(g, SP.common.candle, 740, FLOOR - 52, 0, 1, .96 + .06 * hash(f * 2.9));
    // the seer, crawling in from the left to gather the crumbs
    const hx = l6_seer(g, t) ?? -1;
    // the pope (once he steps into the doorway he is seen only through the arch)
    const P = l6_pose(t);
    g.save();
    if (P.into > 0) { g.beginPath(); g.rect(p.x, p.y, L6_DOOR - 10 - p.x, p.h); g.moveTo(L6_DOOR, FLOOR); g.lineTo(L6_DOOR, FLOOR - 148); g.arc(L6_DOOR + 65, FLOOR - 148, 65, Math.PI, 0); g.lineTo(L6_DOOR + 130, FLOOR); g.closePath(); g.clip(); }
    l6_pope(g, t, L, P);
    g.restore();
    // the triple crown: in his hands, then dropped the last span to the floor (thud at ~92.45)
    if (P.held) { const [hx2, hy2] = l6_handPos(P); spr(g, L.tiara, hx2 + 10, hy2 + 30, P.bend * .5); }
    else {
      const P0 = l6_pose(92.299), [rx, ry] = l6_handPos(P0), x0 = rx + 10, y0 = ry + 30;
      const fall = eIn(seg(t, 92.3, 92.45)), land = snap(t, 92.45, .12);
      spr(g, L.tiara, x0, lerp(y0, FLOOR + 10, fall), 0, 1 + .12 * (land - 1) * (land > 0 ? 1 : 0) * 0 + (land > 0 ? .1 * (1 - Math.min(1, land)) : 0), land > 0 ? 1 - .12 * (1 - Math.min(1, land)) : 1);
    }
    // breadcrumbs from his left sleeve (97 + .6 i), bouncing to a trail that leads back toward the room's centre
    for (let i = 0; i < 8; i++) {
      const t0 = 97 + .6 * i, u = seg(t, t0, t0 + .45); if (u <= 0) continue;
      const lx = 808 + 26 * i;
      if (u >= 1 && hx >= lx - 4) continue;                       // gathered into the hood
      const x = lerp(L6_STAND + 56, lx, eOut(u)), y = u < 1 ? lerp(FLOOR - 118, FLOOR - 3, u) - 50 * Math.sin(Math.PI * u) : FLOOR - 3;
      spr(g, L.crumb, x, y, u * 6);
    }
    // the door leaf: standing open edge-on, snapping shut at 102.5 once he has stepped through
    const close = eOut(seg(t, 102.5, 102.62)), shud = t > 102.62 ? .03 * Math.sin((t - 102.62) * 60) * Math.exp(-(t - 102.62) * 8) : 0;
    spr(g, L.doorLeaf, L6_DOOR + 4, FLOOR, 0, lerp(.1, 1, close) + shud, 1);
  });
}
