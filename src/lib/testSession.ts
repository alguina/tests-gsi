import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const TEST_QUESTION_COUNTS = [10, 25, 50, 100] as const;
export const TEST_MODE_RANDOM = "random" as const;

export type TestAnswer = {
  id: string;
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
  mode: string;
  title: string | null;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  netScore: number;
  accuracyPercent: number | null;
  questions: TestQuestionResult[];
};

export type StartedTestSession = {
  sessionId: string;
  questions: TestQuestion[];
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
  id: string;
  question_id: string;
  letter: string;
  text: string;
  is_correct: boolean;
};

type DbSessionRow = {
  id: string;
  mode: string;
  title: string | null;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  net_score: number;
  completed_at: string | null;
};

export async function countEligibleQuestions(): Promise<number> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("get_random_questions", {
    question_limit: 1000,
  });

  if (error) {
    throw new Error(`Failed to count questions: ${error.message}`);
  }

  return data?.length ?? 0;
}

export async function startRandomTestSession(
  limit: number,
  userId: string = DEFAULT_USER_ID,
): Promise<StartedTestSession> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("INVALID_QUESTION_COUNT");
  }

  const questions = await fetchRandomTestQuestions(limit);
  const supabase = createServerSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .insert({
      user_id: userId,
      mode: TEST_MODE_RANDOM,
      title: `Random test (${limit})`,
      total_questions: limit,
      correct_count: 0,
      wrong_count: 0,
      blank_count: 0,
      net_score: 0,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(
      `Failed to create test session: ${sessionError?.message ?? "Unknown error"}`,
    );
  }

  return {
    sessionId: session.id,
    questions,
  };
}

export async function fetchRandomTestQuestions(
  limit: number,
): Promise<TestQuestion[]> {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("INVALID_QUESTION_COUNT");
  }

  const availableCount = await countEligibleQuestions();

  if (availableCount === 0) {
    throw new Error("NO_QUESTIONS_AVAILABLE");
  }

  if (availableCount < limit) {
    throw new Error(`INSUFFICIENT_QUESTIONS:${availableCount}`);
  }

  const supabase = createServerSupabaseClient();

  const { data: eligibleQuestions, error: questionsError } = await supabase.rpc(
    "get_random_questions",
    { question_limit: limit },
  );

  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  const questionRows = (eligibleQuestions ?? []) as DbQuestionRow[];

  if (!questionRows.length) {
    throw new Error("NO_QUESTIONS_AVAILABLE");
  }

  if (questionRows.length < limit) {
    throw new Error(`INSUFFICIENT_QUESTIONS:${questionRows.length}`);
  }

  const questionIds = questionRows.map((question) => question.id);

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("id, question_id, letter, text, is_correct")
    .in("question_id", questionIds);

  if (answersError) {
    throw new Error(`Failed to fetch answers: ${answersError.message}`);
  }

  const answersByQuestionId = groupAnswersByQuestionId(
    (answers ?? []) as DbAnswerRow[],
  );

  return questionRows
    .map((question) => ({
      id: question.id,
      text: question.text,
      block: question.block,
      topic: question.topic,
      year: question.year,
      exam: question.exam,
      answers: answersByQuestionId.get(question.id) ?? [],
    }))
    .filter((question) => question.answers.length > 0);
}

