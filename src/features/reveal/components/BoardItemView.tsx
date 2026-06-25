import {
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { EditIcon, TrashIcon } from "@/features/reveal/components/BoardIcons";
import {
  getFilterCss,
  getFontCss,
  getTextureOpacity,
} from "@/features/reveal/lib/photoFilters";
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
  onRemove,
  onEditText,
}: Props) {
  const dragRef = useRef<DragState | null>(null);
  const rotateRef = useRef<{ cx: number; cy: number; startAngle: number; startRotate: number } | null>(null);

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
            {item.kind === "text" && (
              <button
                type="button"
                className="c-board-item__control"
                aria-label="Editer"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  const field = event.currentTarget
                    .closest(".c-board-item")
                    ?.querySelector("textarea");
                  (field as HTMLTextAreaElement | null)?.focus();
                }}
              >
                <EditIcon />
              </button>
            )}
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
    const grainOpacity = customization
      ? getTextureOpacity(customization.textureId, customization.textureIntensity)
      : 0;
    const caption = customization?.text?.trim();
    return (
      <div className="c-board-photo">
        <span
          className="c-board-photo__image"
          style={{
            backgroundImage: `url("${item.imageUrl}")`,
            filter: customization ? getFilterCss(customization.filterId) : undefined,
          }}
        >
          {grainOpacity > 0 && (
            <span
              className={`c-board-photo__grain c-board-photo__grain--${customization?.textureId ?? "none"}`}
              style={{ opacity: grainOpacity }}
            />
          )}
        </span>
        {caption ? (
          <span
            className="c-board-photo__caption"
            style={{ fontFamily: customization ? getFontCss(customization.fontId) : undefined }}
          >
            {caption}
          </span>
        ) : (
          <span className="c-board-photo__caption c-board-photo__caption--empty" aria-hidden="true" />
        )}
      </div>
    );
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
