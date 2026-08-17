# React to Vanilla JS Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove React, TypeScript, and build tooling; rebuild hexaboard.org as a static site with plain HTML, vanilla JS, Tailwind CDN, and vanilla Three.js.

**Architecture:** Single `index.html` with four ES modules (`matrix.js`, `hero.js`, `scroll-reveal.js`, `viewer.js`) and a shared `/css/styles.css`. No build step — all dependencies loaded via CDN (Tailwind play CDN, Three.js import map).

**Tech Stack:** HTML5, Tailwind CSS v3 (CDN), vanilla JavaScript (ES modules), Three.js 0.160.0 (import map)

## Global Constraints

- No React, no TypeScript, no Vite, no build tools
- Tailwind via CDN play script only
- Three.js via ES module import map
- Preserve all existing visual design (glass cards, gradient text, Apple typography)
- Preserve matrix rain background
- Preserve 3D keyboard viewer with same lighting, materials, orbit controls
- Preserve scroll-reveal animations
- Remove Flash/Studio page entirely
- All code is vanilla JS ES modules

## File Structure

```
index.html                    # Single page with all sections
/css/styles.css               # Custom CSS (glass, animations, typography)
/js/matrix.js                 # Matrix rain canvas background
/js/hero.js                   # Typing animation
/js/scroll-reveal.js          # IntersectionObserver fade-in
/js/viewer.js                 # Three.js 3D keyboard viewer
/public/Hexaboard_v3_Display.obj  # 3D model (already exists)
```

**Files to delete:** Everything under `src/`, `app/`, plus `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `node_modules/`

---

### Task 1: Project Cleanup — Remove React and Build Tooling

**Files:**
- Delete: `src/`, `app/`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `node_modules/`
- Keep: `public/Hexaboard_v3_Display.obj`, `.gitignore`, `README.md`, `docs/`

**Interfaces:**
- Consumes: Nothing
- Produces: Clean project root with only static assets remaining

- [ ] **Step 1: Delete React source directories**

```bash
rm -rf src/ app/ node_modules/
```

- [ ] **Step 2: Delete config files**

```bash
rm -f package.json package-lock.json vite.config.ts tsconfig.json tsconfig.tsbuildinfo eslint.config.mjs postcss.config.mjs tailwind.config.ts
```

- [ ] **Step 3: Verify cleanup**

Run: `ls -la`
Expected: Only `.git/`, `.gitignore`, `public/`, `README.md`, `docs/`, `index.html` (if it exists from Vite) remain. No `node_modules`, no `.tsx` files.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove React, TypeScript, and build tooling"
```

---

### Task 2: Create index.html — Page Structure with Tailwind CDN

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: Nothing (standalone HTML)
- Produces: Complete page structure that JS modules will attach to

- [ ] **Step 1: Create index.html with full page structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hexaboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/css/styles.css">
  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
    }
  }
  </script>
