// leaf3.js — III: Of the Seven Trumpets (the litany).
'use strict';
const L3_T = i => 44 + 2.7 * i;                 // trumpet i sounds (i = 0..6)
const L3_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.L3_SPEC)
};
// geometry (page space): seven bells across the top, the medallion hangs from a nail below the numerals
const L3_PIV = [942, 216], L3_DROP = 200, L3_NUM = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
const l3_bellX = i => 690 + 36 + i * 72;

function buildLeaf3() {
  seed(33); const L = SP.l3 = {};
  // typeset the left page ourselves (slightly smaller litany type) so seven entries clear the rubric
  L3_SPEC._L = typeset(L3_SPEC.verse, { dropCap: true, y: BOOK.text.y, size: 24, lh: 32 });
  let ly = L3_SPEC._L.y + L3_SPEC._L.height + 12;
  for (const e of L3_SPEC.litany) { e._L = typeset(e.line, { size: 19, lh: 24, y: ly, x: BOOK.text.x + 22, w: BOOK.text.w - 22 }); ly += e._L.height + 3; if (e.rubric) e._R = rubricLayout(e.rubric); }
  // ---- the sky: parallel woodcut lines, and a cloud band the horns poke through ----
  L.sky = mk(504, 580); const g = L.sky.getContext('2d');
  g.fillStyle = PAL.vellum; g.fillRect(0, 0, 504, 580);
  g.strokeStyle = PAL.ink;
  for (let y = 126, k = 0; y < 580; y += 6 + k * .35, k++) { g.globalAlpha = .26 - k * .004; g.lineWidth = .8; g.beginPath(); g.moveTo(0, y + rnd(-.4, .4)); g.lineTo(504, y + rnd(-.4, .4)); g.stroke(); if (g.globalAlpha < .06) break; }
  g.globalAlpha = 1;
  const clouds = [];
  for (let x = -30; x < 540; x += 58) clouds.push([x, 22 + rnd(-6, 8), rnd(38, 52), rnd(22, 30)]);
  for (const [x, y, rx, ry] of clouds) { const c = g2 => blobPath(g2, x, y, rx, ry, 16, .1); seed(x * 3 + 7); ink(g, c, PAL.vellum, 2); hatch(g, [c, half(0, y + 4, 504, 200)], .15, 3.6, .8, PAL.ink, [0, 0, 504, 120], .55); }
  for (let x = 10; x < 520; x += 74) { const c = g2 => blobPath(g2, x, 52 + rnd(-4, 4), rnd(26, 34), rnd(12, 16), 14, .1); seed(x * 5 + 1); ink(g, c, PAL.vellum, 1.8); hatch(g, [c, half(0, 56, 504, 200)], .1, 3.2, .7, PAL.ink, [0, 0, 504, 120], .45); }

  // ---- a trumpet: tube from above, bell mouth down, a pennant on a bar (pivot: top centre) ----
  L.trumpet = cutout(80, 130, (g, w, h) => {
    const cx = w / 2;
    const ban = g2 => { g2.beginPath(); g2.moveTo(cx + 6, 30); g2.lineTo(cx + 34, 30); g2.lineTo(cx + 34, 66); g2.lineTo(cx + 20, 58); g2.lineTo(cx + 6, 66); g2.closePath(); };
    ink(g, ban, PAL.vellum2, 1.6); hatch(g, ban, .2, 3.5, .7, PAL.ink, [0, 0, w, h], .45);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx + 20, 36); g.lineTo(cx + 20, 52); g.moveTo(cx + 14, 42); g.lineTo(cx + 26, 42); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(cx, 30); g.lineTo(cx + 36, 30); g.stroke();
    const tube = g2 => { g2.beginPath(); g2.moveTo(cx - 6, 0); g2.lineTo(cx + 6, 0); g2.lineTo(cx + 7, 76); g2.lineTo(cx - 7, 76); g2.closePath(); };
    ink(g, tube, PAL.gold, 2); hatch(g, [tube, half(cx + 1, 0, w, h)], 1.5, 3, .8, PAL.ink, [0, 0, w, h], .5);
    const bell = g2 => { g2.beginPath(); g2.moveTo(cx - 7, 74); g2.quadraticCurveTo(cx - 10, 100, cx - 32, 118); g2.lineTo(cx + 32, 118); g2.quadraticCurveTo(cx + 10, 100, cx + 7, 74); g2.closePath(); };
    ink(g, bell, PAL.gold, 2.2); hatch(g, [bell, half(cx + 2, 0, w, h)], 1.5, 3.5, .8, PAL.ink, [0, 0, w, h], .45);
    const mouth = g2 => { g2.beginPath(); g2.ellipse(cx, 118, 32, 7, 0, 0, 6.283); };
    ink(g, mouth, PAL.gold3, 2); hatch(g, mouth, 0, 3, .7, PAL.ink, [0, 0, w, h], .5);
    g.strokeStyle = PAL.ink; g.lineWidth = 2; for (const y of [20, 56]) { g.beginPath(); g.moveTo(cx - 8, y); g.lineTo(cx + 8, y); g.stroke(); }
  }, { ax: .5, ay: 0 });

  // ---- the medallion: a laurel wreath around a double-ruled disc (pivot: centre) ----
  L.medallion = cutout(380, 380, (g, w, h) => {
    const c = [190, 190];
    const leaf = (a, side) => {
      const r = 162, x = c[0] + Math.cos(a) * r, y = c[1] + Math.sin(a) * r, tg = a + Math.PI / 2 + side * .5;
      const lf = g2 => { g2.beginPath(); g2.ellipse(x, y, 15, 6, tg, 0, 6.283); };
      ink(g, lf, PAL.vellum, 1.5);
      g.strokeStyle = PAL.ink; g.lineWidth = .8; g.beginPath(); g.moveTo(x - Math.cos(tg) * 12, y - Math.sin(tg) * 12); g.lineTo(x + Math.cos(tg) * 12, y + Math.sin(tg) * 12); g.stroke();
    };
    for (let k = 0; k < 13; k++) { const a = Math.PI / 2 - k * .19; leaf(a, -1); leaf(a - .09, 1); const b = Math.PI / 2 + k * .19; leaf(b, 1); leaf(b + .09, -1); }
    const disc = g2 => { g2.beginPath(); g2.arc(c[0], c[1], 150, 0, 6.283); };
    ink(g, disc, PAL.vellum, 3); g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.arc(c[0], c[1], 143, 0, 6.283); g.stroke();
    // the knot at the bottom
    g.save(); g.translate(c[0], c[1] + 160);
    for (const s of [-1, 1]) { const loop = g2 => { g2.beginPath(); g2.ellipse(s * 13, -2, 13, 8, s * .4, 0, 6.283); }; ink(g, loop, PAL.vellum, 1.6); const tail = g2 => { g2.beginPath(); g2.moveTo(0, 2); g2.lineTo(s * 10, 24); g2.lineTo(s * 20, 20); g2.lineTo(s * 6, 0); g2.closePath(); }; ink(g, tail, PAL.vellum, 1.4); }
    g.beginPath(); g.arc(0, 0, 4, 0, 6.283); g.fillStyle = PAL.ink; g.fill(); g.restore();
  });
  L.strap = cutout(26, 64, (g, w, h) => {
    const s = g2 => { g2.beginPath(); g2.roundRect(4, 0, 18, 60, 6); }; ink(g, s, PAL.vellum2, 1.8); hatch(g, s, 1.5, 3, .7, PAL.ink, [0, 0, w, h], .45); rivets(g, [[13, 10], [13, 48]], 3);
  }, { ax: .5, ay: 0 });

  // ---- the emblems (300×300, drawn centred in the disc) ----
  L.emblems = [];
  // i · the Janus head with the prize of peace
  L.emblems[0] = cutout(300, 300, (g, w, h) => {
    const cx = 150, cy = 118;
    const body = g2 => { g2.beginPath(); g2.moveTo(40, 300); g2.lineTo(50, 232); g2.quadraticCurveTo(80, 202, 122, 196); g2.lineTo(150, 234); g2.lineTo(178, 196); g2.quadraticCurveTo(220, 202, 250, 232); g2.lineTo(260, 300); g2.closePath(); };
    ink(g, body, PAL.vellum, 2.2);
    g.save(); half(0, 0, 150, 300)(g); g.clip();                                   // cardigan
    g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(122, 196); g.lineTo(150, 236); g.lineTo(150, 300); g.stroke();
    g.beginPath(); g.moveTo(96, 214); g.lineTo(124, 262); g.stroke();
    for (const y of [252, 274, 296]) { g.beginPath(); g.arc(141, y, 3.2, 0, 6.283); g.stroke(); }
    hatch(g, body, 1.5, 4.5, .7, PAL.ink, [0, 0, 150, 300], .25); g.restore();
    g.save(); half(150, 0, 300, 300)(g); g.clip(); xhatch(g, body, .8, 4, .8, PAL.ink, [150, 0, 300, 300], .45); g.restore();   // torn coat
    const head = g2 => { g2.beginPath(); g2.ellipse(cx, cy, 78, 92, 0, 0, 6.283); };
    ink(g, head, PAL.vellum, 2.4);
    g.save(); half(0, 0, 150, 300)(g); g.clip();                                   // the Jekyll half
    const hairL = g2 => { g2.beginPath(); g2.moveTo(74, 78); g2.quadraticCurveTo(78, 22, 150, 26); g2.lineTo(150, 62); g2.quadraticCurveTo(112, 54, 84, 92); g2.closePath(); };
    ink(g, hairL, PAL.vellum, 2); hatch(g, hairL, .35, 3, .9, PAL.ink, [0, 0, 300, 300], .8);
    eye(g, 112, 108, 13, [0, 0], 0);
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(96, 92); g.quadraticCurveTo(112, 84, 128, 92); g.stroke();
    g.lineWidth = 2.2; g.beginPath(); g.moveTo(110, 158); g.quadraticCurveTo(134, 182, 150, 174); g.stroke();
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(144, 118); g.quadraticCurveTo(134, 140, 148, 142); g.stroke();
    hatch(g, head, 1.3, 5, .7, PAL.ink, [72, 60, 110, 210], .25); g.restore();
    g.save(); half(150, 0, 300, 300)(g); g.clip();                                 // the Hyde half
    for (let k = 0; k < 9; k++) {
      const a = -1.45 + k * .19, bx = cx + Math.cos(a) * 70, by = cy + Math.sin(a) * 84, tx = cx + Math.cos(a + .05) * (104 + hash(k) * 26), ty = cy + Math.sin(a + .05) * (118 + hash(k + 9) * 26);
      const sp = g2 => { g2.beginPath(); g2.moveTo(bx - Math.sin(a) * 9, by + Math.cos(a) * 9); g2.lineTo(tx, ty); g2.lineTo(bx + Math.sin(a) * 9, by - Math.cos(a) * 9); g2.closePath(); };
      ink(g, sp, PAL.ink, 1.6);
    }
    hatch(g, head, 1.1, 3.4, .8, PAL.ink, [150, 40, 300, 220], .5);
    eye(g, 190, 106, 13, [0, .2], .3);
    g.strokeStyle = PAL.ink; g.lineWidth = 3.2; g.beginPath(); g.moveTo(170, 84); g.lineTo(208, 98); g.stroke();
    const snarl = g2 => { g2.beginPath(); g2.moveTo(150, 160); g2.lineTo(200, 150); g2.lineTo(214, 168); g2.lineTo(196, 188); g2.lineTo(150, 180); g2.closePath(); };
    ink(g, snarl, PAL.ink, 1.8);
    g.fillStyle = PAL.vellum; for (let k = 0; k < 5; k++) { const x = 152 + k * 11; g.beginPath(); g.moveTo(x, 158 - k * 1.6); g.lineTo(x + 9, 157 - k * 1.8); g.lineTo(x + 4, 170 - k * 1.5); g.closePath(); g.fill(); }
    g.lineWidth = 1.6; g.strokeStyle = PAL.ink; g.beginPath(); g.moveTo(156, 118); g.quadraticCurveTo(168, 140, 152, 142); g.stroke();
    g.restore();
    g.strokeStyle = PAL.ink; g.lineWidth = 2.6; g.beginPath(); g.moveTo(150, 24); g.lineTo(150, 300); g.stroke();
    // the ribbon and the medal
    const rib = g2 => { g2.beginPath(); g2.moveTo(136, 214); g2.lineTo(164, 214); g2.lineTo(159, 254); g2.lineTo(141, 254); g2.closePath(); };
    ink(g, rib, PAL.vermilion, 1.6); g.strokeStyle = PAL.vermilion2; g.lineWidth = 1; g.beginPath(); g.moveTo(150, 216); g.lineTo(150, 252); g.stroke();
    const med = g2 => { g2.beginPath(); g2.arc(150, 276, 30, 0, 6.283); }; ink(g, med, PAL.gold, 2.2);
    g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.arc(150, 276, 24, 0, 6.283); g.stroke();
    const dove = g2 => { g2.beginPath(); g2.moveTo(134, 280); g2.quadraticCurveTo(146, 262, 162, 274); g2.quadraticCurveTo(170, 270, 168, 266); g2.quadraticCurveTo(164, 284, 150, 288); g2.quadraticCurveTo(140, 290, 134, 280); g2.closePath(); };
    ink(g, dove, PAL.vellum, 1.4); g.beginPath(); g.moveTo(146, 270); g.quadraticCurveTo(156, 256, 160, 262); g.stroke();
  });
  // ii · only the shadow of a girl with a sign (skewed, cast from the lower left; pivot at her feet)
  L.emblems[1] = cutout(300, 300, (g, w, h) => {
    const bx = 62, by = 268, M = (u, v) => [bx + u * .9 + v * .5, by - v * .9];
    const P = pts => { g.moveTo(...M(...pts[0])); for (const p of pts.slice(1)) g.lineTo(...M(...p)); g.closePath(); };
    const shape = g2 => {
      g2.beginPath();
      P([[-18, 0], [-5, 0], [-5, 72], [-18, 72]]); P([[5, 0], [18, 0], [18, 72], [5, 72]]);
      P([[-26, 70], [26, 70], [16, 150], [-16, 150]]);
      const hd = []; for (let k = 0; k < 18; k++) hd.push([Math.cos(k / 18 * 6.283) * 21, 174 + Math.sin(k / 18 * 6.283) * 21]); P(hd);
      P([[-24, 168], [-14, 170], [-22, 112], [-32, 114]]); P([[14, 170], [24, 168], [34, 114], [24, 112]]);
      P([[10, 146], [20, 136], [48, 198], [40, 206]]);
      P([[40, 200], [46, 200], [52, 252], [46, 252]]);
      P([[22, 236], [84, 236], [84, 276], [22, 276]]);
    };
    g.save(); g.globalAlpha = .82; g.fillStyle = PAL.ink; shape(g); g.fill(); g.restore();
    hatch(g, shape, .9, 3.2, .8, PAL.vellum, [0, 0, 300, 300], .22);
  }, { ax: 62 / 300, ay: 268 / 300 });
  // iii · the black pill on its cushion
  L.emblems[2] = cutout(300, 300, (g, w, h) => {
    const cush = g2 => { g2.beginPath(); g2.moveTo(150, 108); g2.quadraticCurveTo(232, 112, 264, 150); g2.quadraticCurveTo(252, 202, 150, 214); g2.quadraticCurveTo(48, 202, 36, 150); g2.quadraticCurveTo(68, 112, 150, 108); g2.closePath(); };
    for (const [x, y, dx, dy] of [[36, 150, -1, 0], [264, 150, 1, 0], [150, 108, 0, -1], [150, 214, 0, 1]]) {
      g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx * 14, y + dy * 14); g.stroke();
      for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x + dx * 14, y + dy * 14); g.lineTo(x + dx * 30 + dy * k * 5, y + dy * 30 + dx * k * 5); g.stroke(); }
    }
    ink(g, cush, PAL.vellum, 2.2); hatch(g, [cush, half(0, 164, 300, 300)], .1, 4, .8, PAL.ink, [0, 0, 300, 300], .5);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.2; for (const [x, y] of [[100, 150], [200, 150], [150, 190]]) { g.beginPath(); g.moveTo(x - 6, y); g.quadraticCurveTo(x, y + 5, x + 6, y); g.stroke(); }
    g.save(); g.translate(150, 146); g.rotate(-.28);
    const pill = g2 => { g2.beginPath(); g2.roundRect(-62, -22, 124, 44, 22); }; ink(g, pill, PAL.ink, 2.2);
    g.strokeStyle = PAL.vellum; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-42, -10); g.lineTo(-14, -12); g.stroke();
    g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 22); g.stroke(); g.restore();
  });
  // iv · the smiling bald head in a hoodie (the X is stamped on live)
  L.emblems[3] = cutout(300, 300, (g, w, h) => {
    const body = g2 => { g2.beginPath(); g2.moveTo(30, 300); g2.lineTo(44, 232); g2.quadraticCurveTo(90, 196, 150, 196); g2.quadraticCurveTo(210, 196, 256, 232); g2.lineTo(270, 300); g2.closePath(); };
    ink(g, body, PAL.vellum, 2.2); hatch(g, [body, half(0, 0, 110, 300)], 1.4, 4.5, .8, PAL.ink, [0, 0, 300, 300], .4);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(96, 300); g.quadraticCurveTo(100, 262, 150, 262); g.quadraticCurveTo(200, 262, 204, 300); g.stroke();   // the pocket
    const hood = g2 => { g2.beginPath(); g2.moveTo(70, 222); g2.quadraticCurveTo(38, 100, 100, 44); g2.quadraticCurveTo(150, 8, 200, 44); g2.quadraticCurveTo(262, 100, 230, 222); g2.closePath(); };
    ink(g, hood, PAL.vellum2, 2.2); hatch(g, hood, 1.3, 4, .9, PAL.ink, [0, 0, 300, 300], .5);
    const head = g2 => { g2.beginPath(); g2.ellipse(150, 128, 64, 76, 0, 0, 6.283); }; ink(g, head, PAL.vellum, 2.4);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.beginPath(); g.arc(150, 128, 56, -2.4, -1.4); g.stroke();
    eye(g, 126, 118, 11, [0, 0], 0); eye(g, 174, 118, 11, [0, 0], 0);
    g.lineWidth = 1.8; for (const x of [126, 174]) { g.beginPath(); g.moveTo(x - 13, 102); g.quadraticCurveTo(x, 96, x + 13, 102); g.stroke(); }
    g.beginPath(); g.moveTo(150, 124); g.lineTo(144, 146); g.lineTo(154, 148); g.stroke();
    g.lineWidth = 2.2; g.beginPath(); g.moveTo(122, 160); g.quadraticCurveTo(150, 184, 178, 160); g.stroke();
    const gt = g2 => { g2.beginPath(); g2.moveTo(134, 178); g2.quadraticCurveTo(150, 186, 166, 178); g2.lineTo(158, 206); g2.lineTo(142, 206); g2.closePath(); };
    ink(g, gt, PAL.vellum, 1.6); hatch(g, gt, 1.4, 2.2, .9, PAL.ink, [0, 0, 300, 300], .85);
    g.lineWidth = 1.6; g.strokeStyle = PAL.ink; for (const x of [132, 168]) { g.beginPath(); g.moveTo(x, 212); g.quadraticCurveTo(x + (x < 150 ? -8 : 8), 240, x, 264); g.stroke(); g.beginPath(); g.arc(x, 268, 3, 0, 6.283); g.fillStyle = PAL.ink; g.fill(); }
  });
  // v · the crossed keys, one snapped
  const key = (g, fill, from, to) => {                    // along +x; bow at -90, bit at +110; from/to clip the shank (fractions)
    const bow = g2 => { g2.beginPath(); g2.arc(-90, 0, 26, 0, 6.283); g2.moveTo(-76, 0); g2.arc(-90, 0, 14, 0, 6.283, true); };
    const x0 = -66 + from * 176, x1 = -66 + to * 176;
    const shank = g2 => { g2.beginPath(); g2.moveTo(x0, -7); g2.lineTo(x1 - 6, -7); g2.lineTo(x1 + 2, -1); g2.lineTo(x1 - 5, 7); g2.lineTo(x0, 7); g2.closePath(); };
    const bit = g2 => { g2.beginPath(); g2.rect(74, 6, 14, 26); g2.rect(96, 6, 12, 18); g2.rect(86, 18, 12, 8); };
    if (from === 0) ink(g, bow, fill, 2.2);
    ink(g, shank, fill, 2.2); if (to === 1) ink(g, bit, fill, 2);
    if (fill === PAL.ink) { g.strokeStyle = PAL.vellum; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0 + 4, -3); g.lineTo(x1 - 8, -3); g.stroke(); }
    else hatch(g, shank, .1, 3, .7, PAL.ink, [-120, -40, 120, 40], .4);
  };
  L.emblems[4] = cutout(300, 300, (g, w, h) => {
    g.save(); g.translate(150, 146); g.rotate(-.66); key(g, PAL.ink, 0, .56); g.restore();         // the snapped key: bow half
    g.save(); g.translate(150, 146); g.rotate(.66); key(g, PAL.gold, 0, 1); g.restore();
    g.save(); g.translate(112, 232); g.rotate(.28); key(g, PAL.ink, .6, 1); g.restore();          // the broken bit, lying below
    g.strokeStyle = PAL.ink; g.lineWidth = 1.4; for (let k = 0; k < 6; k++) { const a = rnd(0, 6.283); g.beginPath(); g.moveTo(150 + Math.cos(a) * 36, 146 + Math.sin(a) * 36); g.lineTo(150 + Math.cos(a) * 52, 146 + Math.sin(a) * 52); g.stroke(); }
  });
  // vi · the tiara grown into a dome of state, with the red star
  L.emblems[5] = cutout(300, 300, (g, w, h) => {
    for (const s of [-1, 1]) { const lap = g2 => { g2.beginPath(); g2.rect(150 + s * 84 - 8, 250, 16, 42); }; ink(g, lap, PAL.vellum, 1.6); hatch(g, lap, 1.5, 3, .7, PAL.ink, [0, 0, 300, 300], .5); g.strokeStyle = PAL.ink; g.lineWidth = 1; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(150 + s * 84 + k * 5, 292); g.lineTo(150 + s * 84 + k * 5, 300); g.stroke(); } }
    const bands = [[262, 112, true], [226, 96, true], [190, 80, false]];
    for (const [y, hw, points] of bands) {
      const band = g2 => { g2.beginPath(); g2.moveTo(150 - hw, y); g2.lineTo(150 + hw, y); g2.lineTo(150 + hw * .88, y - 34); g2.lineTo(150 - hw * .88, y - 34); g2.closePath(); };
      ink(g, band, PAL.gold, 2.2); hatch(g, [band, half(0, 0, 150 - hw * .25, 300)], 1.5, 3.5, .7, PAL.ink, [0, 0, 300, 300], .35);
      if (points) for (let i = -3; i <= 3; i++) { const x = 150 + i * hw * .27; const pt = g2 => { g2.beginPath(); g2.moveTo(x - 8, y - 33); g2.lineTo(x, y - 50); g2.lineTo(x + 8, y - 33); g2.closePath(); }; ink(g, pt, PAL.gold2, 1.6); }
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(150 + i * hw * .38, y - 16, 4.5, 0, 6.283); g.fillStyle = PAL.vellum; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.stroke(); }
    }
    const drum = g2 => { g2.beginPath(); g2.rect(102, 116, 96, 40); }; ink(g, drum, PAL.vellum, 2);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.6; for (let k = 0; k < 7; k++) { const x = 108 + k * 14; g.beginPath(); g.moveTo(x, 120); g.lineTo(x, 152); g.moveTo(x + 4, 120); g.lineTo(x + 4, 152); g.stroke(); }
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(96, 116); g.lineTo(204, 116); g.stroke();
    const dome = g2 => { g2.beginPath(); g2.moveTo(102, 116); g2.quadraticCurveTo(104, 56, 150, 52); g2.quadraticCurveTo(196, 56, 198, 116); g2.closePath(); };
    ink(g, dome, PAL.vellum, 2.2); hatch(g, [dome, half(0, 0, 128, 300)], 1.2, 3.5, .8, PAL.ink, [0, 0, 300, 300], .45);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.2; for (const x of [122, 136, 164, 178]) { g.beginPath(); g.moveTo(150, 54); g.quadraticCurveTo(x, 80, x + (x < 150 ? -4 : 4), 116); g.stroke(); }
    const lant = g2 => { g2.beginPath(); g2.rect(142, 36, 16, 18); }; ink(g, lant, PAL.vellum, 1.6);
    g.beginPath(); g.moveTo(140, 36); g.lineTo(160, 36); g.stroke();
    g.save(); g.translate(150, 22); g.fillStyle = PAL.vermilion; g.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 5.5 : 14, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    g.closePath(); g.fill(); g.strokeStyle = PAL.vermilion2; g.lineWidth = 1; g.stroke(); g.restore();
  });
  // vii · the machinery: gears (drawn live, turning) around a single eye
  L.gears = [[92, 14], [44, 8]].map(([r, n]) => cutout(r * 2 + 24, r * 2 + 24, (g, w, h) => {
    const c = w / 2, gp = g2 => gearPath(g2, c, c, r, n, .2);
    ink(g, gp, PAL.vellum, 2.2); hatch(g, [gp, half(0, c, w, h)], .7, 4, .8, PAL.ink, [0, 0, w, h], .35);
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.arc(c, c, r * .7, 0, 6.283); g.stroke();
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; g.beginPath(); g.moveTo(c + Math.cos(a) * r * .3, c + Math.sin(a) * r * .3); g.lineTo(c + Math.cos(a) * r * .7, c + Math.sin(a) * r * .7); g.stroke(); }
    g.beginPath(); g.arc(c, c, r * .3, 0, 6.283); g.stroke();
  }));
}

