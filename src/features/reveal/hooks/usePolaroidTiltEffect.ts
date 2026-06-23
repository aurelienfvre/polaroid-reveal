import { useEffect, useMemo } from "react";
import type { RefObject } from "react";
import type { DeviceTilt } from "@/hooks/useDeviceOrientation";
import { normalizeTilt } from "@/lib/gyroscope/normalizeTilt";

type Params = {
  motionRef: RefObject<HTMLElement | null>;
  orientation: DeviceTilt;
  permissionState: string;
  phase: string;
};

export function usePolaroidTiltEffect({
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
  }, [interactionTilt, motionRef, permissionState, phase]);
}