</head>
<body>
  <!-- Matrix Rain Background -->
  <canvas id="matrix-bg" class="fixed inset-0 z-0 pointer-events-none" aria-hidden="true"></canvas>

  <!-- Header -->
  <header id="header" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent">
    <nav class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold">Hexaboard</span>
      </div>
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-white/70 hover:text-white transition-colors text-sm">Features</a>
        <a href="#showcase" class="text-white/70 hover:text-white transition-colors text-sm">3D View</a>
        <a href="#specs" class="text-white/70 hover:text-white transition-colors text-sm">Specs</a>
      </div>
      <div>
        <span class="inline-block bg-white/10 text-white/90 px-3 py-1 rounded-md text-sm opacity-50 cursor-not-allowed">Studio (Coming soon)</span>
      </div>
    </nav>
  </header>

  <main class="relative z-10">
    <!-- Hero Section -->
    <section id="hero" class="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div class="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <p class="mono text-green-400 mb-6 fade-in">// Your useful little companion</p>
        <h1 class="headline mb-8 fade-in" style="animation-delay: 0.1s">Hexaboard</h1>
        <p class="subheadline mb-12 max-w-2xl fade-in" style="animation-delay: 0.2s">Your 2x3 Keyboard for Ultimate Productivity.</p>
        <div class="mb-12 fade-in" style="animation-delay: 0.25s">
          <div class="glass-card px-8 py-4 inline-block">
            <code class="mono text-green-400 text-lg flex items-center gap-2">
              <span class="text-green-500">&gt;</span>
              <span id="typed-text"></span>
              <span class="inline-block w-2 h-5 bg-green-400 animate-pulse ml-1"></span>
            </code>
          </div>
        </div>
        <div class="flex gap-4 fade-in" style="animation-delay: 0.3s">
          <a href="#features" class="btn-secondary">Explore Features</a>
          <a href="#showcase" class="btn-secondary">See It In 3D</a>
          <a href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard" target="_blank" rel="noopener noreferrer" class="btn-secondary">GitHub →</a>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-48 px-6 flex flex-col items-center relative overflow-hidden">
      <div class="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        <div class="w-full flex flex-col items-center text-center mb-24 reveal">
          <p class="mono text-green-400 mb-6">// features</p>
          <h2 class="section-title mb-6">Built for everyone.</h2>
          <p class="subheadline max-w-xl mx-auto">Every detail engineered for the keyboard enthusiast.</p>
        </div>
        <div class="w-full flex flex-col gap-8">
          <div class="glass-card p-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left group hover:bg-white/5 transition-colors reveal" style="animation-delay: 0.1s">
            <div class="grow flex flex-col justify-center gap-2 w-full text-left">
              <h3 class="text-2xl font-semibold text-white mb-3">Hot-Swappable PCB</h3>
              <p class="text-white/60 leading-relaxed text-base max-w-2xl">Effortlessly swap switches in seconds without soldering. Customize your typing sound and feel to match your exact preference anytime.</p>
            </div>
          </div>
          <div class="glass-card p-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left group hover:bg-white/5 transition-colors reveal" style="animation-delay: 0.2s">
            <div class="grow flex flex-col justify-center gap-2 w-full text-left">
              <h3 class="text-2xl font-semibold text-white mb-3">Powered by ZMK</h3>
              <p class="text-white/60 leading-relaxed text-base max-w-2xl">Industry-leading open source firmware. Remap keys, create complex macros, and define layers with ease. Your keyboard, your rules.</p>
            </div>
          </div>
          <div class="glass-card p-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left group hover:bg-white/5 transition-colors reveal" style="animation-delay: 0.3s">
            <div class="grow flex flex-col justify-center gap-2 w-full text-left">
              <h3 class="text-2xl font-semibold text-white mb-3">Universal Connectivity</h3>
              <p class="text-white/60 leading-relaxed text-base max-w-2xl">High-speed USB-C interface ensures low-latency performance and seamless compatibility across Mac, Windows, and Linux devices.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Showcase / 3D Viewer Section -->
    <section id="showcase" class="py-32 px-6 flex flex-col items-center relative">
      <div class="w-full max-w-3xl mx-auto">
        <div class="text-center mb-20 reveal">
          <p class="mono text-green-400 mb-6">// 3d viewer</p>
          <h2 class="section-title mb-6">See it from every angle.</h2>
          <p class="subheadline max-w-2xl mx-auto">Drag to rotate. Scroll to zoom. Experience the precision of Hexaboard design.</p>
        </div>
        <div class="glass-card p-4 md:p-8 reveal" style="animation-delay: 0.2s">
          <div id="viewer-container" class="w-full aspect-square bg-gradient-to-b from-black/60 to-black/40 rounded-2xl overflow-hidden border border-green-500/20 relative">
            <div id="viewer-loading" class="w-full h-full flex flex-col items-center justify-center text-white/50">
              <div class="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p class="mono text-sm">Loading 3D Model...</p>
            </div>
          </div>
          <div class="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none" style="display:none" id="viewer-hints">
            <div class="glass-card px-3 py-2">
              <p class="text-white/60 text-xs mono">Drag to rotate</p>
            </div>
            <div class="glass-card px-3 py-2">
              <p class="text-white/60 text-xs mono">Scroll to zoom</p>
            </div>
          </div>
          <p class="text-white/40 text-sm text-center mt-6 mono">Interactive 3D Model • WebGL • Three.js</p>
        </div>
      </div>
    </section>

    <!-- Specs Section -->
    <section id="specs" class="py-48 px-6 flex flex-col items-center">
      <div class="w-full max-w-4xl mx-auto">
        <div class="text-center mb-16 reveal">
          <p class="mono text-green-400 mb-6">// specifications</p>
          <h2 class="section-title mb-6">Technical Details</h2>
        </div>
        <div class="glass-card p-12 reveal" style="animation-delay: 0.2s">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
              <span class="text-white/50 mono text-sm">Layout</span>
              <span class="text-white font-medium">Compact 2x3</span>
            </div>
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
              <span class="text-white/50 mono text-sm">Switches</span>
              <span class="text-white font-medium">Hot-Swappable</span>
            </div>
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
              <span class="text-white/50 mono text-sm">Firmware</span>
              <span class="text-white font-medium">ZMK (Open Source)</span>
            </div>
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
              <span class="text-white/50 mono text-sm">Connectivity</span>
              <span class="text-white font-medium">USB-C</span>
            </div>
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
              <span class="text-white/50 mono text-sm">Material</span>
              <span class="text-white font-medium">PLA</span>
            </div>
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
              <span class="text-white/50 mono text-sm">Keycaps</span>
              <span class="text-white font-medium">PBT Double-Shot</span>
            </div>
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
              <span class="text-white/50 mono text-sm">Battery</span>
              <span class="text-white font-medium">Rechargeable Lipo</span>
            </div>
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
              <span class="text-white/50 mono text-sm">Display</span>
              <span class="text-white font-medium">OLED</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="py-16 px-6 border-t border-white/10">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="text-center md:text-left">
          <h3 class="text-2xl font-bold mb-2">Hexaboard</h3>
          <p class="text-white/50 text-sm">Your companion for everywhere.</p>
        </div>
        <div class="text-center">
          <p class="text-white/30 text-sm mono">© 2025 Hexaboard. Designed with Love.</p>
        </div>
        <div class="flex gap-8">
          <a href="#features" class="text-white/50 hover:text-white transition-colors text-sm">Features</a>
          <a href="#showcase" class="text-white/50 hover:text-white transition-colors text-sm">3D View</a>
          <a href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard" target="_blank" class="text-white/50 hover:text-white transition-colors text-sm">GitHub</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script type="module" src="/js/matrix.js"></script>
  <script type="module" src="/js/hero.js"></script>
  <script type="module" src="/js/scroll-reveal.js"></script>
  <script type="module" src="/js/viewer.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify HTML loads in browser**

