// Subject Overview — per-class dashboard

function SubjectTodayWidget({ subject: s, onOpenNotes, onOpenQuiz }) {
  const sched = nbGetSchedule();
  const now = new Date();
  const todayMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];

  const todayPeriod = sched.find((p) => p.subject === s.id);
  const subjectQuiz = QUIZZES_UPCOMING.find((q) => q.subject === s.id);
  const todayHW = [...HOMEWORK, ...nbGetHomework()].filter((h) => h.subject === s.id && !h.done && (h.due === "Tonight" || h.due === "Tomorrow"));

  let sessionStatus = null;
  if (todayPeriod) {
    const start = schedToMinutes(todayPeriod.time);
    const end = todayPeriod.end ? schedToMinutes(todayPeriod.end) : start + 50;
    if (todayMinutes >= start && todayMinutes < end) sessionStatus = "now";
    else if (todayMinutes < start) sessionStatus = "upcoming";
    else sessionStatus = "done";
  }

  const isEmpty = !todayPeriod && todayHW.length === 0 && !subjectQuiz;
  if (isEmpty) return null;

  return (
    <div className="sn-card pg-section" style={{ marginBottom: 22, borderLeft: `4px solid ${s.color}`, display: "flex", gap: 20, alignItems: "stretch", background: sessionStatus === "now" ? s.color + "0d" : undefined, animationDelay: "0s" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-3)", marginBottom: 8 }}>
          {todayDayName} · Today's {s.short} snapshot
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {todayPeriod && (
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 2 }}>Class</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1 }}>
                {todayPeriod.time}
                {sessionStatus === "now" && <span style={{ marginLeft: 8, fontFamily: "var(--f-mono)", fontSize: 10, color: s.color, textTransform: "uppercase" }}>· IN SESSION</span>}
                {sessionStatus === "upcoming" && <span style={{ marginLeft: 8, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase" }}>· upcoming</span>}
                {sessionStatus === "done" && <span style={{ marginLeft: 8, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase" }}>· done for today</span>}
              </div>
              {todayPeriod.note && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{todayPeriod.note}</div>}
            </div>
          )}
          {todayHW.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 2 }}>Due</div>
              {todayHW.slice(0, 2).map((h) => (
                <div key={h.id} style={{ fontFamily: "var(--f-display)", fontSize: 15, lineHeight: 1.3 }}>
                  {h.title} <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: h.urgent ? "var(--accent)" : "var(--ink-3)" }}>{h.due}</span>
                </div>
              ))}
            </div>
          )}
          {subjectQuiz && (
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 2 }}>Quiz</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 15 }}>{subjectQuiz.when} · {subjectQuiz.title.slice(0, 30)}</div>
              <ConfidenceMeter value={subjectQuiz.confidence} />
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
        <button className="sn-btn ghost" onClick={() => onOpenNotes(s.id)} style={{ fontSize: 12 }}>Open notes</button>
        {subjectQuiz && <button className="sn-btn ghost" onClick={() => onOpenQuiz("mcq")} style={{ fontSize: 12 }}>Practice →</button>}
      </div>
    </div>
  );
}

function DeckRow({ d, i, allDecks, mastery, due, masteryColor, isCustom, onOpen, onDelete }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onOpen} className="pg-card-lift"
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0",
        borderBottom: i < allDecks.length - 1 ? "1px dashed var(--hairline)" : "none", cursor: "pointer" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{(d.cards || []).length} CARDS</div>
          {due > 0 && <div className="mono" style={{ fontSize: 10, color: "var(--accent)" }}>{due} DUE</div>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {isCustom && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "2px 5px",
              fontFamily: "var(--f-mono)", fontSize: 10, color: hov ? "var(--danger, #c0392b)" : "var(--ink-3)",
              opacity: hov ? 1 : 0, transition: "opacity 0.15s, color 0.15s", borderRadius: 3,
            }}
            title="Delete deck">✕</button>
        )}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 600, color: masteryColor }}>{mastery}%</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>mastery</div>
        </div>
        <span style={{ color: "var(--ink-3)", fontSize: 12 }}>→</span>
      </div>
    </div>
  );
}

