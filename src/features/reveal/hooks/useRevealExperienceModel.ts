import type { RefObject } from "react";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";
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
  const triggerHaptic = usePolaroidHaptics();
  // Buzz the phone on any physical shake while developing — independent of how
  // far the print has developed — so movement always produces a tactile tick.
  const handleShakeHaptic = (force: number) => {
    if (flow.phaseRef.current !== "develop") {
      return;
    }
    triggerHaptic("shake", { intensity: Math.min(0.8 + force * 0.2, 1) });
  };
  const motion = useDeviceOrientation(development.developMemory, handleShakeHaptic);
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
    isFocused: flow.isPhotoFocused,
    isRevealed: development.isRevealed,
    motionRef: polaroidMotionRef,
    orientationRef: motion.orientationRef,
    permissionState: motion.permissionState,
    phase: flow.phase,
  });

  return {
    phase: flow.phase,
    stage: {
      ...drag,
      activeIndex: flow.activeIndex,
      cameraModel,
      canChangePhoto: flow.canChangePhoto,
      changesRemaining: flow.changesRemaining,
      customizations: flow.photoCustomizations,
      isLastTirage: flow.isLastTirage,
      isPhotoFocused: flow.isPhotoFocused,
      isRevealed: development.isRevealed,
      nextPhotoNumber: flow.nextPhotoNumber,
      onChangePhoto: photo.handleChangePhoto,
      onPolaroidSelect: photo.handlePolaroidSelect,
      onShare: photo.handleShare,
      onCustomizationsChange: flow.setPhotoCustomizations,
      onShoot: photo.handleCameraShoot,
      onShowMyPhotos: photo.handleShowMyPhotos,
      onSkipReveal: development.revealNow,
      onTakeNewPhoto: photo.handleTakeNewPhoto,
      onValidatePersonalization: photo.handleValidatePersonalization,
      phase: flow.phase,
      photos: flow.placedPhotos,
      shootNonce: flow.shootNonce,
      tiltStyle: getTiltStyle(development.isRevealed ? 1 : 0),
    },
  };
}
