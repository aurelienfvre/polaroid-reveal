import type { Memory } from "@/features/reveal/data/memories";
import type { CanvasPhoto } from "@/features/reveal/types/revealTypes";

export const DAILY_REVEAL_LIMIT = 3;

const CANVAS_START_POSITIONS = [
  { x: 240, y: 190, rotate: -5 },
  { x: 610, y: 340, rotate: 4 },
  { x: 970, y: 210, rotate: -2 },
];

export function getCanvasPhoto(
  memory: Memory,
  index: number,
  zIndex: number,
): CanvasPhoto {
  const position = CANVAS_START_POSITIONS[index % CANVAS_START_POSITIONS.length];

  return {
    ...memory,
    ...position,
    zIndex,
  };
}
