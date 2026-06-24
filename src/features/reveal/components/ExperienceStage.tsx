import type { PointerEvent, RefObject } from "react";
import { DevelopStage } from "@/features/reveal/components/DevelopStage";
import { MemoryCanvas } from "@/features/reveal/components/MemoryCanvas";
import { PolaroidCamera } from "@/features/reveal/components/PolaroidCamera";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";
import type {
  CanvasPhoto,
  ExperiencePhase,
  TiltStyle,
} from "@/features/reveal/types/revealTypes";

type Props = {
  activeIndex: number;
  cameraModel: PolaroidCameraModel;
  draggingId: string | null;
  isPhotoFocused: boolean;
  isRevealed: boolean;
  motionRef: RefObject<HTMLButtonElement | null>;
  nextPhotoNumber: number;
  onCanvasPointerCancel: () => void;
  onCanvasPointerDown: (
    event: PointerEvent<HTMLButtonElement>,
    photo: CanvasPhoto,
  ) => void;
  onCanvasPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onCanvasPointerUp: () => void;
  onPolaroidSelect: () => void;
  onShoot: () => void;
  phase: ExperiencePhase;
  photos: CanvasPhoto[];
  revealProgress: number;
  tiltStyle: TiltStyle;
};

export function ExperienceStage(props: Props) {
  if (props.phase === "canvas") {
    return (
      <MemoryCanvas
        draggingId={props.draggingId}
        onPointerCancel={props.onCanvasPointerCancel}
        onPointerDown={props.onCanvasPointerDown}
        onPointerMove={props.onCanvasPointerMove}
        onPointerUp={props.onCanvasPointerUp}
        photos={props.photos}
      />
    );
  }

  return (
    <div className="c-reveal-board">
      <PolaroidCamera
        isPassive={props.phase === "develop"}
        model={props.cameraModel}
        onShoot={props.onShoot}
      />
      {props.phase === "develop" && (
        <DevelopStage
          activeIndex={props.activeIndex}
          isPhotoFocused={props.isPhotoFocused}
          isRevealed={props.isRevealed}
          motionRef={props.motionRef}
          onPolaroidSelect={props.onPolaroidSelect}
          revealProgress={props.revealProgress}
          tiltStyle={props.tiltStyle}
        />
      )}
    </div>
  );
}
