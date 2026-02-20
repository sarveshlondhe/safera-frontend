import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, Lock, Mail, Zap, ChevronRight, Phone, Info, Eye, EyeOff } from "lucide-react";
import { authAPI, saveAuth } from "../api.js";

export default function CampusDisasterLogin() {
  const [mode, setMode]         = useState("login");
  const [role, setRole]         = useState("user");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  const c = { bg: "#0f0f13", card: "#1a1a24", input: "#121218", red: "#ff3b30", border: "#2d2d38", muted: "#8e8e93" };

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) return setError("Email and password are required.");
    if (mode === "register" && !name) return setError("Full name is required.");
    setLoading(true);
    try {
      const data = mode === "login"
        ? await authAPI.login({ email, password })
        : await authAPI.register({ name, email, password, role });
      saveAuth(data.token, data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Emergency call works on all browsers
  const handleEmergencyCall = () => {
    const a = document.createElement("a");
    a.href = "tel:112";
    a.click();
  };

  const inp = { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 12, padding: "14px 44px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
  const iconL = { position: "absolute", left: 14, top: 38, color: "#555" };
  const lbl = { display: "block", fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui", color: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 400, background: c.card, borderRadius: 24, padding: 32, border: `1px solid ${c.border}`, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, background: c.red, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 20px ${c.red}66` }}>
            <Zap size={32} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Campus Disaster Intelligence</h1>
          <p style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>AISSMS College of Engineering, Pune</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {["login", "register"].map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(""); }}
              style={{ padding: 10, borderRadius: 12, border: `2px solid ${mode === m ? c.red : c.border}`, background: mode === m ? `${c.red}15` : c.input, color: mode === m ? c.red : c.muted, fontWeight: 800, fontSize: 12, cursor: "pointer", textTransform: "uppercase" }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: "#ff3b3018", border: "1px solid #ff3b3055", borderRadius: 12, padding: 12, fontSize: 12, color: "#ff6b63", marginBottom: 16, textAlign: "center" }}>
            ⚠️ {error}
          </div>
        )}

        {mode === "register" && (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <label style={lbl}>Full Name</label>
            <User size={18} style={iconL} />
            <input style={inp} type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}

        <div style={{ position: "relative", marginBottom: 16 }}>
          <label style={lbl}>University Email</label>
          <Mail size={18} style={iconL} />
          <input style={inp} type="email" placeholder="name@aissms.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
        </div>

        <div style={{ position: "relative", marginBottom: 20 }}>
          <label style={lbl}>Password</label>
          <Lock size={18} style={iconL} />
          <input style={inp} type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 14, top: 38, background: "none", border: "none", cursor: "pointer", color: "#555", padding: 0 }}>
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {mode === "register" && (
          <>
            <label style={lbl}>Select Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[{ val: "admin", icon: <Shield size={22} color={role === "admin" ? c.red : "#555"} />, label: "Admin", sub: "FULL ACCESS" },
                { val: "user", icon: <User size={22} color={role === "user" ? c.red : "#555"} />, label: "User", sub: "VIEW & RESPOND" }
              ].map(({ val, icon, label, sub }) => (
                <button key={val} type="button" onClick={() => setRole(val)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 14, borderRadius: 16, border: `2px solid ${role === val ? c.red : c.border}`, background: role === val ? `${c.red}15` : c.input, cursor: "pointer" }}>
                  {icon}
                  <span style={{ fontSize: 13, fontWeight: 700, marginTop: 8, color: role === val ? c.red : "#fff" }}>{label}</span>
                  <span style={{ fontSize: 9, color: c.muted }}>{sub}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button type="button" onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", background: c.red, border: "none", borderRadius: 16, color: "#fff", padding: 16, fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: loading ? "not-allowed" : "pointer", marginBottom: 16, boxShadow: `0 8px 20px ${c.red}44`, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Please wait…" : mode === "login" ? "Access Command Center" : "Create Account"}
          {!loading && <ChevronRight size={18} />}
        </button>

        <div style={{ display: "flex", gap: 12, padding: 12, background: c.input, borderRadius: 12, border: `1px solid ${c.border}`, marginBottom: 16 }}>
          <Info size={18} color={c.muted} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 10, color: c.muted, margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: "#ccc" }}>AISSMS Campus Safety:</strong>{" "}
            {mode === "login" ? "Sign in with your registered campus credentials." : "Register with your AISSMS email to get started."}
          </p>
        </div>

        {/* ✅ FIXED Emergency Call Button */}
        <button type="button" onClick={handleEmergencyCall}
          style={{ width: "100%", background: c.red, border: "none", borderRadius: 16, color: "#fff", padding: 16, fontWeight: 900, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: `0 8px 20px ${c.red}44` }}>
          <Phone size={22} fill="white" /> EMERGENCY CALL — 112
        </button>
      </div>
    </div>
  );
}