function SubjectOverviewContent({ subjectId, onOpenNotes, onOpenQuiz, onOpenHomework }) {
  const s = subjectBy(subjectId);
  if (!s) return null;
  const store = useNbStore();
  const subjectHW = [...HOMEWORK, ...nbGetHomework()].filter((h) => h.subject === subjectId);
  const openHW = subjectHW.filter((h) => !h.done);
  const urgentCount = openHW.filter(h => h.urgent).length;
  const subjectQuiz = QUIZZES_UPCOMING.find((q) => q.subject === subjectId);
  const userNotes = store.notesFor ? store.notesFor(subjectId) : [];
  const subjectNotes = [...userNotes, ...notesForSubject(subjectId)].slice(0, 4);
  const [classInfoOpen, setClassInfoOpen] = React.useState(false);

  const masteryFor = (id) => {
    const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.round(40 + (hash % 50));
  };
  const dueFor = (id) => Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 9;

  // Make the shell's scrollable container a flex column so percentage heights resolve correctly
  React.useEffect(() => {
    const el = document.querySelector(".sn-content");
    if (!el) return;
    const prev = { display: el.style.display, flexDirection: el.style.flexDirection };
    el.style.display = "flex";
    el.style.flexDirection = "column";
    return () => {
      el.style.display = prev.display;
      el.style.flexDirection = prev.flexDirection;
    };
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <SubjectTodayWidget subject={s} onOpenNotes={onOpenNotes} onOpenQuiz={onOpenQuiz} />

      {/* Page header — subject identity with color presence */}
      <div className="pg-header" style={{ display: "flex", gap: 0, marginBottom: 22, alignItems: "stretch", animationDelay: "0.05s",
        background: `linear-gradient(135deg, ${s.color}12 0%, transparent 50%)`,
        borderRadius: "var(--radius-lg)", padding: "20px 22px 20px",
        border: `1px solid ${s.color}28`,
        marginLeft: -4, marginRight: -4,
      }}>
        {/* Color identity bar */}
        <div style={{ width: 5, alignSelf: "stretch", background: s.color, borderRadius: 3, minHeight: 80, flexShrink: 0, marginRight: 20, boxShadow: `0 0 16px ${s.color}50` }}></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Subject glyph + meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <SubjectGlyph id={subjectId} size={13} color={s.color} />
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
              {s.short}{s.period ? ` · Period ${s.period}` : ""}{s.room && s.room !== "—" ? ` · Rm ${s.room}` : ""}{s.teacher && s.teacher !== "—" ? ` · ${s.teacher}` : ""}
            </div>
          </div>
          {/* Big subject name */}
          <h1 className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 40, lineHeight: 1.05, margin: "0 0 6px", letterSpacing: "-0.015em", color: "var(--ink)" }}>
            {s.name}
          </h1>
          <div style={{ fontSize: 13, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: "var(--ink-2)" }}>{s.notes} notes</span>
            <span style={{ opacity: 0.35 }}>·</span>
            <span style={{ color: "var(--ink-2)" }}>{subjectHW.length} assignments</span>
            <span style={{ opacity: 0.35 }}>·</span>
            <span style={{ color: "var(--ink-2)" }}>{s.quizzes} quizzes this term</span>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center", flexShrink: 0 }}>
          <button className="sn-btn ghost" onClick={() => setClassInfoOpen(true)} style={{ fontSize: 12 }}>Class info</button>
          <button className="sn-btn" onClick={() => onOpenNotes(subjectId)} style={{ fontSize: 12 }}>Open notes →</button>
        </div>
      </div>

      {/* Stat strip — hero grade card + 3 supporting stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 12, marginBottom: 22 }}>

        {/* HERO: Grade card */}
        <div className="sn-card pg-stat stat-hero" style={{
          minHeight: 116, animationDelay: "0.1s",
          background: `linear-gradient(150deg, ${s.color}18 0%, var(--surface) 48%)`,
          borderLeft: `3px solid ${s.color}`,
        }}>
          <div className="sn-card-title"><span>Grade · this term</span></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
            {s.grade && s.grade !== "—"
              ? <div style={{ fontFamily: "var(--f-display)", fontSize: 56, lineHeight: 1, color: s.color, letterSpacing: "-0.03em", textShadow: `0 0 28px ${s.color}40` }}>{s.grade}</div>
              : <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, lineHeight: 1, color: "var(--ink-3)" }}>No grade yet</div>
            }
          </div>
          <SubjectSparkline color={s.color} />
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 7 }}>
            <span style={{ color: "var(--done)" }}>↑ 2.4 pts</span> · since last report
          </div>
        </div>

        {/* Open work */}
        <div className="sn-card pg-stat" style={{ minHeight: 116, animationDelay: "0.14s" }}>
          <div className="sn-card-title"><span>Open work</span></div>
          {openHW.length === 0 ? (
            <>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 26, lineHeight: 1, color: "var(--done)", marginBottom: 5 }}>All clear</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>nothing due</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: 1, color: urgentCount > 0 ? "var(--danger)" : "var(--ink)" }}>{openHW.length}</div>
              <div className="mono" style={{ fontSize: 10, color: urgentCount > 0 ? "var(--danger)" : "var(--ink-3)", marginTop: 5 }}>
                {urgentCount > 0 ? `${urgentCount} URGENT` : "open items"}
              </div>
            </>
          )}
        </div>

        {/* Next class */}
        <div className="sn-card pg-stat" style={{ minHeight: 116, animationDelay: "0.18s" }}>
          <div className="sn-card-title"><span>Next class</span></div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 32, lineHeight: 1.0, marginBottom: 5 }}>Wed</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>10:10 AM</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>RM {(s.room || "—").toUpperCase()}</div>
        </div>

        {/* Quiz confidence — readiness ring */}
        <div className="sn-card pg-stat" style={{ minHeight: 116, animationDelay: "0.22s" }}>
          <div className="sn-card-title"><span>Quiz readiness</span></div>
          {subjectQuiz ? (() => {
            const conf = Math.round(subjectQuiz.confidence * 100);
            const rColor = subjectQuiz.confidence >= 0.7 ? "var(--done)" : subjectQuiz.confidence >= 0.5 ? "var(--ochre)" : "var(--danger)";
            const r = 20, circ = 2 * Math.PI * r;
            const dash = (subjectQuiz.confidence * circ).toFixed(1);
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* SVG ring */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="26" cy="26" r={r} fill="none" stroke="var(--hairline)" strokeWidth="4"/>
                    <circle cx="26" cy="26" r={r} fill="none" stroke={rColor} strokeWidth="4"
                      strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-display)", fontSize: 13, color: rColor, fontWeight: 400, lineHeight: 1 }}>{conf}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 500, lineHeight: 1.25, color: "var(--ink)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {subjectQuiz.title.length > 30 ? subjectQuiz.title.slice(0, 28) + "…" : subjectQuiz.title}
                  </div>
                  <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{subjectQuiz.when}</div>
                </div>
              </div>
            );
          })() : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 2 }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: "var(--ink-3)", lineHeight: 1.35 }}>No quiz on the horizon.</div>
              <a onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "quiz" } }))}
                style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textDecoration: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Schedule one →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 2-col body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, flex: 1 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div className="sn-card pg-section" style={{ minHeight: 160, animationDelay: "0.28s" }}>
            <h3 className="sn-card-title">
              <span>Recent notes</span>
              <a className="mono" onClick={() => onOpenNotes(subjectId)} style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }}>ALL NOTES →</a>
            </h3>
            {subjectNotes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {subjectNotes.map((n) => (
                  <div key={n.id} onClick={() => onOpenNotes(subjectId, n.id)} className="pg-card-lift" style={{ paddingBottom: 10, borderBottom: "1px dashed var(--hairline)", cursor: "pointer", borderRadius: 3 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{n.title}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{n.when}</div>
                    </div>
                    {n.blocks && n.blocks[0] && (
                      <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {(n.blocks.find((b) => b.type === "p") || n.blocks[0]).text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 0", gap: 8, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 28, color: "var(--ink-3)", opacity: 0.35, lineHeight: 1 }}>¶</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 15, lineHeight: 1.35 }}>No notes for {s.short} yet.</div>
                <a onClick={() => onOpenNotes(subjectId)} style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textDecoration: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>Open notes to start →</a>
              </div>
            )}
          </div>

          <div className="sn-card pg-section" style={{ minHeight: 140, animationDelay: "0.36s" }}>
            <h3 className="sn-card-title">
              <span>Homework</span>
              <a className="mono" onClick={() => onOpenHomework()} style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }}>ALL →</a>
            </h3>
            {subjectHW.length > 0 ? (
              <HomeworkList items={subjectHW} compact />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0", gap: 8, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-3)", lineHeight: 1 }}>✓</div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 15, lineHeight: 1.35 }}>Nothing due for {s.short}.</div>
                <a onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))}
                  style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textDecoration: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Add homework →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {subjectQuiz && (
            <div className="sn-card pg-section" style={{ borderLeft: `3px solid ${s.color}`, animationDelay: "0.22s" }}>
              <h3 className="sn-card-title"><span>Upcoming quiz</span></h3>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.2 }}>{subjectQuiz.title}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{subjectQuiz.when.toUpperCase()} · {subjectQuiz.length}</div>
              <div style={{ marginTop: 12 }}>
                <ConfidenceMeter value={subjectQuiz.confidence} />
              </div>
              <button className="sn-btn primary" onClick={() => onOpenQuiz("mcq")} style={{ width: "100%", marginTop: 14, justifyContent: "center" }}>Practice now →</button>
            </div>
          )}

          <div className="sn-card pg-section" style={{ minHeight: 160, animationDelay: "0.3s" }}>
            <h3 className="sn-card-title">
              <span>Flashcard decks</span>
              <a onClick={() => onOpenQuiz("flashcard")} className="mono" style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }}>ALL →</a>
            </h3>
            {(() => {
              const builtinDecks = Object.entries(DECKS)
                .filter(([_, d]) => d.subject === s.id)
                .map(([id, d]) => ({ id, ...d }));
              const customDecks = nbGetCustomDecks().filter(d => d.subject === s.id);
              const allDecks = [...builtinDecks, ...customDecks];

              const createDeck = () => {
                const title = window.prompt("Deck name (e.g. Unit 3 Vocab, Chapter 5 Terms)");
                if (!title || !title.trim()) return;
                const rec = nbAddCustomDeck({ title: title.trim(), subject: s.id, cards: [] });
                window.dispatchEvent(new CustomEvent("toast", { detail: `"${rec.title}" created — open Flashcards to add cards` }));
              };

              if (allDecks.length === 0) {
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 0", gap: 10, textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 26, color: "var(--ink-3)", opacity: 0.3, lineHeight: 1 }}>◈</div>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 15, lineHeight: 1.35 }}>No decks for {s.short} yet.</div>
                    <button className="sn-btn ghost" onClick={createDeck}
                      style={{ fontSize: 11.5, marginTop: 2 }}>+ Create deck</button>
                  </div>
                );
              }
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {allDecks.map((d, i) => {
                    const mastery = masteryFor(d.id);
                    const due = dueFor(d.id);
                    const masteryColor = mastery >= 75 ? "var(--done)" : mastery >= 55 ? "var(--ochre)" : "var(--ink-3)";
                    const isCustom = d.id && d.id.startsWith("deck-");
                    return (
                      <DeckRow key={d.id} d={d} i={i} allDecks={allDecks}
                        mastery={mastery} due={due} masteryColor={masteryColor} isCustom={isCustom}
                        onOpen={() => onOpenQuiz("flashcard", d.id)}
                        onDelete={() => {
                          if (window.confirm(`Delete "${d.title}"? This cannot be undone.`)) {
                            nbDeleteCustomDeck(d.id);
                            window.dispatchEvent(new CustomEvent("toast", { detail: `"${d.title}" deleted` }));
                          }
                        }}
                      />
                    );
                  })}
                  <div style={{ paddingTop: 8, textAlign: "right" }}>
                    <button className="sn-btn ghost" onClick={createDeck}
                      style={{ fontSize: 11, padding: "3px 8px" }}>+ Create deck</button>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="sn-card paper pg-section" style={{ animationDelay: "0.38s" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Margin note · pinned</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.4, borderLeft: "2px solid var(--accent)", paddingLeft: 12 }}>
              {s.id === "ap-bio" && "Lab report needs three graphs (not two) + outliers discussion."}
              {s.id === "ap-lit" && "Sethe's milk: nourishment AND theft. Use for the body paragraph on motherhood."}
              {s.id === "alg2" && "When in doubt on double-angle, substitute cos²θ = 1 − sin²θ and see what cancels."}
              {!["ap-bio", "ap-lit", "alg2"].includes(s.id) && "Tap any note to pin a margin annotation here for next class."}
            </div>
            <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>— Tue 10:24 · class</div>
          </div>
        </div>
      </div>
      {classInfoOpen && <ClassInfoModal subjectId={subjectId} onClose={() => setClassInfoOpen(false)} />}
    </div>
  );
}

