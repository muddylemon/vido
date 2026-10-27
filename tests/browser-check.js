'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises'), path = require('node:path');
const { createCaptureServer } = require('../lib/server');
const { launch, delay } = require('../lib/browser');
const films = require('../lib/films');
const targets = {
  metabolic: [0, .5, 1.5, 2.44, 2.7, 4, 6.8, 7.4, 8.62, 9.5, 9.9666667],
  apocalypse: [0, 5, 11, 11.35, 25.9666667, 26, 39.9666667, 40.35, 60.2, 64.35, 80.35, 90.35, 103.35, 117.8, 122.35, 129.9],
  nightshift: [0, 2, 5.8, 7, 10, 12.5, 16.5, 17.9]
};
async function main() {
  const app=createCaptureServer({quiet:true}); let browser; const result={};
  try {
    await app.listen();browser=await launch();
    for(const [id,times] of Object.entries(targets)){
      await browser.open(`${app.url}/${films[id].page}?capture`);
      await browser.cdp.evaluate(`window.frameHash = t => { renderAt(t); const b = document.getElementById('film').getContext('2d').getImageData(0,0,1280,720).data; let hash=2166136261; for(const v of b) hash=Math.imul(hash^v,16777619); return hash>>>0; };`);
      const hashes={}, images={};
      for(const t of times){
        const [first,repeat,seek]=await browser.cdp.evaluate(`[frameHash(${t}), frameHash(${t}), (frameHash(${times[(times.indexOf(t)+3)%times.length]}),frameHash(${t}))]`);
        assert.equal(first,repeat,`${id} repeat at ${t}`);assert.equal(first,seek,`${id} seek at ${t}`);hashes[t]=first;
        if([times[1],times[Math.floor(times.length/2)],times[times.length-2]].includes(t))images[t]=await browser.cdp.evaluate("document.getElementById('film').toDataURL()");
      }
      assert.equal(browser.cdp.errors.length,0);
      let freshMaxChannelDelta=0;
      for(const [time,png] of Object.entries(images)) {
        await browser.open(`${app.url}/${films[id].page}?capture`);
        // Canvas compositing may round by one 8-bit level on a fresh backing store.
        // Keep repeated/seeked frames byte-exact, and bound fresh-context differences.
        const delta=await browser.cdp.evaluate(`(async () => { renderAt(${time}); const current=document.getElementById('film').getContext('2d').getImageData(0,0,1280,720).data; const image=new Image();image.src=${JSON.stringify(png)};await image.decode();const c=document.createElement('canvas');c.width=1280;c.height=720;const g=c.getContext('2d');g.drawImage(image,0,0);const old=g.getImageData(0,0,1280,720).data;let max=0;for(let i=0;i<old.length;i++)max=Math.max(max,Math.abs(current[i]-old[i]));return max; })()`);
        assert.ok(delta<=1,`${id} fresh initialization at ${time}: max channel difference ${delta}`);freshMaxChannelDelta=Math.max(freshMaxChannelDelta,delta);
      }
      await browser.open(`${app.url}/${films[id].page}`);
      let audio, maxRoundTripMs=0;
      for(let i=0;i<300;i++) {
        const start=performance.now(); audio=await browser.cdp.evaluate('window.audioStatus?.()'); maxRoundTripMs=Math.max(maxRoundTripMs,performance.now()-start);
        if(audio?.error)throw new Error(`${id} preview audio: ${audio.error}`);
        if(audio?.ready)break;await delay(100);
      }
      assert.ok(audio?.ready,`${id} preview audio ready`);assert.ok(maxRoundTripMs<2000,`${id} preview remains responsive`);
      result[id]={frames:times.length,hashes,freshMaxChannelDelta,audioReady:true,maxRoundTripMs};console.log(`${id}: ${times.length} timestamps repeat/seek passed; fresh max delta ${freshMaxChannelDelta}/255; audio ready, max probe latency ${maxRoundTripMs.toFixed(0)} ms`);
    }
    const out=path.resolve(__dirname,'../out/browser-check.json');await fs.writeFile(out,JSON.stringify(result,null,2));
  }finally{await browser?.close();await app.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
