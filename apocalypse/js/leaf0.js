// leaf0.js — Title: the locked room. Also builds SP.common (door, hooded seer, lectern) used by VI and VII.
'use strict';

// ---------------- shared woodcut figures ----------------
function buildCommon() {
  seed(2026); SP.common = {};
  // The door (300×500), keyhole punched through so the room behind shows. Pivot: centre.
  SP.common.door = cutout(300, 500, (g, w, h) => {
    const arch = g2 => { g2.beginPath(); g2.moveTo(0, h); g2.lineTo(0, 120); g2.arc(w / 2, 120, w / 2, Math.PI, 0); g2.lineTo(w, h); g2.closePath(); };
    ink(g, arch, PAL.vellum, 3);
    g.save(); arch(g); g.clip();
    for (let x = 0; x < w; x += 50) { g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(x + rnd(-1, 1), 0); g.lineTo(x + rnd(-1, 1), h); g.stroke(); hatch(g, rect(x, 0, 50, h), 1.52, 7 + rnd(0, 2), .7, PAL.ink, [0, 0, w, h], .35); }
    // wood grain knots
    for (let i = 0; i < 7; i++) { const x = rnd(10, w - 10), y = rnd(30, h - 30); g.strokeStyle = PAL.ink; g.lineWidth = .9; for (let r = 3; r < 14; r += 4) { g.beginPath(); g.ellipse(x, y, r, r * 1.8, 0, 0, 6.283); g.stroke(); } }
    // strap hinges with scrolled ends
    for (const y of [190, 400]) {
      const strap = g2 => { g2.beginPath(); g2.moveTo(0, y - 14); g2.lineTo(150, y - 6); g2.quadraticCurveTo(190, y - 2, 196, y + 10); g2.quadraticCurveTo(186, y + 22, 170, y + 12); g2.quadraticCurveTo(178, y + 2, 160, y + 4); g2.lineTo(0, y + 14); g2.closePath(); };
      ink(g, strap, PAL.ink2, 1.6); hatch(g, strap, .1, 3, .8, PAL.vellum, [0, 0, w, h], .5);
      rivets(g, [[20, y], [60, y], [100, y], [140, y]], 3.5);
    }
    // lock plate and keyhole (punched)
    const plate = g2 => { roughRect(g2, 196, 330, 70, 100, 1.5); };
    ink(g, plate, PAL.vellum2, 2.2); rivets(g, [[204, 338], [258, 338], [204, 422], [258, 422]], 3);
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(231, 368, 13, 0, 6.283); g.moveTo(222, 374); g.lineTo(240, 374); g.lineTo(245, 412); g.lineTo(217, 412); g.closePath(); g.fill();
    g.globalCompositeOperation = 'source-over'; g.strokeStyle = PAL.ink; g.lineWidth = 2.4;
    g.beginPath(); g.arc(231, 368, 13, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(222, 374); g.lineTo(217, 412); g.lineTo(245, 412); g.lineTo(240, 374); g.stroke();
    g.restore();
  });
  SP.common.keyhole = (x, y) => g => { g.beginPath(); g.arc(x + 81, y + 118, 13, 0, 6.283); g.moveTo(x + 72, y + 124); g.lineTo(x + 90, y + 124); g.lineTo(x + 95, y + 162); g.lineTo(x + 67, y + 162); g.closePath(); }; // relative to door centre
  // The hooded seer, in pieces. Robe (pivot bottom-centre), hood/head (pivot neck), sleeve+hand (pivot shoulder, hanging down).
  SP.common.seerBody = cutout(130, 210, (g, w, h) => {
    const robe = g2 => { g2.beginPath(); g2.moveTo(w * .5, 0); g2.quadraticCurveTo(w * .15, 20, w * .2, 70); g2.quadraticCurveTo(w * .05, 150, 4, h); g2.lineTo(w - 4, h); g2.quadraticCurveTo(w * .95, 150, w * .8, 70); g2.quadraticCurveTo(w * .85, 20, w * .5, 0); g2.closePath(); };
    ink(g, robe, PAL.vellum, 2.4);
    hatch(g, [robe, half(0, 0, w * .4, h)], 1.35, 5, .9, PAL.ink, [0, 0, w, h], .6);
    for (let i = 0; i < 5; i++) { g.strokeStyle = PAL.ink; g.lineWidth = 1.3; g.beginPath(); g.moveTo(w * .3 + i * 12, 60); g.quadraticCurveTo(w * .25 + i * 13, 140, w * .22 + i * 15, h - 4); g.stroke(); }  // fold lines
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(10, h - 2); g.lineTo(w - 10, h - 2); g.stroke();
    // rope belt
    g.beginPath(); g.moveTo(w * .22, 78); g.quadraticCurveTo(w * .5, 90, w * .78, 78); g.lineWidth = 3; g.stroke(); for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(w * .5 + i * 3, 92 + i * 12, 4, 0, 6.283); g.stroke(); }
  }, { ax: .5, ay: 1 });
  SP.common.seerHood = cutout(90, 96, (g, w, h) => {
    const hood = g2 => { g2.beginPath(); g2.moveTo(w * .5, h); g2.quadraticCurveTo(w * .02, h * .9, w * .1, h * .45); g2.quadraticCurveTo(w * .2, 0, w * .55, 2); g2.quadraticCurveTo(w, 10, w * .92, h * .55); g2.quadraticCurveTo(w, h * .9, w * .5, h); g2.closePath(); };
    ink(g, hood, PAL.vellum, 2.4);
    hatch(g, [hood, half(w * .55, 0, w, h)], 1.2, 4.5, .9, PAL.ink, [0, 0, w, h], .6);
    // the face: an oval of deep shadow, two pale eyes
    const face = g2 => { g2.beginPath(); g2.ellipse(w * .36, h * .55, 18, 24, .1, 0, 6.283); };
    g.save(); face(g); g.clip(); g.fillStyle = PAL.ink; g.fillRect(0, 0, w, h); g.restore();
    xhatch(g, face, .4, 2.6, 1, PAL.vellum, [0, 0, w, h], .22);
    g.fillStyle = PAL.vellum; g.beginPath(); g.ellipse(w * .3, h * .5, 4, 2.4, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(w * .44, h * .5, 4, 2.4, 0, 0, 6.283); g.fill();
    g.fillStyle = PAL.ink; g.beginPath(); g.arc(w * .3, h * .5, 1.6, 0, 6.283); g.fill(); g.beginPath(); g.arc(w * .44, h * .5, 1.6, 0, 6.283); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 2.2; face(g); g.stroke();
  }, { ax: .5, ay: 1 });
  SP.common.seerArm = cutout(44, 110, (g, w, h) => {
    const sl = g2 => { g2.beginPath(); g2.moveTo(10, 0); g2.lineTo(w - 10, 0); g2.quadraticCurveTo(w, h * .6, w - 2, h * .78); g2.lineTo(2, h * .78); g2.quadraticCurveTo(0, h * .6, 10, 0); g2.closePath(); };
    ink(g, sl, PAL.vellum, 2.2); hatch(g, [sl, half(0, 0, w * .45, h)], 1.3, 4.5, .9, PAL.ink, [0, 0, w, h], .55);
    const hand = g2 => { g2.beginPath(); g2.ellipse(w / 2, h * .86, 11, 14, 0, 0, 6.283); };
    ink(g, hand, PAL.vellum, 1.8); g.strokeStyle = PAL.ink; g.lineWidth = 1; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(w / 2 + i * 5, h * .86); g.lineTo(w / 2 + i * 6, h * .98); g.stroke(); }
  }, { ax: .5, ay: .05 });
  // The lectern (pivot bottom-centre) with an open book.
  SP.common.lectern = cutout(110, 160, (g, w, h) => {
    const post = g2 => { g2.beginPath(); g2.moveTo(w * .42, 40); g2.lineTo(w * .58, 40); g2.lineTo(w * .62, h - 14); g2.lineTo(w * .38, h - 14); g2.closePath(); };
    ink(g, post, PAL.vellum, 2); hatch(g, post, 1.5, 4, .8, PAL.ink, [0, 0, w, h], .5);
    const foot = g2 => { g2.beginPath(); g2.ellipse(w / 2, h - 10, 40, 9, 0, 0, 6.283); }; ink(g, foot, PAL.vellum2, 2);
    const top = g2 => { g2.beginPath(); g2.moveTo(4, 44); g2.lineTo(w - 4, 30); g2.lineTo(w - 4, 42); g2.lineTo(4, 56); g2.closePath(); }; ink(g, top, PAL.vellum, 2);
    const book = g2 => { g2.beginPath(); g2.moveTo(12, 36); g2.quadraticCurveTo(w * .5, 18, w - 12, 20); g2.lineTo(w - 12, 28); g2.quadraticCurveTo(w * .5, 26, 12, 44); g2.closePath(); }; ink(g, book, PAL.vellum, 1.8);
    g.strokeStyle = PAL.ink; g.lineWidth = .8; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(18 + i * 2, 38 - i * 2); g.lineTo(w * .48, 30 - i * 1.5); g.stroke(); }
    g.save(); g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(w / 2, 24, 3, 2, 0, 0, 6.283); g.fill(); g.restore();
  }, { ax: .5, ay: 1 });
  SP.common.candle = cutout(30, 70, (g, w, h) => {
    const c = g2 => { g2.beginPath(); g2.rect(w * .3, 22, w * .4, h - 26); }; ink(g, c, PAL.vellum, 1.6);
    const fl = g2 => { g2.beginPath(); g2.moveTo(w / 2, 0); g2.quadraticCurveTo(w * .85, 14, w / 2, 24); g2.quadraticCurveTo(w * .15, 14, w / 2, 0); g2.closePath(); }; ink(g, fl, PAL.gold2, 1.4);
    g.fillStyle = PAL.gold; g.beginPath(); g.ellipse(w / 2, 14, 3, 6, 0, 0, 6.283); g.fill();
  }, { ax: .5, ay: 1 });
}
// draw the hooded seer at (x, y = feet), facing left; pose = { lean, armL, armR, headTilt } radians
function drawSeer(g, x, y, pose = {}, s = 1) {
  const C = SP.common; g.save(); g.translate(x, y); g.scale(s, s); g.rotate(pose.lean || 0);
  spr(g, C.seerArm, 28, -150, pose.armR ?? .15);
  spr(g, C.seerBody, 0, 0);
  spr(g, C.seerHood, 2, -196, pose.headTilt || 0);
  spr(g, C.seerArm, -30, -150, pose.armL ?? -.15);
  g.restore();
}

