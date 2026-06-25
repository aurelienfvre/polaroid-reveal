import type { BoardBackground } from "@/features/reveal/types/revealTypes";

/** Pinch / scroll zoom is clamped to keep the board from drifting away. */
export const BOARD_MIN_SCALE = 0.55;
export const BOARD_MAX_SCALE = 2.4;

/** Logical size of the scrollable board surface (board-space pixels). */
export const BOARD_SURFACE_WIDTH = 1400;
export const BOARD_SURFACE_HEIGHT = 2200;

/** Palette shown by the colour picker (top → bottom in screenshot order). */
export const BOARD_COLORS = [
  "#c2298a",
  "#00a2e0",
  "#00b13f",
  "#ffb500",
  "#ff8203",
  "#da281c",
  "#ffffff",
  "#e9e9e9",
  "#151515",
] as const;

/** Washi-tape decorations (assets under /public/images). */
export const BOARD_TAPES = [
  "/images/scotch_photo.png",
  "/images/scotch1.png",
  "/images/scotch2.png",
  "/images/scotch3.png",
] as const;

/** Board background swatches surfaced by "Change background". */
export const BOARD_BACKGROUNDS: BoardBackground[] = [
  {
    id: "paper",
    label: "Paper",
    css: 'var(--grey-500) url("/images/bg-board_mobile.jpg") center / cover repeat',
  },
  { id: "white", label: "White", css: "#ffffff" },
  {
    id: "stripes",
    label: "Stripes",
    css: "repeating-linear-gradient(45deg, #b6e84f 0 10px, #8bd11e 10px 20px)",
  },
  {
    id: "dots",
    label: "Dots",
    css: "radial-gradient(#d8568f 22%, transparent 24%) 0 0 / 22px 22px, #f4d9e6",
  },
  {
    id: "amber",
    label: "Amber",
    css: "#ffb27a",
  },
];

/**
 * Sticker catalogue. The real artwork is imported later — these placeholders
 * keep the sheet populated and scrollable. Extend this array as assets land.
 */
export const BOARD_STICKERS: string[] = [
  "/images/sticker_photo.png",
  "/images/scotch_photo.png",
  "/images/scotch1.png",
  "/images/scotch2.png",
  "/images/scotch3.png",
  "/images/pen.png",
  "/images/sticker_photo.png",
  "/images/scotch1.png",
  "/images/scotch2.png",
  "/images/scotch3.png",
  "/images/pen.png",
  "/images/scotch_photo.png",
];

/** Pen panel: stroke thickness presets (kept for the brush UI). */
export const PEN_STROKES = [4, 7, 11, 16] as const;
