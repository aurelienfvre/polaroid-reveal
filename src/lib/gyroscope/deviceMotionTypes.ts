export type DeviceOrientationPermissionState =
  | "idle"
  | "unsupported"
  | "prompt"
  | "granted"
  | "denied";

export type DeviceOrientationEventWithPermission =
  typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<PermissionState>;
  };

export type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

export type DeviceTilt = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
};

export type DeviceAcceleration = {
  x: number;
  y: number;
  z: number;
};

export type ShakeSignal = {
  acceleration: DeviceAcceleration | null;
  direction: { x: number; y: number };
  energy: number;
  gravityAcceleration: DeviceAcceleration | null;
};
