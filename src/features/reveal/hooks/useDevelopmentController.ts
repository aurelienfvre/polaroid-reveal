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
  // `isRevealed` is the only React state — the continuous develop progress is
  // written straight to the print's CSS var so shaking/moving the photo doesn't
  // re-render the whole tree on every tick (which is what made desktop develop
  // feel slow). The tree only re-renders once, when it flips to revealed.
  const [isRevealed, setIsRevealed] = useState(false);
  const revealProgressRef = useRef(0);
  const hasRevealedRef = useRef(false);
  const triggerHaptic = usePolaroidHaptics();

  const writeProgress = useCallback(
    (value: number) => {
      polaroidMotionRef.current?.style.setProperty("--reveal-progress", `${value}`);
    },
    [polaroidMotionRef],
  );

  const resetDevelopmentState = useCallback(() => {
    revealProgressRef.current = 0;
    hasRevealedRef.current = false;
    setIsRevealed(false);
    writeProgress(0);
    resetDevelopmentImpulse(polaroidMotionRef.current);
  }, [polaroidMotionRef, writeProgress]);

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
      writeProgress(nextProgress);

      if (nextProgress >= 1) {
        hasRevealedRef.current = true;
        // Snap the print straight as soon as it's developed so it stops feeling
        // like it's still moving (mobile motion is sensitive).
        resetDevelopmentImpulse(polaroidMotionRef.current);
        triggerHaptic("reveal", { intensity: 0.8 });
        setIsRevealed(true);
      }
    },
    [canDevelopRef, phaseRef, polaroidMotionRef, triggerHaptic, writeProgress],
  );

  const revealNow = useCallback(() => {
    if (hasRevealedRef.current) {
      return;
    }

    revealProgressRef.current = 1;
    hasRevealedRef.current = true;
    writeProgress(1);
    resetDevelopmentImpulse(polaroidMotionRef.current);
    triggerHaptic("reveal", { intensity: 0.8 });
    setIsRevealed(true);
  }, [polaroidMotionRef, triggerHaptic, writeProgress]);

  return {
    developMemory,
    isRevealed,
    resetDevelopmentState,
    revealNow,
  };
}
