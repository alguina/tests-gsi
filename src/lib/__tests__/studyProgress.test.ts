import { describe, expect, it } from "vitest";
import { parseStudyProgress, studyPdfPath, updateStudyTopicProgress } from "@/lib/studyProgress";
import { isGeneralTrainingMode, TEST_MODE_OFFICIAL_TOPIC } from "@/lib/testSession";

describe("study progress", () => {
  it("builds stable PDF paths", () => {
    expect(studyPdfPath({ bloque: "III", tema: 9 }, "long")).toBe("/study/long/III_09_Version_larga.pdf");
    expect(studyPdfPath({ bloque: "III", tema: 9 }, "short")).toBe("/study/short/III_09_Version_corta.pdf");
  });

  it("normalizes stored progress", () => {
    expect(parseStudyProgress('{"I.1":{"status":"completed","page":0,"updatedAt":"2026-11-15T00:00:00.000Z"}}')).toEqual({
      "I.1": { status: "completed", page: 1, updatedAt: "2026-11-15T00:00:00.000Z" },
    });
  });

  it("updates one topic without losing the rest", () => {
    const next = updateStudyTopicProgress(
      { "I.1": { status: "completed", page: 4, updatedAt: "2026-11-14T00:00:00.000Z" } },
      "III.9",
      { page: 7 },
      new Date("2026-11-15T00:00:00.000Z"),
    );
    expect(next["I.1"].status).toBe("completed");
    expect(next["III.9"]).toEqual({ status: "in-progress", page: 7, updatedAt: "2026-11-15T00:00:00.000Z" });
  });

  it("keeps official topic tests out of general training metrics", () => {
    expect(isGeneralTrainingMode(TEST_MODE_OFFICIAL_TOPIC)).toBe(false);
    expect(isGeneralTrainingMode("random")).toBe(true);
  });
});
