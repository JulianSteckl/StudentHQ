// Welcome screen design explorations.
// Each component is a 1240x800 artboard.

const PAPER_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

const PAPER_BG_STRONG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.085'/%3E%3C/svg%3E\")";

function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// Frame used by every artboard — fixed 1240x800
function Stage({ children, bg = "var(--bg)", paper = true, style }) {
  return (
    <div style={{
      width: 1240, height: 800, position: "relative",
      background: bg,
      backgroundImage: paper ? PAPER_BG : undefined,
      color: "#1a1611",
      overflow: "hidden",
      fontFamily: "var(--f-ui)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ───────────── 0 · ORIGINAL (live) ───────────── */
function Original() {
  return (
    <Stage>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
      }}>
        <div style={{
          width: 520, background: "var(--surface)", border: "1px solid var(--hairline)",
          borderRadius: 12, padding: "40px 44px",
          boxShadow: "0 24px 60px -16px rgba(20,16,11,0.14)",
        }}>
          <h2 style={{
            fontFamily: "var(--f-display)", fontSize: 34, lineHeight: 1.1,
            margin: "0 0 10px", fontWeight: 400, color: "var(--ink)",
          }}>
            Welcome to <em style={{ color: "var(--accent)" }}>Julian's Notebook.</em>
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 28px", lineHeight: 1.6 }}>
            Do you already have an account? Sign in to sync your notes, homework, and grades instantly.
          </p>

          <button style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "13px 20px", borderRadius: 8, marginBottom: 12,
            border: "1.5px solid var(--hairline)", background: "var(--bg-2)",
            fontSize: 14.5, color: "var(--ink)",
          }}>
            <GoogleG /> Sign in with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          </div>

          <button style={{
            width: "100%", padding: "13px 20px", borderRadius: 8,
            border: "1.5px solid var(--accent)", background: "var(--accent-soft)",
            fontSize: 14.5, color: "var(--accent-ink)", fontWeight: 500,
          }}>
            Set up a new notebook →
          </button>
        </div>
        <div style={{ marginTop: 28, fontSize: 12, color: "var(--ink-3)" }}>
          Sign in to sync across devices, or set up locally for free
        </div>
      </div>
    </Stage>
  );
}

/* ───────────── A · EDITORIAL ─────────────
   Magazine-spread feel — big italic display, drop cap, hairline column rule,
   actions as a clean stack on the right. */
function Editorial() {
  return (
    <Stage>
      {/* Top masthead */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "26px 56px", display: "flex", alignItems: "baseline", justifyContent: "space-between",
        borderBottom: "1px solid var(--rule)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: "var(--f-edit)", fontSize: 24, fontStyle: "italic", color: "var(--accent)" }}>¶</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-2)" }}>The Notebook</span>
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          Vol. I · No. 1 · MMXXVI
        </div>
      </div>

      {/* Body grid */}
      <div style={{
        position: "absolute", top: 92, left: 56, right: 56, bottom: 56,
        display: "grid", gridTemplateColumns: "1.35fr 1px 1fr", gap: 56,
      }}>
        {/* Left: editorial headline */}
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 22 }}>
            A note from the editor
          </div>
          <h1 style={{
            fontFamily: "var(--f-edit)", fontWeight: 400,
            fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.02em",
            margin: "0 0 22px", color: "var(--ink)",
            textWrap: "balance",
          }}>
            Welcome,<br/>
            <em style={{ color: "var(--accent)" }}>reader.</em>
          </h1>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <span style={{
              fontFamily: "var(--f-edit)", fontSize: 88, lineHeight: 0.75, color: "var(--accent)",
              fontStyle: "italic", marginTop: 6,
            }}>“</span>
            <p style={{
              fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1.55,
              margin: 0, color: "var(--ink-2)", maxWidth: 460, textWrap: "pretty",
            }}>
              A place for your classes, the work you owe, and what you came here to learn.
              Sign in to carry it between devices — or begin a fresh notebook below.
            </p>
          </div>
        </div>

        {/* Vertical rule */}
        <div style={{ background: "var(--rule)", width: 1 }} />

        {/* Right: actions */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 4 }}>
            To begin
          </div>
          <button style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 14,
            padding: "18px 22px", borderRadius: 4,
            border: "1px solid var(--accent)", background: "var(--accent)",
            fontSize: 15, color: "var(--bg)", textAlign: "left", fontWeight: 500,
          }}>
            <GoogleG /> 
            <span style={{ flex: 1 }}>Continue with Google</span>
            <span style={{ opacity: 0.5 }}>→</span>
          </button>

          <button style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "flex-start",
            padding: "18px 22px", borderRadius: 4,
            border: "1px solid var(--rule)", background: "transparent",
            fontSize: 15, color: "var(--ink)", textAlign: "left",
          }}>
            <span style={{ flex: 1 }}>
              <span style={{ fontFamily: "var(--f-edit)", fontStyle: "italic", color: "var(--accent)" }}>Begin</span> a new notebook
            </span>
            <span style={{ opacity: 0.4 }}>→</span>
          </button>

          <div style={{
            marginTop: 18, paddingTop: 18, borderTop: "1px dashed var(--rule)",
            fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)",
            letterSpacing: "0.08em", lineHeight: 1.7,
          }}>
            SIGN IN to sync across devices.<br/>
            BEGIN FRESH stays on this machine.
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────── B · COVER PAGE ─────────────
   A frontispiece. Centered massive type, hairline frame, colophon at the bottom. */
