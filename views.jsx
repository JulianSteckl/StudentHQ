// Additional views for the real app — quizzes index, take-quiz, schedule, grades, flashcards

// ─────────────── Shared utility

function Field({ label, children }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// ─────────────── Subject picker modal

const MODE_LABELS = {
  flashcard: "Flashcards", mcq: "Multiple choice", type: "Type the answer",
  truefalse: "True / False", keyconcepts: "Key Concepts", written: "Written recall",
};

function SubjectPickerModal({ mode, onPick, onClose }) {
  const store = useNbStore();
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12,
        boxShadow: "0 16px 48px rgba(0,0,0,0.3)", width: 420, maxHeight: "72vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--hairline)" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{MODE_LABELS[mode]}</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 20, marginTop: 2 }}>Pick a subject to study</div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {SUBJECTS.map(s => {
            const noteCount = (store.notesFor(s.id) || []).length + (notesForSubject(s.id) || []).length;
            return (
              <div key={s.id} onClick={() => onPick("subject-" + s.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                  border: "1px solid var(--hairline)", borderRadius: 7, cursor: "pointer",
                  background: "var(--bg-2)", opacity: noteCount === 0 ? 0.5 : 1 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                    {noteCount > 0 ? `${noteCount} note${noteCount !== 1 ? "s" : ""} · study from topics` : "No notes yet — add notes first"}
                  </div>
                </div>
                <span style={{ color: "var(--ink-3)" }}>{Ico.arrow}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--hairline)" }}>
          <button className="sn-btn ghost" onClick={onClose} style={{ width: "100%", justifyContent: "center" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────── Quizzes index

function deckForSubject(subjectId) {
  return Object.keys(DECKS).find(id => DECKS[id] && DECKS[id].subject === subjectId) || null;
}

function quizReadinessColor(c) {
  if (c >= 0.7) return "var(--done)";
  if (c >= 0.5) return "var(--ochre)";
  return "var(--danger)";
}
function quizReadinessLabel(c) {
  if (c >= 0.7) return "Solid";
  if (c >= 0.5) return "OK";
  return "Weak";
}
function quizReadinessBg(c) {
  if (c >= 0.7) return "rgba(107,142,90,0.12)";
  if (c >= 0.5) return "rgba(255,255,255,0.07)";
  return "rgba(255,255,255,0.07)";
}
function quizUrgency(when) {
  const w = (when || "").toLowerCase();
  if (w === "today" || w === "tonight") return { label: "Today", color: "var(--danger)" };
  if (w === "tomorrow")                 return { label: "Tomorrow", color: "var(--accent)" };
  if (w === "thursday")                 return { label: "2 days", color: "var(--accent)" };
  if (w === "friday")                   return { label: "3 days", color: "var(--ochre)" };
  if (w.includes("next"))               return { label: "Next week", color: "var(--ink-3)" };
  return { label: when || "TBD", color: "var(--ink-3)" };
}

const QUIZ_AI_RECS = {
  "q1": { mode: "Flashcards",     reason: "Low confidence — multiple quick passes needed", weakTopic: "Electron transport chain" },
  "q2": { mode: "Type the answer",reason: "Conjugation gaps — active recall helps most",   weakTopic: "Irregular preterite stems" },
  "q3": { mode: "Written recall", reason: "Strong base — solidify with free-recall",        weakTopic: "Double-angle formulas" },
};

const QUIZ_STUDY_MODES = [
  { mode: "flashcard",   icon: Ico.cards, label: "Flashcards",      desc: "Flip · spaced repetition",    accent: "#cccccc", bg: "rgba(255,255,255,0.05)",  glyph: "↻" },
  { mode: "mcq",         icon: Ico.quiz,  label: "Multiple choice", desc: "Auto-generated from any deck", accent: "#5a7a99", bg: "rgba(90,122,153,0.07)",  glyph: "?" },
  { mode: "type",        icon: "Aa",      label: "Type the answer", desc: "Type the definition",          accent: "#7a4e6e", bg: "rgba(122,78,110,0.07)",  glyph: "Aa" },
  { mode: "truefalse",   icon: "T/F",     label: "True / False",    desc: "Is this definition correct?",  accent: "#6b8e5a", bg: "rgba(107,142,90,0.07)",  glyph: "✓" },
  { mode: "keyconcepts", icon: Ico.note,  label: "Key Concepts",    desc: "Study reference sheet",        accent: "#5b5346", bg: "rgba(91,83,70,0.06)",    glyph: "§" },
  { mode: "written",     icon: Ico.book,  label: "Written recall",  desc: "Free-write what you know",     accent: "#aaaaaa", bg: "rgba(255,255,255,0.05)",  glyph: "✍" },
];

function QuizzesContent({ onTakeQuiz }) {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [picker, setPicker] = React.useState(null);

  React.useEffect(() => {
    const on = () => forceUpdate();
    window.addEventListener("nbStoreChange", on);
    return () => window.removeEventListener("nbStoreChange", on);
  }, []);

  const userQuizzes = nbGetQuizzes();
  const hasSampleData = QUIZZES_UPCOMING.length > 0;
  const past = hasSampleData ? [
    { id: "p1", subject: "alg2",      title: "Trig Identities",       score: 8,  total: 10, when: "Last week" },
    { id: "p2", subject: "ap-bio",    title: "Photosynthesis",         score: 17, total: 20, when: "2 weeks ago" },
    { id: "p3", subject: "us-hist",   title: "Constitutional Conv.",   score: 14, total: 20, when: "Apr 28" },
    { id: "p4", subject: "spanish-3", title: "Vocab U5",               score: 13, total: 15, when: "Apr 22" },
  ] : [];

  const allUpcoming = [...QUIZZES_UPCOMING, ...userQuizzes];
  const totalUpcoming = allUpcoming.length;

  const avgScore = past.length > 0
    ? Math.round(past.reduce((a, p) => a + p.score / p.total, 0) / past.length * 100)
    : null;
  const avgReadiness = allUpcoming.length > 0
    ? Math.round(allUpcoming.reduce((a, q) => a + (q.confidence || 0), 0) / allUpcoming.length * 100)
    : null;

  const subjectScoreMap = {};
  past.forEach(p => { if (!subjectScoreMap[p.subject]) subjectScoreMap[p.subject] = []; subjectScoreMap[p.subject].push(p.score / p.total); });
  let bestSubject = null, bestAvg = 0;
  Object.entries(subjectScoreMap).forEach(([id, scores]) => {
    const avg = scores.reduce((a, x) => a + x, 0) / scores.length;
    if (avg > bestAvg) { bestAvg = avg; bestSubject = subjectBy(id); }
  });

  const launchMode = (mode, deckId) => onTakeQuiz(mode, deckId);
  const openPicker  = (mode) => setPicker(mode);

  return (
    <>
      {picker && (
        <SubjectPickerModal
          mode={picker}
          onPick={(deckId) => { setPicker(null); launchMode(picker, deckId); }}
          onClose={() => setPicker(null)}
        />
      )}

      {/* ── PAGE HEADER ── */}
      <div className="pg-header" style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>
          Study &amp; Practice · This Week
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 400, margin: 0, lineHeight: 1.05, letterSpacing: "-0.015em" }}>
            Study &amp; <em style={{ fontStyle: "italic", color: "var(--accent)" }}>practice.</em>
          </h1>
          <button className="sn-btn primary"
            onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "quiz" } }))}>
            + Add quiz day
          </button>
        </div>
        <div className="sn-ornament" style={{ margin: "10px 0 6px" }} />
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>
          {totalUpcoming > 0
            ? `${totalUpcoming} upcoming · ${past.length} taken this term · pick a mode and a deck`
            : "Practice anytime · all subjects"}
        </div>
      </div>

      {/* ── HERO STATS BAR ── */}
      <div className="pg-section" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28, animationDelay: "0.15s" }}>
        {[
          { label: "Quizzes This Week", numVal: totalUpcoming,  suffix: "",  sub: "upcoming",       isNum: true },
          { label: "Avg Score",   numVal: avgScore,   suffix: "%", textFallback: "—", sub: "last 4 results",  isNum: true,  accent: avgScore != null ? (avgScore >= 80 ? "var(--done)" : avgScore >= 65 ? "var(--accent)" : "var(--danger)") : null },
          { label: "Best Subject", numVal: null, textVal: bestSubject ? bestSubject.short : "—", sub: bestSubject ? Math.round(bestAvg * 100) + "% avg" : "no data", isNum: false, dot: bestSubject ? bestSubject.color : null },
          { label: "Readiness",   numVal: avgReadiness, suffix: "%", textFallback: "—", sub: "across upcoming", isNum: true,  accent: avgReadiness != null ? quizReadinessColor(avgReadiness / 100) : null },
        ].map((m, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius)",
            padding: "13px 14px",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--rule)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(30,20,8,0.09)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--hairline)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7 }}>{m.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {m.dot && <div style={{ width: 8, height: 8, borderRadius: 1, background: m.dot, flexShrink: 0 }} />}
              <div style={{ fontFamily: m.isNum ? "var(--f-display)" : "var(--f-mono)", fontSize: m.isNum ? 26 : 18, fontWeight: 400, lineHeight: 1, color: m.accent || "var(--ink)", letterSpacing: m.isNum ? "-0.02em" : 0 }}>
                {m.numVal != null
                  ? <StatNumber value={m.numVal} suffix={m.suffix} delay={300 + i * 120} duration={1400} />
                  : (m.textVal || m.textFallback || "—")}
              </div>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 6 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TWO-COLUMN LAYOUT: main + sidebar ── */}
      <div className="pg-section" style={{ display: "grid", gridTemplateColumns: "1fr 268px", gap: 22, alignItems: "start", animationDelay: "0.25s" }}>

        {/* ── LEFT MAIN ── */}
        <div>

          {/* Upcoming quizzes */}
          {allUpcoming.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
                Upcoming · {allUpcoming.length} quiz{allUpcoming.length !== 1 ? "zes" : ""}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
                {allUpcoming.map((q, idx) => {
                  const s = subjectBy(q.subject) || SUBJECTS[0];
                  const deckId = deckForSubject(q.subject);
                  const urgency = quizUrgency(q.when || q.dateStr);
                  const conf = q.confidence;
                  const rColor = conf != null ? quizReadinessColor(conf) : "var(--ink-3)";
                  const rLabel = conf != null ? quizReadinessLabel(conf) : null;
                  const rBg    = conf != null ? quizReadinessBg(conf)    : "transparent";
                  return (
                    <div key={q.id} className="sn-card"
                      style={{ borderLeft: `3px solid ${s.color}`, cursor: "pointer", display: "flex", flexDirection: "column" }}
                      onClick={() => window.location.hash = "#/quiz-detail/" + q.id}>

                      {/* Top: subject + urgency */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 1, background: s.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.short}</span>
                        </div>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: urgency.color, fontWeight: 600 }}>{urgency.label}</span>
                      </div>

                      {/* Title */}
                      <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 19, lineHeight: 1.25, marginBottom: 14 }}>{q.title}</div>

                      {/* Readiness indicator */}
                      {conf != null && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", borderRadius: 5, background: rBg, flexShrink: 0 }}>
                            <span style={{ fontFamily: "var(--f-display)", fontSize: 20, fontWeight: 700, lineHeight: 1, color: rColor }}>{Math.round(conf * 100)}%</span>
                            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: rColor, lineHeight: 1.3 }}>{rLabel}<br/>ready</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ height: 5, background: "var(--bg-2)", borderRadius: 3, overflow: "hidden" }}>
                              <div className="sn-bar-fill" style={{ height: "100%", width: (conf * 100) + "%", background: rColor, borderRadius: 3 }} />
                            </div>
                            {q.length && <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginTop: 4 }}>{q.length}</div>}
                          </div>
                        </div>
                      )}

                      {/* CTAs */}
                      <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                        <button className="sn-btn primary"
                          onClick={e => { e.stopPropagation(); launchMode("flashcard", deckId || "subject-" + q.subject); }}
                          style={{ flex: 1, justifyContent: "center", fontSize: 12.5 }}>
                          Study now →
                        </button>
                        <button className="sn-btn" title="Multiple choice"
                          onClick={e => { e.stopPropagation(); launchMode("mcq", "subject-" + q.subject); }}
                          style={{ padding: "7px 10px" }}>{Ico.quiz}</button>
                        <button className="sn-btn" title="View detail"
                          onClick={e => { e.stopPropagation(); window.location.hash = "#/quiz-detail/" + q.id; }}
                          style={{ padding: "7px 10px" }}>{Ico.arrow}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Study modes — differentiated grid */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Study modes</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {QUIZ_STUDY_MODES.map(({ mode, icon, label, desc, accent, bg, glyph }) => (
                <div key={mode} onClick={() => openPicker(mode)}
                  style={{ padding: "18px 16px 14px", background: bg, border: "1px solid " + accent + "30",
                    borderRadius: 8, cursor: "pointer", position: "relative", overflow: "hidden",
                    transition: "border-color 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent + "70"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(30,20,8,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = accent + "30"; e.currentTarget.style.boxShadow = "none"; }}>
                  {/* Watermark glyph */}
                  <div style={{ position: "absolute", right: 8, bottom: -8, fontFamily: "var(--f-display)", fontSize: 54, color: accent, opacity: 0.1, pointerEvents: "none", lineHeight: 1, fontStyle: "italic", userSelect: "none" }}>
                    {glyph}
                  </div>
                  <div style={{ fontSize: 15, color: accent, marginBottom: 10, fontFamily: "var(--f-mono)", fontWeight: 700 }}>{icon}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}>{label}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginBottom: 10 }}>{desc}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
                    Start {Ico.arrow}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past results — performance panel */}
          {past.length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Past results</div>
              <div className="sn-card" style={{ padding: 0 }}>
                {past.map((p, i) => {
                  const s = subjectBy(p.subject);
                  const pct = p.score / p.total;
                  const pColor = pct >= 0.8 ? "var(--done)" : pct >= 0.65 ? "var(--accent)" : "var(--danger)";
                  return (
                    <div key={p.id} onClick={() => openPicker("mcq")}
                      style={{ display: "grid", gridTemplateColumns: "4px 1fr auto", alignItems: "center", gap: 14,
                        padding: "14px 18px", borderBottom: i < past.length - 1 ? "1px dashed var(--hairline)" : "none",
                        cursor: "pointer", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 4, alignSelf: "stretch", minHeight: 32, borderRadius: 2, background: s.color }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{p.title}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginBottom: 8 }}>
                          {s.short.toUpperCase()} · {p.when}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 110, height: 4, background: "var(--bg-2)", borderRadius: 2, overflow: "hidden" }}>
                            <div className="sn-bar-fill" style={{ height: "100%", width: (pct * 100) + "%", background: pColor, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{Math.round(pct * 100)}%</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 24, color: pColor, lineHeight: 1 }}>
                          {p.score}<span style={{ color: "var(--ink-3)", fontSize: 15 }}>/{p.total}</span>
                        </div>
                        <span style={{ color: "var(--ink-3)" }}>{Ico.arrow}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>{/* end left */}

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* AI study recommendations */}
          {allUpcoming.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ padding: "13px 16px 11px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ color: "var(--accent)", fontSize: 11, opacity: 0.8 }}>✦</span>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>AI Study Guide</div>
              </div>
              {allUpcoming.map((q, i) => {
                const s = subjectBy(q.subject) || SUBJECTS[0];
                const deckId = deckForSubject(q.subject);
                const rec = QUIZ_AI_RECS[q.id] || { mode: "Flashcards", reason: "Review all topics before the test.", weakTopic: null };
                return (
                  <div key={q.id} style={{ padding: "14px 16px", borderBottom: i < allUpcoming.length - 1 ? "1px dashed var(--hairline)" : "none" }}>
                    {/* Quiz label */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 3, alignSelf: "stretch", minHeight: 24, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, color: "var(--ink)" }}>{q.title}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginTop: 2 }}>{s.short} · {q.when || "TBD"}</div>
                      </div>
                    </div>
                    {/* Recommended mode */}
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 5 }}>Recommended</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 4, background: "var(--accent-soft)", marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--accent-ink)", fontWeight: 600 }}>{rec.mode}</span>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", lineHeight: 1.5, marginBottom: rec.weakTopic ? 8 : 10 }}>{rec.reason}</div>
                    {/* Weak topic callout */}
                    {rec.weakTopic && (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "7px 9px", borderRadius: 5, background: "rgba(255,255,255,0.06)", marginBottom: 10 }}>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--danger)", flexShrink: 0 }}>Weak</span>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-2)", lineHeight: 1.4 }}>{rec.weakTopic}</span>
                      </div>
                    )}
                    {/* Quick launch */}
                    <button className="sn-btn" style={{ fontSize: 11.5, width: "100%", justifyContent: "center" }}
                      onClick={() => launchMode("flashcard", deckId || "subject-" + q.subject)}>
                      Study {s.short} now →
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Score trend panel */}
          {past.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 14 }}>Score Trend</div>
              {past.map((p, i) => {
                const s = subjectBy(p.subject);
                const pct = p.score / p.total;
                const pColor = pct >= 0.8 ? "var(--done)" : pct >= 0.65 ? "var(--accent)" : "var(--danger)";
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < past.length - 1 ? 9 : 0 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", width: 38, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.short}</div>
                    <div style={{ flex: 1, height: 5, background: "var(--bg-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div className="sn-bar-fill" style={{ height: "100%", width: (pct * 100) + "%", background: pColor, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: pColor, width: 30, textAlign: "right", flexShrink: 0 }}>{Math.round(pct * 100)}%</div>
                  </div>
                );
              })}
            </div>
          )}

        </div>{/* end sidebar */}

      </div>{/* end two-col */}
    </>
  );
}

function PracticeCard({ icon, title, subtitle, accent, onClick }) {
  return (
    <div onClick={onClick} className="sn-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 8, background: accent, color: "white", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18 }}>
        {typeof icon === "string" ? icon : icon}
      </div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 12 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{subtitle}</div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
        START <span>{Ico.arrow}</span>
      </div>
    </div>
  );
}

// ─────────────── Take-a-quiz wrapper with "back" affordance

function TakeQuiz({ type, deckId, onExit }) {
  const Component = type === "flashcard"   ? FlashcardQuiz
                  : type === "mcq"         ? MCQQuiz
                  : type === "type"        ? TypeAnswerQuiz
                  : type === "truefalse"   ? TrueFalseQuiz
                  : type === "keyconcepts" ? KeyConceptsStudy
                  : type === "written"     ? WrittenRecallQuiz
                  : type === "result"      ? QuizResult
                  : FlashcardQuiz;
  return <Component deckId={deckId} onExit={onExit} />;
}

// ─────────────── AI Study Plan panel

