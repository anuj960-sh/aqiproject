 // ================================================================
//  RESALTH — Breathe Smart, Live Safe
//  Final Year Major Project | Complete React Application
//  All features in one file — ready to run
// ================================================================
import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, LineChart, Line, Legend, ReferenceLine
} from "recharts";

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const AQI_LEVELS = [
  { max: 50,  label: "Good",                    color: "#00E676", glow: "rgba(0,230,118,0.4)",   icon: "😊", bg: "rgba(0,230,118,0.08)",  desc: "Air quality is satisfactory. Enjoy outdoor activities!" },
  { max: 100, label: "Moderate",                color: "#FFD60A", glow: "rgba(255,214,10,0.4)",  icon: "😐", bg: "rgba(255,214,10,0.08)",  desc: "Acceptable quality. Sensitive individuals should limit outdoor time." },
  { max: 150, label: "Unhealthy for Sensitive", color: "#FF9800", glow: "rgba(255,152,0,0.4)",   icon: "😷", bg: "rgba(255,152,0,0.08)",   desc: "Sensitive groups may experience effects. Wear a mask outdoors." },
  { max: 200, label: "Unhealthy",               color: "#FF4757", glow: "rgba(255,71,87,0.4)",   icon: "🚨", bg: "rgba(255,71,87,0.08)",   desc: "Everyone may experience effects. Avoid prolonged outdoor exertion." },
  { max: 300, label: "Very Unhealthy",          color: "#C44DFF", glow: "rgba(196,77,255,0.4)",  icon: "☠️", bg: "rgba(196,77,255,0.08)", desc: "Health emergency conditions. Avoid all outdoor exposure." },
  { max: 500, label: "Hazardous",               color: "#FF0055", glow: "rgba(255,0,85,0.4)",    icon: "💀", bg: "rgba(255,0,85,0.08)",    desc: "EMERGENCY — Do not go outside under any circumstances!" },
];

const HEALTH_TIPS = {
  "Good":                     ["✅ Perfect for outdoor jogging & cycling","✅ Open windows for natural ventilation","✅ Children can play outdoors safely","✅ Ideal day for outdoor sports"],
  "Moderate":                 ["⚡ Sensitive people limit prolonged outdoor time","⚡ Keep windows closed during peak hours","⚡ Monitor for respiratory symptoms","⚡ Stay hydrated throughout the day"],
  "Unhealthy for Sensitive":  ["😷 Wear N95 mask outdoors","🏠 Sensitive groups stay indoors","🌬️ Run HEPA air purifier","💊 Keep rescue inhalers handy"],
  "Unhealthy":                ["😷 Everyone should wear N95 masks outside","🏃 Avoid all outdoor physical exercise","🏠 Stay indoors — seal windows & doors","🚗 Use car AC on recirculation mode"],
  "Very Unhealthy":           ["🚨 Avoid ALL outdoor exposure","😷 N95 mask mandatory even briefly outside","🏠 Emergency air purifiers in all rooms","📞 Call doctor if breathing problems"],
  "Hazardous":                ["💀 DO NOT go outside under any conditions","🏠 SEAL your home immediately","🚑 Seek emergency help if unwell","📢 Alert all family members now"],
};

const POLLUTANTS_META = {
  pm25: { name:"PM2.5", unit:"μg/m³", who:5,    safe:25,   color:"#00C9FF", desc:"Fine particles <2.5μm — most dangerous, deep lung penetration" },
  pm10: { name:"PM10",  unit:"μg/m³", who:15,   safe:50,   color:"#00FFB2", desc:"Coarse particles <10μm — respiratory & cardiovascular issues" },
  no2:  { name:"NO₂",   unit:"μg/m³", who:10,   safe:40,   color:"#FFD60A", desc:"Nitrogen Dioxide from vehicle exhaust — irritates airways" },
  so2:  { name:"SO₂",   unit:"μg/m³", who:40,   safe:20,   color:"#FF9800", desc:"Sulphur Dioxide from burning fossil fuels — causes acid rain" },
  co:   { name:"CO",    unit:"μg/m³", who:4000, safe:10000,color:"#FF4757", desc:"Carbon Monoxide — odourless toxic gas, reduces blood oxygen" },
  o3:   { name:"O₃",    unit:"μg/m³", who:60,   safe:120,  color:"#A29BFE", desc:"Ground-level Ozone — formed by UV reaction with pollutants" },
};

const CITY_PRESETS = [
  {name:"New Delhi", lat:28.6139, lon:77.2090},  {name:"Mumbai",    lat:19.0760, lon:72.8777},
  {name:"Kolkata",   lat:22.5726, lon:88.3639},  {name:"Bangalore", lat:12.9716, lon:77.5946},
  {name:"Beijing",   lat:39.9042, lon:116.4074}, {name:"London",    lat:51.5072, lon:-0.1276},
  {name:"New York",  lat:40.7128, lon:-74.0060}, {name:"Tokyo",     lat:35.6762, lon:139.6503},
];

const TICKER_MSGS = [
  "🌿 RESALTH monitors real-time air quality for 1000+ cities worldwide",
  "⚡ PM2.5 particles are 30x thinner than human hair — invisible yet deadly",
  "🏥 Air pollution causes 7 million premature deaths annually — WHO 2024",
  "😷 N95 masks filter 95% of airborne particles including PM2.5",
  "🌳 One mature tree absorbs ~21kg of CO₂ per year — plant more trees",
  "🚗 Vehicle emissions contribute 40% of urban air pollution",
  "💧 Indoor plants like Peace Lily naturally purify indoor air",
  "📊 India has 39 of world's 50 most polluted cities — Source: IQAir",
];

// ═══════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════
const getAQIInfo = (aqi) => AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length-1];

const calcAQI = (pm25) => {
  if (!pm25 || pm25 <= 0) return 0;
  if (pm25 <= 12)   return Math.round((50/12)*pm25);
  if (pm25 <= 35.4) return Math.round(50  + (50/23.4)*(pm25-12));
  if (pm25 <= 55.4) return Math.round(100 + (50/19.9)*(pm25-35.5));
  if (pm25 <= 150)  return Math.round(150 + (50/94.9)*(pm25-55.5));
  return Math.min(500,Math.round(200+(100/149.9)*(pm25-150.5)));
};

// ── Mock data generator for fallback ──
const CITY_MOCK_PROFILES = {
  default:     { pm25base:45,  pm10base:80,  no2base:38, so2base:12, co:600,  o3:55 },
  // India - North (very high pollution)
  delhi:       { pm25base:145, pm10base:230, no2base:72, so2base:28, co:1400, o3:44 },
  "new delhi": { pm25base:145, pm10base:230, no2base:72, so2base:28, co:1400, o3:44 },
  noida:       { pm25base:138, pm10base:220, no2base:68, so2base:25, co:1350, o3:45 },
  gurgaon:     { pm25base:130, pm10base:210, no2base:65, so2base:24, co:1300, o3:46 },
  agra:        { pm25base:125, pm10base:205, no2base:62, so2base:22, co:1250, o3:47 },
  kanpur:      { pm25base:150, pm10base:240, no2base:75, so2base:30, co:1500, o3:42 },
  lucknow:     { pm25base:118, pm10base:195, no2base:60, so2base:20, co:1150, o3:48 },
  varanasi:    { pm25base:122, pm10base:200, no2base:62, so2base:21, co:1200, o3:47 },
  patna:       { pm25base:128, pm10base:210, no2base:65, so2base:24, co:1250, o3:46 },
  jaipur:      { pm25base:95,  pm10base:165, no2base:52, so2base:18, co:950,  o3:52 },
  chandigarh:  { pm25base:75,  pm10base:130, no2base:44, so2base:14, co:750,  o3:58 },
  dehradun:    { pm25base:55,  pm10base:100, no2base:36, so2base:10, co:550,  o3:65 },
  // India - West
  mumbai:      { pm25base:68,  pm10base:115, no2base:55, so2base:16, co:820,  o3:60 },
  pune:        { pm25base:52,  pm10base:90,  no2base:40, so2base:12, co:620,  o3:65 },
  ahmedabad:   { pm25base:88,  pm10base:150, no2base:50, so2base:17, co:880,  o3:55 },
  surat:       { pm25base:72,  pm10base:125, no2base:46, so2base:15, co:720,  o3:60 },
  // India - South (cleanest)
  bangalore:   { pm25base:32,  pm10base:58,  no2base:26, so2base:7,  co:420,  o3:72 },
  bengaluru:   { pm25base:32,  pm10base:58,  no2base:26, so2base:7,  co:420,  o3:72 },
  chennai:     { pm25base:45,  pm10base:78,  no2base:36, so2base:12, co:550,  o3:68 },
  hyderabad:   { pm25base:48,  pm10base:82,  no2base:38, so2base:13, co:580,  o3:66 },
  // India - East
  kolkata:     { pm25base:95,  pm10base:165, no2base:58, so2base:20, co:950,  o3:50 },
  bhopal:      { pm25base:82,  pm10base:140, no2base:48, so2base:15, co:820,  o3:55 },
  indore:      { pm25base:78,  pm10base:135, no2base:46, so2base:14, co:780,  o3:56 },
  nagpur:      { pm25base:70,  pm10base:120, no2base:44, so2base:13, co:700,  o3:60 },
  // International
  beijing:     { pm25base:148, pm10base:248, no2base:78, so2base:32, co:1550, o3:40 },
  shanghai:    { pm25base:62,  pm10base:105, no2base:55, so2base:18, co:780,  o3:58 },
  london:      { pm25base:14,  pm10base:26,  no2base:32, so2base:5,  co:320,  o3:92 },
  paris:       { pm25base:16,  pm10base:28,  no2base:34, so2base:5,  co:340,  o3:90 },
  berlin:      { pm25base:12,  pm10base:22,  no2base:28, so2base:4,  co:280,  o3:95 },
  newyork:     { pm25base:18,  pm10base:32,  no2base:38, so2base:7,  co:380,  o3:88 },
  "new york":  { pm25base:18,  pm10base:32,  no2base:38, so2base:7,  co:380,  o3:88 },
  chicago:     { pm25base:16,  pm10base:28,  no2base:35, so2base:6,  co:350,  o3:90 },
  tokyo:       { pm25base:12,  pm10base:24,  no2base:28, so2base:4,  co:280,  o3:98 },
  osaka:       { pm25base:13,  pm10base:25,  no2base:30, so2base:4,  co:300,  o3:96 },
  seoul:       { pm25base:38,  pm10base:65,  no2base:42, so2base:12, co:480,  o3:70 },
  dubai:       { pm25base:42,  pm10base:72,  no2base:38, so2base:12, co:520,  o3:68 },
  singapore:   { pm25base:18,  pm10base:32,  no2base:30, so2base:5,  co:350,  o3:90 },
  sydney:      { pm25base:8,   pm10base:16,  no2base:20, so2base:3,  co:200,  o3:105 },
  bangkok:     { pm25base:55,  pm10base:95,  no2base:48, so2base:16, co:680,  o3:62 },
};

const getMockProfile = (cityName="") => {
  const c = cityName.toLowerCase().trim();
  // Exact key match first
  if (CITY_MOCK_PROFILES[c]) return CITY_MOCK_PROFILES[c];
  // Partial match
  const key = Object.keys(CITY_MOCK_PROFILES).find(k => k !== "default" && c.includes(k));
  return key ? CITY_MOCK_PROFILES[key] : CITY_MOCK_PROFILES.default;
};

const generateMockData = (cityName="") => {
  const p = getMockProfile(cityName);
  const vary = (base, pct=0.25) => Math.max(1, Math.round(base * (1 + (Math.random()-0.5)*pct)));
  const pm25 = vary(p.pm25base);
  const pm10 = vary(p.pm10base);
  const no2  = vary(p.no2base);
  const so2  = vary(p.so2base);
  const co   = vary(p.co, 0.3);
  const o3   = vary(p.o3,  0.2);
  const euro = Math.round(calcAQI(pm25) * 0.85);
  const aqi  = calcAQI(pm25);
  const now  = new Date();
  const hourly = Array.from({length:24},(_,x)=>{
    const hr = (now.getHours()+x)%24;
    const factor = hr>=6&&hr<=9?1.3:hr>=17&&hr<=20?1.25:hr>=0&&hr<=5?0.7:1.0;
    const p25 = Math.max(1,Math.round(pm25*factor*(0.85+Math.random()*0.3)));
    const p10 = Math.max(1,Math.round(pm10*factor*(0.85+Math.random()*0.3)));
    return {
      time:`${String(hr).padStart(2,"0")}:00`,
      aqi: calcAQI(p25), pm25:p25, pm10:p10,
    };
  });
  const slots=["Morning","Afternoon","Evening","Night"];
  const forecast=slots.map((s,x)=>{
    const factor=x===0?1.1:x===1?1.2:x===2?1.05:0.85;
    const a=calcAQI(Math.round(pm25*factor*(0.9+Math.random()*0.2)));
    return {slot:s,aqi:a,pm25:Math.round(pm25*factor),info:getAQIInfo(a)};
  });
  return {aqi,pm25,pm10,no2,so2,co,o3,euro,hourly,forecast,isMock:true};
};

