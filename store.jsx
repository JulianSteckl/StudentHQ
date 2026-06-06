// Simple in-memory store for user-added content + attachments.
// Persists to localStorage so refreshes don't lose state.

const NB_STORAGE_KEY = "nb-state-v1";

const __nbStore = (() => {
  const empty = { notes: {}, homework: [], attachments: {}, schedule: null, prefs: {} };
  try {
    const raw = localStorage.getItem(NB_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed };
  } catch (e) {
    console.warn("nb-store: failed to load", e);
    return empty;
  }
})();

// ── Firebase cloud sync ──
let __fbUser = null;
let __fbSyncing = false;

function nbSetFirebaseUser(user) {
  __fbUser = user;
  if (!user || !window.__fbDb) return;

  __fbSyncing = true;
  window.__fbDb.ref(`users/${user.uid}/nb-state`).once("value").then(snapshot => {
    const cloud = snapshot.val();
    const empty = { notes: {}, homework: [], attachments: {}, schedule: null, prefs: {}, noteEdits: {}, units: {}, customDecks: [], quizzes: [], profile: null };

    // Snapshot what was in localStorage before we touch anything
    const prevProfileRaw = localStorage.getItem("nb-profile-v1");

    if (cloud) {
      // Cloud has data — it's the source of truth
      const localAtts = __nbStore.attachments || {};
      Object.assign(__nbStore, { ...empty, ...cloud, attachments: localAtts });
      // Restore profile from cloud (always trust cloud over local)
      if (cloud.profile) {
        try { localStorage.setItem("nb-profile-v1", JSON.stringify(cloud.profile)); } catch(e) {}
      }
    } else {
      // No cloud data yet — push everything local up to Firebase
      const { attachments, ...syncable } = __nbStore;
      const _p = (() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } })();
      if (_p) syncable.profile = _p;
      window.__fbDb.ref(`users/${user.uid}/nb-state`).set(syncable)
        .catch(e => console.warn("nb-store: initial upload failed", e));
    }

    const newProfileRaw = cloud && cloud.profile ? JSON.stringify(cloud.profile) : null;
    const profileChanged = newProfileRaw && newProfileRaw !== prevProfileRaw;

    try { localStorage.setItem(NB_STORAGE_KEY, JSON.stringify(__nbStore)); } catch(e) {}
    window.dispatchEvent(new Event("nbStoreChange"));
    window.dispatchEvent(new CustomEvent("nbFirebaseLoaded", {
      detail: { hasCloudProfile: !!(cloud && cloud.profile), profileChanged: !!profileChanged }
    }));
    __fbSyncing = false;
  }).catch(e => {
    console.warn("nb-store: Firebase load failed", e);
    window.dispatchEvent(new CustomEvent("nbFirebaseLoaded", { detail: { hasCloudProfile: false } }));
    __fbSyncing = false;
  });
}

let __nbSaveTimer = null;
function __nbPersist() {
  if (__nbSaveTimer) clearTimeout(__nbSaveTimer);
  __nbSaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(NB_STORAGE_KEY, JSON.stringify(__nbStore));
    } catch (e) {
      console.warn("nb-store: storage quota exceeded — attachments may not persist", e);
    }
    // Also sync to Firebase when signed in (exclude attachments — base64 is too large)
    if (__fbUser && window.__fbDb && !__fbSyncing) {
      try {
        const { attachments, ...syncable } = __nbStore;
        // Always include the latest profile so subjects sync across devices
        const _p = (() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } })();
        if (_p) syncable.profile = _p;
        window.__fbDb.ref(`users/${__fbUser.uid}/nb-state`).set(syncable)
          .catch(e => console.warn("nb-store: Firebase sync failed", e));
      } catch(e) { console.warn("nb-store: sync error", e); }
    }
  }, 200);
}

function __nbNotify() {
  window.dispatchEvent(new Event("nbStoreChange"));
  __nbPersist();
}

