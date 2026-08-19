"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ScrollText from "@/components/kokonutui/scroll-text";

const FAQS = [
  {
    q: "How do I remap the 6 keys and write custom macros?",
    a: "Hexaboard uses the standard ZMK firmware ecosystem. You can customize your key mappings through the open-source ZMK GitHub Actions repository or use visual web configurators. Simply edit the `hexaboard.keymap` file, push to your repo, and download the pre-compiled `.uf2` binary.",
  },
  {
    q: "Does Hexaboard require any drivers or background software?",
    a: "Zero drivers required. When plugged in via USB-C or paired over Bluetooth Low Energy, Hexaboard registers as a standard HID keyboard device compatible with macOS, Windows, Linux, iOS, iPadOS, and Android.",
  },
  {
    q: "Can I swap the mechanical switches without soldering?",
    a: "Yes! The custom PCB features genuine Kailh Hot-Swap MX sockets. You can plug in any standard 3-pin or 5-pin Cherry MX, Gateron, Kailh, Boba, or Holy Panda switches effortlessly in seconds.",
  },
  {
    q: "How long does the rechargeable battery last?",
    a: "Equipped with an integrated 300mAh LiPo battery and Nordic nRF52840 ultra-low-power management, Hexaboard delivers up to 200+ hours of continuous typing and over 6 months in deep sleep standby.",
  },
  {
    q: "Are the 3D printable case files freely available?",
    a: "Yes. All CAD files (.STEP, .STL, and FreeCAD source files) are licensed under CERN-OHL-P and available in the GitHub repository for anyone to print, remix, or CNC machine.",
  },
];

const ECOSYSTEM_TAGS = [
  "ZMK Firmware",
  "Nordic nRF52840",
  "Seeed Studio XIAO",
  "Kailh Hot-Swap MX",
  "FreeCAD & KiCad",
  "Three.js & WebGL",
  "Anime.js v4",
  "Kokonut UI",
  "Next.js 16",
  "Tailwind CSS v4",
];

export default function EcosystemSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useScrollReveal(".eco-reveal", { stagger: 70, distance: 25 });

  return (
    <section className="py-32 px-6 relative flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto">
        {/* ScrollText Marquee */}
        <div className="eco-reveal mb-24">
          <div className="text-center mb-6">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
              {"// Open Technology Stack"}
            </span>
          </div>
          <ScrollText texts={ECOSYSTEM_TAGS} />
        </div>

        {/* FAQ Accordion */}
        <div className="eco-reveal">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{"// frequently asked questions"}</span>
            </div>
            <h2 className="section-title mb-6">Common Questions.</h2>
            <p className="subheadline max-w-xl mx-auto">
              Everything you need to know about setting up, flashing, and daily driving your Hexaboard.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-neutral-950/70 border border-white/10 overflow-hidden transition-colors hover:border-emerald-500/30 backdrop-blur-xl"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-white/[0.04] pt-4 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
