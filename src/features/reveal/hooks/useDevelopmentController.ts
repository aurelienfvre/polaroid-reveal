import { useCallback, useRef, useState } from "react";
import type { RefObject } from "react";
import { useWebHaptics } from "web-haptics/react";
import {
  playDevelopmentImpulse,
  resetDevelopmentImpulse,
} from "@/features/reveal/lib/developmentImpulse";
import type { ExperiencePhase } from "@/features/reveal/types/revealTypes";
import { HAPTIC_EVENTS } from "@/lib/haptics/hapticEvents";
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
  const { trigger } = useWebHaptics();

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
        trigger(HAPTIC_EVENTS.shake, {
          intensity: Math.min(0.28 + impulse.force * 0.12, 0.58),
        })?.catch(() => undefined);
      }
    },
    [trigger],
  );

  const developMemory = useCallback(
    (amount: number, impulse?: MotionImpulse) => {
      if (phaseRef.current !== "develop" || !canDevelopRef.current) {
        return;
      }

      const nextProgress = Math.min(revealProgressRef.current + amount, 1);

      if (nextProgress === revealProgressRef.current) {
        if (hasRevealedRef.current) {
          playDevelopmentImpulse(polaroidMotionRef.current, amount, impulse);
          triggerShakeHaptic(impulse);
        }

        return;
      }

      playDevelopmentImpulse(polaroidMotionRef.current, amount, impulse);
      revealProgressRef.current = nextProgress;
      setRevealProgress(nextProgress);

      triggerShakeHaptic(impulse);

      if (nextProgress >= 1 && !hasRevealedRef.current) {
        hasRevealedRef.current = true;
        trigger(HAPTIC_EVENTS.reveal, { intensity: 0.65 })?.catch(
          () => undefined,
        );
      }
    },
    [canDevelopRef, phaseRef, polaroidMotionRef, trigger, triggerShakeHaptic],
  );

  return {
    developMemory,
    isRevealed: revealProgress >= 1,
    resetDevelopmentState,
    revealProgress,
  };
}
