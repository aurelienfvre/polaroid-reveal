import { useCallback, useEffect, useRef, useState } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import { DAILY_REVEAL_LIMIT, MAX_PHOTO_CHANGES } from "@/features/reveal/lib/canvasPhotos";
import type {
  CanvasPhoto,
  ExperiencePhase,
  PhotoCustomization,
} from "@/features/reveal/types/revealTypes";

export function useRevealFlowState() {
  const [phase, setPhase] = useState<ExperiencePhase>("camera");
  const [activeIndex, setActiveIndex] = useState(0);
  const [placedPhotos, setPlacedPhotos] = useState<CanvasPhoto[]>([]);
  const [photoCustomizations, setPhotoCustomizations] = useState<
    Record<string, PhotoCustomization>
  >({});
  const [isPhotoFocused, setPhotoFocused] = useState(false);
  const [shootNonce, setShootNonce] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const highestCanvasZIndexRef = useRef(10);
  const isPhotoFocusedRef = useRef(false);
  const phaseRef = useRef<ExperiencePhase>("camera");

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
    activeMemory: MEMORIES[activeIndex],
    canChangePhoto: changeCount < MAX_PHOTO_CHANGES,
    changeCount,
    changesRemaining: Math.max(MAX_PHOTO_CHANGES - changeCount, 0),
    getNextCanvasZIndex,
    isDailyComplete: placedPhotos.length >= DAILY_REVEAL_LIMIT,
    isLastTirage: placedPhotos.length >= DAILY_REVEAL_LIMIT - 1,
    isPhotoFocused,
    isPhotoFocusedRef,
    nextPhotoNumber: Math.min(placedPhotos.length + 1, DAILY_REVEAL_LIMIT),
    phase,
    phaseRef,
    photoCustomizations,
    placedPhotos,
    setActiveIndex,
    setChangeCount,
    setPhase,
    setPhotoCustomizations,
    setPhotoFocused,
    setPlacedPhotos,
    setShootNonce,
    shootNonce,
  };
}
