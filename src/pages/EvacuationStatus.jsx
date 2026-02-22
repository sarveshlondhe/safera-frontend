// Frontend/src/pages/EvacuationStatus.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, RefreshCw, AlertTriangle, CheckCircle, Phone, Users, MapPin, Package } from "lucide-react";
import { getToken, getUser } from "../api.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const c = {
  bg: "#080810", card: "#111118", border: "#1e1e2e",
  red: "#ff3b30", gold: "#FF9F0A", green: "#30D158",
  blue: "#0A84FF", muted: "#636374", pill: "#0d0d18",
  text: "#f0f0f8",
};

// ── Animated progress ring ────────────────────────────────────
function Ring({ value, max, color, size = 80, label, sublabel }) {
  const pct    = Math.min(100, Math.round((value / max) * 100));
  const r      = (size - 10) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={8}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }}/>
      </svg>
      <p style={{ margin: "-60px 0 0", fontSize: size > 70 ? 16 : 12, fontWeight: 900, color, lineHeight: 1 }}>{pct}%</p>
      <p style={{ margin: "44px 0 2px", fontSize: 10, fontWeight: 800, color: c.text }}>{label}</p>
      {sublabel && <p style={{ margin: 0, fontSize: 9, color: c.muted }}>{sublabel}</p>}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ emoji, label, value, sub, color }) {
  return (
    <div style={{ background: c.card, border: `1px solid ${color}33`, borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ fontSize: 10, color: c.muted, fontWeight: 700 }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p style={{ margin: "3px 0 0", fontSize: 9, color: c.muted }}>{sub}</p>}
    </div>
  );
}

// ── Zone bar ──────────────────────────────────────────────────
function ZoneBar({ zone }) {
  const pct   = zone.utilization;
  const color = pct >= 90 ? c.red : pct >= 70 ? c.gold : c.green;
  const typeColors = { Primary: c.blue, Secondary: c.gold, Emergency: c.red };

  return (
    <div style={{ background: c.pill, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, color: c.text }}>{zone.name}</span>
          <span style={{ marginLeft: 6, background: `${typeColors[zone.type]}22`, border: `1px solid ${typeColors[zone.type]}44`, padding: "1px 6px", borderRadius: 999, fontSize: 8, color: typeColors[zone.type], fontWeight: 700 }}>{zone.type}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 900, color }}>{zone.assigned.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "#1e1e2e" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: color, transition: "width 1s ease" }}/>
      </div>
      <p style={{ margin: "4px 0 0", fontSize: 9, color: c.muted }}>{zone.location}</p>
    </div>
  );
}

