const STORAGE_KEY = "saa-c03-progress";
const MAX_ATTEMPTS = 10;

export interface ProgressState {
  knownCards: string[];
  examAttempts: { date: string; score: number; total: number }[];
  flaggedQuestions: number[];
}

const defaultState: ProgressState = {
  knownCards: [],
  examAttempts: [],
  flaggedQuestions: [],
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function isExamAttempts(value: unknown): value is ProgressState["examAttempts"] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { date?: unknown }).date === "string" &&
      typeof (item as { score?: unknown }).score === "number" &&
      typeof (item as { total?: unknown }).total === "number"
  );
}

function sanitizeState(raw: unknown): ProgressState {
  if (typeof raw !== "object" || raw === null) return defaultState;

  const data = raw as Record<string, unknown>;

  return {
    knownCards: isStringArray(data.knownCards) ? data.knownCards.slice(0, 500) : [],
    examAttempts: isExamAttempts(data.examAttempts)
      ? data.examAttempts.slice(0, MAX_ATTEMPTS)
      : [],
    flaggedQuestions: isNumberArray(data.flaggedQuestions)
      ? data.flaggedQuestions.filter((id) => id > 0 && id <= 100).slice(0, 100)
      : [],
  };
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return sanitizeState(JSON.parse(raw));
  } catch {
    return defaultState;
  }
}

function save(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeState(state)));
}

export function getProgress(): ProgressState {
  return load();
}

export function toggleKnownCard(term: string) {
  const state = load();
  const idx = state.knownCards.indexOf(term);
  if (idx >= 0) state.knownCards.splice(idx, 1);
  else state.knownCards.push(term);
  save(state);
  return state;
}

export function recordExamAttempt(score: number, total: number) {
  const state = load();
  state.examAttempts.unshift({
    date: new Date().toISOString(),
    score: Math.max(0, Math.min(score, total)),
    total: Math.max(1, total),
  });
  state.examAttempts = state.examAttempts.slice(0, MAX_ATTEMPTS);
  save(state);
  return state;
}

export function toggleFlaggedQuestion(id: number) {
  if (!Number.isFinite(id) || id <= 0) return load();
  const state = load();
  const idx = state.flaggedQuestions.indexOf(id);
  if (idx >= 0) state.flaggedQuestions.splice(idx, 1);
  else state.flaggedQuestions.push(id);
  save(state);
  return state;
}

export function clearProgress() {
  save(defaultState);
}
