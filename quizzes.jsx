// Quiz interaction variants

function QuizFrame({ subject, title, eyebrow, progress, current, total, children, footer, onExit }) {
  const s = subjectBy(subject);
  return (
    <div className="sn-root" style={{ height: "100%", background: "var(--bg)" }}>
      <div className="quiz-stage">
        <div className="quiz-meta">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></span>
            <span>{s.short.toUpperCase()} · {eyebrow}</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span>{current} / {total}</span>
            {onExit && <button className="sn-btn ghost" onClick={onExit} style={{ fontSize: 11, padding: "3px 8px" }}>✕ Exit</button>}
          </div>
        </div>
        <div className="quiz-progress">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`pip ${i < current - 1 ? "done" : i === current - 1 ? "current" : ""}`}></div>
          ))}
        </div>
        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.2, color: "var(--ink-2)" }}>{title}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}

// ── Deck resolver ─────────────────────────────────────────────────────────────
function resolveDeck(deckId) {
  // Subject-based study set built from notes
  if (deckId && deckId.startsWith("subject-")) {
    const subjectId = deckId.slice(8);
    const notes = [...(notesForSubject ? notesForSubject(subjectId) : []), ...(nbGetNotes ? nbGetNotes(subjectId) : [])];
    const cards = notes.map(n => {
      const body = n.excerpt || (n.blocks && n.blocks.map(b => b.text).filter(t => t && t.trim()).join(" ")) || "";
      return { front: n.title || "Untitled", back: body.slice(0, 300) || n.title || "Untitled" };
    }).filter(c => c.front && c.front.trim());
    return {
      id: deckId,
      subject: subjectId,
      title: (subjectBy(subjectId).name || "Notes") + " — Topics",
      cards: cards.length > 0 ? cards : [{ front: "No notes yet", back: "Add notes to this subject first, then come back to study." }],
    };
  }
  // Flashcard deck lookup
  let deck = deckBy(deckId);
  if (!deck) {
    const custom = nbGetCustomDecks().find(d => d.id === deckId);
    if (custom) {
      deck = { ...custom, cards: custom.cards.map(c => ({ front: c.front || c.q || "?", back: c.back || c.a || "?" })) };
    }
  }
  if (!deck) deck = deckBy("bio-respiration") || Object.values(DECKS)[0];
  return deck;
}

// ── Flashcard flip ────────────────────────────────────────────────────────────
function FlashcardQuiz({ deckId = "bio-respiration", onExit }) {
  const deck = resolveDeck(deckId);
  const cards = deck.cards;
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const card = cards[idx];

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const next = () => { setFlipped(false); setTimeout(() => setIdx(i => (i + 1) % cards.length), 200); };

  return (
    <QuizFrame subject={deck.subject} eyebrow={`Flashcards · ${deck.title}`} title={deck.title}
      current={idx + 1} total={cards.length} onExit={onExit}
      footer={flipped ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {["Again","Hard","Good","Easy"].map((lbl, i) => (
            <button key={lbl} className={`sn-btn${i === 3 ? " primary" : ""}`} onClick={() => next()}
              style={{ padding: "10px 0", justifyContent: "center" }}>{lbl}</button>
          ))}
        </div>
      ) : (
        <button className="sn-btn primary" style={{ width: "100%", justifyContent: "center", padding: "12px 0" }} onClick={() => setFlipped(true)}>
          Flip card · <span className="mono" style={{ opacity: 0.6, fontSize: 11 }}>SPACE</span>
        </button>
      )}
    >
      <div onClick={() => setFlipped(f => !f)} style={{ perspective: 1400, cursor: "pointer", height: 260 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(.7,.1,.3,1)", transform: flipped ? "rotateY(180deg)" : "none" }}>
          <div style={{ position: "absolute", inset: 0, background: "var(--surface)", border: "1px solid var(--hairline)",
            borderRadius: 8, backfaceVisibility: "hidden", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Term</div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: 1.1 }}>{card.front}</div>
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, background: "var(--ink)", color: "var(--bg)", borderRadius: 8,
            backfaceVisibility: "hidden", transform: "rotateY(180deg)", display: "grid", placeItems: "center", padding: 32, textAlign: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--accent-soft)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Definition</div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.35 }}>{card.back}</div>
            </div>
          </div>
        </div>
      </div>
    </QuizFrame>
  );
}

