// ===== Theme =====
(function () {
  try {
    var stored = localStorage.getItem('meghanadh-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();

function openEmail() {
  var email = 'meghanadhjanga02@gmail.com';
  // Copy to clipboard as a reliable fallback so the email always reaches them
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email);
    }
  } catch (e) {}
  showToast('Email copied: ' + email);
}

function showToast(msg) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#171717;color:#fafafa;border:1px dashed #262626;padding:10px 16px;border-radius:8px;font-family:JetBrains Mono,monospace;font-size:12px;z-index:9999;opacity:0;transition:opacity .2s;';
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.style.opacity = '1'; });
  setTimeout(function(){ t.style.opacity = '0'; setTimeout(function(){ t.remove(); }, 200); }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle wiring
  function toggleTheme() {
    var isDark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('meghanadh-theme', isDark ? 'dark' : 'light'); } catch (e) {}
  }
  ['theme-toggle', 'theme-toggle-mobile'].forEach(id => {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', toggleTheme);
  });

  // Mobile menu
  var menuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));
  }

  // Hover sound toggle (visual only)
  var hs = document.getElementById('hover-sound');
  if (hs) {
    hs.addEventListener('click', () => {
      var pressed = hs.getAttribute('aria-pressed') === 'true';
      hs.setAttribute('aria-pressed', String(!pressed));
      hs.textContent = pressed ? 'Enable hover sounds' : 'Disable hover sounds';
    });
  }

  // Project filters
  var pFilters = document.querySelectorAll('#project-filters .filter-btn');
  var pCards = document.querySelectorAll('#projects-list .project-card');
  pFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      pFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      pCards.forEach(card => {
        var cats = (card.getAttribute('data-category') || '').split(/\s+/);
        var show = f === 'all' || cats.indexOf(f) !== -1;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // Skill filters
  var sFilters = document.querySelectorAll('#skill-filters .skill-filter');
  var sPills = document.querySelectorAll('#skills-list .skill-pill');
  sFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      sFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      var f = btn.getAttribute('data-skill');
      sPills.forEach(pill => {
        var cat = pill.getAttribute('data-cat');
        var show = f === 'all' || cat === f;
        pill.style.display = show ? '' : 'none';
      });
    });
  });

  // Year
  var y = document.getElementById('current-year');
  if (y) y.textContent = new Date().getFullYear();

  // ===== Volleyball game =====
  initVolleyball();
});


