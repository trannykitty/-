(function(){
"use strict";

var canvas=document.getElementById("game");
var ctx=canvas.getContext("2d");
var menu=document.getElementById("menu");
var hud=document.getElementById("hud");
var pauseScreen=document.getElementById("pauseScreen");
var over=document.getElementById("over");
var errorBox=document.getElementById("error");

var W=window.innerWidth,H=window.innerHeight,dpr=1;
var state="menu",mode="normal";
var mice=[],particles=[];
var score=0,caught=0,combo=0,best=Number(localStorage.getItem("MadMiceBest")||0);
var spawnTimer=0,lastTime=0;
var soundEnabled=true;
var catchSound=document.getElementById("catchSound");var goldSound=document.getElementById("goldSound");

function playCatchSound(isGold){
  if(!soundEnabled)return;
  try{
    var snd=isGold?goldSound:catchSound;
    if(!snd)return;
    snd.currentTime=0;
    snd.volume=isGold?0.9:0.85;
    var p=snd.play();
    if(p&&p.catch)p.catch(function(){});
  }catch(e){}
}


function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth; H=window.innerHeight;
  canvas.width=Math.floor(W*dpr);
  canvas.height=Math.floor(H*dpr);
  canvas.style.width=W+"px";
  canvas.style.height=H+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize",resize);
resize();

function rand(a,b){return a+Math.random()*(b-a)}

function updateHud(){
  document.getElementById("score").textContent=score;
  document.getElementById("combo").textContent="x"+Math.max(1,combo);
  document.getElementById("best").textContent=best;
}

function startGame(selectedMode){
  mode=selectedMode;
  state="playing";
  score=0;
  caught=0;
  combo=0;
  spawnTimer=999;
  mice=[];
  particles=[];

  menu.classList.add("hidden");
  over.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  hud.classList.remove("hidden");

  updateHud();

  /* Spawn immediately so the game visibly starts. */
  spawnMouse();
  spawnMouse();

  lastTime=performance.now();
  requestAnimationFrame(gameLoop);
}

function spawnMouse(){
  var fromLeft=Math.random()<0.5;
  var level=1+Math.floor(score/15);
  var speed=55+Math.random()*45+level*2;
  var m={
    x:fromLeft?-70:W+70,
    y:100+Math.random()*Math.max(80,H-190),
    vx:fromLeft?speed:-speed,
    phase:Math.random()*Math.PI*2,
    wiggle:5+Math.random()*8,
    size:.9+Math.random()*.18,
    gold:Math.random()<.08
  };
  mice.push(m);
}

function drawBackground(){
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#66777b");
  g.addColorStop(.55,"#526366");
  g.addColorStop(1,"#354447");
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,H);

  ctx.globalAlpha=.07;
  ctx.strokeStyle="#ffffff";
  var i;
  for(i=0;i<W;i+=90){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke()}
  for(i=0;i<H;i+=90){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke()}
  ctx.globalAlpha=1;
}

function drawMouse(m){
  var y=m.y+Math.sin(m.phase)*m.wiggle;
  ctx.save();
  ctx.translate(m.x,y);
  ctx.scale(m.vx<0?-m.size:m.size,m.size);

  ctx.strokeStyle=m.gold?"#e4c97c":"#aeb7b8";
  ctx.lineWidth=4;
  ctx.beginPath();
  ctx.arc(-27,7,19,.4,4.8);
  ctx.stroke();

  ctx.fillStyle=m.gold?"#cbb574":"#aab3b5";
  ctx.beginPath();
  ctx.ellipse(0,8,29,19,0,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle=m.gold?"#dcc886":"#bdc5c7";
  ctx.beginPath();
  ctx.arc(28,5,17,0,Math.PI*2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(25,-9,11,0,Math.PI*2);
  ctx.arc(37,-7,10,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="#101719";
  ctx.beginPath();
  ctx.arc(36,1,2.5,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="#e7a1ab";
  ctx.beginPath();
  ctx.arc(44,8,3,0,Math.PI*2);
  ctx.fill();


  // Tiny animated feet
  var footBob = Math.sin(m.phase * 4) * 2;
  ctx.fillStyle = m.gold ? "#e1c982" : "#b8c1c3";

  ctx.beginPath();
  ctx.ellipse(-9, 27 + footBob, 7, 3.5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(14, 27 - footBob, 7, 3.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Three tiny toes on each foot
  ctx.strokeStyle = m.gold ? "#a98e49" : "#8e999b";
  ctx.lineWidth = 1.15;

  for (var toe = -1; toe <= 1; toe++) {
    ctx.beginPath();
    ctx.moveTo(-9 + toe * 2, 28 + footBob);
    ctx.lineTo(-10 + toe * 2, 31 + footBob);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(14 + toe * 2, 28 - footBob);
    ctx.lineTo(15 + toe * 2, 31 - footBob);
    ctx.stroke();
  }

  ctx.restore();
}

function catchMouse(m,x,y){
  playCatchSound(m.gold);
  combo++;
  caught++;
  score+=m.gold?5:1;
  if(score>best){
    best=score;
    localStorage.setItem("MadMiceBest",String(best));
  }
  for(var i=0;i<10;i++){
    var a=Math.random()*Math.PI*2,s=20+Math.random()*60;
    particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*3,life:.55});
  }
  mice=mice.filter(function(q){return q!==m});
  updateHud();
}

function gameLoop(now){
  if(state!=="playing")return;

  var dt=Math.min((now-lastTime)/1000,.04);
  lastTime=now;
  spawnTimer+=dt;

  var level=1+Math.floor(score/15);
  var interval=Math.max(.72,1.25-level*.025);

  if(spawnTimer>=interval){
    spawnTimer=0;
    spawnMouse();
    if(level>=6 && Math.random()<.1)spawnMouse();
  }

  drawBackground();

  var copy=mice.slice();
  for(var i=0;i<copy.length;i++){
    var m=copy[i];
    m.phase+=dt*2.4;
    m.x+=m.vx*dt;
    drawMouse(m);

    if(m.x<-90||m.x>W+90){
      mice=mice.filter(function(q){return q!==m});
      combo=0;
      updateHud();
    }
  }

  for(var p=particles.length-1;p>=0;p--){
    var q=particles[p];
    q.life-=dt;
    q.x+=q.vx*dt;
    q.y+=q.vy*dt;
    q.vy+=50*dt;
    ctx.globalAlpha=Math.max(0,q.life/.55);
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.arc(q.x,q.y,q.r,0,Math.PI*2);
    ctx.fill();
    if(q.life<=0)particles.splice(p,1);
  }
  ctx.globalAlpha=1;

  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("pointerdown",function(e){
  if(state!=="playing")return;

  var r=canvas.getBoundingClientRect();
  var px=e.clientX-r.left;
  var py=e.clientY-r.top;

  for(var i=mice.length-1;i>=0;i--){
    var m=mice[i];
    var my=m.y+Math.sin(m.phase)*m.wiggle;
    var dx=px-m.x,dy=py-my;
    if(dx*dx+dy*dy<58*58){
      catchMouse(m,px,py);
      return;
    }
  }
});

document.getElementById("play").addEventListener("click",function(){startGame("normal")});
document.getElementById("endless").addEventListener("click",function(){startGame("endless")});

document.getElementById("pause").addEventListener("click",function(){
  if(state==="playing"){
    state="paused";
    pauseScreen.classList.remove("hidden");
  }
});

document.getElementById("resume").addEventListener("click",function(){
  if(state==="paused"){
    state="playing";
    pauseScreen.classList.add("hidden");
    lastTime=performance.now();
    requestAnimationFrame(gameLoop);
  }
});

function mainMenu(){
  state="menu";
  mice=[];
  particles=[];
  hud.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  over.classList.add("hidden");
  menu.classList.remove("hidden");
}

document.getElementById("quit").addEventListener("click",mainMenu);
document.getElementById("home").addEventListener("click",mainMenu);
document.getElementById("again").addEventListener("click",function(){startGame(mode)});

window.addEventListener("error",function(e){
  errorBox.textContent="Game error: "+(e.message||"JavaScript error");
  errorBox.classList.remove("hidden");
});

updateHud();

document.getElementById("sound").addEventListener("click",function(){
  soundEnabled=!soundEnabled;
  this.textContent=soundEnabled?"🔊":"🔇";
});
})();