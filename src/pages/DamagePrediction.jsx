import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Zap, Flame, Waves, Wind, Activity, CheckCircle } from "lucide-react";

const c = { bg: "#0f0f13", card: "#1a1a24", border: "#2d2d38", muted: "#8e8e93", red: "#ff3b30", pill: "#121218" };

const BUILDINGS = [
  { name: "COE Engineering College",     floors: 4, age: 25, material: "RCC",  emoji: "🏫" },
  { name: "IOIT College",                floors: 4, age: 20, material: "RCC",  emoji: "🏛️" },
  { name: "Pharmacy College",            floors: 3, age: 18, material: "RCC",  emoji: "🏥" },
  { name: "Polytechnic College",         floors: 3, age: 22, material: "RCC",  emoji: "🔧" },
  { name: "Sports Ground (Shivgarjana)", floors: 1, age: 30, material: "Open", emoji: "🏟️" },
  { name: "Basketball Court",            floors: 1, age: 15, material: "Open", emoji: "🏀" },
];

const DISASTERS = [
  { key: "Fire",       icon: <Flame    size={20} />, color: "#ff6b35" },
  { key: "Earthquake", icon: <Activity size={20} />, color: "#ff3b30" },
  { key: "Flood",      icon: <Waves    size={20} />, color: "#0a84ff" },
  { key: "Cyclone",    icon: <Wind     size={20} />, color: "#5e5ce6" },
];

const calcRisk = ({ disaster, magnitude, buildingName, floors, age, material, occupants }) => {
  let score = (magnitude / 10) * 35;
  score += age > 30 ? 20 : age > 15 ? 10 : 4;
  score += material === "RCC" ? 8 : material === "Open" ? 1 : 22;
  score += floors > 3 ? 12 : floors > 1 ? 6 : 1;
  score += occupants > 500 ? 10 : occupants > 200 ? 6 : occupants > 100 ? 3 : 0;
  if (disaster === "Earthquake") score *= 1.2;
  if (disaster === "Fire")       score *= 1.1;
  if (disaster === "Flood" && material === "Open") score *= 1.5;
  if (disaster === "Cyclone")    score *= 1.05;
  score = Math.min(100, Math.round(score));

  if (score >= 75) return { score, level: "CRITICAL",  color: "#ff3b30", bg: "#ff3b3018", action: "🚨 Immediate evacuation! Alert campus security NOW." };
  if (score >= 50) return { score, level: "HIGH RISK", color: "#ff9f0a", bg: "#ff9f0a18", action: "⚠️ Evacuate within 10 minutes. Notify NSS coordinator." };
  if (score >= 25) return { score, level: "MODERATE",  color: "#ffd60a", bg: "#ffd60a18", action: "🔶 Stay alert. Follow campus safety protocols." };
  return              { score, level: "LOW RISK",  color: "#30d158", bg: "#30d15818", action: "✅ Monitor situation. No immediate action needed." };
};