export async function submitTestSession(
  sessionId: string,
  questions: TestQuestion[],
  selections: TestSelection[],
  userId: string = DEFAULT_USER_ID,
): Promise<TestResult> {
  if (!sessionId) {
    throw new Error("MISSING_SESSION_ID");
  }

  if (!questions.length) {
    throw new Error("EMPTY_TEST");
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
    const correctAnswer = question.answers.find((answer) => answer.isCorrect);
    const correctLetter = correctAnswer?.letter ?? "";
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
  const answeredCount = correctCount + wrongCount;
  const accuracyPercent =
    answeredCount > 0
      ? Math.round((correctCount / answeredCount) * 1000) / 10
      : null;

  const supabase = createServerSupabaseClient();
  const completedAt = new Date().toISOString();

  const { data: existingSession, error: sessionLookupError } = await supabase
    .from("test_sessions")
    .select("id, mode, title, user_id, completed_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sessionLookupError) {
    throw new Error(
      `Failed to load test session: ${sessionLookupError.message}`,
    );
  }

  if (!existingSession) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (existingSession.completed_at) {
    throw new Error("SESSION_ALREADY_COMPLETED");
  }

  const { error: sessionUpdateError } = await supabase
    .from("test_sessions")
    .update({
      total_questions: questions.length,
      correct_count: correctCount,
      wrong_count: wrongCount,
      blank_count: blankCount,
      net_score: netScore,
      completed_at: completedAt,
    })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (sessionUpdateError) {
    throw new Error(
      `Failed to save test session: ${sessionUpdateError.message}`,
    );
  }

  const attemptRows = questionResults.map((result) => {
    const question = questions.find((item) => item.id === result.questionId);
    const correctAnswer = question?.answers.find((answer) => answer.isCorrect);
    const selectedAnswer = question?.answers.find(
      (answer) => answer.letter === result.selectedLetter,
    );

    return {
      session_id: sessionId,
      user_id: userId,
      question_id: result.questionId,
      selected_answer_id: selectedAnswer?.id ?? null,
      selected_letter: result.selectedLetter,
      correct_answer_id: correctAnswer?.id ?? null,
      correct_letter: result.correctLetter || null,
      is_correct: result.isCorrect,
      is_blank: result.isBlank,
      answered_at: completedAt,
    };
  });

  const { error: attemptsError } = await supabase
    .from("attempts")
    .insert(attemptRows);

  if (attemptsError) {
    throw new Error(`Failed to save attempts: ${attemptsError.message}`);
  }

  return {
    sessionId,
    mode: existingSession.mode,
    title: existingSession.title,
    correctCount,
    wrongCount,
    blankCount,
    netScore,
    accuracyPercent,
    questions: questionResults,
  };
}

export async function getSessionResult(
  sessionId: string,
  userId: string = DEFAULT_USER_ID,
): Promise<TestResult | null> {
  const supabase = createServerSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from("test_sessions")
    .select(
      "id, mode, title, total_questions, correct_count, wrong_count, blank_count, net_score, completed_at",
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sessionError || !session) {
    return null;
  }

  const sessionRow = session as DbSessionRow & {
    mode: string;
    title: string | null;
  };

  if (!sessionRow.completed_at) {
    return null;
  }

  const { data: attemptRows, error: attemptsError } = await supabase
    .from("attempts")
    .select(
      "question_id, selected_letter, correct_letter, is_correct, is_blank, questions(id, text, block, topic, year, exam)",
    )
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (attemptsError || !attemptRows?.length) {
    return null;
  }

  const questionIds = attemptRows.map((attempt) => attempt.question_id);

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("id, question_id, letter, text, is_correct")
    .in("question_id", questionIds);

  if (answersError) {
    return null;
  }

  const answersByQuestionId = groupAnswersByQuestionId(
    (answers ?? []) as DbAnswerRow[],
  );

  const answeredCount = sessionRow.correct_count + sessionRow.wrong_count;
  const accuracyPercent =
    answeredCount > 0
      ? Math.round((sessionRow.correct_count / answeredCount) * 1000) / 10
      : null;

  const questions: TestQuestionResult[] = attemptRows.map((attempt) => {
    const question = extractQuestionRow(attempt.questions);

    return {
      questionId: attempt.question_id,
      text: question?.text ?? "",
      metadata: question
        ? formatQuestionMetadata({
            block: question.block,
            topic: question.topic,
            year: question.year,
            exam: question.exam,
          } as TestQuestion)
        : "",
      selectedLetter: attempt.selected_letter,
      correctLetter: attempt.correct_letter ?? "",
      isCorrect: attempt.is_correct,
      isBlank: attempt.is_blank,
      answers: answersByQuestionId.get(attempt.question_id) ?? [],
    };
  });

  return {
    sessionId: sessionRow.id,
    mode: sessionRow.mode ?? TEST_MODE_RANDOM,
    title: sessionRow.title ?? null,
    correctCount: sessionRow.correct_count,
    wrongCount: sessionRow.wrong_count,
    blankCount: sessionRow.blank_count,
    netScore: Number(sessionRow.net_score ?? 0),
    accuracyPercent,
    questions,
  };
}

function extractQuestionRow(
  value: DbQuestionRow | DbQuestionRow[] | null | undefined,
): DbQuestionRow | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function groupAnswersByQuestionId(
  answers: DbAnswerRow[],
): Map<string, TestAnswer[]> {
  const grouped = new Map<string, TestAnswer[]>();

  for (const answer of answers) {
    const current = grouped.get(answer.question_id) ?? [];
    current.push({
      id: answer.id,
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