const fetchAQIRaw = async (lat, lon, signal) => {
  const r = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi&timezone=auto&forecast_days=2`,
    signal ? {signal} : {}
  );
  if (!r.ok) throw new Error("API error");
  return r.json();
};

const parseRaw = (d) => {
  const now = new Date();
  let i = d.hourly.time.findIndex(t => {
    const dt = new Date(t);
    return dt.getHours()===now.getHours() && dt.getDate()===now.getDate();
  });
  if (i < 0) i = 0;
  const g = (key) => Math.round(d.hourly[key]?.[i] || 0);
  const pm25=g("pm2_5"), pm10=g("pm10"), no2=g("nitrogen_dioxide"),
        so2=g("sulphur_dioxide"), co=g("carbon_monoxide"), o3=g("ozone"), euro=g("european_aqi");
  const aqi = calcAQI(pm25);
  const hourly = Array.from({length:24},(_,x)=>{
    const j=i+x;
    const t = new Date(d.hourly.time[j]||"");
    return {
      time: t?`${String(t.getHours()).padStart(2,"0")}:00`:"--",
      aqi: calcAQI(d.hourly.pm2_5[j]||0),
      pm25: Math.round(d.hourly.pm2_5[j]||0),
      pm10: Math.round(d.hourly.pm10[j]||0),
    };
  });
  const slots = ["Morning","Afternoon","Evening","Night"];
  const forecast = slots.map((s,x)=>{
    const j=i+x*6;
    const a=calcAQI(d.hourly.pm2_5[j]||0);
    return {slot:s, aqi:a, pm25:Math.round(d.hourly.pm2_5[j]||0), info:getAQIInfo(a)};
  });
  return {aqi,pm25,pm10,no2,so2,co,o3,euro,hourly,forecast,isMock:false};
};

const CITY_APPROX = [
  {n:"New Delhi",c:"IN",lat1:28.3,lat2:29.0,lon1:76.8,lon2:77.5},
  {n:"Mumbai",c:"IN",lat1:18.8,lat2:19.3,lon1:72.6,lon2:73.1},
  {n:"Kolkata",c:"IN",lat1:22.3,lat2:22.8,lon1:88.2,lon2:88.6},
  {n:"Bangalore",c:"IN",lat1:12.7,lat2:13.2,lon1:77.4,lon2:77.8},
  {n:"Chennai",c:"IN",lat1:12.9,lat2:13.2,lon1:80.1,lon2:80.4},
  {n:"Beijing",c:"CN",lat1:39.6,lat2:40.2,lon1:116.0,lon2:116.8},
  {n:"London",c:"GB",lat1:51.2,lat2:51.7,lon1:-0.5,lon2:0.3},
  {n:"New York",c:"US",lat1:40.4,lat2:41.0,lon1:-74.3,lon2:-73.7},
  {n:"Tokyo",c:"JP",lat1:35.5,lat2:35.9,lon1:139.4,lon2:139.9},
  {n:"Paris",c:"FR",lat1:48.7,lat2:49.0,lon1:2.1,lon2:2.6},
  {n:"Agra",c:"IN",lat1:26.9,lat2:27.3,lon1:77.9,lon2:78.2},
  {n:"Jaipur",c:"IN",lat1:26.7,lat2:27.0,lon1:75.6,lon2:76.0},
  {n:"Pune",c:"IN",lat1:18.4,lat2:18.7,lon1:73.7,lon2:74.0},
  {n:"Hyderabad",c:"IN",lat1:17.2,lat2:17.6,lon1:78.3,lon2:78.7},
];
const reverseGeocode = async (lat,lon) => {
  // Try real API first
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(()=>ctrl.abort(),3000);
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,{signal:ctrl.signal});
    clearTimeout(tid);
    const d = await r.json();
    const c = d.address?.city||d.address?.town||d.address?.village||"Your Location";
    return `${c}, ${(d.address?.country_code||"").toUpperCase()}`;
  } catch {
    // Fallback: approximate from bounding box
    const match = CITY_APPROX.find(x=>lat>=x.lat1&&lat<=x.lat2&&lon>=x.lon1&&lon<=x.lon2);
    return match?`${match.n}, ${match.c}`:`Location (${lat.toFixed(1)}°N, ${Math.abs(lon).toFixed(1)}°${lon>=0?"E":"W"})`;
  }
};

const lsGet = (k,def) => { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } };
const lsSet = (k,v) => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

// ═══════════════════════════════════════════════════════════════
//  CSS — GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#04080F; --bg2:#060D18; --bg3:#0A1628;
  --glass:rgba(6,13,24,0.82); --glass2:rgba(10,22,40,0.97);
  --c1:#00C9FF; --c2:#00FFB2; --c3:#FFD60A; --red:#FF4757; --purple:#A29BFE;
  --t1:#E8F6FF; --t2:#5080A0; --t3:#1E3A52;
  --border:rgba(0,201,255,0.09); --border2:rgba(0,201,255,0.2);
  --glow:0 0 40px rgba(0,201,255,0.15); --r:18px;
}
html,body,#root{ height:100%; }
body{ background:var(--bg); color:var(--t1); font-family:'Exo 2',sans-serif; overflow:hidden; }
button{ cursor:pointer; font-family:'Exo 2',sans-serif; }
input,select{ font-family:'Exo 2',sans-serif; }
::-webkit-scrollbar{ width:4px; height:4px; }
::-webkit-scrollbar-track{ background:transparent; }
::-webkit-scrollbar-thumb{ background:var(--t3); border-radius:2px; }
::-webkit-scrollbar-thumb:hover{ background:var(--c1); }

/* ── PARTICLES ── */
.ptcl{ position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
.p{ position:absolute; border-radius:50%; animation:floatUp linear infinite; }
@keyframes floatUp{ 0%{opacity:0;transform:translateY(100vh) scale(0)} 10%{opacity:1} 85%{opacity:0.6} 100%{opacity:0;transform:translateY(-80px) scale(1)} }
.grid-bg{ position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image:linear-gradient(rgba(0,201,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,201,255,0.022) 1px,transparent 1px);
  background-size:52px 52px; }
.orbs{ position:fixed; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(ellipse 55% 45% at 5% 15%,rgba(0,201,255,0.055) 0%,transparent 65%),
    radial-gradient(ellipse 45% 55% at 95% 80%,rgba(0,255,178,0.04) 0%,transparent 65%),
    radial-gradient(ellipse 30% 30% at 55% 2%,rgba(255,214,10,0.025) 0%,transparent 65%); }

/* ── SPLASH ── */
.splash{ position:fixed; inset:0; z-index:200; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--bg); transition:opacity 0.9s ease,transform 0.9s ease; }
.splash.out{ opacity:0; transform:scale(1.05); pointer-events:none; }
.spl-rings{ position:relative; width:130px; height:130px; margin:0 auto 32px; }
.sr{ position:absolute; border-radius:50%; border:2px solid transparent; }
.sr1{ inset:0; border-top-color:var(--c1); border-left-color:var(--c1); animation:spin 3s linear infinite; }
.sr2{ inset:12px; border-bottom-color:var(--c2); border-right-color:var(--c2); animation:spin 2s linear infinite reverse; }
.sr3{ inset:24px; border-top-color:var(--c3); animation:spin 4.5s linear infinite; }
.sr-core{ position:absolute; inset:38px; border-radius:50%; background:radial-gradient(circle,rgba(0,201,255,0.25),transparent); display:flex; align-items:center; justify-content:center; font-size:24px; animation:breathe 2s ease infinite; }
.spl-title{ font-family:'Rajdhani',sans-serif; font-size:60px; font-weight:700; letter-spacing:12px; text-align:center;
  background:linear-gradient(135deg,var(--c1) 0%,var(--c2) 50%,var(--c3) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.spl-sub{ font-size:13px; color:var(--t2); letter-spacing:5px; text-transform:uppercase; text-align:center; margin-top:6px; }
.spl-bar{ width:300px; height:3px; background:rgba(0,201,255,0.1); border-radius:2px; overflow:hidden; margin:44px auto 14px; }
.spl-fill{ height:100%; background:linear-gradient(90deg,var(--c1),var(--c2),var(--c3)); border-radius:2px; animation:sLoad 2.2s ease forwards; }
@keyframes sLoad{ from{width:0%} to{width:100%} }
.spl-pct{ font-family:'Share Tech Mono',monospace; font-size:13px; color:var(--c1); text-align:center; letter-spacing:2px; }
.spl-features{ display:flex; gap:24px; margin-top:36px; }
.spl-feat{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--t3); letter-spacing:1px; }
.spl-feat span{ color:var(--c1); }

/* ── AUTH ── */
.auth-ov{ position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(4,8,15,0.9); backdrop-filter:blur(10px); }
.auth-box{ background:var(--bg3); border:1px solid var(--border2); border-radius:28px; padding:40px; width:440px; max-width:calc(100vw - 32px);
  box-shadow:0 50px 100px rgba(0,0,0,0.8),0 0 60px rgba(0,201,255,0.1); position:relative; overflow:hidden; }
.auth-box::before{ content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(0,201,255,0.05) 0%,transparent 50%); pointer-events:none; }
.auth-tabs{ display:flex; gap:4px; background:rgba(0,0,0,0.4); border-radius:14px; padding:4px; margin-bottom:28px; }
.at-tab{ flex:1; padding:11px; border:none; border-radius:10px; background:none; color:var(--t2); font-size:15px; font-weight:600; transition:all 0.25s; letter-spacing:0.5px; }
.at-tab.on{ background:rgba(0,201,255,0.12); color:var(--c1); }
.auth-head{ text-align:center; margin-bottom:28px; }
.auth-logo-ring{ width:56px; height:56px; border-radius:50%; border:2px solid var(--c1); margin:0 auto 14px; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 0 24px rgba(0,201,255,0.3); animation:pulse 3s infinite; }
.auth-title{ font-family:'Rajdhani',sans-serif; font-size:30px; font-weight:700; letter-spacing:6px; background:linear-gradient(135deg,var(--c1),var(--c2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.auth-sub{ font-size:11px; color:var(--t2); letter-spacing:3px; margin-top:4px; }
.fg{ margin-bottom:16px; }
.flabel{ display:block; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--t2); margin-bottom:7px; }
.finput{ width:100%; padding:13px 16px; background:rgba(0,201,255,0.04); border:1.5px solid var(--border); border-radius:12px; color:var(--t1); font-size:15px; outline:none; transition:all 0.25s; }
.finput:focus{ border-color:var(--c1); box-shadow:0 0 0 3px rgba(0,201,255,0.07); }
.finput::placeholder{ color:var(--t3); }
.btn-prim{ width:100%; padding:15px; background:linear-gradient(135deg,var(--c1),var(--c2)); border:none; border-radius:14px; color:#04080F; font-size:16px; font-weight:800; letter-spacing:1.5px; transition:all 0.25s; margin-top:6px; }
.btn-prim:hover{ opacity:0.88; transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,201,255,0.35); }
.btn-prim:disabled{ opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }
.auth-err{ background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.3); border-radius:10px; padding:11px 14px; font-size:13px; color:#FF6B7A; margin-bottom:14px; }
.auth-guest{ text-align:center; margin-top:16px; }
.auth-guest button{ background:none; border:none; color:var(--t2); font-size:13px; text-decoration:underline; text-underline-offset:3px; }
.auth-guest button:hover{ color:var(--c1); }

/* ── APP SHELL ── */
.shell{ display:flex; height:100vh; position:relative; z-index:1; overflow:hidden; }

/* ── SIDEBAR ── */
.sb{ width:72px; background:rgba(6,13,24,0.97); border-right:1px solid var(--border); display:flex; flex-direction:column; align-items:center; padding:16px 0 20px; gap:4px; flex-shrink:0; backdrop-filter:blur(20px); transition:width 0.28s cubic-bezier(0.4,0,0.2,1); z-index:20; position:relative; }
.sb.exp{ width:216px; }
.sb-top{ padding:4px 0 18px; width:100%; display:flex; align-items:center; justify-content:center; gap:12px; overflow:hidden; cursor:pointer; }
.sb-icon-wrap{ width:38px; height:38px; border-radius:50%; border:2px solid rgba(0,201,255,0.4); display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; box-shadow:0 0 18px rgba(0,201,255,0.2); animation:pulse 4s infinite; }
.sb-title{ font-family:'Rajdhani',sans-serif; font-size:18px; font-weight:700; letter-spacing:3px; background:linear-gradient(90deg,var(--c1),var(--c2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; white-space:nowrap; opacity:0; transition:opacity 0.2s 0.05s; }
.sb.exp .sb-title{ opacity:1; }
.nav-item{ width:calc(100% - 12px); display:flex; align-items:center; gap:12px; padding:12px; border-radius:14px; border:1px solid transparent; color:var(--t2); transition:all 0.22s; position:relative; overflow:hidden; }
.nav-item::before{ content:''; position:absolute; left:0; top:15%; bottom:15%; width:0; background:var(--c1); border-radius:0 2px 2px 0; transition:width 0.2s; box-shadow:0 0 8px var(--c1); }
.nav-item:hover{ background:rgba(0,201,255,0.07); color:var(--t1); border-color:var(--border); }
.nav-item.act{ background:rgba(0,201,255,0.1); color:var(--c1); border-color:rgba(0,201,255,0.18); }
.nav-item.act::before{ width:3px; }
.nav-ic{ font-size:17px; flex-shrink:0; min-width:22px; text-align:center; }
.nav-lbl{ font-size:13px; font-weight:600; letter-spacing:0.5px; white-space:nowrap; opacity:0; transition:opacity 0.15s; }
.sb.exp .nav-lbl{ opacity:1; }
.nav-bdg{ background:var(--red); color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:8px; margin-left:auto; flex-shrink:0; opacity:0; transition:opacity 0.15s; }
.sb.exp .nav-bdg{ opacity:1; }
.sb-tog{ margin-top:auto; width:calc(100% - 12px); padding:11px; border-radius:12px; background:rgba(0,201,255,0.04); border:1px solid var(--border); color:var(--t2); display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.22s; overflow:hidden; }
.sb-tog:hover{ background:rgba(0,201,255,0.09); color:var(--c1); }
.sb-tog-label{ font-size:12px; font-weight:600; opacity:0; transition:opacity 0.15s; white-space:nowrap; }
.sb.exp .sb-tog-label{ opacity:1; }

/* ── MAIN AREA ── */
.main-area{ flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

/* ── HEADER ── */
.hdr{ padding:12px 22px; background:rgba(6,13,24,0.97); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:14px; backdrop-filter:blur(20px); flex-shrink:0; }
.hdr-loc{ display:flex; align-items:center; gap:10px; background:rgba(0,201,255,0.05); border:1px solid var(--border2); border-radius:30px; padding:9px 18px; max-width:380px; }
.loc-pulse{ width:8px; height:8px; border-radius:50%; background:#00E676; box-shadow:0 0 12px #00E676; flex-shrink:0; animation:breathe 2.5s ease infinite; }
.loc-txt{ font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hdr-right{ display:flex; align-items:center; gap:10px; margin-left:auto; }
.hdr-chip{ padding:8px 14px; background:rgba(0,201,255,0.05); border:1px solid var(--border); border-radius:20px; font-size:12px; color:var(--t2); font-family:'Share Tech Mono',monospace; white-space:nowrap; }
.hdr-user{ display:flex; align-items:center; gap:10px; padding:7px 14px; background:rgba(0,201,255,0.05); border:1px solid var(--border); border-radius:24px; cursor:pointer; transition:all 0.2s; }
.hdr-user:hover{ border-color:var(--border2); }
.h-avatar{ width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--c1),var(--c2)); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:#04080F; flex-shrink:0; }
.h-uname{ font-size:13px; font-weight:600; }

/* ── TICKER ── */
.ticker{ background:rgba(0,201,255,0.03); border-bottom:1px solid var(--border); padding:6px 22px; overflow:hidden; flex-shrink:0; }
.ticker-wrap{ display:flex; gap:80px; animation:ticker 35s linear infinite; white-space:nowrap; width:max-content; }
.tick-item{ font-size:11px; color:var(--t2); letter-spacing:0.5px; }
.tick-item strong{ color:var(--c1); margin-right:8px; font-weight:600; }
@keyframes ticker{ 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* ── CONTENT ── */
.content{ flex:1; overflow-y:auto; padding:22px; }

/* ── CARDS ── */
.card{ background:var(--glass); border:1px solid var(--border); border-radius:var(--r); padding:22px; backdrop-filter:blur(24px); position:relative; overflow:hidden; transition:border-color 0.3s,box-shadow 0.3s,transform 0.3s; }
.card:hover{ border-color:var(--border2); box-shadow:0 12px 36px rgba(0,0,0,0.3),var(--glow); }
.card::after{ content:''; position:absolute; inset:0; border-radius:var(--r); background:linear-gradient(135deg,rgba(0,201,255,0.025) 0%,transparent 55%); pointer-events:none; }
.shine{ position:absolute; top:0; left:-100%; width:55%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.02),transparent); transform:skewX(-18deg); transition:left 0.7s; }
.card:hover .shine{ left:160%; }
.ctag{ font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--t2); margin-bottom:16px; display:flex; align-items:center; gap:8px; }
.ctag::before{ content:''; width:14px; height:2px; background:var(--c1); border-radius:1px; display:inline-block; }

/* ── LAYOUTS ── */
.g2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
.g3{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:16px; }
.g4{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
.g13{ display:grid; grid-template-columns:350px 1fr; gap:16px; margin-bottom:16px; }
@media(max-width:900px){ .g2,.g3,.g4{ grid-template-columns:1fr 1fr!important; } .g13{ grid-template-columns:1fr!important; } }
@media(max-width:520px){ .g2,.g3,.g4{ grid-template-columns:1fr!important; } }

/* ── SEARCH ── */
.srch-wrap{ position:relative; margin-bottom:18px; }
.srch-bar{ display:flex; align-items:center; gap:12px; background:rgba(6,13,24,0.95); border:1.5px solid var(--border); border-radius:16px; padding:12px 18px; transition:all 0.3s; }
.srch-bar:focus-within{ border-color:var(--c1); box-shadow:0 0 0 3px rgba(0,201,255,0.07),var(--glow); }
.srch-inp{ flex:1; background:none; border:none; outline:none; color:var(--t1); font-size:15px; }
.srch-inp::placeholder{ color:var(--t3); }
.srch-btn{ padding:9px 20px; background:linear-gradient(135deg,var(--c1),var(--c2)); border:none; border-radius:10px; color:#04080F; font-weight:800; font-size:13px; letter-spacing:1px; transition:all 0.2s; white-space:nowrap; }
.srch-btn:hover{ opacity:0.86; transform:scale(0.97); }
.drop{ position:absolute; top:calc(100% + 8px); left:0; right:0; background:rgba(6,13,24,0.99); border:1px solid var(--border2); border-radius:16px; overflow:hidden; z-index:50; backdrop-filter:blur(24px); box-shadow:0 20px 60px rgba(0,0,0,0.65); }
.drop-row{ padding:12px 18px; cursor:pointer; display:flex; align-items:center; gap:12px; transition:background 0.2s; border-bottom:1px solid var(--border); }
.drop-row:last-child{ border-bottom:none; }
.drop-row:hover{ background:rgba(0,201,255,0.06); }
.dr-n{ font-weight:600; font-size:14px; }
.dr-s{ font-size:11px; color:var(--t2); margin-top:2px; }

/* ── GAUGE ── */
.gauge-wrap{ position:relative; width:210px; height:120px; margin:0 auto; }
.gauge-svg{ width:100%; height:100%; overflow:visible; }
.aqi-num{ font-family:'Share Tech Mono',monospace; font-size:64px; text-align:center; line-height:1; animation:numPop 0.9s cubic-bezier(0.34,1.56,0.64,1); }
.aqi-lbl{ font-size:12px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; text-align:center; margin-top:6px; }
.aqi-desc{ font-size:12px; color:var(--t2); text-align:center; max-width:200px; line-height:1.6; margin:8px auto 0; }

/* ── STAT ROW ── */
.srow{ display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border); }
.srow:last-child{ border-bottom:none; }
.sk{ color:var(--t2); font-size:13px; }
.sv{ font-family:'Share Tech Mono',monospace; font-size:13px; }

/* ── POLLUTANT CARDS ── */
.pc{ background:var(--glass); border:1px solid var(--border); border-radius:16px; padding:18px; backdrop-filter:blur(20px); transition:all 0.3s; position:relative; overflow:hidden; cursor:default; }
.pc:hover{ transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,0.3); }
.pc-glow{ position:absolute; top:0; left:0; right:0; height:70px; opacity:0; transition:opacity 0.3s; pointer-events:none; }
.pc:hover .pc-glow{ opacity:1; }
.pc-name{ font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:var(--t2); margin-bottom:6px; }
.pc-val{ font-family:'Share Tech Mono',monospace; font-size:36px; line-height:1; }
.pc-unit{ font-size:11px; color:var(--t2); margin-top:4px; }
.pc-desc{ font-size:10px; color:var(--t3); margin-top:6px; line-height:1.5; }
.pc-track{ height:4px; background:rgba(255,255,255,0.05); border-radius:2px; margin-top:12px; overflow:hidden; }
.pc-bar{ height:100%; border-radius:2px; transition:width 1.5s cubic-bezier(0.4,0,0.2,1); }
.pc-status{ font-size:10px; font-weight:700; letter-spacing:1px; margin-top:8px; }

/* ── SCALE BAR ── */
.scalebar{ display:flex; gap:2px; border-radius:12px; overflow:hidden; margin-bottom:18px; }
.sb-seg{ flex:1; padding:10px 4px; text-align:center; transition:transform 0.2s; cursor:default; }
.sb-seg:hover{ transform:scaleY(1.1); }
.sb-seg-l{ font-size:8px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; }
.sb-seg-r{ font-family:'Share Tech Mono',monospace; font-size:8px; margin-top:3px; opacity:0.55; }

/* ── ALERT BANNER ── */
.abanner{ display:flex; align-items:flex-start; gap:14px; padding:15px 20px; border-radius:16px; margin-bottom:16px; border:1px solid; position:relative; overflow:hidden; animation:slideUp 0.4s ease; }
.abs{ position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.018),transparent); animation:scan 4s linear infinite; }
.ab-icon{ font-size:22px; flex-shrink:0; margin-top:2px; }
.ab-t{ font-weight:700; font-size:14px; margin-bottom:3px; }
.ab-d{ font-size:13px; opacity:0.8; line-height:1.5; }
.ab-x{ margin-left:auto; background:none; border:none; color:inherit; font-size:16px; opacity:0.5; padding:4px; flex-shrink:0; transition:opacity 0.2s; }
.ab-x:hover{ opacity:1; }

/* ── FORECAST CARDS ── */
.fc-card{ background:var(--glass); border:1px solid var(--border); border-radius:16px; padding:18px; text-align:center; backdrop-filter:blur(20px); transition:all 0.3s; }
.fc-card:hover{ transform:translateY(-4px); border-color:var(--border2); }
.fc-time{ font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--t2); margin-bottom:10px; }
.fc-icon{ font-size:26px; margin-bottom:8px; }
.fc-num{ font-family:'Share Tech Mono',monospace; font-size:28px; }
.fc-lbl{ font-size:11px; font-weight:700; letter-spacing:1px; margin-top:5px; }
.fc-pm{ font-size:11px; color:var(--t2); margin-top:4px; }

/* ── COMPARE ── */
.cmp-city{ background:var(--glass); border:1px solid var(--border); border-radius:18px; padding:20px; backdrop-filter:blur(20px); transition:all 0.3s; }
.cmp-city:hover{ border-color:var(--border2); }
.cch{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.cch-name{ font-size:15px; font-weight:700; }
.cch-rm{ background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.2); border-radius:8px; color:#FF4757; font-size:11px; padding:5px 10px; transition:all 0.2s; }
.cch-rm:hover{ background:rgba(255,71,87,0.2); }
.cmp-aqi{ font-family:'Share Tech Mono',monospace; font-size:52px; line-height:1; margin:4px 0 4px; }
.cmp-lbl{ font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:14px; }
.cmp-row{ display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px; }
.cmp-row:last-child{ border-bottom:none; }
.cmp-row span:first-child{ color:var(--t2); }
.cmp-row span:last-child{ font-family:'Share Tech Mono',monospace; font-size:12px; }
.cmp-loading{ display:flex; flex-direction:column; align-items:center; justify-content:center; height:160px; gap:14px; }
.cmp-spinner{ width:36px; height:36px; border-radius:50%; border:2.5px solid rgba(0,201,255,0.1); border-top-color:var(--c1); animation:spin 1s linear infinite; }

/* ── ALERTS ── */
.al-item{ display:flex; align-items:flex-start; gap:14px; padding:15px 16px; background:var(--glass); border:1px solid var(--border); border-radius:16px; margin-bottom:10px; transition:all 0.25s; position:relative; overflow:hidden; }
.al-item:hover{ border-color:var(--border2); transform:translateX(4px); }
.al-item.unread::before{ content:''; position:absolute; left:0; top:10%; bottom:10%; width:3px; border-radius:0 2px 2px 0; background:var(--c1); box-shadow:0 0 8px var(--c1); }
.al-icon{ font-size:20px; flex-shrink:0; margin-top:2px; }
.al-loc{ font-size:14px; font-weight:700; margin-bottom:3px; }
.al-time{ font-size:11px; color:var(--t2); }
.al-aqi{ font-family:'Share Tech Mono',monospace; font-size:24px; margin-left:auto; flex-shrink:0; }
.al-lbl{ font-size:10px; font-weight:700; letter-spacing:1px; text-align:right; margin-top:2px; }
.al-rm{ background:none; border:none; color:var(--t3); font-size:14px; padding:4px; transition:color 0.2s; }
.al-rm:hover{ color:var(--red); }
.no-alerts{ text-align:center; padding:60px 20px; }
.no-alerts-ic{ font-size:52px; margin-bottom:16px; }

/* ── SETTINGS ── */
.stg-section{ margin-bottom:26px; }
.stg-title{ font-family:'Rajdhani',sans-serif; font-size:17px; font-weight:700; letter-spacing:2px; color:var(--c1); display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.stg-title::after{ content:''; flex:1; height:1px; background:var(--border); }
.stg-row{ display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:var(--glass); border:1px solid var(--border); border-radius:14px; margin-bottom:10px; gap:12px; }
.stg-key{ font-size:13px; color:var(--t2); }
.stg-val{ font-size:14px; font-weight:600; }
.thresh-inp{ -webkit-appearance:none; appearance:none; width:160px; height:4px; background:rgba(0,201,255,0.12); border-radius:2px; outline:none; cursor:pointer; }
.thresh-inp::-webkit-slider-thumb{ -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:linear-gradient(135deg,var(--c1),var(--c2)); box-shadow:0 0 10px rgba(0,201,255,0.4); }
.stg-input{ background:rgba(0,201,255,0.04); border:1.5px solid var(--border); border-radius:10px; padding:9px 14px; color:var(--t1); font-size:14px; outline:none; transition:border-color 0.2s; width:200px; }
.stg-input:focus{ border-color:var(--c1); }
.btn-save{ padding:10px 24px; background:linear-gradient(135deg,var(--c1),var(--c2)); border:none; border-radius:12px; color:#04080F; font-weight:800; font-size:14px; letter-spacing:1px; transition:all 0.2s; }
.btn-save:hover{ opacity:0.85; transform:translateY(-1px); }
.btn-danger{ padding:10px 24px; background:rgba(255,71,87,0.08); border:1px solid rgba(255,71,87,0.3); border-radius:12px; color:#FF4757; font-weight:700; font-size:14px; transition:all 0.2s; }
.btn-danger:hover{ background:rgba(255,71,87,0.18); }
.preset-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
@media(max-width:520px){ .preset-grid{ grid-template-columns:repeat(2,1fr); } }
.preset-btn{ padding:10px 8px; background:rgba(0,201,255,0.04); border:1px solid var(--border); border-radius:12px; color:var(--t2); font-size:12px; font-weight:500; transition:all 0.2s; text-align:center; }
.preset-btn:hover{ background:rgba(0,201,255,0.1); border-color:var(--border2); color:var(--t1); }

/* ── HEALTH ── */
.health-row{ display:flex; align-items:center; justify-content:space-between; padding:11px 0; border-bottom:1px solid var(--border); }
.health-row:last-child{ border-bottom:none; }
.hl{ display:flex; align-items:center; gap:8px; color:var(--t2); font-size:13px; }
.htag{ padding:4px 14px; border-radius:20px; font-size:10px; font-weight:700; letter-spacing:1px; }
.h-guide{ padding:14px; border-radius:12px; border:1px solid; margin-bottom:8px; transition:all 0.3s; }
.h-guide:hover{ transform:translateX(4px); }
.h-guide-top{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.h-guide-icon{ font-size:18px; }
.h-guide-lbl{ font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; }
.h-guide-range{ font-family:'Share Tech Mono',monospace; font-size:11px; opacity:0.6; margin-left:auto; }
.h-guide-desc{ font-size:12px; line-height:1.6; opacity:0.75; }

/* ── TOOLTIP ── */
.ctt{ background:rgba(6,13,24,0.98); border:1px solid var(--border2); border-radius:12px; padding:10px 16px; font-family:'Exo 2',sans-serif; }
.ctt-v{ font-family:'Share Tech Mono',monospace; font-size:22px; }
.ctt-l{ font-size:11px; margin-top:2px; }
.ctt-t{ font-size:10px; color:var(--t2); margin-top:2px; }

/* ── SECTION HEADER ── */
.sec-hdr{ display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:20px; }
.sec-title{ font-family:'Rajdhani',sans-serif; font-size:24px; font-weight:700; letter-spacing:2px; }
.sec-sub{ font-size:12px; color:var(--t2); margin-top:4px; }
.sec-badge{ padding:6px 16px; background:rgba(0,201,255,0.07); border:1px solid var(--border2); border-radius:20px; font-size:11px; color:var(--c1); font-weight:600; letter-spacing:1px; }

/* ── LOADING ── */
.p-loader{ display:flex; flex-direction:column; align-items:center; justify-content:center; height:55vh; gap:18px; }
.l-ring{ width:60px; height:60px; border-radius:50%; border:3px solid rgba(0,201,255,0.1); border-top-color:var(--c1); animation:spin 1s linear infinite; box-shadow:var(--glow); }
.l-txt{ font-family:'Share Tech Mono',monospace; font-size:12px; color:var(--c1); letter-spacing:3px; }
.l-sub{ font-size:13px; color:var(--t2); }

/* ── ANIMATIONS ── */
@keyframes spin{ from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes breathe{ 0%,100%{opacity:0.65;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
@keyframes numPop{ from{opacity:0;transform:scale(0.25)} to{opacity:1;transform:scale(1)} }
@keyframes slideUp{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes scan{ 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
@keyframes fadeIn{ from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse{ 0%,100%{box-shadow:0 0 0 0 rgba(0,201,255,0.25)} 50%{box-shadow:0 0 0 8px rgba(0,201,255,0)} }
.a1{animation:fadeIn 0.4s ease both} .a2{animation:fadeIn 0.5s ease both} .a3{animation:fadeIn 0.6s ease both}
.a4{animation:fadeIn 0.7s ease both} .a5{animation:fadeIn 0.8s ease both} .a6{animation:fadeIn 0.9s ease both}
`;

// ═══════════════════════════════════════════════════════════════
//  SMALL REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Particles() {
  const pts = Array.from({length:12},(_,i)=>({
    id:i,
    size: 2+Math.random()*3,
    left: Math.random()*100,
    dur: 12+Math.random()*18,
    delay: Math.random()*20,
    color: i%3===0?"rgba(0,201,255,0.4)":i%3===1?"rgba(0,255,178,0.3)":"rgba(255,214,10,0.25)",
  }));
  return (
    <div className="ptcl">
      {pts.map(p=>(
        <div key={p.id} className="p" style={{
          width:p.size, height:p.size, left:`${p.left}%`, bottom:0,
          background:p.color,
          animationDuration:`${p.dur}s`,
          animationDelay:`${p.delay}s`,
        }}/>
      ))}
    </div>
  );
}

