"use client";

import { useEffect } from "react";
import { animate, stagger } from "animejs";
import { GithubIcon } from "@/components/icons/GithubIcon";

export default function Footer() {
  useEffect(() => {
    animate(".footer-link", {
      opacity: [0, 1],
      translateY: [10, 0],
      delay: stagger(80),
      duration: 600,
      ease: "outExpo",
    });
  }, []);

  return (
    <footer className="py-16 px-6 border-t border-white/10 relative bg-black/40 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2 text-white">Hexaboard</h3>
            <p className="text-white/50 text-sm">Your companion for everywhere.</p>
          </div>
          <div className="text-center">
            <p className="text-white/30 text-sm mono">
              © 2026 Hexaboard. Designed with Love.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <a
              href="#features"
              className="footer-link text-white/50 hover:text-white transition-colors text-sm opacity-0"
            >
              Features
            </a>
            <a
              href="#showcase"
              className="footer-link text-white/50 hover:text-white transition-colors text-sm opacity-0"
            >
              3D View
            </a>
            <a
              href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link text-white/50 hover:text-white transition-colors text-sm opacity-0 flex items-center gap-1.5"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
