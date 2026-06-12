import { PRIORITY_WEIGHTS } from "@/lib/recommendations/constants";

export type PriorityInput = {
  topicWeakness: number;
  questionFailureScore: number;
  recencyNeed: number;
  unseenBoost: number;
  bookmarkBoost: number;
  recentRepetitionPenalty: number;
};

export function computePriorityScore(input: PriorityInput): number {
  const raw =
    input.topicWeakness * PRIORITY_WEIGHTS.topicWeakness +
    input.questionFailureScore * PRIORITY_WEIGHTS.questionFailureScore +
    input.recencyNeed * PRIORITY_WEIGHTS.recencyNeed +
    input.unseenBoost * PRIORITY_WEIGHTS.unseenBoost +
    input.bookmarkBoost * PRIORITY_WEIGHTS.bookmarkBoost -
    input.recentRepetitionPenalty;

  return Math.max(0, Math.min(1, raw));
}

export function computeBucketTargets(
  total: number,
  ratios: Record<string, number>,
): Record<string, number> {
  const keys = Object.keys(ratios);
  const targets: Record<string, number> = {};
  let assigned = 0;

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];

    if (index === keys.length - 1) {
      targets[key] = total - assigned;
    } else {
      const value = Math.floor(total * ratios[key]!);
      targets[key] = value;
      assigned += value;
    }
  }

  return targets;
}
