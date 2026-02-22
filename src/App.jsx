import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getToken, getUser } from "./api.js";
import usePushNotifications from "./usePushNotifications.js";
import EvacuationStatus from "./pages/EvacuationStatus";
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
import FireAssessment from "./pages/FireAssessment";
const LEVEL_COLOR = { CRITICAL:"#FF3B30", WARNING:"#FF9F0A", INFO:"#0A84FF" };
const LEVEL_BG    = { CRITICAL:"#2a0000", WARNING:"#2a1800", INFO:"#001020" };
const TYPE_EMOJI  = { Fire:"🔥",Flood:"🌊",Earthquake:"🏚️",Cyclone:"🌀",Security:"🚨",General:"⚠️",SOS:"🆘" };

function NotificationToast({ toast, onClose }) {
  if (!toast) return null;
  const color = LEVEL_COLOR[toast.level] || "#FF3B30";
  const bg    = LEVEL_BG[toast.level]    || "#2a0000";
  const emoji = TYPE_EMOJI[toast.type]   || "⚠️";
  return (
    <div style={{position:"fixed",top:12,left:12,right:12,zIndex:9999,background:bg,border:`2px solid ${color}`,borderRadius:16,padding:"12px 14px",boxShadow:`0 8px 32px ${color}55`,display:"flex",alignItems:"flex-start",gap:10,fontFamily:"system-ui",animation:"slideDown 0.3s ease"}}>
      <span style={{fontSize:22,flexShrink:0}}>{emoji}</span>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
          <span style={{fontWeight:900,fontSize:13,color:"#fff"}}>{toast.title}</span>
          <span style={{background:color,padding:"2px 8px",borderRadius:999,fontSize:9,fontWeight:900,color:"#fff"}}>{toast.level}</span>
        </div>
        <p style={{margin:0,fontSize:11,color:"#ccc",lineHeight:1.5}}>{toast.body}</p>
      </div>
      <button onClick={onClose} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:20,padding:0,lineHeight:1,flexShrink:0}}>×</button>
    </div>
  );
}

function OfflineBanner() {
  const [offline, setOffline] = React.useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",on);
    window.addEventListener("offline",off);
    return () => { window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:9998,background:"#1a1000",borderTop:"1px solid #FF9F0A55",padding:"10px 16px",textAlign:"center",fontFamily:"system-ui",fontSize:12,color:"#FF9F0A",fontWeight:700}}>
      📵 Offline — Alerts & Emergency Contacts available from cache
    </div>
  );
}

function NotificationPrompt({ subscribe, permission }) {
  const [show, setShow] = React.useState(false);
  useEffect(() => {
    if (permission === "default") {
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, [permission]);
  if (!show || permission !== "default") return null;
  return (
    <div style={{position:"fixed",bottom:70,left:12,right:12,zIndex:9997,background:"#1a1a24",border:"1px solid #2d2d38",borderRadius:16,padding:"14px 16px",fontFamily:"system-ui",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <span style={{fontSize:24}}>🔔</span>
        <div>
          <p style={{margin:0,fontWeight:800,fontSize:13,color:"#fff"}}>Enable Notifications</p>
          <p style={{margin:"2px 0 0",fontSize:10,color:"#8e8e93"}}>Get instant alerts when admin sends emergency broadcasts</p>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button onClick={()=>setShow(false)} style={{padding:"10px",borderRadius:12,border:"1px solid #2d2d38",background:"#121218",color:"#8e8e93",fontWeight:700,fontSize:12,cursor:"pointer"}}>Not Now</button>
        <button onClick={()=>{subscribe();setShow(false);}} style={{padding:"10px",borderRadius:12,border:"none",background:"#FF3B30",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}}>Allow 🔔</button>
      </div>
    </div>
  );
}

function Protected({ children, adminOnly = false }) {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function InnerApp() {
  const user = getUser();
  const { permission, subscribe, toast, clearToast } = usePushNotifications();
  return (
    <>
      <NotificationToast toast={toast} onClose={clearToast} />
      <OfflineBanner />
      {user && <NotificationPrompt subscribe={subscribe} permission={permission} />}
      <style>{`@keyframes slideDown{from{transform:translateY(-110%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
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
        <Route path="/ngo"       element={<Protected><NGOContacts /></Protected>} />
        <Route path="/ndma"      element={<Protected><NDMAAlerts /></Protected>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
        <Route path="/evacuation" element={<Protected><EvacuationStatus /></Protected>} />
        <Route path="/fire" element={<Protected><FireAssessment /></Protected>} />
      </Routes>
    </>
  );
}

export default function App() {
  return <BrowserRouter><InnerApp /></BrowserRouter>;
}