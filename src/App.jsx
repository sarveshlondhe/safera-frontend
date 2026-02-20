import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getToken, getUser } from "./api.js";
import PWAInstallBanner from "./PWAInstallBanner.jsx";

import Login             from "./pages/Login";
import Dashboard         from "./pages/Dashboard";
import Alerts            from "./pages/Alerts";
import DamagePrediction  from "./pages/DamagePrediction";
import EmergencyContacts from "./pages/EmergencyContacts";
import SafeRouteMap      from "./pages/SafeRouteMap";
import AdminDashboard    from "./pages/AdminDashboard";
import SOSPage           from "./pages/SOSPage";
import Profile           from "./pages/Profile";

function Protected({ children, adminOnly = false }) {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
      background: "#FF9F0A", color: "#000", textAlign: "center",
      padding: "10px 16px", fontSize: 12, fontWeight: 800,
    }}>
      📵 Offline — Alerts & Emergency Contacts available from cache
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/"          element={<Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/alerts"    element={<Protected><Alerts /></Protected>} />
        <Route path="/damage"    element={<Protected><DamagePrediction /></Protected>} />
        <Route path="/contacts"  element={<Protected><EmergencyContacts /></Protected>} />
        <Route path="/map"       element={<Protected><SafeRouteMap /></Protected>} />
        <Route path="/sos"       element={<Protected><SOSPage /></Protected>} />
        <Route path="/profile"   element={<Protected><Profile /></Protected>} />
        <Route path="/admin"     element={<Protected adminOnly><AdminDashboard /></Protected>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
      <PWAInstallBanner />
    </BrowserRouter>
  );
}