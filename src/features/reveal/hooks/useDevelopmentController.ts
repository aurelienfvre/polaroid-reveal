import { useCallback, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  playDevelopmentImpulse,
  resetDevelopmentImpulse,
} from "@/features/reveal/lib/developmentImpulse";
import type { ExperiencePhase } from "@/features/reveal/types/revealTypes";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";
import type { MotionImpulse } from "@/lib/motion/motionProgress";

type Params = {
  canDevelopRef: RefObject<boolean>;
  phaseRef: RefObject<ExperiencePhase>;
  polaroidMotionRef: RefObject<HTMLElement | null>;
};

export function useDevelopmentController({
  canDevelopRef,
  phaseRef,
  polaroidMotionRef,
}: Params) {
  const [revealProgress, setRevealProgress] = useState(0);
  const revealProgressRef = useRef(0);
  const hasRevealedRef = useRef(false);
  const lastShakeHapticAtRef = useRef(0);
  const triggerHaptic = usePolaroidHaptics();

  const resetDevelopmentState = useCallback(() => {
    revealProgressRef.current = 0;
    hasRevealedRef.current = false;
    setRevealProgress(0);
    resetDevelopmentImpulse(polaroidMotionRef.current);
  }, [polaroidMotionRef]);

  const triggerShakeHaptic = useCallback(
    (impulse?: MotionImpulse) => {
      if (impulse?.source !== "motion") {
        return;
      }

      const now = performance.now();

      if (now - lastShakeHapticAtRef.current > 160) {
        lastShakeHapticAtRef.current = now;
        triggerHaptic("shake", {
          intensity: Math.min(0.48 + impulse.force * 0.18, 0.92),
        });
      }
    },
    [triggerHaptic],
  );

  const developMemory = useCallback(
    (amount: number, impulse?: MotionImpulse) => {
      if (phaseRef.current !== "develop" || !canDevelopRef.current) {
        return;
      }

      // Once fully revealed, stop reacting to motion entirely: extra shakes
      // would keep wobbling/buzzing the print and make it feel like it is "still
      // moving", which got in the way of tapping to place it and move on.
      if (hasRevealedRef.current) {
        return;
      }

      const nextProgress = Math.min(revealProgressRef.current + amount, 1);

      if (nextProgress === revealProgressRef.current) {
        return;
      }

      playDevelopmentImpulse(polaroidMotionRef.current, amount, impulse);
      revealProgressRef.current = nextProgress;
      setRevealProgress(nextProgress);

      triggerShakeHaptic(impulse);

      if (nextProgress >= 1 && !hasRevealedRef.current) {
        hasRevealedRef.current = true;
        // Snap the print straight as soon as it's developed so it stops feeling
        // like it's still moving (mobile motion is sensitive).
        resetDevelopmentImpulse(polaroidMotionRef.current);
        triggerHaptic("reveal", { intensity: 0.8 });
      }
    },
    [canDevelopRef, phaseRef, polaroidMotionRef, triggerHaptic, triggerShakeHaptic],
  );

  return {
    developMemory,
    isRevealed: revealProgress >= 1,
    resetDevelopmentState,
    revealProgress,
  };
}
