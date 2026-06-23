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

const LINEAR_ACCELERATION_THRESHOLD = 2.4;
const GRAVITY_JERK_THRESHOLD = 6.2;
const ROTATION_RATE_THRESHOLD = 115;
const SHAKE_ENERGY_STEP = 6.6;
const SENSOR_PROGRESS_STEP = 0.085;
const SENSOR_PROGRESS_COOLDOWN_MS = 115;

function getAcceleration(event: DeviceMotionEvent) {
  const acceleration = event.acceleration;

  if (!acceleration) {
    return null;
  }

  return {
    x: acceleration.x ?? 0,
    y: acceleration.y ?? 0,
    z: acceleration.z ?? 0,
  };
}

function getGravityAcceleration(event: DeviceMotionEvent) {
  const acceleration = event.accelerationIncludingGravity;

  if (!acceleration) {
    return null;
  }

  return {
    x: acceleration.x ?? 0,
    y: acceleration.y ?? 0,
    z: acceleration.z ?? 0,
  };
}

function getRotationRate(event: DeviceMotionEvent) {
  const rotationRate = event.rotationRate;

  if (!rotationRate) {
    return 0;
  }

  return Math.hypot(
    rotationRate.alpha ?? 0,
    rotationRate.beta ?? 0,
    rotationRate.gamma ?? 0,
  );
}

export function useDeviceOrientation(onMotionProgress?: MotionProgressHandler) {
  const [orientation, setOrientation] = useState<DeviceTilt>(EMPTY_TILT);
  const [permissionState, setPermissionState] =
    useState<DeviceOrientationPermissionState>("idle");
  const [isListening, setIsListening] = useState(false);
  const lastAccelerationRef = useRef<{ x: number; y: number; z: number } | null>(
    null,
  );
  const lastGravityAccelerationRef = useRef<{
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const pendingShakeEnergyRef = useRef(0);
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
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = getAcceleration(event);
      const gravityAcceleration = getGravityAcceleration(event);
      const rotationSpeed = getRotationRate(event);
      const lastAcceleration = lastAccelerationRef.current;
      const lastGravityAcceleration = lastGravityAccelerationRef.current;
      const linearForce = acceleration
        ? Math.hypot(
            acceleration.x,
            acceleration.y,
            acceleration.z,
          )
        : 0;
      const linearJerk =
        acceleration && lastAcceleration
          ? Math.hypot(
            acceleration.x - lastAcceleration.x,
            acceleration.y - lastAcceleration.y,
            acceleration.z - lastAcceleration.z,
          )
        : 0;
      const gravityJerk =
        gravityAcceleration && lastGravityAcceleration
          ? Math.hypot(
              gravityAcceleration.x - lastGravityAcceleration.x,
              gravityAcceleration.y - lastGravityAcceleration.y,
              gravityAcceleration.z - lastGravityAcceleration.z,
            )
          : 0;
      const directionSource = acceleration ?? gravityAcceleration;
      const directionLength = directionSource
        ? Math.max(
            Math.hypot(
              directionSource.x,
              directionSource.y,
            ),
            0.01,
          )
        : 1;
      const direction = directionSource
        ? {
            x: directionSource.x / directionLength,
            y: directionSource.y / directionLength,
          }
        : { x: 0, y: 0 };
      const shakeEnergy = Math.max(
        Math.max(linearForce - LINEAR_ACCELERATION_THRESHOLD, 0) * 1.25,
        Math.max(linearJerk - LINEAR_ACCELERATION_THRESHOLD, 0),
        Math.max(gravityJerk - GRAVITY_JERK_THRESHOLD, 0),
        Math.max(rotationSpeed - ROTATION_RATE_THRESHOLD, 0) / 22,
      );

      lastAccelerationRef.current = acceleration;
      lastGravityAccelerationRef.current = gravityAcceleration;

      if (shakeEnergy > 0) {
        pendingShakeEnergyRef.current += Math.min(shakeEnergy, SHAKE_ENERGY_STEP);

        if (
          pendingShakeEnergyRef.current >= SHAKE_ENERGY_STEP &&
          event.timeStamp - lastSensorProgressAtRef.current >=
            SENSOR_PROGRESS_COOLDOWN_MS
        ) {
          pendingShakeEnergyRef.current -= SHAKE_ENERGY_STEP;
          lastSensorProgressAtRef.current = event.timeStamp;
          onMotionProgress?.(SENSOR_PROGRESS_STEP, {
            x: direction.x,
            y: direction.y,
            force: Math.min(1 + shakeEnergy / SHAKE_ENERGY_STEP, 2.4),
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
