// Frontend/src/usePushNotifications.js
import { useEffect, useState } from "react";
import { getToken } from "./api.js";

const BASE_URL    = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// ── Paste your VAPID public key here ─────────────────────────
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "OntYCQ7wLAaVxAI1NO81729pVyq2lPADK-mozkP0MHgyUwIP5sMO8WhG6aCErc19cyQ_bbsfaXACj4PUwXw0vw";

function urlBase64ToUint8Array(base64String) {
  const padding  = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64   = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData  = window.atob(base64);
  const output   = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}

export default function usePushNotifications() {
  const [permission,   setPermission]   = useState(Notification.permission);
  const [subscribed,   setSubscribed]   = useState(false);
  const [toast,        setToast]        = useState(null);

  const subscribe = async () => {
    try {
      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      // 2. Register service worker
      const reg = await navigator.serviceWorker.ready;

      // 3. Subscribe to push
      const pushSub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Send subscription to backend
      const authToken = getToken();
      await fetch(`${BASE_URL}/push/subscribe`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subscription: pushSub.toJSON() }),
      });

      setSubscribed(true);
      console.log("✅ Push notifications subscribed!");
    } catch (err) {
      console.error("Push subscribe error:", err);
    }
  };

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") {
      subscribe(); // auto-subscribe if already granted
    }
  }, []);

  // Listen for foreground push messages via BroadcastChannel
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("safera_push");
    channel.onmessage = (e) => {
      setToast(e.data);
      setTimeout(() => setToast(null), 6000);
    };
    return () => channel.close();
  }, []);

  return { permission, subscribed, subscribe, toast, clearToast: () => setToast(null) };
}