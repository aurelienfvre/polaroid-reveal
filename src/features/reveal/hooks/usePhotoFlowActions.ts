import type { Dispatch, SetStateAction } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import type { Memory } from "@/features/reveal/data/memories";
import { getCanvasPhoto } from "@/features/reveal/lib/canvasPhotos";
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
    // Tapping only focuses the print so it can be shaken. Once revealed, the
    // print stays put and the on-screen controls drive what happens next.
    if (params.phase !== "develop" || params.isRevealed) {
      return;
    }

    if (params.deviceProfile.isMobileLike && params.motionPermission !== "granted") {
      await params.requestMotionAccess().catch(() => false);
    }

    params.setPhotoFocused(true);
    triggerHaptic("snap", { intensity: 0.32 });
  };

  const placeCurrentPhoto = () => {
    if (params.placedPhotos.some((photo) => photo.id === params.activeMemory.id)) {
      return;
    }

    const nextZIndex = params.getNextCanvasZIndex();
    params.setPlacedPhotos((photos) => [
      ...photos,
      getCanvasPhoto(params.activeMemory, photos.length, nextZIndex),
    ]);
  };

  // Swap the developed print for another random memory without leaving the
  // develop view — it stays revealed, just shows a different shot.
  const handleChangePhoto = () => {
    if (!params.isRevealed) {
      return;
    }

    params.setActiveIndex((currentIndex) => pickAnotherIndex(currentIndex));
    triggerHaptic("snap", { intensity: 0.3 });
  };

  // Keep the developed print and send a fresh one out of the camera.
  const handleTakeNewPhoto = () => {
    if (!params.isRevealed) {
      return;
    }

    placeCurrentPhoto();
    params.resetPointerTilt();
    params.resetDevelopmentState();
    params.setPhotoFocused(false);
    params.setActiveIndex((currentIndex) => pickAnotherIndex(currentIndex));
    triggerHaptic("snap", { intensity: 0.5 });
    params.setPhase("camera");
  };

  // Finish the daily set and move on to the canvas.
  const handleShowMyPhotos = () => {
    if (!params.isRevealed) {
      return;
    }

    placeCurrentPhoto();
    params.resetPointerTilt();
    params.resetDevelopmentState();
    params.setPhotoFocused(false);
    triggerHaptic("snap", { intensity: 0.5 });
    params.setPhase("canvas");
  };

  const handleShare = async () => {
    const memory = params.activeMemory;
    const shareData = {
      title: memory.title,
      text: `${memory.title} — ${memory.caption}`,
      url: memory.imageUrl,
    };

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard?.writeText(memory.imageUrl);
    } catch {
      // User dismissed the share sheet, or the platform refused — nothing to do.
    }
  };

  return {
    handleCameraShoot,
    handleChangePhoto,
    handlePolaroidSelect,
    handleShare,
    handleShowMyPhotos,
    handleTakeNewPhoto,
  };
}

function pickAnotherIndex(currentIndex: number) {
  if (MEMORIES.length <= 1) {
    return currentIndex;
  }

  const offset = 1 + Math.floor(Math.random() * (MEMORIES.length - 1));
  return (currentIndex + offset) % MEMORIES.length;
}
