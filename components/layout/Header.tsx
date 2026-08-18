"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import type { FunctionValue } from "animejs";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const scrolled = window.scrollY > 50;
      if (scrolled) {
        headerRef.current.style.background = "rgba(0, 0, 0, 0.8)";
        headerRef.current.style.backdropFilter = "blur(20px)";
      } else {
        headerRef.current.style.background = "transparent";
        headerRef.current.style.backdropFilter = "none";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    animate(".nav-link", {
      opacity: [0, 1],
      translateY: [-10, 0],
      delay: ((_target: Element, i: number) => i * 100) as FunctionValue,
      ease: "outExpo",
    });
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Hexaboard</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="nav-link text-white/70 hover:text-white transition-colors text-sm">Features</a>
          <a href="#showcase" className="nav-link text-white/70 hover:text-white transition-colors text-sm">3D View</a>
          <a href="#specs" className="nav-link text-white/70 hover:text-white transition-colors text-sm">Specs</a>
        </div>
        <div>
          <span className="inline-block bg-white/10 text-white/90 px-3 py-1 rounded-md text-sm opacity-50 cursor-not-allowed">Studio (Coming soon)</span>
        </div>
      </nav>
    </header>
  );
}
