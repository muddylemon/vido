// leaf2.js — II: Of the Restrainer. The katechon braces against the torrent of the future while the
// people sleep under PEACE AND SAFETY; at 36 s a jet escapes over the rule and runs down the margin.
'use strict';
const L2_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.L2_SPEC),
  overflow: t => t > 36
};

// a claw wave (Hokusai/Dürer): crest curling leftward, foam spirals, hatched belly. Pivot bottom-left.
function l2_wave(w, h, s) {
  seed(s);
  return cutout(w, h, (g, W2, H2) => {
    const body = g2 => {
      g2.beginPath(); g2.moveTo(W2, H2); g2.lineTo(W2, H2 * .32);
      g2.quadraticCurveTo(W2 * .72, H2 * .02, W2 * .38, 0);
      g2.quadraticCurveTo(W2 * .06, 0, 0, H2 * .22);
      g2.quadraticCurveTo(W2 * .14, H2 * .2, W2 * .24, H2 * .34);
      g2.quadraticCurveTo(W2 * .1, H2 * .5, 0, H2 * .62);
      g2.lineTo(0, H2); g2.closePath();
    };
    ink(g, body, PAL.vellum, 2.2);
    hatch(g, body, .35, 5, .8, PAL.ink, [0, 0, W2, H2], .42, 3);
    hatch(g, [body, half(0, H2 * .6, W2, H2)], .2, 3.2, .7, PAL.ink, [0, 0, W2, H2], .5, 2);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.3;
    for (let i = 0; i < 5; i++) {                                   // foam spirals along the curl
      const cx = W2 * (.05 + i * .07), cy = H2 * (.2 + i * .05), r = 3 + i * 1.2;
      g.beginPath(); for (let a = 0; a < 10; a += .3) { const rr = r * a / 10; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.stroke();
    }
    for (let i = 0; i < 4; i++) { const x = W2 * (.1 + i * .08), y = H2 * (.27 + i * .03); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 9, y + 8, x - 4, y + 17); g.stroke(); }  // claw fingers
  }, { ax: 0, ay: 1 });
}

