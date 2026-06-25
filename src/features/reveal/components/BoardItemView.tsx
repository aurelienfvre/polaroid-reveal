import {
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { BoardPhoto } from "@/features/reveal/components/BoardPhoto";
import { EditIcon, TrashIcon } from "@/features/reveal/components/BoardIcons";
import { getFontCss } from "@/features/reveal/lib/photoFilters";
import type {
  BoardItem,
  PhotoCustomization,
} from "@/features/reveal/types/revealTypes";

type Props = {
  item: BoardItem;
  customization?: PhotoCustomization;
  isSelected: boolean;
  /** Counter-scale for HUD chrome so it stays a constant on-screen size. */
  inverseScale: number;
  onSelect: (id: string) => void;
  onMove: (id: string, dx: number, dy: number) => void;
  onRotate: (id: string, rotate: number) => void;
  onScale: (id: string, scale: number) => void;
  onRemove: (id: string) => void;
  onEditText: (id: string, text: string) => void;
};

type DragState = {
  pointerId: number;
  lastX: number;
  lastY: number;
  moved: boolean;
};

export function BoardItemView({
  item,
  customization,
  isSelected,
  inverseScale,
  onSelect,
  onMove,
  onRotate,
  onScale,
  onRemove,
  onEditText,
}: Props) {
  const dragRef = useRef<DragState | null>(null);
  const rotateRef = useRef<{ cx: number; cy: number; startAngle: number; startRotate: number } | null>(null);
  const resizeRef = useRef<{ cx: number; cy: number; startDist: number; startScale: number } | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (item.kind === "text" && isSelected) {
      // Let the textarea receive the caret instead of starting a drag.
      return;
    }
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(item.id);
    dragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.moved = true;
    onMove(item.id, dx, dy);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const handleRotateDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const host = event.currentTarget.closest(".c-board-item") as HTMLElement | null;
    if (!host) {
      return;
    }
    const rect = host.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateRef.current = {
      cx,
      cy,
      startAngle: Math.atan2(event.clientY - cy, event.clientX - cx),
      startRotate: item.rotate,
    };
  };

  const handleRotateMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = rotateRef.current;
    if (!state) {
      return;
    }
    const angle = Math.atan2(event.clientY - state.cy, event.clientX - state.cx);
    const deg = ((angle - state.startAngle) * 180) / Math.PI;
    onRotate(item.id, Math.round(state.startRotate + deg));
  };

  const handleRotateUp = () => {
    rotateRef.current = null;
  };

  const handleResizeDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const host = event.currentTarget.closest(".c-board-item") as HTMLElement | null;
    if (!host) {
      return;
    }
    const rect = host.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    resizeRef.current = {
      cx,
      cy,
      startDist: Math.max(Math.hypot(event.clientX - cx, event.clientY - cy), 1),
      startScale: item.scale,
    };
  };

  const handleResizeMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = resizeRef.current;
    if (!state) {
      return;
    }
    const dist = Math.hypot(event.clientX - state.cx, event.clientY - state.cy);
    const next = (state.startScale * dist) / state.startDist;
    onScale(item.id, Math.min(Math.max(next, 0.3), 5));
  };

  const handleResizeUp = () => {
    resizeRef.current = null;
  };

  const style: CSSProperties = {
    left: `${item.x}px`,
    top: `${item.y}px`,
    transform: `translate(-50%, -50%) rotate(${item.rotate}deg) scale(${item.scale})`,
    zIndex: item.zIndex,
  };

  const hudStyle: CSSProperties = { transform: `scale(${inverseScale})` };

  return (
    <div
      className={[
        "c-board-item",
        `c-board-item--${item.kind}`,
        isSelected ? "is-selected" : "",
      ].filter(Boolean).join(" ")}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <ItemBody item={item} customization={customization} onEditText={onEditText} isSelected={isSelected} />

      {isSelected && (
        <>
          <div className="c-board-item__controls" style={hudStyle}>
            <button
              type="button"
              className="c-board-item__control"
              aria-label="Supprimer"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onRemove(item.id)}
            >
              <TrashIcon />
            </button>
            <button
              type="button"
              className="c-board-item__control"
              aria-label="Editer"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                // Text items become editable; for stickers/decals the edit
                // button is a placeholder affordance that does nothing yet.
                if (item.kind !== "text") {
                  return;
                }
                const field = event.currentTarget
                  .closest(".c-board-item")
                  ?.querySelector("textarea");
                (field as HTMLTextAreaElement | null)?.focus();
              }}
            >
              <EditIcon />
            </button>
          </div>
          <button
            type="button"
            className="c-board-item__rotate"
            aria-label="Pivoter"
            style={hudStyle}
            onPointerDown={handleRotateDown}
            onPointerMove={handleRotateMove}
            onPointerUp={handleRotateUp}
            onPointerCancel={handleRotateUp}
          />
          {item.kind !== "text" && (
            <button
              type="button"
              className="c-board-item__resize"
              aria-label="Redimensionner"
              style={hudStyle}
              onPointerDown={handleResizeDown}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeUp}
              onPointerCancel={handleResizeUp}
            />
          )}
        </>
      )}
    </div>
  );
}

function ItemBody({
  item,
  customization,
  isSelected,
  onEditText,
}: {
  item: BoardItem;
  customization?: PhotoCustomization;
  isSelected: boolean;
  onEditText: (id: string, text: string) => void;
}) {
  if (item.kind === "photo") {
    return <BoardPhoto imageUrl={item.imageUrl} customization={customization} />;
  }

  if (item.kind === "sticker" || item.kind === "tape") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="c-board-decal" src={item.src} alt="" draggable={false} />;
  }

  if (item.kind === "shape") {
    return (
      <span
        className={`c-board-shape c-board-shape--${item.shape ?? "rect"}`}
        style={{ background: item.color }}
      />
    );
  }

  // text
  return (
    <textarea
      className="c-board-text"
      value={item.text ?? ""}
      readOnly={!isSelected}
      rows={1}
      spellCheck={false}
      style={{ color: item.color, fontFamily: item.fontId ? getFontCss(item.fontId) : undefined }}
      onChange={(event) => onEditText(item.id, event.target.value)}
      onPointerDown={(event) => {
        if (isSelected) {
          event.stopPropagation();
        }
      }}
    />
  );
}
