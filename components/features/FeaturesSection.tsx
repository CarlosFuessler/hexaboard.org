"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Zap, Cpu, Wifi } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Hot-Swappable PCB",
    description: "Effortlessly swap switches in seconds without soldering. Customize your typing sound and feel to match your exact preference anytime.",
  },
  {
    icon: Cpu,
    title: "Powered by ZMK",
    description: "Industry-leading open source firmware. Remap keys, create complex macros, and define layers with ease. Your keyboard, your rules.",
  },
  {
    icon: Wifi,
    title: "Universal Connectivity",
    description: "High-speed USB-C interface ensures low-latency performance and seamless compatibility across Mac, Windows, and Linux devices.",
  },
];

export default function FeaturesSection() {
  useScrollReveal(".reveal-item, .feature-card", 150);

  return (
    <section id="features" className="py-48 px-6 flex flex-col items-center relative overflow-hidden">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="w-full flex flex-col items-center text-center mb-24 reveal-item">
          <p className="mono text-green-400 mb-6">{"// features"}</p>
          <h2 className="section-title mb-6">Built for everyone.</h2>
          <p className="subheadline max-w-xl mx-auto">Every detail engineered for the keyboard enthusiast.</p>
        </div>
        <div className="w-full flex flex-col gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card glass-card p-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left group hover:bg-white/5 transition-colors"
            >
              <div className="grow flex flex-col justify-center gap-2 w-full text-left">
                <div className="flex items-center gap-3 mb-3">
                  <feature.icon className="w-6 h-6 text-green-400" />
                  <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-white/60 leading-relaxed text-base max-w-2xl">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
