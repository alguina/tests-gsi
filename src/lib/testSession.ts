import { DEFAULT_USER_ID } from "@/lib/currentUser";
import {
  createInitialDraftState,
  MAX_ALL_QUESTIONS_CAP,
  type TestDraftState,
  type TopicQuestionFilter,
} from "@/lib/testDraft";
import { logServerEvent } from "@/lib/server/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const TEST_QUESTION_COUNTS = [10, 25, 50, 100] as const;
export const FAILED_QUESTION_COUNTS = [10, 25, "all"] as const;
export const TOPIC_QUESTION_COUNTS = [10, 25, 50, "all"] as const;
export const TEST_MODE_RANDOM = "random" as const;
export const TEST_MODE_FAILED = "failed_questions" as const;
export const TEST_MODE_TOPIC = "topic" as const;
export const TEST_MODE_RECOMMENDED = "recommended" as const;
export const TEST_MODE_EXAM = "exam_simulation" as const;

export const EXAM_QUESTION_COUNTS = [50, 100] as const;
export const EXAM_TIME_LIMITS_MINUTES = [60, 90, 120] as const;
export const EXAM_DEFAULT_QUESTION_COUNT = 100;
export const EXAM_DEFAULT_TIME_LIMIT_SECONDS = 120 * 60;

export type TestAnswer = {
  id: string;
  letter: string;
  text: string;
  isCorrect: boolean;
};

export type TestQuestion = {
  id: string;
  text: string;
  block: string | null;
  topic: string | null;
  year: string | null;
  exam: string | null;
  answers: TestAnswer[];
};

export type TestSelection = {
  questionId: string;
  selectedLetter: string | null;
};

export type TestQuestionResult = {
  questionId: string;
  text: string;
  metadata: string;
  selectedLetter: string | null;
  correctLetter: string;
  isCorrect: boolean;
  isBlank: boolean;
  answers: TestAnswer[];
};

export type TestResult = {
  sessionId: string;
  mode: string;
  title: string | null;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  netScore: number;
  accuracyPercent: number | null;
  questions: TestQuestionResult[];
  durationSeconds?: number | null;
  timeLimitSeconds?: number | null;
  normalizedNetScore?: number | null;
};

export type ExamTopicBreakdown = {
  topic: string;
  topicTitle: string | null;
  correct: number;
  wrong: number;
  blank: number;
  accuracy: number | null;
};

export type ExamSimulationComparison = {
  sessionId: string;
  completedAt: string;
  netScore: number;
  normalizedNetScore: number | null;
  durationSeconds: number | null;
};

export type ExamTestResult = TestResult & {
  durationSeconds: number | null;
  timeLimitSeconds: number | null;
  normalizedNetScore: number | null;
  previousSimulations: ExamSimulationComparison[];
  topicBreakdown: ExamTopicBreakdown[];
};

export type StartedTestSession = {
  sessionId: string;
  questions: TestQuestion[];
  mode?: string;
  title?: string | null;
};

export type ResumedTestSession = StartedTestSession & {
  draft: TestDraftState;
  timeLimitSeconds?: number | null;
  startedAt?: string;
};

export type InProgressSession = {
  id: string;
  mode: string;
  title: string | null;
  totalQuestions: number;
  startedAt: string;
  lastActivityAt: string | null;
  answeredCount: number;
  timeLimitSeconds?: number | null;
};

type DbQuestionRow = {
  id: string;
  text: string;
  block: string | null;
  topic: string | null;
  year: string | null;
  exam: string | null;
};

type DbAnswerRow = {
  id: string;
  question_id: string;
  letter: string;
  text: string;
  is_correct: boolean;
};

type DbSessionRow = {
  id: string;
  mode: string;
  title: string | null;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  net_score: number;
  completed_at: string | null;
  duration_seconds?: number | null;
  time_limit_seconds?: number | null;
  metadata?: Record<string, unknown> | null;
};

type SessionQuestionInsert = {
  questionId: string;
  position: number;
  selectionReason?: string;
  metadata?: Record<string, unknown>;
};

