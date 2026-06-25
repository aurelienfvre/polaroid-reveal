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
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";
import type { ExperiencePhase } from "@/features/reveal/types/revealTypes";

gsap.registerPlugin(useGSAP);

type Params = {
  activeIndex: number;
  cameraModel: PolaroidCameraModel;
  isPhotoFocused: boolean;
  isRevealed: boolean;
  phase: ExperiencePhase;
  stageRef: RefObject<HTMLElement | null>;
};

export function useRevealAnimations({
  activeIndex,
  cameraModel,
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

      if (phase === "develop" && !isPhotoFocused) {
        // Only drop into the resting spot when not focused. If focused (e.g. the
        // user swapped the photo with "Change this photo"), the focused effect
        // below keeps it in place instead of resetting it.
        animateDevelopEntry(cameraModel.photoExit);
      }

      if (phase === "canvas") {
        animateCanvasEntry();
      }

      previousPhaseRef.current = phase;
    },
    { scope: stageRef, dependencies: [phase, activeIndex, cameraModel, isPhotoFocused] },
  );

  useGSAP(
    () => {
      if (!isPhotoFocused || phase !== "develop") {
        return;
      }

      // Re-runs on activeIndex too, so a freshly-mounted card from
      // "Change this photo" lands at the focused position/size, not the rest one.
      animateFocusedPhoto();
    },
    { scope: stageRef, dependencies: [isPhotoFocused, phase, activeIndex] },
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
