# Hexaboard

A modern landing page for the Hexaboard custom keyboard, featuring an interactive 3D viewer built with Three.js.

## Project Structure

```
hexaboard/
├── app/                    # App pages/components
│   ├── components/         # React components
│   ├── globals.css        # Global styles
│   ├── page.tsx           # Home route component
│   └── flash/             # Studio placeholder (in progress)
├── src/                   # Vite app bootstrap and routing
└── public/                # Static assets (3D model files)
```

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

1. Install Node dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- 🎨 Apple-inspired design with glassmorphism effects
- 🖱️ Interactive 3D model viewer (drag to rotate, scroll to zoom)
- 📱 Fully responsive layout
- ⚡ Built with Vite and React
- 🎮 WebGL rendering with Three.js
- 🎯 Camera-following dynamic lighting

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
