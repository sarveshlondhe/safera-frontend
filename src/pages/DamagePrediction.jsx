import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Zap, Flame, Waves, Wind, Activity, Brain, CheckCircle } from "lucide-react";
import { getUser } from "../api.js";

const c = { bg:"#0f0f13",card:"#1a1a24",border:"#2d2d38",muted:"#8e8e93",red:"#ff3b30",pill:"#121218",green:"#30D158",gold:"#FF9F0A",blue:"#0A84FF" };

const BUILDINGS = [
  { name:"COE Engineering College", floors:4, emoji:"🏫" },
  { name:"IOIT College",            floors:4, emoji:"🏛️" },
  { name:"Pharmacy College",        floors:3, emoji:"🏥" },
  { name:"Polytechnic College",     floors:3, emoji:"🔧" },
  { name:"Sports Ground",           floors:1, emoji:"🏟️" },
  { name:"Basketball Court",        floors:1, emoji:"🏀" },
];

const TYPES = [
  { key:"Earthquake", icon:<Activity size={18}/> },
  { key:"Fire",       icon:<Flame    size={18}/> },
  { key:"Flood",      icon:<Waves    size={18}/> },
  { key:"Cyclone",    icon:<Wind     size={18}/> },
];

function calcDamage(disaster, magnitude, floors) {
  let base = magnitude * 10;
  if(disaster==="Earthquake") base*=1.2;
  if(disaster==="Fire")       base*=0.9;
  if(disaster==="Flood")      base*=0.8;
  base += floors * 3;
  return Math.min(98, Math.max(5, Math.round(base)));
}

