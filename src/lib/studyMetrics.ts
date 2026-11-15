import {
  buildPerformanceTrend,
  computeNetScore,
  computeStudyStreak,
  countActivitySince,
  countFailedAtLeastTwice,
  normalizeNetScoreTo100,
  type PerformanceTrendPoint,
  type TopicPerformanceRow,
} from "@/lib/stats/userMetrics";
import { computeTopicWeakness } from "@/lib/recommendations/questionSignals";
import {
  getCanonicalQuestionId,
  getOfficialCoverage,
  getReliableOfficialTopic,
} from "@/lib/officialTopics";
import {
  countFailedQuestions,
  getInProgressSession,
  TEST_MODE_OFFICIAL_TOPIC,
  isGeneralTrainingMode,
  type InProgressSession,
} from "@/lib/testSession";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LatestSession = {
  id: string;
  mode: string;
  title: string | null;
  completedAt: string | null;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  netScore: number;
};

export type HomeStudyStats = {
  userId: string;
  latestNetScore: number | null;
  recentAverageNetScore: number | null;
  questionsAnswered: number;
  overallAccuracy: number | null;
  mistakesToReview: number;
  weakTopicsCount: number | null;
  trainingQuestionsSeen: number;
  trainingQuestionsAvailable: number;
  latestSession: LatestSession | null;
  inProgressSession: InProgressSession | null;
  /** @deprecated Use questionsAnswered */
  totalQuestionsAnswered: number;
};

export type DashboardStats = {
  totalSessions: number;
  totalQuestionsAnswered: number;
  globalAccuracy: number | null;
  averageNetScore: number | null;
  mostFailedTopics: Array<{ topic: string; topicTitle: string | null; count: number }>;
};

export type DashboardStudyMetrics = {
  completedSessions: number;
  totalAnsweredQuestions: number;
  uniqueQuestionsSeen: number;
  correctTotal: number;
  wrongTotal: number;
  blankTotal: number;
  globalAccuracy: number | null;
  averageNetScore: number | null;
  normalizedNetScorePer100: number | null;
  averageNormalizedNetScorePer100: number | null;
  failedAtLeastTwice: number;
  unseenQuestions: number;
  bookmarkedQuestions: number;
  currentStreakDays: number;
  activityLast7Days: number;
  activityLast30Days: number;
  mostFailedTopics: Array<{ topic: string; topicTitle: string | null; count: number }>;
  performanceTrend: PerformanceTrendPoint[];
  topicPerformance: TopicPerformanceRow[];
};

export type TopicSummary = {
  topic: string;
  topicTitle: string | null;
  displayLabel: string;
  description: string | null;
  sourceHint: string | null;
  rawBlock: string | null;
  totalQuestions: number;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  failedCount: number;
  accuracy: number | null;
  priority: "high" | "medium" | "low";
};

type OfficialMetricAttempt = {
  question_id: string;
  is_correct: boolean;
  is_blank: boolean;
  answered_at?: string | null;
};