// ── MCQ — auto-generated from any deck ───────────────────────────────────────
function MCQQuiz({ deckId = "alg2-trig", onExit }) {
  const deck = resolveDeck(deckId);
  const questions = React.useMemo(() => {
    const cards = [...deck.cards];
    return cards.map((card, i) => {
      const pool = cards.filter((_, j) => j !== i);
      const wrongs = pool.sort(() => 0.5 - Math.random()).slice(0, 3).map(c => c.back);
      const choices = [...wrongs, card.back].sort(() => 0.5 - Math.random());
      return { q: card.front, choices, correct: choices.indexOf(card.back), explain: card.back };
    });
  }, [deckId]);

  const [idx, setIdx] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const q = questions[idx];
  const submitted = picked !== null;

  React.useEffect(() => {
    const onKey = (e) => {
      const i = ["a","b","c","d"].indexOf(e.key.toLowerCase());
      if (i >= 0 && !submitted) setPicked(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submitted]);

  const next = () => { setPicked(null); setIdx(i => (i + 1) % questions.length); };

  return (
    <QuizFrame subject={deck.subject} eyebrow={`Multiple choice · ${deck.title}`} title={q.q}
      current={idx + 1} total={questions.length} onExit={onExit}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <button className="sn-btn ghost" style={{ fontFamily: "var(--f-mono)", fontSize: 11 }} onClick={() => next()}>SKIP</button>
          {submitted
            ? <button className="sn-btn primary" onClick={next} style={{ padding: "10px 22px" }}>Next →</button>
            : <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>Press A · B · C · D</span>}
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {q.choices.map((c, i) => {
          const isCorrect = submitted && i === q.correct;
          const isWrong = submitted && i === picked && i !== q.correct;
          return (
            <button key={i} onClick={() => !submitted && setPicked(i)} disabled={submitted}
              style={{ display: "grid", gridTemplateColumns: "28px 1fr 20px", alignItems: "center",
                textAlign: "left", padding: "14px 16px", borderRadius: 6,
                border: "1px solid " + (isCorrect ? "var(--done)" : isWrong ? "var(--accent)" : "var(--hairline)"),
                background: isCorrect ? "var(--done-soft)" : isWrong ? "var(--accent-soft)" : picked === i ? "var(--bg-2)" : "var(--surface)",
                cursor: submitted ? "default" : "pointer", fontFamily: "var(--f-ui)", fontSize: 14, color: "var(--ink)", transition: "all 0.15s" }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{["A","B","C","D"][i]}</span>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 17, fontStyle: "italic" }}>{c}</span>
              <span style={{ color: isCorrect ? "var(--done)" : isWrong ? "var(--accent)" : "transparent", fontSize: 13 }}>
                {isCorrect ? "✓" : isWrong ? "✕" : ""}
              </span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <div style={{ padding: 14, background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 6, animation: "fade-up 0.3s ease" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            {picked === q.correct ? "✓ Correct" : "✕ Not quite"} · answer
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{q.explain}</div>
        </div>
      )}
    </QuizFrame>
  );
}

// ── Type the answer — dynamic from any deck ───────────────────────────────────
function TypeAnswerQuiz({ deckId = "esp-u6", onExit }) {
  const deck = resolveDeck(deckId);
  const cards = deck.cards;
  const [idx, setIdx] = React.useState(0);
  const [value, setValue] = React.useState("");
  const [state, setState] = React.useState("idle");
  const card = cards[idx];

  const submit = () => {
    const correct = card.back.toLowerCase().trim();
    const answer = value.toLowerCase().trim();
    setState(answer === correct || correct.split("/").map(s => s.trim()).includes(answer) ? "correct" : "wrong");
  };
  const next = () => { setIdx(i => (i + 1) % cards.length); setValue(""); setState("idle"); };

  return (
    <QuizFrame subject={deck.subject} eyebrow={`Type the answer · ${deck.title}`} title="Type the definition"
      current={idx + 1} total={cards.length} onExit={onExit}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="sn-btn ghost" style={{ fontFamily: "var(--f-mono)", fontSize: 11 }} onClick={next}>SKIP</button>
          {state === "idle"
            ? <button className="sn-btn primary" onClick={submit} disabled={!value.trim()} style={{ padding: "10px 22px", opacity: value.trim() ? 1 : 0.4 }}>Check ↵</button>
            : <button className="sn-btn primary" onClick={next} style={{ padding: "10px 22px" }}>Next →</button>}
        </div>
      }
    >
      <div style={{ textAlign: "center", padding: "10px 0 30px" }}>
        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 54, fontStyle: "italic", lineHeight: 1.15, color: "var(--ink)" }}>{card.front}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 8 }}>
          {subjectBy(deck.subject).short}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <input autoFocus value={value}
          onChange={e => { setValue(e.target.value); if (state !== "idle") setState("idle"); }}
          onKeyDown={e => { if (e.key === "Enter") state === "idle" ? submit() : next(); }}
          placeholder="type here…"
          style={{ width: "100%", border: 0, borderBottom: "2px solid " + (state === "correct" ? "var(--done)" : state === "wrong" ? "var(--accent)" : "var(--ink)"),
            background: "transparent", outline: "none", padding: "12px 4px",
            fontFamily: "var(--f-display)", fontSize: 36, color: "var(--ink)", textAlign: "center" }} />
        {state === "correct" && <div style={{ position: "absolute", right: 0, top: 12, color: "var(--done)", fontFamily: "var(--f-mono)", fontSize: 12, animation: "fade-up 0.25s ease" }}>✓ correct</div>}
        {state === "wrong" && (
          <div style={{ marginTop: 14, padding: 12, background: "var(--accent-soft)", borderRadius: 4, textAlign: "center", animation: "fade-up 0.25s ease" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--accent-ink)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Answer</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--accent-ink)", marginTop: 2 }}>{card.back}</div>
          </div>
        )}
      </div>
    </QuizFrame>
  );
}

