import type { TemaOficial } from "@/lib/officialTopics";

export type StudyTopicStatus = "not-started" | "in-progress" | "completed";

export type StudyTopicProgress = {
  status: Exclude<StudyTopicStatus, "not-started">;
  page: number;
  updatedAt: string;
};

export type StudyProgressMap = Record<string, StudyTopicProgress>;

const STORAGE_PREFIX = "gsi-a2:study-progress:v1";
export const STUDY_PROGRESS_EVENT = "gsi-a2:study-progress";

export function topicKey(topic: Pick<TemaOficial, "bloque" | "tema">): string {
  return `${topic.bloque}.${topic.tema}`;
}

export function studyPdfPath(
  topic: Pick<TemaOficial, "bloque" | "tema">,
  edition: "long" | "short",
): string {
  const number = String(topic.tema).padStart(2, "0");
  const suffix = edition === "long" ? "larga" : "corta";
  return `/study/${edition}/${topic.bloque}_${number}_Version_${suffix}.pdf`;
}

export function studyProgressStorageKey(profileId: string): string {
  return `${STORAGE_PREFIX}:${profileId}`;
}

export function parseStudyProgress(value: string | null): StudyProgressMap {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as Record<string, Partial<StudyTopicProgress>>;
    const result: StudyProgressMap = {};

    for (const [key, item] of Object.entries(parsed)) {
      if (item.status !== "in-progress" && item.status !== "completed") continue;
      result[key] = {
        status: item.status,
        page: Math.max(1, Math.trunc(Number(item.page) || 1)),
        updatedAt:
          typeof item.updatedAt === "string" ? item.updatedAt : new Date(0).toISOString(),
      };
    }

    return result;
  } catch {
    return {};
  }
}

export function getStudyProgress(profileId: string): StudyProgressMap {
  if (typeof window === "undefined") return {};
  return parseStudyProgress(window.localStorage.getItem(studyProgressStorageKey(profileId)));
}

export function saveStudyProgress(profileId: string, progress: StudyProgressMap): void {
  window.localStorage.setItem(studyProgressStorageKey(profileId), JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent(STUDY_PROGRESS_EVENT, { detail: { profileId } }));
}

export function updateStudyTopicProgress(
  progress: StudyProgressMap,
  key: string,
  update: Partial<Pick<StudyTopicProgress, "status" | "page">>,
  now: Date = new Date(),
): StudyProgressMap {
  const current = progress[key];
  return {
    ...progress,
    [key]: {
      status: update.status ?? current?.status ?? "in-progress",
      page: Math.max(1, Math.trunc(update.page ?? current?.page ?? 1)),
      updatedAt: now.toISOString(),
    },
  };
}

