"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { SelectFrameIcon } from "@/features/reveal/components/PersonalizeIcons";
import {
  PHOTO_TEXTURES,
  getTextureDefaultIntensity,
  getTextureOpacity,
} from "@/features/reveal/lib/photoFilters";
import type {
  PhotoCustomization,
  PhotoTextureId,
} from "@/features/reveal/types/revealTypes";

const ITEM_SIZE = 54;
const STEP = 76;
const SWIPE_THRESHOLD = 34;
const CLICK_DRIFT = 6;

type Props = {
  customization: PhotoCustomization;
  imageUrl: string;
  onChange: (patch: Partial<PhotoCustomization>) => void;
};

export function PersonalizeTexturePanel({
  customization,
  imageUrl,
  onChange,
}: Props) {
  const [dragX, setDragX] = useState(0);
  const dragRef = useRef({ active: false, deltaX: 0, startX: 0 });
  const activeIndex = getActiveTextureIndex(customization.textureId);
  const selectedTexture = PHOTO_TEXTURES[activeIndex];
  const trackX = -activeIndex * STEP - ITEM_SIZE / 2 + dragX;

  const selectTexture = (textureId: PhotoTextureId) => {
    onChange({
      textureId,
      textureIntensity:
        textureId === "none"
          ? customization.textureIntensity
          : getTextureDefaultIntensity(textureId),
    });
  };

  const selectByDirection = (direction: 1 | -1) => {
    const nextIndex =
      (activeIndex + direction + PHOTO_TEXTURES.length) % PHOTO_TEXTURES.length;
    selectTexture(PHOTO_TEXTURES[nextIndex].id);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, deltaX: 0, startX: event.clientX };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) {
      return;
    }

    const delta = event.clientX - dragRef.current.startX;
    dragRef.current.deltaX = delta;
    setDragX(delta);
  };

  const handlePointerUp = () => {
    if (!dragRef.current.active) {
      return;
    }

    dragRef.current.active = false;
    const delta = dragRef.current.deltaX;
    setDragX(0);

    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      selectByDirection(delta > 0 ? -1 : 1);
    }
  };

  const trackStyle = {
    transform: `translate3d(${trackX}px, 0, 0)`,
  } as CSSProperties;

  return (
    <div className="c-perso__panel c-perso__panel--texture">
      <span className="c-perso__panel-label">{selectedTexture.label}</span>
      <div
        className="c-perso__textures"
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <SelectFrameIcon className="c-perso__texture-frame" />
        <div className="c-perso__texture-track" style={trackStyle}>
          {PHOTO_TEXTURES.map((texture) => (
            <button
              aria-pressed={customization.textureId === texture.id}
              className={[
                "c-perso__texture",
                `c-perso__texture--${texture.id}`,
                customization.textureId === texture.id ? "is-selected" : "",
              ].filter(Boolean).join(" ")}
              key={texture.id}
              type="button"
              onClick={() => {
                if (Math.abs(dragRef.current.deltaX) <= CLICK_DRIFT) {
                  selectTexture(texture.id);
                }
              }}
            >
              <span
                className="c-perso__texture-thumb"
                style={{
                  backgroundImage: `url("${imageUrl}")`,
                  "--texture-opacity": getTextureOpacity(
                    texture.id,
                    customization.textureIntensity,
                  ),
                } as CSSProperties}
              />
            </button>
          ))}
        </div>
      </div>
      <input
        aria-label="Intensite de la texture"
        className="c-perso__texture-range"
        disabled={customization.textureId === "none"}
        max="1"
        min="0.05"
        onChange={(event) => onChange({ textureIntensity: Number(event.target.value) })}
        step="0.01"
        type="range"
        value={customization.textureIntensity}
      />
    </div>
  );
}

function getActiveTextureIndex(textureId: PhotoTextureId) {
  const index = PHOTO_TEXTURES.findIndex((texture) => texture.id === textureId);
  return Math.max(index, 0);
}