// ── True / False ──────────────────────────────────────────────────────────────
function TrueFalseQuiz({ deckId = "bio-respiration", onExit }) {
  const deck = resolveDeck(deckId);
  const questions = React.useMemo(() => {
    const cards = [...deck.cards];
    return cards.map((card, i) => {
      const isTrue = i % 2 === 0;
      const wrongCard = cards[(i + 1) % cards.length];
      return { term: card.front, definition: isTrue ? card.back : wrongCard.back, correct: isTrue, correctDef: card.back };
    });
  }, [deckId]);

  const [idx, setIdx] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const q = questions[idx];
  const submitted = picked !== null;
  const isRight = submitted && (picked === "true") === q.correct;

  React.useEffect(() => {
    const onKey = (e) => {
      if (submitted) return;
      if (e.key === "t" || e.key === "ArrowRight") setPicked("true");
      if (e.key === "f" || e.key === "ArrowLeft") setPicked("false");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submitted]);

  const next = () => { setPicked(null); setIdx(i => (i + 1) % questions.length); };

  return (
    <QuizFrame subject={deck.subject} eyebrow={`True / False · ${deck.title}`} title="Is this definition correct?"
      current={idx + 1} total={questions.length} onExit={onExit}
      footer={
        submitted
          ? <button className="sn-btn primary" onClick={next} style={{ width: "100%", justifyContent: "center", padding: "12px 0" }}>Next →</button>
          : <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", textAlign: "center" }}>Press T = True · F = False</div>
      }
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 28, fontWeight: 500, marginBottom: 16 }}>{q.term}</div>
        <div style={{ padding: "20px 28px", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, fontSize: 17, lineHeight: 1.5, fontFamily: "var(--f-display)", fontStyle: "italic" }}>
          {q.definition}
        </div>
      </div>
      {!submitted ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button className="sn-btn" onClick={() => setPicked("true")} style={{ padding: "14px 0", justifyContent: "center", fontSize: 15 }}>✓ True</button>
          <button className="sn-btn" onClick={() => setPicked("false")} style={{ padding: "14px 0", justifyContent: "center", fontSize: 15 }}>✕ False</button>
        </div>
      ) : (
        <div style={{ padding: 14, background: isRight ? "var(--done-soft)" : "var(--accent-soft)", border: "1px solid " + (isRight ? "var(--done)" : "var(--accent)"), borderRadius: 6, animation: "fade-up 0.3s ease" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: isRight ? "var(--done)" : "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            {isRight ? "✓ Correct" : "✕ Wrong"} · the real definition
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)", fontFamily: "var(--f-display)", fontStyle: "italic" }}>{q.correctDef}</div>
        </div>
      )}
    </QuizFrame>
  );
}

