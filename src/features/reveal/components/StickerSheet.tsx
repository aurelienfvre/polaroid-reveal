import { useRef, useState, type PointerEvent } from "react";
import { BOARD_STICKERS } from "@/features/reveal/lib/boardData";

type Props = {
  onPick: (src: string) => void;
  onClose: () => void;
};

const CLOSE_THRESHOLD = 120;

export function StickerSheet({ onPick, onClose }: Props) {
  const [dragY, setDragY] = useState(0);
  const dragRef = useRef<{ startY: number; active: boolean }>({ startY: 0, active: false });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: event.clientY, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) {
      return;
    }
    setDragY(Math.max(0, event.clientY - dragRef.current.startY));
  };

  const handlePointerUp = () => {
    if (!dragRef.current.active) {
      return;
    }
    dragRef.current.active = false;
    if (dragY > CLOSE_THRESHOLD) {
      onClose();
    }
    setDragY(0);
  };

  return (
    <div className="c-sticker-sheet" role="dialog" aria-label="Stickers">
      <button
        type="button"
        className="c-sticker-sheet__scrim"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        className="c-sticker-sheet__panel"
        style={{ transform: `translateY(${dragY}px)` }}
      >
        <div
          className="c-sticker-sheet__grab"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span className="c-sticker-sheet__handle" aria-hidden="true" />
        </div>
        <h2 className="c-sticker-sheet__title">Stickers</h2>
        <div className="c-sticker-sheet__grid">
          {BOARD_STICKERS.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              className="c-sticker-sheet__item"
              onClick={() => onPick(src)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
