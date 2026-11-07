import { createServerSupabaseClient } from "@/lib/supabase/server";
import { computeOfficialTopicResults, type TopicAttempt, type OfficialTopicResults } from "@/lib/officialTopicResults";

/** Local profiles are NOT authenticated identities. No fallback to another profile. */
export async function loadOfficialTopicResults(userId: string): Promise<OfficialTopicResults> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) throw new Error("INVALID_PROFILE");
  const supabase = createServerSupabaseClient();
  const rows: TopicAttempt[] = [];
  // Keyset pagination avoids the default API row limit and large offsets.
  let lastId: string | undefined;
  for (;;) {
    let query = supabase.from("attempts").select("id,question_id,is_correct,is_blank")
      .eq("user_id", userId).order("id", { ascending: true }).limit(500);
    if (lastId) query = query.gt("id", lastId);
    const { data, error } = await query;
    if (error) throw new Error("RESULTS_LOAD_FAILED");
    if (!data?.length) break;
    rows.push(...data as (TopicAttempt & { id: string })[]);
    lastId = data[data.length - 1].id;
    if (data.length < 500) break;
  }
  return computeOfficialTopicResults(rows);
}
