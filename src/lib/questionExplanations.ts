import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ExplanationSource = {
  title: string;
  url?: string;
};

export type QuestionExplanation = {
  questionId: string;
  explanation: string;
  whyCorrect: string | null;
  whyOthers: string | null;
  sources: ExplanationSource[];
  status: "draft" | "reviewed" | "needs_update";
};

export type QuestionExplanationMap = Record<string, QuestionExplanation>;

function parseSources(value: unknown): ExplanationSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const title = String((item as { title?: unknown }).title ?? "").trim();
      const url = String((item as { url?: unknown }).url ?? "").trim();

      if (!title) {
        return null;
      }

      return url ? { title, url } : { title };
    })
    .filter((item): item is ExplanationSource => item !== null);
}

export async function getQuestionExplanations(
  questionIds: string[],
): Promise<QuestionExplanationMap> {
  if (!questionIds.length) {
    return {};
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("question_explanations")
    .select(
      "question_id, explanation, why_correct, why_others, sources, status",
    )
    .in("question_id", questionIds);

  if (error) {
    return {};
  }

  return Object.fromEntries(
    (data ?? []).map((row) => {
      const questionId = row.question_id as string;
      const explanation: QuestionExplanation = {
        questionId,
        explanation: String(row.explanation ?? ""),
        whyCorrect: row.why_correct ? String(row.why_correct) : null,
        whyOthers: row.why_others ? String(row.why_others) : null,
        sources: parseSources(row.sources),
        status: (row.status as QuestionExplanation["status"]) ?? "draft",
      };
      return [questionId, explanation];
    }),
  );
}

export async function countExplainedQuestions(): Promise<number> {
  const supabase = createServerSupabaseClient();
  const { count, error } = await supabase
    .from("question_explanations")
    .select("question_id", { count: "exact", head: true });

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function selectExplainedQuestionIds(
  limit: number,
): Promise<string[]> {
  if (!Number.isInteger(limit) || limit <= 0) {
    return [];
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("question_explanations")
    .select("question_id")
    .limit(Math.max(limit * 5, 100));

  if (error) {
    throw new Error(`Failed to load explained questions: ${error.message}`);
  }

  const ids = (data ?? []).map((row) => row.question_id as string);

  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }

  return ids.slice(0, limit);
}
