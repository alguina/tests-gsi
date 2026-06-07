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

type JsRecord = Record<string, unknown>;

type ParsedLiteral = {
  value: unknown;
  end: number;
};

const ANSWER_LETTERS = ["A", "B", "C", "D", "E", "F"];
const CANDIDATE_ANCHORS = [
  "questions",
  "answers",
  "right",
  "answer",
  "letter",
  "text",
];

export function parsePreparaticTest(raw: string): ParsedTest {
  if (!raw.trim()) {
    throw new Error("Paste raw Preparatic JavaScript before parsing.");
  }

  const literalValues = parseCandidateLiterals(raw);
  const tests = literalValues.flatMap((value) => findTests(value));
  const bestTest = tests.sort(rankParsedTests)[0];

  if (bestTest?.questions.length) {
    return bestTest;
  }

  const questions = dedupeQuestions(
    literalValues.flatMap((value) => findQuestions(value)),
  );

  if (!questions.length) {
    throw new Error("No questions with answers were found in the pasted content.");
  }

  return { questions };
}

function parseCandidateLiterals(raw: string): unknown[] {
  const starts = collectCandidateStarts(raw);
  const parsed: unknown[] = [];
  const seenRanges = new Set<string>();

  for (const start of starts) {
    try {
      const literal = new LiteralParser(raw, start).parse();
      const rangeKey = `${start}:${literal.end}`;

      if (!seenRanges.has(rangeKey)) {
        seenRanges.add(rangeKey);
        parsed.push(literal.value);
      }
    } catch {
      // Preparatic bundles can contain arbitrary code around data literals.
    }
  }

  return parsed;
}

function collectCandidateStarts(raw: string): number[] {
  const starts = new Set<number>();

  for (const anchor of CANDIDATE_ANCHORS) {
    let index = raw.indexOf(anchor);

    while (index !== -1) {
      addNearbyLiteralStarts(raw, index, starts);
      index = raw.indexOf(anchor, index + anchor.length);
    }
  }

  if (!starts.size) {
    for (let index = 0; index < raw.length; index += 1) {
      if (raw[index] === "{" || raw[index] === "[") {
        starts.add(index);
      }
    }
  }

  return [...starts].sort((left, right) => left - right).slice(0, 2000);
}

function addNearbyLiteralStarts(
  raw: string,
  anchorIndex: number,
  starts: Set<number>,
) {
  let openingsSeen = 0;
  const lowerBound = Math.max(0, anchorIndex - 12000);

  for (let index = anchorIndex; index >= lowerBound; index -= 1) {
    if (raw[index] === "{" || raw[index] === "[") {
      starts.add(index);
      openingsSeen += 1;

      if (openingsSeen >= 150) {
        break;
      }
    }
  }
}

function findTests(value: unknown): ParsedTest[] {
  const tests: ParsedTest[] = [];
  const visited = new Set<object>();

  walk(value, visited, (current) => {
    if (Array.isArray(current)) {
      const questions = normalizeQuestionArray(current);

      if (questions.length) {
        tests.push({ questions });
      }

      return;
    }

    if (!isRecord(current)) {
      return;
    }

    const questionList = current.questions;

    if (Array.isArray(questionList)) {
      const questions = normalizeQuestionArray(questionList);

      if (questions.length) {
        tests.push({
          externalId: firstString(current.externalId, current.id, current._id),
          title: firstString(current.title, current.name, current.testTitle),
          questions,
        });
      }
    }
  });

  return tests;
}

function findQuestions(value: unknown): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const visited = new Set<object>();

  walk(value, visited, (current) => {
    if (isRecord(current)) {
      const question = normalizeQuestion(current);

      if (question) {
        questions.push(question);
      }
    }
  });

  return questions;
}

function walk(
  value: unknown,
  visited: Set<object>,
  visit: (value: unknown) => void,
) {
  if (typeof value === "object" && value !== null) {
    if (visited.has(value)) {
      return;
    }

    visited.add(value);
  }

  visit(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      walk(item, visited, visit);
    }

    return;
  }

  if (isRecord(value)) {
    for (const item of Object.values(value)) {
      walk(item, visited, visit);
    }
  }
}

function normalizeQuestionArray(items: unknown[]): ParsedQuestion[] {
  return dedupeQuestions(
    items
      .map((item) => (isRecord(item) ? normalizeQuestion(item) : undefined))
      .filter((item): item is ParsedQuestion => Boolean(item)),
  );
}

