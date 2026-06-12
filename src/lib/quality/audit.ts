import {
  combinedSimilarity,
  hashQuestionContent,
  normalizeText,
} from "@/lib/quality/normalize";
import {
  EXPECTED_ANSWER_COUNT,
  type QualityAuditResult,
  type QualityIssue,
  type QualitySeverity,
} from "@/lib/quality/types";

type AnswerRow = {
  id: string;
  question_id: string;
  letter: string;
  text: string;
  is_correct: boolean;
};

type QuestionRow = {
  id: string;
  source_id: string;
  text: string;
  topic: string | null;
  block: string | null;
  year: string | null;
  exam: string | null;
  is_active: boolean | null;
  sources?: { id: string; title: string | null; external_id: string | null } | null;
};

const NEAR_DUPLICATE_THRESHOLD = 0.88;
const NEAR_DUPLICATE_MAX_COMPARE = 8000;

function severityFor(flagType: QualityIssue["flagType"]): QualitySeverity {
  switch (flagType) {
    case "no_answers":
    case "no_correct_answer":
    case "multiple_correct_answers":
    case "empty_question_text":
    case "orphan_answer":
      return "critical";
    case "exact_duplicate":
    case "repeated_across_sources":
    case "missing_topic":
    case "missing_source":
    case "duplicate_answer_letters":
    case "empty_answer_text":
    case "malformed_answer_count":
      return "warning";
    default:
      return "info";
  }
}

