import { describe, expect, it } from "vitest";
import { auditQuestionBank } from "@/lib/quality/audit";
import {
  combinedSimilarity,
  hashQuestionContent,
  normalizeText,
} from "@/lib/quality/normalize";
import { computeBucketTargets } from "@/lib/recommendations/priorityScore";
import { BUCKET_RATIOS } from "@/lib/recommendations/constants";
import {
  computeNetScore,
  normalizeNetScoreTo100,
} from "@/lib/stats/userMetrics";

describe("normalizeText", () => {
  it("lowercases, trims, and collapses whitespace", () => {
    expect(normalizeText("  Hello   WORLD!  ")).toBe("hello world");
  });
});

describe("hashQuestionContent", () => {
  it("matches for equivalent normalized content", () => {
    const left = hashQuestionContent("Question A?", ["A: one", "B: two"]);
    const right = hashQuestionContent("  question   a? ", ["B: two", "A: one"]);
    expect(left).toBe(right);
  });
});

describe("combinedSimilarity", () => {
  it("flags near-identical questions", () => {
    const score = combinedSimilarity(
      "Which protocol uses port 443?",
      "Which protocol uses port 443 by default?",
    );
    expect(score).toBeGreaterThan(0.7);
  });
});

describe("scoring", () => {
  it("applies exam penalty", () => {
    expect(computeNetScore(3, 3)).toBe(2);
    expect(normalizeNetScoreTo100(2, 6)).toBeCloseTo(33.33, 1);
  });

  it("treats blank-only as null normalized score", () => {
    expect(normalizeNetScoreTo100(0, 0)).toBeNull();
  });
});

describe("auditQuestionBank", () => {
  it("detects missing correct answer and exact duplicates", () => {
    const result = auditQuestionBank({
      questions: [
        {
          id: "q1",
          source_id: "s1",
          text: "Same question?",
          topic: "1",
          block: null,
          year: null,
          exam: null,
          is_active: true,
          sources: { id: "s1", title: "Source 1", external_id: "s1" },
        },
        {
          id: "q2",
          source_id: "s1",
          text: "Same question?",
          topic: "1",
          block: null,
          year: null,
          exam: null,
          is_active: true,
          sources: { id: "s1", title: "Source 1", external_id: "s1" },
        },
        {
          id: "q3",
          source_id: "s1",
          text: "No correct answer",
          topic: "2",
          block: null,
          year: null,
          exam: null,
          is_active: true,
          sources: { id: "s1", title: "Source 1", external_id: "s1" },
        },
      ],
      answers: [
        { id: "a1", question_id: "q1", letter: "A", text: "One", is_correct: true },
        { id: "a2", question_id: "q1", letter: "B", text: "Two", is_correct: false },
        { id: "a3", question_id: "q1", letter: "C", text: "Three", is_correct: false },
        { id: "a4", question_id: "q1", letter: "D", text: "Four", is_correct: false },
        { id: "a5", question_id: "q2", letter: "A", text: "One", is_correct: true },
        { id: "a6", question_id: "q2", letter: "B", text: "Two", is_correct: false },
        { id: "a7", question_id: "q2", letter: "C", text: "Three", is_correct: false },
        { id: "a8", question_id: "q2", letter: "D", text: "Four", is_correct: false },
        { id: "a9", question_id: "q3", letter: "A", text: "One", is_correct: false },
        { id: "a10", question_id: "q3", letter: "B", text: "Two", is_correct: false },
        { id: "a11", question_id: "q3", letter: "C", text: "Three", is_correct: false },
        { id: "a12", question_id: "q3", letter: "D", text: "Four", is_correct: false },
      ],
      sources: [{ id: "s1", title: "Source 1" }],
    });

    expect(result.issues.some((issue) => issue.flagType === "exact_duplicate")).toBe(
      true,
    );
    expect(
      result.issues.some((issue) => issue.flagType === "no_correct_answer"),
    ).toBe(true);
  });
});

describe("computeBucketTargets", () => {
  it("allocates all slots across buckets", () => {
    const targets = computeBucketTargets(25, BUCKET_RATIOS);
    expect(Object.values(targets).reduce((sum, value) => sum + value, 0)).toBe(25);
  });
});
