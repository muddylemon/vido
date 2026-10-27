'use strict';
const { test } = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
async function driver({ failureStatus, nullBlob = false, throwingDraw = false } = {}) {
  let attempts = 0, failures = 0;
  const sandbox = { URLSearchParams, location: { search: '?capture' }, performance, Blob, AbortSignal, setTimeout: fn => { fn(); }, addEventListener() {}, console: { error() {} }, document: { fonts: { ready: Promise.resolve() }, title: '' }, VIDO_FILMS: require('../lib/films') };
  sandbox.window = sandbox;
  sandbox.fetch = async (url, opts) => {
    if (url.endsWith('/fail')) { failures++; return { ok: true, json: async () => ({}) }; }
    if (url.endsWith('/event')) return { ok: true, json: async () => ({}) };
    if (url.includes('/frame?')) { attempts++; return { ok: !failureStatus, status: failureStatus || 200, json: async () => failureStatus ? { error: 'injected upload failure' } : { ok: true } }; }
    return { ok: true, json: async () => ({ film: 'metabolic', expected: 1 }) };
  };
  vm.runInNewContext(fs.readFileSync('lib/runtime.js', 'utf8'), sandbox);
  await sandbox.Vido.boot('metabolic', { width: 1280, height: 720, toBlob: fn => fn(nullBlob ? null : new Blob(['png'])) }, () => { if (throwingDraw) throw new Error('injected artwork failure'); });
  return { sandbox, capture: () => sandbox.Vido.capture({ id: 'job', token: 'test', from: 0, to: 1 }), counts: () => ({ attempts, failures }) };
}
test('HTTP 500 retries are bounded and recording does not succeed', async () => {
  const d = await driver({ failureStatus: 500 }); await assert.rejects(d.capture(), /upload failure/);
  assert.deepEqual(d.counts(), { attempts: 3, failures: 1 }); assert.equal(d.sandbox.__captureStatus.state, 'failed'); assert.notEqual(d.sandbox.__recorded, true);
});
test('HTTP 400 fails immediately', async () => { const d = await driver({ failureStatus: 400 }); await assert.rejects(d.capture()); assert.equal(d.counts().attempts, 1); });
test('null PNG and draw exceptions stop before upload', async () => {
  for (const config of [{ nullBlob: true }, { throwingDraw: true }]) { const d = await driver(config); await assert.rejects(d.capture()); assert.deepEqual(d.counts(), { attempts: 0, failures: 1 }); }
});
test('worker completion is distinct from verified encode success', async () => {
  const d = await driver(); await d.capture(); assert.equal(d.sandbox.__captureStatus.state, 'captured'); assert.notEqual(d.sandbox.__recorded, true);
});
