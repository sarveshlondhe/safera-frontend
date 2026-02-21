// Frontend/src/components/PanicMonitor.jsx
import React, { useState, useEffect } from "react";
import { getToken } from "../api.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const c = { card:"#1a1a24", border:"#2d2d38", muted:"#8e8e93", red:"#ff3b30", gold:"#FF9F0A", green:"#30D158", blue:"#0A84FF", pill:"#121218" };

function Bar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{height:6,borderRadius:999,background:"#2a2a35",marginTop:6}}>
      <div style={{height:"100%",width:`${pct}%`,borderRadius:999,background:color,transition:"width 0.5s ease"}}/>
    </div>
  );
}

function Metric({ icon, label, value, max, window }) {
  const pct   = Math.round((value / max) * 100);
  const color = pct >= 100 ? c.red : pct >= 60 ? c.gold : c.green;
  return (
    <div style={{background:c.pill,borderRadius:12,padding:"10px 12px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{icon} {label}</span>
        <span style={{fontSize:13,fontWeight:900,color}}>{value} / {max}</span>
      </div>
      <Bar value={value} max={max} color={color}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{fontSize:9,color:c.muted}}>window: {window}</span>
        {pct >= 60 && (
          <span style={{fontSize:9,color:pct>=100?c.red:c.gold,fontWeight:700}}>
            {pct >= 100 ? "🚨 PANIC SENT!" : `⚠️ ${max - value} more → PANIC`}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PanicMonitor() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/panic/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setStats(await res.json());
    } catch (err) {
      console.error("Panic stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const i = setInterval(fetchStats, 10000);
    return () => clearInterval(i);
  }, []);

  if (loading || !stats) return null;

  const pcts = [
    Math.round((stats.logins        / stats.thresholds.LOGINS_COUNT)  * 100),
    Math.round((stats.damageReports / stats.thresholds.DAMAGE_COUNT)  * 100),
    Math.round((stats.sosAlerts     / stats.thresholds.SOS_COUNT)     * 100),
    Math.round(((stats.topRefreshIp?.count||0) / stats.thresholds.REFRESH_COUNT) * 100),
  ];
  const isPanic   = pcts.some(p => p >= 100);
  const isWarning = pcts.some(p => p >= 60);

  return (
    <div style={{background:c.card,border:`2px solid ${isPanic?c.red:isWarning?c.gold:c.border}`,borderRadius:18,padding:16,marginBottom:16}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🤖</span>
          <div>
            <p style={{margin:0,fontWeight:900,fontSize:14,color:"#fff"}}>AI Panic Detector</p>
            <p style={{margin:"2px 0 0",fontSize:9,color:c.muted}}>Live • Auto-refreshes every 10s</p>
          </div>
        </div>
        <span style={{background:isPanic?c.red:isWarning?c.gold:c.green,padding:"4px 10px",borderRadius:999,fontSize:10,fontWeight:900,color:"#fff"}}>
          {isPanic ? "🚨 PANIC" : isWarning ? "⚠️ WATCH" : "✅ NORMAL"}
        </span>
      </div>

      {/* 4 Metrics */}
      <Metric icon="👤" label="Logins / 1 min"           value={stats.logins}                      max={stats.thresholds.LOGINS_COUNT}  window="1 minute" />
      <Metric icon="🆘" label="SOS Alerts / 3 min"       value={stats.sosAlerts}                   max={stats.thresholds.SOS_COUNT}     window="3 minutes"/>
      <Metric icon="📋" label="Damage Reports / 3 min"   value={stats.damageReports}               max={stats.thresholds.DAMAGE_COUNT}  window="3 minutes"/>
      <Metric icon="🔄" label="Refreshes / IP / 1 min"   value={stats.topRefreshIp?.count || 0}   max={stats.thresholds.REFRESH_COUNT} window="1 minute" />

      {/* Last panic history */}
      {Object.values(stats.lastPanic).some(v => v > 0) && (
        <div style={{marginTop:8,padding:"8px 10px",background:"#1a0000",borderRadius:10,border:`1px solid ${c.red}33`}}>
          <p style={{margin:"0 0 4px",fontSize:9,color:c.red,fontWeight:700}}>🚨 LAST PANIC EVENTS:</p>
          {stats.lastPanic.logins  > 0 && <p style={{margin:"2px 0",fontSize:9,color:c.muted}}>👤 Mass Login: {new Date(stats.lastPanic.logins).toLocaleTimeString("en-IN")}</p>}
          {stats.lastPanic.sos     > 0 && <p style={{margin:"2px 0",fontSize:9,color:c.muted}}>🆘 Mass SOS: {new Date(stats.lastPanic.sos).toLocaleTimeString("en-IN")}</p>}
          {stats.lastPanic.damage  > 0 && <p style={{margin:"2px 0",fontSize:9,color:c.muted}}>📋 Mass Damage: {new Date(stats.lastPanic.damage).toLocaleTimeString("en-IN")}</p>}
          {stats.lastPanic.refresh > 0 && <p style={{margin:"2px 0",fontSize:9,color:c.muted}}>🔄 Mass Refresh: {new Date(stats.lastPanic.refresh).toLocaleTimeString("en-IN")}</p>}
        </div>
      )}
    </div>
  );
}