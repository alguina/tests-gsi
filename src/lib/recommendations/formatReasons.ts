import type { RecommendationReason } from "@/lib/recommendations/types";

export function formatRecommendationReason(
  t: (key: string, params?: Record<string, string | number>) => string,
  reason: RecommendationReason,
): string {
  return t(`recommendation.reason.${reason.code}`, reason.params);
}