Open `index.html` directly in browser (or use `python3 -m http.server`). Verify:
- Page renders with black background and white text
- Tailwind classes are applied (green text, glass cards visible)
- All sections present in correct order
- No console errors

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add index.html with Tailwind CDN and full page structure"
```

---

### Task 3: Create /css/styles.css — Custom Styles

**Files:**
- Create: `/css/styles.css`

**Interfaces:**
- Consumes: Tailwind CDN (loaded in HTML)
- Produces: CSS classes used throughout index.html (`.headline`, `.glass-card`, `.fade-in`, `.reveal`, etc.)

- [ ] **Step 1: Create /css/styles.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: #000000;
  color: #f5f5f7;
  font-family: "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Typography */
.headline {
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  background: linear-gradient(180deg, #ffffff 0%, #a1a1a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subheadline {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 400;
  color: #86868b;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.section-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #f5f5f7;
}

.mono {
  font-family: "SF Mono", "Fira Code", "Monaco", monospace;
  font-size: 0.875rem;
  letter-spacing: 0.02em;
}

/* Glassmorphism */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Scroll Reveal */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Gradient Accents */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-border {
  position: relative;
  border: 1px solid transparent;
  background-clip: padding-box;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Buttons */
.btn-secondary {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
```

- [ ] **Step 2: Verify styles render**

Refresh browser. Verify:
- Headline has gradient text effect
- Glass cards have backdrop blur
- Fade-in animations play on load
- Sections with `.reveal` are hidden until scrolled into view

- [ ] **Step 3: Commit**

```bash
git add css/
git commit -m "feat: add custom CSS for typography, glass cards, animations"
```

---

### Task 4: Create /js/matrix.js — Matrix Rain Background

**Files:**
- Create: `/js/matrix.js`

**Interfaces:**
- Consumes: `<canvas id="matrix-bg">` element in HTML
- Produces: Running matrix rain animation on the canvas

- [ ] **Step 1: Create /js/matrix.js**

```javascript
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
```

- [ ] **Step 2: Verify matrix rain**

Refresh browser. Verify:
- Green matrix rain animation plays on background
- Canvas fills entire viewport
- Animation pauses when tab is hidden, resumes when visible
- No console errors

- [ ] **Step 3: Commit**

```bash
git add js/matrix.js
git commit -m "feat: add matrix rain canvas animation"
```

---

### Task 5: Create /js/hero.js — Typing Animation

**Files:**
- Create: `/js/hero.js`

**Interfaces:**
- Consumes: `<span id="typed-text">` element in HTML
- Produces: Typing animation that writes "powered by zmk"

- [ ] **Step 1: Create /js/hero.js**

```javascript
const typedEl = document.getElementById('typed-text');
if (!typedEl) throw new Error('Typed text element not found');

const codeText = 'powered by zmk';
let index = 0;

const interval = setInterval(() => {
  if (index <= codeText.length) {
    typedEl.textContent = codeText.slice(0, index);
    index++;
  } else {
    clearInterval(interval);
  }
}, 100);
```

- [ ] **Step 2: Verify typing animation**

Refresh browser. Verify:
- Text types out "powered by zmk" character by character
- Cursor blinks after text completes
- No console errors

