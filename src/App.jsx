import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getToken, getUser } from "./api.js";

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

function Protected({ children, adminOnly = false }) {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}