async function persistSessionQuestions(
  sessionId: string,
  items: SessionQuestionInsert[],
): Promise<void> {
  if (!items.length) {
    return;
  }

  const supabase = createServerSupabaseClient();
  const rows = items.map((item) => ({
    session_id: sessionId,
    question_id: item.questionId,
    position: item.position,
    selection_reason: item.selectionReason ?? null,
    metadata: item.metadata ?? null,
  }));

  const { error } = await supabase.from("session_questions").insert(rows);

  if (error) {
    throw new Error(`Failed to save session questions: ${error.message}`);
  }
}

export async function countEligibleQuestions(): Promise<number> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("get_random_questions", {
    question_limit: 1000,
  });

  if (error) {
    throw new Error(`Failed to count questions: ${error.message}`);
  }

  return data?.length ?? 0;
}

export async function startRandomTestSession(
  limit: number,
  userId: string = DEFAULT_USER_ID,
): Promise<StartedTestSession> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("INVALID_QUESTION_COUNT");
  }

  const questions = await fetchRandomTestQuestions(limit);
  const supabase = createServerSupabaseClient();
  const questionIds = questions.map((question) => question.id);
  const draft = createInitialDraftState(questionIds);

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      mode: TEST_MODE_RANDOM,
      title: `Random test (${limit})`,
      total_questions: limit,
      correct_count: 0,
      wrong_count: 0,
      blank_count: 0,
      net_score: 0,
      draft_state: draft,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(
      `Failed to create test session: ${sessionError?.message ?? "Unknown error"}`,
    );
  }

  return {
    sessionId: session.id,
    questions,
    mode: TEST_MODE_RANDOM,
    title: `Random test (${limit})`,
  };
}

export async function fetchTestQuestionsByIds(
  questionIds: string[],
): Promise<TestQuestion[]> {
  if (!questionIds.length) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  const { data: questionRows, error: questionsError } = await supabase
    .from("questions")
    .select("id, text, block, topic, year, exam")
    .in("id", questionIds);

  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  const rowById = new Map(
    ((questionRows ?? []) as DbQuestionRow[]).map((row) => [row.id, row]),
  );

  const orderedRows = questionIds
    .map((id) => rowById.get(id))
    .filter((row): row is DbQuestionRow => Boolean(row));

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("id, question_id, letter, text, is_correct")
    .in("question_id", orderedRows.map((row) => row.id));

  if (answersError) {
    throw new Error(`Failed to fetch answers: ${answersError.message}`);
  }

  const answersByQuestionId = groupAnswersByQuestionId(
    (answers ?? []) as DbAnswerRow[],
  );

  return orderedRows
    .map((question) => ({
      id: question.id,
      text: question.text,
      block: question.block,
      topic: question.topic,
      year: question.year,
      exam: question.exam,
      answers: answersByQuestionId.get(question.id) ?? [],
    }))
    .filter((question) => question.answers.length > 0);
}

export async function saveTestDraft(
  sessionId: string,
  userId: string,
  draft: TestDraftState,
): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("test_sessions")
    .update({ draft_state: draft })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .is("completed_at", null);

  if (error) {
    logServerEvent("autosave_failed", { sessionId, message: error.message }, "warn");
    throw new Error(`Failed to save draft: ${error.message}`);
  }
}

export async function getInProgressSession(
  userId: string,
): Promise<InProgressSession | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("test_sessions")
    .select("id, mode, title, total_questions, started_at, draft_state, time_limit_seconds")
    .eq("user_id", userId)
    .is("completed_at", null)
    .not("draft_state", "is", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const draft = data.draft_state as TestDraftState | null;
  const responses = draft?.responses ?? {};
  const answeredCount = Object.keys(responses).length;

  return {
    id: data.id,
    mode: data.mode,
    title: data.title,
    totalQuestions: data.total_questions,
    startedAt: data.started_at,
    lastActivityAt: draft?.lastActivityAt ?? null,
    answeredCount,
    timeLimitSeconds: data.time_limit_seconds ?? null,
  };
}

