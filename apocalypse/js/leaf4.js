// leaf4.js — IV: Of the Beast that is a Machinery.
'use strict';
const L4_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.L4_SPEC),
  overflow: t => t > 70
};
// beat times (global seconds)
const L4 = { ASM: [64.7, 65.03, 65.37, 65.7], EYE0: 66.5, EYE1: 67.9, TAPE0: 67, MAN0: 68, MAN1: 71, WRAP: 70.5, HAND0: 72, HAND1: 77.0, FLIP: 77.6 };
const L4_PIVOT = [370, 470], L4_BLADE = 120, L4_OFF = -.17, L4_ON = 1.4;      // the knife switch (panel-local)

function buildLeaf4() {
  seed(44); const L = SP.l4 = {};
  // --- plinth: three stacked ledgers (pivot bottom-centre) ---
  L.plinth = cutout(260, 96, (g, w, h) => {
    const books = [[10, 64, 240, 32, 'LEDGER'], [22, 34, 222, 30, 'TREATY'], [34, 4, 200, 30, 'CODE']];
    for (const [x, y, bw, bh, label] of books) {
      const b = rrect(x, y, bw, bh, 1.2); ink(g, b, PAL.vellum, 2.2);
      hatch(g, rect(x + bw - 26, y + 3, 24, bh - 6), 0, 3, .7, PAL.ink, [x, y, x + bw, y + bh], .6);        // page edges
      g.strokeStyle = PAL.ink; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + bw - 26, y); g.lineTo(x + bw - 26, y + bh); g.stroke();
      for (const sx of [x + 12, x + bw - 40]) { g.lineWidth = 2; g.beginPath(); g.moveTo(sx, y + 2); g.lineTo(sx, y + bh - 2); g.stroke(); }  // spine bands
      caps(g, label, x + bw / 2 - 12, y + bh / 2 + 4, 10, PAL.ink, 2, 'center', 'bold');
      hatch(g, [b, half(x, y + bh * .62, x + bw, y + bh)], .05, 3.5, .7, PAL.ink, [x, y, x + bw, y + bh], .35);
    }
  }, { ax: .5, ay: 1 });
  // --- body: a filing cabinet of four drawers (pivot bottom-centre) ---
  L.body = cutout(180, 150, (g, w, h) => {
    const box = rrect(0, 0, w, h, 1.2); ink(g, box, PAL.vellum, 2.6);
    const labels = ['TAX', 'SANCTION', 'SURVEIL', 'LIBEL'];
    for (let i = 0; i < 4; i++) {
      const y = 6 + i * 36, d = rrect(8, y, w - 16, 30, 1); ink(g, d, PAL.vellum, 1.8);
      hatch(g, [d, half(8, y + 19, w - 8, y + 30)], 0, 3, .6, PAL.ink, [0, y, w, y + 30], .4);
      g.fillStyle = PAL.ink; roughRect(g, w / 2 - 14, y + 18, 28, 6, .6); g.fill();                                   // handle
      const pl = rrect(w / 2 - 34, y + 4, 68, 11, .5); g.strokeStyle = PAL.ink; g.lineWidth = 1; pl(g); g.stroke();   // label plate
      caps(g, labels[i], w / 2, y + 12.5, 8, PAL.ink, 1.4, 'center', 'bold');
      rivets(g, [[14, y + 5], [w - 14, y + 5], [14, y + 25], [w - 14, y + 25]], 2.6);
    }
  }, { ax: .5, ay: 1 });
  // --- head: a strongbox with a dial between the eyes (pivot bottom-centre) ---
  L.head = cutout(150, 100, (g, w, h) => {
    const box = rrect(0, 0, w, h, 1.2); ink(g, box, PAL.vellum, 2.6);
    for (const y of [12, h - 12]) { g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(4, y); g.lineTo(w - 4, y); g.stroke(); rivets(g, [[16, y], [46, y], [w - 46, y], [w - 16, y]], 2.8); }
    const cx = w / 2, cy = h / 2 + 6, dial = circ(cx, cy, 20); ink(g, dial, PAL.vellum, 2);
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.strokeStyle = PAL.ink; g.lineWidth = i % 3 ? 1 : 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); g.lineTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); g.stroke(); }
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 12, cy - 7); g.stroke(); g.beginPath(); g.arc(cx, cy, 2.5, 0, 6.283); g.fillStyle = PAL.ink; g.fill();
    hatch(g, [box, half(0, h * .78, w, h)], .05, 3.5, .7, PAL.ink, [0, 0, w, h], .3);
  }, { ax: .5, ay: 1 });
  // --- a gear (pivot centre) ---
  L.gear = cutout(56, 56, (g, w, h) => {
    const gp = g2 => gearPath(g2, 28, 28, 26, 10, .22); ink(g, gp, PAL.vellum, 2);
    hatch(g, [gp, half(0, 30, w, h)], .8, 3, .7, PAL.ink, [0, 0, w, h], .35);
    const hub = circ(28, 28, 7); ink(g, hub, PAL.vellum, 1.6);
    for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + .4; g.strokeStyle = PAL.ink; g.lineWidth = 1.4; g.beginPath(); g.arc(28 + Math.cos(a) * 15, 28 + Math.sin(a) * 15, 3.5, 0, 6.283); g.stroke(); }
  });
  // --- the knife switch: board (pivot top-left) and blade (pivot hinge end) ---
  L.board = cutout(170, 210, (g, w, h) => {
    const b = rrect(0, 0, w, h, 1.2); ink(g, b, PAL.vellum2, 2.4);
    hatch(g, b, 1.57, 5, .5, PAL.ink, [0, 0, w, h], .16);
    rivets(g, [[10, 10], [w - 10, 10], [10, h - 10], [w - 10, h - 10]], 3.2);
    const jaw = g2 => { g2.beginPath(); g2.moveTo(w - 36, 136); g2.lineTo(w - 10, 136); g2.lineTo(w - 10, 164); g2.lineTo(w - 36, 164); g2.closePath(); };
    ink(g, jaw, PAL.vellum, 2); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(w - 36, 150); g.lineTo(w - 10, 150); g.stroke();
    caps(g, 'OFF', 112, 34, 13, PAL.ink, 2.5, 'center', 'bold');
    caps(g, 'ON', w - 23, 190, 13, PAL.vermilion, 2.5, 'center', 'bold');
    const hb = rrect(28, 160, 24, 22, .8); ink(g, hb, PAL.vellum, 2);
  }, { ax: 0, ay: 0 });
  L.blade = cutout(22, 130, (g, w, h) => {
    const bl = rrect(6, 14, 10, h - 14, .8); ink(g, bl, PAL.vellum, 2); hatch(g, bl, 1.57, 3, .6, PAL.ink, [0, 0, w, h], .35);
    const ball = circ(11, 10, 9); ink(g, ball, PAL.ink, 1.5); g.fillStyle = PAL.vellum; g.beginPath(); g.arc(8, 7, 2.5, 0, 6.283); g.fill();
  }, { ax: .5, ay: 1 });
  // --- the gloved hand, cuff and a long sleeve (pivot at the grip) ---
  L.hand = cutout(110, 520, (g, w, h) => {
    const sleeve = g2 => { g2.beginPath(); g2.moveTo(22, 0); g2.lineTo(88, 0); g2.lineTo(92, 380); g2.lineTo(18, 380); g2.closePath(); };
    ink(g, sleeve, PAL.vellum, 2.4); hatch(g, [sleeve, half(0, 0, 42, 380)], 1.4, 5, .9, PAL.ink, [0, 0, w, h], .5);
    for (let i = 0; i < 4; i++) { g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(36 + i * 13, 8); g.lineTo(32 + i * 14, 372); g.stroke(); }
    const cuff = rrect(12, 376, 86, 30, 1); ink(g, cuff, PAL.vellum, 2.2); g.strokeStyle = PAL.ink; g.lineWidth = 1; g.strokeRect(16, 380, 78, 22);
    const palm = g2 => { g2.beginPath(); g2.moveTo(20, 402); g2.quadraticCurveTo(12, 440, 24, 472); g2.quadraticCurveTo(55, 496, 88, 472); g2.quadraticCurveTo(100, 440, 90, 402); g2.closePath(); };
    ink(g, palm, PAL.vellum, 2.4); hatch(g, [palm, half(0, 402, 44, 500)], 1.3, 4.5, .9, PAL.ink, [0, 0, w, h], .45);
    for (let i = 0; i < 4; i++) { const y = 432 + i * 15; const f = g2 => { g2.beginPath(); g2.moveTo(26, y); g2.quadraticCurveTo(55, y - 8, 86, y); g2.quadraticCurveTo(55, y + 9, 26, y); g2.closePath(); }; ink(g, f, PAL.vellum, 1.8); }
    const th = g2 => { g2.beginPath(); g2.moveTo(24, 420); g2.quadraticCurveTo(0, 440, 20, 468); g2.quadraticCurveTo(36, 460, 30, 430); g2.closePath(); }; ink(g, th, PAL.vellum, 1.8);
    g.strokeStyle = PAL.ink; g.lineWidth = .9; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(40 + i * 12, 406); g.lineTo(42 + i * 12, 426); g.stroke(); }
  }, { ax: .5, ay: 455 / 520 });
  // --- the small man with the sack ---
  L.manBody = cutout(64, 96, (g, w, h) => {
    const coat = g2 => { g2.beginPath(); g2.moveTo(18, 36); g2.lineTo(46, 36); g2.lineTo(54, 60); g2.lineTo(50, h); g2.lineTo(14, h); g2.lineTo(10, 60); g2.closePath(); };
    ink(g, coat, PAL.vellum, 2); hatch(g, [coat, half(0, 36, 30, h)], 1.3, 3.5, .8, PAL.ink, [0, 0, w, h], .5);
    g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(32, 40); g.lineTo(32, h - 4); g.stroke();
    g.fillStyle = PAL.ink; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(36, 50 + i * 12, 1.8, 0, 6.283); g.fill(); }
    const head = ell(32, 26, 11, 13); ink(g, head, PAL.vellum, 2);
    g.beginPath(); g.arc(28, 25, 1.5, 0, 6.283); g.fill(); g.beginPath(); g.arc(36, 25, 1.5, 0, 6.283); g.fill();
    g.beginPath(); g.moveTo(28, 34); g.quadraticCurveTo(32, 30, 36, 34); g.lineWidth = 1.2; g.stroke();
    const hat = rect(22, 0, 20, 16); ink(g, hat, PAL.ink, 1.5); g.fillStyle = PAL.ink; roughRect(g, 16, 14, 32, 4, .5); g.fill();
  }, { ax: .5, ay: 1 });
  L.manLeg = cutout(16, 36, (g, w, h) => { const l = rrect(4, 0, 8, 28, .6); ink(g, l, PAL.vellum, 1.6); hatch(g, l, 1.57, 2.5, .6, PAL.ink, [0, 0, w, h], .4); g.fillStyle = PAL.ink; roughRect(g, 2, 27, 13, 7, .5); g.fill(); }, { ax: .5, ay: 0 });
  L.sack = cutout(46, 44, (g, w, h) => {
    const s = g2 => { g2.beginPath(); g2.moveTo(18, 4); g2.lineTo(28, 4); g2.quadraticCurveTo(46, 16, 42, 40); g2.lineTo(4, 40); g2.quadraticCurveTo(0, 16, 18, 4); g2.closePath(); };
    ink(g, s, PAL.vellum, 2); hatch(g, [s, half(0, 27, w, h)], .2, 3, .7, PAL.ink, [0, 0, w, h], .4);
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(14, 8); g.lineTo(32, 8); g.stroke();
    const coin = circ(23, 24, 8); ink(g, coin, PAL.gold, 1.6); g.fillStyle = PAL.gold3; g.font = font(11, '', 'bold'); g.textAlign = 'center'; g.fillText('$', 23, 28);
  });
  // --- paper tapes, perforated, stamped in lapis (pivot left end) ---
  const mkTape = label => cutout(320, 22, (g, w, h) => {
    const r = rrect(0, 2, w, h - 4, .6); ink(g, r, PAL.vellum, 1.6);
    g.fillStyle = PAL.ink; for (let x = 6; x < w; x += 10) { g.beginPath(); g.arc(x, 5, 1.2, 0, 6.283); g.fill(); g.beginPath(); g.arc(x, h - 5, 1.2, 0, 6.283); g.fill(); }
    let x = 10; while (x < w - 60) x += caps(g, label + ' ·', x, 15, 9, PAL.lapis, 1.6, 'left', 'bold') + 8;
  }, { ax: 0, ay: .5 });
  L.tapes = { treaty: mkTape('TREATY'), sanction: mkTape('SANCTION'), surveil: mkTape('SURVEILLANCE') };
  // --- the eyes, in panel coordinates: [x, y, r, piece index] (piece 0 plinth, 1 body, 3 head) ---
  const E = [];
  [[80, 484], [92, 453], [104, 423], [286, 484]].forEach(([x, y]) => E.push([x, y, 7, 0]));                 // plinth
  for (let i = 0; i < 4; i++) { E.push([110, 281 + i * 36, 8, 1]); E.push([250, 281 + i * 36, 8, 1]); }    // drawers
  E.push([100, 258, 6, 1], [260, 258, 6, 1]);                                                             // body top
  E.push([139, 154, 13, 3], [221, 154, 13, 3]);                                                           // the face
  L.eyes = E.map((e, i) => ({ x: e[0], y: e[1], r: e[2], piece: e[3], at: L4.EYE0 + i * (L4.EYE1 - L4.EYE0) / (E.length - 1) }));
  // margin eyes on the verso (global coordinates)
  L.margin = [[62, 200], [58, 330], [66, 470], [612, 180], [608, 300], [614, 440], [330, 668]].map(([x, y], i) => ({ x, y, r: 13, at: 70 + i * .45 }));
}

