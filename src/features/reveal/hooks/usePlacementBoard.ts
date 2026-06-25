import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BOARD_BACKGROUNDS,
  BOARD_COLORS,
  BOARD_MAX_SCALE,
  BOARD_MIN_SCALE,
} from "@/features/reveal/lib/boardData";
import type {
  BoardItem,
  BoardTool,
  BoardViewport,
  CanvasPhoto,
} from "@/features/reveal/types/revealTypes";

let itemSeq = 0;
function nextItemId(kind: string) {
  itemSeq += 1;
  return `${kind}-${Date.now().toString(36)}-${itemSeq}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function usePlacementBoard(photos: CanvasPhoto[]) {
  // The three developed prints start "in hand" in the tray, not on the board.
  const [tray, setTray] = useState<CanvasPhoto[]>(photos);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<BoardTool | null>(null);
  const [backgroundId, setBackgroundId] = useState(BOARD_BACKGROUNDS[0].id);
  const [activeColor, setActiveColor] = useState<string>(BOARD_COLORS[8]);
  // The sticker currently "loaded" on the cursor as a FigJam-style stamp; null
  // when not stamping. While set, tapping the board drops a copy.
  const [stampSticker, setStampSticker] = useState<string | null>(null);
  const [viewport, setViewport] = useState<BoardViewport>({ x: 0, y: 0, scale: 1 });

  const zRef = useRef(20);
  // Each entry snapshots BOTH the placed items and the tray, so undoing a
  // placement sends the print back to the tray (ready to place again).
  const historyRef = useRef<Array<{ items: BoardItem[]; tray: CanvasPhoto[] }>>([]);
  const [canUndo, setCanUndo] = useState(false);

  // Mirror the latest committed state so history can snapshot it before a change.
  const itemsRef = useRef(items);
  const trayRef = useRef(tray);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    trayRef.current = tray;
  }, [tray]);

  const background = useMemo(
    () => BOARD_BACKGROUNDS.find((bg) => bg.id === backgroundId) ?? BOARD_BACKGROUNDS[0],
    [backgroundId],
  );

  const pushHistory = useCallback(() => {
    historyRef.current.push({ items: itemsRef.current, tray: trayRef.current });
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }
    setCanUndo(true);
  }, []);

  const nextZ = useCallback(() => {
    zRef.current += 1;
    return zRef.current;
  }, []);

  const selectItem = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      setItems((current) => {
        const z = (zRef.current += 1);
        return current.map((item) => (item.id === id ? { ...item, zIndex: z } : item));
      });
    }
  }, []);

  const addItem = useCallback(
    (partial: Omit<BoardItem, "id" | "zIndex">) => {
      const id = nextItemId(partial.kind);
      pushHistory();
      setItems((current) => [...current, { ...partial, id, zIndex: nextZ() }]);
      setSelectedId(id);
      return id;
    },
    [nextZ, pushHistory],
  );

  // Drop a tray print onto the board at the given board-space coordinates.
  const placeFromTray = useCallback(
    (photoId: string, x: number, y: number) => {
      const photo = tray.find((entry) => entry.id === photoId);
      if (!photo) {
        return;
      }
      pushHistory();
      setTray((current) => current.filter((entry) => entry.id !== photoId));
      setItems((current) => [
        ...current,
        {
          id: nextItemId("photo"),
          kind: "photo",
          memoryId: photo.id,
          imageUrl: photo.imageUrl,
          x,
          y,
          rotate: photo.rotate ?? 0,
          scale: 1,
          zIndex: nextZ(),
        },
      ]);
    },
    [nextZ, pushHistory, tray],
  );

  // Stamp a sticker at a board point without selecting it, so several can be
  // dropped in a row (like the FigJam stamp tool).
  const placeSticker = useCallback(
    (src: string, x: number, y: number) => {
      pushHistory();
      setItems((current) => [
        ...current,
        {
          id: nextItemId("sticker"),
          kind: "sticker",
          src,
          x,
          y,
          rotate: 0,
          scale: 1,
          zIndex: nextZ(),
        },
      ]);
    },
    [nextZ, pushHistory],
  );

  const updateItem = useCallback((id: string, patch: Partial<BoardItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    pushHistory();
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }, [pushHistory]);

  const undo = useCallback(() => {
    const previous = historyRef.current.pop();
    if (!previous) {
      return;
    }
    setItems(previous.items);
    setTray(previous.tray);
    setSelectedId(null);
    setActiveTool(null);
    setCanUndo(historyRef.current.length > 0);
  }, []);

  const toggleTool = useCallback((tool: BoardTool) => {
    setActiveTool((current) => (current === tool ? null : tool));
  }, []);

  // Clamp the viewport so the board can't be flung off-screen or zoomed to dust.
  const updateViewport = useCallback(
    (next: Partial<BoardViewport> | ((prev: BoardViewport) => Partial<BoardViewport>)) => {
      setViewport((prev) => {
        const patch = typeof next === "function" ? next(prev) : next;
        const scale = clamp(patch.scale ?? prev.scale, BOARD_MIN_SCALE, BOARD_MAX_SCALE);
        return {
          scale,
          x: patch.x ?? prev.x,
          y: patch.y ?? prev.y,
        };
      });
    },
    [],
  );

  return {
    activeColor,
    activeTool,
    addItem,
    background,
    backgroundId,
    canUndo,
    items,
    placeFromTray,
    placeSticker,
    removeItem,
    selectItem,
    selectedId,
    setActiveColor,
    setActiveTool,
    setBackgroundId,
    setStampSticker,
    stampSticker,
    toggleTool,
    tray,
    undo,
    updateItem,
    updateViewport,
    viewport,
  };
}
