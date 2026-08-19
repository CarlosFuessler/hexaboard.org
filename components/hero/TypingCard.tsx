"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Terminal, Check, Copy } from "lucide-react";

interface CommandSequence {
  prompt: string;
  command: string;
  output: string;
  accent?: string;
}

const sequences: CommandSequence[] = [
  {
    prompt: "zmk@hexaboard:~#",
    command: "zmk build -b seeed_xiao_ble -k hexaboard_v3",
    output: "✓ Compiled firmware hexaboard_v3.uf2 (24.8 KB) in 1.2s",
    accent: "text-emerald-400",
  },
  {
    prompt: "ble@hexaboard:~#",
    command: "bt status --connected-profile=0",
    output: "● Paired with MacBook Pro (Battery: 98% • Latency: <1ms)",
    accent: "text-emerald-300",
  },
  {
    prompt: "layer@hexaboard:~#",
    command: "hexaboard layers --inspect",
    output: "Active Layer 0 [NAV/DEV]: K1:⌘C | K2:⌘V | K3:⌘⇧4 | K4:F5 | K5:⌥Space | K6:Mute",
    accent: "text-green-400",
  },
];

export default function TypingCard() {
  const [seqIndex, setSeqIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Blinking cursor with anime.js
    if (cursorRef.current) {
      animate(cursorRef.current, {
        opacity: [0.1, 1],
        duration: 450,
        loop: true,
        ease: "inOutSine",
      });
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const currentSeq = sequences[seqIndex];
    let charIdx = 0;

    const startTimeout = setTimeout(() => {
      if (isCancelled) return;
      setCurrentText("");
      setShowOutput(false);
    }, 0);

    const typeInterval = setInterval(() => {
      if (isCancelled) return;
      charIdx++;
      if (charIdx <= currentSeq.command.length) {
        setCurrentText(currentSeq.command.slice(0, charIdx));
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          if (!isCancelled) {
            setShowOutput(true);
            // Stagger next sequence
            setTimeout(() => {
              if (!isCancelled) {
                setSeqIndex((prev) => (prev + 1) % sequences.length);
              }
            }, 3000);
          }
        }, 350);
      }
    }, 45);

    return () => {
      isCancelled = true;
      clearTimeout(startTimeout);
      clearInterval(typeInterval);
    };
  }, [seqIndex]);

  const handleCopy = () => {
    const textToCopy = `${sequences[seqIndex].prompt} ${sequences[seqIndex].command}\n${sequences[seqIndex].output}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={cardRef}
      className="relative group w-full max-w-xl mx-auto rounded-2xl bg-black/60 border border-emerald-500/20 backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300 hover:border-emerald-500/40"
    >
      {/* Terminal Window Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors" />
          <span className="ml-2 text-xs font-mono text-white/40 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            hexaboard-zmk-shell
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
          title="Copy command"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Terminal Content */}
      <div className="font-mono text-left text-xs sm:text-sm space-y-2 select-text">
        <div className="flex items-start gap-2 flex-wrap text-emerald-300/90">
          <span className="text-emerald-500 font-semibold select-none">
            {sequences[seqIndex].prompt}
          </span>
          <span className="text-white font-medium">
            {currentText}
            <span
              ref={cursorRef}
              className="inline-block w-2 h-4 bg-emerald-400 ml-1 translate-y-[2px]"
            />
          </span>
        </div>

        {showOutput && (
          <div className="mt-2 text-xs text-white/70 pl-2 border-l-2 border-emerald-500/50 py-0.5 animate-fadeIn font-mono leading-relaxed">
            <span className={sequences[seqIndex].accent}>
              {sequences[seqIndex].output}
            </span>
          </div>
        )}
      </div>

      {/* Ambient background glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-teal-500/10 -z-10 pointer-events-none blur-sm" />
    </div>
  );
}
