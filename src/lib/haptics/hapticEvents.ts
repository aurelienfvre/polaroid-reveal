export const HAPTIC_EVENTS = {
  eject: [18, 42, 28],
  reveal: "nudge",
  snap: [35],
  shake: [42],
  permissionOk: "success",
  permissionKo: "error",
} satisfies Record<string, string | number[]>;