// an eye with a lid that really shuts (lid 0 open .. 1 shut)
function l4_eye(g, x, y, r, look, lid) {
  eye(g, x, y, r, look, 0);
  if (lid <= 0) return;
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(0, -r * .95, r, 0); g.quadraticCurveTo(0, r * .95, -r, 0); g.closePath(); g.clip();
  const cy = -r * .95 + lid * r * 1.9;
  g.fillStyle = PAL.vellum; g.beginPath(); g.moveTo(-r - 1, 0); g.quadraticCurveTo(0, cy, r + 1, 0); g.lineTo(r + 1, -r - 1); g.lineTo(-r - 1, -r - 1); g.closePath(); g.fill();
  g.strokeStyle = PAL.ink; g.lineWidth = Math.max(1.2, r * .12); g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(0, cy, r, 0); g.stroke();
  g.restore();
}
function l4_man(t) {
  if (t < L4.MAN0) return { present: false, x: -60, y: 552 };
  const x = lerp(-30, 250, seg(t, L4.MAN0, L4.MAN1)) - 8 * snap(t, L4.MAN1, .1);
  return { present: true, x, y: 552 };
}
function l4_bladeRot(t) { return L4_OFF + (L4_ON - L4_OFF) / 3 * snap(t, L4.FLIP, .1); }
function l4_tip(rot) { return [L4_PIVOT[0] + L4_BLADE * Math.sin(rot), L4_PIVOT[1] - L4_BLADE * Math.cos(rot)]; }
// a tape unspooling from (x,y) at angle a, revealed to length len
function l4_tape(g, s, x, y, a, len) {
  if (len <= 1) return;
  g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.rect(-2, -14, len + 2, 28); g.clip(); spr(g, s, 0, 0); g.restore();
}

