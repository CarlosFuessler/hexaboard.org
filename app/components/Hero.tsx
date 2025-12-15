'use client';

import { useEffect, useState } from 'react';

export default function Hero() {
  const [typedText, setTypedText] = useState('');
  const codeText = 'keyboard.init()';

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
