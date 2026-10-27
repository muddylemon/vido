'use strict';
const { spawn } = require('node:child_process');
const { inflateSync } = require('node:zlib');
const path = require('node:path');
const fs = require('node:fs/promises');
function inside(root, target) {
  const rel = path.relative(path.resolve(root), path.resolve(target));
  return rel !== '' && !path.isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + path.sep);
}
function integer(value, label, min, max) {
  if (!/^(0|[1-9]\d*)$/.test(String(value))) throw new Error(`${label} must be an integer`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${label} must be ${min}–${max}`);
  return n;
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function validatePng(b, width, height) {
  if (b.length < 45 || !b.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) throw new Error('Invalid PNG signature');
  let p = 8, channels, ended = false, header = false; const data = [];
  while (p + 12 <= b.length) {
    const n = b.readUInt32BE(p), end = p + 12 + n;
    if (end > b.length) throw new Error('Truncated PNG');
    const type = b.toString('ascii', p + 4, p + 8), chunk = b.subarray(p + 8, p + 8 + n);
    if (crc32(b.subarray(p + 4, p + 8 + n)) !== b.readUInt32BE(p + 8 + n)) throw new Error('PNG CRC mismatch');
    if (!header && type !== 'IHDR') throw new Error('Missing PNG header');
    if (type === 'IHDR') {
      if (header || n !== 13 || chunk.readUInt32BE(0) !== width || chunk.readUInt32BE(4) !== height) throw new Error('PNG dimensions do not match film');
      if (chunk[8] !== 8 || ![2, 6].includes(chunk[9]) || chunk[10] || chunk[11] || chunk[12]) throw new Error('Unsupported PNG format');
      channels = chunk[9] === 6 ? 4 : 3; header = true;
    } else if (type === 'IDAT') data.push(chunk);
    else if (type === 'IEND') { if (n !== 0 || end !== b.length) throw new Error('Invalid PNG end'); ended = true; break; }
    p = end;
  }
  if (!ended || !data.length) throw new Error('Incomplete PNG');
  const stride = width * channels + 1, expected = stride * height;
  const rows = inflateSync(Buffer.concat(data), { maxOutputLength: expected });
  if (rows.length !== expected) throw new Error('Invalid PNG pixel data');
  for (let y = 0; y < height; y++) if (rows[y * stride] > 4) throw new Error('Invalid PNG filter');
}
function run(command, args, { signal, timeout = 600000, onStderr, onStdout } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], signal });
    let stdout = '', stderr = '';
    const timer = setTimeout(() => child.kill(), timeout);
    child.stdout.on('data', b => { stdout = (stdout + b).slice(-2 * 1024 * 1024); onStdout?.(String(b)); });
    child.stderr.on('data', b => { stderr = (stderr + b).slice(-65536); onStderr?.(String(b)); });
    child.once('error', e => { clearTimeout(timer); reject(new Error(`${command}: ${e.message}`)); });
    child.once('close', (code, sig) => { clearTimeout(timer); code === 0 ? resolve(stdout) : reject(new Error(`${command} failed (${code ?? sig}): ${stderr.slice(-3000)}`)); });
  });
}
async function probe(file, options) { return JSON.parse(await run('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file], options)); }
function validateVideo(info, film, frameCount) {
  const video = info.streams.find(s => s.codec_type === 'video'), audio = info.streams.find(s => s.codec_type === 'audio');
  const duration = frameCount / film.fps;
  if (!video || !audio || video.width !== film.width || video.height !== film.height || Number(video.nb_read_frames) !== frameCount) throw new Error('Encoded video dimensions, streams, or frame count are incorrect');
  const [a, b] = video.avg_frame_rate.split('/').map(Number);
  if (Math.abs(a / b - film.fps) > .001 || Math.abs(Number(video.duration) - duration) > 1 / film.fps + .001 || Math.abs(Number(audio.duration) - duration) > .15 || ![Number(video.duration), Number(audio.duration)].every(Number.isFinite)) throw new Error('Encoded video/audio timing is incorrect');
  return { frames: Number(video.nb_read_frames), width: video.width, height: video.height, fps: a / b, videoDuration: Number(video.duration), audioDuration: Number(audio.duration), videoCodec: video.codec_name, audioCodec: audio.codec_name };
}
async function atomicJson(file, value) { const tmp = file + '.tmp'; await fs.writeFile(tmp, JSON.stringify(value, null, 2) + '\n'); await fs.rename(tmp, file); }
module.exports = { inside, integer, crc32, validatePng, run, probe, validateVideo, atomicJson };
