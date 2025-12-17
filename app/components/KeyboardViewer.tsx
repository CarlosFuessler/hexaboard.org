'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

interface KeyboardPartProps {
  path: string;
  color: string;
  explodeOffset: [number, number, number];
  explodeFactor: number;
}

function KeyboardPart({ path, color, explodeOffset, explodeFactor }: KeyboardPartProps) {
  const obj = useLoader(OBJLoader, path);
  
  // Apply material to all meshes
  if (obj) {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.7,
          roughness: 0.25,
          envMapIntensity: 0.5,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
  
  const offsetX = explodeOffset[0] * explodeFactor;
  const offsetY = explodeOffset[1] * explodeFactor;
  const offsetZ = explodeOffset[2] * explodeFactor;
  
  return (
    <primitive 
      object={obj} 
      scale={0.12}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[offsetX, -0.2 + offsetY, offsetZ]}
    />
  );
}

function KeyboardModel({ explodeFactor }: { explodeFactor: number }) {
  const parts = [
    {
      path: '/Hexaboard_v2 Karabiner v3_Hexaboard_v2 Karabiner v3_Boden.obj',
      color: '#2c3e50',
      explodeOffset: [0, -1.5, 0] as [number, number, number],
    },
    {
      path: '/Hexaboard_v2 Karabiner v3_Hexaboard_v2 Karabiner v3_Plate.obj',
      color: '#34495e',
      explodeOffset: [0, 0.5, 0] as [number, number, number],
    },
    {
      path: '/Hexaboard_v2 Karabiner v3_Hexaboard_v2 Karabiner v3_Gehäuse.obj',
      color: '#6b7db8',
      explodeOffset: [0, 0, 0] as [number, number, number],
    },
    {
      path: '/Hexaboard_v2 Switches.obj',
      color: '#e74c3c',
      explodeOffset: [0, 1.0, 0] as [number, number, number],
    },
    {
      path: '/Hexaboard_v2 Caps.obj',
      color: '#ecf0f1',
      explodeOffset: [0, 2.0, 0] as [number, number, number],
    },
  ];

  return (
    <>
      {parts.map((part, index) => (
        <KeyboardPart
          key={index}
          path={part.path}
          color={part.color}
          explodeOffset={part.explodeOffset}
          explodeFactor={explodeFactor}
        />
      ))}
    </>
  );
}

function FallbackModel() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[2, 2, 0.3, 6]} />
      <meshStandardMaterial color="#667eea" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export default function KeyboardViewer() {
  const [explodeFactor, setExplodeFactor] = useState(0);

  return (
    <div className="w-full h-full relative">
      <Canvas 
        shadows
        camera={{ position: [4, 3, 4], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        {/* Green Lighting */}
        <ambientLight intensity={0.8} color="#22c55e" />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={2.5} 
          color="#22c55e"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 3, -3]} intensity={1.2} color="#22c55e" />
        <pointLight position={[0, 3, 0]} intensity={1.0} color="#10b981" />
        
        <Suspense fallback={<FallbackModel />}>
          <KeyboardModel explodeFactor={explodeFactor} />
        </Suspense>
        
        <ContactShadows 
          position={[0, -0.5, 0]} 
          opacity={0.3} 
          scale={8} 
          blur={1.5} 
          far={2}
        />
        
        <OrbitControls 
          enablePan={false}
          minDistance={2}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={explodeFactor === 0}
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Explode View Slider */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-md rounded-full px-6 py-4 flex items-center gap-4 min-w-[320px]">
        <span className="text-white text-sm font-medium whitespace-nowrap">
          Zusammen
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={explodeFactor}
          onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:w-5 
                     [&::-webkit-slider-thumb]:h-5 
                     [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-green-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:hover:bg-green-400
                     [&::-moz-range-thumb]:w-5 
                     [&::-moz-range-thumb]:h-5 
                     [&::-moz-range-thumb]:rounded-full 
                     [&::-moz-range-thumb]:bg-green-500
                     [&::-moz-range-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:shadow-lg"
        />
        <span className="text-white text-sm font-medium whitespace-nowrap">
          Explodiert
        </span>
      </div>
    </div>
  );
}
