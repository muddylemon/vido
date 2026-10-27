// score.js — the deterministic, fully synthesized score of THE APOCALYPSE OF PETER.
// Pure JS DSP (no Web Audio): played in the browser via AudioBuffer, written to WAV in Node and
// muxed by capture-server.js. Every cue is pinned to the leaves' visual timeline in seconds.
// D minor. A candlelit book: organ drone, church bells, seven trumpets, choir, and the page turning.
(function (root) {
  'use strict';
  const metadata = typeof module !== 'undefined' && module.exports ? require('../../lib/apocalypse-data') : root.VIDO_APOCALYPSE;
  function renderSoundtrack(SR = 48000, DUR = 130) {
    const N = Math.round(SR * DUR), TAU = Math.PI * 2;
    const M = [new Float32Array(N), new Float32Array(N)];   // music bus (reverb send .35)
    const S = [new Float32Array(N), new Float32Array(N)];   // foley bus (reverb send .15)
    const RT = [new Float32Array(N), new Float32Array(N)];  // room tone: dry, survives the hard cut
    let seed = 20261025;
    const rnd = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const noise = () => rnd() * 2 - 1;
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const seg = (t, a, b) => clamp((t - a) / (b - a));
    const env = (t, len, a = .005, r = .04) => t < a ? t / a : t > len - r ? Math.max(0, (len - t) / r) : 1;
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
    const ORG = [1, .55, .38, .22, .14, .09, .05];
    function organ(t0, dur, m, vel = .1, pan = 0, bright = 1, breath = .05) {
      const f = mtof(m); let ph = 0; const len = dur + .09, br = svf(1);
      voice(M, t0, len, t => {
        const vib = t > .12 ? 1 + .003 * Math.sin(TAU * 5.4 * t) : 1;
        ph += TAU * f * vib / SR; let s = 0;
        for (let h = 0; h < ORG.length; h++) s += Math.sin(ph * (h + 1)) * ORG[h] * (h > 2 ? bright : 1);
        return (s * .5 + br(noise(), f * 2, 2) * breath) * env(t, len, .02, .08) * vel;
      }, pan);
    }
    function chord(t0, dur, ms, vel, bright = 1) { ms.forEach((m, i) => organ(t0, dur, m, vel, (i - ms.length / 2) * .22, bright)); }
    // the drone: D2 + A2 + a soft D3, two slowly detuned ranks, gain shaped by the whole film
    function droneGain(t) {
      let g = seg(t, 0, 3);
      for (const Ls of [11, 26, 40, 64, 80, 90, 103]) g += .45 * Math.exp(-Math.pow((t - Ls - .5) / 1.3, 2));
      if (t > 71.5 && t < 81) g *= 1 - .96 * (seg(t, 71.5, 72.5) - seg(t, 80.2, 81));     // thins to the heartbeat
      if (t > 112.2 && t < 122.5) g *= 1 - seg(t, 112.2, 113.2);                             // silence for the mirror
      if (t >= 122.5) g = .6 * seg(t, 122.5, 124.5) * (1 - seg(t, 126, 130));                // the colophon
      return g;
    }
    function drone() {
      [[38, 1, -.3], [45, .6, .3], [50, .3, 0]].forEach(([m, a, pan], i) => {
        const f = mtof(m); let ph = 0, ph2 = 0;
        voice(M, 0, DUR, t => {
          const det = 1 + .0014 * Math.sin(TAU * .07 * t + i * 2);
          ph += TAU * f * det / SR; ph2 += TAU * f * (2 - det) / SR; let s = 0;
          for (let h = 0; h < 5; h++) s += (Math.sin(ph * (h + 1)) + Math.sin(ph2 * (h + 1))) * ORG[h];
          return s * .25 * a * droneGain(t);
        }, pan, .12);
      });
    }
    // trumpet: band-limited sawtooth with a brass formant, 40 ms attack, scoop, vibrato after .2 s
    function trumpet(t0, dur, m, vel = .2, pan = 0, vib = true, scoop = .8) {
      const f = mtof(m); let ph = 0; const len = dur + .1, bp = svf(1), lp = svf(0);
      voice(M, t0, len, t => {
        const sc = Math.pow(2, -scoop * Math.exp(-t * 28) / 12);
        const v = vib && t > .2 ? 1 + .004 * Math.sin(TAU * 5.5 * (t - .2)) * Math.min(1, (t - .2) * 3) : 1;
        ph += TAU * f * sc * v / SR; let s = 0;
        for (let h = 1; h <= 22; h++) s += Math.sin(ph * h) / h;
        s *= .55; const br = bp(s, 1500, .9), e = env(t, len, .04, .09);
        return lp(s * .4 + br * (1 + .6 * Math.min(1, t * 8)), 6800) * e * vel;
      }, pan);
    }
    // church bell: inharmonic partials (hum, prime, tierce, quint, nominal…) + a strike
    function churchBell(t0, f, vel = .3, dec = .8, pan = 0) {
      const P = [[.5, .5, .5], [1, 1, .8], [1.2, .45, 1.2], [1.5, .35, 1.4], [2, .6, 1.3], [2.5, .18, 2], [3, .12, 2.6], [4.2, .06, 3.5]];
      voice(M, t0, 7, t => { let s = 0; for (const [r, a, d] of P) s += Math.sin(TAU * f * r * t) * a * Math.exp(-t * dec * d); return s * vel * Math.min(1, t * 600) * .5; }, pan);
      const bp = svf(1); voice(S, t0, .05, t => bp(noise(), f * 4, .6) * Math.exp(-t * 90) * vel * .6, pan);
    }
    // small bell / clink (the Metabolic Engine's)
    function bell(bus, t0, f, vel = .2, dec = 6, pan = 0) {
      const P = [[1, 1], [2.76, .5], [5.4, .28], [8.93, .14]];
      voice(bus, t0, Math.min(3, 7 / dec), t => { let s = 0; for (const [r, a] of P) s += Math.sin(TAU * f * r * t) * a * Math.exp(-t * dec * (1 + r * .3)); return s * vel * Math.min(1, t * 2000); }, pan);
    }
    function clink(t0, vel = .07, pan = 0) { bell(S, t0, 2200 + rnd() * 2600, vel, 28 + rnd() * 20, pan); }
    function pluck(t0, m, vel = .2, pan = 0, dec = 5) {
      const f = mtof(m); let ph = 0;
      voice(M, t0, .9, t => { ph += TAU * f / SR; let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(ph * h) / h * Math.exp(-t * (dec + h * 3)); return s * vel * Math.min(1, t * 400); }, pan);
    }
    function timp(t0, m, vel = .3, pan = -.2) {
      const f = mtof(m); let ph = 0; const lp = svf(0);
      voice(M, t0, 1.6, t => { ph += TAU * f * (1 + .2 * Math.exp(-t * 40)) / SR; return (Math.sin(ph) + .3 * Math.sin(ph * 1.5) * Math.exp(-t * 6) + lp(noise(), 400) * Math.exp(-t * 60)) * Math.exp(-t * 4.5) * vel * Math.min(1, t * 500); }, pan);
    }
    function timpRoll(t0, len, m, v0, v1) {
      const f = mtof(m);
      for (let t = 0; t < len; t += .045) { const v = v0 + (v1 - v0) * (t / len); voice(M, t0 + t, .3, u => (Math.sin(TAU * f * u) + .3 * Math.sin(TAU * f * 1.5 * u)) * Math.exp(-u * 10) * v * (.8 + rnd() * .4), -.2); }
    }
    // additive choir with vowel formants
    function aah(t0, len, ms, vel = .05) {
      const F = [[750, 1, 90], [1150, .55, 110], [2800, .18, 200]];
      const gain = f => F.reduce((s, [c, a, w]) => s + a * Math.exp(-(((f - c) / w) ** 2) / 2), 0) + .04;
      ms.forEach((m, vi) => [-1, 1].forEach(dt => {
        const f0 = mtof(m) * (1 + dt * .003), H = Math.floor(3400 / f0), amps = []; for (let h = 1; h <= H; h++) amps.push(gain(h * f0));
        let ph = 0; voice(M, t0, len, t => { ph += TAU * f0 * (1 + .006 * Math.sin(TAU * (5 + vi * .3) * t + vi)) / SR; let s = 0; for (let h = 0; h < H; h++) s += Math.sin(ph * (h + 1)) * amps[h]; return s * vel * env(t, len, .6, .8); }, dt * .4);
      }));
    }
    // a gliding organ sigh (the sleeper), m0 → m1 over len
    function sigh(t0, len, m0, m1, vel = .07) {
      let ph = 0; voice(M, t0, len, t => { const f = mtof(m0 + (m1 - m0) * seg(t, .05, len - .1)); ph += TAU * f / SR; let s = 0; for (let h = 0; h < 5; h++) s += Math.sin(ph * (h + 1)) * ORG[h]; return s * .5 * env(t, len, .08, .25) * vel; }, .1);
    }

    // ---------------- foley ----------------
    function thud(t0, f = 90, vel = .4, pan = 0, dec = 14) { let ph = 0; const lp = svf(0); voice(S, t0, .5, t => { ph += TAU * f * (1 - .5 * Math.min(1, t * 8)) / SR; return (Math.sin(ph) + lp(noise(), 500) * 1.2) * Math.exp(-t * dec) * vel; }, pan); }
    function thump(t0, f = 56, vel = .35, pan = 0) { let ph = 0; voice(S, t0, .45, t => { ph += TAU * f * (1 - .25 * Math.min(1, t * 10)) / SR; return Math.sin(ph) * Math.exp(-t * 11) * Math.min(1, t * 200) * vel; }, pan); }
    function clunk(t0, vel = .5, pan = 0) { thud(t0, 85, vel, pan); [430, 1130, 1790, 2610].forEach((f, i) => voice(S, t0, .5, t => Math.sin(TAU * f * t) * Math.exp(-t * (10 + i * 5)) * vel * .25 / (i + 1), pan)); }
    function clack(t0, vel = .5, pan = 0) { thud(t0, 95, vel, pan, 18); [900, 1420, 2300, 3150].forEach((f, i) => voice(S, t0, .35, t => Math.sin(TAU * f * t) * Math.exp(-t * (16 + i * 8)) * vel * .22 / (i + 1), pan)); }
    function creak(t0, len, fc = 1100, vel = .25, pan = 0) {
      let ph = 0; const bp = svf(1), bp2 = svf(1);
      voice(S, t0, len, t => {
        const rate = 38 + 30 * Math.sin(t * 23) + 20 * Math.sin(t * 61); ph += rate / SR; const imp = ph >= 1 ? (ph -= 1, 1) : 0;
        return (bp(imp * 6, fc, .08) + bp2(imp * 3, fc * 1.9, .1)) * env(t, len, .01, .04) * vel;
      }, pan);
    }
    function whoosh(t0, len, f0, f1, vel = .2, pan = 0, q = 1.2) {
      const bp = svf(1); voice(S, t0, len, t => { const k = t / len; return bp(noise(), f0 * Math.pow(f1 / f0, k), q) * Math.sin(Math.PI * k) * vel; }, pan);
    }
    function pop(t0, f0 = 350, f1 = 1500, vel = .3, pan = 0) { let ph = 0; voice(S, t0, .06, t => { ph += TAU * f0 * Math.pow(f1 / f0, t / .06) / SR; return Math.sin(ph) * env(t, .06, .002, .03) * vel; }, pan); }
    function roar(t0, len, v0, v1) { const lp = svf(0), lp2 = svf(0); voice(S, t0, len, t => { const k = t / len, a = v0 + (v1 - v0) * k; return (lp(noise(), 350 + 600 * k) * 2 + lp2(noise(), 60) * 3) * a * (.8 + .2 * Math.sin(t * 47)) * env(t, len, .05, .01); }); }
    function whirr(t0, len, vel = .18) { let ph = 0; const bp = svf(1); voice(S, t0, len, t => { const f = 70 + 260 * (t / len); ph += f / SR; return bp((ph % 1) * 2 - 1, f * 4, .4) * env(t, len, .05, .1) * vel; }, .4); }
    // a single click through a band-pass (ratchet tooth, eye, crumb)
    function click(t0, f = 2500, vel = .12, pan = 0, q = .45) { const bp = svf(1); voice(S, t0, .05, t => bp(t === 0 ? 1 : 0, f, q) * 7 * Math.exp(-t * 70) * vel, pan); }
    function ratchet(t0, len, rate, vel = .1, pan = .3) {
      let ph = 0; const bp = svf(1);
      voice(S, t0, len, t => { ph += rate / SR; const imp = ph >= 1 ? (ph -= 1, 1) : 0; return bp(imp * 8, 2600 + 400 * Math.sin(t * 7), .45) * env(t, len, .02, .1) * vel; }, pan);
    }
    function tick(t0, hi = true, vel = .14, pan = 0) {
      const bp = svf(1), f = hi ? 2100 : 1500, k = hi ? 430 : 330;
      voice(S, t0, .07, t => (bp(t === 0 ? 1 : 0, f, .35) * 6 + Math.sin(TAU * k * t) * .35 * Math.exp(-t * 120)) * Math.exp(-t * 55) * vel, pan);
    }
    function swish(t0, len = .5, vel = .2, pan = .2) {
      const bp = svf(1); voice(S, t0, len, t => { const k = t / len, f = 1600 * Math.pow(500 / 1600, k); return bp(noise(), f, .6) * Math.sin(Math.PI * k) * (1 + .3 * Math.sin(TAU * 28 * t)) * vel; }, pan);
    }
    function pageTurn(t0, i) { swish(t0, .5, .22, .15); bell(S, t0 + .15, i % 2 ? 587.3 : 440, .09, 6, -.1); }
    function water(t0, len, gainFn, vel = .2, pan = .4) {
      const lp = svf(0), bp = svf(1), bp2 = svf(1);
      voice(S, t0, len, t => {
        const n = noise(), und = .7 + .3 * Math.sin(TAU * .31 * t) * Math.sin(TAU * .73 * t + 1);
        return (lp(n, 1400) * .8 + bp(n, 420, .9) * 1.2 + bp2(n, 2600, 1.5) * .25 * (1 + Math.sin(TAU * 1.3 * t))) * und * gainFn(t) * vel * env(t, len, .3, .3);
      }, pan);
      for (let i = 0; i < len * 3; i++) { const s = t0 + rnd() * len; pop(s, 500 + rnd() * 700, 1200 + rnd() * 1500, .04 * gainFn(s - t0), pan + rnd() * .4 - .2); }   // bubbling
    }
    function tide(t0, len, vel = .12) { const lp = svf(0); voice(S, t0, len, t => lp(noise(), 200 + 60 * Math.sin(t * 1.1)) * 3 * seg(t, 0, 4) * (1 - seg(t, len - .5, len)) * vel); }
    function heartbeat(t0, vel = .35) { thump(t0, 58, vel); thump(t0 + .17, 50, vel * .7); }
    function splitflap(t0, vel = .4) { for (const d of [0, .055]) { thud(t0 + d, 300, vel * .5, 0, 40); click(t0 + d, 3200, vel * .6, 0, .5); } }
    function clop(t0, pan, vel) { thud(t0, 150 + rnd() * 40, .16 * vel, pan, 22); click(t0, 900 + rnd() * 300, .1 * vel, pan, .4); }
    function hoofs(t0, len, pan) { for (let s = 0; s < len - .05; s += .42) { const v = .5 + .5 * s / len; for (const d of [0, .1, .2]) clop(t0 + s + d + rnd() * .012, pan, v * (d === .2 ? 1 : .7)); } }
    function scratch(t0, len = .5, vel = .07, pan = -.4) { const bp = svf(1); let g = 0; voice(S, t0, len, t => { if ((t * 200) % 1 < .01) g = .3 + rnd() * .7; return bp(noise(), 3200 + 800 * Math.sin(t * 9), .7) * g * Math.sin(Math.PI * t / len) * vel; }, pan); }
    function flap(t0, vel = .18, pan = .3) { const lp = svf(0); voice(S, t0, .25, t => lp(noise(), 2000) * (1 + .8 * Math.sin(TAU * 18 * t)) * Math.sin(Math.PI * t / .25) * vel, pan); }
    function jingle(t0, n = 8, vel = .06) { for (let i = 0; i < n; i++) clink(t0 + rnd() * .35, vel, rnd() * 1.2 - .6); }
    function hum(t0, len, vel = .04) { let ph = 0; voice(S, t0, len, t => { ph += TAU * 100 / SR; let s = 0; for (let h = 1; h <= 9; h += 2) s += Math.sin(ph * h) / h; return s * seg(t, 0, len) * vel * (1 - seg(t, len - .05, len)); }, -.2); }
    function rumble(t0, len, vel = .12) { const lp = svf(0); voice(S, t0, len, t => lp(noise(), 60) * 4 * env(t, len, .2, .05) * vel * (1 + .3 * Math.sin(t * 31))); }
    function crack(t0, vel = .3, pan = 0) { const bp = svf(1); voice(S, t0, .12, t => bp(noise(), 1800 + rnd() * 400, .5) * Math.exp(-t * 50) * vel * 1.4, pan); thud(t0, 180, vel * .6, pan, 30); }
    function whipcrack(t0) { whoosh(t0, .18, 300, 4000, .25, .3, .9); const bp = svf(1); voice(S, t0 + .18, .05, t => bp(noise(), 2600, .5) * Math.exp(-t * 120) * .5, .3); pop(t0 + .18, 1800, 300, .25, .3); }
    function footstep(t0, vel = .18, pan = 0) { thud(t0, 120, vel, pan, 24); const bp = svf(1); voice(S, t0, .06, t => bp(noise(), 1100, .8) * Math.exp(-t * 80) * vel * .5, pan); }
    function rustle(t0, vel = .07, pan = .2) { const bp = svf(1); voice(S, t0, .15, t => bp(noise(), 1200 + 600 * Math.sin(t * 40), .8) * Math.sin(Math.PI * t / .15) * vel, pan); }
    function ring(t0, len, vel = .02) { voice(M, t0, len, t => Math.sin(TAU * 2200 * t) * seg(t, 0, len - .4) * (1 - seg(t, len - .25, len)) * vel, 0); }
    function room() {                                      // room tone + candle crackle, the whole length, dry
      const lp = svf(0), hp = svf(2);
      voice(RT, 0, DUR, () => lp(noise(), 300) * .009 + hp(noise(), 6000) * .0025, 0);
      for (let i = 0; i < DUR * 3; i++) { const s = rnd() * DUR, a = .015 + rnd() * .04 * (rnd() < .12 ? 2.2 : 1), bp = svf(1); voice(RT, s, .006, t => bp(noise(), 2500 + rnd() * 2000, .6) * a * (1 - t / .006), rnd() * 1.4 - .7); }
    }

    // ================= THE CUES =================
    room(); drone();

    // 0 · the locked room
    clack(2.0, .6); creak(2.06, .12, 1200, .12, .4);

    // page turns
    Object.values(metadata.specs).slice(1).forEach((spec, i) => pageTurn(spec.t0, i));

    // I · the four quadrants
    scratch(11.7, .5); scratch(12.4, .5);
    [[12, -.5], [13.2, .5], [14.4, -.3], [15.6, .3]].forEach(([t, pan]) => hoofs(t, 1.0, pan));
    [[13.0, 38], [14.2, 33], [15.4, 38], [16.6, 33]].forEach(([t, m]) => timp(t, m, .3));
    sigh(19.0, .9, 57, 50, .07);
    tide(20, 6, .12); flap(21.5);

    // II · the restrainer and the torrent
    water(26.7, 13.3, t => seg(t, 0, 5.3), .14, .4);
    for (const t of [29.0, 33.0]) { creak(t, .25, 700, .25, -.3); thud(t, 80, .35, -.3); }
    aah(32, 6, [57, 62, 65, 69], .035);
    whoosh(36.0, .5, 2500, 900, .15, .6, 1.2);
    for (let i = 0; i < 10; i++) pop(36.2 + rnd() * .8, 600 + rnd() * 800, 2000 + rnd() * 1500, .08, rnd() * 2 - 1);

    // III · the seven trumpets
    chord(40.7, 3.3, [38, 45, 50, 53], .05); timpRoll(40.7, 3.3, 38, .02, .06);
    const NOTES = [62, 65, 69, 74, 77, 81];
    for (let i = 0; i < 7; i++) {
      const t = 44 + 2.7 * i, pan = (i % 2 ? .35 : -.35) * (1 - i / 9);
      if (i < 6) trumpet(t, .9, NOTES[i], .2, pan);
      else { [74, 75, 81].forEach((m, j) => trumpet(t, 1.4, m, .14, (j - 1) * .3, false)); clunk(t, .4, 0); ratchet(t, .5, 12, .12); }
      clunk(t + .25, .2, pan);                           // the medallion's hinge
    }
    thud(53.1, 200, .3, 0, 30); pop(53.12, 1200, 300, .2); thud(53.24, 190, .3, 0, 30); pop(53.26, 1100, 280, .2);   // the X stamped
    jingle(54.9);
    ratchet(60.4, 3.6, 1.5, .07); swish(60.6, .4, .1, .1);

    // IV · the machinery
    for (let i = 0; i < 10; i++) click(64.7 + i * .33, 2500, .11, i % 2 ? .3 : -.3);
    [64.7, 65.0, 65.4, 65.7, 66.1, 66.4].forEach((t, i) => clunk(t, .35, i % 2 ? .4 : -.4));
    for (let i = 0; i < 15; i++) tick(66.5 + i * .1, true, .05, rnd() * 1.6 - .8);
    whirr(67, 2, .14);
    for (let i = 0; i < 16; i++) tick(68 + i * .25, i % 2 === 0, .07, -.3 + i * .04);
    whipcrack(70.5); click(71.0, 1800, .2, .3, .5); thud(71.0, 160, .25, .3, 30);
    for (let i = 0; i < 8; i++) heartbeat(72 + i, .3 + i * .02);
    clunk(77.6, .6); hum(77.6, 2.4, .04); rumble(77.6, 2.4, .12);

    // V · the age of the beast
    for (let t = 80.7, i = 0; t < 90; t += .5, i++) tick(t, i % 2 === 0, .12, i % 2 ? .25 : -.25);
    { const hp = svf(2); voice(S, 80.7, 9.3, t => hp(noise(), 7000) * .004 * env(t, 9.3, .5, .3)); }   // sand
    splitflap(86.0); bell(S, 86.0, 587.3, .14, 5); tick(86.3, false, .1); pluck(86.6, 74, .12, .2);

    // VI · the wink
    [91, 95, 99].forEach(t => churchBell(t, 146.8, .22, .7, -.15));
    thud(92.0, 110, .3, 0, 20); bell(S, 92.0, 2400, .06, 14, .1);
    for (let i = 0; i < 6; i++) footstep(93.0 + i * .4, .16, -.2 + i * .06);
    bell(S, 96.0, 3100, .12, 10, .2); pluck(96.0, 62, .15, .2);
    for (let i = 0; i < 8; i++) click(97.0 + i * .6, 1500 + rnd() * 500, .06, rnd() * .8 - .4, .5);
    for (let i = 0; i < 9; i++) rustle(97.5 + i * .5, .07, .2);
    clunk(102.5, .25, .3);

    // VII · here is wisdom
    [[103.7, [50, 57, 62, 65]], [105.7, [55, 58, 62, 67]], [107.7, [57, 61, 64, 69]], [109.7, [50, 57, 62, 65]]].forEach(([t, ms]) => chord(t, 1.95, ms, .05));
    aah(108, 4.2, [57, 62, 65, 69], .035);
    [104.5, 105.3, 106.1, 106.9, 107.7, 108.5, 109.3, 110.1, 110.9, 111.7].forEach(t => {
      const gold = t === 105.3 || t === 109.3;
      bell(S, t, gold ? 1760 : 880, gold ? .1 : .08, gold ? 5 : 8, gold ? .4 : -.3);
      whoosh(t - .05, .12, 800, 2500, .08, gold ? .4 : -.3, 1);
    });
    ring(113, 3.5, .02);
    trumpet(116.5, 1.4, 62, .24, 0, false, .5);          // held into the hard cut at 118.0
    thud(117.0, 45, .6, 0, 8); roar(117.0, 1.0, .1, .5);
    [117.0, 117.2, 117.4].forEach((t, i) => crack(t, .3, (i - 1) * .5));
    [118.2, 118.6, 119.0].forEach(t => churchBell(t, 73.4, .12, .5, 0));
    tick(119.6, true, .08);

    // ---------------- mix: hard cut at 118.0, church reverb, warm EQ, soft clip, normalize ----------------
    const OUT = [new Float32Array(N), new Float32Array(N)];
    const combs = [[1687, 1801, 1931, 2053], [1711, 1829, 1951, 2081]].map(ch => ch.map(d => ({ buf: new Float32Array(Math.round(d * SR / 44100)), i: 0, f: 0 })));
    const aps = [[556, 441], [579, 464]].map(ch => ch.map(d => ({ buf: new Float32Array(Math.round(d * SR / 44100)), i: 0 })));
    const cutA = Math.round(118.0 * SR), cutB = Math.round(118.19 * SR);
    for (let c = 0; c < 2; c++) {
      let hpY = 0, hpX = 0, lpY = 0; const aHP = Math.exp(-TAU * 45 / SR), aLP = 1 - Math.exp(-TAU * 8500 / SR);
      for (let k = 0; k < N; k++) {
        if (k === cutA) { for (const cb of combs[c]) { cb.buf.fill(0); cb.f = 0; } for (const ap of aps[c]) ap.buf.fill(0); }
        const cut = k >= cutA && k < cutB;
        let m = cut ? 0 : M[c][k]; const s = cut ? 0 : S[c][k];
        hpY = aHP * (hpY + m - hpX); hpX = m; m = hpY; lpY += aLP * (m - lpY); m = lpY;
        const send = m * .35 + s * .15;
        let wet = 0;
        for (const cb of combs[c]) { const y = cb.buf[cb.i]; cb.f = y * .7 + cb.f * .3; cb.buf[cb.i] = send + cb.f * .83; cb.i = (cb.i + 1) % cb.buf.length; wet += y; }
        for (const ap of aps[c]) { const b = ap.buf[ap.i], y = -wet * .5 + b; ap.buf[ap.i] = wet + b * .5; ap.i = (ap.i + 1) % ap.buf.length; wet = y; }
        OUT[c][k] = m + s + wet * .25 + RT[c][k];
      }
    }
    let peak = 0;
    for (let c = 0; c < 2; c++) for (let k = 0; k < N; k++) { const v = Math.tanh(OUT[c][k] * 1.4) / Math.tanh(1.4); OUT[c][k] = v; peak = Math.max(peak, Math.abs(v)); }
    const g = .9 / (peak || 1), fade = Math.round(SR * .004);
    for (let c = 0; c < 2; c++) for (let k = 0; k < N; k++) OUT[c][k] *= g * (k > N - fade ? (N - k) / fade : 1);
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
