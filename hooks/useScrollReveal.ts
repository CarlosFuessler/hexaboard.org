"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

export function useScrollReveal(selector: string = ".reveal-item") {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target, {
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 800,
              ease: "outExpo",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector]);

  return containerRef;
}
