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
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.4) brightness(0.92)" },
];

export const PHOTO_TEXTURES: ReadonlyArray<{
  id: PhotoTextureId;
  label: string;
  opacity: number;
}> = [
  { id: "none", label: "Aucune", opacity: 0 },
  { id: "grain", label: "Grain", opacity: 0.22 },
  { id: "dust", label: "Poussiere", opacity: 0.36 },
];

export const PHOTO_FONTS: ReadonlyArray<{
  id: PhotoFontId;
  label: string;
  cssVar: string;
}> = [
  { id: "indie", label: "Manuscrit", cssVar: "--font-family-indie-flower" },
  { id: "commit", label: "Mono", cssVar: "--font-family-commit" },
  { id: "bricolage", label: "Grotesk", cssVar: "--font-family-bricolage" },
];

export const DEFAULT_CUSTOMIZATION: PhotoCustomization = {
  filterId: "original",
  textureId: "none",
  text: "",
  fontId: "indie",
};

export function getFilterCss(id: PhotoFilterId) {
  return PHOTO_FILTERS.find((filter) => filter.id === id)?.css ?? "none";
}

export function getTextureOpacity(id: PhotoTextureId) {
  return PHOTO_TEXTURES.find((texture) => texture.id === id)?.opacity ?? 0;
}

export function getFontVar(id: PhotoFontId) {
  return PHOTO_FONTS.find((font) => font.id === id)?.cssVar ?? "--font-family-indie-flower";
}
