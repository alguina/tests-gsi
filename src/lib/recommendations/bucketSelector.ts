import type { BucketName, QuestionSignals } from "@/lib/recommendations/types";

function hashSeed(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const seedValue = hashSeed(`${seed}:${index}`);
    const swapIndex = seedValue % (index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }

  return copy;
}

export function selectQuestionsFromBuckets(
  signals: QuestionSignals[],
  bucketTargets: Record<BucketName, number>,
  total: number,
  seed: string,
): { selected: QuestionSignals[]; composition: Record<BucketName, number> } {
  const byBucket = new Map<BucketName, QuestionSignals[]>();

  for (const signal of signals) {
    const current = byBucket.get(signal.bucket) ?? [];
    current.push(signal);
    byBucket.set(signal.bucket, current);
  }

  for (const [bucket, items] of byBucket) {
    byBucket.set(
      bucket,
      seededShuffle(
        items.sort((left, right) => right.priorityScore - left.priorityScore),
        `${seed}:${bucket}`,
      ),
    );
  }

  const selected: QuestionSignals[] = [];
  const selectedIds = new Set<string>();
  const composition: Record<BucketName, number> = {
    weakTopic: 0,
    failed: 0,
    unseen: 0,
    staleCorrect: 0,
  };

  const bucketOrder: BucketName[] = [
    "weakTopic",
    "failed",
    "unseen",
    "staleCorrect",
  ];

  for (const bucket of bucketOrder) {
    const target = bucketTargets[bucket] ?? 0;
    const pool = byBucket.get(bucket) ?? [];

    for (const candidate of pool) {
      if (composition[bucket] >= target || selected.length >= total) {
        break;
      }

      if (selectedIds.has(candidate.questionId)) {
        continue;
      }

      selected.push(candidate);
      selectedIds.add(candidate.questionId);
      composition[bucket] += 1;
    }
  }

  if (selected.length < total) {
    const fallback = seededShuffle(
      [...signals].sort((left, right) => right.priorityScore - left.priorityScore),
      `${seed}:fallback`,
    );

    for (const candidate of fallback) {
      if (selected.length >= total) {
        break;
      }

      if (selectedIds.has(candidate.questionId)) {
        continue;
      }

      selected.push(candidate);
      selectedIds.add(candidate.questionId);
      composition[candidate.bucket] += 1;
    }
  }

  return { selected, composition };
}
