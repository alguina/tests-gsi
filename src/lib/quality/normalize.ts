export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string): Set<string> {
  const normalized = normalizeText(value);
  const tokens = normalized.split(" ").filter((token) => token.length > 2);
  return new Set(tokens);
}

export function jaccardSimilarity(left: string, right: string): number {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);

  if (!leftTokens.size && !rightTokens.size) {
    return 1;
  }

  if (!leftTokens.size || !rightTokens.size) {
    return 0;
  }

  let intersection = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = leftTokens.size + rightTokens.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function levenshteinDistance(left: string, right: string): number {
  const a = normalizeText(left);
  const b = normalizeText(right);

  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0),
  );

  for (let row = 0; row <= a.length; row += 1) {
    matrix[row]![0] = row;
  }

  for (let col = 0; col <= b.length; col += 1) {
    matrix[0]![col] = col;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let col = 1; col <= b.length; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;
      matrix[row]![col] = Math.min(
        matrix[row - 1]![col]! + 1,
        matrix[row]![col - 1]! + 1,
        matrix[row - 1]![col - 1]! + cost,
      );
    }
  }

  return matrix[a.length]![b.length]!;
}

export function normalizedLevenshteinSimilarity(
  left: string,
  right: string,
): number {
  const maxLen = Math.max(normalizeText(left).length, normalizeText(right).length);

  if (maxLen === 0) {
    return 1;
  }

  return 1 - levenshteinDistance(left, right) / maxLen;
}

export function combinedSimilarity(left: string, right: string): number {
  const jaccard = jaccardSimilarity(left, right);
  const levenshtein = normalizedLevenshteinSimilarity(left, right);
  return jaccard * 0.6 + levenshtein * 0.4;
}

export function hashQuestionContent(
  questionText: string,
  answerTexts: string[],
): string {
  const payload = [
    normalizeText(questionText),
    ...answerTexts.map((text) => normalizeText(text)).sort(),
  ].join("|");

  let hash = 0;

  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(index);
    hash |= 0;
  }

  return `q${Math.abs(hash).toString(36)}`;
}