function SubjectSparkline({ color }) {
  const pts   = [78, 82, 80, 85, 84, 87, 90, 89];
  const dates = ["Jan 18", "Feb 1", "Feb 15", "Mar 1", "Mar 15", "Apr 1", "Apr 15", "May 1"];
  const w = 120, h = 36;
  const max = 100, min = 70;
  const [tip, setTip] = React.useState(null);

  const coords = pts.map((p, i) => ({
    x: (i / (pts.length - 1)) * w,
    y: h - ((p - min) / (max - min)) * h,
    value: p,
    date: dates[i],
  }));

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
        <path d={path} fill="none" stroke={color} strokeWidth="2" />
        {coords.map((c, i) => (
          <circle key={i}
            cx={c.x} cy={c.y}
            r={i === coords.length - 1 ? 3.5 : 3}
            fill={i === coords.length - 1 ? color : "var(--surface)"}
            stroke={color} strokeWidth="1.5"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setTip({ x: c.x, y: c.y, value: c.value, date: c.date })}
            onMouseLeave={() => setTip(null)}
          />
        ))}
      </svg>
      {tip && (
        <div style={{
          position: "absolute",
          left: tip.x,
          top: tip.y - 38,
          transform: "translateX(-50%)",
          background: "var(--ink)",
          color: "var(--bg)",
          borderRadius: 5,
          padding: "3px 8px",
          fontFamily: "var(--f-mono)",
          fontSize: 10.5,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
        }}>
          {tip.value}% · {tip.date}
        </div>
      )}
    </div>
  );
}

function NoteSamplesForSubject({ subjectId, onOpen }) {
  const placeholders = {
    "ap-lit": ["Beloved — motifs of memory", "The Great Gatsby — green light", "Toni Morrison — voice & rhythm"],
    "alg2": ["Double-angle identities", "Law of sines", "Inverse trig functions"],
    "us-hist": ["Federalist No. 10 — factions", "Causes of the Civil War", "Reconstruction amendments"],
    "spanish-3": ["Pretérito vs Imperfecto", "Subjuntivo — when to use", "Vocabulario Unidad 6"],
    "chem": ["Molarity & dilutions", "Periodic trends", "Stoichiometry"],
    "studio-art": ["Charcoal techniques", "Composition rules", "Color theory basics"],
    "phys-ed": ["Workout log — May", "Mile time tracking"],
  };
  const list = placeholders[subjectId] || ["Notes will appear here"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((t, i) => (
        <div key={i} onClick={onOpen} style={{ paddingBottom: 10, borderBottom: i < list.length - 1 ? "1px dashed var(--hairline)" : "none", cursor: "pointer" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{t}</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{["yesterday", "Mon", "last week", "Apr 30", "Apr 28"][i % 5]}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { SubjectOverviewContent });
