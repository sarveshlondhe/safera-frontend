import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Zap, Flame, Waves, Wind, Activity, Brain, CheckCircle, Users } from "lucide-react";
import { getUser } from "../api.js";

const c = { bg:"#0f0f13",card:"#1a1a24",border:"#2d2d38",muted:"#8e8e93",red:"#ff3b30",pill:"#121218",green:"#30D158",gold:"#FF9F0A",blue:"#0A84FF" };

const BUILDINGS = [
  { name:"COE Engineering College", floors:7, capacity:2000, emoji:"🏫" },
  { name:"IOIT College",            floors:8, capacity:1800, emoji:"🏛️" },
  { name:"Pharmacy College",        floors:7, capacity:800,  emoji:"🏥" },
  { name:"Polytechnic College",     floors:7, capacity:1200, emoji:"🔧" },
  { name:"Sports Ground",           floors:1, capacity:5000, emoji:"🏟️" },
  { name:"Basketball Court",        floors:1, capacity:500,  emoji:"🏀" },
];

const TYPES = [
  { key:"Earthquake", icon:<Activity size={18}/> },
  { key:"Fire",       icon:<Flame    size={18}/> },
  { key:"Flood",      icon:<Waves    size={18}/> },
  { key:"Cyclone",    icon:<Wind     size={18}/> },
];

function calcDamage(disaster, magnitude, floors) {
  let base = magnitude * 10;
  if(disaster==="Earthquake") base *= 1.2;
  if(disaster==="Fire")       base *= 0.9;
  if(disaster==="Flood")      base *= 0.8;
  base += floors * 2;
  return Math.min(98, Math.max(5, Math.round(base)));
}

// ── AI Needs with people count ────────────────────────────────
function predictNeeds(disaster, magnitude, name, floors, dmg, people) {
  const needs = [];

  // Calculate estimated casualties based on damage % and people
  const injuryRate    = dmg / 100 * 0.3;   // 30% of damage% likely injured
  const criticalRate  = dmg / 100 * 0.08;  // 8% critical
  const estimatedInj  = Math.round(people * injuryRate);
  const estimatedCrit = Math.round(people * criticalRate);
  const trapped       = Math.round(people * (dmg / 100) * 0.15);
  const displaced     = Math.round(people * (dmg / 100) * 0.5);

  // Casualty summary — always first
  needs.push({
    need: `🤕 Est. ${estimatedInj} Injured  |  🚨 ${estimatedCrit} Critical`,
    priority: estimatedCrit > 0 ? "CRITICAL" : "HIGH",
    reason: `Based on ${people} people present and ${dmg}% damage level`
  });

  if(trapped > 0) needs.push({
    need: `🆘 ~${trapped} People May Be Trapped`,
    priority: "CRITICAL",
    reason: `Estimated ${trapped} people trapped — immediate rescue required`
  });

  if(displaced > 0) needs.push({
    need: `🏠 Shelter for ~${displaced} Displaced`,
    priority: dmg > 60 ? "CRITICAL" : "HIGH",
    reason: `~${displaced} people cannot return to building — shelter needed`
  });

  // Medical based on people
  const ambulances = Math.ceil(estimatedCrit / 2);
  needs.push({
    need: `🚑 ${Math.max(1, ambulances)} Ambulance${ambulances > 1 ? "s" : ""} Required`,
    priority: "CRITICAL",
    reason: `${estimatedCrit} critical casualties estimated from ${people} people`
  });

  // Food & water based on displaced
  if(displaced > 0) {
    const waterLitres = displaced * 3;
    needs.push({
      need: `🍱 Food & Water for ${displaced} People`,
      priority: "HIGH",
      reason: `${waterLitres}L water/day + meals for ${displaced} displaced people`
    });
  }

  // Disaster-specific
  if(disaster==="Earthquake") {
    if(dmg>40) needs.push({ need:"🔦 Search & Rescue Teams", priority:"CRITICAL", reason:`Collapsed ${floors}-floor structure — survivors may be buried` });
    needs.push({ need:"🧹 Debris Removal Equipment", priority:"HIGH", reason:"Rubble blocks access to survivors" });
    if(floors>4) needs.push({ need:`🏗️ Structural Engineers (${floors} floors)`, priority:"HIGH", reason:`${name} is tall — full structural safety check mandatory` });
  }
  if(disaster==="Fire") {
    needs.push({ need:"🚒 Fire Brigade & Foam Units", priority:"CRITICAL", reason:"Active fire suppression required immediately" });
    needs.push({ need:"😷 Smoke Inhalation Kits", priority:"HIGH", reason:"Smoke causes respiratory injuries even away from fire" });
    needs.push({ need:"⚡ Electrical Safety Inspection", priority:"MEDIUM", reason:"Fire often caused by or causes electrical faults" });
  }
  if(disaster==="Flood") {
    needs.push({ need:"🚣 Boats & Rescue Floats", priority:"CRITICAL", reason:`Water may trap people in upper ${floors} floors` });
    needs.push({ need:"🚰 Clean Water Supply", priority:"CRITICAL", reason:"Floodwater contaminates all drinking water sources" });
    needs.push({ need:"💊 Anti-infection Medicines", priority:"HIGH", reason:"Floodwater carries bacteria and disease vectors" });
  }
  if(disaster==="Cyclone") {
    needs.push({ need:"🏠 Emergency Shelter Setup", priority:"CRITICAL", reason:"Roofs and windows likely destroyed by high winds" });
    needs.push({ need:"⚡ Power Line Restoration", priority:"HIGH", reason:"Cyclones destroy electrical infrastructure" });
    needs.push({ need:"🌳 Fallen Tree Removal", priority:"HIGH", reason:"Blocked roads prevent rescue team access" });
  }

  needs.push({ need:"📢 Public Announcement System", priority:"MEDIUM", reason:"Keep all people informed of safe zones and rescue status" });
  needs.push({ need:"🩺 Mobile Medical Camp", priority:dmg>60?"HIGH":"MEDIUM", reason:`${people} people affected — setup camp near ${name}` });

  return { needs, estimatedInj, estimatedCrit, trapped, displaced };
}

