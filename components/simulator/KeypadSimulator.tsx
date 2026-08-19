"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { animate } from "animejs";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Command,
  GitBranch,
  Music,
  Code2,
  Check,
  Copy,
  Sliders,
  Cpu,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { animateCardTilt, resetCardTilt } from "@/lib/animations";

interface KeyConfig {
  id: number;
  label: string;
  sublabel: string;
  icon?: string;
  zmkCode: string;
  actionDescription: string;
  color: string;
}

interface LayerData {
  name: string;
  description: string;
  badge: string;
  icon: typeof GitBranch;
  keys: KeyConfig[];
}

const LAYERS: LayerData[] = [
  {
    name: "Dev & Git",
    description: "Instant developer shortcuts for terminal, IDE, and version control",
    badge: "LAYER 0",
    icon: GitBranch,
    keys: [
      {
        id: 1,
        label: "GIT ADD",
        sublabel: "git add -A",
        zmkCode: "&macro_git_add",
        actionDescription: "Staged all modified files",
        color: "from-emerald-500 to-green-600",
      },
      {
        id: 2,
        label: "COMMIT",
        sublabel: "git commit",
        zmkCode: "&macro_git_commit",
        actionDescription: "Opened commit editor with prefilled template",
        color: "from-emerald-400 to-teal-500",
      },
      {
        id: 3,
        label: "PUSH",
        sublabel: "git push",
        zmkCode: "&macro_git_push",
        actionDescription: "Pushed 1 commit to origin/main",
        color: "from-cyan-400 to-blue-500",
      },
      {
        id: 4,
        label: "DEBUG",
        sublabel: "F5 Run",
        zmkCode: "&kp F5",
        actionDescription: "Started debug session on localhost:3000",
        color: "from-amber-400 to-orange-500",
      },
      {
        id: 5,
        label: "TERMINAL",
        sublabel: "⌥ ` Toggle",
        zmkCode: "&macro_toggle_term",
        actionDescription: "Toggled integrated terminal split",
        color: "from-purple-400 to-indigo-500",
      },
      {
        id: 6,
        label: "AI FIX",
        sublabel: "⌘ ⌥ I",
        zmkCode: "&macro_ai_prompt",
        actionDescription: "Sent context to AI coding copilot",
        color: "from-pink-400 to-rose-500",
      },
    ],
  },
  {
    name: "Media & Stream",
    description: "One-touch control for Spotify, Zoom/Meet audio, and OBS",
    badge: "LAYER 1",
    icon: Music,
    keys: [
      {
        id: 1,
        label: "MUTE MIC",
        sublabel: "⌘ ⇧ M",
        zmkCode: "&macro_mic_mute",
        actionDescription: "Toggled Microphone Mute state",
        color: "from-red-500 to-rose-600",
      },
      {
        id: 2,
        label: "CAM OFF",
        sublabel: "⌘ ⇧ O",
        zmkCode: "&macro_cam_toggle",
        actionDescription: "Toggled Webcam video feed",
        color: "from-orange-500 to-amber-600",
      },
      {
        id: 3,
        label: "PLAY/PAUSE",
        sublabel: "Media Play",
        zmkCode: "&kp C_PLAY_PAUSE",
        actionDescription: "Spotify: Playing 'Resonance - HOME'",
        color: "from-emerald-400 to-green-500",
      },
      {
        id: 4,
        label: "VOL DOWN",
        sublabel: "Media Vol -",
        zmkCode: "&kp C_VOL_DN",
        actionDescription: "Decreased Master Volume to 65%",
        color: "from-blue-400 to-indigo-500",
      },
      {
        id: 5,
        label: "VOL UP",
        sublabel: "Media Vol +",
        zmkCode: "&kp C_VOL_UP",
        actionDescription: "Increased Master Volume to 75%",
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: 6,
        label: "NEXT TRACK",
        sublabel: "Media Next",
        zmkCode: "&kp C_NEXT",
        actionDescription: "Skipped to next soundtrack track",
        color: "from-purple-400 to-pink-500",
      },
    ],
  },
  {
    name: "OS & Productivity",
    description: "Rapid window management, clipboard history, and screenshots",
    badge: "LAYER 2",
    icon: Command,
    keys: [
      {
        id: 1,
        label: "COPY",
        sublabel: "⌘ C",
        zmkCode: "&kp LG(C)",
        actionDescription: "Copied selected text to clipboard",
        color: "from-emerald-400 to-teal-500",
      },
      {
        id: 2,
        label: "PASTE",
        sublabel: "⌘ V",
        zmkCode: "&kp LG(V)",
        actionDescription: "Pasted snippet from clipboard buffer",
        color: "from-green-500 to-emerald-600",
      },
      {
        id: 3,
        label: "SNIP CAPTURE",
        sublabel: "⌘ ⇧ 4",
        zmkCode: "&kp LG(LS(N4))",
        actionDescription: "Initiated region screenshot to clipboard",
        color: "from-cyan-400 to-blue-500",
      },
      {
        id: 4,
        label: "APP SWITCH",
        sublabel: "⌘ Tab",
        zmkCode: "&macro_app_switch",
        actionDescription: "Cycled active desktop workspace",
        color: "from-violet-400 to-purple-600",
      },
      {
        id: 5,
        label: "SPOTLIGHT",
        sublabel: "⌘ Space",
        zmkCode: "&kp LG(SPACE)",
        actionDescription: "Opened Raycast / Spotlight omni-search",
        color: "from-amber-400 to-yellow-500",
      },
      {
        id: 6,
        label: "LOCK OS",
        sublabel: "⌃ ⌘ Q",
        zmkCode: "&kp LC(LG(Q))",
        actionDescription: "Locked workstation and put displays to sleep",
        color: "from-rose-400 to-red-600",
      },
    ],
  },
];

