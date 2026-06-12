import { createServerSupabaseClient } from "@/lib/supabase/server";
import { auditQuestionBank } from "@/lib/quality/audit";
import type { QualityAuditResult, QualityFlagType, QualityIssue } from "@/lib/quality/types";
import { logServerEvent } from "@/lib/server/logger";

export async function runQuestionQualityAudit(): Promise<QualityAuditResult> {
  const supabase = createServerSupabaseClient();

  const [questionsResult, answersResult, sourcesResult, flagsResult] =
    await Promise.all([
      supabase
        .from("questions")
        .select(
          "id, source_id, text, topic, block, year, exam, is_active, sources(id, title, external_id)",
        ),
      supabase.from("answers").select("id, question_id, letter, text, is_correct"),
      supabase.from("sources").select("id, title"),
      supabase.from("question_quality_flags").select("question_id, flag_type, reviewed"),
    ]);

  if (questionsResult.error) {
    logServerEvent("quality_audit_failed", {
      stage: "load_questions",
      message: questionsResult.error.message,
    });
    throw new Error(`Failed to load questions: ${questionsResult.error.message}`);
  }

  const questions = (questionsResult.data ?? []).map((row) => {
    const sourceValue = row.sources as
      | { id: string; title: string | null; external_id: string | null }
      | Array<{ id: string; title: string | null; external_id: string | null }>
      | null;

    return {
      id: row.id as string,
      source_id: row.source_id as string,
      text: row.text as string,
      topic: row.topic as string | null,
      block: row.block as string | null,
      year: row.year as string | null,
      exam: row.exam as string | null,
      is_active: row.is_active as boolean | null,
      sources: Array.isArray(sourceValue) ? sourceValue[0] ?? null : sourceValue,
    };
  });

  const result = auditQuestionBank({
    questions,
    answers: answersResult.data ?? [],
    sources: sourcesResult.data ?? [],
    existingFlags: flagsResult.data ?? [],
  });

  await persistQualityFlags(result.issues.filter((issue) => issue.questionId));

  logServerEvent("quality_audit_completed", {
    issueCount: result.issues.length,
    questionCount: result.summary.totalQuestions,
  });

  return result;
}

async function persistQualityFlags(issues: QualityIssue[]): Promise<void> {
  const supabase = createServerSupabaseClient();
  const rows = issues
    .filter((issue) => issue.questionId)
    .map((issue) => ({
      question_id: issue.questionId!,
      flag_type: issue.flagType,
      severity: issue.severity,
      details: issue.details,
      reviewed: issue.reviewed,
    }));

  if (!rows.length) {
    return;
  }

  const { error } = await supabase.from("question_quality_flags").upsert(rows, {
    onConflict: "question_id,flag_type",
    ignoreDuplicates: false,
  });

  if (error) {
    logServerEvent("quality_audit_failed", {
      stage: "persist_flags",
      message: error.message,
    });
    throw new Error(`Failed to persist quality flags: ${error.message}`);
  }
}

export async function markQualityIssueReviewed(
  questionId: string,
  flagType: QualityFlagType,
  reviewed: boolean,
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("question_quality_flags")
    .update({ reviewed })
    .eq("question_id", questionId)
    .eq("flag_type", flagType);

  if (error) {
    throw new Error(`Failed to update quality flag: ${error.message}`);
  }
}

export async function setQuestionActive(
  questionId: string,
  isActive: boolean,
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("questions")
    .update({ is_active: isActive })
    .eq("id", questionId);

  if (error) {
    throw new Error(`Failed to update question status: ${error.message}`);
  }
}

export async function loadStoredQualityIssues(input?: {
  flagType?: QualityFlagType;
  reviewed?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ issues: QualityIssue[]; total: number }> {
  const supabase = createServerSupabaseClient();
  const limit = input?.limit ?? 50;
  const offset = input?.offset ?? 0;

  let query = supabase
    .from("question_quality_flags")
    .select(
      "flag_type, severity, details, reviewed, questions(id, text, topic, source_id, is_active, sources(title))",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (input?.flagType) {
    query = query.eq("flag_type", input.flagType);
  }

  if (input?.reviewed !== undefined) {
    query = query.eq("reviewed", input.reviewed);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to load quality issues: ${error.message}`);
  }

  const issues: QualityIssue[] = (data ?? []).map((row) => {
    const questionValue = row.questions as
      | {
          id: string;
          text: string;
          topic: string | null;
          source_id: string;
          is_active: boolean;
          sources: { title: string | null } | Array<{ title: string | null }> | null;
        }
      | Array<{
          id: string;
          text: string;
          topic: string | null;
          source_id: string;
          is_active: boolean;
          sources: { title: string | null } | Array<{ title: string | null }> | null;
        }>
      | null;
    const question = Array.isArray(questionValue)
      ? questionValue[0] ?? null
      : questionValue;
    const sourceValue = question?.sources;
    const source = Array.isArray(sourceValue) ? sourceValue[0] ?? null : sourceValue ?? null;

    return {
      questionId: question?.id ?? null,
      sourceId: question?.source_id ?? null,
      flagType: row.flag_type as QualityFlagType,
      severity: row.severity as QualityIssue["severity"],
      details: (row.details as Record<string, unknown>) ?? {},
      reviewed: row.reviewed,
      questionText: question?.text ?? null,
      topic: question?.topic ?? null,
      sourceTitle: source?.title ?? null,
      isActive: question?.is_active ?? true,
    };
  });

  return { issues, total: count ?? issues.length };
}
