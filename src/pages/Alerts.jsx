import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Flame, Waves, Activity, CloudRain, ShieldAlert, Wind, Megaphone } from "lucide-react";
import { getUser, broadcastAPI } from "../api.js";

export default function Alerts() {
  const navigate = useNavigate();
  const user = getUser();
  const [tab, setTab] = useState("All");
  const [broadcasts, setBroadcasts] = useState([]);
  const c = { bg: "#0f0f13", card: "#1a1a24", border: "#2d2d38", muted: "#8e8e93", red: "#ff3b30", pill: "#121218" };
  // Load admin broadcasts from DB
  useEffect(() => {
    broadcastAPI.getAll().then((res) => setBroadcasts(res.broadcasts || [])).catch(() => {});
  }, []);

  const tabs = [
    { key: "All" },
    { key: "Admin", icon: <Megaphone size={14} /> },
    { key: "Weather", icon: <CloudRain size={14} /> },
    { key: "Fire", icon: <Flame size={14} /> },
    { key: "Seismic", icon: <Activity size={14} /> },
  ];

  const staticAlerts = useMemo(() => [
    {
      level: "CRITICAL", title: "Heavy Rainfall Warning — Pune District",
      source: "IMD PUNE METEOROLOGICAL DEPT", time: "10 mins ago",
      body: "India Meteorological Department has issued a Red Alert for Pune district. Heavy to very heavy rainfall expected. All outdoor activities at AISSMS campus suspended. Students in ground floor areas must move to upper floors immediately.",
      type: "Weather",
    },
    {
      level: "CRITICAL", title: "Fire Alert — AISSMS Mechanical Workshop",
      source: "AISSMS CAMPUS SAFETY DIVISION", time: "25 mins ago",
      body: "Smoke detected in Mechanical Workshop Block. Campus fire brigade notified. All students on Ground Floor evacuate via West exit. Assembly point: AISSMS Sports Ground (Shivgarjana).",
      type: "Fire",
    },
    {
      level: "WARNING", title: "Minor Seismic Activity — Pune Region",
      source: "NATIONAL SEISMOLOGY CENTER (NSC)", time: "1 hour ago",
      body: "Minor tremors of magnitude 3.2 detected 40km from Pune. No structural damage expected. Students on upper floors of COE/IOIT/Pharmacy buildings avoid elevators and move to open spaces.",
      type: "Seismic",
    },
    {
      level: "WARNING", title: "Mula-Mutha River Level Rising",
      source: "PUNE MUNICIPAL CORPORATION", time: "2 hours ago",
      body: "PMC reports rising water levels near Kennedy Road. Students commuting from Pune Station should use alternate routes. AISSMS campus basement areas to be vacated.",
      type: "Weather",
    },
    {
      level: "INFO", title: "Fire Safety Drill — AISSMS Campus",
      source: "AISSMS NSS UNIT & FIRE MARSHAL", time: "3 hours ago",
      body: "Scheduled fire safety drill today at 3:00 PM across all AISSMS campus buildings including COE, IOIT, Pharmacy and Polytechnic. Assembly at Sports Ground. Duration: 20 minutes.",
      type: "Fire",
    },
  ], []);

  // Convert DB broadcasts to alert format
  const dbAlerts = broadcasts.map((b) => ({
    level: b.level,
    title: b.title,
    source: `ADMIN BROADCAST — ${b.sentByName?.toUpperCase() || "ADMIN"}`,
    time: new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    body: b.message,
    type: "Admin",
    isAdmin: true,
  }));

  const allAlerts = [...dbAlerts, ...staticAlerts];

  const filtered = useMemo(() => {
    if (tab === "All") return allAlerts;
    if (tab === "Admin") return dbAlerts;
    return staticAlerts.filter((a) => a.type === tab);
  }, [tab, broadcasts]);

  const levelColor = (lvl) => lvl === "CRITICAL" ? c.red : lvl === "WARNING" ? "#ff9f0a" : "#0a84ff";

  const iconFor = (a) => {
    if (a.isAdmin)   return <Megaphone size={18} color="#fff" />;
    if (a.type === "Fire")    return <Flame size={18} color={c.red} />;
    if (a.type === "Seismic") return <Activity size={18} color="#ff9f0a" />;
    if (a.title?.toLowerCase().includes("flood") || a.title?.toLowerCase().includes("river")) return <Waves size={18} color="#0a84ff" />;
    if (a.type === "Weather") return <CloudRain size={18} color="#0a84ff" />;
    return <ShieldAlert size={18} color="#fff" />;
  };

  const shareToWhatsApp = (alert) => {
    const text = `🚨 ${alert.level}: ${alert.title}\n📍 ${alert.source}\n${alert.body}\n⏰ ${alert.time}\n\n— AISSMS Campus Safety App`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: "#fff", fontFamily: "system-ui", display: "flex", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Top */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button type="button"
            style={{ background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", color: "#fff" }}
            onClick={() => user?.role === "admin" ? navigate("/admin") : navigate("/dashboard")}>
            <ChevronLeft />
          </button>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Live Alerts</p>
            <p style={{ fontSize: 11, color: c.muted, margin: 0 }}>AISSMS Campus — Pune {dbAlerts.length > 0 && `· ${dbAlerts.length} Admin Alerts`}</p>
          </div>
          <div style={{ width: 44 }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, margin: "0 0 16px", overflowX: "auto", paddingBottom: 4 }}>
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, border: `1px solid ${tab === t.key ? c.red : c.border}`, background: tab === t.key ? c.red : c.pill, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {t.icon} {t.key} {t.key === "Admin" && dbAlerts.length > 0 && `(${dbAlerts.length})`}
            </button>
          ))}
        </div>

        {/* Alert Cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: c.muted }}>
            <Megaphone size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p>No admin broadcasts yet.</p>
          </div>
        ) : filtered.map((a, idx) => (
          <div key={idx} style={{ position: "relative", background: c.card, border: `1px solid ${a.isAdmin ? levelColor(a.level) + "66" : c.border}`, borderRadius: 18, padding: 14, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: levelColor(a.level) }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ background: levelColor(a.level), padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 900 }}>
                {a.isAdmin ? "📢 ADMIN" : a.level}
              </span>
              <span style={{ fontSize: 11, color: c.muted }}>{a.time}</span>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `${levelColor(a.level)}20`, border: `1px solid ${c.border}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {iconFor(a)}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 14 }}>{a.title}</div>
                <div style={{ fontSize: 10, color: a.isAdmin ? "#ff9f0a" : c.red, fontWeight: 800, marginTop: 2 }}>{a.source}</div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#cfcfd6", lineHeight: 1.6, margin: "0 0 12px" }}>{a.body}</p>

            <button type="button" onClick={() => shareToWhatsApp(a)}
              style={{ width: "100%", background: "#2a2a2f", border: `1px solid ${c.border}`, borderRadius: 12, padding: 12, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: 12 }}>
              <Share2 size={15} /> Share to WhatsApp
            </button>
          </div>
        ))}

        <div style={{ textAlign: "center", padding: "14px 0 24px", fontSize: 9, color: c.muted, letterSpacing: 1 }}>
          END OF ALERTS FEED • AISSMS CAMPUS MONITORING ACTIVE
        </div>

        <button type="button" title="Emergency SOS"
          style={{ position: "fixed", right: 22, bottom: 26, width: 62, height: 62, borderRadius: 18, background: c.red, border: "none", color: "#fff", cursor: "pointer", boxShadow: `0 12px 30px ${c.red}66`, display: "grid", placeItems: "center" }}
          onClick={() => { const a = document.createElement("a"); a.href = "tel:112"; a.click(); }}>
          <ShieldAlert size={22} />
        </button>
      </div>
    </div>
  );
}