// Shared shell components — sidebar, topbar, icons

const Ico = {
  home:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 7l6-4 6 4v6a1 1 0 0 1-1 1h-3v-4H6v4H3a1 1 0 0 1-1-1V7z"/></svg>,
  book:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h7a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V2zM3 12a2 2 0 0 1 2-2h7"/></svg>,
  note:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h7l3 3v9H3V2zM10 2v3h3"/></svg>,
  quiz:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2h6l2 2v10H3V4l2-2z"/><path d="M6 6h4M6 9h4M6 12h2"/></svg>,
  hw:      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="10" height="11" rx="1"/><path d="M5 7l1.5 1.5L9 6M5 11l1.5 1.5L9 10"/></svg>,
  cal:     <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 6h12M5 2v3M11 2v3"/></svg>,
  cards:   <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="9" height="10" rx="1"/><path d="M5 2h9v10"/></svg>,
  grade:   <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2l1.8 4 4.2.5-3 2.9.8 4.1L8 11.7 4.2 13.5 5 9.4 2 6.5 6.2 6 8 2z"/></svg>,
  tools:   <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>,
  file:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h6l4 4v8H3V2zM9 2v4h4"/></svg>,
  search:  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>,
  plus:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>,
  flame:   <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5c.7 1.7-.4 3-1 4-.7 1.2.3 2 .8 1.4.4-.5.5-1.2.8-1.7.5 1 2 2.5 2 4.4 0 2.4-2 4.4-2.6 4.4-.7 0-.8-1-1.7-1.5-1.2-.7-1.5-2.2-.4-3-.5 2 1 2.5 1.5 1.5.7-1.3-1-2-1.4-3.6-.3-1.4 1-3 2-5.9z"/></svg>,
  drag:    <svg width="10" height="14" viewBox="0 0 8 12" fill="currentColor"><circle cx="2" cy="2" r="1"/><circle cx="6" cy="2" r="1"/><circle cx="2" cy="6" r="1"/><circle cx="6" cy="6" r="1"/><circle cx="2" cy="10" r="1"/><circle cx="6" cy="10" r="1"/></svg>,
  arrow:   <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path className="tick" d="M3 8l3.5 3.5L13 5"/></svg>,
  clock:   <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/></svg>,
  dots:    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="8" r="1.3"/></svg>,
  bold:    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3h4a2.5 2.5 0 0 1 0 5H5V3zM5 8h5a2.5 2.5 0 0 1 0 5H5V8z"/></svg>,
  italic:  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h6M4 13h6M9 3l-2 10"/></svg>,
  list:    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h8M5 8h8M5 12h8M2.5 4h.1M2.5 8h.1M2.5 12h.1"/></svg>,
};

