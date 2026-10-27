// book.js — the open book: desk, vellum pages, letterpress typesetting with word-by-word ink
// reveal, woodcut drop caps, running heads, rubrics, the litany, the woodcut panel frame/clip,
// the page turn, and the print post-processing. Leaves call book.spread().
'use strict';
const SP = {};                                    // sprite namespace: SP.common, SP.l0 … SP.l7
const BOOK = {
  L: { x: 40, y: 24, w: 596, h: 672 }, R: { x: 644, y: 24, w: 596, h: 672 }, gutter: 640,
  text: { x: 92, y: 112, w: 496, size: 25, lh: 34 },
  headY: 78,
  panel: { x: 684, y: 64, w: 516, h: 592 },      // outer double rule
  inner: { x: 690, y: 70, w: 504, h: 580 }       // the art is clipped to this
};
const MG = mk(8, 8).getContext('2d');             // measuring context
let DESK, VIGNETTE, CANDLE, PREV, NEXT, FRAMECOPY;
let previousTurn = null;
const paperPatterns = new WeakMap();
const headWidths = new Map();

function buildBook() {
  // --- desk + both pages, rendered once ---
  DESK = mk(W, H); const g = DESK.getContext('2d');
  seed(3);
  g.fillStyle = PAL.desk; g.fillRect(0, 0, W, H);
  g.globalAlpha = .18; const p = g.createPattern(GRAIN, 'repeat'); g.fillStyle = p; g.globalCompositeOperation = 'multiply'; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // cloth weave
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1;
  for (let y = 0; y < H; y += 3) { g.beginPath(); g.moveTo(0, y + rnd(-.5, .5)); g.lineTo(W, y + rnd(-.5, .5)); g.stroke(); }
  // the book block: a dark leather edge beneath the pages
  g.fillStyle = '#120c08'; roughRect(g, 30, 16, 1220, 690, 2); g.fill();
  // page stack edges (a few lines of the other leaves beneath)
  for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(232,220,192,${.35 - i * .05})`; g.lineWidth = 1; g.beginPath(); g.moveTo(42 - i * 1.5, 697 + i * 1.6); g.lineTo(636, 697 + i * 1.6); g.moveTo(644, 697 + i * 1.6); g.lineTo(1238 + i * 1.5, 697 + i * 1.6); g.stroke(); }
  for (const P of [BOOK.L, BOOK.R]) {
    const left = P === BOOK.L;
    const gr = g.createLinearGradient(left ? P.x : P.x + P.w, 0, left ? P.x + P.w : P.x, 0);
    gr.addColorStop(0, PAL.vellum); gr.addColorStop(.82, PAL.vellum); gr.addColorStop(.97, PAL.vellum2); gr.addColorStop(1, PAL.vellum3);
    g.fillStyle = gr; roughRect(g, P.x, P.y, P.w, P.h, 1.2); g.fill();
    g.save(); roughRect(g, P.x, P.y, P.w, P.h, 1.2); g.clip();
    g.globalCompositeOperation = 'multiply'; grainFill(g, W, H, PAPER, .75);
    // faint show-through of the printing on the other side of the leaf
    g.globalAlpha = .022; g.fillStyle = PAL.ink;
    for (let y = P.y + 90; y < P.y + P.h - 80; y += 34) { const w = rnd(300, 470); g.fillRect(left ? P.x + 80 : P.x + P.w - 80 - w, y, w, 9); }
    g.restore();
  }
  // gutter shadow
  const gs = g.createLinearGradient(BOOK.gutter - 70, 0, BOOK.gutter + 70, 0);
  gs.addColorStop(0, 'rgba(30,18,8,0)'); gs.addColorStop(.45, 'rgba(30,18,8,.45)'); gs.addColorStop(.5, 'rgba(30,18,8,.7)'); gs.addColorStop(.55, 'rgba(30,18,8,.45)'); gs.addColorStop(1, 'rgba(30,18,8,0)');
  g.fillStyle = gs; g.fillRect(BOOK.gutter - 70, 16, 140, 690);
  // --- candle vignette ---
  VIGNETTE = mk(W, H); const v = VIGNETTE.getContext('2d');
  const vg = v.createRadialGradient(640, 300, 260, 640, 360, 900);
  vg.addColorStop(0, 'rgba(30,16,6,0)'); vg.addColorStop(.6, 'rgba(30,16,6,.25)'); vg.addColorStop(1, 'rgba(30,16,6,.8)'); v.fillStyle = vg; v.fillRect(0, 0, W, H);
  CANDLE = mk(W, H); const c = CANDLE.getContext('2d');
  const cg = c.createRadialGradient(640, 260, 0, 640, 300, 700);
  cg.addColorStop(0, 'rgba(255,214,140,.5)'); cg.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = cg; c.fillRect(0, 0, W, H);
  PREV = mk(W, H); NEXT = mk(W, H); FRAMECOPY = mk(W, H);
}

// ---------------- typesetting ----------------
// Markup: "^3" before a word = vermilion superscript verse number; "|" = line break; "||" = paragraph break.
function typeset(text, o) {
  const size = o.size ?? BOOK.text.size, lh = o.lh ?? BOOK.text.lh, w = o.w ?? BOOK.text.w, x0 = o.x ?? BOOK.text.x, y0 = o.y ?? BOOK.text.y;
  MG.font = font(size, o.italic ? 'italic' : '', o.weight || '');
  const space = MG.measureText(' ').width;
  const capW = o.dropCap ? lh * 3 - 8 + 14 : 0, capLines = o.dropCap ? 3 : 0;
  const words = [], lines = [];
  let line = 0, x = x0 + (capLines ? capW : 0), tokens = text.split(/\s+/).filter(Boolean), first = true;
  const lineStart = l => x0 + (l < capLines ? capW : 0), lineW = l => w - (l < capLines ? capW : 0);
  let lineWords = [];
  const flush = () => { lines.push(lineWords); lineWords = []; };
  for (let tk of tokens) {
    if (tk === '|' || tk === '||') { flush(); line += tk === '||' ? 1.5 : 1; x = lineStart(line); continue; }
    let num = null; const m = tk.match(/^\^(\d+)(.*)$/); if (m) { num = m[1]; tk = m[2]; }
    let s = tk; if (first && o.dropCap) { s = tk.slice(1); words.cap = tk[0]; }
    MG.font = font(size * .58); const nw = num ? MG.measureText(num).width + 2 : 0;
    MG.font = font(size, o.italic ? 'italic' : '', o.weight || '');
    const ww = MG.measureText(s).width + nw;
    if (x + ww > lineStart(line) + lineW(line) + .5 && lineWords.length) { flush(); line++; x = lineStart(line); }
    const wd = { s, num, x, y: y0 + line * lh, w: ww, nw, line, i: words.length };
    words.push(wd); lineWords.push(wd); x += ww + space; first = false;
  }
  flush();
  const lastLine = words.length ? words[words.length - 1].line : 0;
  return { words, lines, x: x0, y: y0, size, lh, italic: o.italic, weight: o.weight, color: o.color || PAL.ink, dropCap: o.dropCap, height: (lastLine + 1) * lh, align: o.align, w, capW };
}
// right-align / centre a layout after the fact (single-page flourishes: titles, colophon)
function alignLayout(L, how) {
  for (const ln of L.lines) { if (!ln.length) continue; const l = ln[0].x, r = ln[ln.length - 1].x + ln[ln.length - 1].w, lw = r - l, dx = how === 'center' ? (L.x + L.w / 2) - (l + lw / 2) : (L.x + L.w) - r; for (const wd of ln) wd.x += dx; }
  return L;
}
// Draw the layout with words revealing between t0..t1 (absolute seconds). Words appear in order,
// each over .18 s with a wet ink bloom. t1 <= t0 draws everything at once.
function drawText(g, L, t, t0 = -1, t1 = -1) {
  if (!L) return;
  const n = L.words.length, span = Math.max(0, t1 - t0), per = n > 1 ? span / (n - 1) : 0;
  g.save(); g.textBaseline = 'alphabetic';
  if (L.dropCap && L.words.cap) {
    const a = t1 > t0 ? seg(t, t0 - .35, t0 + .15) : 1;
    if (a > 0) dropCap(g, L.words.cap, L.x, L.y - L.lh + 9, L.lh * 3 - 8, a);
  }
  for (const wd of L.words) {
    const ti = t0 + wd.i * per, a = t1 > t0 ? seg(t, ti, ti + .18) : 1;
    if (a <= 0) { if (t1 > t0) break; }
    g.globalAlpha = a;
    if (wd.num) { g.font = font(L.size * .58); g.fillStyle = PAL.vermilion; g.fillText(wd.num, wd.x, wd.y - L.size * .42); }
    g.font = font(L.size, L.italic ? 'italic' : '', L.weight || ''); g.fillStyle = L.color;
    const nx = wd.x + (wd.num ? wd.nw : 0);
    g.font = font(L.size, L.italic ? 'italic' : '', L.weight || '');
    if (a < 1) {                                   // wet bloom: a blurred, heavier print of the word that dries away
      g.save(); g.globalAlpha = (1 - a) * .55; g.filter = 'blur(1.2px)'; g.lineWidth = 1.4; g.strokeStyle = L.color; g.strokeText(wd.s, nx, wd.y); g.restore();
    }
    g.fillText(wd.s, nx, wd.y);
  }
  g.restore();
}
// woodcut initial: vellum letter on a lampblack ground with a vine
function dropCap(g, letter, x, y, size, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y);
  seed(letter.charCodeAt(0));
  g.fillStyle = PAL.ink; roughRect(g, 0, 0, size, size, 1.5); g.fill();
  g.strokeStyle = PAL.vellum; g.lineWidth = 1.2; g.strokeRect(5, 5, size - 10, size - 10);
  // vine: a curling stem through the box behind the letter
  g.strokeStyle = 'rgba(232,220,192,.55)'; g.lineWidth = 1.6; g.beginPath();
  g.moveTo(8, size - 10); g.bezierCurveTo(size * .3, size * .9, size * .1, size * .3, size * .5, size * .25); g.bezierCurveTo(size * .8, size * .2, size * .9, size * .5, size - 8, size * .35); g.stroke();
  for (let i = 0; i < 6; i++) { const px = 10 + i * (size - 20) / 5, py = size * (.3 + .5 * hash(i + 3)); g.beginPath(); g.ellipse(px, py, 5, 2.6, i * .9, 0, 6.283); g.fillStyle = 'rgba(232,220,192,.55)'; g.fill(); }
  g.font = font(size * .86, '', 'bold'); g.textBaseline = 'alphabetic'; g.textAlign = 'center';
  g.fillStyle = PAL.vellum; g.fillText(letter, size / 2, size * .83);
  g.lineWidth = 1; g.strokeStyle = PAL.ink; g.strokeText(letter, size / 2, size * .83);
  g.restore();
}
// running head: letter-spaced vermilion caps centred over the text block
function runningHead(g, text, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha = a;
  // shrink long heads until they fit the text block
  const cached = headWidths.get(text);
  let { size, sp } = cached || { size: 16, sp: 3.2 }; let w;
  if (!cached) for (;;) { MG.font = font(size); w = 0; for (const ch of String(text).toUpperCase()) w += MG.measureText(ch).width + sp; if (w <= BOOK.text.w || size <= 11) break; size -= .5; sp = Math.max(1.4, sp - .2); }
  headWidths.set(text, { size, sp });
  caps(g, text, BOOK.text.x + BOOK.text.w / 2, BOOK.headY, size, PAL.vermilion, sp, 'center');
  const y = BOOK.headY + 9; g.strokeStyle = PAL.vermilion; g.lineWidth = .8; g.beginPath(); g.moveTo(BOOK.text.x + 60, y); g.lineTo(BOOK.text.x + BOOK.text.w - 60, y); g.stroke();
  g.restore();
}
// a rubric layout: ¶ italic vermilion, anchored to the bottom of the page
function rubricLayout(text, yBottom = BOOK.L.y + BOOK.L.h - 52, size = 21) {
  const L = typeset('¶ ' + text, { size, lh: size * 1.32, italic: true, color: PAL.vermilion, y: 0 });
  const dy = yBottom - L.height; for (const wd of L.words) wd.y += dy; L.y = dy; return L;
}

// ---------------- woodcut banners & ribbons (shared decoration) ----------------
// a forked ribbon with letter-spaced caps; w is the body width, fill vellum, text lampblack by default
function ribbon(g, x, y, w, h, text, o = {}) {
  const fill = o.fill || PAL.vellum, col = o.col || PAL.ink, fk = h * .55;
  g.save(); g.translate(x, y);
  const body = g2 => { g2.beginPath(); g2.moveTo(-w / 2, -h / 2); g2.lineTo(w / 2, -h / 2); g2.lineTo(w / 2, h / 2); g2.lineTo(-w / 2, h / 2); g2.closePath(); };
  // tails
  for (const s of [-1, 1]) {
    const tail = g2 => { g2.beginPath(); g2.moveTo(s * w / 2, -h / 2 + 4); g2.lineTo(s * (w / 2 + fk + 10), -h / 2 + 6); g2.lineTo(s * (w / 2 + fk - 2), 2); g2.lineTo(s * (w / 2 + fk + 10), h / 2 + 2); g2.lineTo(s * w / 2, h / 2 + 8); g2.closePath(); };
    ink(g, tail, o.tailFill || PAL.vellum2, 2); hatch(g, tail, .3, 4, .8, PAL.ink, [-w, -h, w, h], .5);
  }
  ink(g, body, fill, 2.2);
  if (o.lines !== false) { g.strokeStyle = col; g.lineWidth = .8; g.beginPath(); g.moveTo(-w / 2 + 6, -h / 2 + 5); g.lineTo(w / 2 - 6, -h / 2 + 5); g.moveTo(-w / 2 + 6, h / 2 - 5); g.lineTo(w / 2 - 6, h / 2 - 5); g.stroke(); }
  caps(g, text, 0, h * .3, o.size || h * .5, col, o.spacing ?? 3, 'center', 'bold');
  g.restore();
}

// ---------------- the spread ----------------
// spec: { head, verse (markup), rubric, litany?: [{line, rubric, at}], t0, t1, revealEnd, overflow?(t),
//         custom?(g,t), verseY?, noFrame? }. draw(g, p) paints the woodcut; p = inner rect.
function prepareSpec(spec) {
  if (spec._L) return spec;
  if (spec.verse) spec._L = typeset(spec.verse, { dropCap: spec.dropCap !== false, y: spec.verseY || BOOK.text.y });
  if (spec.rubric) spec._R = rubricLayout(spec.rubric);
  if (spec.litany) {
    let y = (spec._L ? spec._L.y + spec._L.height : BOOK.text.y) + 14;
    for (const e of spec.litany) { e._L = typeset(e.line, { size: 22, lh: 30, y, x: BOOK.text.x + 22, w: BOOK.text.w - 22 }); y += e._L.height + 6; if (e.rubric) e._R = rubricLayout(e.rubric); }
  }
  return spec;
}
function leftPage(g, t, spec) {
  prepareSpec(spec);
  const tin = spec.textAt ?? spec.t0 + .7;                     // text starts once the page has turned
  if (spec.head) runningHead(g, spec.head, seg(t, tin - .2, tin + .3));
  if (spec._L) drawText(g, spec._L, t, tin, spec.revealEnd);
  if (spec.litany) {
    let cur = null;
    for (const e of spec.litany) { if (t >= e.at) cur = e; drawText(g, e._L, t, e.at, e.at + .9); }
    if (cur && cur._R) { g.save(); g.globalAlpha = seg(t, cur.at + .5, cur.at + .9); drawText(g, cur._R, t); g.restore(); }
    else if (spec._R) drawText(g, spec._R, t, spec.revealEnd + .3, spec.revealEnd + 1.6);
  } else if (spec._R) drawText(g, spec._R, t, spec.revealEnd + .3, spec.revealEnd + 1.6);
  if (spec.custom) spec.custom(g, t);
}
function panelFrame(g, a = 1) {
  const P = BOOK.panel; g.save(); g.globalAlpha = a; g.strokeStyle = PAL.ink; g.lineJoin = 'miter';
  g.lineWidth = 3; g.strokeRect(P.x, P.y, P.w, P.h); g.lineWidth = 1; g.strokeRect(P.x + 5, P.y + 5, P.w - 10, P.h - 10); g.restore();
}
function spread(g, t, spec, draw) {
  g.drawImage(DESK, 0, 0);
  leftPage(g, t, spec);
  const over = spec.overflow && spec.overflow(t);
  g.save();
  if (!over) { const I = BOOK.inner; g.beginPath(); g.rect(I.x, I.y, I.w, I.h); g.clip(); }
  if (draw) draw(g, BOOK.inner, t);
  g.restore();
  if (!spec.noFrame) panelFrame(g);
}
// a bare page (title verso, colophon): desk + pages, no frame
function bare(g) { g.drawImage(DESK, 0, 0); }
// clip to the panel's inner rect (for leaves drawing with overflow on: clip the scene, then draw the
// overflowing element unclipped after g.restore())
function clipInner(g) { const I = BOOK.inner; g.beginPath(); g.rect(I.x, I.y, I.w, I.h); g.clip(); }

// ---------------- the page turn ----------------
// k 0..1; drawPrev/drawNext paint whole spreads. The old recto folds over the gutter and lands as the new verso.
function pageTurn(g, k, drawPrev, drawNext, key) {
  const pc = PREV.getContext('2d'), nc = NEXT.getContext('2d');
  pc.setTransform(1, 0, 0, 1, 0, 0); nc.setTransform(1, 0, 0, 1, 0, 0); pc.globalAlpha = nc.globalAlpha = 1;
  if (previousTurn !== key) { drawPrev(pc); previousTurn = key; }
  drawNext(nc);
  const ke = eIO(k), G = BOOK.gutter;
  g.drawImage(NEXT, 0, 0);
  if (ke < .5) {
    const s = 1 - ke * 2, wdt = (W - G) * s;
    g.drawImage(PREV, 0, 0, G, H, 0, 0, G, H);              // the old verso stays until the leaf lands on it
    // shadow cast on the new recto
    const sh = g.createLinearGradient(G + wdt, 0, G + wdt + 90, 0); sh.addColorStop(0, 'rgba(20,12,6,.45)'); sh.addColorStop(1, 'rgba(20,12,6,0)');
    g.fillStyle = sh; g.fillRect(G + wdt, 16, 100, 690);
    g.drawImage(PREV, G, 0, W - G, H, G, 0, wdt, H);
    const fold = g.createLinearGradient(G, 0, G + wdt, 0); fold.addColorStop(0, `rgba(20,12,6,${.5 * (1 - s)})`); fold.addColorStop(1, 'rgba(20,12,6,0)');
    g.fillStyle = fold; g.fillRect(G, 16, wdt, 690);
  } else {
    const s = (ke - .5) * 2, wdt = G * s;
    g.drawImage(PREV, 0, 0, G, H, 0, 0, G, H);              // the old verso is still showing beneath
    const sh = g.createLinearGradient(G - wdt, 0, G - wdt - 90, 0); sh.addColorStop(0, 'rgba(20,12,6,.45)'); sh.addColorStop(1, 'rgba(20,12,6,0)');
    g.fillStyle = sh; g.fillRect(G - wdt - 100, 16, 100, 690);
    g.drawImage(NEXT, 0, 0, G, H, G - wdt, 0, wdt, H);
    const fold = g.createLinearGradient(G, 0, G - wdt, 0); fold.addColorStop(0, `rgba(20,12,6,${.5 * (1 - s)})`); fold.addColorStop(1, 'rgba(20,12,6,0)');
    g.fillStyle = fold; g.fillRect(G - wdt, 16, wdt, 690);
  }
}

// ---------------- print post-processing ----------------
function post(ctx, cv, f) {
  ctx.save();
  // slipped impression: the whole print doubled a hair to the right
  const fc = FRAMECOPY.getContext('2d'); fc.globalCompositeOperation = 'source-over'; fc.globalAlpha = 1; fc.drawImage(cv, 0, 0);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .1; ctx.drawImage(FRAMECOPY, 1.2, .6);
  // paper tooth
  ctx.globalAlpha = .16; let p = paperPatterns.get(ctx); if (!p) { p = ctx.createPattern(PAPER, 'repeat'); paperPatterns.set(ctx, p); } p.setTransform(new DOMMatrix().translateSelf(Math.floor(f / 4) % 3 * 5, 0)); ctx.fillStyle = p; ctx.fillRect(0, 0, W, H);
  // candlelight: warm pool and breathing vignette
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .55 + hash(f * 2.3) * .06; ctx.drawImage(VIGNETTE, 0, 0);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .07 + hash(f * 5.3) * .05 + Math.sin(f * .21) * .015; ctx.drawImage(CANDLE, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(FILM[f % FILM.length], 0, 0, W, H);
  ctx.restore();
}
