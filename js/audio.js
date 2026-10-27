// audio.js — a deterministic, fully synthesized music-hall soundtrack + foley for the film.
// Pure JS DSP (no Web Audio needed): works in the browser (played via AudioBuffer) and in Node
// (written to WAV and muxed into the MP4). Every cue is pinned to the visual timeline in seconds.
(function (root) {
  'use strict';
  function renderSoundtrack(SR = 44100, DUR = 10) {
    const N = Math.round(SR * DUR), TAU = Math.PI * 2;
    const M = [new Float32Array(N), new Float32Array(N)];   // music bus
    const S = [new Float32Array(N), new Float32Array(N)];   // foley bus
    let seed = 20260924;
    const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const noise = () => rnd() * 2 - 1;
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const env = (t, len, a = .005, r = .04) => t < a ? t / a : t > len - r ? Math.max(0, (len - t) / r) : 1;
    // write a voice: fn(t) → sample, t in seconds since voice start
    function voice(bus, t0, len, fn, pan = 0, gain = 1) {
      const s0 = Math.round(t0 * SR), n = Math.round(len * SR);
      const gl = Math.cos((pan + 1) * Math.PI / 4) * gain * 1.414, gr = Math.sin((pan + 1) * Math.PI / 4) * gain * 1.414;
      for (let i = 0; i < n; i++) { const k = s0 + i; if (k >= N) break; const v = fn(i / SR); if (k >= 0) { bus[0][k] += v * gl; bus[1][k] += v * gr; } }
    }
    // Chamberlin state-variable filter; mode 0=lp 1=bp 2=hp
    function svf(mode) {
      let lp = 0, bp = 0;
      return (x, fc, q = .7) => {
        const f = 2 * Math.sin(Math.PI * Math.min(fc, SR / 7) / SR);
        const hp = x - lp - q * bp; bp += f * hp; lp += f * bp;
        return mode === 0 ? lp : mode === 1 ? bp : hp;
      };
    }

    // ---------------- instruments ----------------
    const ORGAN = [1, .55, .38, .22, .14, .09, .05];
    function organ(t0, dur, m, vel = .1, pan = 0, bright = 1) {
      const f = mtof(m); let ph = 0; const len = dur + .07, br = svf(1);
      voice(M, t0, len, t => {
        const vib = t > .08 ? 1 + .0045 * Math.sin(TAU * 5.8 * t) : 1;
        ph += TAU * f * vib / SR; let s = 0;
        for (let h = 0; h < ORGAN.length; h++) s += Math.sin(ph * (h + 1)) * ORGAN[h] * (h > 2 ? bright : 1);
        return (s * .5 + br(noise(), f * 2, 2) * .08) * env(t, len, .008, .06) * vel;   // calliope breath
      }, pan);
    }
    function tuba(t0, dur, m, vel = .3, pan = -.15, scoop = .35) {
      const f = mtof(m); let ph = 0; const len = dur + .08;
      voice(M, t0, len, t => {
        const bend = Math.pow(2, -scoop * Math.exp(-t * 30) / 12) * (1 + .006 * Math.sin(TAU * 5 * t) * Math.min(1, t * 4));
        ph += TAU * f * bend / SR; let s = 0;
        for (let h = 1; h <= 9; h++) s += Math.sin(ph * h) / Math.pow(h, 1.35) * (h === 1 ? 1.2 : 1);
        return s * .45 * env(t, len, .025, .07) * vel;
      }, pan);
    }
    function pluck(t0, m, vel = .2, pan = 0, dec = 5) {
      const f = mtof(m); let ph = 0;
      voice(M, t0, .9, t => { ph += TAU * f / SR; let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(ph * h) / h * Math.exp(-t * (dec + h * 3)); return s * vel * Math.min(1, t * 400); }, pan);
    }
    function bell(bus, t0, f, vel = .2, dec = 6, pan = 0) {
      const P = [[1, 1], [2.76, .5], [5.4, .28], [8.93, .14]];
      voice(bus, t0, Math.min(3, 7 / dec), t => { let s = 0; for (const [r, a] of P) s += Math.sin(TAU * f * r * t) * a * Math.exp(-t * dec * (1 + r * .3)); return s * vel * Math.min(1, t * 2000); }, pan);
    }
    function kick(t0, vel = .5) { let ph = 0; voice(M, t0, .35, t => { ph += TAU * (45 + 70 * Math.exp(-t * 30)) / SR; return Math.sin(ph) * Math.exp(-t * 9) * vel; }); }
    function snare(t0, vel = .18, pan = .1) { const bp = svf(1); voice(M, t0, .2, t => (bp(noise(), 2400, .8) * 1.4 + Math.sin(TAU * 190 * t) * .4 * Math.exp(-t * 30)) * Math.exp(-t * 18) * vel, pan); }
    function cymbal(bus, t0, vel = .25, dec = 2.2) { const hp = svf(2); voice(bus, t0, 2.5, t => (hp(noise(), 6000, .5) + Math.sin(TAU * 3320 * t) * .15 * Math.exp(-t * 4)) * Math.exp(-t * dec) * vel * Math.min(1, t * 800), .25); }
    function timpRoll(t0, len, m, v0, v1) {
      const f = mtof(m);
      for (let t = 0; t < len; t += .045) { const v = v0 + (v1 - v0) * (t / len); voice(M, t0 + t, .3, u => (Math.sin(TAU * f * u) + .3 * Math.sin(TAU * f * 1.5 * u)) * Math.exp(-u * 10) * v * (.8 + rnd() * .4), -.2); }
    }
    function chord(t0, dur, ms, vel, bright = 1) { ms.forEach((m, i) => organ(t0, dur, m, vel, (i - ms.length / 2) * .25, bright)); }
    function oompah(t0, t1, root, fifth, triad, E) {         // alternating bass & staccato "pah" chord on eighths
      let k = 0;
      for (let t = t0; t < t1 - .02; t += E, k++) {
        if (k % 2 === 0) { tuba(t, E * .8, k % 4 === 0 ? root : fifth, .32); kick(t, .22); }
        else { chord(t, E * .45, triad, .045); snare(t, .07); }
      }
    }

    // ---------------- foley ----------------
    function whoosh(t0, len, f0, f1, vel = .2, pan = 0, q = 1.2) {
      const bp = svf(1); voice(S, t0, len, t => { const k = t / len; return bp(noise(), f0 * Math.pow(f1 / f0, k), q) * Math.sin(Math.PI * k) * vel; }, pan);
    }
    function slide(t0, len, f0, f1, vel = .12, pan = 0) {
      let ph = 0; const bp = svf(1);
      voice(S, t0, len, t => { const k = t / len, f = f0 * Math.pow(f1 / f0, k) * (1 + .01 * Math.sin(TAU * 7 * t)); ph += TAU * f / SR; return (Math.sin(ph) + bp(noise(), f, 3) * .25) * env(t, len, .02, .05) * vel; }, pan);
    }
    function creak(t0, len, fc = 1100, vel = .25, pan = 0) {
      let ph = 0; const bp = svf(1), bp2 = svf(1);
      voice(S, t0, len, t => {
        const rate = 38 + 30 * Math.sin(t * 23) + 20 * Math.sin(t * 61); ph += rate / SR; const imp = ph >= 1 ? (ph -= 1, 1) : 0;
        return (bp(imp * 6, fc, .08) + bp2(imp * 3, fc * 1.9, .1)) * env(t, len, .01, .04) * vel;
      }, pan);
    }
    function thud(t0, f = 90, vel = .4, pan = 0) { let ph = 0; const lp = svf(0); voice(S, t0, .4, t => { ph += TAU * f * (1 - .5 * Math.min(1, t * 8)) / SR; return (Math.sin(ph) + lp(noise(), 500) * 1.2) * Math.exp(-t * 14) * vel; }, pan); }
    function clunk(t0, vel = .5, pan = 0) { thud(t0, 85, vel, pan); [430, 1130, 1790, 2610].forEach((f, i) => voice(S, t0, .5, t => Math.sin(TAU * f * t) * Math.exp(-t * (10 + i * 5)) * vel * .25 / (i + 1), pan)); }
    function clink(t0, vel = .07, pan = 0) { bell(S, t0, 2200 + rnd() * 2600, vel, 28 + rnd() * 20, pan); }
    function honk(t0, f = 420, vel = .22, pan = 0) {
      let ph = 0; const bp = svf(1);
      voice(S, t0, .16, t => { ph += f * (1 - .12 * t / .16) / SR; const pulse = (ph % 1) < .28 ? 1 : -.4; return bp(pulse, 1000, .5) * env(t, .16, .008, .05) * vel; }, pan);
    }
    function pop(t0, f0 = 350, f1 = 1500, vel = .3, pan = 0) { let ph = 0; voice(S, t0, .06, t => { ph += TAU * f0 * Math.pow(f1 / f0, t / .06) / SR; return Math.sin(ph) * env(t, .06, .002, .03) * vel; }, pan); }
    function chuff(t0, vel = .25) { const bp = svf(1), lp = svf(0); voice(S, t0, .2, t => (bp(noise(), 1100, .7) + lp(noise(), 200) * 1.5) * env(t, .2, .006, .15) * Math.exp(-t * 8) * vel, -.3); }
    function steamWhistle(t0, len, vel = .12) {
      const fs = [587, 740, 880], ph = [0, 0, 0], bp = svf(1);
      voice(S, t0, len, t => { const sc = Math.pow(2, -1.2 * Math.exp(-t * 25) / 12); let s = 0; fs.forEach((f, i) => { ph[i] += TAU * f * sc / SR; s += Math.sin(ph[i]) * (1 - i * .2); }); return (s * .5 + bp(noise(), 700, 1) * .5) * env(t, len, .03, .06) * vel; }, .3);
    }
    function splash(t0) {
      const lp = svf(0); voice(S, t0, .6, t => lp(noise(), 6000 * Math.exp(-t * 5) + 300) * Math.exp(-t * 5) * .35);
      for (let i = 0; i < 14; i++) { const s = t0 + .03 + rnd() * .5, f = 300 + rnd() * 500; let ph = 0; voice(S, s, .05, t => { ph += TAU * f * (1 + t * 30) / SR; return Math.sin(ph) * Math.sin(Math.PI * t / .05) * .1; }, rnd() * 2 - 1); }
    }
    function gulp(t0) { for (const d of [0, .1]) { let ph = 0; voice(S, t0 + d, .1, t => { ph += TAU * (260 - 1500 * t) / SR; return Math.sin(ph) * Math.sin(Math.PI * t / .1) * .35; }); } }
    function roar(t0, len, v0, v1) { const lp = svf(0), lp2 = svf(0); voice(S, t0, len, t => { const k = t / len, a = v0 + (v1 - v0) * k; return (lp(noise(), 350 + 600 * k) * 2 + lp2(noise(), 60) * 3) * a * (.8 + .2 * Math.sin(t * 47)) * env(t, len, .05, .03); }); }
    function whirr(t0, len) { let ph = 0; const bp = svf(1); voice(S, t0, len, t => { const f = 70 + 260 * (t / len); ph += f / SR; return bp((ph % 1) * 2 - 1, f * 4, .4) * env(t, len, .05, .1) * .22; }, .4); }
    function boing(t0, vel = .32) {
      let ph = 0; voice(S, t0, .75, t => {
        const f = 150 * (1 + .5 * Math.exp(-4.5 * t) * Math.sin(TAU * 15 * t)) * (1 + .35 * t); ph += TAU * f / SR;
        return (Math.sin(ph) + .45 * Math.sin(2 * ph) + .2 * Math.sin(3 * ph)) * Math.exp(-t * 3.2) * vel * Math.min(1, t * 300);
      }, .15);
    }
    function aah(t0, len, ms, vel = .05) {             // additive choir with vowel formants
      const F = [[750, 1, 90], [1150, .55, 110], [2800, .18, 200]];
      const gain = f => F.reduce((s, [c, a, w]) => s + a * Math.exp(-(((f - c) / w) ** 2) / 2), 0) + .04;
      ms.forEach((m, vi) => [-1, 1].forEach(dt => {
        const f0 = mtof(m) * (1 + dt * .003), H = Math.floor(3400 / f0), amps = []; for (let h = 1; h <= H; h++) amps.push(gain(h * f0));
        let ph = 0; voice(M, t0, len, t => { ph += TAU * f0 * (1 + .006 * Math.sin(TAU * (5 + vi * .3) * t + vi)) / SR; let s = 0; for (let h = 0; h < H; h++) s += Math.sin(ph * (h + 1)) * amps[h]; return s * vel * env(t, len, .25, .35); }, dt * .4);
      }));
    }
    function projector() {                               // film hiss, sprocket tick, crackle — the whole length
      const lp = svf(0);
      voice(S, 0, DUR, t => lp(noise(), 3500) * .012 + (((t * 24) % 1) < .004 ? .02 : 0));
      for (let i = 0; i < 70; i++) { const s = rnd() * DUR, a = .03 + rnd() * .09; voice(S, s, .004, () => noise() * a, rnd() * 2 - 1); }
    }

    // ================= THE SCORE (F major, 134 bpm: an eighth = one engine chug) =================
    const E = Math.PI / 14, Q = E * 2;
    projector();

    // 1 · the cake ride — jaunty oom-pah, reaching for a high note… FREEZE
    oompah(.05, 1.19, 41, 48, [69, 72, 77], E);
    [[.05, 72], [.05 + E, 74], [.05 + 2 * E, 77], [.05 + 3 * E, 76], [.05 + 4 * E, 81]].forEach(([t, m], i) => organ(t, i === 4 ? 1.19 - t - .06 : E * .85, m, .11));
    creak(.6, .14, 900, .3, .4); creak(.88, .16, 780, .3, .4);                 // hinged jaw, two jerks
    bell(S, .98, 3950, .12, 5, .5);                                           // gold-tooth glint
    creak(1.02, .15, 1600, .08, -.4);                                          // the tower wobbles…
    // (1.19–1.30: dead silence but for the projector)
    cymbal(S, 1.30, .3, 3); thud(1.30, 70, .55, -.3); pop(1.30, 900, 300, .25, -.3);   // fork twang & CRASH
    for (let i = 0; i < 7; i++) thud(1.34 + i * .045 + rnd() * .03, 110 + rnd() * 60, .28, rnd() * 1.6 - .8);
    slide(1.31, .16, 700, 1500, .11, .3); slide(1.47, .3, 1500, 380, .11, .3);  // catapult up… and down the hatch
    for (let i = 0; i < 11; i++) organ(1.36 + i * .034, .04, 84 - i, .06, .2);  // falling chromatic run
    gulp(1.63);

    // 2 · down the throat-pipe
    whoosh(1.72, .95, 1800, 300, .22, 0, .8);
    [53, 52, 51, 49].forEach((m, i) => tuba(1.78 + i * .2, .17, m, .34, -.1, .8));
    creak(2.08, .12, 1400, .12, .6); creak(2.34, .12, 1300, .12, -.6);        // valve wheel squeaks
    splash(2.47);

    // 3 · the pancreas works — mechanical march; keys spew; pan down the highway
    oompah(2.62, 4.3, 41, 48, [69, 72, 77], E);
    [77, 77, 72, 72, 74, 76, 77, 77].forEach((m, i) => organ(2.62 + i * E, i === 6 ? E * 1.8 : E * .6, m, .1, 0, 1.2));
    for (let t = 2.6; t < 4.25; t += .2417) { clunk(t, .12, -.5); chuff(t + .12, .08); }
    for (let i = 0; i < 70; i++) clink(2.72 + rnd() * 1.3, .05, .3 + rnd() * .5);  // brass keys tinkling out of the chute
    whoosh(3.3, 1.0, 400, 2500, .12, .5, 1.5);

    // 4 · the jammed door — the record sticks, then deflates
    let tt = 4.3;
    for (let r = 0; r < 3; r++) { const d = .085 * Math.pow(1.25, r); organ(tt, d * .9, 79 - r * .45, .1); organ(tt + d, d * .9, 77 - r * .45, .1); tt += 2 * d; }
    [[4.9, .12, 55], [5.03, .12, 54], [5.16, .12, 53], [5.29, .2, 52]].forEach(([t, d, m], i) => {
      tuba(t, d, m, .4, -.1, .2);
      if (i === 3) { let ph = 0; voice(M, t, d + .05, u => { ph += TAU * mtof(52) * (1 + .03 * Math.sin(TAU * 9 * u)) / SR; return Math.sin(ph) * .08 * env(u, d + .05, .01, .05); }); }
    });
    for (let i = 0; i < 40; i++) clink(4.27 + rnd() * 1.1, .07, rnd() * 1.2 - .6);  // keys piling up
    for (let i = 0; i < 8; i++) clunk(4.3 + i * .13 + rnd() * .05, .1, rnd() - .5); // jammed in keyholes
    [[5.07, 430], [5.15, 470], [5.22, 400], [5.3, 520]].forEach(([t, f], i) => honk(t, f, .2, -.6 + i * .15));
    clink(5.43, .09, 0);
    // (5.45–5.55: a held breath)

    // 5 · the Hand of Providence — choir, harp; swat; butter; CLUNK; gears
    aah(5.55, .95, [58, 62, 65, 70], .045);
    [58, 62, 65, 70, 74, 77, 82].forEach((m, i) => pluck(5.55 + i * .035, m, .12, -.3 + i * .1));
    whoosh(5.8, .3, 500, 2600, .3, -.2, .7);
    for (let i = 0; i < 9; i++) bell(S, 5.9 + i * .028 + rnd() * .02, 1800 + rnd() * 1500, .06, 20, .2 + rnd() * .6);   // sugar cubes pinging away
    clunk(6.34, .55, .5); creak(6.3, .08, 600, .2, .5);
    thud(6.48, 220, .2, .4); pop(6.48, 500, 150, .18, .4);                    // butter lands on the gear: plap
    whirr(6.37, .45);
    chord(6.37, .2, [65, 69, 72], .07, 1.2);

    // 6 · the door becomes a furnace — build, shudder, WHOOMPH, suck
    timpRoll(6.55, .9, 41, .05, .3);
    [65, 67, 69, 70, 72, 74, 76].forEach((m, i) => organ(6.62 + i * E / 2, E / 2 * .9, m, .06 + i * .008, 0, 1.3));
    for (let i = 0; i < 12; i++) clink(6.78 + i * .012, .08, rnd() * 1.6 - .8);
    thud(6.93, 50, .6); roar(6.93, .54, .12, .32); cymbal(S, 6.93, .12, 5);
    whoosh(7.0, .45, 300, 3200, .25, 0, .6);

    // 7 · the ketone engine — ta-DA!, triumphant march, whistle, rocket up the stack
    cymbal(M, 7.45, .28, 2.5); kick(7.45, .5);
    chord(7.45, Q * .9, [65, 69, 72, 77], .075, 1.3); tuba(7.45, Q * .9, 41, .45);
    oompah(7.45 + Q, 8.2, 41, 48, [69, 72, 77], E);
    [[7.45 + Q, 77, E * .9], [7.45 + Q + E, 81, E * .9]].forEach(([t, m, d]) => organ(t, d, m, .11));
    organ(7.45 + 2 * Q, 8.2 - (7.45 + 2 * Q), 84, .11);
    for (let t = 7.45; t < 8.35; t += E) chuff(t, .2);
    steamWhistle(7.9, .12); steamWhistle(8.06, .22);
    const run = [72, 74, 76, 77, 79, 81, 82, 84, 86, 88, 89];
    run.forEach((m, i) => organ(8.22 + i * .064, .07, m, .08 + i * .004, .2, 1.2));
    tuba(8.2, .7, 48, .3); timpRoll(8.2, .7, 41, .06, .25);
    whoosh(8.2, .75, 250, 3500, .28, 0, .7);
    whoosh(8.53, .35, 1200, 400, .3, 0, .5);                                    // blast out of the stack

    // 8 · the startled gentleman — sting, pop, tiptoe, BOING, *ting*
    cymbal(M, 8.9, .22, 3); chord(8.9, .16, [65, 69, 72, 77], .07); tuba(8.9, .16, 41, .35);
    whoosh(8.88, .22, 800, 200, .22, 0, .5);                                     // pomf of steam
    slide(8.93, .09, 900, 2100, .11, -.2);                                     // eek!
    pop(8.955, 600, 2200, .22, .3); bell(S, 9.12, 3100, .05, 14, .5); bell(S, 9.26, 2900, .04, 14, .6);   // monocle pops and swings
    [60, 64, 67].forEach((m, i) => pluck(9.04 + i * .1, m, .16, .1, 9));
    creak(9.04, .13, 1300, .12, .5);
    whoosh(9.2, .14, 900, 2200, .1, .5, 1);
    boing(9.34);
    bell(S, 9.7, 2637, .16, 3, 0); bell(S, 9.7, 3951, .08, 3.5, .2);          // the wink
    chord(9.7, .25, [72, 77, 81], .06, 1.4); pluck(9.7, 53, .2, -.2, 3); cymbal(M, 9.7, .07, 4);

    // ---------------- mix: reverb, vintage EQ, soft clip, hard cut ----------------
    const OUT = [new Float32Array(N), new Float32Array(N)];
    const combs = [[1557, 1617, 1491, 1422], [1580, 1640, 1514, 1445]].map(ch => ch.map(d => ({ buf: new Float32Array(Math.round(d * SR / 44100)), i: 0, f: 0 })));
    const aps = [[225, 556], [248, 579]].map(ch => ch.map(d => ({ buf: new Float32Array(Math.round(d * SR / 44100)), i: 0 })));
    for (let c = 0; c < 2; c++) {
      let hpY = 0, hpX = 0, lpY = 0; const aHP = Math.exp(-TAU * 90 / SR), aLP = 1 - Math.exp(-TAU * 7000 / SR);
      for (let k = 0; k < N; k++) {
        let m = M[c][k];
        hpY = aHP * (hpY + m - hpX); hpX = m; m = hpY; lpY += aLP * (m - lpY); m = lpY;    // gramophone-ish band
        const send = m * .3 + S[c][k] * .12;
        let wet = 0;
        for (const cb of combs[c]) { const y = cb.buf[cb.i]; cb.f = y * .72 + cb.f * .28; cb.buf[cb.i] = send + cb.f * .78; cb.i = (cb.i + 1) % cb.buf.length; wet += y; }
        for (const ap of aps[c]) { const b = ap.buf[ap.i], y = -wet * .5 + b; ap.buf[ap.i] = wet + b * .5; ap.i = (ap.i + 1) % ap.buf.length; wet = y; }
        OUT[c][k] = m + S[c][k] + wet * .22;
      }
    }
    let peak = 0;
    for (let c = 0; c < 2; c++) for (let k = 0; k < N; k++) { const v = Math.tanh(OUT[c][k] * 1.4) / Math.tanh(1.4); OUT[c][k] = v; peak = Math.max(peak, Math.abs(v)); }
    const g = .9 / (peak || 1), fade = Math.round(SR * .004);
    for (let c = 0; c < 2; c++) for (let k = 0; k < N; k++) OUT[c][k] *= g * (k > N - fade ? (N - k) / fade : 1);   // hard cut at 10.0 s
    return { L: OUT[0], R: OUT[1], sampleRate: SR };
  }

  function toWav({ L, R, sampleRate }) {
    const n = L.length, buf = new ArrayBuffer(44 + n * 4), v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
    v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { v.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); v.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
    return buf;
  }

  const api = { renderSoundtrack, toWav };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Soundtrack = api;
})(typeof self !== 'undefined' ? self : this);
