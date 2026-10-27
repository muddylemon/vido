'use strict';
self.onmessage = ({ data }) => {
  try {
    if (data.module.includes('/apocalypse/')) importScripts('/lib/apocalypse-data.js');
    importScripts(data.module);
    const { L, R } = self.Soundtrack.renderSoundtrack(data.sampleRate, data.duration);
    self.postMessage({ L: L.buffer, R: R.buffer }, [L.buffer, R.buffer]);
  } catch (e) { self.postMessage({ error: e.message }); }
};
