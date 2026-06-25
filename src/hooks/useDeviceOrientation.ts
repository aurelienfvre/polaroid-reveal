"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { requestDeviceMotionAccess } from "@/lib/gyroscope/deviceMotionPermissions";
import type {
  DeviceAcceleration,
  DeviceOrientationPermissionState,
  DeviceTilt,
} from "@/lib/gyroscope/deviceMotionTypes";
import { getShakeSignal } from "@/lib/gyroscope/deviceShake";
import type { MotionProgressHandler } from "@/lib/motion/motionProgress";

export type { DeviceTilt } from "@/lib/gyroscope/deviceMotionTypes";

const EMPTY_TILT: DeviceTilt = {
  alpha: null,
  beta: null,
  gamma: null,
};

const MIN_SHAKE_ENERGY = 2.4;
const SHAKE_ENERGY_STEP = 9;
const SENSOR_PROGRESS_STEP = 0.1;
const SENSOR_PROGRESS_COOLDOWN_MS = 150;
// Bleed off banked energy each event so a hard shake doesn't keep firing
// progress after the user has stopped (the "it thinks it's still moving" feel).
const SHAKE_ENERGY_DECAY = 0.8;

// Fired on every meaningful shake frame (independent of develop progress) so a
// consumer can buzz the phone whenever it's physically moved.
export type MotionShakeHandler = (force: number) => void;

const SHAKE_HAPTIC_COOLDOWN_MS = 70;

export function useDeviceOrientation(
  onMotionProgress?: MotionProgressHandler,
  onShake?: MotionShakeHandler,
) {
  // Orientation lives in a ref, not state: deviceorientation fires ~60×/sec and
  // storing it in state re-rendered the whole tree every frame while tilting,
  // which is what made the develop/shake screen stutter. Consumers read the ref
  // imperatively (rAF) instead.
  const orientationRef = useRef<DeviceTilt>(EMPTY_TILT);
  const [permissionState, setPermissionState] =
    useState<DeviceOrientationPermissionState>("idle");
  const [isListening, setIsListening] = useState(false);
  const lastAccelerationRef = useRef<DeviceAcceleration | null>(null);
  const lastGravityAccelerationRef = useRef<DeviceAcceleration | null>(null);
  const pendingShakeEnergyRef = useRef(0);
  const lastSensorProgressAtRef = useRef(0);
  const lastShakeHapticAtRef = useRef(0);
  // Held in a ref so an unstable onShake identity doesn't re-bind the motion
  // listeners on every render.
  const onShakeRef = useRef(onShake);
  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);
  const isSupported = permissionState !== "unsupported";

  const requestAccess = useCallback(
    () => requestDeviceMotionAccess(setPermissionState, setIsListening),
    [],
  );

  useEffect(() => {
    if (!isListening) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      orientationRef.current = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      };
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      const signal = getShakeSignal(
        event,
        lastAccelerationRef.current,
        lastGravityAccelerationRef.current,
      );

      lastAccelerationRef.current = signal.acceleration;
      lastGravityAccelerationRef.current = signal.gravityAcceleration;

      if (signal.energy < MIN_SHAKE_ENERGY) {
        // No real motion this frame: let any banked energy settle back down so
        // the print stops developing/wobbling promptly once the user stops.
        pendingShakeEnergyRef.current *= SHAKE_ENERGY_DECAY;
        return;
      }

      // Buzz on the raw shake itself — independent of develop progress — so the
      // phone always vibrates when physically moved (throttled so it reads as a
      // steady tick rather than a constant motor).
      if (event.timeStamp - lastShakeHapticAtRef.current > SHAKE_HAPTIC_COOLDOWN_MS) {
        lastShakeHapticAtRef.current = event.timeStamp;
        onShakeRef.current?.(Math.min(signal.energy / SHAKE_ENERGY_STEP, 1.5));
      }

      pendingShakeEnergyRef.current =
        pendingShakeEnergyRef.current * SHAKE_ENERGY_DECAY +
        Math.min(signal.energy, SHAKE_ENERGY_STEP);

      if (
        pendingShakeEnergyRef.current < SHAKE_ENERGY_STEP ||
        event.timeStamp - lastSensorProgressAtRef.current <
          SENSOR_PROGRESS_COOLDOWN_MS
      ) {
        return;
      }

      pendingShakeEnergyRef.current -= SHAKE_ENERGY_STEP;
      lastSensorProgressAtRef.current = event.timeStamp;
      onMotionProgress?.(SENSOR_PROGRESS_STEP, {
        x: signal.direction.x,
        y: signal.direction.y,
        force: Math.min(1 + signal.energy / SHAKE_ENERGY_STEP, 2.4),
        source: "motion",
      });
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isListening, onMotionProgress]);

  return { orientationRef, permissionState, isSupported, requestAccess };
}
