/**
 * Optional manual overrides for topic codes → human-readable names.
 * Extend as official syllabus mappings become available.
 */
export const topicLabelMap: Record<string, string> = {
  // Example: "1": "Seguridad de la información",
};

const WEAK_LABEL_PATTERN = /^A\d+$/i;

type TopicLabelInput = {
  topic: string | null;
  block?: string | null;
  exam?: string | null;
  year?: string | null;
  sourceTitle?: string | null;
};

export type ResolvedTopicLabel = {
  code: string | null;
  label: string;
  description: string | null;
  rawTopic: string | null;
  rawBlock: string | null;
  sourceHint: string | null;
};

function isWeakLabel(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length <= 2 || WEAK_LABEL_PATTERN.test(trimmed);
}

function isMeaningfulTopicCode(topic: string): boolean {
  const trimmed = topic.trim();
  if (!trimmed) {
    return false;
  }

  if (topicLabelMap[trimmed]) {
    return true;
  }

  return trimmed.length > 2 && !/^\d+$/.test(trimmed);
}

function buildSourceHint(input: TopicLabelInput): string | null {
  const parts = [
    input.exam?.trim(),
    input.year?.trim(),
    input.sourceTitle?.trim(),
  ].filter(Boolean);

  return parts.length ? parts.join(" · ") : null;
}

export function resolveTopicLabel(input: TopicLabelInput): ResolvedTopicLabel {
  const rawTopic = String(input.topic ?? "").trim() || null;
  const rawBlock = String(input.block ?? "").trim() || null;
  const sourceHint = buildSourceHint(input);

  const mapped = rawTopic ? topicLabelMap[rawTopic] : null;

  if (mapped) {
    return {
      code: rawTopic,
      label: mapped,
      description: rawBlock && !isWeakLabel(rawBlock) ? rawBlock : sourceHint,
      rawTopic,
      rawBlock,
      sourceHint,
    };
  }

  if (rawTopic && isMeaningfulTopicCode(rawTopic)) {
    return {
      code: rawTopic,
      label: rawTopic,
      description: rawBlock ?? sourceHint,
      rawTopic,
      rawBlock,
      sourceHint,
    };
  }

  if (rawBlock && !isWeakLabel(rawBlock)) {
    return {
      code: rawTopic,
      label: rawBlock,
      description: sourceHint ?? rawTopic,
      rawTopic,
      rawBlock,
      sourceHint,
    };
  }

  if (rawBlock && isWeakLabel(rawBlock)) {
    const context = sourceHint ?? rawTopic;
    const label = context ? `${rawBlock} · ${context}` : rawBlock;

    return {
      code: rawTopic,
      label,
      description: context,
      rawTopic,
      rawBlock,
      sourceHint,
    };
  }

  if (sourceHint) {
    return {
      code: rawTopic,
      label: sourceHint,
      description: rawTopic,
      rawTopic,
      rawBlock,
      sourceHint,
    };
  }

  if (rawTopic) {
    return {
      code: rawTopic,
      label: rawTopic,
      description: null,
      rawTopic,
      rawBlock,
      sourceHint,
    };
  }

  return {
    code: null,
    label: "",
    description: null,
    rawTopic,
    rawBlock,
    sourceHint,
  };
}

export function pickDominantValue(counts: Map<string, number>): string | null {
  const sorted = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  return sorted[0]?.[0] ?? null;
}
