"use client";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { POINTER_PROGRESS_COOLDOWN_MS, POINTER_PROGRESS_STEP, POINTER_STEP_DISTANCE, clampTilt, getPointerDirection, getPointerDistance, writeTiltProperties } from "@/lib/motion/pointerTilt";
import type { MotionProgressHandler } from "@/lib/motion/motionProgress";

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

    // Coalesce pointer moves into a single per-frame update — desktop fires
    // pointermove far more often than 60fps, and writing the tilt CSS vars +
    // running the develop impulse on every one is what makes the shake/skip
    // phase feel heavy.
    let rafId = 0;
    let latestEvent: PointerEvent | null = null;

    const processMove = (event: PointerEvent) => {
      const motionTarget = getMotionTarget();
      const bounds = target.getBoundingClientRect();

      if (!motionTarget || !bounds.width || !bounds.height) return;

      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      writeTiltProperties(motionTarget, { x: clampTilt(x), y: clampTilt(y) });

      const lastPosition = lastPositionRef.current;
      const distance = getPointerDistance(event, lastPosition);
      const direction = getPointerDirection(event, lastPosition, distance);

      lastPositionRef.current = { x: event.clientX, y: event.clientY };

      if (distance <= 8) return;

      pendingDistanceRef.current += Math.min(distance, POINTER_STEP_DISTANCE);

      if (
        pendingDistanceRef.current < POINTER_STEP_DISTANCE ||
        event.timeStamp - lastProgressAtRef.current <
          POINTER_PROGRESS_COOLDOWN_MS
      ) {
        return;
      }

      pendingDistanceRef.current -= POINTER_STEP_DISTANCE;
      lastProgressAtRef.current = event.timeStamp;
      onMotionProgress?.(POINTER_PROGRESS_STEP, {
        x: direction.x,
        y: direction.y,
        force: Math.min(distance / POINTER_STEP_DISTANCE, 1.8),
        source: "pointer",
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      latestEvent = event;
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        if (latestEvent) {
          processMove(latestEvent);
        }
      });
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
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
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
