<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Homepage Concepts — Julian's Notebook</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400;1,8..60,600&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
<script type="text/babel" src="design-canvas.jsx"></script>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; background: #1a1611; }
  #root { height: 100%; }
</style>
</head>
<body>
<div id="root"></div>

<script type="text/babel">
/* global DesignCanvas, DCSection, DCArtboard */

// ── Shared tokens ──────────────────────────────────────────────────────
const T = {
  bg:        "#faf7f1",
  bg2:       "#f3eee2",
  surface:   "#ffffff",
  ink:       "#1a1611",
  ink2:      "#5b5346",
  ink3:      "#9a9082",
  hairline:  "#e7e0d2",
  rule:      "#d8cfbe",
  accent:    "#a07830",
  accentSoft:"#f0e8d5",
  accentInk: "#604a18",
  sidebar:   "#e8e0d0",
  sidebarB:  "#d4c8b4",
  done:      "#6b8e5a",
};
const serif = '"Source Serif 4", Georgia, serif';
const sans  = '"Geist", -apple-system, sans-serif';
const mono  = '"Geist Mono", ui-monospace, monospace';

const SUBJECTS = [
  { id: "ap-lit",    short: "AP Lit",  name: "AP English Lit",  color: "#c8694a", grade: "A-", hw: 3, notes: 38, quiz: 1 },
  { id: "ap-bio",    short: "Bio",     name: "AP Biology",      color: "#6b8e5a", grade: "B+", hw: 5, notes: 52, quiz: 1 },
  { id: "alg2",      short: "Alg II",  name: "Algebra II",      color: "#5a7a99", grade: "A",  hw: 4, notes: 64, quiz: 2 },
  { id: "us-hist",   short: "US Hist", name: "U.S. History",    color: "#b58a3b", grade: "B",  hw: 2, notes: 41, quiz: 0 },
  { id: "spanish-3", short: "Esp 3",   name: "Spanish III",     color: "#7a4e6e", grade: "A-", hw: 3, notes: 29, quiz: 1 },
  { id: "chem",      short: "Chem",    name: "Chemistry",       color: "#3f7d8a", grade: "B+", hw: 6, notes: 47, quiz: 1 },
];
const HOMEWORK = [
  { id:"h1", subject:"ap-lit",    title:"Read Beloved ch. 9–12", due:"Tonight", est:"45m", urgent:true,  done:false, tag:"reading"  },
  { id:"h2", subject:"alg2",      title:"Problem set 7.3 — identities", due:"Tomorrow", est:"30m", urgent:true,  done:false, tag:"problems" },
  { id:"h3", subject:"ap-bio",    title:"Lab report: enzyme kinetics",  due:"Wed",      est:"1h 30m", urgent:false, done:false, tag:"writing"  },
  { id:"h4", subject:"us-hist",   title:"Federalist No. 10 response",  due:"Thu",      est:"1h",    urgent:false, done:false, tag:"writing"  },
  { id:"h5", subject:"spanish-3", title:"Vocabulario unidad 6 flashcards",due:"Fri",   est:"20m",   urgent:false, done:false, tag:"vocab"    },
  { id:"h6", subject:"chem",      title:"Molarity worksheet",           due:"Fri",      est:"25m",   urgent:false, done:true,  tag:"problems" },
];
const SCHEDULE = [
  { time:"8:10",  subj:"ap-lit",    label:"Beloved discussion – Pt II", room:"204"   },
  { time:"9:10",  subj:"alg2",      label:"Quiz returned",               room:"303"   },
  { time:"10:10", subj:"ap-bio",    label:"Lab – enzyme kinetics",       room:"118"   },
  { time:"11:10", subj:null,        label:"Lunch A",                     room:"Caf"   },
  { time:"12:00", subj:"spanish-3", label:"Subjuntivo intro",            room:"121"   },
  { time:"1:00",  subj:"us-hist",   label:"Federalist papers",           room:"210"   },
  { time:"2:00",  subj:"chem",      label:"Titration lab",               room:"B12"   },
];
const WEEK = [
  { d:"Mon", date:1, items:[{s:"alg2",n:"Quiz"},{s:"ap-lit",n:"Discussion"}] },
  { d:"Tue", date:2, items:[{s:"ap-bio",n:"Lab due"},{s:"spanish-3",n:"Oral"}] },
  { d:"Wed", date:3, today:true, items:[{s:"ap-lit",n:"Beloved Pt II"},{s:"us-hist",n:"Fed #10"},{s:"chem",n:"Worksheet"}] },
  { d:"Thu", date:4, items:[{s:"ap-bio",n:"Quiz: Resp."},{s:"alg2",n:"PS 7.4"}] },
  { d:"Fri", date:5, items:[{s:"spanish-3",n:"Quiz: Pret."},{s:"chem",n:"Titration"}] },
  { d:"Sat", date:6, items:[] },
  { d:"Sun", date:7, items:[] },
];

const subjectBy = (id) => SUBJECTS.find(s => s.id === id) || { short:"—", color:"#999", name:"—" };

