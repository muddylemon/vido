'use strict';
const cv=document.getElementById('film'),g=cv.getContext('2d');
const cream='#fff3d5',ink='#201b34',gold='#ffce45',pink='#ff6389',mint='#79edcb';
const scenes=[
 ['THE HOUSE\nALWAYS WINS','Welcome to the casino.\nA vision board with an ATM.','HOPE SOLD SEPARATELY'],
 ['FREE MONEY!*','Your first bet is free.\nSo is the first bite on a fishhook.','*TERMS, CONDITIONS & A HOOK'],
 ['SO CLOSE!','Two cherries and a lemon!\nThat is almost retirement.','ACTUAL RESULT: STILL A LEMON'],
 ['A BIG WIN!','I won twenty bucks!\nIt only cost me eighty.','ENTREPRENEURSHIP'],
 ['THE VIP EXPERIENCE','They called me a VIP.\nVery Important Payment.','YOUR LOSSES HAVE BEEN RECOGNIZED'],
 ['ONE MORE SPIN','I am due a win.\nThe machine is due a yacht.','BOTH HAVE DREAMS'],
 ['PLAY RESPONSIBLY','Please gamble responsibly.\nOur yacht depends on it.','A MESSAGE FROM THE HOUSE'],
 ['THE HOUSE\nALWAYS WINS','The house always wins.\nWeird. I came here to afford one.','THANK YOU FOR YOUR DONATION']
];
function rect(x,y,w,h,c,r=20){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
function line(x,y,X,Y,c=ink,w=9){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();}
function circle(x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
function text(s,x,y,size=40,c=cream){g.fillStyle=c;g.font=`900 ${size}px Arial`;g.textAlign='center';g.fillText(s,x,y);}
function lines(s,x,y,size,c,leading=1.15){s.split('\n').forEach((s,i)=>text(s,x,y+i*size*leading,size,c));}
function person(x,y,t,sad=false){
 g.save();g.translate(x,y+Math.sin(t*4)*5);
 line(-36,150,-46,246);line(36,150,50,246);line(-48,247,-78,247);line(49,247,80,247);
 rect(-73,10,146,155,mint,35);line(-65,45,-113,120);line(65,45,110,90);
 circle(0,-55,73,'#f7b98b');g.fillStyle=ink;g.beginPath();g.arc(0,-77,67,Math.PI,Math.PI*2);g.fill();
 circle(-26,-62,6,ink);circle(26,-62,6,ink);
 g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.arc(0,sad?-8:-37,27,sad?Math.PI:0,sad?Math.PI*2:Math.PI);g.stroke();
 line(-38,-91,-12,sad?-82:-96);line(12,sad?-82:-96,38,-91);g.restore();
}
function machine(x,y,t,scene){
 g.save();g.translate(x,y);g.rotate(Math.sin(t*2)*.018);rect(-180,-260,360,510,ink,35);rect(-164,-244,328,480,pink,26);
 rect(-145,-224,290,76,gold);text(scene>=6?'THE HOUSE':'ALMOST!',0,-174,38,ink);
 rect(-145,-124,290,174,cream);for(let j=0;j<3;j++){rect(-132+j*92,-111,80,148,'#e7dcc6',10);text(scene===2?(j===2?'L':'C'):(Math.floor(t*8+j)%7).toString(),-92+j*92,-14,65,ink);}
 rect(-125,88,250,62,ink);text(scene===3?'+$20':'TRY AGAIN',0,131,32,gold);
 for(let j=0;j<7;j++)circle(-135+j*45,204,9,Math.floor(t*5+j)%2?gold:cream);
 line(182,-20,225,-85,gold,15);circle(225,-100,23,pink);
 circle(-53,-184,6,ink);circle(53,-184,6,ink);g.restore();
}
function money(x,y,a=0){g.save();g.translate(x,y);g.rotate(a);rect(-49,-25,98,50,mint,4);text('$',0,15,38,ink);g.restore();}
function yacht(t){g.save();g.translate(540,930+Math.sin(t*2)*12);g.fillStyle=cream;g.beginPath();g.moveTo(-330,60);g.lineTo(340,60);g.lineTo(250,170);g.lineTo(-220,170);g.closePath();g.fill();rect(-160,-45,310,95,gold);rect(-60,-130,180,90,cream);for(let j=0;j<4;j++)rect(-130+j*75,-25,48,38,ink,5);text('HOUSE MONEY',30,128,32,ink);line(150,-130,150,-230,cream,7);g.fillStyle=pink;g.beginPath();g.moveTo(150,-230);g.lineTo(250,-185);g.lineTo(150,-165);g.fill();g.restore();}
function renderAt(t){
 const s=Math.min(7,Math.floor(t/6)),u=t-s*6,beat=scenes[s];
 g.fillStyle=ink;g.fillRect(0,0,1080,1920);
 // Printed comic dots and rotating show-business rays.
 g.save();g.translate(540,870);g.rotate(t*.025);for(let i=0;i<16;i++){g.rotate(Math.PI/8);g.fillStyle=i%2?'#29213e':'#302540';g.beginPath();g.moveTo(0,0);g.lineTo(-200,-1800);g.lineTo(200,-1800);g.fill();}g.restore();
 g.fillStyle='#ffffff09';for(let y=35;y<1900;y+=42)for(let x=30;x<1080;x+=42){g.beginPath();g.arc(x,y,2,0,7);g.fill();}
 rect(70,128,940,55,pink,10);text('A LITTLE HOPE. A LOT OF TERMS & CONDITIONS.',540,165,25,ink);
 const pop=1+Math.sin(Math.min(u,.35)/.35*Math.PI)*.07;g.save();g.translate(540,290);g.scale(pop,pop);lines(beat[0],0,0,76,gold);g.restore();
 if(s===5||s===6){for(let j=0;j<4;j++){g.strokeStyle=mint;g.lineWidth=6;g.beginPath();for(let x=0;x<=1080;x+=10){const y=1110+j*40+Math.sin(x*.015+t*2+j)*14;x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}yacht(t);person(200,1040,t,true);}
 else {person(270,940,t,s>=3);machine(715,900,t,s);}
 if(s===0||s===1||s===4){for(let j=0;j<6;j++){let p=(u*.35+j/6)%1;money(330+p*350,760-Math.sin(p*Math.PI)*180,p*.5);}}
 if(s===1){line(520,520,520,670,cream,5);g.strokeStyle=cream;g.lineWidth=9;g.beginPath();g.arc(490,670,30,0,Math.PI);g.stroke();money(520,600,-.2);}
 if(s===2){rect(140,540,800,100,cream);text('C     C     L',540,612,70,ink);}
 if(s===3){rect(120,520,840,128,cream);text('PAID $80   /   WON $20',540,572,40,ink);text('PROFIT: PLEASE STOP ASKING',540,620,29,'#b43357');}
 if(s===4){g.save();g.translate(270,900);g.rotate(-.13);rect(-125,-30,250,65,gold);text('V.I.P.',0,17,50,ink);g.restore();}
 if(s===7){rect(500,570,380,90,cream);text('FOR SALE',690,631,48,ink);text('NOT TO YOU',690,701,29,pink);}
 rect(70,1320,940,255,cream,28);lines(beat[1],540,1411,46,ink,1.4);
 rect(96,1625,888,66,pink,10);text(beat[2],540,1668,27,ink);
 text('THE HOUSE ALWAYS WINS  /  A CASINO COMEDY',540,1765,23,cream);
 for(let j=0;j<8;j++)rect(395+j*39,1810,24,7,j<=s?gold:'#62556c',3);
 // Quick ink wipes separate panels without covering punchlines.
 if(u<.13&&s>0){g.fillStyle=gold;g.fillRect(0,0,1080*(1-u/.13),1920);}
}
Vido.boot('house',cv,renderAt);
