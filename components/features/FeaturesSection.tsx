"use client";

import { useState } from "react";
import {
  Zap,
  Cpu,
  Radio,
  Monitor,
  CheckCircle2,
  BatteryCharging,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { animateCardTilt, resetCardTilt } from "@/lib/animations";

export default function FeaturesSection() {
  const [selectedSwitch, setSelectedSwitch] = useState<"linear" | "tactile" | "clicky">("linear");
  useScrollReveal(".feature-reveal", { stagger: 90, distance: 35 });

  const switchData = {
    linear: {
      name: "Gateron Oil King / Linear",
      force: "45g",
      travel: "2.0mm Pre / 4.0mm Total",
      sound: "Deep & Creamy Thock",
      color: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    tactile: {
      name: "Boba U4T / Tactile",
      force: "55g",
      travel: "1.8mm Pre / 3.8mm Total",
      sound: "Crisp Tactile Bump",
      color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    clicky: {
      name: "Kailh Box White / Clicky",
      force: "50g",
      travel: "1.8mm Pre / 3.6mm Total",
      sound: "Satisfying Sharp Click",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
  };

  return (
    <section id="features" className="py-32 px-6 relative flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="feature-reveal text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>{"// engineering excellence"}</span>
          </div>
          <h2 className="section-title mb-6">Built for enthusiasts.</h2>
          <p className="subheadline max-w-2xl mx-auto">
            Every millimeter of the Hexaboard PCB and enclosure is engineered for peak tactile performance, endurance, and customization.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Hot-Swappable PCB (2 Cols) */}
          <div
            onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 5)}
            onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
            className="feature-reveal md:col-span-2 relative rounded-3xl bg-neutral-950/70 border border-white/10 p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-emerald-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                  Kailh MX Sockets
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Hot-Swappable MX Sockets
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xl">
                Swap any 3-pin or 5-pin Cherry MX style switch in seconds with zero soldering. Tune your sound signature anytime.
              </p>
            </div>

            {/* Interactive Switch Simulator */}
            <div className="rounded-2xl bg-black/60 border border-white/10 p-4">
              <div className="text-xs font-mono text-white/50 mb-3 flex items-center justify-between">
                <span>TEST COMPATIBLE SWITCH PROFILES:</span>
                <span className="text-emerald-400">50M+ Cycles Rated</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(["linear", "tactile", "clicky"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedSwitch(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                      selectedSwitch === type
                        ? "bg-emerald-500 text-black font-semibold shadow-md"
                        : "bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    {type} Switch
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-white/40 block text-[10px]">PROFILE</span>
                  <span className="text-white font-medium">{switchData[selectedSwitch].name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-white/40 block text-[10px]">ACTUATION FORCE</span>
                  <span className="text-emerald-400 font-medium">{switchData[selectedSwitch].force}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-white/40 block text-[10px]">SOUND SIGNATURE</span>
                  <span className="text-white font-medium">{switchData[selectedSwitch].sound}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: ZMK Firmware (1 Col) */}
          <div
            onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 5)}
            onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
            className="feature-reveal relative rounded-3xl bg-neutral-950/70 border border-white/10 p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-emerald-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Powered by ZMK
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                ZMK is the premier modern open-source keyboard firmware designed natively for wireless efficiency and rich macro logic.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-white/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tap-Dance & Combos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-Latency BLE Stack</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GitHub Actions CI Builds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Web-based Keymap Config</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Multi-OS Connectivity (1 Col) */}
          <div
            onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 5)}
            onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
            className="feature-reveal relative rounded-3xl bg-neutral-950/70 border border-white/10 p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-emerald-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Dual Connectivity
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                High-speed USB Type-C with 1000Hz polling rate + Bluetooth 5.0 wireless with multi-device pairing profiles.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-white/50">POLLING RATE</span>
              <span className="text-emerald-400 font-bold">1,000 Hz (&lt;1ms)</span>
            </div>
          </div>

          {/* Card 4: OLED & Power Management (2 Cols) */}
          <div
            onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 5)}
            onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
            className="feature-reveal md:col-span-2 relative rounded-3xl bg-neutral-950/70 border border-white/10 p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-emerald-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    200h Battery Life
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                OLED Telemetry & Intelligent Power
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xl">
                Crisp SSD1306 OLED display informs you of live layer index, active Bluetooth host, battery percentage, and key actuation telemetry.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[10px]">MICROCONTROLLER</span>
                <span className="text-white font-medium">Seeed XIAO BLE / RP2040</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[10px]">BLUETOOTH CHIP</span>
                <span className="text-white font-medium">Nordic nRF52840</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[10px]">SLEEP CURRENT</span>
                <span className="text-emerald-400 font-medium">&lt; 20 μA Ultra-Low</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[10px]">FIRMWARE FLASH</span>
                <span className="text-white font-medium">UF2 Drag & Drop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
