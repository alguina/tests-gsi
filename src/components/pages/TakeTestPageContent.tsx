"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";
import { TEST_QUESTION_COUNTS } from "@/lib/testSession";
import { cn } from "@/lib/ui/cn";

const COMING_SOON_MODES = [
  {
    titleKey: "takeTest.weakTopics",
    descriptionKey: "takeTest.weakTopicsDescription",
  },
  {
    titleKey: "takeTest.failedQuestions",
    descriptionKey: "takeTest.failedQuestionsDescription",
  },
  {
    titleKey: "takeTest.examSimulation",
    descriptionKey: "takeTest.examSimulationDescription",
  },
] as const;

export function TakeTestPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedCount, setSelectedCount] = useState<number>(10);

  function handleStartRandomTest() {
    router.push(`/test?count=${selectedCount}`);
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
              <button
                key={count}
                type="button"
                onClick={() => setSelectedCount(count)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-center text-sm font-semibold transition",
                  selectedCount === count
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface-muted text-text-primary hover:border-primary hover:bg-surface",
                )}
              >
                {t("test.questionsCount", { count })}
              </button>
            ))}
          </div>

          <Button className="mt-4" onClick={handleStartRandomTest}>
            {t("test.startRandom")}
          </Button>
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
