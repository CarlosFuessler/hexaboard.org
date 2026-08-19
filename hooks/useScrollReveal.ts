"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import type { AnimationParams } from "animejs";

export interface ScrollRevealOptions {
  stagger?: number;
  duration?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  threshold?: number;
  rootMargin?: string;
}

export function useScrollReveal(
  selector: string = ".reveal-item",
  options: number | ScrollRevealOptions = 0
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const opts: ScrollRevealOptions =
    typeof options === "number" ? { stagger: options } : options;

  const {
    stagger = 0,
    duration = 800,
    distance = 30,
    direction = "up",
    threshold = 0.1,
    rootMargin = "0px 0px -40px 0px",
  } = opts;

  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-reveal-index") || "0",
              10
            );

            const animationProps: AnimationParams = {
              opacity: [0, 1],
              duration,
              delay: index * stagger,
              ease: "outExpo",
            };

            if (direction === "up") {
              animationProps.translateY = [distance, 0];
            } else if (direction === "down") {
              animationProps.translateY = [-distance, 0];
            } else if (direction === "left") {
              animationProps.translateX = [distance, 0];
            } else if (direction === "right") {
              animationProps.translateX = [-distance, 0];
            } else if (direction === "scale") {
              animationProps.scale = [0.92, 1];
            }

            animate(entry.target as HTMLElement, animationProps);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    elements.forEach((el, index) => {
      (el as HTMLElement).style.opacity = "0";
      el.setAttribute("data-reveal-index", String(index));
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector, stagger, duration, distance, direction, threshold, rootMargin]);

  return containerRef;
}