function normalizeQuestion(question: JsRecord): ParsedQuestion | undefined {
  const text = firstString(question.text, question.question, question.statement);
  const rawAnswers = question.answers;

  if (!text || !Array.isArray(rawAnswers)) {
    return undefined;
  }

  const answers = rawAnswers
    .map((answer, index) =>
      isRecord(answer) ? normalizeAnswer(answer, index) : undefined,
    )
    .filter((answer): answer is ParsedAnswer => Boolean(answer));

  if (!answers.length) {
    return undefined;
  }

  const correctLetter = answers.find((answer) => answer.isCorrect)?.letter;
  const year = firstStringOrNumber(question.year);

  return {
    externalId: firstString(question.externalId, question.id, question._id),
    text,
    block: firstString(question.block),
    topic: firstString(question.topic),
    year,
    exam: firstString(question.exam),
    answers,
    correctLetter,
  };
}

function normalizeAnswer(answer: JsRecord, index: number): ParsedAnswer | undefined {
  const text = firstString(answer.answer, answer.text);

  if (!text) {
    return undefined;
  }

  return {
    letter: firstString(answer.letter) ?? ANSWER_LETTERS[index] ?? `${index + 1}`,
    text,
    isCorrect: parseBoolean(answer.right),
  };
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function firstStringOrNumber(...values: unknown[]): string | number | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function dedupeQuestions(questions: ParsedQuestion[]): ParsedQuestion[] {
  const seen = new Set<string>();

  return questions.filter((question) => {
    const key = `${question.externalId ?? ""}|${question.text}|${question.answers
      .map((answer) => `${answer.letter}:${answer.text}:${answer.isCorrect}`)
      .join("|")}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function rankParsedTests(left: ParsedTest, right: ParsedTest): number {
  const leftScore = scoreParsedTest(left);
  const rightScore = scoreParsedTest(right);

  return rightScore - leftScore;
}

function scoreParsedTest(test: ParsedTest): number {
  const answerCount = test.questions.reduce(
    (total, question) => total + question.answers.length,
    0,
  );
  const correctCount = test.questions.filter((question) =>
    Boolean(question.correctLetter),
  ).length;

  return (
    test.questions.length * 1000 +
    answerCount * 10 +
    correctCount * 25 +
    (test.title ? 5 : 0)
  );
}

function isRecord(value: unknown): value is JsRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

class LiteralParser {
  private index: number;

  constructor(
    private readonly source: string,
    start: number,
  ) {
    this.index = start;
  }

  parse(): ParsedLiteral {
    const value = this.parseValue();

    return {
      value,
      end: this.index,
    };
  }

  private parseValue(): unknown {
    this.skipSpaceAndComments();

    const char = this.source[this.index];

    if (char === "{") {
      return this.parseObject();
    }

    if (char === "[") {
      return this.parseArray();
    }

    if (char === '"' || char === "'" || char === "`") {
      return this.parseString(char);
    }

    if (char === "!") {
      return this.parseNegatedBoolean();
    }

    if (char === "-" || char === "+" || char === "." || isDigit(char)) {
      return this.parseNumber();
    }

    if (isIdentifierStart(char)) {
      return this.parseIdentifierValue();
    }

    throw new Error(`Unexpected token "${char ?? "EOF"}" at ${this.index}.`);
  }

  private parseObject(): JsRecord {
    const object: JsRecord = {};

    this.index += 1;
    this.skipSpaceAndComments();

    while (this.source[this.index] !== "}") {
      if (this.index >= this.source.length) {
        throw new Error("Unterminated object literal.");
      }

      const key = this.parseObjectKey();

      this.skipSpaceAndComments();
      this.expect(":");

      object[key] = this.parseValue();

      this.skipSpaceAndComments();

      if (this.source[this.index] === ",") {
        this.index += 1;
        this.skipSpaceAndComments();
      } else if (this.source[this.index] !== "}") {
        throw new Error("Expected comma or closing brace in object literal.");
      }
    }

    this.index += 1;
    return object;
  }

  private parseArray(): unknown[] {
    const array: unknown[] = [];

    this.index += 1;
    this.skipSpaceAndComments();

    while (this.source[this.index] !== "]") {
      if (this.index >= this.source.length) {
        throw new Error("Unterminated array literal.");
      }

      array.push(this.parseValue());

      this.skipSpaceAndComments();

      if (this.source[this.index] === ",") {
        this.index += 1;
        this.skipSpaceAndComments();
      } else if (this.source[this.index] !== "]") {
        throw new Error("Expected comma or closing bracket in array literal.");
      }
    }

    this.index += 1;
    return array;
  }

  private parseObjectKey(): string {
    this.skipSpaceAndComments();

    const char = this.source[this.index];

    if (char === '"' || char === "'" || char === "`") {
      return this.parseString(char);
    }

    if (isIdentifierStart(char)) {
      return this.parseIdentifier();
    }

    if (char === "-" || char === "+" || isDigit(char)) {
      return String(this.parseNumber());
    }

    throw new Error(`Invalid object key at ${this.index}.`);
  }

  private parseString(quote: string): string {
    let value = "";

    this.index += 1;

    while (this.index < this.source.length) {
      const char = this.source[this.index];

      if (char === quote) {
        this.index += 1;
        return value;
      }

      if (char === "\\") {
        value += this.parseEscapeSequence();
      } else {
        value += char;
        this.index += 1;
      }
    }

    throw new Error("Unterminated string literal.");
  }

  private parseEscapeSequence(): string {
    this.index += 1;

    const escaped = this.source[this.index];
    this.index += 1;

    switch (escaped) {
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "v":
        return "\v";
      case "0":
        return "\0";
      case "u": {
        const code = this.source.slice(this.index, this.index + 4);

        if (/^[\da-f]{4}$/i.test(code)) {
          this.index += 4;
          return String.fromCharCode(Number.parseInt(code, 16));
        }

        return "u";
      }
      case "x": {
        const code = this.source.slice(this.index, this.index + 2);

        if (/^[\da-f]{2}$/i.test(code)) {
          this.index += 2;
          return String.fromCharCode(Number.parseInt(code, 16));
        }

        return "x";
      }
      default:
        return escaped ?? "";
    }
  }

  private parseNegatedBoolean(): boolean {
    this.index += 1;

    const char = this.source[this.index];

    if (char === "0") {
      this.index += 1;
      return true;
    }

    if (char === "1") {
      this.index += 1;
      return false;
    }

    if (this.source.startsWith("true", this.index)) {
      this.index += 4;
      return false;
    }

    if (this.source.startsWith("false", this.index)) {
      this.index += 5;
      return true;
    }

    throw new Error(`Unsupported negation at ${this.index}.`);
  }

  private parseNumber(): number {
    const match = this.source
      .slice(this.index)
      .match(/^[+-]?(?:0[xX][\da-fA-F]+|(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?)/);

    if (!match) {
      throw new Error(`Invalid number at ${this.index}.`);
    }

    this.index += match[0].length;
    return Number(match[0]);
  }

  private parseIdentifierValue(): unknown {
    const identifier = this.parseIdentifier();

    switch (identifier) {
      case "true":
        return true;
      case "false":
        return false;
      case "null":
        return null;
      case "undefined":
        return undefined;
      default:
        throw new Error(`Unsupported identifier value "${identifier}".`);
    }
  }

  private parseIdentifier(): string {
    const start = this.index;

    if (!isIdentifierStart(this.source[this.index])) {
      throw new Error(`Invalid identifier at ${this.index}.`);
    }

    this.index += 1;

    while (isIdentifierPart(this.source[this.index])) {
      this.index += 1;
    }

    return this.source.slice(start, this.index);
  }

  private skipSpaceAndComments() {
    while (this.index < this.source.length) {
      const char = this.source[this.index];
      const next = this.source[this.index + 1];

      if (/\s/.test(char)) {
        this.index += 1;
      } else if (char === "/" && next === "/") {
        this.index += 2;

        while (
          this.index < this.source.length &&
          !["\n", "\r"].includes(this.source[this.index])
        ) {
          this.index += 1;
        }
      } else if (char === "/" && next === "*") {
        this.index += 2;

        while (
          this.index < this.source.length &&
          !(this.source[this.index] === "*" && this.source[this.index + 1] === "/")
        ) {
          this.index += 1;
        }

        this.index += 2;
      } else {
        break;
      }
    }
  }

  private expect(char: string) {
    if (this.source[this.index] !== char) {
      throw new Error(`Expected "${char}" at ${this.index}.`);
    }

    this.index += 1;
  }
}

function isDigit(char: string | undefined): boolean {
  return Boolean(char && /\d/.test(char));
}

function isIdentifierStart(char: string | undefined): boolean {
  return Boolean(char && /[A-Za-z_$]/.test(char));
}

function isIdentifierPart(char: string | undefined): boolean {
  return Boolean(char && /[\w$]/.test(char));
}