function initVolleyball() {
  var btn = document.getElementById('play-volleyball-btn');
  var modal = document.getElementById('volleyball-modal');
  var closeBtn = document.getElementById('volleyball-close');
  var canvas = document.getElementById('volleyball-canvas');
  if (!btn || !modal || !canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var keys = {};
  var spaceWasDown = false;
  var running = false;
  var paused = false;
  var raf = null;

  var ground = H - 24;
  var netX = W / 2;
  var netH = 110;
  var you = { x: 100, y: ground - 44, w: 30, h: 44, vy: 0, onGround: true, color: '#10b981' };
  var cpu = { x: W - 100 - 30, y: ground - 44, w: 30, h: 44, vy: 0, onGround: true, color: '#8b5cf6' };
  var ball = { x: W/2, y: 100, vx: 0, vy: 0, r: 11, trail: [], inPlay: false };
  var scoreYou = 0, scoreCpu = 0;
  var gravity = 0.55;
  var serving = true;
  var gameOver = false;
  var winner = '';
  var particles = [];

  function beep(freq, dur) {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ac = beep._ac || (beep._ac = new Ctx());
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = 'square';
      o.frequency.value = freq;
      g.gain.value = 0.05;
      o.connect(g); g.connect(ac.destination);
      o.start();
      setTimeout(function(){ o.stop(); }, dur);
    } catch (e) {}
  }

  function resetBall(server) {
    ball.x = server === 'you' ? 110 : W - 110;
    ball.y = 130;
    ball.vx = 0; ball.vy = 0; ball.trail = [];
    ball.inPlay = false;
    serving = true;
  }
  function resetPlayers() {
    you.x = 100; you.y = ground - you.h; you.vy = 0; you.onGround = true;
    cpu.x = W - 100 - cpu.w; cpu.y = ground - cpu.h; cpu.vy = 0; cpu.onGround = true;
  }
  function spawnParticles(x, y, color) {
    for (var i = 0; i < 12; i++) {
      particles.push({ x: x, y: y, vx: (Math.random()-0.5)*6, vy: (Math.random()-0.5)*6 - 2, life: 30, color: color });
    }
  }

  function openModal() {
    modal.classList.remove('hidden');
    scoreYou = 0; scoreCpu = 0; gameOver = false; winner = '';
    paused = false;
    resetPlayers(); resetBall('you');
    updateScore();
    running = true;
    if (raf) cancelAnimationFrame(raf);
    loop();
  }
  function closeModal() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    modal.classList.add('hidden');
  }

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  window.addEventListener('keydown', function (e) {
    keys[e.key.toLowerCase()] = true;
    if (!running) return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (!spaceWasDown && serving && !gameOver) {
        ball.vx = 5; ball.vy = -10; ball.inPlay = true; serving = false;
        beep(440, 60);
      }
      if (gameOver && !spaceWasDown) {
        scoreYou = 0; scoreCpu = 0; gameOver = false; winner = '';
        resetPlayers(); resetBall('you'); updateScore();
      }
      spaceWasDown = true;
    }
    if (e.key.toLowerCase() === 'p') {
      paused = !paused;
      updateScore();
    }
  });
  window.addEventListener('keyup', function (e) {
    keys[e.key.toLowerCase()] = false;
    if (e.key === ' ' || e.key === 'Spacebar') spaceWasDown = false;
  });

  function updateScore() {
    document.getElementById('vb-score-you').textContent = scoreYou;
    document.getElementById('vb-score-cpu').textContent = scoreCpu;
    var st = document.getElementById('vb-status');
    if (gameOver) st.textContent = winner + '  ·  Space to play again';
    else if (paused) st.textContent = 'Paused (P to resume)';
    else if (serving) st.textContent = 'Press Space to serve';
    else st.textContent = 'Rally!';
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function update() {
    if (paused) { updateScore(); return; }
    if (gameOver) { updateScore(); return; }
    var speed = 5;
    if (keys['a'] || keys['arrowleft']) you.x -= speed;
    if (keys['d'] || keys['arrowright']) you.x += speed;
    you.x = clamp(you.x, 8, netX - you.w - 6);
    if ((keys['w'] || keys['arrowup']) && you.onGround) { you.vy = -13; you.onGround = false; beep(660, 40); }
    you.vy += gravity;
    you.y += you.vy;
    if (you.y + you.h >= ground) { you.y = ground - you.h; you.vy = 0; you.onGround = true; }

    var cpuSpeed = 3.2;
    var target = (ball.inPlay ? ball.x : W - 120) - cpu.w/2;
    if (cpu.x + cpu.w/2 < target - 6) cpu.x += cpuSpeed;
    else if (cpu.x + cpu.w/2 > target + 6) cpu.x -= cpuSpeed;
    cpu.x = clamp(cpu.x, netX + 6, W - cpu.w - 8);
    if (ball.inPlay && ball.vy > 0 && ball.y > H*0.45 && Math.abs(ball.x - (cpu.x+cpu.w/2)) < 46 && cpu.onGround) {
      cpu.vy = -12.5; cpu.onGround = false; beep(550, 40);
    }
    cpu.vy += gravity;
    cpu.y += cpu.vy;
    if (cpu.y + cpu.h >= ground) { cpu.y = ground - cpu.h; cpu.vy = 0; cpu.onGround = true; }

    if (ball.inPlay) {
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 8) ball.trail.shift();
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.vy += 0.32;
      if (ball.x > netX - 7 && ball.x < netX + 7 && ball.y + ball.r > ground - netH) {
        ball.vx = -ball.vx * 0.55;
        ball.x = ball.x < netX ? netX - 8 : netX + 8;
        beep(300, 50);
      }
      if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
      if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y + ball.r >= ground) {
        var scorer = ball.x < netX ? 'cpu' : 'you';
        if (scorer === 'you') { scoreYou++; spawnParticles(ball.x, ground, '#10b981'); beep(880, 120); }
        else { scoreCpu++; spawnParticles(ball.x, ground, '#8b5cf6'); beep(220, 120); }
        resetBall(scorer === 'you' ? 'cpu' : 'you');
        updateScore();
        if (scoreYou >= 7 || scoreCpu >= 7) {
          gameOver = true; winner = (scoreYou >= 7 ? 'You win!' : 'CPU wins!');
          updateScore();
        }
        return;
      }
      [you, cpu].forEach(function (p) {
        if (ball.x + ball.r > p.x && ball.x - ball.r < p.x + p.w &&
            ball.y + ball.r > p.y && ball.y - ball.r < p.y + p.h) {
          ball.vy = -Math.abs(ball.vy) - 2.5;
          ball.vx += (ball.x - (p.x + p.w/2)) * 0.2;
          ball.vx = clamp(ball.vx, -9, 9);
          ball.y = p.y - ball.r - 1;
          spawnParticles(ball.x, ball.y, p.color);
          beep(520, 50);
        }
      });
    }
    particles = particles.filter(function (pt) { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.2; pt.life--; return pt.life > 0; });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#fafafa';
    var soft = getComputedStyle(document.documentElement).getPropertyValue('--soft').trim() || '#525252';
    var line = getComputedStyle(document.documentElement).getPropertyValue('--line').trim() || '#262626';
    ctx.fillStyle = 'rgba(16,185,129,0.05)';
    ctx.fillRect(0, ground, W, H - ground);
    ctx.strokeStyle = line;
    ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(netX, ground - netH); ctx.lineTo(netX, ground); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft;
    ctx.fillRect(netX - 3, ground - netH, 6, netH);
    ctx.fillStyle = fg;
    ctx.fillRect(netX - 4, ground - netH - 2, 8, 3);
    ctx.fillStyle = you.color;
    roundRect(ctx, you.x, you.y, you.w, you.h, 6);
    ctx.fillStyle = cpu.color;
    roundRect(ctx, cpu.x, cpu.y, cpu.w, cpu.h, 6);
    ball.trail.forEach(function (t, i) {
      ctx.globalAlpha = (i+1)/ball.trail.length * 0.4;
      ctx.beginPath(); ctx.arc(t.x, t.y, ball.r * 0.6, 0, Math.PI*2);
      ctx.fillStyle = fg; ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = fg; ctx.fill();
    particles.forEach(function (pt) {
      ctx.globalAlpha = pt.life / 30;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 3, 3);
    });
    ctx.globalAlpha = 1;
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillStyle = soft;
    ctx.textAlign = 'center';
    ctx.fillText(scoreYou + '  :  ' + scoreCpu, W/2, 36);
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = fg;
      ctx.font = 'bold 32px "Instrument Serif", serif';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', W/2, H/2);
    }
    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = fg;
      ctx.font = 'bold 40px "Instrument Serif", serif';
      ctx.textAlign = 'center';
      ctx.fillText(winner, W/2, H/2 - 10);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = soft;
      ctx.fillText('Press Space to play again', W/2, H/2 + 24);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function loop() {
    if (!running) return;
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }
}