function CoverPage() {
  return (
    <Stage>
      {/* Hairline frame */}
      <div style={{
        position: "absolute", inset: 44,
        border: "1px solid var(--rule)",
      }} />
      <div style={{
        position: "absolute", inset: 52,
        border: "1px solid var(--hairline)",
      }} />

      {/* Top mark */}
      <div style={{
        position: "absolute", top: 92, left: 0, right: 0,
        textAlign: "center",
        fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.32em",
        textTransform: "uppercase", color: "var(--ink-3)",
      }}>
        — A Notebook —
      </div>

      {/* Hero stack */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
      }}>
        <div style={{
          fontFamily: "var(--f-edit)", fontSize: 220, lineHeight: 0.9,
          fontStyle: "italic", color: "var(--ink)", letterSpacing: "-0.03em",
          textShadow: "0 1px 0 rgba(255,255,255,0.4)",
        }}>
          Notebook
        </div>
        <div style={{
          marginTop: 18,
          fontFamily: "var(--f-display)", fontSize: 16, color: "var(--ink-2)",
          fontStyle: "italic",
        }}>
          for classes, work, and what you came here to learn
        </div>

        {/* Rule + author */}
        <div style={{
          marginTop: 38, display: "flex", alignItems: "center", gap: 22,
          fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "var(--ink-3)",
        }}>
          <span style={{ width: 80, height: 1, background: "var(--rule)" }} />
          kept by you
          <span style={{ width: 80, height: 1, background: "var(--rule)" }} />
        </div>

        {/* Actions */}
        <div style={{ marginTop: 58, display: "flex", gap: 14 }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 22px", borderRadius: 2,
            border: "1px solid var(--accent)", background: "var(--accent)",
            fontSize: 14, color: "var(--bg)", fontWeight: 500,
          }}>
            <GoogleG size={16} /> Continue with Google
          </button>
          <button style={{
            padding: "14px 22px", borderRadius: 2,
            border: "1px solid var(--ink)", background: "transparent",
            fontSize: 14, color: "var(--ink)",
          }}>
            Open a fresh notebook →
          </button>
        </div>
      </div>

      {/* Colophon */}
      <div style={{
        position: "absolute", bottom: 78, left: 0, right: 0,
        textAlign: "center",
        fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--ink-3)",
      }}>
        Anno MMXXVI · printed for one reader
      </div>
    </Stage>
  );
}

/* ───────────── C · LIBRARY CARD ─────────────
   Tan index card on darker linen, mono labels, letterpress feel. */
