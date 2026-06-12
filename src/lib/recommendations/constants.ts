import type { BucketName } from "@/lib/recommendations/types";

export const RECOMMENDED_DEFAULT_COUNT = 25;

export const BUCKET_RATIOS: Record<BucketName, number> = {
  weakTopic: 0.4,
  failed: 0.3,
  unseen: 0.2,
  staleCorrect: 0.1,
};

export const PRIORITY_WEIGHTS = {
  topicWeakness: 0.3,
  questionFailureScore: 0.3,
  recencyNeed: 0.2,
  unseenBoost: 0.15,
  bookmarkBoost: 0.05,
} as const;

export const STALE_CORRECT_DAYS = 14;
export const RECENT_REPETITION_DAYS = 3;
export const FAILED_THIS_WEEK_DAYS = 7;
