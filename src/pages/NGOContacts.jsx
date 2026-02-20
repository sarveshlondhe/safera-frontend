import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Phone, Search } from "lucide-react";
import { getUser } from "../api.js";

const c = { bg:"#0f0f13",card:"#1a1a24",border:"#2d2d38",muted:"#8e8e93",red:"#ff3b30",pill:"#121218",green:"#30D158",gold:"#FF9F0A",blue:"#0A84FF" };

const CONTACTS = [
  // Emergency Services
  { category:"🚨 Emergency Services", name:"National Emergency",          number:"112", desc:"Police + Fire + Ambulance combined", color:c.red  },
  { category:"🚨 Emergency Services", name:"Police Control Room",         number:"100", desc:"Pune City Police",                  color:c.red  },
  { category:"🚨 Emergency Services", name:"Ambulance / CATS",            number:"108", desc:"Free ambulance service Maharashtra", color:c.red  },
  { category:"🚨 Emergency Services", name:"Fire Brigade Pune",           number:"101", desc:"Pune Municipal Fire Department",    color:c.red  },
  { category:"🚨 Emergency Services", name:"Disaster Helpline (NDMA)",   number:"1078",desc:"National Disaster Management",      color:c.red  },

  // NGOs - Pune
  { category:"🤝 NGOs — Pune",        name:"Médecins Sans Frontières",    number:"011-49279797", desc:"Emergency medical aid NGO",             color:c.blue },
  { category:"🤝 NGOs — Pune",        name:"iCall (TISS)",                number:"9152987821",   desc:"Psychosocial support post-disaster",    color:c.blue },
  { category:"🤝 NGOs — Pune",        name:"Rotary Club Pune Disaster",   number:"020-25670000", desc:"Relief & rehabilitation support Pune",  color:c.blue },
  { category:"🤝 NGOs — Pune",        name:"Shelter Associates Pune",     number:"020-24220720", desc:"Shelter & housing post-disaster",       color:c.blue },
  { category:"🤝 NGOs — Pune",        name:"Samarth Bharat",              number:"020-27450000", desc:"Community disaster response Pune",      color:c.blue },
  { category:"🤝 NGOs — Pune",        name:"Asha Kiran NGO Pune",         number:"020-26130000", desc:"Food & shelter for disaster victims",   color:c.blue },

  // Government
  { category:"🏛️ Government",         name:"NDRF Maharashtra",            number:"9969999500",   desc:"National Disaster Response Force",     color:c.gold },
  { category:"🏛️ Government",         name:"SDRF Pune Division",          number:"020-26123456", desc:"State Disaster Response Force Pune",   color:c.gold },
  { category:"🏛️ Government",         name:"PMC Disaster Cell",           number:"1800-233-0000",desc:"Pune Municipal Corp 24/7 helpline",    color:c.gold },
  { category:"🏛️ Government",         name:"Collector Office Pune",       number:"020-26122000", desc:"District disaster coordination",       color:c.gold },
  { category:"🏛️ Government",         name:"Civil Hospital Pune",         number:"020-26128000", desc:"Govt hospital emergency ward",         color:c.gold },

  // Campus
  { category:"🏫 AISSMS Campus",      name:"AISSMS Security",             number:"020-26059500", desc:"Campus security & first response",     color:c.green },
  { category:"🏫 AISSMS Campus",      name:"AISSMS Principal Office",     number:"020-26059501", desc:"Principal emergency contact",          color:c.green },
  { category:"🏫 AISSMS Campus",      name:"Kennedy Road Police Stn",     number:"020-26361233", desc:"Nearest police station to campus",     color:c.green },
];

const CATEGORIES = ["All", "🚨 Emergency Services", "🤝 NGOs — Pune", "🏛️ Government", "🏫 AISSMS Campus"];

const call = (number) => { const a = document.createElement("a"); a.href = `tel:${number.replace(/\s/g,"")}` ; a.click(); };

export default function NGOContacts() {
  const navigate = useNavigate();
  const user     = getUser();
  const isAdmin  = user?.role === "admin";
  const [tab,    setTab]    = useState("All");
  const [search, setSearch] = useState("");

  const filtered = CONTACTS.filter(ct => {
    const matchTab = tab === "All" || ct.category === tab;
    const matchSearch = !search || ct.name.toLowerCase().includes(search.toLowerCase()) || ct.number.includes(search);
    return matchTab && matchSearch;
  });

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
          <p style={{fontSize:16,fontWeight:900,margin:0}}>NGO & Emergency</p>
          <p style={{fontSize:11,color:c.muted,margin:0}}>Pune & AISSMS Campus Contacts</p>
        </div>
        <div style={{background:c.pill,border:`1px solid ${c.border}`,borderRadius:12,width:44,height:44,display:"grid",placeItems:"center"}}>
          <Phone size={18} color={c.red}/>
        </div>
      </div>

      {/* Search */}
      <div style={{position:"relative",marginBottom:14}}>
        <Search size={16} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:c.muted}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search name or number..."
          style={{width:"100%",background:c.card,border:`1px solid ${c.border}`,borderRadius:14,padding:"12px 14px 12px 40px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {CATEGORIES.map(cat=>(
          <button key={cat} onClick={()=>setTab(cat)}
            style={{padding:"8px 12px",borderRadius:999,border:`1px solid ${tab===cat?c.red:c.border}`,background:tab===cat?c.red:c.pill,color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
            {cat==="All"?"All":cat.split(" ").slice(1).join(" ")}
          </button>
        ))}
      </div>

      {/* Contact Cards */}
      {filtered.length === 0 ? (
        <div style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:18,padding:30,textAlign:"center"}}>
          <p style={{color:c.muted}}>No contacts found.</p>
        </div>
      ) : filtered.map((ct,i)=>(
        <div key={i} style={{background:c.card,border:`1px solid ${c.border}`,borderRadius:16,padding:14,marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:46,borderRadius:14,background:`${ct.color}18`,border:`1px solid ${ct.color}44`,display:"grid",placeItems:"center",flexShrink:0}}>
            <Phone size={18} color={ct.color}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{margin:0,fontWeight:800,fontSize:13,color:"#fff"}}>{ct.name}</p>
            <p style={{margin:"2px 0 0",fontSize:10,color:c.muted}}>{ct.desc}</p>
            <p style={{margin:"3px 0 0",fontSize:13,fontWeight:900,color:ct.color,fontFamily:"monospace"}}>{ct.number}</p>
          </div>
          <button onClick={()=>call(ct.number)}
            style={{background:ct.color,border:"none",borderRadius:12,width:44,height:44,display:"grid",placeItems:"center",cursor:"pointer",flexShrink:0,boxShadow:`0 4px 14px ${ct.color}44`}}>
            <Phone size={18} color="#fff" fill="#fff"/>
          </button>
        </div>
      ))}

      <div style={{textAlign:"center",padding:"14px 0",fontSize:9,color:c.muted,letterSpacing:1}}>
        TAP ANY CARD TO CALL DIRECTLY • AISSMS CAMPUS SAFETY
      </div>

    </div></div>
  );
}