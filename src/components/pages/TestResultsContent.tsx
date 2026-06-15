"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadQuestionReviewState,
  saveNoteAction,
  toggleBookmarkAction,
} from "@/app/actions/test";
import { useProfile } from "@/components/profile/ProfileProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SelectableOption } from "@/components/ui/SelectableOption";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/useI18n";
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

  const questionIds = useMemo(
    () => result.questions.map((question) => question.questionId),
    [result.questions],
  );

  useEffect(() => {
    void loadQuestionReviewState(questionIds, profile?.id).then((state) => {
      setBookmarks(state.bookmarks);
      setNotes(state.notes);
      setDraftNotes(state.notes);
    });
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-text-primary">
            {t("test.correction")}
          </h3>
          <div className="flex flex-wrap gap-2">
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
                onClick={() => setFilter(value)}
                className="px-3 py-2 text-xs"
              >
                {t(labelKey)}
              </SelectableOption>
            ))}
          </div>
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
  onToggleBookmark,
  onDraftNoteChange,
  onSaveNote,
}: {
  question: TestQuestionResult;
  index: number;
  bookmarked: boolean;
  note: string;
  draftNote: string;
  onToggleBookmark: () => void;
  onDraftNoteChange: (value: string) => void;
  onSaveNote: () => void;
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
        <div className="min-w-0 flex-1 space-y-2">
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

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onToggleBookmark}>
              {bookmarked ? t("test.removeFromReview") : t("test.markForReview")}
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-sm font-semibold text-text-primary">
              {note ? t("test.editNote") : t("test.addNote")}
            </p>
            <Input
              value={draftNote}
              onChange={(event) => onDraftNoteChange(event.target.value)}
              placeholder={t("test.notePlaceholder")}
            />
            <Button variant="secondary" size="sm" onClick={onSaveNote}>
              {t("test.saveNote")}
            </Button>
          </div>
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
