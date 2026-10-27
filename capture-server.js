'use strict';
const { createCaptureServer } = require('./lib/server');
if (require.main === module) {
  const port = Number(process.env.PORT ?? 8765);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1–65535');
  const app = createCaptureServer();
  app.listen(port).then(() => console.log(`Vido: ${app.url}`)).catch(e => { console.error(e.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => app.close());
}
module.exports = { createCaptureServer };
