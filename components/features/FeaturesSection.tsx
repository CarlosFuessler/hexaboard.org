"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Zap, Cpu, Wifi } from "lucide-react";
import { animateCardTilt, resetCardTilt } from "@/lib/animations";

const features = [
  {
    icon: Zap,
    title: "Hot-Swappable PCB",
    description:
      "Effortlessly swap switches in seconds without soldering. Customize your typing sound and feel to match your exact preference anytime.",
  },
  {
    icon: Cpu,
    title: "Powered by ZMK",
    description:
      "Industry-leading open source firmware. Remap keys, create complex macros, and define layers with ease. Your keyboard, your rules.",
  },
  {
    icon: Wifi,
    title: "Universal Connectivity",
    description:
      "High-speed USB-C interface ensures low-latency performance and seamless compatibility across Mac, Windows, and Linux devices.",
  },
];

export default function FeaturesSection() {
  useScrollReveal(".feature-item, .feature-card", { stagger: 120, distance: 30 });

  return (
    <section id="features" className="py-48 px-6 flex flex-col items-center relative overflow-hidden bg-transparent">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Section Title */}
        <div className="w-full flex flex-col items-center text-center mb-20 feature-item">
          <p className="mono text-green-400 mb-6">{"// features"}</p>
          <h2 className="section-title mb-6">Built for everyone.</h2>
          <p className="subheadline max-w-xl mx-auto">
            Every detail engineered for the keyboard enthusiast.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="w-full flex flex-col gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 5)}
                onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
                className="feature-card glass-card p-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left group hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="grow flex flex-col justify-center gap-2 w-full text-left">
                  <h3 className="text-2xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed text-base max-w-2xl">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
