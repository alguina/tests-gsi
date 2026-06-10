"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startRandomTest, submitTest } from "@/app/actions/test";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
import { TestResultsContent } from "@/components/pages/TestResultsContent";
import { SelectableOption } from "@/components/ui/SelectableOption";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import { mapTestError, mapTestErrorCode } from "@/lib/testErrors";
import {
  TEST_QUESTION_COUNTS,
  type TestQuestion,
  type TestResult,
} from "@/lib/testSession";
import { cn } from "@/lib/ui/cn";
import { layout } from "@/lib/ui/tokens";

type TestPhase = "setup" | "taking" | "results";

/** absent key = unanswered, null = blank, string = selected letter */
type QuestionResponses = Record<string, string | null>;

type QuestionResponseState = "unanswered" | "blank" | "selected";

type TestPageContentProps = {
  autoStartCount?: number;
};

function getQuestionResponseState(
  responses: QuestionResponses,
  questionId: string,
): QuestionResponseState {
  if (!(questionId in responses)) {
    return "unanswered";
  }

  return responses[questionId] === null ? "blank" : "selected";
}

function responsesToSelections(
  questions: TestQuestion[],
  responses: QuestionResponses,
) {
  return questions.map((question) => ({
    questionId: question.id,
    selectedLetter:
      question.id in responses ? responses[question.id] : null,
  }));
}

function isUnansweredOrBlank(
  responses: QuestionResponses,
  questionId: string,
): boolean {
  const state = getQuestionResponseState(responses, questionId);
  return state === "unanswered" || state === "blank";
}

function findUnansweredIndices(
  questions: TestQuestion[],
  responses: QuestionResponses,
): number[] {
  return questions.reduce<number[]>((indices, question, index) => {
    if (isUnansweredOrBlank(responses, question.id)) {
      indices.push(index);
    }

    return indices;
  }, []);
}

function findNextUnansweredIndex(
  questions: TestQuestion[],
  responses: QuestionResponses,
  fromIndex: number,
): number | null {
  const indices = findUnansweredIndices(questions, responses);
  return indices.find((index) => index > fromIndex) ?? null;
}

function findPreviousUnansweredIndex(
  questions: TestQuestion[],
  responses: QuestionResponses,
  fromIndex: number,
): number | null {
  const indices = findUnansweredIndices(questions, responses);
  return [...indices].reverse().find((index) => index < fromIndex) ?? null;
}

