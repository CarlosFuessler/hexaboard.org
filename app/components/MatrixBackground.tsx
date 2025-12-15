"use client";

import { useEffect, useRef } from "react";

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const chars = "01";
    const baseFont = 14; // CSS px (before DPR scaling)
    const speed = 0.2; // rows per frame (slower)
    const overlayAlpha = 0.12; // darker look, faster fade
    const trailLength = 14; // slightly shorter visible line
    const glyphAlphaHead = 0.7; // dimmer head
    const glyphAlphaTailStart = 0.35; // dimmer tail start
    let fontSize = baseFont;
    let columns = 0;
    let drops: number[] = [];

    function resize() {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);

      fontSize = baseFont; // keep visual size in CSS pixels
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1);

      ctx.font = `${fontSize}px monospace`;
    }

    function step() {
      // Semi-transparent black overlay for trail effect (darker, slower fade)
      ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha})`;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#16a34a"; // Tailwind green-600 for darker tone
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // draw tail from older to head for nicer alpha blending
        for (let k = trailLength; k >= 0; k--) {
          const ty = y - k * fontSize;
          if (ty < 0) continue;
          const alpha = k === 0
            ? glyphAlphaHead
            : glyphAlphaTailStart * (1 - k / (trailLength + 1));
          ctx.globalAlpha = alpha;
          ctx.fillText(text, x, ty);
        }

        if (y > height && Math.random() > 0.995) drops[i] = 0;
        drops[i] += speed;
      }

      // reset alpha
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(step);
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
