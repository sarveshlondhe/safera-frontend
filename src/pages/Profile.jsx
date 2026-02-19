import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Building, Lock, Save, CheckCircle, AlertCircle } from "lucide-react";
import { userAPI, getUser, getToken, saveAuth, clearAuth } from "../api.js";

const c = { bg: "#0f0f13", card: "#1a1a24", input: "#121218", border: "#2d2d38", red: "#ff3b30", muted: "#8e8e93", green: "#30d158" };
const inp = { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px 12px 12px 42px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const lbl = { display: "block", fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 };
const icoL = { position: "absolute", left: 12, top: 34, color: "#555" };

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(getUser());
  const [name, setName]       = useState(user?.name || "");
  const [phone, setPhone]     = useState(user?.phone || "");
  const [dept, setDept]       = useState(user?.department || "");
  const [curPw, setCurPw]     = useState("");
  const [newPw, setNewPw]     = useState("");
  const [msg, setMsg]         = useState(null);
  const [saving, setSaving]   = useState(false);
  const [pwSave, setPwSave]   = useState(false);

  useEffect(() => {
    userAPI.getProfile().then((d) => {
      setUser(d.user); setName(d.user.name || ""); setPhone(d.user.phone || ""); setDept(d.user.department || "");
    }).catch(() => {});
  }, []);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({ name, phone, department: dept });
      const updated = { ...user, name, phone, department: dept };
      saveAuth(getToken(), updated);
      setUser(updated);
      flash("success", "Profile updated successfully!");
    } catch (err) { flash("error", err.message); }
    finally { setSaving(false); }
  };

  const handlePw = async () => {
    if (!curPw || !newPw) return flash("error", "Both fields are required.");
    if (newPw.length < 6) return flash("error", "New password must be at least 6 characters.");
    setPwSave(true);
    try {
      await userAPI.changePassword({ currentPassword: curPw, newPassword: newPw });
      setCurPw(""); setNewPw("");
      flash("success", "Password changed!");
    } catch (err) { flash("error", err.message); }
    finally { setPwSave(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: "#fff", padding: 18, fontFamily: "system-ui", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={() => navigate(-1)}
          style={{ background: c.card, border: `1px solid ${c.border}`, color: "#fff", padding: "10px 14px", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 2 }}>My Profile</h2>
        <p style={{ fontSize: 12, color: c.muted, marginBottom: 20 }}>
          {user?.email} &nbsp;·&nbsp;
          <span style={{ color: user?.role === "admin" ? c.red : c.green, fontWeight: 800, textTransform: "uppercase", fontSize: 10 }}>{user?.role}</span>
        </p>

        {/* Toast */}
        {msg && (
          <div style={{ background: msg.type === "success" ? "#30d15820" : "#ff3b3018", border: `1px solid ${msg.type === "success" ? c.green : c.red}55`, borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: msg.type === "success" ? c.green : "#ff6b63", display: "flex", alignItems: "center", gap: 8 }}>
            {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {msg.text}
          </div>
        )}

        {/* Profile Info */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Personal Information</p>

          {[
            { label: "Full Name", icon: <User size={16} style={icoL} />, val: name, set: setName, type: "text", ph: "Your full name" },
            { label: "Email", icon: <Mail size={16} style={icoL} />, val: user?.email || "", set: null, type: "email", ph: "", readOnly: true },
            { label: "Phone Number", icon: <Phone size={16} style={icoL} />, val: phone, set: setPhone, type: "tel", ph: "+91 98765 43210" },
            { label: "Department", icon: <Building size={16} style={icoL} />, val: dept, set: setDept, type: "text", ph: "e.g. Computer Science" },
          ].map(({ label, icon, val, set, type, ph, readOnly }) => (
            <div key={label} style={{ position: "relative", marginBottom: 14 }}>
              <label style={lbl}>{label}</label>
              {icon}
              <input style={{ ...inp, opacity: readOnly ? 0.6 : 1 }} type={type} value={val} placeholder={ph}
                onChange={set ? (e) => set(e.target.value) : undefined} readOnly={readOnly} />
            </div>
          ))}

          <button onClick={handleSave} disabled={saving}
            style={{ width: "100%", background: c.red, border: "none", borderRadius: 14, color: "#fff", padding: 14, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Save size={16} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {/* Change Password */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 20, marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Change Password</p>
          {[
            { label: "Current Password", val: curPw, set: setCurPw, ph: "••••••••" },
            { label: "New Password", val: newPw, set: setNewPw, ph: "Min. 6 characters" },
          ].map(({ label, val, set, ph }) => (
            <div key={label} style={{ position: "relative", marginBottom: 14 }}>
              <label style={lbl}>{label}</label>
              <Lock size={16} style={icoL} />
              <input style={inp} type="password" value={val} placeholder={ph} onChange={(e) => set(e.target.value)} />
            </div>
          ))}
          <button onClick={handlePw} disabled={pwSave}
            style={{ width: "100%", background: "#25252e", border: `1px solid ${c.border}`, borderRadius: 14, color: "#fff", padding: 14, fontWeight: 900, cursor: pwSave ? "not-allowed" : "pointer", opacity: pwSave ? 0.7 : 1 }}>
            {pwSave ? "Updating…" : "Update Password"}
          </button>
        </div>

        {/* Logout */}
        <button onClick={() => { clearAuth(); navigate("/"); }}
          style={{ width: "100%", background: "#1a1a24", border: `1px solid ${c.red}55`, padding: 14, borderRadius: 16, color: c.red, fontWeight: 900, cursor: "pointer", fontSize: 15 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