export default function KeypadSimulator() {
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeKey, setActiveKey] = useState<KeyConfig | null>(LAYERS[0].keys[0]);
  const [lastAction, setLastAction] = useState<string>("Ready. Click any of the 6 keys or use numbers 1-6.");
  const [pressCount, setPressCount] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const oledRef = useRef<HTMLDivElement>(null);
  const keyRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useScrollReveal(".sim-reveal", 100);

  // Play mechanical switch synthesized sound
  const playClickSound = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Thock click tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio not permitted yet
    }
  }, [soundEnabled]);

  const handleKeyPress = useCallback((key: KeyConfig, index: number) => {
    setActiveKey(key);
    setLastAction(key.actionDescription);
    setPressCount((c) => c + 1);
    playClickSound();

    const target = keyRefs.current[index];
    if (target) {
      animate(target, {
        translateY: [0, 6, 0],
        scale: [1, 0.92, 1],
        duration: 180,
        ease: "outQuad",
      });
    }

    if (oledRef.current) {
      animate(oledRef.current, {
        opacity: [0.7, 1],
        duration: 200,
        ease: "outQuad",
      });
    }
  }, [playClickSound]);

  // Handle keyboard 1-6 keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 6) {
        const keyIndex = num - 1;
        const currentLayer = LAYERS[activeLayerIndex];
        if (currentLayer.keys[keyIndex]) {
          handleKeyPress(currentLayer.keys[keyIndex], keyIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLayerIndex, handleKeyPress]);

  const handleCopyZmk = () => {
    if (!activeKey) return;
    const snippet = `// Hexaboard Keymap snippet for ${activeKey.label}\n${activeKey.zmkCode}`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentLayer = LAYERS[activeLayerIndex];

  return (
    <section id="simulator" className="py-32 px-6 relative flex flex-col items-center">
      <div className="w-full max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="sim-reveal text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
            <Sliders className="w-3.5 h-3.5" />
            <span>{"// interactive studio demo"}</span>
          </div>
          <h2 className="section-title mb-6">Experience the 2x3 Matrix.</h2>
          <p className="subheadline max-w-2xl mx-auto">
            Click any mechanical switch below or press keys <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs">1</kbd> through <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs">6</kbd> on your keyboard to test real ZMK macro executions.
          </p>
        </div>

        {/* Simulator Main Glass Card */}
        <div
          ref={cardContainerRef}
          onMouseMove={(e) => animateCardTilt(e.currentTarget, e, 4)}
          onMouseLeave={(e) => resetCardTilt(e.currentTarget)}
          className="sim-reveal relative rounded-3xl bg-neutral-950/80 border border-white/10 p-6 md:p-10 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(16,185,129,0.06)]"
        >
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
            {/* Layer Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              {LAYERS.map((layer, idx) => {
                const Icon = layer.icon;
                const isActive = activeLayerIndex === idx;
                return (
                  <button
                    key={layer.name}
                    onClick={() => {
                      setActiveLayerIndex(idx);
                      setActiveKey(LAYERS[idx].keys[0]);
                      setLastAction(`Switched to ${layer.name} (Layer ${idx})`);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500 text-black font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{layer.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Sound toggle & stats */}
            <div className="flex items-center gap-4">
              <div className="text-xs font-mono text-white/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Actuations: {pressCount}</span>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                  soundEnabled
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 text-white/40"
                }`}
                title={soundEnabled ? "Mute switch sound" : "Enable switch audio"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline font-mono">{soundEnabled ? "Sound ON" : "Sound OFF"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: 2x3 Physical Macropad Visualizer */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-black/90 border-2 border-neutral-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.9),0_10px_40px_rgba(0,0,0,0.9)] max-w-sm w-full">
                {/* Embedded OLED Display Header on device */}
                <div
                  ref={oledRef}
                  className="mb-6 p-3 rounded-xl bg-[#031508] border border-emerald-500/40 text-emerald-400 font-mono shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <div className="flex items-center justify-between text-[10px] pb-1.5 mb-1.5 border-b border-emerald-500/20 text-emerald-500">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> HEXABOARD-OLED
                    </span>
                    <span>BAT 98% ⚡</span>
                  </div>
                  <div className="text-xs font-semibold tracking-wide truncate">
                    {currentLayer.badge}: {activeKey ? activeKey.label : "STANDBY"}
                  </div>
                  <div className="text-[11px] text-emerald-300/70 truncate mt-0.5">
                    {lastAction}
                  </div>
                </div>

                {/* 2x3 Matrix Keypad */}
                <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
                  {currentLayer.keys.map((k, i) => {
                    const isSelected = activeKey?.id === k.id;
                    return (
                      <button
                        key={k.id}
                        ref={(el) => {
                          keyRefs.current[i] = el;
                        }}
                        onClick={() => handleKeyPress(k, i)}
                        className={`group relative aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all duration-150 cursor-pointer select-none ${
                          isSelected
                            ? "bg-gradient-to-b from-neutral-800 to-neutral-900 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)] scale-[0.98]"
                            : "bg-gradient-to-b from-neutral-800/90 to-neutral-900/90 border border-white/15 hover:border-emerald-400/50 hover:bg-neutral-800 shadow-[0_6px_0_#0f0f10,0_10px_20px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.15)]"
                        }`}
                      >
                        {/* Key number hint */}
                        <span className="absolute top-2 left-2 text-[9px] font-mono text-white/30 group-hover:text-emerald-400 transition-colors">
                          0{k.id}
                        </span>

                        {/* Switch LED Dot */}
                        <span
                          className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full transition-all ${
                            isSelected
                              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                              : "bg-neutral-600 group-hover:bg-emerald-500/50"
                          }`}
                        />

                        {/* Key Label */}
                        <div className="font-bold text-xs sm:text-sm text-white tracking-tight group-hover:text-emerald-300 transition-colors mt-2">
                          {k.label}
                        </div>
                        <div className="text-[10px] font-mono text-white/40 truncate w-full px-1">
                          {k.sublabel}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Device bottom branding */}
                <div className="mt-5 text-center text-[10px] font-mono text-neutral-600 tracking-widest uppercase">
                  ZMK • 2X3 MACROPAD
                </div>
              </div>
            </div>

            {/* Right: Key Config Inspector & Live Code */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="rounded-2xl bg-black/60 border border-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white/70">
                      ZMK Keymap Node
                    </span>
                  </div>
                  <button
                    onClick={handleCopyZmk}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy ZMK Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Code block */}
                <div className="rounded-xl bg-neutral-950 p-4 border border-neutral-800 font-mono text-xs leading-relaxed text-emerald-300/90 overflow-x-auto">
                  <div className="text-neutral-500">{"// Key index: " + (activeKey?.id ?? 1)}</div>
                  <div className="text-neutral-400">
                    <span className="text-purple-400">bindings</span> = &lt;
                    <span className="text-emerald-400 font-semibold">{activeKey?.zmkCode}</span>
                    &gt;;
                  </div>
                  <div className="text-neutral-500 mt-2">{"// Macro execution:"}</div>
                  <div className="text-white/80">{activeKey?.actionDescription}</div>
                </div>
              </div>

              {/* Layer Info Box */}
              <div className="rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">
                      {currentLayer.name} Mode Active
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {currentLayer.description}. You can flash unlimited custom layers to your Hexaboard using the open ZMK Web Configurator.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
