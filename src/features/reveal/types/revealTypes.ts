import type { CSSProperties } from "react";
import type { Memory } from "@/features/reveal/data/memories";

export type ExperiencePhase = "camera" | "develop" | "personalize" | "canvas";

export type PhotoFilterId =
  | "original"
  | "newyork"
  | "sunset"
  | "cool"
  | "vivid"
  | "noir"
  | "amber"
  | "rose";

export type PhotoTextureId = "none" | "grain" | "dust";

export type PhotoFontId = "bricolage" | "commit" | "indie" | "shadows";

export type PhotoCustomization = {
  filterId: PhotoFilterId;
  textureId: PhotoTextureId;
  textureIntensity: number;
  text: string;
  fontId: PhotoFontId;
};

export type PersonalizeTab = "filter" | "text" | "texture";

export type TiltStyle = CSSProperties & {
  "--motion-depth-x": string;
  "--motion-depth-y": string;
  "--motion-image-x": string;
  "--motion-image-y": string;
  "--motion-light-x": string;
  "--motion-light-y": string;
  "--reveal-progress": number;
  "--reveal-blur": string;
  "--reveal-grayscale": number;
  "--reveal-brightness": number;
  "--reveal-opacity": number;
  "--shake-x": string;
  "--shake-y": string;
  "--shake-rotate": string;
  "--develop-flash-opacity": number;
};

export type CanvasPhoto = Memory & {
  x: number;
  y: number;
  rotate: number;
  zIndex: number;
};

export type CanvasPhotoStyle = CSSProperties & {
  "--canvas-photo-image-url": string;
  "--canvas-photo-x": string;
  "--canvas-photo-y": string;
  "--canvas-photo-rotate": string;
  "--canvas-photo-z": number;
};

export type PanelCopy = {
  eyebrow: string;
  title: string;
  intro: string;
};

export type BoardTool = "tape" | "sticker" | "text" | "pen" | "color" | "add";

export type BoardItemKind = "photo" | "sticker" | "tape" | "text" | "shape" | "drawing";

export type BoardShape = "rect" | "circle";

/** A free object dropped on the placement board. Coordinates are board-space
 * (the pre-transform surface), anchored at the item centre. */
export type BoardItem = {
  id: string;
  kind: BoardItemKind;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
  width?: number;
  height?: number;
  /** Photo items reference the source memory so filters/captions stay in sync. */
  memoryId?: string;
  imageUrl?: string;
  /** Sticker / tape decoration asset. */
  src?: string;
  /** Text content for text items. */
  text?: string;
  fontId?: PhotoFontId;
  /** Fill colour for text and shapes; stroke colour for drawings. */
  color?: string;
  shape?: BoardShape;
  /** Freehand drawing: local SVG path + stroke params. */
  d?: string;
  strokeWidth?: number;
  opacity?: number;
};

export type BoardViewport = {
  x: number;
  y: number;
  scale: number;
};

export type BoardBackground = {
  id: string;
  label: string;
  /** CSS background value applied to the board surface. */
  css: string;
};