// ── Key Concepts — study reference sheet ─────────────────────────────────────
function KeyConceptsStudy({ deckId = "bio-respiration", onExit }) {
  const deck = resolveDeck(deckId);
  const [revealed, setRevealed] = React.useState(new Set());
  const toggleAll = () => {
    if (revealed.size === deck.cards.length) setRevealed(new Set());
    else setRevealed(new Set(deck.cards.map((_, i) => i)));
  };

  return (
    <div className="sn-root" style={{ height: "100%", background: "var(--bg)" }}>
      <div style={{ padding: "24px 32px", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {subjectBy(deck.subject).short} · Key Concepts
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 4 }}>{deck.title}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="sn-btn ghost" onClick={toggleAll} style={{ fontSize: 11 }}>
              {revealed.size === deck.cards.length ? "Hide all" : "Reveal all"}
            </button>
            {onExit && <button className="sn-btn ghost" onClick={onExit} style={{ fontSize: 11 }}>✕ Exit</button>}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {deck.cards.map((card, i) => (
            <div key={i} onClick={() => setRevealed(r => { const n = new Set(r); r.has(i) ? n.delete(i) : n.add(i); return n; })}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "14px 16px",
                background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 6, cursor: "pointer",
                transition: "border-color 0.15s" }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 15, fontWeight: 500 }}>{card.front}</div>
              <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.4, transition: "opacity 0.2s",
                opacity: revealed.has(i) ? 1 : 0, filter: revealed.has(i) ? "none" : "blur(6px)" }}>
                {card.back}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textAlign: "center" }}>
          Click any row to reveal · {revealed.size} / {deck.cards.length} revealed
        </div>
      </div>
    </div>
  );
}

// ── Written recall — see term, write what you know freely ─────────────────────
function WrittenRecallQuiz({ deckId = "bio-respiration", onExit }) {
  const deck = resolveDeck(deckId);
  const [idx, setIdx] = React.useState(0);
  const [value, setValue] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const card = deck.cards[idx];

  const next = () => { setIdx(i => (i + 1) % deck.cards.length); setValue(""); setRevealed(false); };

  return (
    <QuizFrame subject={deck.subject} eyebrow={`Written recall · ${deck.title}`} title="Write what you know"
      current={idx + 1} total={deck.cards.length} onExit={onExit}
      footer={
        !revealed
          ? <button className="sn-btn primary" onClick={() => setRevealed(true)} style={{ width: "100%", justifyContent: "center", padding: "12px 0" }}>Reveal answer</button>
          : (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="sn-btn" onClick={next} style={{ flex: 1, justifyContent: "center", padding: "10px 0" }}>✕ Missed it</button>
              <button className="sn-btn primary" onClick={next} style={{ flex: 1, justifyContent: "center", padding: "10px 0" }}>✓ Got it</button>
            </div>
          )
      }
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 44, fontStyle: "italic", lineHeight: 1.1 }}>{card.front}</div>
      </div>
      <textarea value={value} onChange={e => setValue(e.target.value)}
        placeholder="Write everything you can recall about this term…"
        style={{ width: "100%", minHeight: 100, padding: "12px 14px", background: "var(--bg-2)",
          border: "1px solid var(--hairline)", borderRadius: 6, fontSize: 14, color: "var(--ink)",
          fontFamily: "var(--f-ui)", resize: "none", outline: "none", lineHeight: 1.6 }} />
      {revealed && (
        <div style={{ marginTop: 12, padding: 14, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 6, animation: "fade-up 0.3s ease" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Answer</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1.5, color: "var(--ink-2)", fontStyle: "italic" }}>{card.back}</div>
        </div>
      )}
    </QuizFrame>
  );
}

// ── Quiz finished screen ──────────────────────────────────────────────────────
function QuizResult() {
  return (
    <div className="sn-root" style={{ height: "100%", background: "var(--bg)" }}>
      <div style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="quiz-meta">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SubjectDot id="alg2" /><span>ALG II · QUIZ COMPLETE</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>You scored</div>
          <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 160, lineHeight: 1, color: "var(--ink)", margin: "8px 0" }}>
            8<span style={{ color: "var(--ink-3)" }}>/10</span>
          </div>
          <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, fontStyle: "italic", color: "var(--ink-2)" }}>Up from 6/10 last week.</div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="sn-btn">Review wrong answers (2)</button>
          <button className="sn-btn primary">Make flashcards for missed</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FlashcardQuiz, MCQQuiz, TypeAnswerQuiz, TrueFalseQuiz, KeyConceptsStudy, WrittenRecallQuiz, QuizResult });
