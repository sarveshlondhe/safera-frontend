import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Phone,
  ShieldAlert,
  Search,
  BadgeCheck,
  MapPin,
  HeartPulse,
  Flame,
  Shield,
  Building2,
  Users,
} from "lucide-react";

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const colors = {
    bg: "#0f0f13",
    card: "#1a1a24",
    border: "#2d2d38",
    muted: "#8e8e93",
    red: "#ff3b30",
    pill: "#121218",
    topRed: "#ff3b30",
  };

  const filters = [
    { key: "All" },
    { key: "Police" },
    { key: "Medical" },
    { key: "Fire" },
    { key: "Campus" },
  ];

  const contacts = useMemo(
    () => [
      { group: "Police", title: "Police Control", number: "100", note: "Toll Free", icon: <Shield size={18} /> },
      { group: "Medical", title: "Ambulance EMRI", number: "108", note: "Toll Free", icon: <HeartPulse size={18} /> },
      { group: "Fire", title: "Fire Brigade", number: "101", note: "Toll Free", icon: <Flame size={18} /> },
      { group: "Campus", title: "National SOS", number: "112", note: "Toll Free", icon: <ShieldAlert size={18} /> },

      { group: "Campus", title: "Campus Security", number: "044-2225", note: "Campus Line", icon: <Building2 size={18} /> },
      { group: "Campus", title: "Student NGO", number: "9876543210", note: "Coordinator", icon: <Users size={18} /> },
      { group: "Campus", title: "Disaster Mgmt", number: "1070", note: "Toll Free", icon: <MapPin size={18} /> },
      { group: "Campus", title: "Blood Bank", number: "1910", note: "Toll Free", icon: <HeartPulse size={18} /> },
    ],
    []
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      const okFilter = filter === "All" ? true : c.group === filter;
      const okQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.number.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q);
      return okFilter && okQuery;
    });
  }, [contacts, query, filter]);

  const callNow = (num) => {
    window.location.href = `tel:${num.replace(/\s/g, "")}`;
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: colors.bg,
      color: "#fff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      justifyContent: "center",
      padding: "18px",
    },
    phone: { width: "100%", maxWidth: "420px" },

    topHeader: {
      background: colors.topRed,
      borderRadius: "18px",
      padding: "14px 14px 12px",
      border: `1px solid ${colors.border}`,
      marginBottom: "12px",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "10px",
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.25)",
      background: "rgba(0,0,0,0.15)",
      color: "#fff",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
    },
    headerTitle: { fontSize: "15px", fontWeight: 1000, margin: 0, textAlign: "center" },

    globalCard: {
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.25)",
      borderRadius: "16px",
      padding: "12px",
      display: "flex",
      gap: "12px",
      alignItems: "center",
    },
    sosBadge: {
      width: 52,
      height: 52,
      borderRadius: "999px",
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.25)",
      display: "grid",
      placeItems: "center",
      boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      flexShrink: 0,
    },
    smallPill: {
      fontSize: "9px",
      fontWeight: 1000,
      padding: "4px 10px",
      borderRadius: "999px",
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.25)",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    },

    actionsRow: { display: "flex", gap: "10px", marginTop: "10px" },
    actionBtn: {
      flex: 1,
      background: "rgba(0,0,0,0.22)",
      border: "1px solid rgba(255,255,255,0.25)",
      borderRadius: "12px",
      padding: "10px",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 900,
      fontSize: "11px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },

    searchWrap: {
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: "14px",
      padding: "10px 12px",
      display: "flex",
      gap: "10px",
      alignItems: "center",
      marginBottom: "12px",
    },
    searchInput: {
      width: "100%",
      background: "transparent",
      border: "none",
      outline: "none",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 700,
    },

    filterRow: { display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" },
    chip: (active) => ({
      padding: "8px 12px",
      borderRadius: "999px",
      background: active ? colors.red : colors.pill,
      border: `1px solid ${active ? colors.red : colors.border}`,
      color: active ? "#fff" : "#cfcfd6",
      fontWeight: 900,
      fontSize: "11px",
      cursor: "pointer",
    }),

    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    tile: {
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: "18px",
      padding: "12px",
      minHeight: 126,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    tileTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: "999px",
      background: colors.pill,
      border: `1px solid ${colors.border}`,
      display: "grid",
      placeItems: "center",
      color: "#fff",
    },
    name: { fontSize: "12px", fontWeight: 1000, margin: "10px 0 0" },
    num: { fontSize: "16px", fontWeight: 1000, margin: "6px 0 0", color: colors.red },
    note: { fontSize: "10px", color: colors.muted, margin: "6px 0 0", fontWeight: 800 },

    callBtn: {
      marginTop: "12px",
      width: "100%",
      borderRadius: "12px",
      border: "none",
      background: colors.red,
      color: "#fff",
      padding: "10px",
      cursor: "pointer",
      fontWeight: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: `0 10px 22px ${colors.red}55`,
    },

    protocol: {
      marginTop: "14px",
      background: "#2a0f12",
      border: `1px solid ${colors.red}`,
      borderRadius: "16px",
      padding: "12px",
    },
    protocolTitle: { fontSize: "11px", fontWeight: 1000, margin: 0, color: "#fff" },
    protocolText: { fontSize: "10px", color: "#ffd7d4", margin: "6px 0 0", lineHeight: 1.45 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.phone}>
        {/* Top Red Header */}
        <div style={styles.topHeader}>
          <div style={styles.topRow}>
            <button type="button" style={styles.backBtn} onClick={() => navigate("/dashboard")}>
              <ChevronLeft />
            </button>
            <p style={styles.headerTitle}>Emergency Contacts</p>
            <div style={{ width: 44 }} />
          </div>

          <div style={styles.globalCard}>
            <div style={styles.sosBadge}>
              <ShieldAlert size={22} />
              <div style={{ fontSize: "8px", fontWeight: 1000, marginTop: 2 }}>SOS NOW</div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: "12px", fontWeight: 1000 }}>Global SOS</div>
                <span style={styles.smallPill}>
                  <BadgeCheck size={14} /> CRITICAL
                </span>
              </div>
              <div style={{ fontSize: "10px", opacity: 0.9, marginTop: 4 }}>
                Notify campus security & critical teams instantly
              </div>

              <div style={styles.actionsRow}>
                <button type="button" style={styles.actionBtn} onClick={() => callNow("100")}>
                  <Phone size={16} /> Police 100
                </button>
                <button type="button" style={styles.actionBtn} onClick={() => callNow("108")}>
                  <Phone size={16} /> Med 108
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <Search size={18} color={colors.muted} />
          <input
            style={styles.searchInput}
            placeholder="Search services or departments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              style={styles.chip(filter === f.key)}
              onClick={() => setFilter(f.key)}
            >
              {f.key}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={styles.grid}>
          {list.map((c, idx) => (
            <div key={idx} style={styles.tile}>
              <div>
                <div style={styles.tileTop}>
                  <div style={styles.iconCircle}>{c.icon}</div>
                  <div style={{ fontSize: "10px", color: colors.muted, fontWeight: 900 }}>{c.group}</div>
                </div>

                <div style={styles.name}>{c.title}</div>
                <div style={styles.num}>{c.number}</div>
                <div style={styles.note}>{c.note}</div>
              </div>

              <button type="button" style={styles.callBtn} onClick={() => callNow(c.number)}>
                <Phone size={16} /> CALL
              </button>
            </div>
          ))}
        </div>

        {/* Response Protocol */}
        <div style={styles.protocol}>
          <p style={styles.protocolTitle}>Response Protocol</p>
          <p style={styles.protocolText}>
            During an active emergency, prioritize the Global SOS button. For fire or medical incidents,
            call the direct lines first.
          </p>
        </div>
      </div>
    </div>
  );
}
