import type { RefObject } from "react";
import { DevelopControls } from "@/features/reveal/components/DevelopControls";
import { SkipIcon } from "@/features/reveal/components/PersonalizeIcons";
import { PolaroidCard } from "@/features/reveal/components/PolaroidCard";
import type { Memory } from "@/features/reveal/data/memories";
import type { TiltStyle } from "@/features/reveal/types/revealTypes";

type Props = {
  activeMemory: Memory;
  changesRemaining: number;
  isLastTirage: boolean;
  isPhotoFocused: boolean;
  isRevealed: boolean;
  motionRef: RefObject<HTMLButtonElement | null>;
  onChangePhoto: () => void;
  onPolaroidSelect: () => void;
  onShare: () => void;
  onShowMyPhotos: () => void;
  onSkipReveal: () => void;
  onTakeNewPhoto: () => void;
  tiltStyle: TiltStyle;
};

export function DevelopStage({
  activeMemory,
  changesRemaining,
  isLastTirage,
  isPhotoFocused,
  isRevealed,
  motionRef,
  onChangePhoto,
  onPolaroidSelect,
  onShare,
  onShowMyPhotos,
  onSkipReveal,
  onTakeNewPhoto,
  tiltStyle,
}: Props) {
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
          showHelper={!isPhotoFocused && !isRevealed}
          tiltStyle={tiltStyle}
        />
      </div>

      {isPhotoFocused && !isRevealed && (
        <>
          <p className="c-develop__hint">Shake to reveal</p>
          <button className="c-develop__skip" type="button" onClick={onSkipReveal}>
            skip
            <SkipIcon />
          </button>
        </>
      )}

      {isPhotoFocused && isRevealed && (
        <DevelopControls
          changesRemaining={changesRemaining}
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