const priorityColor = (p) => p==="CRITICAL"?c.red:p==="HIGH"?c.gold:c.blue;
const riskColor     = (r) => r==="CRITICAL"?c.red:r==="HIGH"?c.gold:r==="MODERATE"?c.blue:c.green;

export default function DamagePrediction() {
  const navigate = useNavigate();
  const user     = getUser();
  const isAdmin  = user?.role==="admin";

  const [disaster,  setDisaster]  = useState("Earthquake");
  const [magnitude, setMagnitude] = useState(6.5);
  const [building,  setBuilding]  = useState(BUILDINGS[0]);
  const [people,    setPeople]    = useState(BUILDINGS[0].capacity);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);

  const pct      = Math.min(100,(magnitude/10)*100);
  const magLabel = (x)=>x<4?"MINOR":x<6?"MODERATE":x<7.5?"MAJOR":"SEVERE";

  const selectBuilding = (b) => {
    setBuilding(b);
    setPeople(b.capacity); // auto-fill with default capacity
    setResult(null);
  };

  const run = () => {
    setLoading(true); setResult(null);
    setTimeout(()=>{
      const dmg    = calcDamage(disaster, magnitude, building.floors);
      const risk   = dmg<30?"LOW":dmg<60?"MODERATE":dmg<80?"HIGH":"CRITICAL";
      const output = predictNeeds(disaster, magnitude, building.name, building.floors, dmg, people);
      setResult({ dmg, risk, ...output });
      setLoading(false);
    }, 1800);
  };

  return (
    <div style={{minHeight:"100vh",background:c.bg,color:"#fff",fontFamily:"system-ui",display:"flex",justifyContent:"center",padding:18}}>
    <div style={{width:"100%",maxWidth:420,paddingBottom:80}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={()=>navigate(isAdmin?"/admin":"/dashboard")}
          style={{background:c.pill,border:`1px solid ${c.border}`,borderRadius:12,width:44,height:44,display:"grid",placeItems:"center",cursor:"pointer",color:"#fff"}}>
          <ChevronLeft/>
        </button>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:16,fontWeight:900,margin:0}}>Risk Assessment</p>
          <p style={{fontSize:11,color:c.muted,margin:0}}>AI Damage & Needs Predictor</p>
        </div>
        <div style={{background:c.pill,border:`1px solid ${c.border}`,borderRadius:12,width:44,height:44,display:"grid",placeItems:"center"}}>
          <Zap size={18} color={c.red}/>
        </div>
      </div>

      {/* Input Card */}
      <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:16,marginBottom:14}}>

        {/* Disaster Type */}
        <p style={{fontSize:10,fontWeight:700,color:c.muted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px"}}>Disaster Type</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
          {TYPES.map(t=>(
            <button key={t.key} onClick={()=>{setDisaster(t.key);setResult(null);}}
              style={{background:c.pill,border:`2px solid ${disaster===t.key?c.red:c.border}`,borderRadius:14,padding:14,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,boxShadow:disaster===t.key?`0 0 16px ${c.red}44`:"none"}}>
              <div style={{color:disaster===t.key?c.red:"#d8d8df"}}>{t.icon}</div>
              <span style={{fontSize:12,fontWeight:900,color:disaster===t.key?c.red:"#fff"}}>{t.key}</span>
            </button>
          ))}
        </div>

        {/* Magnitude */}
        <p style={{fontSize:10,fontWeight:700,color:c.muted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px"}}>Severity / Magnitude</p>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:10,color:c.muted,fontWeight:800}}>{magLabel(magnitude)}</span>
          <span style={{fontSize:20,fontWeight:900,color:c.red}}>{magnitude.toFixed(1)} <span style={{fontSize:10,color:c.muted}}>/ 10</span></span>
        </div>
        <div style={{height:6,borderRadius:999,background:"#2a2a35",position:"relative",marginBottom:10}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,borderRadius:999,background:c.red}}/>
        </div>
        <input type="range" min="0" max="10" step="0.1" value={magnitude}
          onChange={e=>{setMagnitude(parseFloat(e.target.value));setResult(null);}}
          style={{width:"100%",accentColor:c.red,marginBottom:6}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:c.muted,fontWeight:800,marginBottom:18}}>
          <span>MINOR</span><span>MODERATE</span><span>MAJOR</span><span>SEVERE</span>
        </div>

        {/* Buildings */}
        <p style={{fontSize:10,fontWeight:700,color:c.muted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px"}}>AISSMS Campus Building</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
          {BUILDINGS.map(b=>(
            <button key={b.name} onClick={()=>selectBuilding(b)}
              style={{background:building.name===b.name?`${c.red}15`:c.pill,border:`2px solid ${building.name===b.name?c.red:c.border}`,borderRadius:12,padding:"10px 8px",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:18,marginBottom:4}}>{b.emoji}</div>
              <div style={{fontSize:10,fontWeight:800,color:building.name===b.name?c.red:"#fff",lineHeight:1.3}}>{b.name}</div>
              <div style={{fontSize:9,color:c.muted,marginTop:2}}>{b.floors} floors · {b.capacity.toLocaleString()} cap.</div>
            </button>
          ))}
        </div>

        {/* People Count — KEY INPUT */}
        <p style={{fontSize:10,fontWeight:700,color:c.muted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px"}}>
          People Present at Time of Disaster
        </p>
        <div style={{background:c.pill,border:`1px solid ${c.border}`,borderRadius:14,padding:"14px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:12}}>
          <Users size={20} color={c.red} style={{flexShrink:0}}/>
          <div style={{flex:1}}>
            <input
              type="number"
              min="1"
              max="10000"
              value={people}
              onChange={e=>{setPeople(Math.max(1,parseInt(e.target.value)||1));setResult(null);}}
              style={{width:"100%",background:"transparent",border:"none",color:"#fff",fontSize:18,fontWeight:900,outline:"none"}}
            />
            <div style={{fontSize:9,color:c.muted,marginTop:2}}>Default capacity: {building.capacity.toLocaleString()} people</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <button onClick={()=>{setPeople(p=>Math.min(10000,p+50));setResult(null);}}
              style={{background:`${c.red}22`,border:`1px solid ${c.red}55`,borderRadius:8,width:32,height:28,color:c.red,fontWeight:900,cursor:"pointer",fontSize:14}}>+</button>
            <button onClick={()=>{setPeople(p=>Math.max(1,p-50));setResult(null);}}
              style={{background:`${c.red}22`,border:`1px solid ${c.red}55`,borderRadius:8,width:32,height:28,color:c.red,fontWeight:900,cursor:"pointer",fontSize:14}}>−</button>
          </div>
        </div>

        {/* Run */}
        <button onClick={run} disabled={loading}
          style={{width:"100%",background:c.red,border:"none",borderRadius:14,padding:16,color:"#fff",fontWeight:900,fontSize:15,cursor:loading?"not-allowed":"pointer",opacity:loading?0.8:1,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:`0 12px 30px ${c.red}44`}}>
          <Brain size={18}/> {loading?"AI Analyzing...":"RUN AI PREDICTION"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:24,textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:36,marginBottom:10}}>🤖</div>
          <p style={{fontWeight:800,fontSize:14,margin:"0 0 6px"}}>AI Analyzing...</p>
          <p style={{fontSize:11,color:c.muted,margin:0}}>Calculating for {people.toLocaleString()} people at {building.name}</p>
        </div>
      )}

      {/* Results */}
      {result && (<>

        {/* Risk Score */}
        <div style={{background:c.card,border:`2px solid ${riskColor(result.risk)}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <p style={{margin:0,fontSize:11,color:c.muted,fontWeight:700,textTransform:"uppercase"}}>Damage Risk Score</p>
              <p style={{margin:"4px 0 0",fontSize:13,fontWeight:800}}>{building.name}</p>
              <p style={{margin:"2px 0 0",fontSize:11,color:c.muted}}>{people.toLocaleString()} people · {building.floors} floors</p>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:36,fontWeight:900,color:riskColor(result.risk)}}>{result.dmg}%</div>
              <span style={{background:riskColor(result.risk),padding:"3px 10px",borderRadius:999,fontSize:10,fontWeight:900}}>{result.risk} RISK</span>
            </div>
          </div>
          <div style={{height:10,borderRadius:999,background:"#2a2a35"}}>
            <div style={{height:"100%",width:`${result.dmg}%`,borderRadius:999,background:riskColor(result.risk),transition:"width 1s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:9,color:c.muted,fontWeight:800}}>
            <span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span>
          </div>

          {/* Casualty summary boxes */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
            {[
              { label:"Est. Injured",   val:result.estimatedInj,  color:c.gold  },
              { label:"Est. Critical",  val:result.estimatedCrit, color:c.red   },
              { label:"Est. Trapped",   val:result.trapped,       color:c.red   },
              { label:"Est. Displaced", val:result.displaced,     color:c.blue  },
            ].map(s=>(
              <div key={s.label} style={{background:c.pill,border:`1px solid ${s.color}33`,borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.val.toLocaleString()}</div>
                <div style={{fontSize:9,color:c.muted,fontWeight:700,textTransform:"uppercase",marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Needs */}
        <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <Brain size={16} color={c.blue}/>
            <div>
              <p style={{margin:0,fontWeight:900,fontSize:14}}>AI Post-Disaster Needs</p>
              <p style={{margin:"2px 0 0",fontSize:10,color:c.muted}}>Resources for {people.toLocaleString()} people after {disaster}</p>
            </div>
          </div>

          {result.needs.map((n,i)=>(
            <div key={i} style={{background:c.pill,border:`1px solid ${priorityColor(n.priority)}33`,borderRadius:14,padding:12,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5,gap:8}}>
                <span style={{fontWeight:800,fontSize:12,color:"#fff",lineHeight:1.4}}>{n.need}</span>
                <span style={{background:priorityColor(n.priority),padding:"2px 8px",borderRadius:999,fontSize:9,fontWeight:900,color:"#fff",flexShrink:0}}>{n.priority}</span>
              </div>
              <p style={{margin:0,fontSize:10,color:c.muted,lineHeight:1.5}}>{n.reason}</p>
            </div>
          ))}

          <div style={{background:"#001a0d",border:`1px solid ${c.green}44`,borderRadius:12,padding:12,display:"flex",gap:8}}>
            <CheckCircle size={15} color={c.green} style={{flexShrink:0,marginTop:1}}/>
            <p style={{margin:0,fontSize:10,color:"#80c898",lineHeight:1.5}}>
              <strong style={{color:c.green}}>AI Prediction Complete</strong> — Share with NDRF, PMC and AISSMS authorities for coordinated disaster response planning.
            </p>
          </div>
        </div>

      </>)}
    </div></div>
  );
}