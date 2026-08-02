"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadQuestionExplanationsAction,
  loadQuestionReviewState,
  saveNoteAction,
  toggleBookmarkAction,
} from "@/app/actions/test";
import { useProfile } from "@/components/profile/ProfileProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SelectableOption } from "@/components/ui/SelectableOption";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/useI18n";
import type { QuestionExplanation } from "@/lib/questionExplanations";
import { normalizeNetScoreTo100 } from "@/lib/stats/userMetrics";
import { cn } from "@/lib/ui/cn";
import { typography } from "@/lib/ui/tokens";
import { getAnswerTextByLetter } from "@/lib/testAnswerDisplay";
import { formatScore } from "@/lib/stats/formatScore";
import type { TestQuestionResult, TestResult } from "@/lib/testSession";

type ResultFilter = "all" | "wrong" | "blank" | "correct";

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
  const { profile } = useProfile();
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [bookmarks, setBookmarks] = useState<Record<string, true>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [explanations, setExplanations] = useState<
    Record<string, QuestionExplanation>
  >({});

  const questionIds = useMemo(
    () => result.questions.map((question) => question.questionId),
    [result.questions],
  );

  const gradeOver100 =
    result.normalizedNetScore ??
    normalizeNetScoreTo100(
      result.netScore,
      result.correctCount + result.wrongCount,
    );

  useEffect(() => {
    void loadQuestionReviewState(questionIds, profile?.id).then((state) => {
      setBookmarks(state.bookmarks);
      setNotes(state.notes);
      setDraftNotes(state.notes);
    });
    void loadQuestionExplanationsAction(questionIds).then(setExplanations);
  }, [profile?.id, questionIds]);

  const filteredQuestions = useMemo(() => {
    return result.questions.filter((question) => {
      if (filter === "wrong") {
        return !question.isBlank && !question.isCorrect;
      }

      if (filter === "blank") {
        return question.isBlank;
      }

      if (filter === "correct") {
        return question.isCorrect;
      }

      return true;
    });
  }, [filter, result.questions]);

  async function handleToggleBookmark(questionId: string) {
    const nextValue = !bookmarks[questionId];
    const response = await toggleBookmarkAction(
      questionId,
      nextValue,
      profile?.id,
    );

    if (!response.ok) {
      return;
    }

    setBookmarks((previous) => {
      const next = { ...previous };

      if (nextValue) {
        next[questionId] = true;
      } else {
        delete next[questionId];
      }

      return next;
    });
  }

  async function handleSaveNote(questionId: string) {
    const note = draftNotes[questionId] ?? "";
    const response = await saveNoteAction(questionId, note, profile?.id);

    if (!response.ok) {
      return;
    }

    setNotes((previous) => {
      const next = { ...previous };

      if (note.trim()) {
        next[questionId] = note.trim();
      } else {
        delete next[questionId];
      }

      return next;
    });
  }

  return (
    <section className="space-y-6">
      <Card variant="editorial" padding="lg">
        <h2 className={typography.sectionTitle}>{t("test.results")}</h2>
        {showSessionMeta ? (
          <p className={cn("mt-1", typography.meta)}>
            {t("test.sessionSaved", { sessionId: result.sessionId })}
          </p>
        ) : null}

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
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
            label={t("test.gradeOver100")}
            value={
              gradeOver100 === null
                ? t("common.dash")
                : formatScore(gradeOver100)
            }
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

      <div className="space-y-4">
        <h3 className={typography.sectionTitle}>{t("test.correction")}</h3>
        <div className="sticky top-[4.25rem] z-10 -mx-4 grid grid-cols-4 gap-2 border-y border-border-subtle bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {(
            [
              ["all", "test.filterAll"],
              ["wrong", "test.filterWrong"],
              ["blank", "test.filterBlank"],
              ["correct", "test.filterCorrect"],
            ] as const
          ).map(([value, labelKey]) => (
            <SelectableOption
              key={value}
              selected={filter === value}
              size="sm"
              onClick={() => setFilter(value)}
              className="min-w-0 px-1.5 text-[0.6875rem] sm:px-3 sm:text-xs"
            >
              {t(labelKey)}
            </SelectableOption>
          ))}
        </div>

        {filteredQuestions.map((question) => {
          const originalIndex = result.questions.findIndex(
            (item) => item.questionId === question.questionId,
          );

          return (
            <QuestionCorrectionCard
              key={question.questionId}
              question={question}
              index={originalIndex}
              bookmarked={Boolean(bookmarks[question.questionId])}
              note={notes[question.questionId] ?? ""}
              draftNote={draftNotes[question.questionId] ?? ""}
              explanation={explanations[question.questionId] ?? null}
              onToggleBookmark={() =>
                void handleToggleBookmark(question.questionId)
              }
              onDraftNoteChange={(value) =>
                setDraftNotes((previous) => ({
                  ...previous,
                  [question.questionId]: value,
                }))
              }
              onSaveNote={() => void handleSaveNote(question.questionId)}
            />
          );
        })}
      </div>

      {onRestart ? (
        <Button onClick={onRestart} fullWidth>
          {t("test.startAnother")}
        </Button>
      ) : (
        <Button href="/train" fullWidth>
          {t("test.startAnother")}
        </Button>
      )}
    </section>
  );
}

