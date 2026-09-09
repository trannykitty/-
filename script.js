(() => {
"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");
const menu = document.getElementById("menu");
const pauseScreen = document.getElementById("pauseScreen");
const gameOver = document.getElementById("gameOver");
const toast = document.getElementById("toast");

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");

let W = innerWidth, H = innerHeight, dpr = 1;
let mice = [], effects = [];
let state = "menu";
let mode = "normal";
let score = 0, caught = 0, combo = 0, lives = 3;
let spawnClock = 0, last = 0, elapsed = 0;
let best = Number(localStorage.getItem("madMiceBest") || 0);
let audioCtx = null;

const mouseRadius = 28;

function resize(){
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.floor(W*dpr);
  canvas.height = Math.floor(H*dpr);
  canvas.style.width = W+"px";
  canvas.style.height = H+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener("resize", resize);
resize();

function sound(type){
  try{
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === "suspended") audioCtx.resume();
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const now=audioCtx.currentTime;
    if(type==="catch"){o.frequency.setValueAtTime(520,now);o.frequency.exponentialRampToValueAtTime(880,now+.08)}
    else if(type==="gold"){o.frequency.setValueAtTime(700,now);o.frequency.exponentialRampToValueAtTime(1200,now+.16)}
    else {o.frequency.setValueAtTime(150,now);o.frequency.exponentialRampToValueAtTime(70,now+.14)}
    g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.055,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+.18);
    o.start(now);o.stop(now+.2);
  }catch(_){}
}

function resetGame(newMode){
  mode=newMode;
  mice=[];effects=[];
  score=0;caught=0;combo=0;lives=3;spawnClock=.25;elapsed=0;
  state="playing";
  menu.classList.add("hidden");
  gameOver.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  updateHud();
  last=performance.now();
  requestAnimationFrame(loop);
}

function updateHud(){
  scoreEl.textContent=score;
  comboEl.textContent="×"+Math.max(1,combo);
  levelEl.textContent=1+Math.floor(score/10);
  livesEl.textContent="♥ ".repeat(lives)+"♡ ".repeat(3-lives);
}

function spawnMouse(){
  const fromLeft=Math.random()<.5;
  const level=1+Math.floor(score/10);
  const fast=Math.random()<Math.min(.35,.08+level*.025);
  const gold=Math.random()<.09;
  const y=rand(105,H-75);
  const speed=rand(125,190)+level*7+(fast?70:0);
  const direction=fromLeft?1:-1;

  mice.push({
    x:fromLeft?-55:W+55,y,
    vx:speed*direction,
    phase:rand(0,Math.PI*2),
    wiggle:rand(4,14),
    size:gold?1.08:1,
    gold,
    fast,
    dead:false
  });
}

function rand(a,b){return a+Math.random()*(b-a)}

