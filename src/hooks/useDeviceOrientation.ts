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

export function useDeviceOrientation() {
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
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isListening]);

  return {
    orientation,
    permissionState,
    isSupported,
    requestAccess,
  };
}