export function buildOfficialTopicMetrics(attempts: OfficialMetricAttempt[]): {
  summaries: TopicSummary[];
  performance: TopicPerformanceRow[];
} {
  const totals = new Map<string, {
    correct: number;
    wrong: number;
    blank: number;
    seen: Set<string>;
    latestAt: string | null;
    latestByQuestion: Map<string, { isCorrect: boolean; isBlank: boolean; at: string }>;
  }>();

  for (const attempt of attempts) {
    const official = getReliableOfficialTopic(attempt.question_id);
    if (!official) continue;
    const key = `${official.bloque}.${official.tema}`;
    const current = totals.get(key) ?? {
      correct: 0,
      wrong: 0,
      blank: 0,
      seen: new Set<string>(),
      latestAt: null,
      latestByQuestion: new Map(),
    };
    const canonicalId = getCanonicalQuestionId(attempt.question_id);
    const at = attempt.answered_at ?? "";
    current.seen.add(canonicalId);
    if (attempt.is_blank) current.blank += 1;
    else if (attempt.is_correct) current.correct += 1;
    else current.wrong += 1;
    if (!current.latestAt || at > current.latestAt) current.latestAt = at || current.latestAt;
    const previous = current.latestByQuestion.get(canonicalId);
    if (!previous || at >= previous.at) {
      current.latestByQuestion.set(canonicalId, {
        isCorrect: attempt.is_correct,
        isBlank: attempt.is_blank,
        at,
      });
    }
    totals.set(key, current);
  }

  const summaries = getOfficialCoverage().temas.map(({ tema, porConfianza }) => {
    const key = `${tema.bloque}.${tema.tema}`;
    const stats = totals.get(key);
    const correct = stats?.correct ?? 0;
    const wrong = stats?.wrong ?? 0;
    const blank = stats?.blank ?? 0;
    const answered = correct + wrong;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 1000) / 10 : null;
    const failedCount = stats
      ? [...stats.latestByQuestion.values()].filter((row) => !row.isCorrect && !row.isBlank).length
      : 0;
    let priority: TopicSummary["priority"] = "low";
    if (answered === 0 || (accuracy !== null && accuracy < 75)) priority = "medium";
    if (accuracy !== null && accuracy < 50) priority = "high";
    return {
      topic: key,
      topicTitle: tema.titulo,
      displayLabel: `${key} · ${tema.titulo}`,
      description: null,
      sourceHint: null,
      rawBlock: null,
      totalQuestions: porConfianza.alta,
      answered,
      correct,
      wrong,
      blank,
      failedCount,
      accuracy,
      priority,
    };
  });

  const performance = summaries.map((summary) => {
    const stats = totals.get(summary.topic);
    const uniqueSeen = stats?.seen.size ?? 0;
    const answered = summary.correct + summary.wrong;
    const errorRate = answered > 0 ? Math.round((summary.wrong / answered) * 1000) / 10 : null;
    const priorityScore = computeTopicWeakness({
      topic: summary.topic,
      wrong: summary.wrong,
      answered,
      unseenCount: Math.max(0, summary.totalQuestions - uniqueSeen),
      totalQuestions: summary.totalQuestions,
    });
    return {
      topic: summary.topic,
      topicTitle: summary.topicTitle,
      availableQuestions: summary.totalQuestions,
      uniqueSeen,
      totalAttempts: summary.correct + summary.wrong + summary.blank,
      correct: summary.correct,
      wrong: summary.wrong,
      blank: summary.blank,
      accuracy: summary.accuracy,
      errorRate,
      lastAttemptedAt: stats?.latestAt ?? null,
      priorityScore: Math.round(priorityScore * 1000) / 1000,
    } satisfies TopicPerformanceRow;
  }).sort((left, right) => right.priorityScore - left.priorityScore);

  return { summaries, performance };
}

function mapSessionRow(session: {
  id: string;
  mode?: string | null;
  title?: string | null;
  completed_at: string | null;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  net_score: number;
}): LatestSession {
  return {
    id: session.id,
    mode: session.mode ?? "random",
    title: session.title ?? null,
    completedAt: session.completed_at,
    totalQuestions: session.total_questions,
    correctCount: session.correct_count,
    wrongCount: session.wrong_count,
    blankCount: session.blank_count,
    netScore: Number(session.net_score ?? 0),
  };
}

