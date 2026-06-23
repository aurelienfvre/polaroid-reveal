import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { ExperiencePhase } from "@/features/reveal/types/revealTypes";

gsap.registerPlugin(useGSAP);

type Params = {
  activeIndex: number;
  isPhotoFocused: boolean;
  isRevealed: boolean;
  phase: ExperiencePhase;
  stageRef: RefObject<HTMLElement | null>;
};

export function useRevealAnimations({
  activeIndex,
  isPhotoFocused,
  isRevealed,
  phase,
  stageRef,
}: Params) {
  useGSAP(
    () => {
      if (phase === "camera") {
        gsap.fromTo(
          ".c-polaroid-camera",
          { autoAlpha: 0, y: 32, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
        );
      }

      if (phase === "develop") {
        gsap.fromTo(
          ".c-polaroid-card--is-active",
          { autoAlpha: 0, y: 180, scale: 0.38, rotate: -5 },
          {
            autoAlpha: 1,
            y: 72,
            scale: 0.46,
            rotate: -3,
            duration: 0.9,
            ease: "expo.out",
          },
        );
      }

      if (phase === "canvas") {
        gsap.fromTo(
          ".c-memory-canvas",
          { autoAlpha: 0, scale: 0.96, y: 24 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out" },
        );
      }
    },
    { scope: stageRef, dependencies: [phase, activeIndex] },
  );

  useGSAP(
    () => {
      if (!isPhotoFocused || phase !== "develop") {
        return;
      }

      gsap.to(".c-polaroid-card--is-active", {
        scale: 1,
        y: 0,
        rotate: 0,
        duration: 1.05,
        ease: "expo.out",
      });
    },
    { scope: stageRef, dependencies: [isPhotoFocused, phase] },
  );

  useGSAP(
    () => {
      if (!isRevealed || phase !== "develop") {
        return;
      }

      gsap.fromTo(
        ".c-polaroid-card--is-active",
        { y: 4, rotate: -0.8 },
        { y: 0, rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.55)" },
      );
    },
    { scope: stageRef, dependencies: [isRevealed, phase] },
  );
}
