"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { MotionProgressHandler } from "@/lib/motion/motionProgress";

export type NormalizedTilt = {
  x: number;
  y: number;
};

function clamp(value: number) {
  return Math.min(Math.max(value, -1), 1);
}

function writeTiltProperties(element: HTMLElement, tilt: NormalizedTilt) {
  element.style.setProperty("--motion-depth-x", `${tilt.x * 20}deg`);
  element.style.setProperty("--motion-depth-y", `${tilt.y * -16}deg`);
  element.style.setProperty("--motion-image-x", `${tilt.x * 44}px`);
  element.style.setProperty("--motion-image-y", `${tilt.y * 34}px`);
  element.style.setProperty("--motion-light-x", `${tilt.x * 58}px`);
  element.style.setProperty("--motion-light-y", `${tilt.y * 44}px`);
}

const POINTER_STEP_DISTANCE = 62;
const POINTER_PROGRESS_STEP = 0.075;
const POINTER_PROGRESS_COOLDOWN_MS = 55;

export function usePointerTilt(
  targetRef: RefObject<HTMLElement | null>,
  isEnabled: boolean,
  onMotionProgress?: MotionProgressHandler,
  motionTargetRef?: RefObject<HTMLElement | null>,
) {
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const pendingDistanceRef = useRef(0);
  const lastProgressAtRef = useRef(0);

  useEffect(() => {
    const target = targetRef.current;

    if (!target || !isEnabled) {
      return;
    }

    const getMotionTarget = () => motionTargetRef?.current ?? target;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      const motionTarget = getMotionTarget();
      const bounds = target.getBoundingClientRect();

      if (!motionTarget || !bounds.width || !bounds.height) {
        return;
      }

      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      writeTiltProperties(motionTarget, {
        x: clamp(x),
        y: clamp(y),
      });

      const lastPosition = lastPositionRef.current;
      const distance = lastPosition
        ? Math.hypot(event.clientX - lastPosition.x, event.clientY - lastPosition.y)
        : 0;
      const direction = lastPosition
        ? {
            x: (event.clientX - lastPosition.x) / Math.max(distance, 1),
            y: (event.clientY - lastPosition.y) / Math.max(distance, 1),
          }
        : { x: 0, y: 0 };

      lastPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      if (distance > 8) {
        pendingDistanceRef.current += Math.min(distance, POINTER_STEP_DISTANCE);

        if (
          pendingDistanceRef.current >= POINTER_STEP_DISTANCE &&
          event.timeStamp - lastProgressAtRef.current >=
            POINTER_PROGRESS_COOLDOWN_MS
        ) {
          pendingDistanceRef.current -= POINTER_STEP_DISTANCE;
          lastProgressAtRef.current = event.timeStamp;
          onMotionProgress?.(POINTER_PROGRESS_STEP, {
            x: direction.x,
            y: direction.y,
            force: Math.min(distance / POINTER_STEP_DISTANCE, 1.8),
          });
        }
      }
    };

    const resetPointer = () => {
      const motionTarget = getMotionTarget();

      lastPositionRef.current = null;
      pendingDistanceRef.current = 0;

      if (motionTarget) {
        writeTiltProperties(motionTarget, { x: 0, y: 0 });
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
    };
  }, [isEnabled, motionTargetRef, onMotionProgress, targetRef]);

  return {
    resetPointerTilt: () => {
      lastPositionRef.current = null;
      pendingDistanceRef.current = 0;
      const motionTarget = motionTargetRef?.current ?? targetRef.current;

      if (motionTarget) {
        writeTiltProperties(motionTarget, { x: 0, y: 0 });
      }
    },
  };
}