export async function getHomeStudyStats(
  userId: string,
): Promise<HomeStudyStats> {
  const supabase = createServerSupabaseClient();

  const [attemptsResult, sessionsResult, inProgressSession, failedQuestionsAvailable] =
    await Promise.all([
      supabase
        .from("attempts")
        .select("id, question_id, is_correct, is_blank, test_sessions!inner(mode)")
        .eq("user_id", userId)
        .neq("test_sessions.mode", TEST_MODE_OFFICIAL_TOPIC),
      supabase
        .from("test_sessions")
        .select(
          "id, mode, title, completed_at, total_questions, correct_count, wrong_count, blank_count, net_score",
        )
        .eq("user_id", userId)
        .order("completed_at", { ascending: false, nullsFirst: false })
        .limit(20),
      getInProgressSession(userId),
      countFailedQuestions(userId),
    ]);

  const attempts = attemptsResult.error ? [] : (attemptsResult.data ?? []);
  const sessions = sessionsResult.error ? [] : (sessionsResult.data ?? []);
  const completedSessions = sessions.filter((session) => session.completed_at);
  const trainingSessions = completedSessions.filter((session) => isGeneralTrainingMode(session.mode));
  const latestRaw = trainingSessions[0];
  const recentFive = trainingSessions.slice(0, 5);

  const answeredNonBlank = attempts.filter((attempt) => !attempt.is_blank);
  const correctAttempts = answeredNonBlank.filter(
    (attempt) => attempt.is_correct,
  ).length;
  const overallAccuracy =
    answeredNonBlank.length > 0
      ? Math.round((correctAttempts / answeredNonBlank.length) * 1000) / 10
      : null;
  const trainingQuestionsSeen = new Set(
    attempts
      .filter((attempt) => getReliableOfficialTopic(attempt.question_id as string))
      .map((attempt) => getCanonicalQuestionId(attempt.question_id as string)),
  ).size;
  const trainingQuestionsAvailable = getOfficialCoverage().temas.reduce(
    (total, topic) => total + topic.porConfianza.alta,
    0,
  );

  let weakTopicsCount: number | null = null;

  if (attempts.length > 0) {
    const topicRows = await getTopicSummaries(userId);
    weakTopicsCount = topicRows.filter(
      (topic) =>
        topic.answered >= 3 &&
        topic.accuracy !== null &&
        topic.accuracy < 60,
    ).length;
  }

  const recentAverageNetScore =
    recentFive.length > 0
      ? recentFive.reduce(
          (total, session) => total + Number(session.net_score ?? 0),
          0,
        ) / recentFive.length
      : null;

  const latestSession = latestRaw ? mapSessionRow(latestRaw) : null;

  return {
    userId,
    latestNetScore: latestSession?.netScore ?? null,
    recentAverageNetScore,
    questionsAnswered: attempts.length,
    overallAccuracy,
    mistakesToReview: failedQuestionsAvailable,
    weakTopicsCount,
    trainingQuestionsSeen,
    trainingQuestionsAvailable,
    latestSession,
    inProgressSession,
    totalQuestionsAnswered: attempts.length,
  };
}

