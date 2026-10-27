// sprites2.js — bloodstream highway, pancreas works, brass insulin keys, the cell door, the Hand.
'use strict';

function buildBlood() {
  seed(31);
  SP.plasma = paintCanvas(1800, 720, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c9745a'); gr.addColorStop(.5, '#dd9670'); gr.addColorStop(1, '#b75c47');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(90,25,15,.35)'; g.lineWidth = 1.2;
    for (let y = 20; y < h; y += 11) { g.beginPath(); for (let x = 0; x <= w; x += 20) g.lineTo(x, y + Math.sin(x * .012 + y * .3) * 6); g.stroke(); }
    for (let i = 0; i < 40; i++) {                                  // distant cells, faint
      const x = rnd(0, w), y = rnd(120, 600), r = rnd(14, 26);
      g.fillStyle = 'rgba(150,40,30,.25)'; g.beginPath(); g.ellipse(x, y, r, r * rnd(.4, 1), rnd(0, 3), 0, 6.28); g.fill();
    }
  }, .8);
  const wallBand = (flip) => cutout(1200, 190, (g, w, h) => {
    const P = g2 => { g2.beginPath(); if (!flip) { g2.moveTo(0, 0); g2.lineTo(w, 0); g2.lineTo(w, h * .6); for (let x = w; x >= 0; x -= 40) g2.lineTo(x, h * .6 + Math.sin(x * .02) * 26 + rnd(-8, 8)); }
      else { g2.moveTo(0, h); g2.lineTo(w, h); g2.lineTo(w, h * .4); for (let x = w; x >= 0; x -= 40) g2.lineTo(x, h * .4 + Math.sin(x * .017 + 2) * 26 + rnd(-8, 8)); } g2.closePath(); };
    ink(g, P, '#94352c', 2.4);
    hatch(g, P, flip ? -.08 : .08, 5, 1, PAL.ink, [0, 0, w, h], .5, 3);
    for (let i = 0; i < 6; i++) {                                    // capillary engravings
      g.save(); P(g); g.clip(); g.strokeStyle = '#3f5a8a'; g.lineWidth = 2.2; let x = rnd(0, w), y = flip ? h - 10 : 10; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += rnd(-40, 40); y += flip ? -16 : 16; g.lineTo(x, y); } g.stroke(); g.restore();
    }
    wash(g, P, w * .3, flip ? h : 0, 300, '#e98a70', .4);
  }, { ax: 0, ay: flip ? 1 : 0, shadow: flip ? 0 : 7 });
  SP.wallTop = wallBand(false); SP.wallBot = wallBand(true);

  SP.rbc = [];
  for (let v = 0; v < 3; v++) SP.rbc.push(cutout(96, 96, (g, w, h) => {
    ink(g, circ(48, 48, 44), ['#b8352c', '#a92f28', '#c4463a'][v], 2.2);
    ink(g, circ(48, 48, 22), '#d86a57', 1.2, 'rgba(40,10,5,.6)');
    hatch(g, [circ(48, 48, 44), half(48, 30, 100, 100)], .8, 3, .8, PAL.ink, [0, 0, 96, 96], .5);
    g.fillStyle = 'rgba(255,220,200,.7)'; g.beginPath(); g.ellipse(34, 30, 10, 5, -.6, 0, 6.28); g.fill();
  }, { margin: 2.5, shadow: 3 }));
  SP.sugar = cutout(46, 46, (g) => {
    const top = g2 => roughPoly(g2, [[4, 12], [26, 4], [44, 12], [22, 20]], .6), left = g2 => roughPoly(g2, [[4, 12], [22, 20], [22, 44], [4, 36]], .6), right = g2 => roughPoly(g2, [[22, 20], [44, 12], [44, 36], [22, 44]], .6);
    ink(g, top, '#fbf6ea', 1.4); ink(g, left, '#e6dfcf', 1.4); ink(g, right, '#cfc6b2', 1.4);
    hatch(g, right, .9, 2.4, .6, PAL.ink, [22, 10, 46, 46], .55); stipple(g, top, [0, 0, 46, 22], 20, .7, PAL.ink, .4);
  }, { margin: 2, shadow: 3 });

  // --- brass insulin keys ---
  SP.keys = [];
  for (let v = 0; v < 3; v++) SP.keys.push(cutout(84, 30, (g, w, h) => {
    const col = ['#c89a45', '#b8863a', '#d7ab55'][v];
    ink(g, g2 => { g2.beginPath(); g2.arc(15, 15, 13, 0, 6.283); g2.moveTo(22, 15); g2.arc(15, 15, 6, 6.283, 0, true); }, col, 1.6);
    if (v === 1) { g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.arc(15, 15, 9.5, 0, 6.28); g.stroke(); }
    ink(g, rect(27, 12, 50, 6), col, 1.4);
    ink(g, g2 => { g2.beginPath(); g2.rect(62, 18, 5, 9); g2.rect(70, 18, 6, 11); }, col, 1.2);
    hatch(g, g2 => { g2.beginPath(); g2.rect(27, 15, 50, 3); g2.arc(15, 20, 13, 0, 3.14); }, 0, 1.6, .6, PAL.ink, [0, 0, 84, 30], .6);
    g.fillStyle = 'rgba(255,245,200,.9)'; g.fillRect(30, 12.5, 30, 1.5);
  }, { margin: 2, shadow: 2, ax: .18, ay: .5 }));

  // --- the pancreas works: a lumpy Victorian factory shaped like the organ ---
  SP.factory = cutout(600, 330, (g, w, h) => {
    const body = g2 => { const pts = [[20, 250], [30, 200], [80, 170], [150, 175], [210, 150], [300, 146], [380, 130], [460, 118], [530, 100], [585, 120], [592, 170], [560, 214], [500, 236], [420, 252], [330, 270], [250, 300], [150, 318], [60, 310]]; smoothPoly(g2, pts); };
    ink(g, g2 => { g2.beginPath(); g2.rect(96, 20, 34, 170); g2.rect(170, 0, 30, 170); }, '#8a4b33', 2.2);   // chimneys
    for (const x of [96, 170]) { ink(g, rect(x - 6, x === 96 ? 14 : -6, x === 96 ? 46 : 42, 12), '#6b3a28', 1.6); hatch(g, rect(x, 20, 34, 170), 1.57, 6, .8, PAL.ink, [x, 0, x + 34, 190], .5); }
    ink(g, body, '#d8a07c', 2.6);
    hatch(g, body, 0, 12, 1, 'rgba(60,30,20,.9)', [0, 100, w, h], .5);               // brick courses
    g.save(); body(g); g.clip(); g.strokeStyle = 'rgba(60,30,20,.45)'; g.lineWidth = 1; g.beginPath();
    for (let y = 96; y < 330; y += 12) for (let x = (Math.round(y / 12) % 2) * 14; x < w; x += 28) { g.moveTo(x, y); g.lineTo(x, y + 12); }
    g.stroke(); g.restore();
    stipple(g, body, [0, 100, w, h], 400, 1, '#6a3020', .35);
    hatch(g, [body, half(0, 240, w, h)], .5, 3.5, .9, PAL.ink, [0, 0, w, h], .55);
    for (let i = 0; i < 9; i++) {                                                     // arched windows glowing
      const x = 70 + i * 55, y = 230 - i * 11;
      ink(g, g2 => { g2.beginPath(); g2.moveTo(x, y + 26); g2.lineTo(x, y + 8); g2.arc(x + 9, y + 8, 9, 3.14, 0); g2.lineTo(x + 18, y + 26); g2.closePath(); }, '#f4d372', 1.5);
      g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 9, y); g.lineTo(x + 9, y + 26); g.moveTo(x, y + 14); g.lineTo(x + 18, y + 14); g.stroke();
    }
    ink(g, g2 => { g2.beginPath(); g2.moveTo(560, 130); g2.lineTo(600, 110); g2.lineTo(606, 150); g2.lineTo(570, 170); g2.closePath(); }, PAL.brass, 2);   // key chute
    rivets(g, [[572, 140], [596, 128], [584, 158]], 2.5);
    ink(g, circ(300, 250, 30), '#e8dcc0', 2); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; g.beginPath(); g.moveTo(300 + Math.cos(a) * 24, 250 + Math.sin(a) * 24); g.lineTo(300 + Math.cos(a) * 28, 250 + Math.sin(a) * 28); g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.stroke(); }   // factory clock
    wash(g, body, 400, 150, 200, '#f0c09a', .4);
  }, { ax: 0, ay: 1 });
  SP.pumpArm = cutout(230, 36, (g, w, h) => { ink(g, rrect(0, 8, w, 20, 1), '#9a9c94', 2); hatch(g, rect(0, 18, w, 10), 0, 2.5, .7, PAL.ink, [0, 0, w, h], .6); rivets(g, [[14, 18], [w - 14, 18]], 5); }, { ax: .06, ay: .5 });
  SP.bellows = cutout(120, 110, (g, w, h) => {
    ink(g, g2 => { g2.beginPath(); g2.moveTo(10, 10); g2.lineTo(110, 10); g2.lineTo(80, 100); g2.lineTo(40, 100); g2.closePath(); }, '#7b4a2e', 2);
    for (let y = 22; y < 96; y += 12) { g.strokeStyle = PAL.ink; g.lineWidth = 1.5; g.beginPath(); g.moveTo(14 + (y - 10) * .3, y); g.lineTo(106 - (y - 10) * .3, y); g.stroke(); }
    ink(g, rect(0, 0, 120, 12), PAL.brass, 1.8);
  }, { ax: .5, ay: 0 });
  SP.puff = [];
  for (let v = 0; v < 4; v++) SP.puff.push(cutout(150, 110, (g, w, h) => {
    const P = g2 => blobPath(g2, 75, 55, 66, 44, 11, .22, rnd(0, 3));
    ink(g, P, v < 2 ? '#e9e1cf' : '#cfc5b0', 2);
    hatch(g, [P, half(0, 62, w, h)], .2, 3.2, .8, PAL.ink, [0, 0, w, h], .5);
    for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(rnd(30, 120), rnd(25, 60), rnd(10, 18), 3.5, 5.9); g.strokeStyle = 'rgba(40,30,20,.5)'; g.lineWidth = 1.2; g.stroke(); }
  }, { margin: 3, shadow: 3 }));
}

