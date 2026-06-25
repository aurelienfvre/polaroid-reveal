import {
  getFilterCss,
  getFontCss,
  getTextureOpacity,
} from "@/features/reveal/lib/photoFilters";
import type { PhotoCustomization } from "@/features/reveal/types/revealTypes";

type Props = {
  imageUrl?: string;
  customization?: PhotoCustomization;
};

/** The shared full-size polaroid print — used both for placed board items and
 * for the prints waiting in the tray, so they are visually identical. */
export function BoardPhoto({ imageUrl, customization }: Props) {
  const grainOpacity = customization
    ? getTextureOpacity(customization.textureId, customization.textureIntensity)
    : 0;
  const caption = customization?.text?.trim();

  return (
    <div className="c-board-photo">
      <span
        className="c-board-photo__image"
        style={{
          backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
          filter: customization ? getFilterCss(customization.filterId) : undefined,
        }}
      >
        {grainOpacity > 0 && (
          <span
            className={`c-board-photo__grain c-board-photo__grain--${customization?.textureId ?? "none"}`}
            style={{ opacity: grainOpacity }}
          />
        )}
      </span>
      {caption ? (
        <span
          className="c-board-photo__caption"
          style={{ fontFamily: customization ? getFontCss(customization.fontId) : undefined }}
        >
          {caption}
        </span>
      ) : (
        <span className="c-board-photo__caption c-board-photo__caption--empty" aria-hidden="true" />
      )}
    </div>
  );
}
