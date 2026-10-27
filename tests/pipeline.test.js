'use strict';
const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs/promises'), path = require('node:path'), os = require('node:os'), zlib = require('node:zlib');
const { inside, integer, crc32, validatePng, validateVideo, run } = require('../lib/media');
const { createCaptureServer } = require('../lib/server');
const { options } = require('../cli');
function png(width=1280,height=720,shade=0) {
  const chunk=(type,data)=>{const name=Buffer.from(type),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);name.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([name,data])),data.length+8);return out;};
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
  const rows=Buffer.alloc((width*4+1)*height,shade);for(let i=0;i<height;i++)rows[i*(width*4+1)]=0;
  return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
test('paths, bounded integers, and option arity',()=>{
  const root=path.resolve('sample');assert.equal(inside(root,path.join(root,'..','sample-sibling','a')),false);assert.equal(inside(root,root),false);assert.equal(inside(root,path.join(root,'frames','a')),true);
  for(const x of ['../a',-1,1.5,'',null,'Infinity','00'])assert.throws(()=>integer(x,'frame',0,10));
  assert.equal(integer('0','frame',0,10),0);assert.throws(()=>options(['--jobs'],['--jobs']));assert.throws(()=>options(['--bad','2'],['--jobs']));
});
test('PNG validates compressed pixels, CRC, dimensions and truncation',()=>{
  const valid=png();validatePng(valid,1280,720);assert.throws(()=>validatePng(valid,640,360));assert.throws(()=>validatePng(valid.subarray(0,valid.length-2),1280,720));
  const damaged=Buffer.from(valid);damaged[50]^=1;assert.throws(()=>validatePng(damaged,1280,720));
});
test('subprocess launch failures reject without crashing',async()=>{await assert.rejects(run('vido-executable-that-does-not-exist',[],{timeout:1000}),/vido-executable/);});
test('probe validation rejects missing frames and audio',()=>{
  const film={width:1280,height:720,fps:30},v={codec_type:'video',width:1280,height:720,nb_read_frames:'30',avg_frame_rate:'30/1',duration:'1',codec_name:'h264'},a={codec_type:'audio',duration:'1',codec_name:'aac'};
  assert.equal(validateVideo({streams:[v,a]},film,30).frames,30);assert.throws(()=>validateVideo({streams:[v]},film,30));assert.throws(()=>validateVideo({streams:[v,a]},film,31));
});
test('HTTP boundaries, upload idempotency, cancellation and corrupt-frame publication guard',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'vido-test-')),app=createCaptureServer({outputRoot:root,quiet:true});await app.listen();
  const call=async(route,{method='GET',data,token=app.token,headers={}}={})=>{try { const res=await fetch(app.url+route,{method,headers:{'x-vido-token':token,...headers},body:data===undefined?undefined:Buffer.isBuffer(data)?data:JSON.stringify(data)});return{status:res.status,body:await res.json()}; } catch(e) { throw new Error(`${route}: ${e.message}`, {cause:e}); }};
  try{
    assert.equal((await call('/%ZZ')).status,400);assert.equal((await call('/..%5cvido-sibling%5cprobe.txt')).status,404);assert.equal((await call('/package.json')).status,404);
    assert.equal((await call('/jobs',{method:'POST',data:{film:'metabolic'},token:''})).status,403);
    assert.equal((await call('/jobs',{method:'POST',data:{film:'metabolic'},headers:{origin:'http://evil.invalid'}})).status,403);
    assert.equal((await call('/jobs',{method:'POST',data:{film:'metabolic',name:'../escape'}})).status,400);
    assert.equal((await call('/jobs',{method:'POST',data:{film:'metabolic',frames:0}})).status,400);
    assert.equal((await call('/jobs',{method:'POST',data:null})).status,400);
    const j=(await call('/jobs',{method:'POST',data:{film:'metabolic',frames:1,name:'preserved'}})).body;
    assert.equal((await call('/jobs',{method:'POST',data:{film:'metabolic',name:'preserved'}})).status,409);
    assert.equal((await call(`/jobs/${j.id}/finish`,{method:'POST',data:{}})).status,409);
    assert.equal((await call(`/jobs/${j.id}/frame?i=x/../../escape`,{method:'POST',data:png()})).status,400);
    assert.equal((await call(`/jobs/${j.id}/frame?i=0`,{method:'POST',data:Buffer.from('bad')})).status,400);
    assert.equal((await call(`/jobs/${j.id}/frame?i=0`,{method:'POST',data:Buffer.alloc(9*1024*1024)})).status,413);
    const valid=png();assert.equal((await call(`/jobs/${j.id}/frame?i=0`,{method:'POST',data:valid})).status,200);
    assert.equal((await call(`/jobs/${j.id}/frame?i=0`,{method:'POST',data:valid})).body.received,1);
    assert.equal((await call(`/jobs/${j.id}/frame?i=0`,{method:'POST',data:png(1280,720,42)})).status,409);
    await fs.writeFile(path.join(root,'preserved.mp4'),'previous valid artifact');
    await fs.writeFile(path.join(root,'jobs',j.id,'frames','f000000.png'),'corrupted after upload');
    assert.equal((await call(`/jobs/${j.id}/finish`,{method:'POST',data:{}})).status,202);
    await app.jobs.get(j.id).work;
    assert.equal((await call(`/jobs/${j.id}`)).body.state,'failed');assert.equal(await fs.readFile(path.join(root,'preserved.mp4'),'utf8'),'previous valid artifact');
    const j2=(await call('/jobs',{method:'POST',data:{film:'metabolic',frames:1}})).body;
    assert.equal((await call(`/jobs/${j2.id}/cancel`,{method:'POST',data:{}})).body.state,'cancelled');
    assert.equal((await call(`/jobs/${j2.id}/frame?i=0`,{method:'POST',data:valid})).status,409);
    const j3=(await call('/jobs',{method:'POST',data:{film:'metabolic',frames:1,name:'encoder-failure'}})).body;
    await call(`/jobs/${j3.id}/frame?i=0`,{method:'POST',data:valid});
    await fs.writeFile(path.join(root,'encoder-failure.mp4'),'prior master');
    const savedPath=process.env.PATH;
    try {
      process.env.PATH='';
      await call(`/jobs/${j3.id}/finish`,{method:'POST',data:{}}); await app.jobs.get(j3.id).work;
      assert.equal((await call(`/jobs/${j3.id}`)).body.state,'failed');
      assert.equal(await fs.readFile(path.join(root,'encoder-failure.mp4'),'utf8'),'prior master');
    } finally { process.env.PATH=savedPath; }
    assert.equal((await call('/health')).body.ok,true);
  }finally{await app.close();const real=await fs.realpath(root),tmp=await fs.realpath(os.tmpdir());if(path.dirname(real).toLowerCase()===tmp.toLowerCase()&&path.basename(real).startsWith('vido-test-'))await fs.rm(real,{recursive:true,force:true});}
});
test('output reservation covers separate server instances and releases cleanly',async()=>{
  const { acquireOutput }=require('../lib/output-lock');
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'vido-test-lock-'));
  const release=await acquireOutput(root,'video');await assert.rejects(acquireOutput(root,'video'),/reserved/);await release();
  const next=await acquireOutput(root,'video');await next();
  const real=await fs.realpath(root),tmp=await fs.realpath(os.tmpdir());if(path.dirname(real).toLowerCase()===tmp.toLowerCase()&&path.basename(real).startsWith('vido-test-lock-'))await fs.rm(real,{recursive:true,force:true});
});
test('demo audio has valid PCM and repeatable synthesis',()=>{
  const {renderSoundtrack,toWav}=require('../demo/score');const a=renderSoundtrack(48000,1),b=renderSoundtrack(48000,1);
  assert.deepEqual(a.L,b.L);assert.equal(a.L.length,48000);for(const x of a.L)assert.ok(Number.isFinite(x)&&Math.abs(x)<=1);
  const wav=Buffer.from(toWav(a));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.length,192044);assert.equal(wav.readUInt32LE(24),48000);
});
