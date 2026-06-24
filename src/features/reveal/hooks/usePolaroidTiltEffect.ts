import { useEffect, useMemo } from "react";
import type { RefObject } from "react";
import type { DeviceTilt } from "@/hooks/useDeviceOrientation";
import { normalizeTilt } from "@/lib/gyroscope/normalizeTilt";

type Params = {
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
    // Once developed, snap the print back to straight and stop reacting to the
    // device — the motion is too sensitive on mobile and otherwise makes the
    // finished print feel like it is still moving, blocking the next step.
    if (isRevealed && motionRef.current) {
      MOTION_VARS.forEach((name) => motionRef.current?.style.setProperty(name, "0"));
      return;
    }

    if (phase !== "develop" || !motionRef.current || permissionState !== "granted") {
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
  }, [interactionTilt, isRevealed, motionRef, permissionState, phase]);
}