function AIStudyPlan() {
  const [open, setOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState("");
  const [error, setError] = React.useState("");

  const generate = async () => {
    setLoading(true); setError(""); setPlan("");
    const openHW = [...HOMEWORK, ...nbGetHomework()].filter((h) => !h.done);
    const now = new Date();
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = dayNames[now.getDay()];
    const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

    const hwList = openHW.map((h) => {
      const s = subjectBy(h.subject);
      return `- ${s.short}: "${h.title}" — due ${h.due}, est. ${h.est}${h.urgent ? " [URGENT]" : ""}`;
    }).join("\n") || "No open homework.";

    const quizList = QUIZZES_UPCOMING.map((q) => {
      const s = subjectBy(q.subject);
      return `- ${s.short}: "${q.title}" on ${q.when} (confidence ${Math.round(q.confidence * 100)}%)`;
    }).join("\n") || "No upcoming quizzes.";

    const prompt = `You are a study coach for a high school student. Today is ${dateStr}.

Open homework:
${hwList}

Upcoming quizzes:
${quizList}

Create a realistic day-by-day study plan for the rest of this week. For each day (starting with today, ${today}), suggest what to work on and when (afternoon/evening). Be specific about which assignments to tackle each day and in what order. Keep it concise — one line per task. Format as:

**Today (${today})**
- Task · time estimate

**Tomorrow**
- Task · time estimate

...and so on. Max 5 days. End with one motivating sentence.`;

    try {
      const text = await aiComplete(prompt);
      setPlan(text || "(no response)");
    } catch(e) {
      if (e.message === "no-key") {
        setError("__no-key__");
      } else if (e.message === "invalid-key") {
        setError("Invalid API key — update it via the ✦ Connect AI button.");
      } else {
        setError("Couldn't generate plan right now. Try again in a moment.");
      }
    } finally { setLoading(false); }
  };

  React.useEffect(() => { if (open && !plan && !loading) generate(); }, [open]);

  return (
    <div className="sn-card" style={{ marginBottom: 16, borderLeft: "3px solid var(--accent)", padding: "10px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="sn-card-title" style={{ marginBottom: 2 }}>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", marginRight: 6 }}>✦</span>
            <span>AI Study Plan</span>
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>
            Adapts to your homework, quizzes, and due dates
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {open && <button className="sn-btn ghost" onClick={generate} style={{ fontSize: 11 }}>↻ Regenerate</button>}
          <button className="sn-btn" style={{ background: open ? "var(--bg-2)" : "var(--accent)", color: open ? "var(--ink)" : "white", borderColor: "var(--accent)" }}
            onClick={() => setOpen(v => !v)}>
            {open ? "Hide plan" : "Generate my plan →"}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 10, borderTop: "1px solid var(--hairline)", paddingTop: 10 }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-3)", fontFamily: "var(--f-display)", fontStyle: "italic" }}>
              <div className="ai-dots"><span></span><span></span><span></span></div>
              <style>{`.ai-dots{display:flex;gap:5px}.ai-dots span{width:5px;height:5px;border-radius:50%;background:var(--accent);animation:dot-pulse .9s ease infinite}.ai-dots span:nth-child(2){animation-delay:.15s}.ai-dots span:nth-child(3){animation-delay:.3s}@keyframes dot-pulse{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1.1)}}`}</style>
              Building your plan…
            </div>
          )}
          {error && error !== "__no-key__" && <div style={{ color: "var(--accent)", fontSize: 13 }}>{error}</div>}
          {error === "__no-key__" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 12, marginBottom: 2 }}>
                Log homework and quiz dates to generate your personalized plan.
              </div>
              {[
                { day: "Monday", task: "AP Lit: finish reading chapters 9–12 · 45m" },
                { day: "Tuesday", task: "Alg II: complete problem set 7.3 · 30m" },
                { day: "Wednesday", task: "Bio: draft enzyme kinetics lab report · 1h 30m" },
              ].map(({ day, task }) => (
                <div key={day} style={{ opacity: 0.42 }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 13, fontWeight: 600, marginBottom: 2, color: "var(--ink-2)" }}>{day}</div>
                  <div style={{ display: "flex", gap: 8, paddingLeft: 4 }}>
                    <span style={{ color: "var(--accent)" }}>•</span>
                    <span style={{ fontStyle: "italic", color: "var(--ink-2)", fontSize: 12.5 }}>{task}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {plan && (
            <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)" }}>
              {plan.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**"))
                  return <div key={i} style={{ fontFamily: "var(--f-display)", fontSize: 16, fontWeight: 600, marginTop: i > 0 ? 14 : 0, marginBottom: 4 }}>{line.replace(/\*\*/g, "")}</div>;
                if (line.startsWith("- "))
                  return <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 4 }}><span style={{ color: "var(--accent)" }}>•</span>{line.slice(2)}</div>;
                if (line.trim() === "") return <div key={i} style={{ height: 4 }} />;
                return <div key={i} style={{ fontStyle: "italic", color: "var(--ink-2)", marginTop: 10 }}>{line}</div>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────── Pomodoro Focus Timer

function PomodoroTimer() {
  const WORK_MINS = 25;
  const BREAK_MINS = 5;
  const [phase, setPhase] = React.useState("work");
  const [secondsLeft, setSecondsLeft] = React.useState(WORK_MINS * 60);
  const [running, setRunning] = React.useState(false);
  const [sessions, setSessions] = React.useState(0);
  const intervalRef = React.useRef(null);

  const totalSecs = phase === "work" ? WORK_MINS * 60 : BREAK_MINS * 60;
  const pct = secondsLeft / totalSecs;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (phase === "work") {
              setSessions((n) => n + 1);
              setPhase("break");
              setSecondsLeft(BREAK_MINS * 60);
              window.dispatchEvent(new CustomEvent("toast", { detail: "Pomodoro done — take a 5-minute break! 🎉" }));
            } else {
              setPhase("work");
              setSecondsLeft(WORK_MINS * 60);
              window.dispatchEvent(new CustomEvent("toast", { detail: "Break over — back to it! 💪" }));
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, phase]);

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSecondsLeft(phase === "work" ? WORK_MINS * 60 : BREAK_MINS * 60);
  };

  const skipPhase = () => {
    const next = phase === "work" ? "break" : "work";
    setPhase(next);
    setSecondsLeft(next === "work" ? WORK_MINS * 60 : BREAK_MINS * 60);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const r = 36; const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const accentColor = phase === "work" ? "var(--accent)" : "#27ae60";

  return (
    <div className="sn-card" style={{ display: "flex", gap: 24, alignItems: "center", padding: "18px 24px", marginTop: 20 }}>
      {/* Ring progress */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={44} cy={44} r={r} fill="none" stroke="var(--hairline)" strokeWidth={5} />
          <circle cx={44} cy={44} r={r} fill="none"
            stroke={accentColor}
            strokeWidth={5}
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: running ? "stroke-dashoffset 0.95s linear" : "none" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          fontFamily: "var(--f-mono)", fontSize: 16, fontWeight: 600, letterSpacing: "0.03em",
          color: running ? accentColor : "var(--ink)",
        }}>
          {display}
        </div>
      </div>

      {/* Label + controls */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 18, marginBottom: 2 }}>
          {phase === "work" ? "Focus session" : "Short break"}
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          {phase === "work" ? "25-minute Pomodoro" : "5-minute break"} · {sessions} session{sessions !== 1 ? "s" : ""} completed
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="sn-btn" onClick={() => setRunning((v) => !v)}
            style={{ background: running ? "var(--bg-2)" : accentColor, color: running ? "var(--ink)" : "white", borderColor: accentColor, minWidth: 86, fontSize: 12.5 }}>
            {running ? "⏸ Pause" : (secondsLeft === totalSecs ? "▶ Start" : "▶ Resume")}
          </button>
          <button className="sn-btn ghost" onClick={reset} style={{ fontSize: 12 }}>↺ Reset</button>
          <button className="sn-btn ghost" onClick={skipPhase} style={{ fontSize: 12 }}>
            {phase === "work" ? "→ Break" : "→ Work"}
          </button>
        </div>
      </div>

      {/* Session dots */}
      {sessions > 0 && (
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Sessions</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 72, justifyContent: "center" }}>
            {Array.from({ length: Math.min(sessions, 12) }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: accentColor, opacity: 0.85 }} />
            ))}
          </div>
          {sessions > 12 && <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 4 }}>+{sessions-12} more</div>}
        </div>
      )}
    </div>
  );
}

// ─────────────── Schedule view (full week)

function ScheduleContent() {
  const store = useNbStore();
  const [weekOffset, setWeekOffset] = React.useState(0);

  const now = new Date();
  const isCurrentWeek = weekOffset === 0;

  const viewMonday = new Date(now);
  viewMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
  viewMonday.setHours(0, 0, 0, 0);

  const colDates = [0,1,2,3,4].map(off => {
    const d = new Date(viewMonday); d.setDate(viewMonday.getDate() + off); return d;
  });

  const todayDayIndex = isCurrentWeek ? ((now.getDay() + 6) % 7) : -1;
  const weekRange = colDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })
    + " – " + colDates[4].toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const termInfo = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null");
      const month = viewMonday.getMonth();
      const term = month >= 7 ? "Fall" : "Spring";
      const wk = p && p.yearStart ? Math.min(Math.ceil((viewMonday - new Date(p.yearStart.year, p.yearStart.month, 1)) / 604800000), 36) : "—";
      const label = weekOffset === 0 ? "this week" : weekOffset < 0 ? Math.abs(weekOffset) + " week" + (Math.abs(weekOffset) > 1 ? "s" : "") + " ago" : weekOffset + " week" + (weekOffset > 1 ? "s" : "") + " ahead";
      return term + " · week " + wk + " · " + label;
    } catch { return weekOffset === 0 ? "This week" : weekOffset < 0 ? "Previous week" : "Next week"; }
  })();

  const allHW      = React.useMemo(() => [...HOMEWORK, ...store.homework], [store.homework]);
  const allQuizzes = React.useMemo(() => [...QUIZZES_UPCOMING, ...nbGetQuizzes()], [store.homework]);

  const dayItems = colDates.map(colDate => {
    const hw = allHW.filter(h => {
      if (h.done) return false;
      const d = dueStringToDate(h.due, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    const quizzes = allQuizzes.filter(q => {
      const d = dueStringToDate(q.when || q.dateStr, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    return { hw, quizzes };
  });

  // ── Workload analytics ────────────────────────────────────────────────────────
  const parseEst = est => {
    if (!est) return 0;
    const h = est.match(/(\d+)h/), m = est.match(/(\d+)m/);
    return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
  };

  const workloadScore = ({ hw, quizzes }) =>
    hw.reduce((s, h) => s + 1 + (h.urgent ? 1 : 0), 0) + quizzes.length * 2;

  const scores = dayItems.map(workloadScore);
  const maxScore = Math.max(...scores, 1);

  const allWeekHW      = dayItems.flatMap(d => d.hw);
  const allWeekQuizzes = dayItems.flatMap(d => d.quizzes);
  const urgentCount    = allWeekHW.filter(h => h.urgent).length;
  const totalMins      = allWeekHW.reduce((s, h) => s + parseEst(h.est), 0);
  const timeStr = totalMins === 0 ? "—" : totalMins >= 60
    ? Math.floor(totalMins / 60) + "h" + (totalMins % 60 > 0 ? " " + (totalMins % 60) + "m" : "")
    : totalMins + "m";

  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // workload bar color
  const heatColor = (score, mx) => {
    if (score === 0) return "var(--hairline)";
    const p = score / mx;
    return p > 0.65 ? "var(--danger)" : p > 0.35 ? "var(--ochre)" : "var(--info)";
  };

  // Day-level urgency border color — past days always neutral
  const dayBorderColor = ({ hw, quizzes }, isToday, isPast) => {
    if (isPast) return "var(--hairline)";
    if (isToday) return "var(--accent)";
    if (hw.some(h => h.urgent)) return "var(--danger)";
    if (quizzes.length > 0) return "var(--ochre)";
    if (hw.length > 0) return "var(--info)";
    return "var(--hairline)";
  };

  // Smart empty-day hint
  const emptyHint = (i, colDate) => {
    if (!isCurrentWeek) return { main: "No items", sub: null };
    const past = colDate < now && i !== todayDayIndex;
    if (past) return { main: "nothing-scheduled-past", sub: null };
    // look for upcoming quiz in the next 2 days
    for (let d = 1; d <= 2; d++) {
      const target = colDates[i + d];
      if (target && dayItems[i + d] && dayItems[i + d].quizzes.length > 0) {
        const q = dayItems[i + d].quizzes[0];
        const s = subjectBy(q.subject);
        return { main: "Light day", sub: "Quiz " + DAY_NAMES[i + d] + " — review " + s.short };
      }
    }
    const nextBusy = scores.slice(i + 1).findIndex(sc => sc > 0);
    if (nextBusy !== -1 && nextBusy <= 1) {
      return { main: "Light day", sub: "Prep ahead for " + DAY_NAMES[i + 1 + nextBusy] };
    }
    return { main: "Free", sub: "Good time to review notes" };
  };

  // ── Sub-components ────────────────────────────────────────────────────────────

  function WorkloadHeatmap() {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, marginBottom: 16, overflow: "hidden" }}>
        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
          {[
            { label: "Tasks due",     value: allWeekHW.length === 0 ? "—" : String(allWeekHW.length),      alert: false },
            { label: "Quizzes",       value: allWeekQuizzes.length === 0 ? "—" : String(allWeekQuizzes.length), alert: false },
            { label: "Est. study",    value: timeStr,                       alert: false },
            { label: "Urgent",        value: urgentCount === 0 ? "—" : String(urgentCount),            alert: urgentCount > 0 },
          ].map((st, idx, arr) => (
            <div key={st.label} style={{
              flex: 1, padding: "12px 16px",
              borderRight: idx < arr.length - 1 ? "1px solid var(--hairline)" : "none",
            }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, lineHeight: 1,
                color: st.alert ? "var(--danger)" : "var(--ink)" }}>{st.value}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)",
                textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{st.label}</div>
            </div>
          ))}
          <div style={{ flex: 2, padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 8 }}>Workload distribution</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
              {scores.map((sc, i) => {
                const isToday = i === todayDayIndex;
                const col = heatColor(sc, maxScore);
                const pct = maxScore > 0 ? Math.max(sc / maxScore * 100, sc > 0 ? 10 : 0) : 0;
                return (
                  <div key={i}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5,
                      color: isToday ? "var(--accent)" : "var(--ink-3)",
                      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      {DAY_NAMES[i]}{isToday ? " ·" : ""}
                    </div>
                    <div style={{ height: 5, background: "var(--hairline)", borderRadius: 2 }}>
                      <div style={{ height: 5, width: pct + "%", background: col, borderRadius: 2,
                        transition: "width 0.4s ease" }} />
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, color: "var(--ink-3)", marginTop: 3 }}>
                      {sc === 0 ? "free" : sc + " item" + (sc !== 1 ? "s" : "")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Past-day items: items that WERE due on a past day (including done ones)
  const pastDayItems = colDates.map(colDate => {
    const hw = allHW.filter(h => {
      const d = dueStringToDate(h.due, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    const quizzes = allQuizzes.filter(q => {
      const d = dueStringToDate(q.when || q.dateStr, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    return { hw, quizzes };
  });

  function DayCard({ colDate, i }) {
    const { hw, quizzes } = dayItems[i];
    const isToday = i === todayDayIndex;
    const isPast  = !isToday && colDate < now && isCurrentWeek;
    const hasItems = hw.length > 0 || quizzes.length > 0;
    const sc = scores[i];
    const border = dayBorderColor({ hw, quizzes }, isToday, isPast);
    const sortedHW = [...hw].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
    const daysAway = !isToday && isCurrentWeek && colDate > now
      ? Math.round((colDate - now) / 86400000) : null;
    const hint = !hasItems ? emptyHint(i, colDate) : null;

    // Past-day completion summary (all items that were due, including done)
    const pastSummary = isPast ? pastDayItems[i] : null;
    const pastHasItems = pastSummary && (pastSummary.hw.length > 0 || pastSummary.quizzes.length > 0);

    return (
      <div className="sn-card" style={{
        padding: "13px 14px",
        borderLeft: "3px solid " + border,
        opacity: isPast ? 0.52 : 1,
        minHeight: 120,
        transition: "opacity 0.2s",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: hasItems || (isPast && pastHasItems) ? 8 : 10 }}>
          <div>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1 }}>{DAY_NAMES[i]}</span>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 13, color: "var(--ink-3)", marginLeft: 5 }}>{colDate.getDate()}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
            {isToday && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--accent)",
                textTransform: "uppercase", letterSpacing: "0.1em" }}>today</span>
            )}
            {isPast && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>done</span>
            )}
            {!isToday && !isPast && hw.some(h => h.urgent) && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--danger)",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>urgent</span>
            )}
            {!isPast && quizzes.length > 0 && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ochre)",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>quiz</span>
            )}
            {daysAway && !hw.some(h=>h.urgent) && quizzes.length === 0 && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)" }}>{daysAway}d</span>
            )}
          </div>
        </div>

        {/* Workload intensity bar — only for non-past days with items */}
        {hasItems && !isPast && (
          <div style={{ display: "flex", gap: 3, marginBottom: 9 }}>
            {[1,2,3,4,5].map(n => {
              const filled = n <= Math.max(1, Math.ceil(sc / maxScore * 5));
              return (
                <div key={n} style={{ flex: 1, height: 3, borderRadius: 1,
                  background: filled ? border : "var(--hairline)",
                  transition: "background 0.2s" }} />
              );
            })}
          </div>
        )}

        {/* Content */}
        {isPast ? (
          // Past day: show completion summary
          pastHasItems ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {pastSummary.hw.map(h => {
                const s = subjectBy(h.subject);
                return (
                  <div key={h.id} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 2, flexShrink: 0 }}>✓</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        color: "var(--ink-3)", textDecoration: "line-through" }}>{h.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", opacity: 0.7, marginTop: 1 }}>{s.short}</div>
                    </div>
                  </div>
                );
              })}
              {pastSummary.quizzes.map(q => {
                const s = subjectBy(q.subject);
                return (
                  <div key={q.id} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 2, flexShrink: 0 }}>✓</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        color: "var(--ink-3)", textDecoration: "line-through" }}>{q.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", opacity: 0.7, marginTop: 1 }}>{s.short} · quiz</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 12.5 }}>Nothing scheduled</div>
          )
        ) : !hasItems ? (
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 12.5 }}>{hint.main}</div>
            {hint.sub && (
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4 }}>{hint.sub}</div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {sortedHW.map(h => {
              const s = subjectBy(h.subject);
              return (
                <div key={h.id} onClick={() => window.location.hash = "#/homework/" + h.id}
                  style={{ display: "flex", gap: 7, alignItems: "flex-start", cursor: "pointer" }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: 1.5, flexShrink: 0, marginTop: 4,
                    background: h.urgent ? "var(--danger)" : s.color,
                    boxShadow: h.urgent ? "0 0 0 2px var(--danger)22" : "none",
                  }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      color: h.urgent ? "var(--ink)" : "var(--ink)", fontWeight: h.urgent ? 600 : 400 }}>{h.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: h.urgent ? "var(--danger)" : "var(--ink-3)", marginTop: 1 }}>
                      {s.short}{h.est ? " · " + h.est : ""}{h.urgent ? " · urgent" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
            {quizzes.map(q => {
              const s = subjectBy(q.subject);
              return (
                <div key={q.id} onClick={() => window.location.hash = "#/quiz-detail/" + q.id}
                  style={{ display: "flex", gap: 7, alignItems: "flex-start", cursor: "pointer" }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: 1.5, flexShrink: 0, marginTop: 4,
                    background: s.color, outline: "1px dashed " + s.color, outlineOffset: 2,
                  }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--accent)", marginTop: 1 }}>
                      {s.short} · quiz{q.confidence ? " · " + Math.round(q.confidence * 100) + "% ready" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader eyebrow={termInfo} title="Your" italic="schedule."
        meta={weekRange + " · " + (allWeekHW.length + allWeekQuizzes.length) + " items"}
        actions={<>
          <button className="sn-btn ghost" onClick={() => setWeekOffset(w => w - 1)}>← Week</button>
          <button className="sn-btn ghost" onClick={() => setWeekOffset(w => w + 1)}>Week →</button>
          <button className="sn-btn" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}
            style={{ opacity: weekOffset === 0 ? 0.4 : 1 }}>Today</button>
        </>}
      />

      {/* AI Study Plan — primary hero */}
      <div className="pg-section" style={{ animationDelay: "0.15s" }}><AIStudyPlan /></div>

      {/* Workload heatmap + stats */}
      <div className="pg-section" style={{ animationDelay: "0.2s" }}><WorkloadHeatmap /></div>

      {/* Week calendar — Mon–Fri */}
      <div className="pg-section" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 10, animationDelay: "0.3s" }}>
        {colDates.map((colDate, i) => <DayCard key={i} colDate={colDate} i={i} />)}
      </div>

      {/* Weekend strip — Sat + Sun as slim collapsed cards */}
      {(() => {
        const weekendDays = [5, 6].map(off => {
          const d = new Date(viewMonday);
          d.setDate(viewMonday.getDate() + off);
          return d;
        });
        const weekendLabels = ["Sat", "Sun"];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            {weekendDays.map((d, wi) => {
              const isPastWknd = isCurrentWeek && d < now;
              return (
                <div key={wi} className="sn-card" style={{
                  padding: "10px 14px",
                  borderLeft: "3px solid var(--hairline)",
                  opacity: isPastWknd ? 0.45 : 0.7,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontFamily: "var(--f-display)", fontSize: 15, lineHeight: 1, color: "var(--ink-2)" }}>{weekendLabels[wi]}</span>
                  <span style={{ fontFamily: "var(--f-display)", fontSize: 12, color: "var(--ink-3)", marginRight: "auto" }}>{d.getDate()}</span>
                  <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 11.5, color: "var(--ink-3)" }}>Free</span>
                </div>
              );
            })}
          </div>
        );
      })()}

      {allWeekHW.length === 0 && allWeekQuizzes.length === 0 && (
        <div style={{ textAlign: "center", padding: "0 0 20px",
          fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 15 }}>
          Nothing due this week — add homework or quizzes to populate the calendar.
        </div>
      )}

      {/* Pomodoro focus timer */}
      {(() => {
        const todayName = isCurrentWeek
          ? ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][(now.getDay() + 6) % 7]
          : null;
        const focusLabel = todayName
          ? "Focus · " + todayName.slice(0, 3).toUpperCase()
          : "Focus timer";
        return (
          <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 14, marginBottom: 6 }}>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase",
              letterSpacing: "0.13em" }}>{focusLabel}</div>
          </div>
        );
      })()}
      <PomodoroTimer />
    </>
  );
}

// ─────────────── Grades view

