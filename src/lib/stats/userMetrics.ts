import { computeTopicWeakness } from "@/lib/recommendations/questionSignals";

export type PerformanceTrendPoint = {
  date: string;
  sessionCount: number;
  accuracy: number | null;
  normalizedNetScore: number | null;
};

export type TopicPerformanceRow = {
  topic: string;
  topicTitle: string | null;
  availableQuestions: number;
  uniqueSeen: number;
  totalAttempts: number;
  correct: number;
  wrong: number;
  blank: number;
  accuracy: number | null;
  errorRate: number | null;
  lastAttemptedAt: string | null;
  priorityScore: number;
};

type AttemptRow = {
  question_id: string;
  is_correct: boolean;
  is_blank: boolean;
  answered_at: string;
};

type SessionRow = {
  completed_at: string | null;
  mode: string;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  net_score: number;
  total_questions: number;
};

function dominantTitle(titles: Map<string, number>): string | null {
  const sorted = [...titles.entries()].sort((left, right) => right[1] - left[1]);
  return sorted[0]?.[0] ?? null;
}

function roundPercent(value: number): number {
  return Math.round(value * 1000) / 10;
}

export function computeNetScore(correct: number, wrong: number): number {
  return correct - wrong / 3;
}

export function normalizeNetScoreTo100(
  netScore: number,
  answeredCount: number,
): number | null {
  if (answeredCount <= 0) {
    return null;
  }

  return Math.round((netScore * (100 / answeredCount)) * 100) / 100;
}

