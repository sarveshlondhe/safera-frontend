// Frontend/src/pages/NaturalDisasterDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw, Globe, Shield, AlertTriangle } from "lucide-react";
import { getToken, getUser } from "../api.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const c = {
  bg: "#080c10", card: "#0e1318", border: "#192028",
  red: "#ff3b30", orange: "#FF6B35", gold: "#FF9F0A",
  green: "#30D158", blue: "#0A84FF", teal: "#5AC8FA",
  muted: "#5a6878", text: "#e8f0f8", pill: "#0b1015",
};

const TYPE_CONFIG = {
  earthquake: { emoji: "🏚️", color: "#FF6B35", label: "Earthquake" },
  cyclone:    { emoji: "🌀", color: "#5AC8FA", label: "Cyclone"    },
  flood:      { emoji: "🌊", color: "#0A84FF", label: "Flood"      },
};

const LEVEL_CONFIG = {
  CRITICAL: { color: "#ff3b30", bg: "#1a0003", emoji: "🔴" },
  HIGH:     { color: "#FF6B35", bg: "#1a0d00", emoji: "🟠" },
  WARNING:  { color: "#FF9F0A", bg: "#1a1200", emoji: "🟡" },
  INFO:     { color: "#0A84FF", bg: "#00091a", emoji: "🔵" },
};

// ── Confidence bar ────────────────────────────────────────────
function ConfidenceBar({ confidence, sources }) {
  const color = confidence >= 70 ? c.green : confidence >= 40 ? c.gold : c.muted;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {sources.map(s => (
            <span key={s} style={{ background: `${color}22`, border: `1px solid ${color}55`, padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 800, color }}>{s}</span>
          ))}
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, color }}>{confidence}% confidence</span>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: c.border }}>
        <div style={{ height: "100%", width: `${confidence}%`, borderRadius: 999, background: color, transition: "width 1s ease" }}/>
      </div>
      {confidence >= 70 && (
        <p style={{ margin: "4px 0 0", fontSize: 9, color: c.green, fontWeight: 700 }}>⬆️ Escalated — Multi-authority confirmation</p>
      )}
    </div>
  );
}

// ── Building damage row ───────────────────────────────────────
function BuildingRow({ b }) {
  const lvl   = LEVEL_CONFIG[b.alertLevel] || LEVEL_CONFIG.INFO;
  const width = Math.min(100, b.damagePercent);
  return (
    <div style={{ padding: "10px 0", borderBottom: `1px solid ${c.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.text }}>{b.name}</span>
        <span style={{ fontSize: 12, fontWeight: 900, color: lvl.color }}>{b.damagePercent.toFixed(1)}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: c.border, marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${width}%`, borderRadius: 999, background: lvl.color, transition: "width 1s ease" }}/>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, color: c.muted }}>👤 {b.occupancy}</span>
        <span style={{ fontSize: 9, color: c.gold }}>🤕 {b.injured} inj</span>
        <span style={{ fontSize: 9, color: c.red }}>⛓️ {b.trapped} trap</span>
        <span style={{ fontSize: 9, color: c.orange }}>🏠 {b.displaced} disp</span>
      </div>
    </div>
  );
}

