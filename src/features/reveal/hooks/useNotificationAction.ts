import { useCallback } from "react";
import type { useNotifications } from "@/hooks/useNotifications";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";

type Notifications = ReturnType<typeof useNotifications>;

export function useNotificationAction(notifications: Notifications) {
  const triggerHaptic = usePolaroidHaptics();

  return useCallback(async () => {
    const granted = await notifications.requestPermission();

    if (granted) {
      await notifications.showPreviewNotification({
        title: "Une photo attend sa lumiere",
        body: "Secoue le souvenir pour laisser l'image revenir doucement.",
      });
    }

    triggerHaptic(granted ? "permissionOk" : "permissionKo");
  }, [notifications, triggerHaptic]);
}
