import type { RefObject } from "react";
import { useCanvasDrag } from "@/features/reveal/hooks/useCanvasDrag";
import { useDevelopmentController } from "@/features/reveal/hooks/useDevelopmentController";
import { usePhotoFlowActions } from "@/features/reveal/hooks/usePhotoFlowActions";
import { usePolaroidTiltEffect } from "@/features/reveal/hooks/usePolaroidTiltEffect";
import { useRandomPolaroidCameraModel } from "@/features/reveal/hooks/useRandomPolaroidCameraModel";
import { useRevealAnimations } from "@/features/reveal/hooks/useRevealAnimations";
import { useRevealFlowState } from "@/features/reveal/hooks/useRevealFlowState";
import { getTiltStyle } from "@/features/reveal/lib/revealStyles";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";
import { usePointerTilt } from "@/hooks/usePointerTilt";

export function useRevealExperienceModel(
  stageRef: RefObject<HTMLDivElement | null>,
  polaroidMotionRef: RefObject<HTMLElement | null>,
) {
  const flow = useRevealFlowState();
  const cameraModel = useRandomPolaroidCameraModel();
  const deviceProfile = useDeviceProfile();
  const development = useDevelopmentController({
    canDevelopRef: flow.isPhotoFocusedRef,
    phaseRef: flow.phaseRef,
    polaroidMotionRef,
  });
  const motion = useDeviceOrientation(development.developMemory);
  const pointerTilt = usePointerTilt(
    stageRef,
    flow.phase === "develop" &&
      flow.isPhotoFocused &&
      deviceProfile.inputMode !== "motion",
    development.developMemory,
    polaroidMotionRef,
  );
  const drag = useCanvasDrag(flow.setPlacedPhotos, flow.getNextCanvasZIndex);
  const photo = usePhotoFlowActions({
    ...flow,
    deviceProfile,
    getNextCanvasZIndex: flow.getNextCanvasZIndex,
    isRevealed: development.isRevealed,
    motionPermission: motion.permissionState,
    requestMotionAccess: motion.requestAccess,
    resetDevelopmentState: development.resetDevelopmentState,
    resetPointerTilt: pointerTilt.resetPointerTilt,
  });
  useRevealAnimations({
    activeIndex: flow.activeIndex,
    cameraModel,
    isPhotoFocused: flow.isPhotoFocused,
    isRevealed: development.isRevealed,
    phase: flow.phase,
    stageRef,
  });
  usePolaroidTiltEffect({
    isRevealed: development.isRevealed,
    motionRef: polaroidMotionRef,
    orientation: motion.orientation,
    permissionState: motion.permissionState,
    phase: flow.phase,
  });

  return {
    phase: flow.phase,
    stage: {
      ...drag,
      activeIndex: flow.activeIndex,
      cameraModel,
      isLastTirage: flow.isLastTirage,
      isPhotoFocused: flow.isPhotoFocused,
      isRevealed: development.isRevealed,
      nextPhotoNumber: flow.nextPhotoNumber,
      onChangePhoto: photo.handleChangePhoto,
      onPolaroidSelect: photo.handlePolaroidSelect,
      onShare: photo.handleShare,
      onShoot: photo.handleCameraShoot,
      onShowMyPhotos: photo.handleShowMyPhotos,
      onTakeNewPhoto: photo.handleTakeNewPhoto,
      onValidatePersonalization: photo.handleValidatePersonalization,
      phase: flow.phase,
      photos: flow.placedPhotos,
      revealProgress: development.revealProgress,
      tiltStyle: getTiltStyle(development.revealProgress),
    },
  };
}