// Subject monogram glyphs — maps subject ID patterns to editorial SVG marks
function SubjectGlyph({ id = "", size = 14, color = "currentColor" }) {
  const s = id.toLowerCase();
  const isLit  = /lit|eng(?!ineer)|poetry|rhetoric/.test(s);
  const isBio  = /\bbio/.test(s);
  const isMath = /math|alg|calc|stat|trig/.test(s);
  const isHist = /hist|gov|civics|social/.test(s);
  const isChem = /chem/.test(s);
  const isArt  = /\bart\b|draw|paint|studio|design/.test(s);
  const isLang = /span|french|german|japanese|latin|italian|arabic|chinese/.test(s);
  const isPhys = /\bphys/.test(s);
  const isCS   = /\bcs\b|compsci|program|coding|tech/.test(s);

  const v = "0 0 16 16";
  const p = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round" };

  // ¶ Pilcrow for literature / English
  if (isLit) return (
    <svg width={size} height={size} viewBox={v}>
      <path {...p} strokeWidth="1.4" d="M8 13 L8 3 M11 3 L11 13"/>
      <path {...p} strokeWidth="1.35" d="M7 3 L10 3 C12.5 3 12.5 7.5 10 7.5 L7 7.5"/>
    </svg>
  );

  // Leaf for biology
  if (isBio) return (
    <svg width={size} height={size} viewBox={v}>
      <path {...p} strokeWidth="1.35" d="M8 13.5 C8 13.5 3 9.5 3 5.5 C3 2.8 5.3 1.5 8 2.5 C10.7 1.5 13 2.8 13 5.5 C13 9.5 8 13.5 8 13.5 Z"/>
      <line x1="8" y1="13.5" x2="8" y2="5" stroke={color} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );

  // ∫ Integral for math
  if (isMath) return (
    <svg width={size} height={size} viewBox={v}>
      <path {...p} strokeWidth="1.4" d="M9.5 2 C11.5 2 11 3.5 10 4.5 L6 11.5 C5 12.5 4.5 14 6.5 14"/>
      <circle cx="9.5" cy="2.5" r="0.9" fill={color} stroke="none"/>
      <circle cx="6.5" cy="13.5" r="0.9" fill={color} stroke="none"/>
    </svg>
  );

  // Ionic column for history
  if (isHist) return (
    <svg width={size} height={size} viewBox={v}>
      <rect x="4" y="2" width="8" height="1.5" rx="0.4" fill={color}/>
      <path {...p} strokeWidth="1.1" d="M6 3.5 C6 3 5.5 3 5.5 3.5 L5.5 11.5 M10.5 3.5 C10.5 3 10 3 10 3.5 L10 11.5"/>
      <line x1="6.5" y1="3.5" x2="6.5" y2="11.5" stroke={color} strokeWidth="1.1"/>
      <line x1="9.5" y1="3.5" x2="9.5" y2="11.5" stroke={color} strokeWidth="1.1"/>
      <rect x="4" y="11.5" width="8" height="2.5" rx="0.5" fill={color}/>
    </svg>
  );

  // Flask for chemistry
  if (isChem) return (
    <svg width={size} height={size} viewBox={v}>
      <path {...p} strokeWidth="1.35" d="M6.5 2 L6.5 7 L3 13 C2.5 14 3.5 14.5 4.5 14.5 L11.5 14.5 C12.5 14.5 13.5 14 13 13 L9.5 7 L9.5 2"/>
      <line x1="5.5" y1="2" x2="10.5" y2="2" stroke={color} strokeWidth="1.35" strokeLinecap="round"/>
      <circle cx="9.5" cy="11.5" r="1" fill={color} opacity="0.6"/>
      <circle cx="6.5" cy="12.5" r="0.7" fill={color} opacity="0.4"/>
    </svg>
  );

  // Brush for art
  if (isArt) return (
    <svg width={size} height={size} viewBox={v}>
      <path {...p} strokeWidth="1.5" d="M12 2 L5.5 10.5"/>
      <path d="M5.5 10.5 C4.5 11.5 3 12.5 3.5 13.5 C4 14.5 5.5 14 6.5 13 C7.5 12 7 10.5 5.5 10.5 Z" fill={color} stroke="none" opacity="0.8"/>
      <line x1="11" y1="3" x2="13" y2="5" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>
    </svg>
  );

  // Quill for languages
  if (isLang) return (
    <svg width={size} height={size} viewBox={v}>
      <path {...p} strokeWidth="1.1" d="M13 2 C11 4 7 8 5 14"/>
      <path {...p} strokeWidth="1.35" d="M13 2 C10 5 8 9 7.5 10"/>
      <path {...p} strokeWidth="1.35" d="M7.5 10 C6 10.5 5 12 5 14"/>
      <path {...p} strokeWidth="0.9" d="M5 14 L7 12"/>
    </svg>
  );

  // Sine wave for physics
  if (isPhys) return (
    <svg width={size} height={size} viewBox={v}>
      <path {...p} strokeWidth="1.5" d="M2 8 C3.5 4 5 4 6.5 8 C8 12 9.5 12 11 8"/>
      <path {...p} strokeWidth="1.5" strokeDasharray="1.5 2" d="M11 8 L14 8"/>
    </svg>
  );

  // Curly braces for CS
  if (isCS) return (
    <svg width={size} height={size} viewBox={v}>
      <path {...p} strokeWidth="1.3" d="M7 3 C5 3 5 5 5 6 C5 7 4 8 3 8 C4 8 5 9 5 10 C5 11 5 13 7 13"/>
      <path {...p} strokeWidth="1.3" d="M9 3 C11 3 11 5 11 6 C11 7 12 8 13 8 C12 8 11 9 11 10 C11 11 11 13 9 13"/>
    </svg>
  );

  // Default: serif italic initial
  const letter = id ? id.replace(/[^a-zA-Z]/g, "")[0]?.toUpperCase() || "?" : "?";
  return (
    <svg width={size} height={size} viewBox={v}>
      <text x="8" y="12.5" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="12" fill={color}>{letter}</text>
    </svg>
  );
}