// ── Shared mini sidebar ────────────────────────────────────────────────
function Sidebar({ active }) {
  const navItems = [
    { k:"dashboard", ico:"⌂", label:"Today" },
    { k:"homework",  ico:"✓", label:"Homework", badge:5 },
    { k:"quizzes",   ico:"?", label:"Quizzes",  badge:3 },
    { k:"notes",     ico:"¶", label:"Notes" },
    { k:"cards",     ico:"□", label:"Flashcards" },
    { k:"schedule",  ico:"◫", label:"Schedule" },
    { k:"grades",    ico:"★", label:"Grades" },
  ];
  return (
    <div style={{ width:200, flexShrink:0, background:T.sidebar, borderRight:"1px solid "+T.sidebarB, display:"flex", flexDirection:"column", padding:"18px 14px", gap:18 }}>
      <div style={{ paddingBottom:10, borderBottom:"1px solid "+T.sidebarB }}>
        <div style={{ fontFamily:serif, fontSize:20, fontStyle:"italic", color:T.accent, lineHeight:1 }}>¶</div>
        <div style={{ fontFamily:serif, fontSize:15, letterSpacing:"-0.01em", marginTop:2 }}>Julian's Notebook</div>
        <div style={{ fontFamily:mono, fontSize:9, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.1em", marginTop:3 }}>v1</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <div style={{ fontFamily:mono, fontSize:9, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 6px 4px" }}>Workspace</div>
        {navItems.map(({ k, ico, label, badge }) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:4, fontSize:13, background:active===k?T.accent:"transparent", color:active===k?"#1a1611":T.ink, cursor:"pointer" }}>
            <span style={{ width:15, textAlign:"center", fontSize:12, opacity:0.7 }}>{ico}</span>
            {label}
            {badge && <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:10, color:active===k?"rgba(26,22,17,0.55)":T.ink3 }}>{badge}</span>}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <div style={{ fontFamily:mono, fontSize:9, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 6px 4px" }}>Subjects</div>
        {SUBJECTS.slice(0,5).map(s => (
          <div key={s.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:4, fontSize:12.5, color:T.ink2, cursor:"pointer" }}>
            <span style={{ width:7, height:7, borderRadius:2, background:s.color, flexShrink:0 }} />
            {s.short}
          </div>
        ))}
      </div>
    </div>
  );
}

function Topbar({ title, subtitle }) {
  return (
    <div style={{ height:52, flexShrink:0, display:"flex", alignItems:"center", gap:12, padding:"0 28px", borderBottom:"1px solid "+T.hairline, background:T.bg }}>
      <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:T.surface, border:"1px solid "+T.hairline, borderRadius:4, padding:"6px 12px", maxWidth:300 }}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={T.ink3} strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
        <span style={{ fontFamily:sans, fontSize:12.5, color:T.ink3 }}>Search…</span>
        <span style={{ marginLeft:"auto", fontFamily:mono, fontSize:10, color:T.ink3, border:"1px solid "+T.hairline, borderRadius:3, padding:"1px 5px" }}>⌘K</span>
      </div>
      <div style={{ flex:1 }} />
      <div style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.1em" }}>Wed · Jun 3</div>
      <div style={{ width:28, height:28, borderRadius:14, background:T.hairline, display:"grid", placeItems:"center", fontFamily:serif, fontStyle:"italic", fontSize:13, color:T.ink2 }}>J</div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// ORIGINAL — Current DashCombined recreation
