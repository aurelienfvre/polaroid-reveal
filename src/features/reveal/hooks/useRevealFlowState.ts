import { useCallback, useEffect, useRef, useState } from "react";
import type { Memory } from "@/features/reveal/data/memories";
import { DAILY_REVEAL_LIMIT, MAX_PHOTO_CHANGES } from "@/features/reveal/lib/canvasPhotos";
import { getRandomMemoryIndex } from "@/features/reveal/lib/photoDraw";
import type {
  CanvasPhoto,
  ExperiencePhase,
  PhotoCustomization,
} from "@/features/reveal/types/revealTypes";

type PhotoLibraryResponse = {
  photos?: Memory[];
};

export function useRevealFlowState(initialMemories: Memory[]) {
  const [phase, setPhase] = useState<ExperiencePhase>("camera");
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placedPhotos, setPlacedPhotos] = useState<CanvasPhoto[]>([]);
  const [photoCustomizations, setPhotoCustomizations] = useState<
    Record<string, PhotoCustomization>
  >({});
  const [isPhotoFocused, setPhotoFocused] = useState(false);
  const [shootNonce, setShootNonce] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [rerolledPhotoIds, setRerolledPhotoIds] = useState<string[]>([]);
  const highestCanvasZIndexRef = useRef(10);
  const isPhotoFocusedRef = useRef(false);
  const phaseRef = useRef<ExperiencePhase>("camera");

  useEffect(() => {
    let isCancelled = false;

    async function loadMemories() {
      try {
        const response = await fetch("/api/photos", { cache: "no-store" });
        const data = await response.json() as PhotoLibraryResponse;
        const nextMemories = Array.isArray(data.photos) ? data.photos : [];

        if (isCancelled) {
          return;
        }

        setMemories(nextMemories);
        setActiveIndex(getRandomMemoryIndex(nextMemories));
      } catch {
        if (!isCancelled) {
          setMemories([]);
        }
      }
    }

    loadMemories();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    isPhotoFocusedRef.current = isPhotoFocused;
  }, [isPhotoFocused]);

  const getNextCanvasZIndex = useCallback(() => {
    highestCanvasZIndexRef.current += 1;
    return highestCanvasZIndexRef.current;
  }, []);

  return {
    activeIndex,
    activeMemory: memories[activeIndex] ?? null,
    canChangePhoto: changeCount < MAX_PHOTO_CHANGES,
    changeCount,
    changesRemaining: Math.max(MAX_PHOTO_CHANGES - changeCount, 0),
    getNextCanvasZIndex,
    isDailyComplete: placedPhotos.length >= DAILY_REVEAL_LIMIT,
    isLastTirage: placedPhotos.length >= DAILY_REVEAL_LIMIT - 1,
    isPhotoFocused,
    isPhotoFocusedRef,
    isPhotoLibraryReady: memories.length > 0,
    memories,
    nextPhotoNumber: Math.min(placedPhotos.length + 1, DAILY_REVEAL_LIMIT),
    phase,
    phaseRef,
    photoCustomizations,
    placedPhotos,
    rerolledPhotoIds,
    setActiveIndex,
    setChangeCount,
    setPhase,
    setPhotoCustomizations,
    setPhotoFocused,
    setPlacedPhotos,
    setRerolledPhotoIds,
    setShootNonce,
    shootNonce,
  };
}
