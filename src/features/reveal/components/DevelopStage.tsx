import type { RefObject } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import { DevelopControls } from "@/features/reveal/components/DevelopControls";
import { PolaroidCard } from "@/features/reveal/components/PolaroidCard";
import type { TiltStyle } from "@/features/reveal/types/revealTypes";

type Props = {
  activeIndex: number;
  isLastTirage: boolean;
  isPhotoFocused: boolean;
  isRevealed: boolean;
  motionRef: RefObject<HTMLButtonElement | null>;
  onChangePhoto: () => void;
  onPolaroidSelect: () => void;
  onShare: () => void;
  onShowMyPhotos: () => void;
  onTakeNewPhoto: () => void;
  revealProgress: number;
  tiltStyle: TiltStyle;
};

export function DevelopStage({
  activeIndex,
  isLastTirage,
  isPhotoFocused,
  isRevealed,
  motionRef,
  onChangePhoto,
  onPolaroidSelect,
  onShare,
  onShowMyPhotos,
  onTakeNewPhoto,
  revealProgress,
  tiltStyle,
}: Props) {
  const activeMemory = MEMORIES[activeIndex];

  return (
    <div className="c-develop" aria-live="polite">
      {isPhotoFocused && <div className="c-develop__backdrop" aria-hidden="true" />}

      <div className="c-polaroid-stack">
        <PolaroidCard
          isActive
          isFocused={isPhotoFocused}
          isRevealed={isRevealed}
          key={activeMemory.id}
          memory={activeMemory}
          motionRef={motionRef}
          onSelect={onPolaroidSelect}
          revealProgress={revealProgress}
          tiltStyle={tiltStyle}
        />
      </div>

      {isPhotoFocused && !isRevealed && (
        <p className="c-develop__hint">Shake to reveal</p>
      )}

      {isPhotoFocused && isRevealed && (
        <DevelopControls
          isLastTirage={isLastTirage}
          onChangePhoto={onChangePhoto}
          onShare={onShare}
          onShowMyPhotos={onShowMyPhotos}
          onTakeNewPhoto={onTakeNewPhoto}
        />
      )}
    </div>
  );
}
