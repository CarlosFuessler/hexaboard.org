'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

const KeyboardViewer = dynamic(() => import('./KeyboardViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/40">
      <div className="text-white/50 mono text-sm">Loading 3D Model...</div>
    </div>
  ),
});

export default function Showcase() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="showcase" className="py-32 px-6 flex flex-col items-center relative" ref={ref}>
      <div className="w-full max-w-3xl mx-auto">
        <div className={`text-center mb-20 ${visible ? 'fade-in' : 'opacity-0'}`}>
          <p className="mono text-green-400 mb-6">// 3d viewer</p>
          <h2 className="section-title mb-6">See it from every angle.</h2>
          <p className="subheadline max-w-2xl mx-auto">
            Drag to rotate. Scroll to zoom. Experience the precision of Hexaboard design.
          </p>
        </div>

        <div className={`glass-card p-4 md:p-8 ${visible ? 'fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="w-full aspect-square bg-gradient-to-b from-black/60 to-black/40 rounded-2xl overflow-hidden border border-green-500/20 relative">
            <Suspense fallback={
              <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="mono text-sm">Loading 3D Model...</p>
              </div>
            }>
              <KeyboardViewer />
            </Suspense>
            
            {/* Control hints */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
              <div className="glass-card px-3 py-2">
                <p className="text-white/60 text-xs mono">🖱️ Drag to rotate</p>
              </div>
              <div className="glass-card px-3 py-2">
                <p className="text-white/60 text-xs mono">🔍 Scroll to zoom</p>
              </div>
            </div>
          </div>
          <p className="text-white/40 text-sm text-center mt-6 mono">
            Interactive 3D Model • WebGL • Real-time Rendering
          </p>
        </div>
      </div>
    </section>
  );
}
