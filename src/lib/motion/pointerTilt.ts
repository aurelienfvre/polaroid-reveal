export type NormalizedTilt = {
  x: number;
  y: number;
};

export const POINTER_STEP_DISTANCE = 62;
export const POINTER_PROGRESS_STEP = 0.075;
export const POINTER_PROGRESS_COOLDOWN_MS = 55;

export function clampTilt(value: number) {
  return Math.min(Math.max(value, -1), 1);
}

export function writeTiltProperties(
  element: HTMLElement,
  tilt: NormalizedTilt,
) {
  element.style.setProperty("--motion-depth-x", `${tilt.x * 20}deg`);
  element.style.setProperty("--motion-depth-y", `${tilt.y * -16}deg`);
  element.style.setProperty("--motion-image-x", `${tilt.x * 44}px`);
  element.style.setProperty("--motion-image-y", `${tilt.y * 34}px`);
  element.style.setProperty("--motion-light-x", `${tilt.x * 58}px`);
  element.style.setProperty("--motion-light-y", `${tilt.y * 44}px`);
}

export function getPointerDistance(
  event: PointerEvent,
  lastPosition: { x: number; y: number } | null,
) {
  return lastPosition
    ? Math.hypot(event.clientX - lastPosition.x, event.clientY - lastPosition.y)
    : 0;
}

export function getPointerDirection(
  event: PointerEvent,
  lastPosition: { x: number; y: number } | null,
  distance: number,
) {
  return lastPosition
    ? {
        x: (event.clientX - lastPosition.x) / Math.max(distance, 1),
        y: (event.clientY - lastPosition.y) / Math.max(distance, 1),
      }
    : { x: 0, y: 0 };
}
