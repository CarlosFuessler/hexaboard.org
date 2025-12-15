'use client';

import { useEffect, useState } from 'react';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [typedText, setTypedText] = useState('');
  const codeText = 'keyboard.init()';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= codeText.length) {
        setTypedText(codeText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />

      {/* Green Glow Effect */}
      <div 
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-30 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(22,163,74,0.2) 50%, transparent 100%)',
          animationDuration: '3s',
        }}
      />

      {/* Green Gradient Orb */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pulse"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.6) 0%, rgba(22,163,74,0.3) 50%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <p className="mono text-green-400 mb-6 fade-in">// next-gen input device</p>
        
        <h1 className="headline mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
          Hexaboard
        </h1>
        
        <p className="subheadline mb-12 max-w-2xl fade-in" style={{ animationDelay: '0.2s' }}>
        Your 2x3 Keyboard for Ultimate Productivity.
        </p>

        {/* Code Block */}
        <div className="mb-12 fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="glass-card px-8 py-4 inline-block">
            <code className="mono text-green-400 text-lg flex items-center gap-2">
              <span className="text-green-500">{'>'}</span>
              {typedText}
              <span className="inline-block w-2 h-5 bg-green-400 animate-pulse ml-1"></span>
            </code>
          </div>
        </div>

        <div className="flex gap-4 fade-in" style={{ animationDelay: '0.3s' }}>
          <a href="#features" className="btn-primary">
            Explore Features
          </a>
          <a href="#showcase" className="btn-secondary">
            See It In 3D
          </a>
          <a href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
