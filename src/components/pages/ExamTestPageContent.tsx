"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  loadExamSessionResult,
  resumeTest,
  saveTestDraftAction,
  startExamSimulation,
  submitTest,
} from "@/app/actions/test";
import { PageContainer } from "@/components/layout/PageContainer";
import { ExamResultsContent } from "@/components/pages/ExamResultsContent";
import { useProfile } from "@/components/profile/ProfileProvider";
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
} from "@/lib/testDraft";
import {
  EXAM_DEFAULT_QUESTION_COUNT,
  EXAM_DEFAULT_TIME_LIMIT_SECONDS,
  EXAM_QUESTION_COUNTS,
  EXAM_TIME_LIMITS_MINUTES,
  TEST_MODE_EXAM,
  type ExamTestResult,
  type TestQuestion,
} from "@/lib/testSession";
import { cn } from "@/lib/ui/cn";

type ExamPhase = "setup" | "taking" | "results";
type QuestionResponses = Record<string, string | null>;
type QuestionNavState = "unanswered" | "blank" | "answered";

function getQuestionNavState(
  responses: QuestionResponses,
  questionId: string,
): QuestionNavState {
  if (!(questionId in responses)) {
    return "unanswered";
  }

  return responses[questionId] === null ? "blank" : "answered";
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export type ExamAutoStart = {
  questionCount: number;
  timeLimitSeconds: number;
};

type ExamTestPageContentProps = {
  autoStart?: ExamAutoStart;
  resumeSessionId?: string;
};

export function ExamTestPageContent({
  autoStart,
  resumeSessionId,
}: ExamTestPageContentProps) {
  const { t } = useI18n();
  const { profile } = useProfile();
  const autoStartRef = useRef(false);
  const timeoutSubmitRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<ExamPhase>("setup");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [responses, setResponses] = useState<QuestionResponses>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftStartedAt, setDraftStartedAt] = useState<string | null>(null);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(
    autoStart?.timeLimitSeconds ?? EXAM_DEFAULT_TIME_LIMIT_SECONDS,
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [timeWarning, setTimeWarning] = useState<"none" | "five" | "one" | "expired">(
    "none",
  );
  const [result, setResult] = useState<ExamTestResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(
    autoStart?.questionCount ?? EXAM_DEFAULT_QUESTION_COUNT,
  );
  const [selectedTimeMinutes, setSelectedTimeMinutes] = useState(
    Math.round(
      (autoStart?.timeLimitSeconds ?? EXAM_DEFAULT_TIME_LIMIT_SECONDS) / 60,
    ),
  );

  const profileId = profile?.id;
  const currentQuestion = questions[currentIndex] ?? null;

  const answeredCount = useMemo(
    () =>
      questions.filter(
        (question) => getQuestionNavState(responses, question.id) === "answered",
      ).length,
    [questions, responses],
  );

  const blankCount = useMemo(
    () =>
      questions.filter(
        (question) => getQuestionNavState(responses, question.id) === "blank",
      ).length,
    [questions, responses],
  );

  const applyStartedSession = useCallback(
    (started: {
      sessionId: string;
      questions: TestQuestion[];
      draft?: TestDraftState;
      timeLimitSeconds?: number | null;
      startedAt?: string;
    }) => {
      const startedAt = started.draft?.startedAt ?? started.startedAt ?? new Date().toISOString();
      const limit = started.timeLimitSeconds ?? timeLimitSeconds;

      setSessionId(started.sessionId);
      setQuestions(started.questions);
      setResponses(started.draft?.responses ?? {});
      setCurrentIndex(started.draft?.currentIndex ?? 0);
      setDraftStartedAt(startedAt);
      setTimeLimitSeconds(limit);
      setPhase("taking");

      const elapsed = Math.floor(
        (Date.now() - new Date(startedAt).getTime()) / 1000,
      );
      setRemainingSeconds(Math.max(0, limit - elapsed));
    },
    [timeLimitSeconds],
  );

  const handleSubmit = useCallback(
    async (forced = false) => {
      if (!sessionId || !questions.length || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const durationSeconds =
        draftStartedAt !== null
          ? Math.floor((Date.now() - new Date(draftStartedAt).getTime()) / 1000)
          : undefined;

      const selections = questions.map((question) => ({
        questionId: question.id,
        selectedLetter:
          question.id in responses ? responses[question.id] : null,
      }));

      try {
        const submitted = await submitTest(
          sessionId,
          questions,
          selections,
          profileId,
          durationSeconds,
        );

        if (!submitted.ok) {
          setSubmitError(mapTestErrorCode(submitted.code, t));
          return;
        }

        clearLocalDraftCache(sessionId);
        const examResult = await loadExamSessionResult(sessionId);

        if (examResult) {
          setResult(examResult);
        }

        setPhase("results");

        if (forced) {
          setTimeWarning("expired");
        }
      } catch (submitErr) {
        setSubmitError(mapTestError(submitErr, t));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      draftStartedAt,
      isSubmitting,
      profileId,
      questions,
      responses,
      sessionId,
      t,
    ],
  );

  const handleStartExam = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const started = await startExamSimulation(
        selectedQuestionCount,
        selectedTimeMinutes * 60,
        profileId,
      );

      if (!started.ok) {
        setLoadError(mapTestErrorCode(started.code, t));
        return;
      }

      applyStartedSession({
        sessionId: started.data.sessionId,
        questions: started.data.questions,
        timeLimitSeconds: selectedTimeMinutes * 60,
      });
    } catch (startError) {
      setLoadError(mapTestError(startError, t));
    } finally {
      setIsLoading(false);
    }
  }, [
    applyStartedSession,
    profileId,
    selectedQuestionCount,
    selectedTimeMinutes,
    t,
  ]);

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

        if (resumed.data.mode !== TEST_MODE_EXAM) {
          setLoadError(t("exam.notExamSession"));
          return;
        }

        applyStartedSession({
          sessionId: resumed.data.sessionId,
          questions: resumed.data.questions,
          draft: resumed.data.draft,
          timeLimitSeconds: resumed.data.timeLimitSeconds,
          startedAt: resumed.data.startedAt,
        });
      } catch (resumeError) {
        setLoadError(mapTestError(resumeError, t));
      } finally {
        setIsLoading(false);
      }
    },
    [applyStartedSession, profileId, t],
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
    void handleStartExam();
  }, [autoStart, handleStartExam, resumeSessionId]);

  useEffect(() => {
    if (phase !== "taking" || remainingSeconds === null) {
      return;
    }

    if (remainingSeconds <= 0) {
      setTimeWarning("expired");

      if (!timeoutSubmitRef.current) {
        timeoutSubmitRef.current = window.setTimeout(() => {
          void handleSubmit(true);
        }, 3000);
      }

      return;
    }

    if (remainingSeconds <= 60) {
      setTimeWarning("one");
    } else if (remainingSeconds <= 300) {
      setTimeWarning("five");
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => (value === null ? value : Math.max(0, value - 1)));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [handleSubmit, phase, remainingSeconds]);

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
      void saveTestDraftAction(sessionId, draft, profileId);
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

  function handleSelectAnswer(letter: string) {
    if (!currentQuestion) {
      return;
    }

    setResponses((current) => ({
      ...current,
      [currentQuestion.id]: letter,
    }));
  }

  function handleLeaveBlank() {
    if (!currentQuestion) {
      return;
    }

    setResponses((current) => ({
      ...current,
      [currentQuestion.id]: null,
    }));
  }

  if (phase === "results" && result) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow={t("exam.eyebrow")}
          title={t("exam.resultsTitle")}
          description={t("exam.resultsDescription")}
        />
        <ExamResultsContent result={result} />
      </PageContainer>
    );
  }

  if (phase === "setup") {
    return (
      <PageContainer>
        <PageHeader
          eyebrow={t("exam.eyebrow")}
          title={t("exam.title")}
          description={t("exam.description")}
        />

        <Card as="section" className="max-w-2xl">
          <p className="text-sm font-medium text-text-primary">
            {t("exam.questionCount")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {EXAM_QUESTION_COUNTS.map((count) => (
              <SelectableOption
                key={count}
                selected={selectedQuestionCount === count}
                onClick={() => setSelectedQuestionCount(count)}
              >
                {t("test.questionsCount", { count })}
                {count === EXAM_DEFAULT_QUESTION_COUNT ? (
                  <span className="mt-1 block text-xs text-text-muted">
                    {t("exam.recommendedPreset")}
                  </span>
                ) : null}
              </SelectableOption>
            ))}
          </div>

          <p className="mt-6 text-sm font-medium text-text-primary">
            {t("exam.timeLimit")}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {EXAM_TIME_LIMITS_MINUTES.map((minutes) => (
              <SelectableOption
                key={minutes}
                selected={selectedTimeMinutes === minutes}
                onClick={() => setSelectedTimeMinutes(minutes)}
              >
                {t("exam.minutes", { count: minutes })}
                {minutes * 60 === EXAM_DEFAULT_TIME_LIMIT_SECONDS ? (
                  <span className="mt-1 block text-xs text-text-muted">
                    {t("exam.recommendedPreset")}
                  </span>
                ) : null}
              </SelectableOption>
            ))}
          </div>

          <p className="mt-6 text-sm text-text-secondary">{t("exam.scoringRules")}</p>

          {loadError ? (
            <p className="mt-4 text-sm text-danger">{loadError}</p>
          ) : null}

          <Button
            className="mt-6"
            onClick={() => void handleStartExam()}
            disabled={isLoading}
          >
            {isLoading ? t("test.loadingQuestions") : t("exam.startSimulation")}
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-text-muted">
            {t("exam.eyebrow")}
          </p>
          <h1 className="text-2xl font-medium tracking-tight text-text-primary">
            {t("exam.simulationInProgress")}
          </h1>
        </div>
        <div
          className={cn(
            "rounded-md border border-border-subtle px-4 py-2 text-lg font-medium tabular-nums",
            timeWarning === "expired" || timeWarning === "one"
              ? "bg-danger/10 text-danger"
              : timeWarning === "five"
                ? "bg-warning/10 text-warning"
                : "bg-surface-muted text-text-primary",
          )}
        >
          {remainingSeconds !== null ? formatTimer(remainingSeconds) : "—"}
        </div>
      </div>

      {timeWarning === "five" ? (
        <Card tone="warning" className="mb-4">
          <p className="text-sm">{t("exam.timeWarningFive")}</p>
        </Card>
      ) : null}

      {timeWarning === "one" || timeWarning === "expired" ? (
        <Card tone="warning" className="mb-4">
          <p className="text-sm">
            {timeWarning === "expired"
              ? t("exam.timeExpiredSubmitting")
              : t("exam.timeWarningOne")}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <Card as="section">
          {currentQuestion ? (
            <>
              <p className="text-sm text-text-muted">
                {t("test.questionProgress", {
                  current: currentIndex + 1,
                  total: questions.length,
                })}
              </p>
              <p className="mt-4 text-[1rem] font-normal leading-7 text-text-primary sm:text-[1.0625rem]">
                {currentQuestion.text}
              </p>
              <div className="mt-6 space-y-2.5">
                {currentQuestion.answers.map((answer) => (
                  <SelectableOption
                    key={answer.id}
                    selected={responses[currentQuestion.id] === answer.letter}
                    size="lg"
                    align="left"
                    onClick={() => handleSelectAnswer(answer.letter)}
                  >
                    <span className="mr-2 font-medium text-text-muted">
                      {answer.letter}
                    </span>
                    {answer.text}
                  </SelectableOption>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={handleLeaveBlank}>
                  {t("test.leaveBlank")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                  disabled={currentIndex === 0}
                >
                  {t("test.previous")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentIndex((index) =>
                      Math.min(questions.length - 1, index + 1),
                    )
                  }
                  disabled={currentIndex >= questions.length - 1}
                >
                  {t("test.next")}
                </Button>
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting || timeWarning === "expired"}
                >
                  {isSubmitting ? t("test.submitting") : t("exam.submitSimulation")}
                </Button>
              </div>
            </>
          ) : null}

          {submitError ? (
            <p className="mt-4 text-sm text-danger">{submitError}</p>
          ) : null}
        </Card>

        <Card as="section">
          <p className="text-sm font-medium text-text-primary">
            {t("exam.navigator")}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {t("exam.navigatorSummary", {
              answered: answeredCount,
              blank: blankCount,
              unseen: questions.length - answeredCount - blankCount,
            })}
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const state = getQuestionNavState(responses, question.id);

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "rounded-lg px-2 py-2 text-xs font-semibold",
                    index === currentIndex
                      ? "ring-2 ring-brand"
                      : "",
                    state === "answered"
                      ? "bg-success/15 text-success"
                      : state === "blank"
                        ? "bg-surface-muted text-text-muted"
                        : "bg-surface-muted text-text-secondary",
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
