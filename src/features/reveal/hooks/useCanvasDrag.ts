import { useRef, useState } from "react";
import type { Dispatch, PointerEvent, SetStateAction } from "react";
import type { CanvasPhoto } from "@/features/reveal/types/revealTypes";

type DragState = {
  id: string;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
};

export function useCanvasDrag(
  setPlacedPhotos: Dispatch<SetStateAction<CanvasPhoto[]>>,
  getNextCanvasZIndex: () => number,
) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const handleCanvasPointerDown = (
    event: PointerEvent<HTMLButtonElement>,
    photo: CanvasPhoto,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const nextZIndex = getNextCanvasZIndex();
    dragStateRef.current = {
      id: photo.id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: photo.x,
      startY: photo.y,
    };
    setDraggingId(photo.id);
    setPlacedPhotos((currentPhotos) =>
      currentPhotos.map((currentPhoto) =>
        currentPhoto.id === photo.id
          ? { ...currentPhoto, zIndex: nextZIndex }
          : currentPhoto,
      ),
    );
  };

  const handleCanvasPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState) {
      return;
    }

    const nextX = dragState.startX + event.clientX - dragState.startPointerX;
    const nextY = dragState.startY + event.clientY - dragState.startPointerY;

    setPlacedPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === dragState.id ? { ...photo, x: nextX, y: nextY } : photo,
      ),
    );
  };

  const handleCanvasPointerEnd = () => {
    dragStateRef.current = null;
    setDraggingId(null);
  };

  return {
    draggingId,
    onCanvasPointerCancel: handleCanvasPointerEnd,
    onCanvasPointerDown: handleCanvasPointerDown,
    onCanvasPointerMove: handleCanvasPointerMove,
    onCanvasPointerUp: handleCanvasPointerEnd,
  };
}
