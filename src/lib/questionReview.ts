import { createServerSupabaseClient } from "@/lib/supabase/server";

export type QuestionBookmarkMap = Record<string, true>;
export type QuestionNoteMap = Record<string, string>;

export async function getQuestionBookmarks(
  userId: string,
  questionIds: string[],
): Promise<QuestionBookmarkMap> {
  if (!questionIds.length) {
    return {};
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("question_bookmarks")
    .select("question_id")
    .eq("user_id", userId)
    .in("question_id", questionIds);

  if (error) {
    return {};
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [row.question_id as string, true as const]),
  );
}

export async function getQuestionNotes(
  userId: string,
  questionIds: string[],
): Promise<QuestionNoteMap> {
  if (!questionIds.length) {
    return {};
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("question_notes")
    .select("question_id, note")
    .eq("user_id", userId)
    .in("question_id", questionIds);

  if (error) {
    return {};
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [row.question_id as string, row.note as string]),
  );
}

export async function toggleQuestionBookmark(
  userId: string,
  questionId: string,
  bookmarked: boolean,
): Promise<void> {
  const supabase = createServerSupabaseClient();

  if (bookmarked) {
    const { error } = await supabase.from("question_bookmarks").upsert(
      { user_id: userId, question_id: questionId },
      { onConflict: "user_id,question_id" },
    );

    if (error) {
      throw new Error(`Failed to bookmark question: ${error.message}`);
    }

    return;
  }

  const { error } = await supabase
    .from("question_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("question_id", questionId);

  if (error) {
    throw new Error(`Failed to remove bookmark: ${error.message}`);
  }
}

export async function saveQuestionNote(
  userId: string,
  questionId: string,
  note: string,
): Promise<void> {
  const trimmed = note.trim();
  const supabase = createServerSupabaseClient();

  if (!trimmed) {
    const { error } = await supabase
      .from("question_notes")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId);

    if (error) {
      throw new Error(`Failed to delete note: ${error.message}`);
    }

    return;
  }

  const { error } = await supabase.from("question_notes").upsert(
    {
      user_id: userId,
      question_id: questionId,
      note: trimmed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_id" },
  );

  if (error) {
    throw new Error(`Failed to save note: ${error.message}`);
  }
}
