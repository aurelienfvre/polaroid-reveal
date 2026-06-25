/**
 * A continuous-feeling motor whir for the ~2.1s the print slides out: rapid
 * on/off pulses played as a single pattern so the buzz runs for the whole
 * ejection rather than a single tap. Kept slightly over EJECT_DURATION so the
 * tactile motor does not stop before the visual print motion finishes.
 */
const EJECT_MOTOR_PATTERN = Array.from({ length: 42 }, () => [42, 10]).flat();

export const HAPTIC_EVENTS = {
  eject: [18, 42, 28],
  ejectMotor: EJECT_MOTOR_PATTERN,
  reveal: "nudge",
  snap: [35],
  shake: [42],
  permissionOk: "success",
  permissionKo: "error",
} satisfies Record<string, string | number[]>;