export async function getDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient();

  const [sessionsResult, attemptsResult] = await Promise.all([
      supabase
        .from("test_sessions")
        .select("mode, net_score, completed_at")
        .eq("user_id", userId)
        .not("completed_at", "is", null),
      supabase
        .from("attempts")
        .select("question_id, is_correct, is_blank, answered_at, test_sessions!inner(mode)")
        .eq("user_id", userId)
        .neq("test_sessions.mode", TEST_MODE_OFFICIAL_TOPIC),
  ]);

  const sessions = sessionsResult.data ?? [];
  const attempts = attemptsResult.data ?? [];
  const answeredAttempts = attempts.filter((attempt) => !attempt.is_blank);
  const correctAttempts = answeredAttempts.filter(
    (attempt) => attempt.is_correct,
  );

  const mostFailedTopics = buildOfficialTopicMetrics(
    attempts as OfficialMetricAttempt[],
  ).performance
    .filter((topic) => topic.wrong > 0)
    .map((topic) => ({
      topic: topic.topic,
      topicTitle: topic.topicTitle,
      count: topic.wrong,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  const trainingSessions = sessions.filter((session) => isGeneralTrainingMode(session.mode));

  return {
    totalSessions: trainingSessions.length,
    totalQuestionsAnswered: attempts.length,
    globalAccuracy: answeredAttempts.length
      ? Math.round((correctAttempts.length / answeredAttempts.length) * 1000) /
        10
      : null,
    averageNetScore: trainingSessions.length
      ? trainingSessions.reduce(
          (total, session) => total + Number(session.net_score ?? 0),
          0,
        ) / trainingSessions.length
      : null,
    mostFailedTopics,
  };
}

export async function getDashboardStudyMetrics(
  userId: string,
): Promise<DashboardStudyMetrics> {
  const supabase = createServerSupabaseClient();

  const [
    sessionsResult,
    attemptsResult,
    bookmarksResult,
    eligibleResult,
  ] = await Promise.all([
    supabase
      .from("test_sessions")
      .select(
        "mode, completed_at, correct_count, wrong_count, blank_count, net_score, total_questions",
      )
      .eq("user_id", userId)
      .not("completed_at", "is", null),
    supabase
      .from("attempts")
      .select("question_id, is_correct, is_blank, answered_at, test_sessions!inner(mode)")
      .eq("user_id", userId)
      .neq("test_sessions.mode", TEST_MODE_OFFICIAL_TOPIC),
    supabase
      .from("question_bookmarks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("answers").select("question_id").eq("is_correct", true),
  ]);

  const sessions = sessionsResult.data ?? [];
  const attempts = attemptsResult.data ?? [];
  const eligibleIds = new Set(
    (eligibleResult.data ?? []).map((row) => row.question_id as string),
  );

  const answeredAttempts = attempts.filter((attempt) => !attempt.is_blank);
  const correctTotal = answeredAttempts.filter(
    (attempt) => attempt.is_correct,
  ).length;
  const wrongTotal = answeredAttempts.filter(
    (attempt) => !attempt.is_correct,
  ).length;
  const blankTotal = attempts.filter((attempt) => attempt.is_blank).length;
  const uniqueQuestionsSeen = new Set(
    attempts.map((attempt) => attempt.question_id as string),
  ).size;
  const unseenQuestions = Math.max(
    0,
    eligibleIds.size - uniqueQuestionsSeen,
  );

  const trainingSessions = sessions.filter((session) => isGeneralTrainingMode(session.mode));
  const normalizedSessionGrades = trainingSessions
    .map((session) => {
      const answered =
        Number(session.correct_count ?? 0) + Number(session.wrong_count ?? 0);
      return normalizeNetScoreTo100(Number(session.net_score ?? 0), answered);
    })
    .filter((value): value is number => value !== null);
  const averageNormalizedNetScorePer100 = normalizedSessionGrades.length
    ? Math.round(
        (normalizedSessionGrades.reduce((total, value) => total + value, 0) /
          normalizedSessionGrades.length) *
          100,
      ) / 100
    : null;
  const netScore = computeNetScore(correctTotal, wrongTotal);
  const attemptDates = attempts.map((attempt) => attempt.answered_at as string);

  const topicPerformance = buildOfficialTopicMetrics(
    attempts as OfficialMetricAttempt[],
  ).performance;

  const mostFailedTopics = [...topicPerformance]
    .filter((topic) => topic.wrong > 0)
    .sort((left, right) => right.wrong - left.wrong)
    .slice(0, 5)
    .map((topic) => ({
      topic: topic.topic,
      topicTitle: topic.topicTitle,
      count: topic.wrong,
    }));

  return {
    completedSessions: trainingSessions.length,
    totalAnsweredQuestions: attempts.length,
    uniqueQuestionsSeen,
    correctTotal,
    wrongTotal,
    blankTotal,
    globalAccuracy: answeredAttempts.length
      ? Math.round((correctTotal / answeredAttempts.length) * 1000) / 10
      : null,
    averageNetScore: trainingSessions.length
      ? trainingSessions.reduce(
          (total, session) => total + Number(session.net_score ?? 0),
          0,
        ) / trainingSessions.length
      : null,
    normalizedNetScorePer100: normalizeNetScoreTo100(
      netScore,
      answeredAttempts.length,
    ),
    averageNormalizedNetScorePer100,
    failedAtLeastTwice: countFailedAtLeastTwice(attempts),
    unseenQuestions,
    bookmarkedQuestions: bookmarksResult.count ?? 0,
    currentStreakDays: computeStudyStreak(attemptDates),
    activityLast7Days: countActivitySince(attemptDates, 7),
    activityLast30Days: countActivitySince(attemptDates, 30),
    mostFailedTopics,
    performanceTrend: buildPerformanceTrend(sessions),
    topicPerformance,
  };
}

export async function getTopicSummaries(
  userId: string,
): Promise<TopicSummary[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("attempts")
    .select("question_id, is_correct, is_blank, answered_at, test_sessions!inner(mode)")
    .eq("user_id", userId)
    .neq("test_sessions.mode", TEST_MODE_OFFICIAL_TOPIC)
    .order("answered_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load official topic summaries: ${error.message}`);
  }

  return buildOfficialTopicMetrics(data as OfficialMetricAttempt[]).summaries;
}

export async function getRecentSessions(
  userId: string,
  options?: { page?: number; pageSize?: number },
): Promise<{ sessions: LatestSession[]; total: number; page: number; pageSize: number }> {
  const supabase = createServerSupabaseClient();
  const pageSize = options?.pageSize ?? 20;
  const page = Math.max(1, options?.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("test_sessions")
    .select(
      "id, mode, title, completed_at, total_questions, correct_count, wrong_count, blank_count, net_score",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) {
    return { sessions: [], total: 0, page, pageSize };
  }

  return {
    sessions: (data ?? []).map(mapSessionRow),
    total: count ?? 0,
    page,
    pageSize,
  };
}
