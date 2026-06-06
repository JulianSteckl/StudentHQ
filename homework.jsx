// Homework — redesigned: document-first layout + prominent AI actions

// ── HomeworkList (unchanged — also used by dashboard widgets) ──
function HomeworkList({ items: initial, compact = false, onOpen, onDelete }) {
  const [items, setItems] = React.useState(initial);
  const [draggingId, setDraggingId] = React.useState(null);
  const [overId, setOverId] = React.useState(null);

  React.useEffect(() => setItems(initial), [initial]);

  const toggle = (id, e) => {
    if (e) e.stopPropagation();
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it));
  };

  const onDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", id); };
  const onDragOver  = (e, id) => { e.preventDefault(); if (id !== overId) setOverId(id); };
  const onDrop = (e, id) => {
    e.preventDefault();
    if (!draggingId || draggingId === id) { setDraggingId(null); setOverId(null); return; }
    setItems((prev) => {
      const from = prev.findIndex((x) => x.id === draggingId);
      const to   = prev.findIndex((x) => x.id === id);
      const next = [...prev]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved);
      return next;
    });
    setDraggingId(null); setOverId(null);
  };
  const onDragEnd = () => { setDraggingId(null); setOverId(null); };

  return (
    <div>
      {items.map((h) => {
        const s = subjectBy(h.subject);
        return (
          <div key={h.id}
            className={`hw-row ${h.done ? "done" : ""} ${draggingId === h.id ? "dragging" : ""} ${overId === h.id ? "over" : ""}`}
            draggable onClick={() => { if (onOpen) onOpen(h); }}
            onDragStart={(e) => onDragStart(e, h.id)} onDragOver={(e) => onDragOver(e, h.id)}
            onDrop={(e) => onDrop(e, h.id)} onDragEnd={onDragEnd}
            style={{ cursor: onOpen ? "pointer" : "grab" }}
          >
            <div className={`hw-check ${h.done ? "done" : ""}`} onClick={(e) => toggle(h.id, e)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={h.done ? "var(--bg)" : "transparent"} strokeWidth="2.2" strokeLinecap="round">
                <path className="tick" d="M3 8l3.5 3.5L13 5" />
              </svg>
            </div>
            <div className="hw-subject-dot" style={{ background: s.color }}></div>
            <div className="hw-title">{h.title}{!compact && <span className="tag">· {h.tag}</span>}</div>
            <div className={`hw-meta ${h.urgent && !h.done ? "urgent" : ""}`}>{h.due}{h.dueNote ? ` · ${h.dueNote}` : ""} · {h.est}</div>
            <span className="hw-handle" onClick={(e) => e.stopPropagation()}>{Ico.drag}</span>
            <button title="Delete" onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(h.id); }}
              style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, opacity: 0.45, display: "grid", placeItems: "center" }}>×</button>
          </div>
        );
      })}
    </div>
  );
}

