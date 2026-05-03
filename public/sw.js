self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Resolve a path against this SW's scope so that "/Nido/sw.js" → "/Nido/icon".
function scoped(path) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = self.registration.scope.replace(/\/+$/, "");
  return base + (path.startsWith("/") ? path : "/" + path);
}

self.addEventListener("push", (event) => {
  let payload = {
    title: "Nido",
    body: "Nouvelle activité",
    url: "/",
    tag: "nido-activity",
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (e) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    tag: payload.tag,
    icon: scoped(payload.icon || "/apple-icon"),
    badge: scoped(payload.badge || "/icon"),
    data: { url: scoped(payload.url || "/") },
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) ||
    self.registration.scope;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl).catch(() => {});
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
