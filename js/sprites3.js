// sprites3.js — furnace fire, the ketone steam engine, sky, balloon and the startled gentleman.
'use strict';

function flame(w, h, cols, s) {
  seed(s);
  return cutout(w, h, (g) => {
    const P = (k) => g2 => {
      const cx = w / 2, bw = w * .45 * k, top = h * (1 - k) * .9 + 4;
      g2.beginPath(); g2.moveTo(cx - bw, h - 6);
      g2.bezierCurveTo(cx - bw * 1.2, h * .6, cx - bw * .2 + rnd(-8, 8), h * .45, cx + rnd(-10, 10), top);
      g2.bezierCurveTo(cx + bw * .5 + rnd(-8, 8), h * .4, cx + bw * 1.2, h * .6, cx + bw, h - 6); g2.closePath();
    };
    ink(g, P(1), cols[0], 2); ink(g, P(.7), cols[1], 1.4); ink(g, P(.4), cols[2], 1);
    hatch(g, [P(1), half(w / 2, 0, w, h)], 1.3, 3.2, .8, PAL.ink, [0, 0, w, h], .4);
  }, { ax: .5, ay: 1, margin: 2.5, shadow: 0 });
}

function buildEngine() {
  SP.fire = [0, 1, 2].map(i => flame(130, 220, ['#c8452a', '#e98a2c', '#f6d25a'], 200 + i));
  SP.blue = [0, 1, 2].map(i => flame(80, 130, ['#3d6d9a', '#8fc0d8', '#eef6f0'], 210 + i));
  SP.glow = (() => { const c = mk(512, 512), g = c.getContext('2d'); const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    gr.addColorStop(0, 'rgba(255,248,215,1)'); gr.addColorStop(.35, 'rgba(255,205,110,.95)'); gr.addColorStop(.7, 'rgba(220,100,40,.6)'); gr.addColorStop(1, 'rgba(160,40,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); return c; })();

  seed(215);
  SP.intake = cutout(620, 620, (g, w, h) => {      // the shiny fat-burning furnace mouth
    const c = w / 2, P = g2 => { g2.beginPath(); g2.arc(c, c, 300, 0, 6.283); g2.arc(c, c, 222, 6.283, 0, true); };
    ink(g, P, '#d6a846', 3);
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; g.save(); P(g); g.clip(); g.strokeStyle = 'rgba(60,35,10,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(c + Math.cos(a) * 222, c + Math.sin(a) * 222); g.lineTo(c + Math.cos(a + .12) * 300, c + Math.sin(a + .12) * 300); g.stroke(); g.restore(); }
    hatch(g, [P, half(c, c - 40, w, h)], .8, 3, .8, PAL.ink, [0, 0, w, h], .5);
    wash(g, P, c - 140, c - 180, 200, '#fff6c8', .9);
    g.strokeStyle = PAL.ink; g.lineWidth = 2.5; g.beginPath(); g.arc(c, c, 262, 0, 6.283); g.stroke();
    const p = []; for (let i = 0; i < 32; i++) { const a = i / 32 * 6.283; p.push([c + Math.cos(a) * 281, c + Math.sin(a) * 281]); } rivets(g, p, 4.5);
  }, { shadow: 8 });
  seed(220);
  // engine: base frame, horizontal boiler, round firebox door at (FB.x,FB.y) punched through
  SP.engine = cutout(900, 430, (g, w, h) => {
    ink(g, rrect(20, 360, 860, 60, 1.5), '#5a3a26', 2.4); hatch(g, rrect(20, 360, 860, 60), .1, 4, .9, PAL.ink, [0, 350, w, h], .55);
    for (let x = 60; x < 880; x += 140) ink(g, rrect(x, 330, 40, 40, 1), '#4a4c48', 1.8);
    const boiler = g2 => { g2.beginPath(); g2.moveTo(170, 120); g2.lineTo(760, 120); g2.bezierCurveTo(820, 120, 840, 330, 760, 340); g2.lineTo(170, 340); g2.closePath(); };
    ink(g, boiler, '#2f5a4e', 3);
    hatch(g, [boiler, half(0, 260, w, h)], 0, 3.5, .9, PAL.ink, [0, 0, w, h], .55);
    wash(g, boiler, 460, 150, 260, '#9ad0b4', .55);
    for (const x of [260, 380, 500, 620, 740]) { g.fillStyle = PAL.brass; g.fillRect(x, 120, 14, 220); g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.strokeRect(x, 120, 14, 220); const p = []; for (let y = 134; y < 340; y += 22) p.push([x + 7, y]); rivets(g, p, 2.6); }
    // firebox (tall front box, left) with round door hole
    const fbox = rrect(20, 90, 170, 272, 1.5);
    ink(g, fbox, '#1f2a2a', 3); hatch(g, fbox, 1.3, 3, .8, '#000', [20, 90, 190, 362], .5);
    ink(g, circ(105, 235, 62), '#b8893a', 3);
    const p = []; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; p.push([105 + Math.cos(a) * 55, 235 + Math.sin(a) * 55]); } rivets(g, p, 3);
    g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(105, 235, 46, 0, 6.283); g.fill(); g.restore();
    g.strokeStyle = PAL.ink; g.lineWidth = 2.4; g.beginPath(); g.arc(105, 235, 46, 0, 6.283); g.stroke();
    // steam dome, whistle, the stack collar
    ink(g, g2 => { g2.beginPath(); g2.moveTo(430, 122); g2.bezierCurveTo(430, 60, 520, 60, 520, 122); g2.closePath(); }, PAL.brass, 2.4);
    wash(g, g2 => { g2.beginPath(); g2.rect(430, 60, 90, 62); }, 455, 85, 40, '#fff3c0', .8);
    ink(g, rrect(560, 70, 14, 52, .5), PAL.brass, 1.6); ink(g, rrect(552, 58, 30, 16, .5), '#d9ae52', 1.6);
    // brass maker's plate — the discreet branding
    ink(g, rrect(270, 206, 330, 72, 1), '#d8b060', 2.6);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.strokeRect(280, 214, 310, 56);
    rivets(g, [[288, 222], [582, 222], [288, 262], [582, 262]], 3.2);
    g.font = 'italic bold 38px Georgia, "Times New Roman", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,245,210,.8)'; g.fillText('mitarev.com', 436, 244);
    g.fillStyle = '#3a2410'; g.fillText('mitarev.com', 435, 242);
    // pressure gauge
    ink(g, circ(690, 180, 34), '#f1e6c8', 2.4); g.strokeStyle = PAL.ink; g.lineWidth = 1;
    for (let i = 0; i <= 10; i++) { const a = 2.4 + i / 10 * 4.6; g.beginPath(); g.moveTo(690 + Math.cos(a) * 26, 180 + Math.sin(a) * 26); g.lineTo(690 + Math.cos(a) * 31, 180 + Math.sin(a) * 31); g.stroke(); }
    g.strokeStyle = '#4f8a4a'; g.lineWidth = 4; g.beginPath(); g.arc(690, 180, 22, 5.0, 6.6); g.stroke();
  }, { ax: 0, ay: 0, shadow: 9 });
  SP.FB = { x: 105, y: 235, r: 46 };   // firebox hole within engine art

  SP.flywheel = cutout(300, 300, (g) => {
    const c = 150;
    ink(g, g2 => { g2.beginPath(); g2.arc(c, c, 146, 0, 6.283); g2.moveTo(c + 124, c); g2.arc(c, c, 124, 6.283, 0, true); }, '#3c3f3c', 2.4);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ink(g, g2 => { g2.beginPath(); g2.moveTo(c + Math.cos(a - .06) * 20, c + Math.sin(a - .06) * 20); g2.lineTo(c + Math.cos(a - .025) * 126, c + Math.sin(a - .025) * 126); g2.lineTo(c + Math.cos(a + .025) * 126, c + Math.sin(a + .025) * 126); g2.lineTo(c + Math.cos(a + .06) * 20, c + Math.sin(a + .06) * 20); g2.closePath(); }, '#55594f', 1.4); }
    ink(g, circ(c, c, 26), PAL.brass, 2); ink(g, circ(c + 100, c, 10), '#d9ae52', 1.5);
    hatch(g, [g2 => { g2.beginPath(); g2.arc(c, c, 146, 0, 6.283); g2.arc(c, c, 124, 6.283, 0, true); }, half(c, 0, 300, 300)], .5, 3, .8, PAL.ink, [0, 0, 300, 300], .6);
  }, { shadow: 6 });
  SP.rod = cutout(260, 24, (g, w) => { ink(g, rrect(0, 6, w, 12, .6), '#b9bcb4', 1.8); rivets(g, [[8, 12], [w - 8, 12]], 6); }, { ax: .03, ay: .5 });
  SP.stack = cutout(130, 1200, (g, w, h) => {
    const P = g2 => { g2.beginPath(); g2.moveTo(18, 0); g2.lineTo(w - 18, 0); g2.lineTo(w - 10, h); g2.lineTo(10, h); g2.closePath(); };
    ink(g, P, '#2c2f2d', 2.6);
    hatch(g, [P, half(w * .6, 0, w, h)], 1.5, 3, .9, '#000', [0, 0, w, h], .6);
    g.fillStyle = 'rgba(200,210,200,.35)'; g.fillRect(34, 0, 8, h);
    for (let y = 60; y < h; y += 150) { ink(g, rrect(12, y, w - 24, 18, .8), PAL.brass, 1.8); }
  }, { ax: .5, ay: 1, shadow: 6 });
  SP.stackTop = cutout(210, 90, (g, w, h) => {
    const P = g2 => { g2.beginPath(); g2.moveTo(0, 0); g2.lineTo(w, 0); g2.lineTo(w - 20, 30); g2.lineTo(w - 58, 90); g2.lineTo(58, 90); g2.lineTo(20, 30); g2.closePath(); };
    ink(g, P, '#2c2f2d', 2.6); ink(g, rrect(-4, 0, w + 8, 16, .8), PAL.brass, 2);
    hatch(g, [P, half(w * .6, 0, w, h)], 1.2, 3, .9, '#000', [0, 0, w, h], .6);
    for (let x = 12; x < w; x += 22) { g.fillStyle = PAL.brass; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8, -12); g.lineTo(x + 16, 0); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.stroke(); }   // crown
  }, { ax: .5, ay: 0, shadow: 5 });
  SP.hills = cutout(1500, 260, (g, w, h) => {
    const P = g2 => { g2.beginPath(); g2.moveTo(0, h); for (let x = 0; x <= w; x += 50) g2.lineTo(x, 110 - Math.sin(x * .004) * 60 - Math.sin(x * .013) * 20 + rnd(-4, 4)); g2.lineTo(w, h); g2.closePath(); };
    ink(g, P, '#7f9a62', 2.4); hatch(g, P, .2, 5, .9, PAL.ink, [0, 0, w, h], .45, 1.5);
    for (let i = 0; i < 9; i++) { const x = rnd(40, w - 40), y = 120 + rnd(0, 60); ink(g, circ(x, y - 16, 16), '#4f6a3a', 1.4); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 12); g.stroke(); }
  }, { ax: 0, ay: 1, shadow: 0 });
  SP.clouds = [0, 1, 2].map(v => { seed(240 + v); return cutout(380, 170, (g, w, h) => {
    const bumps = []; for (let i = 0; i < 7; i++) bumps.push([50 + i * 46 + rnd(-8, 8), 100 - Math.sin(i / 6 * 3.14) * 40 + rnd(-8, 8), rnd(38, 56)]);
    const P = g2 => { g2.beginPath(); for (const [x, y, r] of bumps) { g2.moveTo(x + r, y); g2.arc(x, y, r, 0, 6.283); } g2.rect(30, 100, w - 60, 50); };
    g.fillStyle = '#f7f1e2'; P(g); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 2; for (const [x, y, r] of bumps) { g.beginPath(); g.arc(x, y, r, 3.3, 6.1); g.stroke(); }
    g.beginPath(); g.moveTo(20, 150); g.lineTo(w - 20, 150); g.stroke();
    hatch(g, [P, half(0, 115, w, h)], 0, 3, .8, PAL.ink, [0, 0, w, h], .45);
    wash(g, P, w * .4, 60, 160, '#fff', .6);
  }, { ay: .88, shadow: 4 }); });
}

