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
  // The developed print fades in where the 3D print emerged from the slot, then
  // settles into its resting spot below the camera — a continuous handoff rather
  // than a hard cut between the WebGL print and the DOM card. It stays low and
  // tilted (camera up top, full print below) until the user taps to focus it.
  timeline.fromTo(
    ".c-polaroid-stack",
    {
      autoAlpha: 0,
      x: photoExit.x,
      y: "9vh",
      rotate: photoExit.rotate,
      scale: 0.9,
      zIndex: 6,
    },
    {
      autoAlpha: 1,
      x: 0,
      y: "16dvh",
      rotate: -6,
      scale: 1,
      duration: 0.62,
      ease: "power3.out",
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
  // Bring the print up into the foreground for shaking/revealing, but keep it
  // below the on-screen controls (share / change / primary button) so it never
  // covers them.
  gsap.to(".c-polaroid-stack", {
    y: "-11dvh",
    scale: 1.5,
    rotate: 0,
    zIndex: 6,
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
