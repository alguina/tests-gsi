export type TopicQuestionFilter = "all" | "failed" | "unseen";

export type TestDraftState = {
  questionIds: string[];
  responses: Record<string, string | null>;
  currentIndex: number;
  config?: {
    topic?: string;
    topicFilter?: TopicQuestionFilter;
  };
  startedAt: string;
  lastActivityAt: string;
};

export const DRAFT_LOCAL_STORAGE_PREFIX = "gsi-test-draft-";
export const MAX_ALL_QUESTIONS_CAP = 200;
export const AUTOSAVE_DEBOUNCE_MS = 800;

export function createInitialDraftState(questionIds: string[]): TestDraftState {
  const now = new Date().toISOString();

  return {
    questionIds,
    responses: {},
    currentIndex: 0,
    startedAt: now,
    lastActivityAt: now,
  };
}

export function touchDraftState(draft: TestDraftState): TestDraftState {
  return {
    ...draft,
    lastActivityAt: new Date().toISOString(),
  };
}

export function readLocalDraftCache(sessionId: string): TestDraftState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${DRAFT_LOCAL_STORAGE_PREFIX}${sessionId}`);
    return raw ? (JSON.parse(raw) as TestDraftState) : null;
  } catch {
    return null;
  }
}

export function writeLocalDraftCache(
  sessionId: string,
  draft: TestDraftState,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    `${DRAFT_LOCAL_STORAGE_PREFIX}${sessionId}`,
    JSON.stringify(draft),
  );
}

export function clearLocalDraftCache(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(`${DRAFT_LOCAL_STORAGE_PREFIX}${sessionId}`);
}
