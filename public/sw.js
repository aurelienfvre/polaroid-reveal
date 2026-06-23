self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Polaroid Reveal";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "Un souvenir attend sa lumiere.",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: data.tag || "polaroid-reveal",
      data: {
        url: data.url || "/",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const visibleClient = clients.find((client) => "focus" in client);

        if (visibleClient) {
          visibleClient.navigate(targetUrl);
          return visibleClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
