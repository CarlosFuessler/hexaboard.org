"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Menu, X, Sparkles, Box, Cpu, Layers } from "lucide-react";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { animateButtonMagnetic, resetButtonMagnetic } from "@/lib/animations";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const scrolled = window.scrollY > 20;
      if (scrolled) {
        headerRef.current.classList.add(
          "bg-black/70",
          "backdrop-blur-xl",
          "border-b",
          "border-white/10",
          "shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        );
      } else {
        headerRef.current.classList.remove(
          "bg-black/70",
          "backdrop-blur-xl",
          "border-b",
          "border-white/10",
          "shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    animate(".header-anim-item", {
      opacity: [0, 1],
      translateY: [-14, 0],
      delay: stagger(60, { start: 100 }),
      duration: 700,
      ease: "outExpo",
    });
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      animate(mobileMenuRef.current, {
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 300,
        ease: "outExpo",
      });
      animate(".mobile-nav-link", {
        opacity: [0, 1],
        translateX: [-15, 0],
        delay: stagger(50, { start: 100 }),
        duration: 400,
        ease: "outExpo",
      });
    }
  }, [mobileMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3.5 px-6"
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#"
          className="header-anim-item flex items-center gap-3 group opacity-0"
        >
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 p-[1px] shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
              <div className="grid grid-cols-3 gap-0.5 p-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-[1px] bg-emerald-400/80 group-hover:bg-emerald-300 transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Hexaboard
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v3.0
              </span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 rounded-full px-4 py-1.5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <a
            href="#features"
            className="header-anim-item text-white/70 hover:text-white hover:bg-white/[0.06] transition-all px-3 py-1 rounded-full text-xs font-medium opacity-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Features
          </a>
          <a
            href="#simulator"
            className="header-anim-item text-white/70 hover:text-white hover:bg-white/[0.06] transition-all px-3 py-1 rounded-full text-xs font-medium opacity-0 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Studio Simulator
          </a>
          <a
            href="#showcase"
            className="header-anim-item text-white/70 hover:text-white hover:bg-white/[0.06] transition-all px-3 py-1 rounded-full text-xs font-medium opacity-0 flex items-center gap-1.5"
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            3D Viewer
          </a>
          <a
            href="#specs"
            className="header-anim-item text-white/70 hover:text-white hover:bg-white/[0.06] transition-all px-3 py-1 rounded-full text-xs font-medium opacity-0 flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Specs
          </a>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard"
            target="_blank"
            rel="noopener noreferrer"
            className="header-anim-item relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-white/90 bg-white/[0.05] border border-white/[0.12] hover:bg-white/[0.1] hover:border-emerald-500/40 transition-all opacity-0 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
            onMouseMove={(e) => animateButtonMagnetic(e.currentTarget, e, 0.2)}
            onMouseLeave={(e) => resetButtonMagnetic(e.currentTarget)}
          >
            <GithubIcon className="w-3.5 h-3.5 text-white" />
            <span>GitHub</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/[0.05] border border-white/10 text-white/80 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden mt-3 p-4 rounded-2xl bg-black/90 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col gap-2"
        >
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 text-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Features
          </a>
          <a
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 text-sm"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            Studio Simulator
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 text-sm"
          >
            <Box className="w-4 h-4 text-emerald-400" />
            3D Viewer
          </a>
          <a
            href="#specs"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/5 text-sm"
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            Specifications
          </a>
          <div className="pt-2 mt-2 border-t border-white/10">
            <a
              href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-link flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
            >
              <GithubIcon className="w-4 h-4" />
              <span>View Source on GitHub</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
