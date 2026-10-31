// J.A.R.V.I.S. Interactive Game Templates & Engine Sources
// Pure HTML5 Canvas + Web Audio API synthesizer (zero external dependencies, runs offline)

export const SPACE_ARCADE_2099_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Cyber Space Arcade 2099</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background: #030712;
      color: #38bdf8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      touch-action: none;
    }
    #game-wrapper {
      position: relative;
      width: 100%;
      max-width: 680px;
      aspect-ratio: 4 / 3;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 0 35px rgba(6, 182, 212, 0.25);
      background: radial-gradient(circle at center, #070d1e 0%, #02050e 100%);
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .hud {
      position: absolute;
      top: 12px;
      left: 16px;
      right: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-family: monospace;
      font-weight: 700;
      color: #38bdf8;
      text-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
      pointer-events: none;
    }
    .touch-controls {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
      pointer-events: auto;
      opacity: 0.85;
    }
    .touch-btn {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: bold;
      font-family: monospace;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background 0.1s;
    }
    .touch-btn:active {
      background: rgba(56, 189, 248, 0.4);
      color: #ffffff;
    }
    .hint {
      position: absolute;
      bottom: 58px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 11px;
      color: rgba(148, 163, 184, 0.6);
      pointer-events: none;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div id="game-wrapper">
    <canvas id="gameCanvas" width="640" height="480"></canvas>
    <div class="hud">
      <div id="scoreDisplay">SKOR: 0</div>
      <div id="shieldDisplay">KALKAN: 100%</div>
      <div id="waveDisplay">DALGA: 1</div>
    </div>
    <div class="hint">Klavye: [← / A] [→ / D] | Ateş: [BOŞLUK / SPACE]</div>
    <div class="touch-controls">
      <div style="display: flex; gap: 8px;">
        <button id="btnLeft" class="touch-btn">◀ SOL</button>
        <button id="btnRight" class="touch-btn">SAĞ ▶</button>
      </div>
      <button id="btnFire" class="touch-btn" style="border-color: #38bdf8; background: rgba(6,182,212,0.25);">🔥 ATEŞ</button>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Web Audio Synthesizer (Zero dependencies)
    let audioCtx = null;
    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playLaserSound() {
      try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(850, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.14);
      } catch(e) {}
    }

    function playExplosionSound() {
      try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.28);
      } catch(e) {}
    }

    // Parallax Starfield
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff'
      });
    }

    // Player State
    const player = {
      x: canvas.width / 2,
      y: canvas.height - 45,
      width: 32,
      height: 28,
      speed: 6.5,
      shield: 100,
      score: 0,
      wave: 1,
      alive: true
    };

    // Bullets, Enemies & Particles
    let bullets = [];
    let enemies = [];
    let particles = [];
    let lastFireTime = 0;
    let spawnTimer = 0;
    let keys = { left: false, right: false, fire: false };

    // Input Listeners
    window.addEventListener('keydown', (e) => {
      initAudio();
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
      if (e.code === 'Space') {
        keys.fire = true;
        if (!player.alive) restartGame();
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
      if (e.code === 'Space') keys.fire = false;
    });

    // Touch Buttons
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnFire = document.getElementById('btnFire');

    const bindTouch = (elem, onDown, onUp) => {
      elem.addEventListener('pointerdown', (e) => { e.preventDefault(); initAudio(); onDown(); });
      elem.addEventListener('pointerup', (e) => { e.preventDefault(); onUp(); });
      elem.addEventListener('pointercancel', (e) => { e.preventDefault(); onUp(); });
    };

    bindTouch(btnLeft, () => keys.left = true, () => keys.left = false);
    bindTouch(btnRight, () => keys.right = true, () => keys.right = false);
    bindTouch(btnFire, () => {
      keys.fire = true;
      if (!player.alive) restartGame();
    }, () => keys.fire = false);

    canvas.addEventListener('click', () => {
      initAudio();
      if (!player.alive) restartGame();
    });

    function spawnExplosion(x, y, color = '#38bdf8', count = 16) {
      playExplosionSound();
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: Math.random() * 0.04 + 0.02,
          size: Math.random() * 3 + 1.5,
          color
        });
      }
    }

    function restartGame() {
      player.x = canvas.width / 2;
      player.shield = 100;
      player.score = 0;
      player.wave = 1;
      player.alive = true;
      bullets = [];
      enemies = [];
      particles = [];
      updateHUD();
    }

    function updateHUD() {
      document.getElementById('scoreDisplay').innerText = 'SKOR: ' + player.score;
      document.getElementById('shieldDisplay').innerText = 'KALKAN: ' + Math.max(0, player.shield) + '%';
      document.getElementById('waveDisplay').innerText = 'DALGA: ' + player.wave;
    }

    // Main Game Loop
    function update() {
      // Stars movement
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });

      if (!player.alive) return;

      // Player Movement
      if (keys.left && player.x > 20) player.x -= player.speed;
      if (keys.right && player.x < canvas.width - 20) player.x += player.speed;

      // Firing
      const now = Date.now();
      if (keys.fire && now - lastFireTime > 160) {
        lastFireTime = now;
        playLaserSound();
        // Dual laser plasma
        bullets.push({ x: player.x - 10, y: player.y - 10, vy: -9 });
        bullets.push({ x: player.x + 10, y: player.y - 10, vy: -9 });
      }

      // Update Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y += bullets[i].vy;
        if (bullets[i].y < -10) {
          bullets.splice(i, 1);
        }
      }

      // Spawn Enemies
      spawnTimer++;
      const spawnInterval = Math.max(30, 75 - player.wave * 5);
      if (spawnTimer % spawnInterval === 0) {
        const isElite = Math.random() > 0.75;
        enemies.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: -25,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 1.5 + (isElite ? 2.5 : 1.5),
          hp: isElite ? 3 : 1,
          maxHp: isElite ? 3 : 1,
          size: isElite ? 22 : 16,
          isElite
        });
      }

      // Update Enemies & Collisions
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += e.vy;
        e.x += e.vx;
        if (e.x < 20 || e.x > canvas.width - 20) e.vx *= -1;

        // Check collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          const dist = Math.hypot(e.x - b.x, e.y - b.y);
          if (dist < e.size + 4) {
            bullets.splice(j, 1);
            e.hp--;
            spawnExplosion(b.x, b.y, '#38bdf8', 4);

            if (e.hp <= 0) {
              spawnExplosion(e.x, e.y, e.isElite ? '#f59e0b' : '#38bdf8', 22);
              player.score += e.isElite ? 50 : 20;
              enemies.splice(i, 1);

              if (player.score >= player.wave * 250) {
                player.wave++;
              }
              updateHUD();
              break;
            }
          }
        }

        // Check collision with player
        if (enemies[i]) {
          const pDist = Math.hypot(e.x - player.x, e.y - player.y);
          if (pDist < e.size + 14) {
            spawnExplosion(e.x, e.y, '#ef4444', 20);
            enemies.splice(i, 1);
            player.shield -= 25;
            updateHUD();

            if (player.shield <= 0) {
              player.alive = false;
              spawnExplosion(player.x, player.y, '#ef4444', 40);
            }
          } else if (e.y > canvas.height + 30) {
            enemies.splice(i, 1);
          }
        }
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    }

    // Render Canvas
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Starfield
      stars.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      // Bullets with cyan glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Enemies
      enemies.forEach(e => {
        ctx.shadowBlur = 12;
        ctx.shadowColor = e.isElite ? '#f59e0b' : '#06b6d4';
        ctx.fillStyle = e.isElite ? '#f59e0b' : '#0ea5e9';

        ctx.beginPath();
        ctx.moveTo(e.x, e.y + e.size);
        ctx.lineTo(e.x - e.size, e.y - e.size);
        ctx.lineTo(e.x + e.size, e.y - e.size);
        ctx.closePath();
        ctx.fill();

        // HP bar for elite
        if (e.isElite && e.hp < e.maxHp) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#334155';
          ctx.fillRect(e.x - 16, e.y - e.size - 8, 32, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(e.x - 16, e.y - e.size - 8, (32 * e.hp) / e.maxHp, 4);
        }
      });

      // Particles
      particles.forEach(p => {
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Player Ship
      if (player.alive) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#38bdf8';
        ctx.fillStyle = '#0284c7';

        // Ship Body
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 16);
        ctx.lineTo(player.x - 16, player.y + 12);
        ctx.lineTo(player.x, player.y + 6);
        ctx.lineTo(player.x + 16, player.y + 12);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(player.x, player.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Thruster Flames
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#f97316';
        ctx.beginPath();
        ctx.moveTo(player.x - 6, player.y + 8);
        ctx.lineTo(player.x + 6, player.y + 8);
        ctx.lineTo(player.x, player.y + 18 + Math.random() * 6);
        ctx.closePath();
        ctx.fill();
      } else {
        // Game Over Overlay
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OYUN BİTTİ', canvas.width / 2, canvas.height / 2 - 15);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fillText('Nihai Skor: ' + player.score, canvas.width / 2, canvas.height / 2 + 20);

        ctx.font = '13px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.shadowBlur = 0;
        ctx.fillText('Yeniden Başlamak İçin Ekrana Tıklayın veya BOŞLUK Tuşuna Basın', canvas.width / 2, canvas.height / 2 + 55);
      }

      ctx.shadowBlur = 0;
    }

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    // Start
    updateHUD();
    requestAnimationFrame(gameLoop);
  </script>
