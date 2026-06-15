import {
  buildPerformanceTrend,
  buildTopicPerformance,
  computeNetScore,
  computeStudyStreak,
  countActivitySince,
  countFailedAtLeastTwice,
  normalizeNetScoreTo100,
  type PerformanceTrendPoint,
  type TopicPerformanceRow,
} from "@/lib/stats/userMetrics";
import {
  countFailedQuestions,
  getInProgressSession,
  TEST_MODE_EXAM,
  type InProgressSession,
} from "@/lib/testSession";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  pickDominantValue,
  resolveTopicLabel,
} from "@/lib/topics/resolveTopicLabel";

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
  totalQuestionsImported: number;
  totalSourcesImported: number;
  totalQuestionsAnswered: number;
  totalSessionsCompleted: number;
  averageNetScore: number | null;
  weakTopicsCount: number;
  pendingReviewQuestions: number;
  latestSession: LatestSession | null;
  inProgressSession: InProgressSession | null;
  failedQuestionsAvailable: number;
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

  const [sourcesResult, questionsResult, attemptsResult, sessionsResult, inProgressSession, failedQuestionsAvailable] =
    await Promise.all([
      supabase.from("sources").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true }),
      supabase
        .from("attempts")
        .select("id, is_correct, is_blank")
        .eq("user_id", userId),
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
  const latestRaw = completedSessions[0];
  const wrongAttempts = attempts.filter(
    (attempt) => !attempt.is_blank && !attempt.is_correct,
  ).length;

  const trainingSessions = completedSessions.filter(
    (session) => session.mode !== TEST_MODE_EXAM,
  );

  let weakTopicsCount = 0;

  if (attempts.length > 0) {
    const topicRows = await getTopicSummaries(userId);
    weakTopicsCount = topicRows.filter(
      (topic) => topic.priority === "high" || topic.priority === "medium",
    ).length;
  }

  return {
    userId,
    totalSourcesImported: sourcesResult.count ?? 0,
    totalQuestionsImported: questionsResult.count ?? 0,
    totalQuestionsAnswered: attempts.length,
    totalSessionsCompleted: completedSessions.length,
    averageNetScore: trainingSessions.length
      ? trainingSessions.reduce(
          (total, session) => total + Number(session.net_score ?? 0),
          0,
        ) / trainingSessions.length
      : null,
    weakTopicsCount,
    pendingReviewQuestions: wrongAttempts,
    latestSession: latestRaw ? mapSessionRow(latestRaw) : null,
    inProgressSession,
    failedQuestionsAvailable,
  };
}

