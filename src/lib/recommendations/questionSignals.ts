import {
  FAILED_THIS_WEEK_DAYS,
  RECENT_REPETITION_DAYS,
  STALE_CORRECT_DAYS,
} from "@/lib/recommendations/constants";
import { computePriorityScore } from "@/lib/recommendations/priorityScore";
import type { BucketName, QuestionSignals } from "@/lib/recommendations/types";

type AttemptRow = {
  question_id: string;
  is_correct: boolean;
  is_blank: boolean;
  answered_at: string;
};

type QuestionRow = {
  id: string;
  topic: string | null;
  block: string | null;
};

function daysSince(isoDate: string | null, now: Date): number {
  if (!isoDate) {
    return Number.POSITIVE_INFINITY;
  }

  const then = new Date(isoDate).getTime();
  return (now.getTime() - then) / (1000 * 60 * 60 * 24);
}

function dominantTitle(
  titles: Map<string, number>,
): string | null {
  const sorted = [...titles.entries()].sort((left, right) => right[1] - left[1]);
  return sorted[0]?.[0] ?? null;
}

export function buildQuestionSignals(input: {
  questions: QuestionRow[];
  attempts: AttemptRow[];
  bookmarkedQuestionIds: Set<string>;
  recentlySeenQuestionIds: Set<string>;
  topicWeaknessByTopic: Map<string, number>;
  now?: Date;
}): QuestionSignals[] {
  const now = input.now ?? new Date();
  const attemptsByQuestion = new Map<string, AttemptRow[]>();
  const topicTitles = new Map<string, Map<string, number>>();

  for (const question of input.questions) {
    const topic = String(question.topic ?? "").trim();

    if (!topic || !question.block) {
      continue;
    }

    const titles = topicTitles.get(topic) ?? new Map<string, number>();
    titles.set(String(question.block), (titles.get(String(question.block)) ?? 0) + 1);
    topicTitles.set(topic, titles);
  }

  for (const attempt of input.attempts) {
    const current = attemptsByQuestion.get(attempt.question_id) ?? [];
    current.push(attempt);
    attemptsByQuestion.set(attempt.question_id, current);
  }

  return input.questions.map((question) => {
    const topic = String(question.topic ?? "").trim() || null;
    const topicTitle = topic ? dominantTitle(topicTitles.get(topic) ?? new Map()) : null;
    const questionAttempts = (attemptsByQuestion.get(question.id) ?? []).sort(
      (left, right) =>
        new Date(right.answered_at).getTime() - new Date(left.answered_at).getTime(),
    );

    const answeredAttempts = questionAttempts.filter((attempt) => !attempt.is_blank);
    const wrongAttempts = answeredAttempts.filter((attempt) => !attempt.is_correct);
    const failCount = wrongAttempts.length;
    const failureRate =
      answeredAttempts.length > 0 ? failCount / answeredAttempts.length : 0;
    const latest = questionAttempts[0];
    const latestIsCorrect = latest
      ? latest.is_blank
        ? null
        : latest.is_correct
      : null;
    const lastAttemptedAt = latest?.answered_at ?? null;
    const daysSinceLast = daysSince(lastAttemptedAt, now);
    const unseen = questionAttempts.length === 0;

    const topicWeakness = topic
      ? (input.topicWeaknessByTopic.get(topic) ?? 0)
      : 0;
    const recencyNeed = Math.min(1, daysSinceLast / STALE_CORRECT_DAYS);
    const unseenBoost = unseen ? 1 : 0;
    const bookmarkBoost = input.bookmarkedQuestionIds.has(question.id) ? 1 : 0;
    const recentRepetitionPenalty = input.recentlySeenQuestionIds.has(question.id)
      ? 0.35
      : 0;

    let bucket: BucketName = "staleCorrect";

    if (unseen) {
      bucket = "unseen";
    } else if (latestIsCorrect === false) {
      bucket = "failed";
    } else if (topicWeakness >= 0.5) {
      bucket = "weakTopic";
    } else if (
      latestIsCorrect === true &&
      daysSinceLast >= STALE_CORRECT_DAYS
    ) {
      bucket = "staleCorrect";
    } else if (topicWeakness >= 0.35) {
      bucket = "weakTopic";
    }

    const priorityScore = computePriorityScore({
      topicWeakness,
      questionFailureScore: failureRate,
      recencyNeed,
      unseenBoost,
      bookmarkBoost,
      recentRepetitionPenalty,
    });

    return {
      questionId: question.id,
      topic,
      topicTitle,
      failureRate,
      failCount,
      topicWeakness,
      recencyNeed,
      unseenBoost,
      bookmarkBoost,
      recentRepetitionPenalty,
      latestIsCorrect,
      lastAttemptedAt,
      priorityScore,
      bucket,
    };
  });
}

export function computeTopicWeakness(input: {
  topic: string;
  wrong: number;
  answered: number;
  unseenCount: number;
  totalQuestions: number;
}): number {
  const errorRate = input.answered > 0 ? input.wrong / input.answered : 0.5;
  const unseenRatio =
    input.totalQuestions > 0 ? input.unseenCount / input.totalQuestions : 0;

  return Math.min(1, errorRate * 0.7 + unseenRatio * 0.3);
}

export function buildRecommendationReasons(input: {
  signals: QuestionSignals[];
  topicWeaknessByTopic: Map<string, number>;
  now?: Date;
}): import("@/lib/recommendations/types").RecommendationReason[] {
  const now = input.now ?? new Date();
  const reasons: import("@/lib/recommendations/types").RecommendationReason[] =
    [];

  const weakTopics = [...input.topicWeaknessByTopic.entries()]
    .filter(([, weakness]) => weakness >= 0.45)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2);

  for (const [topic, weakness] of weakTopics) {
    const sample = input.signals.find((signal) => signal.topic === topic);
    reasons.push({
      code: "topic_high_failure_rate",
      params: {
        topic,
        title: sample?.topicTitle ?? topic,
        rate: Math.round(weakness * 100),
      },
    });
  }

  const unseenByTopic = new Map<string, number>();

  for (const signal of input.signals) {
    if (!signal.topic || signal.unseenBoost === 0) {
      continue;
    }

    unseenByTopic.set(signal.topic, (unseenByTopic.get(signal.topic) ?? 0) + 1);
  }

  const topUnseen = [...unseenByTopic.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 1);

  for (const [topic, count] of topUnseen) {
    if (count >= 5) {
      const sample = input.signals.find((signal) => signal.topic === topic);
      reasons.push({
        code: "topic_many_unseen",
        params: {
          topic,
          title: sample?.topicTitle ?? topic,
          count,
        },
      });
    }
  }

  const failedThisWeek = input.signals.filter(
    (signal) =>
      signal.latestIsCorrect === false &&
      daysSince(signal.lastAttemptedAt, now) <= FAILED_THIS_WEEK_DAYS,
  ).length;

  if (failedThisWeek >= 3) {
    reasons.push({
      code: "failed_this_week",
      params: { count: failedThisWeek },
    });
  }

  const staleCorrect = input.signals.filter(
    (signal) =>
      signal.latestIsCorrect === true &&
      daysSince(signal.lastAttemptedAt, now) >= STALE_CORRECT_DAYS,
  ).length;

  if (staleCorrect >= 5 && reasons.length < 3) {
    reasons.push({
      code: "stale_correct_revisit",
      params: { count: staleCorrect },
    });
  }

  return reasons.slice(0, 3);
}
