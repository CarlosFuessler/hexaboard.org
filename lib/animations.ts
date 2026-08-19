import { animate, stagger } from "animejs";

/**
 * Magnetic button hover effect using anime.js
 */
export function animateButtonMagnetic(
  el: HTMLElement,
  e: React.MouseEvent<HTMLElement>,
  strength: number = 0.3
) {
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = (e.clientX - centerX) * strength;
  const deltaY = (e.clientY - centerY) * strength;

  animate(el, {
    translateX: deltaX,
    translateY: deltaY,
    scale: 1.04,
    duration: 300,
    ease: "outQuad",
  });
}

export function resetButtonMagnetic(el: HTMLElement) {
  animate(el, {
    translateX: 0,
    translateY: 0,
    scale: 1,
    duration: 500,
    ease: "outElastic(1, 0.5)",
  });
}

/**
 * 3D Card tilt on mouse move
 */
export function animateCardTilt(
  el: HTMLElement,
  e: React.MouseEvent<HTMLElement>,
  maxTilt: number = 8
) {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = -((y - centerY) / centerY) * maxTilt;
  const rotateY = ((x - centerX) / centerX) * maxTilt;

  animate(el, {
    rotateX,
    rotateY,
    duration: 150,
    ease: "outQuad",
  });
}

export function resetCardTilt(el: HTMLElement) {
  animate(el, {
    rotateX: 0,
    rotateY: 0,
    duration: 600,
    ease: "outElastic(1, 0.4)",
  });
}

/**
 * Interactive Mechanical Switch Depression Simulation
 */
export function animateKeySwitchPress(el: HTMLElement) {
  animate(el, {
    translateY: [0, 5, 0],
    scale: [1, 0.94, 1],
    duration: 180,
    ease: "outQuad",
  });
}

/**
 * Staggered entrance animation for lists of elements
 */
export function animateStaggerEntrance(
  selector: string | HTMLElement[],
  delay: number = 0,
  staggerMs: number = 80
) {
  return animate(selector, {
    opacity: [0, 1],
    translateY: [24, 0],
    duration: 700,
    delay: stagger(staggerMs, { start: delay }),
    ease: "outExpo",
  });
}

/**
 * Glow pulse animation
 */
export function animateGlowPulse(el: HTMLElement | string) {
  return animate(el, {
    opacity: [0.4, 0.9, 0.4],
    duration: 2400,
    loop: true,
    ease: "inOutSine",
  });
}
