// Frontend/src/firebase.js
// ── REPLACE all YOUR_* values with your real Firebase config ──

import { initializeApp }       from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

const app       = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ── VAPID key from Firebase Console ──────────────────────────
const VAPID_KEY = "YOUR_VAPID_KEY"; // Firebase Console → Project Settings → Cloud Messaging → Web Push certificates

// ── Request permission + get FCM token ───────────────────────
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      console.log("FCM Token:", token);
      return token;
    }
    return null;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

// ── Listen for foreground messages ───────────────────────────
export function onForegroundMessage(callback) {
  return onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);
    callback(payload);
  });
}

export { messaging };