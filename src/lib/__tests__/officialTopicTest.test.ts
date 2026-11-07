import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOfficialTopic, getOfficialTopicQuestionIds } from "../officialTopics";
const state = vi.hoisted(() => ({ inserted: null as Record<string, unknown> | null, empty: false }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => ({ from(table: string) {
    let ids: string[] = [];
    let activeOnly = false;
    const query = {
      select() { return query; },
      in(_key: string, values: string[]) { ids = values; return query; },
      eq() { activeOnly = true; return query; },
      insert(payload: Record<string, unknown>) { state.inserted = payload; return query; },
      async single() { return { data: { id: "test-session" }, error: null }; },
      then(resolve: (value: unknown) => void) {
        const data = state.empty ? [] : table === "answers" ? ids.flatMap((id) => [
          { id: `${id}-a`, question_id: id, letter: "A", text: "Answer", is_correct: true },
          { id: `${id}-b`, question_id: id, letter: "B", text: "Other", is_correct: false },
        ]) : ids.map((id) => activeOnly ? { id } : { id, text: "Question", topic: "legacy" });
        return Promise.resolve({ data, error: null }).then(resolve);
      },
    };
    return query;
  } }),
}));
import { startOfficialTopicTestSession } from "../testSession";

describe("startOfficialTopicTestSession", () => {
  beforeEach(() => { state.inserted = null; state.empty = false; });
  it("creates a bounded high-confidence distinct test for the selected profile, preserving official config", async () => {
    const test = await startOfficialTopicTestSession("I.1", 10, "test-profile");
    expect(test.questions).toHaveLength(10);
    const ids = test.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(10);
    expect(ids.every((id) => getOfficialTopicQuestionIds("I.1").includes(id))).toBe(true);
    expect(ids.every((id) => getOfficialTopic(id)?.confianza === "alta")).toBe(true);
    expect(test.draft?.config?.officialTopic).toBe("I.1");
    expect(state.inserted?.user_id).toBe("test-profile");
    expect(state.inserted?.total_questions).toBe(10);
  });
  it("rejects unknown topics and invalid counts without creating a session", async () => {
    await expect(startOfficialTopicTestSession("sin_asignar", 10)).rejects.toThrow("NO_TOPIC_QUESTIONS");
    await expect(startOfficialTopicTestSession("I.1", 999)).rejects.toThrow("INVALID_QUESTION_COUNT");
    expect(state.inserted).toBeNull();
  });
  it("does not create empty tests when live questions are unavailable", async () => {
    state.empty = true;
    await expect(startOfficialTopicTestSession("I.1", 10)).rejects.toThrow("NO_TOPIC_QUESTIONS");
    expect(state.inserted).toBeNull();
  });
});
