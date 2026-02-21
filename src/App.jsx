// Frontend/src/App.jsx  — replace existing file
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { getToken, getUser } from "./api.js";
import useNotifications from "./useNotifications.js";

import Login             from "./pages/Login";
import Dashboard         from "./pages/Dashboard";
import Alerts            from "./pages/Alerts";
import DamagePrediction  from "./pages/DamagePrediction";
import EmergencyContacts from "./pages/EmergencyContacts";
import SafeRouteMap      from "./pages/SafeRouteMap";
import AdminDashboard    from "./pages/AdminDashboard";
import SOSPage           from "./pages/SOSPage";
import Profile           from "./pages/Profile";
import NGOContacts       from "./pages/NGOContacts";
import NDMAAlerts        from "./pages/NDMAAlerts";

const LEVEL_COLOR = { CRITICAL:"#FF3B30", WARNING:"#FF9F0A", INFO:"#0A84FF" };
const LEVEL_BG    = { CRITICAL:"#2a0000", WARNING:"#2a1800", INFO:"#001020" };
const TYPE_EMOJI  = { Fire:"🔥", Flood:"🌊", Earthquake:"🏚️", Cyclone:"🌀", Security:"🚨", General:"⚠️" };

// ── Foreground notification toast ────────────────────────────
function NotificationToast({ alert, onClose }) {
  if (!alert) return null;
  const color = LEVEL_COLOR[alert.level] || "#FF3B30";
  const bg    = LEVEL_BG[alert.level]    || "#2a0000";
  const emoji = TYPE_EMOJI[alert.type]   || "⚠️";

  return (
    <div style={{
      position:"fixed", top:16, left:16, right:16, zIndex:9999,
      background:bg, border:`2px solid ${color}`, borderRadius:16,
      padding:"14px 16px", boxShadow:`0 8px 32px ${color}44`,
      animation:"slideDown 0.3s ease",
      display:"flex", alignItems:"flex-start", gap:12,
      fontFamily:"system-ui",
    }}>
      <span style={{fontSize:24, flexShrink:0}}>{emoji}</span>
      <div style={{flex:1}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4}}>
          <span style={{fontWeight:900, fontSize:13, color:"#fff"}}>{alert.title}</span>
          <span style={{background:color, padding:"2px 8px", borderRadius:999, fontSize:9, fontWeight:900, color:"#fff"}}>{alert.level}</span>
        </div>
        <p style={{margin:0, fontSize:11, color:"#ccc", lineHeight:1.5}}>{alert.body}</p>
      </div>
      <button onClick={onClose}
        style={{background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:18, padding:0, flexShrink:0}}>
        ×
      </button>
    </div>
  );
}

// ── Offline banner ───────────────────────────────────────────
function OfflineBanner() {
  const [offline, setOffline] = React.useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{position:"fixed", bottom:0, left:0, right:0, zIndex:9998, background:"#1a1000", borderTop:"1px solid #FF9F0A55", padding:"10px 16px", textAlign:"center", fontFamily:"system-ui", fontSize:12, color:"#FF9F0A", fontWeight:700}}>
      📵 Offline — Alerts &amp; Emergency Contacts available from cache
    </div>
  );
}

// ── Protected route ──────────────────────────────────────────
function Protected({ children, adminOnly = false }) {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

// ── App wrapper with notifications ──────────────────────────
function AppWithNotifications() {
  const user = getUser();
  const { foregroundAlert, clearAlert } = useNotifications();

  // Only run notifications hook if logged in
  if (!user) return null;

  return (
    <>
      <NotificationToast alert={foregroundAlert} onClose={clearAlert} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWithNotifications />
      <OfflineBanner />

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      <Routes>
        <Route path="/"         element={<Login />} />
        <Route path="/dashboard"element={<Protected><Dashboard /></Protected>} />
        <Route path="/alerts"   element={<Protected><Alerts /></Protected>} />
        <Route path="/damage"   element={<Protected><DamagePrediction /></Protected>} />
        <Route path="/contacts" element={<Protected><EmergencyContacts /></Protected>} />
        <Route path="/map"      element={<Protected><SafeRouteMap /></Protected>} />
        <Route path="/sos"      element={<Protected><SOSPage /></Protected>} />
        <Route path="/profile"  element={<Protected><Profile /></Protected>} />
        <Route path="/admin"    element={<Protected adminOnly><AdminDashboard /></Protected>} />
        <Route path="/ngo"      element={<Protected><NGOContacts /></Protected>} />
        <Route path="/ndma"     element={<Protected><NDMAAlerts /></Protected>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}