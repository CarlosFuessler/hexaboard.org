'use client';

import { useEffect, useRef, useState } from 'react';

export default function Specs() {
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

  const specs = [
    { label: 'Layout', value: 'Compact 2x6' },
    { label: 'Switches', value: 'Hot-Swappable' },
    { label: 'Firmware', value: 'ZMK (Open Source)' },
    { label: 'Connectivity', value: 'USB-C' },
    { label: 'Material', value: 'PLA' },
    { label: 'Keycaps', value: 'PBT Double-Shot' },
  ];

  return (
    <section id="specs" className="py-48 px-6 flex flex-col items-center" ref={ref}>
      <div className="w-full max-w-4xl mx-auto">
        <div className={`text-center mb-16 ${visible ? 'fade-in' : 'opacity-0'}`}>
          <p className="mono text-green-400 mb-6">// specifications</p>
          <h2 className="section-title mb-6">Technical Details</h2>
        </div>

        <div className={`glass-card p-12 ${visible ? 'fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specs.map((spec, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center border-b border-white/10 pb-4"
              >
                <span className="text-white/50 mono text-sm">{spec.label}</span>
                <span className="text-white font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
