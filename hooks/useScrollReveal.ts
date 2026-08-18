"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

export function useScrollReveal(selector: string = ".reveal-item", stagger: number = 0) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-reveal-index") || "0", 10);
            animate(entry.target, {
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 800,
              delay: index * stagger,
              ease: "outExpo",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el, index) => {
      (el as HTMLElement).style.opacity = "0";
      el.setAttribute("data-reveal-index", String(index));
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector, stagger]);

  return containerRef;
}
