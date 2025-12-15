'use client';

import { useEffect, useRef, useState } from 'react';

export default function Features() {
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

  const features = [
    {
      icon: '⚡',
      title: 'Hot-Swappable PCB',
      description: 'Effortlessly swap switches in seconds without soldering. Customize your typing sound and feel to match your exact preference anytime.'
    },
    {
      icon: '⚙️',
      title: 'Powered by ZMK',
      description: 'Industry-leading open source firmware. Remap keys, create complex macros, and define layers with ease. Your keyboard, your rules.'
    },
    {
      icon: '🔌',
      title: 'Universal Connectivity',
      description: 'High-speed USB-C interface ensures low-latency performance and seamless compatibility across Mac, Windows, and Linux devices.'
    },
  ];

  return (
    <section id="features" className="py-48 px-6 flex flex-col items-center relative overflow-hidden" ref={ref}>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className={`w-full flex flex-col items-center text-center mb-24 ${visible ? 'fade-in' : 'opacity-0'}`}>
          <p className="mono text-green-400 mb-6">// features</p>
          <h2 className="section-title mb-6">Built for everyone.</h2>
          <p className="subheadline max-w-xl mx-auto">
            Every detail engineered for the keyboard enthusiast.
          </p>
        </div>
        <div className="w-full flex flex-col gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`glass-card p-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left group hover:bg-white/5 transition-colors ${visible ? 'fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <div className="grow flex flex-col justify-center gap-2 w-full text-left">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed text-base max-w-2xl">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
