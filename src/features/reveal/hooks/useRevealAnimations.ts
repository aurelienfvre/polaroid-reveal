import { useRef } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  animateCameraEntry,
  animateCameraReturn,
  animateCanvasEntry,
  animateDevelopEntry,
  animateFocusedPhoto,
  animateRevealedPhoto,
} from "@/features/reveal/lib/revealAnimationTimelines";
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
  const hasEnteredCameraRef = useRef(false);
  const previousPhaseRef = useRef<ExperiencePhase | null>(null);

  useGSAP(
    () => {
      const previousPhase = previousPhaseRef.current;

      if (phase === "camera") {
        if (!hasEnteredCameraRef.current) {
          animateCameraEntry();
          hasEnteredCameraRef.current = true;
        } else if (previousPhase === "develop") {
          animateCameraReturn();
        }
      }

      if (phase === "develop") {
        animateDevelopEntry();
      }

      if (phase === "canvas") {
        animateCanvasEntry();
      }

      previousPhaseRef.current = phase;
    },
    { scope: stageRef, dependencies: [phase, activeIndex] },
  );

  useGSAP(
    () => {
      if (!isPhotoFocused || phase !== "develop") {
        return;
      }

      animateFocusedPhoto();
    },
    { scope: stageRef, dependencies: [isPhotoFocused, phase] },
  );

  useGSAP(
    () => {
      if (!isRevealed || phase !== "develop") {
        return;
      }

      animateRevealedPhoto();
    },
    { scope: stageRef, dependencies: [isRevealed, phase] },
  );
}
