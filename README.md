# Hexaboard

A modern landing page for the Hexaboard custom keyboard, featuring an interactive 3D viewer built with Raylib and WebAssembly.

## Project Structure

```
hexaboard/
├── app/                    # Next.js application
│   ├── components/         # React components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── rendering/             # C++ 3D viewer
│   ├── Assets/            # 3D models and shaders
│   ├── main.cpp           # Main C++ code
│   └── CMakeLists.txt     # Build configuration
└── public/                # Static assets and WASM output
```

## Getting Started

### Prerequisites

- Node.js 18+
- Emscripten SDK (for WASM compilation)
- CMake 3.11+

### Installation

1. Install Node dependencies:
```bash
npm install
```

2. Setup Emscripten (if not already installed):
```bash
# Follow instructions at https://emscripten.org/docs/getting_started/downloads.html
```

3. Compile the 3D viewer:
```bash
cd rendering
mkdir build_web
cd build_web
emcmake cmake ..
emmake make
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 🎨 Apple-inspired design with glassmorphism effects
- 🖱️ Interactive 3D model viewer (drag to rotate, scroll to zoom)
- 📱 Fully responsive layout
- ⚡ Built with Next.js 14 and React
- 🎮 WebGL rendering with Raylib
- 🎯 Camera-following dynamic lighting

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
