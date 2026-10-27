// sprites1.js — parlour, cake, fork, the Gentleman-Diner's mouth, esophagus rings.
'use strict';
const SP = {};

function paintCanvas(w, h, draw, grainA = .9) {
  const c = mk(w, h), g = c.getContext('2d'); draw(g, w, h);
  g.globalCompositeOperation = 'multiply'; grainFill(g, w, h, PAPER, grainA); g.globalCompositeOperation = 'source-over';
  return c;
}

function buildScene1() {
  seed(11);
  // --- parlour wallpaper flat ---
  SP.parlour = paintCanvas(1500, 820, (g, w, h) => {
    g.fillStyle = '#d7c49a'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 90) {                                  // faded stripes
      g.fillStyle = 'rgba(109,153,138,.35)'; g.fillRect(x, 0, 38, h * .72);
      g.fillStyle = 'rgba(150,110,70,.18)'; g.fillRect(x + 44, 0, 6, h * .72);
    }
    for (let y = 30; y < h * .7; y += 80) for (let x = 64 + (y / 80 % 2) * 45; x < w; x += 90) {   // damask sprigs
      g.save(); g.translate(x, y); g.strokeStyle = 'rgba(60,45,30,.45)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(9, -4, 0, 12); g.quadraticCurveTo(-9, -4, 0, -14); g.stroke();
      g.beginPath(); g.moveTo(0, 12); g.lineTo(0, 18); g.moveTo(-7, 4); g.quadraticCurveTo(-14, 0, -12, -6); g.moveTo(7, 4); g.quadraticCurveTo(14, 0, 12, -6); g.stroke(); g.restore();
    }
    g.fillStyle = '#7b5536'; g.fillRect(0, h * .72, w, h * .28);         // wainscot
    hatch(g, rect(0, h * .72, w, h * .28), .05, 4, .8, PAL.ink, [0, h * .72, w, h], .45);
    g.fillStyle = '#a9794a'; g.fillRect(0, h * .72 - 10, w, 16); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.strokeRect(-2, h * .72 - 10, w + 4, 16);
    for (let x = 30; x < w; x += 170) { g.strokeStyle = 'rgba(40,25,15,.7)'; g.lineWidth = 2; g.strokeRect(x, h * .72 + 30, 130, 150); }
    // silhouette cameo portrait (a Victorian lady who will watch disapprovingly)
    g.save(); g.translate(240, 250);
    g.beginPath(); g.ellipse(0, 0, 92, 118, 0, 0, 6.283); g.fillStyle = '#b08d45'; g.fill(); g.lineWidth = 3; g.strokeStyle = PAL.ink; g.stroke();
    g.beginPath(); g.ellipse(0, 0, 76, 102, 0, 0, 6.283); g.fillStyle = '#efe2c1'; g.fill(); g.stroke();
    g.fillStyle = '#1d1712'; g.beginPath();
    g.moveTo(-10, -70); g.bezierCurveTo(30, -80, 34, -40, 26, -24); g.lineTo(36, -8); g.lineTo(26, -4); g.lineTo(30, 6); g.lineTo(24, 12);
    g.bezierCurveTo(28, 26, 14, 30, 8, 34); g.lineTo(10, 58); g.bezierCurveTo(30, 66, 44, 80, 50, 96); g.lineTo(-50, 96);
    g.bezierCurveTo(-46, 60, -30, 50, -26, 30); g.bezierCurveTo(-48, 10, -56, -40, -40, -60); g.bezierCurveTo(-60, -70, -54, -94, -30, -88); g.bezierCurveTo(-26, -80, -18, -74, -10, -70); g.fill();
    g.restore();
    const vg = g.createRadialGradient(w / 2, h / 2, 200, w / 2, h / 2, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,20,5,.45)');
    g.fillStyle = vg; g.fillRect(0, 0, w, h);
  });

  SP.curtain = cutout(300, 760, (g, w, h) => {
    const P = g2 => { g2.beginPath(); g2.moveTo(0, 0); g2.lineTo(w, 0); g2.bezierCurveTo(w * .7, h * .25, w * .25, h * .45, w * .3, h * .6); g2.bezierCurveTo(w * .35, h * .8, w * .2, h, w * .1, h); g2.lineTo(0, h); g2.closePath(); };
    ink(g, P, '#8c2f28', 2.5);
    for (let i = 1; i < 7; i++) { g.save(); P(g); g.clip(); g.strokeStyle = 'rgba(30,10,5,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(i * 40, 0); g.bezierCurveTo(i * 30, h * .3, i * 10, h * .6, i * 14, h); g.stroke(); g.restore(); }
    hatch(g, [P, half(0, 0, w * .35, h)], 1.4, 5, .9, PAL.ink, [0, 0, w, h], .5);
    wash(g, P, w * .6, h * .1, 200, '#d8674f', .45);
    g.fillStyle = PAL.gold; g.beginPath(); g.ellipse(w * .28, h * .6, 30, 12, .3, 0, 6.28); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke();
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(w * .22 + i * 4, h * .62); g.lineTo(w * .2 + i * 4, h * .72); g.strokeStyle = PAL.ochre; g.lineWidth = 3; g.stroke(); }
  }, { ax: 0, ay: 0 });

  // --- silver fork ---
  SP.fork = cutout(660, 110, (g, w, h) => {
    const cy = h / 2;
    const handle = g2 => { g2.beginPath(); g2.moveTo(0, cy - 20); g2.bezierCurveTo(120, cy - 30, 250, cy - 12, 380, cy - 8); g2.lineTo(470, cy - 14); g2.lineTo(470, cy + 14); g2.lineTo(380, cy + 8); g2.bezierCurveTo(250, cy + 12, 120, cy + 30, 0, cy + 20); g2.closePath(); };
    ink(g, handle, '#c9ccc4', 2.2);
    hatch(g, [handle, half(0, cy + 2, w, h)], 0, 3, .8, PAL.ink, [0, 0, w, h], .55);
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, cy - 10); g.bezierCurveTo(140, cy - 18, 260, cy - 6, 370, cy - 3); g.stroke();
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(60 + i * 36, cy, 10, 6 - i, 0, 0, 6.28); g.strokeStyle = PAL.ink; g.lineWidth = 1.3; g.stroke(); }  // chased scrollwork
    for (let i = 0; i < 4; i++) {
      const y = cy - 30 + i * 20;
      const tine = g2 => { g2.beginPath(); g2.moveTo(465, cy - 14 + i * 9); g2.bezierCurveTo(520, y - 2, 560, y, 655, y - 2); g2.lineTo(655, y + 4); g2.bezierCurveTo(560, y + 8, 520, y + 6, 465, cy - 8 + i * 9); g2.closePath(); };
      ink(g, tine, '#d3d6ce', 1.6);
    }
    g.beginPath(); g.moveTo(440, cy - 30); g.bezierCurveTo(470, cy - 40, 500, cy - 36, 520, cy - 30); g.lineTo(520, cy + 34); g.bezierCurveTo(500, cy + 38, 470, cy + 38, 440, cy + 30); g.closePath();
    g.fillStyle = '#c3c6be'; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke();
    hatch(g, g2 => { g2.beginPath(); g2.rect(440, cy, 80, 40); }, .2, 3, .8, PAL.ink, [440, cy, 520, cy + 40], .5);
  }, { ax: .72, ay: .5 });

  // --- cake layers (each a separate hinged cutout) ---
  SP.layers = [];
  const spongeCols = ['#d9a44e', '#c98f3e', '#e2b35c', '#8a5a33', '#d9a44e', '#b67a3a', '#e5bb68'];
  for (let i = 0; i < 7; i++) {
    const lw = 214 + rnd(-14, 14);
    SP.layers.push(cutout(lw, 46, (g, w, h) => {
      const P = rrect(0, 0, w, h, 1.8);
      ink(g, P, spongeCols[i], 2);
      stipple(g, P, [0, 10, w, h - 8], 90, 1.4, '#5b3b1c', .55);
      g.fillStyle = i % 2 ? '#a3303a' : '#efe0c0'; roughRect(g, -1, h - 11, w + 2, 10, 1.4); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1.3; g.stroke();
      if (i % 2) for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(rnd(10, w - 10), h - 6, rnd(2, 4), 0, 6.28); g.fillStyle = '#6e1a22'; g.fill(); }   // jam seeds
      hatch(g, [P, half(w * .78, 0, w, h)], 1.1, 3.2, .9, PAL.ink, [0, 0, w, h], .5);
      wash(g, P, w * .3, h * .3, 90, '#fff2c8', .4);
    }, { ax: .5, ay: 1 }));
  }
  SP.icing = cutout(250, 66, (g, w, h) => {
    const P = g2 => {
      g2.beginPath(); g2.moveTo(4, 22); g2.bezierCurveTo(40, 6, 200, 6, w - 4, 22); g2.lineTo(w - 4, 38);
      for (let x = w - 4; x > 6; x -= 26) { const d = rnd(8, 26); g2.lineTo(x - 4, 38); g2.quadraticCurveTo(x - 9, 38 + d, x - 14, 38 + d * .6); g2.quadraticCurveTo(x - 18, 40, x - 22, 38); }
      g2.lineTo(4, 38); g2.closePath();
    };
    ink(g, P, '#f6e6e0', 2);
    wash(g, P, w * .5, 10, 120, '#e7a3a8', .5);
    for (let x = 22; x < w - 10; x += 34) { g.beginPath(); g.arc(x, 16, 9, 3.3, 6.1); g.strokeStyle = PAL.ink; g.lineWidth = 1.3; g.stroke(); g.beginPath(); g.arc(x, 16, 4, 3.3, 6.1); g.stroke(); }
    hatch(g, [P, half(w * .75, 0, w, h)], 1.2, 3, .8, PAL.ink, [0, 0, w, h], .45);
  }, { ax: .5, ay: .58 });
  SP.cherry = cutout(56, 90, (g, w, h) => {
    g.strokeStyle = '#4e5a24'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(28, 50); g.bezierCurveTo(30, 30, 40, 16, 50, 4); g.stroke();
    g.fillStyle = '#6f8a3a'; g.beginPath(); g.ellipse(42, 14, 12, 5, -.6, 0, 6.28); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.stroke();
    ink(g, circ(28, 64, 24), '#b3262c', 2.2);
    hatch(g, [circ(28, 64, 24), half(28, 50, 60, 100)], .9, 2.6, .8, PAL.ink, [0, 40, 56, 90], .55);
    g.fillStyle = 'rgba(255,240,230,.95)'; g.beginPath(); g.ellipse(19, 55, 6, 4, -.5, 0, 6.28); g.fill();
  }, { ax: .5, ay: .98 });
  SP.flag = cutout(70, 110, (g) => {
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(8, 108); g.lineTo(8, 4); g.stroke();
    ink(g, g2 => { g2.beginPath(); g2.moveTo(8, 6); g2.lineTo(66, 20); g2.lineTo(8, 36); g2.closePath(); }, PAL.prussian, 1.6);
    g.fillStyle = PAL.cream; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(20 + k * 12, 21, 3, 0, 6.28); g.fill(); }
  }, { ax: .11, ay: 1 });

  // --- the Diner's mouth: upper face (nose base, handlebar moustache, teeth) ---
  SP.mouthUp = cutout(700, 360, (g, w, h) => {
    const skin = g2 => { g2.beginPath(); g2.moveTo(60, 0); g2.lineTo(640, 0); g2.bezierCurveTo(700, 120, 690, 260, 620, 300); g2.lineTo(80, 300); g2.bezierCurveTo(10, 260, 0, 120, 60, 0); g2.closePath(); };
    ink(g, skin, PAL.flesh, 2.4);
    wash(g, skin, 120, 200, 110, '#d9776a', .5); wash(g, skin, 580, 200, 110, '#d9776a', .5);
    hatch(g, [skin, half(560, 0, 700, 360)], 1.2, 4, .9, PAL.ink, [0, 0, w, h], .45);
    hatch(g, [skin, half(0, 0, 140, 360)], -1.2, 4, .9, PAL.ink, [0, 0, w, h], .45);
    // nose base & nostrils
    ink(g, g2 => { g2.beginPath(); g2.moveTo(270, -10); g2.bezierCurveTo(250, 60, 260, 100, 300, 104); g2.bezierCurveTo(330, 120, 370, 120, 400, 104); g2.bezierCurveTo(440, 100, 450, 60, 430, -10); g2.closePath(); }, '#e9b596', 2.2);
    ink(g, ell(318, 92, 16, 9, .3), '#4a2418', 1.5); ink(g, ell(382, 92, 16, 9, -.3), '#4a2418', 1.5);
    wash(g, g2 => { g2.beginPath(); g2.rect(250, 0, 200, 120); }, 350, 60, 70, '#d45e52', .55);
    // upper teeth (one gold!)
    for (let i = 0; i < 7; i++) {
      const x = 196 + i * 44, gold = i === 5;
      ink(g, g2 => { g2.beginPath(); g2.moveTo(x, 262); g2.lineTo(x + 42, 262); g2.lineTo(x + 40, 316 - Math.abs(i - 3) * 5); g2.quadraticCurveTo(x + 21, 326 - Math.abs(i - 3) * 5, x + 2, 316 - Math.abs(i - 3) * 5); g2.closePath(); }, gold ? PAL.gold : '#f0e8cf', 1.6);
      if (gold) { g.fillStyle = '#fff6c0'; g.fillRect(x + 8, 272, 5, 24); }
    }
    // upper lip
    ink(g, g2 => { g2.beginPath(); g2.moveTo(170, 266); g2.bezierCurveTo(260, 236, 440, 236, 530, 266); g2.bezierCurveTo(440, 256, 260, 256, 170, 266); g2.closePath(); }, '#b8584b', 1.8);
    // handlebar moustache with waxed curls
    const mo = g2 => {
      g2.beginPath(); g2.moveTo(350, 130);
      g2.bezierCurveTo(420, 110, 520, 150, 600, 200); g2.bezierCurveTo(650, 230, 700, 200, 690, 160); g2.bezierCurveTo(684, 140, 660, 140, 662, 160);
      g2.bezierCurveTo(664, 176, 640, 196, 600, 222); g2.bezierCurveTo(520, 250, 420, 240, 350, 214);
      g2.bezierCurveTo(280, 240, 180, 250, 100, 222); g2.bezierCurveTo(60, 196, 36, 176, 38, 160); g2.bezierCurveTo(40, 140, 16, 140, 10, 160);
      g2.bezierCurveTo(0, 200, 50, 230, 100, 200); g2.bezierCurveTo(180, 150, 280, 110, 350, 130); g2.closePath();
    };
    ink(g, mo, '#5b3a22', 2.4);
    for (let i = 0; i < 70; i++) {
      const side = i % 2 ? 1 : -1, t0 = rnd(.05, 1), x0 = 350 + side * t0 * 230, y0 = 150 + t0 * 50 + rnd(-18, 18);
      g.save(); mo(g); g.clip(); g.strokeStyle = 'rgba(20,10,4,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + side * 20, y0 + 6, x0 + side * 40, y0 + 14); g.stroke(); g.restore();
    }
    wash(g, mo, 300, 150, 90, '#c2854e', .5);
  }, { ax: .5, ay: 0 });

  SP.faceBack = cutout(620, 420, (g, w, h) => {       // cheeks behind the hinged jaw
    const P = ell(w / 2, h / 2, w / 2 - 4, h / 2 - 4);
    ink(g, P, '#ddb08f', 2); hatch(g, P, .4, 4, .9, PAL.ink, [0, 0, w, h], .5);
    wash(g, P, 80, h / 2, 120, '#c9675a', .6);
  }, { shadow: 0 });
  SP.jaw = cutout(640, 300, (g, w, h) => {
    const skin = g2 => { g2.beginPath(); g2.moveTo(40, 20); g2.bezierCurveTo(200, 60, 440, 60, 600, 20); g2.bezierCurveTo(660, 120, 580, 270, 320, 296); g2.bezierCurveTo(60, 270, -20, 120, 40, 20); g2.closePath(); };
    ink(g, skin, PAL.flesh, 2.4);
    stipple(g, skin, [0, 80, w, h], 900, .9, '#4a3020', .45);            // five-o'clock shadow
    hatch(g, [skin, half(0, 180, w, h)], .15, 4, .9, PAL.ink, [0, 0, w, h], .5);
    ink(g, g2 => { g2.beginPath(); g2.moveTo(300, 250); g2.quadraticCurveTo(320, 270, 340, 250); }, null, 1.8);   // cleft chin
    ink(g, g2 => { g2.beginPath(); g2.moveTo(150, 34); g2.bezierCurveTo(250, 110, 390, 110, 490, 34); g2.bezierCurveTo(390, 70, 250, 70, 150, 34); g2.closePath(); }, '#b8584b', 1.8);
    for (let i = 0; i < 6; i++) {
      const x = 196 + i * 42;
      ink(g, g2 => { g2.beginPath(); g2.moveTo(x, 52 + Math.abs(i - 2.5) * 5); g2.lineTo(x + 40, 52 + Math.abs(i - 2.5) * 5); g2.lineTo(x + 38, 8 + Math.abs(i - 2.5) * 6); g2.quadraticCurveTo(x + 20, 0 + Math.abs(i - 2.5) * 6, x + 2, 8 + Math.abs(i - 2.5) * 6); g2.closePath(); }, '#ece2c4', 1.5);
    }
  }, { ax: .93, ay: .05 });

  SP.throat = paintCanvas(620, 440, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.beginPath(); g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, 6.283); g.save(); g.clip();
    const gr = g.createRadialGradient(w / 2, h * .48, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, '#0b0302'); gr.addColorStop(.35, '#2a0908'); gr.addColorStop(.8, '#6b1e1a'); gr.addColorStop(1, '#8f3129');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b54d4a'; g.beginPath(); g.ellipse(w / 2, h * .95, w * .36, h * .25, 0, 0, 6.28); g.fill();   // tongue
    g.strokeStyle = 'rgba(40,10,5,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, h * .75); g.lineTo(w / 2, h); g.stroke();
    g.fillStyle = '#9c3a36'; g.beginPath(); g.moveTo(w / 2 - 22, 0); g.quadraticCurveTo(w / 2 - 16, h * .2, w / 2, h * .26); g.quadraticCurveTo(w / 2 + 16, h * .2, w / 2 + 22, 0); g.fill();  // uvula
    g.restore();
  }, .5);
  // (paintCanvas multiplied the whole rect; re-mask to the ellipse)
  { const g = SP.throat.getContext('2d'); g.globalCompositeOperation = 'destination-in'; g.beginPath(); g.ellipse(310, 220, 310, 220, 0, 0, 6.283); g.fill(); }
}

