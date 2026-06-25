"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type PointerEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { PersonalizePhotoCard } from "@/features/reveal/components/PersonalizePhotoCard";
import {
  CheckIcon,
  FilterIcon,
  TextIcon,
  TextureIcon,
} from "@/features/reveal/components/PersonalizeIcons";
import { usePhotoPersonalization } from "@/features/reveal/hooks/usePhotoPersonalization";
import {
  PHOTO_FILTERS,
  PHOTO_FONTS,
  PHOTO_TEXTURES,
  getFilterCss,
} from "@/features/reveal/lib/photoFilters";
import type {
  CanvasPhoto,
  PhotoCustomization,
} from "@/features/reveal/types/revealTypes";

const SWIPE_THRESHOLD = 56;

type Props = {
  customizations: Record<string, PhotoCustomization>;
  onCustomizationsChange: Dispatch<SetStateAction<Record<string, PhotoCustomization>>>;
  onValidate: () => void;
  photos: CanvasPhoto[];
};

export function PersonalizeStage({
  customizations,
  onCustomizationsChange,
  onValidate,
  photos,
}: Props) {
  const perso = usePhotoPersonalization(photos, customizations, onCustomizationsChange);
  const [dragX, setDragX] = useState(0);
  const dragRef = useRef<{ startX: number; active: boolean }>({ startX: 0, active: false });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startX: event.clientX, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) {
      return;
    }
    setDragX(event.clientX - dragRef.current.startX);
  };

  const handlePointerUp = () => {
    if (!dragRef.current.active) {
      return;
    }
    const delta = dragX;
    dragRef.current.active = false;
    setDragX(0);

    if (delta > SWIPE_THRESHOLD) {
      perso.goToPhoto(-1);
    } else if (delta < -SWIPE_THRESHOLD) {
      perso.goToPhoto(1);
    }
  };

  return (
    <section className="c-perso">
      <h1 className="c-perso__title">Personnalisation photo</h1>

      <div
        className="c-perso__stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {photos.map((photo, index) => {
          const rel = index - perso.activeIndex;
          const abs = Math.abs(rel);
          const isActive = rel === 0;
          const dir = rel === 0 ? 0 : rel > 0 ? 1 : -1;
          const stackStyle: CSSProperties = {
            zIndex: 30 - abs,
            transform: [
              `translateX(${(isActive ? dragX : 0) + dir * (18 + abs * 6)}px)`,
              `translateY(${abs * 10}px)`,
              `rotate(${isActive ? 0 : dir * (5 + abs * 4)}deg)`,
              `scale(${isActive ? 1 : 1 - abs * 0.05})`,
            ].join(" "),
            opacity: abs > 2 ? 0 : 1,
          };

          return (
            <PersonalizePhotoCard
              customization={perso.getCustomization(photo.id)}
              isActive={isActive}
              key={photo.id}
              photo={photo}
              stackStyle={stackStyle}
            />
          );
        })}
      </div>

      {perso.activeTab === "filter" && perso.activePhoto && (
        <div className="c-perso__panel c-perso__panel--filter">
          <span className="c-perso__panel-label">
            {PHOTO_FILTERS.find((f) => f.id === perso.activeCustomization.filterId)?.label}
          </span>
          <div className="c-perso__filters">
            {PHOTO_FILTERS.map((filter) => (
              <button
                className={[
                  "c-perso__filter",
                  perso.activeCustomization.filterId === filter.id ? "is-selected" : "",
                ].filter(Boolean).join(" ")}
                key={filter.id}
                type="button"
                onClick={() => perso.updateActive({ filterId: filter.id })}
              >
                <span
                  className="c-perso__filter-thumb"
                  style={{
                    backgroundImage: `url("${perso.activePhoto!.imageUrl}")`,
                    filter: getFilterCss(filter.id),
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {perso.activeTab === "text" && (
        <div className="c-perso__panel c-perso__panel--text">
          <input
            className="c-perso__text-input"
            type="text"
            maxLength={28}
            placeholder="Ajoute une legende…"
            value={perso.activeCustomization.text}
            onChange={(event) => perso.updateActive({ text: event.target.value })}
          />
          <div className="c-perso__fonts">
            {PHOTO_FONTS.map((font) => (
              <button
                className={[
                  "c-perso__font",
                  perso.activeCustomization.fontId === font.id ? "is-selected" : "",
                ].filter(Boolean).join(" ")}
                key={font.id}
                type="button"
                style={{ fontFamily: `var(${font.cssVar}), cursive` }}
                onClick={() => perso.updateActive({ fontId: font.id })}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {perso.activeTab === "texture" && (
        <div className="c-perso__panel c-perso__panel--texture">
          {PHOTO_TEXTURES.map((texture) => (
            <button
              className={[
                "c-perso__texture",
                perso.activeCustomization.textureId === texture.id ? "is-selected" : "",
              ].filter(Boolean).join(" ")}
              key={texture.id}
              type="button"
              onClick={() => perso.updateActive({ textureId: texture.id })}
            >
              {texture.label}
            </button>
          ))}
        </div>
      )}

      <div className="c-perso__toolbar">
        <div className="c-perso__tools">
          <PersoTool active={perso.activeTab === "filter"} label="Filter" onClick={() => perso.toggleTab("filter")}>
            <FilterIcon />
          </PersoTool>
          <PersoTool active={perso.activeTab === "text"} label="Text" onClick={() => perso.toggleTab("text")}>
            <TextIcon />
          </PersoTool>
          <PersoTool active={perso.activeTab === "texture"} label="Texture" onClick={() => perso.toggleTab("texture")}>
            <TextureIcon />
          </PersoTool>
        </div>
        <button className="c-perso__validate" type="button" onClick={onValidate}>
          <CheckIcon />
          VALIDATE
        </button>
      </div>
    </section>
  );
}

function PersoTool({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={["c-perso__tool", active ? "is-active" : ""].filter(Boolean).join(" ")}
      type="button"
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