function useFbUser() {
  const [user, setUser] = React.useState(window.__fbCurrentUser || null);
  React.useEffect(() => {
    const handler = (e) => setUser(e.detail);
    window.addEventListener("fbUserChanged", handler);
    return () => window.removeEventListener("fbUserChanged", handler);
  }, []);
  return user;
}

function UserAvatar({ fbUser, letter, size = 28, onClick }) {
  const style = { width: size, height: size, borderRadius: "50%", flexShrink: 0, cursor: onClick ? "pointer" : "default" };
  if (fbUser && fbUser.photoURL) {
    return <img src={fbUser.photoURL} alt="" style={{ ...style, border: "1.5px solid var(--hairline)", objectFit: "cover", filter: "grayscale(1) brightness(0.8)" }} onClick={onClick} />;
  }
  return <div className="sn-avatar" style={onClick ? { cursor: "pointer" } : undefined} onClick={onClick}>{letter}</div>;
}

function Sidebar({ active = "dashboard", subjects = SUBJECTS, brandSub = "v1", onNav }) {
  const go = (key) => (e) => { if (onNav) { e.preventDefault(); onNav(key); } };
  const fbUser = useFbUser();
  const profile = React.useMemo(() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } }, []);
  const displayName = fbUser ? fbUser.displayName : (profile ? profile.name : "Maya R.");
  const displayGrade = profile ? (profile.grade.charAt(0).toUpperCase() + profile.grade.slice(1)) : "Junior · 11ᵗʰ";
  const avatarLetter = (fbUser ? fbUser.displayName : displayName).charAt(0).toUpperCase();

  // Subscribe to store changes so badge counts update live
  const store = useNbStore();
  const hwOpen = [...HOMEWORK, ...store.homework].filter(h => !h.done).length;
  const quizCount = QUIZZES_UPCOMING.length;

  return (
    <aside className="sn-sidebar">
      <div className="sn-brand" style={{ cursor: onNav ? "pointer" : "default" }} onClick={onNav ? go("dashboard") : undefined}>
        <span className="mark">¶</span>
        <span className="name">Julian's Notebook</span>
        <span className="sub">{brandSub}</span>
      </div>
      <svg className="sn-brand-flourish" viewBox="0 0 100 8" width="100" height="8" fill="none">
        <circle cx="3" cy="4" r="1.3" fill="var(--accent)" fillOpacity="0.45"/>
        <path d="M4.5 4 C16 1.5 24 6.5 32 4 C40 1.5 48 6.5 56 4 C64 1.5 72 6.5 80 4 C84 2.5 88 4 95 4" stroke="var(--accent)" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.4"/>
        <circle cx="97" cy="4" r="1.3" fill="var(--accent)" fillOpacity="0.45"/>
      </svg>

      <div className="sn-nav-group">
        <h4>Workspace</h4>
        <div className={`sn-nav-item ${active === "dashboard" ? "active" : ""}`} onClick={go("dashboard")}><span className="ico">{Ico.home}</span>Today</div>
        <div className={`sn-nav-item ${active === "homework" ? "active" : ""}`} onClick={go("homework")}><span className="ico">{Ico.hw}</span>Homework {hwOpen > 0 && <span className="badge">{hwOpen}</span>}</div>
        <div className={`sn-nav-item ${active === "quizzes" ? "active" : ""}`} onClick={go("quizzes")}><span className="ico">{Ico.quiz}</span>Quizzes {quizCount > 0 && <span className="badge">{quizCount}</span>}</div>
        <div className={`sn-nav-item ${active === "notes" ? "active" : ""}`} onClick={go("notes")}><span className="ico">{Ico.note}</span>Notes</div>
        <div className={`sn-nav-item ${active === "cards" ? "active" : ""}`} onClick={go("flashcards")}><span className="ico">{Ico.cards}</span>Flashcards</div>
        <div className={`sn-nav-item ${active === "schedule" ? "active" : ""}`} onClick={go("schedule")}><span className="ico">{Ico.cal}</span>Schedule</div>
        <div className={`sn-nav-item ${active === "grades" ? "active" : ""}`} onClick={go("grades")}><span className="ico">{Ico.grade}</span>Grades</div>
        <div className={`sn-nav-item ${active === "tools" ? "active" : ""}`} onClick={go("tools")}><span className="ico">{Ico.tools}</span>Tools</div>
      </div>

      <div className="sn-nav-group">
        <h4 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Subjects</span>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openManageSubjects"))}
            title="Add a subject"
            style={{ background: "transparent", border: "1px solid var(--hairline)", borderRadius: 3, color: "var(--ink-3)", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "1px 5px", fontFamily: "var(--f-mono)" }}
          >+</button>
        </h4>
        {subjects.map((s) => {
          const isActive = active === s.id;
          return (
            <div key={s.id}
              className={`sn-nav-item ${isActive ? "active" : ""}`}
              onClick={go("subject:" + s.id)}
              style={isActive ? {
                background: s.color + "18",
                borderLeft: "2px solid " + s.color,
                paddingLeft: "6px",
                color: "var(--ink)",
              } : {
                borderLeft: "2px solid transparent",
                paddingLeft: "6px",
              }}
            >
              <SubjectGlyph id={s.id} size={12} color={s.color} />
              <span title={s.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.short}</span>
              {isActive && s.grade
                ? <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: s.color, flexShrink: 0, fontWeight: 600 }}>{s.grade}</span>
                : <span className="badge">{s.hw || ""}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--hairline)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UserAvatar fbUser={fbUser} letter={avatarLetter} />
          <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 5 }}>
              <span>{displayGrade}</span>
              {(() => { const s = nbGetStreak(); return s > 0 ? <><span style={{ opacity: 0.3 }}>·</span><span style={{ color: "var(--accent)", opacity: 0.85 }}>✶ {s}d</span></> : null; })()}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ streak = nbGetStreak(), placeholder = "Search notes, homework, quizzes…", onSearchClick, onPlusClick, extras, onSignOut }) {
  const fbUser = useFbUser();
  const avatarLetter = (() => { try { const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); return p ? p.name.charAt(0).toUpperCase() : "M"; } catch { return "M"; } })();
  return (
    <div className="sn-topbar">
      <div className="sn-search" onClick={onSearchClick} style={{ cursor: onSearchClick ? "pointer" : "text" }}>
        {Ico.search}
        <input placeholder={placeholder} onFocus={(e) => { if (onSearchClick) { e.target.blur(); onSearchClick(); } }} readOnly={!!onSearchClick} style={{ cursor: onSearchClick ? "pointer" : "text" }} />
        <span className="kbd">⌘K</span>
      </div>
      <div className="spacer"></div>
      {extras}
      <div className="sn-streak">
        <span className="flame">{Ico.flame}</span>
        <span><b style={{ color: "var(--ink)" }}>{streak}</b>-day streak</span>
      </div>
      <button className="sn-btn icon ghost" title="Quick add" onClick={onPlusClick}>{Ico.plus}</button>
      <UserAvatar fbUser={fbUser} letter={avatarLetter} onClick={onSignOut} />
    </div>
  );
}

