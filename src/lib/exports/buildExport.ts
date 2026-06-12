import {
  buildExportFilename,
  formatExportDate,
  mdHeading,
  mdKeyValue,
  mdList,
  mdTable,
} from "@/lib/exports/markdown";
import type { ExportDocument, ExportRequest } from "@/lib/exports/types";
import { buildStudyRecommendation } from "@/lib/recommendations/buildRecommendation";
import {
  buildTopicPerformance,
  computeNetScore,
  normalizeNetScoreTo100,
} from "@/lib/stats/userMetrics";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TEST_MODE_EXAM } from "@/lib/testSession";

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 7);
  return { from: from.toISOString(), to: to.toISOString() };
}

async function loadAttemptsInRange(userId: string, from: string, to: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("attempts")
    .select(
      "question_id, is_correct, is_blank, answered_at, questions(text, topic, block, year, exam, sources(title))",
    )
    .eq("user_id", userId)
    .gte("answered_at", from)
    .lte("answered_at", to);

  return data ?? [];
}

export async function buildWeeklyReportExport(
  request: ExportRequest,
): Promise<ExportDocument> {
  const range = request.dateRange ?? defaultDateRange();
  const supabase = createServerSupabaseClient();

  const [sessionsResult, attempts, questionsResult, recommendation] =
    await Promise.all([
      supabase
        .from("test_sessions")
        .select("*")
        .eq("user_id", request.userId)
        .not("completed_at", "is", null)
        .gte("completed_at", range.from)
        .lte("completed_at", range.to)
        .neq("mode", TEST_MODE_EXAM),
      loadAttemptsInRange(request.userId, range.from, range.to),
      supabase.from("questions").select("id, topic, block").eq("is_active", true),
      buildStudyRecommendation(request.userId),
    ]);

  const sessions = sessionsResult.data ?? [];
  const answered = attempts.filter((attempt) => !attempt.is_blank);
  const correct = answered.filter((attempt) => attempt.is_correct).length;
  const wrong = answered.filter((attempt) => !attempt.is_correct).length;
  const blank = attempts.filter((attempt) => attempt.is_blank).length;
  const accuracy =
    answered.length > 0
      ? Math.round((correct / answered.length) * 1000) / 10
      : null;
  const netScore = computeNetScore(correct, wrong);
  const normalized = normalizeNetScoreTo100(netScore, answered.length);
  const avgNet =
    sessions.length > 0
      ? sessions.reduce(
          (total, session) => total + Number(session.net_score ?? 0),
          0,
        ) / sessions.length
      : null;

  const seenIds = new Set(attempts.map((attempt) => attempt.question_id as string));
  const eligibleQuestions = questionsResult.data ?? [];
  const unseenCount = eligibleQuestions.filter(
    (question) => !seenIds.has(question.id as string),
  ).length;

  const topicPerformance = buildTopicPerformance({
    questions: eligibleQuestions,
    attempts: attempts.map((attempt) => ({
      question_id: attempt.question_id as string,
      is_correct: attempt.is_correct === true,
      is_blank: attempt.is_blank === true,
      answered_at: attempt.answered_at as string,
    })),
  });

  const strongest = [...topicPerformance]
    .filter((topic) => topic.accuracy !== null)
    .sort((left, right) => (right.accuracy ?? 0) - (left.accuracy ?? 0))
    .slice(0, 5);
  const weakest = [...topicPerformance]
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .slice(0, 5);

  const recurringFailures = attempts
    .filter((attempt) => !attempt.is_blank && !attempt.is_correct)
    .reduce<Map<string, number>>((map, attempt) => {
      const id = attempt.question_id as string;
      map.set(id, (map.get(id) ?? 0) + 1);
      return map;
    }, new Map());

  const recurring = [...recurringFailures.entries()]
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 10);

  let markdown = mdHeading(1, "GSI A2 Weekly Study Report");
  markdown += mdKeyValue([
    ["Profile", request.profileName ?? "Student"],
    ["From", formatExportDate(range.from)],
    ["To", formatExportDate(range.to)],
    ["Generated", formatExportDate(new Date().toISOString())],
  ]);
  markdown += mdHeading(2, "Summary");
  markdown += mdKeyValue([
    ["Sessions completed", sessions.length],
    ["Questions answered", attempts.length],
    ["Correct", correct],
    ["Wrong", wrong],
    ["Blank", blank],
    ["Accuracy", accuracy === null ? null : `${accuracy}%`],
    ["Average net score", avgNet === null ? null : avgNet.toFixed(2)],
    ["Normalized net score (per 100)", normalized === null ? null : normalized.toFixed(2)],
    ["Unseen active questions", unseenCount],
  ]);
  markdown += mdHeading(2, "Strongest topics");
  markdown += mdList(
    strongest.map(
      (topic) =>
        `${topic.topic}${topic.topicTitle ? ` — ${topic.topicTitle}` : ""}: ${topic.accuracy}%`,
    ),
  );
  markdown += mdHeading(2, "Weakest topics");
  markdown += mdList(
    weakest.map(
      (topic) =>
        `${topic.topic}${topic.topicTitle ? ` — ${topic.topicTitle}` : ""}: priority ${topic.priorityScore.toFixed(2)}`,
    ),
  );
  markdown += mdHeading(2, "Recurring failures");
  markdown += mdList(
    recurring.map(([questionId, count]) => `Question ${questionId.slice(0, 8)}… (${count} wrong attempts in range)`),
  );
  markdown += mdHeading(2, "Recommended next actions");
  markdown += mdList(
    recommendation.reasons.map((reason) => {
      switch (reason.code) {
        case "topic_high_failure_rate":
          return `Review ${reason.params.title ?? reason.params.topic} (${reason.params.rate}% weakness signal).`;
        case "topic_many_unseen":
          return `Study unseen questions in ${reason.params.title ?? reason.params.topic} (${reason.params.count} remaining).`;
        case "failed_this_week":
          return `Retry failed questions from this week (${reason.params.count} flagged).`;
        case "stale_correct_revisit":
          return `Revisit ${reason.params.count} older correct answers.`;
        default:
          return String(reason.code);
      }
    }),
  );

  return {
    filename: buildExportFilename("gsi-weekly-report"),
    markdown,
  };
}