function QuestionCorrectionCard({
  question,
  index,
  bookmarked,
  note,
  draftNote,
  explanation,
  onToggleBookmark,
  onDraftNoteChange,
  onSaveNote,
}: {
  question: TestQuestionResult;
  index: number;
  bookmarked: boolean;
  note: string;
  draftNote: string;
  explanation: QuestionExplanation | null;
  onToggleBookmark: () => void;
  onDraftNoteChange: (value: string) => void;
  onSaveNote: () => void;
}) {
  const { t } = useI18n();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

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

  const status = question.isBlank
    ? { variant: "warning" as const, label: t("test.leftBlank"), accent: "border-l-warning/50" }
    : question.isCorrect
      ? { variant: "success" as const, label: t("test.resultCorrect"), accent: "border-l-success/50" }
      : { variant: "danger" as const, label: t("test.resultWrong"), accent: "border-l-danger/50" };

  return (
    <Card
      as="article"
      variant="editorial"
      className={cn("border-l-2", status.accent)}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium tabular-nums text-text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Badge variant={status.variant} className="shrink-0">
          {status.label}
        </Badge>
      </div>

      <h4 className="mt-3 text-sm font-medium leading-6 text-text-primary">
        {question.text}
      </h4>

      <div className="mt-3 space-y-3">
        {question.metadata ? (
          <p className={typography.meta}>{question.metadata}</p>
        ) : null}
        <dl className="space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="shrink-0 text-text-muted">{t("test.myAnswer")}</dt>
            <dd className="text-text-primary">{myAnswerDisplay}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-text-muted">
              {t("test.correctAnswer")}
            </dt>
            <dd className="text-text-primary">{correctAnswerDisplay}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="subtle" size="sm" onClick={onToggleBookmark}>
            {bookmarked ? t("test.removeFromReview") : t("test.markForReview")}
          </Button>
          <Button
            variant="subtle"
            size="sm"
            aria-expanded={isNoteOpen}
            onClick={() => setIsNoteOpen((current) => !current)}
          >
            {note ? t("test.editNote") : t("test.addNote")}
          </Button>
          {explanation ? (
            <Button
              variant="subtle"
              size="sm"
              aria-expanded={isExplanationOpen}
              onClick={() => setIsExplanationOpen((current) => !current)}
            >
              {t("test.viewExplanation")}
            </Button>
          ) : null}
        </div>

        {isExplanationOpen && explanation ? (
          <div className="space-y-2 rounded-md border border-border-subtle bg-surface-muted/60 p-3">
            <p className="text-sm leading-6 text-text-primary">
              {explanation.explanation}
            </p>
            {explanation.whyCorrect ? (
              <p className="text-sm leading-6 text-text-secondary">
                <span className="font-medium text-text-primary">
                  {t("test.whyCorrect")}{" "}
                </span>
                {explanation.whyCorrect}
              </p>
            ) : null}
            {explanation.whyOthers ? (
              <p className="text-sm leading-6 text-text-secondary">
                <span className="font-medium text-text-primary">
                  {t("test.whyOthers")}{" "}
                </span>
                {explanation.whyOthers}
              </p>
            ) : null}
            {explanation.sources.length ? (
              <ul className="space-y-1 pt-1">
                {explanation.sources.map((source) => (
                  <li key={`${source.title}-${source.url ?? ""}`} className={typography.meta}>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-border underline-offset-2 hover:text-text-secondary"
                      >
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className={typography.meta}>{t("test.explanationDisclaimer")}</p>
          </div>
        ) : null}

        {isNoteOpen ? (
          <div className="space-y-2 pt-1">
            <Input
              value={draftNote}
              onChange={(event) => onDraftNoteChange(event.target.value)}
              placeholder={t("test.notePlaceholder")}
              autoFocus
            />
            <Button variant="subtle" size="sm" onClick={onSaveNote}>
              {t("test.saveNote")}
            </Button>
          </div>
        ) : null}
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
