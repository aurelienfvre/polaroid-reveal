"use client";

import { useCallback, useEffect, useState } from "react";

type WebNotificationPermission =
  | "idle"
  | "unsupported"
  | "default"
  | "denied"
  | "granted";

type PreviewNotification = {
  title: string;
  body: string;
};

const SERVICE_WORKER_PATH = "/sw.js";

async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register(SERVICE_WORKER_PATH);
}

export function useNotifications() {
  const [permissionState, setPermissionState] =
    useState<WebNotificationPermission>("idle");

  useEffect(() => {
    void registerServiceWorker();
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermissionState("unsupported");
      return false;
    }

    await registerServiceWorker();
    const result = await Notification.requestPermission();

    setPermissionState(result);

    return result === "granted";
  }, []);

  const showPreviewNotification = useCallback(
    async ({ title, body }: PreviewNotification) => {
      if (typeof window === "undefined" || Notification.permission !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(title, {
        body,
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: "polaroid-reveal-preview",
        data: {
          url: "/",
        },
      });
    },
    [],
  );

  return {
    permissionState,
    requestPermission,
    showPreviewNotification,
  };
}
