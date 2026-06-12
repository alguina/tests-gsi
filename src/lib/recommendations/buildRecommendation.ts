import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  BUCKET_RATIOS,
  RECOMMENDED_DEFAULT_COUNT,
} from "@/lib/recommendations/constants";
import { selectQuestionsFromBuckets } from "@/lib/recommendations/bucketSelector";
import {
  buildQuestionSignals,
  buildRecommendationReasons,
  computeTopicWeakness,
} from "@/lib/recommendations/questionSignals";
import { computeBucketTargets } from "@/lib/recommendations/priorityScore";
import type { StudyRecommendation } from "@/lib/recommendations/types";
import { RECENT_REPETITION_DAYS } from "@/lib/recommendations/constants";

export async function buildStudyRecommendation(
  userId: string,
  suggestedCount: number = RECOMMENDED_DEFAULT_COUNT,
): Promise<StudyRecommendation> {
  const supabase = createServerSupabaseClient();
  const now = new Date();

  const [questionsResult, attemptsResult, bookmarksResult, recentSessionsResult] =
    await Promise.all([
      supabase.from("questions").select("id, topic, block").eq("is_active", true),
      supabase
        .from("attempts")
        .select("question_id, is_correct, is_blank, answered_at")
        .eq("user_id", userId)
        .order("answered_at", { ascending: false }),
      supabase
        .from("question_bookmarks")
        .select("question_id")
        .eq("user_id", userId),
      supabase
        .from("test_sessions")
        .select("draft_state, completed_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const questions = (questionsResult.data ?? []).filter((question) => question.topic);
  const attempts = attemptsResult.data ?? [];
  const bookmarkedQuestionIds = new Set(
    (bookmarksResult.data ?? []).map((row) => row.question_id as string),
  );

  const recentlySeenQuestionIds = new Set<string>();
  const repetitionCutoff = now.getTime() - RECENT_REPETITION_DAYS * 24 * 60 * 60 * 1000;

  for (const session of recentSessionsResult.data ?? []) {
    const draft = session.draft_state as { questionIds?: string[] } | null;
    const sessionTime = new Date(
      session.completed_at ?? session.created_at ?? now.toISOString(),
    ).getTime();

    if (sessionTime >= repetitionCutoff) {
      for (const questionId of draft?.questionIds ?? []) {
        recentlySeenQuestionIds.add(questionId);
      }
    }
  }

  const topicStats = new Map<
    string,
    { total: number; seen: Set<string>; wrong: number; answered: number; unseen: number }
  >();

  for (const question of questions) {
    const topic = String(question.topic ?? "").trim();
    const stats = topicStats.get(topic) ?? {
      total: 0,
      seen: new Set<string>(),
      wrong: 0,
      answered: 0,
      unseen: 0,
    };
    stats.total += 1;
    topicStats.set(topic, stats);
  }

  for (const attempt of attempts) {
    const question = questions.find((row) => row.id === attempt.question_id);
    const topic = String(question?.topic ?? "").trim();

    if (!topic) {
      continue;
    }

    const stats = topicStats.get(topic)!;
    stats.seen.add(attempt.question_id as string);

    if (attempt.is_blank) {
      continue;
    }

    stats.answered += 1;

    if (!attempt.is_correct) {
      stats.wrong += 1;
    }
  }

  for (const [topic, stats] of topicStats) {
    stats.unseen = stats.total - stats.seen.size;
    topicStats.set(topic, stats);
  }

  const topicWeaknessByTopic = new Map<string, number>();

  for (const [topic, stats] of topicStats) {
    topicWeaknessByTopic.set(
      topic,
      computeTopicWeakness({
        topic,
        wrong: stats.wrong,
        answered: stats.answered,
        unseenCount: stats.unseen,
        totalQuestions: stats.total,
      }),
    );
  }

  const eligibleQuestionIds = new Set<string>();
  const { data: eligibleAnswers } = await supabase
    .from("answers")
    .select("question_id")
    .eq("is_correct", true);

  for (const answer of eligibleAnswers ?? []) {
    eligibleQuestionIds.add(answer.question_id as string);
  }

  const eligibleQuestions = questions.filter((question) =>
    eligibleQuestionIds.has(question.id as string),
  );

  const signals = buildQuestionSignals({
    questions: eligibleQuestions,
    attempts,
    bookmarkedQuestionIds,
    recentlySeenQuestionIds,
    topicWeaknessByTopic,
    now,
  });

  const bucketTargets = computeBucketTargets(
    suggestedCount,
    BUCKET_RATIOS,
  ) as Record<import("@/lib/recommendations/types").BucketName, number>;

  const seed = `${userId}:${now.toISOString().slice(0, 10)}:${suggestedCount}`;
  const { selected, composition } = selectQuestionsFromBuckets(
    signals,
    bucketTargets,
    suggestedCount,
    seed,
  );

  const topicMap = new Map<string, string | null>();

  for (const signal of selected) {
    if (!signal.topic) {
      continue;
    }

    topicMap.set(signal.topic, signal.topicTitle);
  }

  const topics = [...topicMap.entries()].map(([topic, topicTitle]) => ({
    topic,
    topicTitle,
  }));

  const reasons = buildRecommendationReasons({
    signals,
    topicWeaknessByTopic,
    now,
  });

  return {
    suggestedCount,
    topics,
    reasons,
    composition,
    questionIds: selected.map((signal) => signal.questionId),
    metadata: {
      bucketTargets,
      generatedAt: now.toISOString(),
    },
  };
}