// ---------------- Leaf 0: the locked room ----------------
function buildLeaf0() {
  seed(1); const L = SP.l0 = {};
  // stone wall + floor, the size of the inner panel
  L.wall = mk(504, 580); const g = L.wall.getContext('2d');
  g.fillStyle = PAL.vellum; g.fillRect(0, 0, 504, 580);
  for (let y = 0, r = 0; y < 470; y += 46, r++) for (let x = (r % 2) * -40; x < 504; x += 84) {
    const blk = rrect(x + 3, y + 3, 78, 40, 1.2); g.strokeStyle = PAL.ink; g.lineWidth = 1.6; blk(g); g.stroke();
    hatch(g, blk, .05, 5.5, .6, PAL.ink, [x, y, x + 84, y + 46], .22); if (hash(x * 7 + y) > .6) stipple(g, blk, [x, y, x + 84, y + 46], 40, .7, PAL.ink, .35);
  }
  g.fillStyle = PAL.vellum2; g.fillRect(0, 470, 504, 110); g.strokeStyle = PAL.ink; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 470); g.lineTo(504, 470); g.stroke();
  for (let i = 0; i < 9; i++) { const x = i * 70 - 60; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, 580); g.lineTo(x + 60, 470); g.stroke(); }   // floorboards in perspective
  hatch(g, rect(0, 470, 504, 110), 0, 6, .7, PAL.ink, [0, 470, 504, 580], .3);
  // the room behind the door (seen through the keyhole): glow + lecture hall rows
  L.room = mk(300, 500); const r = L.room.getContext('2d');
  const gl = r.createRadialGradient(150, 290, 10, 150, 290, 220); gl.addColorStop(0, PAL.gold2); gl.addColorStop(.5, PAL.gold); gl.addColorStop(1, PAL.ink);
  r.fillStyle = gl; r.fillRect(0, 0, 300, 500);
  // the bolt: a bar that slides from the plate into the jamb (pivot left end)
  L.bolt = cutout(110, 26, (g, w, h) => { const b = g2 => { roughRect(g2, 0, 4, w - 14, h - 8, 1); }; ink(g, b, PAL.vellum2, 2); hatch(g, b, .2, 3.5, .7, PAL.ink, [0, 0, w, h], .5); const knob = g2 => { g2.beginPath(); g2.arc(w * .3, h / 2, 8, 0, 6.283); }; ink(g, knob, PAL.vellum, 1.8); }, { ax: 0, ay: .5 });
  // listeners: heads in profile, facing right, with a conspicuous ear
  L.heads = [0, 1, 2, 3].map(v => cutout(96, 120, (g, w, h) => profileHead(g, w, h, v), { ax: .5, ay: .5 }));
  L.hand = cutout(46, 60, (g, w, h) => {
    const palm = g2 => { g2.beginPath(); g2.moveTo(8, h); g2.lineTo(4, 30); for (let i = 0; i < 4; i++) { const x = 8 + i * 10; g2.lineTo(x, 8 + (i === 1 || i === 2 ? -4 : 0)); g2.lineTo(x + 7, 8 + (i === 1 || i === 2 ? -4 : 0)); g2.lineTo(x + 8, 30); } g2.lineTo(w - 4, h); g2.closePath(); };
    ink(g, palm, PAL.vellum, 1.8); g.strokeStyle = PAL.ink; g.lineWidth = .9; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(8 + i * 10, 10); g.lineTo(8 + i * 10, 32); g.stroke(); }
  }, { ax: .5, ay: 1 });
}
function profileHead(g, w, h, v) {
  const face = g2 => {
    g2.beginPath(); g2.moveTo(w * .3, h * .95); g2.quadraticCurveTo(w * .28, h * .7, w * .42, h * .62);           // neck → jaw
    g2.quadraticCurveTo(w * .6, h * .78, w * .74, h * .66); g2.lineTo(w * .7, h * .6); g2.lineTo(w * .78, h * .56); // chin, lower lip
    g2.lineTo(w * .72, h * .52); g2.lineTo(w * .8, h * .48); g2.lineTo(w * .86, h * .4); g2.lineTo(w * .74, h * .36);  // lips, nose
    g2.quadraticCurveTo(w * .72, h * .25, w * .66, h * .16); g2.quadraticCurveTo(w * .5, 2, w * .3, h * .1);          // brow, crown
    g2.quadraticCurveTo(w * .08, h * .25, w * .12, h * .5); g2.quadraticCurveTo(w * .14, h * .8, w * .3, h * .95); g2.closePath();
  };
  ink(g, face, PAL.vellum, 2.2);
  hatch(g, [face, half(0, 0, w * .45, h)], 1.25, 4.5, .85, PAL.ink, [0, 0, w, h], .5);
  // closed eye, nostril, mouth line
  g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(w * .62, h * .36); g.quadraticCurveTo(w * .7, h * .42, w * .78, h * .37); g.stroke();
  g.beginPath(); g.arc(w * .78, h * .44, 1.6, 0, 6.283); g.fillStyle = PAL.ink; g.fill();
  // the ear, oversized, pressed forward
  const ear = g2 => { g2.beginPath(); g2.ellipse(w * .36, h * .45, 14, 20, -.2, 0, 6.283); };
  ink(g, ear, PAL.vellum, 2); g.beginPath(); g.ellipse(w * .37, h * .47, 7, 11, -.2, 0, 6.283); g.lineWidth = 1.3; g.stroke(); g.beginPath(); g.ellipse(w * .36, h * .49, 3, 5, 0, 0, 6.283); g.stroke();
  // headgear by variant
  if (v === 0) { const cap = g2 => { g2.beginPath(); g2.moveTo(w * .1, h * .22); g2.quadraticCurveTo(w * .4, -6, w * .78, h * .14); g2.lineTo(w * .9, h * .2); g2.lineTo(w * .78, h * .22); g2.quadraticCurveTo(w * .5, h * .1, w * .14, h * .3); g2.closePath(); }; ink(g, cap, PAL.vellum2, 2); hatch(g, cap, .3, 3.5, .8, PAL.ink, [0, 0, w, h], .55); }
  if (v === 1) { const hair = g2 => { g2.beginPath(); g2.moveTo(w * .1, h * .3); g2.quadraticCurveTo(w * .1, -4, w * .55, 4); g2.quadraticCurveTo(w * .75, 8, w * .68, h * .2); g2.quadraticCurveTo(w * .45, h * .06, w * .25, h * .22); g2.lineTo(w * .14, h * .36); g2.closePath(); }; ink(g, hair, PAL.vellum, 2); hatch(g, hair, 1.1, 2.6, .9, PAL.ink, [0, 0, w, h], .75); }
  if (v === 2) { const hood = g2 => { g2.beginPath(); g2.moveTo(w * .06, h * .8); g2.quadraticCurveTo(0, h * .2, w * .4, 2); g2.quadraticCurveTo(w * .7, 0, w * .7, h * .22); g2.quadraticCurveTo(w * .5, h * .1, w * .3, h * .2); g2.quadraticCurveTo(w * .2, h * .4, w * .22, h * .8); g2.closePath(); }; ink(g, hood, PAL.vellum, 2); hatch(g, hood, 1.4, 4, .9, PAL.ink, [0, 0, w, h], .6); }
  if (v === 3) { g.strokeStyle = PAL.ink; g.lineWidth = 1; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(w * .3 + i * 4, h * .08 + Math.abs(i - 4) * 2); g.lineTo(w * .25 + i * 4.5, h * .2); g.stroke(); } const spec = g2 => { g2.beginPath(); g2.arc(w * .68, h * .37, 7, 0, 6.283); }; g.lineWidth = 1.4; spec(g); g.stroke(); g.beginPath(); g.moveTo(w * .75, h * .37); g.lineTo(w * .86, h * .35); g.stroke(); }
}

