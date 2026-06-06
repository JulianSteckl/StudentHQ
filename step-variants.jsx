// Step layout explorations — static mocks of onboarding step 1.
// All 1240×800, Alloy dark theme.

/* ─── Shared form primitives ─── */
function FormLabel({ children }) {
  return (
    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function FakeInput({ placeholder }) {
  return (
    <div style={{
      width: "100%", padding: "11px 14px", borderRadius: 4,
      border: "1px solid var(--hairline)", background: "var(--bg-2)",
      fontSize: 14.5, color: "var(--ink-3)", fontFamily: "var(--f-ui)",
    }}>
      {placeholder}
    </div>
  );
}

function YearPills() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {["Freshman", "Sophomore", "Junior", "Senior"].map((y, i) => (
        <div key={y} style={{
          flex: 1, padding: "9px 0", textAlign: "center",
          border: i === 0 ? "1px solid var(--accent)" : "1px solid var(--hairline)",
          borderRadius: 4,
          background: i === 0 ? "var(--accent-soft)" : "transparent",
          color: i === 0 ? "var(--accent)" : "var(--ink-2)",
          fontSize: 13.5, cursor: "pointer",
        }}>
          {y}
        </div>
      ))}
    </div>
  );
}

function NavRow() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
      <button style={{ background: "none", border: "none", fontSize: 13, color: "var(--ink-3)", cursor: "pointer", padding: 0 }}>← Back</button>
      <button style={{ padding: "9px 20px", borderRadius: 4, border: "1px solid var(--hairline)", background: "var(--surface)", fontSize: 13.5, color: "var(--ink)", cursor: "pointer" }}>Next →</button>
    </div>
  );
}

function StepLabel({ text = "Step 1 of 3 · About you" }) {
  return (
    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>
      {text}
    </div>
  );
}

function StepHeading({ text = "Let's set up your notebook." }) {
  return (
    <h2 style={{ fontFamily: "var(--f-display)", fontSize: 30, lineHeight: 1.1, margin: "0 0 26px", fontWeight: 400, color: "var(--ink)" }}>
      {text.split("notebook").map((part, i, arr) => i < arr.length - 1
        ? <React.Fragment key={i}>{part}<em style={{ fontFamily: '"Instrument Serif", serif', color: "var(--accent)" }}>notebook</em></React.Fragment>
        : part
      )}
    </h2>
  );
}

/* The form content, reusable across all variants */
function FormContent({ showLabel = true }) {
  return (
    <div>
      {showLabel && <StepLabel />}
      <StepHeading />
      <FormLabel>What's your name?</FormLabel>
      <FakeInput placeholder="e.g. Julian" />
      <div style={{ height: 20 }} />
      <FormLabel>What year are you in?</FormLabel>
      <YearPills />
      <NavRow />
    </div>
  );
}

