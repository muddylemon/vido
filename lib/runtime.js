/* Shared browser preview and strict capture driver. No film-specific destinations. */
(function () {
  'use strict';
  const qs = new URLSearchParams(location.search);
  const strict = qs.has('record') || qs.has('capture') || qs.has('t');
  window.__filmErrors = [];
  window.__captureStatus = { state: 'initializing' };
  const delay = ms => new Promise(r => setTimeout(r, ms));
  function report(e) {
    const message = e?.message || String(e);
    window.__filmErrors.push(message); window.__captureStatus = { ...window.__captureStatus, state: 'failed', error: message };
    console.error(message);
  }
  addEventListener('error', e => report(e.error || e.message));
  addEventListener('unhandledrejection', e => report(e.reason));
  async function api(url, token, data, { retry = false, method = 'POST' } = {}) {
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch(url, { method, headers: { 'x-vido-token': token, ...(data instanceof Blob ? { 'Content-Type': 'image/png' } : { 'Content-Type': 'application/json' }) }, body: data === undefined ? undefined : data instanceof Blob ? data : JSON.stringify(data), signal: AbortSignal.timeout(30000) });
        const result = await res.json();
        if (!res.ok) throw Object.assign(new Error(result.error || `HTTP ${res.status}`), { permanent: res.status < 500 && ![408, 429].includes(res.status) });
        return result;
      } catch (e) { if (!retry || e.permanent || attempt >= 2) throw e; await delay(250 * 2 ** attempt); }
    }
  }
  function png(canvas) { return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas PNG conversion failed')), 'image/png')); }
  let film, canvas, draw;
  async function capture({ id, token, from = 0, to = film.duration * film.fps, worker = 0 }) {
    const job = await api(`/jobs/${id}`, token, undefined, { method: 'GET' });
    if (job.film !== film.id || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to <= from || to > job.expected) throw new Error('Invalid capture range or film');
    const times = { renderMs: [], pngMs: [], uploadMs: [] }; const start = performance.now();
    try {
      if (window.__filmErrors.length) throw new Error(window.__filmErrors.join('; '));
      for (let frame = from; frame < to; frame++) {
        window.__captureStatus = { state: 'capturing', frame, from, to, worker };
        let t = performance.now(); draw(frame / film.fps); times.renderMs.push(performance.now() - t);
        if (window.__filmErrors.length) throw new Error(window.__filmErrors.join('; '));
        t = performance.now(); const blob = await png(canvas); times.pngMs.push(performance.now() - t);
        t = performance.now(); await api(`/jobs/${id}/frame?i=${frame}`, token, blob, { retry: true }); times.uploadMs.push(performance.now() - t);
        document.title = `recording ${frame + 1}/${job.expected}`;
      }
      const metrics = { worker, from, to, elapsedMs: Math.round(performance.now() - start) };
      for (const [key, values] of Object.entries(times)) { values.sort((a, b) => a - b); metrics[key] = { median: values[Math.floor(values.length / 2)], p95: values[Math.min(values.length - 1, Math.floor(values.length * .95))] }; }
      await api(`/jobs/${id}/event`, token, { event: 'worker-complete', ...metrics });
      window.__captureStatus = { state: 'captured', ...metrics }; return metrics;
    } catch (e) {
      report(e); await api(`/jobs/${id}/fail`, token, { error: `Worker ${worker}, frame ${window.__captureStatus.frame}: ${e.message}` }).catch(() => {}); throw e;
    }
  }
  async function record() {
    if (['from', 'to', 'noencode'].some(k => qs.has(k))) throw new Error('Use the Node CLI for parallel or partial recording');
    const session = await (await fetch('/session')).json();
    const job = await api('/jobs', session.token, { film: film.id });
    await capture({ id: job.id, token: session.token });
    await api(`/jobs/${job.id}/finish`, session.token);
    let result;
    const deadline = Date.now() + 20 * 60 * 1000;
    do {
      if (Date.now() > deadline) { await api(`/jobs/${job.id}/cancel`, session.token); throw new Error('Encode timed out'); }
      await delay(1000); result = await api(`/jobs/${job.id}`, session.token, undefined, { method: 'GET' });
      document.title = result.state;
    } while (!['succeeded', 'failed', 'cancelled'].includes(result.state));
    if (result.state !== 'succeeded') throw new Error(result.error || result.state);
    window.__recorded = true; window.__captureStatus = result;
  }
  function preview() {
    const loop = film.duration + film.pause; let start = null, lastFrame = null, audioStart = null, ac, buffer, audioError;
    const audioWorker = new Worker('/lib/preview-audio.js');
    function startAudio() {
      if (!buffer || audioStart !== null || ac.state !== 'running') return;
      const source = ac.createBufferSource(); source.buffer = buffer; source.loop = true; source.connect(ac.destination);
      audioStart = ac.currentTime + .05; lastFrame = null; source.start(audioStart);
    }
    const unlock = () => { if (ac) ac.resume().then(startAudio).catch(e => { audioError = e.message; }); };
    addEventListener('pointerdown', unlock); addEventListener('keydown', unlock);
    try {
      ac = new AudioContext();
      audioWorker.onmessage = ({ data }) => {
        if (data.error) { audioError = data.error; console.error('Audio:', audioError); audioWorker.terminate(); return; }
        buffer = ac.createBuffer(2, Math.round(loop * ac.sampleRate), ac.sampleRate);
        buffer.copyToChannel(new Float32Array(data.L), 0); buffer.copyToChannel(new Float32Array(data.R), 1); startAudio(); audioWorker.terminate();
      };
      audioWorker.onerror = e => { audioError = e.message; audioWorker.terminate(); };
      audioWorker.postMessage({ module: '/' + film.audio, sampleRate: ac.sampleRate, duration: film.duration });
    } catch (e) { audioError = e.message; audioWorker.terminate(); }
    window.audioStatus = () => ({ state: ac?.state, ready: !!buffer, playing: audioStart !== null, error: audioError });
    function tick(now) {
      start ??= now;
      const time = audioStart !== null ? Math.max(0, ac.currentTime - audioStart - (ac.outputLatency || ac.baseLatency || 0)) : (now - start) / 1000;
      const frame = Math.floor((time % loop) * film.fps);
      if (frame !== lastFrame) { draw(frame / film.fps); lastFrame = frame; }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    addEventListener('pagehide', () => { audioWorker.terminate(); ac?.close(); }, { once: true });
  }
  async function boot(id, target, render) {
    film = VIDO_FILMS[id]; canvas = target; draw = render;
    await document.fonts.ready;
    if (canvas.width !== film.width || canvas.height !== film.height) throw new Error('Canvas does not match film registry');
    window.renderAt = t => { if (!Number.isFinite(t)) throw new Error('Timestamp must be finite'); return draw(t); };
    window.FILM_INFO = film; window.__ready = !window.__filmErrors.length;
    window.__captureStatus = { state: window.__ready ? 'ready' : 'failed' };
    if (!window.__ready) throw new Error('Film initialization failed');
    if (qs.has('t')) { const t = Number(qs.get('t')); if (!Number.isFinite(t) || t < 0 || t >= film.duration) throw new Error('Timestamp outside film'); draw(t); }
    else if (qs.has('record')) await record();
    else if (!qs.has('capture')) preview();
  }
  window.Vido = { strict, report, capture, boot: (...args) => boot(...args).catch(report) };
})();
