"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import {
  RotateCcw,
  Play,
  Pause,
  Layers,
  Palette,
  Box,
  Compass,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { animateCardTilt, resetCardTilt } from "@/lib/animations";

// Color themes for the 3D Model
const THEMES = [
  { name: "Cyber Emerald", color: "#10b981", metalness: 0.6, roughness: 0.25 },
  { name: "Stealth Obsidian", color: "#262626", metalness: 0.8, roughness: 0.2 },
  { name: "Neon Cyan", color: "#06b6d4", metalness: 0.5, roughness: 0.3 },
  { name: "Titanium Silver", color: "#94a3b8", metalness: 0.9, roughness: 0.15 },
];

function Model({
  color,
  metalness,
  roughness,
  wireframe,
}: {
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const obj = useLoader(OBJLoader, "/models/Hexaboard_v3_Display.obj");

  useEffect(() => {
    if (!obj) return;
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          metalness,
          roughness,
          wireframe,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [obj, color, metalness, roughness, wireframe]);

  return (
    <group ref={group} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} scale={0.12}>
      <primitive object={obj} />
    </group>
  );
}

function FallbackInteractiveModel({
  color,
  wireframe,
}: {
  color: string;
  wireframe: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* 2x3 stylized keypad base */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.4, 2.2]} />
        <meshStandardMaterial
          color="#18181b"
          metalness={0.8}
          roughness={0.2}
          wireframe={wireframe}
        />
      </mesh>

      {/* 6 Keycaps */}
      {[-1, 0, 1].map((x) =>
        [-0.5, 0.5].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x * 0.9, 0.2, z * 0.9]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.75, 0.4, 0.75]} />
            <meshStandardMaterial
              color={color}
              metalness={0.5}
              roughness={0.3}
              wireframe={wireframe}
            />
          </mesh>
        ))
      )}

      {/* OLED display plate */}
      <mesh position={[0, 0.05, -0.9]}>
        <boxGeometry args={[1.5, 0.1, 0.3]} />
        <meshStandardMaterial color="#059669" emissive="#059669" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-emerald-400/30 border-b-emerald-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        <Box className="absolute inset-0 m-auto w-6 h-6 text-emerald-400 animate-pulse" />
      </div>
      <p className="font-mono text-sm font-medium text-white mb-1">Rendering 3D Model...</p>
      <p className="font-mono text-xs text-white/40">Hardware Accelerated WebGL</p>
    </div>
  );
}

export default function ViewerSection() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const [modelError, setModelError] = useState(false);
  const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  useScrollReveal(".viewer-reveal", { stagger: 100, distance: 30 });

  const activeTheme = THEMES[themeIdx];

  const handleResetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  };

  return (
    <section id="showcase" className="py-32 px-6 relative flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="viewer-reveal text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>{"// real-time cad inspection"}</span>
          </div>
          <h2 className="section-title mb-6">Explore Every Detail.</h2>
          <p className="subheadline max-w-2xl mx-auto">
            Interact with the official Hexaboard v3.0 CAD geometry. Rotate, zoom, inspect internal clearances and swap materials in real time.
          </p>
        </div>

        {/* 3D Canvas Card */}
        <div
          onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 3)}
          onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
          className="viewer-reveal relative rounded-3xl bg-neutral-950/80 border border-white/10 p-4 md:p-8 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(16,185,129,0.08)]"
        >
          {/* Top 3D Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
            {/* Color themes */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/50 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                Finish:
              </span>
              <div className="flex items-center gap-1.5">
                {THEMES.map((theme, idx) => (
                  <button
                    key={theme.name}
                    onClick={() => setThemeIdx(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      themeIdx === idx
                        ? "bg-white/15 text-white border border-white/30 font-medium"
                        : "text-white/40 hover:text-white/80 bg-white/5"
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* View controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                  autoRotate
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 text-white/50"
                }`}
                title={autoRotate ? "Pause auto-rotation" : "Enable auto-rotation"}
              >
                {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="text-xs font-mono hidden sm:inline">Rotate</span>
              </button>

              <button
                onClick={() => setWireframe(!wireframe)}
                className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                  wireframe
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 text-white/50"
                }`}
                title="Toggle wireframe topology"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="text-xs font-mono hidden sm:inline">Wireframe</span>
              </button>

              <button
                onClick={handleResetCamera}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all text-xs flex items-center gap-1.5"
                title="Reset Camera view"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-xs font-mono hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* 3D WebGL Canvas Container */}
          <div className="w-full aspect-[4/3] sm:aspect-[16/9] bg-gradient-to-b from-neutral-900/60 to-black/80 rounded-2xl overflow-hidden border border-emerald-500/20 relative">
            <Suspense fallback={<LoadingSpinner />}>
              <Canvas
                shadows
                camera={{ position: [3.5, 2.5, 3.5], fov: 45 }}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onError={() => setModelError(true)}
              >
                {/* Ambient light for subtle fill */}
                <ambientLight intensity={0.8} />

                {/* Primary green-tinted directional light */}
                <directionalLight
                  position={[5, 8, 5]}
                  intensity={2.2}
                  color="#ecfdf5"
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />

                {/* Rim backlight */}
                <directionalLight position={[-5, 4, -5]} intensity={1.2} color="#10b981" />

                {/* Point light accent */}
                <pointLight position={[0, 3, 0]} intensity={1.5} color="#34d399" />

                {/* Ground shadow plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                  <planeGeometry args={[10, 10]} />
                  <shadowMaterial opacity={0.35} />
                </mesh>

                {!modelError ? (
                  <Model
                    color={activeTheme.color}
                    metalness={activeTheme.metalness}
                    roughness={activeTheme.roughness}
                    wireframe={wireframe}
                  />
                ) : (
                  <FallbackInteractiveModel
                    color={activeTheme.color}
                    wireframe={wireframe}
                  />
                )}

                <OrbitControls
                  ref={orbitRef}
                  enablePan={false}
                  minDistance={2}
                  maxDistance={8}
                  maxPolarAngle={Math.PI / 2.1}
                  autoRotate={autoRotate}
                  autoRotateSpeed={1.0}
                  enableDamping
                  dampingFactor={0.05}
                />
              </Canvas>
            </Suspense>
          </div>

          {/* Bottom telemetry footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-2 text-xs font-mono text-white/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Drag to rotate • Scroll to zoom • WebGL 2.0</span>
            </div>
            <div className="text-white/40">
              Model: Hexaboard_v3_Display.obj (Triangles: ~24k)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
