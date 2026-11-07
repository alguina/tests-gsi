import { describe, expect, it, vi, beforeEach } from "vitest";
const state = vi.hoisted(() => ({ calls: [] as { userId: string; last?: string }[], fail: false }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: () => ({ from() {
 let userId = ""; let last: string | undefined;
 const query = { select() { return query; }, eq(_key: string, value: string) { userId = value; return query; }, order() { return query; }, limit() { return query; }, gt(_key: string, value: string) { last = value; return query; },
 then(resolve: (v: unknown) => void) {
  state.calls.push({userId, last});
  const count = last ? 3 : 500;
  const data = Array.from({length: count}, (_, i) => ({ id: String((last ? 500 : 0)+i).padStart(4,"0"), question_id: "unmapped", is_correct: true, is_blank: false }));
  return Promise.resolve({data, error: state.fail ? {message:"failed"} : null}).then(resolve);
 }
 }; return query;
} }) }));
import { loadOfficialTopicResults } from "../officialTopicResultsServer";
const profile = "00000000-0000-4000-8000-000000000000";
describe("results loading", () => {
 beforeEach(() => { state.calls=[]; state.fail=false; });
 it("paginates beyond API limits and keeps every request scoped to the selected profile", async () => {
  expect((await loadOfficialTopicResults(profile)).totalAttempts).toBe(503);
  expect(state.calls).toEqual([{userId:profile,last:undefined},{userId:profile,last:"0499"}]);
 });
 it("rejects an absent profile instead of falling back to another user's history", async () => {
  await expect(loadOfficialTopicResults("")).rejects.toThrow("INVALID_PROFILE");
  expect(state.calls).toEqual([]);
 });
 it("reports a load failure rather than showing zero progress", async () => {
  state.fail=true;
  await expect(loadOfficialTopicResults(profile)).rejects.toThrow("RESULTS_LOAD_FAILED");
 });
});
