import type { Dispatch, SetStateAction } from "react";
import type { Memory } from "@/features/reveal/data/memories";
import { getRandomMemoryIndex } from "@/features/reveal/lib/photoDraw";
import type {
  CanvasPhoto,
  ExperiencePhase,
} from "@/features/reveal/types/revealTypes";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";

type Params = {
  memories: Memory[];
  placedPhotos: CanvasPhoto[];
  resetDevelopmentState: () => void;
  resetPointerTilt: () => void;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  setPhase: Dispatch<SetStateAction<ExperiencePhase>>;
  setPlacedPhotos: Dispatch<SetStateAction<CanvasPhoto[]>>;
};

export function useSessionActions({
  memories,
  placedPhotos,
  resetDevelopmentState,
  resetPointerTilt,
  setActiveIndex,
  setPhase,
  setPlacedPhotos,
}: Params) {
  const triggerHaptic = usePolaroidHaptics();

  const handleReroll = () => {
    if (memories.length === 0) {
      return;
    }

    resetPointerTilt();
    resetDevelopmentState();
    setActiveIndex((currentIndex) => (currentIndex + 1) % memories.length);
    setPhase("camera");
    triggerHaptic("snap", { intensity: 0.42 });
  };

  const handleOpenCanvas = () => {
    if (placedPhotos.length > 0) {
      setPhase("canvas");
    }
  };

  const handleResetDailySession = () => {
    resetPointerTilt();
    resetDevelopmentState();
    setPlacedPhotos([]);
    setActiveIndex(getRandomMemoryIndex(memories));
    setPhase("camera");
  };

  return {
    handleOpenCanvas,
    handleReroll,
    handleResetDailySession,
  };
}
