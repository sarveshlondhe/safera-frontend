import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Shield, RefreshCw, ExternalLink, AlertTriangle, Info, Wifi, WifiOff } from "lucide-react";
import { getToken, getUser } from "../api.js";

const c = { bg:"#0f0f13",card:"#1a1a24",border:"#2d2d38",muted:"#8e8e93",red:"#ff3b30",pill:"#121218",green:"#30D158",gold:"#FF9F0A",blue:"#0A84FF",orange:"#FF6B00" };

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LEVEL_COLOR = { CRITICAL: c.red, WARNING: c.gold, INFO: c.blue };
const LEVEL_BG    = { CRITICAL: "#1a0000", WARNING: "#1a1000", INFO: "#00091a" };

const TYPE_EMOJI = {
  Cyclone:"🌀", Earthquake:"🏚️", Flood:"🌊", Fire:"🔥",
  "Heat Wave":"☀️", Storm:"⛈️", "Cold Wave":"❄️", General:"⚠️"
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function NDMAAlerts() {
  const navigate  = useNavigate();
  const user      = getUser();
  const isAdmin   = user?.role === "admin";
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [lastFetch,setLastFetch]= useState(null);
  const [filter,   setFilter]   = useState("All");

  const FILTERS = ["All", "CRITICAL", "WARNING", "INFO"];

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res   = await fetch(`${BASE_URL}/ndma`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data  = await res.json();
      if (data.alerts && data.alerts.length > 0) {
        setAlerts(data.alerts);
        setLastFetch(new Date());
        // Cache for offline
        localStorage.setItem("safera_ndma_cache", JSON.stringify({ alerts: data.alerts, time: Date.now() }));
      } else if (data.error) {
        // Try cache
        const cached = localStorage.getItem("safera_ndma_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          setAlerts(parsed.alerts);
          setError("Showing cached alerts — live feed temporarily unavailable");
        } else {
          setError("No alerts available right now. NDMA SACHET feed may be inactive.");
        }
      } else {
        setAlerts([]);
        setError("No active disaster alerts in Maharashtra at this time. ✅");
      }
    } catch (err) {
      // Try cache on network error
      const cached = localStorage.getItem("safera_ndma_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        setAlerts(parsed.alerts);
        setError("Offline — showing last cached NDMA alerts");
      } else {
        setError("Cannot connect. Check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "All" ? alerts : alerts.filter(a => a.level === filter);

  return (
    <div style={{minHeight:"100vh",background:c.bg,color:"#fff",fontFamily:"system-ui",display:"flex",justifyContent:"center",padding:18}}>
    <div style={{width:"100%",maxWidth:420,paddingBottom:30}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={()=>navigate(isAdmin?"/admin":"/dashboard")}
          style={{background:c.pill,border:`1px solid ${c.border}`,borderRadius:12,width:44,height:44,display:"grid",placeItems:"center",cursor:"pointer",color:"#fff"}}>
          <ChevronLeft/>
        </button>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:16,fontWeight:900,margin:0}}>NDMA Live Alerts</p>
          <p style={{fontSize:11,color:c.muted,margin:0}}>SACHET • Official Govt of India</p>
        </div>
        <button onClick={fetchAlerts} disabled={loading}
          style={{background:c.pill,border:`1px solid ${c.border}`,borderRadius:12,width:44,height:44,display:"grid",placeItems:"center",cursor:"pointer",color:loading?c.muted:c.blue}}>
          <RefreshCw size={18} style={{animation:loading?"spin 1s linear infinite":"none"}}/>
        </button>
      </div>

      {/* Official badge */}
      <div style={{background:"#000d1a",border:`1px solid ${c.blue}44`,borderRadius:14,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <Shield size={18} color={c.blue} style={{flexShrink:0}}/>
        <div style={{flex:1}}>
          <p style={{margin:0,fontSize:11,fontWeight:800,color:c.blue}}>🇮🇳 Official NDMA Government Feed</p>
          <p style={{margin:"2px 0 0",fontSize:9,color:c.muted}}>
            Source: sachet.ndma.gov.in • Maharashtra State •{" "}
            {lastFetch ? `Updated ${timeAgo(lastFetch)}` : "Fetching..."}
          </p>
        </div>
        <a href="https://sachet.ndma.gov.in" target="_blank" rel="noreferrer"
          style={{color:c.blue,display:"flex",alignItems:"center"}}>
          <ExternalLink size={14}/>
        </a>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{background:"#1a1000",border:`1px solid ${c.gold}44`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,alignItems:"flex-start"}}>
          <Info size={15} color={c.gold} style={{flexShrink:0,marginTop:1}}/>
          <p style={{margin:0,fontSize:11,color:c.gold,lineHeight:1.5}}>{error}</p>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {FILTERS.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{padding:"8px 14px",borderRadius:999,border:`1px solid ${filter===f?(LEVEL_COLOR[f]||c.red):c.border}`,background:filter===f?(LEVEL_COLOR[f]||c.red):c.pill,color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
            {f==="CRITICAL"?"🔴 CRITICAL":f==="WARNING"?"🟡 WARNING":f==="INFO"?"🔵 INFO":"All"}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:30,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>📡</div>
          <p style={{fontWeight:800,margin:"0 0 6px"}}>Fetching NDMA alerts...</p>
          <p style={{fontSize:11,color:c.muted,margin:0}}>Connecting to sachet.ndma.gov.in</p>
        </div>
      )}

      {/* No alerts */}
      {!loading && filtered.length === 0 && !error && (
        <div style={{background:c.card,border:`1px solid ${c.green}44`,borderRadius:18,padding:30,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:10}}>✅</div>
          <p style={{fontWeight:800,fontSize:15,margin:"0 0 6px",color:c.green}}>All Clear</p>
          <p style={{fontSize:11,color:c.muted,margin:0}}>No active disaster alerts for Maharashtra right now</p>
        </div>
      )}

      {/* Alert cards */}
      {!loading && filtered.map((alert, i) => (
        <div key={i} style={{background:LEVEL_BG[alert.level]||c.card,border:`1px solid ${LEVEL_COLOR[alert.level]||c.border}55`,borderRadius:16,padding:14,marginBottom:12}}>

          {/* Top row */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
              <span style={{fontSize:22,flexShrink:0}}>{TYPE_EMOJI[alert.type]||"⚠️"}</span>
              <p style={{margin:0,fontWeight:900,fontSize:13,color:"#fff",lineHeight:1.3}}>{alert.title}</p>
            </div>
            <span style={{background:LEVEL_COLOR[alert.level]||c.muted,padding:"3px 10px",borderRadius:999,fontSize:9,fontWeight:900,color:"#fff",flexShrink:0}}>{alert.level}</span>
          </div>

          {/* Description */}
          {alert.description && (
            <p style={{margin:"0 0 8px",fontSize:11,color:"#ccc",lineHeight:1.6}}>
              {alert.description}
            </p>
          )}

          {/* Footer */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{background:`${LEVEL_COLOR[alert.level]||c.muted}22`,border:`1px solid ${LEVEL_COLOR[alert.level]||c.muted}44`,padding:"3px 8px",borderRadius:999,fontSize:9,fontWeight:700,color:LEVEL_COLOR[alert.level]||c.muted}}>
                {alert.type}
              </span>
              <span style={{fontSize:9,color:c.muted}}>{alert.source}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:9,color:c.muted}}>{timeAgo(alert.pubDate)}</span>
              {alert.link && (
                <a href={alert.link} target="_blank" rel="noreferrer"
                  style={{color:c.blue,display:"flex"}}>
                  <ExternalLink size={12}/>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Count */}
      {!loading && alerts.length > 0 && (
        <p style={{textAlign:"center",fontSize:9,color:c.muted,marginTop:8,letterSpacing:1}}>
          {filtered.length} ALERT{filtered.length!==1?"S":""} • AUTO-REFRESHES EVERY 5 MIN • SOURCE: NDMA SACHET
        </p>
      )}

    </div>
    </div>
  );
}