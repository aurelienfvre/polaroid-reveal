import { useEffect, useMemo } from "react";
import type { RefObject } from "react";
import type { DeviceTilt } from "@/hooks/useDeviceOrientation";
import { normalizeTilt } from "@/lib/gyroscope/normalizeTilt";

type Params = {
  isFocused: boolean;
  isRevealed: boolean;
  motionRef: RefObject<HTMLElement | null>;
  orientation: DeviceTilt;
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

export function usePolaroidTiltEffect({
  isFocused,
  isRevealed,
  motionRef,
  orientation,
  permissionState,
  phase,
}: Params) {
  const interactionTilt = useMemo(() => {
    if (permissionState !== "granted") {
      return { x: 0, y: 0 };
    }

    return normalizeTilt(orientation);
  }, [orientation, permissionState]);

  useEffect(() => {
    if (!motionRef.current) {
      return;
    }

    // Only react to the gyroscope while the print is actively being held
    // (focused, not yet revealed). At rest, once revealed, or in any other
    // phase, keep it straight — the motion is too sensitive otherwise and it
    // shouldn't move until the user taps it to shake.
    const shouldTilt =
      phase === "develop" && isFocused && !isRevealed && permissionState === "granted";

    if (!shouldTilt) {
      MOTION_VARS.forEach((name) => motionRef.current?.style.setProperty(name, "0"));
      return;
    }

    motionRef.current.style.setProperty(
      "--motion-depth-x",
      `${interactionTilt.x * 20}deg`,
    );
    motionRef.current.style.setProperty(
      "--motion-depth-y",
      `${interactionTilt.y * -16}deg`,
    );
    motionRef.current.style.setProperty(
      "--motion-image-x",
      `${interactionTilt.x * 44}px`,
    );
    motionRef.current.style.setProperty(
      "--motion-image-y",
      `${interactionTilt.y * 34}px`,
    );
    motionRef.current.style.setProperty(
      "--motion-light-x",
      `${interactionTilt.x * 58}px`,
    );
    motionRef.current.style.setProperty(
      "--motion-light-y",
      `${interactionTilt.y * 44}px`,
    );
  }, [interactionTilt, isFocused, isRevealed, motionRef, permissionState, phase]);
}
