import { describe, it, expect } from "vitest";
import aliases from "@/data/question-canonical-v1.json";
import full from "@/data/topic-map-v2.json";
import distinct from "@/data/topic-map-v2-distinct.json";
import { computeOfficialTopicResults } from "../officialTopicResults";
const map = full as Record<string, [string | null, number | null, string]>;
const canonical = aliases as Record<string, string>;
const high = Object.keys(distinct).find((id) => map[id][2] === "alta")!;
const duplicate = Object.keys(canonical).find((id) => canonical[id] === high)!;
const key = `${map[high][0]}.${map[high][1]}`;
const row = (id: string, correct = true, blank = false) => ({ question_id: id, is_correct: correct, is_blank: blank });
describe("official topic results", () => {
 it("canonical aliases cover the same 16,348 distinct bank questions", () => {
  const reps = new Set(Object.keys(distinct));
  expect(new Set(Object.keys(map).map((id) => canonical[id] ?? id)).size).toBe(16348);
  for (const rep of Object.values(canonical)) expect(reps.has(rep)).toBe(true);
 });
 it("separates repeated attempts and imported duplicates from unique coverage", () => {
  const result = computeOfficialTopicResults([row(high), row(duplicate, false), row(high, false, true)]);
  expect(result.topics[key]).toEqual({ attempts: 3, correct: 1, wrong: 1, blank: 1, unique: 1, accuracy: 50 });
 });
 it("keeps unassigned, unknown and lower confidence out of topic results", () => {
  const unassigned = Object.keys(map).find((id) => map[id][2] === "sin_asignar")!;
  const lower = Object.keys(map).find((id) => map[id][2] === "media")!;
  const r = computeOfficialTopicResults([row(unassigned), row(lower), row("unknown")]);
  expect(r.topics).toEqual({}); expect(r.unassigned).toBe(2); expect(r.lowerConfidence).toBe(1); expect(r.totalAttempts).toBe(3);
 });
 it("shows no accuracy for blanks only and no made-up progress for empty history", () => {
  expect(computeOfficialTopicResults([row(high, false, true)]).topics[key].accuracy).toBeNull();
  expect(computeOfficialTopicResults([]).topics).toEqual({});
 });
});
