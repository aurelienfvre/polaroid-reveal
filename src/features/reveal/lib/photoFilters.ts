import type {
  PhotoCustomization,
  PhotoFilterId,
  PhotoFontId,
  PhotoTextureId,
} from "@/features/reveal/types/revealTypes";

export const PHOTO_FILTERS: ReadonlyArray<{
  id: PhotoFilterId;
  label: string;
  css: string;
}> = [
  { id: "original", label: "Original", css: "none" },
  { id: "newyork", label: "New York", css: "grayscale(1) contrast(1.15) brightness(1.04)" },
  { id: "sunset", label: "Sunset", css: "saturate(1.4) contrast(1.05) sepia(0.28)" },
  { id: "cool", label: "Cool", css: "saturate(1.1) hue-rotate(-12deg) brightness(1.06)" },
  { id: "vivid", label: "Vivid", css: "saturate(1.65) contrast(1.12)" },
  { id: "noir", label: "B&N", css: "grayscale(1) contrast(1.4) brightness(0.92)" },
  { id: "amber", label: "Amber", css: "sepia(0.42) saturate(1.24) brightness(1.05)" },
  { id: "rose", label: "Rose", css: "saturate(1.28) hue-rotate(318deg) contrast(1.06)" },
];

export const PHOTO_TEXTURES: ReadonlyArray<{
  id: PhotoTextureId;
  label: string;
  defaultIntensity: number;
}> = [
  { id: "none", label: "Aucune", defaultIntensity: 0 },
  { id: "grain", label: "Grain", defaultIntensity: 0.28 },
  { id: "dust", label: "Poussiere", defaultIntensity: 0.38 },
];

export const PHOTO_FONTS: ReadonlyArray<{
  id: PhotoFontId;
  label: string;
  css: string;
}> = [
  {
    id: "bricolage",
    label: "Bricolage",
    css: 'var(--font-family-bricolage, "Bricolage Grotesque"), sans-serif',
  },
  {
    id: "indie",
    label: "Indie Flower",
    css: 'var(--font-family-indie_flower, "Indie Flower"), cursive',
  },
  {
    id: "shadows",
    label: "Shadows",
    css: 'var(--font-family-shadows, "Shadows Into Light"), cursive',
  },
  {
    id: "commit",
    label: "Commit Mono",
    css: 'var(--font-family-commit, commit_mono), monospace',
  },
];

export const DEFAULT_CUSTOMIZATION: PhotoCustomization = {
  filterId: "original",
  textureId: "none",
  textureIntensity: 0.3,
  text: "",
  fontId: "indie",
};

export function getFilterCss(id: PhotoFilterId) {
  return PHOTO_FILTERS.find((filter) => filter.id === id)?.css ?? "none";
}

export function getTextureOpacity(id: PhotoTextureId, intensity = 0.3) {
  if (id === "none") {
    return 0;
  }

  return Math.min(Math.max(intensity, 0), 1);
}

export function getFontCss(id: PhotoFontId) {
  return PHOTO_FONTS.find((font) => font.id === id)?.css ?? PHOTO_FONTS[0].css;
}

export function getTextureDefaultIntensity(id: PhotoTextureId) {
  return PHOTO_TEXTURES.find((texture) => texture.id === id)?.defaultIntensity ?? 0.3;
}
