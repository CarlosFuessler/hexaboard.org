"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { animateCardTilt, resetCardTilt } from "@/lib/animations";
import { siteContent } from "@/lib/content";

const specs = siteContent.specs;

export default function SpecsSection() {
  useScrollReveal(".spec-card", { stagger: 100, distance: 30 });

  return (
    <section id="specs" className="py-48 px-6 flex flex-col items-center bg-transparent">
      <div className="w-full max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 spec-card">
          <p className="mono text-green-400 mb-6">{"// specifications"}</p>
          <h2 className="section-title mb-6">Technical Details</h2>
        </div>

        {/* Specs Glass Card */}
        <div
          onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 4)}
          onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
          className="glass-card p-8 sm:p-12 spec-card"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between items-center border-b border-white/10 pb-4"
              >
                <span className="text-white/50 mono text-sm">{spec.label}</span>
                <span className="text-white font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
