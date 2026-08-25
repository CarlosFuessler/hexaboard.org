"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ViewerSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  useScrollReveal(".viewer-reveal", { stagger: 120, distance: 30 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3, 4);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear any previous canvas
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x22c55e, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x22c55e, 2.5);
    dirLight1.position.set(5, 6, 5);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x22c55e, 1.2);
    dirLight2.position.set(-3, 3, -3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x10b981, 1.2, 10);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);

    // Ground shadow
    const shadowGeometry = new THREE.PlaneGeometry(8, 8);
    const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, -0.2, 0);

    // Load Model
    const loader = new OBJLoader();
    loader.load(
      "/Hexaboard_v3_Display.obj",
      (obj) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color("#6b7db8"),
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

        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(percent);
        }
      },
      (error) => {
        console.error("3D model failed to load:", error);
        setIsLoading(false);
        setLoadError(true);
      }
    );

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animateLoop = () => {
      animId = requestAnimationFrame(animateLoop);
      if (controls) controls.update();
      if (renderer) renderer.render(scene, camera);
    };

    animateLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animId) cancelAnimationFrame(animId);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

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

        {/* 3D Canvas Container */}
        <div className="glass-card p-4 md:p-8 viewer-reveal">
          <div className="w-full aspect-square bg-gradient-to-b from-black/60 to-black/40 rounded-2xl overflow-hidden border border-green-500/20 relative flex items-center justify-center">
            {/* The WebGL Canvas mounts directly into this div */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white/70 pointer-events-none">
                <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="mono text-sm mb-2">Loading 3D Model...</p>
                {loadingProgress > 0 && (
                  <p className="mono text-xs text-green-400">{loadingProgress}%</p>
                )}
              </div>
            )}

            {/* Error Message */}
            {loadError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 bg-black/80 text-white/60">
                <p className="text-red-400 mono text-sm mb-2">3D Model preview unavailable</p>
                <p className="text-xs text-white/40 max-w-xs">WebGL is supported, please refresh or check connection.</p>
              </div>
            )}
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
