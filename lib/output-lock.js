'use strict';
const fs = require('node:fs/promises'), path = require('node:path'), crypto = require('node:crypto');
// A filesystem reservation also protects separate CLI/server processes.
async function acquireOutput(root, name) {
  if (!/^[a-zA-Z0-9][\w-]{0,79}$/.test(name)) throw new Error('Invalid output name');
  const dir = path.join(root, 'locks'), file = path.join(dir, name + '.json'), owner = crypto.randomUUID();
  await fs.mkdir(dir, { recursive: true });
  let handle;
  try { handle = await fs.open(file, 'wx'); }
  catch (e) {
    if (e.code !== 'EEXIST') throw e;
    // Never race another process by automatically unlinking a stale reservation.
    throw Object.assign(new Error(`Output ${name} is reserved; inspect ${file} before retrying`), { status: 409 });
  }
  try { await handle.writeFile(JSON.stringify({ owner, pid: process.pid, created: new Date().toISOString() })); } finally { await handle.close(); }
  return async () => { try { if (JSON.parse(await fs.readFile(file, 'utf8')).owner === owner) await fs.unlink(file); } catch (e) { if (e.code !== 'ENOENT') throw e; } };
}
module.exports = { acquireOutput };
