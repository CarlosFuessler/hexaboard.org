'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          
          <span className="text-xl font-bold">Hexaboard</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm">
            Features
          </a>
          <a href="#showcase" className="text-white/70 hover:text-white transition-colors text-sm">
            3D View
          </a>
          <a href="#specs" className="text-white/70 hover:text-white transition-colors text-sm">
            Specs
          </a>
        </div>

        <div>
          In progress...
        </div>
      </nav>
    </header>
  );
}