// ── Event card ────────────────────────────────────────────────
function EventCard({ event, expanded, onToggle }) {
  const typeConfig  = TYPE_CONFIG[event.type] || TYPE_CONFIG.earthquake;
  const levelConfig = LEVEL_CONFIG[event.campusLevel] || LEVEL_CONFIG.INFO;

  const paramStr = event.type === "earthquake"
    ? `M${event.params.magnitude} • Depth ${event.params.depth || "?"}km • ${event.distance}km away`
    : event.type === "cyclone"
    ? `${event.params.windSpeed} km/h • ${event.distance}km away`
    : `${event.params.rainfall}mm rainfall • ${event.distance}km away`;

  return (
    <div style={{ background: levelConfig.bg, border: `1.5px solid ${levelConfig.color}55`, borderRadius: 18, marginBottom: 14, overflow: "hidden" }}>
      {/* Card header */}
      <button onClick={onToggle} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{typeConfig.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: c.text, lineHeight: 1.3 }}>{event.title}</p>
              <span style={{ background: levelConfig.color, padding: "3px 8px", borderRadius: 999, fontSize: 9, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                {levelConfig.emoji} {event.campusLevel}
              </span>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 10, color: c.muted }}>{paramStr}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: levelConfig.color }}>Max damage: {event.maxDamage.toFixed(1)}%</span>
              <span style={{ fontSize: 10, color: c.muted }}>•</span>
              <span style={{ fontSize: 10, color: c.gold }}>🤕 {event.totals.injured} inj</span>
              <span style={{ fontSize: 10, color: c.red }}>⛓️ {event.totals.trapped} trap</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${c.border}` }}>

          {/* Confidence */}
          <div style={{ marginTop: 12, marginBottom: 14 }}>
            <ConfidenceBar confidence={event.confidence} sources={event.sources}/>
          </div>

          {/* Model trace */}
          <div style={{ background: "#04080c", borderRadius: 12, padding: 12, marginBottom: 14, fontFamily: "monospace", fontSize: 10, color: "#6a9bbf", lineHeight: 1.8 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 800, color: c.teal, letterSpacing: 1, fontSize: 9 }}>📐 CALCULATION TRACE</p>
            <p style={{ margin: 0 }}>IntensityScore = {event.intensity.toFixed(4)}</p>
            <p style={{ margin: 0 }}>ProximityFactor = 1 / (1 + {event.distance}/{200}) = {event.proxFactor.toFixed(4)}</p>
            <p style={{ margin: 0, color: c.text, fontWeight: 800 }}>
              MaxDamage% = {event.intensity.toFixed(4)} × {event.proxFactor.toFixed(4)} × BVI × 100 = {event.maxDamage.toFixed(2)}%
            </p>
          </div>

          {/* Totals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Injured",   value: event.totals.injured,   color: c.gold  },
              { label: "Critical",  value: event.totals.critical,  color: c.red   },
              { label: "Trapped",   value: event.totals.trapped,   color: c.red   },
              { label: "Displaced", value: event.totals.displaced,  color: c.orange},
            ].map(s => (
              <div key={s.label} style={{ background: c.pill, borderRadius: 10, padding: "8px 0", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</p>
                <p style={{ margin: "2px 0 0", fontSize: 8, color: c.muted }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div style={{ background: c.pill, borderRadius: 12, padding: "10px 12px", marginBottom: 14 }}>
            <p style={{ margin: "0 0 8px", fontSize: 9, fontWeight: 800, color: c.muted, letterSpacing: 1 }}>📦 RESOURCES NEEDED</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <span style={{ fontSize: 10, color: c.text }}>🚑 {event.resources.ambulances} Ambulances</span>
              <span style={{ fontSize: 10, color: c.text }}>⛑️ {event.resources.rescueTeams} Rescue Teams</span>
              <span style={{ fontSize: 10, color: c.text }}>🍱 {event.resources.foodPackets.toLocaleString()} Food Packs</span>
              <span style={{ fontSize: 10, color: c.text }}>💧 {event.resources.waterLiters.toLocaleString()}L Water</span>
              <span style={{ fontSize: 10, color: c.text }}>🏥 {event.resources.medicalCamps} Medical Camps</span>
            </div>
          </div>

          {/* Building breakdown */}
          <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: c.muted, letterSpacing: 1 }}>🏫 PER-BUILDING DAMAGE</p>
          <div style={{ background: c.pill, borderRadius: 12, padding: "4px 12px" }}>
            {event.buildingResults.map((b, i) => <BuildingRow key={i} b={b}/>)}
          </div>

          <p style={{ margin: "10px 0 0", fontSize: 9, color: c.muted, textAlign: "center" }}>
            🤖 Alert auto-sent to all users • {new Date(event.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
          </p>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function NaturalDisasterDashboard() {
  const navigate  = useNavigate();
  const user      = getUser();
  const isAdmin   = user?.role === "admin";
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [polling,  setPolling]  = useState(false);
  const [lastCheck,setLastCheck]= useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchLatest = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/natural-disaster/latest`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.events) setEvents(data.events);
      setLastCheck(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const forcePoll = async () => {
    setPolling(true);
    try {
      const res  = await fetch(`${BASE_URL}/natural-disaster/poll`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.events) setEvents(data.events);
      setLastCheck(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setPolling(false);
    }
  };

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "system-ui", display: "flex", justifyContent: "center" }}>
    <div style={{ width: "100%", maxWidth: 430, padding: "16px 16px 60px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
          style={{ background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", color: c.text }}>
          <ChevronLeft size={20}/>
        </button>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>🌍 Natural Disaster AI</p>
          <p style={{ margin: 0, fontSize: 10, color: c.muted }}>USGS • NDMA • IMD — Live Monitoring</p>
        </div>
        <button onClick={forcePoll} disabled={polling}
          style={{ background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", color: polling ? c.muted : c.blue }}>
          <RefreshCw size={16} style={{ animation: polling ? "spin 1s linear infinite" : "none" }}/>
        </button>
      </div>

      {/* Status bar */}
      <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.green, boxShadow: `0 0 8px ${c.green}`, flexShrink: 0 }}/>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: c.green }}>Auto-Polling Active — Every 60 seconds</p>
          <p style={{ margin: "2px 0 0", fontSize: 9, color: c.muted }}>
            USGS Earthquake Feed + NDMA SACHET + IMD Cyclone
            {lastCheck ? ` • Last: ${lastCheck.toLocaleTimeString("en-IN")}` : ""}
          </p>
        </div>
        <Globe size={16} color={c.blue}/>
      </div>

      {/* Sources legend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { src: "USGS",  weight: 30, color: c.orange, emoji: "🌐", sub: "Earthquakes" },
          { src: "NDMA",  weight: 40, color: c.red,    emoji: "🇮🇳", sub: "All hazards" },
          { src: "IMD",   weight: 30, color: c.blue,   emoji: "🌤️", sub: "Weather"     },
        ].map(s => (
          <div key={s.src} style={{ background: c.card, border: `1px solid ${s.color}33`, borderRadius: 12, padding: "9px 10px", textAlign: "center" }}>
            <p style={{ margin: "0 0 2px", fontSize: 14 }}>{s.emoji}</p>
            <p style={{ margin: "0 0 1px", fontSize: 11, fontWeight: 900, color: s.color }}>{s.src}</p>
            <p style={{ margin: "0 0 1px", fontSize: 8, color: c.muted }}>{s.sub}</p>
            <p style={{ margin: 0, fontSize: 8, color: s.color, fontWeight: 700 }}>+{s.weight}% conf.</p>
          </div>
        ))}
      </div>

      {/* Geo filter info */}
      <div style={{ background: "#001a08", border: `1px solid ${c.green}33`, borderRadius: 14, padding: "10px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={14} color={c.green}/>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: c.green }}>📍 Geo-Filter Active — 500km radius</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: c.muted }}>Only showing events relevant to AISSMS Pune (18.5563°N, 73.8778°E)</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 32, margin: "0 0 10px" }}>📡</p>
          <p style={{ fontWeight: 800, margin: 0 }}>Polling disaster APIs...</p>
          <p style={{ fontSize: 11, color: c.muted, margin: "6px 0 0" }}>USGS + NDMA SACHET + IMD</p>
        </div>
      )}

      {/* No events */}
      {!loading && events.length === 0 && (
        <div style={{ background: c.card, border: `1px solid ${c.green}44`, borderRadius: 20, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 44, margin: "0 0 10px" }}>✅</p>
          <p style={{ fontWeight: 900, fontSize: 16, margin: "0 0 6px", color: c.green }}>All Clear</p>
          <p style={{ fontSize: 11, color: c.muted, margin: 0, lineHeight: 1.6 }}>
            No earthquakes, cyclones, or floods detected within 500km of AISSMS campus. System is actively monitoring.
          </p>
        </div>
      )}

      {/* Events */}
      {!loading && events.map((event, i) => (
        <EventCard
          key={event.eventId || i}
          event={event}
          expanded={expanded === i}
          onToggle={() => setExpanded(expanded === i ? null : i)}
        />
      ))}

      <p style={{ textAlign: "center", fontSize: 9, color: c.muted, letterSpacing: 1, marginTop: 8 }}>
        🤖 AI DISASTER MONITORING • ZERO USER INPUT • HAVERSINE GEO-FILTER
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    </div>
  );
}