function GradesContent() {
  useNbStore();
  const [expanded, setExpanded] = React.useState(null);

  // PDF import state
  const [pdfModal, setPdfModal] = React.useState(false);
  const [pdfDragging, setPdfDragging] = React.useState(false);
  const [pdfStep, setPdfStep] = React.useState("upload"); // "upload" | "parsing" | "confirm"
  const [pdfParsed, setPdfParsed] = React.useState([]); // [{subjectName, grade, pct, term, checked}]
  const [pdfError, setPdfError] = React.useState(null);

  // GPA panel state
  const [gpaExpanded, setGpaExpanded] = React.useState(false);
  const [weightedMode, setWeightedMode] = React.useState(false);
  const [whatIfSubject, setWhatIfSubject] = React.useState(null);
  const [whatIfScore, setWhatIfScore] = React.useState(85);

  // Grade targets
  const gradeTargets = nbGetPref("gradeTargets", {});
  const setGradeTarget = (sid, letter) => nbSetPref("gradeTargets", { ...gradeTargets, [sid]: letter });

  const grades = nbGetPref("grades", {});
  const entriesFor = (sid) => grades[sid] || [];

  // ── Grade utilities ──────────────────────────────────────────────────────────
  const toLetterGrade = (p) => {
    if (p >= 0.97) return "A+"; if (p >= 0.93) return "A"; if (p >= 0.90) return "A−";
    if (p >= 0.87) return "B+"; if (p >= 0.83) return "B"; if (p >= 0.80) return "B−";
    if (p >= 0.77) return "C+"; if (p >= 0.73) return "C"; if (p >= 0.70) return "C−";
    if (p >= 0.67) return "D+"; if (p >= 0.63) return "D"; if (p >= 0.60) return "D−";
    return "F";
  };
  const toGPA = (p) => {
    if (p >= 0.93) return 4.0; if (p >= 0.90) return 3.7;
    if (p >= 0.87) return 3.3; if (p >= 0.83) return 3.0; if (p >= 0.80) return 2.7;
    if (p >= 0.77) return 2.3; if (p >= 0.73) return 2.0; if (p >= 0.70) return 1.7;
    if (p >= 0.67) return 1.3; if (p >= 0.63) return 1.0; if (p >= 0.60) return 0.7;
    return 0.0;
  };
  const gradeColor = (p) => {
    if (p >= 0.90) return "var(--done)";
    if (p >= 0.80) return "var(--info)";
    if (p >= 0.70) return "var(--ochre)";
    return "var(--danger)";
  };
  const gradeInfo = (p) => ({
    color: gradeColor(p),
    bg: p >= 0.90 ? "var(--done-soft)" : p >= 0.80 ? "#dce8f0" : p >= 0.70 ? "#f5ecd6" : "var(--accent-soft)",
  });

  const avgFor = (sid) => {
    const es = entriesFor(sid);
    if (!es.length) return null;
    const pts = es.reduce((s, e) => s + e.score, 0);
    const max = es.reduce((s, e) => s + e.total, 0);
    return max > 0 ? pts / max : null;
  };

  // Trend: compare recent half vs older half of entries
  const trendFor = (entries) => {
    if (entries.length < 4) return null;
    const half = Math.floor(entries.length / 2);
    const recent = entries.slice(-half);
    const older  = entries.slice(0, half);
    const rAvg = recent.reduce((s, e) => s + e.score / e.total, 0) / recent.length;
    const oAvg = older.reduce((s, e)  => s + e.score / e.total, 0) / older.length;
    const delta = rAvg - oAvg;
    return { dir: delta > 0.02 ? "up" : delta < -0.02 ? "down" : "flat", delta };
  };

  // What % needed on next 100-pt assignment to reach next letter threshold
  const targetFor = (entries) => {
    if (!entries || entries.length < 1) return null;
    const pts = entries.reduce((s, e) => s + e.score, 0);
    const max = entries.reduce((s, e) => s + e.total, 0);
    const avg = pts / max;
    const thresholds = [0.97, 0.93, 0.90, 0.87, 0.83, 0.80, 0.77, 0.73, 0.70];
    const nextUp = thresholds.filter(t => t > avg + 0.005)[thresholds.filter(t => t > avg + 0.005).length - 1];
    if (!nextUp) return { label: "A+ — peak", color: "var(--done)" };
    const needed = nextUp * (max + 100) - pts;
    const pct = Math.round(needed);
    if (pct > 100) return { label: "Hold current", color: "var(--ink-3)" };
    const letter = toLetterGrade(nextUp);
    return {
      label: pct + "% → " + letter,
      color: pct <= 85 ? "var(--done)" : pct <= 95 ? "var(--ochre)" : "var(--danger)",
    };
  };

  // What-if: avg if next assignment scores x% on 100-pt test
  const whatIfAvg = (entries, pct) => {
    if (!entries.length) return pct / 100;
    const pts = entries.reduce((s, e) => s + e.score, 0) + pct;
    const max = entries.reduce((s, e) => s + e.total, 0) + 100;
    return pts / max;
  };

  // Sparkline: last 6 entry percentages
  const sparkDataFor = (entries) => (entries || []).slice(-6).map(e => e.score / e.total);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const subjectsWithStats = SUBJECTS.map(s => ({
    ...s, avg: avgFor(s.id), entries: entriesFor(s.id),
  }));
  const graded  = subjectsWithStats.filter(s => s.avg !== null);
  const gpa     = graded.length ? graded.reduce((s, sb) => s + toGPA(sb.avg), 0) / graded.length : null;
  const best    = graded.length     ? graded.reduce((a, b) => a.avg >= b.avg ? a : b) : null;
  const worst   = graded.length > 1 ? graded.reduce((a, b) => a.avg <= b.avg ? a : b) : null;
  const totalEntries = Object.values(grades).reduce((s, arr) => s + arr.length, 0);

  const allEntries = SUBJECTS.flatMap(s =>
    entriesFor(s.id).map(e => ({ ...e, subjectId: s.id, subjectName: s.name, subjectShort: s.short || s.name.split(" ")[0], subjectColor: s.color }))
  ).sort((a, b) => b.id.localeCompare(a.id)).slice(0, 12);

  // ── Actions ───────────────────────────────────────────────────────────────────
  const deleteEntry = (sid, id) =>
    nbSetPref("grades", { ...grades, [sid]: entriesFor(sid).filter(e => e.id !== id) });

  const exportCSV = () => {
    if (!graded.length) { window.dispatchEvent(new CustomEvent("toast", { detail: "No grades to export yet" })); return; }
    const rows = [["Subject","Assignment","Type","Score","Total","Pct"]];
    SUBJECTS.forEach(s => entriesFor(s.id).forEach(e =>
      rows.push([s.name, e.title, e.type, e.score, e.total, Math.round(e.score / e.total * 100) + "%"])
    ));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "grades.csv"; a.click();
  };

  // ── PDF import ────────────────────────────────────────────────────────────────
  const LETTER_MAP = { "A+":0.98,"A":0.95,"A-":0.92,"A−":0.92,"A–":0.92,
    "B+":0.88,"B":0.85,"B-":0.82,"B−":0.82,"B–":0.82,
    "C+":0.78,"C":0.75,"C-":0.72,"C−":0.72,"C–":0.72,
    "D+":0.68,"D":0.65,"D-":0.62,"D−":0.62,"D–":0.62,"F":0.45 };

  const parsePdfText = (text) => {
    const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
    const results = [];
    // Match patterns: "Subject Name   A   92%" or "Subject: A+" or lines with subject color keywords
    const gradeRx = /([A-Z][A-Za-z &]+?)\s{2,}([A-F][+-−–]?)\s/g;
    const pctRx   = /([A-Z][A-Za-z &\d]+?)\s{2,}(\d{2,3}(?:\.\d+)?)\s*%/g;
    const inlineRx = /^(.+?)\s*[:\t|]\s*([A-F][+-−–]?)\s*(?:\((\d{2,3})\s*%\))?/;

    const seen = new Set();
    for (const line of lines) {
      // inline "Subject: A+" pattern
      const m = line.match(inlineRx);
      if (m && m[1].length > 2 && m[1].length < 50) {
        const key = m[1].trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          const letter = m[2].trim();
          const pct = m[3] ? parseInt(m[3]) / 100 : (LETTER_MAP[letter] || 0.75);
          results.push({ subjectName: m[1].trim(), grade: letter, pct, term: "Imported", checked: true });
        }
      }
    }
    // tabular scan
    let gm;
    gradeRx.lastIndex = 0;
    while ((gm = gradeRx.exec(text)) !== null) {
      const key = gm[1].trim().toLowerCase();
      if (!seen.has(key) && gm[1].length > 2) {
        seen.add(key);
        const letter = gm[2].trim();
        results.push({ subjectName: gm[1].trim(), grade: letter, pct: LETTER_MAP[letter] || 0.75, term: "Imported", checked: true });
      }
    }
    pctRx.lastIndex = 0;
    while ((gm = pctRx.exec(text)) !== null) {
      const key = gm[1].trim().toLowerCase();
      if (!seen.has(key) && gm[1].length > 2) {
        seen.add(key);
        const pct = parseFloat(gm[2]) / 100;
        results.push({ subjectName: gm[1].trim(), grade: null, pct, term: "Imported", checked: true });
      }
    }
    return results;
  };

  const processPdfFiles = async (files) => {
    setPdfStep("parsing");
    setPdfError(null);
    try {
      let allText = "";
      for (const file of files) {
        const buf = await file.arrayBuffer();
        if (typeof pdfjsLib !== "undefined") {
          const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            allText += content.items.map(it => it.str).join(" ") + "\n";
          }
        } else {
          // Fallback: try reading as text
          allText += await file.text();
        }
      }
      const parsed = parsePdfText(allText);
      if (!parsed.length) {
        setPdfError("No grade data detected. Try a different format or add grades manually.");
        setPdfStep("upload");
      } else {
        setPdfParsed(parsed);
        setPdfStep("confirm");
      }
    } catch (e) {
      setPdfError("Could not read PDF: " + e.message);
      setPdfStep("upload");
    }
  };

  const applyParsedGrades = () => {
    const toApply = pdfParsed.filter(r => r.checked);
    if (!toApply.length) return;
    const updated = { ...grades };
    toApply.forEach(r => {
      // Try to match to a known subject
      const match = SUBJECTS.find(s =>
        s.name.toLowerCase().includes(r.subjectName.toLowerCase()) ||
        r.subjectName.toLowerCase().includes(s.name.toLowerCase().split(" ")[0])
      );
      const sid = match ? match.id : ("imported_" + r.subjectName.toLowerCase().replace(/\s+/g, "_"));
      if (!updated[sid]) updated[sid] = [];
      updated[sid].push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: r.term + " Grade (PDF)",
        score: Math.round(r.pct * 100),
        total: 100,
        type: "other",
        date: "Imported",
      });
    });
    nbSetPref("grades", updated);
    window.dispatchEvent(new CustomEvent("toast", { detail: toApply.length + " grade" + (toApply.length !== 1 ? "s" : "") + " applied." }));
    setPdfModal(false);
    setPdfStep("upload");
    setPdfParsed([]);
  };

  const openPdfModal = () => { setPdfModal(true); setPdfStep("upload"); setPdfParsed([]); setPdfError(null); };
  const closePdfModal = () => { setPdfModal(false); setPdfStep("upload"); setPdfParsed([]); setPdfError(null); };

  const termEyebrow = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null");
      const now = new Date();
      const term = now.getMonth() >= 7 ? "Fall term" : "Spring term";
      const wk = p && p.yearStart ? Math.min(Math.ceil((now - new Date(p.yearStart.year, p.yearStart.month, 1)) / 604800000), 36) : null;
      return wk && wk > 0 ? term + " · Week " + wk + " of 36" : term;
    } catch { return "This term"; }
  })();

  const inp = {
    padding: "5px 9px", border: "1px solid var(--hairline)", borderRadius: 4,
    fontFamily: "inherit", fontSize: 12.5, background: "var(--surface)", color: "var(--ink)", outline: "none",
  };

  // ── Sub-components ────────────────────────────────────────────────────────────

  // PDF Import Modal
  function PdfImportModal() {
    const fileRef = React.useRef();
    const handleDrop = (e) => {
      e.preventDefault(); setPdfDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
      if (files.length) processPdfFiles(files);
    };
    const handleFile = (e) => {
      const files = Array.from(e.target.files).filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
      if (files.length) processPdfFiles(files);
    };
    return (
      <div onClick={closePdfModal} style={{ position: "fixed", inset: 0, background: "rgba(26,22,17,0.55)", zIndex: 9000,
        display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--hairline)",
          borderRadius: 12, width: 480, maxWidth: "95vw", maxHeight: "85vh", overflow: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
            <div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, color: "var(--ink)", lineHeight: 1 }}>Import Grades PDF</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {pdfStep === "upload" ? "Report cards, transcripts, grade exports" : pdfStep === "parsing" ? "Reading document…" : "Confirm detected grades"}
              </div>
            </div>
            <button onClick={closePdfModal} style={{ width: 28, height: 28, borderRadius: 4, border: "1px solid var(--hairline)",
              background: "var(--bg-2)", color: "var(--ink-3)", fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* Upload step */}
          {pdfStep === "upload" && (
            <div style={{ padding: 24 }}>
              <div
                onDragOver={e => { e.preventDefault(); setPdfDragging(true); }}
                onDragLeave={() => setPdfDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current && fileRef.current.click()}
                style={{ border: "2px dashed " + (pdfDragging ? "var(--accent)" : "var(--hairline)"),
                  borderRadius: 10, padding: "48px 32px", textAlign: "center", cursor: "pointer",
                  background: pdfDragging ? "var(--accent-soft)" : "var(--bg-2)",
                  transition: "all 0.18s", userSelect: "none" }}>
                <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.5 }}>📄</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 17, color: "var(--ink)", marginBottom: 6 }}>
                  Drop your grade report here
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>
                  PDF files · report cards, transcripts, grade exports
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--accent)", marginTop: 10 }}>
                  or click to browse
                </div>
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" multiple onChange={handleFile} style={{ display: "none" }} />
              </div>
              {pdfError && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc",
                  borderRadius: 6, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--danger)" }}>{pdfError}</div>
              )}
              <div style={{ marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", lineHeight: 1.6 }}>
                Supports one or multiple PDFs. Detected subjects and grades will be shown for confirmation before anything is saved.
              </div>
            </div>
          )}

          {/* Parsing step */}
          {pdfStep === "parsing" && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 16, color: "var(--ink-2)", marginBottom: 8 }}>Reading your grade report…</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>Detecting subjects, grades, and term data</div>
            </div>
          )}

          {/* Confirm step */}
          {pdfStep === "confirm" && (
            <div style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {pdfParsed.length} item{pdfParsed.length !== 1 ? "s" : ""} detected — confirm before applying
              </div>
              <div style={{ border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                {pdfParsed.map((row, i) => {
                  const subMatch = SUBJECTS.find(s =>
                    s.name.toLowerCase().includes(row.subjectName.toLowerCase()) ||
                    row.subjectName.toLowerCase().includes(s.name.toLowerCase().split(" ")[0])
                  );
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      borderBottom: i < pdfParsed.length - 1 ? "1px solid var(--hairline)" : "none",
                      background: row.checked ? "transparent" : "var(--bg-2)", opacity: row.checked ? 1 : 0.5,
                      transition: "all 0.13s" }}>
                      <input type="checkbox" checked={row.checked}
                        onChange={e => setPdfParsed(prev => prev.map((r, j) => j === i ? { ...r, checked: e.target.checked } : r))}
                        style={{ width: 14, height: 14, flexShrink: 0, accentColor: subMatch ? subMatch.color : "var(--accent)", cursor: "pointer" }} />
                      {subMatch && <div style={{ width: 4, height: 28, borderRadius: 2, background: subMatch.color, flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13.5, color: "var(--ink)", lineHeight: 1.2 }}>{row.subjectName}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", marginTop: 2 }}>
                          {row.term}{subMatch ? " · matches " + subMatch.name : " · new subject"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {row.grade && (
                          <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 17,
                            color: row.pct >= 0.9 ? "var(--done)" : row.pct >= 0.8 ? "var(--info)" : row.pct >= 0.7 ? "var(--ochre)" : "var(--danger)" }}>
                            {row.grade}
                          </span>
                        )}
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginLeft: 6 }}>{Math.round(row.pct * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="sn-btn ghost" onClick={() => { setPdfStep("upload"); setPdfParsed([]); }}>Back</button>
                <button className="sn-btn accent" onClick={applyParsedGrades}
                  disabled={!pdfParsed.some(r => r.checked)}
                  style={{ opacity: pdfParsed.some(r => r.checked) ? 1 : 0.4 }}>
                  Apply to GPA ({pdfParsed.filter(r => r.checked).length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mini line sparkline
  function GradeSparkline({ data, color }) {
    if (!data || data.length < 2) return (
      <svg width="52" height="22" style={{ display: "block", overflow: "visible", opacity: 0.4 }}>
        <line x1="2" y1="11" x2="50" y2="11" stroke="var(--rule)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
    const W = 52, H = 22;
    const mn = Math.max(0, Math.min(...data) - 0.08);
    const mx = Math.min(1, Math.max(...data) + 0.05);
    const range = mx - mn || 0.1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - mn) / range) * (H - 4) - 2;
      return x + "," + y;
    }).join(" ");
    const lx = W, ly = H - ((data[data.length-1] - mn) / range) * (H - 4) - 2;
    const trend = data.length >= 2 ? data[data.length-1] - data[0] : 0;
    const lineColor = trend > 0.02 ? "var(--done)" : trend < -0.02 ? "var(--danger)" : color;
    return (
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        <circle cx={lx} cy={ly} r="2.5" fill={lineColor} />
      </svg>
    );
  }

  // GPA panel card (interactive, expandable)
  function GpaCard() {
    const scale = weightedMode ? 5.0 : 4.0;
    const toGpaWeighted = (p) => {
      // Adds 1.0 point for AP-level subjects (heuristic: subject name contains AP)
      const base = toGPA(p);
      return Math.min(scale, base);
    };
    const effectiveGpa = graded.length
      ? graded.reduce((s, sb) => s + toGpaWeighted(sb.avg), 0) / graded.length
      : null;
    const gpaColor = effectiveGpa === null ? "var(--hairline)"
      : effectiveGpa >= (scale * 0.875) ? "var(--done)" : effectiveGpa >= (scale * 0.75) ? "var(--info)"
      : effectiveGpa >= (scale * 0.5) ? "var(--ochre)" : "var(--danger)";
    const arcR = 44, arcC = 2 * Math.PI * arcR, arcSweep = arcC * 0.75;
    const gpaFrac = effectiveGpa !== null ? effectiveGpa / scale : 0;

    // What-if: recalc GPA if selected subject gets whatIfScore/100
    const wis = whatIfSubject || (graded[0] ? graded[0].id : null);
    const wisSubject = graded.find(s => s.id === wis);
    const whatIfGpa = wisSubject && graded.length ? (() => {
      const newPct = whatIfAvg(wisSubject.entries, whatIfScore);
      return graded.reduce((s, sb) => s + toGpaWeighted(sb.id === wis ? newPct : sb.avg), 0) / graded.length;
    })() : effectiveGpa;

    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden",
        gridColumn: gpaExpanded ? "1 / -1" : undefined, transition: "all 0.2s" }}>
        {/* Main row — always visible */}
        <div onClick={() => setGpaExpanded(e => !e)} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 20, cursor: "pointer",
          background: "var(--surface)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ position: "relative", width: 108, height: 108, flexShrink: 0 }}>
            <svg width="108" height="108" style={{ transform: "rotate(135deg)" }}>
              <circle cx="54" cy="54" r={arcR} fill="none" stroke="var(--rule)" strokeWidth="8" opacity="0.7"
                strokeDasharray={arcSweep + " " + (arcC - arcSweep)} strokeLinecap="round" />
              {effectiveGpa !== null && (
                <circle cx="54" cy="54" r={arcR} fill="none" stroke={gpaColor} strokeWidth="8"
                  strokeDasharray={(arcSweep * gpaFrac) + " " + (arcC - arcSweep * gpaFrac)}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)" }} />
              )}
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: effectiveGpa === null ? "italic" : "normal",
                fontSize: effectiveGpa !== null ? 28 : 15, lineHeight: 1, letterSpacing: "-0.02em",
                color: effectiveGpa !== null ? gpaColor : "var(--ink-3)" }}>
                {effectiveGpa !== null ? effectiveGpa.toFixed(2) : "—"}
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", marginTop: 4 }}>/ {scale.toFixed(1)}</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 8 }}>GPA this term</div>
            {effectiveGpa !== null ? (
              <>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 36, lineHeight: 1, color: gpaColor, marginBottom: 6 }}>
                  {effectiveGpa >= (scale*0.9625) ? "A+" : effectiveGpa >= (scale*0.925) ? "A" : effectiveGpa >= (scale*0.9) ? "A−"
                   : effectiveGpa >= (scale*0.875) ? "B+" : effectiveGpa >= (scale*0.825) ? "B" : effectiveGpa >= (scale*0.8) ? "B−"
                   : effectiveGpa >= (scale*0.775) ? "C+" : effectiveGpa >= (scale*0.725) ? "C" : "C−"}
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span>{graded.length} subject{graded.length !== 1 ? "s" : ""} ·</span>
                  <button onClick={e => { e.stopPropagation(); setWeightedMode(m => !m); }}
                    style={{ fontFamily: "var(--f-mono)", fontSize: 9, padding: "2px 7px", borderRadius: 4,
                      border: "1px solid var(--hairline)", background: weightedMode ? "var(--ink-3)" : "transparent",
                      color: weightedMode ? "var(--surface)" : "var(--ink-3)", cursor: "pointer", transition: "all 0.15s" }}>
                    {weightedMode ? "Weighted ✓" : "Unweighted"}
                  </button>
                  <span>· click to expand</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-2)", marginBottom: 6, lineHeight: 1.1 }}>
                  Ready to <em style={{ fontStyle: "italic" }}>track.</em>
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", lineHeight: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); setWeightedMode(m => !m); }}
                    style={{ fontFamily: "var(--f-mono)", fontSize: 9, padding: "2px 7px", borderRadius: 4,
                      border: "1px solid var(--hairline)", background: weightedMode ? "var(--ink-3)" : "transparent",
                      color: weightedMode ? "var(--surface)" : "var(--ink-3)", cursor: "pointer", transition: "all 0.15s" }}>
                    {weightedMode ? "Weighted ✓" : "Unweighted"}
                  </button>
                  <span>· log a grade to see your GPA</span>
                </div>
              </>
            )}
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", flexShrink: 0 }}>{gpaExpanded ? "▲" : "▼"}</div>
        </div>

        {/* Expanded panel */}
        {gpaExpanded && (
          <div style={{ borderTop: "1px solid var(--hairline)", padding: "16px", background: "var(--bg-2)",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left: term breakdown + toggle */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>Subject Breakdown</div>
                <button onClick={() => setWeightedMode(m => !m)}
                  style={{ fontFamily: "var(--f-mono)", fontSize: 9, padding: "3px 8px", borderRadius: 4,
                    border: "1px solid var(--hairline)", background: weightedMode ? "var(--ink)" : "var(--surface)",
                    color: weightedMode ? "var(--surface)" : "var(--ink-3)", cursor: "pointer", transition: "all 0.15s" }}>
                  {weightedMode ? "Weighted ✓" : "Unweighted"}
                </button>
              </div>
              {graded.length === 0 ? (
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", paddingTop: 8 }}>
                  No graded subjects yet.
                </div>
              ) : (
                graded.map(s => {
                  const gv = toGpaWeighted(s.avg);
                  const gc = gradeColor(s.avg);
                  return (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 3, height: 24, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 12.5, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <div style={{ height: 4, width: Math.round(gv / scale * 64), background: gc, borderRadius: 2, opacity: 0.6 }} />
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: gc }}>{gv.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Right: what-if simulator */}
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 12 }}>What-If Simulator</div>
              {graded.length === 0 ? (
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", paddingTop: 8 }}>Log grades first.</div>
              ) : (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <select value={wis || ""} onChange={e => setWhatIfSubject(e.target.value)} style={{ ...inp, width: "100%", marginBottom: 8 }}>
                      {graded.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <input type="range" min="0" max="100" value={whatIfScore}
                        onChange={e => setWhatIfScore(parseInt(e.target.value))}
                        style={{ flex: 1, accentColor: "var(--accent)" }} />
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)", width: 36, textAlign: "right" }}>{whatIfScore}%</span>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginBottom: 8 }}>
                      Score on next 100-pt assignment
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 6 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", marginBottom: 3 }}>Current</div>
                      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 20,
                        color: effectiveGpa !== null ? gpaColor : "var(--ink-3)" }}>{effectiveGpa !== null ? effectiveGpa.toFixed(2) : "—"}</div>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 14, color: "var(--ink-3)" }}>→</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", marginBottom: 3 }}>Projected</div>
                      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 20,
                        color: whatIfGpa !== null ? gradeColor(whatIfGpa / scale) : "var(--ink-3)" }}>
                        {whatIfGpa !== null ? whatIfGpa.toFixed(2) : "—"}
                      </div>
                    </div>
                    {whatIfGpa !== null && effectiveGpa !== null && (
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 9,
                        color: whatIfGpa > effectiveGpa + 0.005 ? "var(--done)" : whatIfGpa < effectiveGpa - 0.005 ? "var(--danger)" : "var(--ink-3)" }}>
                        {whatIfGpa > effectiveGpa + 0.005 ? "↑ " + (whatIfGpa - effectiveGpa).toFixed(2)
                          : whatIfGpa < effectiveGpa - 0.005 ? "↓ " + (effectiveGpa - whatIfGpa).toFixed(2) : "No change"}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Metrics strip (3 more cards beside GPA)
  function MetricCard({ label, value, sub, subColor, valueColor, accent }) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8,
        padding: "18px 20px", borderLeft: accent ? "3px solid " + accent : "3px solid var(--hairline)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 9 }}>{label}</div>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, lineHeight: 1.1, color: valueColor || "var(--ink)", marginBottom: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
        {sub && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: subColor || "var(--ink-2)", letterSpacing: "0.02em" }}>{sub}</div>}
      </div>
    );
  }

  // Individual entry chip in expanded row
  function EntryChip({ e, sid }) {
    const [hov, setHov] = React.useState(false);
    const pct = e.score / e.total;
    const gi  = gradeInfo(pct);
    return (
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
          background: hov ? "var(--bg-2)" : "var(--surface)",
          border: "1px solid var(--hairline)", borderRadius: 5,
          transition: "background 0.13s", cursor: "default", minWidth: 0, flex: "0 0 auto" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{e.title}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 1 }}>{e.type} · {e.date}</div>
        </div>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 16, color: gi.color, lineHeight: 1, flexShrink: 0 }}>{Math.round(pct * 100)}%</div>
        {hov && (
          <button onClick={(ev) => { ev.stopPropagation(); deleteEntry(sid, e.id); }}
            style={{ width: 16, height: 16, borderRadius: 2, border: "1px solid var(--hairline)", background: "var(--bg-2)", color: "var(--ink-3)",
              fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        )}
      </div>
    );
  }

  // Subject table row
  function SubjectRow({ s }) {
    const [rowHov, setRowHov] = React.useState(false);
    const [isAdding, setIsAdding] = React.useState(false);
    const [form, setForm] = React.useState({ title: "", score: "", total: "100", type: "quiz" });
    const isExpanded = expanded === s.id;
    const es  = s.entries;
    const avg = s.avg;

    const addEntry = () => {
      const score = parseFloat(form.score);
      const total = parseFloat(form.total);
      if (!form.title.trim() || isNaN(score) || isNaN(total) || total <= 0) return;
      const entry = {
        id: Date.now().toString(36), title: form.title.trim(), score, total, type: form.type,
        date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      };
      const cur = nbGetPref("grades", {});
      nbSetPref("grades", { ...cur, [s.id]: [...(cur[s.id] || []), entry] });
      setForm({ title: "", score: "", total: "100", type: "quiz" });
      setIsAdding(false);
    };
    const gi  = avg !== null ? gradeInfo(avg) : null;
    const trend = trendFor(es);
    const target = avg !== null ? targetFor(es) : null;
    const sparkData = sparkDataFor(es || []);

    return (
      <>
        {/* Main row */}
        <div
          onMouseEnter={() => setRowHov(true)} onMouseLeave={() => setRowHov(false)}
          onClick={() => { setExpanded(isExpanded ? null : s.id); setIsAdding(false); }}
          style={{ display: "grid", gridTemplateColumns: "1fr 60px 72px 60px 100px",
            alignItems: "center", padding: "10px 16px", gap: 12,
            background: isExpanded ? "var(--bg-2)" : rowHov ? "var(--surface)" : "transparent",
            borderBottom: isExpanded ? "none" : "1px solid var(--hairline)",
            cursor: "pointer", transition: "background 0.13s",
            boxShadow: rowHov && !isExpanded ? "inset 0 0 0 1px var(--hairline)" : "none" }}>

          {/* Subject name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 3, height: 32, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14.5, color: "var(--ink)", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>
                  {es.length} assignment{es.length !== 1 ? "s" : ""}
                </span>
                {trend && (
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 8,
                    color: trend.dir === "up" ? "var(--done)" : trend.dir === "down" ? "var(--danger)" : "var(--ink-3)" }}>
                    {trend.dir === "up" ? "↑" : trend.dir === "down" ? "↓" : "→"} trending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", height: 22 }}>
            {sparkData.length >= 2
              ? <GradeSparkline data={sparkData} color={s.color} />
              : <svg width="52" height="22" style={{ display: "block" }}>
                  <line x1="4" y1="11" x2="48" y2="11" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.10" />
                </svg>
            }
          </div>

          {/* Score % */}
          <div style={{ textAlign: "right" }}>
            {avg !== null ? (
              <>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1, color: gi.color }}>{Math.round(avg * 100)}%</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>avg score</div>
              </>
            ) : (
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink-3)" }}>—</div>
            )}
          </div>

          {/* Grade badge */}
          <div style={{ textAlign: "right" }}>
            {avg !== null ? (
              <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 17, lineHeight: 1, color: gi.color,
                background: gi.bg, padding: "3px 8px", borderRadius: 5, display: "inline-block" }}>
                {toLetterGrade(avg)}
              </span>
            ) : (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: s.color,
                background: s.color + "28", padding: "3px 9px", borderRadius: 5, border: "1px solid " + s.color + "55",
                whiteSpace: "nowrap", display: "inline-block", letterSpacing: "0.03em" }}>
                {rowHov ? "log →" : "—"}
              </span>
            )}
          </div>

          {/* Target / hover CTA */}
          <div style={{ textAlign: "right" }}>
            {avg === null && rowHov ? (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink)", fontWeight: 500, letterSpacing: "0.02em" }}>Log grade →</span>
            ) : target ? (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: target.color }}>{target.label}</span>
            ) : avg === null ? (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", opacity: 0.45 }}>first grade unlocks</span>
            ) : null}
          </div>
        </div>

        {/* Expanded panel */}
        {isExpanded && (
          <div style={{ padding: "0 16px 14px", borderBottom: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
            {/* Entry chips */}
            {es.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: isAdding ? 10 : 0 }}>
                {es.map(e => <EntryChip key={e.id} e={e} sid={s.id} />)}
              </div>
            ) : (
              !isAdding && (
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", paddingTop: 4, paddingBottom: isAdding ? 8 : 0 }}>No grades logged yet.</div>
              )
            )}

            {/* Add form */}
            {isAdding ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: es.length > 0 ? 8 : 4 }}>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Assignment name" style={{ ...inp, flex: "1 1 160px", minWidth: 120 }} />
                <input value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                  placeholder="Score" type="number" min="0" style={{ ...inp, width: 72 }} />
                <input value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))}
                  placeholder="Out of" type="number" min="1" style={{ ...inp, width: 72 }} />
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                  <option value="quiz">Quiz</option>
                  <option value="test">Test</option>
                  <option value="hw">Homework</option>
                  <option value="other">Other</option>
                </select>
                <button className="sn-btn accent" onClick={addEntry} style={{ fontSize: 12 }}>Save</button>
                <button className="sn-btn ghost" onClick={() => setIsAdding(false)} style={{ fontSize: 12 }}>Cancel</button>
              </div>
            ) : (
              <button className="sn-btn ghost" onClick={ev => { ev.stopPropagation(); setIsAdding(true); }}
                style={{ marginTop: es.length > 0 ? 8 : 4, fontSize: 12, padding: "4px 10px" }}>+ Add grade</button>
            )}
          </div>
        )}
      </>
    );
  }

  // Sidebar panel shell
  function SidePanel({ title, badge, dot, children }) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderBottom: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {dot && <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot }} />}
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-2)" }}>{title}</span>
          </div>
          {badge && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", background: "var(--bg)", border: "1px solid var(--hairline)", padding: "2px 6px", borderRadius: 3 }}>{badge}</span>}
        </div>
        {children}
      </div>
    );
  }

  // Grade Targets panel
  function GradeTargetsPanel() {
    const letterOptions = ["A+","A","A−","B+","B","B−","C+","C"];
    return (
      <SidePanel title="Grade Targets" dot="var(--info)">
        <div style={{ paddingTop: 2, paddingBottom: 2 }}>
          {SUBJECTS.length === 0 ? (
            <div style={{ padding: "12px 14px", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 12.5, color: "var(--ink-3)" }}>
              Add subjects to set targets.
            </div>
          ) : SUBJECTS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              borderBottom: i < SUBJECTS.length - 1 ? "1px solid var(--hairline)" : "none" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 12.5, color: "var(--ink)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
              <select value={gradeTargets[s.id] || ""} onChange={e => setGradeTarget(s.id, e.target.value)}
                style={{ fontFamily: gradeTargets[s.id] ? "var(--f-display)" : "var(--f-mono)",
                  fontStyle: gradeTargets[s.id] ? "italic" : "normal",
                  fontSize: gradeTargets[s.id] ? 14 : 9.5, padding: "3px 7px",
                  border: "1px solid " + (gradeTargets[s.id] ? "var(--hairline)" : "var(--hairline)"),
                  borderRadius: 5, background: gradeTargets[s.id] ? "var(--bg-2)" : "var(--surface)",
                  color: gradeTargets[s.id] ? "var(--ink)" : "var(--ink-3)",
                  cursor: "pointer", minWidth: 54 }}>
                <option value="">Set →</option>
                {letterOptions.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
      </SidePanel>
    );
  }

  // Grade Insights AI panel
  function GradeInsightsPanel() {
    const storageKey = "nb-grade-insights-v1";
    const stored = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { return null; } })();
    const weekStamp = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
    const [insight, setInsight] = React.useState(stored && stored.week === weekStamp ? stored.text : null);
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState(null);

    const generateInsight = async () => {
      if (!graded.length) return;
      setLoading(true); setErr(null);
      const summary = graded.map(s => {
        const trend = trendFor(s.entries);
        const tDir = trend ? (trend.dir === "up" ? "improving" : trend.dir === "down" ? "declining" : "stable") : "stable";
        return `${s.name}: ${Math.round(s.avg * 100)}% avg (${toLetterGrade(s.avg)}), ${s.entries.length} assignments, trend ${tDir}`;
      }).join("\n");
      const prompt = `You are a school performance coach. A student has these grades this term:\n\n${summary}\n\nWrite ONE specific, encouraging observation (1–2 sentences max) about their grade trends — something like "Your Bio grade has trended up 4 points over 3 assignments" or "AP Lit is your most consistent subject this term." Be specific, use the actual subject names and numbers. No fluff, no greeting, just the observation.`;
      try {
        const text = await aiComplete(prompt);
        const clean = (text || "").trim();
        setInsight(clean);
        try { localStorage.setItem(storageKey, JSON.stringify({ week: weekStamp, text: clean })); } catch {}
      } catch(e) {
        if (e.message === "no-key") setErr("no-key");
        else setErr("Could not generate insight.");
      } finally { setLoading(false); }
    };

    React.useEffect(() => {
      if (graded.length && !insight && !loading && !err) generateInsight();
    }, [graded.length]);

    return (
      <SidePanel title="Grade Insights" dot="var(--done)" badge="AI">
        <div style={{ padding: "12px 14px" }}>
          {!graded.length ? (
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
              Insights appear once you log your first grade.
            </div>
          ) : loading ? (
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>Analysing grades…</div>
          ) : err === "no-key" ? (
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 8 }}>Connect AI to generate insights.</div>
              <button className="sn-btn ghost" style={{ fontSize: 10.5, padding: "4px 10px" }}
                onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>
            </div>
          ) : err ? (
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{err}</div>
          ) : insight ? (
            <div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink)", lineHeight: 1.55, marginBottom: 10 }}>{insight}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Updated this week</span>
                <button onClick={generateInsight} style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, padding: "2px 8px", borderRadius: 4,
                  border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-3)", cursor: "pointer" }}>↻ Refresh</button>
              </div>
            </div>
          ) : null}
        </div>
      </SidePanel>
    );
  }

  // Recent scores feed
  function RecentScoresFeed() {
    if (!allEntries.length) return (
      <SidePanel title="Recent Scores" dot="var(--ink-3)">
        <div style={{ padding: "24px 16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>📋</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 15, color: "var(--ink-2)", marginBottom: 6, lineHeight: 1.3 }}>
            Your latest grades<br />appear here.
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Log a grade to begin
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {[0.72, 0.55, 0.42].map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.18 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--rule)", flexShrink: 0 }} />
                <div style={{ flex: 1, height: 7, background: "var(--rule)", borderRadius: 3, width: (w * 100) + "%" }} />
                <div style={{ height: 10, background: "var(--rule)", borderRadius: 3, width: 24, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </SidePanel>
    );
    return (
      <SidePanel title="Recent Scores" badge={totalEntries + " total"} dot="var(--accent)">
        <div style={{ paddingTop: 2, paddingBottom: 2 }}>
          {allEntries.map((e, i) => {
            const pct = e.score / e.total;
            const gi = gradeInfo(pct);
            const [hov, setHov] = React.useState(false);
            return (
              <div key={e.id} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px",
                  background: hov ? "var(--bg-2)" : "transparent",
                  borderBottom: i < allEntries.length - 1 ? "1px solid var(--hairline)" : "none",
                  transition: "background 0.13s" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: e.subjectColor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", marginTop: 1 }}>{e.subjectShort} · {e.date}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13.5, color: gi.color, lineHeight: 1 }}>{Math.round(pct * 100)}%</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, color: "var(--ink-3)", marginTop: 1 }}>{e.score}/{e.total}</div>
                </div>
              </div>
            );
          })}
        </div>
      </SidePanel>
    );
  }

  // Grade forecast
  function GradeForecast() {
    const forecastable = graded.slice(0, 5);
    if (!forecastable.length) return null;
    return (
      <SidePanel title="Grade Forecast" badge="what-if">
        <div style={{ paddingTop: 2, paddingBottom: 2 }}>
          {forecastable.map((s, i) => {
            const trend = trendFor(s.entries);
            const projectedPct = (() => {
              if (!trend || trend.dir === "flat") return s.avg;
              const delta = trend.delta || 0;
              return Math.min(1, Math.max(0, s.avg + delta * 0.5));
            })();
            const gi = gradeInfo(s.avg);
            const projGi = gradeInfo(projectedPct);
            const [hov, setHov] = React.useState(false);
            return (
              <div key={s.id} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px",
                  background: hov ? "var(--bg-2)" : "transparent",
                  borderBottom: i < forecastable.length - 1 ? "1px solid var(--hairline)" : "none",
                  transition: "background 0.13s" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 12.5, color: "var(--ink)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", marginTop: 1 }}>
                    {s.entries.length} entry{s.entries.length !== 1 ? "ies" : ""}
                    {trend ? (trend.dir === "up" ? " · ↑ improving" : trend.dir === "down" ? " · ↓ declining" : " · stable") : ""}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: gi.color }}>{toLetterGrade(s.avg)}</span>
                  {trend && trend.dir !== "flat" && (
                    <>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>→</span>
                      <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: projGi.color }}>{toLetterGrade(projectedPct)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SidePanel>
    );
  }

  // Assignment Impact (what-if for struggling subject)
  function AssignmentImpact() {
    const target = worst || graded[0];
    if (!target) return null;
    const scenarios = [70, 85, 100];
    return (
      <SidePanel title="Assignment Impact" badge={target.name.split(" ")[0]}>
        <div style={{ padding: "10px 14px 6px" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginBottom: 8 }}>
            Next 100-pt assignment in <em style={{ fontStyle: "italic", color: "var(--ink-2)" }}>{target.name}</em>:
          </div>
          {scenarios.map(sc => {
            const newAvg = whatIfAvg(target.entries, sc);
            const gi = gradeInfo(newAvg);
            const isImprovement = target.avg !== null && newAvg > target.avg + 0.005;
            const isDrop = target.avg !== null && newAvg < target.avg - 0.005;
            return (
              <div key={sc} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 0", borderBottom: sc !== 100 ? "1px solid var(--hairline)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-2)" }}>Score {sc}%</span>
                  <div style={{ height: 3, width: Math.round(sc * 0.5), background: gi.color, borderRadius: 1, opacity: 0.5 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: gi.color }}>{toLetterGrade(newAvg)}</span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)" }}>{Math.round(newAvg * 100)}%</span>
                  {isImprovement && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--done)" }}>↑</span>}
                  {isDrop && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--danger)" }}>↓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </SidePanel>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {pdfModal && <PdfImportModal />}
      <PageHeader
        eyebrow={termEyebrow}
        title="Academic"
        italic="performance."
        meta={gpa !== null
          ? "GPA " + gpa.toFixed(2) + " · " + graded.length + " subject" + (graded.length !== 1 ? "s" : "") + " · " + totalEntries + " grades logged"
          : SUBJECTS.length > 0 ? "Click any subject to log your first grade." : "Add subjects first, then track grades here."}
        actions={<div style={{ display: "flex", gap: 8 }}>
          <button className="sn-btn ghost" onClick={openPdfModal} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13 }}>📄</span> Import Grades PDF
          </button>
          <button className="sn-btn ghost" onClick={exportCSV}>Export CSV</button>
        </div>}
      />

      {SUBJECTS.length === 0 ? (
        <div className="sn-card" style={{ padding: "52px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--ink-2)", marginBottom: 8 }}>No subjects set up yet.</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>Add your subjects first, then track grades here.</div>
        </div>
      ) : (
        <>
          {/* Metrics strip */}
          <div className="pg-section" style={{ display: "grid", gridTemplateColumns: gpaExpanded ? "1fr" : "auto 1fr 1fr 1fr", gap: 10, marginBottom: 16, animationDelay: "0.15s" }}>
            <GpaCard />
            {!gpaExpanded && <>
            <MetricCard
              label="Best Performing"
              value={best ? best.name : "—"}
              sub={best ? Math.round(best.avg * 100) + "% · " + toLetterGrade(best.avg) : "Log a grade to see"}
              subColor={best ? "var(--done)" : undefined}
              accent={best ? best.color : undefined}
            />
            <MetricCard
              label="Needs Attention"
              value={worst ? worst.name : (graded.length === 1 ? "Only 1 graded" : "—")}
              sub={worst ? Math.round(worst.avg * 100) + "% · " + toLetterGrade(worst.avg) : "Log more grades"}
              subColor={worst ? gradeColor(worst.avg) : undefined}
              accent={worst ? (worst.color || gradeColor(worst.avg)) : undefined}
            />
            <MetricCard
              label="Total Assignments"
              value={totalEntries > 0 ? String(totalEntries) : "0"}
              sub={totalEntries > 0 ? graded.length + " subject" + (graded.length !== 1 ? "s" : "") + " tracked" : "Click a subject to start"}
              subColor={totalEntries > 0 ? "var(--info)" : undefined}
            />
            </>}
          </div>

          {/* Main: subject table + sidebar */}
          <div className="pg-section" style={{ display: "grid", gridTemplateColumns: "1fr 256px", gap: 16, alignItems: "start", animationDelay: "0.25s" }}>

            {/* Subject table */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 72px 60px 100px",
                padding: "8px 16px", borderBottom: "1px solid var(--hairline)", gap: 12, background: "var(--bg-2)" }}>
                {[["Subject","left"],["Trend","left"],["Score","right"],["Grade","right"],["Target","right"]].map(([h,a]) => (
                  <div key={h} style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, textTransform: "uppercase",
                    letterSpacing: "0.1em", color: "var(--ink-3)", textAlign: a }}>{h}</div>
                ))}
              </div>
              {subjectsWithStats.map(s => <SubjectRow key={s.id} s={s} />)}
              <div style={{ padding: "10px 16px", borderTop: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", opacity: 0.6 }}>
                  {subjectsWithStats.length} subject{subjectsWithStats.length !== 1 ? "s" : ""} · click any row to log a grade
                </span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", opacity: 0.45 }}>↑ scroll to top</span>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <RecentScoresFeed />
              <GradeForecast />
              <AssignmentImpact />
              <GradeTargetsPanel />
              <GradeInsightsPanel />
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─────────────── Create deck modal (manual or AI)

function CreateDeckModal({ onClose }) {
  const [mode, setMode] = React.useState("manual"); // "manual" | "ai"
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState(SUBJECTS[0]?.id || "");
  const [saved, setSaved] = React.useState(false);

  // Manual mode state
  const [rows, setRows] = React.useState([{ front: "", back: "" }, { front: "", back: "" }, { front: "", back: "" }]);
  const addRow = () => setRows((r) => [...r, { front: "", back: "" }]);
  const updateRow = (i, field, val) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  // AI mode state
  const [topic, setTopic] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState("");
  const [aiCards, setAiCards] = React.useState([]);

  const generateAI = async () => {
    if (!topic.trim()) return;
    setGenerating(true); setGenError(""); setAiCards([]);
    const prompt = `Generate 8–12 flashcard Q&A pairs for a high school student studying: "${topic.trim()}".

Format EXACTLY like this:
Q: [term or question]
A: [definition or answer]

Return only the pairs, nothing else.`;
    try {
      const text = await aiComplete(prompt);
      const cards = [];
      let front = null;
      for (const line of text.split("\n")) {
        const l = line.trim();
        if (/^Q:/i.test(l)) { front = l.slice(2).trim(); }
        else if (/^A:/i.test(l) && front) { cards.push({ front, back: l.slice(2).trim() }); front = null; }
      }
      if (!cards.length) throw new Error("No cards parsed");
      setAiCards(cards);
      if (!title.trim()) setTitle(topic.trim());
    } catch (e) {
      if (e.message === "no-key") setGenError("__no-key__");
      else setGenError("Couldn't generate cards. Try again or switch to manual.");
    } finally { setGenerating(false); }
  };

  const save = () => {
    const cards = mode === "manual"
      ? rows.filter(r => r.front.trim() || r.back.trim()).map((r, i) => ({ id: "c" + i, front: r.front.trim(), back: r.back.trim() }))
      : aiCards.map((c, i) => ({ id: "c" + i, ...c }));
    if (!cards.length || !title.trim()) return;
    nbAddCustomDeck({ title: title.trim(), subject, cards, source: mode });
    setSaved(true);
    setTimeout(() => {
      onClose();
      window.dispatchEvent(new CustomEvent("toast", { detail: `"${title.trim()}" — ${cards.length} cards created` }));
    }, 600);
  };

  const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "inherit", fontSize: 13.5, background: "var(--surface)", color: "var(--ink)", outline: "none", boxSizing: "border-box" };
  const canSave = title.trim() && (mode === "manual" ? rows.some(r => r.front.trim()) : aiCards.length > 0);

  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>New flashcard deck</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>Create a <em style={{ color: "var(--accent)" }}>deck</em></div>
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {[["manual", "✏ Manual"], ["ai", "✦ AI Generate"]].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} style={{
              padding: "6px 14px", borderRadius: 4, border: "1px solid " + (mode === k ? "var(--ink)" : "var(--hairline)"),
              background: mode === k ? "var(--ink)" : "var(--surface)", color: mode === k ? "var(--bg)" : "var(--ink-2)",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {saved ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, color: "var(--done)", marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-2)", fontStyle: "italic" }}>Deck created!</div>
        </div>
      ) : (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 2 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Deck title</div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Unit 3 — Cell Division" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Subject</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {SUBJECTS.map((s) => (
                  <button key={s.id} onClick={() => setSubject(s.id)} style={{
                    padding: "4px 8px", borderRadius: 3, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit",
                    border: "1px solid " + (subject === s.id ? "var(--ink)" : "var(--hairline)"),
                    background: subject === s.id ? "var(--ink)" : "var(--surface)",
                    color: subject === s.id ? "var(--bg)" : "var(--ink)",
                  }}><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 2, background: s.color, marginRight: 4, verticalAlign: "middle" }}></span>{s.short}</button>
                ))}
              </div>
            </div>
          </div>

          {mode === "manual" && (
            <>
              <div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Cards ({rows.filter(r => r.front.trim()).length} filled)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: "4px 8px", marginBottom: 8 }}>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 2px" }}>Term / Front</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 2px" }}>Definition / Back</div>
                  <div></div>
                  {rows.map((row, i) => (
                    <React.Fragment key={i}>
                      <input value={row.front} onChange={(e) => updateRow(i, "front", e.target.value)} placeholder={`Term ${i + 1}`} style={inputStyle} />
                      <input value={row.back} onChange={(e) => updateRow(i, "back", e.target.value)} placeholder={`Definition ${i + 1}`} style={inputStyle} />
                      <button onClick={() => removeRow(i)} style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", fontSize: 16, padding: 0 }} title="Remove">×</button>
                    </React.Fragment>
                  ))}
                </div>
                <button className="sn-btn ghost" onClick={addRow} style={{ fontSize: 12.5 }}>+ Add card</button>
              </div>
            </>
          )}

          {mode === "ai" && (
            <>
              <div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Topic or description</div>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
                  placeholder="e.g. AP Biology — cellular respiration, ATP synthesis, and the electron transport chain"
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="sn-btn primary" onClick={generateAI} disabled={generating || !topic.trim()} style={{ opacity: generating || !topic.trim() ? 0.6 : 1 }}>
                  {generating ? "Generating…" : "✦ Generate cards"}
                </button>
                {aiCards.length > 0 && <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--done)" }}>✓ {aiCards.length} cards ready</span>}
                {genError && genError !== "__no-key__" && <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--accent)" }}>{genError}</span>}
                {genError === "__no-key__" && <button className="sn-btn primary" style={{ fontSize: 11 }} onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>}
              </div>
              {aiCards.length > 0 && (
                <div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Preview</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {aiCards.map((c, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "7px 0", borderBottom: "1px dashed var(--hairline)" }}>
                        <div style={{ fontSize: 13 }}>{c.front}</div>
                        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{c.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
            <button className="sn-btn primary" onClick={save} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.4 }}>
              Save deck {canSave ? `(${mode === "manual" ? rows.filter(r => r.front.trim()).length : aiCards.length} cards)` : ""}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─────────────── Quizlet import modal

function QuizletImportModal({ onClose }) {
  const [raw, setRaw] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState(SUBJECTS[0]?.id || "");
  const [sep, setSep] = React.useState("tab"); // tab | comma | dash
  const [preview, setPreview] = React.useState([]);
  const [saved, setSaved] = React.useState(false);

  const parse = (text, separator) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const sepChar = separator === "tab" ? "\t" : separator === "comma" ? "," : " — ";
    return lines.map((line) => {
      const idx = line.indexOf(sepChar);
      if (idx === -1) return null;
      return { front: line.slice(0, idx).trim(), back: line.slice(idx + sepChar.length).trim() };
    }).filter(Boolean);
  };

  React.useEffect(() => {
    setPreview(parse(raw, sep).slice(0, 5));
  }, [raw, sep]);

  const cards = parse(raw, sep);

  const save = () => {
    if (!cards.length || !title.trim()) return;
    nbAddCustomDeck({
      title: title.trim(),
      subject,
      cards: cards.map((c, i) => ({ id: "q" + i, q: c.front, a: c.back })),
      source: "quizlet",
    });
    setSaved(true);
    setTimeout(() => { onClose(); window.dispatchEvent(new CustomEvent("toast", { detail: `Imported "${title.trim()}" — ${cards.length} cards` })); }, 700);
  };

  return (
    <Modal onClose={onClose} width={600}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Import flashcards</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>
          From <em style={{ color: "var(--accent)" }}>Quizlet</em> or any set
        </div>
      </div>
      {saved ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, color: "var(--done)", marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-2)", fontStyle: "italic" }}>Imported!</div>
        </div>
      ) : (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "12px 14px", background: "var(--bg-2)", borderRadius: 8, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            <b>How to export from Quizlet:</b> Open your set → ··· menu → <em>Export</em> → copy the text → paste below.
            <br/>Or type/paste any list with terms and definitions.
          </div>
          <Field label="Deck title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AP Bio Unit 4 — Cell Division"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "inherit", fontSize: 14, background: "var(--surface)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }} />
          </Field>
          <Field label="Subject">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUBJECTS.map((s) => (
                <button key={s.id} onClick={() => setSubject(s.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid " + (subject === s.id ? "var(--ink)" : "var(--hairline)"),
                  background: subject === s.id ? "var(--ink)" : "var(--surface)",
                  color: subject === s.id ? "var(--bg)" : "var(--ink)",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color }}></span>{s.short}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Separator">
            <div style={{ display: "flex", gap: 6 }}>
              {[["tab","Tab (Quizlet default)"],["comma","Comma"],["dash","Dash (—)"]].map(([k, l]) => (
                <button key={k} onClick={() => setSep(k)} style={{
                  padding: "4px 10px", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid " + (sep === k ? "var(--ink)" : "var(--hairline)"),
                  background: sep === k ? "var(--ink)" : "var(--surface)", color: sep === k ? "var(--bg)" : "var(--ink)",
                }}>{l}</button>
              ))}
            </div>
          </Field>
          <Field label={`Paste your terms (${cards.length} cards detected)`}>
            <textarea value={raw} onChange={(e) => setRaw(e.target.value)}
              placeholder={"Term\tDefinition\nAnother term\tAnother definition\n…"}
              rows={7}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "var(--f-mono)", fontSize: 12, background: "var(--surface)", color: "var(--ink)", outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
          </Field>
          {preview.length > 0 && (
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Preview (first {preview.length})</div>
              {preview.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "6px 0", borderBottom: i < preview.length - 1 ? "1px dashed var(--hairline)" : "none" }}>
                  <div style={{ fontSize: 12.5 }}>{c.front}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{c.back}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
            <button className="sn-btn primary" onClick={save} disabled={!cards.length || !title.trim()} style={{ opacity: cards.length && title.trim() ? 1 : 0.4 }}>
              Import {cards.length ? cards.length + " cards" : ""}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─────────────── Flashcards (uses FlashcardQuiz which already has a deck)

function FlashcardsContent({ onTakeQuiz }) {
  const [importOpen, setImportOpen]   = React.useState(false);
  const [createOpen, setCreateOpen]   = React.useState(false);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    const on = () => forceUpdate();
    window.addEventListener("nbStoreChange", on);
    return () => window.removeEventListener("nbStoreChange", on);
  }, []);

  // ── Data ────────────────────────────────────────────────────────────────────
  const showBuiltinDecks = HOMEWORK.length > 0 || QUIZZES_UPCOMING.length > 0;

  const builtinDecks = showBuiltinDecks ? [
    { id: "bio-respiration", due: 6,  last: "yesterday" },
    { id: "esp-u6",          due: 12, last: "today"     },
    { id: "lit-beloved",     due: 0,  last: "3d ago"    },
    { id: "alg2-trig",       due: 5,  last: "2d ago"    },
    { id: "us-fed",          due: 3,  last: "Mon"       },
    { id: "chem-periodic",   due: 8,  last: "today"     },
  ].map(d => ({ ...d, ...DECKS[d.id] })) : [];

  const customDecks = nbGetCustomDecks();
  const allDecks    = [...builtinDecks, ...customDecks];

  const totalCards = allDecks.reduce((s, d) => s + (d.cards ? d.cards.length : 0), 0);
  const totalDue   = allDecks.reduce((s, d) => s + (d.due || 0), 0);
  const decksWithDue = [...allDecks].filter(d => (d.due || 0) > 0).sort((a, b) => (b.due || 0) - (a.due || 0));

  const streakData = nbGetStreakData();
  const retention  = totalCards > 0 ? Math.round(((totalCards - totalDue) / totalCards) * 100) : null;
  const studyMins  = Math.ceil(totalDue * 0.5); // ~30s per card
  const timeLabel  = studyMins === 0 ? "—" : studyMins < 60 ? studyMins + "m" : Math.floor(studyMins / 60) + "h " + (studyMins % 60 > 0 ? studyMins % 60 + "m" : "");

  const activity   = nbGetPref("fc_activity", []);
  const recentAct  = [...activity].reverse().slice(0, 8);

  const studyDeck = (deck) => {
    const entry = { deckId: deck.id, title: deck.title, ts: Date.now(), cards: deck.cards ? deck.cards.length : 0 };
    nbSetPref("fc_activity", [...nbGetPref("fc_activity", []).slice(-49), entry]);
    onTakeQuiz("flashcard", deck.id);
  };

  const dueColor = (due, total) => {
    if (!due || due === 0) return "var(--done)";
    const r = due / Math.max(total, 1);
    return r > 0.4 ? "var(--danger)" : r > 0.15 ? "var(--ochre)" : "var(--info)";
  };

  const fmtTs = (ts) => {
    const d = Date.now() - ts;
    const m = Math.floor(d / 60000), h = Math.floor(d / 3600000), dy = Math.floor(d / 86400000);
    if (m < 2) return "just now";
    if (m < 60) return m + "m ago";
    if (h < 24) return h + "h ago";
    if (dy === 1) return "yesterday";
    return dy + "d ago";
  };

  // ── Sub-components ───────────────────────────────────────────────────────────

  // Metrics strip
  function MetricsStrip() {
    const items = [
      { label: "Due today",   value: totalDue || "0",         sub: totalDue > 0 ? decksWithDue.length + " deck" + (decksWithDue.length !== 1 ? "s" : "") : "All caught up", subColor: totalDue > 0 ? "var(--ochre)" : "var(--done)", accent: totalDue > 0, hero: true },
      { label: "Retention",   value: retention !== null ? retention + "%" : "—",  sub: retention !== null ? (retention >= 80 ? "Strong mastery" : retention >= 60 ? "Improving" : "Needs review") : "Start studying", subColor: retention && retention >= 80 ? "var(--done)" : "var(--ink-3)", retentionLow: retention !== null && retention < 60 },
      { label: "Study streak",value: streakData.streak > 0 ? streakData.streak + "d" : "—", sub: streakData.best > 0 ? "Best " + streakData.best + "d" : "Start today", subColor: streakData.streak > 0 ? "var(--ochre)" : "var(--ink-3)" },
      { label: "Est. review", value: timeLabel,               sub: totalDue > 0 ? totalDue + " cards queued" : "Nothing due", subColor: "var(--ink-3)" },
    ];
    const mostOverdueDeck = decksWithDue[0];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {items.map((s, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "13px 15px",
            borderTop: s.accent ? "2px solid var(--ochre)" : undefined }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 7 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: s.hero ? 36 : 22, lineHeight: 1, color: s.accent ? "var(--ochre)" : "var(--ink)", marginBottom: 5 }}>{s.value}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: s.subColor }}>{s.sub}</div>
            {s.retentionLow && mostOverdueDeck && (
              <button onClick={() => studyDeck(mostOverdueDeck)}
                style={{ marginTop: 7, fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-2)", background: "none",
                  border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>
                Review overdue cards →
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Today's review panel
  function TodayReviewPanel() {
    const [hov, setHov] = React.useState(null);
    if (allDecks.length === 0) return null;
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderBottom: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: totalDue > 0 ? "var(--ochre)" : "var(--done)" }} />
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-2)" }}>Today's Review</span>
          </div>
          {totalDue > 0
            ? <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ochre)" }}>{totalDue} cards due</span>
            : <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--done)" }}>All clear</span>}
        </div>

        {totalDue === 0 ? (
          <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--done-soft)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--done)", fontSize: 15, flexShrink: 0 }}>✓</div>
            <div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: "var(--ink)", lineHeight: 1.2 }}>All caught up — no cards due today.</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginTop: 3 }}>Great work. Check back tomorrow or study ahead.</div>
            </div>
          </div>
        ) : (
          <>
            {(() => {
              const slice = decksWithDue.slice(0, 5);
              const maxDue = Math.max(...slice.map(d => d.due || 0), 1);
              return slice.map((d, i) => {
              const s = subjectBy(d.subject);
              const isHov = hov === d.id;
              const cardsDue = d.due || 0;
              const cardsTotal = d.cards ? d.cards.length : 0;
              const duePct = Math.round((cardsDue / maxDue) * 100);
              return (
                <div key={d.id}
                  onMouseEnter={() => setHov(d.id)} onMouseLeave={() => setHov(null)}
                  onClick={() => studyDeck(d)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                    background: isHov ? "var(--bg-2)" : "transparent",
                    borderBottom: i < Math.min(decksWithDue.length, 5) - 1 ? "1px solid var(--hairline)" : "none",
                    cursor: "pointer", transition: "background 0.13s" }}>
                  <div style={{ width: 3, height: 32, borderRadius: 1.5, background: s.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: "var(--ink)", lineHeight: 1 }}>{d.title}</span>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.08em",
                        color: "var(--ink-3)", background: "var(--bg-2)", border: "1px solid var(--hairline)", padding: "1px 5px", borderRadius: 3 }}>{s.short}</span>
                    </div>
                    <div style={{ height: 3, background: "var(--hairline)", borderRadius: 1.5 }}>
                      <div style={{ height: 3, width: duePct + "%", background: dueColor(cardsDue, cardsTotal), borderRadius: 1.5, transition: "width 0.4s" }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 16, lineHeight: 1, color: dueColor(cardsDue, cardsTotal) }}>{cardsDue}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", marginTop: 2 }}>due</div>
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: isHov ? "var(--accent)" : "var(--ink-3)",
                    transition: "color 0.13s", whiteSpace: "nowrap" }}>Study →</div>
                </div>
              );
            });
            })()}
            {decksWithDue.length > 5 && (
              <div style={{ padding: "8px 16px", fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)",
                borderTop: "1px solid var(--hairline)" }}>+{decksWithDue.length - 5} more decks with due cards</div>
            )}
          </>
        )}
      </div>
    );
  }

  // Deck row in the all-decks table
  function DeckRow({ d, isLast }) {
    const [hov, setHov] = React.useState(false);
    const s = subjectBy(d.subject) || { color: "var(--accent)", short: "??" };
    const cardsDue  = d.due || 0;
    const cardsTotal = d.cards ? d.cards.length : 0;
    const masteryPct = cardsTotal > 0 ? Math.round(((cardsTotal - cardsDue) / cardsTotal) * 100) : 0;
    const lastLabel = d.last || "—";
    const isCustom  = !builtinDecks.find(b => b.id === d.id);
    return (
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={() => studyDeck(d)}
        style={{ display: "grid", gridTemplateColumns: "1fr 100px 60px 64px 70px 64px",
          alignItems: "center", padding: "11px 16px", gap: 12,
          background: hov ? "var(--bg-2)" : "transparent",
          borderBottom: isLast ? "none" : "1px solid var(--hairline)",
          cursor: "pointer", transition: "background 0.13s" }}>

        {/* Deck identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 3, height: 34, borderRadius: 1.5, background: s.color, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14.5, color: "var(--ink)", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</span>
              {isCustom && <span style={{ fontFamily: "var(--f-mono)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--accent)", background: "var(--accent-soft)", padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>
                {d.source === "ai" ? "AI" : d.source === "quizlet" ? "Quizlet" : "Custom"}
              </span>}
            </div>
          </div>
        </div>

        {/* Mastery bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ flex: 1, height: 3, background: "var(--hairline)", borderRadius: 1.5 }}>
            <div style={{ height: 3, width: masteryPct + "%", background: dueColor(cardsDue, cardsTotal), borderRadius: 1.5, transition: "width 0.4s" }} />
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", flexShrink: 0 }}>{masteryPct}%</span>
        </div>

        {/* Cards count */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 16, lineHeight: 1, color: "var(--ink)" }}>{cardsTotal}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, color: "var(--ink-3)", textTransform: "uppercase", marginTop: 2 }}>cards</div>
        </div>

        {/* Due count */}
        <div style={{ textAlign: "right" }}>
          {cardsDue > 0
            ? <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14,
                color: dueColor(cardsDue, cardsTotal), background: dueColor(cardsDue, cardsTotal) + "14",
                padding: "3px 8px", borderRadius: 5, display: "inline-block" }}>{cardsDue} due</span>
            : <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--done)" }}>✓ clear</span>}
        </div>

        {/* Last studied */}
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>{lastLabel}</span>
        </div>

        {/* Action */}
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5,
            color: hov ? "var(--ink)" : "var(--ink-3)", transition: "color 0.13s", fontWeight: hov ? 500 : 400 }}>
            {cardsDue > 0 ? "Review →" : "Study →"}
          </span>
        </div>
      </div>
    );
  }

  // Deck table
  function AllDecksTable() {
    const COL_HDR = "1fr 100px 60px 64px 70px 64px";
    if (allDecks.length === 0) return null;
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: COL_HDR, padding: "8px 16px",
          borderBottom: "1px solid var(--hairline)", gap: 12, background: "var(--bg-2)" }}>
          {[["Deck","left"],["Mastery","left"],["Cards","right"],["Due","right"],["Last","right"],["Study","right"]].map(([h,a]) => (
            <div key={h} style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "var(--ink-3)", textAlign: a }}>{h}</div>
          ))}
        </div>
        {allDecks.map((d, i) => <DeckRow key={d.id} d={d} isLast={i === allDecks.length - 1} />)}
      </div>
    );
  }

  // ── Sidebar panels ───────────────────────────────────────────────────────────
  function SidePanel({ title, badge, dot, children }) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderBottom: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {dot && <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot }} />}
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-2)" }}>{title}</span>
          </div>
          {badge && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)",
            background: "var(--bg)", border: "1px solid var(--hairline)", padding: "2px 6px", borderRadius: 3 }}>{badge}</span>}
        </div>
        {children}
      </div>
    );
  }

  // Study activity feed
  function ActivityFeed() {
    return (
      <SidePanel title="Study Activity" dot="var(--accent)" badge={activity.length > 0 ? activity.length + " sessions" : null}>
        {recentAct.length === 0 ? (
          <div style={{ padding: "14px", fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", textAlign: "center" }}>
            No study sessions yet. Hit Study on any deck.
          </div>
        ) : (
          <div style={{ paddingTop: 2, paddingBottom: 2 }}>
            {recentAct.map((a, i) => {
              const deck = allDecks.find(d => d.id === a.deckId);
              const s = deck ? subjectBy(deck.subject) : null;
              const [hov, setHov] = React.useState(false);
              return (
                <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 14px",
                    background: hov ? "var(--bg-2)" : "transparent",
                    borderBottom: i < recentAct.length - 1 ? "1px solid var(--hairline)" : "none",
                    transition: "background 0.13s" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: s ? s.color : "var(--ink-3)", flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", marginTop: 1 }}>
                      {a.cards} cards · {fmtTs(a.ts)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SidePanel>
    );
  }

  // Subject focus: which subjects need the most review
  function SubjectFocusPanel() {
    const subjectDue = {};
    allDecks.forEach(d => {
      const s = subjectBy(d.subject);
      if (!s) return;
      if (!subjectDue[s.id]) subjectDue[s.id] = { name: s.name, short: s.short, color: s.color, due: 0, total: 0 };
      subjectDue[s.id].due   += d.due || 0;
      subjectDue[s.id].total += d.cards ? d.cards.length : 0;
    });
    const items = Object.values(subjectDue)
      .filter(x => x.total > 0)
      .sort((a, b) => b.due - a.due)
      .slice(0, 5);
    if (items.length === 0) return null;
    const maxDue = Math.max(...items.map(x => x.due), 1);
    return (
      <SidePanel title="Subject Focus">
        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
          {items.map((x, i) => {
            const [hov, setHov] = React.useState(false);
            const pct = maxDue > 0 ? Math.round(x.due / maxDue * 100) : 0;
            return (
              <div key={x.short} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ padding: "8px 14px", background: hov ? "var(--bg-2)" : "transparent",
                  borderBottom: i < items.length - 1 ? "1px solid var(--hairline)" : "none",
                  transition: "background 0.13s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: x.color }} />
                    <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 12.5, color: "var(--ink)" }}>{x.short}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {x.due > 0 && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: dueColor(x.due, x.total) }}>{x.due} due</span>}
                    {x.due === 0 && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--done)" }}>✓</span>}
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)" }}>{x.total} cards</span>
                  </div>
                </div>
                <div style={{ height: 3, background: "var(--hairline)", borderRadius: 1.5 }}>
                  <div style={{ height: 3, width: (x.total > 0 ? Math.round(((x.total - x.due) / x.total) * 100) : 0) + "%",
                    background: dueColor(x.due, x.total), borderRadius: 1.5, transition: "width 0.4s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </SidePanel>
    );
  }

  // AI Study Recommendation panel
  function StudyRecommendationPanel() {
    const storageKey = "nb-fc-rec-v1";
    const stored = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { return null; } })();
    const weekStamp = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
    const [rec, setRec] = React.useState(stored && stored.week === weekStamp ? stored.text : null);
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState(null);

    const generate = async () => {
      if (!allDecks.length) return;
      setLoading(true); setErr(null);
      const summary = decksWithDue.slice(0, 6).map(d => {
        const s = subjectBy(d.subject);
        const total = d.cards ? d.cards.length : 0;
        const ret = total > 0 ? Math.round(((total - (d.due || 0)) / total) * 100) : 0;
        return `${d.title} (${s ? s.short : "?"}): ${d.due || 0} cards due, ${ret}% retention`;
      }).join("\n");
      const prompt = `A student has these flashcard decks due for review:\n\n${summary}\n\nWrite ONE short prioritized study recommendation (1 sentence max). Be specific — name the deck and give a reason based on the numbers. Example: "Start with Vocab Unidad 6 — 12 cards due, retention dropping." No greeting, no fluff, just the recommendation.`;
      try {
        const text = await aiComplete(prompt);
        const clean = (text || "").trim();
        setRec(clean);
        try { localStorage.setItem(storageKey, JSON.stringify({ week: weekStamp, text: clean })); } catch {}
      } catch(e) {
        if (e.message === "no-key") setErr("no-key");
        else setErr("Could not generate recommendation.");
      } finally { setLoading(false); }
    };

    React.useEffect(() => {
      if (allDecks.length && !rec && !loading && !err) generate();
    }, [allDecks.length]);

    return (
      <SidePanel title="Study Recommendation" dot="var(--done)" badge="AI">
        <div style={{ padding: "12px 14px" }}>
          {!allDecks.length || !decksWithDue.length ? (
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
              Complete a session to get your first recommendation.
            </div>
          ) : loading ? (
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>Analysing decks…</div>
          ) : err === "no-key" ? (
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
              Complete a session to get your first recommendation.
            </div>
          ) : err ? (
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{err}</div>
          ) : rec ? (
            <div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink)", lineHeight: 1.55, marginBottom: 10 }}>{rec}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Updated this week</span>
                <button onClick={generate} style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, padding: "2px 8px", borderRadius: 4,
                  border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-3)", cursor: "pointer" }}>↻ Refresh</button>
              </div>
            </div>
          ) : null}
        </div>
      </SidePanel>
    );
  }

  // Quick actions + create
  function QuickActionsPanel() {
    return (
      <SidePanel title="Create & Import">
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="sn-btn primary" onClick={() => setCreateOpen(true)}
            style={{ fontSize: 12, justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 8,
              border: "1px solid var(--ink-2)", boxShadow: "0 0 0 1px var(--hairline)" }}>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14 }}>✦</span>
            <span>Generate with AI</span>
          </button>
          <button className="sn-btn ghost" onClick={() => setCreateOpen(true)}
            style={{ fontSize: 12, justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 8 }}>
            <span>+ Create manually</span>
          </button>
          <button className="sn-btn ghost" onClick={() => setImportOpen(true)}
            style={{ fontSize: 12, justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 8 }}>
            <span>↓ Import from Quizlet</span>
          </button>
        </div>
      </SidePanel>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {importOpen && <QuizletImportModal onClose={() => { setImportOpen(false); forceUpdate(); }} />}
      {createOpen && <CreateDeckModal   onClose={() => { setCreateOpen(false); forceUpdate(); }} />}

      <PageHeader
        eyebrow={allDecks.length === 0
          ? "No decks yet · create one below"
          : allDecks.length + " deck" + (allDecks.length !== 1 ? "s" : "") + " · " + totalCards + " cards · " + (totalDue > 0 ? totalDue + " due today" : "all caught up")}
        title="Study"
        italic="workspace."
        meta="Review due cards, track retention, and build new decks."
        actions={<>
          <button className="sn-btn ghost" onClick={() => setImportOpen(true)}>Import Quizlet</button>
          <button className="sn-btn primary" onClick={() => setCreateOpen(true)}>+ New deck</button>
        </>}
      />

      {allDecks.length === 0 ? (
        <div className="sn-card" style={{ padding: "48px 32px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--ink-2)", marginBottom: 10 }}>No flashcard decks yet.</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)", marginBottom: 20, lineHeight: 1.6 }}>
            Generate cards with AI, create manually, or import from Quizlet.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="sn-btn primary" onClick={() => setCreateOpen(true)}>✦ Generate with AI</button>
            <button className="sn-btn ghost" onClick={() => setImportOpen(true)}>Import Quizlet</button>
          </div>
        </div>
      ) : (
        <>
          <div className="pg-section" style={{ animationDelay: "0.15s" }}><MetricsStrip /></div>

          <div className="pg-section" style={{ display: "grid", gridTemplateColumns: "1fr 256px", gap: 16, alignItems: "start", animationDelay: "0.25s" }}>
            {/* Left: Today's review + all decks */}
            <div>
              <TodayReviewPanel />

              {/* All decks header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase",
                  letterSpacing: "0.12em", color: "var(--ink-3)" }}>All Decks · {allDecks.length}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="sn-btn ghost" onClick={() => setCreateOpen(true)} style={{ fontSize: 11, padding: "4px 10px" }}>+ New</button>
                  <button className="sn-btn ghost" onClick={() => setImportOpen(true)} style={{ fontSize: 11, padding: "4px 10px" }}>Import</button>
                </div>
              </div>
              <AllDecksTable />
            </div>

            {/* Right sidebar */}
            <div>
              <ActivityFeed />
              <SubjectFocusPanel />
              <StudyRecommendationPanel />
              <QuickActionsPanel />
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─────────────── Notes index (all subjects' notes)

function NotesIndexContent({ onOpenSubject, onOpenNote }) {
  const store = useNbStore();
  const [searchQuery,    setSearchQuery]    = React.useState("");
  const [searchFocused,  setSearchFocused]  = React.useState(false);
  const [tagFilter,      setTagFilter]      = React.useState(null);

  // ── All notes ───────────────────────────────────────────────────────────────
  const allNotes = React.useMemo(() => {
    const out = [];
    SUBJECTS.forEach(s => {
      const builtin = notesForSubject(s.id);
      const user    = store.notesFor(s.id);
      [...user, ...builtin].forEach(n => out.push({ ...n, subjectId: s.id }));
    });
    return out;
  }, [store]);

  // sort by recency heuristic
  const whenPriority = (w) => {
    if (!w) return 99;
    const s = w.toLowerCase();
    if (/\dm?\s*ago|just now/.test(s) && !s.includes('d ago')) return 1;
    if (s === 'today') return 1;
    if (s === 'yesterday') return 2;
    if (/^(mon|tue|wed|thu|fri|sat|sun)/.test(s)) return 3;
    const dm = s.match(/(\d+)\s*d/);
    if (dm) return 3 + parseInt(dm[1]);
    return 10;
  };

  const sortedNotes = React.useMemo(
    () => [...allNotes].sort((a, b) => whenPriority(a.when) - whenPriority(b.when)),
    [allNotes]
  );

  const notesThisWeek = allNotes.filter(n => whenPriority(n.when) <= 3).length;
  const lastEdited    = sortedNotes[0];

  const subjectNoteCounts = React.useMemo(() => {
    const m = {};
    SUBJECTS.forEach(s => {
      m[s.id] = (store.notesFor(s.id).length || 0) + (notesForSubject(s.id).length || 0);
    });
    return m;
  }, [store]);
  const activeSubject = SUBJECTS.slice().sort((a, b) => (subjectNoteCounts[b.id] || 0) - (subjectNoteCounts[a.id] || 0))[0];

  // tag map
  const tagMap = React.useMemo(() => {
    const m = {};
    allNotes.forEach(n => (n.tags || []).forEach(t => {
      const tag = t.startsWith("#") ? t : "#" + t;
      if (!m[tag]) m[tag] = [];
      m[tag].push(n);
    }));
    return m;
  }, [allNotes]);
  const allTags = Object.keys(tagMap).sort();

  // search + tag filtered notes
  const filteredNotes = React.useMemo(() => {
    let notes = tagFilter ? (tagMap[tagFilter] || []) : sortedNotes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      notes = notes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        subjectBy(n.subjectId)?.name?.toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return notes;
  }, [sortedNotes, tagFilter, tagMap, searchQuery]);

  const searchSuggestions = sortedNotes.slice(0, 6);

  const newNote = () => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "note" } }));

  // ── Sub-components ───────────────────────────────────────────────────────────

  // Sidebar panel shell
  function SidePanel({ title, badge, dot, children }) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderBottom: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {dot && <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot }} />}
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-2)" }}>{title}</span>
          </div>
          {badge && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--ink-3)",
            background: "var(--bg)", border: "1px solid var(--hairline)", padding: "2px 6px", borderRadius: 3 }}>{badge}</span>}
        </div>
        {children}
      </div>
    );
  }

  // Metrics strip
  function MetricsStrip() {
    const items = [
      { label: "Total Notes",      value: allNotes.length || "0", sub: SUBJECTS.length + " subjects", subColor: "var(--ink-3)" },
      { label: "Active Subject",   value: activeSubject ? activeSubject.short : "—",
        sub: activeSubject ? (subjectNoteCounts[activeSubject.id] || 0) + " notes" : "No notes yet",
        subColor: activeSubject ? activeSubject.color : "var(--ink-3)", accent: activeSubject },
      { label: "Last Edited",      value: lastEdited ? lastEdited.title.split(" ").slice(0, 2).join(" ") : "—",
        sub: lastEdited ? lastEdited.when : "No notes yet", subColor: "var(--ink-3)" },
      { label: "Knowledge Growth", value: notesThisWeek > 0 ? "+" + notesThisWeek : "0",
        sub: "notes this week", subColor: notesThisWeek > 0 ? "var(--done)" : "var(--ink-3)", accent: notesThisWeek > 0 },
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {items.map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "13px 15px",
            borderTop: s.accent ? "2px solid " + (typeof s.accent === "object" ? s.accent.color : "var(--done)") : undefined,
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 7 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 20, lineHeight: 1, color: "var(--ink)", marginBottom: 5,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>
    );
  }

  // Smart search bar
  function SearchBar() {
    const showDropdown = searchFocused && (searchQuery.length === 0 || filteredNotes.length > 0);
    const dropNotes = searchQuery.trim() ? filteredNotes.slice(0, 6) : searchSuggestions;
    const actions = [
      { label: "Create New Note", short: "⌘N", action: newNote },
      { label: "Browse by subject",  short: "↓",  action: null },
    ];
    return (
      <div style={{ position: "relative", marginBottom: 16, zIndex: 50 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--surface)",
          border: "1px solid " + (searchFocused ? "var(--accent)" : "var(--hairline)"),
          borderRadius: showDropdown ? "8px 8px 0 0" : 8,
          padding: "0 14px", height: 42,
          boxShadow: searchFocused ? "0 0 0 3px var(--accent-soft)" : "0 1px 3px rgba(26,22,17,0.04)",
          transition: "border-color 0.15s, box-shadow 0.15s, border-radius 0.1s",
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="5"/><line x1="10.5" y1="10.5" x2="14.5" y2="14.5"/>
          </svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
            placeholder="Search notes, subjects, tags…"
            style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--f-ui)", fontSize: 13.5,
              background: "transparent", color: "var(--ink)" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 14, padding: "2px 4px" }}>×</button>
          )}
          <kbd style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)",
            background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 4,
            padding: "2px 6px", boxShadow: "0 1px 0 var(--rule)" }}>⌘K</kbd>
        </div>

        {showDropdown && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "var(--surface)", border: "1px solid var(--accent)",
            borderTop: "1px solid var(--hairline)", borderRadius: "0 0 8px 8px",
            boxShadow: "0 8px 24px rgba(26,22,17,0.10)",
            overflow: "hidden",
          }}>
            {dropNotes.length > 0 && (
              <>
                <div style={{ padding: "7px 14px 4px", fontFamily: "var(--f-mono)", fontSize: 7.5,
                  textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
                  {searchQuery ? "Results" : "Recent Notes"}
                </div>
                {dropNotes.map((n, i) => {
                  const s = subjectBy(n.subjectId);
                  return (
                    <div key={n.id + i} onMouseDown={() => onOpenNote(n.subjectId, n.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
                        cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", whiteSpace: "nowrap" }}>{s.short} · {n.when}</span>
                    </div>
                  );
                })}
                <div style={{ height: 1, background: "var(--hairline)", margin: "2px 0" }} />
              </>
            )}
            <div style={{ padding: "7px 14px 4px", fontFamily: "var(--f-mono)", fontSize: 7.5,
              textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Actions</div>
            {actions.map((a, i) => (
              <div key={i} onMouseDown={a.action || undefined}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 14px", cursor: a.action ? "pointer" : "default", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{a.label}</span>
                <kbd style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)",
                  background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 3, padding: "1px 5px" }}>{a.short}</kbd>
              </div>
            ))}
            <div style={{ height: 6 }} />
          </div>
        )}
      </div>
    );
  }

  // Note row (used in Recent Notes and search results)
  function NoteRow({ n, isLast }) {
    const [hov, setHov] = React.useState(false);
    const s = subjectBy(n.subjectId);
    return (
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={() => onOpenNote(n.subjectId, n.id)}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "9px 14px",
          background: hov ? "var(--bg-2)" : "transparent",
          borderBottom: isLast ? "none" : "1px solid var(--hairline)",
          cursor: "pointer", transition: "background 0.13s",
        }}>
        <div style={{ width: 3, height: 28, borderRadius: 1.5, background: s.color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: "var(--ink)",
            lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.08em",
              color: "var(--ink-3)", background: "var(--bg-2)", border: "1px solid var(--hairline)",
              padding: "1px 5px", borderRadius: 3 }}>{s.short}</span>
            {(n.tags || []).slice(0, 2).map(t => (
              <span key={t} style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--accent)",
                background: "var(--accent-soft)", padding: "1px 5px", borderRadius: 3 }}>
                {t.startsWith("#") ? t : "#" + t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)" }}>{n.when}</div>
        </div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5,
          color: hov ? "var(--accent)" : "var(--ink-3)", transition: "color 0.13s" }}>→</span>
      </div>
    );
  }

  // Recent Notes section
  function RecentNotesSection() {
    const recent = (searchQuery || tagFilter) ? filteredNotes : sortedNotes;
    const shown  = recent.slice(0, 7);
    const title  = searchQuery ? "Search Results" : tagFilter ? "Tag: " + tagFilter : "Recent Notes";
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderBottom: "1px solid var(--hairline)", background: "var(--bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-2)" }}>{title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {tagFilter && (
              <button onClick={() => setTagFilter(null)}
                style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--accent)",
                  background: "none", border: "none", cursor: "pointer", padding: 0 }}>× clear</button>
            )}
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)" }}>{recent.length}</span>
          </div>
        </div>
        {shown.length === 0 ? (
          <div style={{ padding: "20px 14px", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14, textAlign: "center" }}>
            {searchQuery ? "No results for: " + searchQuery : "No notes yet."}
          </div>
        ) : (
          shown.map((n, i) => <NoteRow key={n.subjectId + ":" + n.id} n={n} isLast={i === shown.length - 1} />)
        )}
      </div>
    );
  }

  // Subject library card
  function SubjectCard({ s }) {
    const [hov, setHov] = React.useState(false);
    const notes = [...store.notesFor(s.id), ...notesForSubject(s.id)];
    const noteCount = notes.length;
    const preview = notes.slice(0, 3);
    const lastNote = notes[0];
    const hasNotes = noteCount > 0;
    return (
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? "var(--surface)" : "var(--bg-2)",
          borderTop: "1px solid " + (hov ? s.color + "55" : "var(--hairline)"),
          borderRight: "1px solid " + (hov ? s.color + "55" : "var(--hairline)"),
          borderBottom: "1px solid " + (hov ? s.color + "55" : "var(--hairline)"),
          borderLeft: "3px solid " + s.color,
          borderRadius: 8, padding: "14px 14px 12px",
          transition: "all 0.15s ease",
          boxShadow: hov ? "0 3px 14px " + s.color + "12, 0 1px 4px rgba(26,22,17,0.05)" : "0 1px 2px rgba(26,22,17,0.03)",
          transform: hov ? "translateY(-1px)" : "none",
        }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, cursor: "pointer" }}
          onClick={() => onOpenSubject(s.id)}>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 16, lineHeight: 1.1, color: "var(--ink)" }}>{s.name}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 3 }}>
              {noteCount} note{noteCount !== 1 ? "s" : ""}{lastNote ? " · " + lastNote.when : ""}
            </div>
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5,
            color: hov ? s.color : "var(--ink-3)", transition: "color 0.13s", whiteSpace: "nowrap" }}>Open →</span>
        </div>

        {/* Notes preview */}
        {hasNotes ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {preview.map((n, i) => (
              <div key={n.id} onClick={e => { e.stopPropagation(); onOpenNote(s.id, n.id); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "5px 0", borderBottom: i < preview.length - 1 ? "1px solid var(--hairline)" : "none",
                  cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <span style={{ fontSize: 12, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{n.title}</span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>{n.when}</span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 12.5, color: "var(--ink-3)", marginBottom: 8 }}>No notes yet.</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={e => { e.stopPropagation(); newNote(); }}
                style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--accent)",
                  background: "var(--accent-soft)", border: "1px solid var(--accent)30",
                  borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}>+ Create note</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Knowledge insights sidebar
  function KnowledgeInsights() {
    const longestNote = allNotes.slice().sort((a, b) =>
      ((b.blocks && b.blocks.length) || 0) - ((a.blocks && a.blocks.length) || 0)
    )[0];
    const insightItems = [
      { label: "Most Active",  value: activeSubject ? activeSubject.name : "—",   sub: activeSubject ? (subjectNoteCounts[activeSubject.id] || 0) + " notes" : "" },
      { label: "Last Edited",  value: lastEdited ? lastEdited.title : "—",        sub: lastEdited ? lastEdited.when : "" },
      { label: "Longest Note", value: longestNote ? longestNote.title : "—",      sub: longestNote ? (longestNote.blocks || []).length + " blocks" : "" },
      { label: "Total Tags",   value: allTags.length > 0 ? allTags.length : "0",  sub: allTags.slice(0, 2).join(" ") || "none yet" },
    ];
    return (
      <SidePanel title="Knowledge Insights" dot="var(--accent)">
        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
          {insightItems.map((item, i) => {
            const [hov, setHov] = React.useState(false);
            return (
              <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ padding: "9px 14px", borderBottom: i < insightItems.length - 1 ? "1px solid var(--hairline)" : "none",
                  background: hov ? "var(--bg-2)" : "transparent", transition: "background 0.13s" }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13.5, color: "var(--ink)", lineHeight: 1.2,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.value}</div>
                {item.sub && <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: "var(--ink-3)", marginTop: 2 }}>{item.sub}</div>}
              </div>
            );
          })}
        </div>
        {allTags.length > 0 && (
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--hairline)" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 7 }}>Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  style={{
                    fontFamily: "var(--f-mono)", fontSize: 9, padding: "2px 7px", borderRadius: 10, cursor: "pointer",
                    background: tagFilter === tag ? "var(--accent)" : "var(--bg-2)",
                    color: tagFilter === tag ? "white" : "var(--ink-2)",
                    border: "1px solid " + (tagFilter === tag ? "var(--accent)" : "var(--hairline)"),
                    transition: "all 0.13s",
                  }}>{tag} <span style={{ opacity: 0.6, fontSize: 8 }}>{tagMap[tag].length}</span></button>
              ))}
            </div>
          </div>
        )}
      </SidePanel>
    );
  }

  // AI Knowledge Tools
  function AIKnowledgeTools() {
    const tools = [
      { icon: "✦", label: "Generate study guide",     sub: "AI summary from all notes",    action: () => newNote() },
      { icon: "◈", label: "Summarize subject notes",  sub: "Distill key concepts",          action: null },
      { icon: "⊞", label: "Create flashcard deck",    sub: "Turn notes into study cards",   action: () => window.location.hash = "#/flashcards" },
      { icon: "⊘", label: "Find knowledge gaps",      sub: "Identify missing topics",       action: null },
      { icon: "◎", label: "Explain a concept",        sub: "AI-powered deep dive",          action: () => window.dispatchEvent(new CustomEvent("openAI")) },
    ];
    return (
      <SidePanel title="AI Workspace" dot="var(--ochre)" badge="Powered by AI">
        <div style={{ paddingTop: 2, paddingBottom: 2 }}>
          {tools.map((t, i) => {
            const [hov, setHov] = React.useState(false);
            return (
              <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                onClick={t.action || undefined}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
                  background: hov ? "var(--bg-2)" : "transparent",
                  borderBottom: i < tools.length - 1 ? "1px solid var(--hairline)" : "none",
                  cursor: t.action ? "pointer" : "default", transition: "background 0.13s",
                  opacity: t.action ? 1 : 0.55 }}>
                <span style={{ fontFamily: "var(--f-display)", fontSize: 14, color: "var(--ochre)", width: 18, textAlign: "center", flexShrink: 0 }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.2 }}>{t.label}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 1 }}>{t.sub}</div>
                </div>
                {t.action && <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: hov ? "var(--accent)" : "var(--ink-3)", transition: "color 0.13s", flexShrink: 0 }}>→</span>}
              </div>
            );
          })}
        </div>
      </SidePanel>
    );
  }

  // Quick actions
  function QuickActions() {
    return (
      <SidePanel title="Quick Actions">
        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
          <button className="sn-btn primary" onClick={newNote}
            style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start" }}>
            <span>+ New note</span>
          </button>
          {allTags.length > 0 && (
            <button className="sn-btn ghost" onClick={() => setTagFilter(null)}
              style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start" }}>
              <span>◈ Browse by tag</span>
            </button>
          )}
        </div>
      </SidePanel>
    );
  }

  // Subject library section
  const subjectsWithNotes = SUBJECTS.filter(s => (subjectNoteCounts[s.id] || 0) > 0 || notesForSubject(s.id).length > 0 || store.notesFor(s.id).length > 0);
  const subjectsEmpty = SUBJECTS.filter(s => (subjectNoteCounts[s.id] || 0) === 0 && notesForSubject(s.id).length === 0 && store.notesFor(s.id).length === 0);

  // ── Render ───────────────────────────────────────────────────────────────────
  const eyebrow = allNotes.length === 0
    ? SUBJECTS.length + " subjects · no notes yet"
    : allNotes.length + " notes · " + SUBJECTS.length + " subjects" +
      (lastEdited ? " · last edited " + lastEdited.when : "") +
      (notesThisWeek > 0 ? " · +" + notesThisWeek + " this week" : "");

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title="All your"
        italic="notes."
        meta="Your personal knowledge base — search, browse, and grow."
        actions={<>
          <button className="sn-btn ghost" onClick={newNote}>+ New note</button>
        </>}
      />

      <div className="pg-section" style={{ animationDelay: "0.15s" }}><MetricsStrip /></div>
      <div className="pg-section" style={{ animationDelay: "0.2s" }}><SearchBar /></div>

      <div className="pg-section" style={{ display: "grid", gridTemplateColumns: "1fr 256px", gap: 16, alignItems: "start", animationDelay: "0.28s" }}>
        {/* Left */}
        <div>
          <RecentNotesSection />

          {/* Subject Library */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase",
                letterSpacing: "0.12em", color: "var(--ink-3)" }}>Subject Library · {SUBJECTS.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 10 }}>
              {subjectsWithNotes.map(s => <SubjectCard key={s.id} s={s} />)}
              {subjectsEmpty.map(s => <SubjectCard key={s.id} s={s} />)}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          <KnowledgeInsights />
          <AIKnowledgeTools />
          <QuickActions />
        </div>
      </div>
    </>
  );
}

