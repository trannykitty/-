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
var lifetimeCaught=Number(localStorage.getItem("MadMiceLifetimeCaught")||0);
var treats=Number(localStorage.getItem("MadMiceTreats")||0);
var equippedHat=localStorage.getItem("MadMiceHat")||"none";
var upgrades={
  magnet:Number(localStorage.getItem("MadMiceUpgradeMagnet")||0),
  slow:Number(localStorage.getItem("MadMiceUpgradeSlow")||0),
  lucky:Number(localStorage.getItem("MadMiceUpgradeLucky")||0),
  treats:Number(localStorage.getItem("MadMiceUpgradeTreats")||0),
  rush:Number(localStorage.getItem("MadMiceUpgradeRush")||0)
};
var upgradeDefs=[
  {id:"magnet",name:"Cozy Magnet",icon:"🧲",desc:"Makes the mouse catch area bigger.",base:12,max:8},
  {id:"slow",name:"Sleepy Mice",icon:"💤",desc:"Makes mice wander more slowly.",base:18,max:7},
  {id:"lucky",name:"Lucky Whiskers",icon:"🍀",desc:"Increases the chance of golden mice.",base:25,max:6},
  {id:"treats",name:"Treat Pouch",icon:"🧀",desc:"Earns extra treats whenever you catch a mouse.",base:35,max:5},
  {id:"rush",name:"Cozy Rush",icon:"🐾",desc:"Mice arrive a little more often for faster sessions.",base:40,max:5}
];
var hats=[
  {id:"none",name:"No Hat",icon:"🐭",need:0},
  {id:"party",name:"Party Hat",icon:"🥳",need:10},
  {id:"cowboy",name:"Cowboy",icon:"🤠",need:25},
  {id:"crown",name:"Tiny Crown",icon:"👑",need:50},
  {id:"wizard",name:"Wizard",icon:"🧙",need:100},
  {id:"chef",name:"Chef Hat",icon:"👨‍🍳",need:175},
  {id:"tophat",name:"Top Hat",icon:"🎩",need:300},
  {id:"flower",name:"Flower Hat",icon:"🌸",need:500},
  {id:"party2",name:"Sparkle Hat",icon:"✨",need:750}
];
var spawnTimer=0,lastTime=0;
var soundEnabled=false;
var bgMusic = document.getElementById("bgMusic");

function startBackgroundMusic(){
  if(!soundEnabled || !bgMusic)return;
  try{
    bgMusic.volume=0.05;
    var p=bgMusic.play();
    if(p&&p.catch)p.catch(function(){});
  }catch(e){}
}


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



function upgradeCost(u){
  var d=upgradeDefs.find(function(x){return x.id===u;});
  var level=upgrades[u]||0;
  return Math.round(d.base*Math.pow(1.65,level));
}

function renderUpgrades(){
  var grid=document.getElementById("upgradeGrid");
  if(!grid)return;
  document.getElementById("treats").textContent=treats;
  grid.innerHTML="";
  upgradeDefs.forEach(function(d){
    var level=upgrades[d.id]||0;
    var item=document.createElement("div");
    item.className="upgradeItem";
    var cost=upgradeCost(d.id);
    var maxed=level>=d.max;
    item.innerHTML='<div class="upgradeIcon">'+d.icon+'</div><div class="upgradeInfo"><div class="upgradeName">'+d.name+'</div><div class="upgradeDesc">'+d.desc+'</div><div class="upgradeLevel">Level '+level+' / '+d.max+'</div></div>';
    var btn=document.createElement("button");
    btn.type="button";
    btn.textContent=maxed?"MAX":"🧀 "+cost;
    btn.disabled=maxed||treats<cost;
    btn.addEventListener("click",function(){
      var price=upgradeCost(d.id);
      if(upgrades[d.id]>=d.max || treats<price)return;
      treats-=price;
      upgrades[d.id]++;
      localStorage.setItem("MadMiceTreats",String(treats));
      localStorage.setItem("MadMiceUpgrade"+d.id.charAt(0).toUpperCase()+d.id.slice(1),String(upgrades[d.id]));
      renderUpgrades();
    });
    item.appendChild(btn);
    grid.appendChild(item);
  });
}

function renderShop(){
  var grid=document.getElementById("hatGrid");
  if(!grid)return;
  document.getElementById("lifetimeCaught").textContent=lifetimeCaught;
  grid.innerHTML="";
  hats.forEach(function(h){
    var item=document.createElement("div");
    item.className="hatItem "+(lifetimeCaught>=h.need?"owned":"locked")+(equippedHat===h.id?" equipped":"");
    var status=h.need===0 ? "Free" : (lifetimeCaught>=h.need ? (equippedHat===h.id?"Equipped":"Unlocked") : h.need+" mice");
    item.innerHTML='<div class="hatIcon">'+h.icon+'</div><div class="hatName">'+h.name+'</div><div class="hatNeed">'+status+'</div>';
    var btn=document.createElement("button");
    btn.type="button";
    if(h.id==="none"){
      btn.textContent=equippedHat==="none"?"Equipped":"Use";
      btn.disabled=equippedHat==="none";
    }else if(lifetimeCaught<h.need){
      btn.textContent="Locked";
      btn.disabled=true;
    }else{
      btn.textContent=equippedHat===h.id?"Equipped":"Wear";
      btn.disabled=equippedHat===h.id;
    }
    btn.addEventListener("click",function(){
      if(lifetimeCaught>=h.need){
        equippedHat=h.id;
        localStorage.setItem("MadMiceHat",equippedHat);
        renderShop();
      }
    });
    item.appendChild(btn);
    grid.appendChild(item);
  });
}

