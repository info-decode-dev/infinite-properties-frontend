import { gsap } from "gsap";

// GSAP utility functions and helpers
export const gsapUtils = {
  // Fade in animation
  fadeIn: (element: HTMLElement | string, duration = 1) => {
    return gsap.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, duration, ease: "power2.out" }
    );
  },

  // Fade out animation
  fadeOut: (element: HTMLElement | string, duration = 1) => {
    return gsap.to(element, { opacity: 0, duration, ease: "power2.in" });
  },

  // Slide up animation
  slideUp: (element: HTMLElement | string, duration = 1) => {
    return gsap.fromTo(
      element,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration, ease: "power3.out" }
    );
  },

  // Slide down animation
  slideDown: (element: HTMLElement | string, duration = 1) => {
    return gsap.fromTo(
      element,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration, ease: "power3.out" }
    );
  },

  // Scale animation
  scaleIn: (element: HTMLElement | string, duration = 1) => {
    return gsap.fromTo(
      element,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration, ease: "back.out(1.7)" }
    );
  },
};

export default gsap;