function LibraryCard() {
  return (
    <Stage>
      {/* Stamp in corner */}
      <div style={{
        position: "absolute", top: 56, left: 56,
        border: "2px solid var(--accent)",
        color: "var(--accent)",
        padding: "8px 14px",
        fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.22em",
        textTransform: "uppercase", transform: "rotate(-4deg)",
        opacity: 0.7,
      }}>
        Property of the reader
      </div>

      {/* Date stamp top-right */}
      <div style={{
        position: "absolute", top: 56, right: 56,
        fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "var(--ink-2)", textAlign: "right",
      }}>
        Date issued<br/>
        <span style={{ fontSize: 18, letterSpacing: "0.06em" }}>02 · VI · 2026</span>
      </div>

      {/* The card */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%) rotate(-0.4deg)",
        width: 760, padding: "36px 44px 30px",
        background: "var(--surface)",
        backgroundImage: undefined,
        boxShadow: "0 18px 50px -18px rgba(60,40,12,0.35), 0 2px 0 rgba(255,255,255,0.6) inset",
        border: "1px solid #c9b88e",
        borderRadius: 2,
      }}>
        {/* Card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-2)" }}>
            Catalog No. JN — 0001
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-2)" }}>
            School Notebook
          </div>
        </div>
        <div style={{ height: 1, background: "var(--ink)", opacity: 0.18, marginBottom: 24 }} />

        {/* Title rows like a catalog card */}
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "14px 22px", alignItems: "baseline" }}>
          <Label>Title</Label>
          <div style={{ fontFamily: "var(--f-edit)", fontSize: 44, lineHeight: 1, color: "var(--ink)" }}>
            Welcome to your <em style={{ color: "var(--accent)" }}>notebook</em>.
          </div>

          <Label>Subject</Label>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 16, color: "var(--ink-2)" }}>
            Notes · Homework · Quizzes · Flashcards · Grades
          </div>

          <Label>Reader</Label>
          <div style={{
            fontFamily: "var(--f-display)", fontSize: 16, fontStyle: "italic", color: "var(--ink-2)",
            borderBottom: "1px dotted var(--ink-3)", paddingBottom: 4, paddingRight: 60,
          }}>
            ⟶ to be filled in
          </div>
        </div>

        <div style={{ height: 1, background: "var(--ink)", opacity: 0.12, margin: "28px 0 24px" }} />

        {/* Actions row */}
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
          <Label>Begin</Label>
          <div style={{ display: "flex", gap: 10, flex: 1, justifyContent: "flex-end" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 18px", borderRadius: 2,
              border: "1px solid var(--accent)", background: "var(--accent)",
              fontSize: 13.5, color: "var(--bg)", fontWeight: 500,
            }}>
              <GoogleG size={15} /> Sign in & sync
            </button>
            <button style={{
              padding: "12px 18px", borderRadius: 2,
              border: "1px solid var(--ink)", background: "transparent",
              fontSize: 13.5, color: "var(--ink)",
            }}>
              Start fresh →
            </button>
          </div>
        </div>
      </div>

      {/* Punched hole bottom */}
      <div style={{
        position: "absolute", left: "50%", bottom: 100,
        transform: "translateX(-50%)",
        width: 14, height: 14, borderRadius: "50%",
        background: "#faf7f1", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
        opacity: 0.6,
      }} />
    </Stage>
  );
}

function Label({ children }) {
  return (
    <div style={{
      fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em",
      textTransform: "uppercase", color: "var(--ink-3)",
    }}>
      {children}
    </div>
  );
}

/* ───────────── D · TYPE-LED / BRUTALIST ─────────────
   All-type. Massive italic display occupying most of the canvas; tight grid; hairlines. */
function Brutalist() {
  return (
    <Stage>
      {/* Top-left mark */}
      <div style={{
        position: "absolute", top: 48, left: 56,
        fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "var(--ink-3)",
      }}>
        Notebook · v.1
      </div>

      {/* Top-right date */}
      <div style={{
        position: "absolute", top: 48, right: 56,
        fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "var(--ink-3)",
      }}>
        Tue · 02 Jun 2026
      </div>

      {/* Massive headline */}
      <div style={{
        position: "absolute", top: 110, left: 56, right: 56,
      }}>
        <div style={{
          fontFamily: "var(--f-display)", fontWeight: 400,
          fontSize: 196, lineHeight: 0.88, letterSpacing: "-0.045em",
          color: "var(--ink)", margin: 0,
        }}>
          Welcome.
        </div>
        <div style={{
          fontFamily: "var(--f-edit)", fontSize: 64, lineHeight: 1,
          fontStyle: "italic", color: "var(--accent)",
          marginTop: 4, letterSpacing: "-0.02em",
        }}>
          Let's begin.
        </div>
      </div>

      {/* Bottom rule */}
      <div style={{
        position: "absolute", left: 56, right: 56, bottom: 200,
        height: 1, background: "var(--rule)",
      }} />

      {/* Bottom grid: 3 columns */}
      <div style={{
        position: "absolute", left: 56, right: 56, bottom: 56,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32,
        alignItems: "start",
      }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 14 }}>
            01 · The notebook
          </div>
          <p style={{ fontFamily: "var(--f-display)", fontSize: 15.5, lineHeight: 1.5, margin: 0, color: "var(--ink-2)", maxWidth: 280 }}>
            A place for your classes, the work you owe, and what you came here to learn.
          </p>
        </div>

        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 14 }}>
            02 · Sign in
          </div>
          <button style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            padding: "16px 18px", borderRadius: 0,
            border: "1px solid var(--accent)", background: "var(--accent)",
            fontSize: 14, color: "var(--bg)", textAlign: "left", fontFamily: "var(--f-ui)", fontWeight: 500,
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <GoogleG size={16} /> Continue with Google
            </span>
            <span style={{ opacity: 0.5 }}>→</span>
          </button>
          <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
            Syncs to every device.
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 14 }}>
            03 · Or fresh
          </div>
          <button style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px", borderRadius: 0,
            border: "1px solid var(--ink)", background: "transparent",
            fontSize: 14, color: "var(--ink)", textAlign: "left", fontFamily: "var(--f-ui)",
          }}>
            <span>Set up locally</span>
            <span style={{ opacity: 0.4 }}>→</span>
          </button>
          <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
            Stays on this machine.
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────── E · DIPTYCH ─────────────
   Open-book spread. Left page = literary epigraph. Right page = clean actions.
   Center gutter shadow. */