const SAMPLE_NOTES = {
  "spanish-3": [{ id: "es-pret", title: "Pretérito vs Imperfecto", when: "Mon" }, { id: "es-sub", title: "Subjuntivo intro", when: "last week" }],
  "chem": [{ id: "ch-mol", title: "Molarity & dilutions", when: "today" }, { id: "ch-trends", title: "Periodic trends", when: "Mon" }],
  "studio-art": [{ id: "art-char", title: "Charcoal still life — process", when: "today" }, { id: "art-comp", title: "Composition rules", when: "Apr 30" }],
  "phys-ed": [{ id: "pe-log", title: "May workout log", when: "yesterday" }],
};
function sampleNotesFor(subjectId) {
  return SAMPLE_NOTES[subjectId] || [{ id: "p", title: "Recent notes will appear here", when: "—" }];
}

// ─────────────── Quiz Detail Page — full notes/study tab per quiz

function QuizDetailPage({ quizId }) {
  useNbStore(); // subscribe to store so re-renders on quiz deletions
  const allQuizzes = [...QUIZZES_UPCOMING, ...nbGetQuizzes()];
  const quiz = allQuizzes.find((q) => q.id === quizId);

  const saved = nbGetNoteOverride("quiz-" + quizId) || {};
  const ceRef = React.useRef(null);
  const ceInitialized = React.useRef(false);

  // AI flashcard generation
  const existingDeck = React.useMemo(() => nbGetCustomDecks().find((d) => d.quizId === quizId), [quizId]);
  const [genDeckId, setGenDeckId] = React.useState(existingDeck ? existingDeck.id : null);
  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState("");

  React.useEffect(() => {
    if (ceRef.current && !ceInitialized.current) {
      ceRef.current.innerHTML = saved.content || "";
      ceInitialized.current = true;
    }
  }, []);

  const generateFlashcards = async () => {
    const content = ceRef.current ? ceRef.current.textContent.trim() : (saved.content || "").replace(/<[^>]*>/g, " ").trim();
    if (!content) {
      window.dispatchEvent(new CustomEvent("toast", { detail: "Add notes to your quiz tab first, then generate flashcards." }));
      return;
    }
    setGenerating(true);
    setGenError("");
    const prompt = `Generate 6–10 flashcard Q&A pairs from the following study notes.

Format EXACTLY like this (one pair per two lines, nothing else):
Q: [question or term]
A: [answer or definition]

Study notes:
${content.slice(0, 2000)}`;

    try {
      const text = await aiComplete(prompt);
      // Parse Q / A pairs
      const cards = [];
      let front = null;
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (/^Q:/i.test(trimmed)) { front = trimmed.slice(2).trim(); }
        else if (/^A:/i.test(trimmed) && front) {
          cards.push({ id: "c" + cards.length, front, back: trimmed.slice(2).trim() });
          front = null;
        }
      }
      if (!cards.length) throw new Error("No cards parsed");
      // Remove any old AI deck for this quiz then save fresh one
      const old = nbGetCustomDecks().find((d) => d.quizId === quizId);
      if (old) nbDeleteCustomDeck(old.id);
      const deck = nbAddCustomDeck({ title: quiz.title, subject: quiz.subject, cards, source: "ai", quizId });
      setGenDeckId(deck.id);
      window.dispatchEvent(new CustomEvent("toast", { detail: `Generated ${cards.length} flashcards from your quiz tab ✓` }));
    } catch (e) {
      if (e.message === "no-key") {
        setGenError("__no-key__");
      } else {
        setGenError("Couldn't generate flashcards. Try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  if (!quiz) {
    return (
      <div style={{ padding: "60px 56px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontStyle: "italic", color: "var(--ink-3)" }}>Quiz not found.</div>
        <button className="sn-btn primary" onClick={() => window.location.hash = "#/quizzes"} style={{ marginTop: 18 }}>← Back to Quizzes</button>
      </div>
    );
  }

  const s = subjectBy(quiz.subject) || SUBJECTS[0] || { color: "var(--accent)", short: "??" };
  const isUserQuiz = nbGetQuizzes().some((q) => q.id === quizId);

  const deleteQuiz = () => {
    if (!window.confirm(`Delete "${quiz.title}"?`)) return;
    nbDeleteQuiz(quizId);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Quiz removed" }));
    window.location.hash = "#/quizzes";
  };

  return (
    <div style={{ padding: "32px 56px", maxWidth: 780, overflow: "auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => window.location.hash = "#/quizzes"}
          style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 11, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
          ← Quizzes
        </button>
        <span style={{ color: "var(--hairline)" }}>/</span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{s.short}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 8 }}>
        <div style={{ width: 5, borderRadius: 3, background: s.color, alignSelf: "stretch", minHeight: 40, flexShrink: 0 }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></span>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {s.short} · {quiz.when || quiz.dateStr || "Upcoming"}{quiz.length ? ` · ${quiz.length}` : ""}
            </span>
            {isUserQuiz && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid var(--accent)", borderRadius: 3, padding: "1px 6px" }}>Your Quiz</span>
            )}
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.01em", color: "var(--ink)" }}>
            {quiz.title}
          </div>
        </div>
      </div>

      {/* Confidence meter */}
      {quiz.confidence !== undefined && (
        <div style={{ marginTop: 12, marginBottom: 4, maxWidth: 280 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Confidence</div>
          <ConfidenceMeter value={quiz.confidence} />
        </div>
      )}

      {/* Action row */}
      <div style={{ display: "flex", gap: 8, marginBottom: genError ? 8 : 28, marginTop: 18, flexWrap: "wrap" }}>
        {/* Primary: study the quiz-specific deck, or generate one */}
        {genDeckId ? (
          <button className="sn-btn primary" onClick={() => window.location.hash = "#/quiz/flashcard/" + genDeckId} style={{ fontSize: 12.5 }}>
            {Ico.cards} Practice flashcards →
          </button>
        ) : (
          <button className="sn-btn primary" onClick={generateFlashcards} disabled={generating} style={{ fontSize: 12.5, opacity: generating ? 0.7 : 1 }}>
            {generating ? "Generating…" : "✦ Generate &amp; practice"}
          </button>
        )}
        {genDeckId && (
          <button className="sn-btn ghost" onClick={generateFlashcards} disabled={generating} style={{ fontSize: 12.5 }}>
            {generating ? "Generating…" : "↻ Regenerate cards"}
          </button>
        )}
        <button className="sn-btn ghost" onClick={() => window.location.hash = "#/subject/" + quiz.subject + "/notes"} style={{ fontSize: 12.5 }}>
          Open {s.short} notes →
        </button>
        {isUserQuiz && (
          <button className="sn-btn ghost" onClick={deleteQuiz} style={{ fontSize: 12.5, color: "var(--accent)", marginLeft: "auto" }}>Delete</button>
        )}
      </div>
      {genError && genError !== "__no-key__" && <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--accent)", marginBottom: 20 }}>{genError}</div>}
      {genError === "__no-key__" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "10px 14px", background: "var(--bg-2)", borderRadius: 6, border: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Connect your API key to generate flashcards from your notes.</span>
          <button className="sn-btn primary" style={{ fontSize: 12, flexShrink: 0 }} onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>
        </div>
      )}

      {/* Quiz tab content area */}
      <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
          Quiz tab — study notes &amp; content
        </div>
        <style>{`[contenteditable][data-placeholder]:empty::before { content: attr(data-placeholder); color: var(--ink-3); pointer-events: none; display: block; font-style: italic; }`}</style>
        <div
          ref={ceRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Add key concepts, formulas, vocab, practice problems — anything to study for this quiz…"
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            nbUpdateNoteContent("quiz-" + quizId, { content: html });
          }}
          style={{
            outline: "none", minHeight: 280, fontSize: 14.5, lineHeight: 1.7,
            color: "var(--ink)", fontFamily: "inherit", whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        />
      </div>
    </div>
  );
}



// ─────────────── Tools Dashboard ─────────────────────────────────────────────

// ── Static tool definitions (no usage data here) ──────────────────────────────
const TOOLS_BASE = [
  { id: "claude",     name: "Claude",      category: "AI",
    desc: "Write, code, analyse, and reason — Anthropic's frontier AI.",
    url: "https://claude.ai",             color: "#d97757" },
  { id: "notion",     name: "Notion",      category: "Productivity",
    desc: "All-in-one workspace for notes, wikis, and project management.",
    url: "https://notion.so",             color: "#a0a0a0" },
  { id: "figma",      name: "Figma",       category: "Design",
    desc: "Design and prototype interfaces collaboratively in real time.",
    url: "https://figma.com",             color: "#7c5cfc" },
  { id: "notebooklm", name: "NotebookLM",  category: "AI",
    desc: "Upload your notes and lecture slides — ask AI anything about them.",
    url: "https://notebooklm.google.com", color: "#4285f4" },
  { id: "zapier",     name: "Zapier",      category: "Productivity",
    desc: "Automate repetitive tasks by connecting your apps and workflows.",
    url: "https://zapier.com",            color: "#ff4f00" },
  { id: "canva",      name: "Canva",       category: "Design",
    desc: "Create posters, presentations, and graphics with drag-and-drop.",
    url: "https://canva.com",             color: "#00c4cc" },
  { id: "gemini",     name: "Gemini",      category: "AI",
    desc: "Google's multimodal AI for research, writing, and complex tasks.",
    url: "https://gemini.google.com",     color: "#4f8ef7" },
  { id: "webflow",    name: "Webflow",     category: "Design",
    desc: "Build production-ready websites visually — no code required.",
    url: "https://webflow.com",           color: "#4353ff" },
];

// ── Warm paper color tokens ────────────────────────────────────────────────────
const C = {
  bg:        "var(--bg)",
  bg2:       "var(--bg-2)",
  surface:   "var(--surface)",
  hover:     "var(--bg-2)",
  border:    "var(--hairline)",
  border2:   "var(--rule)",
  ink:       "var(--ink)",
  ink2:      "var(--ink-2)",
  ink3:      "var(--ink-3)",
  green:     "#6b8e5a",
  greenSoft: "#dce6cf",
  red:       "var(--ink)",
  amber:     "var(--ink-2)",
  accent:    "var(--ink-2)",
};

// ── Date helpers ───────────────────────────────────────────────────────────────
function dayKey(offsetDays) {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function formatTs(ts) {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const dy = Math.floor(diff / 86400000);
  if (m < 2)  return "Just now";
  if (m < 60) return m + "m ago";
  if (h < 24) return h + "h ago";
  if (dy === 1) return "Yesterday";
  return dy + "d ago";
}

function getBars(days) {
  const b = [];
  for (let i = 6; i >= 0; i--) b.push((days || {})[dayKey(-i)] || 0);
  return b;
}

function weekTotal(days)  { return getBars(days).reduce((a, x) => a + x, 0); }
function prevWeekTotal(days) {
  let t = 0;
  for (let i = 7; i <= 13; i++) t += (days || {})[dayKey(-i)] || 0;
  return t;
}

function calcTrend(days, totalSessions) {
  if (!totalSessions) return "new";
  const tw = weekTotal(days), pw = prevWeekTotal(days);
  if (!pw && !tw) return "—";
  if (!pw) return "new";
  const pct = Math.round(((tw - pw) / Math.max(pw, 1)) * 100);
  return (pct >= 0 ? "+" : "") + pct + "%";
}

// ── Firebase / localStorage persistence ───────────────────────────────────────
const LS_STATS    = "scholaris_toolstats";
const LS_ACTIVITY = "scholaris_toolactivity";

function getUid() { return window.__fbCurrentUser && window.__fbCurrentUser.uid; }

function recordToolOpen(toolId) {
  const base = TOOLS_BASE.find(t => t.id === toolId);
  const uid  = getUid();
  const today = dayKey(0);
  const yesterday = dayKey(-1);

  if (uid && window.__fbDb) {
    const ref = window.__fbDb.ref("users/" + uid + "/toolStats/" + toolId);
    ref.once("value").then(function(snap) {
      const s = snap.val() || { sessions: 0, streak: 0, lastStreakDay: null, days: {}, lastUsed: null };
      s.sessions = (s.sessions || 0) + 1;
      s.days = s.days || {};
      s.days[today] = (s.days[today] || 0) + 1;
      // prune >30 days
      const cutoff = dayKey(-30);
      Object.keys(s.days).forEach(function(k) { if (k < cutoff) delete s.days[k]; });
      // streak
      if (s.lastStreakDay === today) { /* same day, keep */ }
      else if (s.lastStreakDay === yesterday) s.streak = (s.streak || 0) + 1;
      else s.streak = 1;
      s.lastStreakDay = today;
      s.lastUsed = Date.now();
      ref.set(s);
    });
    // activity log
    const actRef = window.__fbDb.ref("users/" + uid + "/toolActivity");
    actRef.push({ toolId: toolId, toolName: base ? base.name : toolId, ts: Date.now() });
    // trim to 50 entries
    actRef.orderByChild("ts").once("value").then(function(snap) {
      const keys = [];
      snap.forEach(function(c) { keys.push(c.key); });
      if (keys.length > 50) {
        keys.slice(0, keys.length - 50).forEach(function(k) { actRef.child(k).remove(); });
      }
    });
  } else {
    // localStorage fallback
    const all  = JSON.parse(localStorage.getItem(LS_STATS) || "{}");
    const s    = all[toolId] || { sessions: 0, streak: 0, lastStreakDay: null, days: {}, lastUsed: null };
    s.sessions = (s.sessions || 0) + 1;
    s.days = s.days || {};
    s.days[today] = (s.days[today] || 0) + 1;
    const cutoff = dayKey(-30);
    Object.keys(s.days).forEach(function(k) { if (k < cutoff) delete s.days[k]; });
    if (s.lastStreakDay === today) {}
    else if (s.lastStreakDay === yesterday) s.streak = (s.streak || 0) + 1;
    else s.streak = 1;
    s.lastStreakDay = today;
    s.lastUsed = Date.now();
    all[toolId] = s;
    localStorage.setItem(LS_STATS, JSON.stringify(all));

    const activity = JSON.parse(localStorage.getItem(LS_ACTIVITY) || "[]");
    activity.unshift({ toolId: toolId, toolName: base ? base.name : toolId, ts: Date.now() });
    localStorage.setItem(LS_ACTIVITY, JSON.stringify(activity.slice(0, 50)));
    window.dispatchEvent(new CustomEvent("scholaris_statsUpdated"));
  }
}

// ── React hook: subscribe to live stats ───────────────────────────────────────
function useToolStats() {
  const [uid, setUid] = React.useState(getUid);
  const [statsMap, setStatsMap] = React.useState({});
  const [activity, setActivity] = React.useState([]);

  // track auth changes
  React.useEffect(function() {
    function onUser(e) { setUid(e.detail ? e.detail.uid : null); }
    window.addEventListener("fbUserChanged", onUser);
    return function() { window.removeEventListener("fbUserChanged", onUser); };
  }, []);

  React.useEffect(function() {
    if (uid && window.__fbDb) {
      var sRef = window.__fbDb.ref("users/" + uid + "/toolStats");
      var aRef = window.__fbDb.ref("users/" + uid + "/toolActivity");
      sRef.on("value", function(snap) { setStatsMap(snap.val() || {}); });
      aRef.orderByChild("ts").limitToLast(25).on("value", function(snap) {
        var items = [];
        snap.forEach(function(c) { items.unshift(c.val()); });
        setActivity(items);
      });
      return function() { sRef.off(); aRef.off(); };
    } else {
      function load() {
        setStatsMap(JSON.parse(localStorage.getItem(LS_STATS) || "{}"));
        setActivity(JSON.parse(localStorage.getItem(LS_ACTIVITY) || "[]"));
      }
      load();
      window.addEventListener("scholaris_statsUpdated", load);
      window.addEventListener("storage", load);
      return function() {
        window.removeEventListener("scholaris_statsUpdated", load);
        window.removeEventListener("storage", load);
      };
    }
  }, [uid]);

  return { statsMap: statsMap, activity: activity };
}

// ── Merge base + live stats into enriched tool objects ─────────────────────────
function mergeTools(statsMap) {
  return TOOLS_BASE.map(function(base) {
    var s = statsMap[base.id] || {};
    var bars = getBars(s.days);
    var tw   = weekTotal(s.days);
    var trend = calcTrend(s.days, s.sessions || 0);
    return Object.assign({}, base, {
      sessions: s.sessions || 0,
      streak:   s.streak   || 0,
      lastUsed: formatTs(s.lastUsed),
      bars:     bars,
      delta:    tw > 0 ? "+" + tw : null,
      trend:    trend,
      trendUp:  trend !== "new" && trend !== "—" && !trend.startsWith("-"),
      isNew:    !(s.sessions && s.sessions > 0),
      trending: tw >= 3,
    });
  }).sort(function(a, b) { return b.sessions - a.sessions; });
}

// ── Compute live AI suggestions ────────────────────────────────────────────────
function computeSuggestions(tools) {
  var used    = tools.filter(function(t) { return t.sessions > 0; });
  var unused  = tools.filter(function(t) { return t.sessions === 0; });
  var results = [];

  // HIGH: tool used before but not opened today/recently
  var stale = used.filter(function(t) {
    return t.lastUsed !== "Just now" && !t.lastUsed.includes("m ago") && !t.lastUsed.includes("1h ago") && !t.lastUsed.includes("2h ago");
  }).sort(function(a, b) { return b.sessions - a.sessions; });
  if (stale[0]) {
    results.push({ id: "sg1", priority: "HIGH", toolId: stale[0].id, tool: stale[0].name,
      headline: "You haven't opened " + stale[0].name + " recently.",
      detail: stale[0].sessions + " total sessions · Last: " + stale[0].lastUsed,
      cta: "Open" });
  }

  // MED: trending tool this week
  var trending = tools.filter(function(t) { return t.trending && t.sessions > 0; });
  if (trending[0] && (!results[0] || results[0].toolId !== trending[0].id)) {
    results.push({ id: "sg2", priority: "MED", toolId: trending[0].id, tool: trending[0].name,
      headline: trending[0].name + " is your most active tool this week.",
      detail: (trending[0].delta || "+0") + " sessions · " + trending[0].streak + "d streak",
      cta: "Open" });
  }

  // LOW: first unused tool
  if (unused[0]) {
    results.push({ id: "sg3", priority: "LOW", toolId: unused[0].id, tool: unused[0].name,
      headline: "You haven't tried " + unused[0].name + " yet.",
      detail: unused[0].desc.slice(0, 55) + (unused[0].desc.length > 55 ? "…" : ""),
      cta: "Try" });
  }

  // Fallback: if nothing above, generic suggestions
  if (results.length === 0) {
    results = [
      { id: "sg_a", priority: "HIGH", toolId: "claude",     tool: "Claude",
        headline: "Start your first session.", detail: "Open any tool to begin tracking usage.", cta: "Open" },
      { id: "sg_b", priority: "MED",  toolId: "notebooklm", tool: "NotebookLM",
        headline: "Try AI-powered note study.", detail: "Upload lecture slides and ask questions.", cta: "Try" },
      { id: "sg_c", priority: "LOW",  toolId: "figma",      tool: "Figma",
        headline: "Design your next project.", detail: "Collaborate in real time with your team.", cta: "Explore" },
    ];
  }

  return results.slice(0, 3);
}

// ── Format activity for display ────────────────────────────────────────────────
function formatActivity(rawActivity) {
  var now = Date.now();
  var mapped = rawActivity.map(function(item) {
    var diff = now - item.ts;
    var m  = Math.floor(diff / 60000);
    var h  = Math.floor(diff / 3600000);
    var dy = Math.floor(diff / 86400000);
    var time, group;
    if (m < 60)       { time = m < 2 ? "Just now" : m + "m ago"; group = "justnow"; }
    else if (h < 24)  { time = h + "h ago";    group = "today"; }
    else if (dy === 1){ time = "Yesterday";    group = "yesterday"; }
    else              { time = dy + "d ago";   group = "older"; }
    var base = TOOLS_BASE.find(function(t) { return t.id === item.toolId; });
    return {
      id:     String(item.ts) + "_" + item.toolId,
      toolId: item.toolId,
      label:  "Opened " + item.toolName,
      tool:   item.toolName,
      time:   time,
      ts:     item.ts,
      group:  group,
      color:  base ? base.color : "#888",
    };
  }).filter(function(a) { return a.group !== "older"; });

  // Deduplicate: collapse ALL same-tool entries within the same time group (not just consecutive)
  var buckets = {};
  mapped.forEach(function(item) {
    var key = item.group + ":" + item.toolId;
    if (!buckets[key]) {
      buckets[key] = Object.assign({}, item, { count: 1 });
    } else {
      buckets[key].count += 1;
      // keep the most-recent timestamp so ordering is correct
      if (item.ts > buckets[key].ts) buckets[key].ts = item.ts;
    }
  });
  var deduped = Object.values(buckets).map(function(item) {
    return Object.assign({}, item, {
      label: item.count > 1 ? "Opened " + item.tool + " · " + item.count + "×" : "Opened " + item.tool,
    });
  });
  // Sort each group by most-recent first
  deduped.sort(function(a, b) { return b.ts - a.ts; });
  return deduped;
}

// ── ToolIcon ───────────────────────────────────────────────────────────────────
function ToolIcon({ id, color, size = 20 }) {
  const p = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (id) {
    case "figma": return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <rect x="5" y="3" width="7" height="7" rx="3.5"/>
        <rect x="12" y="3" width="7" height="7" rx="3.5"/>
        <rect x="5" y="10" width="7" height="7" rx="3.5"/>
        <circle cx="15.5" cy="13.5" r="3.5"/>
        <rect x="5" y="17" width="7" height="4" rx="2"/>
      </svg>
    );
    case "notebooklm": return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <rect x="4" y="3" width="13" height="16" rx="1.5"/>
        <path d="M4 7h13M7 3v4"/>
        <path d="M8.5 12.5l1.5 1.5 2.5-3" strokeWidth="1.8"/>
        <path d="M19 2l1 2.5 2.5 1-2.5 1L19 9l-1-2.5-2.5-1 2.5-1z" fill={color + "30"} strokeWidth="1.2"/>
      </svg>
    );
    case "notion": return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <rect x="4" y="3" width="16" height="18" rx="2" fill={color + "18"}/>
        <path d="M8 7v10M8 7l8 10M8 7h5" strokeWidth="2"/>
      </svg>
    );
    case "canva": return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9 15c1.2 1.8 3.6 2.3 5.3 1.2 1.7-1.1 2.5-3.5 1.6-5.7C15 8.3 12.5 7 10.2 8S7.3 11.8 8.5 14" strokeWidth="2"/>
      </svg>
    );
    case "claude": return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <circle cx="12" cy="12" r="4" fill={color + "25"}/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="5.6" y1="5.6" x2="8.5" y2="8.5"/>
        <line x1="15.5" y1="15.5" x2="18.4" y2="18.4"/>
        <line x1="5.6" y1="18.4" x2="8.5" y2="15.5"/>
        <line x1="15.5" y1="8.5" x2="18.4" y2="5.6"/>
      </svg>
    );
    case "gemini": return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <path d="M12 2 C12 7.5 16.5 12 22 12 C16.5 12 12 16.5 12 22 C12 16.5 7.5 12 2 12 C7.5 12 12 7.5 12 2 Z" fill={color + "25"} stroke={color} strokeWidth="1.4"/>
      </svg>
    );
    case "webflow": return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="2">
        <path d="M2 9l5 9 3-5.5 2.5 4L16 7l4.5 8.5"/>
      </svg>
    );
    case "zapier": return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" fill={color + "18"}/>
        <path d="M8 8h8l-8 8h8" strokeWidth="2"/>
      </svg>
    );
    default: return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...p} strokeWidth="1.5"><circle cx="12" cy="12" r="8"/></svg>
    );
  }
}

