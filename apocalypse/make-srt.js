// make-srt.js — writes out/apocalypse-of-peter.srt: subtitles that read the words as they appear on the page.
// Cue text and timing come from the leaves' own SPEC objects (verse, rubric, litany, textAt, revealEnd, t0, t1),
// so the file stays in sync with the film. Run: node apocalypse/make-srt.js  (or npm run srt)
//
// Pacing: the page inks a verse quickly and then holds it while the woodcut plays, so cues are not tied to the
// ink reveal. Each leaf's text (verse chunks, then the rubric) is spread over the leaf's whole reading window
// in proportion to length, with a floor per cue; the litany keeps its fixed trumpet times.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), JS = path.join(__dirname, 'js');
const PLAIN = process.argv.includes('--plain');        // --plain: no <i> tags or pilcrows (for text-to-speech readers)
const OUT = path.join(ROOT, 'out', PLAIN ? 'apocalypse-of-peter-plain.srt' : 'apocalypse-of-peter.srt');

const metadata = require('../lib/apocalypse-data');
const LEAVES = Object.entries(metadata.specs).map(([id, spec]) => ({ id, ...spec }));

// --- helpers ---
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const MAXC = 84, MIN_DUR = 1.2, GAP = .04;              // two lines of ~42 characters; shortest cue; gap between cues
const words = v => v.split(/\s+/).filter(w => w && w !== '|' && w !== '||');
const plain = w => w.replace(/^\^(\d+)/, (_, d) => [...d].map(c => SUP[c]).join(''));
// Break a verse into chunks: a new chunk at each verse number, and within a verse at punctuation when it runs long.
function chunk(ws, maxc = MAXC) {
  const out = []; let cur = [], len = 0;
  const flush = () => { if (cur.length) out.push(cur.join(' ')); cur = []; len = 0; };
  for (const w of ws) {
    if (/^\^\d/.test(w) && cur.length) flush();
    const p = plain(w);
    if (len + p.length + 1 > maxc && cur.length) {
      let cut = -1; for (let k = cur.length - 1; k >= Math.floor(cur.length / 2); k--) if (/[;:,.?!]$/.test(cur[k])) { cut = k; break; }
      if (cut >= 0) { const tail = cur.slice(cut + 1); cur = cur.slice(0, cut + 1); flush(); cur = tail; len = tail.join(' ').length; }
      else flush();
    }
    cur.push(p); len += p.length + 1;
  }
  flush();
  // a short trailing fragment joins the chunk before it when that still fits
  for (let i = out.length - 1; i > 0; i--) if (out[i].length < 22 && out[i - 1].length + out[i].length + 1 <= maxc) { out[i - 1] += ' ' + out[i]; out.splice(i, 1); }
  return out;
}
function wrap(s) {
  const lines = []; let line = '';
  for (const word of s.split(/\s+/)) {
    if (word.length > 46) throw new Error('Subtitle word exceeds 46 characters');
    if (line && line.length + 1 + word.length > 46) { lines.push(line); line = word; }
    else line = line ? line + ' ' + word : word;
  }
  if (line) lines.push(line); return lines.join('\n');
}

