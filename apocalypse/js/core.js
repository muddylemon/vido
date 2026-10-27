// core.js — deterministic helpers for THE APOCALYPSE OF PETER: RNG, vellum textures, the cutout
// builder, engraving tools. Adapted from ../../js/core.js (The Metabolic Engine) with a woodcut palette.
'use strict';
const { width: W, height: H, fps: FPS, duration: DURATION } = VIDO_FILMS.apocalypse;

// Spot-colour woodcut palette. Line work is lampblack only; colour is rubrication.
const PAL = {
  ink: '#1c1814', ink2: '#3a2f26',                  // lampblack, and a worn/lighter black for hatching
  vellum: '#e8dcc0', vellum2: '#d9cba8', vellum3: '#cdbf9a',
  vermilion: '#b8321f', vermilion2: '#8f2416',       // rubrication, blood, the mark
  gold: '#c9a13b', gold2: '#efd98a', gold3: '#9a7420',   // gold leaf
  lapis: '#2c4f7c', lapis2: '#1f3658', lapis3: '#6f8db3', // PEACE AND SAFETY
  desk: '#231a14', smoke: '#6b5d4c'
};

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
let _R = mulberry32(1);
const seed = s => { _R = mulberry32(s); };
const rnd = (a = 0, b = 1) => a + (b - a) * _R();
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));           // 0..1 progress within [a,b]
const eIn = k => k * k * k;
const eOut = k => 1 - Math.pow(1 - k, 3);
const eIO = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eBack = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
// stiff "hinged" snap: holds, then jumps with a small overshoot — the puppet feel of a print come alive
const snap = (t, at, dur = .08) => { const k = seg(t, at, at + dur); return k <= 0 ? 0 : eBack(k); };
const stepT = (t, fps) => Math.floor(t * fps + 1e-6) / fps;
const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
function lerpCol(a, b, k) { const p = s => [1, 3, 5].map(i => parseInt(s.substr(i, 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; }
function withCam(g, cx, cy, z, rot, fn) {
  g.save(); g.translate(W / 2, H / 2); if (rot) g.rotate(-rot); g.scale(z, z); g.translate(-cx, -cy); fn(); g.restore();
}

function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

// ---------- textures ----------
function makeGrain(size, s, lo, hi, blotches) {
  seed(s);
  const c = mk(size, size), g = c.getContext('2d');
  const id = g.createImageData(size, size), d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = lo + (hi - lo) * (_R() * .6 + _R() * .4);
    d[i] = v; d[i + 1] = v * .985; d[i + 2] = v * .95; d[i + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  for (let i = 0; i < blotches; i++) {           // foxing & stains
    const x = rnd(0, size), y = rnd(0, size), r = rnd(10, size * .22);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const a = rnd(.04, .14);
    gr.addColorStop(0, `rgba(120,80,40,${a})`); gr.addColorStop(.7, `rgba(140,95,50,${a * .5})`); gr.addColorStop(1, 'rgba(140,95,50,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.strokeStyle = 'rgba(90,70,50,.10)'; g.lineWidth = .7;       // vellum fibres
  for (let i = 0; i < size / 2; i++) {
    const x = rnd(0, size), y = rnd(0, size), a = rnd(0, 6.28), l = rnd(3, 12);
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l * .5, y + Math.sin(a + 1) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return c;
}

let GRAIN, PAPER, FILM = [];
function initTextures() {
  GRAIN = makeGrain(512, 7, 205, 255, 26);
  PAPER = makeGrain(512, 9, 218, 255, 34);
  for (let f = 0; f < 6; f++) {                 // light speckle frames
    seed(100 + f);
    const c = mk(640, 360), g = c.getContext('2d'), id = g.createImageData(640, 360), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = _R() < .5 ? 0 : 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = _R() * 14;
    }
    g.putImageData(id, 0, 0);
    FILM.push(c);
  }
}

function grainFill(g, w, h, tex = GRAIN, alpha = 1) {
  g.save(); g.globalAlpha = alpha;
  const p = g.createPattern(tex, 'repeat');
  p.setTransform(new DOMMatrix().translateSelf(rnd(0, 512), rnd(0, 512)));
  g.fillStyle = p; g.fillRect(0, 0, w, h); g.restore();
}

// ---------- the cutout builder ----------
// draw(ctx,w,h) paints the artwork. Default here is a *printed* look: no torn paper margin, no drop
// shadow (margin:0, shadow:0). Pass {margin:3, shadow:5} for a lifted paper-cutout when a figure
// breaks the frame. Fill shapes with PAL.vellum so figures occlude what lies behind them.
function cutout(w, h, draw, o = {}) {
  const pad = o.pad ?? 16, margin = o.margin ?? 0, CW = w + pad * 2, CH = h + pad * 2;
  const A = mk(CW, CH), a = A.getContext('2d');
  a.translate(pad, pad); draw(a, w, h); a.setTransform(1, 0, 0, 1, 0, 0);
  const S = mk(CW, CH), s = S.getContext('2d'); s.drawImage(A, 0, 0);
  a.globalCompositeOperation = 'multiply'; grainFill(a, CW, CH, GRAIN, o.grain ?? .55);
  a.globalCompositeOperation = 'destination-in'; a.drawImage(S, 0, 0);

  const M = mk(CW, CH), m = M.getContext('2d');
  if (margin > 0) {
    for (let k = 0; k < 20; k++) { const an = k / 20 * 6.283, r = margin * (.55 + rnd(0, .9)); m.drawImage(S, Math.cos(an) * r, Math.sin(an) * r); }
    m.globalCompositeOperation = 'source-in'; m.fillStyle = o.edge || PAL.vellum; m.fillRect(0, 0, CW, CH);
    m.globalCompositeOperation = 'multiply'; grainFill(m, CW, CH, PAPER, .8);
    m.globalCompositeOperation = 'destination-in';
    for (let k = 0; k < 20; k++) { const an = k / 20 * 6.283, r = margin * (.6 + rnd(0, .8)); m.drawImage(S, Math.cos(an) * r, Math.sin(an) * r); }
  }

  const F = mk(CW, CH), f = F.getContext('2d');
  const sh = o.shadow ?? 0;
  if (sh > 0) {
    const SH = mk(CW, CH), q = SH.getContext('2d'); q.drawImage(margin > 0 ? M : S, 0, 0);
    q.globalCompositeOperation = 'source-in'; q.fillStyle = 'rgba(25,14,6,.42)'; q.fillRect(0, 0, CW, CH);
    f.filter = 'blur(1.5px)'; f.drawImage(SH, sh * .6, sh); f.filter = 'none';
  }
  if (margin > 0) f.drawImage(M, 0, 0);
  f.drawImage(A, 0, 0);
  return { c: F, w, h, pad, ax: o.ax ?? .5, ay: o.ay ?? .5 };
}

// draw sprite with pivot at (ax,ay) of its art box
function spr(g, s, x, y, rot = 0, sx = 1, sy = sx, alpha = 1) {
  if (alpha <= 0) return;
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (sx !== 1 || sy !== 1) g.scale(sx, sy);
  if (alpha < 1) g.globalAlpha *= alpha;
  g.drawImage(s.c, -s.pad - s.ax * s.w, -s.pad - s.ay * s.h); g.restore();
}

// ---------- engraving tools ----------
function blobPath(g, cx, cy, rx, ry, n = 18, j = .08, rot = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rot, r = 1 + rnd(-j, j); pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); }
  smoothPoly(g, pts);
}
function smoothPoly(g, pts) {
  g.beginPath();
  const n = pts.length, mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let m0 = mid(pts[n - 1], pts[0]); g.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % n]); g.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  g.closePath();
}
function roughPoly(g, pts, j = 1.5) { g.beginPath(); pts.forEach((p, i) => { const x = p[0] + rnd(-j, j), y = p[1] + rnd(-j, j); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); }
function roughRect(g, x, y, w, h, j = 1.5) {
  const pts = [], st = 5;
  for (let i = 0; i <= st; i++) pts.push([x + w * i / st, y]);
  for (let i = 1; i <= st; i++) pts.push([x + w, y + h * i / st]);
  for (let i = st - 1; i >= 0; i--) pts.push([x + w * i / st, y + h]);
  for (let i = st - 1; i > 0; i--) pts.push([x, y + h * i / st]);
  roughPoly(g, pts, j);
}
// fill + engraved double outline (the second, lighter stroke is the slipped impression of the block)
function ink(g, pathFn, fill, lw = 2.2, col = PAL.ink) {
  pathFn(g); if (fill) { g.fillStyle = fill; g.fill(); }
  g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
  g.save(); g.globalAlpha = .35; g.translate(rnd(-.8, .8), rnd(-.8, .8)); pathFn(g); g.lineWidth = lw * .5; g.stroke(); g.restore();
}
// parallel engraving lines clipped to one or more paths; box=[x0,y0,x1,y1]
function hatch(g, clips, ang, gap, lw = .9, col = PAL.ink, box = [0, 0, 1000, 1000], alpha = .7, wave = 0) {
  g.save();
  for (const c of [].concat(clips)) { c(g); g.clip(); }
  g.strokeStyle = col; g.lineWidth = lw; g.globalAlpha = alpha;
  const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2, d = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + 4;
  g.translate(cx, cy); g.rotate(ang); g.beginPath();
  for (let y = -d; y < d; y += gap) {
    const j = rnd(-.5, .5); g.moveTo(-d, y + j);
    if (wave) { for (let x = -d; x <= d; x += 12) g.lineTo(x, y + j + Math.sin(x * .05 + y) * wave); }
    else g.lineTo(d, y + j + rnd(-.6, .6));
  }
  g.stroke(); g.restore();
}
// cross-hatch: two passes at right angles (deep woodcut shadow)
function xhatch(g, clips, ang, gap, lw = .9, col = PAL.ink, box = [0, 0, 1000, 1000], alpha = .6) {
  hatch(g, clips, ang, gap, lw, col, box, alpha); hatch(g, clips, ang + Math.PI / 2 + .2, gap * 1.15, lw, col, box, alpha * .8);
}
// dotted stipple inside path
function stipple(g, clip, box, n, r = .9, col = PAL.ink, alpha = .6) {
  g.save(); clip(g); g.clip(); g.fillStyle = col; g.globalAlpha = alpha;
  for (let i = 0; i < n; i++) { g.beginPath(); g.arc(rnd(box[0], box[2]), rnd(box[1], box[3]), r * rnd(.5, 1.2), 0, 6.283); g.fill(); }
  g.restore();
}
// soft tint wash (used sparingly: spot colour pooling)
function wash(g, clip, x, y, r, col, a = .35) {
  g.save(); clip(g); g.clip();
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
const circ = (x, y, r) => g => { g.beginPath(); g.arc(x, y, r, 0, 6.283); };
const ell = (x, y, rx, ry, rot = 0) => g => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.283); };
const rect = (x, y, w, h) => g => { g.beginPath(); g.rect(x, y, w, h); };
const rrect = (x, y, w, h, j = 1.5) => g => { roughRect(g, x, y, w, h, j); };
const half = (x0, y0, x1, y1) => g => { g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); };
const poly = pts => g => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };

