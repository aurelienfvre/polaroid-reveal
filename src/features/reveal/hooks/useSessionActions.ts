import type { Dispatch, SetStateAction } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import type {
  CanvasPhoto,
  ExperiencePhase,
} from "@/features/reveal/types/revealTypes";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";

type Params = {
  placedPhotos: CanvasPhoto[];
  resetDevelopmentState: () => void;
  resetPointerTilt: () => void;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  setPhase: Dispatch<SetStateAction<ExperiencePhase>>;
  setPlacedPhotos: Dispatch<SetStateAction<CanvasPhoto[]>>;
};

export function useSessionActions({
  placedPhotos,
  resetDevelopmentState,
  resetPointerTilt,
  setActiveIndex,
  setPhase,
  setPlacedPhotos,
}: Params) {
  const triggerHaptic = usePolaroidHaptics();

  const handleReroll = () => {
    resetPointerTilt();
    resetDevelopmentState();
    setActiveIndex((currentIndex) => (currentIndex + 1) % MEMORIES.length);
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
    setActiveIndex(0);
    setPhase("camera");
  };

  return {
    handleOpenCanvas,
    handleReroll,
    handleResetDailySession,
  };
}
