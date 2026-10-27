// leaf5.js — V: Of the Age of the Beast. A winged hourglass between two roundels: 33½ becomes 66.
'use strict';
const L5_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.L5_SPEC)
};
const L5_HG = { x: 942, y: 430 };                       // hourglass centre (the neck); sprite is 200×320, pivot centre
const L5_RL = { x: 790, y: 190 }, L5_RR = { x: 1094, y: 190 }, L5_RAD = 76;
// bulb paths in hourglass-sprite coordinates (origin = sprite top-left)
const l5_topBulb = g => { g.beginPath(); g.moveTo(44, 26); g.quadraticCurveTo(36, 120, 94, 156); g.lineTo(106, 156); g.quadraticCurveTo(164, 120, 156, 26); g.closePath(); };
const l5_botBulb = g => { g.beginPath(); g.moveTo(44, 294); g.quadraticCurveTo(36, 200, 94, 164); g.lineTo(106, 164); g.quadraticCurveTo(164, 200, 156, 294); g.closePath(); };

function buildLeaf5() {
  seed(55); const L = SP.l5 = {};
  // --- the hourglass frame and glass ---
  L.glass = cutout(200, 320, (g, w, h) => {
    for (const y of [8, 296]) { const plate = g2 => { roughRect(g2, 20, y, 160, 16, 1); }; ink(g, plate, PAL.vellum2, 2.2); hatch(g, plate, .1, 3.5, .8, PAL.ink, [0, 0, w, h], .5); }
    for (const x of [28, 172]) {
      const post = g2 => { g2.beginPath(); g2.rect(x - 5, 24, 10, 272); }; ink(g, post, PAL.vellum, 2); hatch(g, [post, half(x - 5, 0, x, h)], 1.5, 3, .8, PAL.ink, [0, 0, w, h], .55);
      for (const y of [60, 160, 260]) { const knob = g2 => { g2.beginPath(); g2.ellipse(x, y, 9, 13, 0, 0, 6.283); }; ink(g, knob, PAL.vellum, 1.8); hatch(g, [knob, half(x - 9, 0, x - 1, h)], 1.5, 2.6, .7, PAL.ink, [0, 0, w, h], .55); }
    }
    for (const b of [l5_topBulb, l5_botBulb]) { ink(g, b, null, 2.2); }   // glass: no fill, so the sand shows
    // glass highlights: short vertical reflections on the left of each bulb
    g.strokeStyle = PAL.ink; g.lineWidth = .9; g.globalAlpha = .55;
    for (const y0 of [40, 180]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(54 + i * 4, y0 + i * 6); g.lineTo(52 + i * 4, y0 + 60 - i * 10); g.stroke(); }
    g.globalAlpha = 1;
  }, { ax: .5, ay: .5 });
  // --- a wing (tempus fugit), attached at its lower right corner ---
  L.wing = cutout(90, 60, (g, w, h) => {
    const wing = g2 => { g2.beginPath(); g2.moveTo(88, 56); g2.quadraticCurveTo(70, 40, 40, 44); g2.quadraticCurveTo(10, 50, 0, 36); g2.quadraticCurveTo(20, 30, 30, 24); g2.quadraticCurveTo(8, 20, 4, 8); g2.quadraticCurveTo(30, 8, 46, 14); g2.quadraticCurveTo(40, 2, 44, 0); g2.quadraticCurveTo(72, 10, 86, 36); g2.closePath(); };
    ink(g, wing, PAL.vellum, 2);
    g.strokeStyle = PAL.ink; g.lineWidth = 1; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(84 - i * 2, 50 - i * 4); g.quadraticCurveTo(50 - i * 4, 44 - i * 3, 6 + i * 5, 36 - i * 4); g.stroke(); }
    hatch(g, [wing, half(50, 20, w, h)], .5, 3.2, .7, PAL.ink, [0, 0, w, h], .35);
  }, { ax: 1, ay: .95 });
  // --- the face, front view, young (160×170, pivot centre) ---
  L.face = cutout(160, 170, (g, w, h) => {
    const neck = g2 => { g2.beginPath(); g2.moveTo(64, 130); g2.lineTo(96, 130); g2.lineTo(104, 160); g2.lineTo(56, 160); g2.closePath(); }; ink(g, neck, PAL.vellum, 2); hatch(g, neck, 1.5, 4, .8, PAL.ink, [0, 0, w, h], .4);
    const collar = g2 => { g2.beginPath(); g2.moveTo(36, 170); g2.lineTo(58, 150); g2.lineTo(80, 162); g2.lineTo(102, 150); g2.lineTo(124, 170); g2.closePath(); }; ink(g, collar, PAL.vellum2, 2);
    const face = g2 => { g2.beginPath(); g2.ellipse(80, 95, 42, 50, 0, 0, 6.283); }; ink(g, face, PAL.vellum, 2.4);
    hatch(g, [face, half(0, 0, 58, h)], 1.3, 4, .8, PAL.ink, [0, 0, w, h], .4);
    hatch(g, [face, half(0, 118, w, h)], .2, 4, .8, PAL.ink, [0, 0, w, h], .3);
    eye(g, 64, 88, 8, [0, 0], 0); eye(g, 96, 88, 8, [0, 0], 0);
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(54, 76); g.quadraticCurveTo(64, 70, 74, 76); g.moveTo(86, 76); g.quadraticCurveTo(96, 70, 106, 76); g.stroke();   // brows
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(80, 86); g.lineTo(76, 108); g.lineTo(84, 110); g.stroke();                                                  // nose
    g.beginPath(); g.moveTo(68, 122); g.quadraticCurveTo(80, 128, 92, 122); g.stroke();                                                                   // mouth
    g.beginPath(); g.moveTo(44, 90); g.quadraticCurveTo(34, 92, 40, 102); g.moveTo(116, 90); g.quadraticCurveTo(126, 92, 120, 102); g.stroke();           // ears
    // dark curly hair: a band over the crown, dense spirals
    const hair = g2 => { g2.beginPath(); g2.moveTo(32, 76); g2.quadraticCurveTo(30, 26, 80, 22); g2.quadraticCurveTo(130, 26, 128, 76); g2.quadraticCurveTo(110, 56, 80, 58); g2.quadraticCurveTo(50, 56, 32, 76); g2.closePath(); };
    ink(g, hair, PAL.vellum, 2); g.strokeStyle = PAL.ink; g.lineWidth = 1.6;
    g.save(); hair(g); g.clip(); for (let i = 0; i < 40; i++) { const x = rnd(30, 130), y = rnd(24, 74); g.beginPath(); for (let a = 0; a < 7; a += .4) { const r = a * 1.3; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; a ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); } g.restore();
  }, { ax: .5, ay: .5 });
  // --- age: a white beard, spectacles, white hair ---
  L.beard = cutout(110, 70, (g, w, h) => {
    const bd = g2 => { g2.beginPath(); g2.moveTo(4, 0); g2.quadraticCurveTo(10, 40, 30, 60); g2.quadraticCurveTo(55, 76, 80, 60); g2.quadraticCurveTo(100, 40, 106, 0); g2.quadraticCurveTo(80, 14, 55, 12); g2.quadraticCurveTo(30, 14, 4, 0); g2.closePath(); };
    ink(g, bd, PAL.vellum, 2); g.strokeStyle = PAL.ink; g.lineWidth = .8; g.globalAlpha = .55;
    for (let i = 0; i < 14; i++) { const x = 10 + i * 6.5; g.beginPath(); g.moveTo(x, 14); g.quadraticCurveTo(x + rnd(-4, 4), 36, x + rnd(-6, 6) + (i - 7) * .8, 56 - Math.abs(i - 7) * 2.5); g.stroke(); }
    g.globalAlpha = 1; g.lineWidth = 1.4; g.beginPath(); g.moveTo(40, 14); g.quadraticCurveTo(55, 20, 70, 14); g.stroke();   // moustache
  }, { ax: .5, ay: .05 });
  L.specs = cutout(96, 32, (g, w, h) => {
    g.strokeStyle = PAL.ink; g.lineWidth = 2; for (const x of [26, 70]) { g.beginPath(); g.arc(x, 16, 12, 0, 6.283); g.stroke(); }
    g.beginPath(); g.moveTo(38, 14); g.quadraticCurveTo(48, 8, 58, 14); g.moveTo(14, 14); g.lineTo(0, 10); g.moveTo(82, 14); g.lineTo(96, 10); g.stroke();
    g.lineWidth = .8; g.globalAlpha = .5; for (const x of [26, 70]) { g.beginPath(); g.moveTo(x - 7, 10); g.lineTo(x - 2, 22); g.stroke(); }
  }, { ax: .5, ay: .5 });
  L.hairWhite = cutout(160, 80, (g, w, h) => {
    const hair = g2 => { g2.beginPath(); g2.moveTo(30, 58); g2.quadraticCurveTo(28, 6, 80, 2); g2.quadraticCurveTo(132, 6, 130, 58); g2.quadraticCurveTo(110, 38, 80, 40); g2.quadraticCurveTo(50, 38, 30, 58); g2.closePath(); };
    ink(g, hair, PAL.vellum, 2); g.strokeStyle = PAL.ink; g.lineWidth = .8; g.globalAlpha = .5;
    g.save(); hair(g); g.clip(); for (let i = 0; i < 22; i++) { const x = rnd(32, 128), y = rnd(6, 54); g.beginPath(); for (let a = 0; a < 6; a += .5) { const r = a * 1.4; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; a ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); } g.restore();
  }, { ax: .5, ay: .5 });
}

