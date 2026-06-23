import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";
import type { useNotifications } from "@/hooks/useNotifications";
import { HAPTIC_EVENTS } from "@/lib/haptics/hapticEvents";

type Notifications = ReturnType<typeof useNotifications>;

export function useNotificationAction(notifications: Notifications) {
  const { trigger } = useWebHaptics();

  return useCallback(async () => {
    const granted = await notifications.requestPermission();

    if (granted) {
      await notifications.showPreviewNotification({
        title: "Une photo attend sa lumiere",
        body: "Secoue le souvenir pour laisser l'image revenir doucement.",
      });
    }

    trigger(granted ? HAPTIC_EVENTS.permissionOk : HAPTIC_EVENTS.permissionKo)
      ?.catch(() => undefined);
  }, [notifications, trigger]);
}
