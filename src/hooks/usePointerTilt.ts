"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

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

export function usePointerTilt(
  targetRef: RefObject<HTMLElement | null>,
  isEnabled: boolean,
  onMotionProgress?: (amount: number) => void,
) {
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const target = targetRef.current;

    if (!target || !isEnabled) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const bounds = target.getBoundingClientRect();

      if (!bounds.width || !bounds.height) {
        return;
      }

      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      writeTiltProperties(target, {
        x: clamp(x),
        y: clamp(y),
      });

      const lastPosition = lastPositionRef.current;
      const distance = lastPosition
        ? Math.hypot(event.clientX - lastPosition.x, event.clientY - lastPosition.y)
        : 0;

      lastPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      if (distance > 8) {
        onMotionProgress?.(Math.min(distance / 900, 0.08));
      }
    };

    const handleMouseLeave = () => {
      lastPositionRef.current = null;
      writeTiltProperties(target, { x: 0, y: 0 });
    };

    target.addEventListener("mousemove", handleMouseMove);
    target.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      target.removeEventListener("mousemove", handleMouseMove);
      target.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isEnabled, onMotionProgress, targetRef]);

  return {
    resetPointerTilt: () => {
      if (targetRef.current) {
        writeTiltProperties(targetRef.current, { x: 0, y: 0 });
      }
    },
  };
}
