import type {
  DeviceAcceleration,
  ShakeSignal,
} from "@/lib/gyroscope/deviceMotionTypes";

const LINEAR_ACCELERATION_THRESHOLD = 4.2;
const GRAVITY_JERK_THRESHOLD = 10.5;
const ROTATION_RATE_THRESHOLD = 190;

function readAcceleration(
  source: DeviceMotionEventAcceleration | null,
): DeviceAcceleration | null {
  if (!source) {
    return null;
  }

  return {
    x: source.x ?? 0,
    y: source.y ?? 0,
    z: source.z ?? 0,
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

function getJerk(
  current: DeviceAcceleration | null,
  last: DeviceAcceleration | null,
) {
  return current && last
    ? Math.hypot(current.x - last.x, current.y - last.y, current.z - last.z)
    : 0;
}

function getDirection(source: DeviceAcceleration | null) {
  if (!source) {
    return { x: 0, y: 0 };
  }

  const length = Math.max(Math.hypot(source.x, source.y), 0.01);

  return {
    x: source.x / length,
    y: source.y / length,
  };
}

export function getShakeSignal(
  event: DeviceMotionEvent,
  lastAcceleration: DeviceAcceleration | null,
  lastGravityAcceleration: DeviceAcceleration | null,
): ShakeSignal {
  const acceleration = readAcceleration(event.acceleration);
  const gravityAcceleration = readAcceleration(event.accelerationIncludingGravity);
  const linearForce = acceleration
    ? Math.hypot(acceleration.x, acceleration.y, acceleration.z)
    : 0;
  const linearJerk = getJerk(acceleration, lastAcceleration);
  const gravityJerk = getJerk(gravityAcceleration, lastGravityAcceleration);
  const rotationSpeed = getRotationRate(event);
  const energy = Math.max(
    Math.max(linearForce - LINEAR_ACCELERATION_THRESHOLD, 0) * 1.25,
    Math.max(linearJerk - LINEAR_ACCELERATION_THRESHOLD, 0),
    Math.max(gravityJerk - GRAVITY_JERK_THRESHOLD, 0),
    Math.max(rotationSpeed - ROTATION_RATE_THRESHOLD, 0) / 22,
  );

  return {
    acceleration,
    direction: getDirection(acceleration ?? gravityAcceleration),
    energy,
    gravityAcceleration,
  };
}
