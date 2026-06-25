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

/** The two scotch pieces you can drop — same tape, different size. */
export const SCOTCH_PIECES = [
  { id: "small", src: "/images/scotch_photo.png", scale: 0.7 },
  { id: "big", src: "/images/scotch_photo.png", scale: 1.15 },
] as const;

/**
 * Texture options for the scotch. Purely a visual selection in the submenu —
 * it does not actually change what gets placed (per design).
 */
export const SCOTCH_TEXTURES = [
  { id: "kraft", kind: "image", value: "/images/scotch1.png" },
  { id: "white", kind: "color", value: "#ffffff" },
  { id: "stripes", kind: "image", value: "/images/scotch3.png" },
  { id: "dots", kind: "image", value: "/images/scotch2.png" },
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

/** Sticker catalogue (assets under /public/images/stickers). */
export const BOARD_STICKERS: string[] = [
  "/images/stickers/whale.png",
  "/images/stickers/polaroid.png",
  "/images/stickers/coffee.png",
  "/images/stickers/heart.png",
  "/images/stickers/bee.png",
  "/images/stickers/flowers.png",
  "/images/stickers/pen.png",
  "/images/stickers/be_creative.png",
  "/images/stickers/space.png",
  "/images/stickers/pot.png",
  "/images/stickers/lemon.png",
  "/images/stickers/icetea.png",
  "/images/stickers/sun.png",
  "/images/stickers/snail.png",
  "/images/stickers/shoe.png",
];

/** Pen panel: stroke thickness presets (kept for the brush UI). */
export const PEN_STROKES = [4, 7, 11, 16] as const;
