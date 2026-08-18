"use client";

import { useEffect } from "react";
import { createTimeline, stagger } from "animejs";
import dynamic from "next/dynamic";
import TypingCard from "./TypingCard";

const BeamsBackground = dynamic(
  () => import("@/components/kokonutui/beams-background"),
  { ssr: false }
);

export default function HeroSection() {
  useEffect(() => {
    const tl = createTimeline();

    tl.add(".hero-tagline", {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      ease: "outExpo",
    })
    .add(".hero-title", {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1000,
      ease: "outExpo",
    }, "-=600")
    .add(".hero-subtitle", {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      ease: "outExpo",
    }, "-=700")
    .add(".hero-card", {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.95, 1],
      duration: 800,
      ease: "outExpo",
    }, "-=600")
    .add(".hero-cta", {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      ease: "outExpo",
    }, stagger(100, { start: "-=400" }));
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <BeamsBackground className="absolute inset-0" intensity="subtle" />
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <p className="hero-tagline mono text-green-400 mb-6 opacity-0">{"// Your useful little companion"}</p>
        <h1 className="hero-title headline mb-8 opacity-0">Hexaboard</h1>
        <p className="hero-subtitle subheadline mb-12 max-w-2xl mx-auto opacity-0">Your 2x3 Keyboard for Ultimate Productivity.</p>
        <div className="hero-card mb-12 opacity-0">
          <TypingCard />
        </div>
        <div className="flex gap-4">
          <a href="#features" className="hero-cta btn-secondary opacity-0">Explore Features</a>
          <a href="#showcase" className="hero-cta btn-secondary opacity-0">See It In 3D</a>
          <a href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard" target="_blank" rel="noopener noreferrer" className="hero-cta btn-secondary opacity-0">GitHub →</a>
        </div>
      </div>
    </section>
  );
}
