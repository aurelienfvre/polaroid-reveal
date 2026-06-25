"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { SelectFrameIcon } from "@/features/reveal/components/PersonalizeIcons";
import {
  PHOTO_FILTERS,
  getFilterCss,
} from "@/features/reveal/lib/photoFilters";
import type {
  PhotoCustomization,
  PhotoFilterId,
} from "@/features/reveal/types/revealTypes";

const FILTER_ITEM_SIZE = 54;
const FILTER_STEP = 76;
const SWIPE_THRESHOLD = 34;
const CLICK_DRIFT = 6;

type Props = {
  customization: PhotoCustomization;
  imageUrl: string;
  onChange: (filterId: PhotoFilterId) => void;
};

export function PersonalizeFilterPanel({
  customization,
  imageUrl,
  onChange,
}: Props) {
  const [dragX, setDragX] = useState(0);
  const dragRef = useRef({ active: false, deltaX: 0, startX: 0 });
  const activeIndex = getActiveFilterIndex(customization.filterId);
  const selectedFilter = PHOTO_FILTERS[activeIndex];
  const trackX = -activeIndex * FILTER_STEP - FILTER_ITEM_SIZE / 2 + dragX;

  const selectByDirection = (direction: 1 | -1) => {
    const nextIndex =
      (activeIndex + direction + PHOTO_FILTERS.length) % PHOTO_FILTERS.length;
    onChange(PHOTO_FILTERS[nextIndex].id);
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

    if (Math.abs(delta) < SWIPE_THRESHOLD) {
      return;
    }

    selectByDirection(delta > 0 ? -1 : 1);
  };

  const trackStyle = {
    transform: `translate3d(${trackX}px, 0, 0)`,
  } as CSSProperties;

  return (
    <div className="c-perso__panel c-perso__panel--filter">
      <span className="c-perso__panel-label">{selectedFilter.label}</span>
      <div
        className="c-perso__filters"
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <SelectFrameIcon className="c-perso__filter-frame" />
        <div className="c-perso__filter-track" style={trackStyle}>
          {PHOTO_FILTERS.map((filter) => (
            <button
              aria-pressed={customization.filterId === filter.id}
              className={[
                "c-perso__filter",
                customization.filterId === filter.id ? "is-selected" : "",
              ].filter(Boolean).join(" ")}
              key={filter.id}
              type="button"
              onClick={() => {
                if (Math.abs(dragRef.current.deltaX) > CLICK_DRIFT) {
                  return;
                }

                onChange(filter.id);
              }}
            >
              <span
                className="c-perso__filter-thumb"
                style={{
                  backgroundImage: `url("${imageUrl}")`,
                  filter: getFilterCss(filter.id),
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getActiveFilterIndex(filterId: PhotoFilterId) {
  const index = PHOTO_FILTERS.findIndex((filter) => filter.id === filterId);
  return Math.max(index, 0);
}
