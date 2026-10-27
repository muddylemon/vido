#!/usr/bin/env node
'use strict';
const fs = require('node:fs/promises'), path = require('node:path');
const films = require('./lib/films');
const { createCaptureServer } = require('./lib/server');
const { browserPath, launch, delay } = require('./lib/browser');
const { integer, run, probe, validatePng } = require('./lib/media');
const ROOT = __dirname;
function options(args, allowed) {
  const result = { positional: [] };
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!key.startsWith('-')) { result.positional.push(key); continue; }
    if (!allowed.includes(key)) throw new Error(`Unknown option ${key}`);
    if (i + 1 >= args.length || args[i + 1].startsWith('-')) throw new Error(`Missing value for ${key}`);
    result[key] = args[++i];
  }
  return result;
}
function filmOption(value = 'apocalypse') {
  const film = Object.values(films).find(f => f.id === value || f.page === value);
  if (!film) throw new Error(`Unknown film. Choose: ${Object.keys(films).join(', ')}`); return film;
}
async function preflight() {
  const [executable, ffmpeg, ffprobe, encoders] = await Promise.all([browserPath(), run('ffmpeg', ['-version']), run('ffprobe', ['-version']), run('ffmpeg', ['-hide_banner', '-encoders'])]);
  if (!encoders.includes('libx264') || !/\baac\b/.test(encoders)) throw new Error('FFmpeg needs libx264 and AAC encoders');
  return { executable, ffmpeg: ffmpeg.split('\n')[0], ffprobe: ffprobe.split('\n')[0] };
}
async function record(args) {
  const o = options(args, ['--film', '--jobs', '--name', '--frames', '--preset']);
  if (o.positional.length) throw new Error('Unexpected positional arguments');
  const film = filmOption(o['--film']), count = integer(o['--frames'] ?? film.duration * film.fps, 'frames', 1, film.duration * film.fps);
  const workers = integer(o['--jobs'] ?? 2, 'jobs', 1, Math.min(8, count)), name = o['--name'] ?? film.name, preset = o['--preset'] ?? 'slow';
  if (!/^[a-zA-Z0-9][\w-]{0,79}$/.test(name)) throw new Error('Invalid output name');
  if (!['slow', 'medium', 'fast'].includes(preset)) throw new Error('Preset must be slow, medium, or fast');
  const tools = await preflight(), app = createCaptureServer({ quiet: true }), browsers = [];
  const abort = new AbortController(); let job;
  const stop = () => abort.abort(); process.once('SIGINT', stop); process.once('SIGTERM', stop);
  async function api(route, data) {
    const res = await fetch(app.url + route, { method: data === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', 'x-vido-token': app.token }, body: data === undefined ? undefined : JSON.stringify(data), signal: AbortSignal.timeout(30000) });
    const value = await res.json(); if (!res.ok) throw new Error(value.error); return value;
  }
  let progress;
  try {
    await app.listen(); job = await api('/jobs', { film: film.id, name, frames: count, preset, tools });
    const dir = path.join(ROOT, 'out', 'jobs', job.id);
    console.log(`Job ${job.id}: ${film.title}, ${count} frames, ${workers} workers`);
    let previous = '';
    progress = setInterval(() => {
      const j = app.jobs.get(job.id), status = `${j.state}: ${j.frames.size}/${count}`;
      if (status !== previous) { console.log(status); previous = status; }
    }, 2000);
    const cancelled = new Promise((_, reject) => abort.signal.addEventListener('abort', () => reject(new Error('Recording cancelled')), { once: true }));
    // Start all tasks, but await allSettled on cleanup so no worker is orphaned.
    const captures = Array.from({ length: workers }, (_, worker) => (async () => {
      const browser = await launch({ executable: tools.executable, logFile: path.join(dir, `browser-${worker}.log`) }); browsers.push(browser);
      if (abort.signal.aborted) throw new Error('Recording cancelled');
      await browser.open(`${app.url}/${film.page}?capture`);
      const version = await browser.cdp.call('Browser.getVersion');
      await api(`/jobs/${job.id}/event`, { event: 'browser-start', worker, version: version.product, userAgent: version.userAgent, fonts: await browser.cdp.evaluate("({palatino: document.fonts.check('16px Palatino'), serif: document.fonts.check('16px Georgia')})") });
      const config = { id: job.id, token: app.token, from: Math.floor(count * worker / workers), to: Math.floor(count * (worker + 1) / workers), worker };
      return browser.cdp.evaluate(`Vido.capture(${JSON.stringify(config)})`, 40 * 60 * 1000);
    })());
    try { await Promise.race([Promise.all(captures), cancelled]); }
    catch (e) { abort.abort(); await api(`/jobs/${job.id}/fail`, { error: e.message }).catch(() => {}); await Promise.allSettled(browsers.map(b => b.close())); await Promise.allSettled(captures); throw e; }
    if (abort.signal.aborted) throw new Error('Recording cancelled');
    await api(`/jobs/${job.id}/finish`, {});
    const deadline = Date.now() + 20 * 60 * 1000;
    do {
      if (abort.signal.aborted || Date.now() > deadline) throw new Error('Recording cancelled or encoding timed out');
      await delay(500); job = await api(`/jobs/${job.id}`);
    } while (!['succeeded', 'failed', 'cancelled'].includes(job.state));
    if (job.state !== 'succeeded') throw new Error(job.error || job.state);
    console.log(JSON.stringify({ output: job.output, validation: job.validation, metrics: job.metrics, manifest: path.join(dir, 'manifest.json') }, null, 2));
    return job;
  } catch (e) { if (job) await api(`/jobs/${job.id}/cancel`, {}).catch(() => {}); throw e; }
  finally { clearInterval(progress); process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); await Promise.allSettled(browsers.map(b => b.close())); await app.close(); }
}
async function still(args) {
  const o = options(args, ['--film', '-f', '--out', '-o', '--prefix', '-p']), film = filmOption(o['--film'] ?? o['-f']);
  const times = o.positional.map(Number);
  if (!times.length || times.some(t => !Number.isFinite(t) || t < 0 || t >= film.duration)) throw new Error(`Provide timestamps between 0 and ${film.duration} (exclusive)`);
  const prefix = o['--prefix'] ?? o['-p'] ?? film.id;
  if (!/^[\w-]+$/.test(prefix)) throw new Error('Invalid still prefix');
  const out = path.resolve(o['--out'] ?? o['-o'] ?? path.join(ROOT, 'out', 'stills'));
  const app = createCaptureServer({ quiet: true }); let browser;
  try {
    await app.listen(); browser = await launch(); await browser.open(`${app.url}/${film.page}?capture`); await fs.mkdir(out, { recursive: true });
    for (const t of times) {
      const data = await browser.cdp.evaluate(`(renderAt(${t}), document.getElementById('film').toDataURL('image/png'))`);
      const png = Buffer.from(data.split(',')[1], 'base64'); validatePng(png, film.width, film.height);
      const file = path.join(out, `${prefix}_${t}.png`); await fs.writeFile(file + '.tmp', png); await fs.rename(file + '.tmp', file); console.log(file);
    }
  } finally { await browser?.close(); await app.close(); }
}
async function sheet(args) {
  if (args.length > 2) throw new Error('Usage: sheet [video.mp4] [interval-seconds]');
  const file = path.resolve(args[0] ?? path.join(ROOT, 'out', 'apocalypse-of-peter.mp4')), interval = Number(args[1] ?? 2);
  if (!Number.isFinite(interval) || interval <= 0) throw new Error('Sheet interval must be positive');
  const info = await probe(file), duration = Number(info.format.duration), tiles = Math.ceil(duration / interval);
  if (!Number.isFinite(duration) || tiles > 720) throw new Error('Invalid duration or more than 720 tiles; increase interval');
  const filters = await run('ffmpeg', ['-hide_banner', '-filters']);
  if (!filters.includes('drawtext')) throw new Error('FFmpeg drawtext filter is required for timestamp labels');
  const candidates = process.platform === 'win32' ? ['C:/Windows/Fonts/arial.ttf'] : ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/System/Library/Fonts/Helvetica.ttc'];
  let font; for (const f of candidates) { try { await fs.access(f); font = f; break; } catch {} }
  if (!font) throw new Error('No contact-sheet font found');
  // Use a local copied font to avoid FFmpeg filter-path escaping across platforms.
  const fontFile = path.join(ROOT, 'out', 'sheet-font.ttf'); await fs.mkdir(path.dirname(fontFile), { recursive: true }); await fs.copyFile(font, fontFile);
  for (let p = 0; p < Math.ceil(tiles / 72); p++) {
    const count = Math.min(72, tiles - p * 72), cols = Math.min(4, count), rows = Math.ceil(count / cols);
    const out = file.replace(/\.[^.]+$/, '') + `-sheet${tiles > 72 ? '-' + (p + 1) : ''}.png`;
    const temp = out.replace(/\.png$/, '.tmp.png');
    const filter = `trim=start=${p * 72 * interval}:end=${Math.min(duration, (p + 1) * 72 * interval)},select='isnan(prev_selected_t)+gte(t-prev_selected_t,${interval})',scale=320:-1,drawtext=fontfile=out/sheet-font.ttf:text='%{pts\\:hms}':x=8:y=8:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.6,tile=${cols}x${rows}:nb_frames=${count}:padding=4:margin=4:color=0x101526`;
    await run('ffmpeg', ['-y', '-v', 'error', '-i', file, '-vf', filter, '-frames:v', '1', '-update', '1', temp]); await fs.rename(temp, out); console.log(out);
  }
}
async function main(args) {
  const [command, ...rest] = args;
  if (command === 'record') return record(rest);
  if (command === 'still') return still(rest);
  if (command === 'sheet') { process.chdir(ROOT); return sheet(rest); }
  throw new Error('Usage: node cli.js record|still|sheet [options]');
}
if (require.main === module) main(process.argv.slice(2)).catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { record, still, sheet, options, filmOption };