function Gauge({ aqi, color }) {
  const pct = Math.min(aqi/500,1);
  const angle = pct*180;
  const rad = (angle-90)*(Math.PI/180);
  const nx = 105+82*Math.cos(rad), ny=105+82*Math.sin(rad);
  return (
    <div className="gauge-wrap">
      <svg className="gauge-svg" viewBox="0 0 210 115">
        <defs>
          <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
            {AQI_LEVELS.map((l,i)=>(
              <stop key={i} offset={`${(i/5)*100}%`} stopColor={l.color}/>
            ))}
          </linearGradient>
        </defs>
        <path d="M 18 105 A 87 87 0 0 1 192 105" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" strokeLinecap="round"/>
        <path d="M 18 105 A 87 87 0 0 1 192 105" fill="none" stroke="url(#gg)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray="274" strokeDashoffset={274-pct*274}
          style={{transition:"stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)"}}/>
        <circle cx="105" cy="105" r="9" fill={color}/>
        <line x1="105" y1="105" x2={nx} y2={ny} stroke={color} strokeWidth="3" strokeLinecap="round"/>
        <circle cx="105" cy="105" r="5" fill="var(--bg)"/>
        <circle cx="105" cy="105" r="3" fill={color}/>
        {["0","100","200","300","500"].map((v,i)=>{
          const a=((i/4)*180-90)*(Math.PI/180);
          const tx=105+98*Math.cos(a), ty=105+98*Math.sin(a);
          return <text key={i} x={tx} y={ty} fill="rgba(255,255,255,0.25)" fontSize="7" textAnchor="middle" dominantBaseline="middle">{v}</text>;
        })}
      </svg>
    </div>
  );
}

