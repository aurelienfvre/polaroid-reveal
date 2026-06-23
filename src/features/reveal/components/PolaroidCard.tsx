import type { RefObject } from "react";
import type { Memory } from "@/features/reveal/data/memories";
import type { TiltStyle } from "@/features/reveal/types/revealTypes";

type Props = {
  isActive: boolean;
  isFocused: boolean;
  isRevealed: boolean;
  memory: Memory;
  motionRef?: RefObject<HTMLDivElement | null>;
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
  const cardClassName = [
    "c-polaroid-card",
    `c-polaroid-card--tone-${memory.tone}`,
    isActive ? "c-polaroid-card--is-active" : "c-polaroid-card--is-parked",
    isActive && revealProgress > 0 ? "c-polaroid-card--is-developing" : "",
    isFocused ? "c-polaroid-card--is-focused" : "",
    isActive && isRevealed ? "c-polaroid-card--is-revealed" : "",
  ].filter(Boolean).join(" ");

  return (
    <article className={cardClassName} onClick={onSelect}>
      <div className="c-polaroid-card__paper" ref={motionRef} style={tiltStyle}>
        <div className="c-polaroid-card__image">
          <span className="c-polaroid-card__light-leak" />
          <span className="c-polaroid-card__grain" />
        </div>
        <div className="c-polaroid-card__body">
          <p className="c-polaroid-card__date">
            {memory.dateLabel} - {memory.location}
          </p>
          <h2 className="c-polaroid-card__title">{memory.title}</h2>
          <p className="c-polaroid-card__caption">
            {isActive && isRevealed
              ? memory.caption
              : revealProgress > 0
                ? "Continue de remuer franchement, l'image remonte doucement."
                : "Clique la photo, puis remue-la pour lancer le developpement."}
          </p>
        </div>
      </div>
    </article>
  );
}
