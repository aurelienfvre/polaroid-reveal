import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { DEFAULT_CUSTOMIZATION } from "@/features/reveal/lib/photoFilters";
import type {
  CanvasPhoto,
  PersonalizeTab,
  PhotoCustomization,
} from "@/features/reveal/types/revealTypes";

export function usePhotoPersonalization(
  photos: CanvasPhoto[],
  customById: Record<string, PhotoCustomization>,
  setCustomById: Dispatch<SetStateAction<Record<string, PhotoCustomization>>>,
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<PersonalizeTab | null>(null);

  const clampedIndex = photos.length > 0 ? Math.min(activeIndex, photos.length - 1) : 0;
  const activePhoto = photos[clampedIndex];

  const getCustomization = useCallback(
    (id: string): PhotoCustomization => ({
      ...DEFAULT_CUSTOMIZATION,
      ...customById[id],
    }),
    [customById],
  );

  const updateActive = useCallback(
    (patch: Partial<PhotoCustomization>) => {
      if (!activePhoto) {
        return;
      }

      setCustomById((current) => ({
        ...current,
        [activePhoto.id]: {
          ...(current[activePhoto.id] ?? DEFAULT_CUSTOMIZATION),
          ...patch,
        },
      }));
    },
    [activePhoto, setCustomById],
  );

  const goToPhoto = useCallback(
    (direction: 1 | -1) => {
      if (photos.length <= 1) {
        return;
      }

      setActiveIndex((current) => {
        const next = (current + direction + photos.length) % photos.length;
        return next;
      });
    },
    [photos.length],
  );

  const toggleTab = useCallback((tab: PersonalizeTab) => {
    setActiveTab((current) => (current === tab ? null : tab));
  }, []);

  const activeCustomization = useMemo(
    () => (activePhoto ? getCustomization(activePhoto.id) : DEFAULT_CUSTOMIZATION),
    [activePhoto, getCustomization],
  );

  return {
    activeCustomization,
    activeIndex: clampedIndex,
    activePhoto,
    activeTab,
    getCustomization,
    goToPhoto,
    toggleTab,
    updateActive,
  };
}
