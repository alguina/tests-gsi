"use client";

import { useMemo, useState } from "react";
import { loadRandomTestQuestions, submitTest } from "@/app/actions/test";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  TEST_QUESTION_COUNTS,
  type TestQuestion,
  type TestResult,
} from "@/lib/testSession";
import { cn } from "@/lib/ui/cn";
import { layout } from "@/lib/ui/tokens";

type TestPhase = "setup" | "taking" | "results";

export default function TestPage() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<TestPhase>("setup");
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [selections, setSelections] = useState<Record<string, string | null>>(
    {},
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;

  const answeredCount = useMemo(() => {
    return questions.filter((question) => selections[question.id]).length;
  }, [questions, selections]);

  async function handleStart(count: number) {
    setSelectedCount(count);
    setIsLoading(true);
    setLoadError(null);
    setSubmitError(null);
    setResult(null);

    try {
      const loadedQuestions = await loadRandomTestQuestions(count);
      setQuestions(loadedQuestions);
      setSelections({});
      setCurrentIndex(0);
      setPhase("taking");
    } catch (startError) {
      setLoadError(
        startError instanceof Error
          ? startError.message
          : t("test.loadError"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectAnswer(letter: string) {
    if (!currentQuestion) {
      return;
    }

    setSelections((previous) => ({
      ...previous,
      [currentQuestion.id]: letter,
    }));
  }

  function handleClearAnswer() {
    if (!currentQuestion) {
      return;
    }

    setSelections((previous) => ({
      ...previous,
      [currentQuestion.id]: null,
    }));
  }

  async function handleSubmit() {
    if (!questions.length) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submission = await submitTest(
        questions,
        questions.map((question) => ({
          questionId: question.id,
          selectedLetter: selections[question.id] ?? null,
        })),
      );

      setResult(submission);
      setPhase("results");
    } catch (submitFailure) {
      setSubmitError(
        submitFailure instanceof Error
          ? submitFailure.message
          : t("test.submitError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestart() {
    setPhase("setup");
    setSelectedCount(null);
    setQuestions([]);
    setSelections({});
    setCurrentIndex(0);
    setResult(null);
    setLoadError(null);
    setSubmitError(null);
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
            {t("test.chooseSize")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t("test.chooseSizeDescription")}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TEST_QUESTION_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleStart(count)}
                disabled={isLoading}
                className={cn(
                  "rounded-xl border px-4 py-4 text-center text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                  selectedCount === count && isLoading
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface-muted text-text-primary hover:border-primary hover:bg-surface",
                )}
              >
                {t("test.questionsCount", { count })}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="mt-4 text-sm text-text-secondary">
              {t("test.loadingQuestions")}
            </p>
          ) : null}

          {loadError ? (
            <Card tone="danger" padding="sm" className="mt-4 shadow-none">
              {loadError}
            </Card>
          ) : null}
        </Card>
      ) : null}

      {phase === "taking" && currentQuestion ? (
        <>
          <Card>
            <div className="flex items-center justify-between gap-3 text-sm text-text-secondary">
              <span className="font-medium">
                {t("test.questionProgress", {
                  current: currentIndex + 1,
                  total: questions.length,
                })}
              </span>
              <span>{t("test.answeredCount", { count: answeredCount })}</span>
            </div>

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

            <ul className="mt-5 space-y-3">
              {currentQuestion.answers.map((answer) => {
                const isSelected =
                  selections[currentQuestion.id] === answer.letter;

                return (
                  <li key={answer.letter}>
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(answer.letter)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left text-sm leading-6 transition",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-surface-muted text-text-primary hover:border-zinc-400 hover:bg-surface",
                      )}
                    >
                      <span className="font-semibold">{answer.letter}.</span>{" "}
                      {answer.text}
                    </button>
                  </li>
                );
              })}
            </ul>

            <Button
              variant="link"
              onClick={handleClearAnswer}
              className="mt-4 px-0"
            >
              {t("test.leaveBlank")}
            </Button>
          </Card>

          {submitError ? (
            <Card tone="danger" padding="sm" className="shadow-none">
              {submitError}
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
                onClick={() =>
                  setCurrentIndex((index) => Math.max(index - 1, 0))
                }
                disabled={currentIndex === 0}
                className="flex-1"
              >
                {t("test.previous")}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  setCurrentIndex((index) =>
                    Math.min(index + 1, questions.length - 1),
                  )
                }
                disabled={currentIndex >= questions.length - 1}
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
                {isSubmitting ? t("test.submitting") : t("test.submitTest")}
              </Button>
            </div>
          </nav>
        </>
      ) : null}

      {phase === "results" && result ? (
        <section className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold text-text-primary">
              {t("test.results")}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t("test.sessionSaved", { sessionId: result.sessionId })}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label={t("test.statCorrect")}
                value={result.correctCount}
                size="sm"
              />
              <StatCard
                label={t("test.statWrong")}
                value={result.wrongCount}
                size="sm"
              />
              <StatCard
                label={t("test.statBlank")}
                value={result.blankCount}
                size="sm"
              />
              <StatCard
                label={t("test.statNetScore")}
                value={formatNetScore(result.netScore)}
                size="sm"
              />
            </dl>
          </Card>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">
              {t("test.correction")}
            </h3>
            {result.questions.map((question, index) => (
              <Card
                key={question.questionId}
                as="article"
                tone={
                  question.isBlank
                    ? "warning"
                    : question.isCorrect
                      ? "success"
                      : "danger"
                }
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-text-secondary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 space-y-2">
                    <h4 className="font-semibold leading-6 text-text-primary">
                      {question.text}
                    </h4>
                    {question.metadata ? (
                      <p className="text-sm text-text-secondary">
                        {question.metadata}
                      </p>
                    ) : null}
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">{t("test.yourAnswer")}</span>{" "}
                      {question.isBlank
                        ? t("test.blankValue")
                        : question.selectedLetter ?? t("test.blankValue")}
                    </p>
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">
                        {t("test.correctAnswer")}
                      </span>{" "}
                      {question.correctLetter || t("test.unknown")}
                    </p>
                    <p className="text-sm font-semibold text-text-primary">
                      {question.isBlank
                        ? t("test.leftBlank")
                        : question.isCorrect
                          ? t("test.resultCorrect")
                          : t("test.resultWrong")}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={handleRestart} fullWidth>
            {t("test.startAnother")}
          </Button>
        </section>
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

function formatNetScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}
