"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/lib/i18n/useI18n";

const MODE_KEYS = [
  {
    titleKey: "takeTest.randomTest",
    descriptionKey: "takeTest.randomTestDescription",
    href: "/test",
    primary: true,
  },
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

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("takeTest.eyebrow")}
        title={t("takeTest.title")}
        description={t("takeTest.description")}
      />

      <section className="grid gap-4 sm:grid-cols-2">
        {MODE_KEYS.map((mode) => (
          <Card key={mode.titleKey} as="article">
            <h2 className="text-xl font-semibold text-text-primary">
              {t(mode.titleKey)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {t(mode.descriptionKey)}
            </p>
            {"href" in mode && mode.href ? (
              <Button
                href={mode.href}
                variant={mode.primary ? "primary" : "secondary"}
                className="mt-4"
              >
                {t("takeTest.startTest")}
              </Button>
            ) : (
              <p className="mt-4 rounded-xl bg-surface-muted p-3 text-sm text-text-muted">
                {t("takeTest.comingSoon")}
              </p>
            )}
          </Card>
        ))}
      </section>
    </PageContainer>
  );
}
