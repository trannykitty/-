(() => {
  "use strict";

  const game = document.getElementById("game");
  const layer = document.getElementById("mouseLayer");
  const screen = document.getElementById("screen");
  const over = document.getElementById("over");
  const scoreEl = document.getElementById("score");
  const comboEl = document.getElementById("combo");
  const bestEl = document.getElementById("best");
  const livesEl = document.getElementById("lives");
  const levelEl = document.getElementById("level");

  let mice = [];
  let running = false;
  let last = 0;
  let spawnTimer = 0;
  let score = 0;
  let caught = 0;
  let combo = 0;
  let lives = 3;
  let endlessMode = false;

  let best = Number(localStorage.getItem("madMiceDeluxeBest") || 0);
  bestEl.textContent = "Best " + best;

  const rand = (a,b) => a + Math.random() * (b-a);

  function updateHud() {
    scoreEl.textContent = score;
    comboEl.textContent = "Combo ×" + Math.max(1, combo);
    levelEl.textContent = "Level " + (1 + Math.floor(score / 10));

    const hearts = "♥ ".repeat(lives).trim();
    const empty = "♡ ".repeat(3-lives).trim();
    livesEl.textContent = [hearts, empty].filter(Boolean).join(" ");

    if (score > best) {
      best = score;
      bestEl.textContent = "Best " + best;
      localStorage.setItem("madMiceDeluxeBest", best);
    }
  }

  function createMouse() {
    const el = document.createElement("div");
    const type = Math.random();
    el.className = "mouse " + (type < .12 ? "gold" : type < .24 ? "black" : "");

    el.innerHTML = `
      <div class="tail"></div><div class="body"></div><div class="head"></div>
      <div class="ear e1"></div><div class="ear e2"></div>
      <div class="eye"></div><div class="nose"></div>
      <div class="leg l1"></div><div class="leg l2"></div>
    `;

    layer.appendChild(el);

    const fromLeft = Math.random() < .5;
    const y = rand(95, Math.max(120, innerHeight - 90));
    const speed = rand(170,245) + Math.min(score * 2.7,170);

    mice.push({
      el,
      x: fromLeft ? -90 : innerWidth + 90,
      y,
      vx: fromLeft ? speed : -speed,
      phase: rand(0,Math.PI*2),
      amp: rand(5,13),
      turn: Math.random() < .25,
      dead: false
    });
  }

  function burst(x,y) {
    for (let i=0;i<8;i++) {
      const p = document.createElement("i");
      p.className = "particle";
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.setProperty("--dx", rand(-45,45) + "px");
      p.style.setProperty("--dy", rand(-45,20) + "px");
      game.appendChild(p);
      setTimeout(() => p.remove(), 520);
    }

    const text = document.createElement("div");
    text.className = "pop";
    text.textContent = "+ " + Math.max(1,combo);
    text.style.left = x + "px";
    text.style.top = y + "px";
    game.appendChild(text);
    setTimeout(() => text.remove(), 700);
  }

  function catchMouse(mouse,x,y) {
    if (!running || mouse.dead) return;

    mouse.dead = true;
    combo++;
    caught++;
    score += mouse.el.classList.contains("gold") ? 5 : 1;

    burst(x,y);
    mouse.el.remove();
    mice = mice.filter(m => m !== mouse);
    updateHud();
  }

  function missMouse(mouse) {
    if (mouse.dead) return;

    mouse.dead = true;
    mouse.el.remove();
    mice = mice.filter(m => m !== mouse);

    if (endlessMode) {
      combo = 0;
      updateHud();
      return;
    }

    lives--;
    combo = 0;
    updateHud();

    if (lives <= 0) finishGame();
  }

  function finishGame() {
    running = false;
    mice.forEach(m => m.el.remove());
    mice = [];

    document.getElementById("final").textContent = score;
    document.getElementById("bestFinal").textContent = best;
    document.getElementById("caught").textContent = caught;
    over.classList.remove("hidden");
  }

  function startGame(mode) {
    mice.forEach(m => m.el.remove());
    mice = [];

    endlessMode = mode;
    score = 0;
    caught = 0;
    combo = 0;
    lives = 3;
    spawnTimer = .35;
    running = true;

    screen.classList.add("hidden");
    over.classList.add("hidden");
    updateHud();

    last = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(time) {
    if (!running) return;

    const dt = Math.min((time-last)/1000,.035);
    last = time;
    spawnTimer += dt;

    const interval = Math.max(.32, .92 - score*.009);

    if (spawnTimer >= interval) {
      spawnTimer = 0;
      createMouse();

      if (score > 18 && Math.random() < (endlessMode ? .35 : .22)) {
        createMouse();
      }
    }

    for (const mouse of [...mice]) {
      mouse.phase += dt * (5 + score*.02);

      if (mouse.turn && Math.sin(mouse.phase*.7) > .995) {
        mouse.vx *= -1;
      }

      mouse.x += mouse.vx * dt;
      const y = mouse.y + Math.sin(mouse.phase) * mouse.amp;

      mouse.el.style.transform =
        `translate(${mouse.x}px,${y}px) scaleX(${mouse.vx < 0 ? -1 : 1})`;

      if (mouse.x < -120 || mouse.x > innerWidth + 120) {
        missMouse(mouse);
      }
    }

    requestAnimationFrame(loop);
  }

  game.addEventListener("pointerdown", event => {
    if (!running) return;

    const rect = game.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const target = document.createElement("div");
    target.className = "target";
    target.style.left = x + "px";
    target.style.top = y + "px";
    game.appendChild(target);
    setTimeout(() => target.remove(),400);

    for (let i=mice.length-1;i>=0;i--) {
      const mouse = mice[i];
      const mouseY = mouse.y + Math.sin(mouse.phase)*mouse.amp;

      if (
        x >= mouse.x-14 && x <= mouse.x+78 &&
        y >= mouseY-14 && y <= mouseY+58
      ) {
        catchMouse(mouse,x,y);
        return;
      }
    }
  });

  document.getElementById("start").addEventListener("click", () => startGame(false));
  document.getElementById("endless").addEventListener("click", () => startGame(true));
  document.getElementById("again").addEventListener("click", () => startGame(endlessMode));

  updateHud();
})();