function leaf4(g, t) {
  spread(g, t, L4_SPEC, (g, p) => {
    const L = SP.l4, tq = stepT(t, 15), over = L4_SPEC.overflow(t);
    const man = l4_man(t);
    const gaze = (ex, ey, scale = 160) => {
      if (t >= L4.FLIP) return [0, 0];
      if (!man.present) return [0, .15];
      return [clamp((man.x - ex) / scale, -1, 1), clamp((man.y - 45 - ey) / scale, -1, 1)];
    };
    g.save();
    if (over) clipInner(g);
    g.translate(p.x, p.y);
    if (t >= L4.FLIP) { const f = Math.floor(t * 30); g.translate((hash(f * 1.3) - .5) * 3, (hash(f * 2.9) - .5) * 3); }   // the panel trembles
    // --- floor ---
    g.strokeStyle = PAL.ink; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-10, 500); g.lineTo(520, 500); g.stroke();
    seed(441); g.lineWidth = 1; for (let i = 0; i < 10; i++) { const x = i * 64 - 80; g.beginPath(); g.moveTo(x, 580); g.lineTo(x + 46, 500); g.stroke(); }
    hatch(g, rect(0, 500, 504, 80), 0, 7, .6, PAL.ink, [0, 500, 504, 580], .22);
    // --- the knife switch ---
    spr(g, L.board, 330, 300);
    const rot = l4_bladeRot(t), tip = l4_tip(rot);
    spr(g, L.blade, L4_PIVOT[0], L4_PIVOT[1], rot);
    // --- the beast assembles: plinth, body, jaw, head ---
    const drop = i => 80 * (1 - snap(t, L4.ASM[i], .12));
    if (t >= L4.ASM[0]) spr(g, L.plinth, 180, 500 - drop(0));
    if (t >= L4.ASM[1]) spr(g, L.body, 180, 410 - drop(1));
    if (t >= L4.ASM[2]) { const d = drop(2); spr(g, L.gear, 160, 218 - d, 0); spr(g, L.gear, 204, 240 - d, t * 1.6); }   // the jaw, emerging under the head
    if (t >= L4.ASM[3]) spr(g, L.head, 180, 210 - drop(3));
    // --- the eyes open, then watch ---
    for (const [i, e] of L.eyes.entries()) {
      if (t < L4.ASM[e.piece] + .12) continue;
      let lid = 1 - seg(t, e.at, e.at + .15);
      if (lid <= 0 && t < L4.FLIP && ((t + hash(i + 1) * 7) % 4.3) < .12) lid = 1;                     // an occasional blink
      l4_eye(g, e.x, e.y, e.r, gaze(e.x, e.y), lid);
    }
    // --- tapes unspool from the drawers ---
    if (t >= L4.TAPE0) {
      const wob = ph => .07 * Math.sin(tq * 2.1 + ph);
      l4_tape(g, L.tapes.treaty, 270, 300, .95 + wob(0), 125 * eOut(seg(t, 67, 70)));
      l4_tape(g, L.tapes.surveil, 90, 335, Math.PI - .15 + wob(2), 120 * eOut(seg(t, 67.4, 70.4)));
      l4_tape(g, L.tapes.sanction, 270, 268, -.25 + wob(4), 150 * eOut(seg(t, 67.8, 70.8)));
    }
    // the ankle tape: reaches the man at 70.5 and coils
    const ankle = [man.x - 6, 546];
    if (t >= 70 && man.present) {
      const dx = ankle[0] - 270, dy = ankle[1] - 392, dist = Math.hypot(dx, dy);
      l4_tape(g, L.tapes.sanction, 270, 392, Math.atan2(dy, dx), dist * seg(t, 70, L4.WRAP));
    }
    // --- the small man tiptoes in, hugging his money ---
    if (man.present) {
      const s = Math.floor(t * 6) % 4, walking = t < L4.MAN1;
      const legs = walking ? [[-.32, .32], [0, 0], [.32, -.32], [0, 0]][s] : [.12, -.12];
      const bob = walking && s % 2 ? -3 : 0, jit = t >= L4.MAN1 ? (hash(Math.floor(t * 15)) - .5) * 2 : 0;
      g.save(); g.translate(man.x + jit, man.y + bob); if (t >= L4.MAN1) g.rotate(-.1 * snap(t, L4.MAN1, .1));
      spr(g, L.manLeg, -6, -34, legs[0]); spr(g, L.manLeg, 6, -34, legs[1]);
      spr(g, L.manBody, 0, -34);
      spr(g, L.sack, 14, -80, .15);
      g.restore();
      for (let i = 0; i < 3; i++) if (t >= L4.WRAP + i * .17) { g.strokeStyle = PAL.ink; g.lineWidth = 2.4; g.beginPath(); g.ellipse(ankle[0], ankle[1] - i * 4, 9, 3.5, 0, 0, 6.283); g.stroke(); g.strokeStyle = PAL.lapis; g.lineWidth = 1; g.stroke(); }
    }
    // --- the gloved hand descends and rests on the lever ---
    if (t >= L4.HAND0) {
      const k = eOut(seg(t, L4.HAND0, L4.HAND1));
      spr(g, L.hand, lerp(tip[0] - 12, tip[0], k), lerp(-90, tip[1], k), rot);
    }
    g.restore();
    // --- overflow: eyes open in the verso's margins; a tape creeps out under the rule and into the gutter ---
    if (over) {
      for (const e of L.margin) {
        const lid = 1 - seg(t, e.at, e.at + .2); if (lid >= 1) continue;
        let look = [0, 0];
        if (t < L4.FLIP) { const mx = p.x + man.x, my = p.y + man.y - 60; look = [clamp((mx - e.x) / 500, -1, 1), clamp((my - e.y) / 500, -1, 1)]; }
        l4_eye(g, e.x, e.y, e.r, look, lid);
      }
      if (t >= 74) {
        const sway = .06 * Math.sin(stepT(t, 15) * 1.7);
        l4_tape(g, SP.l4.tapes.surveil, p.x + 1, p.y + 349, Math.PI - .15, 36);
        l4_tape(g, SP.l4.tapes.surveil, p.x - 34, p.y + 354, Math.PI / 2 + sway, 80 * eOut(seg(t, 74, 77)));
      }
    }
  });
}