export function computeStudyStreak(attemptDates: string[], now: Date = new Date()): number {
  if (!attemptDates.length) {
    return 0;
  }

  const dayKeys = new Set(
    attemptDates.map((iso) => iso.slice(0, 10)),
  );

  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  const todayKey = cursor.toISOString().slice(0, 10);

  if (!dayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (true) {
    const key = cursor.toISOString().slice(0, 10);

    if (!dayKeys.has(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function countActivitySince(
  attemptDates: string[],
  days: number,
  now: Date = new Date(),
): number {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return attemptDates.filter(
    (iso) => new Date(iso).getTime() >= cutoff,
  ).length;
}

export function buildPerformanceTrend(
  sessions: SessionRow[],
  limit: number = 14,
): PerformanceTrendPoint[] {
  const trainingSessions = sessions
    .filter(
      (session) =>
        session.completed_at && session.mode !== "exam_simulation",
    )
    .sort((left, right) =>
      String(left.completed_at).localeCompare(String(right.completed_at)),
    )
    .slice(-limit);

  const byDate = new Map<
    string,
    { sessionCount: number; accuracySum: number; accuracyCount: number; netSum: number; netCount: number }
  >();

  for (const session of trainingSessions) {
    const date = String(session.completed_at).slice(0, 10);
    const answered = session.correct_count + session.wrong_count;
    const accuracy =
      answered > 0 ? session.correct_count / answered : null;
    const normalized =
      answered > 0
        ? normalizeNetScoreTo100(
            Number(session.net_score ?? 0),
            answered,
          )
        : null;

    const current = byDate.get(date) ?? {
      sessionCount: 0,
      accuracySum: 0,
      accuracyCount: 0,
      netSum: 0,
      netCount: 0,
    };

    current.sessionCount += 1;

    if (accuracy !== null) {
      current.accuracySum += accuracy;
      current.accuracyCount += 1;
    }

    if (normalized !== null) {
      current.netSum += normalized;
      current.netCount += 1;
    }

    byDate.set(date, current);
  }

  return [...byDate.entries()].map(([date, stats]) => ({
    date,
    sessionCount: stats.sessionCount,
    accuracy:
      stats.accuracyCount > 0
        ? roundPercent(stats.accuracySum / stats.accuracyCount)
        : null,
    normalizedNetScore:
      stats.netCount > 0
        ? Math.round((stats.netSum / stats.netCount) * 100) / 100
        : null,
  }));
}

export function buildTopicPerformance(input: {
  questions: Array<{ id: string; topic: string | null; block: string | null }>;
  attempts: AttemptRow[];
}): TopicPerformanceRow[] {
  const topicMeta = new Map<
    string,
    { availableQuestions: number; titles: Map<string, number> }
  >();

  for (const question of input.questions) {
    const topic = String(question.topic ?? "").trim();

    if (!topic) {
      continue;
    }

    const current = topicMeta.get(topic) ?? {
      availableQuestions: 0,
      titles: new Map<string, number>(),
    };
    current.availableQuestions += 1;

    const block = String(question.block ?? "").trim();

    if (block) {
      current.titles.set(block, (current.titles.get(block) ?? 0) + 1);
    }

    topicMeta.set(topic, current);
  }

  const seenByTopic = new Map<string, Set<string>>();
  const totalsByTopic = new Map<
    string,
    { correct: number; wrong: number; blank: number; totalAttempts: number; lastAttemptedAt: string | null }
  >();

  for (const attempt of input.attempts) {
    const question = input.questions.find((row) => row.id === attempt.question_id);
    const topic = String(question?.topic ?? "").trim();

    if (!topic) {
      continue;
    }

    const seen = seenByTopic.get(topic) ?? new Set<string>();
    seen.add(attempt.question_id);
    seenByTopic.set(topic, seen);

    const totals = totalsByTopic.get(topic) ?? {
      correct: 0,
      wrong: 0,
      blank: 0,
      totalAttempts: 0,
      lastAttemptedAt: null,
    };

    totals.totalAttempts += 1;

    if (!totals.lastAttemptedAt || attempt.answered_at > totals.lastAttemptedAt) {
      totals.lastAttemptedAt = attempt.answered_at;
    }

    if (attempt.is_blank) {
      totals.blank += 1;
    } else if (attempt.is_correct) {
      totals.correct += 1;
    } else {
      totals.wrong += 1;
    }

    totalsByTopic.set(topic, totals);
  }

  return [...topicMeta.entries()]
    .map(([topic, meta]) => {
      const totals = totalsByTopic.get(topic) ?? {
        correct: 0,
        wrong: 0,
        blank: 0,
        totalAttempts: 0,
        lastAttemptedAt: null,
      };
      const answered = totals.correct + totals.wrong;
      const uniqueSeen = seenByTopic.get(topic)?.size ?? 0;
      const unseenCount = meta.availableQuestions - uniqueSeen;
      const accuracy =
        answered > 0 ? roundPercent(totals.correct / answered) : null;
      const errorRate =
        answered > 0 ? roundPercent(totals.wrong / answered) : null;
      const priorityScore = computeTopicWeakness({
        topic,
        wrong: totals.wrong,
        answered,
        unseenCount: Math.max(0, unseenCount),
        totalQuestions: meta.availableQuestions,
      });

      return {
        topic,
        topicTitle: dominantTitle(meta.titles),
        availableQuestions: meta.availableQuestions,
        uniqueSeen,
        totalAttempts: totals.totalAttempts,
        correct: totals.correct,
        wrong: totals.wrong,
        blank: totals.blank,
        accuracy,
        errorRate,
        lastAttemptedAt: totals.lastAttemptedAt,
        priorityScore: Math.round(priorityScore * 1000) / 1000,
      };
    })
    .sort((left, right) => right.priorityScore - left.priorityScore);
}

export function countFailedAtLeastTwice(attempts: AttemptRow[]): number {
  const failCounts = new Map<string, number>();
  const latestCorrect = new Map<string, boolean>();

  for (const attempt of attempts.sort((left, right) =>
    right.answered_at.localeCompare(left.answered_at),
  )) {
    if (!latestCorrect.has(attempt.question_id)) {
      latestCorrect.set(attempt.question_id, attempt.is_correct === true);
    }

    if (!attempt.is_blank && !attempt.is_correct) {
      failCounts.set(
        attempt.question_id,
        (failCounts.get(attempt.question_id) ?? 0) + 1,
      );
    }
  }

  return [...failCounts.entries()].filter(
    ([questionId, count]) =>
      count >= 2 && latestCorrect.get(questionId) !== true,
  ).length;
}
