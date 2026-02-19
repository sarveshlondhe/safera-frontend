import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Bell, Map, ShieldAlert, User, ChevronRight, Zap, Phone } from "lucide-react";
import { getUser } from "../api.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const c = { bg: "#0f0f13", card: "#1a1a24", border: "#2d2d38", muted: "#8e8e93", red: "#ff3b30" };

  const navBtn = (active) => ({
    background: active ? `${c.red}15` : "#121218",
    border: `1px solid ${active ? c.red : c.border}`,
    borderRadius: "14px", padding: "10px 0",
    color: active ? c.red : "#fff", cursor: "pointer",
    fontSize: "10px", display: "flex", flexDirection: "column",
    alignItems: "center", gap: "6px", fontWeight: active ? "900" : "700",
  });

  const item = {
    display: "flex", gap: "12px", alignItems: "center",
    padding: "12px", borderRadius: "14px", background: "#121218",
    border: `1px solid ${c.border}`, marginBottom: "10px", cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: "#fff", padding: "18px", fontFamily: "system-ui", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: c.muted }}>Welcome back,</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{user?.name || "Student"} 👋</div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>
            Status: <span style={{ color: c.red, fontWeight: 800 }}>Active Crisis Monitoring</span>
          </div>
        </div>

        {/* College Info Card */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.red}20`, display: "grid", placeItems: "center" }}>
              🏫
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>AISSMS College of Engineering</div>
              <div style={{ fontSize: 11, color: c.muted }}>Kennedy Road, Pune • Campus Safety Active</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 14, marginBottom: 80 }}>

          <div style={item} onClick={() => navigate("/alerts")}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: `${c.red}20`, display: "grid", placeItems: "center" }}>
              <Bell size={18} color={c.red} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Live Alerts</div>
              <div style={{ fontSize: 11, color: c.muted }}>Official weather and safety broadcasts</div>
            </div>
            <ChevronRight color={c.muted} />
          </div>

          <div style={item} onClick={() => navigate("/damage")}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "#2a2a40", display: "grid", placeItems: "center" }}>
              <Zap size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Risk Assessment</div>
              <div style={{ fontSize: 11, color: c.muted }}>Manually assess building damage risk</div>
            </div>
            <ChevronRight color={c.muted} />
          </div>

          <div style={item} onClick={() => navigate("/map")}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "#2a2a40", display: "grid", placeItems: "center" }}>
              <Map size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Safe Routes & Map</div>
              <div style={{ fontSize: 11, color: c.muted }}>AISSMS campus evacuation paths</div>
            </div>
            <ChevronRight color={c.muted} />
          </div>

          <div style={{ ...item, marginBottom: 0 }} onClick={() => navigate("/contacts")}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "#2a2a40", display: "grid", placeItems: "center" }}>
              <ShieldAlert size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Emergency Contacts</div>
              <div style={{ fontSize: 11, color: c.muted }}>One-tap call Police/Medical/NSS</div>
            </div>
            <ChevronRight color={c.muted} />
          </div>
        </div>

        {/* Floating SOS */}
        <button
          style={{ position: "fixed", right: 22, bottom: 90, width: 60, height: 60, borderRadius: 18, background: c.red, border: "none", color: "#fff", cursor: "pointer", boxShadow: `0 10px 25px ${c.red}55`, fontWeight: 900, display: "grid", placeItems: "center", zIndex: 1000 }}
          onClick={() => { const a = document.createElement("a"); a.href = "tel:112"; a.click(); }}
          title="SOS">
          <Phone size={22} fill="white" />
        </button>

        {/* Bottom Nav — FIXED: Home uses Home icon */}
        <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 12, width: "calc(100% - 24px)", maxWidth: 420, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 10, zIndex: 999, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
          <button style={navBtn(true)}  type="button" onClick={() => navigate("/dashboard")}><Home size={18} /> Home</button>
          <button style={navBtn(false)} type="button" onClick={() => navigate("/alerts")}><Bell size={18} /> Alerts</button>
          <button style={navBtn(false)} type="button" onClick={() => navigate("/map")}><Map size={18} /> Map</button>
          <button style={navBtn(false)} type="button" onClick={() => navigate("/sos")}><ShieldAlert size={18} /> SOS</button>
          <button style={navBtn(false)} type="button" onClick={() => navigate("/profile")}><User size={18} /> Profile</button>
        </div>
      </div>
    </div>
  );
}
