export const HAPTIC_EVENTS = {
  reveal: "nudge",
  snap: [35],
  shake: [12],
  permissionOk: "success",
  permissionKo: "error",
} satisfies Record<string, string | number[]>;
