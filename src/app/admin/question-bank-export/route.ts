import canonicalQuestionIds from "@/data/question-canonical-v1.json";
import { requireAdminFromCookie } from "@/app/actions/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type QuestionRow = {
  id: string;
  text: string;
  block: string | null;
  topic: string | null;
  year: string | null;
  exam: string | null;
  is_active: boolean;
};

type AnswerRow = {
  question_id: string;
  letter: string;
  text: string;
  is_correct: boolean;
};

const PAGE_SIZE = 250;

/**
 * Admin-only export used to rebuild the official-topic map from the actual
 * question and answer text. It exports one representative per duplicate set.
 */
export async function GET(): Promise<Response> {
  try {
    await requireAdminFromCookie();
  } catch {
    return Response.json({ error: "ADMIN_ACCESS_DENIED" }, { status: 403 });
  }

  const supabase = createServerSupabaseClient();
  const ids = Object.keys(canonicalQuestionIds);
  const rows: Array<QuestionRow & { answers: Omit<AnswerRow, "question_id">[] }> = [];

  for (let offset = 0; offset < ids.length; offset += PAGE_SIZE) {
    const batchIds = ids.slice(offset, offset + PAGE_SIZE);
    const [{ data: questions, error: questionError }, { data: answers, error: answerError }] =
      await Promise.all([
        supabase
          .from("questions")
          .select("id, text, block, topic, year, exam, is_active")
          .in("id", batchIds),
        supabase
          .from("answers")
          .select("question_id, letter, text, is_correct")
          .in("question_id", batchIds),
      ]);

    if (questionError || answerError) {
      return Response.json(
        {
          error: "QUESTION_BANK_EXPORT_FAILED",
          detail: questionError?.message ?? answerError?.message,
        },
        { status: 500 },
      );
    }

    const answersByQuestion = new Map<string, Omit<AnswerRow, "question_id">[]>();
    for (const answer of (answers ?? []) as AnswerRow[]) {
      const list = answersByQuestion.get(answer.question_id) ?? [];
      list.push({
        letter: answer.letter,
        text: answer.text,
        is_correct: answer.is_correct,
      });
      answersByQuestion.set(answer.question_id, list);
    }

    for (const question of (questions ?? []) as QuestionRow[]) {
      rows.push({
        ...question,
        answers: (answersByQuestion.get(question.id) ?? []).sort((left, right) =>
          left.letter.localeCompare(right.letter),
        ),
      });
    }
  }

  return new Response(JSON.stringify({
    generatedAt: new Date().toISOString(),
    mappingVersion: "summary-grounded-v3",
    questionCount: rows.length,
    questions: rows,
  }), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": "attachment; filename=question-bank-for-remapping.json",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
