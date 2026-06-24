import gsap from "gsap";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";

type PhotoExit = PolaroidCameraModel["photoExit"];

export function animateCameraEntry() {
  gsap.fromTo(
    ".c-polaroid-camera",
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.65, ease: "power2.out" },
  );
}

export function animateCameraReturn() {
  gsap.set(".c-polaroid-camera__scene", { clearProps: "transform" });
}

export function animateDevelopEntry(photoExit: PhotoExit) {
  const timeline = gsap.timeline();

  timeline.set(".c-polaroid-camera", { autoAlpha: 1, y: 0 });
  timeline.fromTo(
    ".c-polaroid-stack",
    {
      autoAlpha: 0,
      x: photoExit.x,
      y: photoExit.endY,
      rotate: photoExit.rotate,
      zIndex: 5,
    },
    {
      autoAlpha: 1,
      duration: 0.24,
      ease: "power2.out",
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
  gsap.to(".c-polaroid-stack", {
    y: "-4vh",
    scale: 1.58,
    rotate: 0,
    zIndex: 8,
    duration: 0.82,
    ease: "expo.out",
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
