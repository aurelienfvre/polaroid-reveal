import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";
import { HAPTIC_EVENTS } from "@/lib/haptics/hapticEvents";

type HapticName = keyof typeof HAPTIC_EVENTS;

type HapticOptions = {
  intensity?: number;
};

export function usePolaroidHaptics() {
  const { trigger } = useWebHaptics({ showSwitch: true });

  return useCallback(
    (name: HapticName, options?: HapticOptions) => {
      trigger(HAPTIC_EVENTS[name], options)?.catch(() => undefined);
    },
    [trigger],
  );
}
