import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Megaphone, Building2, PhoneCall, Users, Siren, LogOut, CheckCircle, RefreshCw, X, Send } from "lucide-react";
import { userAPI, sosAPI, broadcastAPI, clearAuth, getUser } from "../api.js";

const c = { bg: "#0f0f13", card: "#1a1a24", border: "#2d2d38", muted: "#8e8e93", red: "#ff3b30", pill: "#121218" };

const LEVELS = ["INFO", "WARNING", "CRITICAL"];
const TYPES  = ["General", "Fire", "Flood", "Earthquake", "Cyclone", "Security"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = getUser();

  const [users,      setUsers]      = useState([]);
  const [sosAlerts,  setSOS]        = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("overview");

  // Broadcast form
  const [showForm,   setShowForm]   = useState(false);
  const [bTitle,     setBTitle]     = useState("");
  const [bMsg,       setBMsg]       = useState("");
  const [bLevel,     setBLevel]     = useState("CRITICAL");
  const [bType,      setBType]      = useState("General");
  const [sending,    setSending]    = useState(false);
  const [sent,       setSent]       = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, bRes] = await Promise.all([
        userAPI.getAllUsers(),
        sosAPI.allAlerts(),
        broadcastAPI.getAll(),
      ]);
      setUsers(uRes.users || []);
      setSOS(sRes.alerts || []);
      setBroadcasts(bRes.broadcasts || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const sendBroadcast = async () => {
    if (!bTitle.trim() || !bMsg.trim()) return alert("Title and message are required!");
    setSending(true);
    try {
      await broadcastAPI.send({ title: bTitle, message: bMsg, level: bLevel, type: bType });
      setSent(true);
      setBTitle(""); setBMsg(""); setBLevel("CRITICAL"); setBType("General");
      setShowForm(false);
      await loadData();
      setTimeout(() => setSent(false), 3000);
    } catch (err) { alert("Failed: " + err.message); }
    finally { setSending(false); }
  };

  const deleteBroadcast = async (id) => {
    if (!confirm("Delete this broadcast?")) return;
    try { await broadcastAPI.delete(id); setBroadcasts((prev) => prev.filter((b) => b._id !== id)); }
    catch (err) { alert("Failed: " + err.message); }
  };

  const resolveAlert = async (id) => {
    try {
      await sosAPI.updateStatus(id, "resolved");
      setSOS((prev) => prev.map((a) => a._id === id ? { ...a, status: "resolved" } : a));
    } catch (err) { alert("Failed: " + err.message); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try { await userAPI.deleteUser(id); setUsers((prev) => prev.filter((u) => u._id !== id)); }
    catch (err) { alert("Failed: " + err.message); }
  };

  const activeAlerts = sosAlerts.filter((a) => a.status === "active");

  const tabBtn = (key, label) => ({
    padding: "10px 14px", borderRadius: 12, border: `1px solid ${tab === key ? c.red : c.border}`,
    background: tab === key ? `${c.red}15` : c.pill, color: tab === key ? c.red : "#fff",
    fontWeight: 800, fontSize: 12, cursor: "pointer",
  });

  const levelColor = (l) => l === "CRITICAL" ? "#ff3b30" : l === "WARNING" ? "#ff9f0a" : "#0a84ff";

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: "#fff", fontFamily: "system-ui", padding: 18, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, display: "grid", placeItems: "center" }}>
            <Zap size={18} color={c.red} />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>Admin Control Center</p>
            <p style={{ fontSize: 10, color: c.muted, margin: 0 }}>AISSMS Campus — Full Access</p>
          </div>
          <button onClick={() => { clearAuth(); navigate("/"); }}
            style={{ background: "transparent", border: `1px solid ${c.border}`, borderRadius: 12, padding: "10px 12px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800 }}>
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Total Users",  value: users.length,                                    color: "#30d158" },
            { label: "Active SOS",   value: activeAlerts.length,                             color: c.red },
            { label: "Broadcasts",   value: broadcasts.length,                               color: "#0a84ff" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color }}>{loading ? "…" : value}</div>
              <div style={{ fontSize: 10, color: c.muted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button style={tabBtn("overview",   "Overview")}   onClick={() => setTab("overview")}>Overview</button>
          <button style={tabBtn("users",      `Users (${users.length})`)} onClick={() => setTab("users")}>Users ({users.length})</button>
          <button style={tabBtn("sos",        "SOS")}        onClick={() => setTab("sos")}>
            SOS {activeAlerts.length > 0 && <span style={{ color: c.red }}>({activeAlerts.length})</span>}
          </button>
          <button style={tabBtn("broadcasts", "Alerts")}     onClick={() => setTab("broadcasts")}>Alerts</button>
          <button onClick={loadData} style={{ marginLeft: "auto", background: c.pill, border: `1px solid ${c.border}`, borderRadius: 12, padding: "10px 12px", color: "#fff", cursor: "pointer" }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {/* Broadcast Card */}
            <div style={{ background: "#1a0d0f", border: `1px solid ${c.red}55`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Megaphone size={16} color={c.red} /> Emergency Broadcast
              </p>

              {sent && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#30d158", fontWeight: 800, marginBottom: 12, fontSize: 13 }}>
                  <CheckCircle size={16} /> Alert broadcasted to all campus users! ✅
                </div>
              )}

              {!showForm ? (
                <button onClick={() => setShowForm(true)}
                  style={{ width: "100%", background: c.red, border: "none", borderRadius: 14, padding: 14, color: "#fff", cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: `0 8px 20px ${c.red}44` }}>
                  <Megaphone size={18} /> Send Critical Alert to Campus
                </button>
              ) : (
                <div>
                  {/* Level */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", marginBottom: 6 }}>Alert Level</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {LEVELS.map((l) => (
                      <button key={l} onClick={() => setBLevel(l)}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `2px solid ${bLevel === l ? levelColor(l) : c.border}`, background: bLevel === l ? `${levelColor(l)}18` : c.pill, color: bLevel === l ? levelColor(l) : "#fff", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {/* Type */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", marginBottom: 6 }}>Disaster Type</p>
                  <select value={bType} onChange={(e) => setBType(e.target.value)}
                    style={{ width: "100%", background: c.pill, border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", marginBottom: 14 }}>
                    {TYPES.map((t) => <option key={t} value={t} style={{ background: c.bg }}>{t}</option>)}
                  </select>

                  {/* Title */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", marginBottom: 6 }}>Alert Title</p>
                  <input value={bTitle} onChange={(e) => setBTitle(e.target.value)}
                    placeholder="e.g. Fire Alert — Mechanical Workshop"
                    style={{ width: "100%", background: c.pill, border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

                  {/* Message */}
                  <p style={{ fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", marginBottom: 6 }}>Message</p>
                  <textarea value={bMsg} onChange={(e) => setBMsg(e.target.value)}
                    placeholder="Describe the emergency situation and what students should do..."
                    rows={4}
                    style={{ width: "100%", background: c.pill, border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 14 }} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button onClick={() => { setShowForm(false); setBTitle(""); setBMsg(""); }}
                      style={{ padding: 12, borderRadius: 12, border: `1px solid ${c.border}`, background: c.pill, color: "#fff", cursor: "pointer", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={sendBroadcast} disabled={sending}
                      style={{ padding: 12, borderRadius: 12, border: "none", background: levelColor(bLevel), color: "#fff", cursor: sending ? "not-allowed" : "pointer", fontWeight: 900, opacity: sending ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Send size={14} /> {sending ? "Sending…" : "SEND"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Management Modules */}
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 14 }}>
              <p style={{ fontWeight: 800, fontSize: 11, marginBottom: 12, color: c.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Management Modules</p>
              {[
                { icon: <Users size={18} />,    title: "Manage Users",       desc: `${users.length} registered users`,     action: () => setTab("users") },
                { icon: <Siren size={18} color={c.red} />, title: "SOS Alerts", desc: `${activeAlerts.length} active alerts`, action: () => setTab("sos") },
                { icon: <Megaphone size={18} />, title: "Broadcast Alerts",  desc: `${broadcasts.length} sent alerts`,     action: () => setTab("broadcasts") },
                { icon: <PhoneCall size={18} />, title: "Emergency Contacts",desc: "View & update contacts",               action: () => navigate("/contacts") },
                { icon: <Building2 size={18} />, title: "Risk Assessment",   desc: "AISSMS building analysis",             action: () => navigate("/damage") },
              ].map(({ icon, title, desc, action }) => (
                <div key={title} onClick={action}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, background: c.pill, border: `1px solid ${c.border}`, marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "#2a2a35", display: "grid", placeItems: "center" }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 13 }}>{title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: c.muted }}>{desc}</p>
                  </div>
                  <span style={{ color: c.muted }}>›</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 14 }}>
            <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>Registered Users ({users.length})</p>
            {loading ? <p style={{ color: c.muted, textAlign: "center" }}>Loading…</p>
            : users.length === 0 ? <p style={{ color: c.muted, textAlign: "center" }}>No users yet.</p>
            : users.map((u) => (
              <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, background: c.pill, border: `1px solid ${c.border}`, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: u.role === "admin" ? `${c.red}22` : "#2a2a35", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 15, color: u.role === "admin" ? c.red : "#fff" }}>
                  {u.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 13 }}>{u.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: c.muted }}>{u.email}</p>
                  <span style={{ fontSize: 9, fontWeight: 900, color: u.role === "admin" ? c.red : "#30d158", textTransform: "uppercase" }}>{u.role}</span>
                </div>
                {u._id !== adminUser?._id && (
                  <button onClick={() => deleteUser(u._id)}
                    style={{ background: `${c.red}18`, border: `1px solid ${c.red}55`, borderRadius: 10, padding: "6px 10px", color: c.red, cursor: "pointer", fontSize: 11, fontWeight: 800 }}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── SOS TAB ── */}
        {tab === "sos" && (
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 14 }}>
            <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>SOS Alerts ({sosAlerts.length})</p>
            {loading ? <p style={{ color: c.muted, textAlign: "center" }}>Loading…</p>
            : sosAlerts.length === 0 ? <p style={{ color: c.muted, textAlign: "center" }}>No SOS alerts yet.</p>
            : sosAlerts.map((a) => (
              <div key={a._id} style={{ padding: 12, borderRadius: 14, background: c.pill, border: `1px solid ${a.status === "active" ? c.red : c.border}`, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      {a.status === "active" ? <Siren size={13} color={c.red} /> : <CheckCircle size={13} color="#30d158" />}
                      <span style={{ fontWeight: 900, fontSize: 11, color: a.status === "active" ? c.red : "#30d158", textTransform: "uppercase" }}>{a.status}</span>
                    </div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 13 }}>{a.userName || "Unknown"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: c.muted }}>{a.userEmail}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#cfcfd6" }}>{a.message}</p>
                    {a.location?.lat && <p style={{ margin: "4px 0 0", fontSize: 10, color: c.muted }}>📍 {a.location.lat.toFixed(4)}, {a.location.lng.toFixed(4)}</p>}
                    <p style={{ margin: "4px 0 0", fontSize: 10, color: c.muted }}>{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  {a.status === "active" && (
                    <button onClick={() => resolveAlert(a._id)}
                      style={{ background: "#30d15820", border: "1px solid #30d15855", borderRadius: 10, padding: "8px 12px", color: "#30d158", cursor: "pointer", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BROADCASTS TAB ── */}
        {tab === "broadcasts" && (
          <div>
            <button onClick={() => { setTab("overview"); setShowForm(true); }}
              style={{ width: "100%", background: c.red, border: "none", borderRadius: 14, padding: 14, color: "#fff", cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14, boxShadow: `0 8px 20px ${c.red}44` }}>
              <Send size={16} /> Send New Alert
            </button>
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 14 }}>
              <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>Sent Broadcasts ({broadcasts.length})</p>
              {loading ? <p style={{ color: c.muted, textAlign: "center" }}>Loading…</p>
              : broadcasts.length === 0 ? <p style={{ color: c.muted, textAlign: "center" }}>No broadcasts sent yet.</p>
              : broadcasts.map((b) => (
                <div key={b._id} style={{ padding: 12, borderRadius: 14, background: c.pill, border: `1px solid ${levelColor(b.level)}44`, marginBottom: 10, position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ background: levelColor(b.level), padding: "3px 8px", borderRadius: 999, fontSize: 9, fontWeight: 900, marginBottom: 6, display: "inline-block" }}>{b.level}</span>
                      <p style={{ margin: "4px 0 2px", fontWeight: 800, fontSize: 13 }}>{b.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#cfcfd6", lineHeight: 1.5 }}>{b.message}</p>
                      <p style={{ margin: "6px 0 0", fontSize: 10, color: c.muted }}>📅 {new Date(b.createdAt).toLocaleString()} · By {b.sentByName}</p>
                    </div>
                    <button onClick={() => deleteBroadcast(b._id)}
                      style={{ background: "transparent", border: "none", color: c.muted, cursor: "pointer", padding: 4, flexShrink: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}