import type { Dispatch, SetStateAction } from "react";
import type { Memory } from "@/features/reveal/data/memories";
import { getCanvasPhoto } from "@/features/reveal/lib/canvasPhotos";
import { exportPolaroidImage } from "@/features/reveal/lib/exportPolaroidImage";
import { getPlaceableMemory, pickNextMemoryIndex } from "@/features/reveal/lib/photoDraw";
import type { DeviceProfile } from "@/hooks/useDeviceProfile";
import type { CanvasPhoto, ExperiencePhase } from "@/features/reveal/types/revealTypes";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";

type Params = {
  activeMemory: Memory | null;
  canChangePhoto: boolean;
  deviceProfile: DeviceProfile;
  getNextCanvasZIndex: () => number;
  isDailyComplete: boolean;
  isRevealed: boolean;
  memories: Memory[];
  motionPermission: string;
  phase: ExperiencePhase;
  placedPhotos: CanvasPhoto[];
  rerolledPhotoIds: string[];
  requestMotionAccess: () => Promise<boolean>;
  resetDevelopmentState: () => void;
  resetPointerTilt: () => void;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  setChangeCount: Dispatch<SetStateAction<number>>;
  setPhase: Dispatch<SetStateAction<ExperiencePhase>>;
  setPhotoFocused: Dispatch<SetStateAction<boolean>>;
  setPlacedPhotos: Dispatch<SetStateAction<CanvasPhoto[]>>;
  setRerolledPhotoIds: Dispatch<SetStateAction<string[]>>;
  setShootNonce: Dispatch<SetStateAction<number>>;
};

export function usePhotoFlowActions(params: Params) {
  const triggerHaptic = usePolaroidHaptics();

  const handleCameraShoot = () => {
    if (!params.activeMemory || params.memories.length === 0) {
      return;
    }

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

  const placeCurrentPhoto = (preferredMemory?: Memory | null) => {
    const sourceMemory = preferredMemory ?? params.activeMemory;

    if (!sourceMemory) {
      return;
    }

    const nextZIndex = params.getNextCanvasZIndex();
    params.setPlacedPhotos((photos) => {
      const memory = getPlaceableMemory(
        params.memories,
        sourceMemory,
        photos,
        params.rerolledPhotoIds,
      );

      if (!memory) {
        return photos;
      }

      return [
        ...photos,
        getCanvasPhoto(memory, photos.length, nextZIndex),
      ];
    });
  };

  // Swap the developed print for another random memory without leaving the
  // develop view — it stays revealed, just shows a different shot.
  const handleChangePhoto = () => {
    const activeMemory = params.activeMemory;

    if (!activeMemory || !params.isRevealed || !params.canChangePhoto) {
      return;
    }

    const rejectedPhotoIds = Array.from(new Set([
      ...params.rerolledPhotoIds,
      activeMemory.id,
    ]));

    params.setChangeCount((count) => count + 1);
    params.setRerolledPhotoIds(rejectedPhotoIds);
    params.setActiveIndex((currentIndex) => (
      pickNextMemoryIndex(
        params.memories,
        currentIndex,
        params.placedPhotos,
        rejectedPhotoIds,
      )
    ));
    triggerHaptic("snap", { intensity: 0.3 });
  };

  // Keep the developed print and send a fresh one out of the camera.
  const handleTakeNewPhoto = () => {
    const activeMemory = params.activeMemory;

    if (!activeMemory || !params.isRevealed) {
      return;
    }

    const placedMemory = getPlaceableMemory(
      params.memories,
      activeMemory,
      params.placedPhotos,
      params.rerolledPhotoIds,
    );
    placeCurrentPhoto(placedMemory ?? activeMemory);
    params.resetPointerTilt();
    params.resetDevelopmentState();
    params.setPhotoFocused(false);
    params.setActiveIndex((currentIndex) => (
      pickNextMemoryIndex(
        params.memories,
        currentIndex,
        [
          ...params.placedPhotos,
          placedMemory ?? activeMemory,
        ],
        params.rerolledPhotoIds,
      )
    ));
    triggerHaptic("snap", { intensity: 0.5 });
    params.setPhase("camera");
    // Re-fire the eject straight away so the user doesn't have to tap again.
    params.setShootNonce((nonce) => nonce + 1);
  };

  // Finish the daily set and move on to personalising the prints.
  const handleShowMyPhotos = () => {
    if (!params.activeMemory || !params.isRevealed) {
      return;
    }

    placeCurrentPhoto();
    params.resetPointerTilt();
    params.resetDevelopmentState();
    params.setPhotoFocused(false);
    triggerHaptic("snap", { intensity: 0.5 });
    params.setPhase("personalize");
  };

  const handleValidatePersonalization = () => {
    triggerHaptic("snap", { intensity: 0.5 });
    params.setPhase("canvas");
  };

  const handleShare = async () => {
    if (!params.activeMemory) {
      return;
    }

    try {
      await exportPolaroidImage(params.activeMemory);
    } catch {
      // Export can fail if a remote image blocks canvas access.
    }
  };

  return {
    handleCameraShoot,
    handleChangePhoto,
    handlePolaroidSelect,
    handleShare,
    handleShowMyPhotos,
    handleTakeNewPhoto,
    handleValidatePersonalization,
  };
}
