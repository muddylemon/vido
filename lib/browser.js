'use strict';
const fs = require('node:fs/promises'), path = require('node:path'), os = require('node:os');
const { spawn } = require('node:child_process');
const { run } = require('./media');
const delay = ms => new Promise(r => setTimeout(r, ms));
async function browserPath() {
  const choices = [process.env.VIDO_BROWSER, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/chromium', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  for (const file of choices) { try { await fs.access(file); return file; } catch {} }
  throw new Error('Edge/Chrome not found. Set VIDO_BROWSER to its executable path.');
}
class CDP {
  constructor(socket) {
    this.socket = socket; this.seq = 0; this.pending = new Map(); this.errors = [];
    socket.addEventListener('message', e => {
      const msg = JSON.parse(String(e.data));
      if (msg.id) {
        const p = this.pending.get(msg.id); if (!p) return;
        clearTimeout(p.timer); this.pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') this.errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    });
    socket.addEventListener('close', () => { for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error('Browser disconnected')); } this.pending.clear(); });
  }
  call(method, params = {}, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const id = ++this.seq, timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`${method} timed out`)); }, timeout);
      this.pending.set(id, { resolve, reject, timer }); this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression, timeout = 30000) {
    const result = await this.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, timeout);
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
}
async function launch({ executable, logFile, width = 1280, height = 720 } = {}) {
  executable ??= await browserPath();
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'vido-'));
  const child = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--disable-background-timer-throttling', '--remote-debugging-port=0', `--user-data-dir=${profile}`, `--window-size=${width},${height}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let launchError, stderr = '', logQueue = Promise.resolve();
  child.on('error', e => { launchError = e; });
  child.stderr.on('data', b => { stderr = (stderr + b).slice(-4000); if (logFile) logQueue = logQueue.then(() => fs.appendFile(logFile, b)).catch(() => {}); });
  let cdp, closed = false;
  const close = async () => {
    if (closed) return; closed = true;
    cdp?.socket.close();
    if (child.exitCode === null && child.pid) {
      if (process.platform === 'win32') await run('taskkill', ['/F', '/T', '/PID', String(child.pid)], { timeout: 10000 }).catch(() => child.kill());
      else child.kill();
    }
    await logQueue;
    // Only remove the exact random directory allocated by this launch.
    const parent = await fs.realpath(os.tmpdir()), real = await fs.realpath(profile).catch(() => null);
    if (real && path.dirname(real).toLowerCase() === parent.toLowerCase() && path.basename(real).startsWith('vido-')) await fs.rm(real, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
  };
  try {
    let port;
    for (let i = 0; i < 150; i++) {
      if (launchError || child.exitCode !== null) throw new Error(`Browser startup failed: ${launchError?.message || stderr}`);
      try { port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); } catch {}
      if (port) break; await delay(100);
    }
    if (!port) throw new Error('Browser startup timed out');
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(10000) })).json();
    const tab = tabs.find(t => t.type === 'page'); if (!tab) throw new Error('No browser page');
    const socket = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('Browser connection timeout')), 10000); socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true }); socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Browser connection failed')); }, { once: true }); });
    cdp = new CDP(socket); await cdp.call('Runtime.enable');
    await cdp.call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    return { cdp, close, async open(url) {
      cdp.errors.length = 0; await cdp.call('Page.navigate', { url });
      for (let i = 0; i < 600; i++) {
        await delay(100);
        if (cdp.errors.length) throw new Error(cdp.errors.join('\n'));
        const state = await cdp.evaluate('({ready:!!window.__ready, errors:window.__filmErrors, status:window.__captureStatus})');
        if (state.errors?.length) throw new Error(state.errors.join('; '));
        if (state.ready) return;
      }
      throw new Error('Film readiness timed out');
    } };
  } catch (e) { await close(); throw e; }
}
module.exports = { launch, browserPath, delay };
