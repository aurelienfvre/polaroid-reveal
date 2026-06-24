import type { RefObject } from "react";
import type { Memory } from "@/features/reveal/data/memories";
import type { TiltStyle } from "@/features/reveal/types/revealTypes";

type Props = {
  isActive: boolean;
  isFocused: boolean;
  isRevealed: boolean;
  memory: Memory;
  motionRef?: RefObject<HTMLButtonElement | null>;
  onSelect: () => void;
  revealProgress: number;
  tiltStyle?: TiltStyle;
};

export function PolaroidCard({
  isActive,
  isFocused,
  isRevealed,
  memory,
  motionRef,
  onSelect,
  revealProgress,
  tiltStyle,
}: Props) {
  const paperStyle = {
    ...tiltStyle,
    "--memory-image-url": `url("${memory.imageUrl}")`,
  } as TiltStyle & { "--memory-image-url": string };
  const cardClassName = [
    "c-polaroid-card",
    `c-polaroid-card--tone-${memory.tone}`,
    isActive ? "c-polaroid-card--is-active" : "c-polaroid-card--is-parked",
    isActive && revealProgress > 0 ? "c-polaroid-card--is-developing" : "",
    isFocused ? "c-polaroid-card--is-focused" : "",
    isActive && isRevealed ? "c-polaroid-card--is-revealed" : "",
  ].filter(Boolean).join(" ");

  return (
    <article className={cardClassName}>
      <button
        aria-label="Prendre le Polaroid"
        className="c-polaroid-card__paper"
        onClick={onSelect}
        ref={motionRef}
        style={paperStyle}
        type="button"
      >
        <div className="c-polaroid-card__image">
          <span className="c-polaroid-card__photo" />
        </div>
      </button>
    </article>
  );
}