function predictNeeds(disaster, magnitude, name, floors, dmg) {
  const needs = [];
  if(dmg>30) needs.push({ need:"🚑 Medical Aid & First Aid",      priority:"CRITICAL", reason:"Injuries expected from structural impact" });
  if(dmg>20) needs.push({ need:"🍱 Food & Drinking Water",        priority:dmg>60?"CRITICAL":"HIGH", reason:"Displaced people need sustenance" });
  if(disaster==="Earthquake") {
    if(dmg>40) needs.push({ need:"🔦 Search & Rescue Teams",      priority:"CRITICAL", reason:"Collapsed structures may have trapped survivors" });
    if(dmg>50) needs.push({ need:"🏠 Temporary Shelter",          priority:"HIGH",     reason:"Buildings may be unsafe to re-enter" });
    needs.push(          { need:"🧹 Debris Removal Equipment",    priority:"HIGH",     reason:"Rubble blocks access to survivors and exits" });
    if(floors>2) needs.push({ need:"🏗️ Structural Engineers",    priority:"HIGH",     reason:`${name} has ${floors} floors — safety check required` });
  }
  if(disaster==="Fire") {
    needs.push({ need:"🚒 Fire Brigade & Foam",                   priority:"CRITICAL", reason:"Active fire suppression required immediately" });
    needs.push({ need:"😷 Smoke Inhalation Treatment",            priority:"HIGH",     reason:"Smoke causes respiratory injuries" });
    needs.push({ need:"⚡ Electrical Safety Inspection",          priority:"MEDIUM",   reason:"Fire often causes electrical faults" });
    if(dmg>50) needs.push({ need:"🏠 Temporary Shelter",         priority:"HIGH",     reason:"Building uninhabitable after fire" });
  }
  if(disaster==="Flood") {
    needs.push({ need:"🚣 Boats & Rescue Floats",                 priority:"CRITICAL", reason:"Water may trap people in upper floors" });
    needs.push({ need:"🚰 Clean Water Supply",                    priority:"CRITICAL", reason:"Floodwater contaminates drinking water" });
    needs.push({ need:"💊 Anti-infection Medicines",              priority:"HIGH",     reason:"Floodwater carries bacteria and disease" });
    needs.push({ need:"🔌 Power Restoration",                     priority:"MEDIUM",   reason:"Flood causes electrical short circuits" });
  }
  if(disaster==="Cyclone") {
    needs.push({ need:"🏠 Emergency Shelter",                     priority:"CRITICAL", reason:"Roofs and windows likely damaged" });
    needs.push({ need:"⚡ Power Line Restoration",                priority:"HIGH",     reason:"Cyclones destroy electrical infrastructure" });
    needs.push({ need:"🌳 Fallen Tree Removal",                   priority:"HIGH",     reason:"Blocked roads prevent rescue access" });
    needs.push({ need:"📡 Communication Restoration",             priority:"MEDIUM",   reason:"Restore emergency communication systems" });
  }
  if(dmg>60) needs.push({ need:"🩺 Mobile Medical Unit",         priority:"HIGH",     reason:"Hospital access may be blocked" });
  needs.push(            { need:"📢 Public Announcement System",  priority:"MEDIUM",   reason:"Keep people informed of safe zones" });
  return needs;
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
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);

  const pct      = Math.min(100,(magnitude/10)*100);
  const magLabel = (x)=>x<4?"MINOR":x<6?"MODERATE":x<7.5?"MAJOR":"SEVERE";

  const run = () => {
    setLoading(true); setResult(null);
    setTimeout(()=>{
      const dmg   = calcDamage(disaster,magnitude,building.floors);
      const needs = predictNeeds(disaster,magnitude,building.name,building.floors,dmg);
      const risk  = dmg<30?"LOW":dmg<60?"MODERATE":dmg<80?"HIGH":"CRITICAL";
      setResult({dmg,needs,risk});
      setLoading(false);
    },1800);
  };

  return (
    <div style={{minHeight:"100vh",background:c.bg,color:"#fff",fontFamily:"system-ui",display:"flex",justifyContent:"center",padding:18}}>
    <div style={{width:"100%",maxWidth:420,paddingBottom:80}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={()=>navigate(isAdmin?"/admin":"/dashboard")} style={{background:c.pill,border:`1px solid ${c.border}`,borderRadius:12,width:44,height:44,display:"grid",placeItems:"center",cursor:"pointer",color:"#fff"}}><ChevronLeft/></button>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:16,fontWeight:900,margin:0}}>Risk Assessment</p>
          <p style={{fontSize:11,color:c.muted,margin:0}}>AI Damage & Needs Predictor</p>
        </div>
        <div style={{background:c.pill,border:`1px solid ${c.border}`,borderRadius:12,width:44,height:44,display:"grid",placeItems:"center"}}><Zap size={18} color={c.red}/></div>
      </div>

      {/* Card */}
      <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:16,marginBottom:14}}>

        {/* Disaster */}
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
            <button key={b.name} onClick={()=>{setBuilding(b);setResult(null);}}
              style={{background:building.name===b.name?`${c.red}15`:c.pill,border:`2px solid ${building.name===b.name?c.red:c.border}`,borderRadius:12,padding:"10px 8px",cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:18,marginBottom:4}}>{b.emoji}</div>
              <div style={{fontSize:10,fontWeight:800,color:building.name===b.name?c.red:"#fff",lineHeight:1.3}}>{b.name}</div>
              <div style={{fontSize:9,color:c.muted,marginTop:2}}>{b.floors} floor{b.floors>1?"s":""}</div>
            </button>
          ))}
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
          <p style={{fontSize:11,color:c.muted,margin:0}}>Calculating damage risk and post-disaster needs for {building.name}</p>
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
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:36,fontWeight:900,color:riskColor(result.risk)}}>{result.dmg}%</div>
              <span style={{background:riskColor(result.risk),padding:"3px 10px",borderRadius:999,fontSize:10,fontWeight:900}}>{result.risk} RISK</span>
            </div>
          </div>
          <div style={{height:10,borderRadius:999,background:"#2a2a35"}}>
            <div style={{height:"100%",width:`${result.dmg}%`,borderRadius:999,background:riskColor(result.risk)}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:9,color:c.muted,fontWeight:800}}>
            <span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span>
          </div>
        </div>

        {/* AI Needs */}
        <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:18,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <Brain size={16} color={c.blue}/>
            <div>
              <p style={{margin:0,fontWeight:900,fontSize:14}}>AI Post-Disaster Needs</p>
              <p style={{margin:"2px 0 0",fontSize:10,color:c.muted}}>Resources needed after {disaster} at {building.name}</p>
            </div>
          </div>
          {result.needs.map((n,i)=>(
            <div key={i} style={{background:c.pill,border:`1px solid ${priorityColor(n.priority)}33`,borderRadius:14,padding:12,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontWeight:800,fontSize:13}}>{n.need}</span>
                <span style={{background:priorityColor(n.priority),padding:"2px 8px",borderRadius:999,fontSize:9,fontWeight:900,flexShrink:0}}>{n.priority}</span>
              </div>
              <p style={{margin:0,fontSize:10,color:c.muted}}>{n.reason}</p>
            </div>
          ))}
          <div style={{background:"#001a0d",border:`1px solid ${c.green}44`,borderRadius:12,padding:12,display:"flex",gap:8}}>
            <CheckCircle size={15} color={c.green} style={{flexShrink:0,marginTop:1}}/>
            <p style={{margin:0,fontSize:10,color:"#80c898",lineHeight:1.5}}>
              <strong style={{color:c.green}}>AI Complete</strong> — Share with campus authorities and NDRF for coordinated response.
            </p>
          </div>
        </div>
      </>)}

    </div></div>
  );
}