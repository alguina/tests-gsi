export { auditQuestionBank } from "@/lib/quality/audit";
export {
  loadStoredQualityIssues,
  markQualityIssueReviewed,
  runQuestionQualityAudit,
  setQuestionActive,
} from "@/lib/quality/service";
export {
  combinedSimilarity,
  hashQuestionContent,
  normalizeText,
} from "@/lib/quality/normalize";
export type {
  QualityAuditResult,
  QualityFlagType,
  QualityIssue,
  QualitySeverity,
} from "@/lib/quality/types";
