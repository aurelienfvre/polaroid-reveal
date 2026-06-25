/**
 * A continuous motor whir that runs from the moment the shutter is tapped until
 * the print is fully out and tappable. Built from a FEW long ON-pulses (each
 * just under the 1s per-segment cap) with a tiny gap between them — rather than
 * hundreds of micro-pulses, which browsers silently truncate (that's why the
 * earlier patterns felt short: they were being cut off, not actually playing).
 * Total ~4.6s so it comfortably covers SHOOT_DELAY (520ms) + EJECT_DURATION
 * (2100ms) and keeps buzzing right through. Played at full intensity.
 */
const EJECT_MOTOR_PATTERN = Array.from({ length: 5 }, () => [920, 12]).flat();

export const HAPTIC_EVENTS = {
  eject: [18, 42, 28],
  ejectMotor: EJECT_MOTOR_PATTERN,
  reveal: "nudge",
  snap: [35],
  // A firm single thump for every shake step while developing with the gyro.
  shake: [60],
  permissionOk: "success",
  permissionKo: "error",
} satisfies Record<string, string | number[]>;
