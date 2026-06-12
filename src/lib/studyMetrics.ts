import {
  countFailedQuestions,
  getInProgressSession,
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

export type TopicSummary = {
  topic: string;
  topicTitle: string | null;
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

  return {
    userId,
    totalSourcesImported: sourcesResult.count ?? 0,
    totalQuestionsImported: questionsResult.count ?? 0,
    totalQuestionsAnswered: attempts.length,
    totalSessionsCompleted: completedSessions.length,
    averageNetScore: completedSessions.length
      ? completedSessions.reduce(
          (total, session) => total + Number(session.net_score ?? 0),
          0,
        ) / completedSessions.length
      : null,
    weakTopicsCount: 0,
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
        .select("net_score, completed_at")
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

  return {
    totalSessions: sessions.length,
    totalQuestionsAnswered: attempts.length,
    globalAccuracy: answeredAttempts.length
      ? Math.round((correctAttempts.length / answeredAttempts.length) * 1000) /
        10
      : null,
    averageNetScore: sessions.length
      ? sessions.reduce(
          (total, session) => total + Number(session.net_score ?? 0),
          0,
        ) / sessions.length
      : null,
    mostFailedTopics,
  };
}

export async function getTopicSummaries(
  userId: string,
): Promise<TopicSummary[]> {
  const supabase = createServerSupabaseClient();

  const [questionsResult, attemptsResult] = await Promise.all([
    supabase
      .from("questions")
      .select("id, topic, block")
      .not("topic", "is", null),
    supabase
      .from("attempts")
      .select(
        "question_id, is_correct, is_blank, answered_at, questions(topic, block)",
      )
      .eq("user_id", userId)
      .order("answered_at", { ascending: false }),
  ]);

  if (questionsResult.error) {
    throw new Error(
      `Failed to load topic summaries: ${questionsResult.error.message}`,
    );
  }

  const topicMeta = new Map<string, { totalQuestions: number; titles: Map<string, number> }>();

  for (const question of questionsResult.data ?? []) {
    const topic = String(question.topic ?? "").trim();
    const block = String(question.block ?? "").trim();

    if (!topic) {
      continue;
    }

    const current = topicMeta.get(topic) ?? {
      totalQuestions: 0,
      titles: new Map<string, number>(),
    };
    current.totalQuestions += 1;

    if (block) {
      current.titles.set(block, (current.titles.get(block) ?? 0) + 1);
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

      const topicTitle =
        [...meta.titles.entries()].sort((left, right) => right[1] - left[1])[0]
          ?.[0] ?? null;

      return {
        topic,
        topicTitle,
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
): Promise<LatestSession[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("test_sessions")
    .select(
      "id, mode, title, completed_at, total_questions, correct_count, wrong_count, blank_count, net_score",
    )
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(20);

  if (error) {
    return [];
  }

  return (data ?? []).map(mapSessionRow);
}
