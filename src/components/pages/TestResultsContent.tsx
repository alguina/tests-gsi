"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/useI18n";
import { getAnswerTextByLetter } from "@/lib/testAnswerDisplay";
import { formatScore } from "@/lib/stats/formatScore";
import type { TestQuestionResult, TestResult } from "@/lib/testSession";

type TestResultsContentProps = {
  result: TestResult;
  onRestart?: () => void;
  showSessionMeta?: boolean;
};

export function TestResultsContent({
  result,
  onRestart,
  showSessionMeta = true,
}: TestResultsContentProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold text-text-primary">
          {t("test.results")}
        </h2>
        {showSessionMeta ? (
          <p className="mt-1 text-sm text-text-secondary">
            {t("test.sessionSaved", { sessionId: result.sessionId })}
          </p>
        ) : null}

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label={t("test.totalQuestions")}
            value={result.questions.length}
            size="sm"
          />
          <StatCard
            label={t("test.correct")}
            value={result.correctCount}
            size="sm"
          />
          <StatCard label={t("test.wrong")} value={result.wrongCount} size="sm" />
          <StatCard label={t("test.blank")} value={result.blankCount} size="sm" />
          <StatCard
            label={t("test.netScore")}
            value={formatScore(result.netScore)}
            size="sm"
          />
          <StatCard
            label={t("test.accuracy")}
            value={
              result.accuracyPercent === null
                ? t("common.dash")
                : `${result.accuracyPercent}%`
            }
            size="sm"
          />
        </dl>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-text-primary">
          {t("test.correction")}
        </h3>
        {result.questions.map((question, index) => (
          <QuestionCorrectionCard
            key={question.questionId}
            question={question}
            index={index}
          />
        ))}
      </div>

      {onRestart ? (
        <Button onClick={onRestart} fullWidth>
          {t("test.startAnother")}
        </Button>
      ) : (
        <Button href="/take-test" fullWidth>
          {t("test.startAnother")}
        </Button>
      )}
    </section>
  );
}

function QuestionCorrectionCard({
  question,
  index,
}: {
  question: TestQuestionResult;
  index: number;
}) {
  const { t } = useI18n();

  const myAnswerDisplay = formatAnswerLine(
    question,
    question.selectedLetter,
    question.isBlank,
    t,
  );

  const correctAnswerDisplay = formatAnswerLine(
    question,
    question.correctLetter,
    false,
    t,
  );

  return (
    <Card
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
            <p className="text-sm text-text-secondary">{question.metadata}</p>
          ) : null}
          <p className="text-sm text-text-primary">
            <span className="font-semibold">{t("test.myAnswer")}</span>{" "}
            {myAnswerDisplay}
          </p>
          <p className="text-sm text-text-primary">
            <span className="font-semibold">{t("test.correctAnswer")}</span>{" "}
            {correctAnswerDisplay}
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
  );
}

function formatAnswerLine(
  question: TestQuestionResult,
  letter: string | null,
  isBlank: boolean,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (isBlank) {
    return t("test.blankAnswer");
  }

  if (!letter) {
    return t("test.blankAnswer");
  }

  const text = getAnswerTextByLetter(question.answers, letter);

  if (text) {
    return t("test.answerLetterAndText", { letter, text });
  }

  return letter;
}
