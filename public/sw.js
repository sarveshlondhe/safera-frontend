// Frontend/public/sw.js — replace existing file
const CACHE_NAME = "safera-v4";

const OFFLINE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/safera_192x192.png",
  "/safera_512x512.png",
];

// ── Install ───────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate — clear old caches ───────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Network first for API
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request.clone())
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // SPA navigation
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      });
    })
  );
});

// ── Push notification received ────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: "Safera Alert", body: event.data.text() }; }

  const { title, body, level, type, icon, badge, url } = data;

  const levelEmoji = level === "CRITICAL" ? "🔴" : level === "WARNING" ? "🟡" : "🔵";
  const vibrate    = level === "CRITICAL" ? [200,100,200,100,200] : [200,100,200];

  event.waitUntil(
    self.registration.showNotification(`${levelEmoji} ${title || "Safera Alert"}`, {
      body:      body || "New campus emergency alert",
      icon:      icon  || "/safera_192x192.png",
      badge:     badge || "/safera_192x192.png",
      tag:       "safera-alert",
      renotify:  true,
      vibrate,
      data:      { url: url || "/alerts" },
      actions: [
        { action: "view",    title: "View Alert" },
        { action: "dismiss", title: "Dismiss"    },
      ],
    })
  );
});

// ── Notification click ────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/alerts";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});