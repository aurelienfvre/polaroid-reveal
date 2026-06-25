import type { TiltStyle } from "@/features/reveal/types/revealTypes";

export function getTiltStyle(revealProgress: number): TiltStyle {
  return {
    "--motion-depth-x": "0deg",
    "--motion-depth-y": "0deg",
    "--motion-image-x": "0px",
    "--motion-image-y": "0px",
    "--motion-light-x": "0px",
    "--motion-light-y": "0px",
    "--reveal-progress": revealProgress,
    "--reveal-blur": `${10 * (1 - revealProgress)}px`,
    "--reveal-grayscale": 0.35 * (1 - revealProgress),
    "--reveal-brightness": 1.08 - revealProgress * 0.08,
    "--reveal-opacity": 0.48 + revealProgress * 0.52,
    "--shake-x": "0px",
    "--shake-y": "0px",
    "--shake-rotate": "0deg",
    "--develop-flash-opacity": 0,
  };
}
