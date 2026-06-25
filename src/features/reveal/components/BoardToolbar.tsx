import { useState } from "react";
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
  BOARD_TAPES,
  PEN_STROKES,
} from "@/features/reveal/lib/boardData";
import type { BoardShape, BoardTool } from "@/features/reveal/types/revealTypes";

type Props = {
  activeTool: BoardTool | null;
  activeColor: string;
  backgroundId: string;
  onToolToggle: (tool: BoardTool) => void;
  onColorChange: (color: string) => void;
  onBackgroundChange: (id: string) => void;
  onAddTape: (src: string) => void;
  onAddText: () => void;
  onAddShape: (shape: BoardShape) => void;
  onAddSticker: (src: string) => void;
};

export function BoardToolbar({
  activeTool,
  activeColor,
  backgroundId,
  onToolToggle,
  onColorChange,
  onBackgroundChange,
  onAddTape,
  onAddText,
  onAddShape,
  onAddSticker,
}: Props) {
  // Sub-view of the "+" popover: the menu itself, or a drilled-in picker.
  const [addView, setAddView] = useState<"menu" | "background" | "shape">("menu");
  const [penStroke, setPenStroke] = useState<number>(PEN_STROKES[1]);
  const [penOpacity, setPenOpacity] = useState(100);

  const handleAddToggle = () => {
    setAddView("menu");
    onToolToggle("add");
  };

  return (
    <>
      {activeTool === "tape" && (
        <ToolPanel>
          {BOARD_TAPES.map((src) => (
            <button
              key={src}
              type="button"
              className="c-board-toolbar__swatch c-board-toolbar__swatch--tape"
              onClick={() => onAddTape(src)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} />
            </button>
          ))}
        </ToolPanel>
      )}

      {activeTool === "pen" && (
        <ToolPanel className="c-board-toolbar__panel--pen">
          <div className="c-board-toolbar__strokes">
            {PEN_STROKES.map((stroke) => (
              <button
                key={stroke}
                type="button"
                className={[
                  "c-board-toolbar__stroke",
                  penStroke === stroke ? "is-active" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setPenStroke(stroke)}
              >
                <span style={{ width: stroke, height: stroke }} />
              </button>
            ))}
          </div>
          <input
            className="c-board-toolbar__opacity"
            type="range"
            min={0}
            max={100}
            value={penOpacity}
            aria-label="Opacite"
            onChange={(event) => setPenOpacity(Number(event.target.value))}
          />
        </ToolPanel>
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

      {activeTool === "sticker" && (
        <StickerSheet onPick={onAddSticker} onClose={() => onToolToggle("sticker")} />
      )}

      <div className="c-board-toolbar">
        <div className="c-board-toolbar__tools">
          <ToolButton active={activeTool === "tape"} onClick={() => onToolToggle("tape")} label="Scotch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/scotch_photo.png" alt="" draggable={false} />
          </ToolButton>
          <ToolButton active={activeTool === "sticker"} onClick={() => onToolToggle("sticker")} label="Sticker">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/sticker_photo.png" alt="" draggable={false} />
          </ToolButton>
          <ToolButton active={false} onClick={onAddText} label="Texte">
            <span className="c-board-toolbar__glyph">Aa</span>
          </ToolButton>
          <ToolButton active={activeTool === "pen"} onClick={() => onToolToggle("pen")} label="Stylo">
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
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={["c-board-toolbar__tool", active ? "is-active" : ""].filter(Boolean).join(" ")}
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

function ToolPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["c-board-toolbar__panel", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
