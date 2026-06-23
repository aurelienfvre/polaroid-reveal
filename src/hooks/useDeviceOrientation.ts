"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

function normalizeTiltForReveal(event: DeviceOrientationEvent) {
  const x = Math.min(Math.max((event.gamma ?? 0) / MAX_TILT_FOR_REVEAL, -1), 1);
  const y = Math.min(Math.max((event.beta ?? 0) / MAX_TILT_FOR_REVEAL, -1), 1);

  return { x, y };
}

export function useDeviceOrientation(onMotionProgress?: (amount: number) => void) {
  const [orientation, setOrientation] = useState<DeviceTilt>(EMPTY_TILT);
  const [permissionState, setPermissionState] =
    useState<DeviceOrientationPermissionState>("idle");
  const [isListening, setIsListening] = useState(false);
  const lastTiltRef = useRef<{ x: number; y: number } | null>(null);
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

      const tilt = normalizeTiltForReveal(event);
      const lastTilt = lastTiltRef.current;
      const delta = lastTilt
        ? Math.hypot(tilt.x - lastTilt.x, tilt.y - lastTilt.y)
        : 0;

      lastTiltRef.current = tilt;

      if (delta > 0.04) {
        onMotionProgress?.(Math.min(delta * 0.35, 0.08));
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isListening, onMotionProgress]);

  return {
    orientation,
    permissionState,
    isSupported,
    requestAccess,
  };
}
