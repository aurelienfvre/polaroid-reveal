import type { PointerEvent } from "react";
import { CanvasPhotoCard } from "@/features/reveal/components/CanvasPhotoCard";
import type {
  CanvasPhoto,
  PhotoCustomization,
} from "@/features/reveal/types/revealTypes";

type Props = {
  customizations: Record<string, PhotoCustomization>;
  draggingId: string | null;
  onPointerCancel: () => void;
  onPointerDown: (
    event: PointerEvent<HTMLButtonElement>,
    photo: CanvasPhoto,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  photos: CanvasPhoto[];
};

export function MemoryCanvas({
  customizations,
  draggingId,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  photos,
}: Props) {
  return (
    <div className="c-memory-canvas" aria-label="Canvas scrapbook libre">
      <div className="c-memory-canvas__toolbar">
        <span className="c-memory-canvas__counter">
          {photos.length} Polaroids places
        </span>
        <span className="c-memory-canvas__hint">
          Placement libre, sans magnetisme
        </span>
      </div>
      <div className="c-memory-canvas__viewport">
        <div className="c-memory-canvas__surface">
          {photos.map((photo) => (
            <CanvasPhotoCard
              customization={customizations[photo.id]}
              isDragging={draggingId === photo.id}
              key={photo.id}
              onPointerCancel={onPointerCancel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              photo={photo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