// Immediately push current state + profile to Firebase (call after onboarding finishes)
function nbSyncNow() {
  if (!__fbUser || !window.__fbDb) return;
  try {
    const { attachments, ...syncable } = __nbStore;
    const _p = (() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } })();
    if (_p) syncable.profile = _p;
    window.__fbDb.ref(`users/${__fbUser.uid}/nb-state`).set(syncable)
      .catch(e => console.warn("nb-store: nbSyncNow failed", e));
  } catch(e) { console.warn("nb-store: nbSyncNow error", e); }
}

function nbAddNote(subjectId, note) {
  const id = "u-" + Date.now().toString(36);
  const rec = {
    id,
    title: note.title || "Untitled",
    when: "just now",
    tags: note.tags || [],
    unit: 0,
    blocks: note.blocks && note.blocks.length ? note.blocks : [
      { type: "p", text: "" },
    ],
  };
  if (!__nbStore.notes[subjectId]) __nbStore.notes[subjectId] = [];
  __nbStore.notes[subjectId] = [rec, ...__nbStore.notes[subjectId]];
  __nbNotify();
  return rec;
}

function nbAddHomework(item) {
  const id = "u-" + Date.now().toString(36);
  const rec = {
    id, done: false, urgent: item.due === "Tonight" || item.due === "Tomorrow",
    est: item.est || "—", dueNote: item.dueNote || "",
    ...item,
  };
  __nbStore.homework = [rec, ...__nbStore.homework];
  __nbNotify();
  return rec;
}

function nbGetNotes(subjectId) {
  return __nbStore.notes[subjectId] || [];
}

function nbGetHomework() {
  return __nbStore.homework;
}

function nbAddAttachment(subjectId, noteId, file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const key = subjectId + ":" + noteId;
      const att = {
        id: "att-" + Date.now().toString(36),
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        url: e.target.result, // data URL
        addedAt: Date.now(),
      };
      if (!__nbStore.attachments[key]) __nbStore.attachments[key] = [];
      __nbStore.attachments[key] = [...__nbStore.attachments[key], att];
      __nbNotify();
      resolve(att);
    };
    reader.readAsDataURL(file);
  });
}

function nbRemoveAttachment(subjectId, noteId, attId) {
  const key = subjectId + ":" + noteId;
  if (!__nbStore.attachments[key]) return;
  __nbStore.attachments[key] = __nbStore.attachments[key].filter((a) => a.id !== attId);
  __nbNotify();
}

function nbGetAttachments(subjectId, noteId) {
  return __nbStore.attachments[subjectId + ":" + noteId] || [];
}

// Editable note content — overrides built-in NOTES_BY_SUBJECT entries by id.
function nbUpdateNoteContent(noteId, patch) {
  if (!__nbStore.noteEdits) __nbStore.noteEdits = {};
  __nbStore.noteEdits[noteId] = { ...(__nbStore.noteEdits[noteId] || {}), ...patch };
  __nbNotify();
}
function nbGetNoteOverride(noteId) {
  return (__nbStore.noteEdits || {})[noteId];
}

// Schedule (bell times)
function nbGetSchedule() {
  return __nbStore.schedule || SCHEDULE_TODAY;
}
function nbSetSchedule(schedule) {
  __nbStore.schedule = schedule;
  __nbNotify();
}
function nbResetSchedule() {
  __nbStore.schedule = null;
  __nbNotify();
}

