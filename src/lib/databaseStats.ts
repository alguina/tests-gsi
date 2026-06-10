import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DatabaseStats = {
  sourcesCount: number;
  questionsCount: number;
  answersCount: number;
};

export async function getDatabaseStats(): Promise<DatabaseStats> {
  const supabase = createServerSupabaseClient();

  const [sourcesResult, questionsResult, answersResult] = await Promise.all([
    supabase.from("sources").select("id", { count: "exact", head: true }),
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase.from("answers").select("id", { count: "exact", head: true }),
  ]);

  if (sourcesResult.error) {
    throw new Error(
      `Failed to count sources: ${sourcesResult.error.message}`,
    );
  }

  if (questionsResult.error) {
    throw new Error(
      `Failed to count questions: ${questionsResult.error.message}`,
    );
  }

  if (answersResult.error) {
    throw new Error(
      `Failed to count answers: ${answersResult.error.message}`,
    );
  }

  return {
    sourcesCount: sourcesResult.count ?? 0,
    questionsCount: questionsResult.count ?? 0,
    answersCount: answersResult.count ?? 0,
  };
}