export async function resumeTestSession(
  sessionId: string,
  userId: string = DEFAULT_USER_ID,
): Promise<ResumedTestSession> {
  const supabase = createServerSupabaseClient();

  const { data: session, error } = await supabase
    .from("test_sessions")
    .select(
      "id, mode, title, draft_state, completed_at, time_limit_seconds, started_at",
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (session.completed_at) {
    throw new Error("SESSION_ALREADY_COMPLETED");
  }

  const draft = session.draft_state as TestDraftState | null;

  if (!draft?.questionIds?.length) {
    throw new Error("SESSION_DRAFT_MISSING");
  }

  const questions = await fetchTestQuestionsByIds(draft.questionIds);

  if (!questions.length) {
    throw new Error("NO_QUESTIONS_AVAILABLE");
  }

  return {
    sessionId: session.id,
    questions,
    mode: session.mode,
    title: session.title,
    draft,
    timeLimitSeconds: session.time_limit_seconds ?? null,
    startedAt: session.started_at,
  };
}

export async function discardTestSession(
  sessionId: string,
  userId: string = DEFAULT_USER_ID,
): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("test_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId)
    .is("completed_at", null);

  if (error) {
    throw new Error(`Failed to discard session: ${error.message}`);
  }
}

function resolveQuestionLimit(
  requested: number | "all",
  available: number,
): number {
  if (requested === "all") {
    return Math.min(available, MAX_ALL_QUESTIONS_CAP);
  }

  return Math.min(requested, available);
}

export async function countFailedQuestions(userId: string): Promise<number> {
  const ids = await selectFailedQuestionIds(userId, MAX_ALL_QUESTIONS_CAP);
  return ids.length;
}

export async function selectFailedQuestionIds(
  userId: string,
  limit: number,
): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("attempts")
    .select("question_id, is_correct, is_blank, answered_at")
    .eq("user_id", userId)
    .order("answered_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load failed questions: ${error.message}`);
  }

  const stats = new Map<
    string,
    { failCount: number; lastFailedAt: string; latestIsCorrect: boolean }
  >();

  for (const attempt of data ?? []) {
    const questionId = attempt.question_id as string;
    const current = stats.get(questionId) ?? {
      failCount: 0,
      lastFailedAt: "",
      latestIsCorrect: false,
    };

    if (!stats.has(questionId)) {
      current.latestIsCorrect = attempt.is_correct === true;
    }

    if (!attempt.is_blank && !attempt.is_correct) {
      current.failCount += 1;
      if (!current.lastFailedAt) {
        current.lastFailedAt = attempt.answered_at as string;
      }
    }

    stats.set(questionId, current);
  }

  return [...stats.entries()]
    .filter(([, value]) => value.failCount > 0 && !value.latestIsCorrect)
    .sort((left, right) => {
      if (right[1].failCount !== left[1].failCount) {
        return right[1].failCount - left[1].failCount;
      }

      return right[1].lastFailedAt.localeCompare(left[1].lastFailedAt);
    })
    .slice(0, limit)
    .map(([questionId]) => questionId);
}

export async function startFailedQuestionsSession(
  requested: number | "all",
  userId: string = DEFAULT_USER_ID,
): Promise<StartedTestSession> {
  const availableIds = await selectFailedQuestionIds(
    userId,
    MAX_ALL_QUESTIONS_CAP,
  );

  if (!availableIds.length) {
    throw new Error("NO_FAILED_QUESTIONS");
  }

  const limit = resolveQuestionLimit(requested, availableIds.length);
  const questionIds = availableIds.slice(0, limit);
  const questions = await fetchTestQuestionsByIds(questionIds);

  if (!questions.length) {
    throw new Error("NO_FAILED_QUESTIONS");
  }

  const draft = createInitialDraftState(questionIds);
  const supabase = createServerSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      mode: TEST_MODE_FAILED,
      title: `Review mistakes (${questions.length})`,
      total_questions: questions.length,
      correct_count: 0,
      wrong_count: 0,
      blank_count: 0,
      net_score: 0,
      draft_state: draft,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(
      `Failed to create test session: ${sessionError?.message ?? "Unknown error"}`,
    );
  }

  return {
    sessionId: session.id,
    questions,
    mode: TEST_MODE_FAILED,
    title: `Review mistakes (${questions.length})`,
  };
}

