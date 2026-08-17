# Hexaboard.org: React to Vanilla JS Redesign

## Goal

Remove all React, TypeScript, and build tool dependencies from hexaboard.org. Rebuild the site as a static multi-page site using plain HTML, vanilla JavaScript, and Tailwind CSS via CDN. Keep all existing visual functionality including the 3D keyboard viewer.

## What Gets Removed

- **React** (`react`, `react-dom`, `react-router-dom`)
- **React Three Fiber** (`@react-three/fiber`, `@react-three/drei`)
- **TypeScript** (all `.tsx` files, `tsconfig.json`)
- **Vite** (`vite.config.ts`, build scripts)
- **ESLint** (`eslint.config.mjs`, React plugins)
- **PostCSS/Tailwind build config** (`postcss.config.mjs`, `tailwind.config.ts`)
- **Flash/Studio page** (`app/flash/`)
- **All files under** `src/` and `app/`

## What Gets Kept

- Matrix rain canvas background (ported to vanilla JS)
- Hero section with typing animation
- Features section with scroll-triggered fade-in
- 3D keyboard viewer (ported to vanilla Three.js)
- Specs section
- Header (sticky nav) and Footer
- All existing visual design (glass cards, gradient text, Apple-style typography)
- 3D model file (`public/Hexaboard_v3_Display.obj`)

## New File Structure

```
index.html
/css/styles.css
/js/matrix.js
/js/hero.js
/js/scroll-reveal.js
/js/viewer.js
/public/
  Hexaboard_v3_Display.obj
```

## Dependencies (CDN only)

| Library | Version | Load method |
|---------|---------|-------------|
| Tailwind CSS | v3 | Play CDN `<script src="https://cdn.tailwindcss.com">` |
| Three.js | 0.160.0 | ES module via import map |

## Design Details

### index.html

Single HTML file with all page sections as semantic HTML. Tailwind utility classes preserved from original React components. Scripts loaded as ES modules at bottom of body.

Sections in order:
1. `<canvas id="matrix-bg">` — Matrix rain background (fixed, z-0)
2. `<header>` — Sticky nav with scroll-based background change
3. `<section id="hero">` — Headline, subheadline, typing animation, CTA buttons
4. `<section id="features">` — Three feature cards with scroll reveal
5. `<section id="showcase">` — 3D viewer container
6. `<section id="specs">` — Tech specs grid
7. `<footer>` — Site footer with links

### /css/styles.css

Custom CSS carried over from `app/globals.css`:
- Typography classes: `.headline`, `.subheadline`, `.section-title`, `.mono`
- Glass card: `.glass-card` (backdrop blur, border, hover effects)
- Animations: `@keyframes fadeIn`, `.fade-in`, `@keyframes pulse`, `.pulse`
- Buttons: `.btn-secondary`
- Gradient utilities: `.gradient-text`, `.gradient-border`

New additions:
- `.reveal` — base state for scroll-reveal (opacity: 0, transform: translateY(20px))
- `.reveal.visible` — revealed state (opacity: 1, transform: translateY(0))

Remove `@tailwind` directives (CDN handles this).

### /js/matrix.js

Direct port of `MatrixBackground.tsx`. Canvas-based matrix rain animation using `requestAnimationFrame`. Handles:
- DPR-aware canvas sizing
- Window resize
- Visibility change (pause when tab hidden)
- Character trail with alpha gradient

### /js/hero.js

Typing animation for "powered by zmk" text. Uses `setInterval` to progressively reveal characters. Updates DOM `textContent` directly.

### /js/scroll-reveal.js

Replaces React `IntersectionObserver` pattern used in Features, Showcase, and Specs components. Single observer watches all elements with `data-reveal` attribute. Adds `.visible` class when element enters viewport (threshold: 0.1).

### /js/viewer.js

Direct port of `KeyboardViewer.tsx` to vanilla Three.js:
- `THREE.Scene` with WebGL renderer
- `OBJLoader` for `/Hexaboard_v3_Display.obj`
- Material: `MeshStandardMaterial` (color: #6b7db8, metalness: 0.7, roughness: 0.25)
- Lighting: ambient + 2 directional + 1 point light (green tones)
- `OrbitControls` with auto-rotate, damping, constrained polar angle
- `ContactShadows` equivalent via shadow mapping
- Responsive canvas sizing

## Compatibility

- Modern browsers only (ES modules, import maps, IntersectionObserver, canvas)
- No IE11 support needed
- Works without JavaScript (content visible, animations/3D gracefully degrade)