// ---------- the cell door ----------
const DOOR_R = 260;
function keyholes() {                                   // deterministic list shared by art & animation
  const out = []; seed(77);
  const rings = [[0, 1], [95, 8], [178, 14]];
  for (const [r, n] of rings) for (let i = 0; i < n; i++) { const a = i / n * 6.283 + (r === 178 ? .1 : .3); out.push([Math.cos(a) * r + rnd(-6, 6), Math.sin(a) * r + rnd(-6, 6), rnd(-.4, .4)]); }
  return out;
}
const KEYHOLES = keyholes();
function keyholePath(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.moveTo(9, 0); g.arc(0, 0, 9, 0, 6.283); g.moveTo(-4, 5); g.lineTo(-7, 24); g.lineTo(7, 24); g.lineTo(4, 5); g.closePath(); g.restore();
}
function doorArt(g, w, h, clipFn) {
  seed(78);
  const cx = w / 2, cy = h / 2;
  if (clipFn) { clipFn(g); g.clip(); }
  // lipid bilayer rim: two rows of phosphate heads with wiggly tails
  ink(g, circ(cx, cy, DOOR_R), '#c8a3a8', 2.6);
  for (const [r, dir] of [[DOOR_R - 10, -1], [DOOR_R - 52, 1]]) {
    const n = Math.round(r * .19);
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.283, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y);
      for (let k = 1; k <= 4; k++) { const rr = r + dir * k * 4.5; g.lineTo(cx + Math.cos(a + (k % 2 ? .012 : -.012)) * rr, cy + Math.sin(a + (k % 2 ? .012 : -.012)) * rr); } g.stroke();
      g.beginPath(); g.arc(x, y, 6.5, 0, 6.28); g.fillStyle = '#e0b8a0'; g.fill(); g.stroke();
    }
  }
  // iron face of the door
  const face = circ(cx, cy, DOOR_R - 66);
  ink(g, face, '#6f7672', 3);
  hatch(g, face, .6, 4, .9, PAL.ink, [0, 0, w, h], .5);
  hatch(g, [face, half(cx, cy, w, h)], -.6, 4, .9, PAL.ink, [0, 0, w, h], .45);
  for (let i = 0; i < 26; i++) {                                           // rust blooms
    const a = rnd(0, 6.28), r = rnd(0, DOOR_R - 80);
    wash(g, face, cx + Math.cos(a) * r, cy + Math.sin(a) * r, rnd(20, 60), '#9a4a22', .7);
  }
  g.strokeStyle = PAL.ink; g.lineWidth = 3; for (const r of [DOOR_R - 80, 140, 52]) { g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.stroke(); }
  const pts = []; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283; pts.push([cx + Math.cos(a) * (DOOR_R - 73), cy + Math.sin(a) * (DOOR_R - 73)]); } rivets(g, pts, 4);
  // keyholes: escutcheons + punched holes
  for (const [x, y, rot] of KEYHOLES) {
    ink(g, g2 => { g2.beginPath(); g2.ellipse(cx + x, cy + y + 7, 18, 26, rot, 0, 6.283); }, '#8a5a2e', 1.6);
    g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); keyholePath(g, cx + x, cy + y, 1, rot); g.fill(); g.restore();
    g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.beginPath(); keyholePath(g, cx + x, cy + y, 1.02, rot); g.stroke();
  }
}
function buildDoor() {
  SP.door = cutout(DOOR_R * 2, DOOR_R * 2, (g, w, h) => doorArt(g, w, h), { shadow: 8 });
  SP.doorWedges = [];
  for (let i = 0; i < 8; i++) {
    const a0 = i / 8 * 6.283 + .2, a1 = (i + 1) / 8 * 6.283 + .2;
    SP.doorWedges.push({ a: (a0 + a1) / 2, s: cutout(DOOR_R * 2, DOOR_R * 2, (g, w, h) => doorArt(g, w, h, g2 => { g2.beginPath(); g2.moveTo(w / 2, h / 2); g2.arc(w / 2, h / 2, DOOR_R + 20, a0, a1); g2.closePath(); }), { shadow: 6, margin: 2.5 }) });
  }
  seed(80);
  SP.cellWall = paintCanvas(1400, 820, (g, w, h) => {
    g.fillStyle = '#b98c8f'; g.fillRect(0, 0, w, h);
    for (let y = -20; y < h + 20; y += 38) for (let x = (y / 38 % 2) * 20; x < w; x += 40) {        // membrane "wallpaper" of phospholipids
      g.strokeStyle = 'rgba(50,25,25,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x - 2, y + 16); g.lineTo(x + 1, y + 26); g.moveTo(x + 4, y + 6); g.lineTo(x + 6, y + 16); g.lineTo(x + 3, y + 26); g.stroke();
      g.fillStyle = 'rgba(235,200,180,.9)'; g.beginPath(); g.arc(x + 2, y + 3, 5, 0, 6.28); g.fill(); g.stroke();
    }
    const vg = g.createRadialGradient(w / 2, h * .45, 100, w / 2, h / 2, 800); vg.addColorStop(0, 'rgba(255,230,200,.2)'); vg.addColorStop(1, 'rgba(60,20,20,.55)');
    g.fillStyle = vg; g.fillRect(0, 0, w, h);
  }, .9);
  SP.gears = [];
  for (const [r, n] of [[90, 14], [62, 10], [44, 8]]) {
    for (const shiny of [0, 1]) SP.gears.push(cutout(r * 2 + 4, r * 2 + 4, (g, w, h) => {
      const c = w / 2, P = g2 => { gearPath(g2, c, c, r, n); g2.moveTo(c + r * .25, c); g2.arc(c, c, r * .25, 6.283, 0, true); };
      ink(g, P, shiny ? '#d9aa48' : '#7d4a2a', 2);
      for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.save(); P(g); g.clip(); g.fillStyle = shiny ? '#9a6f28' : '#4a2a18'; g.beginPath(); g.ellipse(c + Math.cos(a) * r * .52, c + Math.sin(a) * r * .52, r * .16, r * .16, 0, 0, 6.28); g.fill(); g.restore(); }
      hatch(g, [P, half(c, 0, w, h)], .7, 3, .8, PAL.ink, [0, 0, w, h], shiny ? .35 : .6);
      if (shiny) wash(g, P, c - r * .4, c - r * .4, r, '#fff3c0', .7); else stipple(g, P, [0, 0, w, h], r * 4, 1.4, '#3a1a08', .6);
    }, { margin: 2.5, shadow: 4 }));
  }
  SP.lever = cutout(40, 200, (g, w, h) => {
    ink(g, rrect(14, 30, 12, 170, 1), '#6a6c66', 1.8); hatch(g, rect(20, 30, 6, 170), 1.57, 2, .6, PAL.ink, [14, 30, 26, 200], .6);
    ink(g, circ(20, 22, 18), '#a8312a', 2); g.fillStyle = 'rgba(255,220,200,.8)'; g.beginPath(); g.arc(14, 16, 5, 0, 6.28); g.fill();
  }, { ax: .5, ay: .97 });
  SP.leverBase = cutout(120, 60, (g, w, h) => { ink(g, g2 => { g2.beginPath(); g2.moveTo(0, 60); g2.arc(60, 60, 58, 3.14, 0); g2.closePath(); }, PAL.brass, 2.2); rivets(g, [[20, 50], [100, 50], [60, 18]], 4); }, { ax: .5, ay: 1 });
}