function buildGent() {
  seed(300);
  SP.balloon = cutout(420, 470, (g, w, h) => {
    const cx = w / 2, P = g2 => { g2.beginPath(); g2.moveTo(cx - 70, h - 10); g2.bezierCurveTo(cx - 230, h * .55, cx - 230, 0, cx, 4); g2.bezierCurveTo(cx + 230, 0, cx + 230, h * .55, cx + 70, h - 10); g2.closePath(); };
    ink(g, P, '#d9ad52', 2.6);
    for (let i = -3; i <= 3; i += 2) { g.save(); P(g); g.clip(); g.fillStyle = '#a8473a'; g.beginPath(); g.moveTo(cx + i * 12, h); g.bezierCurveTo(cx + i * 70, h * .5, cx + i * 58, 20, cx + i * 8, 0); g.lineTo(cx + (i + 1) * 8, 0); g.bezierCurveTo(cx + (i + 1) * 58, 20, cx + (i + 1) * 70, h * .5, cx + (i + 1) * 12, h); g.fill(); g.restore(); }
    for (let i = -4; i <= 4; i++) { g.save(); P(g); g.clip(); g.strokeStyle = PAL.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx + i * 10, h); g.bezierCurveTo(cx + i * 62, h * .5, cx + i * 52, 20, cx, 0); g.stroke(); g.restore(); }
    hatch(g, [P, half(cx + 60, 0, w, h)], 1.1, 3.5, .9, PAL.ink, [0, 0, w, h], .5);
    wash(g, P, cx - 70, 110, 140, '#fff2c8', .55);
    ink(g, g2 => { g2.beginPath(); g2.rect(cx - 150, h * .52, 300, 26); }, '#2f5a4e', 1.8);
    for (let x = cx - 140; x < cx + 150; x += 24) { g.fillStyle = PAL.gold; g.beginPath(); g.moveTo(x, h * .52 + 26); g.lineTo(x + 12, h * .52 + 40); g.lineTo(x + 24, h * .52 + 26); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1; g.stroke(); }
  }, { ay: 1 });
  SP.basket = cutout(250, 120, (g, w, h) => {
    const P = g2 => { g2.beginPath(); g2.moveTo(0, 8); g2.lineTo(w, 8); g2.lineTo(w - 16, h); g2.lineTo(16, h); g2.closePath(); };
    ink(g, P, '#a07a44', 2.4);
    g.save(); P(g); g.clip(); g.strokeStyle = 'rgba(50,30,15,.8)'; g.lineWidth = 1.3;
    for (let y = 16; y < h; y += 12) for (let x = (y / 12 % 2) * 12; x < w; x += 24) { g.beginPath(); g.ellipse(x, y, 11, 5, 0, 0, 6.28); g.stroke(); } g.restore();
    ink(g, rrect(-4, 0, w + 8, 16, 1), '#7a5530', 2);
  }, { ay: 0 });
  // gentleman: torso (in the basket), head normal/startled, arm, bowler, avocado
  SP.torso = cutout(230, 170, (g, w, h) => {
    const P = g2 => { g2.beginPath(); g2.moveTo(10, h); g2.bezierCurveTo(10, 60, 50, 40, 115, 36); g2.bezierCurveTo(180, 40, 220, 60, 220, h); g2.closePath(); };
    ink(g, P, '#2d2a33', 2.4); hatch(g, P, .9, 3.4, .9, '#000', [0, 0, w, h], .55);
    ink(g, g2 => { g2.beginPath(); g2.moveTo(90, 38); g2.lineTo(115, 110); g2.lineTo(140, 38); g2.closePath(); }, '#f3ecda', 1.6);
    ink(g, g2 => { g2.beginPath(); g2.moveTo(100, 44); g2.lineTo(115, 60); g2.lineTo(130, 44); g2.lineTo(126, 70); g2.lineTo(115, 62); g2.lineTo(104, 70); g2.closePath(); }, '#8c2f28', 1.4);  // cravat
    g.strokeStyle = PAL.gold; g.lineWidth = 2; g.beginPath(); g.moveTo(70, 120); g.quadraticCurveTo(100, 140, 130, 118); g.stroke();   // watch chain
  }, { ay: 1 });
  const head = (startled) => { seed(310); return cutout(190, 210, (g, w, h) => {
    const cx = 95, face = ell(cx, 110, 72, 88);
    ink(g, face, '#ecc3a0', 2.4); wash(g, face, cx - 40, 130, 40, '#e07a6a', .6); wash(g, face, cx + 40, 130, 40, '#e07a6a', .6);
    hatch(g, [face, half(cx + 30, 0, w, h)], 1.2, 3.5, .8, PAL.ink, [0, 0, w, h], .45);
    for (const s of [-1, 1]) ink(g, g2 => { g2.beginPath(); g2.moveTo(cx + s * 70, 70); g2.bezierCurveTo(cx + s * 86, 120, cx + s * 80, 170, cx + s * 40, 178); g2.bezierCurveTo(cx + s * 50, 150, cx + s * 58, 120, cx + s * 56, 80); g2.closePath(); }, '#8e6a44', 1.6);   // mutton chops
    ink(g, g2 => { g2.beginPath(); g2.moveTo(cx, 96); g2.bezierCurveTo(cx - 6, 118, cx - 14, 128, cx - 2, 132); g2.lineTo(cx + 10, 130); }, null, 1.8);
    if (!startled) {
      for (const s of [-1, 1]) { g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(cx + s * 28, 92, 4, 5, 0, 0, 6.28); g.fill(); g.lineWidth = 3; g.strokeStyle = '#6b4a2a'; g.beginPath(); g.moveTo(cx + s * 16, 76); g.lineTo(cx + s * 42, 78); g.stroke(); }
      ink(g, g2 => { g2.beginPath(); g2.moveTo(cx - 14, 160); g2.quadraticCurveTo(cx, 164, cx + 14, 160); }, null, 2);
    } else {
      for (const s of [-1, 1]) { ink(g, circ(cx + s * 28, 92, 15), '#fbf7ea', 2); g.fillStyle = PAL.ink; g.beginPath(); g.arc(cx + s * 28 + s * -2, 93, 5, 0, 6.28); g.fill(); g.lineWidth = 3.4; g.strokeStyle = '#6b4a2a'; g.beginPath(); g.moveTo(cx + s * 14, 66); g.quadraticCurveTo(cx + s * 28, 56, cx + s * 44, 64); g.stroke(); }
      ink(g, ell(cx, 164, 11, 15), '#4a1a14', 2);
    }
    const mo = g2 => { g2.beginPath(); g2.moveTo(cx, 136); g2.bezierCurveTo(cx + 30, 128, cx + 58, 140, cx + 70, 128); g2.bezierCurveTo(cx + 66, 150, cx + 40, 156, cx, 146); g2.bezierCurveTo(cx - 40, 156, cx - 66, 150, cx - 70, 128); g2.bezierCurveTo(cx - 58, 140, cx - 30, 128, cx, 136); g2.closePath(); };
    ink(g, mo, '#7a5634', 1.8); hatch(g, mo, 1.3, 2.4, .6, PAL.ink, [0, 120, w, 160], .6);
  }, { ay: .2 }); };
  SP.headN = head(false); SP.headS = head(true);
  SP.monocle = cutout(46, 46, (g) => { g.strokeStyle = PAL.gold; g.lineWidth = 4; g.beginPath(); g.arc(23, 23, 18, 0, 6.28); g.stroke(); g.fillStyle = 'rgba(220,240,240,.35)'; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1; g.stroke(); }, { margin: 1.5, shadow: 2 });
  SP.upperArm = cutout(40, 110, (g, w, h) => { ink(g, rrect(4, 0, 32, 110, 1.4), '#2d2a33', 2); hatch(g, rrect(4, 0, 32, 110), .9, 3, .8, '#000', [0, 0, w, h], .5); }, { ax: .5, ay: .08 });
  SP.forearm = cutout(44, 130, (g, w, h) => {
    ink(g, rrect(6, 0, 32, 88, 1.4), '#2d2a33', 2); ink(g, rrect(4, 84, 36, 12, 1), '#f3ecda', 1.4);
    ink(g, g2 => { g2.beginPath(); g2.ellipse(22, 110, 16, 20, 0, 0, 6.28); }, '#f2efe6', 1.8);   // white glove
    for (let i = 0; i < 3; i++) { g.strokeStyle = PAL.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(14 + i * 7, 98); g.lineTo(14 + i * 7, 118); g.stroke(); }
  }, { ax: .5, ay: .06 });
  SP.bowler = cutout(170, 96, (g, w, h) => {
    const dome = g2 => { g2.beginPath(); g2.moveTo(34, 76); g2.bezierCurveTo(30, 0, 140, 0, 136, 76); g2.closePath(); };
    ink(g, dome, '#26221f', 2.4); hatch(g, [dome, half(90, 0, w, h)], 1, 2.6, .8, '#000', [0, 0, w, h], .6);
    g.fillStyle = 'rgba(210,210,200,.5)'; g.beginPath(); g.ellipse(64, 30, 10, 18, -.4, 0, 6.28); g.fill();
    ink(g, rrect(34, 58, 102, 12, .6), '#4a3d34', 1.4);
    ink(g, g2 => { g2.beginPath(); g2.moveTo(2, 78); g2.quadraticCurveTo(85, 64, 168, 78); g2.quadraticCurveTo(170, 92, 150, 90); g2.quadraticCurveTo(85, 80, 20, 90); g2.quadraticCurveTo(0, 92, 2, 78); g2.closePath(); }, '#26221f', 2);
  }, { ax: .5, ay: .8 });
  const avo = (wink) => { seed(330); return cutout(110, 140, (g, w, h) => {
    const skin = g2 => { g2.beginPath(); g2.moveTo(55, 4); g2.bezierCurveTo(80, 4, 84, 40, 96, 70); g2.bezierCurveTo(112, 110, 90, 138, 55, 138); g2.bezierCurveTo(20, 138, -2, 110, 14, 70); g2.bezierCurveTo(26, 40, 30, 4, 55, 4); g2.closePath(); };
    ink(g, skin, '#4f6e2a', 2.4); stipple(g, skin, [0, 0, w, h], 200, 1.1, '#26361a', .6);
    hatch(g, [skin, half(70, 0, w, h)], 1.1, 3, .8, PAL.ink, [0, 0, w, h], .5); wash(g, skin, 38, 40, 40, '#b6cf6a', .6);
    wash(g, skin, 26, 96, 16, '#ef8d7a', .9); wash(g, skin, 84, 96, 16, '#ef8d7a', .9);
    if (wink) { g.strokeStyle = PAL.ink; g.lineWidth = 3.4; g.beginPath(); g.moveTo(26, 74); g.quadraticCurveTo(36, 82, 46, 74); g.stroke(); g.beginPath(); g.moveTo(26, 72); g.lineTo(22, 66); g.moveTo(46, 72); g.lineTo(50, 66); g.stroke(); }
    else { ink(g, circ(36, 72, 10), '#fbf7ea', 2); g.fillStyle = PAL.ink; g.beginPath(); g.arc(38, 73, 4.5, 0, 6.28); g.fill(); }
    ink(g, circ(74, 72, 10), '#fbf7ea', 2); g.fillStyle = PAL.ink; g.beginPath(); g.arc(72, 73, 4.5, 0, 6.28); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(70, 70, 1.6, 0, 6.28); if (!wink) g.arc(36, 70, 1.6, 0, 6.28); g.fill();
    ink(g, g2 => { g2.beginPath(); g2.moveTo(36, 96); g2.quadraticCurveTo(55, 124, 76, 96); g2.quadraticCurveTo(55, 108, 36, 96); g2.closePath(); }, '#7a2a24', 2);
    g.strokeStyle = '#3a2a14'; g.lineWidth = 3; g.beginPath(); g.moveTo(55, 6); g.quadraticCurveTo(58, -4, 66, -8); g.stroke();
  }, { ay: 1 }); };
  SP.avoFace = avo(false); SP.avoWink = avo(true);
  SP.spring = cutout(40, 110, (g) => { g.strokeStyle = '#8f928c'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 44; i++) { const y = 108 - i * 2.4, x = 20 + Math.sin(i * .8) * 14; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.strokeStyle = PAL.ink; g.lineWidth = 1; g.stroke(); }, { ay: 1, margin: 1.5, shadow: 2 });
}