function PollutantCard({ pKey, value }) {
  const meta = POLLUTANTS_META[pKey];
  const pct = Math.min((value/(meta.safe*1.5))*100,100);
  const over = value > meta.safe;
  return (
    <div className="pc">
      <div className="pc-glow" style={{background:`radial-gradient(circle at 50% 0%,${meta.color}12,transparent 70%)`}}/>
      <div className="pc-name">{meta.name}</div>
      <div className="pc-val" style={{color:meta.color}}>{value}</div>
      <div className="pc-unit">{meta.unit}</div>
      <div className="pc-desc">{meta.desc}</div>
      <div className="pc-track">
        <div className="pc-bar" style={{width:`${pct}%`,background:over?"#FF4757":meta.color}}/>
      </div>
      <div className="pc-status" style={{color:over?"#FF4757":"#00E676"}}>
        {over?`⚠ ${Math.round((value/meta.safe-1)*100)}% ABOVE SAFE`:`✓ WITHIN SAFE LIMIT`}
      </div>
    </div>
  );
}

function ChartTooltip({active,payload,unit=""}) {
  if (!active||!payload?.length) return null;
  const val = payload[0].value;
  const info = unit===""?getAQIInfo(val):null;
  return (
    <div className="ctt">
      <div className="ctt-v" style={{color:info?info.color:payload[0].stroke}}>{val}</div>
      {info && <div className="ctt-l" style={{color:info.color}}>{info.label}</div>}
      <div className="ctt-t">{payload[0].payload.time} {unit&&`— ${unit}`}</div>
    </div>
  );
}

