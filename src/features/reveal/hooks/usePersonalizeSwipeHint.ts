import { useCallback, useEffect, useState } from "react";

const SWIPE_HINT_IDLE_DELAY = 5000;
const SWIPE_HINT_VISIBLE_DURATION = 3000;

export function usePersonalizeSwipeHint(photoCount: number) {
  const canSwipe = photoCount > 1;
  const [isVisible, setIsVisible] = useState(true);
  const [activityTick, setActivityTick] = useState(0);

  const registerSwipeActivity = useCallback(() => {
    if (!canSwipe) {
      return;
    }

    setIsVisible(false);
    setActivityTick((tick) => tick + 1);
  }, [canSwipe]);

  useEffect(() => {
    if (!canSwipe) {
      return;
    }

    const delay = isVisible ? SWIPE_HINT_VISIBLE_DURATION : SWIPE_HINT_IDLE_DELAY;
    const timeoutId = window.setTimeout(() => {
      setIsVisible((visible) => !visible);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [activityTick, canSwipe, isVisible]);

  return {
    registerSwipeActivity,
    showSwipeHint: canSwipe && isVisible,
  };
}