export function auditQuestionBank(input: {
  questions: QuestionRow[];
  answers: AnswerRow[];
  sources: Array<{ id: string; title: string | null }>;
  existingFlags?: Array<{ question_id: string; flag_type: string; reviewed: boolean }>;
}): QualityAuditResult {
  const answersByQuestion = new Map<string, AnswerRow[]>();

  for (const answer of input.answers) {
    const current = answersByQuestion.get(answer.question_id) ?? [];
    current.push(answer);
    answersByQuestion.set(answer.question_id, current);
  }

  const questionIds = new Set(input.questions.map((question) => question.id));
  const issues: QualityIssue[] = [];
  const hashToQuestionIds = new Map<string, string[]>();
  const sourceQuestionCounts = new Map<string, number>();

  for (const question of input.questions) {
    sourceQuestionCounts.set(
      question.source_id,
      (sourceQuestionCounts.get(question.source_id) ?? 0) + 1,
    );

    const answers = answersByQuestion.get(question.id) ?? [];
    const source = question.sources;
    const pushIssue = (
      flagType: QualityIssue["flagType"],
      details: Record<string, unknown>,
    ) => {
      issues.push({
        questionId: question.id,
        sourceId: question.source_id,
        flagType,
        severity: severityFor(flagType),
        details,
        reviewed: false,
        questionText: question.text,
        topic: question.topic,
        sourceTitle: source?.title ?? null,
        isActive: question.is_active ?? true,
      });
    };

    if (!normalizeText(question.text)) {
      pushIssue("empty_question_text", {});
    }

    if (!question.source_id || !source) {
      pushIssue("missing_source", {});
    }

    if (!String(question.topic ?? "").trim()) {
      pushIssue("missing_topic", {});
    }

    if (!answers.length) {
      pushIssue("no_answers", {});
    } else {
      const correctCount = answers.filter((answer) => answer.is_correct).length;

      if (correctCount === 0) {
        pushIssue("no_correct_answer", { answerCount: answers.length });
      }

      if (correctCount > 1) {
        pushIssue("multiple_correct_answers", {
          correctCount,
          letters: answers.filter((a) => a.is_correct).map((a) => a.letter),
        });
      }

      const letters = answers.map((answer) => answer.letter.trim().toUpperCase());
      const uniqueLetters = new Set(letters);

      if (uniqueLetters.size !== letters.length) {
        pushIssue("duplicate_answer_letters", { letters });
      }

      const emptyAnswers = answers.filter(
        (answer) => !normalizeText(answer.text),
      );

      if (emptyAnswers.length) {
        pushIssue("empty_answer_text", {
          letters: emptyAnswers.map((answer) => answer.letter),
        });
      }

      if (answers.length !== EXPECTED_ANSWER_COUNT) {
        pushIssue("malformed_answer_count", {
          expected: EXPECTED_ANSWER_COUNT,
          actual: answers.length,
        });
      }

      const hash = hashQuestionContent(
        question.text,
        answers.map((answer) => `${answer.letter}:${answer.text}`),
      );
      const bucket = hashToQuestionIds.get(hash) ?? [];
      bucket.push(question.id);
      hashToQuestionIds.set(hash, bucket);
    }
  }

  for (const [hash, ids] of hashToQuestionIds) {
    if (ids.length <= 1) {
      continue;
    }

    const bySource = new Map<string, string[]>();

    for (const questionId of ids) {
      const question = input.questions.find((row) => row.id === questionId)!;
      const sourceBucket = bySource.get(question.source_id) ?? [];
      sourceBucket.push(questionId);
      bySource.set(question.source_id, sourceBucket);
    }

    if (bySource.size === 1) {
      for (const questionId of ids.slice(1)) {
        const question = input.questions.find((row) => row.id === questionId)!;
        issues.push({
          questionId,
          sourceId: question.source_id,
          flagType: "exact_duplicate",
          severity: severityFor("exact_duplicate"),
          details: { hash, duplicateOf: ids[0], groupSize: ids.length },
          reviewed: false,
          questionText: question.text,
          topic: question.topic,
          sourceTitle: question.sources?.title ?? null,
          isActive: question.is_active ?? true,
        });
      }
    } else {
      for (const questionId of ids.slice(1)) {
        const question = input.questions.find((row) => row.id === questionId)!;
        issues.push({
          questionId,
          sourceId: question.source_id,
          flagType: "repeated_across_sources",
          severity: severityFor("repeated_across_sources"),
          details: { hash, duplicateOf: ids[0], groupSize: ids.length },
          reviewed: false,
          questionText: question.text,
          topic: question.topic,
          sourceTitle: question.sources?.title ?? null,
          isActive: question.is_active ?? true,
        });
      }
    }
  }

  let comparisons = 0;

  for (let leftIndex = 0; leftIndex < input.questions.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < input.questions.length;
      rightIndex += 1
    ) {
      if (comparisons >= NEAR_DUPLICATE_MAX_COMPARE) {
        break;
      }

      const left = input.questions[leftIndex]!;
      const right = input.questions[rightIndex]!;

      if (left.id === right.id) {
        continue;
      }

      const leftHash = hashQuestionContent(
        left.text,
        (answersByQuestion.get(left.id) ?? []).map(
          (answer) => `${answer.letter}:${answer.text}`,
        ),
      );
      const rightHash = hashQuestionContent(
        right.text,
        (answersByQuestion.get(right.id) ?? []).map(
          (answer) => `${answer.letter}:${answer.text}`,
        ),
      );

      if (leftHash === rightHash) {
        continue;
      }

      comparisons += 1;
      const similarity = combinedSimilarity(left.text, right.text);

      if (similarity >= NEAR_DUPLICATE_THRESHOLD) {
        issues.push({
          questionId: right.id,
          sourceId: right.source_id,
          flagType: "near_duplicate_candidate",
          severity: severityFor("near_duplicate_candidate"),
          details: {
            similarTo: left.id,
            similarity: Math.round(similarity * 1000) / 1000,
          },
          reviewed: false,
          questionText: right.text,
          topic: right.topic,
          sourceTitle: right.sources?.title ?? null,
          isActive: right.is_active ?? true,
        });
      }
    }
  }

  for (const answer of input.answers) {
    if (!questionIds.has(answer.question_id)) {
      issues.push({
        questionId: null,
        sourceId: null,
        flagType: "orphan_answer",
        severity: severityFor("orphan_answer"),
        details: { answerId: answer.id, letter: answer.letter },
        reviewed: false,
      });
    }
  }

  for (const source of input.sources) {
    if ((sourceQuestionCounts.get(source.id) ?? 0) === 0) {
      issues.push({
        questionId: null,
        sourceId: source.id,
        flagType: "source_no_questions",
        severity: severityFor("source_no_questions"),
        details: { sourceTitle: source.title },
        reviewed: false,
        sourceTitle: source.title,
      });
    }
  }

  const reviewedMap = new Map<string, boolean>();

  for (const flag of input.existingFlags ?? []) {
    reviewedMap.set(`${flag.question_id}:${flag.flag_type}`, flag.reviewed);
  }

  for (const issue of issues) {
    if (!issue.questionId) {
      continue;
    }

    const key = `${issue.questionId}:${issue.flagType}`;
    issue.reviewed = reviewedMap.get(key) ?? false;
  }

  const issueCounts: Record<string, number> = {};

  for (const issue of issues) {
    issueCounts[issue.flagType] = (issueCounts[issue.flagType] ?? 0) + 1;
  }

  return {
    summary: {
      totalQuestions: input.questions.length,
      activeQuestions: input.questions.filter(
        (question) => question.is_active !== false,
      ).length,
      totalSources: input.sources.length,
      issueCounts,
      unreviewedCount: issues.filter((issue) => !issue.reviewed).length,
      lastAuditedAt: new Date().toISOString(),
    },
    issues,
  };
}
