import { useRef, useState, type PointerEvent } from "react";
import {
  BackgroundIcon,
  PlusIcon,
  ShapesIcon,
  StickerIcon,
} from "@/features/reveal/components/BoardIcons";
import { StickerSheet } from "@/features/reveal/components/StickerSheet";
import {
  BOARD_BACKGROUNDS,
  BOARD_COLORS,
  PEN_STROKE_SVGS,
  SCOTCH_PIECES,
  SCOTCH_TEXTURES,
} from "@/features/reveal/lib/boardData";
import { PHOTO_FONTS } from "@/features/reveal/lib/photoFilters";
import type { BoardShape, BoardTool, PhotoFontId } from "@/features/reveal/types/revealTypes";

type Props = {
  activeTool: BoardTool | null;
  activeColor: string;
  backgroundId: string;
  isStamping: boolean;
  textFont: PhotoFontId;
  onToolToggle: (tool: BoardTool) => void;
  onColorChange: (color: string) => void;
  onBackgroundChange: (id: string) => void;
  onAddTape: (src: string, scale: number) => void;
  onTextFontChange: (id: PhotoFontId) => void;
  onAddShape: (shape: BoardShape) => void;
  onAddSticker: (src: string) => void;
  onClearStamp: () => void;
};

export function BoardToolbar({
  activeTool,
  activeColor,
  backgroundId,
  isStamping,
  textFont,
  onToolToggle,
  onColorChange,
  onBackgroundChange,
  onAddTape,
  onTextFontChange,
  onAddShape,
  onAddSticker,
  onClearStamp,
}: Props) {
  // Sub-view of the "+" popover: the menu itself, or a drilled-in picker.
  const [addView, setAddView] = useState<"menu" | "background" | "shape">("menu");
  const [penStroke, setPenStroke] = useState(1);
  const [penOpacity, setPenOpacity] = useState(100);
  // Scotch texture is a purely visual selection (doesn't change what's placed).
  const [scotchTexture, setScotchTexture] = useState(0);

  const handleAddToggle = () => {
    setAddView("menu");
    onToolToggle("add");
  };

  return (
    <>
      {activeTool === "tape" && (
        <div className="c-board-toolbar__panel c-board-toolbar__panel--scotch">
          {/* Left: the two tape sizes you actually drop on the board. */}
          <div className="c-board-toolbar__tapes">
            {SCOTCH_PIECES.map((piece) => (
              <button
                key={piece.id}
                type="button"
                className={`c-board-toolbar__tape c-board-toolbar__tape--${piece.id}`}
                onClick={() => onAddTape(piece.src, piece.scale)}
                aria-label={`Scotch ${piece.id}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={piece.src} alt="" draggable={false} />
              </button>
            ))}
          </div>

          <div className="c-board-toolbar__scotch-right">
            <span className="c-board-toolbar__scotch-sep" aria-hidden="true" />
            {/* Texture is a visual-only selection (doesn't change what's placed). */}
            <div className="c-board-toolbar__textures">
              {SCOTCH_TEXTURES.map((texture, index) => (
                <button
                  key={texture.id}
                  type="button"
                  className={[
                    "c-board-toolbar__texture",
                    scotchTexture === index ? "is-active" : "",
                  ].filter(Boolean).join(" ")}
                  aria-label={texture.id}
                  onClick={() => setScotchTexture(index)}
                >
                  {texture.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={texture.value} alt="" draggable={false} />
                  ) : (
                    <span className="c-board-toolbar__texture-fill" style={{ background: texture.value }} />
                  )}
                  {scotchTexture === index && <SelectFrameIcon />}
                </button>
              ))}
              {/* Adds a texture — placeholder, does nothing yet. */}
              <button
                type="button"
                className="c-board-toolbar__texture c-board-toolbar__texture--add"
                aria-label="Ajouter une texture"
                onClick={() => undefined}
              >
                <PlusIcon className="c-board-toolbar__square-icon" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTool === "text" && (
        <div className="c-board-toolbar__panel c-board-toolbar__panel--fonts">
          {PHOTO_FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              className={[
                "c-board-toolbar__font",
                textFont === font.id ? "is-active" : "",
              ].filter(Boolean).join(" ")}
              style={{ fontFamily: font.css }}
              aria-label={font.label}
              onClick={() => onTextFontChange(font.id)}
            >
              Aa
            </button>
          ))}
        </div>
      )}

      {activeTool === "pen" && (
        <div className="c-board-toolbar__panel c-board-toolbar__panel--pen">
          <div className="c-board-toolbar__strokes">
            {PEN_STROKE_SVGS.map((stroke, index) => (
              <button
                key={stroke.strokeWidth}
                type="button"
                className={[
                  "c-board-toolbar__stroke",
                  penStroke === index ? "is-active" : "",
                ].filter(Boolean).join(" ")}
                aria-label={`Epaisseur ${stroke.strokeWidth}`}
                onClick={() => setPenStroke(index)}
              >
                <svg width={stroke.w} height={stroke.h} viewBox={stroke.viewBox} fill="none">
                  <path d={stroke.d} stroke={activeColor} strokeWidth={stroke.strokeWidth} />
                </svg>
                {penStroke === index && <SelectFrameIcon />}
              </button>
            ))}
          </div>
          <PenOpacitySlider value={penOpacity} onChange={setPenOpacity} />
        </div>
      )}

      {activeTool === "color" && (
        <div className="c-board-toolbar__palette">
          {BOARD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={[
                "c-board-toolbar__color",
                activeColor === color ? "is-active" : "",
              ].filter(Boolean).join(" ")}
              style={{ background: color }}
              aria-label={color}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
      )}

      {activeTool === "add" && (
        <div className="c-board-toolbar__add">
          {addView === "menu" && (
            <>
              <button type="button" className="c-board-toolbar__add-row" onClick={() => setAddView("background")}>
                <BackgroundIcon className="c-board-toolbar__add-icon" />
                Change background
              </button>
              <button type="button" className="c-board-toolbar__add-row" onClick={() => setAddView("shape")}>
                <ShapesIcon className="c-board-toolbar__add-icon" />
                Add shape
              </button>
              <button type="button" className="c-board-toolbar__add-row" onClick={() => onToolToggle("sticker")}>
                <StickerIcon className="c-board-toolbar__add-icon" />
                Add stickers
              </button>
            </>
          )}

          {addView === "background" && (
            <div className="c-board-toolbar__bg-grid">
              {BOARD_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  className={[
                    "c-board-toolbar__bg",
                    backgroundId === bg.id ? "is-active" : "",
                  ].filter(Boolean).join(" ")}
                  style={{ background: bg.css }}
                  aria-label={bg.label}
                  onClick={() => onBackgroundChange(bg.id)}
                />
              ))}
            </div>
          )}

          {addView === "shape" && (
            <div className="c-board-toolbar__shapes">
              <button type="button" className="c-board-toolbar__shape" onClick={() => onAddShape("rect")}>
                <span className="c-board-toolbar__shape-preview" />
              </button>
              <button type="button" className="c-board-toolbar__shape" onClick={() => onAddShape("circle")}>
                <span className="c-board-toolbar__shape-preview c-board-toolbar__shape-preview--circle" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeTool === "sticker" && !isStamping && (
        <StickerSheet onPick={onAddSticker} onClose={() => onToolToggle("sticker")} />
      )}

      <div className="c-board-toolbar">
        <div className="c-board-toolbar__tools">
          <ToolButton
            active={activeTool === "tape"}
            variant="scotch"
            onClick={() => onToolToggle("tape")}
            label="Scotch"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/scotch_photo.png" alt="" draggable={false} />
          </ToolButton>
          <ToolButton
            active={activeTool === "sticker" || isStamping}
            variant="sticker"
            onClick={() => (isStamping ? onClearStamp() : onToolToggle("sticker"))}
            label="Sticker"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/sticker_photo.png" alt="" draggable={false} />
          </ToolButton>
          <ToolButton
            active={activeTool === "text"}
            variant="text"
            onClick={() => onToolToggle("text")}
            label="Texte"
          >
            <span className="c-board-toolbar__glyph">Aa</span>
          </ToolButton>
          <ToolButton
            active={activeTool === "pen"}
            variant="pen"
            onClick={() => onToolToggle("pen")}
            label="Stylo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/pen.png" alt="" draggable={false} />
          </ToolButton>
        </div>

        <div className="c-board-toolbar__squares">
          <button
            type="button"
            className={[
              "c-board-toolbar__square c-board-toolbar__square--color",
              activeTool === "color" ? "is-active" : "",
            ].filter(Boolean).join(" ")}
            aria-label="Couleur"
            onClick={() => onToolToggle("color")}
          >
            <span className="c-board-toolbar__color-dot" style={{ background: activeColor }} />
            <ColorFrameIcon />
          </button>
          <button
            type="button"
            className={[
              "c-board-toolbar__square c-board-toolbar__square--add",
              activeTool === "add" ? "is-active" : "",
            ].filter(Boolean).join(" ")}
            aria-label="Ajouter"
            onClick={handleAddToggle}
          >
            <PlusIcon className="c-board-toolbar__square-icon" />
          </button>
        </div>
      </div>
    </>
  );
}

function ToolButton({
  active,
  children,
  label,
  onClick,
  variant,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: "scotch" | "sticker" | "text" | "pen";
}) {
  return (
    <button
      type="button"
      className={[
        "c-board-toolbar__tool",
        `c-board-toolbar__tool--${variant}`,
        active ? "is-active" : "",
      ].filter(Boolean).join(" ")}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Rainbow corner-bracket "select" frame used by the colour picker button. */
function ColorFrameIcon() {
  return (
    <svg
      className="c-board-toolbar__color-frame"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M33 9V5C33 2.79086 31.2091 1 29 1H5C2.79086 1 1 2.79086 1 5V9M33 25V29C33 31.2091 31.2091 33 29 33H5C2.79086 33 1 31.2091 1 29V25"
        stroke="url(#board-color-frame)"
        strokeWidth="2"
      />
      <defs>
        <linearGradient
          id="board-color-frame"
          x1="2.44392"
          y1="10.3551"
          x2="31.5561"
          y2="23.6449"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00B13F" />
          <stop offset="0.2" stopColor="#00A2E0" />
          <stop offset="0.4" stopColor="#C43B89" />
          <stop offset="0.6" stopColor="#DA281C" />
          <stop offset="0.8" stopColor="#FF8203" />
          <stop offset="1" stopColor="#FFB500" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Neutral corner-bracket "select" frame around the active scotch texture. */
function SelectFrameIcon() {
  return (
    <svg
      className="c-board-toolbar__select-frame"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M33 9V5C33 2.79086 31.2091 1 29 1H5C2.79086 1 1 2.79086 1 5V9M33 25V29C33 31.2091 31.2091 33 29 33H5C2.79086 33 1 31.2091 1 29V25"
        stroke="#ffffff"
        strokeWidth="2"
      />
    </svg>
  );
}

/** The black corner-bracket "select" handle used by the opacity slider. */
function OpacityHandleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 6.5V5C23 2.79086 21.2091 1 19 1H5C2.79086 1 1 2.79086 1 5V6.5M23 17.5V19C23 21.2091 21.2091 23 19 23H5C2.79086 23 1 21.2091 1 19V17.5"
        stroke="#151515"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Custom opacity slider: checkerboard→white track + select-frame handle. */
function PenOpacitySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const update = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const fraction = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    onChange(Math.round(fraction * 100));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    update(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.buttons === 0) {
      return;
    }
    update(event.clientX);
  };

  return (
    <div
      className="c-board-toolbar__opacity"
      ref={trackRef}
      role="slider"
      aria-label="Opacite"
      aria-valuenow={value}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <span className="c-board-toolbar__opacity-track" />
      <span className="c-board-toolbar__opacity-handle" style={{ left: `${value}%` }}>
        <OpacityHandleIcon />
      </span>
    </div>
  );
}