function Diptych() {
  return (
    <Stage>
      {/* Two pages */}
      <div style={{
        position: "absolute", inset: 40,
        display: "grid", gridTemplateColumns: "1fr 1fr",
        boxShadow: "0 26px 60px -22px rgba(0,0,0,0.55)",
      }}>
        {/* Left page */}
        <div style={{
          background: "var(--surface)", backgroundImage: undefined,
          padding: "70px 56px 60px 70px",
          position: "relative",
          borderRight: "1px solid var(--hairline)",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 32,
          }}>
            ¶ epigraph
          </div>

          {/* Drop cap intro */}
          <div style={{ position: "relative" }}>
            <span style={{
              float: "left", fontFamily: "var(--f-edit)", fontStyle: "italic",
              fontSize: 132, lineHeight: 0.85, color: "var(--accent)",
              marginRight: 14, marginTop: 4, marginBottom: -10,
            }}>A</span>
            <p style={{
              fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.45,
              color: "var(--ink)", margin: 0, textWrap: "pretty",
            }}>
              {" "}notebook is a quiet companion — it holds the lectures you sat
              through, the work you owe, and the small things you wanted to
              remember by Friday.
            </p>
          </div>

          <p style={{
            fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1.55,
            color: "var(--ink-2)", margin: "28px 0 0", textWrap: "pretty",
          }}>
            Sign in to carry it between devices, or open a new one and begin.
          </p>

          {/* Page rule + folio */}
          <div style={{
            position: "absolute", left: 70, right: 56, bottom: 60,
          }}>
            <div style={{ height: 1, background: "var(--rule)", marginBottom: 14 }} />
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--ink-3)",
            }}>
              <span>Welcome</span>
              <span>i</span>
            </div>
          </div>
        </div>

        {/* Center gutter shadow */}
        <div style={{
          position: "absolute", top: 40, bottom: 40, left: "50%", width: 26,
          transform: "translateX(-50%)",
          background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.45) 70%, transparent)",
          pointerEvents: "none",
        }} />

        {/* Right page */}
        <div style={{
          background: "var(--surface)", backgroundImage: undefined,
          padding: "70px 70px 60px 56px",
          position: "relative",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 32,
            display: "flex", justifyContent: "space-between",
          }}>
            <span>To begin</span>
            <span>ii</span>
          </div>

          <h2 style={{
            fontFamily: "var(--f-edit)", fontWeight: 400, fontStyle: "italic",
            fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em",
            margin: "0 0 38px", color: "var(--ink)",
          }}>
            Choose how<br/>you'd like to start.
          </h2>

          {/* Option A */}
          <button style={{
            width: "100%", textAlign: "left",
            padding: "20px 24px",
            border: "1px solid var(--accent)", background: "var(--accent)", color: "var(--bg)",
            borderRadius: 4, marginBottom: 14,
            display: "flex", alignItems: "center", gap: 16, fontFamily: "var(--f-ui)",
          }}>
            <GoogleG size={20} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Continue with Google</div>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>Syncs to every device you sign in on</div>
            </div>
            <span style={{ opacity: 0.55, fontSize: 18 }}>→</span>
          </button>

          {/* Option B */}
          <button style={{
            width: "100%", textAlign: "left",
            padding: "20px 24px",
            border: "1px solid var(--rule)", background: "transparent", color: "var(--ink)",
            borderRadius: 4,
            display: "flex", alignItems: "center", gap: 16, fontFamily: "var(--f-ui)",
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              border: "1.5px solid var(--accent)", color: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-edit)", fontStyle: "italic", fontSize: 14,
            }}>¶</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>
                <span style={{ fontFamily: "var(--f-edit)", fontStyle: "italic", color: "var(--accent)" }}>Begin</span> a fresh notebook
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>Stays on this machine — no account required</div>
            </div>
            <span style={{ opacity: 0.4, fontSize: 18 }}>→</span>
          </button>

          {/* Page rule + folio */}
          <div style={{
            position: "absolute", left: 56, right: 70, bottom: 60,
          }}>
            <div style={{ height: 1, background: "var(--rule)", marginBottom: 14 }} />
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--ink-3)",
            }}>
              <span>your notebook</span>
              <span>MMXXVI</span>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}

Object.assign(window, { Original, Editorial, CoverPage, LibraryCard, Brutalist, Diptych });
