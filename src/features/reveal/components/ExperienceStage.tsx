import type { Dispatch, PointerEvent, RefObject, SetStateAction } from "react";
import { DevelopStage } from "@/features/reveal/components/DevelopStage";
import { MemoryCanvas } from "@/features/reveal/components/MemoryCanvas";
import { PersonalizeStage } from "@/features/reveal/components/PersonalizeStage";
import { PolaroidCamera } from "@/features/reveal/components/PolaroidCamera";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";
import type {
  CanvasPhoto,
  ExperiencePhase,
  PhotoCustomization,
  TiltStyle,
} from "@/features/reveal/types/revealTypes";

type Props = {
  activeIndex: number;
  cameraModel: PolaroidCameraModel;
  customizations: Record<string, PhotoCustomization>;
  draggingId: string | null;
  isLastTirage: boolean;
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
  onChangePhoto: () => void;
  onCustomizationsChange: Dispatch<SetStateAction<Record<string, PhotoCustomization>>>;
  onPolaroidSelect: () => void;
  onShare: () => void;
  onShoot: () => void;
  onShowMyPhotos: () => void;
  onTakeNewPhoto: () => void;
  onValidatePersonalization: () => void;
  phase: ExperiencePhase;
  photos: CanvasPhoto[];
  revealProgress: number;
  tiltStyle: TiltStyle;
};

export function ExperienceStage(props: Props) {
  if (props.phase === "personalize") {
    return (
      <PersonalizeStage
        customizations={props.customizations}
        onCustomizationsChange={props.onCustomizationsChange}
        onValidate={props.onValidatePersonalization}
        photos={props.photos}
      />
    );
  }

  if (props.phase === "canvas") {
    return (
      <MemoryCanvas
        customizations={props.customizations}
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
          isLastTirage={props.isLastTirage}
          isPhotoFocused={props.isPhotoFocused}
          isRevealed={props.isRevealed}
          motionRef={props.motionRef}
          onChangePhoto={props.onChangePhoto}
          onPolaroidSelect={props.onPolaroidSelect}
          onShare={props.onShare}
          onShowMyPhotos={props.onShowMyPhotos}
          onTakeNewPhoto={props.onTakeNewPhoto}
          revealProgress={props.revealProgress}
          tiltStyle={props.tiltStyle}
        />
      )}
    </div>
  );
}
