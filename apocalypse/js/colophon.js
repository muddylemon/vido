// colophon.js — the printer's note, and his device: a small door in a cartouche.
'use strict';
const COLO_SPEC = { ...structuredClone(VIDO_APOCALYPSE.specs.COLO_SPEC)
};
function buildColophon() { SP.colo = {}; }
function colophon(g, t) {
  spread(g, t, COLO_SPEC, (g, p) => {
    const cx = p.x + p.w / 2, cy = p.y + 270, a = seg(t, 122.9, 123.9);
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; seed(5);
    // the cartouche: a double oval wreathed in a vine
    const ov = ell(cx, cy, 118, 164); ink(g, ov, PAL.vellum, 2.4);
    g.beginPath(); g.ellipse(cx, cy, 110, 156, 0, 0, 6.283); g.strokeStyle = PAL.ink; g.lineWidth = 1; g.stroke();
    g.beginPath(); g.ellipse(cx, cy, 132, 178, 0, 0, 6.283); g.lineWidth = 1.3; g.stroke();
    for (let i = 0; i < 30; i++) {
      const th = i / 30 * 6.283, x = cx + Math.cos(th) * 132, y = cy + Math.sin(th) * 178, tang = Math.atan2(Math.cos(th) * 178, -Math.sin(th) * 132), side = i % 2 ? 1 : -1;
      g.save(); g.translate(x, y); g.rotate(tang + side * .9);
      g.beginPath(); g.ellipse(7, 0, 8, 3.2, 0, 0, 6.283); g.fillStyle = PAL.vellum; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1.2; g.stroke();
      g.beginPath(); g.moveTo(1, 0); g.lineTo(13, 0); g.lineWidth = .7; g.stroke(); g.restore();
    }
    // the door, with its keyhole alight
    g.save(); g.translate(cx, cy); g.scale(.3, .3);
    const flick = .8 + .2 * hash(Math.floor(t * 30) * 3.7);
    g.save(); SP.common.keyhole(-150, -250)(g); g.clip(); g.globalAlpha = a * flick; g.fillStyle = PAL.gold; g.fillRect(-150, -250, 300, 500); g.globalAlpha = a * flick * .7; g.fillStyle = PAL.gold2; g.fillRect(-150, -250, 300, 240); g.restore();
    spr(g, SP.common.door, 0, 0); g.restore();
    g.globalAlpha = a * seg(t, 123.5, 124.5);
    caps(g, 'Excudebat · MMXXVI', cx, cy + 222, 14, PAL.ink, 3, 'center');
    g.restore();
  });
}
