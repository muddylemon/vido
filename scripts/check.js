'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
let count = 0;
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['out', 'node_modules', '.git'].includes(ent.name)) continue;
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(file);
    else if (file.endsWith('.js')) { new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file }); count++; }
  }
}
walk(path.resolve(__dirname, '..'));
const data = require('../lib/apocalypse-data'), films = require('../lib/films');
let end = 0;
for (const spec of Object.values(data.specs)) { if (spec.t0 !== end || spec.t1 <= spec.t0) throw new Error('Apocalypse timeline gap/overlap'); end = spec.t1; }
if (end !== films.apocalypse.duration) throw new Error('Timeline duration mismatch');
console.log(`${count} JavaScript files parsed; film metadata is consistent.`);
