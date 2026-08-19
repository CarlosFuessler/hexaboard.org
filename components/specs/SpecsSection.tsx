"use client";

import { useState } from "react";
import {
  Cpu,
  Radio,
  Battery,
  Layers,
  FileCode,
  ExternalLink,
  Sliders,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { animateCardTilt, resetCardTilt } from "@/lib/animations";

interface SpecCategory {
  title: string;
  icon: typeof Cpu;
  items: { label: string; value: string; note?: string }[];
}

const SPEC_CATEGORIES: SpecCategory[] = [
  {
    title: "Core Architecture",
    icon: Cpu,
    items: [
      { label: "Layout", value: "2x3 Grid Matrix (6 Keys)" },
      { label: "Switch Sockets", value: "Kailh Hot-Swap (3-pin & 5-pin MX)" },
      { label: "Microcontroller", value: "Seeed Studio XIAO BLE / RP2040" },
      { label: "Core Processor", value: "ARM Cortex-M4 @ 64MHz (nRF52840)" },
      { label: "Flash Memory", value: "1MB Flash • 256KB RAM • 2MB QSPI" },
      { label: "Display", value: '0.91" OLED 128x32 px (I2C Bus)' },
    ],
  },
  {
    title: "Connectivity & Radio",
    icon: Radio,
    items: [
      { label: "Wired Interface", value: "USB-C High-Speed (1000Hz Polling)" },
      { label: "Wireless Protocol", value: "Bluetooth Low Energy 5.0" },
      { label: "Wireless Range", value: "10 meters / 33 feet line-of-sight" },
      { label: "Host Pairing", value: "Up to 5 simultaneous device profiles" },
      { label: "Latency", value: "< 1.0 ms Wired • < 4.5 ms Wireless" },
      { label: "Supported OS", value: "macOS, Windows 11, Linux, iPadOS, iOS" },
    ],
  },
  {
    title: "Power & Battery",
    icon: Battery,
    items: [
      { label: "Battery Capacity", value: "300 mAh Rechargeable LiPo (3.7V)" },
      { label: "Active Battery Life", value: "Up to 220 hours continuous BLE" },
      { label: "Standby Time", value: "6+ months in deep sleep state" },
      { label: "Charging Standard", value: "USB-C 5V @ 100mA safe charging" },
      { label: "Charge Time", value: "~1.5 hours from 0% to 100%" },
      { label: "Power Protection", value: "Overcharge, Overdischarge, Short-Circuit" },
    ],
  },
  {
    title: "Chassis & Materials",
    icon: Layers,
    items: [
      { label: "Case Material", value: "Premium PLA+ / PETG / SLA Resin" },
      { label: "Typing Angle", value: "7° Ergonomic Incline" },
      { label: "Fasteners", value: "M2 Stainless Steel + Brass Threaded Inserts" },
      { label: "Keycaps", value: "OEM / Cherry Profile PBT Double-Shot" },
      { label: "Dimensions", value: "68mm x 48mm x 22mm" },
      { label: "Total Weight", value: "~72g (with switches & keycaps)" },
    ],
  },
];

export default function SpecsSection() {
  const [activeTab, setActiveTab] = useState(0);
  useScrollReveal(".spec-reveal", { stagger: 80, distance: 30 });

  return (
    <section id="specs" className="py-32 px-6 relative flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="spec-reveal text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
            <Sliders className="w-3.5 h-3.5" />
            <span>{"// technical datasheets"}</span>
          </div>
          <h2 className="section-title mb-6">Complete Specifications.</h2>
          <p className="subheadline max-w-2xl mx-auto">
            Everything you need to know about the hardware, microcontroller pinout, power consumption, and physical dimensions.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="spec-reveal flex flex-wrap items-center justify-center gap-2 mb-10">
          {SPEC_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={cat.title}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                  isActive
                    ? "bg-emerald-500 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Spec Card */}
        <div
          onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 4)}
          onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
          className="spec-reveal rounded-3xl bg-neutral-950/80 border border-white/10 p-8 md:p-12 backdrop-blur-2xl shadow-2xl mb-12"
        >
          <div className="flex items-center gap-3 pb-6 mb-8 border-b border-white/10">
            {(() => {
              const Icon = SPEC_CATEGORIES[activeTab].icon;
              return <Icon className="w-6 h-6 text-emerald-400" />;
            })()}
            <h3 className="text-xl font-bold text-white">
              {SPEC_CATEGORIES[activeTab].title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {SPEC_CATEGORIES[activeTab].items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-white/[0.06] pb-4"
              >
                <span className="text-white/50 text-xs font-mono">{item.label}</span>
                <span className="text-white font-medium text-xs sm:text-sm font-mono text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Open-Source Downloads Banner */}
        <div className="spec-reveal rounded-3xl bg-gradient-to-r from-emerald-950/40 via-black to-teal-950/40 border border-emerald-500/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">
                Open Hardware & 3D Print Files
              </h4>
              <p className="text-xs text-white/60 leading-relaxed max-w-lg">
                Hexaboard is 100% open-source under CERN-OHL-P and GPL-3.0. Download the KiCad schematics, FreeCAD STEP assembly, and STL case models.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/siliconsniffer/zmk-keyboard-hexaboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