function l5_roundel(g, c, a = 1) {
  g.save(); g.globalAlpha = a; g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y, L5_RAD, 0, 6.283); g.stroke();
  g.lineWidth = 1; g.beginPath(); g.arc(c.x, c.y, L5_RAD - 6, 0, 6.283); g.stroke(); g.restore();
}
// the split-flap on the brow: "33½" flips to "66" at 86.0
function l5_flap(g, x, y, t) {
  const k1 = seg(t, 86.0, 86.12), k2 = seg(t, 86.12, 86.26);
  const sy = k1 < 1 ? 1 - k1 : k2, text = k1 < 1 ? '33½' : '66';
  g.save(); g.translate(x, y); g.scale(1, Math.max(.03, sy)); seed(9);
  ink(g, g2 => { roughRect(g2, -23, -11, 46, 22, .8); }, PAL.vellum, 1.6);
  g.strokeStyle = PAL.ink; g.lineWidth = .8; g.beginPath(); g.moveTo(-23, 0); g.lineTo(23, 0); g.stroke();
  g.font = font(17, '', 'bold'); g.fillStyle = PAL.vermilion; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 1);
  g.restore();
}
function l5_sand(g, t) {
  const k = seg(t, 80.7, 90), level = lerp(70, 150, k), apex = lerp(292, 196, k);
  g.save(); g.translate(L5_HG.x - 100, L5_HG.y - 160); seed(Math.floor(t * 4));
  g.save(); l5_topBulb(g); g.clip(); g.fillStyle = PAL.gold;
  g.beginPath(); g.moveTo(30, level); g.lineTo(96, level + 9); g.lineTo(104, level + 9); g.lineTo(170, level); g.lineTo(170, 160); g.lineTo(30, 160); g.closePath(); g.fill();
  g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(30, level); g.lineTo(96, level + 9); g.lineTo(104, level + 9); g.lineTo(170, level); g.stroke();
  stipple(g, l5_topBulb, [40, level, 160, 158], 220, .8, PAL.ink, .3); g.restore();
  g.save(); l5_botBulb(g); g.clip(); g.fillStyle = PAL.gold;
  g.beginPath(); g.moveTo(20, 300); g.lineTo(100, apex); g.lineTo(180, 300); g.closePath(); g.fill();
  g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(20, 300); g.lineTo(100, apex); g.lineTo(180, 300); g.stroke();
  stipple(g, l5_botBulb, [40, apex, 160, 294], 220, .8, PAL.ink, .3); g.restore();
  if (k > 0 && k < 1) { g.strokeStyle = PAL.gold; g.lineWidth = 2.6; g.beginPath(); g.moveTo(100, 156); g.lineTo(100, apex); g.stroke(); g.strokeStyle = PAL.ink; g.lineWidth = .7; g.setLineDash([3, 5]); g.lineDashOffset = -t * 90; g.beginPath(); g.moveTo(100, 160); g.lineTo(100, apex); g.stroke(); }
  g.restore();
}

