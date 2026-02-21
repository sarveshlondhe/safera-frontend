// Frontend/src/components/PanicMonitor.jsx
// Add this widget inside AdminDashboard.jsx

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

export default function PanicMonitor() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/panic/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Panic stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (!stats)  return null;

  const loginPct  = Math.round((stats.logins / stats.thresholds.LOGINS_COUNT) * 100);
  const damagePct = Math.round((stats.damageReports / stats.thresholds.DAMAGE_COUNT) * 100);
  const refreshPct= Math.round(((stats.topRefreshIp?.count || 0) / stats.thresholds.REFRESH_COUNT) * 100);

  const isPanic = loginPct >= 100 || damagePct >= 100 || refreshPct >= 100;
  const isWarning = loginPct >= 60 || damagePct >= 60 || refreshPct >= 60;

  return (
    <div style={{background:c.card,border:`2px solid ${isPanic?c.red:isWarning?c.gold:c.border}`,borderRadius:18,padding:16,marginBottom:16}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🤖</span>
          <div>
            <p style={{margin:0,fontWeight:900,fontSize:14,color:"#fff"}}>AI Panic Detector</p>
            <p style={{margin:"2px 0 0",fontSize:9,color:c.muted}}>Live • Updates every 10s</p>
          </div>
        </div>
        <span style={{
          background: isPanic ? c.red : isWarning ? c.gold : c.green,
          padding:"4px 10px",borderRadius:999,fontSize:10,fontWeight:900,color:"#fff"
        }}>
          {isPanic ? "🚨 PANIC" : isWarning ? "⚠️ WATCH" : "✅ NORMAL"}
        </span>
      </div>

      {/* Metric 1: Logins */}
      <div style={{background:c.pill,borderRadius:12,padding:"10px 12px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>👤 Logins / 1 min</span>
          <span style={{fontSize:13,fontWeight:900,color:loginPct>=100?c.red:loginPct>=60?c.gold:c.green}}>
            {stats.logins} / {stats.thresholds.LOGINS_COUNT}
          </span>
        </div>
        <Bar value={stats.logins} max={stats.thresholds.LOGINS_COUNT} color={loginPct>=100?c.red:loginPct>=60?c.gold:c.green}/>
        {loginPct >= 60 && (
          <p style={{margin:"5px 0 0",fontSize:9,color:c.gold}}>
            ⚠️ {loginPct >= 100 ? "THRESHOLD EXCEEDED — Panic alert sent!" : `${stats.thresholds.LOGINS_COUNT - stats.logins} more logins will trigger PANIC alert`}
          </p>
        )}
      </div>

      {/* Metric 2: Damage Reports */}
      <div style={{background:c.pill,borderRadius:12,padding:"10px 12px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>📋 Damage Reports / 3 min</span>
          <span style={{fontSize:13,fontWeight:900,color:damagePct>=100?c.red:damagePct>=60?c.gold:c.green}}>
            {stats.damageReports} / {stats.thresholds.DAMAGE_COUNT}
          </span>
        </div>
        <Bar value={stats.damageReports} max={stats.thresholds.DAMAGE_COUNT} color={damagePct>=100?c.red:damagePct>=60?c.gold:c.green}/>
        {damagePct >= 60 && (
          <p style={{margin:"5px 0 0",fontSize:9,color:c.gold}}>
            ⚠️ {damagePct >= 100 ? "THRESHOLD EXCEEDED — Panic alert sent!" : `${stats.thresholds.DAMAGE_COUNT - stats.damageReports} more reports will trigger PANIC alert`}
          </p>
        )}
      </div>

      {/* Metric 3: Page Refreshes */}
      <div style={{background:c.pill,borderRadius:12,padding:"10px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>🔄 Refreshes / IP / 1 min</span>
          <span style={{fontSize:13,fontWeight:900,color:refreshPct>=100?c.red:refreshPct>=60?c.gold:c.green}}>
            {stats.topRefreshIp?.count || 0} / {stats.thresholds.REFRESH_COUNT}
          </span>
        </div>
        <Bar value={stats.topRefreshIp?.count || 0} max={stats.thresholds.REFRESH_COUNT} color={refreshPct>=100?c.red:refreshPct>=60?c.gold:c.green}/>
        {stats.topRefreshIp && (
          <p style={{margin:"5px 0 0",fontSize:9,color:c.muted}}>Top IP: {stats.topRefreshIp.ip}</p>
        )}
        {refreshPct >= 60 && (
          <p style={{margin:"3px 0 0",fontSize:9,color:c.gold}}>
            ⚠️ {refreshPct >= 100 ? "THRESHOLD EXCEEDED — Panic alert sent!" : `${stats.thresholds.REFRESH_COUNT - (stats.topRefreshIp?.count||0)} more refreshes will trigger PANIC alert`}
          </p>
        )}
      </div>

      {/* Last panic times */}
      {(stats.lastPanic.logins > 0 || stats.lastPanic.damage > 0 || stats.lastPanic.refresh > 0) && (
        <div style={{marginTop:10,padding:"8px 10px",background:"#1a0000",borderRadius:10,border:`1px solid ${c.red}33`}}>
          <p style={{margin:0,fontSize:9,color:c.red,fontWeight:700}}>🚨 LAST PANIC EVENTS:</p>
          {stats.lastPanic.logins  > 0 && <p style={{margin:"3px 0 0",fontSize:9,color:c.muted}}>Mass Login: {new Date(stats.lastPanic.logins).toLocaleTimeString("en-IN")}</p>}
          {stats.lastPanic.damage  > 0 && <p style={{margin:"3px 0 0",fontSize:9,color:c.muted}}>Mass Damage Reports: {new Date(stats.lastPanic.damage).toLocaleTimeString("en-IN")}</p>}
          {stats.lastPanic.refresh > 0 && <p style={{margin:"3px 0 0",fontSize:9,color:c.muted}}>Mass Refreshes: {new Date(stats.lastPanic.refresh).toLocaleTimeString("en-IN")}</p>}
        </div>
      )}

    </div>
  );
}