"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { BoardItemView } from "@/features/reveal/components/BoardItemView";
import { BoardPhoto } from "@/features/reveal/components/BoardPhoto";
import { BoardToolbar } from "@/features/reveal/components/BoardToolbar";
import { ProfileIcon, UndoIcon } from "@/features/reveal/components/BoardIcons";
import { usePlacementBoard } from "@/features/reveal/hooks/usePlacementBoard";
import {
  BOARD_MAX_SCALE,
  BOARD_MIN_SCALE,
  BOARD_SURFACE_HEIGHT,
  BOARD_SURFACE_WIDTH,
} from "@/features/reveal/lib/boardData";
import type {
  BoardShape,
  CanvasPhoto,
  PhotoCustomization,
} from "@/features/reveal/types/revealTypes";

type Props = {
  customizations: Record<string, PhotoCustomization>;
  photos: CanvasPhoto[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PlacementBoard({ customizations, photos }: Props) {
  const board = usePlacementBoard(photos);
  const viewportRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  // Active pointers on the board background, used for pan + pinch gestures.
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef<{ lastDist: number; movedDistance: number }>({
    lastDist: 0,
    movedDistance: 0,
  });
  const [trayDrag, setTrayDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  // Screen position of the sticker "stamp" riding the cursor (FigJam-style).
  const [stampPos, setStampPos] = useState<{ x: number; y: number } | null>(null);

  // Open centred horizontally on the surface, just below the header.
  useEffect(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    board.updateViewport({ x: (rect.width - BOARD_SURFACE_WIDTH) / 2, y: 72 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert a screen point into board-space coordinates on the surface.
  const toBoardPoint = (clientX: number, clientY: number) => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: BOARD_SURFACE_WIDTH / 2, y: BOARD_SURFACE_HEIGHT / 2 };
    }
    return {
      x: (clientX - rect.left) / board.viewport.scale,
      y: (clientY - rect.top) / board.viewport.scale,
    };
  };

  // Zoom by a multiplicative factor while keeping the point under the cursor
  // (or pinch midpoint) pinned in place.
  const zoomAround = (clientX: number, clientY: number, factor: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    board.updateViewport((prev) => {
      const scale = clamp(prev.scale * factor, BOARD_MIN_SCALE, BOARD_MAX_SCALE);
      const bx = (clientX - rect.left - prev.x) / prev.scale;
      const by = (clientY - rect.top - prev.y) / prev.scale;
      return {
        scale,
        x: clientX - rect.left - bx * scale,
        y: clientY - rect.top - by * scale,
      };
    });
  };

  const handleViewportPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (board.stampSticker) {
      setStampPos({ x: event.clientX, y: event.clientY });
    }
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current.movedDistance = 0;
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      gestureRef.current.lastDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const handleViewportPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    // Keep the stamp glued to the cursor even when no button is pressed (hover).
    if (board.stampSticker) {
      setStampPos({ x: event.clientX, y: event.clientY });
    }

    const tracked = pointersRef.current.get(event.pointerId);
    if (!tracked) {
      return;
    }
    const dx = event.clientX - tracked.x;
    const dy = event.clientY - tracked.y;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gestureRef.current.movedDistance += Math.hypot(dx, dy);

    if (pointersRef.current.size >= 2) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      if (gestureRef.current.lastDist > 0) {
        zoomAround(midX, midY, dist / gestureRef.current.lastDist);
      }
      gestureRef.current.lastDist = dist;
      return;
    }

    // While stamping, a single pointer just positions the stamp (no panning).
    if (board.stampSticker) {
      return;
    }

    // Single pointer → pan the board.
    board.updateViewport((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleViewportPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const wasSinglePointer = pointersRef.current.size === 1;
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) {
      gestureRef.current.lastDist = 0;
    }

    // Stamp mode: drop a copy of the loaded sticker where the cursor lands and
    // stay loaded so several can be placed in a row.
    if (board.stampSticker) {
      if (wasSinglePointer) {
        const point = toBoardPoint(event.clientX, event.clientY);
        board.placeSticker(board.stampSticker, point.x, point.y);
      }
      return;
    }

    // Text tool: tap the board to drop an editable text box (Figma-style).
    if (board.activeTool === "text") {
      if (wasSinglePointer && gestureRef.current.movedDistance < 6) {
        const point = toBoardPoint(event.clientX, event.clientY);
        board.addItem({
          kind: "text",
          text: "Texte",
          color: board.activeColor,
          fontId: board.textFont,
          x: point.x,
          y: point.y,
          rotate: 0,
          scale: 1,
        });
        board.setActiveTool(null);
      }
      return;
    }

    // A tap on the empty board (no real drag) clears the selection.
    if (pointersRef.current.size === 0 && gestureRef.current.movedDistance < 6) {
      board.selectItem(null);
      board.setActiveTool(null);
    }
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && Math.abs(event.deltaY) < 1) {
      return;
    }
    zoomAround(event.clientX, event.clientY, event.deltaY > 0 ? 0.92 : 1.08);
  };

  // --- Tray drag-and-drop -------------------------------------------------
  const handleTrayPointerDown = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setTrayDrag({ id, x: event.clientX, y: event.clientY });
  };

  const handleTrayPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    setTrayDrag((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : current));
  };

  const handleTrayPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!trayDrag) {
      return;
    }
    const viewportRect = viewportRef.current?.getBoundingClientRect();
    // Only drop when released over the board, not back on the tray.
    if (viewportRect && event.clientY < viewportRect.bottom - 40) {
      const point = toBoardPoint(event.clientX, event.clientY);
      board.placeFromTray(trayDrag.id, point.x, point.y);
    }
    setTrayDrag(null);
  };

  const surfaceStyle: CSSProperties = {
    width: BOARD_SURFACE_WIDTH,
    height: BOARD_SURFACE_HEIGHT,
    transform: `translate(${board.viewport.x}px, ${board.viewport.y}px) scale(${board.viewport.scale})`,
    background: board.background.css,
  };

  const draggingPhoto = trayDrag
    ? board.tray.find((photo) => photo.id === trayDrag.id)
    : undefined;

  const addCentered = (partial: Parameters<typeof board.addItem>[0]) => {
    const point = toBoardPoint(
      (viewportRef.current?.getBoundingClientRect().left ?? 0) +
        (viewportRef.current?.clientWidth ?? 0) / 2,
      (viewportRef.current?.getBoundingClientRect().top ?? 0) +
        (viewportRef.current?.clientHeight ?? 0) / 2,
    );
    board.addItem({ ...partial, x: point.x, y: point.y });
  };

  return (
    <div className="c-placement-board">
      <header className="c-placement-board__header">
        <div className="c-placement-board__actions">
          <button
            type="button"
            className="c-placement-board__icon"
            aria-label="Annuler"
            disabled={!board.canUndo}
            onClick={board.undo}
          >
            <UndoIcon />
          </button>
          <span className="c-placement-board__icon c-placement-board__icon--static" aria-hidden="true">
            <ProfileIcon />
          </span>
        </div>
      </header>

      <div
        className={[
          "c-placement-board__viewport",
          board.stampSticker ? "is-stamping" : "",
        ].filter(Boolean).join(" ")}
        ref={viewportRef}
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onPointerCancel={handleViewportPointerUp}
        onWheel={handleWheel}
      >
        <div className="c-placement-board__surface" ref={surfaceRef} style={surfaceStyle}>
          {board.items.map((item) => (
            <BoardItemView
              key={item.id}
              item={item}
              customization={item.memoryId ? customizations[item.memoryId] : undefined}
              isSelected={board.selectedId === item.id}
              inverseScale={1 / board.viewport.scale}
              onSelect={board.selectItem}
              onMove={(id, dx, dy) =>
                board.updateItem(id, {
                  x: item.x + dx / board.viewport.scale,
                  y: item.y + dy / board.viewport.scale,
                })
              }
              onRotate={(id, rotate) => board.updateItem(id, { rotate })}
              onScale={(id, scale) => board.updateItem(id, { scale })}
              onRemove={board.removeItem}
              onEditText={(id, text) => board.updateItem(id, { text })}
            />
          ))}
        </div>
      </div>

      {board.tray.length > 0 && (
        <div className="c-placement-board__tray">
          {board.tray.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className={[
                "c-placement-board__tray-photo",
                trayDrag?.id === photo.id ? "is-dragging" : "",
              ].filter(Boolean).join(" ")}
              onPointerDown={(event) => handleTrayPointerDown(event, photo.id)}
              onPointerMove={handleTrayPointerMove}
              onPointerUp={handleTrayPointerUp}
              onPointerCancel={() => setTrayDrag(null)}
              aria-label={`Placer ${photo.title}`}
            >
              <BoardPhoto imageUrl={photo.imageUrl} customization={customizations[photo.id]} />
            </button>
          ))}
        </div>
      )}

      {draggingPhoto && trayDrag && (
        <span
          className="c-placement-board__ghost"
          aria-hidden="true"
          style={{ left: trayDrag.x, top: trayDrag.y }}
        >
          <BoardPhoto
            imageUrl={draggingPhoto.imageUrl}
            customization={customizations[draggingPhoto.id]}
          />
        </span>
      )}

      {board.stampSticker && stampPos && (
        <span
          className="c-placement-board__stamp"
          aria-hidden="true"
          style={{ left: stampPos.x, top: stampPos.y }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={board.stampSticker} alt="" draggable={false} />
        </span>
      )}

      {board.tray.length === 0 && (
      <BoardToolbar
        activeTool={board.activeTool}
        activeColor={board.activeColor}
        backgroundId={board.backgroundId}
        isStamping={Boolean(board.stampSticker)}
        textFont={board.textFont}
        onToolToggle={board.toggleTool}
        // Picking a colour recolours the selected text/shape (and drives the
        // colour used by the pen and newly placed text).
        onColorChange={(color) => {
          board.setActiveColor(color);
          if (board.selectedId) {
            board.updateItem(board.selectedId, { color });
          }
        }}
        onBackgroundChange={board.setBackgroundId}
        onAddTape={(src, scale) => addCentered({ kind: "tape", src, x: 0, y: 0, rotate: -6, scale })}
        onTextFontChange={(fontId) => {
          board.setTextFont(fontId);
          if (board.selectedId) {
            board.updateItem(board.selectedId, { fontId });
          }
        }}
        onAddShape={(shape: BoardShape) =>
          addCentered({ kind: "shape", shape, color: board.activeColor, x: 0, y: 0, rotate: 0, scale: 1 })
        }
        // Picking a sticker loads it on the cursor as a stamp rather than
        // dropping it immediately — tap the board to place copies.
        onAddSticker={(src) => board.setStampSticker(src)}
        onClearStamp={() => {
          board.setStampSticker(null);
          board.setActiveTool(null);
        }}
      />
      )}
    </div>
  );
}