// ── Bar sparkline ──────────────────────────────────────────────────────────────
function BarSparkline({ bars, color, rowIndex }) {
  const max = Math.max(...bars, 1);
  const BW = 5, GAP = 2, H = 28;
  const W = bars.length * BW + (bars.length - 1) * GAP;
  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      {bars.map((v, i) => {
        const h = Math.max(2, (v / max) * H);
        const opacity = i === bars.length - 1 ? 0.85 : 0.22 + (i / bars.length) * 0.45;
        const delay = (0.45 + (rowIndex || 0) * 0.05 + i * 0.03) + "s";
        return <rect key={i} className="tl-bar" x={i * (BW + GAP)} y={H - h} width={BW} height={h} rx="1.5" fill={color} opacity={opacity} style={{ animationDelay: delay }} />;
      })}
    </svg>
  );
}

// ── Tool row ───────────────────────────────────────────────────────────────────
function ToolRow({ tool, rowIndex }) {
  const [hov, setHov] = React.useState(false);
  const COL = "1fr 110px 68px 82px 60px";
  return (
    <a href={tool.url} target="_blank" rel="noopener noreferrer"
      onClick={() => recordToolOpen(tool.id)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="tl-tool-row tl-tool-row-link"
      style={{
        display: "grid", gridTemplateColumns: COL, alignItems: "center",
        padding: "11px 16px", gap: 12,
        background: hov ? C.bg2 : "transparent",
        borderBottom: "1px solid " + C.border,
        textDecoration: "none", color: "inherit",
        cursor: "pointer",
        animationDelay: (0.45 + (rowIndex || 0) * 0.05) + "s",
      }}>
      {/* Tool identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: tool.color + "12", border: "1px solid " + tool.color + "22",
          display: "flex", alignItems: "center", justifyContent: "center",
          filter: "saturate(0.7) brightness(0.88)" }}>
          <ToolIcon id={tool.id} color={tool.color} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 14.5, color: C.ink, fontStyle: "italic", lineHeight: 1 }}>{tool.name}</span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.1em",
              color: C.ink3, background: C.bg2, border: "1px solid " + C.border, padding: "1px 5px", borderRadius: 3 }}>{tool.category}</span>
            {tool.delta && <span className="tl-trend-badge" style={{ fontFamily: "var(--f-mono)", fontSize: 7.5,
              color: C.green, background: C.green + "14", border: "1px solid " + C.green + "30",
              padding: "1px 5px", borderRadius: 3 }}>{tool.delta}</span>}
            {tool.trending && <span style={{ fontFamily: "var(--f-mono)", fontSize: 7, textTransform: "uppercase",
              color: C.amber, background: C.amber + "14", border: "1px solid " + C.amber + "30",
              padding: "1px 5px", borderRadius: 3 }}>↑ trending</span>}
          </div>
          <div style={{ fontSize: 11.5, color: C.ink3, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.desc}</div>
        </div>
      </div>
      {/* Bar chart */}
      <div>
        <BarSparkline bars={tool.bars} color={tool.color} rowIndex={rowIndex} />
        {tool.delta && <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: C.ink3, marginTop: 3 }}>{tool.delta} this wk</div>}
      </div>
      {/* Sessions */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 17, color: C.ink, lineHeight: 1 }}>{tool.sessions}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, color: C.ink3, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>sessions</div>
      </div>
      {/* Last used */}
      <div style={{ textAlign: "right" }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: C.ink2 }}>{tool.lastUsed}</span>
      </div>
      {/* Trend */}
      <div style={{ textAlign: "right" }}>
        {tool.isNew
          ? <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em",
              color: C.ink3, opacity: 0.55, padding: "3px 0" }}>new</span>
          : tool.trending
            ? <span className="tl-trend-pulse tl-trend-badge" style={{ fontFamily: "var(--f-mono)", fontSize: 9,
                color: C.green, background: C.green + "14", border: "1px solid " + C.green + "28",
                padding: "2px 6px", borderRadius: 4, animationDelay: (0.9 + (rowIndex || 0) * 0.05) + "s" }}>↑ {tool.delta}</span>
            : <span style={{ fontFamily: "var(--f-mono)", fontSize: 10,
                color: tool.trendUp ? C.green : (tool.trend === "—" ? C.ink3 : C.red) }}>{tool.trend}</span>
        }
      </div>
    </a>
  );
}

