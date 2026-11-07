"use server";
import { loadOfficialTopicResults } from "@/lib/officialTopicResultsServer";
import type { OfficialTopicResults } from "@/lib/officialTopicResults";

export async function getOfficialTopicResults(userId: string): Promise<{ ok: true; data: OfficialTopicResults } | { ok: false }> {
  try { return { ok: true, data: await loadOfficialTopicResults(userId) }; }
  catch { return { ok: false }; }
}