- [ ] **Step 3: Commit**

```bash
git add js/hero.js
git commit -m "feat: add hero typing animation"
```

---

### Task 6: Create /js/scroll-reveal.js — Scroll Reveal Observer

**Files:**
- Create: `/js/scroll-reveal.js`

**Interfaces:**
- Consumes: All elements with class `.reveal` in HTML
- Produces: Adds `.visible` class when element enters viewport

- [ ] **Step 1: Create /js/scroll-reveal.js**

```javascript
const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);

revealElements.forEach((el) => observer.observe(el));
```

- [ ] **Step 2: Verify scroll reveal**

Refresh browser. Scroll down slowly. Verify:
- Features section fades in when scrolled into view
- Showcase section fades in
- Specs section fades in
- Elements stay visible after reveal (don't re-hide)
- No console errors

- [ ] **Step 3: Commit**

```bash
git add js/scroll-reveal.js
git commit -m "feat: add scroll reveal with IntersectionObserver"
```

---

### Task 7: Create /js/viewer.js — Three.js 3D Keyboard Viewer

**Files:**
- Create: `/js/viewer.js`

**Interfaces:**
- Consumes: `#viewer-container` div, `/public/Hexaboard_v3_Display.obj`, Three.js via import map
- Produces: Interactive 3D keyboard viewer with orbit controls

- [ ] **Step 1: Create /js/viewer.js**

```javascript
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('viewer-container');
const loadingEl = document.getElementById('viewer-loading');
const hintsEl = document.getElementById('viewer-hints');
if (!container) throw new Error('Viewer container not found');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(4, 3, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x22c55e, 0.8);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0x22c55e, 2.5);
dirLight1.position.set(5, 5, 5);
dirLight1.castShadow = true;
dirLight1.shadow.mapSize.width = 1024;
dirLight1.shadow.mapSize.height = 1024;
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x22c55e, 1.2);
dirLight2.position.set(-3, 3, -3);
scene.add(dirLight2);

const pointLight = new THREE.PointLight(0x10b981, 1.0);
pointLight.position.set(0, 3, 0);
scene.add(pointLight);

// Ground shadow
const shadowGeometry = new THREE.PlaneGeometry(8, 8);
const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -0.5;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI / 2.2;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, -0.2, 0);

// Load model
const loader = new OBJLoader();
loader.load(
  '/Hexaboard_v3_Display.obj',
  (obj) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#6b7db8',
          metalness: 0.7,
          roughness: 0.25,
          envMapIntensity: 0.5,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    obj.scale.setScalar(0.12);
    obj.rotation.set(-Math.PI / 2, 0, 0);
    obj.position.set(0, -0.2, 0);
    scene.add(obj);

    if (loadingEl) loadingEl.style.display = 'none';
    if (hintsEl) hintsEl.style.display = 'flex';
  },
  undefined,
  (error) => {
    console.error('Error loading OBJ:', error);
    if (loadingEl) {
      loadingEl.innerHTML = '<p class="text-red-400 text-sm">Failed to load 3D model</p>';
    }
  }
);

// Resize handler
function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
```

- [ ] **Step 2: Verify 3D viewer**

Refresh browser. Scroll to 3D viewer section. Verify:
- Loading spinner shows while model loads
- 3D keyboard model renders with green lighting
- Model auto-rotates
- Drag to rotate works
- Scroll to zoom works (constrained between min/max distance)
- "Drag to rotate" and "Scroll to zoom" hints appear after model loads
- No console errors

- [ ] **Step 3: Commit**

```bash
git add js/viewer.js
git commit -m "feat: add Three.js 3D keyboard viewer"
```

---

### Task 8: Final Cleanup and Verification

**Files:**
- Delete: Any remaining files that shouldn't be in the project
- Verify: Full site works without build tools

**Interfaces:**
- Consumes: All previous tasks complete
- Produces: Clean, working static site

- [ ] **Step 1: Remove any remaining unwanted files**

Check for and remove any leftover files:
```bash
ls -la
```
Remove anything that isn't: `index.html`, `css/`, `js/`, `public/`, `.git/`, `.gitignore`, `README.md`, `docs/`

- [ ] **Step 2: Update .gitignore if needed**

Ensure `node_modules/` is still in `.gitignore` (in case it's reinstalled later).

- [ ] **Step 3: Full browser test**

Start a local server:
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000`. Test:
- Matrix rain background animates
- Hero typing animation plays
- All sections scroll smoothly
- Scroll reveal triggers on each section
- 3D viewer loads and is interactive
- Header becomes opaque on scroll
- All links work (anchor links, GitHub)
- No console errors
- Page is responsive (test at mobile width)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete React to vanilla JS redesign"
```
