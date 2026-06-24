import type { PointerEvent } from "react";
import type {
  CanvasPhoto,
  CanvasPhotoStyle,
} from "@/features/reveal/types/revealTypes";

type Props = {
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
      <span className="c-canvas-photo__image" />
      <span className="c-canvas-photo__title">{photo.title}</span>
      <span className="c-canvas-photo__meta">{photo.dateLabel}</span>
    </button>
  );
}