function openShop(){
  state="shop";
  menu.classList.add("hidden");
  hud.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  over.classList.add("hidden");
  document.getElementById("shopScreen").classList.remove("hidden");
  renderShop();
  renderUpgrades();
}

function closeShop(){
  state="menu";
  document.getElementById("shopScreen").classList.add("hidden");
  menu.classList.remove("hidden");
}

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
  var speed=(55+Math.random()*45+level*2)*(1-(upgrades.slow||0)*0.08);
  var m={
    x:fromLeft?-70:W+70,
    y:100+Math.random()*Math.max(80,H-190),
    vx:fromLeft?speed:-speed,
    phase:Math.random()*Math.PI*2,
    wiggle:5+Math.random()*8,
    size:.9+Math.random()*.18,
    gold:Math.random()<Math.min(.08+(upgrades.lucky||0)*.025,.23)
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


  // Equipped tiny hat — polished little hand-drawn hats
  if(equippedHat !== "none"){
    ctx.save();
    ctx.translate(27,-18);
    ctx.lineJoin="round";
    ctx.lineCap="round";

    if(equippedHat==="party"){
      // Party cone + rim + pom
      ctx.shadowColor="rgba(0,0,0,.22)";ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.fillStyle="#d978a0";
      ctx.beginPath();ctx.moveTo(-12,5);ctx.quadraticCurveTo(-2,-7,0,-25);ctx.quadraticCurveTo(4,-9,12,5);ctx.closePath();ctx.fill();
      ctx.shadowColor="transparent";
      ctx.strokeStyle="#f6c8d8";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-7,-3);ctx.lineTo(6,-8);ctx.stroke();
      ctx.beginPath();ctx.moveTo(-4,-11);ctx.lineTo(4,-14);ctx.stroke();
      ctx.fillStyle="#f7d8e3";ctx.beginPath();ctx.arc(0,-26,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#b95f88";ctx.beginPath();ctx.ellipse(0,5,14,3,0,0,Math.PI*2);ctx.fill();
    }else if(equippedHat==="cowboy"){
      // Wide cowboy brim + crown + band
      ctx.shadowColor="rgba(0,0,0,.2)";ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.fillStyle="#a87543";ctx.beginPath();ctx.ellipse(0,3,20,5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#b9834e";
      ctx.beginPath();ctx.moveTo(-11,1);ctx.quadraticCurveTo(-10,-14,-4,-19);ctx.quadraticCurveTo(0,-23,4,-19);ctx.quadraticCurveTo(10,-14,11,1);ctx.closePath();ctx.fill();
      ctx.shadowColor="transparent";ctx.fillStyle="#754b2e";ctx.fillRect(-10,-3,20,4);
      ctx.fillStyle="#e2bd72";ctx.fillRect(6,-3,3,4);
      ctx.strokeStyle="#d7a66a";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-14,3);ctx.quadraticCurveTo(0,7,14,3);ctx.stroke();
    }else if(equippedHat==="crown"){
      // Crown with rounded base and jewels
      ctx.shadowColor="rgba(0,0,0,.18)";ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.fillStyle="#e6c85c";
      ctx.beginPath();ctx.moveTo(-13,4);ctx.lineTo(-11,-14);ctx.lineTo(-4,-7);ctx.lineTo(0,-18);ctx.lineTo(5,-7);ctx.lineTo(12,-14);ctx.lineTo(13,4);ctx.quadraticCurveTo(0,8,-13,4);ctx.closePath();ctx.fill();
      ctx.shadowColor="transparent";ctx.fillStyle="#fff0a0";ctx.beginPath();ctx.arc(-7,-9,2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#e99aaa";ctx.beginPath();ctx.arc(0,-9,2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#9fc9df";ctx.beginPath();ctx.arc(7,-9,2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#c6a73b";ctx.fillRect(-12,1,24,4);
    }else if(equippedHat==="wizard"){
      // Soft floppy wizard hat with moon + stars
      ctx.shadowColor="rgba(0,0,0,.2)";ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.fillStyle="#7162a8";
      ctx.beginPath();ctx.moveTo(-13,4);ctx.quadraticCurveTo(-7,-2,-4,-12);ctx.quadraticCurveTo(-1,-20,3,-29);ctx.quadraticCurveTo(8,-18,14,4);ctx.closePath();ctx.fill();
      ctx.shadowColor="transparent";ctx.fillStyle="#9b8cc9";ctx.beginPath();ctx.ellipse(0,4,17,4.5,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#d9c9f0";ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(3,-15,4,-1.2,1.5);ctx.stroke();
      ctx.fillStyle="#f3d98b";ctx.beginPath();ctx.arc(-5,-9,1.7,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(7,-4,1.5,0,Math.PI*2);ctx.fill();
    }else if(equippedHat==="chef"){
      // Puffy chef toque
      ctx.shadowColor="rgba(0,0,0,.16)";ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.fillStyle="#f4f2ef";
      ctx.beginPath();ctx.moveTo(-11,2);ctx.lineTo(-11,-8);ctx.arc(-7,-12,6,Math.PI*.15,Math.PI*1.3);ctx.arc(0,-14,7,Math.PI,Math.PI*2);ctx.arc(7,-12,6,Math.PI*1.7,Math.PI*.85);ctx.lineTo(11,2);ctx.closePath();ctx.fill();
      ctx.shadowColor="transparent";ctx.fillStyle="#d7d5d2";ctx.fillRect(-12,-1,24,6);
      ctx.fillStyle="#ffffff";ctx.fillRect(-9,-1,18,2);
    }else if(equippedHat==="tophat"){
      // Tall top hat, kept classic
      ctx.shadowColor="rgba(0,0,0,.24)";ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.fillStyle="#1b2025";ctx.fillRect(-10,-23,20,25);
      ctx.beginPath();ctx.ellipse(0,3,18,4.5,0,0,Math.PI*2);ctx.fill();
      ctx.shadowColor="transparent";ctx.fillStyle="#8f5f72";ctx.fillRect(-10,-7,20,5);
      ctx.fillStyle="#b97a8f";ctx.fillRect(-2,-7,3,5);
    }else if(equippedHat==="flower"){
      // Flower crown
      ctx.shadowColor="rgba(0,0,0,.15)";ctx.shadowBlur=2;ctx.shadowOffsetY=2;
      var flowerXs=[-9,0,9];
      for(var fi=0;fi<flowerXs.length;fi++){
        var fx=flowerXs[fi], fy=-12-(fi===1?3:0);
        ctx.fillStyle=fi===1?"#df7892":"#ee9fb0";
        for(var fp=0;fp<5;fp++){
          var fa=fp*Math.PI*2/5;
          ctx.beginPath();ctx.arc(fx+Math.cos(fa)*4.5,fy+Math.sin(fa)*4.5,3.7,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle="#f1cf69";ctx.beginPath();ctx.arc(fx,fy,2.6,0,Math.PI*2);ctx.fill();
      }
      ctx.shadowColor="transparent";ctx.strokeStyle="#75a26e";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13,1);ctx.quadraticCurveTo(0,5,13,1);ctx.stroke();
    }else if(equippedHat==="party2"){
      // Sparkle cone with glossy trim
      ctx.shadowColor="rgba(0,0,0,.2)";ctx.shadowBlur=3;ctx.shadowOffsetY=2;
      ctx.fillStyle="#7eb5cf";ctx.beginPath();ctx.moveTo(-12,4);ctx.lineTo(0,-26);ctx.lineTo(13,4);ctx.closePath();ctx.fill();
      ctx.shadowColor="transparent";ctx.strokeStyle="#f8d68c";ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-8,-3);ctx.lineTo(7,-11);ctx.stroke();
      ctx.fillStyle="#f8e8a8";ctx.beginPath();ctx.arc(0,-27,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#f6d37b";ctx.beginPath();ctx.arc(-4,-9,1.8,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f3a6c0";ctx.beginPath();ctx.arc(6,-4,1.8,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#ffffff";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(0,-12);ctx.moveTo(-3,-15);ctx.lineTo(3,-15);ctx.stroke();
    }
    ctx.restore();
  }

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
  lifetimeCaught++;
  localStorage.setItem("MadMiceLifetimeCaught",String(lifetimeCaught));
  treats+=(m.gold?5:2)+(upgrades.treats||0);
  localStorage.setItem("MadMiceTreats",String(treats));
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
  var interval=Math.max(.55,(1.25-level*.025)*(1-(upgrades.rush||0)*0.06));

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
    var catchRadius=58+(upgrades.magnet||0)*6;
    if(dx*dx+dy*dy<catchRadius*catchRadius){
      catchMouse(m,px,py);
      return;
    }
  }
});

document.getElementById("play").addEventListener("click",function(){startGame("normal")});
document.getElementById("shop").addEventListener("click",openShop);
document.getElementById("closeShop").addEventListener("click",closeShop);
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
  if(bgMusic){
    if(soundEnabled){
      startBackgroundMusic();
    }else{
      try{bgMusic.pause();}catch(e){}
    }
  }
});
})();