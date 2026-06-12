"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadFailedQuestionsCount, loadStudyRecommendation } from "@/app/actions/test";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
import { SelectableOption } from "@/components/ui/SelectableOption";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import { formatRecommendationReason } from "@/lib/recommendations/formatReasons";
import { RECOMMENDED_DEFAULT_COUNT } from "@/lib/recommendations/constants";
import type { StudyRecommendation } from "@/lib/recommendations/types";
import {
  EXAM_DEFAULT_QUESTION_COUNT,
  EXAM_DEFAULT_TIME_LIMIT_SECONDS,
  EXAM_QUESTION_COUNTS,
  EXAM_TIME_LIMITS_MINUTES,
  FAILED_QUESTION_COUNTS,
  TEST_QUESTION_COUNTS,
} from "@/lib/testSession";

export function TakeTestPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const { profile } = useProfile();
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [failedCount, setFailedCount] = useState<number | null>(null);
  const [selectedFailedCount, setSelectedFailedCount] = useState<number | "all">(
    10,
  );
  const [recommendedCount, setRecommendedCount] = useState<number>(
    RECOMMENDED_DEFAULT_COUNT,
  );
  const [recommendation, setRecommendation] = useState<StudyRecommendation | null>(
    null,
  );
  const [examQuestionCount, setExamQuestionCount] = useState(
    EXAM_DEFAULT_QUESTION_COUNT,
  );
  const [examTimeMinutes, setExamTimeMinutes] = useState(
    EXAM_DEFAULT_TIME_LIMIT_SECONDS / 60,
  );

  useEffect(() => {
    void loadFailedQuestionsCount(profile?.id).then(setFailedCount);
    void loadStudyRecommendation(profile?.id, RECOMMENDED_DEFAULT_COUNT).then(
      setRecommendation,
    );
  }, [profile?.id]);

  function handleStartRandomTest() {
    router.push(`/test?count=${selectedCount}`);
  }

  function handleStartFailedTest() {
    router.push(`/test?mode=failed&count=${selectedFailedCount}`);
  }

  function handleStartRecommendedTest() {
    router.push(`/test?mode=recommended&count=${recommendedCount}`);
  }

  function handleStartExamSimulation() {
    router.push(
      `/test/exam?start=1&count=${examQuestionCount}&time=${examTimeMinutes}`,
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("takeTest.eyebrow")}
        title={t("takeTest.title")}
        description={t("takeTest.description")}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card as="article">
          <h2 className="text-xl font-semibold text-text-primary">
            {t("takeTest.randomTest")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("takeTest.randomTestDescription")}
          </p>

          <p className="mt-4 text-sm font-medium text-text-primary">
            {t("test.numberOfQuestions")}
          </p>
          <p className="mt-1 text-sm text-text-muted">{t("test.modeRandom")}</p>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEST_QUESTION_COUNTS.map((count) => (
              <SelectableOption
                key={count}
                selected={selectedCount === count}
                onClick={() => setSelectedCount(count)}
                className="px-3 py-3"
              >
                {t("test.questionsCount", { count })}
              </SelectableOption>
            ))}
          </div>

          <Button className="mt-4" onClick={handleStartRandomTest}>
            {t("test.startRandom")}
          </Button>
        </Card>

        <Card as="article">
          <h2 className="text-xl font-semibold text-text-primary">
            {t("takeTest.failedQuestions")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("takeTest.failedQuestionsDescription")}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {t("test.modeFailedQuestions")}
          </p>

          {failedCount === 0 ? (
            <EmptyState
              title={t("test.noFailedQuestions")}
              description={t("takeTest.failedQuestionsDescription")}
            />
          ) : (
            <>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {FAILED_QUESTION_COUNTS.map((count) => (
                  <SelectableOption
                    key={String(count)}
                    selected={selectedFailedCount === count}
                    onClick={() => setSelectedFailedCount(count)}
                    className="px-3 py-3"
                  >
                    {count === "all"
                      ? t("test.filterAll")
                      : t("test.questionsCount", { count })}
                  </SelectableOption>
                ))}
              </div>
              <Button className="mt-4" onClick={handleStartFailedTest}>
                {t("test.reviewMistakes")}
              </Button>
            </>
          )}
        </Card>

        <Card as="article">
          <h2 className="text-xl font-semibold text-text-primary">
            {t("takeTest.recommendedTraining")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("takeTest.recommendedTrainingDescription")}
          </p>
          {recommendation?.reasons.length ? (
            <ul className="mt-4 space-y-2 rounded-xl bg-surface-muted p-3 text-sm text-text-secondary">
              {recommendation.reasons.map((reason) => (
                <li key={reason.code}>
                  {formatRecommendationReason(t, reason)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-text-muted">
              {t("takeTest.recommendedTrainingEmpty")}
            </p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[10, 25, 50].map((count) => (
              <SelectableOption
                key={count}
                selected={recommendedCount === count}
                onClick={() => setRecommendedCount(count)}
              >
                {t("test.questionsCount", { count })}
              </SelectableOption>
            ))}
          </div>
          <Button className="mt-4" onClick={handleStartRecommendedTest}>
            {t("recommendation.startTraining")}
          </Button>
        </Card>

        <Card as="article" tone="muted">
          <h2 className="text-xl font-semibold text-text-primary">
            {t("takeTest.examSimulation")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t("takeTest.examSimulationDescription")}
          </p>
          <p className="mt-4 text-sm text-text-secondary">{t("exam.scoringRules")}</p>
          <p className="mt-4 text-sm font-medium text-text-primary">
            {t("exam.questionCount")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {EXAM_QUESTION_COUNTS.map((count) => (
              <SelectableOption
                key={count}
                selected={examQuestionCount === count}
                onClick={() => setExamQuestionCount(count)}
              >
                {t("test.questionsCount", { count })}
              </SelectableOption>
            ))}
          </div>
          <p className="mt-4 text-sm font-medium text-text-primary">
            {t("exam.timeLimit")}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {EXAM_TIME_LIMITS_MINUTES.map((minutes) => (
              <SelectableOption
                key={minutes}
                selected={examTimeMinutes === minutes}
                onClick={() => setExamTimeMinutes(minutes)}
              >
                {t("exam.minutes", { count: minutes })}
              </SelectableOption>
            ))}
          </div>
          <Button className="mt-4" onClick={handleStartExamSimulation}>
            {t("exam.startSimulation")}
          </Button>
        </Card>
      </section>
    </PageContainer>
  );
}
