(function(root){
 function renderSoundtrack(sampleRate=48000,duration=48){
 const L=new Float32Array(sampleRate*duration),R=new Float32Array(L.length);
 function note(at,len,m,amp){const f=440*2**((m-69)/12);for(let j=0;j<len*sampleRate&&Math.floor(at*sampleRate)+j<L.length;j++){let t=j/sampleRate,v=Math.sin(2*Math.PI*f*t)*Math.exp(-t*9)*Math.min(1,t*200)*amp,k=Math.floor(at*sampleRate)+j;L[k]+=v;R[k]+=v;}}
 for(let b=0;b<duration*2;b++){let at=b*.5;note(at,.4,[45,45,50,52][Math.floor(b/4)%4],.12);if(b%2) [69,72,76].forEach((m,j)=>note(at+j*.025,.3,m,.035));note(at+.25,.12,88,.025);}
 for(let s=0;s<8;s++){[72,76,79].forEach((m,j)=>note(s*6+.12+j*.09,.5,m,.13));if(s===3)[64,60,55,48].forEach((m,j)=>note(s*6+3+j*.15,.6,m,.14));}
 for(let k=0;k<L.length;k++){let fade=Math.min(1,k/sampleRate/.1,(duration-k/sampleRate)/.5);L[k]=Math.tanh(L[k])*fade;R[k]=Math.tanh(R[k])*fade;}return {L,R,sampleRate};}
 function toWav({L,R,sampleRate}){const b=new ArrayBuffer(44+L.length*4),v=new DataView(b),str=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,b.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,L.length*4,true);for(let i=0;i<L.length;i++){v.setInt16(44+i*4,L[i]*32767,true);v.setInt16(46+i*4,R[i]*32767,true);}return b;}
 const api={renderSoundtrack,toWav};if(typeof module!=='undefined')module.exports=api;else root.Soundtrack=api;
})(globalThis);
