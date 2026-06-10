import { DEFAULT_USER_ID } from "@/lib/currentUser";
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
};

export type DashboardStats = {
  totalSessions: number;
  totalQuestionsAnswered: number;
  globalAccuracy: number | null;
  averageNetScore: number | null;
  mostFailedTopics: Array<{ topic: string; count: number }>;
};

export type TopicSummary = {
  topic: string;
  totalQuestions: number;
  answered: number;
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

export async function getHomeStudyStats(): Promise<HomeStudyStats> {
  const supabase = createServerSupabaseClient();

  const [sourcesResult, questionsResult, attemptsResult, sessionsResult] =
    await Promise.all([
      supabase.from("sources").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true }),
      supabase
        .from("attempts")
        .select("id, is_correct, is_blank")
        .eq("user_id", DEFAULT_USER_ID),
      supabase
        .from("test_sessions")
        .select(
          "id, mode, title, completed_at, total_questions, correct_count, wrong_count, blank_count, net_score",
        )
        .eq("user_id", DEFAULT_USER_ID)
        .order("completed_at", { ascending: false, nullsFirst: false })
        .limit(20),
    ]);

  const attempts = attemptsResult.error ? [] : (attemptsResult.data ?? []);
  const sessions = sessionsResult.error ? [] : (sessionsResult.data ?? []);
  const completedSessions = sessions.filter((session) => session.completed_at);
  const latestRaw = completedSessions[0];
  const wrongAttempts = attempts.filter(
    (attempt) => !attempt.is_blank && !attempt.is_correct,
  ).length;

  return {
    userId: DEFAULT_USER_ID,
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
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient();

  const [sessionsResult, attemptsResult, failedTopicsResult] = await Promise.all(
    [
      supabase
        .from("test_sessions")
        .select("net_score, completed_at")
        .eq("user_id", DEFAULT_USER_ID)
        .not("completed_at", "is", null),
      supabase
        .from("attempts")
        .select("is_correct, is_blank")
        .eq("user_id", DEFAULT_USER_ID),
      supabase
        .from("attempts")
        .select("question_id, is_correct, is_blank, questions(topic)")
        .eq("user_id", DEFAULT_USER_ID)
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

  const topicFailures = new Map<string, number>();
  for (const attempt of failedTopicsResult.data ?? []) {
    const topic = String(
      (attempt.questions as { topic?: string | null } | null)?.topic ?? "",
    ).trim();

    if (!topic) {
      continue;
    }

    topicFailures.set(topic, (topicFailures.get(topic) ?? 0) + 1);
  }

  const mostFailedTopics = [...topicFailures.entries()]
    .map(([topic, count]) => ({ topic, count }))
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

export async function getTopicSummaries(): Promise<TopicSummary[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("topic")
    .not("topic", "is", null);

  if (error) {
    throw new Error(`Failed to load topic summaries: ${error.message}`);
  }

  const counts = new Map<string, number>();
  for (const question of data ?? []) {
    const topic = String(question.topic ?? "").trim();
    if (!topic) {
      continue;
    }

    counts.set(topic, (counts.get(topic) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([topic, totalQuestions]) => ({
      topic,
      totalQuestions,
      answered: 0,
      accuracy: null,
      priority: "medium" as const,
    }))
    .sort((left, right) =>
      left.topic.localeCompare(right.topic, "es", { numeric: true }),
    );
}

export async function getRecentSessions(): Promise<LatestSession[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("test_sessions")
    .select(
      "id, mode, title, completed_at, total_questions, correct_count, wrong_count, blank_count, net_score",
    )
    .eq("user_id", DEFAULT_USER_ID)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(20);

  if (error) {
    return [];
  }

  return (data ?? []).map(mapSessionRow);
}
