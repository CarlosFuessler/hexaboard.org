"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function KeyboardModel() {
  const group = useRef<THREE.Group>(null);
  const obj = useLoader(OBJLoader, "/models/Hexaboard_v3_Display.obj");

  useEffect(() => {
    if (!obj) return;
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#6b7db8"),
          metalness: 0.7,
          roughness: 0.25,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [obj]);

  return (
    <group ref={group} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} scale={0.12}>
      <primitive object={obj} />
    </group>
  );
}

function FallbackIsometricModel() {
  return (
    <group position={[0, 0, 0]}>
      {/* 2x3 base */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.4, 2.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 6 Keycaps */}
      {[-1, 0, 1].map((x) =>
        [-0.5, 0.5].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 0.9, 0.2, z * 0.9]} castShadow receiveShadow>
            <boxGeometry args={[0.75, 0.35, 0.75]} />
            <meshStandardMaterial color="#6b7db8" metalness={0.5} roughness={0.25} />
          </mesh>
        ))
      )}
    </group>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
      <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="mono text-sm">Loading 3D Model...</p>
    </div>
  );
}

export default function ViewerSection() {
  const [modelError, setModelError] = useState(false);
  useScrollReveal(".viewer-reveal", { stagger: 120, distance: 30 });

  return (
    <section id="showcase" className="py-32 px-6 flex flex-col items-center relative bg-transparent">
      <div className="w-full max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 viewer-reveal">
          <p className="mono text-green-400 mb-6">{"// 3d viewer"}</p>
          <h2 className="section-title mb-6">See it from every angle.</h2>
          <p className="subheadline max-w-2xl mx-auto">
            Drag to rotate. Scroll to zoom. Experience the precision of Hexaboard design.
          </p>
        </div>

        {/* 3D Canvas Glass Container */}
        <div className="glass-card p-4 md:p-8 viewer-reveal">
          <div className="w-full aspect-square bg-gradient-to-b from-black/60 to-black/40 rounded-2xl overflow-hidden border border-green-500/20 relative">
            <Suspense fallback={<LoadingSpinner />}>
              <Canvas
                shadows
                camera={{ position: [4, 3, 4], fov: 45 }}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onError={() => setModelError(true)}
              >
                <ambientLight intensity={0.8} color="#22c55e" />
                <directionalLight position={[5, 5, 5]} intensity={2.5} color="#22c55e" castShadow />
                <directionalLight position={[-3, 3, -3]} intensity={1.2} color="#22c55e" />
                <pointLight position={[0, 3, 0]} intensity={1.0} color="#10b981" />

                {/* Ground shadow plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                  <planeGeometry args={[8, 8]} />
                  <shadowMaterial opacity={0.3} />
                </mesh>

                {!modelError ? <KeyboardModel /> : <FallbackIsometricModel />}

                <OrbitControls
                  enablePan={false}
                  minDistance={2}
                  maxDistance={12}
                  maxPolarAngle={Math.PI / 2.2}
                  autoRotate={true}
                  autoRotateSpeed={0.8}
                  enableDamping={true}
                  dampingFactor={0.05}
                />
              </Canvas>
            </Suspense>
          </div>

          <div className="flex justify-between items-center mt-4 px-2">
            <div className="glass-card px-3 py-2">
              <p className="text-white/60 text-xs mono">Drag to rotate</p>
            </div>
            <div className="glass-card px-3 py-2">
              <p className="text-white/60 text-xs mono">Scroll to zoom</p>
            </div>
          </div>

          <p className="text-white/40 text-sm text-center mt-6 mono">
            Interactive 3D Model • WebGL • Three.js
          </p>
        </div>
      </div>
    </section>
  );
}
