export type QualityFlagType =
  | "no_answers"
  | "no_correct_answer"
  | "multiple_correct_answers"
  | "empty_question_text"
  | "empty_answer_text"
  | "duplicate_answer_letters"
  | "malformed_answer_count"
  | "missing_topic"
  | "missing_source"
  | "exact_duplicate"
  | "near_duplicate_candidate"
  | "repeated_across_sources"
  | "orphan_answer"
  | "source_no_questions";

export type QualitySeverity = "critical" | "warning" | "info";

export type QualityIssue = {
  questionId: string | null;
  sourceId: string | null;
  flagType: QualityFlagType;
  severity: QualitySeverity;
  details: Record<string, unknown>;
  reviewed: boolean;
  questionText?: string | null;
  topic?: string | null;
  sourceTitle?: string | null;
  isActive?: boolean;
};

export type QualityAuditSummary = {
  totalQuestions: number;
  activeQuestions: number;
  totalSources: number;
  issueCounts: Record<string, number>;
  unreviewedCount: number;
  lastAuditedAt: string;
};

export type QualityAuditResult = {
  summary: QualityAuditSummary;
  issues: QualityIssue[];
};

export const QUALITY_FLAG_TYPES: QualityFlagType[] = [
  "no_answers",
  "no_correct_answer",
  "multiple_correct_answers",
  "empty_question_text",
  "empty_answer_text",
  "duplicate_answer_letters",
  "malformed_answer_count",
  "missing_topic",
  "missing_source",
  "exact_duplicate",
  "near_duplicate_candidate",
  "repeated_across_sources",
  "orphan_answer",
  "source_no_questions",
];

export const EXPECTED_ANSWER_COUNT = 4;
