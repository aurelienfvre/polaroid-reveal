import type { RefObject } from "react";
import { useCanvasDrag } from "@/features/reveal/hooks/useCanvasDrag";
import { useDevelopmentController } from "@/features/reveal/hooks/useDevelopmentController";
import { usePhotoFlowActions } from "@/features/reveal/hooks/usePhotoFlowActions";
import { usePolaroidTiltEffect } from "@/features/reveal/hooks/usePolaroidTiltEffect";
import { useRevealAnimations } from "@/features/reveal/hooks/useRevealAnimations";
import { useRevealFlowState } from "@/features/reveal/hooks/useRevealFlowState";
import { getTiltStyle } from "@/features/reveal/lib/revealStyles";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";
import { usePointerTilt } from "@/hooks/usePointerTilt";

export function useRevealExperienceModel(
  stageRef: RefObject<HTMLDivElement | null>,
  polaroidMotionRef: RefObject<HTMLDivElement | null>,
) {
  const flow = useRevealFlowState();
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
    isPhotoFocused: flow.isPhotoFocused,
    isRevealed: development.isRevealed,
    phase: flow.phase,
    stageRef,
  });
  usePolaroidTiltEffect({
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
      isPhotoFocused: flow.isPhotoFocused,
      isRevealed: development.isRevealed,
      nextPhotoNumber: flow.nextPhotoNumber,
      onPolaroidSelect: photo.handlePolaroidSelect,
      onShoot: photo.handleCameraShoot,
      phase: flow.phase,
      photos: flow.placedPhotos,
      revealProgress: development.revealProgress,
      tiltStyle: getTiltStyle(development.revealProgress),
    },
  };
}
