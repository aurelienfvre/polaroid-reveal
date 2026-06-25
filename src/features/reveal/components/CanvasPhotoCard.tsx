import type { CSSProperties, PointerEvent } from "react";
import {
  getFilterCss,
  getFontCss,
  getTextureOpacity,
} from "@/features/reveal/lib/photoFilters";
import type {
  CanvasPhoto,
  CanvasPhotoStyle,
  PhotoCustomization,
} from "@/features/reveal/types/revealTypes";

type Props = {
  customization?: PhotoCustomization;
  isDragging: boolean;
  onPointerCancel: () => void;
  onPointerDown: (
    event: PointerEvent<HTMLButtonElement>,
    photo: CanvasPhoto,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  photo: CanvasPhoto;
};

export function CanvasPhotoCard({
  customization,
  isDragging,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  photo,
}: Props) {
  const photoStyle: CanvasPhotoStyle = {
    "--canvas-photo-image-url": `url("${photo.imageUrl}")`,
    "--canvas-photo-x": `${photo.x}px`,
    "--canvas-photo-y": `${photo.y}px`,
    "--canvas-photo-rotate": `${photo.rotate}deg`,
    "--canvas-photo-z": photo.zIndex,
  };

  const imageStyle: CSSProperties = {
    filter: customization ? getFilterCss(customization.filterId) : undefined,
  };
  const grainOpacity = customization
    ? getTextureOpacity(customization.textureId, customization.textureIntensity)
    : 0;
  const caption = customization?.text?.trim();
  const captionStyle: CSSProperties = customization
    ? { fontFamily: getFontCss(customization.fontId) }
    : {};

  const className = [
    "c-canvas-photo",
    `c-canvas-photo--tone-${photo.tone}`,
    isDragging ? "c-canvas-photo--is-dragging" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      className={className}
      type="button"
      style={photoStyle}
      onPointerDown={(event) => onPointerDown(event, photo)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <span className="c-canvas-photo__pin" />
      <span className="c-canvas-photo__image" style={imageStyle}>
        {grainOpacity > 0 && (
          <span
            className={[
              "c-canvas-photo__grain",
              `c-canvas-photo__grain--${customization?.textureId ?? "none"}`,
            ].join(" ")}
            style={{ opacity: grainOpacity }}
          />
        )}
      </span>
      {caption ? (
        <span className="c-canvas-photo__caption" style={captionStyle}>
          {caption}
        </span>
      ) : (
        <span className="c-canvas-photo__caption c-canvas-photo__caption--empty" aria-hidden="true" />
      )}
    </button>
  );
}
