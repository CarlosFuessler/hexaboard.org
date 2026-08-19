"use client";

import { ArrowUp } from "lucide-react";
import { animateButtonMagnetic, resetButtonMagnetic } from "@/lib/animations";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-20 px-6 border-t border-white/10 relative overflow-hidden bg-black/60 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 p-[1px]">
                <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-0.5 p-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-[0.5px] bg-emerald-400" />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Hexaboard</span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              The ultimate 2x3 programmable mechanical macropad powered by open-source ZMK firmware.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400/90 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ZMK Firmware v3.5 • Open Hardware</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-mono">
            <div className="space-y-2.5">
              <span className="text-white/40 block uppercase tracking-wider text-[10px]">Product</span>
              <a href="#features" className="block text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#simulator" className="block text-white/70 hover:text-white transition-colors">Studio Simulator</a>
              <a href="#showcase" className="block text-white/70 hover:text-white transition-colors">3D Model</a>
            </div>

            <div className="space-y-2.5">
              <span className="text-white/40 block uppercase tracking-wider text-[10px]">Resources</span>
              <a href="#specs" className="block text-white/70 hover:text-white transition-colors">Specifications</a>
              <a href="https://zmk.dev" target="_blank" rel="noopener noreferrer" className="block text-white/70 hover:text-white transition-colors">ZMK Docs</a>
              <a href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard" target="_blank" rel="noopener noreferrer" className="block text-white/70 hover:text-white transition-colors">GitHub Source</a>
            </div>

            <div className="space-y-2.5">
              <span className="text-white/40 block uppercase tracking-wider text-[10px]">Community</span>
              <a href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard/issues" target="_blank" rel="noopener noreferrer" className="block text-white/70 hover:text-white transition-colors">Report Issue</a>
              <a href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard/discussions" target="_blank" rel="noopener noreferrer" className="block text-white/70 hover:text-white transition-colors">Discussions</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
          <div>
            © {new Date().getFullYear()} Hexaboard.org • Licensed under CERN-OHL-P & GPL-3.0
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              onMouseMove={(e) => animateButtonMagnetic(e.currentTarget, e, 0.2)}
              onMouseLeave={(e) => resetButtonMagnetic(e.currentTarget)}
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
