"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  parseStudyProgress,
  STUDY_PROGRESS_EVENT,
  studyProgressStorageKey,
  type StudyProgressMap,
} from "@/lib/studyProgress";

function getRawSnapshot(profileId?: string): string | null {
  if (!profileId || typeof window === "undefined") return null;
  return window.localStorage.getItem(studyProgressStorageKey(profileId));
}

export function useStudyProgress(profileId?: string): StudyProgressMap {
  const raw = useSyncExternalStore(
    (onStoreChange) => {
      if (!profileId) return () => undefined;
      const onStorage = (event: StorageEvent) => {
        if (event.key === studyProgressStorageKey(profileId)) onStoreChange();
      };
      const onLocalUpdate = (event: Event) => {
        if ((event as CustomEvent<{ profileId?: string }>).detail?.profileId === profileId) onStoreChange();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(STUDY_PROGRESS_EVENT, onLocalUpdate);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(STUDY_PROGRESS_EVENT, onLocalUpdate);
      };
    },
    () => getRawSnapshot(profileId),
    () => null,
  );

  return useMemo(() => parseStudyProgress(raw), [raw]);
}

