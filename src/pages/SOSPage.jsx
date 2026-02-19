import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowLeft, Siren, CheckCircle } from "lucide-react";
import { sosAPI, getUser } from "../api.js";

const c = { bg: "#0f0f13", card: "#1a1a24", border: "#2d2d38", red: "#ff3b30", muted: "#8e8e93" };

export default function SOSPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");

  const sendSOS = async () => {
    setSending(true); setError("");
    try {
      let location = {};
      if (navigator.geolocation) {
        await new Promise((resolve) =>
          navigator.geolocation.getCurrentPosition(
            (pos) => { location = { lat: pos.coords.latitude, lng: pos.coords.longitude }; resolve(); },
            () => resolve(), { timeout: 4000 }
          )
        );
      }
      await sosAPI.send({ location, message: message || "SOS - Emergency Help Needed!" });
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send. Try calling 112.");
    } finally { setSending(false); }
  };

  // ✅ FIXED: Works on both mobile and desktop
  const makeCall = (number) => {
    const a = document.createElement("a");
    a.href = `tel:${number}`;
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: "#fff", padding: 18, fontFamily: "system-ui", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={() => navigate(-1)}
          style={{ background: c.card, border: `1px solid ${c.border}`, color: "#fff", padding: "10px 14px", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>SOS Emergency</h2>
        <p style={{ color: c.muted, marginBottom: 20, fontSize: 13 }}>
          Logged in as: <strong style={{ color: "#fff" }}>{user?.name || user?.email || "User"}</strong>
        </p>

        {/* Digital SOS */}
        <div style={{ background: c.card, border: `2px solid ${c.red}66`, borderRadius: 20, padding: 24, marginBottom: 16, textAlign: "center" }}>
          {sent ? (
            <>
              <CheckCircle size={64} color="#30d158" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontWeight: 900, fontSize: 18, color: "#30d158" }}>SOS Alert Sent!</p>
              <p style={{ color: c.muted, fontSize: 13, marginTop: 8 }}>Your alert is recorded. Campus authorities have been notified.</p>
              <button onClick={() => { setSent(false); setMessage(""); }}
                style={{ marginTop: 16, background: "#25252e", border: `1px solid ${c.border}`, color: "#fff", padding: "10px 24px", borderRadius: 12, cursor: "pointer", fontWeight: 800 }}>
                Send Another
              </button>
            </>
          ) : (
            <>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${c.red}22`, border: `3px solid ${c.red}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Siren size={36} color={c.red} />
              </div>
              <p style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>Send Digital SOS Alert</p>
              <p style={{ color: c.muted, fontSize: 12, marginBottom: 16 }}>Sends your identity & location to campus authorities</p>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional: Describe your emergency…"
                style={{ width: "100%", background: "#121218", border: `1px solid ${c.border}`, borderRadius: 12, padding: 12, color: "#fff", fontSize: 13, outline: "none", resize: "vertical", minHeight: 70, boxSizing: "border-box", marginBottom: 14 }} />
              {error && <p style={{ color: "#ff6b63", fontSize: 12, marginBottom: 12 }}>⚠️ {error}</p>}
              <button onClick={sendSOS} disabled={sending}
                style={{ width: "100%", background: c.red, border: "none", borderRadius: 16, color: "#fff", padding: 16, fontWeight: 900, fontSize: 16, cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1, boxShadow: `0 8px 20px ${c.red}44` }}>
                {sending ? "Sending…" : "🚨 SEND SOS ALERT"}
              </button>
            </>
          )}
        </div>

        {/* ✅ FIXED Call Buttons */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 11, marginBottom: 12, color: c.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Direct Emergency Calls
          </p>
          <p style={{ fontSize: 11, color: c.muted, marginBottom: 12 }}>
            ⚠️ Call buttons work on mobile devices. On desktop, they open your default phone/Skype app.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { label: "National Emergency", num: "112", primary: true },
              { label: "Police", num: "100" },
              { label: "Ambulance", num: "108" },
              { label: "Fire Brigade", num: "101" },
              { label: "Disaster Management", num: "1078" },
            ].map(({ label, num, primary }) => (
              <button key={num} onClick={() => makeCall(num)}
                style={{ background: primary ? c.red : "#121218", border: `1px solid ${primary ? c.red : c.border}`, padding: "14px 16px", borderRadius: 14, color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, boxShadow: primary ? `0 8px 20px ${c.red}44` : "none" }}>
                <Phone size={18} fill={primary ? "white" : "none"} />
                {label} — <span style={{ fontFamily: "monospace", fontSize: 16, marginLeft: "auto" }}>{num}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
