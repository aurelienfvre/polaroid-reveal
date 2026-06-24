import type { Dispatch, SetStateAction } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import type { Memory } from "@/features/reveal/data/memories";
import {
  DAILY_REVEAL_LIMIT,
  getCanvasPhoto,
} from "@/features/reveal/lib/canvasPhotos";
import type { DeviceProfile } from "@/hooks/useDeviceProfile";
import type { CanvasPhoto, ExperiencePhase } from "@/features/reveal/types/revealTypes";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";

type Params = {
  activeMemory: Memory;
  deviceProfile: DeviceProfile;
  getNextCanvasZIndex: () => number;
  isDailyComplete: boolean;
  isRevealed: boolean;
  motionPermission: string;
  phase: ExperiencePhase;
  placedPhotos: CanvasPhoto[];
  requestMotionAccess: () => Promise<boolean>;
  resetDevelopmentState: () => void;
  resetPointerTilt: () => void;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  setPhase: Dispatch<SetStateAction<ExperiencePhase>>;
  setPhotoFocused: Dispatch<SetStateAction<boolean>>;
  setPlacedPhotos: Dispatch<SetStateAction<CanvasPhoto[]>>;
};

export function usePhotoFlowActions(params: Params) {
  const triggerHaptic = usePolaroidHaptics();

  const handleCameraShoot = () => {
    if (params.isDailyComplete) {
      params.setPhase("canvas");
      return;
    }

    params.resetDevelopmentState();
    params.setPhotoFocused(false);
    params.setPhase("develop");
  };

  const handlePolaroidSelect = async () => {
    if (params.phase !== "develop") {
      return;
    }

    if (params.isRevealed) {
      handlePlaceRevealedPhoto();
      return;
    }

    if (params.deviceProfile.isMobileLike && params.motionPermission !== "granted") {
      await params.requestMotionAccess().catch(() => false);
    }

    params.setPhotoFocused(true);
    triggerHaptic("snap", { intensity: 0.32 });
  };

  const handlePlaceRevealedPhoto = () => {
    if (!params.isRevealed) {
      return;
    }

    const exists = params.placedPhotos.some((photo) => photo.id === params.activeMemory.id);
    const nextCount = exists ? params.placedPhotos.length : params.placedPhotos.length + 1;

    if (!exists) {
      const nextZIndex = params.getNextCanvasZIndex();

      params.setPlacedPhotos((photos) => [
        ...photos,
        getCanvasPhoto(params.activeMemory, photos.length, nextZIndex),
      ]);
    }

    params.resetPointerTilt();
    params.resetDevelopmentState();
    params.setPhotoFocused(false);
    triggerHaptic("snap", { intensity: 0.5 });
    params.setPhase(nextCount >= DAILY_REVEAL_LIMIT ? "canvas" : "camera");
    if (nextCount < DAILY_REVEAL_LIMIT) {
      params.setActiveIndex((currentIndex) => (currentIndex + 1) % MEMORIES.length);
    }
  };

  return {
    handleCameraShoot,
    handlePlaceRevealedPhoto,
    handlePolaroidSelect,
  };
}
