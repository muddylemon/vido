'use strict';
const http = require('node:http'), fs = require('node:fs/promises'), path = require('node:path'), crypto = require('node:crypto');
const { createReadStream } = require('node:fs');
const { Worker } = require('node:worker_threads');
const films = require('./films');
const { acquireOutput } = require('./output-lock');
const { inside, integer, validatePng, run, probe, validateVideo, atomicJson } = require('./media');
const ROOT = path.resolve(__dirname, '..'), terminal = new Set(['succeeded', 'failed', 'cancelled']);
const error = (status, message) => Object.assign(new Error(message), { status });
function json(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); }
async function body(req, limit) {
  if (Number(req.headers['content-length']) > limit) { req.resume(); throw error(413, 'Request body too large'); }
  const chunks = []; let size = 0;
  for await (const b of req.iterator({ destroyOnReturn: false })) { size += b.length; if (size > limit) { req.resume(); throw error(413, 'Request body too large'); } chunks.push(b); }
  return Buffer.concat(chunks);
}
function number(value, label, min, max) { try { return integer(value, label, min, max); } catch (e) { throw error(400, e.message); } }
function createCaptureServer({ outputRoot = path.join(ROOT, 'out'), quiet = false } = {}) {
  const jobs = new Map(), reservations = new Set(), token = crypto.randomBytes(32).toString('hex');
  let url, closing = false, encoding = false;
  function summary(j) { return { id: j.id, film: j.film.id, name: j.name, state: j.state, expected: j.count, received: j.frames.size, lastProgress: j.lastProgress, created: j.created, error: j.error, output: j.output, validation: j.validation, metrics: j.metrics, sourceHash: j.sourceHash }; }
  function log(j, event, fields = {}) {
    const line = JSON.stringify({ timestamp: new Date().toISOString(), jobId: j.id, film: j.film.id, stage: j.state, event, ...fields });
    j.io = j.io.then(() => fs.appendFile(path.join(j.dir, 'events.jsonl'), line + '\n'));
    // Attach a handler immediately; persistence errors are still surfaced by persist().
    j.io.catch(e => { if (!quiet) console.error('Job log failure:', e.message); });
    if (!quiet && !['frames', 'encode-progress'].includes(event)) console.log(line);
  }
  async function persist(j) {
    const data = { ...summary(j), config: j.film, node: process.version, tools: j.tools };
    j.io = j.io.then(() => atomicJson(path.join(j.dir, 'manifest.json'), data)); await j.io;
  }
  function fail(j, e) {
    if (terminal.has(j.state)) return;
    j.state = 'failed'; j.error = String(e.message || e).slice(0, 4000); j.abort.abort();
    if (!j.work) void j.release?.().catch(() => {});
    log(j, 'failed', { error: j.error }); void persist(j).catch(e => { if (!quiet) console.error(e.message); });
  }
  async function sourceHash(film) {
    const hash = crypto.createHash('sha256');
    async function walk(dir) {
      for (const ent of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
        const file = path.join(dir, ent.name);
        if (ent.isDirectory()) await walk(file);
        else if (/\.(js|html)$/.test(ent.name)) { hash.update(path.relative(ROOT, file)); hash.update(await fs.readFile(file)); }
      }
    }
    await walk(path.join(ROOT, 'lib'));
    if (film.id === 'metabolic') { await walk(path.join(ROOT, 'js')); hash.update(await fs.readFile(path.join(ROOT, film.page))); }
    else await walk(path.dirname(path.join(ROOT, film.page)));
    return hash.digest('hex');
  }
  async function synthesize(j, wav) {
    await new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'audio-worker.js'), { workerData: { module: path.join(ROOT, j.film.audio), duration: j.count / j.film.fps, output: wav } });
      const cancel = () => { void worker.terminate(); reject(new Error('Audio synthesis cancelled')); };
      j.abort.signal.addEventListener('abort', cancel, { once: true }); const timer = setTimeout(cancel, 120000);
      worker.once('message', result => { j.metrics.audioMs = result.elapsedMs; }); worker.once('error', reject);
      worker.once('exit', code => { clearTimeout(timer); j.abort.signal.removeEventListener('abort', cancel); code === 0 ? resolve() : reject(new Error(`Audio worker exited ${code}`)); });
      if (j.abort.signal.aborted) cancel();
    });
  }
  async function encode(j) {
    try {
      log(j, 'validation-start'); await persist(j);
      for (let i = 0; i < j.count; i++) {
        if (j.abort.signal.aborted) throw new Error('Cancelled');
        validatePng(await fs.readFile(path.join(j.dir, 'frames', `f${String(i).padStart(6, '0')}.png`)), j.film.width, j.film.height);
      }
      if (await sourceHash(j.film) !== j.sourceHash) throw new Error('Film source changed during capture; start a fresh job');
      if (j.abort.signal.aborted) throw new Error('Cancelled');
      j.state = 'synthesizing'; log(j, 'audio-start'); await persist(j);
      const wav = path.join(j.dir, 'soundtrack.wav'); await synthesize(j, wav);
      if (j.abort.signal.aborted) throw new Error('Cancelled');
      j.state = 'encoding'; log(j, 'encode-start'); await persist(j);
      const temp = path.join(j.dir, 'video.partial.mp4'), start = performance.now();
      await run('ffmpeg', ['-y', '-v', 'error', '-progress', 'pipe:1', '-framerate', String(j.film.fps), '-start_number', '0', '-i', path.join(j.dir, 'frames', 'f%06d.png'), '-i', wav, '-frames:v', String(j.count), '-t', String(j.count / j.film.fps), '-c:v', 'libx264', '-preset', j.preset, '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', temp], {
        signal: j.abort.signal, onStderr: text => log(j, 'ffmpeg-stderr', { text }),
        onStdout: text => { j.lastProgress = new Date().toISOString(); log(j, 'encode-progress', { text }); }
      });
      j.metrics.encodeMs = Math.round(performance.now() - start);
      if (j.abort.signal.aborted) throw new Error('Cancelled');
      j.state = 'verifying'; log(j, 'probe-start'); await persist(j);
      j.validation = validateVideo(await probe(temp, { signal: j.abort.signal }), j.film, j.count);
      if (j.abort.signal.aborted) throw new Error('Cancelled');
      const artifact = path.join(j.dir, 'video.mp4'); await fs.rename(temp, artifact);
      const publish = path.join(outputRoot, `${j.name}.${j.id}.tmp.mp4`);
      await fs.copyFile(artifact, publish);
      if (j.abort.signal.aborted) { await fs.unlink(publish); throw new Error('Cancelled'); }
      await fs.rename(publish, path.join(outputRoot, j.name + '.mp4'));
      j.output = path.join(outputRoot, j.name + '.mp4'); j.state = 'succeeded'; j.metrics.totalMs = Date.now() - Date.parse(j.created);
      log(j, 'succeeded', { validation: j.validation, metrics: j.metrics }); await persist(j);
    } catch (e) { fail(j, e); }
    finally { encoding = false; try { await j.release?.(); } catch (e) { if (!quiet) console.error('Output reservation cleanup:', e.message); } }
  }
  async function handle(req, res) {
    const allowed = [new URL(url).host, `localhost:${new URL(url).port}`];
    if (!allowed.includes(req.headers.host)) throw error(403, 'Invalid host');
    const u = new URL(req.url, url), decoded = decodeURIComponent(u.pathname);
    if (req.headers.origin && ![url, url.replace('127.0.0.1', 'localhost')].includes(req.headers.origin)) throw error(403, 'Invalid origin');
    if (req.method === 'GET' && u.pathname === '/health') return json(res, 200, { ok: !closing, service: 'vido', version: 2 });
    if (req.method === 'GET' && u.pathname === '/session') return json(res, 200, { token, films });
    if (u.pathname.startsWith('/jobs')) {
      if (req.headers['x-vido-token'] !== token) throw error(403, 'Missing session token');
      if (u.pathname === '/jobs' && req.method === 'POST') {
        const input = JSON.parse((await body(req, 4096)).toString());
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw error(400, 'Expected a JSON object');
        const film = Object.hasOwn(films, input.film) ? films[input.film] : null;
        if (!film) throw error(400, 'Unknown film');
        const name = input.name ?? film.name;
        if (typeof name !== 'string' || !/^[a-zA-Z0-9][\w-]{0,79}$/.test(name)) throw error(400, 'Invalid output name');
        if (reservations.has(name) || [...jobs.values()].some(j => !terminal.has(j.state) && j.name === name)) throw error(409, 'Output name already has an active job');
        if (reservations.size + [...jobs.values()].filter(j => !terminal.has(j.state)).length >= 4) throw error(429, 'At most four active jobs');
        const count = number(input.frames ?? Math.round(film.duration * film.fps), 'frames', 1, Math.round(film.duration * film.fps));
        const preset = input.preset ?? 'slow'; if (!['slow', 'medium', 'fast'].includes(preset)) throw error(400, 'Invalid encoding preset');
        reservations.add(name); let release, registered = false;
        try {
          release = await acquireOutput(outputRoot, name);
          const id = crypto.randomUUID(), dir = path.join(outputRoot, 'jobs', id), hash = await sourceHash(film);
          await fs.mkdir(path.join(dir, 'frames'), { recursive: true }); const created = new Date().toISOString();
          const j = { id, dir, film, name, count, preset, release, sourceHash: hash, state: 'capturing', frames: new Set(), pending: new Set(), created, lastProgress: created, metrics: {}, io: Promise.resolve(), abort: new AbortController(), tools: input.tools };
          jobs.set(id, j); registered = true; log(j, 'created'); await persist(j); return json(res, 201, summary(j));
        } finally { reservations.delete(name); if (!registered) await release?.(); }
      }
      const m = u.pathname.match(/^\/jobs\/([a-f0-9-]{36})(?:\/(frame|finish|fail|cancel|event))?$/), j = m && jobs.get(m[1]);
      if (!j) throw error(404, 'Unknown job');
      if (req.method === 'GET' && !m[2]) return json(res, 200, summary(j));
      if (req.method !== 'POST') throw error(405, 'Method not allowed');
      if (m[2] === 'cancel') {
        if (!terminal.has(j.state)) { j.state = 'cancelled'; j.abort.abort(); log(j, 'cancelled'); if (!j.work) await j.release?.(); await persist(j); }
        return json(res, 200, summary(j));
      }
      if (m[2] === 'fail') { const input = JSON.parse((await body(req, 8192)).toString()); fail(j, new Error(String(input.error))); return json(res, 200, summary(j)); }
      if (m[2] === 'event') { const input = JSON.parse((await body(req, 8192)).toString()); log(j, 'worker', { details: input }); return json(res, 200, { ok: true }); }
      if (m[2] === 'frame') {
        if (j.state !== 'capturing') throw error(409, 'Job is not capturing');
        const i = number(u.searchParams.get('i'), 'frame', 0, j.count - 1);
        if (j.pending.size >= 8 || j.pending.has(i)) throw error(429, 'Upload busy; retry');
        j.pending.add(i);
        try {
          const png = await body(req, 8 * 1024 * 1024);
          try { validatePng(png, j.film.width, j.film.height); } catch (e) { throw error(400, e.message); }
          if (j.state !== 'capturing') throw error(409, 'Job stopped during upload');
          const file = path.join(j.dir, 'frames', `f${String(i).padStart(6, '0')}.png`);
          if (j.frames.has(i)) { if (!(await fs.readFile(file)).equals(png)) throw error(409, 'Different content for committed frame'); }
          else { await fs.writeFile(file + '.tmp', png); await fs.rename(file + '.tmp', file); j.frames.add(i); }
          j.lastProgress = new Date().toISOString();
          if (j.frames.size % 30 === 0 || j.frames.size === j.count) { log(j, 'frames', { received: j.frames.size, expected: j.count }); await persist(j); }
          return json(res, 200, { ok: true, index: i, received: j.frames.size });
        } finally { j.pending.delete(i); }
      }
      if (m[2] === 'finish') {
        if (j.state !== 'capturing') return json(res, 200, summary(j));
        if (j.pending.size || j.frames.size !== j.count) throw error(409, `Incomplete capture: ${j.frames.size}/${j.count}`);
        if (encoding) throw error(409, 'Another encode is running; retry later');
        encoding = true; j.state = 'validating'; j.work = encode(j); j.work.catch(e => fail(j, e)); return json(res, 202, summary(j));
      }
      throw error(404, 'Unknown operation');
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') throw error(405, 'Method not allowed');
    const relative = decoded === '/' ? 'index.html' : decoded.slice(1);
    if (!/^(index\.html|(?:js|apocalypse\/js|demo)\/[\w-]+\.(?:js|html)|apocalypse\/index\.html|lib\/(?:films|runtime|preview-audio|apocalypse-data)\.js)$/.test(relative)) throw error(404, 'Not found');
    const file = path.resolve(ROOT, relative), real = await fs.realpath(file);
    if (!inside(ROOT, real)) throw error(403, 'Path outside project');
    res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    const stream = createReadStream(real); stream.on('error', () => res.destroy()); stream.pipe(res);
  }
  const server = http.createServer((req, res) => { void handle(req, res).catch(e => {
    if (res.headersSent || res.destroyed) return res.destroy();
    const status = e.status ?? (e instanceof URIError || e instanceof SyntaxError ? 400 : e.code === 'ENOENT' ? 404 : 500);
    json(res, status, { error: status === 500 ? 'Internal server error; inspect server log' : e.message });
    if (status === 500 && !quiet) console.error(e);
  }); });
  server.requestTimeout = 30000; server.headersTimeout = 10000;
  const watchdog = setInterval(() => {
    for (const j of jobs.values()) if (j.state === 'capturing' && Date.now() - Date.parse(j.lastProgress) > 120000) fail(j, new Error('Capture stalled for two minutes'));
  }, 10000); watchdog.unref();
  return {
    token, jobs, get url() { return url; },
    listen(port = 0) { return new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', () => { url = `http://127.0.0.1:${server.address().port}`; resolve(url); }); }); },
    async close() {
      closing = true; clearInterval(watchdog);
      for (const j of jobs.values()) if (!terminal.has(j.state)) { j.state = 'cancelled'; j.abort.abort(); log(j, 'server-shutdown'); }
      server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
      await Promise.allSettled([...jobs.values()].map(j => j.work));
      await Promise.allSettled([...jobs.values()].map(persist));
      await Promise.allSettled([...jobs.values()].map(j => j.release?.()));
    }
  };
}
module.exports = { createCaptureServer };