function buildLeaf2() {
  seed(22); const L = SP.l2 = {};
  // --- the Restrainer, in pieces ---
  L.body = cutout(200, 400, (g, w, h) => {                       // robe + braced legs, pivot feet
    const hem = h * .76;
    const legL = g2 => { g2.beginPath(); g2.moveTo(w * .22, hem - 10); g2.lineTo(w * .44, hem - 10); g2.lineTo(w * .26, h - 8); g2.lineTo(w * .02, h - 8); g2.closePath(); };
    const legR = g2 => { g2.beginPath(); g2.moveTo(w * .56, hem - 10); g2.lineTo(w * .78, hem - 10); g2.lineTo(w * .98, h - 8); g2.lineTo(w * .74, h - 8); g2.closePath(); };
    for (const lg of [legL, legR]) { ink(g, lg, PAL.vellum, 2.2); hatch(g, lg, 1.2, 4.5, .8, PAL.ink, [0, 0, w, h], .4); }
    for (const [x0, x1] of [[0, w * .3], [w * .7, w]]) { const bt = g2 => { g2.beginPath(); g2.ellipse((x0 + x1) / 2, h - 6, (x1 - x0) / 2, 6, 0, 0, 6.283); }; ink(g, bt, PAL.ink2, 1.6); }
    const robe = g2 => { g2.beginPath(); g2.moveTo(w * .3, 0); g2.lineTo(w * .7, 0); g2.quadraticCurveTo(w * .84, 30, w * .8, 110); g2.lineTo(w * .9, hem); g2.lineTo(w * .1, hem); g2.lineTo(w * .2, 110); g2.quadraticCurveTo(w * .16, 30, w * .3, 0); g2.closePath(); };
    ink(g, robe, PAL.vellum, 2.4);
    hatch(g, [robe, half(0, 0, w * .3, h)], 1.3, 5, .9, PAL.ink, [0, 0, w, h], .55);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.3;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(w * .3 + i * 14, 60); g.quadraticCurveTo(w * .28 + i * 15, hem * .6, w * .22 + i * 16, hem - 2); g.stroke(); }
    g.lineWidth = 3; g.beginPath(); g.moveTo(w * .2, h * .3); g.quadraticCurveTo(w / 2, h * .33, w * .8, h * .3); g.stroke();     // belt
    g.lineWidth = 2; g.beginPath(); g.moveTo(w * .32, 0); g.quadraticCurveTo(w / 2, 24, w * .68, 0); g.stroke();              // collar
  }, { ax: .5, ay: 1 });
  L.head = cutout(96, 112, (g, w, h) => {                        // masked head, pivot neck
    const face = g2 => { g2.beginPath(); g2.ellipse(w / 2, h * .52, 34, 42, 0, 0, 6.283); };
    ink(g, face, PAL.vellum, 2.4);
    hatch(g, [face, half(0, 0, w * .35, h)], 1.2, 4, .8, PAL.ink, [0, 0, w, h], .45);
    const hair = g2 => { g2.beginPath(); g2.moveTo(w * .16, h * .4); g2.quadraticCurveTo(w * .1, 2, w * .5, 2); g2.quadraticCurveTo(w * .9, 2, w * .84, h * .4); g2.quadraticCurveTo(w * .7, h * .22, w * .5, h * .24); g2.quadraticCurveTo(w * .3, h * .22, w * .16, h * .4); g2.closePath(); };
    ink(g, hair, PAL.vellum, 2); hatch(g, hair, 1.5, 2.6, .9, PAL.ink, [0, 0, w, h], .8);
    g.strokeStyle = PAL.ink; g.lineWidth = 2.6; g.beginPath(); g.moveTo(w * .28, h * .4); g.lineTo(w * .44, h * .45); g.moveTo(w * .72, h * .4); g.lineTo(w * .56, h * .45); g.stroke();   // stern brows
    eye(g, w * .37, h * .5, 7, [.6, 0]); eye(g, w * .63, h * .5, 7, [.6, 0]);
    const mask = g2 => { g2.beginPath(); g2.moveTo(w * .2, h * .58); g2.lineTo(w * .8, h * .58); g2.quadraticCurveTo(w * .82, h * .8, w * .5, h * .9); g2.quadraticCurveTo(w * .18, h * .8, w * .2, h * .58); g2.closePath(); };
    ink(g, mask, PAL.vellum, 2); g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(w * .22, h * .58 + i * 8); g.quadraticCurveTo(w / 2, h * .6 + i * 8, w * .78, h * .58 + i * 8); g.stroke(); }   // pleats
    g.lineWidth = 1.4; g.beginPath(); g.moveTo(w * .2, h * .6); g.lineTo(w * .08, h * .52); g.moveTo(w * .2, h * .7); g.lineTo(w * .08, h * .66); g.moveTo(w * .8, h * .6); g.lineTo(w * .92, h * .52); g.moveTo(w * .8, h * .7); g.lineTo(w * .92, h * .66); g.stroke();   // ties
    for (const s of [-1, 1]) { const er = g2 => { g2.beginPath(); g2.ellipse(w / 2 + s * 36, h * .56, 6, 10, 0, 0, 6.283); }; ink(g, er, PAL.vellum, 1.6); }
  }, { ax: .5, ay: 1 });
  L.armR = cutout(50, 170, (g, w, h) => {                        // the arm that holds the torrent: open palm, pivot shoulder
    const sl = g2 => { g2.beginPath(); g2.moveTo(8, 0); g2.lineTo(w - 8, 0); g2.quadraticCurveTo(w + 2, h * .5, w - 6, h * .72); g2.lineTo(6, h * .72); g2.quadraticCurveTo(-2, h * .5, 8, 0); g2.closePath(); };
    ink(g, sl, PAL.vellum, 2.2); hatch(g, [sl, half(0, 0, w * .4, h)], 1.3, 4.5, .9, PAL.ink, [0, 0, w, h], .5);
    const palm = g2 => { g2.beginPath(); g2.ellipse(w / 2, h * .82, 14, 13, 0, 0, 6.283); }; ink(g, palm, PAL.vellum, 1.8);
    for (let i = 0; i < 5; i++) {
      const a = -.7 + i * .35, fx = w / 2 + Math.sin(a) * 12, fy = h * .82 + Math.cos(a) * 12;
      const fg = g2 => { g2.beginPath(); g2.moveTo(fx - 3, fy); g2.lineTo(fx + Math.sin(a) * 22 - 3, fy + Math.cos(a) * 22); g2.lineTo(fx + Math.sin(a) * 22 + 3, fy + Math.cos(a) * 22); g2.lineTo(fx + 3, fy); g2.closePath(); };
      ink(g, fg, PAL.vellum, 1.4);
    }
  }, { ax: .5, ay: .04 });
  L.armL = cutout(130, 150, (g, w, h) => {                       // bent arm holding the clipboard to the chest, pivot shoulder
    const up = g2 => { g2.beginPath(); g2.moveTo(10, 0); g2.lineTo(50, 0); g2.lineTo(54, 70); g2.lineTo(14, 74); g2.closePath(); };
    ink(g, up, PAL.vellum, 2.2); hatch(g, [up, half(0, 0, 30, h)], 1.3, 4.5, .9, PAL.ink, [0, 0, w, h], .5);
    const fore = g2 => { g2.beginPath(); g2.moveTo(14, 62); g2.lineTo(54, 58); g2.lineTo(110, 70); g2.lineTo(108, 96); g2.lineTo(20, 94); g2.closePath(); };
    ink(g, fore, PAL.vellum, 2.2); hatch(g, [fore, half(0, 80, w, h)], .1, 4, .8, PAL.ink, [0, 0, w, h], .45);
    const board = g2 => { roughRect(g2, 66, 36, 58, 86, 1); }; ink(g, board, PAL.vellum2, 2.2);
    const sheet = g2 => { g2.beginPath(); g2.rect(72, 46, 46, 70); }; ink(g, sheet, PAL.vellum, 1.2);
    const clip = g2 => { roughRect(g2, 84, 30, 22, 12, .8); }; ink(g, clip, PAL.ink2, 1.4);
    caps(g, 'Safety', 95, 64, 8, PAL.ink, 1, 'center', 'bold');
    g.strokeStyle = PAL.ink; g.lineWidth = 1;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.rect(77, 71 + i * 8, 4, 4); g.stroke(); g.beginPath(); g.moveTo(85, 73 + i * 8); g.lineTo(96 + (i % 3) * 6, 73 + i * 8); g.stroke(); }
    const hand = g2 => { g2.beginPath(); g2.ellipse(110, 84, 12, 10, .3, 0, 6.283); }; ink(g, hand, PAL.vellum, 1.6);
  }, { ax: .23, ay: .02 });
  // --- the sleepers: a cot with a sleeper under a hatched blanket, pivot bottom-centre ---
  L.cot = cutout(66, 40, (g, w, h) => {
    const frame = g2 => { g2.beginPath(); g2.rect(4, 18, w - 8, 12); }; ink(g, frame, PAL.vellum2, 1.6);
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(6, 30); g.lineTo(4, h); g.moveTo(w - 6, 30); g.lineTo(w - 4, h); g.stroke();
    const bl = g2 => { g2.beginPath(); g2.moveTo(22, 20); g2.quadraticCurveTo(40, 2, w - 6, 8); g2.lineTo(w - 6, 20); g2.closePath(); }; ink(g, bl, PAL.vellum, 1.6); hatch(g, bl, .5, 3, .7, PAL.ink, [0, 0, w, h], .5);
    const pil = g2 => { g2.beginPath(); g2.ellipse(16, 16, 12, 5, 0, 0, 6.283); }; ink(g, pil, PAL.vellum, 1.2);
    const hd = g2 => { g2.beginPath(); g2.arc(16, 11, 7, 0, 6.283); }; ink(g, hd, PAL.vellum, 1.5);
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(13, 11); g.quadraticCurveTo(16, 14, 19, 11); g.stroke();
    const cap = g2 => { g2.beginPath(); g2.moveTo(9, 9); g2.quadraticCurveTo(16, -2, 24, 8); g2.lineTo(30, 2); g2.lineTo(26, 10); g2.closePath(); }; ink(g, cap, PAL.vellum2, 1.2);
  }, { ax: .5, ay: 1 });
  // --- the torrent ---
  L.waves = [l2_wave(220, 150, 23), l2_wave(160, 110, 24), l2_wave(120, 80, 25)];
  seed(26);
  L.objs = [
    cutout(30, 56, (g, w, h) => {                                 // rocket
      const body = g2 => { g2.beginPath(); g2.moveTo(w / 2, 0); g2.quadraticCurveTo(w, h * .3, w * .8, h * .8); g2.lineTo(w * .2, h * .8); g2.quadraticCurveTo(0, h * .3, w / 2, 0); g2.closePath(); };
      ink(g, body, PAL.vellum, 1.8); hatch(g, [body, half(w * .55, 0, w, h)], 1.4, 3, .7, PAL.ink, [0, 0, w, h], .5);
      const finL = g2 => { g2.beginPath(); g2.moveTo(w * .22, h * .6); g2.lineTo(0, h); g2.lineTo(w * .25, h * .8); g2.closePath(); }; ink(g, finL, PAL.vellum, 1.5);
      const finR = g2 => { g2.beginPath(); g2.moveTo(w * .78, h * .6); g2.lineTo(w, h); g2.lineTo(w * .75, h * .8); g2.closePath(); }; ink(g, finR, PAL.vellum, 1.5);
      const port = g2 => { g2.beginPath(); g2.arc(w / 2, h * .35, 5, 0, 6.283); }; ink(g, port, PAL.vellum, 1.4);
    }),
    cutout(50, 50, (g, w, h) => {                                 // gear
      const gp = g2 => gearPath(g2, w / 2, h / 2, 23, 9, .22); ink(g, gp, PAL.vellum, 1.8);
      const hub = g2 => { g2.beginPath(); g2.arc(w / 2, h / 2, 7, 0, 6.283); }; ink(g, hub, PAL.vellum, 1.5); hatch(g, gp, .8, 3.5, .7, PAL.ink, [0, 0, w, h], .35);
    }),
    cutout(44, 56, (g, w, h) => {                                 // retort
      const fl = g2 => { g2.beginPath(); g2.arc(w * .4, h * .68, 15, 0, 6.283); }; ink(g, fl, PAL.vellum, 1.8);
      const neck = g2 => { g2.beginPath(); g2.moveTo(w * .46, h * .42); g2.quadraticCurveTo(w * .7, h * .1, w, 4); g2.lineTo(w, 10); g2.quadraticCurveTo(w * .72, h * .2, w * .56, h * .5); g2.closePath(); }; ink(g, neck, PAL.vellum, 1.6);
      hatch(g, [fl, half(0, h * .7, w, h)], 0, 3, .7, PAL.ink, [0, 0, w, h], .5);
    }),
    cutout(52, 52, (g, w, h) => {                                 // atom
      g.strokeStyle = PAL.ink; g.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(w / 2, h / 2, 24, 9, i * Math.PI / 3, 0, 6.283); g.stroke(); }
      const nu = g2 => { g2.beginPath(); g2.arc(w / 2, h / 2, 5, 0, 6.283); }; ink(g, nu, PAL.ink, 1);
    }),
    cutout(34, 56, (g, w, h) => {                                 // lightbulb
      const bulb = g2 => { g2.beginPath(); g2.arc(w / 2, h * .36, 15, Math.PI * .8, Math.PI * .2); g2.lineTo(w * .68, h * .72); g2.lineTo(w * .32, h * .72); g2.closePath(); }; ink(g, bulb, PAL.vellum, 1.8);
      const base = g2 => { roughRect(g2, w * .3, h * .72, w * .4, h * .22, .8); }; ink(g, base, PAL.vellum2, 1.5); hatch(g, base, 0, 3, .8, PAL.ink, [0, 0, w, h], .6);
      g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(w * .4, h * .7); g.lineTo(w * .4, h * .45); g.lineTo(w * .5, h * .35); g.lineTo(w * .6, h * .45); g.lineTo(w * .6, h * .7); g.stroke();
    })
  ];
}

