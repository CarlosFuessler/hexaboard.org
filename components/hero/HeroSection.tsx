"use client";

import { useEffect } from "react";
import { animate, stagger } from "animejs";
import dynamic from "next/dynamic";
import { ArrowRight, Box, Layers, Sparkles, Zap, Battery, Radio } from "lucide-react";
import { GithubIcon } from "@/components/icons/GithubIcon";
import TypingCard from "./TypingCard";
import { animateButtonMagnetic, resetButtonMagnetic } from "@/lib/animations";

const BeamsBackground = dynamic(
  () => import("@/components/kokonutui/beams-background"),
  { ssr: false }
);

export default function HeroSection() {
  useEffect(() => {
    // Anime.js hero stagger animation
    animate(".hero-badge", {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 600,
      ease: "outExpo",
    });

    animate(".hero-title-line", {
      opacity: [0, 1],
      translateY: [35, 0],
      duration: 800,
      delay: stagger(100, { start: 150 }),
      ease: "outExpo",
    });

    animate(".hero-subheadline", {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: 350,
      ease: "outExpo",
    });

    animate(".hero-terminal-wrapper", {
      opacity: [0, 1],
      translateY: [25, 0],
      scale: [0.96, 1],
      duration: 900,
      delay: 500,
      ease: "outExpo",
    });

    animate(".hero-cta-btn", {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      delay: stagger(80, { start: 650 }),
      ease: "outExpo",
    });

    animate(".hero-stat-pill", {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 600,
      delay: stagger(60, { start: 800 }),
      ease: "outExpo",
    });
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden"
    >
      <BeamsBackground className="absolute inset-0" intensity="subtle" />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Top badge */}
        <div className="hero-badge opacity-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{"// The Ultimate 2x3 Programmable Macropad"}</span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 tracking-tight">
          <span className="hero-title-line block text-5xl sm:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-500 opacity-0 leading-[1.1]">
            Precision at
          </span>
          <span className="hero-title-line block text-5xl sm:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-teal-300 opacity-0 leading-[1.1] drop-shadow-[0_0_35px_rgba(52,211,153,0.3)]">
            Your Fingertips.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subheadline opacity-0 text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Hexaboard is an ultra-compact, 6-key wireless mechanical macropad powered by <span className="text-white font-medium">ZMK firmware</span>. Built for developers, designers, and power users who demand zero friction.
        </p>

        {/* Terminal demo */}
        <div className="hero-terminal-wrapper opacity-0 w-full mb-10">
          <TypingCard />
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href="#simulator"
            className="hero-cta-btn opacity-0 relative group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-black font-semibold text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all"
            onMouseMove={(e) => animateButtonMagnetic(e.currentTarget, e, 0.25)}
            onMouseLeave={(e) => resetButtonMagnetic(e.currentTarget)}
          >
            <Layers className="w-4 h-4 text-black" />
            <span>Try Live Simulator</span>
            <ArrowRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href="#showcase"
            className="hero-cta-btn opacity-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-sm border border-white/10 hover:border-emerald-500/40 backdrop-blur-xl transition-all"
            onMouseMove={(e) => animateButtonMagnetic(e.currentTarget, e, 0.2)}
            onMouseLeave={(e) => resetButtonMagnetic(e.currentTarget)}
          >
            <Box className="w-4 h-4 text-emerald-400" />
            <span>3D Interactive View</span>
          </a>

          <a
            href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta-btn opacity-0 inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white font-medium text-sm border border-white/[0.08] transition-all"
            onMouseMove={(e) => animateButtonMagnetic(e.currentTarget, e, 0.15)}
            onMouseLeave={(e) => resetButtonMagnetic(e.currentTarget)}
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>

        {/* Feature quick badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
          <div className="hero-stat-pill opacity-0 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-white/70 text-xs font-mono backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hot-Swappable MX</span>
          </div>

          <div className="hero-stat-pill opacity-0 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-white/70 text-xs font-mono backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>ZMK Open Firmware</span>
          </div>

          <div className="hero-stat-pill opacity-0 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-white/70 text-xs font-mono backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>BLE 5.0 + USB-C</span>
          </div>

          <div className="hero-stat-pill opacity-0 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-white/70 text-xs font-mono backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>200h+ Battery</span>
          </div>
        </div>
      </div>
    </section>
  );
}
