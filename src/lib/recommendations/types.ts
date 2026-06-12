export type RecommendationReasonCode =
  | "topic_high_failure_rate"
  | "topic_many_unseen"
  | "failed_this_week"
  | "stale_correct_revisit";

export type RecommendationReason = {
  code: RecommendationReasonCode;
  params: Record<string, string | number>;
};

export type BucketName = "weakTopic" | "failed" | "unseen" | "staleCorrect";

export type StudyRecommendation = {
  suggestedCount: number;
  topics: Array<{ topic: string; topicTitle: string | null }>;
  reasons: RecommendationReason[];
  composition: Record<BucketName, number>;
  questionIds: string[];
  metadata: {
    bucketTargets: Record<BucketName, number>;
    generatedAt: string;
  };
};

export type QuestionSignals = {
  questionId: string;
  topic: string | null;
  topicTitle: string | null;
  failureRate: number;
  failCount: number;
  topicWeakness: number;
  recencyNeed: number;
  unseenBoost: number;
  bookmarkBoost: number;
  recentRepetitionPenalty: number;
  latestIsCorrect: boolean | null;
  lastAttemptedAt: string | null;
  priorityScore: number;
  bucket: BucketName;
};
