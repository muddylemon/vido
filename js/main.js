// main.js — deterministic timeline, scene transitions, print/film post-processing, autoplay.
'use strict';
const cv = document.getElementById('film'), ctx = cv.getContext('2d');
cv.width = W; cv.height = H;
const LAYER = mk(W, H), lctx = LAYER.getContext('2d');
let VIGNETTE, PAPER_PATTERN;

function init() {
  initTextures();
  PAPER_PATTERN = ctx.createPattern(PAPER, 'repeat');
  buildScene1(); buildPipe(); buildBlood(); buildDoor(); buildHand(); buildEngine(); buildGent();
  planKeys();
  VIGNETTE = mk(W, H); const v = VIGNETTE.getContext('2d');
  const gr = v.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .72);
  gr.addColorStop(0, 'rgba(40,22,8,0)'); gr.addColorStop(1, 'rgba(40,22,8,.62)'); v.fillStyle = gr; v.fillRect(0, 0, W, H);
}

function drawScenes(g, t) {
  if (t < T1_END) {
    scene1(g, t);
    const x = seg(t, T1_END - .07, T1_END);
    if (x > 0) { g.save(); g.globalAlpha = x; scene2(g, T1_END); g.restore(); }
  } else if (t < T2_END) {
    const irisK = seg(t, 2.44, T2_END);
    if (irisK <= 0) scene2(g, t);
    else {
      scene345(g, t);
      lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, W, H);
      scene2(lctx, t);
      lctx.globalCompositeOperation = 'destination-out';
      const r = 900 * eIn(irisK);
      lctx.beginPath(); for (let i = 0; i <= 36; i++) { const a = i / 36 * 6.283, rr = r * (1 + (hash(i) - .5) * .12); lctx.lineTo(640 + Math.cos(a) * rr, 360 + Math.sin(a) * rr); } lctx.fill();
      lctx.globalCompositeOperation = 'source-over';
      g.drawImage(LAYER, 0, 0);
    }
  } else if (t < T6_END) {
    scene345(g, t);
    const x = seg(t, T6_END - .06, T6_END);
    if (x > 0) { g.save(); g.globalAlpha = x; scene78(g, T6_END); g.restore(); }
  } else scene78(g, t);
}

function renderAt(t) {
  const f = Math.round(t * FPS);
  seed(10000);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t >= DURATION || t < 0) return;                       // hard cut
  // gate weave: the whole print jiggles a hair, as if on an old projector
  const wx = (hash(f * 1.7) - .5) * 2.2, wy = (hash(f * 3.1) - .5) * 2.2;
  ctx.save(); ctx.translate(640 + wx, 360 + wy); ctx.scale(1.012, 1.012); ctx.translate(-640, -360);
  drawScenes(ctx, t);
  ctx.restore();
  // printed-page tooth, faded ink, vignette, flicker, grain
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .42;
  const p = PAPER_PATTERN; p.setTransform(new DOMMatrix().translateSelf(Math.floor(f / 3) % 2 * 3, 0)); ctx.fillStyle = p; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1; ctx.fillStyle = 'rgb(250,238,214)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(VIGNETTE, 0, 0);
  ctx.globalAlpha = .035 + hash(f * 5.3) * .045; ctx.fillStyle = '#1a1008'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1; ctx.drawImage(FILM[f % FILM.length], 0, 0, W, H);
  if (hash(f * 9.1) > .8) { ctx.globalAlpha = .25; ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 1; const x = hash(f) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 3, H); ctx.stroke(); }   // scratch
  ctx.restore();
}

init();
Vido.boot('metabolic', cv, renderAt);
