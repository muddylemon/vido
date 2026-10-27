// main.js — the timeline of leaves, page turns, post, and the ?t= / ?record / autoplay drivers.
'use strict';
const cv = document.getElementById('film'), ctx = cv.getContext('2d');
cv.width = W; cv.height = H;
const TURN = .7;                                           // seconds the recto takes to fold over

// Global timeline (seconds). Each leaf's draw(g, t) paints the whole spread for global time t.
const TIMELINE = [leaf0, leaf1, leaf2, leaf3, leaf4, leaf5, leaf6, leaf7, colophon].map((draw, i) => {
  const id = i === 8 ? 'COLO_SPEC' : 'L' + i + '_SPEC';
  const { t0, t1 } = VIDO_APOCALYPSE.specs[id]; return { id, t0, t1, draw };
});

function init() {
  initTextures(); buildBook();
  buildCommon();
  const builds = [buildLeaf0, buildLeaf1, buildLeaf2, buildLeaf3, buildLeaf4, buildLeaf5, buildLeaf6, buildLeaf7, buildColophon];
  builds.forEach((b, i) => { try { if (typeof b === 'function') b(); } catch (e) { TIMELINE[i].broken = e; if (Vido.strict) throw e; console.error('build failed for leaf', TIMELINE[i].id, e); } });
}
function leafAt(t) { let L = TIMELINE[0]; for (const e of TIMELINE) if (t >= e.t0) L = e; return L; }
// a leaf that throws paints its error on the page instead of taking the whole book down
function safeDraw(L, g, t) {
  try { seed(10000 + TIMELINE.indexOf(L)); if (L.broken) throw L.broken; L.draw(g, t); }
  catch (e) {
    if (Vido.strict) throw new Error(`${L.id}: ${e.message}`);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; bare(g); panelFrame(g);
    g.font = font(18); g.fillStyle = PAL.vermilion; g.textAlign = 'left';
    const msg = `${L.id}: ${e && e.message || e}`; for (let i = 0; i * 44 < msg.length; i++) g.fillText(msg.slice(i * 44, i * 44 + 44), 700, 120 + i * 24);
    if (!L._logged) { L._logged = true; console.error('draw failed for leaf', L.id, e); }
  }
}
function drawAt(g, t) {
  const i = TIMELINE.indexOf(leafAt(t)), L = TIMELINE[i];
  const k = i > 0 ? seg(t, L.t0, L.t0 + TURN) : 1;
  if (k >= 1 || L.noTurn) safeDraw(L, g, t);
  else pageTurn(g, k, pg => safeDraw(TIMELINE[i - 1], pg, L.t0 - 1 / FPS), ng => safeDraw(L, ng, t), i);
}

function renderAt(t) {
  const f = Math.round(t * FPS);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t >= DURATION || t < 0) return;
  drawAt(ctx, t);
  post(ctx, cv, f);
  // fade from and to the dark at the very ends
  const fade = Math.min(seg(t, 0, 1.2), 1 - seg(t, DURATION - 2, DURATION - .2));
  if (fade < 1) { ctx.globalAlpha = 1 - fade; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

init();
Vido.boot('apocalypse', cv, renderAt);