export async function buildErrorsByTopicExport(
  request: ExportRequest,
): Promise<ExportDocument> {
  const supabase = createServerSupabaseClient();
  const topic = request.topic?.trim();

  let query = supabase
    .from("attempts")
    .select(
      "question_id, selected_letter, is_correct, is_blank, answered_at, correct_letter, questions(text, topic, block, year, exam, answers(letter, text, is_correct), sources(title))",
    )
    .eq("user_id", request.userId)
    .eq("is_blank", false)
    .eq("is_correct", false)
    .order("answered_at", { ascending: false });

  const { data: attemptsRaw } = await query;
  const attempts = (attemptsRaw ?? []).filter((attempt) => {
    if (!topic) {
      return true;
    }

    const question = attempt.questions as { topic?: string | null } | null;
    return String(question?.topic ?? "").trim() === topic;
  });
  const [notesResult, bookmarksResult] = await Promise.all([
    supabase
      .from("question_notes")
      .select("question_id, note")
      .eq("user_id", request.userId),
    supabase
      .from("question_bookmarks")
      .select("question_id")
      .eq("user_id", request.userId),
  ]);

  const notes = new Map(
    (notesResult.data ?? []).map((row) => [row.question_id as string, row.note as string]),
  );
  const bookmarks = new Set(
    (bookmarksResult.data ?? []).map((row) => row.question_id as string),
  );

  const latestByQuestion = new Map<string, (typeof attempts extends Array<infer T> ? T : never)>();

  for (const attempt of attempts ?? []) {
    const questionId = attempt.question_id as string;

    if (!latestByQuestion.has(questionId)) {
      latestByQuestion.set(questionId, attempt);
    }
  }

  const grouped = new Map<string, typeof attempts>();

  for (const attempt of latestByQuestion.values()) {
    const question = attempt.questions as { topic?: string | null } | null;
    const topicKey = String(question?.topic ?? "unknown").trim() || "unknown";
    const bucket = grouped.get(topicKey) ?? [];
    bucket.push(attempt);
    grouped.set(topicKey, bucket);
  }

  let markdown = mdHeading(1, "GSI A2 Errors by Topic");
  markdown += mdKeyValue([
    ["Profile", request.profileName ?? "Student"],
    ["Topic filter", topic ?? "All topics"],
    ["Generated", formatExportDate(new Date().toISOString())],
  ]);

  for (const [topicKey, topicAttempts] of [...grouped.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "es", { numeric: true }),
  )) {
    markdown += mdHeading(2, `Topic ${topicKey}`);
    markdown += mdKeyValue([
      ["Failed questions", topicAttempts.length],
      [
        "Latest attempt",
        formatExportDate(String(topicAttempts[0]?.answered_at ?? "")),
      ],
    ]);

    for (const attempt of topicAttempts) {
      const question = extractJoinedQuestion(attempt.questions);

      const correct = question?.answers.find((answer) => answer.is_correct);
      const selected = question?.answers.find(
        (answer) => answer.letter === attempt.selected_letter,
      );
      const failCount = topicAttempts.filter(
        (row) => row.question_id === attempt.question_id,
      ).length;

      markdown += mdHeading(3, truncateHeading(question?.text ?? ""));
      markdown += mdKeyValue([
        ["Failure count in export", failCount],
        ["Latest attempt", formatExportDate(attempt.answered_at as string)],
        ["My answer", `${attempt.selected_letter ?? "—"} · ${selected?.text ?? "—"}`],
        ["Correct answer", `${correct?.letter ?? attempt.correct_letter ?? "—"} · ${correct?.text ?? "—"}`],
        ["Source", question?.sources?.title ?? "—"],
        ["Exam", question?.exam ?? "—"],
        ["Year", question?.year ?? "—"],
        ["Bookmarked", bookmarks.has(attempt.question_id as string) ? "Yes" : "No"],
      ]);

      const note = notes.get(attempt.question_id as string);

      if (note) {
        markdown += `**Personal note:** ${note}\n\n`;
      }
    }
  }

  const suffix = topic ? topic.toLowerCase().replace(/\s+/g, "-") : undefined;
  return {
    filename: buildExportFilename("gsi-errors", suffix),
    markdown,
  };
}