export async function getDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient();

  const [sessionsResult, attemptsResult, failedTopicsResult] = await Promise.all(
    [
      supabase
        .from("test_sessions")
        .select("mode, net_score, completed_at")
        .eq("user_id", userId)
        .not("completed_at", "is", null),
      supabase
        .from("attempts")
        .select("is_correct, is_blank")
        .eq("user_id", userId),
      supabase
        .from("attempts")
        .select("question_id, is_correct, is_blank, questions(topic, block)")
        .eq("user_id", userId)
        .eq("is_correct", false)
        .eq("is_blank", false),
    ],
  );

  const sessions = sessionsResult.data ?? [];
  const attempts = attemptsResult.data ?? [];
  const answeredAttempts = attempts.filter((attempt) => !attempt.is_blank);
  const correctAttempts = answeredAttempts.filter(
    (attempt) => attempt.is_correct,
  );

  const topicFailures = new Map<
    string,
    { count: number; titles: Map<string, number> }
  >();

  for (const attempt of failedTopicsResult.data ?? []) {
    const question = attempt.questions as {
      topic?: string | null;
      block?: string | null;
    } | null;

    const topic = String(question?.topic ?? "").trim();
    const block = String(question?.block ?? "").trim();

    if (!topic) {
      continue;
    }

    const current = topicFailures.get(topic) ?? {
      count: 0,
      titles: new Map<string, number>(),
    };
    current.count += 1;

    if (block) {
      current.titles.set(block, (current.titles.get(block) ?? 0) + 1);
    }

    topicFailures.set(topic, current);
  }

  const mostFailedTopics = [...topicFailures.entries()]
    .map(([topic, stats]) => {
      const topicTitle =
        [...stats.titles.entries()].sort((left, right) => right[1] - left[1])[0]
          ?.[0] ?? null;

      return { topic, topicTitle, count: stats.count };
    })
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  const trainingSessions = sessions.filter(
    (session) => session.mode !== TEST_MODE_EXAM,
  );

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
    questionsResult,
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
      .select("question_id, is_correct, is_blank, answered_at")
      .eq("user_id", userId),
    supabase.from("questions").select("id, topic, block").not("topic", "is", null),
    supabase
      .from("question_bookmarks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("answers").select("question_id").eq("is_correct", true),
  ]);

  const sessions = sessionsResult.data ?? [];
  const attempts = attemptsResult.data ?? [];
  const questions = questionsResult.data ?? [];
  const eligibleIds = new Set(
    (eligibleResult.data ?? []).map((row) => row.question_id as string),
  );
  const eligibleQuestions = questions.filter((question) =>
    eligibleIds.has(question.id as string),
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
    eligibleQuestions.length - uniqueQuestionsSeen,
  );

  const trainingSessions = sessions.filter(
    (session) => session.mode !== TEST_MODE_EXAM,
  );
  const netScore = computeNetScore(correctTotal, wrongTotal);
  const attemptDates = attempts.map((attempt) => attempt.answered_at as string);

  const topicPerformance = buildTopicPerformance({
    questions: eligibleQuestions,
    attempts,
  });

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

  const [questionsResult, attemptsResult] = await Promise.all([
    supabase
      .from("questions")
      .select("id, topic, block, exam, year, sources(title)")
      .not("topic", "is", null),
    supabase
      .from("attempts")
      .select(
        "question_id, is_correct, is_blank, answered_at, questions(topic, block, exam, year, sources(title))",
      )
      .eq("user_id", userId)
      .order("answered_at", { ascending: false }),
  ]);

  if (questionsResult.error) {
    throw new Error(
      `Failed to load topic summaries: ${questionsResult.error.message}`,
    );
  }

  const topicMeta = new Map<
    string,
    {
      totalQuestions: number;
      blocks: Map<string, number>;
      exams: Map<string, number>;
      years: Map<string, number>;
      sourceTitles: Map<string, number>;
    }
  >();

  for (const question of questionsResult.data ?? []) {
    const topic = String(question.topic ?? "").trim();
    const block = String(question.block ?? "").trim();
    const exam = String(question.exam ?? "").trim();
    const year = String(question.year ?? "").trim();
    const sourceTitle = String(
      (question.sources as { title?: string | null } | null)?.title ?? "",
    ).trim();

    if (!topic) {
      continue;
    }

    const current = topicMeta.get(topic) ?? {
      totalQuestions: 0,
      blocks: new Map<string, number>(),
      exams: new Map<string, number>(),
      years: new Map<string, number>(),
      sourceTitles: new Map<string, number>(),
    };
    current.totalQuestions += 1;

    if (block) {
      current.blocks.set(block, (current.blocks.get(block) ?? 0) + 1);
    }
    if (exam) {
      current.exams.set(exam, (current.exams.get(exam) ?? 0) + 1);
    }
    if (year) {
      current.years.set(year, (current.years.get(year) ?? 0) + 1);
    }
    if (sourceTitle) {
      current.sourceTitles.set(
        sourceTitle,
        (current.sourceTitles.get(sourceTitle) ?? 0) + 1,
      );
    }

    topicMeta.set(topic, current);
  }

  const latestByQuestion = new Map<
    string,
    { topic: string; isCorrect: boolean; isBlank: boolean }
  >();
  const totalsByTopic = new Map<
    string,
    { correct: number; wrong: number; blank: number; answered: number }
  >();

  for (const attempt of attemptsResult.data ?? []) {
    const question = attempt.questions as {
      topic?: string | null;
      block?: string | null;
    } | null;
    const topic = String(question?.topic ?? "").trim();
    const questionId = attempt.question_id as string;

    if (!topic) {
      continue;
    }

    if (!latestByQuestion.has(questionId)) {
      latestByQuestion.set(questionId, {
        topic,
        isCorrect: attempt.is_correct === true,
        isBlank: attempt.is_blank === true,
      });
    }

    const totals = totalsByTopic.get(topic) ?? {
      correct: 0,
      wrong: 0,
      blank: 0,
      answered: 0,
    };

    if (attempt.is_blank) {
      totals.blank += 1;
    } else if (attempt.is_correct) {
      totals.correct += 1;
      totals.answered += 1;
    } else {
      totals.wrong += 1;
      totals.answered += 1;
    }

    totalsByTopic.set(topic, totals);
  }

  const failedByTopic = new Map<string, number>();
  for (const [, latest] of latestByQuestion) {
    if (latest.isCorrect || latest.isBlank) {
      continue;
    }

    failedByTopic.set(latest.topic, (failedByTopic.get(latest.topic) ?? 0) + 1);
  }

  return [...topicMeta.entries()]
    .map(([topic, meta]) => {
      const totals = totalsByTopic.get(topic) ?? {
        correct: 0,
        wrong: 0,
        blank: 0,
        answered: 0,
      };
      const accuracy =
        totals.answered > 0
          ? Math.round((totals.correct / totals.answered) * 1000) / 10
          : null;

      let priority: TopicSummary["priority"] = "low";
      if (totals.answered === 0) {
        priority = "medium";
      } else if (accuracy !== null && accuracy < 50) {
        priority = "high";
      } else if (accuracy !== null && accuracy < 75) {
        priority = "medium";
      }

      const topicTitle = pickDominantValue(meta.blocks);
      const resolved = resolveTopicLabel({
        topic,
        block: topicTitle,
        exam: pickDominantValue(meta.exams),
        year: pickDominantValue(meta.years),
        sourceTitle: pickDominantValue(meta.sourceTitles),
      });

      return {
        topic,
        topicTitle,
        displayLabel: resolved.label,
        description: resolved.description,
        sourceHint: resolved.sourceHint,
        rawBlock: resolved.rawBlock,
        totalQuestions: meta.totalQuestions,
        answered: totals.answered,
        correct: totals.correct,
        wrong: totals.wrong,
        blank: totals.blank,
        failedCount: failedByTopic.get(topic) ?? 0,
        accuracy,
        priority,
      };
    })
    .sort((left, right) =>
      left.topic.localeCompare(right.topic, "es", { numeric: true }),
    );
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