// ── Stats strip ────────────────────────────────────────────────────────────────
function StatsStrip({ tools, activity }) {
  const totalThisWeek = tools.reduce(function(s, t) { return s + (weekTotal(null) || 0); }, 0);
  // compute from merged tools
  const tw = tools.reduce(function(s, t) { return s + (t.delta ? parseInt(t.delta) : 0); }, 0);
  const topTool = tools.filter(function(t) { return t.sessions > 0; })[0];
  const connected = tools.filter(function(t) { return t.sessions > 0; }).length;
  const lastOpened = activity && activity[0];
  const lastBase = lastOpened && TOOLS_BASE.find(function(b) { return b.id === lastOpened.toolId; });

  const items = [
    { label: "This Week",   value: tw > 0 ? String(tw)     : "0",        sub: tw > 0 ? "sessions recorded" : "Open any tool to start", subColor: tw > 0 ? C.green : C.ink3 },
    { label: "Top Tool",    value: topTool ? topTool.name  : "—",        sub: topTool ? topTool.sessions + " total · " + (topTool.delta || "0 this wk") : "No sessions yet", subColor: C.ink3 },
    { label: "Connected",   value: String(connected) + " / " + TOOLS_BASE.length, sub: connected > 0 ? connected + " tools used" : "Use a tool to track it", subColor: C.ink3 },
    { label: "Last Opened", value: lastOpened ? lastOpened.toolName : "—",
      sub: lastOpened ? formatTs(lastOpened.ts) + " · " + (lastBase ? lastBase.category : "") : "No activity yet",
      subColor: C.ink3, valueColor: C.ink },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
      {items.map(function(s, i) {
        return (
          <div key={i} className="tl-stat-card" style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, padding: "13px 15px", animationDelay: (i * 0.1) + "s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.1em", color: C.ink3 }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 20, lineHeight: 1, color: s.valueColor || C.ink, marginBottom: 5 }}>{s.value}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: s.subColor }}>{s.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Suggestions panel ──────────────────────────────────────────────────────────
const SG_PRIO = {
  HIGH: { c: C.red,   bg: C.red   + "12", border: C.red   + "30" },
  MED:  { c: C.amber, bg: C.amber + "12", border: C.amber + "30" },
  LOW:  { c: C.ink3,  bg: C.ink3  + "12", border: C.ink3  + "30" },
};

function SuggestionRow({ s, isLast }) {
  const [hov, setHov] = React.useState(false);
  const ps   = SG_PRIO[s.priority];
  const base = TOOLS_BASE.find(function(t) { return t.id === s.toolId; });
  return (
    <a href={base && base.url} target="_blank" rel="noopener noreferrer"
      onClick={function() { if (base) recordToolOpen(base.id); }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 16px",
        background: hov ? C.bg2 : "transparent",
        borderBottom: isLast ? "none" : "1px solid " + C.border,
        textDecoration: "none", color: "inherit", transition: "background 0.13s", cursor: "pointer" }}>
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: base && base.color, flexShrink: 0 }} />
      <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: base && base.color + "18", border: "1px solid " + (base && base.color + "28"),
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {base && <ToolIcon id={base.id} color={base.color} size={16} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
          <span style={{ fontFamily: "var(--f-display)", fontSize: 13, color: C.ink, fontStyle: "italic" }}>{s.tool}</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.08em",
            color: ps.c, background: ps.bg, border: "1px solid " + ps.border, padding: "2px 5px", borderRadius: 3 }}>· {s.priority}</span>
        </div>
        <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.3, marginBottom: 2 }}>{s.headline}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: C.ink3 }}>{s.detail}</div>
      </div>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: hov ? C.accent : C.ink3,
        textDecoration: "none", whiteSpace: "nowrap", transition: "color 0.13s", flexShrink: 0 }}>{s.cta} →</span>
    </a>
  );
}

