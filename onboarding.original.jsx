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

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "var(--bg)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--f-ui, Geist, sans-serif)",
    }}>
      {/* Step dots — only for setup steps 1-3 */}
      {step > 0 && (
        <div style={{ position: "absolute", top: 40, right: 40, display: "flex", gap: 8 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: s === step ? "var(--accent)" : s < step ? "var(--ink-3)" : "var(--hairline)",
              transition: "background 0.2s",
            }} />
          ))}
        </div>
      )}

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 520,
        background: "var(--surface)", border: "1px solid var(--hairline)",
        borderRadius: 12, padding: "40px 44px",
        boxShadow: "0 24px 60px -16px rgba(20,16,11,0.14)",
      }}>
        {step > 0 && (
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
            Step {step} of 3 · {stepLabels[step - 1]}
          </div>
        )}

        {/* ── Step 0: Returning user? ── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 34, lineHeight: 1.1, margin: "0 0 10px", fontWeight: 400 }}>
              Welcome to <em style={{ color: "var(--accent)" }}>Julian's Notebook.</em>
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 32px", lineHeight: 1.6 }}>
              Do you already have an account? Sign in to sync your notes, homework, and grades instantly.
            </p>

            {/* Sign in option */}
            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "13px 20px", borderRadius: 8, marginBottom: 12, cursor: signingIn ? "default" : "pointer",
                border: "1.5px solid var(--hairline)", background: signingIn ? "var(--bg-2)" : "var(--surface)",
                fontFamily: "inherit", fontSize: 14.5, color: "var(--ink)",
                opacity: signingIn ? 0.6 : 1, transition: "opacity 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {signingIn ? "Loading your account…" : "Sign in with Google"}
            </button>

            {signInError && (
              <div style={{ fontSize: 11.5, color: "var(--accent)", fontFamily: "var(--f-mono)", marginBottom: 12, padding: "8px 12px", background: "var(--accent-soft)", borderRadius: 6 }}>
                {signInError}
              </div>
            )}

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
            </div>

            {/* New account option */}
            <button
              onClick={() => setStep(1)}
              style={{
                width: "100%", padding: "13px 20px", borderRadius: 8,
                border: "1.5px solid var(--accent)", background: "var(--accent-soft)",
                fontFamily: "inherit", fontSize: 14.5, color: "var(--accent-ink)",
                cursor: "pointer", fontWeight: 500,
              }}
            >
              Set up a new notebook →
            </button>
          </div>
        )}

        {/* ── Step 1: Name + Grade ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 34, lineHeight: 1.1, margin: "0 0 28px", fontWeight: 400 }}>
              Let's set up your <em style={{ color: "var(--accent)" }}>notebook.</em>
            </h2>

            <OField label="What's your name?">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && canNext1) setStep(2); }}
                placeholder="e.g. Julian"
                style={oInput}
              />
            </OField>

            <OField label="What year are you in?" style={{ marginTop: 22 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[["freshman","Freshman"],["sophomore","Sophomore"],["junior","Junior"],["senior","Senior"]].map(([k,l]) => (
                  <button key={k} onClick={() => setGrade(k)} style={{
                    flex: 1, padding: "9px 4px", borderRadius: 5, fontSize: 12.5,
                    border: "1px solid " + (grade === k ? "var(--accent)" : "var(--hairline)"),
                    background: grade === k ? "var(--accent-soft)" : "var(--surface)",
                    color: grade === k ? "var(--accent-ink)" : "var(--ink-2)",
                    fontFamily: "inherit", cursor: "pointer", fontWeight: grade === k ? 600 : 400,
                  }}>{l}</button>
                ))}
              </div>
            </OField>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
              <button className="sn-btn ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="sn-btn primary" disabled={!canNext1}
                style={{ opacity: canNext1 ? 1 : 0.35 }}
                onClick={() => setStep(2)}>Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: School + Year start ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 34, lineHeight: 1.1, margin: "0 0 28px", fontWeight: 400 }}>
              Tell us about your <em style={{ color: "var(--accent)" }}>school.</em>
            </h2>

            <OField label="School name">
              <input
                autoFocus
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Lincoln High School"
                style={oInput}
              />
            </OField>

            <OField label="When does your school year start?" style={{ marginTop: 22 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <select value={yearMonth} onChange={(e) => setYearMonth(Number(e.target.value))} style={{ ...oInput, flex: 2 }}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={yearYear} onChange={(e) => setYearYear(Number(e.target.value))} style={{ ...oInput, flex: 1 }}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </OField>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
              <button className="sn-btn ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="sn-btn primary" disabled={!canNext2}
                style={{ opacity: canNext2 ? 1 : 0.35 }}
                onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Classes ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 34, lineHeight: 1.1, margin: "0 0 6px", fontWeight: 400 }}>
              What classes are you <em style={{ color: "var(--accent)" }}>taking?</em>
            </h2>
            <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 22px", lineHeight: 1.5 }}>
              Add up to 10. You can change these later.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto", paddingRight: 2 }}>
              {subjects.map((s, i) => (
                <div key={s.tempId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Color swatch / picker toggle */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      onClick={() => setColorPicker(colorPicker === s.tempId ? null : s.tempId)}
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: s.color, cursor: "pointer",
                        border: "2px solid rgba(0,0,0,0.08)",
                      }}
                    />
                    {colorPicker === s.tempId && (
                      <div style={{
                        position: "absolute", top: 34, left: 0, zIndex: 10,
                        background: "var(--surface)", border: "1px solid var(--hairline)",
                        borderRadius: 6, padding: 8,
                        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4,
                        boxShadow: "0 8px 24px -8px rgba(20,16,11,0.2)",
                      }}>
                        {PRESET_COLORS.map((c) => (
                          <div key={c} onClick={() => { updateSubject(s.tempId, { color: c }); setColorPicker(null); }}
                            style={{
                              width: 22, height: 22, borderRadius: 4, background: c, cursor: "pointer",
                              outline: s.color === c ? "2px solid var(--ink)" : "none", outlineOffset: 1,
                            }} />
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    value={s.name}
                    onChange={(e) => updateSubject(s.tempId, { name: e.target.value })}
                    placeholder={`Class ${i + 1} (e.g. AP Biology)`}
                    style={{ ...oInput, flex: 1, padding: "7px 10px" }}
                  />

                  {subjects.length > 1 && (
                    <button onClick={() => removeSubject(s.tempId)}
                      style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                  )}
                </div>
              ))}
            </div>

            {subjects.length < 10 && (
              <button className="sn-btn ghost" onClick={addSubject}
                style={{ marginTop: 10, fontSize: 12, padding: "5px 12px" }}>+ Add another class</button>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
              <button className="sn-btn ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="sn-btn primary" disabled={!canFinish}
                style={{ opacity: canFinish ? 1 : 0.35 }}
                onClick={finish}>
                Open my notebook →
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: "var(--ink-3)" }}>
        {step === 0 ? "Sign in to sync across devices, or set up locally for free" : "Your data stays on your device · sign in later to sync"}
      </p>
    </div>
  );
}

function OField({ label, children, style }) {
  return (
    <div style={style}>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7 }}>{label}</div>
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

function nbGetProfile() {
  try { return JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "null"); } catch { return null; }
}

Object.assign(window, { Onboarding, nbGetProfile, ONBOARDING_KEY });
