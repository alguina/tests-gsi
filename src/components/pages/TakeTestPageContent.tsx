"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadFailedQuestionsCount } from "@/app/actions/test";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProfile } from "@/components/profile/ProfileProvider";
import { SelectableOption } from "@/components/ui/SelectableOption";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  FAILED_QUESTION_COUNTS,
  TEST_QUESTION_COUNTS,
} from "@/lib/testSession";

const COMING_SOON_MODES = [
  {
    titleKey: "takeTest.weakTopics",
    descriptionKey: "takeTest.weakTopicsDescription",
  },
  {
    titleKey: "takeTest.examSimulation",
    descriptionKey: "takeTest.examSimulationDescription",
  },
] as const;

export function TakeTestPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const { profile } = useProfile();
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [failedCount, setFailedCount] = useState<number | null>(null);
  const [selectedFailedCount, setSelectedFailedCount] = useState<number | "all">(
    10,
  );

  useEffect(() => {
    void loadFailedQuestionsCount(profile?.id).then(setFailedCount);
  }, [profile?.id]);

  function handleStartRandomTest() {
    router.push(`/test?count=${selectedCount}`);
  }

  function handleStartFailedTest() {
    router.push(`/test?mode=failed&count=${selectedFailedCount}`);
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

        {COMING_SOON_MODES.map((mode) => (
          <Card key={mode.titleKey} as="article">
            <h2 className="text-xl font-semibold text-text-primary">
              {t(mode.titleKey)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {t(mode.descriptionKey)}
            </p>
            <p className="mt-4 rounded-xl bg-surface-muted p-3 text-sm text-text-muted">
              {t("takeTest.comingSoon")}
            </p>
          </Card>
        ))}
      </section>
    </PageContainer>
  );
}
