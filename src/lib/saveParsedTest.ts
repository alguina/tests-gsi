import type {
  ParsedAnswer,
  ParsedQuestion,
  ParsedTest,
} from "@/lib/preparaticParser";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SaveTestOptions = {
  sourceExternalId?: string;
  sourceTitle?: string;
};

export type SaveTestResult = {
  source: "created" | "reused";
  sourceId: string;
  sourceExternalId: string;
  questionsInserted: number;
  questionsUpdated: number;
  questionsSkipped: number;
  answersInserted: number;
  answersUpdated: number;
  answersSkipped: number;
};

type ExistingQuestion = {
  id: string;
  external_id: string | null;
  text: string;
  block: string | null;
  topic: string | null;
  year: string | null;
  exam: string | null;
};

type ExistingAnswer = {
  id: string;
  question_id: string;
  letter: string;
  text: string;
  is_correct: boolean;
};

export async function saveParsedTest(
  test: ParsedTest,
  options?: SaveTestOptions,
): Promise<SaveTestResult> {
  const supabase = createServerSupabaseClient();
  const sourceExternalId = resolveSourceExternalId(test, options);
  const sourceTitle = resolveSourceTitle(test, options);

  const { data: existingSource, error: sourceLookupError } = await supabase
    .from("sources")
    .select("id, external_id, title")
    .eq("external_id", sourceExternalId)
    .maybeSingle();

  if (sourceLookupError) {
    throw new Error(`Failed to look up source: ${sourceLookupError.message}`);
  }

  let sourceId: string;
  let sourceStatus: SaveTestResult["source"];

  if (existingSource) {
    sourceId = existingSource.id;
    sourceStatus = "reused";

    if (sourceTitle && existingSource.title !== sourceTitle) {
      const { error: sourceUpdateError } = await supabase
        .from("sources")
        .update({ title: sourceTitle })
        .eq("id", sourceId);

      if (sourceUpdateError) {
        throw new Error(`Failed to update source: ${sourceUpdateError.message}`);
      }
    }
  } else {
    const { data: createdSource, error: sourceInsertError } = await supabase
      .from("sources")
      .insert({
        external_id: sourceExternalId,
        title: sourceTitle,
        source_type: "preparatic",
      })
      .select("id")
      .single();

    if (sourceInsertError || !createdSource) {
      throw new Error(
        `Failed to create source: ${sourceInsertError?.message ?? "Unknown error"}`,
      );
    }

    sourceId = createdSource.id;
    sourceStatus = "created";
  }

  const { data: existingQuestions, error: questionsLookupError } = await supabase
    .from("questions")
    .select("id, external_id, text, block, topic, year, exam")
    .eq("source_id", sourceId);

  if (questionsLookupError) {
    throw new Error(
      `Failed to look up questions: ${questionsLookupError.message}`,
    );
  }

  const existingQuestionMap = new Map<string, ExistingQuestion>();
  for (const question of existingQuestions ?? []) {
    if (question.external_id) {
      existingQuestionMap.set(question.external_id, question);
    }
  }

  const questionIdByExternalId = new Map<string, string>();
  let questionsInserted = 0;
  let questionsUpdated = 0;
  let questionsSkipped = 0;

  for (const [index, parsedQuestion] of test.questions.entries()) {
    const questionExternalId = resolveQuestionExternalId(parsedQuestion, index);
    const questionPayload = toQuestionPayload(
      sourceId,
      questionExternalId,
      parsedQuestion,
    );
    const existingQuestion = existingQuestionMap.get(questionExternalId);

    if (!existingQuestion) {
      const { data: insertedQuestion, error: questionInsertError } =
        await supabase
          .from("questions")
          .insert(questionPayload)
          .select("id")
          .single();

      if (questionInsertError || !insertedQuestion) {
        throw new Error(
          `Failed to insert question: ${questionInsertError?.message ?? "Unknown error"}`,
        );
      }

      questionIdByExternalId.set(questionExternalId, insertedQuestion.id);
      questionsInserted += 1;
      continue;
    }

    questionIdByExternalId.set(questionExternalId, existingQuestion.id);

    if (questionNeedsUpdate(existingQuestion, questionPayload)) {
      const { error: questionUpdateError } = await supabase
        .from("questions")
        .update({
          text: questionPayload.text,
          block: questionPayload.block,
          topic: questionPayload.topic,
          year: questionPayload.year,
          exam: questionPayload.exam,
        })
        .eq("id", existingQuestion.id);

      if (questionUpdateError) {
        throw new Error(
          `Failed to update question: ${questionUpdateError.message}`,
        );
      }

      questionsUpdated += 1;
    } else {
      questionsSkipped += 1;
    }
  }

  const questionIds = [...questionIdByExternalId.values()];
  const { data: existingAnswers, error: answersLookupError } = await supabase
    .from("answers")
    .select("id, question_id, letter, text, is_correct")
    .in("question_id", questionIds);

  if (answersLookupError) {
    throw new Error(`Failed to look up answers: ${answersLookupError.message}`);
  }

  const existingAnswerMap = new Map<string, ExistingAnswer>();
  for (const answer of existingAnswers ?? []) {
    existingAnswerMap.set(
      `${answer.question_id}:${answer.letter}`,
      answer,
    );
  }

  let answersInserted = 0;
  let answersUpdated = 0;
  let answersSkipped = 0;

  for (const [index, parsedQuestion] of test.questions.entries()) {
    const questionExternalId = resolveQuestionExternalId(parsedQuestion, index);
    const questionId = questionIdByExternalId.get(questionExternalId);

    if (!questionId) {
      continue;
    }

    for (const parsedAnswer of parsedQuestion.answers) {
      const answerResult = await upsertAnswer(
        supabase,
        questionId,
        parsedAnswer,
        existingAnswerMap,
      );

      if (answerResult === "inserted") {
        answersInserted += 1;
      } else if (answerResult === "updated") {
        answersUpdated += 1;
      } else if (answerResult === "unchanged") {
        answersSkipped += 1;
      }
    }
  }

  return {
    source: sourceStatus,
    sourceId,
    sourceExternalId,
    questionsInserted,
    questionsUpdated,
    questionsSkipped,
    answersInserted,
    answersUpdated,
    answersSkipped,
  };
}

