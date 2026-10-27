// THE NIGHT SHIFT — an original miniature about the people who keep the lights on.
'use strict';
const cv = document.getElementById('film'), g = cv.getContext('2d');
const C = { bg: '#101a2b', ink: '#20334a', cream: '#f4e9ce', mint: '#a5d8bd', coral: '#ef886f', gold: '#efca7e', dim: '#52677c' };
const clamp = x => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = x => x * x * (3 - 2 * x);
const hash = n => { const x = Math.sin(n * 127.1 + 37.8) * 43758.5453; return x - Math.floor(x); };
const lerp = (a, b, k) => a + (b - a) * k;
function circle(x, y, r, fill) { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
function line(points, color, width = 2) { g.strokeStyle = color; g.lineWidth = width; g.beginPath(); points.forEach(([x,y],i) => i ? g.lineTo(x,y) : g.moveTo(x,y)); g.stroke(); }
function text(s, x, y, size, color = C.cream, weight = 500, align = 'left') { g.font = `${weight} ${size}px 'Arial', sans-serif`; g.fillStyle = color; g.textAlign = align; g.fillText(s,x,y); }
function tracked(s,x,y,size=12,color=C.mint,spacing=3) { g.font=`600 ${size}px Arial`;g.fillStyle=color;g.textAlign='left';for(const ch of s){g.fillText(ch,x,y);x+=g.measureText(ch).width+spacing;} }
function star(x,y,r,color,rot=0) { g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=color;g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.23:r;i?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):g.moveTo(rr,0);}g.closePath();g.fill();g.restore(); }
const paper = document.createElement('canvas');paper.width=1280;paper.height=720;
const pg=paper.getContext('2d'), pixels=pg.createImageData(1280,720);
for(let i=0;i<pixels.data.length;i+=4){const n=hash(i);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=n>.5?255:0;pixels.data[i+3]=Math.floor(n*10);}
pg.putImageData(pixels,0,0);
const lamps = Array.from({length:28},(_,i)=>({x:65+hash(i+1)*1150,y:105+hash(i+71)*300,r:3+hash(i+100)*5,at:6.1+i*.13}));
const constellation = [[170,250],[245,195],[335,230],[400,145],[475,180],[560,122]];
function city(t) {
  const on=seg(t,6,11.5);
  for(let i=0;i<23;i++){
    const x=i*60-25,w=46+hash(i+9)*20,h=35+hash(i+13)*105,y=640-h;
    g.fillStyle=i%3===0?'#23384c':'#1b2e43';g.fillRect(x,y,w,h);
    if(i%4===0)line([[x+w/2,y],[x+w/2,y-18]],C.dim,1);
    for(let row=0;row<Math.floor(h/16)-1;row++)for(let col=0;col<3;col++){
      const lit=hash(i*31+row*5+col)<.22+on*.55;
      g.fillStyle=lit?(on>.1?C.gold:'#6d7d81'):'#2d4356';g.fillRect(x+8+col*12,y+12+row*16,5,7);
    }
  }
  g.fillStyle=C.bg;g.fillRect(0,640,1280,80);line([[54,640],[1226,640]],C.dim,1);
}
function moon(t) {
  const power=ease(seg(t,5.8,7)),x=935,y=237,r=118;
  if(power){g.save();const halo=g.createRadialGradient(x,y,70,x,y,230);halo.addColorStop(0,`rgba(239,202,126,${.20*power})`);halo.addColorStop(1,'rgba(239,202,126,0)');g.fillStyle=halo;g.fillRect(x-240,y-240,480,480);g.restore();}
  line([[x,0],[x,115]],C.dim,2);
  g.save();g.translate(x,y);g.rotate(-.08+Math.sin(t*.65)*.018);
  circle(0,0,r,power>.01?C.cream:'#71818a');
  g.save();g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.clip();circle(-48,5,110,power>.01?C.gold:'#526879');
  for(let i=0;i<8;i++){const xx=(hash(i+6)-.5)*190,yy=(hash(i+33)-.5)*200;g.globalAlpha=.13;circle(xx,yy,5+hash(i+8)*13,C.ink);}g.restore();
  g.strokeStyle=C.ink;g.lineWidth=3;g.beginPath();g.arc(28,-4,9,.1,Math.PI-.1);g.stroke();
  g.beginPath();g.arc(65,-5,9,.1,Math.PI-.1);g.stroke();
  g.beginPath();g.arc(48,24,15,0,Math.PI);g.stroke();circle(80,20,7,C.coral);
  g.restore();
  // Pendant base and power cable.
  g.fillStyle=C.mint;g.fillRect(x-22,352,44,13);g.fillStyle=C.ink;g.fillRect(x-16,365,32,10);
  g.strokeStyle=power>.1?C.mint:C.dim;g.lineWidth=3;g.beginPath();g.moveTo(x,375);g.bezierCurveTo(x,425,1080,390,1080,460);g.stroke();
}
function worker(t,x,y,scale=1,secondary=false) {
  const walk=ease(seg(t,.7,3.8)),bob=t<3.8?Math.sin(t*9)*3:Math.sin(t*1.8)*1;
  g.save();g.translate(x+(secondary?0:lerp(-95,0,walk)),y+bob);g.scale(scale,scale);
  const pull=ease(seg(t,4.5,5.8));
  line([[-9,37],[-12,55],[-24,55]],C.cream,7);line([[11,37],[17,55],[29,55]],C.cream,7);
  g.fillStyle=C.coral;g.beginPath();g.roundRect(-22,-1,44,42,9);g.fill();
  g.fillStyle=C.cream;g.fillRect(-18,22,36,6);circle(0,-20,28,C.cream);circle(6,-20,20,C.ink);
  line([[-5,-28],[8,-32]],C.mint,3);circle(17,-19,3,C.gold);
  line([[-18,7],[-35,18],[-37,1]],C.coral,9);
  const release=ease(seg(t,6.2,6.8)),reach=ease(seg(t,3.8,4.5));
  const handX=lerp(lerp(41,89,reach)*(1-pull)+59*pull,41,release),handY=lerp(lerp(12,47,pull),12,release);
  line([[19,8],[35,6],[handX,handY]],C.coral,9);circle(handX,handY,5,C.cream);
  if(secondary){star(-37,-6,11,C.gold,t*.3);}else{g.fillStyle=C.ink;g.fillRect(-10,5,20,12);text('02',0,15,10,C.cream,700,'center');}
  g.restore();
}
function platform(t) {
  const y=488;
  line([[755,y+25],[1175,y+25]],C.mint,3);
  g.fillStyle=C.ink;g.fillRect(750,y+25,430,15);
  for(let i=0;i<9;i++)line([[762+i*46,y+40],[778+i*46,y+25]],C.dim,2);
  line([[785,y+40],[800,566],[1135,566],[1155,y+40]],C.dim,2);
  g.fillStyle=C.mint;g.beginPath();g.roundRect(1040,449,76,64,7);g.fill();
  text('POWER',1078,500,10,C.ink,700,'center');
  circle(1078,466,12,C.ink);const k=ease(seg(t,4.5,5.8));line([[1078,466],[lerp(1090,1060,k),lerp(444,479,k)]],C.cream,6);
  circle(1127,480,4,t>5.8?C.gold:C.dim);
  worker(t,1001,432,1);worker(t,803,450,.7,true);
  // A tiny ladder down to the sleeping city.
  line([[865,529],[865,621]],C.dim,2);line([[890,529],[890,621]],C.dim,2);for(let yy=540;yy<622;yy+=15)line([[865,yy],[890,yy]],C.dim,2);
}
function renderAt(t) {
  g.resetTransform();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle=C.bg;g.fillRect(0,0,1280,720);
  if(t<0||t>=18)return;
  // Observatory diagram, printed on midnight blue stock.
  g.save();g.globalAlpha=.35;g.strokeStyle=C.dim;g.lineWidth=1;
  for(const r of [210,290,375]){g.beginPath();g.arc(935,237,r,-Math.PI*.95,Math.PI*.95);g.stroke();}g.restore();
  city(t);
  for(let i=0;i<lamps.length;i++){
    const s=lamps[i],k=ease(seg(t,s.at,s.at+.5)),tw=.85+.15*Math.sin(t*2+i);
    if(k){g.save();g.globalAlpha=k*tw;star(s.x,s.y,s.r*(1+.4*Math.sin(seg(t,s.at,s.at+.6)*Math.PI)),i%4?C.cream:C.mint);g.restore();}
    else {circle(s.x,s.y,1.2,C.dim);}
  }
  if(t>8){
    const progress=seg(t,8,11)*5;
    g.save();g.globalAlpha=.65;
    for(let i=0;i<5;i++){const k=clamp(progress-i);if(k)line([constellation[i],[lerp(constellation[i][0],constellation[i+1][0],k),lerp(constellation[i][1],constellation[i+1][1],k)]],C.mint,1.5);}
    g.restore();for(let i=0;i<6;i++){const [x,y]=constellation[i],a=seg(t,8+i*.5,8.4+i*.5);g.save();g.globalAlpha=a;star(x,y,7,C.gold);g.restore();}
  }
  moon(t);platform(t);
  // Shooting star carries the eye from the constellation to the lantern.
  const shooting=seg(t,10.7,12.1);
  if(shooting>0&&shooting<1){const x=lerp(470,1180,shooting),y=lerp(105,48,shooting)+Math.sin(shooting*Math.PI)*28;g.save();g.globalAlpha=Math.sin(shooting*Math.PI);line([[x-105,y+10],[x,y]],C.mint,2);star(x,y,8,C.cream);g.restore();}
  tracked('LUNAR LIGHTING DEPARTMENT',55,53,12,C.mint,3);
  text('EST. 4.5 BILLION YEARS AGO',1225,53,11,C.dim,500,'right');
  line([[55,70],[1225,70]],C.dim,1);
  const opening=1-ease(seg(t,3.4,4.4));
  g.save();g.globalAlpha=opening;
  tracked('A SMALL FILM ABOUT SHOWING UP',58,151,11,C.coral,2.2);
  text('THE NIGHT',52,257,89,C.cream,800);text('SHIFT',52,350,110,C.cream,800);
  text('While the world sleeps,',58,403,23,C.mint);text('someone clocks in.',58,434,23,C.mint);
  g.restore();
  const middle=ease(seg(t,4.2,4.8))*(1-ease(seg(t,7.1,7.8)));
  g.save();g.globalAlpha=middle;tracked('DAILY CHECKLIST / 001',58,180,12,C.coral,2.5);text('ONE SMALL',54,274,68,C.cream,800);text('SWITCH.',54,351,82,C.cream,800);text('A very important job.',58,404,21,C.mint);g.restore();
  const final=ease(seg(t,11.7,12.6));
  g.save();g.globalAlpha=final;
  tracked('FOR EVERYONE STILL FINDING THEIR WAY',58,354,10,C.coral,1.7);
  text('A LITTLE LIGHT.',54,419,58,C.cream,800);text('A LONG WAY HOME.',54,481,52,C.cream,800);
  g.restore();
  tracked(t<5.8?'STATUS: WARMING UP':t<11.5?'STATUS: MAKING A DIFFERENCE':'STATUS: ALL STARS ACCOUNTED FOR',56,676,10,t<5.8?C.dim:C.mint,1.8);
  text('NIGHT No. 000001',1225,676,12,C.cream,500,'right');
  g.drawImage(paper,0,0);
  const fade=Math.min(seg(t,0,.65),1-seg(t,17.3,18));if(fade<1){g.globalAlpha=1-fade;g.fillStyle=C.bg;g.fillRect(0,0,1280,720);g.globalAlpha=1;}
}
Vido.boot('nightshift',cv,renderAt);