function drawBackground(){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#69777f");g.addColorStop(.5,"#4c5960");g.addColorStop(1,"#293238");
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  ctx.globalAlpha=.09;
  ctx.strokeStyle="#fff";
  for(let x=0;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=0;y<H;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  ctx.globalAlpha=1;

  const v=ctx.createRadialGradient(W/2,H*.4,Math.min(W,H)*.15,W/2,H*.4,Math.max(W,H)*.7);
  v.addColorStop(0,"transparent");v.addColorStop(1,"rgba(0,0,0,.55)");
  ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}

function drawMouse(m){
  ctx.save();
  ctx.translate(m.x,m.y+Math.sin(m.phase)*m.wiggle);
  ctx.scale(m.vx<0?-m.size:m.size,m.size);

  ctx.fillStyle="rgba(0,0,0,.28)";
  ctx.beginPath();ctx.ellipse(0,25,30,7,0,0,Math.PI*2);ctx.fill();

  ctx.strokeStyle=m.gold?"#d0bd78":"#aab2b6";
  ctx.lineWidth=4;ctx.beginPath();ctx.arc(-25,8,18,.5,4.8);ctx.stroke();

  ctx.fillStyle=m.gold?"#c9b36f":m.fast?"#5b6368":"#aab2b6";
  ctx.beginPath();ctx.ellipse(0,8,29,19,0,0,Math.PI*2);ctx.fill();

  ctx.fillStyle=m.gold?"#d6c483":m.fast?"#687176":"#bac0c3";
  ctx.beginPath();ctx.arc(28,5,17,0,Math.PI*2);ctx.fill();

  ctx.fillStyle=m.gold?"#dfcf91":"#c8ced0";
  ctx.beginPath();ctx.arc(25,-10,11,0,Math.PI*2);ctx.arc(36,-8,10,0,Math.PI*2);ctx.fill();

  ctx.fillStyle="#111";
  ctx.beginPath();ctx.arc(36,1,2.7,0,Math.PI*2);ctx.fill();

  ctx.fillStyle="#e59ba5";
  ctx.beginPath();ctx.arc(44,8,3.5,0,Math.PI*2);ctx.fill();

  ctx.strokeStyle="#7c8589";ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-5,22);ctx.lineTo(-5,28);ctx.moveTo(15,22);ctx.lineTo(15,28);ctx.stroke();

  if(m.gold){
    ctx.strokeStyle="#ffe9a1";ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(8,7,34,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

function drawEffects(dt){
  for(const e of effects){
    e.life-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=80*dt;
    ctx.globalAlpha=Math.max(0,e.life/e.max);
    ctx.fillStyle=e.gold?"#ffe9a1":"#fff";
    ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  effects=effects.filter(e=>e.life>0);
}

function addCatchEffect(x,y,gold){
  for(let i=0;i<12;i++){
    const a=Math.random()*Math.PI*2,s=rand(35,110);
    effects.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rand(2,5),life:.55,max:.55,gold});
  }
}

function flashText(text,x,y){
  const start=performance.now();
  const duration=650;
  function anim(now){
    const p=(now-start)/duration;
    if(p>=1)return;
    ctx.save();
    ctx.globalAlpha=1-p;
    ctx.font="900 28px system-ui";
    ctx.textAlign="center";
    ctx.fillStyle="#fff";
    ctx.shadowColor="#000";ctx.shadowBlur=8;
    ctx.fillText(text,x,y-p*55);
    ctx.restore();
    requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}

function catchMouse(m,x,y){
  if(m.dead)return;
  m.dead=true;
  combo++;
  caught++;
  const points=m.gold?5:1;
  score+=points;
  addCatchEffect(x,y,m.gold);
  flashText("+"+points,x,y);
  sound(m.gold?"gold":"catch");
  mice=mice.filter(a=>a!==m);
  updateHud();
}

function missMouse(m){
  if(m.dead)return;
  m.dead=true;
  mice=mice.filter(a=>a!==m);
  combo=0;
  if(mode==="normal"){
    lives--;
    sound("miss");
    updateHud();
    if(lives<=0)endGame();
  }else{
    sound("miss");
    updateHud();
  }
}

function endGame(){
  state="over";
  mice=[];
  document.getElementById("finalScore").textContent=score;
  document.getElementById("finalCaught").textContent=caught;
  document.getElementById("finalBest").textContent=best;
  document.getElementById("resultTitle").textContent=mode==="endless"?"Endless Run Over":"Game Over";
  gameOver.classList.remove("hidden");
  hud.classList.add("hidden");
}

function pauseGame(){
  if(state!=="playing")return;
  state="paused";
  pauseScreen.classList.remove("hidden");
}

function resumeGame(){
  if(state!=="paused")return;
  state="playing";
  pauseScreen.classList.add("hidden");
  last=performance.now();
  requestAnimationFrame(loop);
}

function quit(){
  state="menu";mice=[];effects=[];
  pauseScreen.classList.add("hidden");
  gameOver.classList.add("hidden");
  hud.classList.add("hidden");
  menu.classList.remove("hidden");
}

function loop(now){
  if(state!=="playing")return;
  const dt=Math.min((now-last)/1000,.04);
  last=now;elapsed+=dt;spawnClock+=dt;

  const level=1+Math.floor(score/10);
  const interval=Math.max(.28,.78-level*.035);

  if(spawnClock>=interval){
    spawnClock=0;
    spawnMouse();
    if(level>=4 && Math.random()<.28)spawnMouse();
  }

  drawBackground();

  for(const m of [...mice]){
    m.phase+=dt*(3.5+level*.12);
    m.x+=m.vx*dt;
    drawMouse(m);
    if(m.x<-80||m.x>W+80)missMouse(m);
  }

  drawEffects(dt);
  requestAnimationFrame(loop);
}

function pointerPosition(e){
  const r=canvas.getBoundingClientRect();
  return {x:e.clientX-r.left,y:e.clientY-r.top};
}

canvas.addEventListener("pointerdown",e=>{
  if(state!=="playing")return;
  const p=pointerPosition(e);

  for(let i=mice.length-1;i>=0;i--){
    const m=mice[i];
    const y=m.y+Math.sin(m.phase)*m.wiggle;
    const dx=p.x-m.x,dy=p.y-y;
    const hit=dx*dx+dy*dy<(mouseRadius*m.size+15)**2;
    if(hit){catchMouse(m,p.x,p.y);return}
  }
});

document.getElementById("normalBtn").onclick=()=>resetGame("normal");
document.getElementById("endlessBtn").onclick=()=>resetGame("endless");
document.getElementById("pause").onclick=pauseGame;
document.getElementById("resumeBtn").onclick=resumeGame;
document.getElementById("quitBtn").onclick=quit;
document.getElementById("againBtn").onclick=()=>resetGame(mode);
document.getElementById("menuBtn").onclick=quit;

addEventListener("keydown",e=>{
  if(e.code==="Escape"){
    if(state==="playing")pauseGame();
    else if(state==="paused")resumeGame();
  }
});

updateHud();
})();
