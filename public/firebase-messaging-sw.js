// Firebase Cloud Messaging Service Worker
// Place this file at: Frontend/public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// ── REPLACE with your Firebase config ────────────────────────
firebase.initializeApp({
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("Background notification received:", payload);

  const { title, body, icon } = payload.notification || {};
  const data = payload.data || {};

  const notifTitle = title || "⚡ Safera Alert";
  const notifBody  = body  || "New campus emergency alert";

  // Color badge based on level
  const level = data.level || "INFO";
  const badge = level === "CRITICAL" ? "🔴" : level === "WARNING" ? "🟡" : "🔵";

  self.registration.showNotification(`${badge} ${notifTitle}`, {
    body:    notifBody,
    icon:    "/safera_192x192.png",
    badge:   "/safera_192x192.png",
    tag:     "safera-alert",
    renotify: true,
    vibrate: level === "CRITICAL" ? [200, 100, 200, 100, 200] : [200, 100, 200],
    data:    { url: "/alerts", ...data },
    actions: [
      { action: "view",    title: "View Alert" },
      { action: "dismiss", title: "Dismiss"    },
    ],
  });
});

// Click on notification → open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate("/alerts");
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/alerts");
      }
    })
  );
});