// the water mass piling against the Restrainer's hands, waves scrolling leftward, the future tumbling in it
function l2_torrent(g, t, tq, p, front) {
  const L = SP.l2, lv = eIO(seg(t, 26.7, 32));
  if (lv <= 0) return;
  const climb = 70 * seg(t, 32, 35.5);
  const fTop = lerp(630, 300, lv) - climb, rTop = lerp(640, 120, lv), R = p.x + p.w + 12, B = p.y + p.h + 12;
  const topY = x => lerp(rTop, fTop, (R - x) / (R - front)) + Math.sin(x * .05 - tq * 4) * 7 * lv;
  const mass = g2 => {
    g2.beginPath(); g2.moveTo(R, B); g2.lineTo(R, rTop);
    for (let x = R; x > front; x -= 10) g2.lineTo(x, topY(x));
    g2.quadraticCurveTo(front - 36, fTop - 24, front - 28, fTop + 26);
    g2.quadraticCurveTo(front - 2, fTop + 40, front + 2, fTop + 80);
    g2.quadraticCurveTo(front - 12, fTop + 230, front + 96, B);             // the heap spreads at its foot
    g2.closePath();
  };
  seed(33);
  ink(g, mass, PAL.vellum, 2.4);
  hatch(g, mass, .08, 7, .8, PAL.ink, [front - 40, 100, R, 660], .42, 3);
  hatch(g, [mass, half(front - 40, 480, R, 660)], .05, 4, .7, PAL.ink, [front - 40, 480, R, 660], .5, 2);
  g.save(); g.beginPath(); g.rect(front - 30, p.y, R - front + 30, p.h); g.clip();
  // waves in three tiers: the surface, the churning middle, the dark bottom; each scrolls leftward
  // over (front - width, R] so something is always breaking
  const tiers = [[0, 18, 1], [1, 120, .95], [2, 230, .9]];
  tiers.forEach(([wi, dy, s0], ti) => {
    const w = L.waves[wi], sp = [62, 46, 34][ti], wid = w.w * s0;
    const span = R - front + wid, n = Math.max(1, Math.round(span / (wid * 1.15)));
    if (ti === 1) { g.restore(); g.save(); mass(g); g.clip(); }                // the lower tiers churn inside the heap
    for (let i = 0; i < n; i++) {
      const x = R - ((tq * sp + i * span / n + ti * 37) % span);
      const sy = Math.min(R, Math.max(front, x + wid * .5));
      const y = topY(sy) + dy, s = s0 * (.6 + .4 * lv) * (1 + .12 * Math.sin(tq * 4 + i + ti));
      if (y - w.h * s > B) continue;
      spr(g, w, x, y, 0, s, s);
    }
  });
  for (let i = 0; i < 5; i++) {                                   // the Baconian future, tumbling
    const x = R + 40 - ((tq * (48 + i * 9) + i * 75) % (R - front + 60));
    if (x < front + 12) continue;
    const y = topY(x) - 14 + Math.sin(tq * 3 + i) * 6;
    spr(g, L.objs[i], x, y, tq * (1.5 + i * .4) * (i % 2 ? 1 : -1), .9, .9);
  }
  g.restore();
}
// foam breaking at the hands
function l2_foam(g, t, tq, x, y) {
  const k = seg(t, 30.5, 32); if (k <= 0) return;
  g.save(); g.strokeStyle = PAL.ink; g.lineWidth = 1.4; g.globalAlpha = k;
  for (let i = 0; i < 6; i++) {
    const a = -1.2 + i * .5 + Math.sin(tq * 6 + i) * .15, r = 10 + i * 4 + Math.sin(tq * 9 + i * 2) * 3;
    const cx = x + Math.cos(a) * r * 1.4, cy = y + Math.sin(a) * r;
    g.beginPath(); for (let q = 0; q < 9; q += .4) { const rr = 5 * q / 9; g.lineTo(cx + Math.cos(q + i) * rr, cy + Math.sin(q + i) * rr); } g.stroke();
  }
  g.restore();
}
const l2_bez = (P0, C1, C2, P1, u) => { const v = 1 - u; return [v * v * v * P0[0] + 3 * v * v * u * C1[0] + 3 * v * u * u * C2[0] + u * u * u * P1[0], v * v * v * P0[1] + 3 * v * v * u * C1[1] + 3 * v * u * u * C2[1] + u * u * u * P1[1]]; };
// the jet that escapes the frame: from the elbow, over the right rule, down the page margin to a pool
function l2_jet(g, t, tq, from) {
  const k = eOut(seg(t, 36, 37.3));
  const P0 = from, C1 = [1120, 40], C2 = [1228, 46], P1 = [1217, 150];
  const pts = [];
  for (let i = 0; i <= 30; i++) pts.push(l2_bez(P0, C1, C2, P1, i / 30));
  for (let y = 165; y <= 690; y += 15) pts.push([1217 + Math.sin(y * .08 + tq * 6) * 1.5, y]);
  const n = Math.max(2, Math.floor(pts.length * k)), path = pts.slice(0, n);
  const trace = (lw, col, wob = 0) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); path.forEach(([x, y], i) => { const dx = wob ? Math.sin(i * 1.3 + tq * 9) * wob : 0; i ? g.lineTo(x + dx, y) : g.moveTo(x + dx, y); }); g.stroke(); };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  trace(9, PAL.ink); trace(5, PAL.vellum); trace(1, PAL.ink, 1.5);
  seed(36); g.fillStyle = PAL.ink;
  for (let i = 0; i < 12; i++) {                                  // droplets flung off the stream
    const u = (tq * .35 + i / 12) % 1, [x, y] = pts[Math.min(n - 1, Math.floor(u * (n - 1)))];
    g.beginPath(); g.arc(x + rnd(-15, 15), y + rnd(-7, 7), 1.4 + rnd(0, 1.8), 0, 6.283); g.fill();
  }
  const [tx, ty] = path[n - 1];
  g.fillStyle = PAL.vellum; g.beginPath(); g.arc(tx, ty, 7, 0, 6.283); g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1.6; g.stroke();
  if (k >= 1) { const pool = seg(t, 37.3, 40); g.fillStyle = PAL.vellum; g.beginPath(); g.ellipse(1217, 690, 10 + 16 * pool, 3 + 2 * pool, 0, 0, 6.283); g.fill(); g.stroke(); }
  g.restore();
}