</body>
</html>`;

export const CYBER_SNAKE_2099_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Cyber Snake 2099</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background: #030712;
      color: #10b981;
      font-family: monospace;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      touch-action: none;
    }
    #game-wrapper {
      position: relative;
      width: 100%;
      max-width: 560px;
      aspect-ratio: 1 / 1;
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 0 35px rgba(16, 185, 129, 0.25);
      background: #050b14;
    }
    canvas { width: 100%; height: 100%; display: block; }
    .hud {
      position: absolute;
      top: 12px;
      left: 14px;
      right: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: bold;
      color: #10b981;
      text-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
      pointer-events: none;
    }
    .d-pad {
      position: absolute;
      bottom: 12px;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      pointer-events: auto;
    }
    .d-btn {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
      width: 44px;
      height: 38px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .d-btn:active { background: rgba(16, 185, 129, 0.4); color: white; }
  </style>
</head>
<body>
  <div id="game-wrapper">
    <canvas id="snakeCanvas" width="400" height="400"></canvas>
    <div class="hud">
      <div id="scoreText">SKOR: 0</div>
      <div id="highScoreText">EN YÜKSEK: 0</div>
    </div>
    <div class="d-pad">
      <button class="d-btn" id="btnUp">▲</button>
      <div style="display: flex; gap: 8px;">
        <button class="d-btn" id="btnLeft">◀</button>
        <button class="d-btn" id="btnDown">▼</button>
        <button class="d-btn" id="btnRight">▶</button>
      </div>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const GRID = 20;
    const TILES = canvas.width / GRID;

    let audioCtx = null;
    function playBeep(freq = 440, dur = 0.08) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
      } catch(e) {}
    }

    let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = { x: 15, y: 10, isSuper: false };
    let score = 0;
    let highScore = 0;
    let gameOver = false;
    let particles = [];

    function spawnFood() {
      food.x = Math.floor(Math.random() * TILES);
      food.y = Math.floor(Math.random() * TILES);
      food.isSuper = Math.random() > 0.8;
    }

    function resetGame() {
      snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      score = 0;
      gameOver = false;
      particles = [];
      spawnFood();
      updateHUD();
    }

    function updateHUD() {
      document.getElementById('scoreText').innerText = 'SKOR: ' + score;
      document.getElementById('highScoreText').innerText = 'EN YÜKSEK: ' + highScore;
    }

    window.addEventListener('keydown', (e) => {
      if (gameOver && e.code === 'Space') { resetGame(); return; }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { if (dir.y === 0) nextDir = { x: 0, y: -1 }; }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { if (dir.y === 0) nextDir = { x: 0, y: 1 }; }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { if (dir.x === 0) nextDir = { x: -1, y: 0 }; }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { if (dir.x === 0) nextDir = { x: 1, y: 0 }; }
    });

    document.getElementById('btnUp').onclick = () => { if (dir.y === 0) nextDir = { x: 0, y: -1 }; };
    document.getElementById('btnDown').onclick = () => { if (dir.y === 0) nextDir = { x: 0, y: 1 }; };
    document.getElementById('btnLeft').onclick = () => { if (dir.x === 0) nextDir = { x: -1, y: 0 }; };
    document.getElementById('btnRight').onclick = () => { if (dir.x === 0) nextDir = { x: 1, y: 0 }; };

    canvas.addEventListener('click', () => { if (gameOver) resetGame(); });

    let lastTick = 0;
    const SPEED = 110; // ms per step

    function gameStep(timestamp) {
      if (timestamp - lastTick > SPEED && !gameOver) {
        lastTick = timestamp;
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Wall Collision
        if (head.x < 0 || head.x >= TILES || head.y < 0 || head.y >= TILES) {
          gameOver = true;
          playBeep(120, 0.35);
          if (score > highScore) highScore = score;
          updateHUD();
        }

        // Self collision
        for (let s of snake) {
          if (head.x === s.x && head.y === s.y) {
            gameOver = true;
            playBeep(120, 0.35);
            if (score > highScore) highScore = score;
            updateHUD();
          }
        }

        if (!gameOver) {
          snake.unshift(head);
          if (head.x === food.x && head.y === food.y) {
            score += food.isSuper ? 50 : 10;
            playBeep(food.isSuper ? 880 : 540, 0.12);
            for (let i = 0; i < 12; i++) {
              particles.push({
                x: food.x * GRID + 10,
                y: food.y * GRID + 10,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: food.isSuper ? '#f59e0b' : '#10b981'
              });
            }
            if (score > highScore) highScore = score;
            updateHUD();
            spawnFood();
          } else {
            snake.pop();
          }
        }
      }

      // Draw Grid & Entities
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      for (let i = 0; i <= canvas.width; i += GRID) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Food
      ctx.shadowBlur = 12;
      ctx.shadowColor = food.isSuper ? '#f59e0b' : '#10b981';
      ctx.fillStyle = food.isSuper ? '#f59e0b' : '#34d399';
      ctx.beginPath();
      ctx.arc(food.x * GRID + 10, food.y * GRID + 10, food.isSuper ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.04;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1.0;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Snake Body
      snake.forEach((s, i) => {
        ctx.shadowBlur = i === 0 ? 14 : 6;
        ctx.shadowColor = '#10b981';
        ctx.fillStyle = i === 0 ? '#6ee7b7' : '#059669';
        ctx.fillRect(s.x * GRID + 1.5, s.y * GRID + 1.5, GRID - 3, GRID - 3);
      });

      if (gameOver) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SİSTEM KESİLDİ', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '13px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Yeniden Başlamak İçin Dokunun / Tıklayın', canvas.width / 2, canvas.height / 2 + 22);
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(gameStep);
    }

    spawnFood();
    updateHUD();
    requestAnimationFrame(gameStep);
  </script>
</body>
</html>`;