// the medallion swings out in the .3 s before each trumpet and snaps back in with the next emblem
function l3_swing(t) {
  let rot = Math.sin(t * 1.1) * .006, idx = -1;
  for (let i = 0; i < 7; i++) {
    const Ti = L3_T(i);
    if (t >= Ti) idx = i;
    if (t >= Ti - .3 && t < Ti) rot += .5 * eIn(seg(t, Ti - .3, Ti));
    else if (t >= Ti && t < Ti + .35) rot += .5 * (1 - eBack(seg(t, Ti, Ti + .35)));
  }
  return { rot, idx };
}
function l3_emblem(g, i, t, cx, cy) {
  if (i < 0) return;
  const L = SP.l3, Ti = L3_T(i);
  if (i === 1) { g.save(); g.translate(cx - 88, cy + 118); g.rotate(Math.sin(t * 1.7) * .035); spr(g, L.emblems[1], 0, 0); g.restore(); return; }
  if (i === 6) {
    const w = .6 * (t - Ti);
    spr(g, L.gears[0], cx, cy, w);
    for (const a of [-2.2, .4, 2.6]) spr(g, L.gears[1], cx + Math.cos(a) * 136, cy + Math.sin(a) * 136, -w * 92 / 44 + a);
    g.save(); g.strokeStyle = PAL.ink; g.lineWidth = 2.4; g.fillStyle = PAL.vellum; g.beginPath(); g.arc(cx, cy, 50, 0, 6.283); g.fill(); g.stroke(); g.restore();
    const lid = 1 - seg(t, Ti + .1, Ti + .5), look = -eIO(seg(t, Ti + .8, Ti + 2.5));
    eye(g, cx, cy, 40, [look, 0], lid);
    return;
  }
  spr(g, L.emblems[i], cx, cy);
  if (i === 3) {                                               // the X, stamped in two rough strokes with a splatter
    const strokes = [[[-70, -92], [70, 92], Ti + 1.0], [[70, -92], [-70, 92], Ti + 1.2]];
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    strokes.forEach(([a, b, at], si) => {
      const k = seg(t, at, at + .15); if (k <= 0) return;
      seed(440 + si); g.strokeStyle = PAL.vermilion; g.lineWidth = 11; g.beginPath(); g.moveTo(cx + a[0], cy + a[1]);
      for (let j = 1; j <= 8; j++) { const f = j / 8 * k; g.lineTo(cx + lerp(a[0], b[0], f) + rnd(-2, 2), cy + lerp(a[1], b[1], f) + rnd(-2, 2)); }
      g.stroke(); g.strokeStyle = PAL.vermilion2; g.lineWidth = 3; g.globalAlpha = .5; g.beginPath(); g.moveTo(cx + a[0] + 3, cy + a[1] + 2);
      for (let j = 1; j <= 8; j++) { const f = j / 8 * k; g.lineTo(cx + lerp(a[0], b[0], f) + 3 + rnd(-1, 1), cy + lerp(a[1], b[1], f) + 2 + rnd(-1, 1)); }
      g.stroke(); g.globalAlpha = 1;
      if (k >= 1) { g.fillStyle = PAL.vermilion; for (let j = 0; j < 7; j++) { g.beginPath(); g.arc(cx + b[0] + rnd(-26, 26), cy + b[1] + rnd(-22, 22), rnd(1, 3.5), 0, 6.283); g.fill(); } }
    });
    g.restore();
  }
}

