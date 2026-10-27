'use strict';
const fs = require('node:fs/promises'), path = require('node:path'), { Worker } = require('node:worker_threads');
const { run, probe, validateVideo } = require('./lib/media');
const film = require('./lib/films').metabolic;
const { acquireOutput } = require('./lib/output-lock');
const OUT = path.join(__dirname, 'out');
async function main() {
  if (process.argv.slice(2).some(a => a !== '--wav-only')) throw new Error('Usage: node make-audio.js [--wav-only]');
  const only = process.argv.includes('--wav-only'), master = path.join(OUT, film.name + '.mp4');
  if (!only) { try { await fs.access(master); } catch { throw new Error('Master MP4 is missing. Record metabolic first, or use --wav-only.'); } await run('ffmpeg', ['-version']); await run('ffprobe', ['-version']); }
  await fs.mkdir(OUT, { recursive: true });
  const unique = require('node:crypto').randomUUID(), wav = path.join(OUT, `soundtrack-${unique}.wav`);
  const releases = [];
  try {
    for (const name of ['soundtrack', ...(only ? [] : [film.name, film.name + '-share'])]) releases.push(await acquireOutput(OUT, name));
    await new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'lib/audio-worker.js'), { workerData: { module: path.join(__dirname, film.audio), duration: film.duration, output: wav } });
      worker.on('message', m => console.log(`Audio synthesized in ${m.elapsedMs} ms`)); worker.once('error', reject); worker.once('exit', code => code ? reject(new Error(`Audio worker exited ${code}`)) : resolve());
    });
    if (!only) {
      // Encode and verify both replacements before touching the existing master.
      const mux = path.join(OUT, `master-${unique}.tmp.mp4`), share = path.join(OUT, `share-${unique}.tmp.mp4`);
      await run('ffmpeg', ['-y', '-v', 'error', '-i', master, '-i', wav, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(film.duration), '-movflags', '+faststart', mux]);
      await run('ffmpeg', ['-y', '-v', 'error', '-i', mux, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', share]);
      validateVideo(await probe(mux), film, film.duration * film.fps); validateVideo(await probe(share), film, film.duration * film.fps);
      await fs.rename(share, path.join(OUT, film.name + '-share.mp4')); await fs.rename(mux, master);
    }
    await fs.rename(wav, path.join(OUT, 'soundtrack.wav')); console.log(only ? 'WAV ready' : 'Verified master and share copy updated');
  } catch (e) { console.error('Previous published media preserved where possible; intermediate files retained for diagnosis.'); throw e; } finally { await Promise.allSettled(releases.map(release => release())); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
