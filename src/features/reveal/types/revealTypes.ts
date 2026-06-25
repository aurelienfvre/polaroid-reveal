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

export type PhotoFontId = "bricolage" | "commit" | "indie" | "serif";

export type PhotoCustomization = {
  filterId: PhotoFilterId;
  textureId: PhotoTextureId;
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
