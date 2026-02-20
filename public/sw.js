const CACHE_NAME = "safera-v2";

// Files to cache for offline use
const OFFLINE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// API routes to cache responses for offline viewing
const CACHE_API_ROUTES = [
  "/api/broadcast",   // Alerts - cache latest broadcasts
  "/api/contacts",    // Emergency contacts
];

// ── Install: cache static assets ──────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Safera SW: Caching offline assets");
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ─────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache when offline ───────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // For API calls — network first, fallback to cache
  if (CACHE_API_ROUTES.some((r) => url.pathname.includes(r))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Save fresh response to cache
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline — return cached version
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // Return empty data if nothing cached
            return new Response(JSON.stringify({ broadcasts: [], contacts: [], offline: true }), {
              headers: { "Content-Type": "application/json" },
            });
          });
        })
    );
    return;
  }

  // For page navigation — network first, fallback to index.html
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // For static assets — cache first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});