export default function EvacuationStatus() {
  const navigate  = useNavigate();
  const user      = getUser();
  const isAdmin   = user?.role === "admin";
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [tab,     setTab]     = useState("overview");

  const fetchLatest = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/evacuation/latest`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const json = await res.json();
      if (json.available) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runPredictor = async () => {
    setRunning(true);
    try {
      const res  = await fetch(`${BASE_URL}/evacuation/run`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ triggerType: "Manual", severity: "CRITICAL" }),
      });
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => { fetchLatest(); }, []);

  const readinessColor = !data ? c.muted
    : data.readinessScore >= 80 ? c.green
    : data.readinessScore >= 50 ? c.gold : c.red;

  const TABS = ["overview", "zones", "resources", "support"];

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'SF Pro Display', system-ui", display: "flex", justifyContent: "center", padding: "16px 16px 40px" }}>
    <div style={{ width: "100%", maxWidth: 430 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
          style={{ background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", color: c.text }}>
          <ChevronLeft size={20}/>
        </button>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Evacuation Predictor</p>
          <p style={{ margin: 0, fontSize: 10, color: c.muted }}>AI Operational Readiness</p>
        </div>
        <button onClick={fetchLatest}
          style={{ background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", color: c.blue }}>
          <RefreshCw size={16}/>
        </button>
      </div>

      {/* No data state */}
      {!loading && !data && (
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 20, padding: 28, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
          <p style={{ fontWeight: 900, fontSize: 15, margin: "0 0 8px" }}>No Prediction Yet</p>
          <p style={{ fontSize: 11, color: c.muted, margin: "0 0 20px", lineHeight: 1.6 }}>
            Evacuation prediction runs automatically when a WARNING or CRITICAL alert is sent. You can also trigger it manually below.
          </p>
          {isAdmin && (
            <button onClick={runPredictor} disabled={running}
              style={{ background: c.red, border: "none", borderRadius: 14, padding: "13px 28px", color: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer", width: "100%" }}>
              {running ? "⏳ Running..." : "🚀 Run Prediction Now"}
            </button>
          )}
        </div>
      )}

      {loading && (
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 20, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          <p style={{ fontWeight: 800, margin: 0 }}>Loading prediction...</p>
        </div>
      )}

      {data && (
        <>
          {/* Readiness score banner */}
          <div style={{ background: `${readinessColor}15`, border: `2px solid ${readinessColor}55`, borderRadius: 20, padding: "16px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: readinessColor, lineHeight: 1 }}>{data.readinessScore}</p>
              <p style={{ margin: "2px 0 0", fontSize: 9, color: c.muted, fontWeight: 700 }}>READINESS</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 14, color: readinessColor }}>
                {data.readinessScore >= 80 ? "✅ Campus Ready" : data.readinessScore >= 50 ? "⚠️ Partial Readiness" : "🆘 Critical — External Help Needed"}
              </p>
              <p style={{ margin: 0, fontSize: 10, color: c.muted, lineHeight: 1.5 }}>
                ~{data.occupancyRate}% occupied • {data.estimatedPresent.toLocaleString()} people estimated
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 9, color: c.muted }}>
                {new Date(data.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
              </p>
            </div>
          </div>

          {/* Zone + Displacement rings */}
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 20, padding: 16, marginBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, placeItems: "center" }}>
            <Ring value={data.zoneUtilization} max={100} color={data.zoneSufficient ? c.green : c.red} size={80} label="Zones" sublabel="utilized"/>
            <Ring value={data.estimatedDisplaced} max={data.totalCapacity} color={c.gold} size={80} label="Displaced" sublabel="of total"/>
            <Ring value={data.estimatedInjured} max={data.estimatedPresent} color={c.red} size={80} label="Injured" sublabel="estimated"/>
          </div>

          {/* Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "8px 4px", borderRadius: 10, border: `1px solid ${tab === t ? c.blue : c.border}`, background: tab === t ? `${c.blue}20` : c.pill, color: tab === t ? c.blue : c.muted, fontWeight: 800, fontSize: 9, cursor: "pointer", textTransform: "capitalize" }}>
                {t === "overview" ? "📊 Overview" : t === "zones" ? "🏟️ Zones" : t === "resources" ? "📦 Resources" : "📞 Support"}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <StatCard emoji="👥" label="ESTIMATED PRESENT" value={data.estimatedPresent} sub={`${data.occupancyRate}% of ${data.totalCapacity.toLocaleString()} capacity`} color={c.blue}/>
              <StatCard emoji="🏠" label="ZONE CAPACITY" value={data.zoneCapacity} sub={data.zoneSufficient ? "✅ Sufficient" : `🆘 Deficit: ${data.zoneDeficit}`} color={data.zoneSufficient ? c.green : c.red}/>
              <StatCard emoji="🚶" label="DISPLACED" value={data.estimatedDisplaced} sub="Need shelter" color={c.gold}/>
              <StatCard emoji="🏥" label="INJURED" value={data.estimatedInjured} sub="Need medical" color={c.red}/>
              <StatCard emoji="🆘" label="TRAPPED" value={data.estimatedTrapped} sub="Need rescue" color={c.red}/>
              <StatCard emoji="🎯" label="TRIGGER" value={data.triggerType} sub="Alert type" color={c.muted}/>

              {!data.zoneSufficient && (
                <div style={{ gridColumn: "span 2", background: "#1a0000", border: `1px solid ${c.red}55`, borderRadius: 14, padding: "12px 14px" }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 12, color: c.red }}>🆘 Zone Deficit Alert</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#ffaaaa", lineHeight: 1.5 }}>
                    Current evacuation zones can only hold {data.zoneCapacity.toLocaleString()} people but {data.estimatedDisplaced.toLocaleString()} are displaced. External support has been auto-requested.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Zones */}
          {tab === "zones" && (
            <div>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: c.muted }}>
                Total zone capacity: {data.zoneCapacity.toLocaleString()} • Needed: {data.estimatedDisplaced.toLocaleString()}
              </p>
              {data.zoneAlloc.map((z, i) => <ZoneBar key={i} zone={z}/>)}
            </div>
          )}

          {/* Tab: Resources */}
          {tab === "resources" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <StatCard emoji="🚑" label="AMBULANCES" value={data.resources.ambulances} sub="Required immediately" color={c.red}/>
              <StatCard emoji="👷" label="RESCUE TEAMS" value={data.resources.rescueTeams} sub="For trapped people" color={c.gold}/>
              <StatCard emoji="🏥" label="MEDICAL CAMPS" value={data.resources.medicalCamps} sub="Field hospitals" color={c.blue}/>
              <StatCard emoji="🍱" label="FOOD PACKS" value={data.resources.foodPacks} sub="For displaced" color={c.green}/>
              <div style={{ gridColumn: "span 2" }}>
                <StatCard emoji="💧" label="WATER REQUIRED" value={`${(data.resources.waterLiters/1000).toFixed(1)}K`} sub={`${data.resources.waterLiters.toLocaleString()} liters (3L/person/day)`} color={c.blue}/>
              </div>
            </div>
          )}

          {/* Tab: Support */}
          {tab === "support" && (
            <div>
              <div style={{ background: data.needsExternal ? "#1a0000" : "#001a00", border: `1px solid ${data.needsExternal ? c.red : c.green}44`, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: data.needsExternal ? c.red : c.green }}>
                  {data.needsExternal ? "🆘 External Support Required — Auto-request sent" : "✅ Internal capacity sufficient"}
                </p>
              </div>
              {EXTERNAL_SUPPORT.map((s, i) => (
                <div key={i} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: "0 0 3px", fontWeight: 800, fontSize: 12, color: c.text }}>{s.name}</p>
                    <span style={{ background: `${c.blue}22`, padding: "2px 8px", borderRadius: 999, fontSize: 9, color: c.blue, fontWeight: 700 }}>{s.type}</span>
                  </div>
                  <a href={`tel:${s.phone}`}
                    style={{ background: c.red, borderRadius: 12, padding: "10px 14px", color: "#fff", fontWeight: 900, fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                    <Phone size={12}/> {s.phone}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Admin: manual trigger */}
          {isAdmin && (
            <button onClick={runPredictor} disabled={running}
              style={{ marginTop: 16, width: "100%", background: running ? c.pill : c.red, border: `1px solid ${c.border}`, borderRadius: 14, padding: "14px", color: running ? c.muted : "#fff", fontWeight: 900, fontSize: 13, cursor: running ? "default" : "pointer" }}>
              {running ? "⏳ Running Prediction..." : "🔄 Re-run Prediction"}
            </button>
          )}
        </>
      )}

    </div>
    </div>
  );
}

// External support data for Support tab
const EXTERNAL_SUPPORT = [
  { name: "NDRF Maharashtra",    phone: "9969999500",   type: "Rescue"  },
  { name: "PMC Disaster Cell",   phone: "1800-233-0000",type: "Shelter" },
  { name: "Civil Hospital Pune", phone: "020-26128000", type: "Medical" },
  { name: "SDRF Pune",           phone: "020-26123456", type: "Rescue"  },
];