import type { RefObject } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import { PolaroidCard } from "@/features/reveal/components/PolaroidCard";
import type { TiltStyle } from "@/features/reveal/types/revealTypes";

type Props = {
  activeIndex: number;
  isPhotoFocused: boolean;
  isRevealed: boolean;
  motionRef: RefObject<HTMLButtonElement | null>;
  onPolaroidSelect: () => void;
  revealProgress: number;
  tiltStyle: TiltStyle;
};

export function DevelopStage({
  activeIndex,
  isPhotoFocused,
  isRevealed,
  motionRef,
  onPolaroidSelect,
  revealProgress,
  tiltStyle,
}: Props) {
  const activeMemory = MEMORIES[activeIndex];
  const stackClassName = [
    "c-polaroid-stack",
    isPhotoFocused ? "c-polaroid-stack--is-focused" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={stackClassName} aria-live="polite">
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
  );
}
