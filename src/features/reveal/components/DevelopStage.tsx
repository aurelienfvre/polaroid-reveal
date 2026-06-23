import type { RefObject } from "react";
import { MEMORIES } from "@/features/reveal/data/memories";
import { PolaroidCard } from "@/features/reveal/components/PolaroidCard";
import type { TiltStyle } from "@/features/reveal/types/revealTypes";

type Props = {
  activeIndex: number;
  isPhotoFocused: boolean;
  isRevealed: boolean;
  motionRef: RefObject<HTMLDivElement | null>;
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
  const stackClassName = [
    "c-polaroid-stack",
    isPhotoFocused ? "c-polaroid-stack--is-focused" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={stackClassName} aria-live="polite">
      {MEMORIES.map((memory, index) => (
        <PolaroidCard
          isActive={index === activeIndex}
          isFocused={index === activeIndex && isPhotoFocused}
          isRevealed={isRevealed}
          key={memory.id}
          memory={memory}
          motionRef={index === activeIndex ? motionRef : undefined}
          onSelect={onPolaroidSelect}
          revealProgress={revealProgress}
          tiltStyle={index === activeIndex ? tiltStyle : undefined}
        />
      ))}
    </div>
  );
}