function SectionHeader({title,sub,badge}) {
  return (
    <div className="sec-hdr">
      <div>
        <div className="sec-title">{title}</div>
        {sub && <div className="sec-sub">{sub}</div>}
      </div>
      {badge && <div className="sec-badge">{badge}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SPLASH SCREEN
// ═══════════════════════════════════════════════════════════════
function SplashScreen({onDone}) {
  const [pct,setPct] = useState(0);
  const [done,setDone] = useState(false);
  useEffect(()=>{
    const msgs = ["Initializing sensors...","Fetching air data...","Loading health models...","Ready!"];
    let p=0;
    const t = setInterval(()=>{ p+=2; setPct(p); if(p>=100){clearInterval(t);setTimeout(()=>{setDone(true);setTimeout(onDone,700);},300);}},44);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div className={`splash${done?" out":""}`}>
      <div style={{textAlign:"center"}}>
        <div className="spl-rings">
          <div className="sr sr1"/><div className="sr sr2"/><div className="sr sr3"/>
          <div className="sr-core">🌿</div>
        </div>
        <div className="spl-title">RESALTH</div>
        <div className="spl-sub">Breathe Smart · Live Safe</div>
        <div className="spl-bar"><div className="spl-fill"/></div>
        <div className="spl-pct">LOADING {pct}%</div>
        <div style={{display:"flex",gap:28,justifyContent:"center",marginTop:32}}>
          {["Real-Time AQI","Smart Alerts","City Compare","Health Guide"].map(f=>(
            <div key={f} style={{fontSize:11,color:"var(--t3)",letterSpacing:"1px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:"var(--c1)"}}>◆</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  AUTH MODAL
// ═══════════════════════════════════════════════════════════════
function AuthModal({onAuth,onGuest}) {
  const [tab,setTab]=useState("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    await new Promise(r=>setTimeout(r,600));
    if (!email||!pass) { setErr("Please fill in all fields."); setLoading(false); return; }
    if (tab==="register" && !name) { setErr("Name is required."); setLoading(false); return; }
    if (pass.length<6) { setErr("Password must be at least 6 characters."); setLoading(false); return; }
    const users = lsGet("resalth_users",[]);
    if (tab==="register") {
      if (users.find(u=>u.email===email)) { setErr("Email already registered. Please login."); setLoading(false); return; }
      const user = {id:Date.now(),name,email,alertThreshold:100,savedLocations:[]};
      lsSet("resalth_users",[...users,{...user,pass}]);
      lsSet("resalth_user",user);
      onAuth(user);
    } else {
      const found = users.find(u=>u.email===email&&u.pass===pass);
      if (!found) { setErr("Invalid email or password."); setLoading(false); return; }
      const {pass:_,...user} = found;
      lsSet("resalth_user",user);
      onAuth(user);
    }
    setLoading(false);
  };

  return (
    <div className="auth-ov">
      <div className="auth-box">
        <div className="auth-head">
          <div className="auth-logo-ring">🌿</div>
          <div className="auth-title">RESALTH</div>
          <div className="auth-sub">Breathe Smart · Live Safe</div>
        </div>
        <div className="auth-tabs">
          <button className={`at-tab${tab==="login"?" on":""}`} onClick={()=>{setTab("login");setErr("");}}>Login</button>
          <button className={`at-tab${tab==="register"?" on":""}`} onClick={()=>{setTab("register");setErr("");}}>Register</button>
        </div>
        {err && <div className="auth-err">⚠ {err}</div>}
        {tab==="register" && (
          <div className="fg">
            <label className="flabel">Full Name</label>
            <input className="finput" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>
        )}
        <div className="fg">
          <label className="flabel">Email Address</label>
          <input className="finput" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <div className="fg">
          <label className="flabel">Password</label>
          <input className="finput" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <button className="btn-prim" onClick={submit} disabled={loading}>
          {loading?"AUTHENTICATING...":tab==="login"?"LOGIN →":"CREATE ACCOUNT →"}
        </button>
        <div className="auth-guest">
          <button onClick={onGuest}>Continue as Guest (no account needed)</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SEARCH BAR
// ═══════════════════════════════════════════════════════════════
// ── Built-in city database for offline/sandbox search ──
const CITY_DB = [
  {name:"New Delhi",  admin1:"Delhi",           country:"India",         latitude:28.6139, longitude:77.2090},
  {name:"Delhi",      admin1:"Delhi",           country:"India",         latitude:28.6139, longitude:77.2090},
  {name:"Mumbai",     admin1:"Maharashtra",     country:"India",         latitude:19.0760, longitude:72.8777},
  {name:"Kolkata",    admin1:"West Bengal",     country:"India",         latitude:22.5726, longitude:88.3639},
  {name:"Bangalore",  admin1:"Karnataka",       country:"India",         latitude:12.9716, longitude:77.5946},
  {name:"Bengaluru",  admin1:"Karnataka",       country:"India",         latitude:12.9716, longitude:77.5946},
  {name:"Chennai",    admin1:"Tamil Nadu",      country:"India",         latitude:13.0827, longitude:80.2707},
  {name:"Hyderabad",  admin1:"Telangana",       country:"India",         latitude:17.3850, longitude:78.4867},
  {name:"Pune",       admin1:"Maharashtra",     country:"India",         latitude:18.5204, longitude:73.8567},
  {name:"Agra",       admin1:"Uttar Pradesh",   country:"India",         latitude:27.1767, longitude:78.0081},
  {name:"Jaipur",     admin1:"Rajasthan",       country:"India",         latitude:26.9124, longitude:75.7873},
  {name:"Lucknow",    admin1:"Uttar Pradesh",   country:"India",         latitude:26.8467, longitude:80.9462},
  {name:"Kanpur",     admin1:"Uttar Pradesh",   country:"India",         latitude:26.4499, longitude:80.3319},
  {name:"Patna",      admin1:"Bihar",           country:"India",         latitude:25.5941, longitude:85.1376},
  {name:"Bhopal",     admin1:"Madhya Pradesh",  country:"India",         latitude:23.2599, longitude:77.4126},
  {name:"Indore",     admin1:"Madhya Pradesh",  country:"India",         latitude:22.7196, longitude:75.8577},
  {name:"Ahmedabad",  admin1:"Gujarat",         country:"India",         latitude:23.0225, longitude:72.5714},
  {name:"Surat",      admin1:"Gujarat",         country:"India",         latitude:21.1702, longitude:72.8311},
  {name:"Noida",      admin1:"Uttar Pradesh",   country:"India",         latitude:28.5355, longitude:77.3910},
  {name:"Gurgaon",    admin1:"Haryana",         country:"India",         latitude:28.4595, longitude:77.0266},
  {name:"Chandigarh", admin1:"Punjab",          country:"India",         latitude:30.7333, longitude:76.7794},
  {name:"Varanasi",   admin1:"Uttar Pradesh",   country:"India",         latitude:25.3176, longitude:82.9739},
  {name:"Nagpur",     admin1:"Maharashtra",     country:"India",         latitude:21.1458, longitude:79.0882},
  {name:"Dehradun",   admin1:"Uttarakhand",     country:"India",         latitude:30.3165, longitude:78.0322},
  {name:"Beijing",    admin1:"Beijing",         country:"China",         latitude:39.9042, longitude:116.4074},
  {name:"Shanghai",   admin1:"Shanghai",        country:"China",         latitude:31.2304, longitude:121.4737},
  {name:"London",     admin1:"England",         country:"United Kingdom",latitude:51.5072, longitude:-0.1276},
  {name:"Paris",      admin1:"Île-de-France",   country:"France",        latitude:48.8566, longitude:2.3522},
  {name:"Berlin",     admin1:"Berlin",          country:"Germany",       latitude:52.5200, longitude:13.4050},
  {name:"New York",   admin1:"New York",        country:"United States", latitude:40.7128, longitude:-74.0060},
  {name:"Los Angeles",admin1:"California",      country:"United States", latitude:34.0522, longitude:-118.2437},
  {name:"Chicago",    admin1:"Illinois",        country:"United States", latitude:41.8781, longitude:-87.6298},
  {name:"Tokyo",      admin1:"Tokyo",           country:"Japan",         latitude:35.6762, longitude:139.6503},
  {name:"Osaka",      admin1:"Osaka",           country:"Japan",         latitude:34.6937, longitude:135.5022},
  {name:"Seoul",      admin1:"Seoul",           country:"South Korea",   latitude:37.5665, longitude:126.9780},
  {name:"Bangkok",    admin1:"Bangkok",         country:"Thailand",      latitude:13.7563, longitude:100.5018},
  {name:"Dubai",      admin1:"Dubai",           country:"UAE",           latitude:25.2048, longitude:55.2708},
  {name:"Singapore",  admin1:"Singapore",       country:"Singapore",     latitude:1.3521,  longitude:103.8198},
  {name:"Sydney",     admin1:"New South Wales", country:"Australia",     latitude:-33.8688,longitude:151.2093},
  {name:"Toronto",    admin1:"Ontario",         country:"Canada",        latitude:43.6532, longitude:-79.3832},
  {name:"Kathmandu",  admin1:"Bagmati",         country:"Nepal",         latitude:27.7172, longitude:85.3240},
  {name:"Dhaka",      admin1:"Dhaka",           country:"Bangladesh",    latitude:23.8103, longitude:90.4125},
  {name:"Karachi",    admin1:"Sindh",           country:"Pakistan",      latitude:24.8607, longitude:67.0011},
  {name:"Lahore",     admin1:"Punjab",          country:"Pakistan",      latitude:31.5497, longitude:74.3436},
];

function SearchBar({onPick}) {
  const [q,setQ]=useState("");
  const [results,setResults]=useState([]);
  const ref=useRef(null);

  useEffect(()=>{
    const fn=(e)=>{if(ref.current&&!ref.current.contains(e.target))setResults([]);};
    document.addEventListener("mousedown",fn);
    return()=>document.removeEventListener("mousedown",fn);
  },[]);

  const search = async (val) => {
    setQ(val);
    if (val.length<2){setResults([]);return;}
    // 1. Immediately show local results
    const local = CITY_DB.filter(c=>
      c.name.toLowerCase().includes(val.toLowerCase()) ||
      c.admin1.toLowerCase().includes(val.toLowerCase()) ||
      c.country.toLowerCase().includes(val.toLowerCase())
    ).slice(0,7);
    if(local.length>0) setResults(local);
    // 2. Try real API in background
    try{
      const ctrl=new AbortController();
      setTimeout(()=>ctrl.abort(),3000);
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=7&language=en`,{signal:ctrl.signal});
      const d=await r.json();
      if(d.results?.length>0) setResults(d.results);
    }catch{ /* keep local results */ }
  };

  const pick=(c)=>{ setQ(""); setResults([]); onPick(c); };

  return (
    <div className="srch-wrap" ref={ref}>
      <div className="srch-bar">
        <span style={{color:"var(--c1)",fontSize:17}}>⌕</span>
        <input className="srch-inp" placeholder="Search any city — Mumbai, London, Tokyo..." value={q}
          onChange={e=>search(e.target.value)} onKeyDown={e=>e.key==="Enter"&&results[0]&&pick(results[0])}/>
        {q&&<button style={{background:"none",border:"none",color:"var(--t2)",fontSize:14,padding:4}} onClick={()=>{setQ("");setResults([]);}}>✕</button>}
        <button className="srch-btn" onClick={()=>results[0]&&pick(results[0])}>Search</button>
      </div>
      {results.length>0&&(
        <div className="drop">
          {results.map((c,i)=>(
            <div key={i} className="drop-row" onClick={()=>pick(c)}>
              <span>📍</span>
              <div>
                <div className="dr-n">{c.name}</div>
                <div className="dr-s">{c.admin1&&`${c.admin1}, `}{c.country}</div>
              </div>
              <span style={{marginLeft:"auto",color:"var(--t3)",fontSize:11,fontFamily:"'Share Tech Mono',monospace"}}>{c.latitude?.toFixed(1)}°N</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: DASHBOARD
// ═══════════════════════════════════════════════════════════════
function TabDashboard({aqiData,cityName,alerts,threshold,onSaveAlert,onPickCity}) {
  const [dismissed,setDismissed]=useState(false);
  const info = getAQIInfo(aqiData.aqi);
  const tips = HEALTH_TIPS[info.label]||HEALTH_TIPS["Moderate"];
  const radarData=[
    {p:"PM2.5",v:Math.min((aqiData.pm25/75)*100,100)},
    {p:"PM10", v:Math.min((aqiData.pm10/150)*100,100)},
    {p:"NO₂",  v:Math.min((aqiData.no2/100)*100,100)},
    {p:"SO₂",  v:Math.min((aqiData.so2/50)*100,100)},
    {p:"O₃",   v:Math.min((aqiData.o3/120)*100,100)},
    {p:"CO",   v:Math.min((aqiData.co/4000)*100,100)},
  ];
  const showBanner = aqiData.aqi>threshold && !dismissed;

  return (
    <div>
      <SectionHeader title="Air Quality Dashboard" sub={`Real-time data for ${cityName}`} badge={`AQI ${aqiData.aqi}`}/>
      <SearchBar onPick={onPickCity}/>
      {showBanner&&(
        <div className="abanner a1" style={{background:info.bg,borderColor:`${info.color}35`,color:info.color}}>
          <div className="abs"/>
          <span className="ab-icon">{info.icon}</span>
          <div>
            <div className="ab-t">⚠ Air Quality Alert — {info.label}</div>
            <div className="ab-d" style={{color:"var(--t1)"}}>{info.desc}</div>
          </div>
          <button className="ab-x" onClick={()=>setDismissed(true)}>✕</button>
        </div>
      )}

      {/* Main grid: Gauge + Tips */}
      <div className="g13 a2">
        <div className="card" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div className="shine"/>
          <div className="ctag">Current AQI Index</div>
          <Gauge aqi={aqiData.aqi} color={info.color}/>
          <div className="aqi-num" style={{color:info.color,textShadow:`0 0 30px ${info.glow}`}}>{aqiData.aqi}</div>
          <div className="aqi-lbl" style={{color:info.color}}>{info.icon} {info.label}</div>
          <div className="aqi-desc">{info.desc}</div>
          <div style={{width:"100%",marginTop:8}}>
            {[["PM2.5",aqiData.pm25,"var(--c1)","μg/m³"],["PM10",aqiData.pm10,"var(--c2)","μg/m³"],["European AQI",aqiData.euro,"var(--c3)",""]].map(([k,v,c,u])=>(
              <div key={k} className="srow"><span className="sk">{k}</span><span className="sv" style={{color:c}}>{v} {u}</span></div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Quick Stats */}
          <div className="a3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {[
              {label:"NO₂",  val:aqiData.no2,  unit:"μg/m³",color:"#FFD60A"},
              {label:"SO₂",  val:aqiData.so2,  unit:"μg/m³",color:"#FF9800"},
              {label:"CO",   val:aqiData.co,   unit:"μg/m³",color:"#FF4757"},
            ].map(s=>(
              <div key={s.label} className="card" style={{textAlign:"center",padding:16}}>
                <div className="shine"/>
                <div style={{fontSize:10,color:"var(--t2)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:6}}>{s.label}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:24,color:s.color}}>{s.val}</div>
                <div style={{fontSize:11,color:"var(--t2)",marginTop:3}}>{s.unit}</div>
              </div>
            ))}
          </div>
          {/* Health Tips */}
          <div className="card a4" style={{flex:1}}>
            <div className="shine"/>
            <div className="ctag">Health Recommendations</div>
            {tips.map((t,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"10px 12px",background:"rgba(0,201,255,0.03)",borderRadius:10,border:"1px solid var(--border)",marginBottom:8,fontSize:13,lineHeight:1.5}}>{t}</div>
            ))}
            <div style={{marginTop:10,padding:14,background:info.bg,borderRadius:12,border:`1px solid ${info.color}25`}}>
              <div style={{fontSize:11,color:"var(--t2)",letterSpacing:1,marginBottom:5}}>CURRENT STATUS</div>
              <div style={{fontWeight:700,color:info.color}}>{info.icon} AQI {aqiData.aqi} — {info.label}</div>
              <div style={{fontSize:12,color:"var(--t2)",marginTop:4}}>Updated: {new Date().toLocaleTimeString("en-IN")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AQI Scale Bar */}
      <div className="scalebar a3">
        {AQI_LEVELS.map((lv,i)=>(
          <div key={i} className="sb-seg" style={{
            background:info.label===lv.label?`${lv.color}18`:`${lv.color}07`,
            border:`1px solid ${info.label===lv.label?lv.color:lv.color+"20"}`,
            borderRadius:i===0?"12px 0 0 12px":i===AQI_LEVELS.length-1?"0 12px 12px 0":"0",
            boxShadow:info.label===lv.label?`0 0 18px ${lv.glow}`:"none",
          }}>
            <div className="sb-seg-l" style={{color:lv.color}}>{lv.label.split(" ")[0]}</div>
            <div className="sb-seg-r" style={{color:lv.color}}>{i===0?"0":AQI_LEVELS[i-1].max+1}–{lv.max}</div>
          </div>
        ))}
      </div>

      {/* 24H Chart */}
      <div className="card a4" style={{marginBottom:16}}>
        <div className="shine"/>
        <div className="ctag">24-Hour AQI Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={aqiData.hourly} margin={{top:8,right:4,left:-24,bottom:0}}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--c1)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--c1)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}} interval={3}/>
            <YAxis stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}}/>
            <Tooltip content={<ChartTooltip/>}/>
            <ReferenceLine y={100} stroke="rgba(255,215,10,0.3)" strokeDasharray="4 4"/>
            <Area type="monotone" dataKey="aqi" stroke="var(--c1)" strokeWidth={2.5} fill="url(#ag)" dot={false} activeDot={{r:5,fill:"var(--c1)"}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="g2 a5">
        <div className="card">
          <div className="shine"/>
          <div className="ctag">Pollutant Distribution Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,201,255,0.1)"/>
              <PolarAngleAxis dataKey="p" tick={{fill:"#5080A0",fontSize:12}}/>
              <Radar name="Level %" dataKey="v" stroke="var(--c1)" fill="var(--c1)" fillOpacity={0.15} strokeWidth={2} dot={{r:3,fill:"var(--c1)"}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="shine"/>
          <div className="ctag">PM2.5 vs PM10 Comparison</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={aqiData.hourly.filter((_,i)=>i%4===0).slice(0,6)} margin={{top:8,right:4,left:-24,bottom:0}}>
              <XAxis dataKey="time" stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:9}}/>
              <YAxis stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:9}}/>
              <Tooltip contentStyle={{background:"rgba(6,13,24,0.98)",border:"1px solid var(--border2)",borderRadius:12,fontFamily:"'Exo 2',sans-serif"}}/>
              <Legend wrapperStyle={{fontSize:11,color:"var(--t2)"}}/>
              <Bar dataKey="pm25" name="PM2.5" fill="var(--c1)" fillOpacity={0.8} radius={[3,3,0,0]}/>
              <Bar dataKey="pm10" name="PM10"  fill="var(--c2)" fillOpacity={0.8} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: POLLUTANTS
// ═══════════════════════════════════════════════════════════════
function TabPollutants({aqiData}) {
  const whoData = [
    {name:"PM2.5",val:aqiData.pm25,who:5,   color:"var(--c1)"},
    {name:"PM10", val:aqiData.pm10,who:15,   color:"var(--c2)"},
    {name:"NO₂",  val:aqiData.no2, who:10,   color:"#FFD60A"},
    {name:"SO₂",  val:aqiData.so2, who:40,   color:"#FF9800"},
    {name:"O₃",   val:aqiData.o3,  who:60,   color:"var(--purple)"},
  ];
  return (
    <div>
      <SectionHeader title="Pollutant Analysis" sub="Real-time concentrations vs WHO Safe Limits" badge="WHO 2021 Standards"/>
      <div className="g3 a2">
        {Object.keys(POLLUTANTS_META).map(k=>(
          <PollutantCard key={k} pKey={k} value={aqiData[k]}/>
        ))}
      </div>
      <div className="g2 a3">
        <div className="card">
          <div className="shine"/>
          <div className="ctag">WHO Guideline Comparison</div>
          {whoData.map((p,i)=>(
            <div key={i} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:13}}>
                <span style={{color:"var(--t2)"}}>{p.name}</span>
                <span style={{fontFamily:"'Share Tech Mono',monospace",color:p.val>p.who?"#FF4757":p.color}}>
                  {p.val} / {p.who} μg/m³ {p.val>p.who?`(${Math.round(p.val/p.who)}x over)`:"✓"}
                </span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min((p.val/p.who)*100/(Math.max(p.val/p.who,1)*1.2)*100,100)}%`,background:p.val>p.who?"#FF4757":p.color,borderRadius:3,transition:"width 1.5s ease"}}/>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="shine"/>
          <div className="ctag">24-Hour PM2.5 Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={aqiData.hourly} margin={{top:8,right:4,left:-24,bottom:0}}>
              <defs>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--c2)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--c2)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}} interval={4}/>
              <YAxis stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}}/>
              <Tooltip content={(p)=><ChartTooltip {...p} unit="μg/m³"/>}/>
              <ReferenceLine y={25} stroke="rgba(255,152,0,0.4)" strokeDasharray="4 4" label={{value:"Safe",fill:"#FF9800",fontSize:10}}/>
              <Area type="monotone" dataKey="pm25" stroke="var(--c2)" strokeWidth={2.5} fill="url(#ag2)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card a4">
        <div className="shine"/>
        <div className="ctag">Pollutant Sources & Health Effects</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[
            {name:"PM2.5",src:"Vehicle exhaust, industrial burning, dust",effect:"Lung cancer, heart disease, premature death",color:"var(--c1)"},
            {name:"PM10", src:"Road dust, construction, industrial processes",effect:"Respiratory infections, asthma attacks",color:"var(--c2)"},
            {name:"NO₂",  src:"Vehicle engines, power plants",effect:"Airway inflammation, increased asthma risk",color:"#FFD60A"},
            {name:"SO₂",  src:"Coal burning, oil refineries, ships",effect:"Throat irritation, acid rain formation",color:"#FF9800"},
            {name:"CO",   src:"Incomplete combustion in vehicles",effect:"Reduces oxygen delivery, headaches",color:"#FF4757"},
            {name:"O₃",   src:"Formed by sunlight + NOx + VOCs",effect:"Chest pain, lung damage, eye irritation",color:"var(--purple)"},
          ].map((p,i)=>(
            <div key={i} style={{padding:14,background:`rgba(0,0,0,0.2)`,border:`1px solid ${p.color}20`,borderRadius:12}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:14,color:p.color,marginBottom:6}}>{p.name}</div>
              <div style={{fontSize:11,color:"var(--t2)",marginBottom:4}}><strong style={{color:"var(--t1)"}}>Source:</strong> {p.src}</div>
              <div style={{fontSize:11,color:"var(--t2)"}}><strong style={{color:"var(--t1)"}}>Effect:</strong> {p.effect}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: FORECAST
// ═══════════════════════════════════════════════════════════════
function TabForecast({aqiData}) {
  return (
    <div>
      <SectionHeader title="Air Quality Forecast" sub="Next 24 hours prediction based on atmospheric models"/>
      <div className="g4 a2">
        {aqiData.forecast.map((f,i)=>(
          <div key={i} className="fc-card">
            <div className="fc-time">{f.slot}</div>
            <div className="fc-icon">{f.info.icon}</div>
            <div className="fc-num" style={{color:f.info.color}}>{f.aqi}</div>
            <div className="fc-lbl" style={{color:f.info.color}}>{f.info.label}</div>
            <div className="fc-pm">PM2.5: {f.pm25} μg/m³</div>
          </div>
        ))}
      </div>
      <div className="card a3" style={{marginBottom:16}}>
        <div className="shine"/>
        <div className="ctag">AQI Forecast Trend (24 hours)</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={aqiData.hourly} margin={{top:8,right:4,left:-24,bottom:0}}>
            <defs>
              <linearGradient id="ag3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A29BFE" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#A29BFE" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}} interval={3}/>
            <YAxis stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}}/>
            <Tooltip content={<ChartTooltip/>}/>
            {[50,100,150,200].map(v=>(
              <ReferenceLine key={v} y={v} stroke={getAQIInfo(v).color+"30"} strokeDasharray="4 4"/>
            ))}
            <Area type="monotone" dataKey="aqi" stroke="#A29BFE" strokeWidth={2.5} fill="url(#ag3)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="g2 a4">
        <div className="card">
          <div className="shine"/>
          <div className="ctag">PM2.5 Hourly Forecast</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={aqiData.hourly} margin={{top:8,right:4,left:-24,bottom:0}}>
              <XAxis dataKey="time" stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}} interval={4}/>
              <YAxis stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}}/>
              <Tooltip content={(p)=><ChartTooltip {...p} unit="μg/m³"/>}/>
              <Line type="monotone" dataKey="pm25" stroke="var(--c2)" strokeWidth={2.5} dot={false} activeDot={{r:5}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="shine"/>
          <div className="ctag">Best Time to Go Outside</div>
          {aqiData.hourly.slice(0,12).filter((_,i)=>i%2===0).map((h,i)=>{
            const info=getAQIInfo(h.aqi);
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:13,color:"var(--t2)"}}>{h.time}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:13,color:info.color}}>{h.aqi}</span>
                  <span style={{padding:"2px 10px",background:info.bg,border:`1px solid ${info.color}30`,borderRadius:20,fontSize:10,color:info.color,fontWeight:700}}>{h.aqi<=100?"GOOD":"AVOID"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: COMPARE CITIES
// ═══════════════════════════════════════════════════════════════
function TabCompare() {
  const [cities,setCities]=useState([]);
  const [search,setSearch]=useState("");
  const [results,setResults]=useState([]);
  const ref=useRef(null);

  useEffect(()=>{
    const fn=(e)=>{if(ref.current&&!ref.current.contains(e.target))setResults([]);};
    document.addEventListener("mousedown",fn);
    return()=>document.removeEventListener("mousedown",fn);
  },[]);

  const BUILTIN_CITIES = [
    {name:"New Delhi",admin1:"Delhi",country:"India",latitude:28.6139,longitude:77.2090},
    {name:"Mumbai",admin1:"Maharashtra",country:"India",latitude:19.0760,longitude:72.8777},
    {name:"Kolkata",admin1:"West Bengal",country:"India",latitude:22.5726,longitude:88.3639},
    {name:"Bangalore",admin1:"Karnataka",country:"India",latitude:12.9716,longitude:77.5946},
    {name:"Chennai",admin1:"Tamil Nadu",country:"India",latitude:13.0827,longitude:80.2707},
    {name:"Hyderabad",admin1:"Telangana",country:"India",latitude:17.3850,longitude:78.4867},
    {name:"Pune",admin1:"Maharashtra",country:"India",latitude:18.5204,longitude:73.8567},
    {name:"Jaipur",admin1:"Rajasthan",country:"India",latitude:26.9124,longitude:75.7873},
    {name:"Ahmedabad",admin1:"Gujarat",country:"India",latitude:23.0225,longitude:72.5714},
    {name:"Lucknow",admin1:"Uttar Pradesh",country:"India",latitude:26.8467,longitude:80.9462},
    {name:"Kanpur",admin1:"Uttar Pradesh",country:"India",latitude:26.4499,longitude:80.3319},
    {name:"Agra",admin1:"Uttar Pradesh",country:"India",latitude:27.1767,longitude:78.0081},
    {name:"Patna",admin1:"Bihar",country:"India",latitude:25.5941,longitude:85.1376},
    {name:"Bhopal",admin1:"Madhya Pradesh",country:"India",latitude:23.2599,longitude:77.4126},
    {name:"Indore",admin1:"Madhya Pradesh",country:"India",latitude:22.7196,longitude:75.8577},
    {name:"Beijing",admin1:"Beijing",country:"China",latitude:39.9042,longitude:116.4074},
    {name:"Shanghai",admin1:"Shanghai",country:"China",latitude:31.2304,longitude:121.4737},
    {name:"London",admin1:"England",country:"United Kingdom",latitude:51.5072,longitude:-0.1276},
    {name:"New York",admin1:"New York",country:"United States",latitude:40.7128,longitude:-74.0060},
    {name:"Los Angeles",admin1:"California",country:"United States",latitude:34.0522,longitude:-118.2437},
    {name:"Tokyo",admin1:"Tokyo",country:"Japan",latitude:35.6762,longitude:139.6503},
    {name:"Paris",admin1:"Île-de-France",country:"France",latitude:48.8566,longitude:2.3522},
    {name:"Dubai",admin1:"Dubai",country:"UAE",latitude:25.2048,longitude:55.2708},
    {name:"Singapore",admin1:"Singapore",country:"Singapore",latitude:1.3521,longitude:103.8198},
    {name:"Sydney",admin1:"New South Wales",country:"Australia",latitude:-33.8688,longitude:151.2093},
  ];
  const searchCity=async(q)=>{
    setSearch(q);
    if(q.length<2){setResults([]);return;}
    // First filter from built-in list immediately
    const local=BUILTIN_CITIES.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.admin1.toLowerCase().includes(q.toLowerCase()));
    if(local.length>0)setResults(local.slice(0,6));
    // Then try real API
    try{
      const ctrl=new AbortController();
      setTimeout(()=>ctrl.abort(),3000);
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en`,{signal:ctrl.signal});
      const d=await r.json();
      if(d.results?.length>0)setResults(d.results);
    }catch{/* keep local results */}
  };

  const addCity=async(c)=>{
    if(cities.length>=4)return;
    if(cities.find(x=>x.name===c.name))return;
    setResults([]);setSearch("");
    const newCity={name:c.name,country:c.country,lat:c.latitude,lon:c.longitude,loading:true,data:null};
    setCities(prev=>[...prev,newCity]);
    try{
      const ctrl=new AbortController();
      const tid=setTimeout(()=>ctrl.abort(),5000);
      const raw=await fetchAQIRaw(c.latitude,c.longitude,ctrl.signal);
      clearTimeout(tid);
      const parsed=parseRaw(raw);
      setCities(prev=>prev.map(x=>x.name===c.name?{...x,loading:false,data:parsed}:x));
    }catch{
      const mock=generateMockData(c.name);
      setCities(prev=>prev.map(x=>x.name===c.name?{...x,loading:false,data:mock}:x));
    }
  };

  const removeCity=(name)=>setCities(prev=>prev.filter(c=>c.name!==name));

  const addPreset=async(p)=>{
    if(cities.length>=4||cities.find(c=>c.name===p.name))return;
    const newCity={name:p.name,country:"",lat:p.lat,lon:p.lon,loading:true,data:null};
    setCities(prev=>[...prev,newCity]);
    try{
      const ctrl=new AbortController();
      const tid=setTimeout(()=>ctrl.abort(),5000);
      const raw=await fetchAQIRaw(p.lat,p.lon,ctrl.signal);
      clearTimeout(tid);
      const parsed=parseRaw(raw);
      setCities(prev=>prev.map(x=>x.name===p.name?{...x,loading:false,data:parsed}:x));
    }catch{
      const mock=generateMockData(p.name);
      setCities(prev=>prev.map(x=>x.name===p.name?{...x,loading:false,data:mock}:x));
    }
  };

  const chartData = cities.filter(c=>c.data).map(c=>({name:c.name,AQI:c.data.aqi,"PM2.5":c.data.pm25,"PM10":c.data.pm10}));

  return (
    <div>
      <SectionHeader title="City Comparison" sub="Compare air quality across multiple cities simultaneously" badge={`${cities.length}/4 Cities`}/>
      <div ref={ref} style={{position:"relative",marginBottom:18}}>
        <div className="srch-bar">
          <span style={{color:"var(--c1)",fontSize:17}}>⌕</span>
          <input className="srch-inp" placeholder="Add a city to compare (max 4)..." value={search} onChange={e=>searchCity(e.target.value)}/>
          {search&&<button style={{background:"none",border:"none",color:"var(--t2)",fontSize:14,padding:4}} onClick={()=>{setSearch("");setResults([]);}}>✕</button>}
        </div>
        {results.length>0&&(
          <div className="drop">
            {results.map((c,i)=>(
              <div key={i} className="drop-row" onClick={()=>addCity(c)}>
                <span>📍</span>
                <div><div className="dr-n">{c.name}</div><div className="dr-s">{c.admin1&&`${c.admin1}, `}{c.country}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Presets */}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:11,color:"var(--t2)",letterSpacing:"2px",marginBottom:10,textTransform:"uppercase"}}>Quick Add Popular Cities</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {CITY_PRESETS.map(p=>(
            <button key={p.name} onClick={()=>addPreset(p)} style={{
              padding:"8px 16px",background:"rgba(0,201,255,0.04)",border:"1px solid var(--border)",
              borderRadius:20,color:"var(--t2)",fontSize:12,fontFamily:"'Exo 2',sans-serif",transition:"all 0.2s",
            }} onMouseEnter={e=>e.target.style.borderColor="var(--border2)"} onMouseLeave={e=>e.target.style.borderColor="var(--border)"}>
              📍 {p.name}
            </button>
          ))}
        </div>
      </div>

      {cities.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:"var(--t2)"}}>
          <div style={{fontSize:48,marginBottom:16}}>⚖</div>
          <div style={{fontSize:16,marginBottom:8}}>No cities added yet</div>
          <div style={{fontSize:13}}>Search for cities above or click quick-add presets</div>
        </div>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(cities.length,2)},1fr)`,gap:14,marginBottom:16}}>
            {cities.map(c=>(
              <div key={c.name} className="cmp-city a2">
                <div className="cch">
                  <div>
                    <div className="cch-name">{c.name}</div>
                    <div style={{fontSize:11,color:"var(--t2)"}}>{c.country}</div>
                  </div>
                  <button className="cch-rm" onClick={()=>removeCity(c.name)}>✕ Remove</button>
                </div>
                {c.loading?(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:150,gap:12}}>
                    <div style={{width:36,height:36,borderRadius:"50%",border:"2.5px solid rgba(0,201,255,0.1)",borderTopColor:"var(--c1)",animation:"spin 1s linear infinite"}}/>
                    <div style={{fontSize:12,color:"var(--t2)"}}>Fetching data...</div>
                  </div>
                ):c.data?(()=>{
                  const info=getAQIInfo(c.data.aqi);
                  return (
                    <>
                      <div className="cmp-aqi" style={{color:info.color,textShadow:`0 0 24px ${info.glow}`}}>{c.data.aqi}</div>
                      <div className="cmp-lbl" style={{color:info.color}}>{info.icon} {info.label}</div>
                      {[["PM2.5",c.data.pm25+" μg/m³"],["PM10",c.data.pm10+" μg/m³"],["NO₂",c.data.no2+" μg/m³"],["Euro AQI",c.data.euro]].map(([k,v])=>(
                        <div key={k} className="cmp-row"><span>{k}</span><span>{v}</span></div>
                      ))}
                    </>
                  );
                })():null}
              </div>
            ))}
          </div>

          {chartData.length>1&&(
            <div className="card a3">
              <div className="shine"/>
              <div className="ctag">City Comparison Chart</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{top:8,right:4,left:-20,bottom:0}}>
                  <XAxis dataKey="name" stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:12}}/>
                  <YAxis stroke="rgba(80,128,160,0.3)" tick={{fill:"#5080A0",fontSize:10}}/>
                  <Tooltip contentStyle={{background:"rgba(6,13,24,0.98)",border:"1px solid var(--border2)",borderRadius:12,fontFamily:"'Exo 2',sans-serif"}}/>
                  <Legend wrapperStyle={{fontSize:11,color:"var(--t2)"}}/>
                  <Bar dataKey="AQI"   fill="var(--c1)" fillOpacity={0.85} radius={[3,3,0,0]}/>
                  <Bar dataKey="PM2.5" fill="var(--c2)" fillOpacity={0.85} radius={[3,3,0,0]}/>
                  <Bar dataKey="PM10"  fill="#FFD60A"   fillOpacity={0.85} radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: ALERTS HISTORY
// ═══════════════════════════════════════════════════════════════
function TabAlerts({alerts,onClear,onMarkRead,onDelete}) {
  const unread = alerts.filter(a=>!a.read).length;
  return (
    <div>
      <SectionHeader title="Alert History" sub="Saved air quality threshold alerts" badge={unread>0?`${unread} Unread`:undefined}/>
      {alerts.length>0&&(
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16,gap:10}}>
          <button onClick={()=>{alerts.forEach(a=>!a.read&&onMarkRead(a.id));}} style={{padding:"9px 18px",background:"rgba(0,201,255,0.07)",border:"1px solid var(--border2)",borderRadius:12,color:"var(--c1)",fontSize:13,fontWeight:600,transition:"all 0.2s"}}>Mark All Read</button>
          <button onClick={onClear} style={{padding:"9px 18px",background:"rgba(255,71,87,0.07)",border:"1px solid rgba(255,71,87,0.2)",borderRadius:12,color:"#FF4757",fontSize:13,fontWeight:600,transition:"all 0.2s"}}>Clear All</button>
        </div>
      )}
      {alerts.length===0?(
        <div className="no-alerts">
          <div className="no-alerts-ic">🔔</div>
          <div style={{fontSize:16,marginBottom:8,fontWeight:600}}>No Alerts Yet</div>
          <div style={{fontSize:13,color:"var(--t2)",maxWidth:280,margin:"0 auto",lineHeight:1.6}}>
            Alerts are automatically saved when AQI exceeds your threshold. Check the Settings tab to configure.
          </div>
        </div>
      ):(
        alerts.map(a=>{
          const info=getAQIInfo(a.aqi);
          return (
            <div key={a.id} className={`al-item a2${a.read?"":" unread"}`} onClick={()=>!a.read&&onMarkRead(a.id)} style={{cursor:a.read?"default":"pointer"}}>
              <span className="al-icon">{info.icon}</span>
              <div style={{flex:1}}>
                <div className="al-loc">{a.city}</div>
                <div style={{fontSize:12,color:info.color,fontWeight:600,marginBottom:2}}>{info.label}</div>
                <div className="al-time">{new Date(a.time).toLocaleString("en-IN")}</div>
                {a.pm25&&<div style={{fontSize:11,color:"var(--t2)",marginTop:3}}>PM2.5: {a.pm25} μg/m³ · PM10: {a.pm10||"—"} μg/m³</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div className="al-aqi" style={{color:info.color}}>{a.aqi}</div>
                <div className="al-lbl" style={{color:info.color}}>AQI</div>
                <button className="al-rm" onClick={e=>{e.stopPropagation();onDelete(a.id);}}>🗑</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: HEALTH
// ═══════════════════════════════════════════════════════════════
function TabHealth({aqiData}) {
  const info = getAQIInfo(aqiData.aqi);
  return (
    <div>
      <SectionHeader title="Health Intelligence" sub="Personalized health guidance based on current AQI"/>
      <div className="g2 a2">
        <div className="card">
          <div className="shine"/>
          <div className="ctag">Outdoor Activity Safety</div>
          {[
            {label:"Running / Jogging",  icon:"🏃", safe:aqiData.aqi<=75},
            {label:"Cycling",            icon:"🚴", safe:aqiData.aqi<=75},
            {label:"Children outdoors",  icon:"🧒", safe:aqiData.aqi<=100},
            {label:"Elderly outdoors",   icon:"👴", safe:aqiData.aqi<=75},
            {label:"Pregnant women",     icon:"🤰", safe:aqiData.aqi<=75},
            {label:"Open windows",       icon:"🪟", safe:aqiData.aqi<=50},
            {label:"Asthma patients",    icon:"🫁", safe:aqiData.aqi<=50},
            {label:"Healthy adults",     icon:"💪", safe:aqiData.aqi<=150},
          ].map((item,i)=>(
            <div key={i} className="health-row">
              <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--t2)",fontSize:13}}>
                <span style={{fontSize:18}}>{item.icon}</span>{item.label}
              </div>
              <span className="htag" style={{
                background:item.safe?"rgba(0,230,118,0.12)":"rgba(255,71,87,0.12)",
                color:item.safe?"#00E676":"#FF4757",
                border:`1px solid ${item.safe?"rgba(0,230,118,0.25)":"rgba(255,71,87,0.25)"}`,
              }}>{item.safe?"✓ SAFE":"✕ AVOID"}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="shine"/>
          <div className="ctag">Protective Measures</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {label:"N95/KN95 Mask",      needed:aqiData.aqi>100, icon:"😷"},
              {label:"Air Purifier (HEPA)", needed:aqiData.aqi>75,  icon:"🌬️"},
              {label:"Seal Windows/Doors",  needed:aqiData.aqi>150, icon:"🪟"},
              {label:"Avoid Outdoor Exertion",needed:aqiData.aqi>100,icon:"🚫"},
              {label:"Monitor Symptoms",    needed:aqiData.aqi>75,  icon:"🩺"},
              {label:"Emergency Alert",     needed:aqiData.aqi>200, icon:"🚨"},
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:item.needed?"rgba(255,71,87,0.06)":"rgba(0,230,118,0.04)",border:`1px solid ${item.needed?"rgba(255,71,87,0.2)":"rgba(0,230,118,0.15)"}`,borderRadius:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>
                  <span style={{fontSize:18}}>{item.icon}</span>{item.label}
                </div>
                <span style={{fontSize:12,fontWeight:700,color:item.needed?"#FF4757":"#00E676",letterSpacing:"1px"}}>{item.needed?"REQUIRED":"NOT NEEDED"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card a3">
        <div className="shine"/>
        <div className="ctag">AQI Health Impact Reference Guide</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {AQI_LEVELS.map((lv,i)=>(
            <div key={i} className="h-guide" style={{background:info.label===lv.label?lv.bg:"rgba(0,0,0,0.1)",borderColor:info.label===lv.label?`${lv.color}40`:`${lv.color}15`,transform:info.label===lv.label?"translateX(8px)":"none"}}>
              <div className="h-guide-top">
                <span className="h-guide-icon">{lv.icon}</span>
                <span className="h-guide-lbl" style={{color:lv.color}}>{lv.label}</span>
                <span className="h-guide-range" style={{color:lv.color}}>AQI {i===0?0:AQI_LEVELS[i-1].max+1}–{lv.max}</span>
              </div>
              <div className="h-guide-desc" style={{color:info.label===lv.label?"var(--t1)":"var(--t2)"}}>{lv.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: SETTINGS
// ═══════════════════════════════════════════════════════════════
function TabSettings({user,threshold,onThreshChange,onLogout,onSave}) {
  const [name,setName]=useState(user?.name||"Guest");
  const [thr,setThr]=useState(threshold);

  return (
    <div>
      <SectionHeader title="Settings" sub="Customize your RESALTH experience"/>
      {/* Profile */}
      <div className="stg-section a2">
        <div className="stg-title">👤 User Profile</div>
        <div className="stg-row">
          <span className="stg-key">Display Name</span>
          <input className="stg-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
        </div>
        <div className="stg-row"><span className="stg-key">Account Type</span><span className="stg-val" style={{color:"var(--c1)"}}>{user?.id?"Registered User":"Guest"}</span></div>
        <div className="stg-row"><span className="stg-key">Email</span><span className="stg-val">{user?.email||"Not logged in"}</span></div>
      </div>
      {/* Alerts */}
      <div className="stg-section a3">
        <div className="stg-title">🔔 Alert Configuration</div>
        <div className="stg-row">
          <span className="stg-key">AQI Alert Threshold</span>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <input className="thresh-inp" type="range" min={25} max={300} step={25} value={thr} onChange={e=>{setThr(+e.target.value);onThreshChange(+e.target.value);}}/>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:15,color:getAQIInfo(thr).color,minWidth:36}}>{thr}</span>
          </div>
        </div>
        <div className="stg-row">
          <span className="stg-key">Alert Level</span>
          <span className="stg-val" style={{color:getAQIInfo(thr).color}}>{getAQIInfo(thr).icon} {getAQIInfo(thr).label}</span>
        </div>
        <div style={{padding:14,background:"rgba(0,201,255,0.04)",border:"1px solid var(--border)",borderRadius:12,fontSize:13,color:"var(--t2)",lineHeight:1.6}}>
          ℹ Alerts will be triggered and saved when AQI exceeds <strong style={{color:"var(--c1)"}}>{thr}</strong> ({getAQIInfo(thr).label} level).
        </div>
      </div>
      {/* Quick City Presets */}
      <div className="stg-section a4">
        <div className="stg-title">🌍 Quick City Presets</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {CITY_PRESETS.map(p=>(
            <button key={p.name} className="preset-btn">{p.name}</button>
          ))}
        </div>
      </div>
      {/* About */}
      <div className="stg-section a5">
        <div className="stg-title">ℹ About RESALTH</div>
        <div className="card" style={{padding:20}}>
          <div className="shine"/>
          {[
            ["Version","1.0.0 — Final Year Major Project"],
            ["Developer","College Student Project"],
            ["Data Source","Open-Meteo Air Quality API (free, real-time)"],
            ["Geocoding","Nominatim / Open-Meteo Geocoding"],
            ["Standards","WHO Air Quality Guidelines 2021"],
            ["Framework","React.js + Recharts"],
          ].map(([k,v])=>(
            <div key={k} className="srow"><span className="sk">{k}</span><span style={{fontSize:13,color:"var(--t1)"}}>{v}</span></div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:8}}>
        <button className="btn-save" onClick={()=>onSave({name,threshold:thr})}>💾 Save Settings</button>
        <button className="btn-danger" onClick={onLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function RESALTH() {
  const [splash,setSplash]   = useState(true);
  const [authed,setAuthed]   = useState(false);
  const [user,setUser]       = useState(null);
  const [sbExp,setSbExp]     = useState(true);
  const [page,setPage]       = useState("dashboard");
  const [cityName,setCityName] = useState("Detecting...");
  const [coords,setCoords]   = useState(null);
  const [aqiData,setAqiData] = useState(null);
  const [loading,setLoading] = useState(false);
  const [error,setError]     = useState(null);
  const [alerts,setAlerts]   = useState(()=>lsGet("resalth_alerts",[]));
  const [threshold,setThreshold] = useState(()=>lsGet("resalth_thresh",100));
  const [time,setTime]       = useState(new Date());

  // Clock tick
  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),10000); return()=>clearInterval(t); },[]);

  // Save alerts on change
  useEffect(()=>lsSet("resalth_alerts",alerts),[alerts]);

  // Auto-save alert when AQI exceeds threshold
  useEffect(()=>{
    if(!aqiData||!cityName||cityName==="Detecting...")return;
    if(aqiData.aqi>threshold){
      const last=alerts[0];
      const now=Date.now();
      if(!last||now-last.time>30*60*1000||(last.city!==cityName)){
        const newAlert={id:now,city:cityName,aqi:aqiData.aqi,pm25:aqiData.pm25,pm10:aqiData.pm10,time:now,read:false};
        setAlerts(prev=>[newAlert,...prev].slice(0,50));
      }
    }
  },[aqiData,cityName]);

  // Check saved session
  useEffect(()=>{
    const saved=lsGet("resalth_user",null);
    if(saved){setUser(saved);setAuthed(true);}
  },[]);

  // Initial geolocation after auth
  useEffect(()=>{
    if(!authed)return;
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        async({coords:{latitude:lat,longitude:lon}})=>{
          setCoords({lat,lon});
          const name=await reverseGeocode(lat,lon);
          setCityName(name);
          loadAQI(lat,lon);
        },
        ()=>{ setCityName("New Delhi, IN"); loadAQI(28.6139,77.209); }
      );
    } else { setCityName("New Delhi, IN"); loadAQI(28.6139,77.209); }
  },[authed]);

  const loadAQI=async(lat,lon,nameHint="")=>{
    setError(null);
    // Show mock data instantly — no blank or long loading!
    const hint=nameHint||cityName;
    if(!aqiData) setAqiData(generateMockData(hint));
    setLoading(false);
    // Silently try real API in background
    try{
      const ctrl=new AbortController();
      const tid=setTimeout(()=>ctrl.abort(),7000);
      const raw=await fetchAQIRaw(lat,lon,ctrl.signal);
      clearTimeout(tid);
      const parsed=parseRaw(raw);
      if(parsed && parsed.aqi>0) setAqiData(parsed);
    }catch(e){
      // Keep mock — already showing
    }
  };

  const handlePickCity=async(c)=>{
    const name=`${c.name}, ${c.country||""}`.trim();
    setCityName(name);
    // Instantly show city-specific mock data — no blank screen!
    setAqiData(generateMockData(c.name));
    setError(null);
    // Then try real API silently in background
    try{
      const ctrl=new AbortController();
      const tid=setTimeout(()=>ctrl.abort(),7000);
      const raw=await fetchAQIRaw(c.latitude,c.longitude,ctrl.signal);
      clearTimeout(tid);
      const parsed=parseRaw(raw);
      if(parsed && parsed.aqi>0) setAqiData(parsed);
    }catch(e){
      // Keep mock data — already showing
    }
  };

  const handleAuth=(u)=>{setUser(u);setAuthed(true);};
  const handleGuest=()=>{
    const guest={id:null,name:"Guest",email:null};
    setUser(guest);setAuthed(true);
  };
  const handleLogout=()=>{
    lsSet("resalth_user",null);
    setUser(null);setAuthed(false);setAqiData(null);
  };

  const unreadCount=alerts.filter(a=>!a.read).length;
  const info=aqiData?getAQIInfo(aqiData.aqi):null;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Particles/>
      <div className="grid-bg"/>
      <div className="orbs"/>

      {/* SPLASH */}
      {splash && <SplashScreen onDone={()=>setSplash(false)}/>}

      {/* AUTH */}
      {!splash&&!authed && <AuthModal onAuth={handleAuth} onGuest={handleGuest}/>}

      {/* MAIN APP */}
      {!splash&&authed && (
        <div className="shell">
          {/* SIDEBAR */}
          <nav className={`sb${sbExp?" exp":""}`}>
            <div className="sb-top" onClick={()=>setSbExp(p=>!p)}>
              <div className="sb-icon-wrap">🌿</div>
              <div className="sb-title">RESALTH</div>
            </div>
            {[
              {id:"dashboard", ic:"⬡",  lbl:"Dashboard"},
              {id:"pollutants",ic:"💨", lbl:"Pollutants"},
              {id:"forecast",  ic:"📡", lbl:"Forecast"},
              {id:"compare",   ic:"⚖",  lbl:"Compare"},
              {id:"alerts",    ic:"🔔", lbl:"Alerts",  bdg:unreadCount>0?unreadCount:0},
              {id:"health",    ic:"❤️", lbl:"Health"},
              {id:"settings",  ic:"⚙",  lbl:"Settings"},
            ].map(n=>(
              <button key={n.id} className={`nav-item${page===n.id?" act":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-ic">{n.ic}</span>
                <span className="nav-lbl">{n.lbl}</span>
                {n.bdg>0&&<span className="nav-bdg">{n.bdg}</span>}
              </button>
            ))}
            <button className="sb-tog" onClick={()=>setSbExp(p=>!p)}>
              <span>{sbExp?"◀":"▶"}</span>
              <span className="sb-tog-label">{sbExp?"Collapse":"Expand"}</span>
            </button>
          </nav>

          {/* MAIN */}
          <div className="main-area">
            {/* HEADER */}
            <header className="hdr">
              <div className="hdr-loc">
                <div className="loc-pulse"/>
                <span className="loc-txt">{cityName}</span>
              </div>
                      {info&&(
                <div className="hdr-chip" style={{color:info.color,borderColor:`${info.color}30`}}>
                  AQI {aqiData.aqi} — {info.label}
                  {aqiData.isMock&&<span style={{fontSize:10,opacity:0.6,marginLeft:6}}>(Demo)</span>}
                </div>
              )}
              <div className="hdr-right">
                <div className="hdr-chip">{time.toLocaleString("en-IN",{hour:"2-digit",minute:"2-digit",month:"short",day:"2-digit"})}</div>
                <div className="hdr-user" onClick={()=>setPage("settings")}>
                  <div className="h-avatar">{(user?.name||"G")[0].toUpperCase()}</div>
                  <span className="h-uname">{user?.name||"Guest"}</span>
                </div>
              </div>
            </header>

            {/* NEWS TICKER */}
            <div className="ticker">
              <div className="ticker-wrap">
                {[...TICKER_MSGS,...TICKER_MSGS].map((m,i)=>(
                  <span key={i} className="tick-item"><strong>◆</strong>{m}</span>
                ))}
              </div>
            </div>

            {/* CONTENT */}
            <main className="content">
              {loading&&(
                <div className="p-loader">
                  <div className="l-ring"/>
                  <div className="l-txt">SCANNING AIR QUALITY</div>
                  <div className="l-sub">Fetching real-time data for {cityName}</div>
                </div>
              )}
              {error&&!loading&&(
                <div style={{textAlign:"center",padding:"80px 20px"}}>
                  <div style={{fontSize:52,marginBottom:16}}>⚠️</div>
                  <div style={{fontSize:16,color:"var(--t2)",marginBottom:20}}>{error}</div>
                  <button className="btn-save" onClick={()=>loadAQI(28.6139,77.209)}>Try New Delhi</button>
                </div>
              )}
              {!loading&&!error&&aqiData&&(<>
                {page==="dashboard"  && <TabDashboard aqiData={aqiData} cityName={cityName} alerts={alerts} threshold={threshold} onSaveAlert={a=>setAlerts(p=>[a,...p])} onPickCity={handlePickCity}/>}
                {page==="pollutants" && <TabPollutants aqiData={aqiData}/>}
                {page==="forecast"   && <TabForecast aqiData={aqiData}/>}
                {page==="health"     && <TabHealth aqiData={aqiData}/>}
              </>)}
              {!loading && page==="compare"  && <TabCompare/>}
              {!loading && page==="alerts"   && <TabAlerts alerts={alerts} onClear={()=>setAlerts([])} onMarkRead={id=>setAlerts(p=>p.map(a=>a.id===id?{...a,read:true}:a))} onDelete={id=>setAlerts(p=>p.filter(a=>a.id!==id))}/>}
              {!loading && page==="settings" && <TabSettings user={user} threshold={threshold} onThreshChange={v=>{setThreshold(v);lsSet("resalth_thresh",v);}} onLogout={handleLogout} onSave={({name,threshold:t})=>{if(user){const u={...user,name};setUser(u);lsSet("resalth_user",u);}setThreshold(t);lsSet("resalth_thresh",t);}}/>}
            </main>
          </div>
        </div>
      )}
    </>
  );
}