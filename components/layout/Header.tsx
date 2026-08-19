"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Menu, X } from "lucide-react";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const scrolled = window.scrollY > 40;
      if (scrolled) {
        headerRef.current.style.background = "rgba(0, 0, 0, 0.8)";
        headerRef.current.style.backdropFilter = "blur(20px)";
        headerRef.current.style.borderBottom = "1px solid rgba(255, 255, 255, 0.08)";
      } else {
        headerRef.current.style.background = "transparent";
        headerRef.current.style.backdropFilter = "none";
        headerRef.current.style.borderBottom = "1px solid transparent";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    animate(".nav-link", {
      opacity: [0, 1],
      translateY: [-10, 0],
      delay: stagger(80),
      duration: 600,
      ease: "outExpo",
    });
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 bg-transparent"
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">Hexaboard</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="nav-link text-white/70 hover:text-white transition-colors text-sm opacity-0"
          >
            Features
          </a>
          <a
            href="#showcase"
            className="nav-link text-white/70 hover:text-white transition-colors text-sm opacity-0"
          >
            3D View
          </a>
          <a
            href="#specs"
            className="nav-link text-white/70 hover:text-white transition-colors text-sm opacity-0"
          >
            Specs
          </a>
        </div>

        {/* Action */}
        <div className="hidden md:flex items-center gap-4">
          <span className="inline-block bg-white/10 text-white/90 px-3 py-1 rounded-md text-sm opacity-50 cursor-not-allowed">
            Studio (Coming soon)
          </span>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/80"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 rounded-2xl bg-black/90 border border-white/10 backdrop-blur-2xl flex flex-col gap-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/80 hover:text-white py-2 text-sm"
          >
            Features
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/80 hover:text-white py-2 text-sm"
          >
            3D View
          </a>
          <a
            href="#specs"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/80 hover:text-white py-2 text-sm"
          >
            Specs
          </a>
        </div>
      )}
    </header>
  );
}
