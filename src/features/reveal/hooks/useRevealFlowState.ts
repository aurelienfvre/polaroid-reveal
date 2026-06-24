import { useCallback, useEffect, useRef, useState } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import { DAILY_REVEAL_LIMIT } from "@/features/reveal/lib/canvasPhotos";
import type {
  CanvasPhoto,
  ExperiencePhase,
} from "@/features/reveal/types/revealTypes";

export function useRevealFlowState() {
  const [phase, setPhase] = useState<ExperiencePhase>("camera");
  const [activeIndex, setActiveIndex] = useState(0);
  const [placedPhotos, setPlacedPhotos] = useState<CanvasPhoto[]>([]);
  const [isPhotoFocused, setPhotoFocused] = useState(false);
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
    getNextCanvasZIndex,
    isDailyComplete: placedPhotos.length >= DAILY_REVEAL_LIMIT,
    isLastTirage: placedPhotos.length >= DAILY_REVEAL_LIMIT - 1,
    isPhotoFocused,
    isPhotoFocusedRef,
    nextPhotoNumber: Math.min(placedPhotos.length + 1, DAILY_REVEAL_LIMIT),
    phase,
    phaseRef,
    placedPhotos,
    setActiveIndex,
    setPhase,
    setPhotoFocused,
    setPlacedPhotos,
  };
}
