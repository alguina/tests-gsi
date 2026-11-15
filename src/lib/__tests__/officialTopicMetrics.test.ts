import { describe, expect, it } from "vitest";

import aliases from "@/data/question-canonical-v1.json";
import distinct from "@/data/topic-map-v2-distinct.json";
import full from "@/data/topic-map-v2.json";
import { buildOfficialTopicMetrics } from "@/lib/studyMetrics";

const map = full as Record<string, [string | null, number | null, string]>;
const canonical = aliases as Record<string, string>;
const high = Object.keys(distinct).find((id) => map[id][2] === "alta")!;
const duplicate = Object.keys(canonical).find((id) => canonical[id] === high)!;
const topicKey = `${map[high][0]}.${map[high][1]}`;

describe("official topic metrics", () => {
  it("always exposes the 57 official topics with their real titles", () => {
    const result = buildOfficialTopicMetrics([]);
    expect(result.summaries).toHaveLength(57);
    expect(result.summaries.every((topic) => topic.displayLabel.startsWith(`${topic.topic} · `))).toBe(true);
    expect(result.summaries.some((topic) => /Test Bloque/.test(topic.displayLabel))).toBe(false);
  });

  it("reclassifies historical attempts and deduplicates imported copies for coverage", () => {
    const result = buildOfficialTopicMetrics([
      { question_id: high, is_correct: true, is_blank: false, answered_at: "2026-01-01" },
      { question_id: duplicate, is_correct: false, is_blank: false, answered_at: "2026-01-02" },
    ]);
    const summary = result.summaries.find((topic) => topic.topic === topicKey)!;
    const performance = result.performance.find((topic) => topic.topic === topicKey)!;
    expect(summary).toMatchObject({ answered: 2, correct: 1, wrong: 1, accuracy: 50, failedCount: 1 });
    expect(performance.uniqueSeen).toBe(1);
  });
});