function leaf3(g, t) {
  spread(g, t, L3_SPEC, (g, p) => {
    const L = SP.l3;
    g.drawImage(L.sky, p.x, p.y);
    // the seven horns through the clouds, numbered; each flares as it sounds; all droop at the end
    const droopK = eIO(seg(t, 62, 63.2));
    for (let i = 0; i < 7; i++) {
      const x = l3_bellX(i), Ti = L3_T(i), fl = seg(t, Ti, Ti + .3), s = 1 + .25 * Math.sin(fl * Math.PI);
      const droop = .15 * droopK * (i < 3 ? 1 : i > 3 ? -1 : 0);
      spr(g, L.trumpet, x, p.y - 8, droop, s, s);
      if (fl > 0 && fl < 1) {
        g.save(); g.globalAlpha = 1 - fl; g.strokeStyle = PAL.ink; g.lineWidth = 2; g.lineCap = 'round';
        for (const a of [Math.PI / 2 - .55, Math.PI / 2, Math.PI / 2 + .55]) { const r0 = 14 + fl * 22, r1 = r0 + 26; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, p.y + 112 + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, p.y + 112 + Math.sin(a) * r1); g.stroke(); }
        g.restore();
      }
      caps(g, L3_NUM[i], x, p.y + 130, 12, t >= Ti ? PAL.vermilion : PAL.ink, 1.5, 'center');
    }
    // the medallion on its strap, swinging on the nail
    const { rot, idx } = l3_swing(t);
    g.save(); g.translate(L3_PIV[0], L3_PIV[1]); g.rotate(rot);
    spr(g, L.strap, 0, 0);
    spr(g, L.medallion, 0, L3_DROP);
    g.save(); g.beginPath(); g.arc(0, L3_DROP, 142, 0, 6.283); g.clip();
    l3_emblem(g, idx, t, 0, L3_DROP);
    g.restore(); g.restore();
    g.beginPath(); g.arc(L3_PIV[0], L3_PIV[1], 6, 0, 6.283); g.fillStyle = PAL.ink; g.fill();
    g.beginPath(); g.arc(L3_PIV[0] - 2, L3_PIV[1] - 2, 1.8, 0, 6.283); g.fillStyle = PAL.vellum; g.fill();
  });
}
