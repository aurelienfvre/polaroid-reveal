import {
  useEffect,
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

type PinchState = {
  startDist: number;
  startScale: number;
  startRotate: number;
  startAngle: number;
  lastMidX: number;
  lastMidY: number;
};

const DESKTOP_RESIZE_HANDLES = [
  {
    id: "top-left",
    label: "Redimensionner haut gauche",
    transform: "translate(-50%, -50%)",
  },
  {
    id: "top-right",
    label: "Redimensionner haut droit",
    transform: "translate(50%, -50%)",
  },
  {
    id: "bottom-left",
    label: "Redimensionner bas gauche",
    transform: "translate(-50%, 50%)",
  },
  {
    id: "bottom-right",
    label: "Redimensionner bas droit",
    transform: "translate(50%, 50%)",
  },
] as const;

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
  // Pointers currently held on this item — 1 = drag, 2 = pinch scale/rotate.
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<PinchState | null>(null);
  const rotateRef = useRef<{ cx: number; cy: number; startAngle: number; startRotate: number } | null>(null);
  const resizeRef = useRef<{ cx: number; cy: number; startDist: number; startScale: number } | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Items own their gestures so board tap-to-deselect does not steal focus.
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(item.id);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = {
        startDist: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1),
        startScale: item.scale,
        startRotate: item.rotate,
        startAngle: Math.atan2(b.y - a.y, b.x - a.x),
        lastMidX: (a.x + b.x) / 2,
        lastMidY: (a.y + b.y) / 2,
      };
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const prev = pointersRef.current.get(event.pointerId);
    if (!prev) {
      return;
    }
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    // Two fingers → pinch to scale + rotate, and pan by the midpoint.
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const pinch = pinchRef.current;

      onScale(item.id, Math.min(Math.max((pinch.startScale * dist) / pinch.startDist, 0.3), 5));
      onRotate(item.id, Math.round(pinch.startRotate + ((angle - pinch.startAngle) * 180) / Math.PI));
      onMove(item.id, midX - pinch.lastMidX, midY - pinch.lastMidY);
      pinch.lastMidX = midX;
      pinch.lastMidY = midY;
      return;
    }

    // Single finger → drag.
    if (pointersRef.current.size === 1) {
      onMove(item.id, event.clientX - prev.x, event.clientY - prev.y);
    }
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
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
    onSelect(item.id);
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
    event.stopPropagation();
    const state = resizeRef.current;
    if (!state) {
      return;
    }
    const dist = Math.hypot(event.clientX - state.cx, event.clientY - state.cy);
    const nextScale = (state.startScale * dist) / state.startDist;
    onScale(item.id, Math.min(Math.max(nextScale, 0.3), 5));
  };

  const handleResizeUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
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
          {DESKTOP_RESIZE_HANDLES.map((handle) => (
            <button
              key={handle.id}
              type="button"
              className={`c-board-item__resize-handle c-board-item__resize-handle--${handle.id}`}
              aria-label={handle.label}
              style={{ transform: `${handle.transform} scale(${inverseScale})` }}
              onPointerDown={handleResizeDown}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeUp}
              onPointerCancel={handleResizeUp}
            />
          ))}
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
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (item.kind !== "text" || !isSelected) {
      return;
    }
    const field = textRef.current;
    if (!field) {
      return;
    }
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }, [isSelected, item.id, item.kind]);

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

  if (item.kind === "drawing") {
    const width = item.width ?? 1;
    const height = item.height ?? 1;

    return (
      <svg
        className="c-board-drawing"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
      >
        <path
          d={item.d ?? ""}
          stroke={item.color}
          strokeWidth={item.strokeWidth}
          strokeOpacity={item.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // text
  return (
    <textarea
      ref={textRef}
      className="c-board-text"
      value={item.text ?? ""}
      placeholder="Text"
      readOnly={!isSelected}
      rows={1}
      spellCheck={false}
      style={{ color: item.color, fontFamily: item.fontId ? getFontCss(item.fontId) : undefined }}
      onChange={(event) => onEditText(item.id, event.target.value)}
    />
  );
}