function leaf5(g, t) {
  spread(g, t, L5_SPEC, (g, p) => {
    const L = SP.l5;
    // the winged hourglass, ticking
    const rot = (Math.floor(t * 2) % 2 === 0 ? -1 : 1) * .01;
    g.save(); g.translate(L5_HG.x, L5_HG.y); g.rotate(rot); g.translate(-L5_HG.x, -L5_HG.y);
    spr(g, L.wing, L5_HG.x - 78, L5_HG.y - 130, .1);
    spr(g, L.wing, L5_HG.x + 78, L5_HG.y - 130, -.1, -1, 1);
    l5_sand(g, t);
    spr(g, L.glass, L5_HG.x, L5_HG.y);
    g.restore();
    // left roundel: the young face, 33½ on the brow
    l5_roundel(g, L5_RL);
    g.save(); circ(L5_RL.x, L5_RL.y, L5_RAD - 7)(g); g.clip(); spr(g, L.face, L5_RL.x, L5_RL.y + 8); g.restore();
    g.save(); g.font = font(17, '', 'bold'); g.fillStyle = PAL.vermilion; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('33½', L5_RL.x, L5_RL.y - 8); g.restore();
    // right roundel: empty, then the face arrives and ages
    l5_roundel(g, L5_RR);
    const arrive = eBack(seg(t, 85.8, 85.95));
    if (arrive <= 0) { g.save(); g.globalAlpha = .25; g.font = font(64, 'italic'); g.fillStyle = PAL.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', L5_RR.x, L5_RR.y + 4); g.restore(); }
    else {
      g.save(); circ(L5_RR.x, L5_RR.y, L5_RAD - 7)(g); g.clip();
      g.translate(L5_RR.x, L5_RR.y + 8); g.scale(arrive, arrive); g.translate(-L5_RR.x, -L5_RR.y - 8);
      spr(g, L.face, L5_RR.x, L5_RR.y + 8);
      const ageA = eBack(seg(t, 86.05, 86.2)), ageB = eBack(seg(t, 86.35, 86.5));
      if (ageA > 0) { spr(g, L.beard, L5_RR.x, L5_RR.y + 24, 0, ageA, ageA); spr(g, L.specs, L5_RR.x, L5_RR.y + 1, 0, ageA, ageA); }
      if (ageB > 0) spr(g, L.hairWhite, L5_RR.x, L5_RR.y - 17, 0, ageB, ageB);
      g.restore();
      l5_flap(g, L5_RR.x, L5_RR.y - 8, t);
    }
    // "the new", and the caption
    g.save(); g.globalAlpha = seg(t, 86.6, 87.0); g.font = font(22, 'italic'); g.fillStyle = PAL.vermilion; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('the new', (L5_RL.x + L5_RR.x) / 2, L5_RL.y + 4); g.restore();
    g.save(); g.globalAlpha = seg(t, 87.5, 88.0); caps(g, 'XXXIII · The New · LXVI', p.x + p.w / 2, p.y + p.h - 18, 13, PAL.ink, 2.6, 'center'); g.restore();
  });
}
