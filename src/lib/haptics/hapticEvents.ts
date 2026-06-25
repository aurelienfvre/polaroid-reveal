/**
 * A continuous-feeling motor whir for the time the print slides out: long
 * on-pulses with only a tiny gap so the buzz reads as one sustained motor
 * rather than a stutter. Runs ~7.2s — roughly triple EJECT_DURATION — so the
 * tactile motor keeps going well past the print landing instead of cutting
 * out early. Always played at full intensity so it stays strong throughout.
 */
const EJECT_MOTOR_PATTERN = Array.from({ length: 120 }, () => [54, 6]).flat();

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
