// ── Custom cursor ──────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
function animateRing() {
  rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a, button, .tool-card, .project-card, .edu-card, .orbit-badge').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.width='20px'; cursor.style.height='20px'; ring.style.width='50px'; ring.style.height='50px'; });
  el.addEventListener('mouseleave', () => { cursor.style.width='12px'; cursor.style.height='12px'; ring.style.width='36px'; ring.style.height='36px'; });
});

// ── Background particles ───────────────────────────────────
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');
pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight;
window.addEventListener('resize', () => { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; });
const particles = [];
const PCOLS = ['#a78bfa','#f472b6','#34d399','#818cf8'];
for (let i = 0; i < 80; i++) {
  particles.push({ x: Math.random()*pCanvas.width, y: Math.random()*pCanvas.height, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:Math.random()*1.5+0.5, color:PCOLS[Math.floor(Math.random()*PCOLS.length)], alpha:Math.random()*0.5+0.1 });
}
function drawParticles() {
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
  particles.forEach(p => {
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0)p.x=pCanvas.width; if(p.x>pCanvas.width)p.x=0;
    if(p.y<0)p.y=pCanvas.height; if(p.y>pCanvas.height)p.y=0;
    pCtx.beginPath(); pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
    pCtx.fillStyle=p.color+Math.floor(p.alpha*255).toString(16).padStart(2,'0');
    pCtx.fill();
  });
  for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){
    const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<100){ pCtx.beginPath(); pCtx.moveTo(particles[i].x,particles[i].y); pCtx.lineTo(particles[j].x,particles[j].y); pCtx.strokeStyle=`rgba(167,139,250,${0.06*(1-dist/100)})`; pCtx.lineWidth=0.5; pCtx.stroke(); }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ── Orbit animation ────────────────────────────────────────
(function initOrbit() {
  const container = document.getElementById('orbitContainer');
  if (!container) return;

  const oCanvas = document.getElementById('orbit-canvas');
  const oCtx = oCanvas.getContext('2d');
  const badges = [...container.querySelectorAll('.orbit-badge')];

  // Two orbit radii (inner, outer)
  const RADII = [148, 218];
  // Speeds in radians/ms (inner faster, outer slower, opposite direction)
  const SPEEDS = [0.00045, -0.00028];

  // Track current angle offsets
  const offsets = [0, 0];

  // Initial angles per badge (from data-angle attr, converted to radians)
  const initAngles = badges.map(b => (parseFloat(b.dataset.angle) * Math.PI) / 180);
  const orbitIdx   = badges.map(b => parseInt(b.dataset.orbit) - 1); // 0 or 1

  function resize() {
    const size = container.offsetWidth;
    oCanvas.width  = size;
    oCanvas.height = size;
  }
  resize();
  window.addEventListener('resize', resize);

  let lastTime = null;

  function tick(ts) {
    if (lastTime === null) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;

    offsets[0] += SPEEDS[0] * dt;
    offsets[1] += SPEEDS[1] * dt;

    const size = oCanvas.width;
    const cx = size / 2, cy = size / 2;

    // Draw rings
    oCtx.clearRect(0, 0, size, size);
    RADII.forEach((r, i) => {
      oCtx.beginPath();
      oCtx.arc(cx, cy, r, 0, Math.PI * 2);
      oCtx.strokeStyle = i === 0
        ? 'rgba(167,139,250,0.22)'
        : 'rgba(167,139,250,0.12)';
      oCtx.lineWidth = 1;
      oCtx.setLineDash([5, 7]);
      oCtx.stroke();
      oCtx.setLineDash([]);
    });

    // Draw small dot glow at center
    const glowR = 104; // photo radius
    const grad = oCtx.createRadialGradient(cx,cy,glowR*0.5, cx,cy, glowR*1.5);
    grad.addColorStop(0, 'rgba(167,139,250,0.08)');
    grad.addColorStop(1, 'rgba(167,139,250,0)');
    oCtx.beginPath(); oCtx.arc(cx,cy,glowR*1.5,0,Math.PI*2);
    oCtx.fillStyle = grad; oCtx.fill();

    // Position each badge
    badges.forEach((badge, i) => {
      const oi = orbitIdx[i];
      const angle = initAngles[i] + offsets[oi];
      const r = RADII[oi];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      badge.style.left = x + 'px';
      badge.style.top  = y + 'px';
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

// ── Scroll reveal ──────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal, .timeline-item');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(el => revObs.observe(el));

// ── Counter animation ──────────────────────────────────────
const counters = document.querySelectorAll('[data-count]');
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target, target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || (target >= 30 ? '+' : '');
      let cur = 0; const step = target/40;
      const t = setInterval(() => { cur+=step; if(cur>=target){cur=target;clearInterval(t);} el.textContent=Math.floor(cur)+suffix; }, 30);
      cntObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(el => cntObs.observe(el));

// ── Progress bars ──────────────────────────────────────────
const progObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.progress-fill').forEach(bar => { bar.style.width = bar.dataset.width + '%'; });
      progObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.about-card').forEach(el => progObs.observe(el));