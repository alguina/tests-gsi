"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  discardTest,
  loadInProgressSession,
  resumeTest,
  saveTestDraftAction,
  startFailedQuestionsTest,
  startRandomTest,
  startRecommendedTest,
  startTopicTest,
  submitTest,
} from "@/app/actions/test";
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
  AUTOSAVE_DEBOUNCE_MS,
  clearLocalDraftCache,
  touchDraftState,
  writeLocalDraftCache,
  type TestDraftState,
  type TopicQuestionFilter,
} from "@/lib/testDraft";
import {
  TEST_QUESTION_COUNTS,
  type InProgressSession,
  type TestQuestion,
  type TestResult,
} from "@/lib/testSession";
import { cn } from "@/lib/ui/cn";
import { layout } from "@/lib/ui/tokens";

type TestPhase = "setup" | "taking" | "results";
type SaveStatus = "idle" | "saving" | "saved" | "error";

export type TestAutoStart = {
  mode: "random" | "failed" | "topic" | "recommended";
  count: number | "all";
  topic?: string;
  filter?: TopicQuestionFilter;
};

/** absent key = unanswered, null = blank, string = selected letter */
type QuestionResponses = Record<string, string | null>;

type QuestionResponseState = "unanswered" | "blank" | "selected";

type TestPageContentProps = {
  autoStart?: TestAutoStart;
  resumeSessionId?: string;
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

export function TestPageContent({
  autoStart,
  resumeSessionId,
}: TestPageContentProps) {
  const { t } = useI18n();
  const { profile } = useProfile();
  const autoStartRef = useRef(false);

  const [phase, setPhase] = useState<TestPhase>("setup");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<string>("random");
  const [selectedCount, setSelectedCount] = useState<number>(
    typeof autoStart?.count === "number" ? autoStart.count : 10,
  );
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [responses, setResponses] = useState<QuestionResponses>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftStartedAt, setDraftStartedAt] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isOffline, setIsOffline] = useState(false);
  const [reviewUnansweredMode, setReviewUnansweredMode] = useState(false);
  const [unansweredNotice, setUnansweredNotice] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<InProgressSession | null>(
    null,
  );
  const [pendingStart, setPendingStart] = useState<TestAutoStart | null>(null);

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

  const applyStartedSession = useCallback(
    (
      started: {
        sessionId: string;
        questions: TestQuestion[];
        mode?: string;
        draft?: TestDraftState;
      },
    ) => {
      setSessionId(started.sessionId);
      setSessionMode(started.mode ?? "random");
      setQuestions(started.questions);
      setResponses(started.draft?.responses ?? {});
      setCurrentIndex(started.draft?.currentIndex ?? 0);
      setDraftStartedAt(started.draft?.startedAt ?? new Date().toISOString());
      setReviewUnansweredMode(false);
      setUnansweredNotice(null);
      setActiveSession(null);
      setPendingStart(null);
      setPhase("taking");
    },
    [],
  );

  const executeStart = useCallback(
    async (config: TestAutoStart) => {
      setIsLoading(true);
      setLoadError(null);
      setSubmitError(null);
      setResult(null);
      setSessionId(null);

      try {
        let started;

        if (config.mode === "failed") {
          started = await startFailedQuestionsTest(config.count, profileId);
        } else if (config.mode === "recommended") {
          if (typeof config.count !== "number") {
            setLoadError(mapTestErrorCode("INVALID_QUESTION_COUNT", t));
            return;
          }

          started = await startRecommendedTest(config.count, profileId);
        } else if (config.mode === "topic" && config.topic) {
          started = await startTopicTest(
            config.topic,
            config.count,
            config.filter ?? "all",
            profileId,
          );
        } else {
          if (typeof config.count !== "number") {
            setLoadError(mapTestErrorCode("INVALID_QUESTION_COUNT", t));
            return;
          }

          setSelectedCount(config.count);
          started = await startRandomTest(config.count, profileId);
        }

        if (!started.ok) {
          setLoadError(mapTestErrorCode(started.code, t));
          return;
        }

        applyStartedSession({
          sessionId: started.data.sessionId,
          questions: started.data.questions,
          mode: started.data.mode,
        });
      } catch (startError) {
        setLoadError(mapTestError(startError, t));
      } finally {
        setIsLoading(false);
      }
    },
    [applyStartedSession, profileId, t],
  );

  const requestStart = useCallback(
    async (config: TestAutoStart) => {
      const inProgress = await loadInProgressSession(profileId);

      if (inProgress) {
        setActiveSession(inProgress);
        setPendingStart(config);
        return;
      }

      await executeStart(config);
    },
    [executeStart, profileId],
  );

  const handleResumeSession = useCallback(
    async (targetSessionId: string) => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const resumed = await resumeTest(targetSessionId, profileId);

        if (!resumed.ok) {
          setLoadError(mapTestErrorCode(resumed.code, t));
          return;
        }

        applyStartedSession({
          sessionId: resumed.data.sessionId,
          questions: resumed.data.questions,
          mode: resumed.data.mode,
          draft: resumed.data.draft,
        });
      } catch (resumeError) {
        setLoadError(mapTestError(resumeError, t));
      } finally {
        setIsLoading(false);
      }
    },
    [applyStartedSession, profileId, t],
  );

  const handleDiscardActiveSession = useCallback(async () => {
    if (!activeSession) {
      return;
    }

    setIsLoading(true);

    try {
      await discardTest(activeSession.id, profileId);
      clearLocalDraftCache(activeSession.id);

      const nextStart = pendingStart;

      setActiveSession(null);
      setPendingStart(null);

      if (nextStart) {
        await executeStart(nextStart);
      }
    } catch (discardError) {
      setLoadError(mapTestError(discardError, t));
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, executeStart, pendingStart, profileId, t]);

  const handleStartRandom = useCallback(
    async (count: number) => {
      await requestStart({ mode: "random", count });
    },
    [requestStart],
  );

  useEffect(() => {
    if (!resumeSessionId || autoStartRef.current) {
      return;
    }

    autoStartRef.current = true;
    void handleResumeSession(resumeSessionId);
  }, [handleResumeSession, resumeSessionId]);

  useEffect(() => {
    if (!autoStart || autoStartRef.current || resumeSessionId) {
      return;
    }

    autoStartRef.current = true;
    void requestStart(autoStart);
  }, [autoStart, requestStart, resumeSessionId]);

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOffline(typeof navigator !== "undefined" && !navigator.onLine);
    }

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (phase !== "taking" || !sessionId || !questions.length) {
      return;
    }

    const draft: TestDraftState = touchDraftState({
      questionIds: questions.map((question) => question.id),
      responses,
      currentIndex,
      startedAt: draftStartedAt ?? new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    });

    writeLocalDraftCache(sessionId, draft);

    const timer = window.setTimeout(() => {
      setSaveStatus("saving");
      void saveTestDraftAction(sessionId, draft, profileId).then((saved) => {
        setSaveStatus(saved.ok ? "saved" : "error");
      });
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    currentIndex,
    draftStartedAt,
    phase,
    profileId,
    questions,
    responses,
    sessionId,
  ]);

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
    if (isSubmitting || !questions.length || !sessionId) {
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
      if (sessionId) {
        clearLocalDraftCache(sessionId);
      }
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
    setSessionMode("random");
    setSelectedCount(10);
    setQuestions([]);
    setResponses({});
    setCurrentIndex(0);
    setDraftStartedAt(null);
    setSaveStatus("idle");
    setActiveSession(null);
    setPendingStart(null);
    setResult(null);
    setReviewUnansweredMode(false);
    setUnansweredNotice(null);
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
        <>
          {activeSession ? (
            <Card tone="warning" padding="sm" className="shadow-none">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("test.testInProgress")}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {activeSession.title ?? t("test.testInProgress")}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {t("test.activeSessionPrompt")}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  onClick={() => void handleResumeSession(activeSession.id)}
                  disabled={isLoading}
                >
                  {t("test.continueActiveSession")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void handleDiscardActiveSession()}
                  disabled={isLoading}
                >
                  {pendingStart
                    ? t("test.discardAndStartNew")
                    : t("test.discardTest")}
                </Button>
              </div>
            </Card>
          ) : null}

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
                onClick={() => void handleStartRandom(selectedCount)}
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
                  onClick={() => void handleStartRandom(selectedCount)}
                >
                  {t("common.retry")}
                </Button>
              </Card>
            ) : null}
          </Card>
        </>
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
              {saveStatus === "saving" ? (
                <span className="text-xs text-text-muted">{t("test.saving")}</span>
              ) : null}
              {saveStatus === "saved" ? (
                <span className="text-xs text-text-muted">{t("test.saved")}</span>
              ) : null}
              {saveStatus === "error" ? (
                <span className="text-xs text-red-600">{t("test.saveFailed")}</span>
              ) : null}
            </div>

            {isOffline ? (
              <p className="mt-2 text-sm text-warning" role="status">
                {t("test.offlineWarning")}
              </p>
            ) : null}

            {sessionMode !== "random" ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                {sessionMode === "failed_questions"
                  ? t("test.modeFailedQuestions")
                  : sessionMode === "topic"
                    ? t("test.modeTopic")
                    : t("test.modeLabel", { mode: sessionMode })}
              </p>
            ) : null}

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