const L0_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.L0_SPEC),
  custom(g, t) {
    const a1 = seg(t, .9, 2.2), a2 = seg(t, 1.6, 2.8), a3 = seg(t, 2.4, 3.4);
    const cx = BOOK.text.x + BOOK.text.w / 2;
    g.save();
    g.globalAlpha = a1; caps(g, 'The Apocalypse', cx, 196, 42, PAL.ink, 7, 'center'); caps(g, 'of Peter', cx, 250, 42, PAL.ink, 7, 'center');
    g.globalAlpha = a2; g.font = font(26, 'italic'); g.fillStyle = PAL.vermilion; g.textAlign = 'center'; g.fillText('(Thiel)', cx, 290);
    g.globalAlpha = a3; fleuron(g, cx, 326); g.font = font(22, 'italic'); g.fillStyle = PAL.ink; g.fillText('A Woodcut in Seven Leaves', cx, 368);
    g.restore();
  }
};
function fleuron(g, x, y) {          // ❧ a small printer's leaf
  g.save(); g.translate(x, y); g.strokeStyle = PAL.vermilion; g.fillStyle = PAL.vermilion; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-70, 0); g.lineTo(-18, 0); g.moveTo(18, 0); g.lineTo(70, 0); g.stroke();
  g.beginPath(); g.moveTo(0, -9); g.quadraticCurveTo(12, -8, 10, 4); g.quadraticCurveTo(4, 10, 0, 4); g.quadraticCurveTo(-4, 10, -10, 4); g.quadraticCurveTo(-12, -8, 0, -9); g.fill();
  g.beginPath(); g.moveTo(0, 4); g.quadraticCurveTo(-2, 10, -6, 13); g.stroke(); g.restore();
}