/* Shared stage wrapper */
function Stage({ children, style }) {
  return (
    <div style={{
      width: 1240, height: 800, position: "relative",
      background: "var(--bg)", color: "var(--ink)",
      fontFamily: "var(--f-ui)", overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* Step dots — top right */
function StepDots({ active = 1 }) {
  return (
    <div style={{ position: "absolute", top: 40, right: 40, display: "flex", gap: 8 }}>
      {[1, 2, 3].map(s => (
        <div key={s} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: s === active ? "var(--accent)" : s < active ? "var(--ink-3)" : "var(--hairline)",
        }} />
      ))}
    </div>
  );
}

/* ─────────────── 0 · CURRENT ─────────────── */
function Current() {
  return (
    <Stage>
      <StepDots />
      {/* Centered floating card */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 520, background: "var(--surface)", border: "1px solid var(--hairline)",
          borderRadius: 12, padding: "40px 44px",
          boxShadow: "0 24px 60px -16px rgba(0,0,0,0.4)",
        }}>
          <FormContent />
        </div>
        <div style={{ marginTop: 24, fontSize: 12, color: "var(--ink-3)" }}>
          Your data stays on your device · sign in later to sync
        </div>
      </div>
    </Stage>
  );
}

/* ─────────────── A · FRAME + NUMERALS ─────────────── */
function FrameNumerals() {
  return (
    <Stage>
      {/* Hairline double-frame */}
      <div style={{ position: "absolute", inset: 44, border: "1px solid var(--rule)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 52, border: "1px solid var(--hairline)", pointerEvents: "none" }} />

      {/* Eyebrow — matches cover page */}
      <div style={{
        position: "absolute", top: 90, left: 0, right: 0,
        textAlign: "center",
        fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.28em",
        textTransform: "uppercase", color: "var(--ink-3)",
      }}>
        — Step I of III · About you —
      </div>

      {/* Giant faint roman numeral behind everything */}
      <div style={{
        position: "absolute", bottom: -60, right: 60,
        fontFamily: '"Instrument Serif", serif',
        fontSize: 520, lineHeight: 1, fontStyle: "italic",
        color: "var(--ink)", opacity: 0.03,
        userSelect: "none", pointerEvents: "none",
        letterSpacing: "-0.05em",
      }}>
        I
      </div>

      {/* Step dots */}
      <StepDots />

      {/* Centered card */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 520, background: "var(--surface)", border: "1px solid var(--hairline)",
          borderRadius: 2, padding: "40px 44px",
          boxShadow: "0 24px 60px -16px rgba(0,0,0,0.5)",
        }}>
          <FormContent />
        </div>
      </div>

      {/* Colophon — matches cover page */}
      <div style={{
        position: "absolute", bottom: 76, left: 0, right: 0,
        textAlign: "center",
        fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--ink-3)",
      }}>
        Anno MMXXVI · printed for one reader
      </div>
    </Stage>
  );
}

/* ─────────────── B · OPEN-BOOK ─────────────── */
function OpenBook() {
  const blurbs = [
    { label: "Chapter I", line: "Tell us who this notebook belongs to.", body: "A name, and the year you're in — that's all we need to get you started." },
    { label: "Chapter II", line: "And where you go to school." },
    { label: "Chapter III", line: "Add your classes — you can edit later." },
  ];
  const current = blurbs[0];

  return (
    <Stage bg="#18181a">
      <StepDots />
      {/* Two-page book spread */}
      <div style={{
        position: "absolute", top: 70, left: 60, right: 60, bottom: 60,
        display: "grid", gridTemplateColumns: "1fr 1fr",
        boxShadow: "0 26px 60px -22px rgba(0,0,0,0.55)",
      }}>
        {/* Left page — editorial */}
        <div style={{
          background: "var(--bg-2)", padding: "56px 52px 56px 60px",
          borderRight: "1px solid var(--hairline)",
          display: "flex", flexDirection: "column",
          position: "relative",
        }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 40 }}>
            ¶ {current.label}
          </div>

          <div style={{
            fontFamily: '"Instrument Serif", serif', fontStyle: "italic",
            fontSize: 52, lineHeight: 1.1, color: "var(--ink)", letterSpacing: "-0.02em",
            marginBottom: 28, textWrap: "balance",
          }}>
            "{current.line}"
          </div>

          <p style={{
            fontFamily: "var(--f-display)", fontSize: 16.5, lineHeight: 1.6,
            color: "var(--ink-2)", margin: 0, textWrap: "pretty",
          }}>
            {current.body}
          </p>

          {/* Chapter TOC at bottom */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {blurbs.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--hairline)", flexShrink: 0 }} />
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: i === 0 ? "var(--accent)" : "var(--ink-3)" }}>
                  {b.label} — {b.line.replace('"','').replace('"','')}
                </div>
              </div>
            ))}
          </div>

          {/* Folio */}
          <div style={{ position: "absolute", left: 60, right: 52, bottom: 40, borderTop: "1px solid var(--rule)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>Setup</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>i</div>
          </div>
        </div>

        {/* Gutter shadow */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: "50%", width: 24,
          transform: "translateX(-50%)",
          background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.48) 50%, rgba(0,0,0,0.4) 60%, transparent)",
          pointerEvents: "none", zIndex: 2,
        }} />

        {/* Right page — form */}
        <div style={{
          background: "var(--surface)", padding: "56px 60px 56px 52px",
          display: "flex", flexDirection: "column",
          position: "relative",
        }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <FormContent showLabel={false} />
          </div>
          {/* Folio */}
          <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>Your notebook</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>ii</div>
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ─────────────── C · LIVE PREVIEW ─────────────── */
function LivePreview() {
  return (
    <Stage>
      {/* Frame */}
      <div style={{ position: "absolute", inset: 44, border: "1px solid var(--rule)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 52, border: "1px solid var(--hairline)", pointerEvents: "none" }} />

      {/* Eyebrow */}
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        — Step I of III · About you —
      </div>
      <StepDots />

      {/* Two-column interior: preview left, form right */}
      <div style={{
        position: "absolute", top: 140, left: 90, right: 90, bottom: 110,
        display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 60, alignItems: "center",
      }}>
        {/* Left: notebook cover preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 16 }}>
            Preview · your notebook
          </div>

          {/* Mock notebook cover */}
          <div style={{
            width: "100%", maxWidth: 340,
            background: "var(--surface)", border: "1px solid var(--rule)",
            borderRadius: 4, padding: "36px 32px",
            boxShadow: "6px 8px 32px -8px rgba(0,0,0,0.5), inset -4px 0 0 rgba(0,0,0,0.2)",
            position: "relative",
          }}>
            {/* Spine accent */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: "var(--accent)", borderRadius: "4px 0 0 4px", opacity: 0.6 }} />

            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 22, paddingLeft: 12 }}>
              Academic notebook
            </div>
            <div style={{ paddingLeft: 12 }}>
              <div style={{
                fontFamily: '"Instrument Serif", serif', fontStyle: "italic",
                fontSize: 44, lineHeight: 1.0, color: "var(--ink)", marginBottom: 14,
              }}>
                Julian's<br/>Notebook
              </div>
              <div style={{ height: 1, background: "var(--rule)", marginBottom: 12 }} />
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", lineHeight: 1.9, letterSpacing: "0.12em" }}>
                <div>READER: <span style={{ color: "var(--ink-2)" }}>Julian _____</span></div>
                <div>YEAR: <span style={{ color: "var(--accent)" }}>Freshman</span></div>
                <div>SCHOOL: <span style={{ color: "var(--ink-3)", borderBottom: "1px dotted var(--rule)" }}>⟶ Step II</span></div>
                <div style={{ marginTop: 10 }}>SUBJECTS:</div>
                <div style={{ paddingLeft: 10, color: "var(--ink-3)" }}>⟶ Step III</div>
              </div>
            </div>
            <div style={{ marginTop: 24, paddingLeft: 12 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, letterSpacing: "0.14em", color: "var(--ink-3)", textTransform: "uppercase" }}>Anno MMXXVI</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 10, textAlign: "center", letterSpacing: "0.1em" }}>
            Fills in as you complete each step
          </div>
        </div>

        {/* Right: the form */}
        <div>
          <FormContent />
        </div>
      </div>

      {/* Colophon */}
      <div style={{ position: "absolute", bottom: 76, left: 0, right: 0, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        Anno MMXXVI · printed for one reader
      </div>
    </Stage>
  );
}

