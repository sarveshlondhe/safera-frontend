// Frontend/src/pages/FireAssessment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Flame, AlertTriangle, Users, Package, Activity } from "lucide-react";
import { getToken, getUser } from "../api.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const c = {
  bg: "#09080d", card: "#120f18", border: "#221d2e",
  red: "#ff3b30", orange: "#FF6B35", gold: "#FF9F0A",
  green: "#30D158", blue: "#0A84FF", muted: "#6e6880",
  text: "#f2eeff", pill: "#0e0b14",
};

const ALERT_COLOR  = { CRITICAL: "#ff3b30", HIGH: "#FF6B35", WARNING: "#FF9F0A" };
const ALERT_BG     = { CRITICAL: "#1a0003", HIGH: "#1a0d00", WARNING: "#1a1200" };
const ALERT_LABEL  = { CRITICAL: "🔴 CRITICAL", HIGH: "🟠 HIGH",  WARNING: "🟡 WARNING" };

// ── Gauge ─────────────────────────────────────────────────────
function Gauge({ value, max = 100, color, size = 110, label }) {
  const pct    = Math.min(100, (value / max) * 100);
  const r      = (size - 14) / 2;
  const circ   = Math.PI * r;                  // half circle
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Track */}
        <path
          d={`M 7 ${size/2} A ${r} ${r} 0 0 1 ${size-7} ${size/2}`}
          fill="none" stroke="#221d2e" strokeWidth={10} strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M 7 ${size/2} A ${r} ${r} 0 0 1 ${size-7} ${size/2}`}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        {/* Value text */}
        <text x={size/2} y={size/2 + 2} textAnchor="middle" fill={color}
          fontSize="17" fontWeight="900" fontFamily="system-ui">
          {typeof value === "number" ? value.toFixed(1) : value}%
        </text>
      </svg>
      <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 800, color: c.muted, letterSpacing: 0.5 }}>{label}</p>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────
function Pill({ emoji, label, value, color }) {
  return (
    <div style={{ background: c.pill, border: `1px solid ${color}33`, borderRadius: 14, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 9, color: c.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      </div>
    </div>
  );
}

// ── Resource row ─────────────────────────────────────────────
function ResourceRow({ emoji, label, value, unit = "", urgent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${c.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontSize: 11, color: c.text, fontWeight: 600 }}>{label}</span>
        {urgent && <span style={{ background: `${c.red}22`, border: `1px solid ${c.red}44`, padding: "1px 6px", borderRadius: 999, fontSize: 8, color: c.red, fontWeight: 800 }}>URGENT</span>}
      </div>
      <span style={{ fontSize: 13, fontWeight: 900, color: urgent ? c.red : c.gold }}>{typeof value === "number" ? value.toLocaleString() : value}{unit}</span>
    </div>
  );
}

// ── Step input ────────────────────────────────────────────────
function StepInput({ label, sub, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 800, color: c.text }}>{label}</p>
      {sub && <p style={{ margin: "0 0 8px", fontSize: 10, color: c.muted }}>{sub}</p>}
      {children}
    </div>
  );
}

const SELECT_STYLE = {
  width: "100%", background: c.pill, border: `1px solid ${c.border}`,
  borderRadius: 12, padding: "13px 14px", color: c.text,
  fontSize: 13, fontWeight: 600, outline: "none", cursor: "pointer",
  appearance: "none",
};

const INPUT_STYLE = {
  width: "100%", background: c.pill, border: `1px solid ${c.border}`,
  borderRadius: 12, padding: "13px 14px", color: c.text,
  fontSize: 14, fontWeight: 700, outline: "none",
  boxSizing: "border-box",
};

// ── Calculation trace ─────────────────────────────────────────
function CalcTrace({ result }) {
  return (
    <div style={{ background: "#0a0810", border: `1px solid ${c.border}`, borderRadius: 14, padding: 14, marginTop: 12 }}>
      <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, color: c.muted, letterSpacing: 1 }}>📐 HOW IT WAS CALCULATED</p>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#9d8fc0", lineHeight: 2 }}>
        <p style={{ margin: 0 }}>k = 0.02 (growth constant)</p>
        <p style={{ margin: 0 }}>FireIntensity = 0.02 × {result.timeMinutes}² = <span style={{ color: c.orange, fontWeight: 900 }}>{result.fireIntensity.toFixed(4)}</span></p>
        <p style={{ margin: 0 }}>FVI ({result.buildingName.split(" ")[0]}) = <span style={{ color: c.gold }}>{result.building.FVI}</span></p>
        <p style={{ margin: 0 }}>FloorRisk (Floor {result.floorNumber}/{result.building.totalFloors}) = <span style={{ color: c.gold }}>{result.floorRisk}</span></p>
        <p style={{ margin: "4px 0", borderTop: `1px solid ${c.border}`, paddingTop: 6, color: c.text, fontWeight: 900 }}>
          Damage% = {result.fireIntensity.toFixed(4)} × {result.building.FVI} × {result.floorRisk} × 100 = <span style={{ color: ALERT_COLOR[result.alertLevel] }}>{result.damagePercent.toFixed(2)}%</span>
        </p>
        <p style={{ margin: 0 }}>Occupancy = {result.estimatedOccupancy} ({result.occupancySource})</p>
        <p style={{ margin: 0 }}>Injured = {(result.damagePercent/100).toFixed(4)} × {result.estimatedOccupancy} × 0.40 = <span style={{ color: c.red }}>{result.injured}</span></p>
        <p style={{ margin: 0 }}>Trapped = {(result.damagePercent/100).toFixed(4)} × {result.estimatedOccupancy} × 0.25 = <span style={{ color: c.red }}>{result.trapped}</span></p>
        <p style={{ margin: 0 }}>Displaced = {(result.damagePercent/100).toFixed(4)} × {result.estimatedOccupancy} × 0.60 = <span style={{ color: c.gold }}>{result.displaced}</span></p>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function FireAssessment() {
  const navigate = useNavigate();
  const user     = getUser();
  const isAdmin  = user?.role === "admin";

  const [buildings, setBuildings] = useState([]);
  const [form,      setForm]      = useState({ buildingName: "", floorNumber: "", timeMinutes: "", peoplePresent: "" });
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [tab,       setTab]       = useState("casualties");
  const [showCalc,  setShowCalc]  = useState(false);

  // Load buildings
  useEffect(() => {
    fetch(`${BASE_URL}/fire/buildings`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => { if (d.buildings) setBuildings(d.buildings); });
  }, []);

  const selectedBuilding = buildings.find(b => b.name === form.buildingName);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.buildingName || !form.floorNumber || !form.timeMinutes) {
      setError("Building, floor, and time are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/fire/assess`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setResult(data); setTab("casualties"); }
      else setError(data.message || "Assessment failed");
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const alertColor = result ? ALERT_COLOR[result.alertLevel] : c.orange;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "system-ui", display: "flex", justifyContent: "center" }}>
    <div style={{ width: "100%", maxWidth: 430, padding: "16px 16px 60px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
          style={{ background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", color: c.text }}>
          <ChevronLeft size={20}/>
        </button>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>🔥 Fire Assessment</p>
          <p style={{ margin: 0, fontSize: 10, color: c.muted }}>Automated Damage & Needs Engine</p>
        </div>
        <div style={{ width: 44 }}/>
      </div>

      {/* Input Form */}
      {!result && (
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 20, padding: 18, marginBottom: 14 }}>
          <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 800, color: c.orange, letterSpacing: 0.5 }}>🔥 ENTER FIRE DETAILS</p>

          {/* Building */}
          <StepInput label="1. Building Name" sub="Select affected building">
            <div style={{ position: "relative" }}>
              <select value={form.buildingName} onChange={e => { set("buildingName", e.target.value); set("floorNumber", ""); }}
                style={SELECT_STYLE}>
                <option value="">— Select Building —</option>
                {buildings.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
              {selectedBuilding && (
                <div style={{ marginTop: 8, background: `${c.orange}12`, border: `1px solid ${c.orange}30`, borderRadius: 10, padding: "7px 12px", display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 9, color: c.muted }}>Floors: <b style={{ color: c.text }}>{selectedBuilding.totalFloors}</b></span>
                  <span style={{ fontSize: 9, color: c.muted }}>Capacity: <b style={{ color: c.text }}>{selectedBuilding.capacity.toLocaleString()}</b></span>
                  <span style={{ fontSize: 9, color: c.muted }}>FVI: <b style={{ color: c.orange }}>{selectedBuilding.FVI}</b></span>
                </div>
              )}
            </div>
          </StepInput>

          {/* Floor */}
          <StepInput label="2. Floor Number" sub={selectedBuilding ? `Building has ${selectedBuilding.totalFloors} floors` : "Select building first"}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {selectedBuilding
                ? Array.from({ length: selectedBuilding.totalFloors }, (_, i) => i + 1).map(f => (
                    <button key={f} onClick={() => set("floorNumber", f)}
                      style={{
                        padding: "12px 0", borderRadius: 10, border: `1px solid ${form.floorNumber == f ? c.orange : c.border}`,
                        background: form.floorNumber == f ? `${c.orange}25` : c.pill,
                        color: form.floorNumber == f ? c.orange : c.muted,
                        fontWeight: 900, fontSize: 13, cursor: "pointer",
                      }}>
                      {f}{f === 1 ? "G" : f === selectedBuilding.totalFloors ? "T" : ""}
                    </button>
                  ))
                : <p style={{ gridColumn: "span 4", margin: 0, fontSize: 11, color: c.muted, padding: 8 }}>Select a building first</p>
              }
            </div>
            {form.floorNumber && selectedBuilding && (
              <p style={{ margin: "6px 0 0", fontSize: 10, color: c.muted }}>
                Risk: {form.floorNumber == 1 ? "🟢 Ground (lowest)" : form.floorNumber == selectedBuilding.totalFloors ? "🔴 Top floor (highest)" : "🟡 Middle floor"}
              </p>
            )}
          </StepInput>

          {/* Time */}
          <StepInput label="3. Time Since Fire Started" sub="Minutes since ignition — determines fire intensity">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
              {[2, 5, 10, 15, 20, 30, 45, 60].map(t => (
                <button key={t} onClick={() => set("timeMinutes", t)}
                  style={{
                    padding: "11px 0", borderRadius: 10, border: `1px solid ${form.timeMinutes == t ? c.red : c.border}`,
                    background: form.timeMinutes == t ? `${c.red}25` : c.pill,
                    color: form.timeMinutes == t ? c.red : c.muted,
                    fontWeight: 800, fontSize: 12, cursor: "pointer",
                  }}>
                  {t}m
                </button>
              ))}
            </div>
            <input type="number" placeholder="Or type custom minutes..."
              value={form.timeMinutes} onChange={e => set("timeMinutes", e.target.value)}
              style={{ ...INPUT_STYLE, fontSize: 13 }}/>
            {form.timeMinutes > 0 && (
              <p style={{ margin: "6px 0 0", fontSize: 10, color: c.muted }}>
                Fire intensity = 0.02 × {form.timeMinutes}² = <span style={{ color: c.orange, fontWeight: 800 }}>{Math.min(1, 0.02 * form.timeMinutes ** 2).toFixed(3)}</span> (capped at 1.0)
              </p>
            )}
          </StepInput>

          {/* People (optional) */}
          <StepInput label="4. People Present (Optional)" sub="Leave blank for auto-estimation based on time of day">
            <input type="number" placeholder="Auto-estimated if blank..."
              value={form.peoplePresent} onChange={e => set("peoplePresent", e.target.value)}
              style={{ ...INPUT_STYLE, fontSize: 13 }}/>
          </StepInput>

          {error && (
            <p style={{ margin: "0 0 12px", fontSize: 11, color: c.red, fontWeight: 700 }}>{error}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", background: loading ? c.pill : `linear-gradient(135deg, ${c.red}, ${c.orange})`, border: "none", borderRadius: 14, padding: "15px", color: "#fff", fontWeight: 900, fontSize: 15, cursor: loading ? "default" : "pointer", letterSpacing: 0.5 }}>
            {loading ? "⏳ Running Assessment..." : "🔥 Run Fire Assessment"}
          </button>

          <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 9, color: c.muted }}>
            NO MANUAL SEVERITY — Fully automated calculation
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Alert level banner */}
          <div style={{ background: ALERT_BG[result.alertLevel], border: `2px solid ${alertColor}`, borderRadius: 20, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: alertColor }}>{ALERT_LABEL[result.alertLevel]}</p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: c.muted }}>{result.buildingName} — Floor {result.floorNumber}/{result.building.totalFloors}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: c.muted }}>{result.timeMinutes} min since ignition</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: alertColor, lineHeight: 1 }}>{result.damagePercent.toFixed(1)}%</p>
                <p style={{ margin: "2px 0 0", fontSize: 9, color: c.muted }}>DAMAGE</p>
              </div>
            </div>

            {/* 3 gauges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, background: `${c.pill}aa`, borderRadius: 14, padding: 12 }}>
              <Gauge value={result.fireIntensity * 100} max={100} color={c.red}    label="FIRE INTENSITY"/>
              <Gauge value={result.damagePercent}       max={100} color={alertColor} label="DAMAGE %"/>
              <Gauge value={result.floorRisk * 100}     max={100} color={c.gold}   label="FLOOR RISK"/>
            </div>

            <p style={{ margin: "10px 0 0", fontSize: 10, color: c.muted, textAlign: "center" }}>
              🤖 Alert auto-sent to all users • Broadcast saved to Alerts tab
            </p>
          </div>

          {/* Occupancy info */}
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={16} color={c.blue}/>
            <div>
              <span style={{ fontSize: 13, fontWeight: 900, color: c.blue }}>{result.estimatedOccupancy.toLocaleString()} people</span>
              <span style={{ fontSize: 10, color: c.muted }}> estimated in building ({result.occupancySource})</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {["casualties", "resources", "formula"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "9px 4px", borderRadius: 10, border: `1px solid ${tab === t ? alertColor : c.border}`, background: tab === t ? `${alertColor}20` : c.pill, color: tab === t ? alertColor : c.muted, fontWeight: 800, fontSize: 10, cursor: "pointer", textTransform: "capitalize" }}>
                {t === "casualties" ? "🏥 Casualties" : t === "resources" ? "📦 Resources" : "📐 Formula"}
              </button>
            ))}
          </div>

          {/* Casualties tab */}
          {tab === "casualties" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Pill emoji="🤕" label="Injured"   value={result.injured}   color={c.gold}/>
              <Pill emoji="🚨" label="Critical"  value={result.critical}  color={c.red}/>
              <Pill emoji="⛓️" label="Trapped"   value={result.trapped}   color={c.red}/>
              <Pill emoji="🏠" label="Displaced" value={result.displaced}  color={c.orange}/>
            </div>
          )}

          {/* Resources tab */}
          {tab === "resources" && (
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "4px 14px" }}>
              <ResourceRow emoji="🚒" label="Fire Engines"   value={result.fireEngines}              urgent={true}/>
              <ResourceRow emoji="🚑" label="Ambulances"     value={result.ambulances}               urgent={true}/>
              <ResourceRow emoji="⛑️" label="Rescue Teams"   value={result.rescueTeams}              urgent={result.trapped > 0}/>
              <ResourceRow emoji="🏥" label="Medical Camps"  value={result.medicalCamps}/>
              <ResourceRow emoji="🔥" label="Foam Units"     value={result.foamUnits}/>
              <ResourceRow emoji="🍱" label="Food Packets"   value={result.foodPackets}              unit=" packs"/>
              <ResourceRow emoji="💧" label="Water Supply"   value={`${result.waterLiters.toLocaleString()}`} unit="L"/>
            </div>
          )}

          {/* Formula tab */}
          {tab === "formula" && <CalcTrace result={result}/>}

          {/* Reset button */}
          <button onClick={() => { setResult(null); setForm({ buildingName:"",floorNumber:"",timeMinutes:"",peoplePresent:"" }); }}
            style={{ marginTop: 16, width: "100%", background: c.pill, border: `1px solid ${c.border}`, borderRadius: 14, padding: "13px", color: c.muted, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            🔄 New Assessment
          </button>
        </>
      )}

    </div>
    </div>
  );
}