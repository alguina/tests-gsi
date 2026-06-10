import { createServerSupabaseClient } from "@/lib/supabase/server";

export const TEST_QUESTION_COUNTS = [10, 20, 30, 50, 100] as const;

export type TestAnswer = {
  letter: string;
  text: string;
  isCorrect: boolean;
};

export type TestQuestion = {
  id: string;
  text: string;
  block: string | null;
  topic: string | null;
  year: string | null;
  exam: string | null;
  answers: TestAnswer[];
};

export type TestSelection = {
  questionId: string;
  selectedLetter: string | null;
};

export type TestQuestionResult = {
  questionId: string;
  text: string;
  metadata: string;
  selectedLetter: string | null;
  correctLetter: string;
  isCorrect: boolean;
  isBlank: boolean;
  answers: TestAnswer[];
};

export type TestResult = {
  sessionId: string;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  netScore: number;
  questions: TestQuestionResult[];
};

type DbQuestionRow = {
  id: string;
  text: string;
  block: string | null;
  topic: string | null;
  year: string | null;
  exam: string | null;
};

type DbAnswerRow = {
  question_id: string;
  letter: string;
  text: string;
  is_correct: boolean;
};

export async function countEligibleQuestions(): Promise<number> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("questions")
    .select("id, answers!inner(is_correct)")
    .eq("answers.is_correct", true);

  if (error) {
    throw new Error(`Failed to count questions: ${error.message}`);
  }

  return data?.length ?? 0;
}

export async function fetchRandomTestQuestions(
  limit: number,
): Promise<TestQuestion[]> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("Choose a valid number of questions.");
  }

  const availableCount = await countEligibleQuestions();

  if (availableCount === 0) {
    throw new Error(
      "No questions available. Import and save a test first.",
    );
  }

  if (availableCount < limit) {
    throw new Error(
      `Only ${availableCount} questions are available. Choose ${availableCount} or fewer, or import more questions.`,
    );
  }

  const supabase = createServerSupabaseClient();

  const { data: eligibleQuestions, error: questionsError } = await supabase
    .from("questions")
    .select("id, text, block, topic, year, exam, answers!inner(is_correct)")
    .eq("answers.is_correct", true);

  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  const questionRows = pickRandomItems(
    (eligibleQuestions ?? []) as DbQuestionRow[],
    limit,
  );

  if (!questionRows.length) {
    throw new Error(
      "No questions available. Import and save a test first.",
    );
  }

  const questionIds = questionRows.map((question) => question.id);

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_id, letter, text, is_correct")
    .in("question_id", questionIds);

  if (answersError) {
    throw new Error(`Failed to fetch answers: ${answersError.message}`);
  }

  const answersByQuestionId = groupAnswersByQuestionId(
    (answers ?? []) as DbAnswerRow[],
  );

  return questionRows.map((question) => ({
    id: question.id,
    text: question.text,
    block: question.block,
    topic: question.topic,
    year: question.year,
    exam: question.exam,
    answers: answersByQuestionId.get(question.id) ?? [],
  }));
}

export async function submitTestSession(
  questions: TestQuestion[],
  selections: TestSelection[],
): Promise<TestResult> {
  if (!questions.length) {
    throw new Error("Cannot submit an empty test.");
  }

  const selectionMap = new Map(
    selections.map((selection) => [
      selection.questionId,
      selection.selectedLetter,
    ]),
  );

  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;

  const questionResults: TestQuestionResult[] = questions.map((question) => {
    const selectedLetter = normalizeSelectedLetter(
      selectionMap.get(question.id) ?? null,
    );
    const correctLetter = getCorrectLetter(question.answers);
    const isBlank = selectedLetter === null;
    const isCorrect = !isBlank && selectedLetter === correctLetter;

    if (isBlank) {
      blankCount += 1;
    } else if (isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }

    return {
      questionId: question.id,
      text: question.text,
      metadata: formatQuestionMetadata(question),
      selectedLetter,
      correctLetter,
      isCorrect,
      isBlank,
      answers: question.answers,
    };
  });

  const netScore = correctCount - wrongCount / 3;
  const supabase = createServerSupabaseClient();
  const finishedAt = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .insert({
      finished_at: finishedAt,
      total_questions: questions.length,
      correct_count: correctCount,
      wrong_count: wrongCount,
      blank_count: blankCount,
      net_score: netScore,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(
      `Failed to save test session: ${sessionError?.message ?? "Unknown error"}`,
    );
  }

  const attemptRows = questionResults.map((result) => ({
    session_id: session.id,
    question_id: result.questionId,
    selected_letter: result.selectedLetter,
    is_correct: result.isCorrect,
    is_blank: result.isBlank,
  }));

  const { error: attemptsError } = await supabase
    .from("attempts")
    .insert(attemptRows);

  if (attemptsError) {
    throw new Error(`Failed to save attempts: ${attemptsError.message}`);
  }

  return {
    sessionId: session.id,
    correctCount,
    wrongCount,
    blankCount,
    netScore,
    questions: questionResults,
  };
}

function groupAnswersByQuestionId(
  answers: DbAnswerRow[],
): Map<string, TestAnswer[]> {
  const grouped = new Map<string, TestAnswer[]>();

  for (const answer of answers) {
    const current = grouped.get(answer.question_id) ?? [];
    current.push({
      letter: answer.letter,
      text: answer.text,
      isCorrect: answer.is_correct,
    });
    grouped.set(answer.question_id, current);
  }

  for (const [questionId, questionAnswers] of grouped) {
    grouped.set(
      questionId,
      questionAnswers.sort((left, right) =>
        left.letter.localeCompare(right.letter),
      ),
    );
  }

  return grouped;
}

function getCorrectLetter(answers: TestAnswer[]): string {
  return answers.find((answer) => answer.isCorrect)?.letter ?? "";
}

function normalizeSelectedLetter(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const letter = value.trim().toUpperCase();
  return letter.length ? letter : null;
}

function formatQuestionMetadata(question: TestQuestion): string {
  return [question.block, question.topic, question.year, question.exam]
    .filter(Boolean)
    .map(String)
    .join(" / ");
}

function pickRandomItems<T>(items: T[], limit: number): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy.slice(0, limit);
}