function SuggestionsPanel({ suggestions }) {
  return (
    <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid " + C.border, background: C.bg2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink2 }}>Intelligent Suggestions</span>
        </div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.ink3 }}>{suggestions.length} active</span>
      </div>
      {suggestions.length > 0
        ? suggestions.map(function(s, i) { return <SuggestionRow key={s.id} s={s} isLast={i === suggestions.length - 1} />; })
        : <div style={{ padding: "16px", fontFamily: "var(--f-mono)", fontSize: 11, color: C.ink3, textAlign: "center" }}>Open tools to generate personalised suggestions.</div>
      }
    </div>
  );
}

// ── Quick Launch panel ─────────────────────────────────────────────────────────
const QUICK_LAUNCH = [
  { id: "ql1", label: "Ask Claude a question", sub: "Start new conversation", shortcut: "⌘1", toolId: "claude"     },
  { id: "ql2", label: "New Figma file",         sub: "Open design canvas",    shortcut: "⌘2", toolId: "figma"      },
  { id: "ql3", label: "Open NotebookLM",        sub: "Study from your notes", shortcut: "⌘3", toolId: "notebooklm" },
  { id: "ql4", label: "New Notion page",        sub: "Capture or organise",   shortcut: "⌘4", toolId: "notion"     },
];