function PageHeader({ eyebrow, title, italic, meta, actions, aside }) {
  return (
    <div className={`sn-pageheader pg-header${aside ? " has-aside" : ""}`}>
      <div className="titleblock">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>
          {title}
          {italic && <> <em>{italic}</em></>}
        </h1>
        <div className="sn-ornament" />
        {meta && <div className="meta">{meta}</div>}
      </div>
      {aside && <div className="header-aside">{aside}</div>}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

function SubjectDot({ id, size = 8 }) {
  const s = subjectBy(id);
  if (!s) return null;
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: 2, background: s.color }}></span>;
}

function ConfidenceMeter({ value }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.7 ? "var(--done)" : value >= 0.5 ? "var(--ochre)" : "var(--danger)";
  const label = value >= 0.7 ? "solid" : value >= 0.5 ? "ok" : "weak";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: 3, background: "var(--hairline)", borderRadius: 2, overflow: "hidden" }}>
        <div className="sn-bar-fill" style={{ width: `${pct}%`, height: "100%", background: color }}></div>
      </div>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color, letterSpacing: "0.04em" }}>{pct}%</span>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

// ── Alloy theme — applied once on load ────────────────────────────────────────
(function() {
  const vars = { "--bg":"#18181a","--bg-2":"#212123","--surface":"#2b2b2d","--ink":"#e6e6ea","--ink-2":"#9898a4","--ink-3":"#585862","--hairline":"#2e2e34","--rule":"#3a3a3e","--accent":"#a4a8b4","--accent-ink":"#c4c8d4","--accent-soft":"#262630","--highlight":"#323238","--done":"#70c07a","--done-soft":"#183020","--danger":"#e6e6ea","--info":"#6090ba","--plum":"#9070ba","--ochre":"#9898a4","--sidebar-bg":"#181818","--sidebar-border":"#2b2b2d" };
  const el = document.createElement("style");
  el.id = "nb-theme-override";
  el.textContent = ":root{" + Object.entries(vars).map(([k, v]) => k + ":" + v).join(";") + "}";
  document.head.appendChild(el);
  window.dispatchEvent(new CustomEvent("nbThemeApplied", { detail: { accent: vars["--accent"] } }));
})();

function StatNumber({ value, suffix = "", prefix = "", delay = 0, duration = 1000 }) {
  const numVal = typeof value === "number" ? value : parseFloat(value);
  const isNum  = !isNaN(numVal) && value != null;
  const [disp, setDisp] = React.useState(isNum ? 0 : value);

  React.useEffect(function() {
    if (!isNum) { setDisp(value); return; }
    var raf;
    var startTime = null;
    function run(ts) {
      if (startTime === null) startTime = ts;
      var elapsed = ts - startTime - delay;
      if (elapsed < 0) { raf = requestAnimationFrame(run); return; }
      var t = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisp(Math.round(eased * numVal));
      if (t < 1) raf = requestAnimationFrame(run);
      else setDisp(numVal);
    }
    raf = requestAnimationFrame(run);
    return function() { cancelAnimationFrame(raf); };
  }, [numVal, delay, duration]);

  return <>{prefix}{isNum ? disp : (value != null ? value : "—")}{suffix}</>;
}

Object.assign(window, { Ico, Sidebar, Topbar, PageHeader, SubjectDot, ConfidenceMeter, SubjectGlyph, StatNumber });