const ital = s => PLAIN ? s : '<i>' + s.replace(/\n/g, '</i>\n<i>') + '</i>';
const PIL = PLAIN ? '' : '¶ ';
const rubric = r => chunk(words(PIL + r)).map(c => ital(wrap(c)));   // a long rubric becomes several cues
const ts = t => { const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const cues = [];
const cue = (a, b, text) => { if (b - a < .3) return; cues.push({ a, b, text }); };
// lay a sequence of texts across [a, b] in proportion to their length, each at least MIN_DUR
function lay(a, b, texts) {
  const win = b - a - texts.length * GAP, w = texts.map(t => t.replace(/<[^>]+>/g, '').length + 25), tot = w.reduce((x, y) => x + y, 0);
  let d = w.map(x => win * x / tot);
  if (win >= texts.length * MIN_DUR) {                 // enough room: lift short cues to the floor, take the time from long ones
    const short = d.map(x => x < MIN_DUR), need = short.reduce((s, f, i) => s + (f ? MIN_DUR - d[i] : 0), 0);
    const free = d.reduce((s, x, i) => s + (short[i] ? 0 : x - MIN_DUR), 0);
    d = d.map((x, i) => short[i] ? MIN_DUR : x - (free > 0 ? need * (x - MIN_DUR) / free : 0));
  }
  let t = a; texts.forEach((txt, i) => { cue(t, Math.min(b, t + d[i]), txt); t += d[i] + GAP; });
}

// --- the title leaf's display type (hard-coded in leaf0's custom page) ---
metadata.titleCues.forEach(c => cue(...c));

for (const L of LEAVES) {
  const tin = L.textAt ?? L.t0 + .7, isColo = L.id === 'COLO_SPEC';
  let start = tin;
  if (L.head) { cue(L.t0 - .25, tin + .3, ital(wrap(L.head))); start = tin + .35; }      // the chapter head shows while the page turns
  const end = L.id === 'L7_SPEC' ? metadata.wisdomReadingEnd : L.litany ? L.litany[0].at - GAP : isColo ? L.t1 - .1 : L.t1 - .3;   // the colophon reads to the fade
  const maxc = isColo ? 126 : MAXC;                                                  // the colophon is dense: allow three-line cues
  const texts = L.verse ? chunk(words(L.verse), maxc).map(wrap) : [];
  if (L.rubric && !L.litany) texts.push(...chunk(words(PIL + L.rubric), maxc).map(c => ital(wrap(c))));
  lay(start, end, texts);
  if (L.litany) L.litany.forEach((e, k) => { const b = k + 1 < L.litany.length ? L.litany[k + 1].at - GAP : L.t1 - .3; cue(e.at, b, wrap(e.line) + (e.rubric ? `\n${ital(PIL + e.rubric)}` : '')); });
  if (L.id === 'L7_SPEC') metadata.wisdomCues.forEach(c => cue(...c));
}

// --- write, with a reading-speed report ---
cues.sort((x, y) => x.a - y.a);
for (let i = 1; i < cues.length; i++) if (cues[i].a < cues[i - 1].b) cues[i - 1].b = cues[i].a - GAP;   // never overlap
for (let i = 0; i < cues.length; i++) {
  const c = cues[i], lines = c.text.replace(/<[^>]+>/g, '').split('\n');
  if (!(c.a >= 0 && c.b > c.a && c.b <= 130) || (i && c.a < cues[i - 1].b) || lines.some(l => l.length > 46)) throw new Error('Invalid subtitle cue ' + (i + 1));
  if (lines.length > 3) throw new Error('Subtitle cue exceeds three lines: ' + (i + 1));
}
const srt = cues.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.text}\n`).join('\n');
if (!process.argv.includes('--check')) { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, '\uFEFF' + srt, 'utf8'); }
const cps = c => c.text.replace(/<[^>]+>/g, '').replace(/\n/g, ' ').length / (c.b - c.a);
const fast = cues.filter(c => cps(c) > 32);
console.log(`${cues.length} cues → ${path.relative(ROOT, OUT)}; shortest ${Math.min(...cues.map(c => c.b - c.a)).toFixed(2)} s; median pace ${cues.map(cps).sort((x, y) => x - y)[cues.length >> 1].toFixed(0)} chars/s`);
if (fast.length) { console.log(`brisk cues (>32 chars/s):`); for (const c of fast) console.log(`  ${ts(c.a)} ${cps(c).toFixed(0)} cps  ${c.text.replace(/<[^>]+>/g, '').replace(/\n/g, ' / ').slice(0, 70)}`); }

if (process.argv.includes('--strict') && fast.length) process.exitCode = 1;