// ── Claude API key + direct completion ──
function nbGetApiKey() {
  return localStorage.getItem("nb-claude-api-key") || "";
}
function nbSetApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem("nb-claude-api-key", key.trim());
  } else {
    localStorage.removeItem("nb-claude-api-key");
  }
  window.dispatchEvent(new Event("apiKeyChanged"));
}
async function aiComplete(prompt) {
  // Try Claude Code's injected client first; if it throws, fall through to direct API
  if (typeof window.claude !== "undefined" && typeof window.claude.complete === "function") {
    try {
      const result = await window.claude.complete(prompt);
      if (result != null) return result;
    } catch (claudeErr) {
      console.warn("[aiComplete] window.claude.complete failed, trying direct API:", claudeErr);
    }
  }

  // Direct Anthropic API with stored key
  const key = nbGetApiKey();
  if (!key) throw new Error("no-key");

  let resp;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (fetchErr) {
    console.error("[aiComplete] fetch failed:", fetchErr);
    throw new Error("fetch-failed");
  }

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    console.error("[aiComplete] API error", resp.status, data);
    if (resp.status === 401) throw new Error("invalid-key");
    throw new Error(data.error?.message || `api-${resp.status}`);
  }

  const data = await resp.json();
  return data.content?.[0]?.text || "";
}

// Generic prefs (homepage card visibility, etc.)
function nbGetPref(key, fallback) {
  return __nbStore.prefs && __nbStore.prefs[key] !== undefined ? __nbStore.prefs[key] : fallback;
}
function nbSetPref(key, value) {
  if (!__nbStore.prefs) __nbStore.prefs = {};
  __nbStore.prefs[key] = value;
  __nbNotify();
}

// Update homework status — mutating both the user-added and built-in lists.
function nbToggleHomework(id) {
  const u = __nbStore.homework.find((h) => h.id === id);
  if (u) { u.done = !u.done; __nbNotify(); return; }
  const b = HOMEWORK.find((h) => h.id === id);
  if (b) { b.done = !b.done; __nbNotify(); }
}

// React hook — subscribes a component to store changes.
function useNbStore() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const on = () => force();
    window.addEventListener("nbStoreChange", on);
    return () => window.removeEventListener("nbStoreChange", on);
  }, []);
  return {
    notesFor: nbGetNotes,
    homework: __nbStore.homework,
    attachmentsFor: nbGetAttachments,
  };
}

// ── Unit management (per-subject categories for notes) ──
function nbGetUnits(subjectId) {
  if (!__nbStore.units) __nbStore.units = {};
  return __nbStore.units[subjectId] || [];
}

function nbAddUnit(subjectId, name) {
  if (!__nbStore.units) __nbStore.units = {};
  const id = "unit-" + Date.now().toString(36);
  const unit = { id, name: name.trim() };
  __nbStore.units[subjectId] = [...(nbGetUnits(subjectId)), unit];
  __nbNotify();
  return unit;
}

function nbDeleteUnit(subjectId, unitId) {
  if (!__nbStore.units || !__nbStore.units[subjectId]) return;
  __nbStore.units[subjectId] = __nbStore.units[subjectId].filter((u) => u.id !== unitId);
  // Move notes that were in this unit back to "none"
  if (__nbStore.notes[subjectId]) {
    __nbStore.notes[subjectId] = __nbStore.notes[subjectId].map((n) =>
      n.unitId === unitId ? { ...n, unitId: null } : n
    );
  }
  __nbNotify();
}

function nbSetNoteUnit(subjectId, noteId, unitId) {
  if (!__nbStore.notes[subjectId]) return;
  __nbStore.notes[subjectId] = __nbStore.notes[subjectId].map((n) =>
    n.id === noteId ? { ...n, unitId: unitId || null } : n
  );
  __nbNotify();
}

function fmtFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function fileIconFor(type, name) {
  if (type.startsWith("image/")) return "🖼";
  if (type === "application/pdf" || name.toLowerCase().endsWith(".pdf")) return "PDF";
  if (type.includes("word") || /\.docx?$/i.test(name)) return "DOC";
  if (type.includes("sheet") || /\.xlsx?$/i.test(name)) return "XLS";
  if (type.includes("presentation") || /\.pptx?$/i.test(name)) return "PPT";
  if (type.startsWith("text/")) return "TXT";
  if (type.startsWith("audio/")) return "♪";
  if (type.startsWith("video/")) return "▶";
  return "FILE";
}

