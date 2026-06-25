import type { BoardBackground } from "@/features/reveal/types/revealTypes";

/** Pinch / scroll zoom is clamped to keep the board from drifting away. */
export const BOARD_MIN_SCALE = 0.55;
export const BOARD_MAX_SCALE = 2.4;

/** Logical size of the scrollable board surface (board-space pixels). */
export const BOARD_SURFACE_WIDTH = 1400;
export const BOARD_SURFACE_HEIGHT = 2200;

/** Palette shown by the colour picker (top → bottom in screenshot order). */
export const BOARD_COLORS = [
  "#ffffff",
  "#00a2e0",
  "#00b13f",
  "#151515",
  "#C43B89",
  "#da281c",
  "#e9e9e9",
  "#ff8203",
  "#ffb500",
] as const;

export const BOARD_DEFAULT_COLOR = BOARD_COLORS[0];

/** The two scotch pieces you can drop — same tape, different size. */
export const SCOTCH_PIECES = [
  { id: "small", src: "/images/scotch_photo.png", scale: 0.75 },
  { id: "big", src: "/images/scotch_photo.png", scale: 1 },
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

/** Pen brush sizes — squiggle previews whose stroke colour follows the picker. */
export const PEN_STROKE_SVGS = [
  {
    w: 21,
    h: 21,
    viewBox: "0 0 21 21",
    d: "M0.457458 20.1738C5.04185 9.7846 8.27255 7.61609 15.375 10.8265C19.1631 12.4035 22.1852 7.87003 19.3274 0.173828",
    strokeWidth: 1,
  },
  {
    w: 23,
    h: 22,
    viewBox: "0 0 23 22",
    d: "M1.37231 20.522C5.95671 10.1327 9.18741 7.96423 16.2898 11.1746C20.078 12.7517 23.1 8.21817 20.2423 0.521973",
    strokeWidth: 3,
  },
  {
    w: 25,
    h: 22,
    viewBox: "0 0 25 22",
    d: "M2.28723 20.8701C6.87163 10.4809 10.1023 8.31238 17.2047 11.5228C20.9929 13.0998 24.0149 8.56632 21.1572 0.870117",
    strokeWidth: 5,
  },
  {
    w: 27,
    h: 23,
    viewBox: "0 0 27 23",
    d: "M3.20215 21.2183C7.78654 10.829 11.0172 8.66052 18.1196 11.8709C21.9078 13.448 24.9299 8.91446 22.0721 1.21826",
    strokeWidth: 7,
  },
  {
    w: 29,
    h: 24,
    viewBox: "0 0 29 24",
    d: "M4.11694 21.5664C8.70134 11.1772 11.932 9.00867 19.0344 12.2191C22.8226 13.7961 25.8446 9.26261 22.9869 1.56641",
    strokeWidth: 9,
  },
] as const;

/** Actual on-screen draw thickness (px) for each brush size. */
export const PEN_DRAW_WIDTHS = [2, 4, 8, 13, 20] as const;