function leaf2(g, t) {
  spread(g, t, L2_SPEC, (g, p) => {
    const L = SP.l2, tq = stepT(t, 15);
    // the Restrainer's stance: shoved left at 29 and 33, re-bracing with a snap each time
    const brace = at => -seg(t, at - .25, at) + snap(t, at, .15);
    const br = brace(29) + brace(33);
    const ox = -12 * seg(t, 28.75, 29) - 12 * seg(t, 32.75, 33);
    const fx = 882 + ox, fy = 640, lean = .08 + .07 * br;
    const push = eIO(seg(t, 26.7, 32));
    const armA = lerp(-.35, -1.05, push) + .25 * br;
    const sh = rot2(52, -378, lean), hand = rot2(0, 150, lean + armA);
    const hx = fx + sh[0] + hand[0], hy = fy + sh[1] + hand[1];
    const front = lerp(p.x + p.w + 12, hx + 4, eIO(seg(t, 26.7, 32)));

    g.save(); clipInner(g);
    // floor and wall
    g.fillStyle = PAL.vellum2; g.fillRect(p.x, 560, p.w, p.y + p.h - 560);
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(p.x, 560); g.lineTo(p.x + p.w, 560); g.stroke();
    seed(31); hatch(g, rect(p.x, 560, p.w, 90), 0, 7, .7, PAL.ink, [p.x, 560, p.x + p.w, 650], .25);
    // the banner hung from the top rule, over the sleepers
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(760, p.y); g.lineTo(770, 106); g.moveTo(840, p.y); g.lineTo(830, 106); g.stroke();
    seed(32); ribbon(g, 800, 120, 172, 30, 'PEACE AND SAFETY', { fill: PAL.lapis3, col: PAL.ink, size: 12, spacing: 2 });
    const rows = [[400, .78], [480, .9], [560, 1]];
    rows.forEach(([y, s], r) => { for (let c = 0; c < 3; c++) spr(g, L.cot, 716 + c * 50 * s + r * 6, y, 0, s, s); });
    // the torrent, then the Restrainer in front of its leading edge
    l2_torrent(g, t, tq, p, front);
    g.save(); g.translate(fx, fy); g.rotate(lean);
    spr(g, L.body, 0, 0);
    spr(g, L.head, 2, -392, -.06 + .05 * br);
    spr(g, L.armL, -52, -378, .1 - .1 * br);
    spr(g, L.armR, 52, -378, armA);
    g.restore();
    l2_foam(g, t, tq, hx + 8, hy - 6);
    g.restore();
    // the overflow: a jet past the elbow, over the rule, down the margin
    if (L2_SPEC.overflow(t)) { const el = rot2(0, 75, lean + armA); l2_jet(g, t, tq, [fx + sh[0] + el[0], fy + sh[1] + el[1]]); }
  });
}
