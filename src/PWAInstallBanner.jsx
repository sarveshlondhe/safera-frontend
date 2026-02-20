import { useState, useEffect } from "react";
import { Download, X, Wifi, Bell, Phone } from "lucide-react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner]         = useState(false);
  const [installed, setInstalled]           = useState(false);
  const [isIOS, setIsIOS]                   = useState(false);
  const [showIOSGuide, setShowIOSGuide]     = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // For Android/Chrome — catch the install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    });

    // iOS — show guide after 3s if not installed
    if (ios) setTimeout(() => setShowBanner(true), 3000);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
    });
  }, []);

  const handleInstall = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { setInstalled(true); setShowBanner(false); }
    setDeferredPrompt(null);
  };

  if (installed || !showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      <div style={{
        position: "fixed", bottom: 90, left: 12, right: 12,
        background: "#1A1A24", border: "1px solid #FF3B30",
        borderRadius: 20, padding: 16, zIndex: 9999,
        boxShadow: "0 20px 60px rgba(255,59,48,0.25)",
        animation: "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(120px); opacity: 0; }
            to   { transform: translateY(0);     opacity: 1; }
          }
        `}</style>

        {/* Close */}
        <button onClick={() => setShowBanner(false)} style={{
          position: "absolute", top: 12, right: 12,
          background: "transparent", border: "none", color: "#8E8E93",
          cursor: "pointer", padding: 4,
        }}>
          <X size={16} />
        </button>

        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "#FF3B30", display: "grid", placeItems: "center",
            fontSize: 24, flexShrink: 0,
          }}>⚡</div>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 15, color: "#fff" }}>Install Safera App</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8E8E93" }}>AISSMS Campus Safety — Install for offline use</p>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            { icon: <Wifi size={11} />,   label: "Works Offline" },
            { icon: <Bell size={11} />,   label: "View Alerts"   },
            { icon: <Phone size={11} />,  label: "Call 112"      },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              flex: 1, background: "#121218", border: "1px solid #2D2D38",
              borderRadius: 10, padding: "8px 6px", textAlign: "center",
            }}>
              <div style={{ color: "#FF3B30", marginBottom: 3 }}>{icon}</div>
              <div style={{ fontSize: 9, color: "#8E8E93", fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Install button */}
        <button onClick={handleInstall} style={{
          width: "100%", background: "#FF3B30", border: "none",
          borderRadius: 14, padding: "13px 0", color: "#fff",
          fontWeight: 900, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 8px 20px rgba(255,59,48,0.4)",
        }}>
          <Download size={16} />
          {isIOS ? "How to Install on iPhone" : "Install App — It's Free"}
        </button>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          zIndex: 10000, display: "flex", alignItems: "flex-end",
          padding: "0 12px 12px",
        }} onClick={() => setShowIOSGuide(false)}>
          <div style={{
            background: "#1A1A24", border: "1px solid #2D2D38",
            borderRadius: 20, padding: 24, width: "100%",
          }} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>Install on iPhone</p>
            <p style={{ fontSize: 12, color: "#8E8E93", marginBottom: 18 }}>Follow these steps to add Safera to your home screen:</p>
            {[
              { num: "1", text: 'Tap the Share button ⎦ at the bottom of Safari' },
              { num: "2", text: 'Scroll down and tap "Add to Home Screen"' },
              { num: "3", text: 'Tap "Add" in the top right corner' },
              { num: "4", text: "Safera app icon appears on your home screen! ✅" },
            ].map((step) => (
              <div key={step.num} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: "#FF3B30",
                  display: "grid", placeItems: "center", fontWeight: 900,
                  fontSize: 13, color: "#fff", flexShrink: 0,
                }}>{step.num}</div>
                <p style={{ margin: 0, fontSize: 13, color: "#D0D0D8", lineHeight: 1.5 }}>{step.text}</p>
              </div>
            ))}
            <button onClick={() => setShowIOSGuide(false)} style={{
              width: "100%", background: "#FF3B30", border: "none",
              borderRadius: 14, padding: 13, color: "#fff",
              fontWeight: 900, fontSize: 14, cursor: "pointer", marginTop: 4,
            }}>Got It!</button>
          </div>
        </div>
      )}
    </>
  );
}