// ══════════════════════════════════════════════════════════════
function DesignOriginal() {
  const open = HOMEWORK.filter(h => !h.done);
  const urgent = open.filter(h => h.urgent).length;
  return (
    <div style={{ display:"flex", height:780, fontFamily:sans, background:T.bg, fontSize:14, color:T.ink }}>
      <Sidebar active="dashboard" />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <Topbar />
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>

          {/* Page header */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:18 }}>
            <div>
              <div style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:5 }}>Wed · Jun 3 · Fall term · Week 34 of 36</div>
              <div style={{ fontFamily:serif, fontSize:38, fontWeight:400, lineHeight:1.05, letterSpacing:"-0.015em", margin:0 }}>
                Good morning, <em style={{ fontStyle:"italic", color:T.accent }}>Julian.</em>
              </div>
              <div style={{ height:1, margin:"10px 0 4px", background:"linear-gradient(to right, "+T.accent+", "+T.rule+" 22%, transparent 58%)", position:"relative" }}>
                <span style={{ position:"absolute", left:0, top:-7, fontFamily:serif, fontSize:8, color:T.accent, background:T.bg, paddingRight:7, opacity:0.7 }}>✦</span>
              </div>
              <div style={{ fontSize:12.5, color:T.ink2, marginTop:4 }}>{open.length} open · {urgent} urgent today · 3 quizzes coming up</div>
            </div>
            <div style={{ display:"flex", gap:0, alignItems:"flex-end", paddingBottom:6 }}>
              {[{n:open.length,label:"open tasks"},{n:3,label:"quizzes ahead"},{n:12,label:"day streak",prefix:"✶"}].map((s,i) => (
                <div key={i} style={{ textAlign:"right", paddingLeft:i>0?24:0, borderLeft:i>0?"1px solid "+T.hairline:"none", marginLeft:i>0?24:0 }}>
                  <div style={{ fontFamily:serif, fontSize:32, lineHeight:1, color:T.ink }}>
                    {s.prefix&&<span style={{ fontSize:13, color:T.accent, marginRight:3, fontStyle:"italic" }}>{s.prefix}</span>}{s.n}
                  </div>
                  <div style={{ fontFamily:mono, fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.1em", marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Week strip */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, marginBottom:18 }}>
            {WEEK.map((d,i) => (
              <div key={i} style={{ background:d.today?T.bg2:T.surface, border:"1px solid "+(d.today?T.rule:T.hairline), borderRadius:5, padding:"8px 10px", minHeight:72 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5 }}>
                  <span style={{ fontFamily:mono, fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.08em", color:d.today?T.ink3:T.ink3 }}>{d.d}{d.today&&<span style={{ color:T.accent }}> ·</span>}</span>
                  <span style={{ fontFamily:mono, fontSize:11, color:d.today?T.ink:T.ink3 }}>{d.date}</span>
                </div>
                {d.items.slice(0,2).map((it,j) => {
                  const sb = subjectBy(it.s);
                  return <div key={j} style={{ fontSize:9.5, fontFamily:mono, color:T.ink2, padding:"1px 5px", borderRadius:2, background:sb.color+"20", marginBottom:2, borderLeft:"2px solid "+sb.color, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sb.short}</div>;
                })}
                {d.items.length===0&&<div style={{ fontFamily:mono, fontSize:9, color:T.ink3, marginTop:4 }}>—</div>}
              </div>
            ))}
          </div>

          {/* Up next hero — two cards side by side */}
          <div style={{ display:"flex", gap:12, marginBottom:18 }}>
            {/* Subject info card */}
            <div style={{ flex:1, background:T.surface, border:"1px solid "+T.hairline, borderRadius:6, padding:"16px 20px", display:"flex", gap:14, alignItems:"stretch", boxShadow:"0 1px 3px rgba(30,20,8,0.08), 0 2px 0 0 "+T.rule }}>
              <div style={{ width:5, borderRadius:3, background:subjectBy("ap-bio").color, flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em" }}>In session · 10:10–11:00 · Room 118</div>
                <div style={{ fontFamily:serif, fontSize:26, margin:"4px 0", display:"flex", alignItems:"center", gap:10 }}>AP Biology <em style={{ fontStyle:"italic", color:T.ink3, fontSize:20 }}>— Lab: enzyme kinetics</em></div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["Lab report due Wed · 1h 30m","Quiz: Resp. · Thursday","52 notes in Bio"].map((c,i) => <span key={i} style={{ fontFamily:mono, fontSize:11, padding:"3px 9px", borderRadius:100, background:T.bg2, border:"1px solid "+T.hairline, color:T.ink2 }}>{c}</span>)}
                </div>
              </div>
            </div>
            {/* Countdown card */}
            <div style={{ width:160, flexShrink:0, background:T.surface, border:"1px solid "+T.hairline, borderRadius:6, padding:"16px 20px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 3px rgba(30,20,8,0.08), 0 2px 0 0 "+T.rule }}>
              <div style={{ fontFamily:serif, fontSize:54, color:T.ink, lineHeight:1 }}>38<span style={{ fontSize:17, color:T.ink3 }}>m</span></div>
              <div style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>until bell</div>
            </div>
          </div>

          {/* 3-col body */}
          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 0.9fr", gap:18 }}>
            {/* Col 1: homework */}
            <div style={{ background:T.surface, border:"1px solid "+T.hairline, borderRadius:6, padding:"16px 18px", boxShadow:"0 1px 3px rgba(30,20,8,0.07), 0 2px 0 0 "+T.rule }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontFamily:mono, fontSize:10, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em" }}>◆ Due today · {open.filter(h=>h.due==="Tonight").length}</div>
                <span style={{ fontFamily:mono, fontSize:10, color:T.ink2, cursor:"pointer" }}>ALL →</span>
              </div>
              {HOMEWORK.filter(h=>!h.done).slice(0,4).map((h,i) => {
                const s = subjectBy(h.subject);
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"18px 8px 1fr auto auto", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px dashed "+T.hairline }}>
                    <div style={{ width:18, height:18, borderRadius:4, border:"1.5px solid "+(h.urgent?T.accent:T.ink3+"55"), background:"transparent" }} />
                    <div style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                    <span style={{ fontSize:13.5 }}>{h.title}</span>
                    <span style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, whiteSpace:"nowrap" }}>{h.due} · {h.est}</span>
                    <span style={{ opacity:0.35, fontSize:14, color:T.ink3 }}>×</span>
                  </div>
                );
              })}
            </div>
            {/* Col 2: schedule */}
            <div style={{ background:T.surface, border:"1px solid "+T.hairline, borderRadius:6, padding:"16px 18px", boxShadow:"0 1px 3px rgba(30,20,8,0.07), 0 2px 0 0 "+T.rule }}>
              <div style={{ fontFamily:mono, fontSize:10, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>◆ Today's schedule</div>
              {SCHEDULE.map((row,i) => {
                const s = row.subj ? subjectBy(row.subj) : null;
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"38px 4px 1fr", gap:8, padding:"5px 0", borderBottom:"1px dashed "+T.hairline, opacity:i<2?0.4:1 }}>
                    <span style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, paddingTop:2 }}>{row.time}</span>
                    <div style={{ background:s?s.color:T.ink3+"44", borderRadius:2 }} />
                    <div style={{ fontSize:12.5, color:i===2?T.ink:T.ink2, fontWeight:i===2?600:400 }}>{s?s.short:"Lunch"}{i===2&&<span style={{ marginLeft:6, fontFamily:mono, fontSize:9, color:T.accent, textTransform:"uppercase", letterSpacing:"0.1em" }}>NOW</span>}</div>
                  </div>
                );
              })}
            </div>
            {/* Col 3: streak + subjects */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ background:T.surface, border:"1px solid "+T.hairline, borderRadius:6, padding:"14px 16px", boxShadow:"0 1px 3px rgba(30,20,8,0.07)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  <span style={{ color:T.accent, fontSize:11 }}>🔥</span>
                  <span style={{ fontFamily:mono, fontSize:10, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.1em" }}>Study streak</span>
                </div>
                <div style={{ fontFamily:serif, fontSize:40, lineHeight:1 }}>12<span style={{ fontSize:13, color:T.ink3 }}> days</span></div>
                <div style={{ fontFamily:mono, fontSize:10, color:T.accent, marginTop:3 }}>2-week streak — unstoppable!</div>
              </div>
              <div style={{ background:T.surface, border:"1px solid "+T.hairline, borderRadius:6, padding:"14px 16px", boxShadow:"0 1px 3px rgba(30,20,8,0.07)" }}>
                <div style={{ fontFamily:mono, fontSize:10, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>◆ Grades</div>
                {SUBJECTS.slice(0,5).map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"3px 0" }}>
                    <span style={{ width:6, height:6, borderRadius:1, background:s.color }} />
                    <span style={{ flex:1, fontFamily:mono, fontSize:10.5, color:T.ink2 }}>{s.short}</span>
                    <span style={{ fontFamily:mono, fontSize:11, fontWeight:500 }}>{s.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DESIGN B — "Command" — Data-dense, metrics first (KEPT)
// ══════════════════════════════════════════════════════════════
function DesignB() {
  return (
    <div style={{ display:"flex", height:780, fontFamily:sans, background:T.bg, fontSize:14, color:T.ink }}>
      <Sidebar active="dashboard" />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <Topbar />
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:22 }}>
            {[
              { n:"5", label:"Open tasks",  sub:"2 urgent today"  },
              { n:"3", label:"Quizzes ahead", sub:"Bio · Thu"     },
              { n:"12",label:"Study streak", sub:"days in a row"  },
              { n:"3.6",label:"Current GPA", sub:"↑ from 3.5"     },
              { n:"34",label:"Week",         sub:"of 36 · Spring" },
            ].map((s,i) => (
              <div key={i} style={{ background:T.surface, border:"1px solid "+T.hairline, borderRadius:8, padding:"14px 16px", boxShadow:"0 1px 3px rgba(30,20,8,0.07)", textAlign:"center" }}>
                <div style={{ fontFamily:serif, fontSize:32, lineHeight:1, color:T.ink, letterSpacing:"-0.02em" }}>{s.n}</div>
                <div style={{ fontFamily:mono, fontSize:9.5, color:T.ink2, textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>{s.label}</div>
                <div style={{ fontFamily:mono, fontSize:9, color:T.ink3, marginTop:2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:22 }}>
            {WEEK.map((d,i) => (
              <div key={i} style={{ background:d.today?T.ink:T.surface, border:"1px solid "+(d.today?T.ink:T.hairline), borderRadius:6, padding:"10px 10px 12px", minHeight:88 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                  <span style={{ fontFamily:mono, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:d.today?"rgba(250,247,241,0.6)":T.ink3 }}>{d.d}</span>
                  <span style={{ fontFamily:mono, fontSize:11.5, color:d.today?T.bg:T.ink, fontWeight:500 }}>{d.date}</span>
                </div>
                {d.items.slice(0,2).map((it,j) => {
                  const sb = subjectBy(it.s);
                  return <div key={j} style={{ fontSize:9.5, fontFamily:mono, color:d.today?"rgba(250,247,241,0.7)":T.ink3, padding:"2px 5px", borderRadius:3, background:d.today?"rgba(255,255,255,0.12)":sb.color+"20", marginBottom:3, borderLeft:"2px solid "+(d.today?"rgba(255,255,255,0.35)":sb.color) }}>{sb.short}</div>;
                })}
                {d.items.length===0&&<div style={{ fontFamily:mono, fontSize:9, color:d.today?"rgba(250,247,241,0.3)":T.ink3, marginTop:4 }}>free</div>}
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 0.9fr", gap:16 }}>
            <div style={{ background:T.surface, border:"1px solid "+T.hairline, borderRadius:8, padding:"16px 18px", boxShadow:"0 1px 3px rgba(30,20,8,0.07)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontFamily:mono, fontSize:10, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em" }}>◆ Homework · 5 open</div>
                <span style={{ fontFamily:mono, fontSize:10, color:T.ink2, cursor:"pointer" }}>ALL →</span>
              </div>
              {HOMEWORK.filter(h=>!h.done).map((h,i) => {
                const s = subjectBy(h.subject);
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"16px 6px 1fr auto", alignItems:"center", gap:8, padding:"7px 0", borderBottom:"1px dashed "+T.hairline }}>
                    <div style={{ width:16, height:16, borderRadius:3, border:"1.5px solid "+(h.urgent?T.accent:T.ink3+"60"), background:"transparent" }} />
                    <div style={{ width:6, height:6, borderRadius:1, background:s.color }} />
                    <span style={{ fontSize:13, lineHeight:1.2 }}>{h.title}</span>
                    <span style={{ fontFamily:mono, fontSize:10, color:h.urgent?T.accent:T.ink3, whiteSpace:"nowrap" }}>{h.due}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ background:T.surface, border:"1px solid "+T.hairline, borderRadius:8, padding:"16px 18px", boxShadow:"0 1px 3px rgba(30,20,8,0.07)" }}>
              <div style={{ fontFamily:mono, fontSize:10, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>◆ Today's schedule</div>
              {SCHEDULE.map((row,i) => {
                const s = row.subj ? subjectBy(row.subj) : null;
                const isNow = i===2;
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"38px 4px 1fr", gap:8, padding:"5px 0", borderBottom:"1px dashed "+T.hairline, opacity:i<2?0.45:1 }}>
                    <span style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, paddingTop:2 }}>{row.time}</span>
                    <div style={{ background:s?s.color:T.ink3+"44", borderRadius:2 }} />
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:isNow?600:400, color:isNow?T.ink:T.ink2 }}>
                        {s?s.short:"Lunch"}{isNow&&<span style={{ marginLeft:6, fontFamily:mono, fontSize:9, color:T.accent, textTransform:"uppercase", letterSpacing:"0.1em" }}>NOW</span>}
                      </div>
                      <div style={{ fontFamily:mono, fontSize:10, color:T.ink3 }}>{row.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ background:T.ink, borderRadius:8, padding:"18px 18px", color:T.bg }}>
                <div style={{ fontFamily:mono, fontSize:9.5, color:"rgba(250,247,241,0.5)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>In session · AP Bio</div>
                <div style={{ fontFamily:serif, fontSize:48, lineHeight:1, letterSpacing:"-0.02em" }}>38<span style={{ fontSize:16, opacity:0.5 }}>m</span></div>
                <div style={{ fontFamily:mono, fontSize:10, color:"rgba(250,247,241,0.45)", marginTop:3, textTransform:"uppercase", letterSpacing:"0.08em" }}>until bell</div>
                <div style={{ height:3, background:"rgba(255,255,255,0.1)", borderRadius:2, marginTop:10, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:"60%", background:T.accent, borderRadius:2 }} />
                </div>
              </div>
              <div style={{ background:T.surface, border:"1px solid "+T.hairline, borderRadius:8, padding:"14px 16px", boxShadow:"0 1px 3px rgba(30,20,8,0.07)" }}>
                <div style={{ fontFamily:mono, fontSize:10, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>◆ Grades</div>
                {SUBJECTS.slice(0,5).map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
                    <span style={{ width:6, height:6, borderRadius:1, background:s.color, flexShrink:0 }} />
                    <span style={{ flex:1, fontFamily:mono, fontSize:10.5, color:T.ink2 }}>{s.short}</span>
                    <span style={{ fontFamily:mono, fontSize:11, fontWeight:500, color:T.ink }}>{s.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DESIGN E — "Newspaper" — Editorial front page layout
// ══════════════════════════════════════════════════════════════
function DesignE() {
  return (
    <div style={{ display:"flex", height:780, fontFamily:sans, background:T.bg, fontSize:14, color:T.ink }}>
      <Sidebar active="dashboard" />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Masthead */}
        <div style={{ padding:"14px 28px 12px", borderBottom:"2px solid "+T.ink, background:T.bg, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
            <div style={{ fontFamily:serif, fontSize:11, color:T.ink3, letterSpacing:"0.14em", textTransform:"uppercase" }}>Vol. XXXIV · Spring 2026</div>
            <div style={{ fontFamily:serif, fontStyle:"italic", fontSize:32, letterSpacing:"-0.02em", color:T.ink, lineHeight:1 }}>Julian's Notebook</div>
            <div style={{ fontFamily:serif, fontSize:11, color:T.ink3, letterSpacing:"0.08em" }}>Wednesday, June 3</div>
          </div>
          <div style={{ borderTop:"1px solid "+T.ink3, borderBottom:"1px solid "+T.ink3, margin:"8px 0", padding:"3px 0", display:"flex", justifyContent:"center", gap:32 }}>
            {["5 Tasks Open","Lab Report Due Wed","Bio Quiz Thursday","12-Day Streak"].map((s,i) => (
              <span key={i} style={{ fontFamily:mono, fontSize:10, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.1em" }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"0" }}>
          {/* Above the fold — hero story */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1px 1fr", borderBottom:"1px solid "+T.ink3 }}>
            {/* Lead story */}
            <div style={{ padding:"20px 24px", borderRight:"1px solid "+T.ink3 }}>
              <div style={{ fontFamily:mono, fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:8, borderBottom:"1px solid "+T.hairline, paddingBottom:6 }}>⚠ Most Urgent</div>
              <div style={{ fontFamily:serif, fontSize:34, lineHeight:1.1, letterSpacing:"-0.02em", marginBottom:8, fontWeight:600 }}>
                Beloved reading due <em style={{ color:T.accent }}>tonight</em> — 45 minutes
              </div>
              <div style={{ display:"flex", gap:10, marginBottom:12, alignItems:"center" }}>
                <span style={{ width:8, height:8, borderRadius:2, background:subjectBy("ap-lit").color }} />
                <span style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.08em" }}>AP English Literature · Ch. 9–12</span>
              </div>
              <div style={{ fontSize:13.5, color:T.ink2, lineHeight:1.7, borderLeft:"3px solid "+subjectBy("ap-lit").color, paddingLeft:14 }}>
                Chapters 9–12 cover Sethe's backstory and the emergence of Beloved as a physical presence. Discussion in class tomorrow — have notes ready.
              </div>
              <div style={{ marginTop:14, fontFamily:mono, fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.1em" }}>Also due soon:</div>
              <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:4 }}>
                {HOMEWORK.filter(h=>!h.done).slice(1,3).map((h,i) => {
                  const s = subjectBy(h.subject);
                  return <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12.5, padding:"4px 0", borderBottom:"1px dashed "+T.hairline }}>
                    <span style={{ width:6, height:6, borderRadius:1, background:s.color, flexShrink:0 }} />
                    <span style={{ flex:1, color:T.ink2 }}>{h.title}</span>
                    <span style={{ fontFamily:mono, fontSize:10, color:T.ink3 }}>{h.due}</span>
                  </div>;
                })}
              </div>
            </div>
            {/* Right column: schedule + quizzes */}
            <div style={{ padding:"20px 20px" }}>
              <div style={{ fontFamily:mono, fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:10, borderBottom:"1px solid "+T.hairline, paddingBottom:6 }}>Today's Bell Schedule</div>
              {SCHEDULE.slice(0,5).map((row,i) => {
                const s = row.subj ? subjectBy(row.subj) : null;
                const isNow = i===2;
                return (
                  <div key={i} style={{ display:"flex", gap:10, padding:"6px 0", borderBottom:"1px dashed "+T.hairline, opacity:i<2?0.45:1, alignItems:"center" }}>
                    <span style={{ fontFamily:mono, fontSize:10, color:T.ink3, width:36, flexShrink:0 }}>{row.time}</span>
                    <span style={{ width:4, height:4, borderRadius:2, background:s?s.color:T.ink3+"44", flexShrink:0 }} />
                    <span style={{ flex:1, fontSize:12.5, fontWeight:isNow?600:400, color:isNow?T.ink:T.ink2 }}>{s?s.short:"Lunch"}</span>
                    {isNow&&<span style={{ fontFamily:mono, fontSize:9, color:T.accent, textTransform:"uppercase", letterSpacing:"0.1em", border:"1px solid "+T.accent, borderRadius:3, padding:"1px 5px" }}>now</span>}
                  </div>
                );
              })}

              <div style={{ fontFamily:mono, fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.14em", marginTop:16, marginBottom:8, borderBottom:"1px solid "+T.hairline, paddingBottom:6 }}>Quiz Watch</div>
              {[{s:"ap-bio",t:"Cellular Respiration",when:"Thu",conf:58},{s:"spanish-3",t:"Pretérito",when:"Fri",conf:42}].map((q,i) => {
                const sb = subjectBy(q.s);
                return (
                  <div key={i} style={{ display:"flex", gap:8, padding:"6px 0", borderBottom:"1px dashed "+T.hairline }}>
                    <span style={{ width:4, borderRadius:2, background:sb.color, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12.5, lineHeight:1.2 }}>{sb.short}: {q.t}</div>
                      <div style={{ fontFamily:mono, fontSize:10, color:T.ink3, marginTop:1 }}>{q.when} · {q.conf}% ready</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Below fold — subject columns */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", borderTop:"none" }}>
            {SUBJECTS.slice(0,3).map((s,i) => {
              const hw = HOMEWORK.filter(h=>h.subject===s.id&&!h.done);
              return (
                <div key={i} style={{ padding:"14px 18px", borderRight:i<2?"1px solid "+T.hairline:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8, paddingBottom:6, borderBottom:"2px solid "+s.color }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                    <span style={{ fontFamily:serif, fontSize:13.5, fontWeight:600 }}>{s.name}</span>
                    <span style={{ marginLeft:"auto", fontFamily:serif, fontSize:18, color:T.ink }}>{s.grade}</span>
                  </div>
                  {hw.length>0 ? hw.slice(0,2).map((h,j) => (
                    <div key={j} style={{ fontSize:12, color:T.ink2, padding:"4px 0", borderBottom:"1px dashed "+T.hairline, display:"flex", justifyContent:"space-between", gap:8 }}>
                      <span style={{ lineHeight:1.3, flex:1 }}>{h.title}</span>
                      <span style={{ fontFamily:mono, fontSize:9.5, color:T.ink3, whiteSpace:"nowrap" }}>{h.due}</span>
                    </div>
                  )) : <div style={{ fontFamily:serif, fontStyle:"italic", fontSize:12.5, color:T.ink3, padding:"4px 0" }}>Clear — no tasks</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DESIGN F — "Kanban" — Subject columns board
// ══════════════════════════════════════════════════════════════
function DesignF() {
  const [done, setDone] = React.useState({});
  return (
    <div style={{ display:"flex", height:780, fontFamily:sans, background:T.bg2, fontSize:14, color:T.ink }}>
      <Sidebar active="dashboard" />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Topbar with greeting */}
        <div style={{ height:52, flexShrink:0, display:"flex", alignItems:"center", gap:16, padding:"0 24px", borderBottom:"1px solid "+T.sidebarB, background:T.sidebar }}>
          <div style={{ fontFamily:serif, fontSize:20, fontStyle:"italic", color:T.ink }}>Good morning, <em style={{ color:T.accent }}>Julian.</em></div>
          <div style={{ flex:1 }} />
          <span style={{ fontFamily:mono, fontSize:10.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.1em" }}>Wed · Jun 3 · AP Bio in session · 38m</span>
          <div style={{ width:28, height:28, borderRadius:14, background:T.hairline, display:"grid", placeItems:"center", fontFamily:serif, fontStyle:"italic", fontSize:13 }}>J</div>
        </div>

        {/* Kanban board */}
        <div style={{ flex:1, overflowX:"auto", overflowY:"hidden", padding:"20px 20px", display:"flex", gap:12 }}>
          {SUBJECTS.map((s, si) => {
            const tasks = HOMEWORK.filter(h => h.subject===s.id);
            return (
              <div key={si} style={{ width:190, flexShrink:0, display:"flex", flexDirection:"column", gap:8 }}>
                {/* Column header */}
                <div style={{ background:s.color, borderRadius:"8px 8px 0 0", padding:"10px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span style={{ fontFamily:serif, fontSize:14, color:"white", fontWeight:600 }}>{s.short}</span>
                    <span style={{ fontFamily:mono, fontSize:11, color:"rgba(255,255,255,0.7)" }}>{s.grade}</span>
                  </div>
                  <div style={{ fontFamily:mono, fontSize:9, color:"rgba(255,255,255,0.6)", marginTop:2, textTransform:"uppercase", letterSpacing:"0.08em" }}>{tasks.filter(h=>!h.done).length} tasks</div>
                </div>

                {/* Cards */}
                <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                  {tasks.length===0 && (
                    <div style={{ background:T.surface, border:"1px dashed "+T.hairline, borderRadius:"0 0 6px 6px", padding:"12px 14px", textAlign:"center" }}>
                      <div style={{ fontFamily:serif, fontStyle:"italic", fontSize:12, color:T.ink3 }}>All clear</div>
                    </div>
                  )}
                  {tasks.map((h,i) => (
                    <div key={i} onClick={() => setDone(d=>({...d,[h.id]:!d[h.id]}))} style={{
                      background: done[h.id]?T.bg2:T.surface,
                      border:"1px solid "+(done[h.id]?T.hairline:h.urgent?s.color+"60":T.hairline),
                      borderRadius: i===0?"0 0 0 0":6,
                      padding:"11px 13px", cursor:"pointer",
                      opacity: done[h.id]?0.5:1,
                      transition:"all .12s",
                      borderTop: i===0?"none":"1px solid "+T.hairline,
                    }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                        <div style={{ width:16, height:16, borderRadius:4, border:"1.5px solid "+(done[h.id]?T.done:h.urgent?s.color:T.hairline), background:done[h.id]?T.done:"transparent", flexShrink:0, marginTop:1, display:"grid", placeItems:"center" }}>
                          {done[h.id]&&<svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M3 8l3.5 3.5L13 5"/></svg>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12.5, lineHeight:1.3, textDecoration:done[h.id]?"line-through":"none", color:done[h.id]?T.ink3:T.ink }}>
                            {h.title}
                          </div>
                          <div style={{ display:"flex", gap:5, marginTop:5, flexWrap:"wrap" }}>
                            {h.urgent&&!done[h.id]&&<span style={{ fontFamily:mono, fontSize:8.5, color:s.color, border:"1px solid "+s.color+"50", borderRadius:3, padding:"1px 5px", textTransform:"uppercase", letterSpacing:"0.06em" }}>urgent</span>}
                            <span style={{ fontFamily:mono, fontSize:9, color:T.ink3 }}>{h.due}</span>
                            <span style={{ fontFamily:mono, fontSize:9, color:T.ink3 }}>· {h.est}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add task ghost */}
                  <div style={{ border:"1px dashed "+T.hairline, borderRadius:6, padding:"8px 13px", cursor:"pointer", opacity:0.5 }}>
                    <span style={{ fontFamily:mono, fontSize:11, color:T.ink3 }}>+ Add task</span>
                  </div>
                </div>

                {/* Subject stats footer */}
                <div style={{ background:T.surface, borderRadius:"0 0 8px 8px", padding:"8px 12px", border:"1px solid "+T.hairline, display:"flex", gap:12 }}>
                  {[{n:s.notes,l:"notes"},{n:s.quiz,l:"quiz"}].map((stat,j) => (
                    <div key={j} style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:serif, fontSize:16, lineHeight:1, color:T.ink }}>{stat.n}</div>
                      <div style={{ fontFamily:mono, fontSize:8.5, color:T.ink3, textTransform:"uppercase" }}>{stat.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DESIGN G — "Split Horizon" — Now vs. Week, dark/light
// ══════════════════════════════════════════════════════════════
function DesignG() {
  return (
    <div style={{ display:"flex", height:780, fontFamily:sans, fontSize:14, color:T.ink }}>
      <Sidebar active="dashboard" />
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", minWidth:0 }}>

        {/* LEFT — dark panel: "Right Now" */}
        <div style={{ background:T.ink, color:T.bg, display:"flex", flexDirection:"column", padding:"32px 32px 28px", overflow:"hidden" }}>
          <div style={{ fontFamily:mono, fontSize:9.5, color:"rgba(250,247,241,0.35)", textTransform:"uppercase", letterSpacing:"0.16em", marginBottom:20 }}>Right now</div>

          {/* In-session card */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <div style={{ width:10, height:10, borderRadius:5, background:subjectBy("ap-bio").color, animation:"pulse 2s infinite" }} />
              <span style={{ fontFamily:mono, fontSize:10, color:"rgba(250,247,241,0.4)", textTransform:"uppercase", letterSpacing:"0.12em" }}>In session</span>
            </div>
            <div style={{ fontFamily:serif, fontSize:40, lineHeight:1.05, letterSpacing:"-0.02em" }}>AP Biology</div>
            <div style={{ fontFamily:serif, fontStyle:"italic", fontSize:18, color:"rgba(250,247,241,0.5)", marginTop:2 }}>Enzyme kinetics lab · rm 118</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:14 }}>
              <span style={{ fontFamily:serif, fontSize:72, lineHeight:1, letterSpacing:"-0.03em" }}>38</span>
              <span style={{ fontFamily:mono, fontSize:12, color:"rgba(250,247,241,0.4)", textTransform:"uppercase", letterSpacing:"0.1em" }}>min until bell</span>
            </div>
            <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, marginTop:12, overflow:"hidden" }}>
              <div style={{ height:"100%", width:"60%", background:subjectBy("ap-bio").color, borderRadius:2 }} />
            </div>
          </div>

          <div style={{ height:"1px", background:"rgba(255,255,255,0.08)", margin:"4px 0 20px" }} />

          {/* Urgent tasks */}
          <div style={{ fontFamily:mono, fontSize:9.5, color:"rgba(250,247,241,0.35)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:12 }}>Urgent today</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {HOMEWORK.filter(h=>!h.done&&h.urgent).map((h,i) => {
              const s = subjectBy(h.subject);
              return (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ width:4, height:36, borderRadius:2, background:s.color, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, lineHeight:1.3, color:"rgba(250,247,241,0.9)" }}>{h.title}</div>
                    <div style={{ fontFamily:mono, fontSize:10, color:"rgba(250,247,241,0.4)", marginTop:3 }}>{s.short} · {h.due} · {h.est}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ flex:1 }} />

          {/* AI game plan */}
          <div style={{ padding:"14px 16px", background:"rgba(255,255,255,0.05)", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <span style={{ color:T.accent, fontFamily:serif, fontStyle:"italic" }}>✦</span>
              <span style={{ fontFamily:mono, fontSize:9.5, color:"rgba(250,247,241,0.35)", textTransform:"uppercase", letterSpacing:"0.1em" }}>AI game plan</span>
            </div>
            <div style={{ fontFamily:serif, fontStyle:"italic", fontSize:14, lineHeight:1.6, color:"rgba(250,247,241,0.6)" }}>
              → Start with Beloved tonight (45m).<br/>
              → Finish Alg II identities before bed (30m).<br/>
              → Review Bio flashcards Wednesday AM.
            </div>
          </div>
        </div>

        {/* RIGHT — light panel: "This Week" */}
        <div style={{ background:T.bg, borderLeft:"1px solid "+T.hairline, display:"flex", flexDirection:"column", padding:"32px 28px 28px", overflowY:"auto" }}>
          <div style={{ fontFamily:mono, fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.16em", marginBottom:20 }}>This week</div>

          {/* Week — full day cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {WEEK.map((d,i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 14px", borderRadius:8, background:d.today?T.accentSoft:T.surface, border:"1px solid "+(d.today?T.accent+"40":T.hairline) }}>
                <div style={{ flexShrink:0, textAlign:"center", width:32 }}>
                  <div style={{ fontFamily:mono, fontSize:9.5, color:d.today?T.accent:T.ink3, textTransform:"uppercase", letterSpacing:"0.08em" }}>{d.d}</div>
                  <div style={{ fontFamily:serif, fontSize:22, lineHeight:1.1, color:d.today?T.accent:T.ink, fontWeight:d.today?600:400 }}>{d.date}</div>
                </div>
                <div style={{ flex:1 }}>
                  {d.items.length===0 ? (
                    <span style={{ fontFamily:serif, fontStyle:"italic", fontSize:12.5, color:T.ink3 }}>Free</span>
                  ) : d.items.map((it,j) => {
                    const sb = subjectBy(it.s);
                    return <div key={j} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <span style={{ width:6, height:6, borderRadius:1, background:sb.color, flexShrink:0 }} />
                      <span style={{ fontSize:12.5, color:T.ink2, lineHeight:1.3 }}>{sb.short} · {it.n}</span>
                    </div>;
                  })}
                </div>
                {d.today&&<span style={{ fontFamily:mono, fontSize:9, color:T.accent, textTransform:"uppercase", letterSpacing:"0.1em", border:"1px solid "+T.accent+"50", borderRadius:3, padding:"2px 6px", flexShrink:0 }}>today</span>}
              </div>
            ))}
          </div>

          {/* Upcoming quizzes */}
          <div style={{ fontFamily:mono, fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:10 }}>Quizzes ahead</div>
          {[{s:"ap-bio",t:"Cellular Respiration",when:"Thu",conf:58},{s:"spanish-3",t:"Pretérito vs Imp.",when:"Fri",conf:42},{s:"alg2",t:"Trig Identities",when:"Next week",conf:71}].map((q,i) => {
            const sb = subjectBy(q.s);
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px dashed "+T.hairline }}>
                <span style={{ width:4, height:28, borderRadius:2, background:sb.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, lineHeight:1.2 }}>{sb.short}: {q.t}</div>
                  <div style={{ fontFamily:mono, fontSize:10, color:T.ink3, marginTop:1 }}>{q.when}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:serif, fontSize:20, color:q.conf<50?T.accent:T.done }}>{q.conf}%</div>
                  <div style={{ fontFamily:mono, fontSize:9, color:T.ink3 }}>ready</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="original" title="Current Design" subtitle="Existing homepage for reference">
        <DCArtboard id="orig" label="Current" width={1200} height={780}>
          <DesignOriginal />
        </DCArtboard>
      </DCSection>

      <DCSection id="concepts" title="New Concepts" subtitle="B kept · E, F, G are new directions — pan, zoom, click to focus">
        <DCArtboard id="b" label="B · Command" width={1200} height={780}>
          <DesignB />
        </DCArtboard>
        <DCArtboard id="e" label="E · Newspaper" width={1200} height={780}>
          <DesignE />
        </DCArtboard>
        <DCArtboard id="f" label="F · Kanban" width={1200} height={780}>
          <DesignF />
        </DCArtboard>
        <DCArtboard id="g" label="G · Split Horizon" width={1200} height={780}>
          <DesignG />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
</body>
</html>