// ── Custom flashcard decks (imported from Quizlet, etc.) ──
function nbAddCustomDeck(deck) {
  if (!__nbStore.customDecks) __nbStore.customDecks = [];
  const id = "deck-" + Date.now().toString(36);
  const rec = { ...deck, id, addedAt: Date.now() };
  __nbStore.customDecks = [...__nbStore.customDecks, rec];
  __nbNotify();
  return rec;
}
function nbGetCustomDecks() {
  return __nbStore.customDecks || [];
}
function nbDeleteCustomDeck(id) {
  if (!__nbStore.customDecks) return;
  __nbStore.customDecks = __nbStore.customDecks.filter((d) => d.id !== id);
  __nbNotify();
}

// ── Note deletion ──
function nbDeleteNote(subjectId, noteId) {
  if (!__nbStore.notes[subjectId]) return;
  __nbStore.notes[subjectId] = __nbStore.notes[subjectId].filter((n) => n.id !== noteId);
  __nbNotify();
}

// ── Homework deletion ──
function nbDeleteHomework(id) {
  __nbStore.homework = (__nbStore.homework || []).filter((h) => h.id !== id);
  __nbNotify();
}

// ── User-added quiz store ──
function nbAddQuiz(quiz) {
  if (!__nbStore.quizzes) __nbStore.quizzes = [];
  const id = "q-" + Date.now().toString(36);
  const rec = { ...quiz, id, addedAt: Date.now() };
  __nbStore.quizzes = [...__nbStore.quizzes, rec];
  __nbNotify();
  return rec;
}
function nbGetQuizzes() {
  return __nbStore.quizzes || [];
}
function nbDeleteQuiz(id) {
  if (!__nbStore.quizzes) return;
  __nbStore.quizzes = __nbStore.quizzes.filter((q) => q.id !== id);
  __nbNotify();
}

// ── Study streak tracker ──
// Reads from nb-streak-v1 in localStorage; auto-advances on each new day.
function nbGetStreak() {
  const KEY = "nb-streak-v1";
  const today = new Date().toDateString();
  let data = { streak: 0, lastDate: "", best: 0 };
  try {
    data = { best: 0, ...JSON.parse(localStorage.getItem(KEY) || "null") } || data;
  } catch { /* ignore */ }

  if (data.lastDate === today) return data.streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const newStreak = data.lastDate === yesterday.toDateString() ? data.streak + 1 : 1;
  const newBest = Math.max(data.best || 0, newStreak);
  try {
    localStorage.setItem(KEY, JSON.stringify({ streak: newStreak, lastDate: today, best: newBest }));
  } catch { /* quota */ }
  return newStreak;
}

function nbGetStreakData() {
  const KEY = "nb-streak-v1";
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    const streak = nbGetStreak();
    return { streak, best: Math.max(data?.best || 0, streak) };
  } catch { return { streak: 0, best: 0 }; }
}

Object.assign(window, {
  nbSetFirebaseUser,
  nbAddNote, nbDeleteNote, nbAddHomework, nbDeleteHomework, nbGetNotes, nbGetHomework,
  nbAddAttachment, nbRemoveAttachment, nbGetAttachments,
  nbUpdateNoteContent, nbGetNoteOverride,
  nbGetSchedule, nbSetSchedule, nbResetSchedule,
  nbGetPref, nbSetPref,
  nbGetApiKey, nbSetApiKey, aiComplete,
  nbToggleHomework,
  nbGetUnits, nbAddUnit, nbDeleteUnit, nbSetNoteUnit,
  nbAddCustomDeck, nbGetCustomDecks, nbDeleteCustomDeck,
  nbAddQuiz, nbGetQuizzes, nbDeleteQuiz,
  nbGetStreak, nbGetStreakData, nbSyncNow,
  useNbStore, fmtFileSize, fileIconFor,
});