function truncateHeading(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > 80 ? `${normalized.slice(0, 80)}…` : normalized;
}

function extractJoinedQuestion(value: unknown) {
  if (!value) {
    return null;
  }

  const row = Array.isArray(value) ? value[0] : value;

  if (!row || typeof row !== "object") {
    return null;
  }

  const question = row as {
    text?: string;
    topic?: string | null;
    year?: string | null;
    exam?: string | null;
    answers?: Array<{ letter: string; text: string; is_correct: boolean }>;
    sources?: { title: string | null } | Array<{ title: string | null }> | null;
  };

  const sources = Array.isArray(question.sources)
    ? question.sources[0] ?? null
    : question.sources ?? null;

  return {
    text: question.text ?? "",
    topic: question.topic ?? null,
    year: question.year ?? null,
    exam: question.exam ?? null,
    answers: question.answers ?? [],
    sources,
  };
}

export async function buildStudyMaterialExport(
  request: ExportRequest,
): Promise<ExportDocument> {
  const errorsExport = await buildErrorsByTopicExport({
    ...request,
    type: "errors_by_topic",
  });
  const topic = request.topic ?? "All topics";

  let markdown = mdHeading(1, "GSI A2 Study Material Input");
  markdown += mdHeading(2, "Context");
  markdown += mdKeyValue([
    ["Profile", request.profileName ?? "Student"],
    ["Goal", request.studyGoal ?? ""],
    ["Topic focus", topic],
    ["Generated", formatExportDate(new Date().toISOString())],
  ]);
  markdown += mdHeading(2, "Instructions for external LLM");
  markdown += "_Add your instructions here before sharing this export._\n\n";
  markdown += mdHeading(2, "Structured error material");
  markdown += errorsExport.markdown.split("\n").slice(4).join("\n");

  const suffix = request.topic
    ? request.topic.toLowerCase().replace(/\s+/g, "-")
    : "all-topics";

  return {
    filename: buildExportFilename("gsi-study-material-input", suffix),
    markdown,
  };
}