// ── HomeworkPage (standalone shell for design canvas) ──
function HomeworkPage({ density = "default" }) {
  return (
    <div className={`sn-root density-${density}`} style={{ height: "100%" }}>
      <div className="sn-app">
        <Sidebar active="homework" />
        <main className="sn-main">
          <Topbar placeholder="Search homework…" />
          <div className="sn-content"><HomeworkContent /></div>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ── Homework utility helpers ──
// ─────────────────────────────────────────────────────────────────────

function hwDueScore(due) {
  const d = (due || "").toLowerCase().trim();
  if (d === "tonight" || d === "today") return 0;
  if (d === "tomorrow") return 1;
  const days = { mon: 2, tue: 3, wed: 4, thu: 5, fri: 6, sat: 7, sun: 8 };
  for (const [k, v] of Object.entries(days)) if (d.startsWith(k)) return v;
  if (d.includes("next")) return 10;
  return 8;
}

function hwEstMins(est) {
  if (!est) return 0;
  let m = 0;
  const h = est.match(/(\d+)\s*h/); if (h) m += +h[1] * 60;
  const mn = est.match(/(\d+)\s*m/); if (mn) m += +mn[1];
  return m;
}

function hwFmtTime(mins) {
  if (!mins) return "0m";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

// ─────────────────────────────────────────────────────────────────────
// ── HomeworkContent — Premium task command center ──
// ─────────────────────────────────────────────────────────────────────
function HomeworkContent() {
  const [subjectFilter, setSubjectFilter] = React.useState(null);
  const [dragInfo, setDragInfo] = React.useState(null);
  const [overCol, setOverCol] = React.useState(null);
  const [colOverrides, setColOverrides] = React.useState({});
  const store = useNbStore();
  const allHW = React.useMemo(() => [...HOMEWORK, ...store.homework], [store.homework]);

  const getCol = React.useCallback((h) => {
    if (colOverrides[h.id]) return colOverrides[h.id];
    if (h.done) return "completed";
    if (h.urgent) return "urgent";
    const score = hwDueScore(h.due);
    if (score <= 1) return "this-week";
    if (score <= 6) return "this-week";
    return "upcoming";
  }, [colOverrides]);

  const openHW    = allHW.filter(h => !h.done);
  const urgentHW  = allHW.filter(h => h.urgent && !h.done);
  const todayHW   = allHW.filter(h => hwDueScore(h.due) === 0 && !h.done);
  const doneHW    = allHW.filter(h => h.done);
  const totalMins = openHW.reduce((a, h) => a + hwEstMins(h.est), 0);
  const pct       = allHW.length > 0 ? Math.round(doneHW.length / allHW.length * 100) : 0;

  const priorities    = [...openHW].sort((a, b) => hwDueScore(a.due) - hwDueScore(b.due)).slice(0, 3);
  const priorityMins  = priorities.reduce((a, h) => a + hwEstMins(h.est), 0);

  const subjectCounts = SUBJECTS.map(s => ({
    ...s,
    open: allHW.filter(h => h.subject === s.id && !h.done).length,
    done: allHW.filter(h => h.subject === s.id && h.done).length,
  })).filter(s => s.open + s.done > 0).sort((a, b) => b.open - a.open);
  const maxCount = Math.max(...subjectCounts.map(s => s.open + s.done), 1);

  const timelineGroups = [
    { label: "Today",     color: "var(--danger)", items: openHW.filter(h => hwDueScore(h.due) === 0) },
    { label: "Tomorrow",  color: "var(--accent)", items: openHW.filter(h => hwDueScore(h.due) === 1) },
    { label: "This Week", color: "var(--ink-2)",  items: openHW.filter(h => { const s = hwDueScore(h.due); return s >= 2 && s <= 6; }) },
    { label: "Next Week", color: "var(--ink-3)",  items: openHW.filter(h => hwDueScore(h.due) >= 7) },
  ].filter(g => g.items.length > 0);

  const COLS = [
    { id: "urgent",    label: "Urgent",    dotColor: "var(--danger)" },
    { id: "this-week", label: "This Week", dotColor: "var(--accent)" },
    { id: "upcoming",  label: "Upcoming",  dotColor: "var(--info)" },
    { id: "completed", label: "Completed", dotColor: "var(--done)" },
  ];

  const colItems = (colId) => {
    const base = subjectFilter ? allHW.filter(h => h.subject === subjectFilter) : allHW;
    const items = base.filter(h => getCol(h) === colId);
    if (colId !== "completed") items.sort((a, b) => hwDueScore(a.due) - hwDueScore(b.due));
    return items;
  };

  const toggleDone = (id) => {
    const b = HOMEWORK.find(h => h.id === id);
    if (b) b.done = !b.done;
    if (store.homework.some(h => h.id === id)) nbToggleHomework(id);
    setColOverrides(prev => { const n = {...prev}; delete n[id]; return n; });
  };

  const deleteHw = (id) => {
    if (store.homework.some(h => h.id === id)) nbDeleteHomework(id);
    else { const idx = HOMEWORK.findIndex(h => h.id === id); if (idx >= 0) HOMEWORK.splice(idx, 1); }
    window.dispatchEvent(new CustomEvent("toast", { detail: "Task deleted" }));
    setColOverrides(prev => { const n = {...prev}; delete n[id]; return n; });
  };

  const onKanbanDrop = (e, colId) => {
    e.preventDefault();
    if (!dragInfo) return;
    const { id } = dragInfo;
    const hw = allHW.find(x => x.id === id);
    if (!hw) return;
    if (colId === "completed" && !hw.done) toggleDone(id);
    else if (colId !== "completed" && hw.done) toggleDone(id);
    if (colId !== "completed") setColOverrides(prev => ({ ...prev, [id]: colId }));
    else setColOverrides(prev => { const n = {...prev}; delete n[id]; return n; });
    setDragInfo(null); setOverCol(null);
  };

  const subjectsInList = SUBJECTS.filter(s => allHW.some(h => h.subject === s.id));
  const topSubject = subjectCounts[0];

  return (
    <>
      {/* ── PAGE HEADER ── */}
      <div className="pg-header" style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>
          Workload · This Week
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 400, margin: 0, lineHeight: 1.05, letterSpacing: "-0.015em" }}>
            Homework, <em style={{ fontStyle: "italic", color: "var(--accent)" }}>all of it.</em>
          </h1>
          <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
            {subjectsInList.map(s => (
              <button key={s.id} onClick={() => setSubjectFilter(subjectFilter === s.id ? null : s.id)} style={{
                display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 100,
                border: "1px solid " + (subjectFilter === s.id ? s.color : "var(--hairline)"),
                background: subjectFilter === s.id ? s.color + "22" : "transparent",
                color: subjectFilter === s.id ? s.color : "var(--ink-3)",
                fontSize: 11.5, cursor: "pointer", fontFamily: "var(--f-ui)", transition: "all .12s",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 1, background: s.color, flexShrink: 0 }} />
                {s.short}
              </button>
            ))}
            <button className="sn-btn primary" style={{ fontSize: 12.5 }}
              onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))}>
              + Add
            </button>
          </div>
        </div>
        <div className="sn-ornament" style={{ margin: "10px 0 6px" }} />
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>
          {openHW.length > 0 ? (
            <>
              <span>{openHW.length} open</span>
              {urgentHW.length > 0 && <> · <span style={{ color: "var(--danger)" }}>{urgentHW.length} urgent</span></>}
              {todayHW.length > 0 && <> · <span style={{ color: "var(--accent)" }}>{todayHW.length} due today</span></>}
              {totalMins > 0 && <> · {hwFmtTime(totalMins)} estimated</>}
            </>
          ) : "Nothing due — enjoy the break ✓"}
        </div>
      </div>

      {/* ── METRICS ROW ── */}
      <div className="pg-section" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 22, animationDelay: "0.15s" }}>
        {[
          { label: "Open Work",  numVal: openHW.length,   suffix: "", sub: "assignments",    isNum: true },
          { label: "Urgent",     numVal: urgentHW.length, suffix: "", sub: "need attention", isNum: true,  accent: urgentHW.length > 0 ? "var(--danger)" : null },
          { label: "Due Today",  numVal: todayHW.length,  suffix: "", sub: "assignments",    isNum: true,  accent: todayHW.length > 0 ? "var(--accent)" : null },
          { label: "Est. Time",  numVal: null, textVal: hwFmtTime(totalMins), sub: "remaining",      isNum: false },
          { label: "Completion", numVal: pct,  suffix: "%",               sub: `${doneHW.length} of ${allHW.length} done`, isNum: true },
        ].map((m, i) => (
          <div key={i}
            style={{
              background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius)",
              padding: "13px 14px", cursor: "default",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--rule)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(30,20,8,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--hairline)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7 }}>{m.label}</div>
            <div style={{ fontFamily: m.isNum ? "var(--f-display)" : "var(--f-mono)", fontSize: m.isNum ? 26 : 18, fontWeight: 400, lineHeight: 1, color: m.accent || "var(--ink)", letterSpacing: m.isNum ? "-0.02em" : "0" }}>
              {m.numVal != null
                ? <StatNumber value={m.numVal} suffix={m.suffix} delay={300 + i * 100} duration={1400} />
                : (m.textVal || "—")}
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 6 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TODAY'S FOCUS ── */}
      {priorities.length > 0 && (
        <div className="pg-section" style={{
          background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius-lg)",
          padding: "18px 20px", marginBottom: 22, animationDelay: "0.25s",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                <span style={{ color: "var(--accent)", fontSize: 11, opacity: 0.8 }}>✦</span>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Today's Focus</div>
              </div>
              {priorities.map((h, i) => {
                const s = subjectBy(h.subject);
                return (
                  <div key={h.id} onClick={() => window.location.hash = "#/homework/" + h.id}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", cursor: "pointer", borderBottom: i < priorities.length - 1 ? "1px solid var(--hairline)" : "none", transition: "opacity .1s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", width: 16, flexShrink: 0, paddingTop: 2 }}>{i + 1}.</div>
                    <div style={{ width: 2.5, height: 32, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.3, color: "var(--ink)" }}>{h.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: h.urgent ? "var(--danger)" : "var(--ink-3)", marginTop: 3 }}>
                        {h.due}{h.dueNote ? ` · ${h.dueNote}` : ""}{h.est ? ` · ${h.est}` : ""}
                      </div>
                    </div>
                    {h.urgent && (
                      <span style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "2px 5px", borderRadius: 2, background: "rgba(255,255,255,0.08)", color: "var(--danger)", flexShrink: 0, marginTop: 1 }}>urgent</span>
                    )}
                  </div>
                );
              })}
              {priorityMins > 0 && (
                <div style={{ marginTop: 12, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>
                  Estimated workload: <span style={{ color: "var(--ink)" }}>{hwFmtTime(priorityMins)}</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, paddingTop: 26, minWidth: 172 }}>
              <button className="sn-btn primary" style={{ fontSize: 12, justifyContent: "flex-start" }}
                onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "study-plan" } }))}>
                Generate Study Plan →
              </button>
              <button className="sn-btn" style={{ fontSize: 12, justifyContent: "flex-start" }}>
                Create Focus Session →
              </button>
              {priorities[0] && (
                <button className="sn-btn ghost" style={{ fontSize: 12, justifyContent: "flex-start" }}
                  onClick={() => window.location.hash = "#/homework/" + priorities[0].id}>
                  Open Highest Priority →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN GRID: Kanban + Side Panel ── */}
      <div className="pg-section" style={{ display: "grid", gridTemplateColumns: "1fr 228px", gap: 18, marginBottom: 24, animationDelay: "0.35s" }}>

        {/* ── KANBAN BOARD ── */}
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 10 }}>
            Assignment Board
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 9 }}>
            {COLS.map(col => {
              const items = colItems(col.id);
              const isOver = overCol === col.id;
              return (
                <div key={col.id}
                  onDragOver={e => { e.preventDefault(); setOverCol(col.id); }}
                  onDrop={e => onKanbanDrop(e, col.id)}
                  onDragLeave={() => setOverCol(null)}
                  style={{
                    background: isOver ? "var(--accent-soft)" : "var(--bg-2)",
                    border: "1px solid " + (isOver ? "var(--accent)" : "var(--hairline)"),
                    borderRadius: "var(--radius)", padding: "10px 8px", minHeight: 200,
                    transition: "background .12s, border-color .12s",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 9, paddingBottom: 7, borderBottom: "1px solid var(--hairline)" }}>
                    <div style={{ width: 5, height: 5, borderRadius: 1, background: col.dotColor, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)", flex: 1 }}>{col.label}</span>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)" }}>{items.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.length === 0 ? (
                      <div style={{ padding: "18px 0", textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Empty
                      </div>
                    ) : items.map(h => (
                      <HwKanbanCard key={h.id} hw={h}
                        onToggle={() => toggleDone(h.id)}
                        onDelete={() => deleteHw(h.id)}
                        onDragStart={e => { setDragInfo({ id: h.id }); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", h.id); }}
                        onDragEnd={() => { setDragInfo(null); setOverCol(null); }}
                        isDragging={dragInfo && dragInfo.id === h.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SIDE PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

          {/* Homework by Subject */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius)", padding: "13px 14px" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 11 }}>Homework by Subject</div>
            {subjectCounts.length === 0 ? (
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>No assignments</div>
            ) : subjectCounts.slice(0, 7).map(s => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-2)" }}>{s.short}</span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{s.open}</span>
                </div>
                <div style={{ height: 2.5, background: "var(--hairline)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: ((s.open + s.done) / maxCount * 100) + "%", background: s.color, opacity: 0.65, transition: "width .3s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Deadline Timeline */}
          {timelineGroups.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius)", padding: "13px 14px" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 11 }}>Deadline Timeline</div>
              {timelineGroups.map((g, gi) => (
                <div key={g.label} style={{ marginBottom: gi < timelineGroups.length - 1 ? 10 : 0 }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.08em", color: g.color, marginBottom: 4 }}>{g.label}</div>
                  {g.items.map((h, hi) => {
                    const s = subjectBy(h.subject);
                    return (
                      <div key={h.id} onClick={() => window.location.hash = "#/homework/" + h.id}
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "3.5px 0", cursor: "pointer", borderBottom: hi < g.items.length - 1 ? "1px dashed var(--hairline)" : "none", transition: "opacity .1s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.65"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        <div style={{ width: 4, height: 4, borderRadius: 1, background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: "var(--ink-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</span>
                        {h.est && <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", flexShrink: 0 }}>{h.est}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius)", padding: "13px 14px" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 10 }}>Quick Actions</div>
            {[
              { label: "+ Add Homework",       action: () => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } })) },
              { label: "+ Generate Study Plan", action: () => {} },
              { label: "+ Create Flashcards",   action: () => { window.location.hash = "#/quizzes"; } },
              { label: "+ Open Due Today",       action: () => { if (todayHW[0]) window.location.hash = "#/homework/" + todayHW[0].id; } },
              { label: "+ Start Focus Session",  action: () => {} },
            ].map((a, i) => (
              <button key={i} onClick={a.action}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "6.5px 8px",
                  background: "transparent", border: "1px solid var(--hairline)", borderRadius: 4,
                  cursor: "pointer", fontFamily: "var(--f-ui)", fontSize: 11.5, color: "var(--ink-2)",
                  marginBottom: i < 4 ? 5 : 0, transition: "all .1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.background = "var(--bg-2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--hairline)"; e.currentTarget.style.color = "var(--ink-2)"; e.currentTarget.style.background = "transparent"; }}>
                {a.label}
              </button>
            ))}
          </div>

          {/* Productivity Insights */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--radius)", padding: "13px 14px" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 11 }}>This Week</div>
            {[
              { label: "Completed",       val: String(doneHW.length) },
              { label: "Open",            val: String(openHW.length) },
              { label: "Avg. completion", val: "1.3d early" },
              { label: "Most active",     val: topSubject ? topSubject.short : "—" },
            ].map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5.5px 0", borderBottom: i < 3 ? "1px solid var(--hairline)" : "none" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink)" }}>{m.val}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {allHW.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0 40px" }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--ink-3)", marginBottom: 18 }}>
            No assignments yet.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))}>Add Homework</button>
            <button className="sn-btn" onClick={() => {}}>Generate Study Plan</button>
            <button className="sn-btn ghost" onClick={() => { window.location.hash = "#/notes"; }}>Import from Notes</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ── HwKanbanCard ──
// ─────────────────────────────────────────────────────────────────────
function HwKanbanCard({ hw, onToggle, onDelete, onDragStart, onDragEnd, isDragging }) {
  const s = subjectBy(hw.subject);
  return (
    <div
      draggable
      onClick={() => window.location.hash = "#/homework/" + hw.id}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        background: "var(--surface)", border: "1px solid var(--hairline)",
        borderRadius: "var(--radius)", overflow: "hidden", cursor: "pointer",
        opacity: isDragging ? 0.4 : 1,
        transition: "box-shadow .13s, transform .13s, opacity .13s, border-color .13s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 3px 14px rgba(30,20,8,0.11)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--rule)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--hairline)"; }}
    >
      <div style={{ height: 2, background: s.color, opacity: hw.done ? 0.25 : 1 }} />
      <div style={{ padding: "9px 10px 9px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: s.color, flexShrink: 0 }}>{s.short}</span>
          {hw.urgent && !hw.done && (
            <span style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "1px 4px", borderRadius: 2, background: "rgba(255,255,255,0.08)", color: "var(--danger)", flexShrink: 0 }}>urgent</span>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={e => { e.stopPropagation(); onToggle(); }} style={{
            width: 15, height: 15, borderRadius: 7.5, flexShrink: 0,
            border: "1px solid " + (hw.done ? "var(--done)" : "var(--hairline)"),
            background: hw.done ? "var(--done)" : "transparent",
            cursor: "pointer", display: "grid", placeItems: "center", transition: "all .1s",
          }}>
            {hw.done && <svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M3 8l3.5 3.5L13 5" /></svg>}
          </button>
        </div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 12.5, lineHeight: 1.3, marginBottom: 7, color: hw.done ? "var(--ink-3)" : "var(--ink)", textDecoration: hw.done ? "line-through" : "none" }}>
          {hw.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 9.5, fontFamily: "var(--f-mono)", padding: "1px 5px", borderRadius: 3, background: hw.urgent && !hw.done ? "rgba(255,255,255,0.06)" : "var(--bg-2)", color: hw.urgent && !hw.done ? "var(--danger)" : "var(--ink-3)" }}>
            {hw.due}
          </span>
          {hw.est && <span style={{ fontSize: 9, fontFamily: "var(--f-mono)", color: "var(--ink-3)" }}>{hw.est}</span>}
          <div style={{ flex: 1 }} />
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 12, padding: "0 1px", opacity: 0.3, lineHeight: 1, transition: "opacity .1s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.3"}>×</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ── PDF page canvas renderer ──
// ─────────────────────────────────────────────────────────────────────
function PdfPageCanvas({ url, pageNum }) {
  const canvasRef = React.useRef(null);
  const [status, setStatus] = React.useState("loading"); // loading | ok | error

  React.useEffect(() => {
    if (!canvasRef.current || !window.pdfjsLib) { setStatus("error"); return; }
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const pdf  = await window.pdfjsLib.getDocument({ url }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(pageNum);
        if (cancelled) return;
        const vp   = page.getViewport({ scale: 1.6 });
        const canvas = canvasRef.current;
        canvas.width  = vp.width;
        canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
        if (!cancelled) setStatus("ok");
      } catch (err) {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, [url, pageNum]);

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: "100%", display: "block", borderRadius: 3 }} />
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(240,237,230,0.7)", borderRadius: 3 }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>Rendering…</span>
        </div>
      )}
      {status === "error" && (
        <div style={{ padding: 20, textAlign: "center", color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 11 }}>
          Could not render page {pageNum}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ── DocViewer — document display + upload zone ──
// ─────────────────────────────────────────────────────────────────────
function DocViewer({ hwId, subjectColor }) {
  const store = useNbStore();
  const files    = store.attachmentsFor("hw", hwId);
  const viewable = files.filter((f) => f.type.startsWith("image/") || f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
  const [activeIdx, setActiveIdx]       = React.useState(0);
  const [pdfPages, setPdfPages]         = React.useState({});   // id → numPages
  const [pdfCurrent, setPdfCurrent]     = React.useState({});   // id → currentPage
  const [dragOver, setDragOver]         = React.useState(false);
  const [uploading, setUploading]       = React.useState(false);
  const inputRef = React.useRef(null);

  const active  = viewable[Math.min(activeIdx, viewable.length - 1)] || null;
  const isPdf   = active && (active.type === "application/pdf" || active.name.toLowerCase().endsWith(".pdf"));
  const isImage = active && active.type.startsWith("image/");

  const handleFiles = async (list) => {
    if (!list || !list.length) return;
    setUploading(true);
    for (const f of Array.from(list)) {
      if (f.size > 20 * 1024 * 1024) { window.dispatchEvent(new CustomEvent("toast", { detail: `${f.name} too large (max 20 MB)` })); continue; }
      await nbAddAttachment("hw", hwId, f);
    }
    setUploading(false);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Attached ✓" }));
  };

  // Load page counts for newly seen PDFs
  React.useEffect(() => {
    viewable.forEach((f) => {
      if (!isPdfFile(f) || pdfPages[f.id] !== undefined || !window.pdfjsLib) return;
      window.pdfjsLib.getDocument({ url: f.url }).promise.then((doc) => {
        setPdfPages((p)   => ({ ...p, [f.id]: doc.numPages }));
        setPdfCurrent((p) => ({ ...p, [f.id]: p[f.id] || 1 }));
      }).catch(() => {});
    });
  }, [viewable.length]);

  function isPdfFile(f) { return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"); }

  const curPage   = active && isPdf ? (pdfCurrent[active.id] || 1) : 1;
  const totalPages = active && isPdf ? (pdfPages[active.id] || 0) : 0;
  const setPage = (n) => { if (!active) return; setPdfCurrent((p) => ({ ...p, [active.id]: Math.max(1, Math.min(totalPages || 1, n)) })); };

  // ── empty state ──
  if (viewable.length === 0) {
    return (
      <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{
          flex: 1, minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          border: "2px dashed " + (dragOver ? "var(--accent)" : "var(--hairline)"),
          borderRadius: 10, background: dragOver ? "var(--accent-soft)" : "var(--bg-2)",
          cursor: "pointer", transition: "all .15s", gap: 12, padding: "40px 24px",
        }}>
        <input ref={inputRef} type="file" multiple accept="application/pdf,image/*"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ opacity: 0.25 }}>
          <rect x="7" y="3" width="24" height="32" rx="2" stroke="var(--ink)" strokeWidth="1.5"/>
          <path d="M24 3v9h7" stroke="var(--ink)" strokeWidth="1.5"/>
          <path d="M13 42h18M22 34v8" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 17, color: "var(--ink-2)" }}>
            {uploading ? "Uploading…" : dragOver ? "Drop here to attach" : "Attach your homework document"}
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>
            PDF · JPG · PNG · up to 20 MB
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, gap: 8 }}>
      {/* File tabs */}
      {viewable.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
          {viewable.map((f, i) => (
            <button key={f.id} onClick={() => setActiveIdx(i)} style={{
              padding: "4px 11px", borderRadius: 4, fontSize: 11.5,
              border: "1px solid " + (activeIdx === i ? "var(--ink)" : "var(--hairline)"),
              background: activeIdx === i ? "var(--ink)" : "var(--surface)",
              color: activeIdx === i ? "var(--bg)" : "var(--ink-2)",
              cursor: "pointer", fontFamily: "var(--f-mono)",
              maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{f.name}</button>
          ))}
          <input ref={inputRef} type="file" multiple accept="application/pdf,image/*"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
          <button onClick={() => inputRef.current && inputRef.current.click()} style={{
            padding: "4px 10px", borderRadius: 4, fontSize: 11.5, border: "1px dashed var(--hairline)",
            background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontFamily: "var(--f-mono)",
          }}>+ Add file</button>

          {/* Page nav (PDF) */}
          {isPdf && totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
              <button onClick={() => setPage(curPage - 1)} disabled={curPage <= 1}
                style={{ width: 26, height: 26, borderRadius: 4, border: "1px solid var(--hairline)", background: "var(--surface)", cursor: "pointer", display: "grid", placeItems: "center", opacity: curPage <= 1 ? 0.35 : 1, color: "var(--ink-2)", fontSize: 16 }}>‹</button>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                {curPage} / {totalPages}
              </span>
              <button onClick={() => setPage(curPage + 1)} disabled={curPage >= totalPages}
                style={{ width: 26, height: 26, borderRadius: 4, border: "1px solid var(--hairline)", background: "var(--surface)", cursor: "pointer", display: "grid", placeItems: "center", opacity: curPage >= totalPages ? 0.35 : 1, color: "var(--ink-2)", fontSize: 16 }}>›</button>
            </div>
          )}
        </div>
      )}

      {/* Viewer */}
      <div style={{ flex: 1, overflowY: "auto", background: "#4a4540", borderRadius: 8, display: "flex", justifyContent: "center", padding: "20px 16px", minHeight: 200 }}>
        {isPdf && active ? (
          <div style={{ width: "100%", maxWidth: 680, background: "white", borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            <PdfPageCanvas url={active.url} pageNum={curPage} key={active.id + "-" + curPage} />
          </div>
        ) : isImage && active ? (
          <img src={active.url} alt={active.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }} />
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ── mdToHtml — shared markdown renderer ──
// ─────────────────────────────────────────────────────────────────────
function mdToHtml(md) {
  const CALLOUTS = {
    TIP:       { bg: "#f0f9f4", border: "#6b8e5a", icon: "💡", label: "Tip",       color: "#2d6b3a" },
    NOTE:      { bg: "#eef4ff", border: "#5a7a99", icon: "📌", label: "Note",      color: "#2a4a7a" },
    IMPORTANT: { bg: "#fffbee", border: "#b58a3b", icon: "⭐", label: "Important", color: "#7a5a00" },
    WARNING:   { bg: "#fff4f4", border: "#c04040", icon: "⚠️", label: "Warning",   color: "#8a2020" },
    CAUTION:   { bg: "#fff4f4", border: "#c04040", icon: "🚨", label: "Caution",   color: "#8a2020" },
    EXAMPLE:   { bg: "#f5f0ff", border: "#7a4e6e", icon: "✅", label: "Example",   color: "#4a2060" },
  };
  const blocks = [];
  const stash = (html) => { const i = blocks.length; blocks.push(html); return `__NB_BLOCK_${i}__`; };
  let h = md;
  h = h.replace(/```mermaid\n?([\s\S]*?)```/g, (_, code) => stash(`<pre style="background:#f5f4f0;border:1px solid var(--hairline);border-radius:8px;padding:14px 16px;font-size:11.5px;overflow-x:auto;color:var(--ink-2);font-family:var(--f-mono);line-height:1.6;margin:10px 0"><span style="display:block;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink-3);margin-bottom:8px">🔀 Mermaid Diagram</span>${code.trim()}</pre>`));
  h = h.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => stash(`<pre style="background:var(--bg-2);border:1px solid var(--hairline);border-radius:6px;padding:10px 12px;font-size:12px;font-family:var(--f-mono);margin:8px 0">${code.trim()}</pre>`));
  h = h.replace(/^> \[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION|EXAMPLE)\]\n((?:> [^\n]*\n?)*)/gm, (_, type, body) => {
    const cd = CALLOUTS[type] || CALLOUTS.NOTE;
    const content = body.replace(/^> ?/gm, "").trim().replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
    return stash(`<div style="border-left:3px solid ${cd.border};background:${cd.bg};border-radius:0 8px 8px 0;padding:10px 14px;margin:10px 0"><div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${cd.color};margin-bottom:5px">${cd.icon} ${cd.label}</div><div style="font-size:13px;line-height:1.65">${content.replace(/\n/g, "<br>")}</div></div>`);
  });
  h = h.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  h = h.replace(/((?:\|.+\|\n)+)/g, (table) => {
    const rows = table.trim().split("\n").filter(r => !/^\|[-| :]+\|$/.test(r.trim()));
    const html = rows.map((r, i) => { const cells = r.split("|").slice(1,-1); const tag = i===0?"th":"td"; const thSt="padding:8px 12px;border:1px solid var(--hairline);background:var(--bg-2);font-weight:600;font-size:11.5px;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-3);"; const tdSt="padding:7px 12px;border:1px solid var(--hairline);font-size:13px;"; return `<tr>${cells.map(c=>`<${tag} style="${i===0?thSt:tdSt}">${c.trim()}</${tag}>`).join("")}</tr>`; });
    return `<div style="overflow-x:auto;margin:12px 0"><table style="border-collapse:collapse;width:100%;font-size:13px">${html.join("")}</table></div>`;
  });
  h = h.replace(/^# (.+)$/gm, '<h1 style="font-family:var(--f-display);font-size:22px;font-weight:700;margin:24px 0 10px">$1</h1>');
  h = h.replace(/^## (.+)$/gm, '<h2 style="font-family:var(--f-display);font-size:17px;font-weight:700;margin:20px 0 7px;padding-bottom:5px;border-bottom:1px solid var(--hairline)">$1</h2>');
  h = h.replace(/^### (.+)$/gm, '<h3 style="font-family:var(--f-display);font-size:14.5px;font-weight:600;margin:14px 0 5px">$1</h3>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink)">$1</strong>');
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
  h = h.replace(/`([^`]+)`/g, '<code style="background:var(--bg-2);padding:1px 5px;border-radius:3px;font-family:var(--f-mono);font-size:11.5px">$1</code>');
  h = h.replace(/^[-•*] (.+)$/gm, '<li style="margin:3px 0;padding-left:2px">$1</li>');
  h = h.replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0;padding-left:2px">$1</li>');
  h = h.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, m => `<ul style="padding-left:20px;margin:6px 0">${m}</ul>`);
  h = h.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--hairline);margin:18px 0">');
  h = h.replace(/__NB_BLOCK_(\d+)__/g, (_, i) => blocks[+i]);
  h = h.replace(/\n/g, "<br>");
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ── HomeworkDetailPage — document-first layout ──
// ─────────────────────────────────────────────────────────────────────
function HomeworkDetailPage({ hwId }) {
  const store = useNbStore();
  const allHW = [...HOMEWORK, ...store.homework];
  const hw    = allHW.find((h) => h.id === hwId);

  const saved = nbGetNoteOverride("hw-" + hwId) || {};
  const [content, setContent]     = React.useState(saved.content || "");
  const [done, setDone]           = React.useState(hw ? hw.done : false);
  const [notesOpen, setNotesOpen] = React.useState(!!(saved.content && saved.content.replace(/<[^>]+>/g,"").trim()));
  const ceRef          = React.useRef(null);
  const ceInitialized  = React.useRef(false);

  React.useEffect(() => {
    if (ceRef.current && !ceInitialized.current) {
      ceRef.current.innerHTML = saved.content || "";
      ceInitialized.current   = true;
    }
  }, []);

  if (!hw) {
    return (
      <div style={{ padding: "60px 56px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontStyle: "italic", color: "var(--ink-3)" }}>Homework not found.</div>
        <button className="sn-btn primary" onClick={() => window.location.hash = "#/homework"} style={{ marginTop: 18 }}>← Back</button>
      </div>
    );
  }

  const s      = subjectBy(hw.subject);
  const isDone = done || hw.done;

  const insertNotes = (text) => {
    const html = mdToHtml(text);
    if (ceRef.current) ceRef.current.innerHTML = html;
    nbUpdateNoteContent("hw-" + hwId, { content: html });
    setContent(html);
    setNotesOpen(true);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Notes inserted ✓" }));
  };

  const toggleDone = () => {
    nbToggleHomework(hw.id);
    const b = HOMEWORK.find(h => h.id === hw.id);
    if (b) b.done = !b.done;
    setDone(d => !d);
    window.dispatchEvent(new CustomEvent("toast", { detail: done ? "Marked as open" : "Marked as done ✓" }));
  };

  const deleteHw = () => {
    if (!window.confirm(`Delete "${hw.title}"?`)) return;
    if (store.homework.some(h => h.id === hw.id)) nbDeleteHomework(hw.id);
    else { const idx = HOMEWORK.findIndex(h => h.id === hw.id); if (idx >= 0) HOMEWORK.splice(idx, 1); }
    window.dispatchEvent(new CustomEvent("toast", { detail: "Deleted" }));
    window.location.hash = "#/homework";
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>

      {/* ── LEFT: document area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 28px 24px 32px", overflow: "hidden", minWidth: 0, gap: 14 }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button onClick={() => window.location.hash = "#/homework"} style={{ border: 0, background: "transparent", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 11, padding: 0, fontWeight: 500 }}>
            ← Homework
          </button>
          <span style={{ color: "var(--hairline)" }}>/</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{s.short}</span>
        </div>

        {/* Assignment header */}
        <div style={{ borderLeft: "3px solid " + s.color, paddingLeft: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 100, background: s.color + "22", color: s.color }}>{s.short}</span>
            {hw.tag && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 100, background: "var(--bg-2)", color: "var(--ink-3)" }}>{hw.tag}</span>}
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "#fef3d8", color: "#9a6a08" }}>⏰ {hw.due}{hw.dueNote ? ` · ${hw.dueNote}` : ""}</span>
            {hw.est && <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{hw.est}</span>}
            {isDone && <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--done)", border: "1px solid var(--done)", borderRadius: 3, padding: "1px 6px" }}>Done</span>}
            {hw.urgent && !isDone && <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink)", border: "1px solid var(--hairline)", borderRadius: 3, padding: "1px 6px" }}>Urgent</span>}
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 1.2, letterSpacing: "-0.01em", color: isDone ? "var(--ink-3)" : "var(--ink)", textDecoration: isDone ? "line-through" : "none", marginBottom: 10 }}>
            {hw.title}
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
            <button className={`sn-btn ${isDone ? "ghost" : "primary"}`} onClick={toggleDone} style={{ fontSize: 12, padding: "5px 12px" }}>
              {isDone ? "↩ Mark as open" : "✓ Mark as done"}
            </button>
            <button className="sn-btn ghost" onClick={() => window.location.hash = "#/subject/" + hw.subject + "/notes"} style={{ fontSize: 12, padding: "5px 12px" }}>
              {s.short} notes →
            </button>
            <button onClick={deleteHw} style={{ marginLeft: "auto", border: 0, background: "transparent", color: "#b84040", cursor: "pointer", fontSize: 12, padding: "5px 8px", opacity: 0.6, fontFamily: "inherit" }}>
              Delete
            </button>
          </div>
        </div>

        {/* ── Document viewer — hero ── */}
        <DocViewer hwId={hwId} subjectColor={s.color} />

        {/* ── Collapsible notes ── */}
        <div style={{ flexShrink: 0 }}>
          <button onClick={() => setNotesOpen(v => !v)} style={{
            border: 0, background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, padding: "4px 0",
            fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)",
            textTransform: "uppercase", letterSpacing: "0.1em", width: "100%",
          }}>
            <span style={{ display: "inline-block", transform: notesOpen ? "rotate(90deg)" : "none", transition: "transform .15s", lineHeight: 1 }}>›</span>
            My notes
            {content && content.replace(/<[^>]+>/g,"").trim() && <span style={{ color: "var(--done)", marginLeft: 4 }}>· ✓</span>}
          </button>
          {notesOpen && (
            <div style={{ marginTop: 6, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "12px 16px" }}>
              <style>{`[contenteditable][data-placeholder]:empty::before{content:attr(data-placeholder);color:var(--ink-3);pointer-events:none;display:block;font-style:italic}`}</style>
              <div ref={ceRef} contentEditable suppressContentEditableWarning
                data-placeholder="Write anything — your approach, questions, links…"
                onInput={(e) => { const html = e.currentTarget.innerHTML; setContent(html); nbUpdateNoteContent("hw-" + hwId, { content: html }); }}
                style={{ outline: "none", minHeight: 60, fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)", fontFamily: "inherit", whiteSpace: "pre-wrap", wordBreak: "break-word" }} />
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: AI panel ── */}
      <HomeworkAIPanel hw={hw} hwId={hwId} onInsertNotes={insertNotes} notesContent={content} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ── HomeworkAttachments (backward-compat export — now a no-op) ──
// ─────────────────────────────────────────────────────────────────────
function HomeworkAttachments({ hwId, subjectColor }) {
  return null;
}

// ── HomeworkAIPanel — inline chat ──
function HomeworkAIPanel({ hw, hwId, onInsertNotes, notesContent }) {
  const store = useNbStore();
  const [messages, setMessages] = React.useState([]);
  const [input, setInput]       = React.useState("");
  const [loading, setLoading]   = React.useState(false);
  const [pdfCtx, setPdfCtx]     = React.useState(null);
  const bottomRef   = React.useRef(null);
  const textareaRef = React.useRef(null);

  const s     = subjectBy(hw.subject);
  const sName = s ? s.name : "this class";
  const attachments = store.attachmentsFor("hw", hwId);
  const pdfs = attachments.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));

  React.useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const extractPdfText = async () => {
    if (pdfCtx !== null) return pdfCtx;
    if (!window.pdfjsLib || pdfs.length === 0) return "";
    let combined = "";
    for (const file of pdfs) {
      try {
        const pdf   = await window.pdfjsLib.getDocument({ url: file.url }).promise;
        const pages = Math.min(pdf.numPages, 20);
        const parts = [];
        for (let i = 1; i <= pages; i++) {
          const page = await pdf.getPage(i);
          const ct   = await page.getTextContent();
          parts.push(ct.items.map((it) => it.str).join(" "));
        }
        combined += "\n\n--- " + file.name + " ---\n" + parts.join("\n\n").trim().slice(0, 4000);
      } catch { /* skip */ }
    }
    setPdfCtx(combined);
    return combined;
  };

  const CHIPS = [
    { label: "Explain what to do",    msg: 'What is this assignment asking me to do? "' + hw.title + '" (' + sName + ')' },
    { label: "Solve it step by step", msg: 'Walk me through solving this step by step: "' + hw.title + '" (' + sName + ')' },
    { label: "Summarize document",    msg: 'Summarize the key points from the attached document for "' + hw.title + '"' },
    { label: "Generate study notes",  msg: 'Create structured study notes for "' + hw.title + '" (' + sName + '). Use headings, bullets, bold key terms.' },
  ];

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = { role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    const docCtx   = await extractPdfText();
    const notesRaw = notesContent ? notesContent.replace(/<[^>]+>/g, "").trim() : "";
    const history  = messages.slice(-6).map((m) => (m.role === "user" ? "Student" : "Tutor") + ": " + m.text).join("\n");

    const systemCtx = [
      'You are a helpful tutor assisting a student with their ' + sName + ' assignment: "' + hw.title + '".',
      'Due: ' + hw.due + (hw.dueNote ? ' · ' + hw.dueNote : '') + '.',
      docCtx   ? 'The student has attached a document:\n' + docCtx   : '',
      notesRaw ? 'The student current notes:\n' + notesRaw           : '',
      'Be concise and helpful. Use bullet points and short paragraphs.',
    ].filter(Boolean).join("\n\n");

    const fullPrompt = systemCtx + "\n\n" + (history ? "Conversation so far:\n" + history + "\n\n" : "") + "Student: " + q + "\n\nTutor:";

    try {
      const result = await aiComplete(fullPrompt);
      setMessages((m) => [...m, { role: "ai", text: result || "No response." }]);
    } catch (e) {
      if (e.message === "no-key" || e.message === "invalid-key") {
        setMessages((m) => [...m, { role: "ai", text: "__no-key__" }]);
      } else {
        setMessages((m) => [...m, { role: "ai", text: "Error: " + e.message }]);
      }
    }
    setLoading(false);
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ width: 260, flexShrink: 0, borderLeft: "1px solid var(--hairline)", background: "var(--surface)", display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>

      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--hairline)", flexShrink: 0, display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ color: "var(--accent)", fontSize: 13, fontFamily: "var(--f-display)", fontStyle: "italic" }}>✦</span>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", flex: 1 }}>AI Tutor</span>
        {pdfs.length > 0 && (
          <span style={{ fontSize: 10, fontFamily: "var(--f-mono)", padding: "2px 7px", borderRadius: 4, background: "var(--accent-soft)", color: "var(--accent-ink)", border: "1px solid var(--hairline)" }}>
            📎 {pdfs.length} PDF
          </span>
        )}
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); setPdfCtx(null); }} title="Clear chat"
            style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 15, padding: "2px 4px", lineHeight: 1 }}>↺</button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ textAlign: "center", padding: "14px 0 6px" }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--accent)", opacity: 0.45, marginBottom: 6 }}>✦</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.55, color: "var(--ink-3)" }}>Ask anything about this assignment.</div>
            </div>
            {CHIPS.map((c) => (
              <button key={c.label} onClick={() => send(c.msg)}
                style={{ textAlign: "left", padding: "8px 10px", borderRadius: 7, border: "1px solid var(--hairline)", background: "var(--bg)", cursor: "pointer", fontFamily: "var(--f-ui)", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.35, transition: "all .12s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--ink)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--hairline)"; e.currentTarget.style.color = "var(--ink-2)"; }}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 3 }}>
            {m.text === "__no-key__" ? (
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: "10px 10px 10px 2px", padding: "10px 12px", maxWidth: "93%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>Connect your API key to use AI Help.</div>
                <button className="sn-btn primary" style={{ fontSize: 11.5, alignSelf: "flex-start" }} onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>
              </div>
            ) : (
              <div style={{ maxWidth: "93%", padding: "9px 11px", borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", background: m.role === "user" ? "var(--ink)" : "var(--bg-2)", color: m.role === "user" ? "var(--bg)" : "var(--ink)", fontSize: 12.5, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word", border: m.role === "ai" ? "1px solid var(--hairline)" : "none" }}>
                {m.text}
              </div>
            )}
            {m.role === "ai" && m.text !== "__no-key__" && m.text.length > 200 && onInsertNotes && (
              <button onClick={() => onInsertNotes(m.text)}
                style={{ border: 0, background: "transparent", color: "var(--accent)", cursor: "pointer", fontSize: 10.5, fontFamily: "var(--f-mono)", padding: "1px 0", letterSpacing: "0.04em" }}>
                ↑ insert into notes
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: "10px 10px 10px 2px", padding: "10px 14px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: "var(--accent)", display: "inline-block", animation: "hwDot .9s " + (i * 0.2) + "s ease-in-out infinite alternate" }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "8px 12px 10px", borderTop: "1px solid var(--hairline)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 7, alignItems: "flex-end", background: "var(--bg)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "7px 10px", transition: "border-color .12s" }}
          onFocusCapture={(e) => e.currentTarget.style.borderColor = "var(--ink)"}
          onBlurCapture={(e) => e.currentTarget.style.borderColor = "var(--hairline)"}>
          <textarea ref={textareaRef} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px"; }}
            onKeyDown={onKey} placeholder="Ask anything…" rows={1}
            style={{ flex: 1, border: 0, outline: 0, background: "transparent", resize: "none", overflow: "hidden", fontFamily: "var(--f-ui)", fontSize: 12.5, color: "var(--ink)", lineHeight: 1.5, maxHeight: 96 }} />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ width: 26, height: 26, borderRadius: 7, border: "none", flexShrink: 0, background: input.trim() && !loading ? "var(--ink)" : "var(--hairline)", color: input.trim() && !loading ? "var(--bg)" : "var(--ink-3)", cursor: input.trim() && !loading ? "pointer" : "default", display: "grid", placeItems: "center", transition: "all .12s" }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M8 13V3M3 8l5-5 5 5" /></svg>
          </button>
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginTop: 4, textAlign: "center" }}>Enter · Shift+Enter for new line</div>
      </div>

      <style>{`@keyframes hwDot { from { opacity:.3; transform:translateY(0); } to { opacity:1; transform:translateY(-3px); } }`}</style>
    </div>
  );
}

Object.assign(window, { HomeworkList, HomeworkPage, HomeworkContent, HomeworkDetailPage, HomeworkAttachments });