export const CYBER_BREAKOUT_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Quantum Cyber Breakout</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background: #030712;
      color: #a855f7;
      font-family: monospace;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      touch-action: none;
    }
    #game-wrapper {
      position: relative;
      width: 100%;
      max-width: 600px;
      aspect-ratio: 4 / 3;
      border: 1px solid rgba(168, 85, 247, 0.35);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 0 35px rgba(168, 85, 247, 0.25);
      background: #070914;
    }
    canvas { width: 100%; height: 100%; display: block; }
    .hud {
      position: absolute;
      top: 10px;
      left: 14px;
      right: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: bold;
      color: #c084fc;
      text-shadow: 0 0 8px rgba(192, 132, 252, 0.8);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="game-wrapper">
    <canvas id="breakoutCanvas" width="600" height="450"></canvas>
    <div class="hud">
      <div id="scoreVal">SKOR: 0</div>
      <div id="livesVal">CAN: 3</div>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('breakoutCanvas');
    const ctx = canvas.getContext('2d');

    let audioCtx = null;
    function playTone(freq = 400, dur = 0.08) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
      } catch(e) {}
    }

    const paddle = { x: 250, y: 415, width: 90, height: 12, speed: 8 };
    const ball = { x: 300, y: 350, r: 6, vx: 4, vy: -4 };
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let particles = [];

    const BRICK_ROWS = 5;
    const BRICK_COLS = 8;
    const BRICK_W = 64;
    const BRICK_H = 18;
    const BRICK_PAD = 8;
    const BRICK_OFFSET_TOP = 40;
    const BRICK_OFFSET_LEFT = (canvas.width - (BRICK_COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2;

    const ROW_COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#06b6d4', '#10b981'];

    let bricks = [];
    function initBricks() {
      bricks = [];
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
          bricks[c][r] = { x: 0, y: 0, status: 1, color: ROW_COLORS[r] };
        }
      }
    }
    initBricks();

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const rootX = (e.clientX - rect.left) * (canvas.width / rect.width);
      paddle.x = Math.max(10, Math.min(canvas.width - paddle.width - 10, rootX - paddle.width / 2));
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const rootX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
      paddle.x = Math.max(10, Math.min(canvas.width - paddle.width - 10, rootX - paddle.width / 2));
    });

    canvas.addEventListener('click', () => {
      if (gameOver) {
        lives = 3; score = 0; gameOver = false;
        ball.x = 300; ball.y = 350; ball.vx = 4; ball.vy = -4;
        initBricks();
        updateHUD();
      }
    });

    function updateHUD() {
      document.getElementById('scoreVal').innerText = 'SKOR: ' + score;
      document.getElementById('livesVal').innerText = 'CAN: ' + lives;
    }

    function loop() {
      if (!gameOver) {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall collisions
        if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) {
          ball.vx = -ball.vx;
          playTone(320);
        }
        if (ball.y - ball.r < 0) {
          ball.vy = -ball.vy;
          playTone(320);
        }

        // Paddle Collision
        if (ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.height &&
            ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
          const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          ball.vx = hitPos * 6.5;
          ball.vy = -Math.abs(ball.vy);
          playTone(520);
        }

        // Bottom out
        if (ball.y + ball.r > canvas.height) {
          lives--;
          playTone(180, 0.2);
          updateHUD();
          if (lives <= 0) {
            gameOver = true;
          } else {
            ball.x = paddle.x + paddle.width / 2;
            ball.y = 350;
            ball.vy = -4;
            ball.vx = (Math.random() - 0.5) * 5;
          }
        }

        // Brick Collisions
        for (let c = 0; c < BRICK_COLS; c++) {
          for (let r = 0; r < BRICK_ROWS; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
              const bx = c * (BRICK_W + BRICK_PAD) + BRICK_OFFSET_LEFT;
              const by = r * (BRICK_H + BRICK_PAD) + BRICK_OFFSET_TOP;
              b.x = bx; b.y = by;

              if (ball.x > bx && ball.x < bx + BRICK_W && ball.y > by && ball.y < by + BRICK_H) {
                ball.vy = -ball.vy;
                b.status = 0;
                score += (BRICK_ROWS - r) * 10;
                playTone(650 + r * 50);
                updateHUD();

                for (let i = 0; i < 8; i++) {
                  particles.push({
                    x: ball.x, y: ball.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    life: 1, color: b.color
                  });
                }
              }
            }
          }
        }
      }

      // Draw
      ctx.fillStyle = '#070914';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Bricks
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            const bx = c * (BRICK_W + BRICK_PAD) + BRICK_OFFSET_LEFT;
            const by = r * (BRICK_H + BRICK_PAD) + BRICK_OFFSET_TOP;
            ctx.shadowBlur = 8;
            ctx.shadowColor = b.color;
            ctx.fillStyle = b.color;
            ctx.fillRect(bx, by, BRICK_W, BRICK_H);
          }
        }
      }

      // Draw Paddle
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#c084fc';
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

      // Draw Ball
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.04;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1.0;
        if (p.life <= 0) particles.splice(i, 1);
      }

      if (gameOver) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OYUN BİTTİ', canvas.width / 2, canvas.height / 2);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Yeniden Oynamak İçin Tıklayın', canvas.width / 2, canvas.height / 2 + 30);
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(loop);
    }

    updateHUD();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;
