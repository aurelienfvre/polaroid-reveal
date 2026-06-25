import type { CSSProperties } from "react";
import { getFilterCss, getFontVar, getTextureOpacity } from "@/features/reveal/lib/photoFilters";
import type { CanvasPhoto, PhotoCustomization } from "@/features/reveal/types/revealTypes";

type Props = {
  customization: PhotoCustomization;
  isActive: boolean;
  photo: CanvasPhoto;
  stackStyle?: CSSProperties;
};

export function PersonalizePhotoCard({
  customization,
  isActive,
  photo,
  stackStyle,
}: Props) {
  const imageStyle = {
    filter: getFilterCss(customization.filterId),
    backgroundImage: `url("${photo.imageUrl}")`,
  } as CSSProperties;
  const grainStyle = { opacity: getTextureOpacity(customization.textureId) } as CSSProperties;
  const captionStyle = {
    fontFamily: `var(${getFontVar(customization.fontId)}), cursive`,
  } as CSSProperties;

  const className = [
    "c-perso-card",
    isActive ? "c-perso-card--is-active" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={className} style={stackStyle} aria-hidden={!isActive}>
      <div className="c-perso-card__paper">
        <div className="c-perso-card__image" style={imageStyle}>
          <span className="c-perso-card__grain" style={grainStyle} />
        </div>
        <div className="c-perso-card__caption" style={captionStyle}>
          {customization.text}
        </div>
      </div>
    </div>
  );
}