function buildPipe() {
  seed(21);
  SP.rings = [];
  const tints = ['#d39486', '#c77b6f', '#dfa594', '#b86a5d'];
  for (let v = 0; v < 4; v++) {
    SP.rings.push(cutout(900, 900, (g, w, h) => {
      const cx = w / 2, cy = h / 2, R0 = 446, R1 = 318 + v * 8;
      const P = g2 => { g2.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.283, r = R0 * (1 + rnd(-.012, .012)); i ? g2.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g2.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        for (let i = 40; i >= 0; i--) { const a = i / 40 * 6.283, r = R1 * (1 + rnd(-.02, .02)); g2.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g2.closePath(); };
      ink(g, P, tints[v], 3);
      for (let i = 0; i < 36; i++) {                                // muscular folds as radial engraving
        const a = i / 36 * 6.283 + rnd(-.04, .04);
        g.save(); P(g); g.clip(); g.strokeStyle = 'rgba(50,15,10,.55)'; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * R1, cy + Math.sin(a) * R1); g.quadraticCurveTo(cx + Math.cos(a + .06) * (R1 + 60), cy + Math.sin(a + .06) * (R1 + 60), cx + Math.cos(a) * R0, cy + Math.sin(a) * R0); g.stroke(); g.restore();
      }
      hatch(g, [P, half(0, cy + 60, w, h)], .3, 5, 1, PAL.ink, [0, 0, w, h], .45);
      g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R1 + 26, 0, 6.283); g.stroke();
      if (v % 2 === 0) { const pts = []; for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283; pts.push([cx + Math.cos(a) * (R1 + 13), cy + Math.sin(a) * (R1 + 13)]); } rivets(g, pts, 5); }
      wash(g, P, cx - 200, cy - 250, 260, '#ffe2cf', .45);
    }, { margin: 3, shadow: 0 }));
  }
  SP.valve = cutout(150, 150, (g, w, h) => {
    ink(g, circ(75, 75, 70), null, 7, '#7a2a20'); g.strokeStyle = PAL.madder; g.lineWidth = 9; g.beginPath(); g.arc(75, 75, 64, 0, 6.28); g.stroke();
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.strokeStyle = PAL.ink; g.lineWidth = 8; g.beginPath(); g.moveTo(75, 75); g.lineTo(75 + Math.cos(a) * 64, 75 + Math.sin(a) * 64); g.stroke(); g.strokeStyle = PAL.madder; g.lineWidth = 5; g.stroke(); }
    ink(g, circ(75, 75, 14), PAL.brass, 2);
  });
}