function leaf0(g, t) {
  spread(g, t, L0_SPEC, (g, p) => {
    const L = SP.l0, tq = stepT(t, 15);
    g.drawImage(L.wall, p.x, p.y);
    const dx = p.x + 252, dy = p.y + 330;                       // door centre
    // the room through the keyhole: glow, lectern, the hooded seer lecturing (silhouette)
    g.save(); SP.common.keyhole(dx - 150, dy - 250)(g); g.clip();
    const flick = .85 + .15 * hash(Math.floor(t * 30) * 3.7);
    g.globalAlpha = flick; g.drawImage(L.room, dx - 150, dy - 250); g.globalAlpha = 1;
    g.save(); g.translate(dx - 68, dy + 20); g.scale(.3, .3);
    spr(g, SP.common.lectern, 0, 0);
    g.globalAlpha = .9; const raise = snap(t, 5.2, .14) - snap(t, 7.6, .2);
    drawSeer(g, 70, 10, { armR: .15 - 1.9 * raise, armL: -.15, lean: -.04 }, 1);
    g.restore(); g.restore();
    // lintel plaque
    g.save(); seed(77); const plq = rrect(dx - 110, p.y + 26, 220, 30, 1.2); ink(g, plq, PAL.vellum, 2); g.restore();
    caps(g, 'San Francisco · MMXXV', dx, p.y + 47, 13, PAL.ink, 2.4, 'center');
    spr(g, SP.common.door, dx, dy);
    // the bolt slides home at 2.0 s: from the lock plate into a staple on the jamb
    const slide = snap(t, 2.0, .12) * 46;
    g.save(); g.strokeStyle = PAL.ink; g.lineWidth = 2.2; g.fillStyle = PAL.vellum2; g.fillRect(dx + 150, dy + 52, 14, 22); g.strokeRect(dx + 150, dy + 52, 14, 22); g.restore();
    spr(g, L.bolt, dx + 54 + slide, dy + 63);
    // keyhole light spilling onto the floor
    g.save(); g.globalAlpha = .18 * flick; const kg = g.createLinearGradient(dx - 70, dy + 90, dx - 150, dy + 250); kg.addColorStop(0, PAL.gold2); kg.addColorStop(1, 'rgba(201,161,59,0)');
    g.fillStyle = kg; g.beginPath(); g.moveTo(dx - 74, dy + 92); g.lineTo(dx - 60, dy + 92); g.lineTo(dx - 20, dy + 250); g.lineTo(dx - 200, dy + 250); g.closePath(); g.fill(); g.restore();
    // the listeners: ears to the door, flinching back at the CLACK, leaning in again
    const flinch = -7 * snap(t, 2.06, .1) * (1 - .8 * seg(t, 2.6, 4.5));
    const lean = (at, amt) => amt * snap(t, at, .22) + flinch;
    const bob = i => Math.sin(tq * 3 + i) * 1.2;
    const heads = [
      { x: dx - 190, y: dy - 40, v: 0, sx: 1, at: 1.2 }, { x: dx - 176, y: dy + 110, v: 2, sx: 1, at: 1.6 },
      { x: dx + 192, y: dy - 10, v: 1, sx: -1, at: 1.4 }, { x: dx + 182, y: dy + 140, v: 3, sx: -1, at: 1.9 }
    ];
    for (const [i, hd] of heads.entries()) {
      const l = lean(hd.at, 10) * hd.sx;
      spr(g, L.hand, hd.x + hd.sx * 46 + l, hd.y + 70 + bob(i), hd.sx * .18, hd.sx, 1);
      spr(g, L.heads[hd.v], hd.x + l, hd.y + bob(i), hd.sx * .04, hd.sx, 1);
    }
    // shadow on the floor under the door
    g.save(); g.globalAlpha = .25; g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(dx, dy + 252, 190, 10, 0, 0, 6.283); g.fill(); g.restore();
  });
}
