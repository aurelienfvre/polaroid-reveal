import { useWebHaptics } from "web-haptics/react";
import type { Dispatch, SetStateAction } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import type {
  CanvasPhoto,
  ExperiencePhase,
} from "@/features/reveal/types/revealTypes";
import { HAPTIC_EVENTS } from "@/lib/haptics/hapticEvents";

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
  const { trigger } = useWebHaptics();

  const handleReroll = () => {
    resetPointerTilt();
    resetDevelopmentState();
    setActiveIndex((currentIndex) => (currentIndex + 1) % MEMORIES.length);
    setPhase("camera");
    trigger(HAPTIC_EVENTS.snap, { intensity: 0.42 })?.catch(() => undefined);
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
