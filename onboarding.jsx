// Onboarding wizard — shown on first launch, saves profile to localStorage

const ONBOARDING_KEY = "nb-profile-v1";

const PRESET_COLORS = [
  "#c8694a", "#6b8e5a", "#5a7a99", "#b58a3b",
  "#7a4e6e", "#3f7d8a", "#b3543b", "#9a9082",
];

function makeSubjectId(name) {
  return "u-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 5);
}

function makeShort(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 6);
  if (words.length === 2) return words[0].slice(0, 4) + " " + words[1].slice(0, 4);
  // AP / Honors prefix
  if (["AP", "Honors", "IB", "CP"].includes(words[0])) return words[0] + " " + words[1].slice(0, 4);
  return words.map((w) => w[0]).join("").toUpperCase().slice(0, 5);
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

function Onboarding({ onComplete }) {
  const [step, setStep] = React.useState(0); // 0 = account check, 1-3 = setup

  const [signingIn, setSigningIn] = React.useState(false);
  const [signInError, setSignInError] = React.useState("");
  const [googleName, setGoogleName] = React.useState("");

  // After Google sign-in, wait for Firebase to finish loading cloud data,
  // then either restore the saved profile or continue to setup steps.
  React.useEffect(() => {
    if (!signingIn) return;
    const onLoaded = (e) => {
      if (e.detail.hasCloudProfile) {
        // Profile restored to localStorage — call onComplete (page reloads, picks it up)
        const restored = (() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } })();
        if (restored) { onComplete(restored); return; }
      }
      // No saved profile in cloud → go to setup steps with name pre-filled from Google
      setSigningIn(false);
      setStep(1);
    };
    window.addEventListener("nbFirebaseLoaded", onLoaded);

    // Fallback: if Firebase doesn't respond in 6 seconds, proceed to setup
    const timeout = setTimeout(() => {
      setSigningIn(false);
      setStep(1);
    }, 6000);

    return () => {
      window.removeEventListener("nbFirebaseLoaded", onLoaded);
      clearTimeout(timeout);
    };
  }, [signingIn]);

  const handleGoogleSignIn = () => {
    setSigningIn(true);
    setSignInError("");
    if (!window.__fbAuth || !window.__fbGoogleProvider) {
      setSignInError("Auth not ready — reload and try again.");
      setSigningIn(false);
      return;
    }
    const provider = new window.__fbGoogleProvider();
    window.__fbAuth.signInWithPopup(provider)
      .then((result) => {
        // Store Google name so step 1 can pre-fill it
        if (result.user?.displayName) setGoogleName(result.user.displayName);
      })
      .catch((e) => {
        setSignInError(e.message || "Sign-in failed");
        setSigningIn(false);
      });
  };

  // Step 1
  const [name, setName] = React.useState("");
  const [grade, setGrade] = React.useState("");

  // Pre-fill name when Google name arrives
  React.useEffect(() => {
    if (googleName && !name) setName(googleName.split(" ")[0]);
  }, [googleName]);

  // Step 2
  const [school, setSchool] = React.useState("");
  const [yearMonth, setYearMonth] = React.useState(8); // September = index 8
  const [yearYear, setYearYear] = React.useState(CURRENT_YEAR);

  // Step 3
  const [subjects, setSubjects] = React.useState([
    { tempId: 1, name: "", color: PRESET_COLORS[0] },
  ]);
  const [colorPicker, setColorPicker] = React.useState(null); // tempId of open picker

  const addSubject = () => {
    if (subjects.length >= 10) return;
    const nextColor = PRESET_COLORS[subjects.length % PRESET_COLORS.length];
    setSubjects((s) => [...s, { tempId: Date.now(), name: "", color: nextColor }]);
  };

  const removeSubject = (tempId) => setSubjects((s) => s.filter((x) => x.tempId !== tempId));

  const updateSubject = (tempId, patch) =>
    setSubjects((s) => s.map((x) => x.tempId === tempId ? { ...x, ...patch } : x));

  const validSubjects = subjects.filter((s) => s.name.trim().length > 0);

  const finish = () => {
    const builtSubjects = validSubjects.map((s) => ({
      id: makeSubjectId(s.name),
      name: s.name.trim(),
      short: makeShort(s.name),
      color: s.color,
      grade: "—",
      teacher: "",
      room: "",
      notes: 0,
      hw: 0,
      quizzes: 0,
    }));

    const profile = {
      name: name.trim(),
      grade,
      school: school.trim(),
      yearStart: { month: yearMonth, year: yearYear },
      subjects: builtSubjects,
      completedAt: Date.now(),
    };

    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(profile));
    onComplete(profile);
  };

  const canNext1 = name.trim().length > 1 && grade;
  const canNext2 = school.trim().length > 0;
  const canFinish = validSubjects.length > 0;

  const stepLabels = ["About you", "Your school", "Your classes"];

  // Roman numeral helper for preview card
  const toRoman = (n) => ["I","II","III","IV","V","VI","VII","VIII","IX","X"][n-1] || n;

  // Transition state for back-to-cover animation
  const [exitingTocover, setExitingToCover] = React.useState(false);
  const goToCover = React.useCallback(() => {
    setExitingToCover(true);
    setTimeout(() => { setExitingToCover(false); setStep(0); }, 420);
  }, []);

  // Notebook preview card — reflects current input state
  const PreviewCard = () => (
    <div style={{
      width: 320, minHeight: 400, background: "#1e1e22",
      border: "1px solid #3a3a3e", borderRadius: 4,
      padding: "40px 40px 36px", boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
      display: "flex", flexDirection: "column", boxSizing: "border-box",
    }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "#585862", marginBottom: 16 }}>ACADEMIC NOTEBOOK</div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 32, lineHeight: 1.2, color: "#ffffff", fontWeight: 400, fontStyle: "italic", marginBottom: 24 }}>
        {name.trim() ? name.trim() + "'s" : "Julian's"}<br />Notebook
      </div>
      <div style={{ height: 1, background: "#2e2e34", marginBottom: 20 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {[
          ["READER",   name.trim() || "Julian"],
          ["YEAR",     grade ? grade.charAt(0).toUpperCase() + grade.slice(1) : "—"],
          ["SCHOOL",   step > 1 && school.trim() ? school.trim() : (step > 1 ? "—" : "next step")],
          ["SUBJECTS", step > 2 ? (validSubjects.length + " added") : "step " + toRoman(3)],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#585862", width: 66, flexShrink: 0 }}>{k}</span>
            <span style={{ fontSize: 13, color: "#9898a4", fontFamily: "var(--f-display)", fontStyle: "italic" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8 }}>
        {[1,2,3].map(s => (
          <div key={s} style={{
            width: s === step ? 24 : 6, height: 3, borderRadius: 2,
            background: s === step ? "#e6e6ea" : "#3a3a3e",
            transition: "width 0.3s cubic-bezier(0.22,1,0.36,1), background 0.3s",
          }} />
        ))}
      </div>
    </div>
  );

  // Shared nav row used in steps 1-3
  const NavRow = ({ canProceed, onBack, onNext, nextLabel = "Next →" }) => (
    <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
      <button onClick={onBack} style={{
        height: 48, padding: "0 22px", borderRadius: 4, cursor: "pointer",
        border: "1px solid #3a3a3e", background: "#2b2b2d",
        color: "#9898a4", fontFamily: "inherit", fontSize: 14,
        flexShrink: 0, transition: "color 0.15s",
      }}>← Back</button>
      <button onClick={onNext} disabled={!canProceed} style={{
        height: 48, flex: 1, borderRadius: 4,
        cursor: canProceed ? "pointer" : "default",
        border: "none",
        background: canProceed ? "#f0ece4" : "#2b2b2d",
        color: canProceed ? "#141310" : "#585862",
        fontFamily: "inherit", fontSize: 14, fontWeight: 600,
        transition: "background 0.15s, color 0.15s",
      }}>{nextLabel}</button>
    </div>
  );

  // ── Step 0 — animated full-bleed cover ──
  const [mousePos, setMousePos] = React.useState({ x: -999, y: -999 });
  if (step === 0) {
    const WORD = "Notebook";
    const FeatIcon = ({ id }) => {
      const s = { fill: "none", stroke: "rgba(255,255,255,0.55)", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" };
      const icons = {
        notes: (
          <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
            <path d="M12 20h-6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8l4 4v4"/>
            <path d="M14 4v4h4"/>
            <path d="M8 12h4M8 16h3"/>
            <path d="M18 14l-4 4 4 2 4-6z"/>
          </svg>
        ),
        homework: (
          <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <path d="M9 12l2 2 4-4"/>
            <path d="M8 8h1M12 8h4"/>
          </svg>
        ),
        schedule: (
          <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3"/>
          </svg>
        ),
        flashcards: (
          <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
            <rect x="3" y="6" width="16" height="11" rx="2"/>
            <path d="M5 4h14a2 2 0 0 1 2 2"/>
            <path d="M9 12h6"/>
          </svg>
        ),
        grades: (
          <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
            <path d="M4 20V14M8 20V10M12 20V12M16 20V7M20 20V4"/>
          </svg>
        ),
        ai: (
          <svg width="22" height="22" viewBox="0 0 24 24" {...s}>
            <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5z"/>
            <path d="M18 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" strokeWidth="1.2"/>
            <path d="M5 16l.8 1.6 1.6.8-1.6.8L5 21l-.8-1.8-1.6-.8 1.6-.8z" strokeWidth="1.2"/>
          </svg>
        ),
      };
      return icons[id] || null;
    };
    const featureCards = [
      { iconId: "notes",      label: "Notes",      desc: "Block-based editor with AI tools. Headings, quotes, checkboxes, and attachments — organized by unit." },
      { iconId: "homework",   label: "Homework",   desc: "Every assignment in one place. Urgency, due dates, time estimates. Never miss a deadline." },
      { iconId: "schedule",   label: "Schedule",   desc: "Your daily and weekly view. See what's in session, what's due, and what's coming." },
      { iconId: "flashcards", label: "Flashcards", desc: "Decks tied to your notes. Study with confidence tracking so you focus on what matters." },
      { iconId: "grades",     label: "Grades",     desc: "Letter grades with sparkline trends. Watch your progress build across the term." },
      { iconId: "ai",         label: "AI Tools",   desc: "Highlight any passage to explain it, generate a flashcard, or build a practice question." },
    ];
    const GIcon = () => (
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 13, fontWeight: 600, lineHeight: 1, flexShrink: 0 }}>G</span>
    );
    return (
      <div
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
        style={{ position: "fixed", inset: 0, zIndex: 500, background: "var(--bg)", fontFamily: "var(--f-ui, Geist, sans-serif)", overflowY: "auto", overflowX: "hidden" }}
      >
        <style>{`
          @keyframes nb-fade-up  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
          @keyframes nb-letter   { from { opacity:0; transform:translateY(12px) skewX(-4deg); } to { opacity:1; transform:none; } }
          @keyframes nb-draw-h   { from { transform:scaleX(0); } to { transform:scaleX(1); } }
          @keyframes nb-draw-v   { from { transform:scaleY(0); } to { transform:scaleY(1); } }
          @keyframes nb-grain    { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-1px,1px)} 50%{transform:translate(1px,-1px)} 75%{transform:translate(-1px,-1px)} }
          .nb-btn-primary { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .nb-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px -4px rgba(160,120,48,0.45); }
          .nb-btn-ghost   { transition: transform 0.18s ease; }
          .nb-btn-ghost:hover   { transform: translateY(-2px); }
          .nb-feat-card   { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
          .nb-feat-card:hover   { transform: translateY(-3px); box-shadow: 0 12px 36px -10px rgba(20,16,11,0.18); border-color: var(--accent) !important; }
        `}</style>

        {/* Cursor spotlight */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(160,120,48,0.055) 0%, transparent 70%)`, transition: "background 0.12s ease" }} />

        {/* Grain */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")", animation: "nb-grain 0.9s steps(1) infinite" }} />

        {/* ── HERO ── */}
        <div style={{ position: "relative", height: "100vh", minHeight: 600 }}>
          {/* Animated double-frame borders */}
          {["min(44px,4vmin)", "calc(min(44px,4vmin) + 8px)"].map((inset, fi) => (
            <div key={fi} style={{ position: "absolute", inset, pointerEvents: "none", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "var(--rule)", transformOrigin: "left", animation: `nb-draw-h ${0.6 + fi * 0.1}s ${0.2 + fi * 0.1}s cubic-bezier(0.4,0,0.2,1) both` }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "var(--rule)", transformOrigin: "right", animation: `nb-draw-h ${0.6 + fi * 0.1}s ${0.4 + fi * 0.1}s cubic-bezier(0.4,0,0.2,1) both` }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 1, background: "var(--rule)", transformOrigin: "top", animation: `nb-draw-v ${0.6 + fi * 0.1}s ${0.3 + fi * 0.1}s cubic-bezier(0.4,0,0.2,1) both` }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 1, background: "var(--rule)", transformOrigin: "bottom", animation: `nb-draw-v ${0.6 + fi * 0.1}s ${0.5 + fi * 0.1}s cubic-bezier(0.4,0,0.2,1) both` }} />
            </div>
          ))}

          {/* Vol. I corner */}
          <div style={{ position: "absolute", top: "min(56px,7vmin)", right: "min(68px,6vw)", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)", animation: "nb-fade-up 0.5s 0.9s both" }}>
            Vol. I · MMXXVI
          </div>

          {/* Eyebrow */}
          <div style={{ position: "absolute", top: "min(92px,11vmin)", left: 0, right: 0, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--ink-3)", animation: "nb-fade-up 0.5s 0.3s both" }}>
            — A Notebook —
          </div>

          {/* Center */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px" }}>
            {/* Letter-reveal wordmark */}
            <div style={{ fontFamily: '"Instrument Serif","Source Serif 4",Georgia,serif', fontSize: "clamp(100px,17vw,230px)", lineHeight: 0.9, fontStyle: "italic", color: "var(--ink)", letterSpacing: "-0.03em", display: "flex" }}>
              {WORD.split("").map((ch, i) => (
                <span key={i} style={{ display: "inline-block", animation: `nb-letter 0.55s ${0.55 + i * 0.06}s cubic-bezier(0.2,0.8,0.2,1) both` }}>{ch}</span>
              ))}
            </div>

            {/* Tagline */}
            <div style={{ marginTop: 20, fontFamily: "var(--f-display)", fontSize: 17, color: "var(--ink-2)", fontStyle: "italic", textAlign: "center", animation: "nb-fade-up 0.6s 1.2s both" }}>
              A second brain for high school.
            </div>

            {/* Rule */}
            <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 22, fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-3)", animation: "nb-fade-up 0.6s 1.35s both" }}>
              <span style={{ width: 64, height: 1, background: "var(--rule)" }} />
              Anno MMXXVI
              <span style={{ width: 64, height: 1, background: "var(--rule)" }} />
            </div>

            {/* CTAs */}
            <div style={{ marginTop: 52, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", animation: "nb-fade-up 0.6s 1.5s both" }}>
              <button className="nb-btn-primary" onClick={handleGoogleSignIn} disabled={signingIn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 26px", borderRadius: 2, border: "1px solid var(--accent)", background: "var(--accent)", fontFamily: "inherit", fontSize: 14.5, color: "var(--bg)", fontWeight: 500, cursor: signingIn ? "default" : "pointer", opacity: signingIn ? 0.6 : 1 }}>
                <GIcon /> {signingIn ? "Loading your account…" : "Continue with Google"}
              </button>
              <button className="nb-btn-ghost" onClick={() => setStep(1)} style={{ padding: "15px 26px", borderRadius: 2, border: "1px solid var(--ink)", background: "transparent", fontFamily: "inherit", fontSize: 14.5, color: "var(--ink)", cursor: "pointer" }}>
                Open a fresh notebook →
              </button>
            </div>

            {signInError && (
              <div style={{ marginTop: 18, fontSize: 11.5, color: "var(--accent)", fontFamily: "var(--f-mono)", padding: "8px 12px", background: "var(--accent-soft)", borderRadius: 6, maxWidth: 380, textAlign: "center" }}>{signInError}</div>
            )}

            {/* Scroll hint */}
            <div style={{ marginTop: 48, fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.62)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "nb-fade-up 0.6s 1.8s both" }}>
              <span>What's inside</span>
              <span style={{ fontSize: 16 }}>↓</span>
            </div>
          </div>

          {/* Colophon */}
          <div style={{ position: "absolute", bottom: "min(78px,9vmin)", left: 0, right: 0, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", animation: "nb-fade-up 0.5s 1.6s both" }}>
            2026 School Year · printed for one reader
          </div>
        </div>

        {/* ── FEATURE SHOWCASE ── */}
        <div style={{ borderTop: "1px solid var(--rule)", padding: "80px min(80px,8vw) 100px", background: "var(--bg)" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 16 }}>Everything you need</div>
            <div style={{ fontFamily: '"Instrument Serif","Source Serif 4",Georgia,serif', fontStyle: "italic", fontSize: "clamp(36px,5vw,56px)", lineHeight: 1.05, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              One notebook for every class.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 18, maxWidth: 1100, margin: "0 auto" }}>
            {featureCards.map((f) => (
              <div key={f.label} className="nb-feat-card" style={{ padding: "28px 28px 26px", border: "1px solid var(--hairline)", borderRadius: 8, background: "var(--surface)" }}>
                <div style={{ marginBottom: 14, lineHeight: 1 }}><FeatIcon id={f.iconId} /></div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 20, marginBottom: 8, color: "var(--ink)" }}>{f.label}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)" }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: "center", marginTop: 72 }}>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, color: "var(--ink-2)", marginBottom: 24 }}>Ready to start?</div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="nb-btn-primary" onClick={handleGoogleSignIn} disabled={signingIn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 2, border: "1px solid var(--accent)", background: "var(--accent)", fontFamily: "inherit", fontSize: 14, color: "var(--bg)", fontWeight: 500, cursor: signingIn ? "default" : "pointer", opacity: signingIn ? 0.6 : 1 }}>
                <GIcon /> Continue with Google
              </button>
              <button className="nb-btn-ghost" onClick={() => setStep(1)} style={{ padding: "14px 24px", borderRadius: 2, border: "1px solid var(--ink)", background: "transparent", fontFamily: "inherit", fontSize: 14, color: "var(--ink)", cursor: "pointer" }}>
                Open a fresh notebook →
              </button>
            </div>
          </div>

          <div style={{ marginTop: 72, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            — Notebook · Vol. I · Anno MMXXVI —
          </div>
        </div>
      </div>
    );
  }

  // ── Steps 1–3: two-column layout (form left, preview card right) ──
  const F = { // shared form input style
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1px solid #3a3a3e", outline: "none",
    fontFamily: "inherit", fontSize: 15, color: "#e6e6ea",
    padding: "10px 0", boxSizing: "border-box",
  };

  const stepZero = step - 1; // 0-based for array indexing
  const stepLabel = ["ABOUT YOU", "YOUR SCHOOL", "YOUR CLASSES"][stepZero];
  const stepNum   = ["01", "02", "03"][stepZero];
  const nextLabel = step === 3 ? "Open my notebook →" : "Next →";
  const onNext    = step === 1 ? () => setStep(2) : step === 2 ? () => setStep(3) : finish;
  const onBack    = step === 1 ? goToCover : step === 2 ? () => setStep(1) : () => setStep(2);
  const canProceed = step === 1 ? canNext1 : step === 2 ? canNext2 : canFinish;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "#18181a",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--f-ui, Geist, sans-serif)",
      fontSize: 16,
      opacity: exitingTocover ? 0 : 1,
      transform: exitingTocover ? "scale(0.97)" : "scale(1)",
      transition: exitingTocover ? "opacity 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)" : "none",
    }}>
      <style>{`
        .ob-input::placeholder { color: #585862; }
        .ob-select option { background: #1e1e22; color: #e6e6ea; }
        .ob-year-btn { transition: background 0.15s, color 0.15s; }
        .ob-year-btn:hover { border-color: #9898a4 !important; }
        .ob-next-btn { transition: opacity 0.15s; }
        .ob-next-btn:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      {/* Progress bar — full width, spans both columns */}
      <div style={{ display: "flex", height: 3, flexShrink: 0 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{
            flex: 1,
            background: s <= step ? "#e6e6ea" : "#2e2e34",
            marginRight: s < 3 ? 2 : 0,
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      {/* Main two-column body — fills remaining height, columns stretch to full height */}
      <div style={{
        flex: 1, minHeight: 0,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
      }}>

        {/* Left: form — vertically centered */}
        <div style={{
          flex: 1, minWidth: 0,
          display: "flex", flexDirection: "column", justifyContent: "center", alignSelf: "stretch",
          overflowY: "auto",
        }}>
          {/* Form content — flex column with gap drives all spacing */}
          <div style={{
            display: "flex", flexDirection: "column",
            gap: 24,
            padding: "0 72px 0 96px",
            maxWidth: 560,
          }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "#9898a4" }}>
              {stepNum} / 0{step < 3 ? step + 1 : 3} · {stepLabel}
            </div>

            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <h2 style={{ fontFamily: "var(--f-display)", fontSize: 42, lineHeight: 1.1, margin: 0, fontWeight: 400, color: "#e6e6ea" }}>
                  Let's set up your <em>notebook.</em>
                </h2>

                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#585862", marginBottom: 12 }}>WHAT'S YOUR NAME?</div>
                  <input
                    autoFocus
                    className="ob-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && canNext1) setStep(2); }}
                    placeholder="e.g. Julian"
                    style={{ ...F, width: "100%" }}
                  />
                </div>

                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#585862", marginBottom: 12 }}>WHAT YEAR ARE YOU IN?</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["freshman","Freshman"],["sophomore","Sophomore"],["junior","Junior"],["senior","Senior"]].map(([k,l]) => (
                      <button key={k} className="ob-year-btn" onClick={() => setGrade(k)} style={{
                        flex: 1, height: 42, borderRadius: 2, fontSize: 13,
                        border: "1px solid " + (grade === k ? "#e6e6ea" : "#3a3a3e"),
                        background: grade === k ? "#e6e6ea" : "#2b2b2d",
                        color: grade === k ? "#141416" : "#e6e6ea",
                        fontFamily: "inherit", cursor: "pointer", fontWeight: grade === k ? 600 : 400,
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <h2 style={{ fontFamily: "var(--f-display)", fontSize: 42, lineHeight: 1.1, margin: 0, fontWeight: 400, color: "#e6e6ea" }}>
                  Tell us about your <em>school.</em>
                </h2>

                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#585862", marginBottom: 12 }}>SCHOOL NAME</div>
                  <input
                    autoFocus
                    className="ob-input"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && canNext2) setStep(3); }}
                    placeholder="e.g. Lincoln High School"
                    style={{ ...F, width: "100%" }}
                  />
                </div>

                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#585862", marginBottom: 12 }}>WHEN DOES YOUR SCHOOL YEAR START?</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <select className="ob-select" value={yearMonth} onChange={(e) => setYearMonth(Number(e.target.value))} style={{ ...F, flex: 2, padding: "10px 0", cursor: "pointer" }}>
                      {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select className="ob-select" value={yearYear} onChange={(e) => setYearYear(Number(e.target.value))} style={{ ...F, flex: 1, padding: "10px 0", cursor: "pointer" }}>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <>
                <h2 style={{ fontFamily: "var(--f-display)", fontSize: 42, lineHeight: 1.1, margin: 0, fontWeight: 400, color: "#e6e6ea" }}>
                  What classes are you <em>taking?</em>
                </h2>
                <p style={{ fontSize: 13, color: "#585862", margin: 0, lineHeight: 1.5 }}>
                  Add up to 10. You can change these later.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
                  {subjects.map((s, i) => (
                    <div key={s.tempId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div onClick={() => setColorPicker(colorPicker === s.tempId ? null : s.tempId)}
                          style={{ width: 28, height: 28, borderRadius: 4, background: s.color, cursor: "pointer", border: "2px solid rgba(0,0,0,0.3)" }} />
                        {colorPicker === s.tempId && (
                          <div style={{
                            position: "absolute", top: 34, left: 0, zIndex: 10,
                            background: "#1e1e22", border: "1px solid #3a3a3e",
                            borderRadius: 4, padding: 8,
                            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
                          }}>
                            {PRESET_COLORS.map((c) => (
                              <div key={c} onClick={() => { updateSubject(s.tempId, { color: c }); setColorPicker(null); }}
                                style={{ width: 22, height: 22, borderRadius: 3, background: c, cursor: "pointer",
                                  outline: s.color === c ? "2px solid #ffffff" : "none", outlineOffset: 1 }} />
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        className="ob-input"
                        value={s.name}
                        onChange={(e) => updateSubject(s.tempId, { name: e.target.value })}
                        placeholder={`Class ${i + 1} (e.g. AP Biology)`}
                        style={{ ...F, flex: 1 }}
                      />
                      {subjects.length > 1 && (
                        <button onClick={() => removeSubject(s.tempId)}
                          style={{ border: 0, background: "transparent", color: "#585862", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>×</button>
                      )}
                    </div>
                  ))}
                </div>

                {subjects.length < 10 && (
                  <button onClick={addSubject} style={{
                    padding: "8px 14px", borderRadius: 2, fontSize: 13,
                    border: "1px solid #3a3a3e", background: "transparent",
                    color: "#9898a4", fontFamily: "inherit", cursor: "pointer",
                    alignSelf: "flex-start",
                  }}>+ Add another class</button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: preview card — full-height column, card centered via margin: auto */}
        <div style={{
          width: 440, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          alignSelf: "stretch",
          padding: 40,
          borderLeft: "1px solid #2e2e34",
        }}>
          <div style={{ position: "relative", top: 0, margin: "auto" }}>
            <PreviewCard />
          </div>
        </div>
      </div>

      {/* Footer — full-width, single bar */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "20px 48px", flexShrink: 0,
        borderTop: "1px solid #2e2e34",
        position: "relative",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontSize: 14, color: "#9898a4", fontFamily: "inherit",
        }}>← Back</button>

        <span className="mono" style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          fontSize: 10, letterSpacing: "0.22em", color: "#585862",
        }}>ANNO MMXXVI</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 32 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#585862" }}>PRINTED FOR ONE READER</span>
          <button className="ob-next-btn" onClick={onNext} disabled={!canProceed} style={{
            height: 44, padding: "0 28px", borderRadius: 2,
            cursor: canProceed ? "pointer" : "default",
            border: "none",
            background: canProceed ? "#e6e6ea" : "#2b2b2d",
            color: canProceed ? "#141416" : "#585862",
            fontFamily: "inherit", fontSize: 14, fontWeight: 600,
          }}>{nextLabel}</button>
        </div>
      </div>
    </div>
  );
}

function OField({ label, children, style, dark }) {
  return (
    <div style={style}>
      <div className="mono" style={{
        fontSize: 11, letterSpacing: "0.12em", marginBottom: 10,
        color: "var(--ink-3)",
        textTransform: "uppercase",
      }}>{label}</div>
      {children}
    </div>
  );
}

const oInput = {
  width: "100%", padding: "9px 12px",
  border: "1px solid var(--hairline)", borderRadius: 5,
  fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
  background: "var(--bg)", outline: "none",
  boxSizing: "border-box",
};

const oDarkInput = {
  width: "100%", padding: "10px 14px",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5,
  fontFamily: "inherit", fontSize: 14, color: "#e8e4dc",
  background: "rgba(255,255,255,0.05)", outline: "none",
  boxSizing: "border-box",
};

const oPrimaryBtn = {
  padding: "10px 22px", borderRadius: 6, border: "none",
  background: "rgba(255,255,255,0.9)", color: "#141310",
  fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer",
  transition: "opacity 0.15s",
};

const oGhostBtn = {
  padding: "10px 16px", borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.12)", background: "transparent",
  color: "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: 14,
  cursor: "pointer",
};

function nbGetProfile() {
  try { return JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "null"); } catch { return null; }
}

Object.assign(window, { Onboarding, nbGetProfile, ONBOARDING_KEY });
