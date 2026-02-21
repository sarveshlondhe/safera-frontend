// Frontend/src/useNotifications.js
import { useEffect, useState } from "react";
import { requestNotificationPermission, onForegroundMessage } from "./firebase.js";
import { getToken } from "./api.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Save FCM token to backend
async function saveFcmToken(fcmToken) {
  try {
    const authToken = getToken();
    await fetch(`${BASE_URL}/notification/token`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });
  } catch (err) {
    console.error("Could not save FCM token:", err);
  }
}

export default function useNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  const [foregroundAlert, setForegroundAlert] = useState(null);

  useEffect(() => {
    // Request permission and register token
    const setup = async () => {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        setPermission("granted");
        await saveFcmToken(fcmToken);
      }
    };

    if (Notification.permission !== "denied") {
      setup();
    }

    // Listen for foreground notifications (app is open)
    const unsubscribe = onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      const { level, type } = payload.data || {};
      setForegroundAlert({ title, body, level, type, time: Date.now() });

      // Auto-clear after 6 seconds
      setTimeout(() => setForegroundAlert(null), 6000);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  return { permission, foregroundAlert, clearAlert: () => setForegroundAlert(null) };
}