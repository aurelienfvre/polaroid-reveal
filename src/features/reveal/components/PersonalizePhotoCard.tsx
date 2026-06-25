import {
  useEffect,
  useRef,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { getFilterCss, getFontCss, getTextureOpacity } from "@/features/reveal/lib/photoFilters";
import type { CanvasPhoto, PhotoCustomization } from "@/features/reveal/types/revealTypes";

type Props = {
  customization: PhotoCustomization;
  isActive: boolean;
  isTextActive?: boolean;
  onTextChange?: (text: string) => void;
  photo: CanvasPhoto;
  showSwipeHelper?: boolean;
  stackStyle?: CSSProperties;
};

export function PersonalizePhotoCard({
  customization,
  isActive,
  isTextActive = false,
  onTextChange,
  photo,
  showSwipeHelper = false,
  stackStyle,
}: Props) {
  const editorRef = useRef<HTMLSpanElement>(null);
  const imageStyle = {
    filter: getFilterCss(customization.filterId),
    backgroundImage: `url("${photo.imageUrl}")`,
  } as CSSProperties;
  const grainStyle = {
    opacity: getTextureOpacity(
      customization.textureId,
      customization.textureIntensity,
    ),
  } as CSSProperties;
  const captionStyle = {
    fontFamily: getFontCss(customization.fontId),
  } as CSSProperties;

  const className = [
    "c-perso-card",
    isActive ? "c-perso-card--is-active" : "",
    isActive && isTextActive ? "c-perso-card--is-text-editable" : "",
  ].filter(Boolean).join(" ");
  const canEditText = isActive && isTextActive;

  useEffect(() => {
    const editor = editorRef.current;

    if (!canEditText || !editor || editor.textContent === customization.text) {
      return;
    }

    editor.textContent = customization.text;
  }, [canEditText, customization.text]);

  const focusEditorAtEnd = () => {
    const editor = editorRef.current;

    if (!canEditText || !editor) {
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleCaptionInput = (event: FormEvent<HTMLSpanElement>) => {
    let nextText = event.currentTarget.textContent ?? "";
    nextText = nextText.replace(/\s+/g, " ").slice(0, 28);

    if (event.currentTarget.textContent !== nextText) {
      event.currentTarget.textContent = nextText;
      focusEditorAtEnd();
    }

    onTextChange?.(nextText);
  };

  const handleCaptionKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (canEditText && target.closest(".c-perso-card__caption")) {
      event.stopPropagation();
    }
  };

  return (
    <div className={className} style={stackStyle} aria-hidden={!isActive}>
      <div
        className="c-perso-card__paper"
        onClick={focusEditorAtEnd}
        onPointerDown={handlePointerDown}
      >
        <div className="c-perso-card__image" style={imageStyle}>
          <span
            className={[
              "c-perso-card__grain",
              `c-perso-card__grain--${customization.textureId}`,
            ].join(" ")}
            style={grainStyle}
          />
        </div>
        <div className="c-perso-card__caption" style={captionStyle}>
          {canEditText ? (
            <span
              aria-label="Texte du Polaroid"
              className="c-perso-card__caption-editor"
              contentEditable
              data-placeholder="Your text"
              onClick={(event) => event.stopPropagation()}
              onInput={handleCaptionInput}
              onKeyDown={handleCaptionKeyDown}
              onPointerDown={(event) => event.stopPropagation()}
              ref={editorRef}
              role="textbox"
              suppressContentEditableWarning
            />
          ) : (
            customization.text
          )}
        </div>
        {showSwipeHelper && (
          <span
            className="c-polaroid-card__helper c-polaroid-card__helper--swipe"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