// ---------- the Hand of Providence, with butter & avocado ----------
function buildHand() {
  seed(90);
  SP.hand = cutout(760, 330, (g, w, h) => {
    // sleeve & lace cuff at left, open palm facing up, fingers to right
    ink(g, g2 => { g2.beginPath(); g2.moveTo(0, 90); g2.lineTo(230, 110); g2.lineTo(240, 260); g2.lineTo(0, 290); g2.closePath(); }, '#2f3e5a', 2.6);
    hatch(g, g2 => { g2.beginPath(); g2.moveTo(0, 90); g2.lineTo(230, 110); g2.lineTo(240, 260); g2.lineTo(0, 290); g2.closePath(); }, .1, 4, 1, '#0d0a08', [0, 80, 240, 300], .6);
    for (let i = 0; i < 3; i++) { ink(g, circ(215, 140 + i * 45, 8), PAL.gold, 1.4); }
    const lace = g2 => { g2.beginPath(); g2.moveTo(230, 90); for (let y = 90; y <= 280; y += 19) { g2.quadraticCurveTo(292, y + 9, 250, y + 19); } g2.lineTo(220, 280); g2.closePath(); };
    ink(g, lace, '#f4ecd8', 1.8);
    for (let y = 100; y < 280; y += 19) { g.beginPath(); g.arc(258, y + 9, 5, 0, 6.28); g.strokeStyle = PAL.ink; g.lineWidth = 1; g.stroke(); }
    const palm = g2 => {
      g2.beginPath(); g2.moveTo(268, 130); g2.bezierCurveTo(330, 110, 400, 150, 470, 160);
      g2.bezierCurveTo(560, 150, 680, 160, 740, 172); g2.bezierCurveTo(760, 180, 756, 198, 736, 200);                 // index
      g2.bezierCurveTo(680, 200, 620, 196, 600, 204); g2.bezierCurveTo(680, 210, 728, 214, 740, 222); g2.bezierCurveTo(750, 236, 738, 246, 720, 244);  // middle
      g2.bezierCurveTo(660, 240, 610, 236, 590, 244); g2.bezierCurveTo(660, 254, 700, 258, 706, 268); g2.bezierCurveTo(710, 282, 694, 288, 680, 284);  // ring
      g2.bezierCurveTo(630, 278, 590, 276, 570, 280); g2.bezierCurveTo(620, 292, 646, 300, 646, 310); g2.bezierCurveTo(640, 324, 620, 322, 600, 316);  // little
      g2.bezierCurveTo(520, 300, 420, 300, 330, 290); g2.bezierCurveTo(290, 285, 270, 270, 268, 240); g2.closePath();
    };
    ink(g, palm, '#ecc6a4', 2.6);
    hatch(g, [palm, half(0, 250, w, h)], .15, 3.5, .9, PAL.ink, [0, 0, w, h], .55);
    wash(g, palm, 420, 200, 140, '#e38f7a', .45);
    ink(g, g2 => { g2.beginPath(); g2.moveTo(360, 150); g2.bezierCurveTo(420, 120, 480, 110, 520, 130); g2.bezierCurveTo(540, 140, 530, 156, 510, 156); g2.bezierCurveTo(470, 150, 420, 160, 380, 176); g2.closePath(); }, '#ecc6a4', 2.2);   // thumb
    g.strokeStyle = 'rgba(60,30,20,.7)'; g.lineWidth = 1.4;
    for (const [a, b, c2, d] of [[330, 230, 470, 210], [340, 260, 500, 250], [400, 190, 480, 240]]) { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c2) / 2, b - 10, c2, d); g.stroke(); }   // palm lines
  }, { ax: .62, ay: .5 });
  SP.sleeve = cutout(1100, 196, (g, w, h) => {
    const P = rrect(0, 0, w, h, 2);
    ink(g, P, '#2f3e5a', 2.6); hatch(g, P, .1, 4, 1, '#0d0a08', [0, 0, w, h], .6);
    for (let x = 80; x < w; x += 190) { g.strokeStyle = 'rgba(10,8,6,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 30, h / 2, x, h); g.stroke(); }
    wash(g, P, w * .6, 30, 300, '#6d86b0', .5);
  }, { ax: 1, ay: .5 });
  SP.butter = cutout(150, 90, (g) => {
    const top = g2 => roughPoly(g2, [[6, 30], [96, 8], [146, 26], [56, 50]], .8), front = g2 => roughPoly(g2, [[6, 30], [56, 50], [56, 86], [6, 66]], .8), side = g2 => roughPoly(g2, [[56, 50], [146, 26], [146, 62], [56, 86]], .8);
    ink(g, top, '#f7dc78', 1.8); ink(g, front, '#e9c150', 1.8); ink(g, side, '#d6a83a', 1.8);
    hatch(g, side, 1.2, 3, .8, PAL.ink, [56, 20, 150, 90], .5);
    g.strokeStyle = 'rgba(120,80,20,.8)'; g.lineWidth = 1.3; g.beginPath(); g.ellipse(76, 29, 20, 8, -.2, 0, 6.28); g.stroke();       // dairy stamp: a tiny cow
    g.beginPath(); g.moveTo(66, 30); g.lineTo(84, 26); g.moveTo(68, 30); g.lineTo(68, 35); g.moveTo(82, 27); g.lineTo(82, 32); g.moveTo(84, 26); g.lineTo(88, 22); g.stroke();
    g.fillStyle = 'rgba(255,250,220,.9)'; g.beginPath(); g.ellipse(40, 26, 14, 3, -.25, 0, 6.28); g.fill();
  });
  SP.avoHalf = cutout(110, 140, (g) => {
    const skin = g2 => { g2.beginPath(); g2.moveTo(55, 4); g2.bezierCurveTo(80, 4, 84, 40, 96, 70); g2.bezierCurveTo(112, 110, 90, 138, 55, 138); g2.bezierCurveTo(20, 138, -2, 110, 14, 70); g2.bezierCurveTo(26, 40, 30, 4, 55, 4); g2.closePath(); };
    ink(g, skin, '#3f5a22', 2.2);
    const flesh = g2 => { g2.beginPath(); g2.moveTo(55, 12); g2.bezierCurveTo(74, 12, 76, 44, 88, 72); g2.bezierCurveTo(102, 106, 84, 130, 55, 130); g2.bezierCurveTo(26, 130, 8, 106, 22, 72); g2.bezierCurveTo(34, 44, 36, 12, 55, 12); g2.closePath(); };
    ink(g, flesh, '#d8de8e', 1.4); wash(g, flesh, 55, 95, 50, '#e9e7a0', .8); wash(g, flesh, 55, 30, 50, '#9fb45a', .5);
    ink(g, circ(55, 92, 23), '#8a5230', 2); hatch(g, [circ(55, 92, 23), half(55, 80, 90, 120)], .7, 2.4, .8, PAL.ink, [30, 60, 90, 120], .6);
    g.fillStyle = 'rgba(255,230,200,.8)'; g.beginPath(); g.ellipse(47, 84, 6, 4, -.5, 0, 6.28); g.fill();
  }, { ay: .9 });
}