function QLRow({ ql, isLast }) {
  const [hov, setHov] = React.useState(false);
  const base = TOOLS_BASE.find(function(t) { return t.id === ql.toolId; });
  return (
    <a href={base && base.url} target="_blank" rel="noopener noreferrer"
      onClick={function() { if (base) recordToolOpen(base.id); }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px",
        background: hov ? C.bg2 : "transparent",
        borderBottom: isLast ? "none" : "1px solid " + C.border,
        textDecoration: "none", transition: "background 0.13s" }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0,
        background: base && base.color + "18", border: "1px solid " + (base && base.color + "28"),
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {base && <ToolIcon id={base.id} color={base.color} size={15} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.2 }}>{ql.label}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.ink3, marginTop: 1 }}>{ql.sub}</div>
      </div>
      <kbd style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.ink3,
        background: C.bg2, border: "1px solid " + C.border2, borderRadius: 3,
        padding: "2px 5px", boxShadow: "0 1px 0 " + C.border2, flexShrink: 0 }}>{ql.shortcut}</kbd>
    </a>
  );
}

function QuickLaunchPanel() {
  return (
    <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid " + C.border, background: C.bg2 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink2 }}>Quick Launch</span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.ink3 }}>⌘1–4</span>
      </div>
      {QUICK_LAUNCH.map(function(ql, i) { return <QLRow key={ql.id} ql={ql} isLast={i === QUICK_LAUNCH.length - 1} />; })}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderTop: "1px solid " + C.border, fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.ink3 }}>
        Browse all tools <span>⌘ K</span>
      </div>
    </div>
  );
}

// ── Activity panel ─────────────────────────────────────────────────────────────
function ActRow({ item }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="tl-act-entry"
      style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 14px",
        background: hov ? C.bg2 : "transparent", transition: "background 0.13s" }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: C.ink3, marginTop: 1 }}>{item.tool}</div>
      </div>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: C.ink3, whiteSpace: "nowrap", paddingTop: 1 }}>{item.time}</span>
    </div>
  );
}

function ActivityPanel({ activity, flex }) {
  const groups = [
    { key: "justnow",   label: "Just Now"   },
    { key: "today",     label: "Today"      },
    { key: "yesterday", label: "Yesterday"  },
  ];
  const hasAny = activity && activity.length > 0;
  return (
    <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden", ...(flex ? { flex: 1, display: "flex", flexDirection: "column", minHeight: 0, marginBottom: 0 } : { marginBottom: 10 }) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid " + C.border, background: C.bg2, flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink2 }}>· Activity</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.green }} />
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.green }}>Live</span>
        </div>
      </div>
      <div className="activity-scroll" style={flex ? { flex: 1, overflowY: "auto", minHeight: 0 } : { maxHeight: 200, overflowY: "auto" }}>
        {hasAny ? groups.map(function(g) {
          const items = activity.filter(function(a) { return a.group === g.key; });
          if (!items.length) return null;
          return (
            <div key={g.key}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink3, padding: "7px 14px 2px" }}>· {g.label}</div>
              {items.map(function(a) { return <ActRow key={a.id} item={a} />; })}
            </div>
          );
        }) : (
          <div style={{ padding: "16px 14px", fontFamily: "var(--f-mono)", fontSize: 11, color: C.ink3, textAlign: "center" }}>No activity yet. Open a tool to start tracking.</div>
        )}
      </div>
    </div>
  );
}

// ── Usage Breakdown panel ──────────────────────────────────────────────────────
function UsageRow({ u, isLast, maxSessions }) {
  const [hov, setHov] = React.useState(false);
  const pct = maxSessions > 0 ? Math.round((u.sessions / maxSessions) * 100) : 0;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "9px 14px", borderBottom: isLast ? "none" : "1px solid " + C.border,
        background: hov ? C.bg2 : "transparent", transition: "background 0.13s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontFamily: "var(--f-display)", fontSize: 12.5, color: C.ink }}>{u.name}</span>
          {u.streak > 0 && <span style={{ fontSize: 9 }}>🔥</span>}
          {u.streak > 1 && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: C.amber }}>{u.streak}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: "var(--f-display)", fontSize: 12.5, color: C.ink }}>{u.sessions}</span>
          {u.delta && <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.green }}>{u.delta}</span>}
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.ink3 }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 2, background: C.border, borderRadius: 1 }}>
        <div style={{ height: 2, width: pct + "%", background: u.color, borderRadius: 1 }} />
      </div>
    </div>
  );
}

function UsageBreakdownPanel({ tools, fill }) {
  const top4 = tools.filter(function(t) { return t.sessions > 0; }).slice(0, 4);
  const maxSessions = top4.length > 0 ? top4[0].sessions : 1;
  const outer = fill
    ? { background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }
    : { background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden" };
  return (
    <div style={outer}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid " + C.border, background: C.bg2, flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink2 }}>Usage Breakdown</span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.ink3 }}>all time</span>
      </div>
      {top4.length > 0
        ? top4.map(function(u, i) { return <UsageRow key={u.id} u={u} isLast={i === top4.length - 1} maxSessions={maxSessions} />; })
        : <div style={{ padding: "16px 14px", fontFamily: "var(--f-mono)", fontSize: 11, color: C.ink3, textAlign: "center" }}>No usage data yet.</div>
      }
    </div>
  );
}

// ── Usage Insight panel ────────────────────────────────────────────────────────
function UsageInsightPanel({ tools, fill }) {
  const used = tools.filter(function(t) { return t.sessions > 0; });
  var insight = null;
  if (used.length >= 2) {
    var top = used[0];
    var second = used[1];
    if (top.sessions >= second.sessions * 2) {
      var ratio = Math.round(top.sessions / Math.max(second.sessions, 1));
      var alt = used.find(function(t) { return t.id !== top.id && t.category === "AI"; });
      if (!alt) alt = used.find(function(t) { return t.id !== top.id; });
      insight = "You use " + top.name + " " + ratio + "× more than any other tool this week."
        + (alt ? " Consider exploring " + alt.name + " for study sessions." : "");
    }
  }
  const outer = fill
    ? { background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }
    : { background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden" };
  return (
    <div style={outer}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid " + C.border, background: C.bg2, flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 11, color: "var(--accent)", marginRight: 2 }}>✦</span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink2 }}>Usage Insight</span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        {insight
          ? <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.ink2 }}>{insight}</div>
          : <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: C.ink3, fontSize: 12.5 }}>Use your tools to generate insights.</div>
        }
      </div>
    </div>
  );
}

// ── ToolsContent ───────────────────────────────────────────────────────────────
function ToolsContent() {
  const [filter, setFilter] = React.useState("All");
  const tableRef = React.useRef(null);
  const sidebarRef = React.useRef(null);

  // Match sidebar height to tool table height after every render
  React.useLayoutEffect(function() {
    function sync() {
      if (tableRef.current && sidebarRef.current) {
        sidebarRef.current.style.height = tableRef.current.offsetHeight + "px";
      }
    }
    sync();
    window.addEventListener("resize", sync);
    return function() { window.removeEventListener("resize", sync); };
  });
  const { statsMap, activity } = useToolStats();

  const tools       = mergeTools(statsMap);
  const suggestions = computeSuggestions(tools);
  const activityFmt = formatActivity(activity);

  const categories = ["All", "AI", "Design", "Productivity"];
  const catCounts  = {};
  categories.forEach(function(c) {
    catCounts[c] = c === "All" ? tools.length : tools.filter(function(t) { return t.category === c; }).length;
  });
  const filtered = filter === "All" ? tools : tools.filter(function(t) { return t.category === filter; });
  const COL_HDR  = "1fr 110px 68px 82px 60px";

  return (
    <>
      <PageHeader
        eyebrow={"Workspace · " + TOOLS_BASE.length + " connected"}
        title="Your"
        italic="command center."
        meta={tools.filter(function(t) { return t.sessions > 0; }).length + " tools used · click any tool to track it"}
      />

      <StatsStrip tools={tools} activity={activity} />

      {/* Suggestions (60%) + Usage panels (40%) side by side */}
      <div className="tl-panels-row" style={{ display: "flex", flexDirection: "row", alignItems: "stretch", gap: 16, marginBottom: 16, animationDelay: "0.2s" }}>
        <div style={{ flex: "3", minWidth: 0 }}><SuggestionsPanel suggestions={suggestions} /></div>
        <div style={{ flex: "2", minWidth: 0, display: "flex", flexDirection: "row", alignItems: "stretch", gap: 8 }}>
          <div style={{ flex: "55", display: "flex", flexDirection: "column" }}><UsageBreakdownPanel tools={tools} fill /></div>
          <div style={{ flex: "45", display: "flex", flexDirection: "column" }}><UsageInsightPanel tools={tools} fill /></div>
        </div>
      </div>

      <div className="tl-filter-tabs" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, animationDelay: "0.35s" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {categories.map(function(cat) {
            return (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: "5px 12px", borderRadius: 20,
                border: "1px solid " + (filter === cat ? "var(--accent)" : C.border),
                background: filter === cat ? "var(--accent-soft)" : "transparent",
                color: filter === cat ? "var(--accent-ink)" : C.ink3,
                fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em",
                cursor: "pointer", transition: "all 0.13s",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {cat} <span style={{ opacity: 0.5, fontSize: 8.5 }}>{catCounts[cat]}</span>
              </button>
            );
          })}
        </div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.ink3 }}>{filtered.length} tools</span>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Tool table — natural content height */}
        <div ref={tableRef} style={{ flex: 1, minWidth: 0, background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden" }}>
          <div className="tl-table-header" style={{ display: "grid", gridTemplateColumns: COL_HDR, padding: "8px 16px", borderBottom: "1px solid " + C.border, gap: 12, background: C.bg2, animationDelay: "0.4s" }}>
            {[["Tool","left"],["To Activity","left"],["Sessions","right"],["Last Used","right"],["Trend","right"]].map(function(pair) {
              return <div key={pair[0]} style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.1em", color: C.ink3, textAlign: pair[1] }}>{pair[0]}</div>;
            })}
          </div>
          {filtered.map(function(tool, i) { return <ToolRow key={tool.id} tool={tool} rowIndex={i} />; })}
        </div>

        {/* Sidebar — height set to match tool table via JS ref */}
        <div ref={sidebarRef} className="tl-sidebar" style={{ width: 256, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", animationDelay: "0.3s" }}>
          <QuickLaunchPanel />
          <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.bg2, flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink2 }}>· Activity</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.green }} />
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, color: C.green }}>Live</span>
              </div>
            </div>
            <div className="activity-scroll" style={{ overflowY: "auto", flex: 1, minHeight: 0, scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {activityFmt && activityFmt.length > 0
                ? [{ key: "justnow", label: "Just Now" }, { key: "today", label: "Today" }, { key: "yesterday", label: "Yesterday" }].map(function(g) {
                    var items = activityFmt.filter(function(a) { return a.group === g.key; });
                    if (!items.length) return null;
                    return (
                      <div key={g.key}>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 7.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink3, padding: "7px 14px 2px" }}>· {g.label}</div>
                        {items.map(function(a) { return <ActRow key={a.id} item={a} />; })}
                      </div>
                    );
                  })
                : <div style={{ padding: "16px 14px", fontFamily: "var(--f-mono)", fontSize: 11, color: C.ink3, textAlign: "center" }}>No activity yet. Open a tool to start tracking.</div>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


Object.assign(window, { ToolsContent, QuizzesContent, TakeQuiz, ScheduleContent, GradesContent, FlashcardsContent, NotesIndexContent, PracticeCard, QuizDetailPage });