export default function DamagePrediction() {
  const navigate = useNavigate();
  const [disaster,  setDisaster]  = useState("Earthquake");
  const [magnitude, setMagnitude] = useState(5);
  const [idx,       setIdx]       = useState(0);
  const [floors,    setFloors]    = useState(BUILDINGS[0].floors);
  const [age,       setAge]       = useState(BUILDINGS[0].age);
  const [material,  setMaterial]  = useState(BUILDINGS[0].material);
  const [occupants, setOccupants] = useState(200);
  const [result,    setResult]    = useState(null);

  const selectBuilding = (i) => {
    setIdx(i);
    setFloors(BUILDINGS[i].floors);
    setAge(BUILDINGS[i].age);
    setMaterial(BUILDINGS[i].material);
    setResult(null);
  };

  const run = () => {
    setResult(calcRisk({ disaster, magnitude, buildingName: BUILDINGS[idx].name, floors, age, material, occupants }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inp = { width: "100%", background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: "#fff", padding: 18, fontFamily: "system-ui", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button type="button" onClick={() => navigate("/dashboard")}
            style={{ background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", color: "#fff" }}>
            <ChevronLeft />
          </button>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>Risk Assessment</p>
            <p style={{ fontSize: 11, color: c.muted, margin: 0 }}>AISSMS Campus Analysis</p>
          </div>
          <div style={{ width: 44, height: 44, background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, display: "grid", placeItems: "center", color: c.red }}>
            <Zap size={18} />
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: result.bg, border: `2px solid ${result.color}`, borderRadius: 18, padding: 20, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: c.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Assessment Result</div>
            <div style={{ fontSize: 54, fontWeight: 900, color: result.color, lineHeight: 1 }}>{result.score}%</div>
            <div style={{ marginTop: 8, display: "inline-block", background: `${result.color}22`, border: `1px solid ${result.color}55`, borderRadius: 999, padding: "6px 20px", fontWeight: 900, fontSize: 14, color: result.color }}>
              {result.level}
            </div>
            <p style={{ marginTop: 10, fontWeight: 800, fontSize: 13 }}>{BUILDINGS[idx].emoji} {BUILDINGS[idx].name}</p>
            <p style={{ fontSize: 11, color: c.muted }}>
              {disaster} | Magnitude: {magnitude}/10 | Age: {age} yrs | Floors: {floors} | Occupants: {occupants}
            </p>
            <div style={{ marginTop: 10, background: `${result.color}18`, borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: result.color }}>{result.action}</p>
            </div>
            <button onClick={() => setResult(null)}
              style={{ marginTop: 12, background: c.pill, border: `1px solid ${c.border}`, color: "#fff", padding: "10px 24px", borderRadius: 12, cursor: "pointer", fontWeight: 800 }}>
              New Assessment
            </button>
          </div>
        )}

        {/* Form */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 20 }}>

          {/* Disaster Type */}
          <label style={lbl}>Disaster Type</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {DISASTERS.map(({ key, icon, color }) => (
              <button key={key} type="button" onClick={() => setDisaster(key)}
                style={{ background: c.pill, border: `2px solid ${disaster === key ? color : c.border}`, borderRadius: 14, padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, boxShadow: disaster === key ? `0 0 16px ${color}44` : "none" }}>
                <div style={{ color: disaster === key ? color : "#888" }}>{icon}</div>
                <span style={{ fontSize: 13, fontWeight: 900, color: disaster === key ? color : "#fff" }}>{key}</span>
              </button>
            ))}
          </div>

          {/* Campus Location */}
          <label style={lbl}>Select Campus Location</label>
          <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
            {BUILDINGS.map((b, i) => (
              <button key={b.name} type="button" onClick={() => selectBuilding(i)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: `2px solid ${idx === i ? c.red : c.border}`, background: idx === i ? `${c.red}15` : c.pill, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 22 }}>{b.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: idx === i ? c.red : "#fff" }}>{b.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: c.muted }}>Auto-filled: {b.floors} floors · {b.age} yrs · {b.material}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Magnitude */}
          <label style={lbl}>
            Severity / Magnitude — <span style={{ color: c.red }}>{magnitude}/10</span>{" "}
            <span style={{ color: c.muted }}>({magnitude < 4 ? "MINOR" : magnitude < 6 ? "MODERATE" : magnitude < 8 ? "MAJOR" : "SEVERE"})</span>
          </label>
          <input type="range" min={1} max={10} value={magnitude}
            onChange={(e) => setMagnitude(Number(e.target.value))}
            style={{ width: "100%", accentColor: c.red, marginBottom: 4 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: c.muted, marginBottom: 20 }}>
            <span>MINOR</span><span>MODERATE</span><span>MAJOR</span><span>SEVERE</span>
          </div>

          {/* Number of Floors */}
          <label style={lbl}>Number of Floors</label>
          <input type="number" min={1} max={20} value={floors}
            onChange={(e) => setFloors(Number(e.target.value))}
            style={{ ...inp, marginBottom: 16 }} />

          {/* Building Age - RESTORED ✅ */}
          <label style={lbl}>Building Age (years)</label>
          <input type="number" min={1} max={100} value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            style={{ ...inp, marginBottom: 16 }} />

          {/* Construction Material */}
          <label style={lbl}>Construction Material</label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)}
            style={{ ...inp, marginBottom: 16, appearance: "none" }}>
            {["RCC", "Steel Frame", "Old Brick", "Open"].map((m) => (
              <option key={m} value={m} style={{ background: c.bg }}>{m}</option>
            ))}
          </select>

          {/* Estimated Occupants */}
          <label style={lbl}>Estimated Occupants</label>
          <input type="number" min={0} max={3000} value={occupants}
            onChange={(e) => setOccupants(Number(e.target.value))}
            style={{ ...inp, marginBottom: 20 }} />

          {/* Submit */}
          <button type="button" onClick={run}
            style={{ width: "100%", background: c.red, border: "none", borderRadius: 14, padding: 16, fontWeight: 900, fontSize: 15, cursor: "pointer", color: "#fff", boxShadow: `0 8px 20px ${c.red}44`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <CheckCircle size={18} /> RUN RISK ASSESSMENT
          </button>
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
