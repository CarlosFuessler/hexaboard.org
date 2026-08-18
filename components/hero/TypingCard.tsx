"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

export default function TypingCard() {
  const typedRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const text = "powered by zmk";
    let index = 0;

    const interval = setInterval(() => {
      if (index <= text.length && typedRef.current) {
        typedRef.current.textContent = text.slice(0, index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    if (cursorRef.current) {
      animate(cursorRef.current, {
        opacity: [0.3, 0.6],
        duration: 500,
        ease: "inOut",
        loop: true,
        alternate: true,
      });
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card px-8 py-4 inline-block">
      <code className="mono text-green-400 text-lg flex items-center gap-2">
        <span className="text-green-500">&gt;</span>
        <span ref={typedRef}></span>
        <span ref={cursorRef} className="inline-block w-2 h-5 bg-green-400 ml-1"></span>
      </code>
    </div>
  );
}
