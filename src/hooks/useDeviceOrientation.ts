"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MotionProgressHandler } from "@/lib/motion/motionProgress";

type DeviceOrientationPermissionState =
  | "idle"
  | "unsupported"
  | "prompt"
  | "granted"
  | "denied";

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
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
const TILT_STEP_DELTA = 0.13;
const SHAKE_STEP_FORCE = 4.4;
const SENSOR_PROGRESS_STEP = 0.075;
const SENSOR_PROGRESS_COOLDOWN_MS = 70;

function normalizeTiltForReveal(event: DeviceOrientationEvent) {
  const x = Math.min(Math.max((event.gamma ?? 0) / MAX_TILT_FOR_REVEAL, -1), 1);
  const y = Math.min(Math.max((event.beta ?? 0) / MAX_TILT_FOR_REVEAL, -1), 1);

  return { x, y };
}

function getAcceleration(event: DeviceMotionEvent) {
  const acceleration = event.accelerationIncludingGravity ?? event.acceleration;

  if (!acceleration) {
    return null;
  }

  return {
    x: acceleration.x ?? 0,
    y: acceleration.y ?? 0,
    z: acceleration.z ?? 0,
  };
}

export function useDeviceOrientation(onMotionProgress?: MotionProgressHandler) {
  const [orientation, setOrientation] = useState<DeviceTilt>(EMPTY_TILT);
  const [permissionState, setPermissionState] =
    useState<DeviceOrientationPermissionState>("idle");
  const [isListening, setIsListening] = useState(false);
  const lastTiltRef = useRef<{ x: number; y: number } | null>(null);
  const pendingTiltDeltaRef = useRef(0);
  const lastAccelerationRef = useRef<{ x: number; y: number; z: number } | null>(
    null,
  );
  const pendingShakeForceRef = useRef(0);
  const lastSensorProgressAtRef = useRef(0);
  const isSupported = permissionState !== "unsupported";

  const requestAccess = useCallback(async () => {
    if (typeof window === "undefined") {
      setPermissionState("unsupported");
      return false;
    }

    const hasOrientationEvent = "DeviceOrientationEvent" in window;
    const hasMotionEvent = "DeviceMotionEvent" in window;

    if (!hasOrientationEvent && !hasMotionEvent) {
      setPermissionState("unsupported");
      return false;
    }

    const permissionRequests: Array<Promise<PermissionState>> = [];

    if (hasOrientationEvent) {
      const orientationEvent =
        window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;

      if (typeof orientationEvent.requestPermission === "function") {
        permissionRequests.push(orientationEvent.requestPermission());
      }
    }

    if (hasMotionEvent) {
      const motionEvent =
        window.DeviceMotionEvent as DeviceMotionEventWithPermission;

      if (typeof motionEvent.requestPermission === "function") {
        permissionRequests.push(motionEvent.requestPermission());
      }
    }

    if (permissionRequests.length > 0) {
      try {
        const results = await Promise.allSettled(permissionRequests);
        const granted = results.some(
          (result) => result.status === "fulfilled" && result.value === "granted",
        );

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
      const direction = lastTilt
        ? {
            x: (tilt.x - lastTilt.x) / Math.max(delta, 0.01),
            y: (tilt.y - lastTilt.y) / Math.max(delta, 0.01),
          }
        : { x: 0, y: 0 };

      lastTiltRef.current = tilt;

      if (delta > 0.04) {
        pendingTiltDeltaRef.current += Math.min(delta, TILT_STEP_DELTA);

        if (
          pendingTiltDeltaRef.current >= TILT_STEP_DELTA &&
          event.timeStamp - lastSensorProgressAtRef.current >=
            SENSOR_PROGRESS_COOLDOWN_MS
        ) {
          pendingTiltDeltaRef.current -= TILT_STEP_DELTA;
          lastSensorProgressAtRef.current = event.timeStamp;
          onMotionProgress?.(SENSOR_PROGRESS_STEP, {
            x: direction.x,
            y: direction.y,
            force: Math.min(delta / TILT_STEP_DELTA, 1.8),
          });
        }
      }
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = getAcceleration(event);

      if (!acceleration) {
        return;
      }

      const lastAcceleration = lastAccelerationRef.current;
      const force = lastAcceleration
        ? Math.hypot(
            acceleration.x - lastAcceleration.x,
            acceleration.y - lastAcceleration.y,
            acceleration.z - lastAcceleration.z,
          )
        : 0;
      const horizontalForce = lastAcceleration
        ? Math.max(
            Math.hypot(
              acceleration.x - lastAcceleration.x,
              acceleration.y - lastAcceleration.y,
            ),
            0.01,
          )
        : 1;
      const direction = lastAcceleration
        ? {
            x: (acceleration.x - lastAcceleration.x) / horizontalForce,
            y: (acceleration.y - lastAcceleration.y) / horizontalForce,
          }
        : { x: 0, y: 0 };

      lastAccelerationRef.current = acceleration;

      if (force > 1.1) {
        pendingShakeForceRef.current += Math.min(force, SHAKE_STEP_FORCE);

        if (
          pendingShakeForceRef.current >= SHAKE_STEP_FORCE &&
          event.timeStamp - lastSensorProgressAtRef.current >=
            SENSOR_PROGRESS_COOLDOWN_MS
        ) {
          pendingShakeForceRef.current -= SHAKE_STEP_FORCE;
          lastSensorProgressAtRef.current = event.timeStamp;
          onMotionProgress?.(SENSOR_PROGRESS_STEP, {
            x: direction.x,
            y: direction.y,
            force: Math.min(force / SHAKE_STEP_FORCE, 2),
          });
        }
      }
    };

    if ("DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    if ("DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isListening, onMotionProgress]);

  return {
    orientation,
    permissionState,
    isSupported,
    requestAccess,
  };
}
