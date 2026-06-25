import { useEffect } from "react";
import type { RefObject } from "react";
import type { DeviceTilt } from "@/hooks/useDeviceOrientation";
import { normalizeTilt } from "@/lib/gyroscope/normalizeTilt";

type Params = {
  isFocused: boolean;
  isRevealed: boolean;
  motionRef: RefObject<HTMLElement | null>;
  orientationRef: RefObject<DeviceTilt>;
  permissionState: string;
  phase: string;
};

const MOTION_VARS = [
  "--motion-depth-x",
  "--motion-depth-y",
  "--motion-image-x",
  "--motion-image-y",
  "--motion-light-x",
  "--motion-light-y",
];

function resetMotion(element: HTMLElement) {
  MOTION_VARS.forEach((name) => element.style.setProperty(name, "0"));
}

export function usePolaroidTiltEffect({
  isFocused,
  isRevealed,
  motionRef,
  orientationRef,
  permissionState,
  phase,
}: Params) {
  useEffect(() => {
    const element = motionRef.current;

    if (!element) {
      return;
    }

    // Only react to the gyroscope while the print is actively held (focused, not
    // yet revealed). At rest, once revealed, or in any other phase, keep it
    // straight — it's too sensitive otherwise and shouldn't move until tapped.
    const shouldTilt =
      phase === "develop" && isFocused && !isRevealed && permissionState === "granted";

    if (!shouldTilt) {
      resetMotion(element);
      return;
    }

    // Read the orientation ref in a rAF loop and write the tilt CSS vars
    // imperatively — no React re-render per device-orientation event.
    let frameId = 0;
    const tick = () => {
      const tilt = normalizeTilt(orientationRef.current);
      element.style.setProperty("--motion-depth-x", `${tilt.x * 20}deg`);
      element.style.setProperty("--motion-depth-y", `${tilt.y * -16}deg`);
      element.style.setProperty("--motion-image-x", `${tilt.x * 44}px`);
      element.style.setProperty("--motion-image-y", `${tilt.y * 34}px`);
      element.style.setProperty("--motion-light-x", `${tilt.x * 58}px`);
      element.style.setProperty("--motion-light-y", `${tilt.y * 44}px`);
      frameId = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isFocused, isRevealed, motionRef, orientationRef, permissionState, phase]);
}
