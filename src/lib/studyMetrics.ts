import { DEFAULT_STUDY_USER_ID } from "@/lib/currentUser";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LatestSession = {
  id: string;
  finishedAt: string | null;
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
  averageNetScore: number | null;
  weakTopicsCount: number;
  pendingReviewQuestions: number;
  latestSession: LatestSession | null;
};

export type TopicSummary = {
  topic: string;
  totalQuestions: number;
  answered: number;
  accuracy: number | null;
  priority: "high" | "medium" | "low";
};

export async function getHomeStudyStats(): Promise<HomeStudyStats> {
  const supabase = createServerSupabaseClient();

  const [sourcesResult, questionsResult, attemptsResult, sessionsResult] =
    await Promise.all([
      supabase.from("sources").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true }),
      supabase.from("attempts").select("id, is_correct, is_blank"),
      supabase
        .from("test_sessions")
        .select(
          "id, finished_at, total_questions, correct_count, wrong_count, blank_count, net_score",
        )
        .order("finished_at", { ascending: false, nullsFirst: false })
        .limit(20),
    ]);

  const attempts = attemptsResult.error ? [] : (attemptsResult.data ?? []);
  const sessions = sessionsResult.error ? [] : (sessionsResult.data ?? []);
  const completedSessions = sessions.filter((session) => session.finished_at);
  const latestRaw = completedSessions[0];
  const wrongAttempts = attempts.filter(
    (attempt) => !attempt.is_blank && !attempt.is_correct,
  ).length;

  return {
    userId: DEFAULT_STUDY_USER_ID,
    totalSourcesImported: sourcesResult.count ?? 0,
    totalQuestionsImported: questionsResult.count ?? 0,
    totalQuestionsAnswered: attempts.length,
    averageNetScore: completedSessions.length
      ? completedSessions.reduce(
          (total, session) => total + Number(session.net_score ?? 0),
          0,
        ) / completedSessions.length
      : null,
    weakTopicsCount: attempts.length ? 0 : 0,
    pendingReviewQuestions: wrongAttempts,
    latestSession: latestRaw
      ? {
          id: latestRaw.id,
          finishedAt: latestRaw.finished_at,
          totalQuestions: latestRaw.total_questions,
          correctCount: latestRaw.correct_count,
          wrongCount: latestRaw.wrong_count,
          blankCount: latestRaw.blank_count,
          netScore: Number(latestRaw.net_score ?? 0),
        }
      : null,
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
      "id, finished_at, total_questions, correct_count, wrong_count, blank_count, net_score",
    )
    .order("finished_at", { ascending: false, nullsFirst: false })
    .limit(20);

  if (error) {
    return [];
  }

  return (data ?? []).map((session) => ({
    id: session.id,
    finishedAt: session.finished_at,
    totalQuestions: session.total_questions,
    correctCount: session.correct_count,
    wrongCount: session.wrong_count,
    blankCount: session.blank_count,
    netScore: Number(session.net_score ?? 0),
  }));
}