export async function selectTopicQuestionIds(
  userId: string,
  topic: string,
  requested: number | "all",
  filter: TopicQuestionFilter = "all",
): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  const { data: topicQuestions, error } = await supabase
    .from("questions")
    .select("id")
    .eq("topic", topic)
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to load topic questions: ${error.message}`);
  }

  let candidateIds = (topicQuestions ?? []).map((row) => row.id as string);

  if (!candidateIds.length) {
    return [];
  }

  const { data: attempts } = await supabase
    .from("attempts")
    .select("question_id, is_correct, is_blank, answered_at")
    .eq("user_id", userId)
    .in("question_id", candidateIds)
    .order("answered_at", { ascending: false });

  const attemptStats = new Map<
    string,
    { failCount: number; latestIsCorrect: boolean; seen: boolean }
  >();

  for (const attempt of attempts ?? []) {
    const questionId = attempt.question_id as string;
    const current = attemptStats.get(questionId) ?? {
      failCount: 0,
      latestIsCorrect: false,
      seen: false,
    };

    if (!attemptStats.has(questionId)) {
      current.latestIsCorrect = attempt.is_correct === true;
    }

    current.seen = true;

    if (!attempt.is_blank && !attempt.is_correct) {
      current.failCount += 1;
    }

    attemptStats.set(questionId, current);
  }

  if (filter === "failed") {
    candidateIds = candidateIds.filter((id) => {
      const stats = attemptStats.get(id);
      return stats && stats.failCount > 0 && !stats.latestIsCorrect;
    });
  } else if (filter === "unseen") {
    candidateIds = candidateIds.filter((id) => !attemptStats.get(id)?.seen);
  }

  const eligibleQuestions = await fetchTestQuestionsByIds(candidateIds);
  const eligibleIds = eligibleQuestions.map((question) => question.id);
  const limit = resolveQuestionLimit(requested, eligibleIds.length);

  return eligibleIds.slice(0, limit);
}

export async function startTopicTestSession(
  topic: string,
  requested: number | "all",
  filter: TopicQuestionFilter,
  userId: string = DEFAULT_USER_ID,
): Promise<StartedTestSession> {
  const questionIds = await selectTopicQuestionIds(
    userId,
    topic,
    requested,
    filter,
  );

  if (!questionIds.length) {
    throw new Error("NO_TOPIC_QUESTIONS");
  }

  const questions = await fetchTestQuestionsByIds(questionIds);
  const draft = createInitialDraftState(questionIds);
  draft.config = { topic, topicFilter: filter };

  const supabase = createServerSupabaseClient();
  const filterLabel =
    filter === "all" ? "all" : filter === "failed" ? "failed" : "unseen";

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      mode: TEST_MODE_TOPIC,
      title: `${topic} (${filterLabel}, ${questions.length})`,
      total_questions: questions.length,
      correct_count: 0,
      wrong_count: 0,
      blank_count: 0,
      net_score: 0,
      draft_state: draft,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(
      `Failed to create test session: ${sessionError?.message ?? "Unknown error"}`,
    );
  }

  return {
    sessionId: session.id,
    questions,
    mode: TEST_MODE_TOPIC,
    title: `${topic} (${filterLabel}, ${questions.length})`,
  };
}

export async function startRecommendedTestSession(
  requestedCount: number,
  userId: string = DEFAULT_USER_ID,
): Promise<StartedTestSession & { recommendationMetadata: Record<string, unknown> }> {
  const { buildStudyRecommendation } = await import(
    "@/lib/recommendations/buildRecommendation"
  );
  const recommendation = await buildStudyRecommendation(userId, requestedCount);

  if (!recommendation.questionIds.length) {
    throw new Error("NO_QUESTIONS_AVAILABLE");
  }

  const questions = await fetchTestQuestionsByIds(recommendation.questionIds);

  if (!questions.length) {
    throw new Error("NO_QUESTIONS_AVAILABLE");
  }

  const questionIds = questions.map((question) => question.id);
  const draft = createInitialDraftState(questionIds);
  const supabase = createServerSupabaseClient();
  const metadata = {
    reasons: recommendation.reasons,
    composition: recommendation.composition,
    bucketTargets: recommendation.metadata.bucketTargets,
    topics: recommendation.topics,
    generatedAt: recommendation.metadata.generatedAt,
  };

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      mode: TEST_MODE_RECOMMENDED,
      title: `Recommended training (${questions.length})`,
      total_questions: questions.length,
      correct_count: 0,
      wrong_count: 0,
      blank_count: 0,
      net_score: 0,
      draft_state: draft,
      metadata,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(
      `Failed to create test session: ${sessionError?.message ?? "Unknown error"}`,
    );
  }

  const signalById = new Map(
    recommendation.questionIds.map((questionId, index) => [questionId, index]),
  );

  await persistSessionQuestions(
    session.id,
    questionIds.map((questionId, index) => ({
      questionId,
      position: index + 1,
      selectionReason: "recommended",
      metadata: { order: signalById.get(questionId) ?? index },
    })),
  );

  return {
    sessionId: session.id,
    questions,
    mode: TEST_MODE_RECOMMENDED,
    title: `Recommended training (${questions.length})`,
    recommendationMetadata: metadata,
  };
}

export async function startExamSimulationSession(
  questionCount: number = EXAM_DEFAULT_QUESTION_COUNT,
  timeLimitSeconds: number = EXAM_DEFAULT_TIME_LIMIT_SECONDS,
  userId: string = DEFAULT_USER_ID,
): Promise<StartedTestSession> {
  if (!Number.isInteger(questionCount) || questionCount <= 0) {
    throw new Error("INVALID_QUESTION_COUNT");
  }

  if (!Number.isInteger(timeLimitSeconds) || timeLimitSeconds <= 0) {
    throw new Error("INVALID_TIME_LIMIT");
  }

  const questions = await fetchRandomTestQuestions(questionCount);
  const questionIds = questions.map((question) => question.id);
  const draft = createInitialDraftState(questionIds);
  const supabase = createServerSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      mode: TEST_MODE_EXAM,
      title: `Exam simulation (${questions.length})`,
      total_questions: questions.length,
      correct_count: 0,
      wrong_count: 0,
      blank_count: 0,
      net_score: 0,
      draft_state: draft,
      time_limit_seconds: timeLimitSeconds,
      metadata: {
        questionCount,
        timeLimitSeconds,
      },
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(
      `Failed to create test session: ${sessionError?.message ?? "Unknown error"}`,
    );
  }

  await persistSessionQuestions(
    session.id,
    questionIds.map((questionId, index) => ({
      questionId,
      position: index + 1,
      selectionReason: "exam_random",
    })),
  );

  return {
    sessionId: session.id,
    questions,
    mode: TEST_MODE_EXAM,
    title: `Exam simulation (${questions.length})`,
  };
}

export async function fetchRandomTestQuestions(
  limit: number,
): Promise<TestQuestion[]> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("INVALID_QUESTION_COUNT");
  }

  const availableCount = await countEligibleQuestions();

  if (availableCount === 0) {
    throw new Error("NO_QUESTIONS_AVAILABLE");
  }

  if (availableCount < limit) {
    throw new Error(`INSUFFICIENT_QUESTIONS:${availableCount}`);
  }

  const supabase = createServerSupabaseClient();

  const { data: eligibleQuestions, error: questionsError } = await supabase.rpc(
    "get_random_questions",
    { question_limit: limit },
  );

  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  const questionRows = (eligibleQuestions ?? []) as DbQuestionRow[];

  if (!questionRows.length) {
    throw new Error("NO_QUESTIONS_AVAILABLE");
  }

  if (questionRows.length < limit) {
    throw new Error(`INSUFFICIENT_QUESTIONS:${questionRows.length}`);
  }

  const questionIds = questionRows.map((question) => question.id);

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("id, question_id, letter, text, is_correct")
    .in("question_id", questionIds);

  if (answersError) {
    throw new Error(`Failed to fetch answers: ${answersError.message}`);
  }

  const answersByQuestionId = groupAnswersByQuestionId(
    (answers ?? []) as DbAnswerRow[],
  );

  return questionRows
    .map((question) => ({
      id: question.id,
      text: question.text,
      block: question.block,
      topic: question.topic,
      year: question.year,
      exam: question.exam,
      answers: answersByQuestionId.get(question.id) ?? [],
    }))
    .filter((question) => question.answers.length > 0);
}

export async function submitTestSession(
  sessionId: string,
  questions: TestQuestion[],
  selections: TestSelection[],
  userId: string = DEFAULT_USER_ID,
  options?: { durationSeconds?: number },
): Promise<TestResult> {
  if (!sessionId) {
    throw new Error("MISSING_SESSION_ID");
  }

  if (!questions.length) {
    throw new Error("EMPTY_TEST");
  }

  const supabase = createServerSupabaseClient();

  const { data: existingSession, error: sessionLookupError } = await supabase
    .from("test_sessions")
    .select("id, mode, title, user_id, completed_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sessionLookupError) {
    logServerEvent("submit_failed", {
      sessionId,
      stage: "lookup",
      message: sessionLookupError.message,
    }, "error");
    throw new Error(
      `Failed to load test session: ${sessionLookupError.message}`,
    );
  }

  if (!existingSession) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (existingSession.completed_at) {
    const existingResult = await getSessionResult(sessionId, userId);

    if (existingResult) {
      return existingResult;
    }

    throw new Error("SESSION_ALREADY_COMPLETED");
  }

  const questionIds = questions.map((question) => question.id);
  const serverQuestions = await fetchTestQuestionsByIds(questionIds);

  if (serverQuestions.length !== questionIds.length) {
    throw new Error("QUESTIONS_FETCH_FAILED");
  }

  const selectionMap = new Map(
    selections.map((selection) => [
      selection.questionId,
      selection.selectedLetter,
    ]),
  );

  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;

  const questionResults: TestQuestionResult[] = serverQuestions.map((question) => {
    const selectedLetter = normalizeSelectedLetter(
      selectionMap.get(question.id) ?? null,
    );
    const correctAnswer = question.answers.find((answer) => answer.isCorrect);

    if (!correctAnswer) {
      throw new Error("QUESTIONS_FETCH_FAILED");
    }

    const validLetters = new Set(
      question.answers.map((answer) => answer.letter.trim().toUpperCase()),
    );
    const normalizedSelection =
      selectedLetter && validLetters.has(selectedLetter) ? selectedLetter : null;
    const correctLetter = correctAnswer.letter;
    const isBlank = normalizedSelection === null;
    const isCorrect = !isBlank && normalizedSelection === correctLetter;

    if (isBlank) {
      blankCount += 1;
    } else if (isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }

    return {
      questionId: question.id,
      text: question.text,
      metadata: formatQuestionMetadata(question),
      selectedLetter: normalizedSelection,
      correctLetter,
      isCorrect,
      isBlank,
      answers: question.answers,
    };
  });

  const netScore = correctCount - wrongCount / 3;
  const answeredCount = correctCount + wrongCount;
  const accuracyPercent =
    answeredCount > 0
      ? Math.round((correctCount / answeredCount) * 1000) / 10
      : null;

  const completedAt = new Date().toISOString();

  const { data: updatedSession, error: sessionUpdateError } = await supabase
    .from("test_sessions")
    .update({
      total_questions: serverQuestions.length,
      correct_count: correctCount,
      wrong_count: wrongCount,
      blank_count: blankCount,
      net_score: netScore,
      completed_at: completedAt,
      draft_state: null,
      ...(options?.durationSeconds !== undefined
        ? { duration_seconds: options.durationSeconds }
        : {}),
    })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .is("completed_at", null)
    .select("id")
    .maybeSingle();

  if (sessionUpdateError) {
    logServerEvent("submit_failed", {
      sessionId,
      stage: "update_session",
      message: sessionUpdateError.message,
    }, "error");
    throw new Error(
      `Failed to save test session: ${sessionUpdateError.message}`,
    );
  }

  if (!updatedSession) {
    const existingResult = await getSessionResult(sessionId, userId);

    if (existingResult) {
      return existingResult;
    }

    throw new Error("SESSION_ALREADY_COMPLETED");
  }

  const attemptRows = questionResults.map((result) => {
    const question = serverQuestions.find((item) => item.id === result.questionId);
    const correctAnswer = question?.answers.find((answer) => answer.isCorrect);
    const selectedAnswer = question?.answers.find(
      (answer) => answer.letter === result.selectedLetter,
    );

    return {
      session_id: sessionId,
      user_id: userId,
      question_id: result.questionId,
      selected_answer_id: selectedAnswer?.id ?? null,
      selected_letter: result.selectedLetter,
      correct_answer_id: correctAnswer?.id ?? null,
      correct_letter: result.correctLetter || null,
      is_correct: result.isCorrect,
      is_blank: result.isBlank,
      answered_at: completedAt,
    };
  });

  const { error: attemptsError } = await supabase.from("attempts").upsert(
    attemptRows,
    { onConflict: "session_id,question_id", ignoreDuplicates: true },
  );

  if (attemptsError) {
    logServerEvent("submit_failed", {
      sessionId,
      stage: "insert_attempts",
      message: attemptsError.message,
    }, "error");
    throw new Error(`Failed to save attempts: ${attemptsError.message}`);
  }

  return {
    sessionId,
    mode: existingSession.mode,
    title: existingSession.title,
    correctCount,
    wrongCount,
    blankCount,
    netScore,
    accuracyPercent,
    questions: questionResults,
    durationSeconds: options?.durationSeconds ?? null,
  };
}

export async function getExamSessionResult(
  sessionId: string,
  userId: string = DEFAULT_USER_ID,
): Promise<ExamTestResult | null> {
  const baseResult = await getSessionResult(sessionId, userId);

  if (!baseResult || baseResult.mode !== TEST_MODE_EXAM) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  const { data: session } = await supabase
    .from("test_sessions")
    .select("duration_seconds, time_limit_seconds, completed_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  const { data: previousSessions } = await supabase
    .from("test_sessions")
    .select(
      "id, completed_at, net_score, correct_count, wrong_count, duration_seconds",
    )
    .eq("user_id", userId)
    .eq("mode", TEST_MODE_EXAM)
    .not("completed_at", "is", null)
    .neq("id", sessionId)
    .order("completed_at", { ascending: false })
    .limit(10);

  const answeredCount = baseResult.correctCount + baseResult.wrongCount;
  const normalizedNetScore =
    answeredCount > 0
      ? Math.round((baseResult.netScore * (100 / answeredCount)) * 100) / 100
      : null;

  const { data: attemptRows } = await supabase
    .from("attempts")
    .select(
      "is_correct, is_blank, questions(topic, block)",
    )
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  const topicStats = new Map<
    string,
    {
      titles: Map<string, number>;
      correct: number;
      wrong: number;
      blank: number;
    }
  >();

  for (const attempt of attemptRows ?? []) {
    const question = extractQuestionRow(
      attempt.questions as DbQuestionRow | DbQuestionRow[] | null,
    );
    const topic = String(question?.topic ?? "").trim() || "unknown";
    const block = String(question?.block ?? "").trim();
    const stats = topicStats.get(topic) ?? {
      titles: new Map<string, number>(),
      correct: 0,
      wrong: 0,
      blank: 0,
    };

    if (block) {
      stats.titles.set(block, (stats.titles.get(block) ?? 0) + 1);
    }

    if (attempt.is_blank) {
      stats.blank += 1;
    } else if (attempt.is_correct) {
      stats.correct += 1;
    } else {
      stats.wrong += 1;
    }

    topicStats.set(topic, stats);
  }

  const topicBreakdown: ExamTopicBreakdown[] = [...topicStats.entries()].map(
    ([topic, stats]) => {
      const answered = stats.correct + stats.wrong;
      const topicTitle =
        [...stats.titles.entries()].sort((left, right) => right[1] - left[1])[0]
          ?.[0] ?? null;

      return {
        topic,
        topicTitle,
        correct: stats.correct,
        wrong: stats.wrong,
        blank: stats.blank,
        accuracy:
          answered > 0
            ? Math.round((stats.correct / answered) * 1000) / 10
            : null,
      };
    },
  );

  const previousSimulations: ExamSimulationComparison[] = (
    previousSessions ?? []
  ).map((row) => {
    const prevAnswered = row.correct_count + row.wrong_count;

    return {
      sessionId: row.id,
      completedAt: row.completed_at as string,
      netScore: Number(row.net_score ?? 0),
      normalizedNetScore:
        prevAnswered > 0
          ? Math.round(
              (Number(row.net_score ?? 0) * (100 / prevAnswered)) * 100,
            ) / 100
          : null,
      durationSeconds: row.duration_seconds ?? null,
    };
  });

  return {
    ...baseResult,
    durationSeconds: session?.duration_seconds ?? null,
    timeLimitSeconds: session?.time_limit_seconds ?? null,
    normalizedNetScore,
    previousSimulations,
    topicBreakdown,
  };
}

export async function getSessionResult(
  sessionId: string,
  userId: string = DEFAULT_USER_ID,
): Promise<TestResult | null> {
  const supabase = createServerSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .select(
      "id, mode, title, total_questions, correct_count, wrong_count, blank_count, net_score, completed_at",
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sessionError || !session) {
    return null;
  }

  const sessionRow = session as DbSessionRow & {
    mode: string;
    title: string | null;
  };

  if (!sessionRow.completed_at) {
    return null;
  }

  const { data: attemptRows, error: attemptsError } = await supabase
    .from("attempts")
    .select(
      "question_id, selected_letter, correct_letter, is_correct, is_blank, questions(id, text, block, topic, year, exam)",
    )
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (attemptsError || !attemptRows?.length) {
    return null;
  }

  const questionIds = attemptRows.map((attempt) => attempt.question_id);

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("id, question_id, letter, text, is_correct")
    .in("question_id", questionIds);

  if (answersError) {
    return null;
  }

  const answersByQuestionId = groupAnswersByQuestionId(
    (answers ?? []) as DbAnswerRow[],
  );

  const answeredCount = sessionRow.correct_count + sessionRow.wrong_count;
  const accuracyPercent =
    answeredCount > 0
      ? Math.round((sessionRow.correct_count / answeredCount) * 1000) / 10
      : null;

  const questions: TestQuestionResult[] = attemptRows.map((attempt) => {
    const question = extractQuestionRow(attempt.questions);

    return {
      questionId: attempt.question_id,
      text: question?.text ?? "",
      metadata: question
        ? formatQuestionMetadata({
            block: question.block,
            topic: question.topic,
            year: question.year,
            exam: question.exam,
          } as TestQuestion)
        : "",
      selectedLetter: attempt.selected_letter,
      correctLetter: attempt.correct_letter ?? "",
      isCorrect: attempt.is_correct,
      isBlank: attempt.is_blank,
      answers: answersByQuestionId.get(attempt.question_id) ?? [],
    };
  });

  return {
    sessionId: sessionRow.id,
    mode: sessionRow.mode ?? TEST_MODE_RANDOM,
    title: sessionRow.title ?? null,
    correctCount: sessionRow.correct_count,
    wrongCount: sessionRow.wrong_count,
    blankCount: sessionRow.blank_count,
    netScore: Number(sessionRow.net_score ?? 0),
    accuracyPercent,
    questions,
  };
}

function extractQuestionRow(
  value: DbQuestionRow | DbQuestionRow[] | null | undefined,
): DbQuestionRow | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function groupAnswersByQuestionId(
  answers: DbAnswerRow[],
): Map<string, TestAnswer[]> {
  const grouped = new Map<string, TestAnswer[]>();

  for (const answer of answers) {
    const current = grouped.get(answer.question_id) ?? [];
    current.push({
      id: answer.id,
      letter: answer.letter,
      text: answer.text,
      isCorrect: answer.is_correct,
    });
    grouped.set(answer.question_id, current);
  }

  for (const [questionId, questionAnswers] of grouped) {
    grouped.set(
      questionId,
      questionAnswers.sort((left, right) =>
        left.letter.localeCompare(right.letter),
      ),
    );
  }

  return grouped;
}

function normalizeSelectedLetter(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const letter = value.trim().toUpperCase();
  return letter.length ? letter : null;
}

function formatQuestionMetadata(question: TestQuestion): string {
  return [question.block, question.topic, question.year, question.exam]
    .filter(Boolean)
    .map(String)
    .join(" / ");
}
