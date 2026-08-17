const canvas = document.getElementById('matrix-bg');
if (!canvas) throw new Error('Matrix canvas not found');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Could not get 2D context');

const chars = '01';
const baseFont = 14;
const speed = 0.1;
const overlayAlpha = 0.12;
const trailLength = 14;
const glyphAlphaHead = 0.7;
const glyphAlphaTailStart = 0.35;

let width = 0;
let height = 0;
let dpr = 1;
let fontSize = baseFont;
let columns = 0;
let drops = [];
let rafId = null;

function resize() {
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  fontSize = baseFont;
  columns = Math.floor(width / fontSize);
  drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize));

  ctx.font = `${fontSize}px monospace`;
}

function step() {
  ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha})`;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#16a34a';
  ctx.font = `${fontSize}px monospace`;

  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    for (let k = trailLength; k >= 0; k--) {
      const ty = y - k * fontSize;
      if (ty < 0) continue;
      const alpha = k === 0
        ? glyphAlphaHead
        : glyphAlphaTailStart * (1 - k / (trailLength + 1));
      ctx.globalAlpha = alpha;
      ctx.fillText(text, x, ty);
    }

    if (y > height && Math.random() > 0.995) drops[i] = 0;
    drops[i] += speed;
  }

  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(step);
}

function onVisibility() {
  if (document.hidden) {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  } else if (!rafId) {
    rafId = requestAnimationFrame(step);
  }
}

resize();
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', onVisibility);
rafId = requestAnimationFrame(step);