export function TestPageContent({ autoStartCount }: TestPageContentProps) {
  const { t } = useI18n();
  const { profile } = useProfile();
  const autoStartRef = useRef(false);

  const [phase, setPhase] = useState<TestPhase>("setup");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(
    autoStartCount ?? 10,
  );
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [responses, setResponses] = useState<QuestionResponses>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewUnansweredMode, setReviewUnansweredMode] = useState(false);
  const [unansweredNotice, setUnansweredNotice] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;

  const currentResponseState = currentQuestion
    ? getQuestionResponseState(responses, currentQuestion.id)
    : "unanswered";

  const answeredCount = useMemo(() => {
    return questions.filter(
      (question) => getQuestionResponseState(responses, question.id) === "selected",
    ).length;
  }, [questions, responses]);

  const advanceToNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }, [questions.length]);

  const profileId = profile?.id;

  const handleStart = useCallback(
    async (count: number) => {
      setSelectedCount(count);
      setIsLoading(true);
      setLoadError(null);
      setSubmitError(null);
      setResult(null);
      setSessionId(null);

      try {
        const started = await startRandomTest(count, profileId);
        if (!started.ok) {
          setLoadError(mapTestErrorCode(started.code, t));
          return;
        }

        setSessionId(started.data.sessionId);
        setQuestions(started.data.questions);
        setResponses({});
        setCurrentIndex(0);
        setReviewUnansweredMode(false);
        setUnansweredNotice(null);
        setPhase("taking");
      } catch (startError) {
        setLoadError(mapTestError(startError, t));
      } finally {
        setIsLoading(false);
      }
    },
    [t, profileId],
  );

  useEffect(() => {
    if (!autoStartCount || autoStartRef.current) {
      return;
    }

    autoStartRef.current = true;
    void handleStart(autoStartCount);
  }, [autoStartCount, handleStart]);

  function finishReviewUnanswered() {
    setReviewUnansweredMode(false);
    setUnansweredNotice(t("test.noUnansweredLeft"));
    setCurrentIndex(Math.max(questions.length - 1, 0));
  }

  function advanceAfterReviewAction(nextResponses: QuestionResponses) {
    const nextIndex = findNextUnansweredIndex(
      questions,
      nextResponses,
      currentIndex,
    );

    if (nextIndex !== null) {
      setUnansweredNotice(null);
      setCurrentIndex(nextIndex);
      return;
    }

    finishReviewUnanswered();
  }

  function startReviewUnanswered() {
    const indices = findUnansweredIndices(questions, responses);

    if (!indices.length) {
      setUnansweredNotice(t("test.noUnansweredLeft"));
      return;
    }

    setUnansweredNotice(null);
    setReviewUnansweredMode(true);
    setCurrentIndex(indices[0]);
  }

  function exitReviewUnanswered() {
    setReviewUnansweredMode(false);
    setUnansweredNotice(null);
  }

  function updateResponse(questionId: string, value: string | null) {
    setResponses((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  }

  function handleSelectAnswer(letter: string) {
    if (!currentQuestion) {
      return;
    }

    const nextResponses = {
      ...responses,
      [currentQuestion.id]: letter,
    };

    updateResponse(currentQuestion.id, letter);

    if (reviewUnansweredMode) {
      advanceAfterReviewAction(nextResponses);
      return;
    }

    if (!isLastQuestion) {
      advanceToNext();
    }
  }

  function handleLeaveBlank() {
    if (!currentQuestion) {
      return;
    }

    const nextResponses = {
      ...responses,
      [currentQuestion.id]: null,
    };

    updateResponse(currentQuestion.id, null);

    if (reviewUnansweredMode) {
      advanceAfterReviewAction(nextResponses);
      return;
    }

    if (!isLastQuestion) {
      advanceToNext();
    }
  }

  function handlePrevious() {
    if (reviewUnansweredMode) {
      const previousIndex = findPreviousUnansweredIndex(
        questions,
        responses,
        currentIndex,
      );

      if (previousIndex !== null) {
        setCurrentIndex(previousIndex);
      }

      return;
    }

    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function handleNext() {
    if (!currentQuestion) {
      return;
    }

    const nextResponses =
      currentResponseState === "unanswered"
        ? { ...responses, [currentQuestion.id]: null }
        : responses;

    if (currentResponseState === "unanswered") {
      updateResponse(currentQuestion.id, null);
    }

    if (reviewUnansweredMode) {
      advanceAfterReviewAction(nextResponses);
      return;
    }

    if (!isLastQuestion) {
      advanceToNext();
    }
  }

  async function handleSubmit() {
    if (!questions.length || !sessionId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submission = await submitTest(
        sessionId,
        questions,
        responsesToSelections(questions, responses),
        profileId,
      );

      if (!submission.ok) {
        setSubmitError(mapTestErrorCode(submission.code, t));
        return;
      }

      setResult(submission.data);
      setPhase("results");
    } catch (submitFailure) {
      setSubmitError(mapTestError(submitFailure, t));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestart() {
    setPhase("setup");
    setSessionId(null);
    setSelectedCount(10);
    setQuestions([]);
    setResponses({});
    setCurrentIndex(0);
    setReviewUnansweredMode(false);
    setUnansweredNotice(null);
    setResult(null);
    setLoadError(null);
    setSubmitError(null);
    autoStartRef.current = false;
  }

  return (
    <PageContainer innerClassName="gap-4 pb-28">
      <PageHeader
        eyebrow={t("test.eyebrow")}
        title={t("test.title")}
        description={t("test.description")}
        meta={
          <Button href="/take-test" variant="link" className="px-0">
            {t("test.backToTakeTest")}
          </Button>
        }
      />

      {phase === "setup" ? (
        <Card>
          <h2 className="text-lg font-semibold text-text-primary">
            {t("test.numberOfQuestions")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t("test.chooseSizeDescription")}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEST_QUESTION_COUNTS.map((count) => (
              <SelectableOption
                key={count}
                selected={selectedCount === count}
                onClick={() => setSelectedCount(count)}
                disabled={isLoading}
                className="px-4 py-4 text-base"
              >
                {t("test.questionsCount", { count })}
              </SelectableOption>
            ))}
          </div>

          <div className="mt-4">
            <Button
              onClick={() => handleStart(selectedCount)}
              disabled={isLoading}
            >
              {isLoading ? t("common.loading") : t("test.startRandom")}
            </Button>
          </div>

          {isLoading ? (
            <p className="mt-4 text-sm text-text-secondary">
              {t("test.loadingQuestions")}
            </p>
          ) : null}

          {loadError ? (
            <Card tone="danger" padding="sm" className="mt-4 shadow-none">
              <p>{loadError}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => handleStart(selectedCount)}
              >
                {t("common.retry")}
              </Button>
            </Card>
          ) : null}
        </Card>
      ) : null}

      {phase === "taking" && currentQuestion ? (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
              <span className="font-medium">
                {t("test.questionProgress", {
                  current: currentIndex + 1,
                  total: questions.length,
                })}
              </span>
              <span>{t("test.answeredCount", { count: answeredCount })}</span>
            </div>

            {reviewUnansweredMode ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-selection-from">
                  {t("test.reviewingUnanswered")}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0"
                  onClick={exitReviewUnanswered}
                >
                  {t("test.backToTest")}
                </Button>
              </div>
            ) : null}

            {unansweredNotice ? (
              <Card tone="muted" padding="sm" className="mt-3 shadow-none">
                <p className="text-sm text-text-secondary">{unansweredNotice}</p>
              </Card>
            ) : null}

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold leading-7 text-text-primary">
              {currentQuestion.text}
            </h2>

            <QuestionMetadata question={currentQuestion} />

            {currentResponseState === "blank" ? (
              <Card tone="warning" padding="sm" className="mt-4 shadow-none">
                {t("test.markedBlank")}
              </Card>
            ) : null}

            <ul className="mt-5 space-y-3">
              {currentQuestion.answers.map((answer) => {
                const isSelected =
                  responses[currentQuestion.id] === answer.letter;

                return (
                  <li key={answer.letter}>
                    <SelectableOption
                      selected={isSelected}
                      onClick={() => handleSelectAnswer(answer.letter)}
                      className="p-4 text-left text-sm leading-6 font-normal"
                    >
                      <span className="font-semibold">{answer.letter}.</span>{" "}
                      {answer.text}
                    </SelectableOption>
                  </li>
                );
              })}
            </ul>

            <Button
              variant="secondary"
              onClick={handleLeaveBlank}
              fullWidth
              className="mt-5"
            >
              {t("test.leaveBlank")}
            </Button>

            {isLastQuestion && !reviewUnansweredMode ? (
              <div className="mt-4 space-y-3">
                <Card tone="muted" padding="sm" className="shadow-none">
                  <p className="text-sm text-text-secondary">
                    {t("test.reviewBeforeSubmit")}
                  </p>
                </Card>
                <Button
                  variant="secondary"
                  onClick={startReviewUnanswered}
                  fullWidth
                >
                  {t("test.reviewUnanswered")}
                </Button>
              </div>
            ) : null}
          </Card>

          {submitError ? (
            <Card tone="danger" padding="sm" className="shadow-none">
              <p>{submitError}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {t("common.retry")}
              </Button>
            </Card>
          ) : null}

          <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6">
            <div
              className={cn(
                "mx-auto flex w-full gap-3",
                layout.contentMaxWidth,
              )}
            >
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={!reviewUnansweredMode && currentIndex === 0}
                className="flex-1"
              >
                {t("test.previous")}
              </Button>
              <Button
                variant="secondary"
                onClick={handleNext}
                disabled={!reviewUnansweredMode && isLastQuestion}
                className="flex-1"
              >
                {t("test.next")}
              </Button>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? t("test.submitting") : t("test.submit")}
              </Button>
            </div>
          </nav>
        </>
      ) : null}

      {phase === "results" && result ? (
        <TestResultsContent result={result} onRestart={handleRestart} />
      ) : null}
    </PageContainer>
  );
}

function QuestionMetadata({ question }: { question: TestQuestion }) {
  const metadata = [question.block, question.topic, question.year, question.exam]
    .filter(Boolean)
    .map(String);

  if (!metadata.length) {
    return null;
  }

  return (
    <p className="mt-2 text-sm text-text-muted">{metadata.join(" / ")}</p>
  );
}
