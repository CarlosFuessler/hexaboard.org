'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

function KeyboardModel() {
  const obj = useLoader(OBJLoader, '/Hexaboard_v3_Display.obj');
  
  // Apply optimized material to all meshes
  if (obj) {
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
  }
  
  return (
    <primitive 
      object={obj} 
      scale={0.12}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.2, 0]}
    />
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
  return (
    <div className="w-full h-full">
      <Canvas 
        shadows
        camera={{ position: [4, 3, 4], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        {/* Optimized Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />
        
        <Suspense fallback={<FallbackModel />}>
          <KeyboardModel />
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
          autoRotate
          autoRotateSpeed={0.8}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
