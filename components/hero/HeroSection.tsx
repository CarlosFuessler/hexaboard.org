"use client";

import { useEffect } from "react";
import { animate, stagger } from "animejs";
import TypingCard from "./TypingCard";
import { animateButtonMagnetic, resetButtonMagnetic } from "@/lib/animations";

export default function HeroSection() {
  useEffect(() => {
    // Staggered entrance animation with anime.js
    animate(".hero-tagline", {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      ease: "outExpo",
    });

    animate(".hero-title", {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1000,
      delay: 150,
      ease: "outExpo",
    });

    animate(".hero-subtitle", {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: 250,
      ease: "outExpo",
    });

    animate(".hero-card", {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.95, 1],
      duration: 800,
      delay: 350,
      ease: "outExpo",
    });

    animate(".hero-cta", {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      delay: stagger(100, { start: 450 }),
      ease: "outExpo",
    });
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-transparent"
    >
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <p className="hero-tagline mono text-green-400 mb-6 opacity-0">
          {"// Your useful little companion"}
        </p>

        <h1 className="hero-title headline mb-8 opacity-0">
          Hexaboard
        </h1>

        <p className="hero-subtitle subheadline mb-12 max-w-2xl mx-auto opacity-0">
          Your 2x3 Keyboard for Ultimate Productivity.
        </p>

        <div className="hero-card mb-12 opacity-0">
          <TypingCard />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#features"
            className="hero-cta btn-secondary opacity-0"
            onMouseMove={(e) => animateButtonMagnetic(e.currentTarget, e, 0.25)}
            onMouseLeave={(e) => resetButtonMagnetic(e.currentTarget)}
          >
            Explore Features
          </a>
          <a
            href="#showcase"
            className="hero-cta btn-secondary opacity-0"
            onMouseMove={(e) => animateButtonMagnetic(e.currentTarget, e, 0.25)}
            onMouseLeave={(e) => resetButtonMagnetic(e.currentTarget)}
          >
            See It In 3D
          </a>
          <a
            href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta btn-secondary opacity-0"
            onMouseMove={(e) => animateButtonMagnetic(e.currentTarget, e, 0.25)}
            onMouseLeave={(e) => resetButtonMagnetic(e.currentTarget)}
          >
            GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
