import type { DeviceTilt } from "@/hooks/useDeviceOrientation";

const MAX_TILT = 18;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeTilt(tilt: DeviceTilt) {
  const x = clamp((tilt.gamma ?? 0) / MAX_TILT, -1, 1);
  const y = clamp((tilt.beta ?? 0) / MAX_TILT, -1, 1);

  return { x, y };
}