/* ─────────────── D · INDEX SIDEBAR ─────────────── */
function IndexSidebar() {
  const steps = [
    { num: "I", label: "About you", hint: "Name & year" },
    { num: "II", label: "Your school", hint: "School & start date" },
    { num: "III", label: "Your classes", hint: "Add subjects" },
  ];

  return (
    <Stage>
      {/* Frame */}
      <div style={{ position: "absolute", inset: 44, border: "1px solid var(--rule)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 52, border: "1px solid var(--hairline)", pointerEvents: "none" }} />

      {/* Eyebrow */}
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        — Setting up your notebook —
      </div>
      <StepDots />

      {/* Three-column: sidebar | form | faint numeral */}
      <div style={{
        position: "absolute", top: 140, left: 90, right: 90, bottom: 110,
        display: "grid", gridTemplateColumns: "200px 1fr", gap: 60, alignItems: "start",
        paddingTop: 30,
      }}>
        {/* Left: TOC index */}
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 24, borderBottom: "1px solid var(--hairline)", paddingBottom: 12 }}>
            Contents
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                padding: "14px 0",
                borderBottom: "1px solid var(--hairline)",
                opacity: i > 0 ? 0.45 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--hairline)", flexShrink: 0 }} />
                  <div style={{
                    fontFamily: '"Instrument Serif", serif', fontStyle: "italic",
                    fontSize: 16, color: i === 0 ? "var(--ink)" : "var(--ink-2)",
                  }}>
                    {step.label}
                  </div>
                </div>
                <div style={{ paddingLeft: 16, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em" }}>
                  {step.hint}
                </div>
              </div>
            ))}
          </div>
          {/* Back to cover */}
          <div style={{ marginTop: 24, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>
            ← back to cover
          </div>
        </div>

        {/* Right: Form */}
        <div>
          <FormContent />
        </div>
      </div>

      {/* Giant faint numeral */}
      <div style={{
        position: "absolute", bottom: -40, right: 50,
        fontFamily: '"Instrument Serif", serif',
        fontSize: 480, lineHeight: 1, fontStyle: "italic",
        color: "var(--ink)", opacity: 0.03,
        userSelect: "none", pointerEvents: "none",
      }}>
        I
      </div>

      {/* Colophon */}
      <div style={{ position: "absolute", bottom: 76, left: 0, right: 0, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        Anno MMXXVI · printed for one reader
      </div>
    </Stage>
  );
}


/* ───────────────── E · C + D COMBINED ───────────────── */
/* Contents | Preview | Form — polished                           */
function StepCombined() {
  const steps = [
    { label: "About you", hint: "Name & year", active: true },
    { label: "Your school", hint: "School & start date", active: false },
    { label: "Your classes", hint: "Add subjects", active: false },
  ];

  return (
    <Stage>
      {/* Hairline double-frame */}
      <div style={{ position: "absolute", inset: 40, border: "1px solid var(--rule)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 48, border: "1px solid var(--hairline)", pointerEvents: "none" }} />

      {/* Eyebrow */}
      <div style={{ position: "absolute", top: 82, left: 0, right: 0, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        — Setting up your notebook —
      </div>

      {/* Step dots — top right */}
      <StepDots />

      {/* Three-column grid — vertically centered */}
      <div style={{
        position: "absolute", top: 124, left: 70, right: 70, bottom: 96,
        display: "grid",
        gridTemplateColumns: "160px 260px 1fr",
        gap: "0 52px",
        alignItems: "center",
      }}>

        {/* ── Column 1: Contents TOC ── */}
        <div style={{ alignSelf: "center" }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: "0.24em",
            textTransform: "uppercase", color: "var(--ink-3)",
            marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid var(--hairline)",
          }}>
            Contents
          </div>

          {/* Steps as vertical timeline */}
          <div style={{ position: "relative" }}>
            {/* Connecting line */}
            <div style={{ position: "absolute", left: 3, top: 10, bottom: 10, width: 1, background: "var(--hairline)" }} />

            {steps.map((step, i) => (
              <div key={i} style={{
                display: "flex", gap: 14, padding: "13px 0",
                opacity: !step.active ? 0.32 : 1,
              }}>
                {/* Dot */}
                <div style={{ position: "relative", flexShrink: 0, marginTop: 3 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: step.active ? "var(--accent)" : "var(--bg-2)",
                    border: step.active ? "none" : "1px solid var(--rule)",
                    position: "relative", zIndex: 1,
                  }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: '"Instrument Serif", serif', fontStyle: "italic",
                    fontSize: 15, color: step.active ? "var(--ink)" : "var(--ink-2)",
                    lineHeight: 1.2, marginBottom: 2,
                  }}>
                    {step.label}
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "0.08em" }}>
                    {step.hint}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--hairline)" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "0.1em" }}>
              ← back to cover
            </div>
          </div>
        </div>

        {/* ── Column 2: Notebook preview ── */}
        <div style={{ alignSelf: "center", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            Preview
          </div>

          {/* Notebook card — proper portrait ratio */}
          <div style={{
            background: "var(--bg-2)",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "8px 10px 36px -8px rgba(0,0,0,0.7), inset -4px 0 0 rgba(0,0,0,0.25), 0 0 0 1px var(--rule)",
            position: "relative",
            minHeight: 340,
          }}>
            {/* Colored spine */}
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 9,
              background: "linear-gradient(180deg, var(--accent) 0%, rgba(164,168,180,0.7) 100%)",
            }} />

            {/* Cover content */}
            <div style={{ padding: "28px 22px 28px 30px" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 20 }}>
                Academic Notebook
              </div>

              {/* Big title */}
              <div style={{
                fontFamily: '"Instrument Serif", serif', fontStyle: "italic",
                fontSize: 40, lineHeight: 1.0, color: "var(--ink)",
                letterSpacing: "-0.01em", marginBottom: 18,
              }}>
                Julian's<br />Notebook
              </div>

              {/* Separator */}
              <div style={{ height: 1, background: "var(--rule)", marginBottom: 16 }} />

              {/* Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "READER", value: "Julian _____", highlight: false },
                  { label: "YEAR", value: "Freshman", highlight: true },
                  { label: "SCHOOL", value: "➶ next step", dim: true },
                  { label: "SUBJECTS", value: "➶ step III", dim: true },
                ].map(({ label, value, highlight, dim }) => (
                  <div key={label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)", flexShrink: 0, width: 64 }}>
                      {label}
                    </div>
                    <div style={{
                      fontFamily: "var(--f-mono)", fontSize: 10,
                      color: highlight ? "var(--accent)" : dim ? "var(--ink-3)" : "var(--ink-2)",
                      borderBottom: dim ? "1px dotted var(--rule)" : "none",
                    }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress pills */}
          <div style={{ display: "flex", gap: 5 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                flex: 1, height: 2, borderRadius: 1,
                background: i === 1 ? "var(--accent)" : "var(--hairline)",
              }} />
            ))}
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", textAlign: "center" }}>
            Step 1 of 3
          </div>
        </div>

        {/* ── Column 3: Form ── */}
        <div>
          {/* Step label */}
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}>
            Step 1 of 3 · About you
          </div>

          {/* Heading */}
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: 36, lineHeight: 1.1, fontWeight: 400, color: "var(--ink)", margin: "0 0 30px" }}>
            Let's set up your{" "}
            <em style={{ fontFamily: '"Instrument Serif", serif', color: "var(--accent)" }}>notebook.</em>
          </h2>

          {/* Name */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 9 }}>
              What's your name?
            </div>
            <div style={{ padding: "13px 16px", borderRadius: 4, border: "1px solid var(--hairline)", background: "var(--bg-2)", fontSize: 14.5, color: "var(--ink-3)" }}>
              e.g. Julian
            </div>
          </div>

          {/* Year */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 9 }}>
              What year are you in?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Freshman", "Sophomore", "Junior", "Senior"].map((y, i) => (
                <div key={y} style={{
                  flex: 1, padding: "11px 0", textAlign: "center", borderRadius: 4,
                  border: i === 0 ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                  background: i === 0 ? "var(--accent-soft)" : "transparent",
                  color: i === 0 ? "var(--accent)" : "var(--ink-2)",
                  fontSize: 13.5,
                }}>
                  {y}
                </div>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button style={{ background: "none", border: "none", fontSize: 13, color: "var(--ink-3)", cursor: "pointer", padding: 0 }}>← Back</button>
            <button style={{ padding: "11px 24px", borderRadius: 4, border: "1px solid var(--hairline)", background: "var(--surface)", fontSize: 14, color: "var(--ink)", cursor: "pointer" }}>Next →</button>
          </div>
        </div>

      </div>

      {/* Colophon */}
      <div style={{ position: "absolute", bottom: 68, left: 0, right: 0, textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        Anno MMXXVI · printed for one reader
      </div>
    </Stage>
  );
}

Object.assign(window, { StepCurrent: Current, StepFrameNumerals: FrameNumerals, StepOpenBook: OpenBook, StepLivePreview: LivePreview, StepIndexSidebar: IndexSidebar, StepCombined });
