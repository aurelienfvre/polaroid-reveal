import gsap from "gsap";

export function animateCameraEntry() {
  gsap.fromTo(
    ".c-polaroid-camera",
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.65, ease: "power2.out" },
  );
}

export function animateCameraReturn() {
  gsap.set(".c-polaroid-camera__body", { clearProps: "transform" });
}

export function animateDevelopEntry() {
  const timeline = gsap.timeline();

  timeline.set(".c-polaroid-camera", { autoAlpha: 1, y: 0 });
  timeline.fromTo(
    ".c-polaroid-card--is-active",
    { autoAlpha: 1, y: 128, rotate: -1.8 },
    {
      y: 76,
      rotate: -1.8,
      duration: 0.82,
      ease: "expo.out",
    },
  );
}

export function animateCanvasEntry() {
  gsap.fromTo(
    ".c-memory-canvas",
    { autoAlpha: 0, scale: 0.96, y: 24 },
    { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out" },
  );
}

export function animateFocusedPhoto() {
  gsap.to(".c-polaroid-card--is-active", {
    rotate: -1.8,
    duration: 0.22,
    ease: "power2.out",
  });
}

export function animateRevealedPhoto() {
  gsap.fromTo(
    ".c-polaroid-card--is-active .c-polaroid-card__paper",
    { "--develop-flash-opacity": 0.28 },
    {
      "--develop-flash-opacity": 0,
      duration: 0.7,
      ease: "power2.out",
    },
  );
}
