const STORAGE_KEY = "saa-c03-progress";

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

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

function save(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    score,
    total,
  });
  state.examAttempts = state.examAttempts.slice(0, 10);
  save(state);
  return state;
}

export function toggleFlaggedQuestion(id: number) {
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
