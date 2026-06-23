"use client";

import { useCallback, useEffect, useState } from "react";

type DeviceOrientationPermissionState =
  | "idle"
  | "unsupported"
  | "prompt"
  | "granted"
  | "denied";

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

export type DeviceTilt = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
};

const EMPTY_TILT: DeviceTilt = {
  alpha: null,
  beta: null,
  gamma: null,
};

const MAX_TILT_FOR_REVEAL = 18;
const REVEAL_THRESHOLD = 0.18;

function getMotionIntent(event: DeviceOrientationEvent) {
  const x = Math.min(Math.max((event.gamma ?? 0) / MAX_TILT_FOR_REVEAL, -1), 1);
  const y = Math.min(Math.max((event.beta ?? 0) / MAX_TILT_FOR_REVEAL, -1), 1);

  return Math.hypot(x, y) > REVEAL_THRESHOLD;
}

export function useDeviceOrientation(onMotionIntent?: () => void) {
  const [orientation, setOrientation] = useState<DeviceTilt>(EMPTY_TILT);
  const [permissionState, setPermissionState] =
    useState<DeviceOrientationPermissionState>("idle");
  const [isListening, setIsListening] = useState(false);
  const isSupported = permissionState !== "unsupported";

  const requestAccess = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setPermissionState("unsupported");
      return false;
    }

    const orientationEvent =
      window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;

    if (typeof orientationEvent.requestPermission === "function") {
      try {
        const result = await orientationEvent.requestPermission();
        const granted = result === "granted";

        setPermissionState(granted ? "granted" : "denied");
        setIsListening(granted);

        return granted;
      } catch {
        setPermissionState("denied");
        setIsListening(false);

        return false;
      }
    }

    setPermissionState("granted");
    setIsListening(true);

    return true;
  }, []);

  useEffect(() => {
    if (!isListening) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      });

      if (getMotionIntent(event)) {
        onMotionIntent?.();
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isListening, onMotionIntent]);

  return {
    orientation,
    permissionState,
    isSupported,
    requestAccess,
  };
}
