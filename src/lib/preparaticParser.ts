export type ParsedTest = {
  externalId?: string;
  title?: string;
  questions: ParsedQuestion[];
};

export type ParsedQuestion = {
  externalId?: string;
  text: string;
  block?: string;
  topic?: string;
  year?: string | number;
  exam?: string;
  answers: ParsedAnswer[];
  correctLetter?: string;
};

export type ParsedAnswer = {
  letter: string;
  text: string;
  isCorrect: boolean;
};

type UnknownRecord = Record<string, unknown>;

const ANSWER_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function parsePreparaticTest(raw: string): ParsedTest {
  if (!raw.trim()) {
    throw new Error("Paste test JavaScript content before parsing.");
  }

  const values = extractObjectLiterals(raw)
    .map(evaluateObjectLiteral)
    .filter((value): value is UnknownRecord => isRecord(value));

  const tests = values
    .map((value) => buildParsedTest(value))
    .filter((test): test is ParsedTest => Boolean(test?.questions.length));

  const bestTest = tests.sort(
    (a, b) => b.questions.length - a.questions.length,
  )[0];

  if (bestTest && bestTest.questions.length > 1) {
    return bestTest;
  }

  const questionCandidates = values
    .map((value) => normalizeQuestion(value))
    .filter((question): question is ParsedQuestion => Boolean(question));

  const questions = dedupeQuestions(
    bestTest
      ? [...bestTest.questions, ...questionCandidates]
      : questionCandidates,
  );

  if (!questions.length) {
    throw new Error("No questions with answers were found in this content.");
  }

  return {
    externalId: bestTest?.externalId,
    title: bestTest?.title,
    questions,
  };
}

function buildParsedTest(value: UnknownRecord): ParsedTest | null {
  const directQuestion = normalizeQuestion(value);
  if (directQuestion) {
    return { questions: [directQuestion] };
  }

  const questionArrays = findQuestionArrays(value);
  const questions = questionArrays.sort((a, b) => b.length - a.length)[0];

  if (!questions?.length) {
    return null;
  }

  return {
    externalId: optionalString(value.externalId ?? value.id ?? value.testId),
    title: optionalString(value.title ?? value.name ?? value.titulo),
    questions: dedupeQuestions(questions),
  };
}

function findQuestionArrays(value: unknown, depth = 0): ParsedQuestion[][] {
  if (depth > 8) {
    return [];
  }

  if (Array.isArray(value)) {
    const questions = value
      .map((item) => (isRecord(item) ? normalizeQuestion(item) : null))
      .filter((question): question is ParsedQuestion => Boolean(question));

    if (questions.length) {
      return [questions];
    }

    return value.flatMap((item) => findQuestionArrays(item, depth + 1));
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .filter(([key]) => key !== "answers")
    .flatMap(([, childValue]) => findQuestionArrays(childValue, depth + 1));
}

function normalizeQuestion(value: UnknownRecord): ParsedQuestion | null {
  const answersRaw = Array.isArray(value.answers) ? value.answers : null;
  const text = optionalString(value.text ?? value.question ?? value.statement);

  if (!text || !answersRaw) {
    return null;
  }

  const answers = answersRaw
    .map((answer, index) =>
      isRecord(answer) ? normalizeAnswer(answer, index) : null,
    )
    .filter((answer): answer is ParsedAnswer => Boolean(answer));

  if (!answers.length) {
    return null;
  }

  return {
    externalId: optionalString(value.externalId ?? value.id ?? value.questionId),
    text,
    block: optionalString(value.block),
    topic: optionalString(value.topic),
    year: optionalStringOrNumber(value.year),
    exam: optionalString(value.exam),
    answers,
    correctLetter: answers.find((answer) => answer.isCorrect)?.letter,
  };
}

function normalizeAnswer(value: UnknownRecord, index: number): ParsedAnswer | null {
  const text = optionalString(value.answer ?? value.text);

  if (!text) {
    return null;
  }

  return {
    letter:
      optionalString(value.letter)?.toUpperCase() ??
      ANSWER_LETTERS[index] ??
      String(index + 1),
    text,
    isCorrect: value.right === true,
  };
}

function extractObjectLiterals(raw: string): string[] {
  const results = new Set<string>();
  const stack: number[] = [];
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const next = raw[index + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      stack.push(index);
      continue;
    }

    if (char === "}") {
      const start = stack.pop();

      if (start === undefined) {
        continue;
      }

      const literal = raw.slice(start, index + 1);
      if (literal.includes("answers") && literal.includes("right")) {
        results.add(literal);
      }
    }
  }

  return [...results].sort((a, b) => b.length - a.length);
}

function evaluateObjectLiteral(source: string): unknown {
  try {
    const normalizedSource = source
      .replace(/!0\b/g, "true")
      .replace(/!1\b/g, "false");
    const evaluator = new Function(
      `"use strict"; return (${normalizedSource});`,
    ) as () => unknown;

    return evaluator();
  } catch {
    return null;
  }
}

function dedupeQuestions(questions: ParsedQuestion[]): ParsedQuestion[] {
  const seen = new Set<string>();

  return questions.filter((question) => {
    const key = question.externalId ?? question.text;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function optionalStringOrNumber(value: unknown): string | number | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number") {
    return value;
  }

  return undefined;
}