export async function buildBookmarksExport(
  request: ExportRequest,
): Promise<ExportDocument> {
  const supabase = createServerSupabaseClient();
  const { data: bookmarks } = await supabase
    .from("question_bookmarks")
    .select("question_id")
    .eq("user_id", request.userId);

  const questionIds = (bookmarks ?? []).map((row) => row.question_id as string);

  if (!questionIds.length) {
    return {
      filename: buildExportFilename("gsi-bookmarks"),
      markdown:
        mdHeading(1, "GSI A2 Bookmarked Questions") +
        mdKeyValue([
          ["Profile", request.profileName ?? "Student"],
          ["Count", 0],
          ["Generated", formatExportDate(new Date().toISOString())],
        ]),
    };
  }

  const [questionsResult, notesResult] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id, text, topic, year, exam, answers(letter, text, is_correct), sources(title)",
      )
      .in("id", questionIds),
    supabase
      .from("question_notes")
      .select("question_id, note")
      .eq("user_id", request.userId)
      .in("question_id", questionIds),
  ]);

  const notes = new Map(
    (notesResult.data ?? []).map((row) => [row.question_id as string, row.note as string]),
  );

  let markdown = mdHeading(1, "GSI A2 Bookmarked Questions");
  markdown += mdKeyValue([
    ["Profile", request.profileName ?? "Student"],
    ["Count", questionsResult.data?.length ?? 0],
    ["Generated", formatExportDate(new Date().toISOString())],
  ]);

  for (const question of questionsResult.data ?? []) {
    const answers = (question.answers ?? []) as Array<{
      letter: string;
      text: string;
      is_correct: boolean;
    }>;
    const sourceValue = question.sources as
      | { title: string | null }
      | Array<{ title: string | null }>
      | null;
    const source = Array.isArray(sourceValue) ? sourceValue[0] ?? null : sourceValue;
    const correct = answers.find((answer) => answer.is_correct);
    const note = notes.get(question.id as string);

    markdown += mdHeading(2, truncateHeading(question.text as string));
    markdown += mdKeyValue([
      ["Topic", question.topic ?? "—"],
      ["Source", source?.title ?? "—"],
      ["Exam", question.exam ?? "—"],
      ["Year", question.year ?? "—"],
      ["Correct answer", `${correct?.letter ?? "—"} · ${correct?.text ?? "—"}`],
    ]);
    markdown += mdHeading(3, "Answers");
    markdown += mdTable(
      ["Letter", "Text", "Correct"],
      answers.map((answer) => [
        answer.letter,
        answer.text,
        answer.is_correct ? "Yes" : "No",
      ]),
    );

    if (note) {
      markdown += `**Personal note:** ${note}\n\n`;
    }
  }

  return {
    filename: buildExportFilename("gsi-bookmarks"),
    markdown,
  };
}

export async function buildProgressSnapshotExport(
  request: ExportRequest,
): Promise<ExportDocument> {
  const { getDashboardStudyMetrics } = await import("@/lib/studyMetrics");
  const metrics = await getDashboardStudyMetrics(request.userId);

  let markdown = mdHeading(1, "GSI A2 Progress Snapshot");
  markdown += mdKeyValue([
    ["Profile", request.profileName ?? "Student"],
    ["Generated", formatExportDate(new Date().toISOString())],
  ]);
  markdown += mdHeading(2, "Aggregate statistics");
  markdown += mdKeyValue([
    ["Completed sessions", metrics.completedSessions],
    ["Questions answered", metrics.totalAnsweredQuestions],
    ["Unique questions seen", metrics.uniqueQuestionsSeen],
    ["Correct", metrics.correctTotal],
    ["Wrong", metrics.wrongTotal],
    ["Blank", metrics.blankTotal],
    ["Global accuracy", metrics.globalAccuracy === null ? null : `${metrics.globalAccuracy}%`],
    ["Average net score", metrics.averageNetScore?.toFixed(2) ?? null],
    ["Normalized net score per 100", metrics.normalizedNetScorePer100?.toFixed(2) ?? null],
    ["Failed at least twice", metrics.failedAtLeastTwice],
    ["Unseen questions", metrics.unseenQuestions],
    ["Bookmarked questions", metrics.bookmarkedQuestions],
    ["Current streak (days)", metrics.currentStreakDays],
    ["Activity last 7 days", metrics.activityLast7Days],
    ["Activity last 30 days", metrics.activityLast30Days],
  ]);
  markdown += mdHeading(2, "Topic performance");
  markdown += mdTable(
    ["Topic", "Seen", "Attempts", "Accuracy", "Error rate", "Priority"],
    metrics.topicPerformance.slice(0, 25).map((topic) => [
      topic.topic,
      topic.uniqueSeen,
      topic.totalAttempts,
      topic.accuracy === null ? "—" : `${topic.accuracy}%`,
      topic.errorRate === null ? "—" : `${topic.errorRate}%`,
      topic.priorityScore.toFixed(2),
    ]),
  );

  return {
    filename: buildExportFilename("gsi-progress-snapshot"),
    markdown,
  };
}

export async function buildMarkdownExport(
  request: ExportRequest,
): Promise<ExportDocument> {
  switch (request.type) {
    case "weekly_report":
      return buildWeeklyReportExport(request);
    case "errors_by_topic":
      return buildErrorsByTopicExport(request);
    case "study_material":
      return buildStudyMaterialExport(request);
    case "bookmarks":
      return buildBookmarksExport(request);
    case "progress_snapshot":
      return buildProgressSnapshotExport(request);
    default:
      throw new Error("UNKNOWN_EXPORT_TYPE");
  }
}