function rivets(g, pts, r = 3.2) {
  for (const [x, y] of pts) {
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fillStyle = PAL.vellum; g.fill(); g.strokeStyle = PAL.ink; g.lineWidth = 1.1; g.stroke();
    g.beginPath(); g.arc(x, y, r * .35, 0, 6.283); g.fillStyle = PAL.ink; g.fill();
  }
}
// gear path
function gearPath(g, cx, cy, r, teeth, depth = .16) {
  g.beginPath();
  for (let i = 0; i < teeth * 4; i++) {
    const a = i / (teeth * 4) * 6.283, k = i % 4, rr = (k === 1 || k === 2) ? r : r * (1 - depth);
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
}
// a woodcut eye: almond, iris, pupil; `look` = [-1..1, -1..1] gaze, `lid` = 0 open .. 1 shut
function eye(g, x, y, r, look = [0, 0], lid = 0, col = PAL.ink) {
  g.save(); g.translate(x, y);
  const alm = g2 => { g2.beginPath(); g2.moveTo(-r, 0); g2.quadraticCurveTo(0, -r * .95, r, 0); g2.quadraticCurveTo(0, r * .95, -r, 0); g2.closePath(); };
  alm(g); g.fillStyle = PAL.vellum; g.fill(); g.strokeStyle = col; g.lineWidth = Math.max(1.2, r * .12); g.stroke();
  g.save(); alm(g); g.clip();
  g.beginPath(); g.arc(look[0] * r * .4, look[1] * r * .3, r * .48, 0, 6.283); g.fillStyle = col; g.fill();
  g.beginPath(); g.arc(look[0] * r * .4 - r * .12, look[1] * r * .3 - r * .14, r * .12, 0, 6.283); g.fillStyle = PAL.vellum; g.fill();
  if (lid > 0) { g.fillStyle = PAL.vellum; g.fillRect(-r, -r, 2 * r, r * 2 * lid - r * .95 + (r * .95 * (1 - lid))); g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(0, -r * .95 + lid * r * 1.9, r, 0); g.strokeStyle = col; g.lineWidth = Math.max(1.2, r * .12); g.stroke(); }
  g.restore(); g.restore();
}
// text helpers
const FONT = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif";
const font = (size, style = '', weight = '') => `${style} ${weight} ${size}px ${FONT}`.replace(/\s+/g, ' ').trim();
const glyphWidths = new Map();
// letter-spaced caps (running heads, banners); align: 'left' | 'center' | 'right'
function caps(g, text, x, y, size, col = PAL.ink, spacing = 3, align = 'left', weight = '') {
  g.save(); g.font = font(size, '', weight); g.fillStyle = col; g.textBaseline = 'alphabetic';
  const s = String(text).toUpperCase(), key = g.font + '\0' + s;
  let widths = glyphWidths.get(key); if (!widths) { widths = [...s].map(ch => g.measureText(ch).width); glyphWidths.set(key, widths); }
  const w = widths.reduce((sum, width) => sum + width + spacing, -spacing);
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  [...s].forEach((ch, i) => { g.fillText(ch, cx, y); cx += widths[i] + spacing; });
  g.restore(); return w;
}
