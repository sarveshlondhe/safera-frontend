import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ShieldAlert, Navigation, MapPin, Bell, Map, User, Home, Phone } from "lucide-react";
import { getUser } from "../api.js";

const c = { bg: "#0f0f13", card: "#1a1a24", border: "#2d2d38", muted: "#8e8e93", red: "#ff3b30", green: "#30d158" };

const COLLEGE_LAT = 18.5236;
const COLLEGE_LNG = 73.8801;

export default function SafeRouteMap() {
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === "admin";
  const [location, setLocation] = useState(null);
  const [locMsg, setLocMsg]     = useState("Getting your location…");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocMsg(`📍 ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          setLocation({ lat: COLLEGE_LAT, lng: COLLEGE_LNG });
          setLocMsg("Showing AISSMS Campus (location denied)");
        },
        { timeout: 6000 }
      );
    } else {
      setLocation({ lat: COLLEGE_LAT, lng: COLLEGE_LNG });
      setLocMsg("Showing AISSMS Campus");
    }
  }, []);

  const mapUrl = location
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=17&output=embed`
    : `https://maps.google.com/maps?q=AISSMS+College+of+Engineering+Pune&z=17&output=embed`;

  const goDirections = (dest) => {
    const origin = location ? `${location.lat},${location.lng}` : "AISSMS+College+of+Engineering+Pune";
    window.open(`https://www.google.com/maps/dir/${origin}/${encodeURIComponent(dest)}`, "_blank");
  };

  const call = (num) => { const a = document.createElement("a"); a.href = `tel:${num}`; a.click(); };

  // ✅ Home icon is ALWAYS Home — never changes
  const navBtn = (active) => ({
    background: active ? `${c.red}15` : "#121218",
    border: `1px solid ${active ? c.red : c.border}`,
    borderRadius: 14, padding: "10px 0",
    color: active ? c.red : "#fff", cursor: "pointer",
    fontSize: 10, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 6, fontWeight: active ? 900 : 700,
  });

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: "#fff", fontFamily: "system-ui", display: "flex", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          {/* ✅ FIXED: Admin goes back to /admin, user to /dashboard */}
          <button type="button"
            style={{ background: "#121218", border: `1px solid ${c.border}`, borderRadius: 12, width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", color: "#fff" }}
            onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}>
            <ChevronLeft />
          </button>
          <p style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>Safe Route Map</p>
          <div style={{ width: 44 }} />
        </div>

        {/* Banner */}
        <div style={{ background: c.red, borderRadius: 16, padding: 14, marginBottom: 12, boxShadow: `0 8px 20px ${c.red}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert size={20} color="white" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 13 }}>AISSMS CAMPUS — ACTIVE MONITORING</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.9 }}>Nearest safe zone: Sports Ground (150m away)</p>
            </div>
            <span style={{ background: "rgba(0,0,0,0.25)", padding: "3px 8px", borderRadius: 999, fontSize: 9, fontWeight: 900 }}>LIVE</span>
          </div>
        </div>

        {/* Location */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: c.green, display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={14} /> {locMsg}
        </div>

        {/* Google Maps */}
        <div style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${c.border}`, marginBottom: 12, height: 300 }}>
          <iframe title="AISSMS Safe Route Map" src={mapUrl} width="100%" height="100%"
            style={{ border: "none", display: "block" }} allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade" />
        </div>

        {/* Safe Zones */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
          <p style={{ fontWeight: 800, fontSize: 12, marginBottom: 12, color: c.muted, textTransform: "uppercase" }}>AISSMS Campus Safe Zones</p>
          {[
            { name: "AISSMS Sports Ground", dist: "150m", time: "2 min" },
            { name: "Kennedy Road Open Area", dist: "300m", time: "4 min" },
            { name: "Sangamwadi Ground, Pune", dist: "600m", time: "8 min" },
          ].map(({ name, dist, time }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${c.border}` }}>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 13 }}>{name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: c.muted }}>📍 {dist} &nbsp;·&nbsp; ⏱ {time}</p>
              </div>
              <button onClick={() => goDirections(name)}
                style={{ background: `${c.red}18`, border: `1px solid ${c.red}55`, borderRadius: 10, padding: "8px 12px", color: c.red, cursor: "pointer", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                <Navigation size={12} /> Go
              </button>
            </div>
          ))}
          <button onClick={() => goDirections("AISSMS Sports Ground Pune")}
            style={{ marginTop: 12, width: "100%", background: c.red, border: "none", borderRadius: 14, padding: 14, color: "#fff", cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: `0 8px 20px ${c.red}44` }}>
            <Navigation size={18} /> NAVIGATE TO NEAREST SAFE ZONE
          </button>
        </div>

        {/* Emergency Calls */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 16, marginBottom: 90 }}>
          <p style={{ fontWeight: 800, fontSize: 11, marginBottom: 12, color: c.muted, textTransform: "uppercase" }}>Quick Emergency Dial</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Emergency", num: "112", color: c.red },
              { label: "Police", num: "100", color: "#0a84ff" },
              { label: "Ambulance", num: "108", color: c.green },
              { label: "Fire", num: "101", color: "#ff9f0a" },
            ].map(({ label, num, color }) => (
              <button key={num} onClick={() => call(num)}
                style={{ background: `${color}18`, border: `1px solid ${color}55`, borderRadius: 14, padding: 12, color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <Phone size={14} color={color} /> {label}
                <span style={{ marginLeft: "auto", fontFamily: "monospace", color, fontSize: 12 }}>{num}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ✅ FIXED Bottom Nav: Home always shows Home icon */}
        <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 12, width: "calc(100% - 24px)", maxWidth: 420, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 10, zIndex: 999, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
          <button style={navBtn(false)} onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}><Home size={18} />Home</button>
          <button style={navBtn(false)} onClick={() => navigate("/alerts")}><Bell size={18} />Alerts</button>
          <button style={navBtn(true)}  onClick={() => navigate("/map")}><Map size={18} />Map</button>
          <button style={navBtn(false)} onClick={() => navigate("/sos")}><ShieldAlert size={18} />SOS</button>
          <button style={navBtn(false)} onClick={() => navigate("/profile")}><User size={18} />Profile</button>
        </div>
      </div>
    </div>
  );
}
