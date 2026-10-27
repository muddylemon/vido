// Original, deterministic music-box / soft-jazz cue. All sound is synthesized locally.
(function(root){
  'use strict';
  function renderSoundtrack(sampleRate=48000,duration=18){
    const n=Math.round(sampleRate*duration),L=new Float32Array(n),R=new Float32Array(n),tau=Math.PI*2;
    const hz=m=>440*2**((m-69)/12);
    function note(at,len,m,gain=.15,pan=0,kind='bell'){
      const f=hz(m),start=Math.round(at*sampleRate),count=Math.round(len*sampleRate);
      for(let i=0;i<count&&start+i<n;i++){
        const t=i/sampleRate,attack=Math.min(1,t/.008),fade=Math.min(1,(len-t)/.08);
        let v;
        if(kind==='bass')v=(Math.sin(tau*f*t)+.2*Math.sin(tau*f*2*t))*Math.exp(-t*2.4)*attack*fade;
        else v=(Math.sin(tau*f*t)*Math.exp(-t*2.5)+.28*Math.sin(tau*f*2.004*t)*Math.exp(-t*6)+.12*Math.sin(tau*f*3*t)*Math.exp(-t*9))*attack*fade;
        if(start+i>=0){L[start+i]+=v*gain*(1-pan*.45);R[start+i]+=v*gain*(1+pan*.45);}
      }
    }
    const chords=[[48,55,59,62],[45,52,55,59],[41,48,52,57],[43,50,53,57]];
    for(let bar=0;bar<8;bar++){
      const at=.4+bar*2,chord=chords[bar%4];
      note(at,1.5,chord[0]-12,.13,0,'bass');note(at+1,1,chord[0]-5,.08,0,'bass');
      for(let j=0;j<4;j++)note(at+j*.5,1.8,chord[j]+12,.07,(j-1.5)*.3);
      if(bar>2)for(let j=0;j<4;j++)note(at+j*.5+.25,.65,chord[(j+2)%4]+24,.026,(j%2?1:-1)*.5);
    }
    // Switch click, then a rising ripple as the lamps come on.
    for(let i=0;i<Math.round(.045*sampleRate);i++){const k=Math.round(5.8*sampleRate)+i;if(k<n){const t=i/sampleRate,v=Math.sin(tau*850*t)*Math.exp(-t*120)*.23;L[k]+=v;R[k]+=v;}}
    [72,76,79,83,86,91].forEach((m,i)=>note(6+i*.15,2,m,.10,(i-2.5)*.15));
    [76,79,83,86,91].forEach((m,i)=>note(10.75+i*.16,1.8,m,.045,(i-2)*.2));
    [48,55,59,62,67,74].forEach((m,i)=>note(16+i*.035,2,m,.065,(i-2.5)*.12));
    // Short cross-channel echoes, then a gentle output fade.
    const delay=Math.round(.19*sampleRate);
    for(let k=delay;k<n;k++){L[k]+=R[k-delay]*.13;R[k]+=L[k-delay]*.13;}
    for(let k=0;k<n;k++){const t=k/sampleRate,fade=Math.min(1,t/.15,(duration-t)/.65);L[k]=Math.tanh(L[k]*1.3)*fade;R[k]=Math.tanh(R[k]*1.3)*fade;}
    return {L,R,sampleRate};
  }
  function toWav({L,R,sampleRate}){
    const b=new ArrayBuffer(44+L.length*4),v=new DataView(b),str=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
    str(0,'RIFF');v.setUint32(4,b.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,L.length*4,true);
    for(let i=0;i<L.length;i++){v.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);v.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true);}return b;
  }
  const api={renderSoundtrack,toWav};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Soundtrack=api;
})(globalThis);
