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
import { PersonalizeFilterPanel } from "@/features/reveal/components/PersonalizeFilterPanel";
import { PersonalizeTexturePanel } from "@/features/reveal/components/PersonalizeTexturePanel";
import {
  CheckIcon,
  FilterIcon,
  TextIcon,
  TextureIcon,
} from "@/features/reveal/components/PersonalizeIcons";
import { usePhotoPersonalization } from "@/features/reveal/hooks/usePhotoPersonalization";
import { usePersonalizeSwipeHint } from "@/features/reveal/hooks/usePersonalizeSwipeHint";
import {
  PHOTO_FONTS,
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
  const swipeHint = usePersonalizeSwipeHint(photos.length);
  const [dragX, setDragX] = useState(0);
  const dragRef = useRef<{ startX: number; active: boolean }>({ startX: 0, active: false });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeHint.registerSwipeActivity();
    dragRef.current = { startX: event.clientX, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) {
      return;
    }
    swipeHint.registerSwipeActivity();
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

  const className = [
    "c-perso",
    perso.activeTab ? `c-perso--is-${perso.activeTab}` : "",
  ].filter(Boolean).join(" ");

  const updateActive = (patch: Partial<PhotoCustomization>) => {
    swipeHint.registerSwipeActivity();
    perso.updateActive(patch);
  };

  const toggleTool = (tab: Parameters<typeof perso.toggleTab>[0]) => {
    swipeHint.registerSwipeActivity();
    perso.toggleTab(tab);
  };

  return (
    <section className={className}>
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
              isTextActive={perso.activeTab === "text"}
              key={photo.id}
              onTextChange={(text) => updateActive({ text })}
              photo={photo}
              showSwipeHelper={isActive && !perso.activeTab && swipeHint.showSwipeHint}
              stackStyle={stackStyle}
            />
          );
        })}
      </div>

      {perso.activeTab === "filter" && perso.activePhoto && (
        <PersonalizeFilterPanel
          customization={perso.activeCustomization}
          imageUrl={perso.activePhoto.imageUrl}
          onChange={(filterId) => updateActive({ filterId })}
        />
      )}

      {perso.activeTab === "text" && (
        <div className="c-perso__panel c-perso__panel--text">
          <div className="c-perso__fonts">
            {PHOTO_FONTS.map((font) => (
              <button
                className={[
                  "c-perso__font",
                  perso.activeCustomization.fontId === font.id ? "is-selected" : "",
                ].filter(Boolean).join(" ")}
                key={font.id}
                type="button"
                aria-label={font.label}
                style={{ fontFamily: font.css }}
                onClick={() => updateActive({ fontId: font.id })}
              >
                Aa
              </button>
            ))}
          </div>
        </div>
      )}

      {perso.activeTab === "texture" && perso.activePhoto && (
        <PersonalizeTexturePanel
          customization={perso.activeCustomization}
          imageUrl={perso.activePhoto.imageUrl}
          onChange={updateActive}
        />
      )}

      <div className="c-perso__toolbar">
        <span className="c-perso__toolbar-stripe" aria-hidden="true" />
        <div className="c-perso__tools">
          <PersoTool active={perso.activeTab === "filter"} label="Filter" onClick={() => toggleTool("filter")}>
            <FilterIcon />
          </PersoTool>
          <PersoTool active={perso.activeTab === "text"} label="Text" onClick={() => toggleTool("text")}>
            <TextIcon />
          </PersoTool>
          <PersoTool active={perso.activeTab === "texture"} label="Texture" onClick={() => toggleTool("texture")}>
            <TextureIcon />
          </PersoTool>
        </div>
        <span className="c-perso__separator" aria-hidden="true" />
        <button className="c-perso__validate" type="button" onClick={onValidate}>
          <CheckIcon />
          GO TO BOARD
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