function resolveSourceExternalId(
  test: ParsedTest,
  options?: SaveTestOptions,
): string {
  if (options?.sourceExternalId?.trim()) {
    return options.sourceExternalId.trim();
  }

  if (test.externalId?.trim()) {
    return test.externalId.trim();
  }

  if (test.title?.trim()) {
    return `title:${test.title.trim()}`;
  }

  const firstQuestionText = test.questions[0]?.text.trim();
  if (firstQuestionText) {
    return `generated:${hashString(firstQuestionText)}`;
  }

  return "generated:untitled";
}

function resolveSourceTitle(
  test: ParsedTest,
  options?: SaveTestOptions,
): string | null {
  const title = options?.sourceTitle?.trim() || test.title?.trim();
  return title || null;
}

function resolveQuestionExternalId(
  question: ParsedQuestion,
  index: number,
): string {
  if (question.externalId?.trim()) {
    return question.externalId.trim();
  }

  const signature = [
    question.text.trim(),
    ...question.answers.map(
      (answer) => `${answer.letter}:${answer.text.trim()}`,
    ),
  ].join("|");

  if (signature.replace(/\|/g, "").length) {
    return `generated:${hashString(signature)}`;
  }

  return `generated:index-${index + 1}`;
}

function toQuestionPayload(
  sourceId: string,
  externalId: string,
  question: ParsedQuestion,
) {
  return {
    source_id: sourceId,
    external_id: externalId,
    text: question.text,
    block: toOptionalText(question.block),
    topic: toOptionalText(question.topic),
    year: toOptionalText(question.year),
    exam: toOptionalText(question.exam),
  };
}

function questionNeedsUpdate(
  existing: ExistingQuestion,
  next: ReturnType<typeof toQuestionPayload>,
): boolean {
  return (
    existing.text !== next.text ||
    existing.block !== next.block ||
    existing.topic !== next.topic ||
    existing.year !== next.year ||
    existing.exam !== next.exam
  );
}

async function upsertAnswer(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  questionId: string,
  parsedAnswer: ParsedAnswer,
  existingAnswerMap: Map<string, ExistingAnswer>,
): Promise<"inserted" | "updated" | "unchanged"> {
  const letter = parsedAnswer.letter.trim().toUpperCase();
  const key = `${questionId}:${letter}`;
  const existingAnswer = existingAnswerMap.get(key);

  if (!existingAnswer) {
    const { error } = await supabase.from("answers").insert({
      question_id: questionId,
      letter,
      text: parsedAnswer.text,
      is_correct: parsedAnswer.isCorrect,
    });

    if (error) {
      throw new Error(`Failed to insert answer: ${error.message}`);
    }

    return "inserted";
  }

  if (
    existingAnswer.text === parsedAnswer.text &&
    existingAnswer.is_correct === parsedAnswer.isCorrect
  ) {
    return "unchanged";
  }

  const { error } = await supabase
    .from("answers")
    .update({
      text: parsedAnswer.text,
      is_correct: parsedAnswer.isCorrect,
    })
    .eq("id", existingAnswer.id);

  if (error) {
    throw new Error(`Failed to update answer: ${error.message}`);
  }

  return "updated";
}

function toOptionalText(value?: string | number): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text.length ? text : null;
}

function hashString(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}
