import { resolveTopicLabel } from "@/lib/topics/resolveTopicLabel";

export type TopicDisplayInput = {
  topic: string;
  topicTitle?: string | null;
  block?: string | null;
  exam?: string | null;
  year?: string | null;
  sourceTitle?: string | null;
};

const POOR_LABEL_PATTERN = /^(A\d+|B\d+|\d+)$/i;

export function formatTopicDisplayLabel(input: TopicDisplayInput): string {
  const resolved = resolveTopicLabel({
    topic: input.topic,
    block: input.block ?? input.topicTitle ?? null,
    exam: input.exam ?? null,
    year: input.year ?? null,
    sourceTitle: input.sourceTitle ?? null,
  });

  return resolved.label.trim();
}

export function isPoorTopicDisplayLabel(label: string): boolean {
  const trimmed = label.trim();
  if (!trimmed) {
    return true;
  }

  if (POOR_LABEL_PATTERN.test(trimmed)) {
    return true;
  }

  if (/^Tema \d+/i.test(trimmed) && trimmed.length < 16) {
    return true;
  }

  return false;
}

export function formatTopicDisplayList(
  topics: TopicDisplayInput[],
  maxVisible = 3,
): { visible: string[]; remaining: number; hasPoorLabels: boolean } {
  const labels = topics
    .map((topic) => formatTopicDisplayLabel(topic))
    .filter((label) => label.length > 0);

  const unique = [...new Set(labels)];
  const hasPoorLabels =
    unique.length > 0 && unique.every((label) => isPoorTopicDisplayLabel(label));

  return {
    visible: unique.slice(0, maxVisible),
    remaining: Math.max(0, unique.length - maxVisible),
    hasPoorLabels,
  };
}
